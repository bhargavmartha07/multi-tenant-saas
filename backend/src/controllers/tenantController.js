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

// GET /api/tenants/:tenantId
exports.getTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { role, tenantId: userTenantId } = req.user;

    // RBAC check
    if (role !== "super_admin" && userTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get tenant
    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan,
              max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");

// ===============================
// CREATE TENANT (super_admin)
// ===============================
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

    await client.query(
      `INSERT INTO tenants
       (id, name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, $3, 'active', 'free', 5, 3)`,
      [tenantId, name, subdomain]
    );

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
        subscriptionPlan: "free"
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

// ===============================
// GET ALL TENANTS (super_admin)
// ===============================
exports.getAllTenants = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at
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

// ===============================
// GET TENANT BY ID
// ===============================
exports.getTenantById = async (req, res) => {
  const { id } = req.params;

  try {
    if (
      req.user.role === "tenant_admin" &&
      req.user.tenantId !== id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const tenant = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan, max_users, max_projects, created_at
       FROM tenants WHERE id = $1`,
      [id]
    );

    if (tenant.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    const stats = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) AS total_tasks
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...tenant.rows[0],
        stats: {
          totalUsers: Number(stats.rows[0].total_users),
          totalProjects: Number(stats.rows[0].total_projects),
          totalTasks: Number(stats.rows[0].total_tasks)
        }
      }
    });

  } catch (err) {
    console.error("Get tenant error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// ===============================
// UPDATE TENANT
// ===============================
exports.updateTenant = async (req, res) => {
  const { id } = req.params;
  const { name, status, subscription_plan, max_users, max_projects } = req.body;

  try {
    if (
      req.user.role === "tenant_admin" &&
      req.user.tenantId !== id
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    const result = await pool.query(
      `
      UPDATE tenants
      SET
        name = COALESCE($1, name),
        status = COALESCE($2, status),
        subscription_plan = COALESCE($3, subscription_plan),
        max_users = COALESCE($4, max_users),
        max_projects = COALESCE($5, max_projects),
        updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, subdomain, status, subscription_plan, max_users, max_projects
      `,
      [name, status, subscription_plan, max_users, max_projects, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Update tenant error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found"
      });
    }

    // Stats
    const [users, projects, tasks] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE tenant_id = $1", [tenantId]),
      pool.query("SELECT COUNT(*) FROM projects WHERE tenant_id = $1", [tenantId]),
      pool.query("SELECT COUNT(*) FROM tasks WHERE tenant_id = $1", [tenantId])
    ]);

    const tenant = tenantResult.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(users.rows[0].count),
          totalProjects: Number(projects.rows[0].count),
          totalTasks: Number(tasks.rows[0].count)
        }
      }
    });

  } catch (err) {
    console.error("Get tenant by ID error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
