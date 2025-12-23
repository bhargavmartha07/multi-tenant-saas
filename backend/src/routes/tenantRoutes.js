const express = require("express");
const router = express.Router();

const tenantController = require("../controllers/tenantController");
const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");

// GET all tenants (super_admin only)
router.get(
  "/",
  authenticate,
  requireRole(["super_admin"]),
  tenantController.getAllTenants
);

// GET tenant by ID (super_admin + tenant_admin)
router.get(
  "/:id",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  tenantController.getTenantById
);

// UPDATE tenant
router.put(
  "/:id",
  authenticate,
  requireRole(["super_admin", "tenant_admin"]),
  tenantController.updateTenant
);

module.exports = router;
