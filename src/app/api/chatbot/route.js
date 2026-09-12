import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/aiService';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context, history, mode = "standard", language = "english", voiceStyle = false } = body;

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    let systemPrompt = `You are NovaAI, a highly intelligent and supportive study companion.\n`;
    systemPrompt += `CRITICAL: Always use Markdown formatting for your responses. For any code snippets, use triple backticks with the appropriate language name (e.g., \`\`\`javascript). This is essential for rendering.\n`;
    
    if (mode === "doubt") systemPrompt += "Provide a clear, step-by-step resolution for the student's doubt.\n";
    if (mode === "simple") systemPrompt += "Explain in extremely simple terms, avoiding complex jargon.\n";

    if (language === "hindi") systemPrompt += "Reply completely in Hindi. You may use Devanagari script.\n";
    else if (language === "hinglish") systemPrompt += "Reply in a mix of Hindi and English (Hinglish).\n";
    else systemPrompt += "Reply in English.\n";

    if (voiceStyle) systemPrompt += "Adopt a conversational, friendly, spoken-voice tone.\n";
    if (context) systemPrompt += `Context: ${context}\n`;

    const formattedHistory = [];
    if (history && history.length > 0) {
      history.forEach(msg => {
        formattedHistory.push({
          role: msg.role === 'user' || msg.role === 'student' ? 'user' : 'assistant',
          content: msg.content || msg.text || ''
        });
      });
    }

    const { text, provider, model } = await generateAIResponse({
      prompt: message,
      systemPrompt,
      messages: formattedHistory,
      fastMode: true,
    });

    return NextResponse.json({
      success: true,
      reply: text,
      message: text,
      provider,
      model,
    });
  } catch (error) {
    console.error("❌ [API] AI Route Error:", error.message);
    return NextResponse.json({
      message: "AI service failure",
      reply: "The AI realm is currently re-aligning. Please try again in a moment.",
      error: error.message
    }, { status: 500 });
  }
}
