const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, tenantId: bodyTenantId } = req.body;
    const { role, tenantId: tokenTenantId, userId } = req.user;

    if (!title || !projectId) {
      return res.status(400).json({
        success: false,
        message: "title and projectId are required"
      });
    }

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

    const taskId = uuidv4();

    await pool.query(
      `INSERT INTO tasks
       (id, project_id, tenant_id, title, description, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [taskId, projectId, tenantId, title, description || null]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { id: taskId, title, description }
    });

  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET TASKS
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const { tenantId } = req.user;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "projectId is required"
      });
    }

    const result = await pool.query(
      `
      SELECT id, title, description, status
      FROM tasks
      WHERE project_id = $1 AND tenant_id = $2
      ORDER BY created_at DESC
      `,
      [projectId, tenantId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks"
    });
  }
};



// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE tasks
       SET status = COALESCE($1, status)
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, req.params.id, req.user.tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, tenantId } = req.user;

    let result;

    if (role === "super_admin") {
      result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [id]
      );
    } else {
      result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING *",
        [id, tenantId]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.json({
      success: true,
      message: "Task deleted successfully"
    });

  } catch (err) {
    console.error("Delete task error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
