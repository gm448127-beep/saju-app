import { NextRequest, NextResponse } from "next/server";
import { buildSajuPremiumPromptBundle, SAJU_PREMIUM_PROMPT_VERSION } from "@/lib/saju-premium-prompts";
import { applyPremiumReportLint } from "@/lib/saju-premium-lint";
import { sanitizePremiumChartInput } from "@/lib/saju-premium-sanitize";
import { applySajuPremiumReportVoice } from "@/lib/saju-premium-voice";
import type { SajuPremiumChartData } from "@/lib/saju-premium-context";

// 같은 원국·같은 프롬프트 버전 반복 요청 방지
const cache = new Map<string, { report: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60;

const GENERATION_CONFIG = {
  temperature: 0.48,
  maxOutputTokens: 8192,
} as const;

function isDebugPromptRequest(request: NextRequest, body: { debugPrompt?: boolean }) {
  return (
    process.env.NODE_ENV === "development" &&
    (request.nextUrl.searchParams.get("debugPrompt") === "1" || body.debugPrompt === true)
  );
}

function shouldBypassCache(request: NextRequest, body: { noCache?: boolean; refresh?: boolean }) {
  return (
    request.nextUrl.searchParams.get("refresh") === "1" ||
    request.nextUrl.searchParams.get("noCache") === "1" ||
    body.noCache === true ||
    body.refresh === true
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sajuData, name, devMock, debugPrompt: bodyDebugPrompt, noCache, refresh } = body;

    if (!sajuData) {
      return NextResponse.json({ error: "사주 데이터가 없습니다." }, { status: 400 });
    }

    if (process.env.NODE_ENV === "development" && devMock === true) {
      const { SAJU_PREMIUM_DEV_SAMPLE_REPORT } = await import("@/lib/saju-premium-dev-sample");
      const { report: devReport, lint: devLint } = applyPremiumReportLint(
        SAJU_PREMIUM_DEV_SAMPLE_REPORT,
      );
      return NextResponse.json({
        success: true,
        report: devReport,
        devSample: true,
        meta: {
          promptVersion: SAJU_PREMIUM_PROMPT_VERSION,
          fromCache: false,
          lintOk: devLint.lintOk,
          lintViolations: devLint.lintViolations,
        },
      });
    }

    const chart = sanitizePremiumChartInput(sajuData as SajuPremiumChartData);
    const userName = name || chart.userName || chart.name || "회원";
    const debugPrompt = isDebugPromptRequest(request, { debugPrompt: bodyDebugPrompt });
    const bypassCache = shouldBypassCache(request, { noCache, refresh });

    const { systemPrompt, userPrompt, facts, fullPrompt } = buildSajuPremiumPromptBundle(
      chart,
      String(userName),
    );

    if (debugPrompt) {
      return NextResponse.json({
        success: true,
        debug: true,
        promptVersion: SAJU_PREMIUM_PROMPT_VERSION,
        systemPrompt,
        userPrompt,
        facts,
        fullPrompt,
        meta: {
          promptVersion: SAJU_PREMIUM_PROMPT_VERSION,
          systemChars: systemPrompt.length,
          userChars: userPrompt.length,
          factsChars: facts.length,
          fullChars: fullPrompt.length,
        },
      });
    }

    const cacheKey = JSON.stringify({
      v: SAJU_PREMIUM_PROMPT_VERSION,
      birthDate: chart.birthDate,
      gender: chart.gender,
      birthTime: chart.birthTime,
      dayGan: chart.dayGan,
      gyeok: chart.gyeok,
      userName,
    });

    if (!bypassCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        const cachedLint = applyPremiumReportLint(cached.report);
        return NextResponse.json({
          success: true,
          report: cachedLint.report,
          meta: {
            promptVersion: SAJU_PREMIUM_PROMPT_VERSION,
            fromCache: true,
            lintOk: cachedLint.lint.lintOk,
            lintViolations: cachedLint.lint.lintViolations,
          },
        });
      }
    }

    let report: string | null = null;
    let modelUsed: string | null = null;

    const geminiKey = process.env.GEMINI_API_KEY_PREMIUM || process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const models = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
      for (const model of models) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: GENERATION_CONFIG,
              }),
            },
          );
          if (response.ok) {
            const data = await response.json();
            report = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
            if (report) {
              modelUsed = model;
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }

    if (!report) {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (openRouterKey) {
        const openRouterModels = [
          "google/gemma-4-31b-it:free",
          "openai/gpt-oss-120b:free",
          "nvidia/nemotron-3-super:free",
          "openrouter/free",
        ];
        for (const openRouterModel of openRouterModels) {
          try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${openRouterKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://www.unmyeongbiseo.kr",
                "X-Title": "Unmyeong Biseo Saju Premium",
              },
              body: JSON.stringify({
                model: openRouterModel,
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
                max_tokens: GENERATION_CONFIG.maxOutputTokens,
                temperature: GENERATION_CONFIG.temperature,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              report = data.choices?.[0]?.message?.content ?? null;
              if (report) {
                modelUsed = openRouterModel;
                break;
              }
            }
          } catch {
            continue;
          }
        }
      }
    }

    if (!report) {
      return NextResponse.json(
        { error: "AI 분석 오류: 모든 API가 응답하지 않습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 },
      );
    }

    report = applySajuPremiumReportVoice(report);
    const { report: lintedReport, lint } = applyPremiumReportLint(report);
    report = lintedReport;

    cache.set(cacheKey, { report, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      report,
      meta: {
        promptVersion: SAJU_PREMIUM_PROMPT_VERSION,
        fromCache: false,
        modelUsed,
        voicePostProcessed: true,
        lintOk: lint.lintOk,
        lintViolations: lint.lintViolations,
      },
    });
  } catch (error) {
    console.error("Premium API Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "서버 오류: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    );
  }
}
