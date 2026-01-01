const pool = require("../db/connection");
const { v4: uuidv4 } = require("uuid");
const auditLogger = require("../utils/auditLogger");

/**
 * CREATE TASK
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { projectId } = req.params;
    const { role, tenantId: tokenTenantId, userId } = req.user;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    // 🔒 Step 1: Verify project & get tenant_id
    const projectResult = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const projectTenantId = projectResult.rows[0].tenant_id;

    // 🔒 Step 2: Tenant isolation
    if (role !== "super_admin" && projectTenantId !== tokenTenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Validate assignedTo belongs to same tenant
    if (assignedTo) {
      const userRes = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, projectTenantId]
      );
      if (userRes.rowCount === 0) {
        return res.status(400).json({ success: false, message: 'Invalid assignee: User must belong to the same organization' });
      }
    }

    const taskId = uuidv4();

    await pool.query(
      `INSERT INTO tasks (id, project_id, tenant_id, title, description, priority, assigned_to, due_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'todo')`,
      [taskId, projectId, projectTenantId, title, description || null, priority || "medium", assignedTo || null, dueDate || null]
    );

    // Audit Log
    auditLogger({
      tenantId: projectTenantId,
      userId,
      action: "CREATE_TASK",
      entityType: "task",
      entityId: taskId,
      ip: req.ip
    }).catch(e => console.error("Audit failed:", e));

    // Fetch final object with assignee name
    const taskRowRes = await pool.query(
      `SELECT t.*, u.full_name as assigned_to_name FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = $1`,
      [taskId]
    );

    res.status(201).json({ success: true, message: "Task created successfully", data: taskRowRes.rows[0] });

  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * LIST TASKS (with Filters & Pagination)
 */
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role, tenantId: tokenTenantId } = req.user;

    const projectResult = await pool.query("SELECT tenant_id FROM projects WHERE id = $1", [projectId]);
    if (projectResult.rowCount === 0) return res.status(404).json({ success: false, message: "Project not found" });

    const projectTenantId = projectResult.rows[0].tenant_id;

    if (role !== "super_admin" && projectTenantId !== tokenTenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const { status, assignedTo, priority, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '50')));
    const offset = (page - 1) * limit;

    let whereClauses = ["t.project_id = $1"];
    let params = [projectId];
    let idx = 2;

    if (status) { whereClauses.push(`t.status = $${idx++}`); params.push(status); }
    if (assignedTo) { whereClauses.push(`t.assigned_to = $${idx++}`); params.push(assignedTo); }
    if (priority) { whereClauses.push(`t.priority = $${idx++}`); params.push(priority); }
    if (search) { whereClauses.push(`t.title ILIKE $${idx++}`); params.push(`%${search}%`); }

    const countRes = await pool.query(`SELECT COUNT(*)::int FROM tasks t WHERE ${whereClauses.join(' AND ')}`, params);

    params.push(limit);
    params.push(offset);
    const result = await pool.query(
      `SELECT t.*, u.full_name as assigned_to_name FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY t.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: { page, limit, total: countRes.rows[0].count, pages: Math.ceil(countRes.rows[0].count / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

/**
 * UPDATE TASK (PUT)
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const { role, tenantId: tokenTenantId, userId } = req.user;

    // 1. Find task and check tenant
    const taskCheck = await pool.query("SELECT tenant_id FROM tasks WHERE id = $1", [taskId]);
    if (taskCheck.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found" });

    const taskTenantId = taskCheck.rows[0].tenant_id;
    if (role !== 'super_admin' && taskTenantId !== tokenTenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description),
       status = COALESCE($3, status), priority = COALESCE($4, priority), 
       assigned_to = $5, due_date = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, assignedTo || null, dueDate || null, taskId]
    );

    auditLogger({ tenantId: taskTenantId, userId, action: "UPDATE_TASK", entityType: "task", entityId: taskId, ip: req.ip }).catch(() => { });

    res.json({ success: true, message: "Task updated", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE TASK
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { role, tenantId, userId } = req.user;

    const taskCheck = await pool.query("SELECT tenant_id FROM tasks WHERE id = $1", [taskId]);
    if (taskCheck.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found" });

    const taskTenantId = taskCheck.rows[0].tenant_id;
    if (role !== "super_admin" && taskTenantId !== tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    auditLogger({ tenantId: taskTenantId, userId, action: "DELETE_TASK", entityType: "task", entityId: taskId, ip: req.ip }).catch(() => { });

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * UPDATE TASK STATUS ONLY
 * PATCH /api/tasks/:taskId/status
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const { role, tenantId, userId } = req.user;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    // 1. Verify task exists and check ownership
    const taskCheck = await pool.query("SELECT tenant_id FROM tasks WHERE id = $1", [taskId]);

    if (taskCheck.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const taskTenantId = taskCheck.rows[0].tenant_id;

    // 2. Tenant isolation check
    if (role !== 'super_admin' && taskTenantId !== tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, status`,
      [status, taskId]
    );

    // 3. Audit Log
    auditLogger({
      tenantId: taskTenantId,
      userId,
      action: "UPDATE_TASK_STATUS",
      entityType: "task",
      entityId: taskId,
      ip: req.ip
    }).catch(() => { });

    res.json({ success: true, message: "Status updated", data: result.rows[0] });

  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * LIST ALL TASKS FOR TENANT (Cross-Project)
 * GET /api/tasks
 */
exports.getAllTasks = async (req, res) => {
  try {
    const { role, tenantId, userId } = req.user;
    const { status, priority, assignedTo, search } = req.query;

    // For regular users, if no assignedTo filter is provided, default to "me" (their own tasks)
    // But to be flexible, if they explicitly ask for "me" we replace it with their ID.
    // However, users should generally only see tasks they are allowed to see.
    // Requirement says: "My Tasks Section: List of tasks assigned to current user"

    let targetAssignee = assignedTo;
    if (assignedTo === 'me') targetAssignee = userId;

    let whereClauses = ["t.tenant_id = $1"];
    let params = [tenantId];
    let idx = 2;

    // Filter by assignee
    if (targetAssignee) {
      whereClauses.push(`t.assigned_to = $${idx++}`);
      params.push(targetAssignee);
    } else if (role === 'user') {
      // Optional: Enforce that regular users only see their own tasks in this view?
      // The spec doesn't explicitly forbid seeing others' tasks if they are in the same tenant,
      // but typically "My Tasks" implies a filter.
      // Let's assume this endpoint is generic and filters dictate what you see.
    }

    if (status) { whereClauses.push(`t.status = $${idx++}`); params.push(status); }
    if (priority) { whereClauses.push(`t.priority = $${idx++}`); params.push(priority); }
    if (search) { whereClauses.push(`t.title ILIKE $${idx++}`); params.push(`%${search}%`); }

    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '50')));
    const offset = (page - 1) * limit;

    const query = `
      SELECT t.*, u.full_name as assigned_to_name, p.name as project_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY t.priority DESC, t.due_date ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Count for pagination
    const countQuery = `SELECT COUNT(*)::int FROM tasks t WHERE ${whereClauses.join(' AND ')}`;
    // remove limit/offset params for count
    const countParams = params.slice(0, params.length - 2);
    const countRes = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countRes.rows[0].count,
        pages: Math.ceil(countRes.rows[0].count / limit)
      }
    });

  } catch (err) {
    console.error("GET ALL TASKS ERROR:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};