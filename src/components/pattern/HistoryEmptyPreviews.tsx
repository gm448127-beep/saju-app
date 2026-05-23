"use client";

import PatternLast7DaysStrip from "@/components/pattern/PatternLast7DaysStrip";
import {
  HISTORY_PREVIEW_COPY,
  LAST_7_DAYS_COPY,
  RECENT_RECORDS_COPY,
  RECURRING_TONES_COPY,
  SAVED_SENTENCES_COPY,
} from "@/lib/history-copy";
import { buildLast7DaysFlow } from "@/lib/today-pattern-helpers";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold tracking-[0.14em] text-[#8B6F47]/70">{children}</p>
  );
}

function PreviewShell({ children, hint }: { children: React.ReactNode; hint: string }) {
  return (
    <section
      className="rounded-[26px] border border-dashed border-[#E2D7D0] bg-[#FAFAF8]/90 px-5 py-5"
      aria-hidden="true"
    >
      {children}
      <p className="mt-4 text-xs leading-relaxed text-[#A09488]">{hint}</p>
    </section>
  );
}

/** 데이터 없을 때 섹션 구조 미리보기 */
export default function HistoryEmptyPreviews() {
  const last7 = buildLast7DaysFlow([]);

  return (
    <div className="space-y-4">
      <PreviewShell hint={HISTORY_PREVIEW_COPY.recurringTones}>
        <SectionLabel>{RECURRING_TONES_COPY.sectionLabel}</SectionLabel>
        <h2 className="mt-1 text-lg text-[#C4B8AE]" style={{ fontFamily: "Jua, sans-serif" }}>
          {RECURRING_TONES_COPY.headline}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {RECURRING_TONES_COPY.toneLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-[#EDE4DC] bg-[#F5F0EB] px-3 py-1.5 text-sm font-semibold text-[#C4B8AE]"
            >
              {label}
            </span>
          ))}
        </div>
      </PreviewShell>

      <PreviewShell hint={HISTORY_PREVIEW_COPY.last7Days}>
        <SectionLabel>{LAST_7_DAYS_COPY.sectionLabel}</SectionLabel>
        <h2 className="mt-1 text-lg text-[#C4B8AE]" style={{ fontFamily: "Jua, sans-serif" }}>
          {LAST_7_DAYS_COPY.headline}
        </h2>
        <div className="mt-4 opacity-80">
          <PatternLast7DaysStrip days={last7} />
          <p className="mt-5 text-center text-[11px] text-[#C4B8AE]">{LAST_7_DAYS_COPY.footerHint}</p>
        </div>
      </PreviewShell>

      <PreviewShell hint={HISTORY_PREVIEW_COPY.savedSentences}>
        <SectionLabel>{SAVED_SENTENCES_COPY.sectionLabel}</SectionLabel>
        <h2 className="mt-1 text-lg text-[#C4B8AE]" style={{ fontFamily: "Jua, sans-serif" }}>
          {SAVED_SENTENCES_COPY.headline}
        </h2>
        <div className="mt-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-[#F0EBE6] bg-[#FAF8F5] px-4 py-4 opacity-80">
              <p className="text-base text-[#D4C8BE]" style={{ fontFamily: "Jua, sans-serif" }}>
                &ldquo;{HISTORY_PREVIEW_COPY.sampleQuote}&rdquo;
              </p>
              <p className="mt-2 text-xs text-[#C4B8AE]">{HISTORY_PREVIEW_COPY.sampleDate}</p>
            </div>
          ))}
        </div>
      </PreviewShell>

      <PreviewShell hint={HISTORY_PREVIEW_COPY.recentRecords}>
        <SectionLabel>{RECENT_RECORDS_COPY.sectionLabel}</SectionLabel>
        <h2 className="mt-1 text-lg text-[#C4B8AE]" style={{ fontFamily: "Jua, sans-serif" }}>
          {RECENT_RECORDS_COPY.headline}
        </h2>
        <article className="mt-4 rounded-[24px] border border-[#F0EBE6] bg-white/60 px-5 py-4 opacity-80">
          <p className="text-xs font-bold text-[#C4B8AE]">05.19 (화) · 조율</p>
          <p className="mt-2 text-base text-[#D4C8BE]" style={{ fontFamily: "Jua, sans-serif" }}>
            {HISTORY_PREVIEW_COPY.sampleRecordLine}
          </p>
          <p className="mt-2 text-xs text-[#C4B8AE]">{HISTORY_PREVIEW_COPY.sampleScores}</p>
        </article>
      </PreviewShell>
    </div>
  );
}
