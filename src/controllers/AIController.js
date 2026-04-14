import asyncHandler from 'express-async-handler';
import { Mistral } from '@mistralai/mistralai';
import User from '../Models/User.js';

// Setup Mistral
const getMistralClient = () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is missing");
  return new Mistral({ apiKey });
};

// Robust JSON Extraction
const extractJSON = (text) => {
  try {
    // Strip markdown indicators
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("JSON Extraction failed:", text);
    return null;
  }
};

export const getMotivation = asyncHandler(async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;
    const client = getMistralClient();
    
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
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });
    
    const therapyData = extractJSON(response.choices[0].message.content);
    
    if (!therapyData) throw new Error("AI returned unparseable advice");
    
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

    const client = getMistralClient();
    const prompt = `Create a 5-question quiz based on the following study notes. 
    Notes Content: "${content}"
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

    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });

    const quizData = extractJSON(response.choices[0].message.content);
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

    const client = getMistralClient();
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
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      safePrompt: true,
      responseFormat: { type: "json_object" }
    });
    
    const prediction = extractJSON(response.choices[0].message.content);
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

    const client = getMistralClient();
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
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      safePrompt: true,
      responseFormat: { type: "json_object" }
    });
    
    const styleData = extractJSON(response.choices[0].message.content);
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

    const client = getMistralClient();
    const prompt = `Based on student profile: ${JSON.stringify(context)}, suggest study topics and a plan.
    Return strictly as JSON:
    {
      "nextTopics": [string],
      "weeklyPlan": [
        { "day": "Monday", "focus": string, "duration": number, "type": "learn"|"practice"|"revision" }
      ]
    }`;
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      safePrompt: true,
      responseFormat: { type: "json_object" }
    });
    
    const recs = extractJSON(response.choices[0].message.content);
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

    const client = getMistralClient();
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
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      safePrompt: true,
      responseFormat: { type: "json_object" }
    });
    
    const report = extractJSON(response.choices[0].message.content);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report card" });
  }
});

// POST /api/ai/flashcards
export const generateFlashcards = asyncHandler(async (req, res) => {
  try {
    const { topic, count } = req.body;
    const client = getMistralClient();
    const prompt = `Generate ${count || 5} spaced-repetition flashcards for topic: "${topic}". Return strictly as JSON array of objects with "question" and "answer" keys. Or a JSON object with a "flashcards" key containing the array.`;
    
    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      safePrompt: true,
      responseFormat: { type: "json_object" }
    });
    
    let generated = extractJSON(response.choices[0].message.content);
    
    // Handle both array and object responses
    let flashcards = Array.isArray(generated) ? generated : generated.flashcards || [];
    
    if (req.user && flashcards.length > 0) {
       flashcards.forEach(card => {
         // Map different possible key names from AI
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
