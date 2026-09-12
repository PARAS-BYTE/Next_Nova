import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { generateAIJson } from '@/lib/aiService';

export async function POST(req) {
  try {
    await dbConnect();
    
    // Auth Check
    const token = req.cookies?.get?.('jwt')?.value || req.headers?.get?.('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'novalearn_dev_secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const context = {
      name: user.username,
      xp: user.xp,
      level: user.level,
      streak: user.streakDays,
      focusScore: user.focusScore,
      masteryScore: user.masteryScore
    };

    const prompt = `You are the "Nova AI Study Therapist". Analyze this profile: ${JSON.stringify(context)}. Provide structured advice in JSON format.
    {
      "burnoutLevel": "none"|"low"|"moderate"|"high"|"critical",
      "motivationalMessage": "under 60 words",
      "actionSuggestions": [string, string, string],
      "breakRecommendation": { "shouldTakeBreak": boolean, "breakDuration": number, "activity": string },
      "dailyGoal": "string"
    }`;

    const fallback = {
      burnoutLevel: "none",
      motivationalMessage: "Stay resilient! The stars are aligning for your next breakthrough.",
      actionSuggestions: ["Review progress", "Keep pushing forward", "Take a short rest"],
      breakRecommendation: { shouldTakeBreak: false, breakDuration: 0, activity: "None" },
      dailyGoal: "Keep learning"
    };

    const therapyData = await generateAIJson({
      prompt,
      systemPrompt: "You are an expert study motivation therapist. Return strictly valid JSON.",
      fallback,
      fastMode: true,
    });

    return NextResponse.json(therapyData);
  } catch (error) {
    return NextResponse.json({ 
      burnoutLevel: "none",
      motivationalMessage: "Stay resilient! The stars are aligning for your next breakthrough.",
      actionSuggestions: ["Review progress", "Keep pushing"],
      breakRecommendation: { shouldTakeBreak: false, breakDuration: 0, activity: "None" },
      dailyGoal: "Keep learning"
    });
  }
}
