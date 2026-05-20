"use client";

import { TODAY_EMPTY_COPY } from "@/lib/history-copy";

interface TodayEmptyStateProps {
  dateLabel: string;
  toneLabel: string;
  sentence: string;
  onScrollToForm?: () => void;
}

export default function TodayEmptyState({
  dateLabel,
  toneLabel,
  sentence,
  onScrollToForm,
}: TodayEmptyStateProps) {
  return (
    <section
      aria-label="오늘의 운세 안내"
      className="overflow-hidden rounded-[28px] border border-[#E8D7C4] bg-[#FFFDF8] shadow-[0_14px_38px_rgba(61,51,56,0.06)]"
    >
      <div className="border-b border-[#E8D7C4]/80 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#E2D7D0] bg-white px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#8B6F47]">
            TODAY
          </span>
          <span className="rounded-full border border-[#D9C8C0] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#6B5E58]">
            {TODAY_EMPTY_COPY.badgeCommon}
          </span>
        </div>
        <h1 className="mt-3 text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
          {TODAY_EMPTY_COPY.title}
        </h1>
        <p className="mt-1 text-sm text-[#8A7E78]">{dateLabel}</p>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="rounded-2xl border-2 border-[#C49A4A]/50 bg-[#FFF8EE] px-4 py-4">
          <p className="text-base font-bold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            {TODAY_EMPTY_COPY.ctaLead}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#8B6F47]">→ {TODAY_EMPTY_COPY.ctaAction}</p>
          <button
            type="button"
            onClick={onScrollToForm}
            className="mt-4 w-full rounded-2xl bg-[#2F282B] px-4 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {TODAY_EMPTY_COPY.ctaButton}
          </button>
        </div>

        <div className="rounded-2xl border border-[#E2D7D0] bg-white/90 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#8B6F47]">
            <span className="rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-2 py-0.5">
              오늘의 결 · {toneLabel}
            </span>
            <span className="text-[#8A7E78] font-semibold">{TODAY_EMPTY_COPY.badgeTodayAll}</span>
          </div>
          <p className="mt-3 text-[11px] font-bold text-[#8B6F47]">{TODAY_EMPTY_COPY.previewOneLine}</p>
          <p className="mt-2 text-lg leading-snug text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            {sentence}
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#8A7E78]">{TODAY_EMPTY_COPY.afterInputNote}</p>
        </div>
      </div>
    </section>
  );
}
