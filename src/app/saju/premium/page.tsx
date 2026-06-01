"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import React from "react";
import { SAJU_PREMIUM_DEV_SAMPLE_REPORT } from "@/lib/saju-premium-dev-sample";

function PremiumPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockPreview = searchParams.get("mock") === "1";
  const debugPrompt = searchParams.get("debugPrompt") === "1";
  const forceRefresh = searchParams.get("refresh") === "1";

  const [report, setReport] = useState<string>("");
  const [reportMeta, setReportMeta] = useState<{
    promptVersion?: string;
    fromCache?: boolean;
    modelUsed?: string;
  } | null>(null);
  const [debugData, setDebugData] = useState<{
    systemPrompt: string;
    userPrompt: string;
    facts: string;
    fullPrompt: string;
    meta: { systemChars: number; userChars: number; factsChars: number; fullChars: number };
  } | null>(null);
  const [debugTab, setDebugTab] = useState<"facts" | "system" | "user" | "full">("facts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDevSample, setIsDevSample] = useState(false);

  useEffect(() => {
    if (mockPreview) {
      setIsDevSample(true);
      setReport(SAJU_PREMIUM_DEV_SAMPLE_REPORT);
      setLoading(false);
      setProgress(100);
      return;
    }

    const stored = localStorage.getItem("premiumSajuData");
    if (!stored) {
      setError("사주 데이터가 없습니다. 먼저 사주 분석을 진행해주세요.");
      setLoading(false);
      return;
    }

    let sajuData: any;
    try {
      sajuData = JSON.parse(stored);
    } catch {
      setError("데이터 파싱 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 800);

    fetch(
      `/api/saju/premium${debugPrompt ? "?debugPrompt=1" : forceRefresh ? "?refresh=1" : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sajuData,
          name: sajuData.userName || sajuData.name || localStorage.getItem("sajuUserName") || "회원",
          debugPrompt,
          refresh: forceRefresh,
        }),
      },
    )
      .then((res) => res.json())
      .then((data) => {
        clearInterval(progressInterval);
        setProgress(100);
        if (data.success && data.debug) {
          setDebugData({
            systemPrompt: data.systemPrompt,
            userPrompt: data.userPrompt,
            facts: data.facts,
            fullPrompt: data.fullPrompt,
            meta: data.meta,
          });
          setReport("");
          setReportMeta(null);
        } else if (data.success) {
          setReport(data.report);
          setReportMeta(data.meta ?? null);
        } else {
          setError(data.error || "리포트 생성에 실패했습니다.");
        }
        setLoading(false);
      })
      .catch(() => {
        clearInterval(progressInterval);
        setError("서버 연결에 실패했습니다.");
        setLoading(false);
      });

    return () => clearInterval(progressInterval);
  }, [mockPreview, debugPrompt, forceRefresh]);

  function renderMarkdown(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    lines.forEach((line, i) => {
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-bold mt-8 mb-3 pb-2 border-b border-[#E2D7D0]" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-[#8B6F47]">{line.replace("### ", "")}</h3>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-[#8B6F47] mt-1">•</span>
            <span className="text-sm text-[#5A4E48] leading-relaxed">{renderInline(line.replace("- ", ""))}</span>
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-[#5A4E48] leading-relaxed my-1">{renderInline(line)}</p>
        );
      }
    });
    return elements;
  }

  function renderInline(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-[#2F282B]">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_14px_40px_rgba(61,51,56,0.08)] p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-[#E2D7D0] bg-[#F5F0E8] text-2xl text-[#8B6F47]">命</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
            {debugPrompt ? "프롬프트 조립 중…" : "인생 설명서를 작성하는 중…"}
          </h2>
          <p className="text-sm text-[#8A7E78] mb-6">
            {debugPrompt ? "LLM 호출 없이 프롬프트 원문만 불러옵니다" : "원국을 당신 말로 번역하고 있어요"}
          </p>
          <div className="w-full bg-[#EDE4DC] rounded-full h-3 mb-4 overflow-hidden">
            <div className="h-3 rounded-full transition-all duration-500 bg-[#8B6F47]" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-[#8A7E78]">{Math.round(Math.min(progress, 99))}% 완료</p>
          <div className="mt-6 text-xs text-[#8A7E78]">
            <p>
              {progress < 25
                ? "원국 구조 읽는 중…"
                : progress < 50
                  ? "반복 패턴 번역 중…"
                  : progress < 75
                    ? "관계·일·돈·선택 장면 쓰는 중…"
                    : "비서 제안 정리 중…"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const debugText =
    debugData &&
    (debugTab === "facts"
      ? debugData.facts
      : debugTab === "system"
        ? debugData.systemPrompt
        : debugTab === "user"
          ? debugData.userPrompt
          : debugData.fullPrompt);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_14px_40px_rgba(61,51,56,0.08)] p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6CCC3] bg-[#FFF8F5] text-2xl text-[#8A4A3D]">!</div>
          <h2 className="text-lg font-bold mb-2 text-[#8A4A3D]">오류 발생</h2>
          <p className="text-sm text-[#5A4E48] mb-6">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => router.push("/saju")}
              className="bg-[#2F282B] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#463A40] transition"
            >
              사주 분석으로 돌아가기
            </button>
            {typeof window !== "undefined" &&
            (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? (
              <>
                <button
                  type="button"
                  onClick={() => router.push("/saju/premium?mock=1")}
                  className="border border-[#E2D7D0] bg-white px-6 py-2 rounded-xl text-sm font-semibold text-[#8B6F47] hover:bg-[#FFF8EE] transition"
                >
                  로컬 샘플 미리보기
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/saju/premium?debugPrompt=1")}
                  className="border border-[#C4A574] bg-[#FFF8EE] px-6 py-2 rounded-xl text-sm font-semibold text-[#8B6F47] hover:bg-[#FFF3E0] transition"
                >
                  프롬프트 디버그 (debugPrompt=1)
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="border-b border-[#E2D7D0] bg-white text-center py-6 px-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2D7D0] bg-[#F5F0E8] text-xl text-[#8B6F47]">命</div>
        <h1 className="text-2xl font-bold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {debugData ? "프리미엄 생성 프롬프트" : "평생 소장용 인생 설명서"}
        </h1>
        <p className="text-[#8A7E78] text-xs mt-1">
          {debugData ? "dev · LLM 호출 직전 원문 (API 호출 없음)" : "운명비서 · 사주 원국 번역"}
        </p>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        {isDevSample ? (
          <p className="mb-4 rounded-xl border border-dashed border-[#C4A574] bg-[#FFF8EE] px-4 py-3 text-center text-xs text-[#8B6F47]">
            로컬 미리보기 샘플입니다. 실제 AI 리포트는 사주 분석 후 생성됩니다.
          </p>
        ) : null}
        {debugData ? (
          <>
            <p className="mb-4 rounded-xl border border-dashed border-[#C4A574] bg-[#FFF8EE] px-4 py-3 text-center text-xs text-[#8B6F47]">
              facts {debugData.meta.factsChars}자 · system {debugData.meta.systemChars}자 · user{" "}
              {debugData.meta.userChars}자 · full {debugData.meta.fullChars}자
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {(
                [
                  ["facts", "facts (원국)"],
                  ["system", "systemPrompt"],
                  ["user", "userPrompt"],
                  ["full", "fullPrompt"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDebugTab(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    debugTab === key
                      ? "bg-[#2F282B] text-white"
                      : "border border-[#E2D7D0] bg-white text-[#8B6F47] hover:bg-[#FFF8EE]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <pre className="mb-6 max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-[#E2D7D0] bg-[#1E1A1C] p-4 text-xs leading-relaxed text-[#F5F0E8]">
              {debugText}
            </pre>
          </>
        ) : (
          <>
            {reportMeta ? (
              <p className="mb-4 rounded-xl border border-[#E2D7D0] bg-[#FAFAF8] px-4 py-3 text-center text-xs text-[#8A7E78]">
                프롬프트 {reportMeta.promptVersion ?? "?"} ·{" "}
                {reportMeta.fromCache ? "캐시 응답 (옛 문체일 수 있음)" : "새로 생성"} ·{" "}
                {reportMeta.modelUsed ?? "모델 미상"}
                {!forceRefresh ? (
                  <>
                    {" "}
                    ·{" "}
                    <button
                      type="button"
                      className="font-semibold text-[#8B6F47] underline"
                      onClick={() => router.push("/saju/premium?refresh=1")}
                    >
                      캐시 무시하고 다시 생성
                    </button>
                  </>
                ) : null}
              </p>
            ) : null}
            <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_10px_30px_rgba(61,51,56,0.05)] p-6 mb-6">
              {renderMarkdown(report)}
            </div>
          </>
        )}
        <div className="text-center mb-8">
          {!debugData ? (
            <p className="text-xs text-[#8A7E78] mb-4">
              본 설명서는 입력하신 사주 원국을 바탕으로 작성되었습니다. 참고용으로 활용해 주세요.
            </p>
          ) : null}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => router.push("/saju")}
              className="bg-[#2F282B] text-white px-8 py-3 rounded-xl font-bold shadow-[0_10px_24px_rgba(47,40,43,0.12)] hover:bg-[#463A40] transition"
              style={{ fontFamily: "Jua, sans-serif" }}
            >
              사주 분석으로 돌아가기
            </button>
            {debugData ? (
              <button
                type="button"
                onClick={() => router.push("/saju/premium")}
                className="border border-[#E2D7D0] bg-white px-6 py-3 rounded-xl text-sm font-semibold text-[#8B6F47] hover:bg-[#FFF8EE] transition"
              >
                실제 AI 생성하기
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center text-sm text-[#8A7E78]">
          불러오는 중…
        </div>
      }
    >
      <PremiumPageContent />
    </Suspense>
  );
}
