# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies ───
FROM node:20-alpine AS deps
WORKDIR /app

# Install build tools if needed
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ─── Stage 2: Build Next.js ───
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js frontend
RUN npm run build

# ─── Stage 3: Production Runner ───
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 novauser

# Copy built application and production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Grant proper permissions
RUN chown -R novauser:nodejs /app

USER novauser

EXPOSE 3000

# Start unified Express + Next.js + Socket.IO server
CMD ["node", "server.mjs"]
