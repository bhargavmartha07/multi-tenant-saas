const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authMeController = require("../controllers/authMeController");

router.post("/login", authController.login);
router.get("/me", authMiddleware, authMeController.getMe);

module.exports = router;
