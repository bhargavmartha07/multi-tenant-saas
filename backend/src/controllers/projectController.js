const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");

// CREATE PROJECT
exports.createProject = async (req, res) => {
  try {
    const { name, description, tenantId: bodyTenantId } = req.body;
    const { role, tenantId: tokenTenantId, userId } = req.user;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required"
      });
    }

    // 🔑 tenant resolution
    let tenantId;

    if (role === "super_admin") {
      if (!bodyTenantId) {
        return res.status(400).json({
          success: false,
          message: "tenantId is required for super admin"
        });
      }
      tenantId = bodyTenantId;
    } else {
      tenantId = tokenTenantId;
    }

    const projectId = uuidv4();

    await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, tenantId, name, description || null, userId]
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { id: projectId, name, description }
    });

  } catch (err) {
    console.error("Create project error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// GET PROJECTS
exports.getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, status, created_at
       FROM projects
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [req.user.tenantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects
       WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [name, description, status, req.params.id, req.user.tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
