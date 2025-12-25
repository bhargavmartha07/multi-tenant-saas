const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const taskController = require("../controllers/taskController");

// ===============================
// CREATE TASK
// ===============================
router.post(
  "/",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.createTask
);

// ===============================
// ✅ GET TASKS (THIS WAS MISSING)
// ===============================
router.get(
  "/",
  authenticate,
  requireRole(["tenant_admin", "super_admin", "user"]),
  taskController.getTasks
);

// ===============================
// UPDATE TASK
// ===============================
router.put(
  "/:id",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.updateTask
);

// ===============================
// DELETE TASK
// ===============================
router.delete(
  "/:id",
  authenticate,
  requireRole(["super_admin"]),
  taskController.deleteTask
);

module.exports = router;
