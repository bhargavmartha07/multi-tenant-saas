const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const requireRole = require("../middleware/requireRole");
const projectController = require("../controllers/projectController");

router.post(
  "/",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  projectController.createProject
);

router.get(
  "/",
  authenticate,
  projectController.getProjects
);

router.get(
  "/:id",
  authenticate,
  projectController.getProjectById
);

router.put(
  "/:id",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  projectController.updateProject
);

module.exports = router;
