"use client";

import { useEffect, useId, useRef, useState } from "react";

type ToneDecisionChipProps = {
  label: string;
  tooltip?: string | null;
  className?: string;
  size?: "sm" | "md";
  variant?: "warm" | "white";
};

/** 오늘의 결 칩 — 탭 시 명리 근거 한 줄 툴팁 */
export default function ToneDecisionChip({
  label,
  tooltip,
  className = "",
  size = "sm",
  variant = "warm",
}: ToneDecisionChipProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sizeClass = size === "md" ? "text-xs" : "text-[10px]";
  const base =
    variant === "warm"
      ? "border-[#E2D7D0] bg-[#FFF8EE] text-[#8B6F47]"
      : "border-[#E2D7D0] bg-white text-[#8B6F47]";

  if (!tooltip) {
    return (
      <span
        className={`inline-flex rounded-full border px-2.5 py-0.5 font-bold ${sizeClass} ${base} ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={`${label}, 명리 근거 보기`}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-bold transition ${sizeClass} ${base} ${
          open ? "ring-2 ring-[#C49A4A]/45" : "hover:bg-white"
        }`}
      >
        {label}
        <span className="text-[9px] font-normal opacity-75" aria-hidden>
          ⓘ
        </span>
      </button>
      {open && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-0 top-full z-40 mt-2 max-w-[min(calc(100vw-2rem),22rem)] rounded-xl border border-[#E2D7D0] bg-[#2F282B] px-3 py-2.5 text-[11px] leading-relaxed text-[#F5EDE3] shadow-[0_12px_28px_rgba(47,40,43,0.22)]"
        >
          {tooltip}
        </div>
      )}
    </span>
  );
}
