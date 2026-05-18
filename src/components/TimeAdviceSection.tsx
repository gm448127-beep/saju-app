"use client";

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

function scoreColor(score: number) {
  if (score >= 70) return "#5FB88A";
  if (score >= 50) return "#E8A87C";
  return "#D87A8C";
}

function scoreLabel(score: number) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
          <p className="text-[10px] tracking-[0.08em] text-[#8B6F47] mb-1">가장 좋은 시간대</p>
          <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            {best.time}
          </p>
          <p className="text-xs text-[#5A4E48] mt-1">
            평균 {best.score}점 · {best.scoreLabel || scoreLabel(best.score)}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2D7D0] bg-white p-3">
          <p className="text-[10px] tracking-[0.08em] text-[#8B6F47] mb-1">살필 시간대</p>
          <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            {care.time}
          </p>
          <p className="text-xs text-[#5A4E48] mt-1">
            평균 {care.score}점 · {care.scoreLabel || scoreLabel(care.score)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.time} className="bg-white border border-[#E2D7D0] rounded-xl p-4">
            <div className="flex justify-between items-start gap-3 mb-2">
              <div>
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338]">
                  {item.time}
                  {item.hanjaRange ? <span className="ml-1 text-[#8B6F47]">{item.hanjaRange}</span> : null}
                </p>
                {item.range && <p className="text-[11px] text-[#8A7E78] mt-0.5">{item.range}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold" style={{ color: scoreColor(item.score) }}>
                  {item.score}점
                </p>
                <p className="text-[11px] text-[#8A7E78]">{item.scoreLabel || scoreLabel(item.score)}</p>
              </div>
            </div>

            <div className="h-2.5 rounded-full bg-white/80 overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.score}%`, backgroundColor: scoreColor(item.score) }}
              />
            </div>

            {item.summary && (
              <p className="text-xs text-[#3D3338] leading-relaxed mb-2">{item.summary}</p>
            )}

            {(item.peak || item.cautionSlot) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {item.peak && (
                  <div className="rounded-lg bg-[#FAF8F5] border border-[#E2D7D0] px-3 py-2">
                    <p className="text-[10px] text-[#8B6F47] tracking-[0.08em]">좋은 시진</p>
                    <p className="text-xs text-[#5A4E48] mt-1">
                      {item.peak.hour} · {item.peak.range}시 · {item.peak.score}점
                    </p>
                  </div>
                )}
                {item.cautionSlot && (
                  <div className="rounded-lg bg-[#FAF8F5] border border-[#E2D7D0] px-3 py-2">
                    <p className="text-[10px] text-[#8B6F47] tracking-[0.08em]">주의 시진</p>
                    <p className="text-xs text-[#5A4E48] mt-1">
                      {item.cautionSlot.hour} · {item.cautionSlot.range}시 · {item.cautionSlot.score}점
                    </p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-[#5A4E48] leading-relaxed">{item.advice}</p>

            {(item.goodFor || item.caution) && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-[#D9C8C0]">
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
