import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateAIResponse, generateAIJson, extractAndParseJSON } from '../lib/aiService.js';

export const getMotivation = asyncHandler(async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;
    
    // Provide user context for a more personalized "therapy" session
    const context = {
      name: user.username,
      xp: user.xp,
      level: user.level,
      streak: user.streakDays,
      recentActivity: user.xpHistory?.slice(-5),
      focusScore: user.focusScore,
      masteryScore: user.masteryScore
    };

    const prompt = `You are the "Nova AI Study Therapist". 
    A student is asking for motivation or just checking in. 
    Student Message: "${message || "Just checking in for my daily motivation."}"
    Student Profile: ${JSON.stringify(context)}
    
    Based on their recent activity and stats, analyze their burnout level and provide a structured motivational response.
    
    Return strictly as JSON:
    {
      "burnoutLevel": "none"|"low"|"moderate"|"high"|"critical",
      "motivationalMessage": "A short, empathetic, and highly motivating message under 60 words.",
      "actionSuggestions": [string, string, string],
      "breakRecommendation": {
        "shouldTakeBreak": boolean,
        "breakDuration": number (in minutes),
        "activity": "suggested relaxing activity"
      },
      "dailyGoal": "A small, achievable goal for today"
    }`;

    const fallbackData = {
      burnoutLevel: "none",
      motivationalMessage: "Stay resilient! Every concept mastered is a milestone toward your ultimate breakthrough.",
      actionSuggestions: ["Review your current progress summary", "Take a 5-minute deep breathing break", "Hydrate and continue the quest"],
      breakRecommendation: {
        shouldTakeBreak: false,
        breakDuration: 0,
        activity: "None"
      },
      dailyGoal: "Complete the next module in your current journey"
    };

    const therapyData = await generateAIJson({
      prompt,
      systemPrompt: "You are an expert educational counselor and study therapist.",
      fallback: fallbackData,
      fastMode: true,
    });
    
    res.status(200).json(therapyData);
  } catch (error) {
    console.error("❌ AI Therapist Error:", error.message);
    res.status(200).json({ 
      burnoutLevel: "none",
      motivationalMessage: "The celestial archives are slightly blurred today. Stay focused, your potential is limitless!",
      actionSuggestions: ["Review your current progress summary", "Take a 5-minute deep breathing break", "Hydrate and continue the quest"],
      breakRecommendation: {
        shouldTakeBreak: false,
        breakDuration: 0,
        activity: "None"
      },
      dailyGoal: "Complete the next module in your current journey"
    });
  }
});

// POST /api/ai/quiz-from-content
export const generateQuizFromContent = asyncHandler(async (req, res) => {
  try {
    const { content, title, difficulty = "medium" } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const prompt = `Create a 5-question quiz based on the following study notes. 
    Notes Content: "${content.slice(0, 4000)}"
    Difficulty: "${difficulty}"

    Return strictly as JSON:
    {
      "questions": [
        {
          "questionText": "string",
          "options": ["string", "string", "string", "string"],
          "correctIndex": number (1-based),
          "explanation": "short explanation why it's correct"
        }
      ]
    }`;

    const quizData = await generateAIJson({
      prompt,
      systemPrompt: "Generate a high quality study quiz strictly in JSON format.",
      fallback: { questions: [] },
      fastMode: true,
    });

    res.status(200).json(quizData);
  } catch (error) {
    console.error("❌ Quiz Gen Error:", error);
    res.status(500).json({ message: "Failed to generate quiz from content" });
  }
});

// POST /api/ai/predict
export const predictPerformance = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const stats = {
      xp: user.xp,
      level: user.level,
      streak: user.streakDays,
      quizAttempts: user.quizAttempts?.slice(-10),
      focusScore: user.focusScore,
      masteryScore: user.masteryScore,
      accuracy: user.accuracyScore
    };

    const prompt = `Based on this student's learning data: ${JSON.stringify(stats)}, predict their performance.
    Return strictly as JSON:
    {
      "predictedScore": number,
      "examSuccessProbability": number,
      "nextScoreTrend": "up"|"down"|"stable",
      "predictedNextScore": number,
      "confidenceLevel": number,
      "estimatedDaysToMastery": number,
      "strengthAreas": [string],
      "weakAreas": [string],
      "improvementTips": [string]
    }`;
    
    const fallbackPrediction = {
      predictedScore: Math.min(100, Math.max(50, (user.accuracyScore || 70) + 5)),
      examSuccessProbability: 80,
      nextScoreTrend: "up",
      predictedNextScore: 85,
      confidenceLevel: 85,
      estimatedDaysToMastery: 14,
      strengthAreas: ["Consistent Study Habits"],
      weakAreas: ["Deep Revision"],
      improvementTips: ["Practice with active recall and flashcards", "Complete daily challenges"]
    };

    const prediction = await generateAIJson({
      prompt,
      systemPrompt: "You are an expert academic performance analyst.",
      fallback: fallbackPrediction,
      fastMode: true,
    });

    res.status(200).json(prediction);
  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Failed to predict performance" });
  }
});

// POST /api/ai/learning-style
export const detectLearningStyle = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const behaviorData = {
      totalStudyTime: user.totalStudyTime,
      accuracy: user.accuracyScore,
      focus: user.focusScore,
      mastery: user.masteryScore,
      enrolledCourses: user.enrolledCourses?.length
    };

    const prompt = `Analyze this student's behavior: ${JSON.stringify(behaviorData)}.
    Detect their dominant learning style (Visual, Auditory, Kinesthetic, Reading/Writing).
    Return strictly as JSON:
    {
      "primaryStyle": string,
      "description": string,
      "confidence": number,
      "recommendations": {
        "idealSessionLength": number,
        "breakFrequency": number,
        "contentFormat": string,
        "difficultyAdjustment": string,
        "revisionFrequency": string
      }
    }`;
    
    const fallbackStyle = {
      primaryStyle: "Visual & Reading",
      description: "You absorb information effectively when concepts are visually organized and supplemented by structured notes.",
      confidence: 82,
      recommendations: {
        idealSessionLength: 25,
        breakFrequency: 5,
        contentFormat: "Diagrams & Markdown Notes",
        difficultyAdjustment: "Moderate",
        revisionFrequency: "Every 2 days"
      }
    };

    const styleData = await generateAIJson({
      prompt,
      systemPrompt: "You are an educational psychologist analyzing cognitive study styles.",
      fallback: fallbackStyle,
      fastMode: true,
    });

    res.status(200).json(styleData);
  } catch (error) {
    res.status(500).json({ message: "Failed to detect learning style" });
  }
});

// POST /api/ai/recommendations
export const getRecommendations = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const context = {
      level: user.level,
      xp: user.xp,
      currentCourses: user.enrolledCourses?.map(c => c.title),
      masteryScore: user.masteryScore,
      learningStyle: user.learningPreferences?.pace
    };

    const prompt = `Based on student profile: ${JSON.stringify(context)}, suggest study topics and a plan.
    Return strictly as JSON:
    {
      "nextTopics": [string],
      "weeklyPlan": [
        { "day": "Monday", "focus": string, "duration": number, "type": "learn"|"practice"|"revision" }
      ]
    }`;
    
    const fallbackRecs = {
      nextTopics: ["Core Foundations", "Problem Solving", "Speed Drills"],
      weeklyPlan: [
        { day: "Monday", focus: "Core Concepts", duration: 30, type: "learn" },
        { day: "Wednesday", focus: "Hands-on Practice", duration: 45, type: "practice" },
        { day: "Friday", focus: "Weekly Review & Quiz", duration: 25, type: "revision" }
      ]
    };

    const recs = await generateAIJson({
      prompt,
      systemPrompt: "You are an expert curriculum counselor.",
      fallback: fallbackRecs,
      fastMode: true,
    });

    res.status(200).json(recs);
  } catch (error) {
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

// POST /api/ai/report-card
export const generateReportCard = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const metrics = {
      xp: user.xp,
      level: user.level,
      streak: user.streakDays,
      accuracy: user.accuracyScore,
      focus: user.focusScore,
      mastery: user.masteryScore,
      weeklyXP: user.weeklyXP
    };

    const prompt = `Generate a comprehensive AI Report Card for this student metric: ${JSON.stringify(metrics)}.
    Return strictly as JSON:
    {
      "overallGrade": "A+"|"A"|"B+"|"B"|"C"|"D",
      "overallScore": number,
      "personalizedAdvice": string,
      "categories": [
        { "name": string, "score": number, "grade": string, "feedback": string }
      ],
      "strengths": [string],
      "areasToImprove": [string],
      "nextMilestone": string
    }`;
    
    const fallbackReport = {
      overallGrade: "A",
      overallScore: 88,
      personalizedAdvice: "Consistent effort is paying off. Keep your daily streak intact to build compounding momentum.",
      categories: [
        { name: "Consistency", score: 90, grade: "A", feedback: "Excellent daily habit formation." },
        { name: "Focus", score: 85, grade: "B+", feedback: "Great attention during study sessions." }
      ],
      strengths: ["Regular practice", "Quick concept adoption"],
      areasToImprove: ["Time management on complex problems"],
      nextMilestone: "Reach Level " + (user.level + 1)
    };

    const report = await generateAIJson({
      prompt,
      systemPrompt: "You are a master academic evaluator generating a constructive report card.",
      fallback: fallbackReport,
      fastMode: true,
    });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report card" });
  }
});

// POST /api/ai/flashcards
export const generateFlashcards = asyncHandler(async (req, res) => {
  try {
    const { topic, count } = req.body;
    const prompt = `Generate ${count || 5} spaced-repetition flashcards for topic: "${topic}". Return strictly as JSON array of objects with "question" and "answer" keys. Or a JSON object with a "flashcards" key containing the array.`;
    
    const fallbackCards = [
      { question: `What is the core definition of ${topic}?`, answer: `A fundamental concept in ${topic} representing key foundational principles.` },
      { question: `Why is ${topic} important?`, answer: `It provides essential problem solving capabilities and structural foundations.` }
    ];

    const generated = await generateAIJson({
      prompt,
      systemPrompt: "Generate concise, clear spaced repetition flashcards in JSON.",
      fallback: fallbackCards,
      fastMode: true,
    });
    
    let flashcards = Array.isArray(generated) ? generated : generated.flashcards || [];
    
    if (req.user && flashcards.length > 0) {
       flashcards.forEach(card => {
         const q = card.question || card.front || card.q;
         const a = card.answer || card.back || card.a;
         if (q && a) {
            req.user.flashcards.push({ 
              topic, 
              front: q, 
              back: a,
              repetitions: 0,
              interval: 1,
              eFactor: 2.5,
              nextReview: new Date()
            });
         }
       });
       await req.user.save();
    }
    
    res.status(200).json({ flashcards, count: flashcards.length, topic });
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    res.status(500).json({ message: "Failed to generate flashcards" });
  }
});

// GET /api/ai/flashcards
export const getFlashcards = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const cards = user.flashcards || [];
    const topics = [...new Set(cards.map(c => c.topic))];
    res.status(200).json({ flashcards: cards, topics });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch flashcards" });
  }
});

// PUT /api/ai/flashcards/review
export const reviewFlashcard = asyncHandler(async (req, res) => {
  try {
    const { flashcardId, quality } = req.body;
    const user = await User.findById(req.user._id);
    const card = user.flashcards.id(flashcardId);
    if (!card) return res.status(404).json({ message: "Flashcard not found" });
    
    // Ensure SM-2 variables are initialized
    const repetitions = card.repetitions || 0;
    const interval = card.interval || 1;
    const eFactor = card.eFactor || 2.5;

    let newInterval = 1;
    let newEFactor = eFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEFactor < 1.3) newEFactor = 1.3;
    
    if (quality >= 3) {
       if (repetitions === 0) newInterval = 1;
       else if (repetitions === 1) newInterval = 6;
       else newInterval = Math.round(interval * newEFactor);
       card.repetitions = repetitions + 1;
    } else {
       card.repetitions = 0;
       newInterval = 1;
    }
    
    card.eFactor = newEFactor;
    card.interval = newInterval;
    card.nextReview = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000);
    
    await user.save();
    res.status(200).json({ message: "Flashcard updated", card });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ message: "Failed to review flashcard" });
  }
});
