"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import React from "react";

export default function PremiumPage() {
  const router = useRouter();
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

    fetch("/api/saju/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sajuData, name: sajuData.userName || sajuData.name || localStorage.getItem("sajuUserName") || "회원" }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearInterval(progressInterval);
        setProgress(100);
        if (data.success) {
          setReport(data.report);
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
  }, []);

  function renderMarkdown(text: string) {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    lines.forEach((line, i) => {
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-xl font-bold mt-8 mb-3 pb-2 border-b-2 border-purple-200" style={{ fontFamily: "Jua, sans-serif", color: "#2D2B3D" }}>
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-purple-700">{line.replace("### ", "")}</h3>
        );
      } else if (line.startsWith("- ")) {
        elements.push(
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-purple-400 mt-1">•</span>
            <span className="text-sm text-gray-700 leading-relaxed">{renderInline(line.replace("- ", ""))}</span>
          </div>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-gray-700 leading-relaxed my-1">{renderInline(line)}</p>
        );
      }
    });
    return elements;
  }

  function renderInline(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FA] to-[#E8E0F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Jua, sans-serif", color: "#2D2B3D" }}>
            프리미엄 사주 리포트 생성 중...
          </h2>
          <p className="text-sm text-gray-500 mb-6">AI가 당신의 사주를 깊이 분석하고 있습니다</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-400 to-pink-400" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400">{Math.round(Math.min(progress, 99))}% 완료</p>
          <div className="mt-6 text-xs text-gray-400">
            <p>{progress < 20 ? "📊 사주 원국 분석 중..." : progress < 40 ? "🔍 오행·십성 심화 분석 중..." : progress < 60 ? "📅 2026년 운세 계산 중..." : progress < 80 ? "🔮 대운 흐름 해석 중..." : "✍️ 맞춤형 리포트 작성 중..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F3FA] to-[#E8E0F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-lg font-bold mb-2 text-red-500">오류 발생</h2>
          <p className="text-sm text-gray-600 mb-6">{error}</p>
          <button onClick={() => router.push("/saju")} className="bg-purple-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-600 transition">
            사주 분석으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FA] to-[#E8E0F0]">
      <div className="text-center py-6 px-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div className="text-3xl mb-1">👑</div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Jua, sans-serif" }}>프리미엄 사주 리포트</h1>
        <p className="text-purple-100 text-xs mt-1">AI 명리학 전문가의 심층 분석</p>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {renderMarkdown(report)}
        </div>
        <div className="text-center mb-8">
          <p className="text-xs text-gray-400 mb-4">본 리포트는 AI 명리학 분석을 기반으로 작성되었으며, 참고용으로 활용해주세요.</p>
          <button onClick={() => router.push("/saju")} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition" style={{ fontFamily: "Jua, sans-serif" }}>
            새로운 사주 분석하기
          </button>
        </div>
      </div>
    </div>
  );
}
