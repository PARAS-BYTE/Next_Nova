import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { message, topic = "general" } = body;

    const token = req.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('jwt='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        message: "Mistral API Key is missing in .env",
        reply: "Error: AI not configured."
      }, { status: 500 });
    }

    const client = new Mistral({ apiKey });
    const model = "mistral-large-latest";

    // Save user message
    await ChatMessage.create({
      userId,
      topic,
      role: 'user',
      content: message
    });

    // Get history for context (optional but better)
    const history = await ChatMessage.find({ userId, topic })
      .sort({ timestamp: -1 })
      .limit(10);
    
    const messages = [
      { role: "system", content: "You are NovaAI, a professional and extremely helpful study assistant. Use markdown for better readability. Provide concise and accurate answers." },
      ...history.reverse().map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      { role: "user", content: message }
    ];

    const chatResponse = await client.chat.complete({
      model: model,
      messages: messages as any,
    });

    const reply = chatResponse.choices![0].message.content || "I'm sorry, I couldn't process that.";
    
    // XP and Emotions logic - now actually updating User
    const xpGained = 5; // Gain 5 XP per meaningful message
    const emotionsDetected = "searching"; 
    const emotionAdjusted = false;

    // Update User XP in reality
    const user = await User.findById(userId);
    if (user) {
      user.addXP(xpGained, "Interaction with NovaAI");
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
      emotionAdjusted: emotionAdjusted
    });

  } catch (error: any) {
    console.error("❌ Mistral Error:", error);
    return NextResponse.json({
      message: "AI Failure",
      reply: "The AI is currently unavailable. Please try again later.",
      error: error.message
    }, { status: 500 });
  }
}
