import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('jwt')?.value;
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic') || "general";

    if (!token) return NextResponse.json({ messages: [] }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const messages = await ChatMessage.find({ userId: decoded.userId, topic })
      .sort({ timestamp: 1 })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
