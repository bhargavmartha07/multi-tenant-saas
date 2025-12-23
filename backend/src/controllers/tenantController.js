// backend/src/controllers/tenantController.js

const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");

// ============================
// POST /api/tenants
// ============================
exports.createTenant = async (req, res) => {
  const client = await pool.connect();

  try {
    const { name, subdomain } = req.body;

    if (!name || !subdomain) {
      return res.status(400).json({
        success: false,
        message: "Tenant name and subdomain are required"
      });
    }

    // Check subdomain uniqueness
    const existing = await pool.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists"
      });
    }

    await client.query("BEGIN");

    const tenantId = uuidv4();
    const subscriptionPlan = "free";
    const maxUsers = 5;
    const maxProjects = 3;

    await client.query(
      `INSERT INTO tenants
       (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
      [tenantId, name, subdomain, subscriptionPlan, maxUsers, maxProjects]
    );

    // Audit log
    await client.query(
      `INSERT INTO audit_logs
       (id, tenant_id, user_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, 'CREATE_TENANT', 'tenant', $2)`,
      [uuidv4(), tenantId, req.user.userId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: {
        id: tenantId,
        name,
        subdomain,
        subscriptionPlan
      }
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create tenant error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  } finally {
    client.release();
  }
};

// ============================
// GET /api/tenants
// ============================
exports.getAllTenants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        name,
        subdomain,
        status,
        subscription_plan,
        max_users,
        max_projects,
        created_at
       FROM tenants
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error("Get tenants error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
