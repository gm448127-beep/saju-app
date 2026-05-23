"use client";

import { formatPayloadSummary, type TodayFetchPayload } from "@/lib/today-score-display";

type TodayScoreBasisBarProps = {
  overall: number;
  calcDateKey?: string;
  payload: TodayFetchPayload;
  stale?: boolean;
  onRecalculate?: () => void;
};

/** 화면에 보이는 점수가 어떤 입력·날짜 기준인지 표시 */
export default function TodayScoreBasisBar({
  overall,
  calcDateKey,
  payload,
  stale,
  onRecalculate,
}: TodayScoreBasisBarProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        stale
          ? "border-amber-300/80 bg-amber-50"
          : "border-[#E8D7C4] bg-[#FFF8EE]"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#8B6F47]">
            {stale ? "입력이 바뀌었어요 · 아래 점수는 이전 계산" : "지금 보이는 점수 기준"}
          </p>
          <p className="mt-1 font-bold text-[#2F282B]">
            종합 <span className="text-2xl">{overall}</span>점
            {calcDateKey ? (
              <span className="ml-2 text-xs font-semibold text-[#8A7E78]">
                (운세 날짜 {calcDateKey})
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#6B5E58]">{formatPayloadSummary(payload)}</p>
          <p className="mt-1 text-[11px] text-[#8A7E78]">
            관계·결정·감정·균형과 종합 점수는 같은 명리 계산 결과입니다.
          </p>
        </div>
        {stale && onRecalculate && (
          <button
            type="button"
            onClick={onRecalculate}
            className="shrink-0 rounded-xl bg-[#2F282B] px-4 py-2 text-xs font-bold text-white"
          >
            다시 계산
          </button>
        )}
      </div>
    </div>
  );
}
