import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { generateAIResponse, generateAIJson } from "../lib/aiService.js";

const authenticateUser = async (req) => {
  const token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) throw new Error("Auth token missing");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");
  return user;
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, context, history, mode = "standard", language = "english", voiceStyle = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let systemPrompt = `You are NovaAI, a highly intelligent and supportive study companion.\n`;
    systemPrompt += `CRITICAL: Always use Markdown formatting for your responses. For any code snippets, use triple backticks with the appropriate language name (e.g., \`\`\`javascript). This is essential for rendering.\n`;
    
    // Mode settings
    if (mode === "doubt") {
      systemPrompt += "The student is asking a doubt. Provide a clear, step-by-step resolution.\n";
    } else if (mode === "simple") {
      systemPrompt += "Explain the concept in extremely simple terms, as if to a beginner, and avoid complex jargon.\n";
    }

    // Language settings
    if (language === "hindi") {
      systemPrompt += "Reply completely in Hindi. You may use Devanagari script.\n";
    } else if (language === "hinglish") {
      systemPrompt += "Reply in a mix of Hindi and English written in the Latin alphabet (Hinglish). Example: 'Yeh concept samajhna bahot easy hai...'\n";
    } else {
      systemPrompt += "Reply in English.\n";
    }

    // Voice Style
    if (voiceStyle) {
      systemPrompt += "Adopt a highly conversational, friendly, spoken-voice tone. Use filler words and natural speech patterns as if speaking out loud.\n";
    }

    if (context) systemPrompt += `Context: ${context}\n`;

    const formattedHistory = [];
    if (history && history.length > 0) {
      history.forEach(msg => {
        formattedHistory.push({
          role: msg.role === 'user' || msg.role === 'student' ? 'user' : 'assistant',
          content: msg.content || msg.text || ''
        });
      });
    }

    const { text, provider, model } = await generateAIResponse({
      prompt: message,
      systemPrompt,
      messages: formattedHistory,
      fastMode: true,
    });

    return res.json({
      success: true,
      reply: text,
      message: text,
      provider,
      model,
    });
  } catch (error) {
    console.error("❌ [Server] Chatbot Controller Critical Error:", error.message);
    
    let userReply = "The AI winds are currently still. Mana leakage detected.";
    if (error.message.includes("401")) userReply = "The AI seal is broken (Invalid API key).";
    if (error.message.includes("429")) userReply = "The AI realm is overcrowded (Rate limit). Retrying soon...";

    return res.status(500).json({
      message: "AI service failure",
      reply: userReply,
      error: error.message
    });
  }
};

export const smartChat = async (req, res) => {
  try {
    const { message, topic = "general", mode = "standard", language = "english" } = req.body;
    const token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: "Auth token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!message) {
      return res.status(400).json({ message: "Talk to me, sensei! (Message required)" });
    }

    // Save user message
    await ChatMessage.create({
      userId,
      topic,
      role: 'user',
      content: message
    });

    // History for context
    const history = await ChatMessage.find({ userId, topic })
      .sort({ timestamp: -1 })
      .limit(6);

    let systemPrompt = "You are NovaAI, a world-class AI tutor. You are encouraging, precise, and use markdown for formatting.\n";
    
    // Mode-specific instructions
    if (mode === "socratic") {
      systemPrompt += "TEACHING STYLE: SOCRATIC METHOD. Do NOT give direct answers. Instead, ask leading questions to help the student reach the conclusion themselves. Guide them step-by-step.\n";
    } else if (mode === "analogy") {
      systemPrompt += "TEACHING STYLE: ANALOGY-BASED. Explain every complex concept using a creative and easy-to-understand real-world analogy.\n";
    } else if (mode === "simple") {
      systemPrompt += "TEACHING STYLE: ELI5. Explain concept as if to a 5-year old. Use very simple language and avoid all jargon.\n";
    } else if (mode === "coding") {
      systemPrompt += "TEACHING STYLE: CODE-FIRST. Focus on practical implementation, syntax, and best practices. Provide plenty of code examples.\n";
    }

    // Language settings
    if (language === "hindi") {
      systemPrompt += "Reply completely in Hindi. You may use Devanagari script.\n";
    } else if (language === "hinglish") {
      systemPrompt += "Reply in a mix of Hindi and English (Hinglish). Example: 'Yeh loop samajhna easy hai, bas is condition ka dhyan rakho...'\n";
    }

    const messages = history.reverse().map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const { text: reply, provider, model } = await generateAIResponse({
      prompt: message,
      systemPrompt,
      messages,
      fastMode: true,
    });

    const xpGained = Math.random() > 0.6 ? 15 : 0;

    // Save AI reply
    await ChatMessage.create({
      userId,
      topic,
      role: 'model',
      content: reply,
      xpGained
    });

    // Award XP to user if gained
    if (xpGained > 0) {
      const user = await User.findById(userId);
      if (user && user.addXP) {
        user.addXP(xpGained, "Chat Participation");
        await user.save();
      }
    }

    return res.json({
      success: true,
      reply: reply,
      xpGained: xpGained,
      emotionDetected: "curious",
      emotionAdjusted: false,
      provider,
      model,
    });

  } catch (error) {
    console.error("❌ SmartChat Error:", error);
    return res.status(500).json({
      message: "Neural link failure",
      reply: "Sorry, I lost my connection for a second. Can you repeat that?",
      error: error.message
    });
  }
};

// ─── DAILY CHALLENGE ───────────────────────────────────────────
export const getDailyChallenge = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const weakAreas = user.learningPreferences?.weakAreas || ["General Knowledge", "Problem Solving"];
  
  // Choose a random weak area
  const topic = weakAreas[Math.floor(Math.random() * weakAreas.length)];
  
  try {
    const prompt = `
      You are NovaAI. Generate a CHALLENGING multiple-choice question for a student focused on their weak area: "${topic}".
      The question should be academic and testing deep understanding.
      
      Return strictly as JSON:
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string of the correct option",
        "explanation": "A detailed explanation of WHY this is correct and tips for the student.",
        "difficulty": "medium"
      }
    `;

    const fallbackChallenge = {
      question: `Which fundamental principle is most critical when learning ${topic}?`,
      options: [
        "Consistent deliberate practice",
        "Memorizing without application",
        "Skipping fundamentals for shortcuts",
        "Studying only once a month"
      ],
      correctAnswer: "Consistent deliberate practice",
      explanation: "Deliberate practice with feedback builds neural pathways and long-term mastery.",
      difficulty: "medium"
    };

    const challenge = await generateAIJson({
      prompt,
      systemPrompt: "Generate a rigorous study challenge question in pure JSON.",
      fallback: fallbackChallenge,
      fastMode: true,
    });

    res.status(200).json({ success: true, challenge });
  } catch (error) {
    console.error("Daily Challenge Error:", error);
    res.status(500).json({ message: "Failed to generate challenge" });
  }
});

export const completeDailyChallenge = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { answer, correctAnswer, difficulty } = req.body;

  const isCorrect = answer === correctAnswer;
  const xpGained = isCorrect ? 35 : 5;

  if (isCorrect) {
    user.addXP(xpGained, "Daily Challenge Mastery");
    user.coins += 10;
    await user.save();
  }

  res.status(200).json({
    success: true,
    isCorrect,
    xpGained,
    message: isCorrect ? "Excellent mastery demonstrated." : "Incorrect. Review the explanation provided."
  });
});
