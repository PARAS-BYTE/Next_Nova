import express from "express";
import { chatWithAI, smartChat, getDailyChallenge, completeDailyChallenge } from "../controllers/ChatbotController.js";

const router = express.Router();

// POST /api/chatbot - Chat with AI
router.post("/", chatWithAI);

// POST /api/chatbot/smart-chat - Advanced Chat with history and XP
router.post("/smart-chat", smartChat);

// GET /api/chatbot/daily-challenge - Personalized adaptive challenge
router.get("/daily-challenge", getDailyChallenge);

// POST /api/chatbot/daily-challenge/complete - Submit daily challenge
router.post("/daily-challenge/complete", completeDailyChallenge);

export default router;
