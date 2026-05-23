"use client";

import { TODAY_READING_STEPS } from "@/lib/today-page-copy";

export default function TodayReadingGuide() {
  return (
    <nav
      aria-label="오늘 운세 읽는 순서"
      className="rounded-2xl border border-[#8B6F47]/35 bg-gradient-to-br from-[#FFF8EE] to-[#FFFDF9] px-4 py-4"
    >
      <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">오늘 운세 · 읽는 순서</p>
      <p className="mt-1 text-sm text-[#5A4E48]">
        비슷한 카드가 많아도, <span className="font-semibold text-[#2F282B]">①→②→③</span>만 보면 오늘 핵심을
        잡을 수 있어요.
      </p>
      <ol className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
        {TODAY_READING_STEPS.map((item) => (
          <li key={item.id} className="flex flex-1 items-center gap-2.5 rounded-xl border border-[#E8D7C4] bg-white/90 px-3 py-2.5">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2F282B] text-xs font-bold text-[#F5F1EB]"
              aria-hidden
            >
              {item.step}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#2F282B]">{item.title}</p>
              <p className="text-[11px] text-[#8A7E78]">{item.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
