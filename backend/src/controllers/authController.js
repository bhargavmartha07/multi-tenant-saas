const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

/**
 * REGISTER TENANT (public)
 * Creates a tenant and its initial tenant_admin user in a single transaction
 */
exports.registerTenant = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      tenantName,
      subdomain,
      adminEmail,
      adminPassword,
      adminFullName
    } = req.body;

    if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // validate password length
    if (adminPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // check subdomain uniqueness
    const existing = await pool.query("SELECT id FROM tenants WHERE subdomain = $1", [subdomain]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ success: false, message: "Subdomain already exists" });
    }

    await client.query("BEGIN");

    const tenantId = uuidv4();
    // default free plan limits
    const subscriptionPlan = 'free';
    const maxUsers = 5;
    const maxProjects = 3;

    await client.query(
      `INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
      [tenantId, tenantName, subdomain, subscriptionPlan, maxUsers, maxProjects]
    );

    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(
      `INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, 'tenant_admin', true)`,
      [adminId, tenantId, adminEmail, passwordHash, adminFullName]
    );

    // audit log (user_id is null because this is a public registration)
    await client.query(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, NULL, 'CREATE_TENANT', 'tenant', $2)`,
      [uuidv4(), tenantId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: {
          id: adminId,
          email: adminEmail,
          fullName: adminFullName,
          role: 'tenant_admin'
        }
      }
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("REGISTER TENANT ERROR:", err);
    if (err && err.code === '23505') {
      return res.status(409).json({ success: false, message: 'Conflict: resource exists' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // 1️⃣ Find user by email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const user = userResult.rows[0];

    // 2️⃣ Verify password
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 3️⃣ Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact your administrator."
      });
    }

    // ==========================
    // SUPER ADMIN LOGIN
    // ==========================
    if (user.role === "super_admin") {
      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: null,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          },
          token,
          expiresIn: 86400
        }
      });
    }

    // ==========================
    // TENANT USER LOGIN
    // ==========================
    if (!tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "Tenant subdomain is required"
      });
    }

    const tenantResult = await pool.query(
      "SELECT * FROM tenants WHERE id = $1 AND subdomain = $2",
      [user.tenant_id, tenantSubdomain]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "Invalid tenant subdomain"
      });
    }

    if (tenantResult.rows[0].status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active"
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenant_id
        },
        token,
        expiresIn: 86400
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET CURRENT USER
 */
exports.me = async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, role, is_active, tenant_id as "tenantId" FROM users WHERE id = $1`,
    [req.user.userId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.json({
    success: true,
    data: result.rows[0]
  });
};