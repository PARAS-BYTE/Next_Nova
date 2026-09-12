import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { generateAIResponse } from '@/lib/aiService';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { message, topic = "general" } = body;

    const cookieToken = req.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('jwt='))
      ?.split('=')[1];
    const bearerToken = req.headers.get('authorization')?.split(' ')[1];
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'novalearn_dev_secret_key') as any;
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    // Save user message
    await ChatMessage.create({
      userId,
      topic,
      role: 'user',
      content: message
    });

    // Get history for context
    const history = await ChatMessage.find({ userId, topic })
      .sort({ timestamp: -1 })
      .limit(8);
    
    const formattedHistory = history.reverse().map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

    const systemPrompt = "You are NovaAI, a professional and extremely helpful study assistant. Use markdown for better readability. Provide concise and accurate answers.";

    const { text: reply, provider, model } = await generateAIResponse({
      prompt: message,
      systemPrompt,
      messages: formattedHistory,
      fastMode: true,
    });
    
    // XP and Emotions logic
    const xpGained = 5;
    const emotionsDetected = "curious"; 
    const emotionAdjusted = false;

    // Update User XP
    const user = await User.findById(userId);
    if (user && (user as any).addXP) {
      (user as any).addXP(xpGained, "Interaction with NovaAI");
      await user.save();
    }

    // Save AI reply in database
    await ChatMessage.create({
      userId,
      topic,
      role: 'model',
      content: reply,
      xpGained,
      emotionsDetected,
      emotionAdjusted
    });

    return NextResponse.json({
      success: true,
      reply: reply,
      xpGained,
      newTotalXp: user?.xp || 0,
      emotionDetected: emotionsDetected,
      emotionAdjusted: emotionAdjusted,
      provider,
      model,
    });

  } catch (error: any) {
    console.error("❌ SmartChat Route Error:", error);
    return NextResponse.json({
      message: "AI Failure",
      reply: "The AI is currently unavailable. Please try again later.",
      error: error.message
    }, { status: 500 });
  }
}
