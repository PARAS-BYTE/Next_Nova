import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    default: 'general',
  },
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  emotionsDetected: {
    type: String,
    default: '',
  },
  emotionAdjusted: {
    type: Boolean,
    default: false,
  },
  xpGained: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
