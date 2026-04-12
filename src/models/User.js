import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ─── Identity ───────────────────────────────
    username: { type: String, required: true, unique: true, trim: true },
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    avatarUrl: { type: String, default: "" },
    verified: { type: Boolean, default: false },

    // ─── Learning Progress ───────────────────────
    xp: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    personalBestStreak: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 },
    masteryScore: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 },
    accuracyScore: { type: Number, default: 0 },

    // ─── Charts / History ────────────────────────
    last7DaysStudy: [{ day: String, hours: Number }],
    xpHistory: [{
      date: { type: Date, default: Date.now },
      reason: String,
      amount: Number
    }],

    // ─── Calendar & Tasks ────────────────────────
    calendarData: [
      {
        taskId: String,
        title: String,
        description: String,
        date: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["pending", "completed"],
          default: "pending",
        },
        type: { type: String, default: "task" },
        category: { type: String, default: "General" },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
      },
    ],
    upcomingTasks: [
      { title: String, dueDate: Date, course: String, type: String },
    ],
    completedTasks: [{ taskId: String, completedAt: Date }],

    // ─── Courses & Progress ──────────────────────
    enrolledCourses: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: "Course" },
        title: String,
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        lastAccessed: { type: Date, default: Date.now },
      },
    ],
    quizAttempts: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        resultData: { type: Object, required: true },
        attemptDate: { type: Date, default: Date.now },
      },
    ],
    assignments: [
      {
        assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
        submittedAt: Date,
        grade: Number,
        feedback: String,
      },
    ],

    // ─── Gamification ────────────────────────────
    currentRank: { type: String, default: "Bronze" },
    rankPercentile: { type: Number, default: 100 },
    coins: { type: Number, default: 0 },
    badges: [
      {
        badgeId: { type: Schema.Types.ObjectId, ref: "Badge" },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    // ─── AI & Personalization ────────────────────
    learningPreferences: {
      pace: { type: String, default: "moderate" },
      preferredTopics: [String],
      weakAreas: [String],
    },
    flashcards: [{
      topic: String,
      front: String,
      back: String,
      repetitions: { type: Number, default: 0 },
      interval: { type: Number, default: 1 },
      eFactor: { type: Number, default: 2.5 },
      nextReview: { type: Date, default: Date.now },
    }],
    aiTwinProfile: { type: Map, of: Schema.Types.Mixed, default: {} },

    // ─── Battle Analytics History (NEW) ───────────
    battleHistory: [Object],

    // ─── Analytics & Reports ─────────────────────
    lastLogin: { type: Date, default: Date.now },
    notifications: [
      {
        title: String,
        message: String,
        type: { type: String, default: "system" },
        createdAt: { type: Date, default: Date.now },
        read: { type: Boolean, default: false },
      },
    ],
    reports: [
      {
        weekStart: Date,
        insights: String,
        progressChange: Number,
      },
    ],
  },
  { timestamps: true }
);

//
// ─── PASSWORD HASHING ───────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// ─── METHODS ────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.addXP = function (amount) {
  this.xp += amount;
  this.weeklyXP += amount;
  const threshold = this.level * 100;
  if (this.xp >= threshold) {
    this.level += 1;
    this.xp -= threshold;
  }
};

userSchema.methods.updateStreak = function (activeToday) {
  if (activeToday) {
    this.streakDays += 1;
    if (this.streakDays > this.personalBestStreak)
      this.personalBestStreak = this.streakDays;
  } else {
    this.streakDays = 0;
  }
};

userSchema.methods.awardBadge = function (badgeId) {
  const alreadyEarned = this.badges.some(
    (b) => b.badgeId.toString() === badgeId.toString()
  );
  if (!alreadyEarned) this.badges.push({ badgeId });
};

userSchema.methods.addCalendarTask = function (taskData) {
  this.calendarData.push(taskData);
};

userSchema.methods.recordCompletion = function (taskId) {
  const task = this.calendarData.find((t) => t.taskId === taskId);
  if (task) task.status = "completed";
  this.completedTasks.push({ taskId, completedAt: new Date() });
};

userSchema.methods.updateAIProfile = function (feedback) {
  for (const [key, value] of Object.entries(feedback)) {
    this.aiTwinProfile.set(key, value);
  }
};


//
// ─── DASHBOARD SUMMARY (for API) ────────────────────────────────
userSchema.methods.getDashboardSummary = function () {
  return {
    _id: this._id,
    name: this.username,
    email: this.email,
    xp: this.xp,
    weeklyXP: this.weeklyXP,
    level: this.level,
    streak: this.streakDays,
    personalBestStreak: this.personalBestStreak,
    masteryScore: this.masteryScore,
    focusScore: this.focusScore,
    accuracyScore: this.accuracyScore,
    rank: this.currentRank,
    rankPercentile: this.rankPercentile,
    coins: this.coins,
    badges: this.badges.length,
    upcomingTasks: this.upcomingTasks.slice(0, 5),
    courses: this.enrolledCourses.map((c) => ({
      title: c.title,
      progress: c.progress,
      completed: c.completed,
    })),
    last7DaysStudy: this.last7DaysStudy,
    xpHistory: this.xpHistory,
    battleHistory: this.battleHistory.slice(-5).reverse(), // last 5 battles
  };
};
userSchema.methods.recordBattleAnalytics = function (data) {
  const {
    battleId,
    battleName,
    rank,
    totalPlayers,
    tagWisePerformance,
    playerAnalytics,
  } = data;

  if (!this.battleHistory) this.battleHistory = [];

  // Save history entry
  this.battleHistory.push({
    battleId: battleId || null,
    battleName: battleName || "Unknown Battle",
    date: new Date(),
    rank: rank || 0,
    totalPlayers: totalPlayers || 0,
    tagWisePerformance: tagWisePerformance || [],
    performance: playerAnalytics || {},
  });

  // Update gamification
  const score = playerAnalytics?.totalScore || 0;
  const accuracy = playerAnalytics?.accuracy || 0;
  const correctCount = playerAnalytics?.correctCount || 0;
  const totalQuestions = playerAnalytics?.completedQuestions || 1;

  // XP
  this.addXP(correctCount * 10);

  // Accuracy Score
  this.accuracyScore = accuracy;

  // Mastery Score (slow gain)
  this.masteryScore = Math.min(
    100,
    Number((this.masteryScore + accuracy / 20).toFixed(1))
  );

  // Focus score = correct consistency
  const consistency = correctCount / totalQuestions;
  this.focusScore = Math.min(
    100,
    Number((this.focusScore + consistency * 8).toFixed(1))
  );

  // Coins
  this.coins += Math.round(score / 5);

  return this.save();
};


const User = mongoose.model("User", userSchema);
export default User;
