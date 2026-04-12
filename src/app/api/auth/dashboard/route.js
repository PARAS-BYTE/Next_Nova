import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Calendar from '@/models/Calendar';
import jwt from 'jsonwebtoken';

const ensureCalendarForUser = async (user) => {
  let calendar = await Calendar.findOne({ userId: user._id });

  if (!calendar) {
    calendar = new Calendar({
      userId: user._id,
      studyPreferences: {
        subjects: user.enrolledCourses?.map((course) => course.title) || ["General Learning"],
        difficultyLevel: user.level > 2 ? "advanced" : user.level > 1 ? "intermediate" : "beginner",
        dailyStudyTime: 60,
        learningGoals: ["Improve knowledge", "Build consistent study habits"],
        preferredLearningStyles: ["visual", "practical"],
      },
    });
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

const dailyLabel = (date) => date.toLocaleDateString("en-US", { weekday: "short" });

const minutesToHours = (minutes) => Math.round(((minutes || 0) / 60) * 10) / 10;

const taskXp = (task) => {
  const bonus = task.difficulty === "advanced" ? 20 : task.difficulty === "intermediate" ? 10 : 0;
  return 30 + bonus;
};

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get('jwt')?.value || request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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

      const completedTasks = tasks.filter((task) => {
        if (task.status !== "completed") return false;
        const completionDate = task.completedAt || task.date;
        return completionDate && sameDay(completionDate, target);
      });

      const taskMinutes = completedTasks.reduce((sum, task) => sum + (task.estimatedDuration || 30), 0);
      const timerEntry = (user.studyTimerHistory || []).find(s => sameDay(s.date, target));
      const timerMinutes = timerEntry ? (timerEntry.totalMinutes || 0) : 0;
      const totalMinutes = taskMinutes + timerMinutes;

      const taskXP = completedTasks.reduce((sum, task) => sum + taskXp(task), 0);
      const historyXP = (user.xpHistory || []).reduce((sum, entry) => {
        if (!entry.date) return sum;
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return sameDay(entryDate, target) ? sum + (entry.amount || 0) : sum;
      }, 0);

      last7DaysStudy.push({ day: dailyLabel(target), hours: minutesToHours(totalMinutes) });
      xpHistory.push({ day: dailyLabel(target), xp: taskXP + historyXP });
    }

    const summary = user.getDashboardSummary();
    const weeklyXP = xpHistory.reduce((sum, entry) => sum + entry.xp, 0);

    return NextResponse.json({
      ...summary,
      last7DaysStudy,
      xpHistory,
      weeklyXP,
      streak: calendar.streak?.currentStreak || 0,
      personalBestStreak: calendar.streak?.longestStreak || 0,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ message: "Failed to load dashboard" }, { status: 500 });
  }
}
