import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('jwt')?.value;
    if (!token) return NextResponse.json({ dashboard: null }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return NextResponse.json({ dashboard: null }, { status: 404 });

    const dashboard = {
      level: user.level,
      xp: user.xp,
      streakDays: user.streakDays,
      averageAccuracy: user.accuracyScore || 0,
      currentDifficulty: user.onboardingData?.skillLevel || "beginner",
      weakTopics: user.learningPreferences?.weakAreas || [],
      masteredTopics: user.learningPreferences?.preferredTopics || []
    };

    return NextResponse.json({ dashboard });
  } catch (error) {
    return NextResponse.json({ dashboard: null }, { status: 500 });
  }
}
