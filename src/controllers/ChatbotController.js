import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatWithAI = async (req, res) => {
  // Version: 1.4 - Fixed by AGENT (Restored Model Fallbacks)
  try {
    const { message, context, history, mode = "standard", language = "english", voiceStyle = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY2;

    if (!apiKey) {
      return res.status(500).json({
        message: "AI service not configured",
        reply: "The AI companion is unavailable (API key missing in .env)."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Attempt the most current naming conventions for the Flash and Pro series
    // Fallback order: most likely to work first
    const modelNames = [
      "gemini-flash-latest",
      "gemini-flash-latest",
      "gemini-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-pro-latest"
    ];

    let lastError = null;
    let text = null;

    for (const modelName of modelNames) {
      try {
        console.log(`🤖 [Server] Summoning: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });

        let prompt = `You are NovaAI, a highly intelligent and supportive study companion.\n`;
        
        // Mode settings
        if (mode === "doubt") {
          prompt += "The student is asking a doubt. Provide a clear, step-by-step resolution.\n";
        } else if (mode === "simple") {
          prompt += "Explain the concept in extremely simple terms, as if to a beginner, and avoid complex jargon.\n";
        }

        // Language settings
        if (language === "hindi") {
          prompt += "Reply completely in Hindi. You may use Devanagari script.\n";
        } else if (language === "hinglish") {
          prompt += "Reply in a mix of Hindi and English written in the Latin alphabet (Hinglish). Example: 'Yeh concept samajhna bahot easy hai...'\n";
        } else {
          prompt += "Reply in English.\n";
        }

        // Voice Style
        if (voiceStyle) {
          prompt += "Adopt a highly conversational, friendly, spoken-voice tone. Use filler words and natural speech patterns as if speaking out loud.\n";
        }

        if (context) prompt += `Context: ${context}\n\n`;

        if (history && history.length > 0) {
          prompt += "--- Conversation History ---\n";
          for (const msg of history) {
            const role = msg.role === 'user' || msg.role === 'student' ? 'Student' : 'Assistant';
            const content = msg.content || msg.text || '';
            prompt += `${role}: ${content}\n`;
          }
          prompt += "----------------------------\n\n";
        }

        prompt += `Student: ${message}\nAssistant:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        
        if (text) {
          console.log(`✅ [Server] SUCCESS: ${modelName} responded.`);
          break;
        }
      } catch (err) {
        console.warn(`⚠️ [Server] REJECTED: ${modelName} - ${err.message}`);
        lastError = err;
        // Keep trying other models unless it's a structural 403 error
        if (err.message?.includes("API_KEY_INVALID") || (err.message?.includes("403") && !err.message.includes("quota"))) {
          break;
        }
        continue;
      }
    }

    if (!text) {
      throw lastError || new Error("All AI models in the realm are currently unresponsive.");
    }

    const cleanText = text.replace(/```markdown/g, '').replace(/```/g, '').trim();

    return res.json({
      success: true,
      reply: cleanText,
      message: cleanText
    });
  } catch (error) {
    console.error("❌ [Server] Chatbot Controller Critical Error:", error.message);
    
    let userReply = "The AI archives are sealed. Mana leakage detected.";
    if (error.message.includes("404")) userReply = "The AI model name was not recognized. Please check your API usage limits.";
    if (error.message.includes("403") || error.message.includes("API_KEY_INVALID")) userReply = "The AI seal is broken (API key issue).";
    if (error.message.includes("503") || error.message.includes("Service Unavailable")) userReply = "The AI realm is overcrowded (503). Retrying soon...";

    return res.status(500).json({
      message: "AI service failure",
      reply: userReply,
      error: error.message
    });
  }
};
