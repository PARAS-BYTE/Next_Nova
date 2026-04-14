import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const token = req.cookies.get('jwt')?.value;
    const { topic } = await req.json();

    if (!token) return NextResponse.json({ success: false }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await ChatMessage.deleteMany({ userId: decoded.userId, topic });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
