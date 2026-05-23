"use client";

import { TODAY_READING_STEPS } from "@/lib/today-page-copy";

export default function TodayReadingGuide() {
  return (
    <nav
      aria-label="오늘 운세 읽는 순서"
      className="rounded-[26px] border border-[#E8D7C4] bg-[#FAF5ED] px-4 py-4"
    >
      <p className="text-xs font-bold tracking-[0.12em] text-[#8B6F47]">읽는 순서</p>
      <ol className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TODAY_READING_STEPS.map((item) => (
          <li
            key={item.id}
            className="flex min-w-[7.5rem] shrink-0 items-center gap-2 rounded-xl border border-[#E8D7C4] bg-white/80 px-3 py-2"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F282B] text-[10px] font-bold text-[#F5F1EB]"
              aria-hidden
            >
              {item.step}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#2F282B]">{item.title}</p>
              <p className="text-[10px] text-[#8A7E78]">{item.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
