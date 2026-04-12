# Nova Learn – Replit Environment

## Overview
A full-stack Next.js 16 + Express learning platform ("Nova Learn") with a MongoDB backend, AI integrations (Gemini, Groq, OpenAI), and a rich React frontend.

## Architecture
- **Frontend**: Next.js 16 (App Router, React 19), Tailwind CSS v4, Radix UI, shadcn/ui
- **Backend**: Express 5 server embedded alongside Next.js via a custom `server.mjs`
- **Database**: MongoDB via Mongoose (expects `MONGODB_URI` or local `mongodb://127.0.0.1:27017/nova_learn`)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt, cookies via `cookie-parser`
- **AI**: `@google/generative-ai`, `groq-sdk`, `openai`

## Project Structure
```
server.mjs            Custom Express+Next.js entry point
src/
  app/                Next.js App Router pages
  components/         React components
  controllers/        Express route controllers
  middleware/         Express middleware (auth, admin)
  models/             Mongoose schemas
  routes/             Express API routes (/api/*)
  lib/                Shared utilities
  utils/              Token generation etc.
  hooks/              React hooks
  store/              Zustand stores
next.config.mjs       Next.js config (allowedDevOrigins for Replit)
```

## Running the App
- **Dev**: `npm run dev` → starts `node server.mjs` on port 5000
- **Build**: `npm run build`
- **Production**: `npm run start` → `NODE_ENV=production node server.mjs`

## Replit-Specific Configuration
- Port: **5000** (required for Replit webview)
- Host: **0.0.0.0** (required for Replit proxy)
- `allowedDevOrigins` in `next.config.mjs` set to allow `*.replit.dev`
- Workflow: "Start application" → `npm run dev`

## Environment Variables Needed
- `MONGODB_URI` – MongoDB connection string (falls back to local if unset)
- `JWT_SECRET` – JWT signing secret (falls back to dev default if unset)
- `GOOGLE_API_KEY` / `GEMINI_API_KEY` – for Google Generative AI
- `GROQ_API_KEY` – for Groq AI
- `OPENAI_API_KEY` – for OpenAI

## Migration Notes (Vercel → Replit)
- Fixed all case-sensitive import paths (Linux filesystem): `Controllers/` → `controllers/`, `Models/` → `models/`, `Utils/` → `utils/`, `MiddleWare/` → `middleware/`
- Removed Windows-only `set NODE_ENV=production&&` syntax from npm start script
- Changed port from 3000 to 5000 and bound to `0.0.0.0`
- Removed duplicate `next.config.ts` (kept `next.config.mjs`)
- Removed deprecated `eslint` key from `next.config.mjs`
- Added `allowedDevOrigins` to allow Replit's proxy domain in dev mode
