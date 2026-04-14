import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { answer, correctAnswer, difficulty } = await req.json();
    const token = req.cookies.get('jwt')?.value;

    if (!token) return NextResponse.json({ success: false }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    const isCorrect = answer === correctAnswer;
    let xpGained = 0;

    if (isCorrect) {
      xpGained = difficulty === "medium" ? 50 : 35;
      user.addXP(xpGained, "Daily AI Challenge Success");
      await user.save();
    }

    return NextResponse.json({ 
      isCorrect, 
      xpGained, 
      newTotalXp: user.xp 
    });

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
