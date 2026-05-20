"use client";

import type { TodayBasisSection } from "@/lib/today-basis-helpers";

interface MyeongriBasisToggleProps {
  sections: TodayBasisSection[];
  className?: string;
}

/** 명리 근거 접기/펼치기 (일간·일진·합충) */
export default function MyeongriBasisToggle({ sections, className = "" }: MyeongriBasisToggleProps) {
  if (!sections.length) return null;

  return (
    <details
      className={`group rounded-2xl border border-[#D9C8C0] bg-[#FFFDF9] open:border-[#8B6F47]/40 open:bg-[#FFF8EE] ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-xs font-bold text-[#8B6F47]">명리 근거</p>
          <p className="mt-0.5 text-sm text-[#5A4E48]">
            왜 이렇게 읽히는지 · 일간·일주와 오늘 일진의 합·충
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#E2D7D0] bg-white px-2.5 py-1 text-[11px] font-bold text-[#8B6F47] transition group-open:rotate-180">
          ▼
        </span>
      </summary>

      <div className="space-y-4 border-t border-[#E2D7D0]/80 px-4 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-bold tracking-[0.06em] text-[#8B6F47]">{section.title}</p>
            <ul className="mt-2 space-y-2">
              {section.lines.map((line) => (
                <li key={`${section.title}-${line.slice(0, 24)}`} className="text-sm leading-relaxed text-[#4A403B]">
                  <span className="mr-1.5 font-bold text-[#8B6F47]">·</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="text-[11px] leading-relaxed text-[#8A7E78]">
          위 내용은 오늘 카드 문장·점수·시간대 해석의 계산 근거입니다. 명식 탭에서 더 자세한 트리거를 볼 수 있습니다.
        </p>
      </div>
    </details>
  );
}
