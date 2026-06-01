"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  exportReportAsPdf,
  exportReportAsPng,
  shareReportImage,
} from "@/lib/report-export";

type TodayReportToolbarProps = {
  saved: boolean;
  savePulse?: boolean;
  onSave: () => void;
  exportTargetRef: React.RefObject<HTMLDivElement | null>;
  exportFileName?: string;
};

/** Primary CTA 1개 + 더보기(공유·PDF·기록) — 디자인 v3.0 CTA 원칙 */
export default function TodayReportToolbar({
  saved,
  savePulse = false,
  onSave,
  exportTargetRef,
  exportFileName = "today-fortune",
}: TodayReportToolbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const runExport = useCallback(
    async (action: "png" | "share" | "pdf") => {
      const el = exportTargetRef.current;
      if (!el || busy) return;
      setBusy(action);
      setMenuOpen(false);
      try {
        if (action === "png") {
          await exportReportAsPng(el, exportFileName);
          showToast("이미지가 저장되었습니다.");
        } else if (action === "share") {
          const shared = await shareReportImage(el, exportFileName);
          if (!shared) {
            await exportReportAsPng(el, exportFileName);
            showToast("공유 대신 이미지로 저장했습니다.");
          }
        } else {
          await exportReportAsPdf(el, exportFileName);
          showToast("PDF가 저장되었습니다.");
        }
      } catch (err) {
        console.error(err);
        if (action === "share") {
          try {
            await navigator.clipboard.writeText(el.innerText || "");
            alert("이미지 공유가 어려워 텍스트를 복사했습니다.");
          } catch {
            alert("저장에 실패했어요. 스크린샷을 이용해 주세요.");
          }
        } else {
          alert("저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
      } finally {
        setBusy(null);
      }
    },
    [busy, exportFileName, exportTargetRef],
  );

  return (
    <>
      <div className="today-secretary__toolbar" data-pdf-ignore ref={menuRef}>
        <button
          type="button"
          onClick={onSave}
          className={`today-secretary__toolbar-btn today-secretary__toolbar-btn--primary touch-target ${savePulse ? "scale-105" : ""}`}
          aria-label={saved ? "오늘 리포트 저장됨" : "오늘 리포트 저장"}
        >
          {saved ? "저장됨 ✓" : "저장하기"}
        </button>

        <div className="today-secretary__toolbar-more">
          <button
            type="button"
            className="today-secretary__toolbar-btn today-secretary__toolbar-btn--icon touch-target"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="더보기 메뉴"
            disabled={Boolean(busy)}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden>⋯</span>
          </button>

          {menuOpen ? (
            <div className="today-secretary__toolbar-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="today-secretary__toolbar-menu-item"
                disabled={Boolean(busy)}
                onClick={() => runExport("png")}
              >
                {busy === "png" ? "저장 중…" : "이미지 저장"}
              </button>
              <button
                type="button"
                role="menuitem"
                className="today-secretary__toolbar-menu-item"
                disabled={Boolean(busy)}
                onClick={() => runExport("share")}
              >
                {busy === "share" ? "준비 중…" : "공유하기"}
              </button>
              <button
                type="button"
                role="menuitem"
                className="today-secretary__toolbar-menu-item"
                disabled={Boolean(busy)}
                onClick={() => runExport("pdf")}
              >
                {busy === "pdf" ? "PDF 생성 중…" : "PDF 저장"}
              </button>
              <Link
                href="/history"
                role="menuitem"
                className="today-secretary__toolbar-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                기록 보기
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div className="today-secretary__toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
