export const palette = {
  bg: "#080B16",
  bgDeep: "#04060F",
  bgCard: "#0F1221",
  bgCardHover: "#161A30",

  text: "#E2E8FF",
  text2: "#7B85B0",
  textMuted: "#4A5278",

  accent: "#7C3AED",
  accentSoft: "#9D6FF7",
  accentDeep: "#5B21B6",
  accentGlow: "rgba(124, 58, 237, 0.4)",

  cyan: "#06B6D4",
  cyanGlow: "rgba(6, 182, 212, 0.35)",
  cyanSoft: "#22D3EE",

  gold: "#F59E0B",
  goldGlow: "rgba(245, 158, 11, 0.4)",
  goldSoft: "#FCD34D",

  green: "#10B981",
  greenGlow: "rgba(16, 185, 129, 0.35)",

  red: "#EF4444",
  redGlow: "rgba(239, 68, 68, 0.35)",

  border: "#1E2340",
  borderGlow: "#2D3260",

  chartLine: "#7C3AED",
  chartFill: "rgba(124, 58, 237, 0.15)",
  chartGrid: "#1A1E35",

  progressTrack: "#1A1E35",
  progressFill: "#7C3AED",

  card: "#0F1221",
  cardHover: "#161A30",
  cardAlt: "#111527",
};

export const rankColors: Record<string, { color: string; glow: string; label: string }> = {
  Bronze: { color: "#CD7F32", glow: "rgba(205,127,50,0.4)", label: "Bronze" },
  Silver: { color: "#C0C0C0", glow: "rgba(192,192,192,0.4)", label: "Silver" },
  Gold: { color: "#F59E0B", glow: "rgba(245,158,11,0.5)", label: "Gold" },
  Platinum: { color: "#06B6D4", glow: "rgba(6,182,212,0.5)", label: "Platinum" },
  Diamond: { color: "#7C3AED", glow: "rgba(124,58,237,0.6)", label: "Diamond" },
};
