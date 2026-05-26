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
      setError("���� �����Ͱ� �����ϴ�. ���� ���� �м��� �������ּ���.");
      setLoading(false);
      return;
    }

    let sajuData: any;
    try {
      sajuData = JSON.parse(stored);
    } catch {
      setError("������ �Ľ� ������ �߻��߽��ϴ�.");
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
      body: JSON.stringify({ sajuData, name: sajuData.userName || sajuData.name || localStorage.getItem("sajuUserName") || "ȸ��" }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearInterval(progressInterval);
        setProgress(100);
        if (data.success) {
          setReport(data.report);
        } else {
          setError(data.error || "����Ʈ ������ �����߽��ϴ�.");
        }
        setLoading(false);
      })
      .catch(() => {
        clearInterval(progressInterval);
        setError("���� ���ῡ �����߽��ϴ�.");
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
            <span className="text-[#8B6F47] mt-1">?</span>
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_14px_40px_rgba(61,51,56,0.08)] p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] text-2xl text-[#8B6F47]">٤</div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
            �����̾� ���� ����Ʈ ���� ��...
          </h2>
          <p className="text-sm text-[#8A7E78] mb-6">AI�� ����� ���ָ� ���� �м��ϰ� �ֽ��ϴ�</p>
          <div className="w-full bg-[#EDE4DC] rounded-full h-3 mb-4 overflow-hidden">
            <div className="h-3 rounded-full transition-all duration-500 bg-[#8B6F47]" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="text-xs text-[#8A7E78]">{Math.round(Math.min(progress, 99))}% �Ϸ�</p>
          <div className="mt-6 text-xs text-[#8A7E78]">
            <p>{progress < 20 ? "���� ���� �м� ��..." : progress < 40 ? "���ࡤ�ʼ� ��ȭ �м� ��..." : progress < 60 ? "2026�� � ��� ��..." : progress < 80 ? "��� �帧 �ؼ� ��..." : "������ ����Ʈ �ۼ� ��..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_14px_40px_rgba(61,51,56,0.08)] p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E6CCC3] bg-[#FFF8F5] text-2xl text-[#8A4A3D]">!</div>
          <h2 className="text-lg font-bold mb-2 text-[#8A4A3D]">���� �߻�</h2>
          <p className="text-sm text-[#5A4E48] mb-6">{error}</p>
          <button onClick={() => router.push("/saju")} className="bg-[#7B7355] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#6A6349] transition">
            ���� �м����� ���ư���
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <div className="border-b border-[#E2D7D0] bg-white text-center py-6 px-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] text-xl text-[#8B6F47]">٤</div>
        <h1 className="text-2xl font-bold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>�����̾� ���� ����Ʈ</h1>
        <p className="text-[#8A7E78] text-xs mt-1">AI ������ �������� ���� �м�</p>
      </div>
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white border border-[#E2D7D0] rounded-2xl shadow-[0_10px_30px_rgba(61,51,56,0.05)] p-6 mb-6">
          {renderMarkdown(report)}
        </div>
        <div className="text-center mb-8">
          <p className="text-xs text-[#8A7E78] mb-4">�� ����Ʈ�� AI ������ �м��� ������� �ۼ��Ǿ�����, ���������� Ȱ�����ּ���.</p>
          <button onClick={() => router.push("/saju")} className="bg-[#7B7355] text-white px-8 py-3 rounded-xl font-bold shadow-[0_10px_24px_rgba(47,40,43,0.12)] hover:bg-[#6A6349] transition" style={{ fontFamily: "Jua, sans-serif" }}>
            ���ο� ���� �м��ϱ�
          </button>
        </div>
      </div>
    </div>
  );
}
