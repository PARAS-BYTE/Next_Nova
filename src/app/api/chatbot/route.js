import { Mistral } from "@mistralai/mistralai";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context, history, mode = "standard", language = "english", voiceStyle = false } = body;

    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        message: "AI service not configured",
        reply: "The Mistral seal is missing. Please check your Vercel Environment Variables."
      }, { status: 500 });
    }

    const client = new Mistral({ apiKey });
    const model = "mistral-large-latest";

    let systemPrompt = `You are NovaAI, a highly intelligent and supportive study companion.\n`;
    systemPrompt += `CRITICAL: Always use Markdown formatting for your responses. For any code snippets, use triple backticks with the appropriate language name (e.g., \`\`\`javascript). This is essential for rendering.\n`;
    
    if (mode === "doubt") systemPrompt += "Provide a clear, step-by-step resolution for the student's doubt.\n";
    if (mode === "simple") systemPrompt += "Explain in extremely simple terms, avoiding complex jargon.\n";

    if (language === "hindi") systemPrompt += "Reply completely in Hindi. You may use Devanagari script.\n";
    else if (language === "hinglish") systemPrompt += "Reply in a mix of Hindi and English (Hinglish).\n";
    else systemPrompt += "Reply in English.\n";

    if (voiceStyle) systemPrompt += "Adopt a conversational, friendly, spoken-voice tone.\n";
    if (context) systemPrompt += `Context: ${context}\n`;

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    if (history && history.length > 0) {
      history.forEach(msg => {
        messages.push({
          role: msg.role === 'user' || msg.role === 'student' ? 'user' : 'assistant',
          content: msg.content || msg.text || ''
        });
      });
    }

    messages.push({ role: "user", content: message });

    const chatResponse = await client.chat.complete({
      model: model,
      messages: messages,
    });

    const reply = chatResponse.choices[0].message.content.trim();

    return NextResponse.json({
      success: true,
      reply: reply,
      message: reply
    });
  } catch (error) {
    console.error("❌ [API] Mistral Error:", error.message);
    return NextResponse.json({
      message: "AI service failure",
      reply: "The Mistral winds are currently still. Mana leakage detected.",
      error: error.message
    }, { status: 500 });
  }
}
