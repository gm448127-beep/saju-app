"use client";

import { useRef, useState } from "react";
import TodayShareCard from "@/components/TodayShareCard";
import type { DailyFortuneContent } from "@/lib/today-content-engine";

interface TodayStoryShareButtonProps {
  report: DailyFortuneContent;
  dateLabel: string;
  displayName?: string;
  fileName?: string;
}

/** 9:16 스토리 이미지 저장·공유 (카카오·인스타 스토리) */
export default function TodayStoryShareButton({
  report,
  dateLabel,
  displayName,
  fileName = "unmyeong-today-story",
}: TodayStoryShareButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);

  const captureStory = async () => {
    if (!cardRef.current || busy) return null;
    const { toBlob, toPng } = await import("html-to-image");
    const node = cardRef.current;

    try {
      const blob = await toBlob(node, {
        backgroundColor: "#FFFDF8",
        pixelRatio: 3,
        cacheBust: true,
        width: 360,
        height: 640,
      });
      if (blob) return blob;
    } catch {
      /* fallback */
    }

    const dataUrl = await toPng(node, {
      backgroundColor: "#FFFDF8",
      pixelRatio: 3,
      cacheBust: true,
      width: 360,
      height: 640,
    });
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const blob = await captureStory();
      if (!blob) throw new Error("capture failed");
      downloadBlob(blob);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch {
      alert("스토리 이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await captureStory();
      if (!blob) throw new Error("capture failed");

      const file = new File([blob], `${fileName}.png`, { type: "image/png" });
      const shareData = {
        title: "운명비서 – 오늘의 흐름",
        text: report.sentence,
        files: [file],
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        return;
      }
      downloadBlob(blob);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        alert("공유에 실패했어요. 이미지 저장으로 시도해주세요.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className="pointer-events-none fixed left-[-9999px] top-0 z-[-1]"
        aria-hidden
      >
        <TodayShareCard report={report} dateLabel={dateLabel} displayName={displayName} />
      </div>

      <div className="flex flex-1 gap-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="flex flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-[#D9C8C0] bg-[#FFF8EE] px-2 py-2 text-xs font-bold text-[#2F282B] transition hover:bg-white disabled:opacity-50 sm:px-3 sm:py-2.5 sm:text-sm"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {busy ? "만드는 중…" : "스토리 저장"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className="flex flex-1 items-center justify-center whitespace-nowrap rounded-xl border border-[#8B6F47] bg-[#8B6F47] px-2 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50 sm:px-3 sm:py-2.5 sm:text-sm"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {busy ? "준비 중…" : "스토리 공유"}
        </button>
      </div>

      {toast && (
        <div
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-[#3D3338] px-6 py-3 text-sm text-white"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          스토리 이미지가 저장되었습니다.
        </div>
      )}
    </>
  );
}
