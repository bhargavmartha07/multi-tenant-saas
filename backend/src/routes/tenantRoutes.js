// backend/src/routes/tenantRoutes.js

const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenantController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/requireRole");

// POST /api/tenants (super_admin only)
router.post(
  "/",
  authMiddleware,
  requireRole("super_admin"),
  tenantController.createTenant
);

module.exports = router;
