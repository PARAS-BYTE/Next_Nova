import next from 'next';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

// Ensure the Express backend uses the routes copied to src/routes
import authRoutes from './src/routes/authRoutes.js';
import courseRouter from './src/routes/CourseRouter.js';
import calendarRouter from './src/routes/CalendarRoutes.js';
import QuizRouter from './src/routes/QuizRouter.js';
import adminAuthRoutes from './src/routes/adminAuthRoutes.js';
import assignmentRouter from './src/routes/AssignmentRouter.js';
import BattleRouter from './src/routes/BattleRoutes.js';
import StoreRouter from './src/routes/storeRoutes.js';
import RoadMapRouter from './src/routes/RoadMapRoutes.js';
import lessonNotesRoutes from './src/routes/lessonNotesRoutes.js';
import personalNotesRoutes from './src/routes/personalNotesRoutes.js';
import questionRoutes from './src/routes/questionRoutes.js';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 5000;

const DEFAULT_JWT_SECRET = 'novalearn_dev_secret_key';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = DEFAULT_JWT_SECRET;
}

app.prepare().then(() => {
  const server = express();

  // Basic Express middlewares from original backend
  server.use(cors({ origin: true, credentials: true, withCredentials: true }));
  server.use(express.json());
  server.use(cookieParser());

  // MongoDB Connection
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nova_learn';
  mongoose.connect(MONGO_URI).catch(console.error);
  const db = mongoose.connection;
  db.on('error', (err) => console.error('MongoDB connection error:', err));
  db.once('open', () => console.log('MongoDB connected successfully'));

  // Attach all original backend routes
  server.use("/api/battle", BattleRouter);
  server.use('/api/auth', authRoutes);
  server.use('/api/courses', courseRouter);
  server.use('/api/calendar', calendarRouter);
  server.use('/api/quiz', QuizRouter);
  server.use('/api/admin/auth', adminAuthRoutes);
  server.use('/api/assignments', assignmentRouter);
  server.use("/api/store", StoreRouter);
  server.use("/api/roadmap", RoadMapRouter);
  server.use('/api/notes', lessonNotesRoutes);
  server.use('/api/personal-notes', personalNotesRoutes);
  server.use('/api/questions', questionRoutes);

  server.post("/trans", async (req, res) => {
    res.send({});
  });

  // Let Next.js handle all other routes
  server.use((req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://0.0.0.0:${PORT}`);
    console.log(`> Nova Learn API active at http://0.0.0.0:${PORT}/api`);
  });
});
