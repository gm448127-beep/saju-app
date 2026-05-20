import type { buildOverallComparison } from "@/lib/today-report-helpers";

type OverallComparison = NonNullable<ReturnType<typeof buildOverallComparison>>;

type OverallScoreDeltaProps = {
  comparison: OverallComparison | null;
  size?: "sm" | "md";
  className?: string;
};

/** 종합 점수 옆 어제 대비 변화(↑3 / ↓2) */
export default function OverallScoreDelta({
  comparison,
  size = "sm",
  className = "",
}: OverallScoreDeltaProps) {
  if (!comparison) return null;

  const { delta } = comparison;
  const sizeClass = size === "md" ? "text-xs px-2 py-0.5" : "text-[10px] px-1.5 py-0.5";

  if (delta === 0) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-[#E2D7D0] bg-white font-semibold text-[#8A7E78] ${sizeClass} ${className}`}
        title="어제와 동일"
      >
        —
      </span>
    );
  }

  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border font-bold ${sizeClass} ${
        up
          ? "border-[#C49A4A]/40 bg-[#FFF8EE] text-[#8B6F47]"
          : "border-[#E2D7D0] bg-white text-[#7A4A3D]"
      } ${className}`}
      title={`어제 ${comparison.previousOverall}점 → 오늘`}
    >
      <span aria-hidden>{up ? "↑" : "↓"}</span>
      {Math.abs(delta)}
    </span>
  );
}
