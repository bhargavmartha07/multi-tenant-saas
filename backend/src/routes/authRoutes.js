const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

// =======================
// AUTH ROUTES
// =======================

// Login (email + password only)
router.post("/login", authController.login);

// Tenant registration (public)
router.post("/register-tenant", authController.registerTenant);

// Get current logged-in user
router.get("/me", authenticate, authController.me);

module.exports = router;
