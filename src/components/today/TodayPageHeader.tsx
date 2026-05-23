"use client";

import Image from "next/image";
import { useState } from "react";

const AVATAR_SIZE_PX = 80;

function MiinHeaderAvatar() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E8D7C4] bg-[#F5EDE3] shadow-[0_4px_14px_rgba(139,111,71,0.12)]"
        role="img"
        aria-label="미인"
      >
        <span
          className="text-[2rem] font-bold leading-none text-[#8B6F47]"
          style={{ fontFamily: "Jua, sans-serif" }}
          aria-hidden
        >
          命
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/miin.png"
      alt="미인"
      width={AVATAR_SIZE_PX}
      height={AVATAR_SIZE_PX}
      className="h-20 w-20 shrink-0 rounded-full border border-[#E8D7C4] bg-[#FFF8EE] object-cover object-center shadow-[0_4px_14px_rgba(139,111,71,0.15)]"
      priority
      onError={() => setImageFailed(true)}
    />
  );
}

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
      <MiinHeaderAvatar />
    </header>
  );
}
