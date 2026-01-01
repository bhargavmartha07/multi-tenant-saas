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

// DELETE project (soft archive)
router.delete(
  "/:id",
  authenticate,
  requireRole(["tenant_admin", "super_admin"]),
  async (req, res) => {
    // wrapper to avoid router registration-time failures if controller is undefined
    if (typeof projectController.deleteProject !== 'function') {
      return res.status(500).json({ success: false, message: 'Controller not ready' });
    }
    return projectController.deleteProject(req, res);
  }
);

module.exports = router;
