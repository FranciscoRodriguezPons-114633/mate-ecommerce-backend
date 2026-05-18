const express = require("express");
const router = express.Router();

const { getMyKit } = require("../controllers/kitBuilder.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getMyKit);

module.exports = router;
