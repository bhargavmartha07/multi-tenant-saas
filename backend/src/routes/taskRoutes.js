const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const taskController = require("../controllers/taskController");

// CREATE
router.post(
  "/",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.createTask
);

// UPDATE
router.put(
  "/:id",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.updateTask
);

// DELETE
router.delete(
  "/:id",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  taskController.deleteTask
);

module.exports = router;
