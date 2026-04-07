const express = require("express");
const router = express.Router();

const { register, login, me } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  validateRegisterSchema,
  validateLoginSchema,
} = require("../middlewares/validateUserSchema");

router.post("/register", validateRegisterSchema, register);
router.post("/login", validateLoginSchema, login);
router.get("/me", authMiddleware, me);

module.exports = router;