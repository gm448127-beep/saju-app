"use client";

import { formatPayloadSummary, type TodayFetchPayload } from "@/lib/today-score-display";

type TodayScoreBasisBarProps = {
  overall: number;
  calcDateKey?: string;
  payload: TodayFetchPayload;
  stale?: boolean;
  onRecalculate?: () => void;
};

/** ??면??보이???��??�? ?��?� ??력·?��? 기�??��? ??�?? */
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
            {stale ? "??력??�?�??�???��?? · ??�?? ?��?????��? �?�?�" : "�?�?보이???��?? 기�?"}
          </p>
          <p className="mt-1 font-bold text-[#2F282B]">
            �?�?� <span className="text-2xl">{overall}</span>??            {calcDateKey ? (
              <span className="ml-2 text-xs font-semibold text-[#8A7E78]">
                (?��?� ?��? {calcDateKey})
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#6B5E58]">{formatPayloadSummary(payload)}</p>
          <p className="mt-1 text-[11px] text-[#8A7E78]">
            �?�?·결??·감??·균??과 �?�?� ?��????�?�? �?리 �?�?� 결과??�????
          </p>
        </div>
        {stale && onRecalculate && (
          <button
            type="button"
            onClick={onRecalculate}
            className="shrink-0 rounded-xl bg-[#7B7355] px-4 py-2 text-xs font-bold text-white"
          >
            ?��?? �?�?�
          </button>
        )}
      </div>
    </div>
  );
}
