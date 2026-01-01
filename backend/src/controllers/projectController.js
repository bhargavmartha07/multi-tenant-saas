const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");
const auditLogger = require("../utils/auditLogger");

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

    // 🔍 Enforce max_projects limit
    const tenantRow = await pool.query(
      `SELECT max_projects FROM tenants WHERE id = $1`,
      [tenantId]
    );

    if (tenantRow.rows.length > 0 && tenantRow.rows[0].max_projects) {
      const maxProjects = tenantRow.rows[0].max_projects;
      const countRes = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM projects WHERE tenant_id = $1 AND status != 'archived'`,
        [tenantId]
      );
      const currentProjects = countRes.rows[0].cnt;

      if (currentProjects >= maxProjects) {
        return res.status(403).json({
          success: false,
          message: `Tenant project limit reached (${maxProjects}). Upgrade plan to add more projects.`
        });
      }
    }

    const projectId = uuidv4();

    await pool.query(
      `INSERT INTO projects (id, tenant_id, name, description, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, tenantId, name, description || null, userId]
    );

    // Audit log
    const auditLogger = require("../utils/auditLogger");
    // Run async without awaiting to not block response
    (async () => {
      try {
        await auditLogger({
          tenantId,
          userId,
          action: "create_project",
          entityType: "project",
          entityId: projectId,
          ip: req.ip
        });
      } catch (e) {
        console.error("Audit log failed:", e);
      }
    })();

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


// GET PROJECTS with Filtering
exports.getProjects = async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    const { tenantId } = req.user;

    let whereClauses = ["tenant_id = $1"];
    let params = [tenantId];
    let idx = 2;

    if (status) {
      whereClauses.push(`status = $${idx++}`);
      params.push(status);
    }

    if (search) {
      whereClauses.push(`name ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }

    let query = `
      SELECT id, name, description, status, created_at
      FROM projects
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY created_at DESC
    `;

    if (limit) {
      query += ` LIMIT $${idx++}`;
      params.push(parseInt(limit));
    }

    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET PROJECT BY ID
exports.getProjectById = async (req, res) => {
  try {
    const { role, tenantId: tokenTenantId } = req.user;

    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const project = result.rows[0];

    // Tenant isolation for non-super-admins
    if (role !== 'super_admin' && project.tenant_id !== tokenTenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    console.error('GET PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// UPDATE PROJECT
exports.updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const { role, tenantId: tokenTenantId } = req.user;

    // Fetch project and verify tenant
    const found = await pool.query(
      `SELECT tenant_id FROM projects WHERE id = $1`,
      [req.params.id]
    );

    if (found.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const projectTenantId = found.rows[0].tenant_id;

    if (role !== 'super_admin' && projectTenantId !== tokenTenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const result = await pool.query(
      `UPDATE projects
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [name, description, status, req.params.id]
    );

    res.json({ success: true, message: 'Project updated successfully', data: result.rows[0] });
  } catch (err) {
    console.error('UPDATE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE PROJECT (archive)
exports.deleteProject = async (req, res) => {
  try {
    const { role, tenantId: tokenTenantId, userId } = req.user;
    const { id } = req.params;
    const force = req.query.force === 'true';

    // Fetch project
    const found = await pool.query(`SELECT tenant_id, status FROM projects WHERE id = $1`, [id]);

    if (found.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = found.rows[0];

    // Tenant isolation
    if (role !== 'super_admin' && project.tenant_id !== tokenTenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Check for active tasks
    const tasksRes = await pool.query(
      `SELECT COUNT(*)::int AS cnt FROM tasks WHERE project_id = $1 AND tenant_id = $2 AND status != 'completed'`,
      [id, project.tenant_id]
    );

    const activeTasks = tasksRes.rows[0].cnt;

    if (activeTasks > 0 && !force) {
      return res.status(400).json({ success: false, message: 'Cannot delete project with active tasks. Use ?force=true to archive.' });
    }

    const updateRes = await pool.query(
      `UPDATE projects SET status = 'archived' WHERE id = $1 RETURNING *`,
      [id]
    );

    const updated = updateRes.rows[0];

    // Audit log
    (async () => {
      try {
        await auditLogger({ tenantId: project.tenant_id, userId, action: 'delete_project', entityType: 'project', entityId: id, ip: req.ip });
      } catch (e) {
        console.error('Audit log failed:', e);
      }
    })();

    res.json({ success: true, message: 'Project archived', data: updated });

  } catch (err) {
    console.error('DELETE PROJECT ERROR:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
