import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY found in .env");
    return;
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
      console.log("Supported Models for generateContent:");
      generateModels.forEach(m => console.log(m.name));
    } else {
      console.log("Error or no models format:", data);
    }
  } catch(e) {
    console.error("Fetch error:", e);
  }
}

listModels();
