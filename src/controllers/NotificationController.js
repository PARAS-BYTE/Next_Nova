import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

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
// GET /api/notifications — fetch all notifications
// ════════════════════════════════════════════════════════════════
export const getNotifications = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const notifications = (user.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ success: true, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// ════════════════════════════════════════════════════════════════
// PUT /api/notifications/read — mark one or all as read
// ════════════════════════════════════════════════════════════════
export const markNotificationsRead = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { notificationId, markAll } = req.body;
    if (markAll) {
      user.notifications.forEach((n) => (n.read = true));
    } else if (notificationId) {
      const note = user.notifications.id(notificationId);
      if (note) note.read = true;
    }
    await user.save();
    res.json({ success: true, message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/notifications/push — push a system notification to user
// (Called internally from other controllers or admin dashboard)
// ════════════════════════════════════════════════════════════════
export const pushNotification = asyncHandler(async (req, res) => {
  try {
    const { userId, title, message, type = "system" } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.notifications.push({ title, message, type, createdAt: new Date(), read: false });
    // keep only last 100
    if (user.notifications.length > 100) user.notifications = user.notifications.slice(-100);
    await user.save();
    res.json({ success: true, message: "Notification sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send notification" });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/notifications/generate — AI-generated smart reminders
// Checks inactivity, pending tasks, low streaks, etc.
// ════════════════════════════════════════════════════════════════
export const generateSmartNotifications = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const generated = [];

    const now = new Date();
    const lastActive = user.burnoutIndicators?.lastActiveDate || user.lastLogin || user.createdAt;
    const daysSinceActive = Math.floor((now - new Date(lastActive)) / (1000 * 60 * 60 * 24));

    // 1. Inactivity reminder
    if (daysSinceActive >= 1) {
      generated.push({
        title: "⚔️ Your Dungeon Awaits!",
        message: `You haven't studied in ${daysSinceActive} day${daysSinceActive > 1 ? "s" : ""}. Jump back in to keep your streak alive!`,
        type: "warning",
      });
    }

    // 2. Streak at risk
    if (user.streakDays > 0 && daysSinceActive >= 1) {
      generated.push({
        title: "🔥 Streak Alert!",
        message: `Your ${user.streakDays}-day streak is at risk! Study today to protect it.`,
        type: "streak",
      });
    }

    // 3. Flashcards due for review
    const dueCards = (user.flashcards || []).filter((c) => new Date(c.nextReview) <= now);
    if (dueCards.length > 0) {
      generated.push({
        title: "📚 Revision Cards Ready",
        message: `${dueCards.length} flashcard${dueCards.length > 1 ? "s" : ""} are due for review. Keep the knowledge fresh!`,
        type: "reminder",
      });
    }

    // 4. Quiz milestone
    const quizCount = user.quizAttempts?.length || 0;
    const milestones = [5, 10, 25, 50, 100];
    for (const m of milestones) {
      if (quizCount === m) {
        generated.push({
          title: "🏆 Quest Milestone!",
          message: `You've completed ${m} quizzes! You're on fire. Keep pushing for the next milestone.`,
          type: "achievement",
        });
        break;
      }
    }

    // 5. Low focus score warning
    if (user.focusScore > 0 && user.focusScore < 50) {
      generated.push({
        title: "🧠 Focus Mode Needed",
        message: `Your focus score is ${user.focusScore}%. Try a Pomodoro session to boost concentration.`,
        type: "tip",
      });
    }

    // 6. Level up encouragement
    const xpToNext = user.level * 100 - user.xp;
    if (xpToNext <= 30) {
      generated.push({
        title: "✨ Level Up Incoming!",
        message: `Only ${xpToNext} XP away from Level ${user.level + 1}! Complete a quiz or lesson to unlock it.`,
        type: "achievement",
      });
    }

    // Push only NEW, unique notifications
    if (generated.length > 0) {
      const recentTitles = user.notifications
        .slice(-20) // Check last 20 notifications
        .map(n => n.title);

      const uniqueNew = generated.filter(n => !recentTitles.includes(n.title));

      if (uniqueNew.length > 0) {
        user.notifications.push(
          ...uniqueNew.map((n) => ({ ...n, createdAt: new Date(), read: false }))
        );
        if (user.notifications.length > 100) user.notifications = user.notifications.slice(-100);
        await user.save();
      }
    }

    res.json({
      success: true,
      generated: generated.length,
      notifications: generated,
    });
  } catch (error) {
    console.error("❌ Smart Notification Error:", error.message);
    res.status(500).json({ message: "Failed to generate notifications" });
  }
});

// ════════════════════════════════════════════════════════════════
// DELETE /api/notifications/:id — delete a single notification
// ════════════════════════════════════════════════════════════════
export const deleteNotification = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { id } = req.params;
    user.notifications = user.notifications.filter((n) => n._id.toString() !== id);
    await user.save();
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
});
