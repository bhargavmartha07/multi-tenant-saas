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

module.exports = router;
