import express from "express";
import {
  getMotivation,
  predictPerformance,
  detectLearningStyle,
  getRecommendations,
  generateReportCard,
  generateFlashcards,
  getFlashcards,
  reviewFlashcard,
  generateQuizFromContent,
} from "../controllers/AIController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection to all AI routes to enable detailed user data analysis
router.use(protect);

// POST /api/ai/motivation         - AI Study Therapist
router.post("/motivation", getMotivation);

// POST /api/ai/predict            - Performance Predictor
router.post("/predict", predictPerformance);

// POST /api/ai/learning-style     - Learning Style Detection
router.post("/learning-style", detectLearningStyle);

// POST /api/ai/recommendations    - Smart Recommendations
router.post("/recommendations", getRecommendations);

// POST /api/ai/report-card        - AI Report Card
router.post("/report-card", generateReportCard);

// POST /api/ai/flashcards         - Generate AI flashcards
router.post("/flashcards", generateFlashcards);
router.get("/flashcards", getFlashcards);

// PUT  /api/ai/flashcards/review  - Review a flashcard (SM-2 algorithm)
router.put("/flashcards/review", reviewFlashcard);

// POST /api/ai/quiz-from-content    - Generate quiz from note content
router.post("/quiz-from-content", generateQuizFromContent);

export default router;
