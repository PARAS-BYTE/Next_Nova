import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    await dbConnect();
    const token = request.cookies.get('jwt')?.value || request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      streakDays: user.streakDays,
      masteryScore: user.masteryScore,
      focusScore: user.focusScore,
      accuracyScore: user.accuracyScore,
      coins: user.coins,
      badges: user.badges.length,
      learningPreferences: user.learningPreferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ message: "Unauthorized request" }, { status: 401 });
  }
}
