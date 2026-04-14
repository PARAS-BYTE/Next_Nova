import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Mistral } from "@mistralai/mistralai";
import User from "../models/User.js";
import Battle from "../models/BattleSchema.js";
import Question from "../models/Questions.js";

const getMistralClient = () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is missing");
  return new Mistral({ apiKey });
};

//
// ─── AUTH HELPER ───────────────────────────────────────────────
//
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

//
// ─── CREATE BATTLE ─────────────────────────────────────────────
//
export const createBattle = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { battleName, tags } = req.body;

    const BATTLE_SIZE = 15;
    const MCQ_NEEDED = Math.floor(BATTLE_SIZE / 2);
    const PARA_NEEDED = BATTLE_SIZE - MCQ_NEEDED;

    const normalizedTags = tags.map(t => t.trim().toLowerCase());

    let allQuestions = await Question.aggregate([
      {
        $addFields: {
          normalizedTags: {
            $map: {
              input: "$tags",
              as: "tag",
              in: { $toLower: { $trim: { input: "$$tag" } } }
            }
          }
        }
      },
      { $match: { normalizedTags: { $in: normalizedTags } } }
    ]);

    let mcqQuestions = allQuestions.filter(q => q.questionType === "mcq");
    let paraQuestions = allQuestions.filter(q => q.questionType === "paragraph");

    mcqQuestions.sort(() => Math.random() - 0.5);
    paraQuestions.sort(() => Math.random() - 0.5);

    let selectedMCQ = mcqQuestions.slice(0, MCQ_NEEDED);
    let selectedPARA = paraQuestions.slice(0, PARA_NEEDED);

    const missingMCQ = MCQ_NEEDED - selectedMCQ.length;
    const missingPARA = PARA_NEEDED - selectedPARA.length;

    let generated = [];

    if (missingMCQ > 0 || missingPARA > 0) {
      const client = getMistralClient();
      const prompt = `
      You are an expert quiz generator. Generate ${missingMCQ} MCQ and ${missingPARA} Paragraph questions matching these tags: ${tags.join(", ")}.
      Return strictly as a JSON array.
      MCQ format: { "question": "", "questionType": "mcq", "options": ["a","b","c","d"], "correctAnswer": "a", "tags": [...] }
      Paragraph format: { "question": "", "questionType": "paragraph", "answerGuidelines": "", "tags": [...] }
      `;

      const response = await client.chat.complete({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      try {
        const match = content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : content);
        generated = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      } catch (e) {
        console.error("Mistral JSON parse failed", content);
      }

      generated = generated.map(q => {
        if (q.questionType === "mcq" && (!Array.isArray(q.options) || q.options.length !== 4)) {
            q.options = ["Option A", "Option B", "Option C", "Option D"];
            q.correctAnswer = "Option A";
        }
        return q;
      });

      if (generated.length > 0) {
        generated = await Question.insertMany(generated);
      }
    }

    let allSelected = [...selectedMCQ, ...selectedPARA, ...generated].sort(() => Math.random() - 0.5);
    const battleCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    await Battle.create({
      battleCode, battleName, tags, createdBy: user._id,
      duration: 10000, questions: allSelected,
      players: [{ userId: user._id, username: user.username, analytics: { score: 0, completedQuestions: 0, accuracy: 0, avgTimePerQuestion: 0, totalTimeTaken: 0, answers: [] } }],
      status: "waiting",
    });

    res.status(201).json({ message: "Battle created successfully", battleCode, battleName, createdBy: user.username, tags, questionCount: allSelected.length, mcq: selectedMCQ.length, paragraph: selectedPARA.length, aiGenerated: generated.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//
// ─── JOIN BATTLE ─────────────────────────────────────────────
//
export const joinBattle = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { battleCode } = req.body;

    const battle = await Battle.findOne({ battleCode }).populate("questions");
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    const existingPlayer = battle.players.find(
      (p) => p.userId.toString() === user._id.toString()
    );

    if (!existingPlayer) {
      if (battle.players.length >= 2)
        return res.status(400).json({ message: "Battle is full" });

      battle.players.push({
        userId: user._id,
        username: user.username,
        analytics: {
          score: 0,
          completedQuestions: 0,
          accuracy: 0,
          avgTimePerQuestion: 0,
          totalTimeTaken: 0,
          answers: [],
        },
      });

      if (battle.players.length === 2) battle.status = "in-progress";
      await battle.save();
    }

    const safeQuestions = battle.questions.map((q) => ({
      _id: q._id.toString(),
      question: q.question,
      questionType: q.questionType,
      options: q.options ?? undefined,
      answerGuidelines: q.answerGuidelines ?? undefined,
      category: q.category ?? undefined,
      difficulty: q.difficulty ?? undefined,
      tags: q.tags ?? [],
    }));

    res.status(200).json({
      message: existingPlayer ? "Rejoined battle" : "Joined battle",
      battleId: battle._id.toString(),
      battleCode,
      battleName: battle.battleName,
      status: battle.status,
      players: battle.players,
      questions: safeQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//
// ─── EVALUATE BATTLE ───────────────────────────────────────────
//
export const evaluateBattle = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { battleId, answers } = req.body;

    const battle = await Battle.findById(battleId).populate("questions");
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    let totalScore = 0, correct = 0, incorrect = 0, totalTime = 0;
    const correctnessTimeline = [], tagHash = {};

    const paragraphInputs = answers.map(ans => {
        const q = battle.questions.find(qq => qq._id.toString() === ans.questionId);
        if (!q || q.questionType !== "paragraph") return null;
        return { questionId: ans.questionId, question: q.question, userAnswer: ans.answer || "", guidelines: q.answerGuidelines || "" };
    }).filter(Boolean);

    let paragraphResults = [];
    if (paragraphInputs.length > 0) {
      const client = getMistralClient();
      const prompt = `Evaluate these answers. Return strictly as a JSON array of: { "questionId": "", "isCorrect": boolean, "points": number, "feedback": "" }. Data: ${JSON.stringify(paragraphInputs)}`;
      const response = await client.chat.complete({
        model: "mistral-large-latest",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" }
      });
      try {
        const match = response.choices[0].message.content.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : response.choices[0].message.content);
        paragraphResults = Array.isArray(parsed) ? parsed : Object.values(parsed).find(v => Array.isArray(v)) || [];
      } catch (e) {
        paragraphResults = paragraphInputs.map(p => ({ questionId: p.questionId, isCorrect: false, points: 0, feedback: "AI evaluation failed" }));
      }
    }

    answers.forEach((ans, idx) => {
      const q = battle.questions.find(qq => qq._id.toString() === ans.questionId);
      if (!q) return;
      let isCorrect = false, points = 0;
      if (q.questionType === "mcq") {
        isCorrect = ans.answer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
        points = isCorrect ? 10 : 0;
      } else if (q.questionType === "paragraph") {
        const r = paragraphResults.find(x => x.questionId === ans.questionId);
        if (r) { isCorrect = r.isCorrect; points = r.points; }
      }
      if (isCorrect) correct++; else incorrect++;
      totalScore += points;
      totalTime += ans.timeTaken || 0;
      correctnessTimeline.push({ questionNumber: idx + 1, correct: isCorrect });
      (q.tags || []).forEach(t => { const tag = t.toLowerCase(); if (!tagHash[tag]) tagHash[tag] = { correct: 0, total: 0 }; tagHash[tag].total++; if (isCorrect) tagHash[tag].correct++; });
    });

    const totalQuestions = answers.length;
    const accuracy = totalQuestions ? (correct / totalQuestions) * 100 : 0;
    const avgTime = totalQuestions ? totalTime / totalQuestions : 0;
    const tagWisePerformance = Object.keys(tagHash).map(tag => ({ tag, accuracy: Number(((tagHash[tag].correct / tagHash[tag].total) * 100).toFixed(1)) }));

    battle.players.push({ userId: user._id, username: user.username, score: totalScore, accuracy, rank: 0 });
    battle.players.sort((a, b) => b.score - a.score);
    battle.players.forEach((p, i) => p.rank = i + 1);
    await battle.save();
    
    const rank = battle.players.find(p => p.userId.toString() === user._id.toString()).rank;
    const leaderboard = battle.players.map(p => ({ username: p.username, score: p.score, accuracy: p.accuracy, rank: p.rank }));
    const summaryAnalytics = { totalPlayers: battle.players.length, highestScore: Math.max(...battle.players.map(p => p.score)), lowestScore: Math.min(...battle.players.map(p => p.score)), averageScore: battle.players.reduce((sum, p) => sum + p.score, 0) / battle.players.length, totalQuestions };
    const userPerformance = { totalScore, correctCount: correct, incorrectCount: incorrect, accuracy: Number(accuracy.toFixed(1)), completedQuestions: totalQuestions, timeline: correctnessTimeline, avgTime, totalTime, tagWisePerformance, paragraphFeedback: paragraphResults };

    await user.recordBattleAnalytics({ battleId, battleName: battle.battleName, rank, totalPlayers: battle.players.length, tagWisePerformance, playerAnalytics: userPerformance });
    user.addXP(correct * 10);
    await user.save();

    res.status(200).json({ message: "Evaluation complete", analytics: summaryAnalytics, userPerformance, players: leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getUserBattleHistory = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    if (!user.battleHistory || user.battleHistory.length === 0) {
      return res.status(200).json({ message: "No previous battles found.", user: { _id: user._id, username: user.username }, battles: [] });
    }
    const sortedHistory = [...user.battleHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const cleanedHistory = sortedHistory.map((b) => ({
      battleId: b.battleId || null,
      battleName: b.battleName || "Unknown Battle",
      rank: b.rank ?? null,
      totalPlayers: b.totalPlayers ?? null,
      totalScore: b.performance?.totalScore ?? 0,
      accuracy: b.performance?.accuracy ?? 0,
      correctCount: b.performance?.correctCount ?? 0,
      incorrectCount: b.performance?.incorrectCount ?? 0,
      completedQuestions: b.performance?.completedQuestions ?? 0,
      tagWisePerformance: Array.isArray(b.tagWisePerformance) ? b.tagWisePerformance : [],
      timeline: Array.isArray(b.performance?.timeline) ? b.performance.timeline : [],
      paragraphFeedback: Array.isArray(b.performance?.paragraphFeedback) ? b.performance.paragraphFeedback : [],
      date: b.date,
    }));
    res.status(200).json({ message: "Battle history fetched successfully.", user: { _id: user._id, username: user.username, email: user.email, totalBattles: cleanedHistory.length }, battles: cleanedHistory });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch battle history.", error: error.message });
  }
});

export const getAllBattles = asyncHandler(async (req, res) => {
  try {
    const battles = await Battle.find({}).sort({ createdAt: -1 }).select("battleName battleCode tags status createdAt players");
    res.status(200).json({ message: "All battles fetched successfully.", count: battles.length, battles });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch battles.", error: error.message });
  }
});

export const getBattleAnalysis = asyncHandler(async (req, res) => {
  try {
    const { battleId } = req.body;
    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ message: "Battle not found" });

    res.status(200).json({
      message: "Battle analysis fetched successfully",
      battle: {
        battleName: battle.battleName,
        tags: battle.tags,
        status: battle.status,
        createdAt: battle.createdAt
      },
      players: battle.players
    });

  } catch (error) {
    console.error("❌ Error fetching battle analysis:", error);
    res.status(500).json({
      message: "Failed to fetch detailed battle analysis.",
      error: error.message,
    });
  }
});
