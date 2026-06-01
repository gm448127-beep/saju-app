"use client";

import { stripScoreMentions } from "@/lib/today-score-ui-copy";

type DetailedFortuneItem = {
  key: string;
  label: string;
  desc?: string;
  score: number;
  grade?: string;
  overview?: string;
  positive?: string;
  cautionText?: string;
  action?: string;
  avoid?: string;
  basis?: string;
};

export default function TodayDetailedFortuneReport({
  items,
  embedded = false,
}: {
  items?: DetailedFortuneItem[];
  embedded?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <div className={embedded ? "space-y-0" : "space-y-4"}>
      {items.map((item) => (
        <div
          key={item.key}
          className={
            embedded
              ? "px-0 py-0"
              : "rounded-2xl border border-[#E8D7C4] bg-[#FAF5ED] px-4 py-4 sm:px-5 sm:py-5"
          }
        >
          <div className="mb-4">
            <p className="text-xs tracking-[0.12em] text-[#B8A78D]">분야별 상세</p>
            <div className="mt-1">
              <h4 className="text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {item.label}
              </h4>
            </div>
            {item.desc && <p className="mt-1 text-xs text-[#8A7E78]">{item.desc}</p>}
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-[#5A4E48]">
            {item.overview && <p>{stripScoreMentions(item.overview)}</p>}
            {item.positive && (
              <div>
                <p className="mb-1 font-semibold text-[#3D5838]">긍정 요소</p>
                <p>{stripScoreMentions(item.positive)}</p>
              </div>
            )}
            {item.cautionText && (
              <div>
                <p className="mb-1 font-semibold text-[#7A4A3D]">주의 요소</p>
                <p>{stripScoreMentions(item.cautionText)}</p>
              </div>
            )}
            {(item.action || item.avoid) && (
              <div className="grid grid-cols-1 gap-3 border-t border-[#E2D7D0] pt-4 md:grid-cols-2">
                {item.action && (
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-[#8B6F47]">오늘의 행동</p>
                    <p className="mt-1">{stripScoreMentions(item.action)}</p>
                  </div>
                )}
                {item.avoid && (
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-[#8B6F47]">피하면 좋은 것</p>
                    <p className="mt-1">{stripScoreMentions(item.avoid)}</p>
                  </div>
                )}
              </div>
            )}
            {item.basis && (
              <p className="border-t border-[#E2D7D0] pt-4 text-xs text-[#8A7E78]">
                {stripScoreMentions(item.basis)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
