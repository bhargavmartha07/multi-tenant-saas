const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// ===============================
// CREATE USER
// ===============================
exports.createUser = async (req, res) => {
  try {
    const { email, password, role, full_name, tenantId: bodyTenantId } = req.body;

    if (!email || !password || !role || !full_name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Determine tenantId
    const tenantId =
      req.user.role === "super_admin"
        ? bodyTenantId
        : req.user.tenantId;

    // Super admin MUST provide tenantId
    if (req.user.role === "super_admin" && !tenantId) {
      return res.status(400).json({
        success: false,
        message: "tenantId is required for super admin"
      });
    }

    // Prevent cross-tenant creation by tenant_admin
    if (
      req.user.role === "tenant_admin" &&
      tenantId !== req.user.tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Check duplicate email in same tenant
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND tenant_id = $2",
      [email, tenantId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await pool.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [userId, tenantId, email, passwordHash, full_name, role]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: userId,
        email,
        role,
        full_name
      }
    });

  } catch (err) {
    console.error("Create user error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
