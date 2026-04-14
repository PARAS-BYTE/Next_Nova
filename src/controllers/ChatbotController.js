import { Mistral } from "@mistralai/mistralai";

export const chatWithAI = async (req, res) => {
  // Version: 1.5 - Optimized for Mistral AI
  try {
    const { message, context, history, mode = "standard", language = "english", voiceStyle = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "AI service not configured",
        reply: "The Mistral seal is missing. Please check your .env file."
      });
    }

    const client = new Mistral({ apiKey });
    const model = "mistral-large-latest";

    console.log(`🌀 [Server] Consulting Mistral AI (${model})...`);


    let systemPrompt = `You are NovaAI, a highly intelligent and supportive study companion.\n`;
    systemPrompt += `CRITICAL: Always use Markdown formatting for your responses. For any code snippets, use triple backticks with the appropriate language name (e.g., \`\`\`javascript). This is essential for rendering.\n`;
    
    // Mode settings
    if (mode === "doubt") {
      systemPrompt += "The student is asking a doubt. Provide a clear, step-by-step resolution.\n";
    } else if (mode === "simple") {
      systemPrompt += "Explain the concept in extremely simple terms, as if to a beginner, and avoid complex jargon.\n";
    }

    // Language settings
    if (language === "hindi") {
      systemPrompt += "Reply completely in Hindi. You may use Devanagari script.\n";
    } else if (language === "hinglish") {
      systemPrompt += "Reply in a mix of Hindi and English written in the Latin alphabet (Hinglish). Example: 'Yeh concept samajhna bahot easy hai...'\n";
    } else {
      systemPrompt += "Reply in English.\n";
    }

    // Voice Style
    if (voiceStyle) {
      systemPrompt += "Adopt a highly conversational, friendly, spoken-voice tone. Use filler words and natural speech patterns as if speaking out loud.\n";
    }

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

    const text = chatResponse.choices[0].message.content;
    const cleanText = text.replace(/```markdown/g, '').replace(/```/g, '').trim();

    console.log(`✅ [Server] SUCCESS: Mistral responded.`);

    return res.json({
      success: true,
      reply: cleanText,
      message: cleanText
    });
  } catch (error) {
    console.error("❌ [Server] Mistral Controller Critical Error:", error.message);
    
    let userReply = "The Mistral winds are currently still. Mana leakage detected.";
    if (error.message.includes("401")) userReply = "The AI seal is broken (Invalid API key).";
    if (error.message.includes("429")) userReply = "The AI realm is overcrowded (Rate limit). Retrying soon...";

    return res.status(500).json({
      message: "AI service failure",
      reply: userReply,
      error: error.message
    });
  }
};
