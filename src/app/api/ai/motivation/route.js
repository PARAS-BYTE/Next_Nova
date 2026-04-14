import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const extractJSON = (text) => {
  try {
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    return null;
  }
};

export async function POST(req) {
  try {
    await dbConnect();
    
    // Auth Check
    const token = req.cookies.get('jwt')?.value || req.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return NextResponse.json({ message: "API key missing" }, { status: 500 });
    
    const client = new Mistral({ apiKey });
    
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

    const response = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" }
    });

    const therapyData = extractJSON(response.choices[0].message.content);
    
    if (!therapyData) throw new Error("Parse error");

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
