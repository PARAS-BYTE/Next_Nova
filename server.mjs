import next from 'next';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project directory even when command is run elsewhere.
dotenv.config({ path: path.join(__dirname, '.env') });

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
import certificateRouter from './src/routes/CertificateRoutes.js';
import chatbotRouter from './src/routes/chatbotRoutes.js';
import { chatWithAI } from './src/controllers/ChatbotController.js';
import aiRouter from './src/routes/aiRoutes.js';
import focusRouter from './src/routes/focusRoutes.js';
import notificationRouter from './src/routes/notificationRoutes.js';
import initBattleSocket from './src/socket/battleManager.js';


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

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
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error("❌ CRITICAL: MONGO_URI missing from environment variables.");
    process.exit(1);
  }

  console.log('⏳ Connecting to MongoDB...');
  mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000, 
  }).then(() => {
    console.log('✅ MongoDB connected successfully');
  }).catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    
    if (err.message.includes('querySrv ETIMEOUT') || err.message.includes('ECONNREFUSED')) {
      if (mongoURI.includes('mongodb+srv')) {
        console.log('💡 Tip: This looks like a DNS issue with MongoDB Atlas.');
        console.log('   - Try switching your DNS to 8.8.8.8 or 1.1.1.1');
        console.log('   - Or use a local MongoDB URI in .env: MONGO_URI=mongodb://127.0.0.1:27017/nova_learn');
      } else {
        console.log('💡 Tip: Searching for a local MongoDB instance failed.');
        console.log('   - Make sure MongoDB is installed and running locally.');
        console.log('   - Run "mongod" in a separate terminal to start it manually.');
      }
    }
  });

  const db = mongoose.connection;
  db.on('error', (err) => console.error('MDB Error:', err));

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
  server.use('/api/certificates', certificateRouter);
  server.use('/api/chatbot', chatbotRouter);
  server.post('/api/chatbot', chatWithAI);
  server.use('/api/ai', aiRouter);
  server.use('/api/focus', focusRouter);
  server.use('/api/notifications', notificationRouter);


  server.post("/trans", async (req, res) => {
    res.send({});
  });

  // Let Next.js handle all other routes
  server.use((req, res) => {
    return handle(req, res);
  });

  const httpServer = createServer(server);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Initialize features that need socket.io
  initBattleSocket(io);

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> Nova Learn API active at http://localhost:${PORT}/api`);
    console.log(`> Socket.io Live Battle system active`);
  });
});
