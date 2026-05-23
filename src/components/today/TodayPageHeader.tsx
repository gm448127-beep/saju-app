"use client";

import MiinAvatar from "@/components/MiinAvatar";

type TodayPageHeaderProps = {
  title: string;
  dateLabel: string;
  subtitle?: string;
};

/** 오늘 운세 상단 헤더 — 우측 미인 캐릭터 (80px 원형) */
export default function TodayPageHeader({ title, dateLabel, subtitle }: TodayPageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#E8D7C4] pb-5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">오늘의 운세</p>
        <h1 className="mt-1 text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
          {title}
        </h1>
        <p className="mt-1 text-sm text-[#8A7E78]">{dateLabel}</p>
        {subtitle && (
          <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8A7E78]">{subtitle}</p>
        )}
      </div>
      <MiinAvatar size={80} priority />
    </header>
  );
}
