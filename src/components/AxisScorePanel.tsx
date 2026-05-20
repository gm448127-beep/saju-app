import OverallScoreDelta from "@/components/OverallScoreDelta";
import type { buildOverallComparison } from "@/lib/today-report-helpers";

function ScoreBlocks({ score, size = "md" }: { score: number; size?: "md" | "sm" }) {
  const filled = Math.round((score / 100) * 8);
  const blockClass = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <div className="flex items-center justify-end gap-0.5" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span
          key={index}
          className={`rounded-sm ${blockClass} ${index < filled ? "bg-[#8B6F47]" : "bg-[#EDE4DC]"}`}
        />
      ))}
    </div>
  );
}

export type AxisScoreArea = {
  key: string;
  label: string;
  score: number;
};

type OverallComparison = ReturnType<typeof buildOverallComparison>;

type AxisScorePanelProps = {
  overall: number;
  areas: AxisScoreArea[];
  overallLabel?: string;
  overallComparison?: OverallComparison | null;
  showDelta?: boolean;
  className?: string;
};

/** 관계·결정·감정·균형 — 모바일 2×2, 데스크톱 리스트 */
export default function AxisScorePanel({
  overall,
  areas,
  overallLabel = "종합",
  overallComparison = null,
  showDelta = false,
  className = "",
}: AxisScorePanelProps) {
  return (
    <div
      className={`w-full rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-3 sm:px-4 sm:py-4 ${className}`}
    >
      <div className="border-b border-[#E2D7D0]/70 pb-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#8B6F47]">{overallLabel}</p>
            <div className="mt-1 flex flex-wrap items-end gap-2">
              <p className="text-3xl font-bold leading-none text-[#2F282B]">{overall}</p>
              {showDelta && <OverallScoreDelta comparison={overallComparison} size="md" />}
            </div>
          </div>
          <ScoreBlocks score={overall} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:space-y-2 xl:grid-cols-1">
        {areas.map((area) => (
          <div
            key={area.key}
            className="rounded-xl border border-[#E2D7D0]/80 bg-white/90 px-2.5 py-2 lg:grid lg:grid-cols-[42px_28px_1fr] lg:items-center lg:gap-2 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0"
          >
            <p className="text-[10px] font-semibold text-[#8A7E78] lg:text-xs lg:text-[#6B5E58]">{area.label}</p>
            <p className="text-lg font-bold leading-none text-[#8B6F47] lg:text-xs">{area.score}</p>
            <div className="mt-1 lg:mt-0">
              <ScoreBlocks score={area.score} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
