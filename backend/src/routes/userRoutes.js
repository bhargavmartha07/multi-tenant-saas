const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const userController = require("../controllers/userController");

// CREATE USER
// Allowed: super_admin, tenant_admin
// Blocked: user
router.post(
  "/",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  userController.createUser
);

// GET user by ID (super_admin, tenant_admin)
router.get(
  "/:id",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  userController.getUserById
);

// UPDATE user
router.put(
  "/:id",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  userController.updateUser
);

// DELETE user (soft-delete)
router.delete(
  "/:id",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  userController.deleteUser
);

module.exports = router;
