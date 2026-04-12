import express from "express";
import {
  logFocusSession,
  getFocusScore,
  getTimerSettings,
  getLeaderboard,
  syncFocusSession,
} from "../controllers/FocusController.js";

const router = express.Router();

// POST /api/focus/log              - Log a focus session
router.post("/log", logFocusSession);

// POST /api/focus/sync             - Sync incremental minutes (background)
router.post("/sync", syncFocusSession);

// GET  /api/focus/score            - Get current focus score + history
router.get("/score", getFocusScore);

// GET  /api/focus/timer-settings   - Get AI-adjusted Pomodoro settings
router.get("/timer-settings", getTimerSettings);

// GET  /api/focus/leaderboard      - Global leaderboard (?type=xp|streak|focus|coins)
router.get("/leaderboard", getLeaderboard);

export default router;
