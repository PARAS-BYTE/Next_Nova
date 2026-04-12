import express from "express";
import { chatWithAI } from "../controllers/ChatbotController.js";

const router = express.Router();

// POST /api/chatbot - Chat with AI
router.post("/", chatWithAI);

export default router;
