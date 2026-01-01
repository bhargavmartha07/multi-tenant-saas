const pool = require("../db/connection");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const auditLogger = require("../utils/auditLogger");

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

    // Enforce tenant max_users limit (if applicable)
    const tenantRow = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantRow.rows.length > 0 && tenantRow.rows[0].max_users) {
      const maxUsers = tenantRow.rows[0].max_users;
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM users WHERE tenant_id = $1 AND is_active = true`,
        [tenantId]
      );
      const currentUsers = countRes.rows[0].cnt;
      if (currentUsers >= maxUsers) {
        return res.status(403).json({
          success: false,
          message: `Tenant user limit reached (${maxUsers}). Upgrade plan to add more users.`
        });
      }
    }

    await pool.query(
      `INSERT INTO users
       (id, tenant_id, email, password_hash, full_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [userId, tenantId, email, passwordHash, full_name, role]
    );

    // Audit log (non-blocking)
    (async () => {
      try {
        await auditLogger({
          tenantId,
          userId: req.user?.userId || null,
          action: "create_user",
          entityType: "user",
          entityId: userId,
          ip: req.ip
        });
      } catch (e) {
        console.error("Audit log failed (create_user):", e);
      }
    })();

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

// ===============================
// LIST USERS FOR TENANT
// ===============================
exports.listUsersForTenant = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.params.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: "tenantId is required" });
    }

    // tenant_admin can only list users in their own tenant
    if (req.user.role === "tenant_admin" && req.user.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const q = `SELECT id, email, full_name, role, is_active FROM users WHERE tenant_id = $1 ORDER BY full_name ASC`;
    const result = await pool.query(q, [tenantId]);

    return res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    console.error("List users error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===============================
// GET USER
// ===============================
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await pool.query(
      `SELECT id, tenant_id, email, full_name, role, is_active FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userRow = result.rows[0];

    if (req.user.role === "tenant_admin" && req.user.tenantId !== userRow.tenant_id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({ success: true, data: userRow });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===============================
// UPDATE USER
// ===============================
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, role, is_active, password } = req.body;

    // fetch target user
    const existing = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const target = existing.rows[0];

    if (req.user.role === "tenant_admin" && req.user.tenantId !== target.tenant_id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updates = [];
    const params = [];
    let idx = 1;

    if (full_name !== undefined) {
      updates.push(`full_name = $${idx++}`);
      params.push(full_name);
    }
    if (role !== undefined) {
      updates.push(`role = $${idx++}`);
      params.push(role);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${idx++}`);
      params.push(is_active);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${idx++}`);
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update" });
    }

    params.push(userId); // where

    const q = `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING id, email, full_name, role, is_active`;
    const updated = await pool.query(q, params);

    // Audit log (non-blocking)
    (async () => {
      try {
        await auditLogger({
          tenantId: target.tenant_id,
          userId: req.user?.userId || null,
          action: "update_user",
          entityType: "user",
          entityId: userId,
          ip: req.ip
        });
      } catch (e) {
        console.error("Audit log failed (update_user):", e);
      }
    })();

    return res.status(200).json({ success: true, message: "User updated", data: updated.rows[0] });
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===============================
// DELETE USER (soft)
// ===============================
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // prevent deleting yourself
    if (req.user.userId === userId) {
      return res.status(400).json({ success: false, message: "Cannot delete yourself" });
    }

    const existing = await pool.query(`SELECT tenant_id FROM users WHERE id = $1`, [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const tenantId = existing.rows[0].tenant_id;
    if (req.user.role === "tenant_admin" && req.user.tenantId !== tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await pool.query(`UPDATE users SET is_active = false WHERE id = $1`, [userId]);

    // Audit log (non-blocking)
    (async () => {
      try {
        await auditLogger({
          tenantId,
          userId: req.user?.userId || null,
          action: "delete_user",
          entityType: "user",
          entityId: userId,
          ip: req.ip
        });
      } catch (e) {
        console.error("Audit log failed (delete_user):", e);
      }
    })();

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
