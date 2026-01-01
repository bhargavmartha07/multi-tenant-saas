const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const taskController = require("../controllers/taskController");

// =======================================
// CREATE TASK (SPEC COMPLIANT)
// POST /api/projects/:projectId/tasks
// =======================================
router.post(
  "/projects/:projectId/tasks",
  authenticate,
  // Allow any authenticated tenant member to create tasks
  requireRole(["tenant_admin", "super_admin", "user"]),
  taskController.createTask
);

// =======================================
// LIST TASKS FOR A PROJECT
// GET /api/projects/:projectId/tasks
// =======================================
router.get(
  "/projects/:projectId/tasks",
  authenticate,
  requireRole(["tenant_admin", "super_admin", "user"]),
  taskController.getTasks
);

// =======================================
// UPDATE TASK (ALL FIELDS)
// PUT /api/tasks/:taskId
// =======================================
router.put(
  "/tasks/:taskId",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.updateTask
);

// =======================================
// UPDATE TASK STATUS ONLY
// PATCH /api/tasks/:taskId/status
// =======================================
router.patch(
  "/tasks/:taskId/status",
  authenticate,
  requireRole(["tenant_admin", "super_admin", "user"]),
  taskController.updateTaskStatus
);

// =======================================
// DELETE TASK
// DELETE /api/tasks/:taskId
// =======================================
router.delete(
  "/tasks/:taskId",
  authenticate,
  // Allow tenant admins and super admins to delete tasks
  requireRole(["tenant_admin", "super_admin"]),
  taskController.deleteTask
);

// =======================================
// LIST ALL TASKS (Global/My Tasks)
// GET /api/tasks
// =======================================
router.get(
  "/tasks",
  authenticate,
  requireRole(["tenant_admin", "super_admin", "user"]),
  taskController.getAllTasks
);

module.exports = router;
