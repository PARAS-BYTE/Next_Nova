import express from "express";
import { chatWithAI, smartChat } from "../controllers/ChatbotController.js";

const router = express.Router();

// POST /api/chatbot - Chat with AI
router.post("/", chatWithAI);

// POST /api/chatbot/smart-chat - Advanced Chat with history and XP
router.post("/smart-chat", smartChat);

export default router;
