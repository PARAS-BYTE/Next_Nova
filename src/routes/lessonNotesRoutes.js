import express from 'express';
import { saveNote, getNote } from '../controllers/lessonNotesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:lessonId', protect, getNote);
router.post('/:lessonId', protect, saveNote);

export default router;
