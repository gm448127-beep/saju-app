"use client";

import OverallScoreDelta from "@/components/OverallScoreDelta";
import ToneDecisionChip from "@/components/ToneDecisionChip";
import type { AxisScoreArea } from "@/components/AxisScorePanel";
import type { buildOverallComparison, buildYesterdayComparisonsFromRecords } from "@/lib/today-report-helpers";

type OverallComparison = ReturnType<typeof buildOverallComparison>;
type YesterdayComparison = ReturnType<typeof buildYesterdayComparisonsFromRecords>[number];

type TodayScoreHeroProps = {
  overall: number;
  status: string;
  areas: AxisScoreArea[];
  overallComparison: OverallComparison | null;
  comparisons: YesterdayComparison[];
  toneChipLabel: string;
  toneChipTooltip: string | null;
  grade?: string;
  sentence?: string;
  lead?: string;
  dateLabel?: string;
  detailExpanded: boolean;
  onToggleDetail: () => void;
  saved: boolean;
  onSave: () => void;
  onToggleCompare: () => void;
  compareOpen: boolean;
};

/** 모�?????�?� ?????��??·?��? �???�? ????면??모�? ??�?��?*/
export default function TodayScoreHero({
  overall,
  status,
  areas,
  overallComparison,
  comparisons,
  toneChipLabel,
  toneChipTooltip,
  grade,
  sentence,
  lead,
  dateLabel,
  detailExpanded,
  onToggleDetail,
  saved,
  onSave,
  onToggleCompare,
  compareOpen,
}: TodayScoreHeroProps) {
  return (
    <div className="rounded-[28px] border border-[#E8D7C4] bg-gradient-to-b from-[#FFFDF8] to-white px-4 py-4 shadow-[0_14px_38px_rgba(61,51,56,0.08)] max-lg:max-h-[min(92dvh,720px)] max-lg:overflow-y-auto">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">MY TODAY</p>
        <ToneDecisionChip label={toneChipLabel} tooltip={toneChipTooltip} variant="warm" />
        {grade && (
          <span className="rounded-full border border-[#E2D7D0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#8A7E78]">
            ?��? {grade}
          </span>
        )}
        {dateLabel && <span className="ml-auto text-[10px] font-semibold text-[#8A7E78]">{dateLabel}</span>}
      </div>

      {sentence && (
        <p
          className="mt-3 line-clamp-2 text-lg leading-snug text-[#2F282B]"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {sentence}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl border border-[#E2D7D0]/80 bg-white/90 px-4 py-3">
        <div>
          <p className="text-[10px] font-bold text-[#8B6F47]">�?�?�</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-5xl font-bold leading-none text-[#2F282B]">{overall}</p>
            <OverallScoreDelta comparison={overallComparison} size="md" />
          </div>
          <p className="mt-1 text-xs font-bold text-[#8B6F47]">{status}</p>
        </div>
        {overallComparison && (
          <div className="text-right">
            <p className="text-[10px] text-[#8A7E78]">?��?</p>
            <p className="text-xl font-bold text-[#A09488]">{overallComparison.previousOverall}</p>
            <p className="text-[10px] text-[#8A7E78]">???��?? {overall}</p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {areas.map((area) => (
          <div
            key={area.key}
            className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2.5 text-center"
          >
            <p className="text-[10px] font-semibold text-[#8A7E78]">{area.label}</p>
            <p className="mt-0.5 text-2xl font-bold leading-none text-[#8B6F47]">{area.score}</p>
          </div>
        ))}
      </div>

      {lead && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#5A4E48]">{lead}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {comparisons.map((item) => {
          const isUp = item.delta >= 0;
          return (
            <span
              key={item.key}
              className="inline-flex items-center gap-1 rounded-full border border-[#E2D7D0] bg-white px-2 py-1 text-[10px] font-semibold text-[#5A4E48]"
            >
              {item.label}
              <span className={isUp ? "text-[#8B6F47]" : "text-[#7A4A3D]"}>
                {isUp ? "?? : "??}
                {Math.abs(item.delta)}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onSave}
          className={`min-h-11 rounded-xl px-3 py-2.5 text-xs font-bold ${
            saved ? "border border-[#E8D7C4] bg-[#FFF8EE] text-[#8B6F47]" : "bg-[#7B7355] text-white"
          }`}
        >
          {saved ? "???�됨 ?? : "????}
        </button>
        <button
          type="button"
          onClick={onToggleCompare}
          className={`min-h-11 rounded-xl border px-3 py-2.5 text-xs font-bold ${
            compareOpen
              ? "border-[#8B6F47] bg-[#FFF8EE] text-[#8B6F47]"
              : "border-[#D9C8C0] bg-white text-[#2F282B]"
          }`}
        >
          ?��? �?교
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleDetail}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#C49A4A]/50 bg-[#FFF8EE] px-4 py-3 text-sm font-bold text-[#8B6F47]"
        aria-expanded={detailExpanded}
      >
        {detailExpanded ? "?��?? ??면?��? ??기" : "5??리포??· ?��?� ?��? ?��?�?}
        <span className="text-base leading-none" aria-hidden>
          {detailExpanded ? "?? : "??}
        </span>
      </button>
    </div>
  );
}
