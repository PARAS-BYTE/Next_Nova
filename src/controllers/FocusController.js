import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// ─── AUTH HELPER ───────────────────────────────────────────────
const authenticateUser = async (req) => {
  let token;
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (req.headers.authorization?.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];
  if (!token) throw new Error("Not authorized, no token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");
  return user;
};

// ════════════════════════════════════════════════════════════════
// 1. LOG FOCUS SESSION — POST /api/focus/log
// Frontend sends tab-switch count, active time, distractions
// ════════════════════════════════════════════════════════════════
export const logFocusSession = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const {
      tabSwitches = 0,
      activeTimeMinutes = 0,
      distractions = 0,
      sessionType = "study",
    } = req.body;

    // Calculate focus score (0-100)
    // Formula: start at 100, penalize tab switches and distractions
    const tabPenalty = Math.min(tabSwitches * 5, 40);   // max -40 for tab switches
    const distractionPenalty = Math.min(distractions * 8, 40); // max -40 for distractions
    const timeBonusRaw = activeTimeMinutes >= 25 ? 10 : 0; // bonus for full Pomodoro
    const focusScore = Math.max(0, 100 - tabPenalty - distractionPenalty + timeBonusRaw);

    // XP penalty for heavy distraction
    let xpPenalty = 0;
    if (focusScore < 40) {
      xpPenalty = 5;
      if (user.xp > 5) {
        user.xp = Math.max(0, user.xp - xpPenalty);
        user.xpHistory.push({
          date: new Date(),
          reason: "Focus penalty (distracted session)",
          amount: -xpPenalty,
        });
      }
    }

    // XP reward for excellent focus
    let xpReward = 0;
    if (focusScore >= 85 && activeTimeMinutes >= 20) {
      xpReward = Math.min(10, Math.floor(activeTimeMinutes / 5));
      user.addXP(xpReward);
      user.xpHistory.push({
        date: new Date(),
        reason: `Focus reward (${activeTimeMinutes}m at ${focusScore}% focus)`,
        amount: xpReward,
      });
    }

    // Store focus log entry
    if (!user.focusLog) user.focusLog = [];
    user.focusLog.push({
      date: new Date(),
      focusScore,
      tabSwitches,
      activeTimeMinutes,
      distractions,
      sessionType,
    });

    // Keep only last 90 days of focus logs
    if (user.focusLog.length > 90) {
      user.focusLog = user.focusLog.slice(-90);
    }

    // Update global focus score (rolling 7-day average)
    const recentLogs = user.focusLog.slice(-7);
    user.focusScore = Math.round(
      recentLogs.reduce((s, f) => s + f.focusScore, 0) / recentLogs.length
    );

    // Update study timer history
    if (activeTimeMinutes > 0) {
      if (!user.studyTimerHistory) user.studyTimerHistory = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existingEntry = user.studyTimerHistory.find(
        (s) => new Date(s.date).toDateString() === new Date().toDateString()
      );
      if (existingEntry) {
        existingEntry.totalMinutes += activeTimeMinutes;
        existingEntry.sessionsCompleted += 1;
      } else {
        user.studyTimerHistory.push({
          date: new Date(),
          focusDuration: activeTimeMinutes,
          breakDuration: 0,
          sessionsCompleted: 1,
          totalMinutes: activeTimeMinutes,
        });
      }
    }

    // Update burnout indicator
    if (!user.burnoutIndicators) user.burnoutIndicators = {};
    user.burnoutIndicators.lastActiveDate = new Date();
    user.burnoutIndicators.inactivityDays = 0;

    await user.save();

    res.json({
      success: true,
      focusScore,
      xpReward,
      xpPenalty,
      message:
        focusScore >= 85
          ? "Excellent focus! XP rewarded."
          : focusScore < 40
          ? "Heavy distraction detected. XP reduced."
          : "Session logged.",
    });
  } catch (error) {
    console.error("❌ Focus Log Error:", error.message);
    res.status(500).json({ message: "Failed to log focus session", error: error.message });
  }
});

// ════════════════════════════════════════════════════════════════
// 2. GET FOCUS SCORE & HISTORY — GET /api/focus/score
// ════════════════════════════════════════════════════════════════
export const getFocusScore = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);

    const recentLogs = (user.focusLog || []).slice(-14);
    const avgFocus = recentLogs.length
      ? recentLogs.reduce((s, f) => s + f.focusScore, 0) / recentLogs.length
      : 0;

    const totalStudyMinutes = (user.studyTimerHistory || []).reduce(
      (s, t) => s + (t.totalMinutes || 0),
      0
    );

    // Last 7 days chart data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dayLogs = (user.focusLog || []).filter(
        (f) => new Date(f.date).toDateString() === d.toDateString()
      );
      const dayAvg = dayLogs.length
        ? dayLogs.reduce((s, f) => s + f.focusScore, 0) / dayLogs.length
        : 0;
      last7Days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        focusScore: Math.round(dayAvg),
        minutes: dayLogs.reduce((s, f) => s + (f.activeTimeMinutes || 0), 0),
      });
    }

    res.json({
      success: true,
      currentFocusScore: user.focusScore || 0,
      avgFocusScore14Days: Math.round(avgFocus),
      totalStudyMinutes,
      totalSessions: user.focusLog?.length || 0,
      last7Days,
      recentSessions: recentLogs.slice(-5).reverse(),
    });
  } catch (error) {
    console.error("❌ Focus Score Error:", error.message);
    res.status(500).json({ message: "Failed to fetch focus score" });
  }
});

// ════════════════════════════════════════════════════════════════
// 3. GET AI POMODORO SETTINGS — GET /api/focus/timer-settings
// AI adjusts study/break time based on user's behavior
// ════════════════════════════════════════════════════════════════
export const getTimerSettings = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);

    const avgFocus = user.focusScore || 70;
    const learningStyle = user.learningStyle?.type || "fast";
    const avgSession = user.studyTimerHistory?.length
      ? user.studyTimerHistory.reduce((s, t) => s + (t.totalMinutes || 0), 0) /
        user.studyTimerHistory.length
      : 25;

    // AI-adjusted Pomodoro settings
    let focusDuration = 25;
    let breakDuration = 5;
    let longBreakDuration = 15;
    let sessionsBeforeLongBreak = 4;

    // Adjust based on focus score
    if (avgFocus >= 80) {
      focusDuration = 35;
      breakDuration = 7;
    } else if (avgFocus >= 60) {
      focusDuration = 25;
      breakDuration = 5;
    } else {
      focusDuration = 15;
      breakDuration = 5;
      sessionsBeforeLongBreak = 2;
    }

    // Adjust for learning style
    if (learningStyle === "slow") {
      focusDuration = Math.max(15, focusDuration - 5);
      breakDuration += 3;
    } else if (learningStyle === "fast") {
      focusDuration = Math.min(50, focusDuration + 5);
    } else if (learningStyle === "revision") {
      focusDuration = 20;
      sessionsBeforeLongBreak = 3;
    }

    res.json({
      success: true,
      settings: {
        focusDuration,
        breakDuration,
        longBreakDuration,
        sessionsBeforeLongBreak,
      },
      reason: `Adjusted for your ${avgFocus}% focus score and ${learningStyle} learning style.`,
      basedOn: {
        avgFocusScore: avgFocus,
        learningStyle,
        avgHistoricSession: Math.round(avgSession),
      },
    });
  } catch (error) {
    console.error("❌ Timer Settings Error:", error.message);
    res.status(500).json({ message: "Failed to fetch timer settings" });
  }
});

// ════════════════════════════════════════════════════════════════
// 4. GET GLOBAL LEADERBOARD — GET /api/focus/leaderboard
// ════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════
// 5. SYNC FOCUS SESSION (Background) — POST /api/focus/sync
// Periodically called by frontend stopwatch to keep DB in sync
// ════════════════════════════════════════════════════════════════
export const syncFocusSession = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { minutes = 0 } = req.body;

    if (minutes <= 0) return res.json({ success: true });

    // Update study timer history for today
    if (!user.studyTimerHistory) user.studyTimerHistory = [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingEntry = user.studyTimerHistory.find(
      (s) => new Date(s.date).toDateString() === today.toDateString()
    );

    if (existingEntry) {
      // Logic: we send the TOTAL minutes for the day from the frontend
      // or the INCREMENTAL minutes. Let's use INCREMENTAL for safety.
      existingEntry.totalMinutes += minutes;
    } else {
      user.studyTimerHistory.push({
        date: new Date(),
        focusDuration: minutes,
        breakDuration: 0,
        sessionsCompleted: 1,
        totalMinutes: minutes,
      });
    }

    // Update global total study time
    user.totalStudyTime = (user.totalStudyTime || 0) + minutes;

    await user.save();
    res.json({ success: true, totalMinutesToday: existingEntry?.totalMinutes || minutes });
  } catch (error) {
    res.status(500).json({ message: "Sync failed" });
  }
});

export const getLeaderboard = asyncHandler(async (req, res) => {

  try {
    const { type = "xp" } = req.query; // xp | streak | focus | coins

    const sortField =
      type === "streak"
        ? { streakDays: -1 }
        : type === "focus"
        ? { focusScore: -1 }
        : type === "coins"
        ? { coins: -1 }
        : { xp: -1 };

    const users = await User.find({ role: "student" })
      .sort(sortField)
      .limit(50)
      .select("username xp level streakDays focusScore coins currentRank avatarUrl");

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      username: u.username,
      xp: u.xp,
      level: u.level,
      streak: u.streakDays,
      focusScore: u.focusScore,
      coins: u.coins,
      rank_title: u.currentRank,
      avatar: u.avatarUrl,
    }));

    res.json({ success: true, type, leaderboard });
  } catch (error) {
    console.error("❌ Leaderboard Error:", error.message);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});
