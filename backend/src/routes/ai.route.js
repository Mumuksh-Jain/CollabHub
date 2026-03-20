const express = require("express");
const {
  matchTeammatesController,
  improveIdea,
  enhanceProfile,
} = require("../controllers/ai.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/match",authMiddleware, matchTeammatesController);
router.post("/improve-idea",authMiddleware, improveIdea);
router.post("/enhance-profile",authMiddleware, enhanceProfile);

module.exports = router;