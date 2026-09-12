import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import jwt from 'jsonwebtoken';
import { generateAIResponse } from '@/lib/aiService';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { question, step = 1 } = await req.json();
    const token = req.cookies.get('jwt')?.value || req.headers.get('authorization')?.split(' ')[1];

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    jwt.verify(token, process.env.JWT_SECRET || 'novalearn_dev_secret_key');

    let instructions = "";
    if (step === 1) instructions = "Provide a very subtle clue. Don't reveal any part of the answer, just point them in the right direction.";
    else if (step === 2) instructions = "Provide a partial step or a formula they should use. Don't give the final result.";
    else instructions = "Provide the full step-by-step solution and explain the logic clearly.";

    const prompt = `Student Question: "${question}"\n\nTask: ${instructions}\n\nConstraint: Keep it under 100 words. Be encouraging.`;

    const { text } = await generateAIResponse({
      prompt,
      systemPrompt: "You are an encouraging study tutor giving progressive hints.",
      fastMode: true,
    });

    return NextResponse.json({ hint: text });
  } catch (error: any) {
    return NextResponse.json({ hint: "Could not generate hint. Please try again." }, { status: 500 });
  }
}
