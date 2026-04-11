import express from "express";

import { evaluateQuiz, generateAIQuiz, getAllQuizzes, getQuizDetails, getUserQuizAttempts } from "../controllers/QuizController.js";
// import { getAllQuizzes, getQuizDetails } from "../controllers/QuizController";
// import { getAllQuizzes, getQuizDetails } from "../controllers/quizController.js";

const router = express.Router();

// 🔐 Both routes require JWT-authenticated users
router.get("/", getAllQuizzes);
router.post("/single", getQuizDetails);
router.post("/evaluate",evaluateQuiz)
router.post("/genai",generateAIQuiz)
router.get("/getquizattempts",getUserQuizAttempts)

export default router;
