const express = require("express");
const router = express.Router();

const {
  getMyJourney,
} = require("../controllers/customerJourney.controller");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, getMyJourney);

module.exports = router;
