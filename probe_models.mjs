import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hi");
    console.log(`SUCCESS ${modelName}: Generated response`);
  } catch(e) {
    console.log(`FAIL ${modelName}: ${e.status} ${e.statusText || e.message}`);
  }
}

async function run() {
  const models = [
    "gemini-2.0-flash-lite", 
    "gemini-flash-latest", 
    "gemini-pro-latest",
    "gemini-2.5-pro",
    "gemma-3-12b-it"
  ];
  for (const m of models) {
    await testModel(m);
  }
}
run();
