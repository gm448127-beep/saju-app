"use client";

import { TODAY_CARD_META } from "@/lib/today-page-copy";

type TodayHourlyTeaserProps = {
  onOpenDetail: () => void;
};

/** 12??�? 그�????�?? ??�?�?��???????� ??�? ????�?� ??�?복 방�? */
export default function TodayHourlyTeaser({ onOpenDetail }: TodayHourlyTeaserProps) {
  const meta = TODAY_CARD_META.hourly;

  return (
    <article className="rounded-[22px] border border-dashed border-[#D9C8C0] bg-[#FAF8F5] px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#8B6F47]">
            {meta.step ? `${meta.step}?��? · ` : ""}
            {meta.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">
            ??�?�??????�??��???�면, <strong className="font-semibold text-[#2F282B]">12??�? 그�????/strong>??
            ??�?� ??????�?조??<strong className="font-semibold text-[#2F282B]">?��?�??/strong> ???�??�?????�?�??
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDetail}
          className="shrink-0 rounded-xl bg-[#7B7355] px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110"
        >
          12??�? 보기 ??        </button>
      </div>
    </article>
  );
}
