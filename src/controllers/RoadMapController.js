import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Roadmap from "../models/RoadMapSchema.js";
import { generateAIJson } from "../lib/aiService.js";

// ─── AUTH HELPER ───────────────────────────────────────────────
const authenticateUser = async (req) => {
  let token;
  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (req.headers.authorization?.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];
  if (!token) throw new Error("Not authorized, no token");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");
  return user;
};

//
// ─── CREATE ROADMAP ───────────────────────────────────────────
//
export const createRoadmap = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { title, modules } = req.body;
  if (!title) return res.status(400).json({ message: "Roadmap title is required" });
  const roadmap = await Roadmap.create({ title, modules, createdBy: user._id });
  res.status(201).json({ success: true, message: "Roadmap created successfully", roadmap });
});

//
// ─── GET ALL ROADMAPS ──────────────────────────────────────────
//
export const getAllRoadmaps = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const roadmaps = await Roadmap.find();
  res.status(200).json({ success: true, count: roadmaps.length, roadmaps });
});

//
// ─── GET SINGLE ROADMAP ───────────────────────────────────────
//
export const getRoadmapById = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  res.status(200).json({ success: true, roadmap });
});

//
// ─── UPDATE ROADMAP ────────────────────────────────────────────
//
export const updateRoadmap = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  const updatedRoadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json({ success: true, message: "Roadmap updated successfully", updatedRoadmap });
});

//
// ─── DELETE ROADMAP ─────────────────────────────────
//
export const deleteRoadmap = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const roadmap = await Roadmap.findById(req.params.id);
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  await roadmap.deleteOne();
  res.status(200).json({ success: true, message: "Roadmap deleted successfully" });
});

//
// ─── CREATE ROADMAP WITH AI ─────────────────────────────────────
//
export const createRoadmapWithAI = asyncHandler(async (req, res) => {
  const user = await authenticateUser(req);
  const { topic, level } = req.body;

  if (!topic || !level) return res.status(400).json({ success: false, message: "Topic and level are required" });

  try {
    const prompt = `
      You are an expert curriculum designer. Return ONLY pure JSON.
      Generate a deep learning roadmap for topic: "${topic}" and level: "${level}".
      Structure: { "title": "", "modules": [ { "name": "", "topics": [ { "name": "", "subtopics": [ { "name": "" } ] } ] } ] }
      Rules: 6 modules total, each with several topics and subtopics.
    `;

    const fallbackJson = {
      title: `${topic} Roadmap (${level})`,
      modules: [
        {
          name: `${topic} Foundations`,
          topics: [
            { name: `Introduction to ${topic}`, subtopics: [{ name: "Core Concepts" }, { name: "Setup and Tools" }] },
            { name: "Fundamental Principles", subtopics: [{ name: "Key Patterns" }, { name: "Best Practices" }] }
          ]
        },
        {
          name: `${topic} Intermediate Concepts`,
          topics: [
            { name: "Practical Implementation", subtopics: [{ name: "Hands-on Project" }] }
          ]
        }
      ]
    };

    const json = await generateAIJson({
      prompt,
      systemPrompt: "You are an expert curriculum designer.",
      fallback: fallbackJson,
      fastMode: true,
    });
    const roadmap = await Roadmap.create({
      title: json.title || `${topic} Roadmap (${level})`,
      modules: json.modules || [],
      createdBy: user._id,
    });

    return res.status(201).json({ success: true, message: "AI roadmap created successfully", roadmap });
  } catch (err) {
    console.error("❌ Roadmap AI Error:", err.message);
    const fallback = await Roadmap.create({
      title: `${topic} Roadmap (${level}) — Fallback`,
      modules: [{ name: `${topic} Basics`, topics: [{ name: `Intro to ${topic}`, subtopics: [{ name: "Overview" }] }] }],
      createdBy: user._id,
      fallback: true,
    });
    return res.status(200).json({ success: true, message: "AI overloaded — fallback created.", roadmap: fallback });
  }
});
