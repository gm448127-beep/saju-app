import type { DailyFortuneContent } from "@/lib/today-content-engine";

const FOCUS_AXES = [
  { key: "emotion", label: "감정", pick: (c: DailyFortuneContent) => c.axisScores.emotion },
  { key: "decision", label: "결정", pick: (c: DailyFortuneContent) => c.axisScores.decision },
  { key: "relation", label: "관계", pick: (c: DailyFortuneContent) => c.axisScores.relation },
  { key: "balance", label: "균형", pick: (c: DailyFortuneContent) => c.axisScores.balance },
] as const;

const FOCUS_INSIGHT: Record<
  (typeof FOCUS_AXES)[number]["label"],
  { lead: string; tip: string }
> = {
  감정: {
    lead: "감정 흐름이 가장 강하게 읽힙니다.",
    tip: "중요한 결정을 내리기 전, 감정을 먼저 정리해 보세요.",
  },
  결정: {
    lead: "결정의 무게가 오늘 중심에 있습니다.",
    tip: "큰 선택은 한 번 멈춘 뒤, 기준부터 다시 맞춰 보세요.",
  },
  관계: {
    lead: "관계의 온도가 먼저 움직입니다.",
    tip: "연락은 짧게, 마음의 선은 먼저 정리해 보세요.",
  },
  균형: {
    lead: "균형을 맞추는 시간이 필요합니다.",
    tip: "한 가지에만 몰아붙이지 않는 편이 좋습니다.",
  },
};

/** 내부 점수 → 10칸 흐름 강도(숫자 미표시) */
function scoreToFilledDots(score: number) {
  return Math.max(2, Math.min(10, Math.round(score / 10)));
}

function FocusDotRow({ label, filled }: { label: string; filled: number }) {
  return (
    <div className="flex items-center gap-3">
      <p className="w-10 shrink-0 text-xs font-semibold text-[#6B5E58]">{label}</p>
      <div className="flex flex-1 items-center gap-1" aria-hidden>
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full ${
              index < filled ? "bg-[#8B6F47]" : "bg-[#EDE4DC]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type HomeFocusAreasPanelProps = {
  content: DailyFortuneContent;
  isPersonalized?: boolean;
  className?: string;
};

/** 홈 — 점수 없이 오늘 집중 영역·흐름 문장 */
export default function HomeFocusAreasPanel({
  content,
  isPersonalized = false,
  className = "",
}: HomeFocusAreasPanelProps) {
  const areas = FOCUS_AXES.map((axis) => ({
    label: axis.label,
    strength: scoreToFilledDots(axis.pick(content)),
  })).sort((a, b) => b.strength - a.strength);

  const topLabel = areas[0]?.label ?? "감정";
  const insight = FOCUS_INSIGHT[topLabel];

  return (
    <div
      className={`rounded-2xl border border-[#E2D7D0] bg-white/80 px-4 py-4 ${className}`}
      aria-label="오늘 집중할 영역"
    >
      <p className="text-xs font-bold text-[#8B6F47]">
        {isPersonalized ? "오늘 집중할 영역" : "오늘 흐름의 무게 · 예시"}
      </p>
      {!isPersonalized ? (
        <p className="mt-1 text-[11px] leading-relaxed text-[#8A7E78]">
          숫자가 아니라, 오늘 어디에 힘이 실리는지 보여 드립니다.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {areas.map((area) => (
          <FocusDotRow key={area.label} label={area.label} filled={area.strength} />
        ))}
      </div>

      <div className="mt-4 border-t border-[#E2D7D0]/80 pt-4">
        <p className="text-xs font-bold text-[#8B6F47]">오늘의 흐름</p>
        <p className="mt-2 text-sm leading-relaxed text-[#4A403B]">{insight.lead}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[#5A4E48]">{insight.tip}</p>
      </div>
    </div>
  );
}
