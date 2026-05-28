import type { NextRequest } from "next/server";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/(www\.)?unmyeongbiseo\.kr$/,
  /^https:\/\/unmyeong-(mbti|restart|decision)(-[a-z0-9-]+)?\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

export function getLandingCorsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  if (!origin) return {};

  const allowed = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
  if (!allowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
