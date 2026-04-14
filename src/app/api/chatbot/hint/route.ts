import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { question, step } = await req.json();
    const token = req.cookies.get('jwt')?.value;

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return NextResponse.json({ hint: "AI Hint service is currently unavailable." });
    
    const client = new Mistral({ apiKey });

    let instructions = "";
    if (step === 1) instructions = "Provide a very subtle clue. Don't reveal any part of the answer, just point them in the right direction.";
    if (step === 2) instructions = "Provide a partial step or a formula they should use. Don't give the final result.";
    if (step === 3) instructions = "Provide the full step-by-step solution and explain the logic clearly.";

    const prompt = `Student Question: "${question}"\n\nTask: ${instructions}\n\nConstraint: Keep it under 100 words. Be encouraging.`;

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({ hint: chatResponse.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ hint: "Could not generate hint." }, { status: 500 });
  }
}
