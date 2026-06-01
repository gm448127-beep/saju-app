"use client";

import { stripScoreMentions } from "@/lib/today-score-ui-copy";

export interface TimeAdviceSlot {
  hour: string;
  range: string;
  score: number;
  label: string;
  keyword?: string;
}

export interface TimeAdviceItem {
  time: string;
  label?: string;
  hanjaRange?: string;
  range?: string;
  score: number;
  scoreLabel?: string;
  summary?: string;
  advice: string;
  goodFor?: string;
  caution?: string;
  peak?: TimeAdviceSlot;
  cautionSlot?: TimeAdviceSlot;
  slots?: TimeAdviceSlot[];
}

interface TimeAdviceSectionProps {
  items: TimeAdviceItem[];
}

function rhythmLabel(score: number) {
  if (score >= 80) return "강한 상승";
  if (score >= 70) return "상승";
  if (score >= 55) return "안정";
  if (score >= 40) return "주의";
  return "휴식";
}

export default function TimeAdviceSection({ items }: TimeAdviceSectionProps) {
  if (!items?.length) return null;

  const best = items.reduce((a, b) => (a.score > b.score ? a : b));
  const care = items.reduce((a, b) => (a.score < b.score ? a : b));

  return (
    <div className="card">
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h2 className="label mb-1">시간대별 운세</h2>
          <p className="text-xs text-[#8A7E78]">
            12시진 흐름을 오전·오후·저녁으로 묶어 하루의 리듬을 읽습니다.
          </p>
        </div>
        <p className="text-xs text-[#B8A78D]">하루 리듬</p>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
          <p className="mb-1 text-[10px] font-bold tracking-[0.08em] text-[#8B6F47]">가장 좋은 시간대</p>
          <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            {best.time}
          </p>
          <p className="mt-1 text-xs text-[#5A4E48]">
            {best.scoreLabel || rhythmLabel(best.score)}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
          <p className="mb-1 text-[10px] font-bold tracking-[0.08em] text-[#8B6F47]">살필 시간대</p>
          <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            {care.time}
          </p>
          <p className="mt-1 text-xs text-[#5A4E48]">
            {care.scoreLabel || rhythmLabel(care.score)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.time} className="rounded-xl border border-[#E2D7D0] bg-white p-4">
            <div className="mb-2">
              <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338]">
                {item.time}
                {item.hanjaRange ? <span className="ml-1 text-[#8B6F47]">{item.hanjaRange}</span> : null}
              </p>
              {item.range && <p className="mt-0.5 text-[11px] text-[#8A7E78]">{item.range}</p>}
              <p className="mt-1 text-xs font-semibold text-[#8B6F47]">
                {item.scoreLabel || rhythmLabel(item.score)}
              </p>
            </div>

            {item.summary && (
              <p className="mb-2 text-xs leading-relaxed text-[#3D3338]">
                {stripScoreMentions(item.summary)}
              </p>
            )}

            {(item.peak || item.cautionSlot) && (
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {item.peak && (
                  <div className="rounded-lg border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2">
                    <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">좋은 시진</p>
                    <p className="mt-1 text-xs text-[#5A4E48]">
                      {item.peak.hour} · {item.peak.range}시
                      {item.peak.label ? ` · ${item.peak.label}` : ""}
                    </p>
                  </div>
                )}
                {item.cautionSlot && (
                  <div className="rounded-lg border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2">
                    <p className="text-[10px] tracking-[0.08em] text-[#8B6F47]">주의 시진</p>
                    <p className="mt-1 text-xs text-[#5A4E48]">
                      {item.cautionSlot.hour} · {item.cautionSlot.range}시
                      {item.cautionSlot.label ? ` · ${item.cautionSlot.label}` : ""}
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm leading-relaxed text-[#5A4E48]">{stripScoreMentions(item.advice)}</p>

            {(item.goodFor || item.caution) && (
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#D9C8C0] pt-3">
                {item.goodFor && <p className="text-[11px] text-[#3D5838]">좋은 선택: {item.goodFor}</p>}
                {item.caution && <p className="text-[11px] text-[#583838]">주의: {item.caution}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
