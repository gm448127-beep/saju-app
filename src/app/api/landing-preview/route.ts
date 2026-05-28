import { NextRequest, NextResponse } from "next/server";
import { getLandingCorsHeaders } from "@/lib/api-cors";

const PREVIEW_COOKIE = "landing_preview_used";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getLandingCorsHeaders(request),
  });
}

/** 랜딩용 — 오늘의 한 줄만 반환, 기기당 1회 */
export async function POST(request: NextRequest) {
  const corsHeaders = getLandingCorsHeaders(request);

  if (request.cookies.get(PREVIEW_COOKIE)?.value === "1") {
    return NextResponse.json(
      { error: "미리보기는 한 번만 볼 수 있어요. 매일 받으려면 이메일을 남겨주세요." },
      { status: 429, headers: corsHeaders },
    );
  }

  try {
    const body = await request.json();
    const origin = request.nextUrl.origin;
    const upstream = await fetch(`${origin}/api/today`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = (await upstream.json()) as {
      error?: string;
      dailyReport?: { sentence?: string; toneLabel?: string };
    };

    if (!upstream.ok) {
      return NextResponse.json(json, { status: upstream.status, headers: corsHeaders });
    }

    const sentence = json.dailyReport?.sentence?.trim();
    if (!sentence) {
      return NextResponse.json(
        { error: "결과를 만들지 못했어요." },
        { status: 500, headers: corsHeaders },
      );
    }

    const response = NextResponse.json(
      {
        toneLabel: json.dailyReport?.toneLabel?.trim() || "오늘의 결",
        sentence,
      },
      { headers: corsHeaders },
    );

    response.cookies.set(PREVIEW_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `미리보기 계산 중 오류: ${message}` },
      { status: 500, headers: corsHeaders },
    );
  }
}
