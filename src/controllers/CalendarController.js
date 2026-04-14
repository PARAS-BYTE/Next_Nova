import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Calendar from "../models/Calendar.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

const authenticateUser = async (req) => {
  let token;
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];
  if (!token) throw new Error("Not authorized, no token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).populate('enrolledCourses');
  if (!user) throw new Error("User not found");

  return user;
};

// GET /api/calendar - Get calendar with AI-generated daily task + assignments
export const getCalendar = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  
  let calendar = await Calendar.findOne({ userId: user._id });
  
  if (!calendar) {
    calendar = new Calendar({
      userId: user._id,
      studyPreferences: {
        subjects: user.enrolledCourses?.map(course => course.title) || ["General Learning"],
        difficultyLevel: user.level > 2 ? "advanced" : user.level > 1 ? "intermediate" : "beginner",
        dailyStudyTime: 60,
        learningGoals: ["Improve knowledge", "Build consistent study habits"],
        preferredLearningStyles: ["visual", "practical"]
      }
    });
    await calendar.save();
  } else {
    calendar.cleanupInvalidTasks();
    await calendar.save();
  }
  
  // 1. Fetch Real Assignments
  const courseIds = user.enrolledCourses?.map(c => c.courseId) || [];
  const realAssignments = await Assignment.find({ 
    course: { $in: courseIds },
    published: true 
  });

  const assignmentTasks = realAssignments.map(asgn => ({
    taskId: asgn._id.toString(),
    title: `[ASGN] ${asgn.title}`,
    description: asgn.description,
    date: asgn.dueDate,
    status: asgn.submissions?.some(s => s.studentId.toString() === user._id.toString()) ? "completed" : "pending",
    type: "assignment",
    category: "Academic",
    priority: "high",
    estimatedDuration: 60,
    difficulty: "intermediate",
    aiGenerated: false
  }));

  // 2. AI Task Generation
  if (calendar.needsTaskGeneration()) {
    try {
      await calendar.generateDailyTask(user);
      await calendar.save();
    } catch (error) {
      console.error("Task Gen Error:", error);
      const fallback = calendar.generateFallbackTask(user);
      calendar.tasks.push(fallback);
      calendar.lastTaskGeneration = new Date();
      await calendar.save();
    }
  }
  
  // Merge AI tasks and Real assignments
  const allTasks = [...calendar.tasks, ...assignmentTasks];

  // Identifiy Today's Tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTasks = allTasks.filter(t => {
    const d = new Date(t.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  
  calendar.calculateStatistics();
  await calendar.save();
  
  res.status(200).json({
    tasks: allTasks,
    todayTasks: todayTasks,
    upcomingTasks: allTasks.filter(t => new Date(t.date) > today && t.status !== "completed"),
    streak: { 
      currentStreak: user.streakDays || 0, 
      longestStreak: user.personalBestStreak || 0 
    },
    statistics: {
      totalTasksCompleted: calendar.statistics.totalTasksCompleted,
      completionRate: calendar.statistics.completionRate,
      totalStudyTime: user.totalStudyTime || 0,
      averageDailyTasks: calendar.statistics.averageDailyTasks
    },
    studyPreferences: calendar.studyPreferences
  });
});

// PATCH /api/calendar/complete/:taskId - Complete today's task
const findTaskById = (calendar, taskId) => {
  if (!calendar?.tasks) return null;
  const directMatch = calendar.tasks.id(taskId);
  if (directMatch) return directMatch;
  return calendar.tasks.find(
    (task) =>
      task?.taskId === taskId ||
      (task?._id && task._id.toString() === taskId)
  ) || null;
};

export const completeTask = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { taskId } = req.params;
  
  let calendar = await Calendar.findOne({ userId: user._id });
  let task = findTaskById(calendar, taskId);
  let isAssignment = false;

  // Search in Assignments if not in Calendar
  if (!task) {
    const assignment = await Assignment.findById(taskId);
    if (assignment) {
      isAssignment = true;
      // Mark assignment as submitted for this student
      assignment.addSubmission(user._id, [{ answer: "Completed via Daily Task Roadmap" }]);
      await assignment.save();
      
      task = {
        taskId: assignment._id.toString(),
        title: assignment.title,
        status: "completed",
        difficulty: "intermediate"
      };
    }
  }

  if (!task) {
    return res.status(404).json({ message: "Task or Assignment not found" });
  }
  
  // Normal Calendar Task completion logic
  if (!isAssignment) {
      // Check if this is today's task
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(task.date);
      taskDate.setHours(0, 0, 0, 0);
      
      if (taskDate.getTime() !== today.getTime()) {
        return res.status(400).json({ 
          message: "You can only complete today's task. Future tasks are locked until their scheduled date." 
        });
      }
      
      if (task.status === "completed") {
        return res.status(400).json({ message: "Task already completed" });
      }
      
      // Mark task as completed
      task.status = "completed";
      task.completedAt = new Date();
      
      // Update statistics
      calendar.statistics.totalTasksCompleted = (calendar.statistics.totalTasksCompleted || 0) + 1;
      calendar.statistics.totalStudyTime = (calendar.statistics.totalStudyTime || 0) + (task.estimatedDuration || 30);
      
      // Update streak
      calendar.updateStreak();
      await calendar.save();
  }
  
  // Award XP to user (common for both)
  const xpGained = 30 + (task.difficulty === "advanced" ? 20 : task.difficulty === "intermediate" ? 10 : 0);
  user.addXP(xpGained);
  await user.save();
  
  res.status(200).json({
    message: isAssignment ? "Assignment submitted successfully! 🎓" : "Task completed successfully! 🎉",
    xpGained: xpGained,
    task: {
      taskId: task.taskId,
      title: task.title,
      status: "completed",
    },
    streak: calendar?.streak?.currentStreak || user.streakDays
  });
});

// GET /api/calendar/task/:taskId - Get a single task with ensured question set
export const getTaskById = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { taskId } = req.params;

  const calendar = await Calendar.findOne({ userId: user._id });
  let task = findTaskById(calendar, taskId);

  // If not in calendar, check Assignments
  if (!task) {
    const assignment = await Assignment.findById(taskId).populate('course');
    if (assignment) {
      task = {
        taskId: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        type: "assignment",
        category: assignment.module || "Academic",
        difficulty: "intermediate",
        estimatedDuration: 60,
        content: {
          questions: assignment.questions.map((q, i) => ({
            questionNumber: i + 1,
            type: q.questionType === "multiple_choice" ? "mcq" : "qa",
            question: q.questionText,
            options: q.questionType === "multiple_choice" ? ["Option A", "Option B", "Option C", "Option D"] : [], // Fallback for UI
            correctAnswer: "Refer to course materials",
            explanation: "Formal academic assignment."
          })),
          learningObjectives: [assignment.module || "Course Curriculum"]
        }
      };
    }
  }

  if (!task) {
    return res.status(404).json({ message: "Mission Directives not found" });
  }

  // Ensure content exists for AI/Custom tasks
  if (task.content && (!Array.isArray(task.content.questions) || task.content.questions.length === 0)) {
     // For AI tasks that might be corrupted or missing questions
     if (calendar) {
       task.content.questions = calendar.generateFallbackQuestions(
         task.category || "General",
         task.difficulty || "beginner"
       );
       await calendar.save();
     }
  }

  res.status(200).json({ task });
});

// GET /api/calendar/summary - Get calendar statistics
export const getCalendarSummary = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  
  const calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }
  
  const completedTasks = calendar.getCompletedTasks();
  const totalTasks = calendar.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  res.status(200).json({
    streak: calendar.streak,
    statistics: {
      ...calendar.statistics.toObject(),
      completionRate: completionRate,
      totalTasks: totalTasks,
      completedTasks: completedTasks.length
    },
    studyPreferences: calendar.studyPreferences
  });
});

// PATCH /api/calendar/preferences - Update study preferences
export const updateStudyPreferences = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { subjects, difficultyLevel, dailyStudyTime, learningGoals, preferredLearningStyles } = req.body;
  
  const calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }
  
  // Update preferences
  calendar.studyPreferences = {
    subjects: subjects || calendar.studyPreferences.subjects,
    difficultyLevel: difficultyLevel || calendar.studyPreferences.difficultyLevel,
    dailyStudyTime: dailyStudyTime || calendar.studyPreferences.dailyStudyTime,
    learningGoals: learningGoals || calendar.studyPreferences.learningGoals,
    preferredLearningStyles: preferredLearningStyles || calendar.studyPreferences.preferredLearningStyles
  };
  
  await calendar.save();
  
  res.status(200).json({
    message: "Study preferences updated successfully",
    studyPreferences: calendar.studyPreferences
  });
});

// POST /api/calendar/regenerate-today - Regenerate today's task
export const regenerateTodaysTask = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  
  const calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }
  
  // Remove today's task if exists
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const initialTaskCount = calendar.tasks.length;
  calendar.tasks = calendar.tasks.filter(t => {
    const taskDate = new Date(t.date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() !== today.getTime();
  });
  const removedCount = initialTaskCount - calendar.tasks.length;
  console.log(`🗑️ Removed ${removedCount} existing task(s) for today`);
  
  // Reset lastTaskGeneration to force new generation
  calendar.lastTaskGeneration = null;
  
  // Generate new task
  try {
    const newTask = await calendar.generateDailyTask(user);
    await calendar.save();
    console.log("✅ Task regenerated successfully:", newTask?.title);
    
    res.status(200).json({
      message: "Today's task regenerated successfully",
      task: newTask
    });
  } catch (error) {
    console.error("❌ Error regenerating task:", error);
    // Try fallback
    try {
      const fallbackTask = calendar.generateFallbackTask(user);
      calendar.tasks.push(fallbackTask);
      calendar.lastTaskGeneration = new Date();
      await calendar.save();
      console.log("✅ Fallback task created during regeneration");
      
      res.status(200).json({
        message: "Task regenerated successfully (using fallback)",
        task: fallbackTask
      });
    } catch (fallbackError) {
      console.error("❌ Critical error in regeneration:", fallbackError);
      res.status(500).json({
        message: "Failed to regenerate task",
        error: fallbackError.message
      });
    }
  }
});

// PATCH /api/calendar/task/:taskId - Update task status
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { taskId } = req.params;
  const { status } = req.body;
  
  const calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }
  
  const task = findTaskById(calendar, taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  
  // Validate status
  if (!["pending", "in-progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  
  task.status = status;
  
  if (status === "completed" && !task.completedAt) {
    task.completedAt = new Date();
    
    // Update streak and statistics for completed tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      calendar.updateStreak();
      calendar.statistics.totalTasksCompleted += 1;
    }
  }
  
  await calendar.save();
  
  res.status(200).json({
    message: "Task status updated successfully",
    task: {
      taskId: task.taskId,
      title: task.title,
      status: task.status,
      completedAt: task.completedAt
    }
  });
});

// POST /api/calendar/create-task - Create a custom task
export const createCustomTask = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { title, description, date, type, category, priority, estimatedDuration, difficulty } = req.body;
  
  // Validate required fields
  if (!title || !description || !date) {
    return res.status(400).json({ 
      message: "Title, description, and date are required" 
    });
  }
  
  let calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    // Create calendar if it doesn't exist
    calendar = new Calendar({
      userId: user._id,
      studyPreferences: {
        subjects: user.enrolledCourses?.map(course => course.title) || ["General Learning"],
        difficultyLevel: user.level > 2 ? "advanced" : user.level > 1 ? "intermediate" : "beginner",
        dailyStudyTime: 60,
        learningGoals: ["Improve knowledge", "Build consistent study habits"],
        preferredLearningStyles: ["visual", "practical"]
      }
    });
    await calendar.save();
  }
  
  // Validate task date (should not be in the past, except today)
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (taskDate < today) {
    return res.status(400).json({ 
      message: "Cannot create tasks for past dates" 
    });
  }
  
  // Check if task already exists for this date
  const existingTaskIndex = calendar.tasks.findIndex(t => {
    const tDate = new Date(t.date);
    tDate.setHours(0, 0, 0, 0);
    return tDate.getTime() === taskDate.getTime();
  });
  
  const existingTask = existingTaskIndex !== -1 ? calendar.tasks[existingTaskIndex] : null;
  
  // Create new custom task
  const newTask = {
    taskId: existingTask && !existingTask.aiGenerated 
      ? existingTask.taskId // Keep existing taskId if replacing custom task
      : new mongoose.Types.ObjectId().toString(), // New taskId for new tasks
    title: title.trim(),
    description: description.trim(),
    date: taskDate,
    status: existingTask && !existingTask.aiGenerated 
      ? existingTask.status // Preserve status if replacing custom task
      : "pending",
    type: calendar.validateTaskType(type || "study"),
    category: category || "General",
    priority: calendar.validatePriority(priority || "medium"),
    estimatedDuration: estimatedDuration || 30,
    difficulty: calendar.validateDifficulty(difficulty || "beginner"),
    aiGenerated: false, // Mark as custom task
    content: {
      learningObjectives: [],
      successCriteria: "Complete the task as described"
    },
    completedAt: existingTask && !existingTask.aiGenerated 
      ? existingTask.completedAt // Preserve completion time if exists
      : undefined
  };
  
  // Replace existing task (whether AI-generated or custom) or add new one
  if (existingTaskIndex !== -1) {
    calendar.tasks[existingTaskIndex] = newTask;
  } else {
    calendar.tasks.push(newTask);
  }
  
  await calendar.save();
  
  const message = existingTaskIndex !== -1 
    ? existingTask && !existingTask.aiGenerated
      ? "Custom task updated successfully!"
      : "Custom task created and replaced AI task!"
    : "Custom task created successfully!";
  
  res.status(201).json({
    message: message,
    task: newTask
  });
});

// POST /api/calendar/cleanup - Clean up invalid tasks (one-time fix)
export const cleanupCalendar = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  
  const calendar = await Calendar.findOne({ userId: user._id });
  if (!calendar) {
    return res.status(404).json({ message: "Calendar not found" });
  }
  
  const initialCount = calendar.tasks.length;
  calendar.cleanupInvalidTasks();
  const finalCount = calendar.tasks.length;
  const removedCount = initialCount - finalCount;
  
  await calendar.save();
  
  res.status(200).json({
    message: `Calendar cleanup completed. Removed ${removedCount} invalid tasks.`,
    tasksRemoved: removedCount,
    currentTasks: finalCount
  });
});
