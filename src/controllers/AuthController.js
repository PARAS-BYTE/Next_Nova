import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Calendar from "../models/Calendar.js";
import generateToken from "../utils/generateToken.js";

//
// ─── REGISTER USER ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
//
export const registerUser = asyncHandler(async (req, res) => {
  try {
    // [SEARCH] Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error("[ERROR] Signup Attempt Failed: Database not connected");
      return res.status(503).json({ 
        message: "Database is currently offline. Please ensure MongoDB is started." 
      });
    }

    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email, and password" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user exists by email
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if user exists by username
    const userExistsByUsername = await User.findOne({ username });
    if (userExistsByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create user
    const user = await User.create({ username, email, password });
    if (!user) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    // [SUCCESS] Create token
    try {
      generateToken(res, user._id);
    } catch (tokenError) {
      console.error("Token generation error:", tokenError.message);
      // If token generation fails, still return success but log the error
      // User is created, they just won't be automatically logged in
      if (tokenError.message.includes("JWT_SECRET")) {
        console.error("WARNING: JWT_SECRET is not set in environment variables!");
      }
    }

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    console.error("Full Error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(500).json({ message: error.message || "Server error while registering user" });
  }
});

//
// ─── LOGIN USER ────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
//
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // [SUCCESS] Create and send JWT
    generateToken(res, user._id);

    // Update lastLogin for analytics
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error while logging in" });
  }
});

//
// ─── LOGOUT USER ───────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
//
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Server error while logging out" });
  }
});

//
// ─── GET USER PROFILE ─────────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Private (JWT required)
//
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    // [INFO] Extract JWT from either cookie or header
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 🔹 Verify token and decode user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // [SUCCESS] Return summarized dashboard data from schema method
    res.status(200).json(user.getDashboardSummary());
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

const ensureCalendarForUser = async (user) => {
  let calendar = await Calendar.findOne({ userId: user._id });

  if (!calendar) {
    calendar = new Calendar({
      userId: user._id,
      studyPreferences: {
        subjects:
          user.enrolledCourses?.map((course) => course.title) || [
            "General Learning",
          ],
        difficultyLevel:
          user.level > 2 ? "advanced" : user.level > 1 ? "intermediate" : "beginner",
        dailyStudyTime: 60,
        learningGoals: ["Improve knowledge", "Build consistent study habits"],
        preferredLearningStyles: ["visual", "practical"],
      },
    });
    await calendar.save();
  } else if (calendar.cleanupInvalidTasks) {
    calendar.cleanupInvalidTasks();
    await calendar.save();
  }

  return calendar;
};

const sameDay = (dateA, dateB) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return a.getTime() === b.getTime();
};

const dailyLabel = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short" });

const minutesToHours = (minutes) =>
  Math.round(((minutes || 0) / 60) * 10) / 10;

const taskXp = (task) => {
  const bonus =
    task.difficulty === "advanced"
      ? 20
      : task.difficulty === "intermediate"
      ? 10
      : 0;
  return 30 + bonus;
};

export const getStudentDashboard = asyncHandler(async (req, res) => {
  try {
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const calendar = await ensureCalendarForUser(user);
    const tasks = Array.isArray(calendar.tasks) ? calendar.tasks : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7DaysStudy = [];
    const xpHistory = [];

    for (let i = 6; i >= 0; i -= 1) {
      const target = new Date();
      target.setHours(0, 0, 0, 0);
      target.setDate(today.getDate() - i);

      // Calculate XP from calendar tasks
      const completedTasks = tasks.filter((task) => {
        if (task.status !== "completed") return false;
        const completionDate = task.completedAt || task.date;
        return completionDate && sameDay(completionDate, target);
      });

      const taskMinutes = completedTasks.reduce(
        (sum, task) => sum + (task.estimatedDuration || 30),
        0
      );

      // Add minutes from study timer history (Stopwatch)
      const timerEntry = (user.studyTimerHistory || []).find(s => sameDay(s.date, target));
      const timerMinutes = timerEntry ? (timerEntry.totalMinutes || 0) : 0;
      
      const totalMinutes = taskMinutes + timerMinutes;
      const taskXP = completedTasks.reduce((sum, task) => sum + taskXp(task), 0);

      // Calculate XP from user.xpHistory (quizzes, lessons, assignments)
      const historyXP = (user.xpHistory || []).reduce((sum, entry) => {
        if (!entry.date) return sum;
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        if (sameDay(entryDate, target)) {
          return sum + (entry.amount || 0);
        }
        return sum;
      }, 0);

      // Total XP for the day (tasks + quizzes + lessons + assignments)
      const totalXP = taskXP + historyXP;

      last7DaysStudy.push({
        day: dailyLabel(target),
        hours: minutesToHours(totalMinutes),
      });

      xpHistory.push({
        day: dailyLabel(target),
        xp: totalXP,
      });
    }

    const weeklyXP = xpHistory.reduce((sum, entry) => sum + entry.xp, 0);

    const upcomingTasks = tasks
      .filter((task) => {
        const date = new Date(task.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime() >= today.getTime() && task.status !== "completed";
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5)
      .map((task) => ({
        taskId: task.taskId,
        title: task.title,
        type: task.type,
        status: task.status,
        dueDate: task.date,
        estimatedDuration: task.estimatedDuration || 30,
      }));

    const calendarStats = calendar.statistics?.toObject
      ? calendar.statistics.toObject()
      : calendar.statistics || {};

    const summary = user.getDashboardSummary();
    summary.last7DaysStudy = last7DaysStudy;
    summary.xpHistory = xpHistory;
    summary.upcomingTasks = upcomingTasks;
    summary.weeklyXP = weeklyXP;
    summary.streak = calendar.streak?.currentStreak || 0;
    summary.personalBestStreak = calendar.streak?.longestStreak || 0;
    
    // Ensure all required fields exist for new users
    summary.courses = summary.courses || [];
    summary.upcomingTasks = summary.upcomingTasks || [];
    summary.last7DaysStudy = summary.last7DaysStudy || [];
    summary.xpHistory = summary.xpHistory || [];
    summary.weakTopics = summary.weakTopics || [];

    res.status(200).json({
      ...summary,
      statistics: calendarStats || {},
      streakStats: calendar.streak || { currentStreak: 0, longestStreak: 0 },
    });
  } catch (error) {
    console.error("Dashboard Fetch Error:", error.message);
    console.error("Full Error:", error);
    
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    res.status(500).json({ message: error.message || "Failed to load dashboard" });
  }
});

const authenticateUser = async (req) => {
  let token;

  // 1️⃣ Extract token
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) throw new Error("Not authorized, no token");

  // 2️⃣ Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ Get user
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");

  return user;
};

//
// ─── GET USER PROFILE (AUTH REQUIRED) ───────────────────────────────
//
export const getUserProfilesetting = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      streakDays: user.streakDays,
      masteryScore: user.masteryScore,
      focusScore: user.focusScore,
      accuracyScore: user.accuracyScore,
      coins: user.coins,
      badges: user.badges.length,
      learningPreferences: user.learningPreferences,
      onboardingData: user.onboardingData,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("[ERROR] Get Profile Error:", error.message);
    res.status(401).json({ message: error.message || "Unauthorized request" });
  }
});

//
// ─── UPDATE USER PROFILE (AUTH REQUIRED) ───────────────────────────────
//
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userAuth = await authenticateUser(req);

    // Only allow specific fields to be updated for security
    const update = {};
    const allowedFields = [
      "username",
      "name",
      "avatarUrl",
      "learningPreferences",
      "onboardingData",
      "onboardingCompleted"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    console.log("[SYNC] Syncing Directives for User:", userAuth._id);
    
    // Direct update to avoid Mongoose change-detection issues with nested objects
    const updatedUser = await User.findByIdAndUpdate(
      userAuth._id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "System Parameters Synchronized",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        learningPreferences: updatedUser.learningPreferences,
        onboardingData: updatedUser.onboardingData,
        onboardingCompleted: updatedUser.onboardingCompleted,
        xp: updatedUser.xp,
        level: updatedUser.level,
        coins: updatedUser.coins,
      },
    });
  } catch (error) {
    console.error("[ERROR] Profile Sync Error:", error.message);
    res.status(500).json({ message: "Internal sync error occurred" });
  }
});
