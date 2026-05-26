"use client";

import { TODAY_CARD_META } from "@/lib/today-page-copy";

type TodayHourlyTeaserProps = {
  onOpenDetail: () => void;
};

/** 12시진 그래프는 「자세히」 탭에 있음 — 요약 탭 중복 방지 */
export default function TodayHourlyTeaser({ onOpenDetail }: TodayHourlyTeaserProps) {
  const meta = TODAY_CARD_META.hourly;

  return (
    <article className="rounded-[22px] border border-dashed border-[#D9C8C0] bg-[#FAF8F5] px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#8B6F47]">
            {meta.step ? `${meta.step}단계 · ` : ""}
            {meta.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">
            태어난 시(時)를 넣었다면, <strong className="font-semibold text-[#2F282B]">12시진 그래프</strong>와
            「내 시(時)」 강조는 <strong className="font-semibold text-[#2F282B]">자세히</strong> 탭에서 볼 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDetail}
          className="shrink-0 rounded-xl bg-[#2F282B] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110"
        >
          12시진 보기 →
        </button>
      </div>
    </article>
  );
}
