"use client";

import { getTodayDateKey, type DayFlowItem } from "@/lib/today-pattern-helpers";

const CIRCLE_SIZE = "h-10 w-10 sm:h-11 sm:w-11";

type PatternLast7DaysStripProps = {
  days: DayFlowItem[];
  todayDateKey?: string;
  onDayClick?: (dateKey: string) => void;
};

/** 최근 7일 — 동그라미 7개 가로 나열 */
export default function PatternLast7DaysStrip({
  days,
  todayDateKey,
  onDayClick,
}: PatternLast7DaysStripProps) {
  const todayKey = todayDateKey ?? getTodayDateKey();

  return (
    <div className="mt-5">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day) => {
          const isToday = day.dateKey === todayKey;
          const toneWord = day.hasRecord ? day.toneLabel.split(/\s+/)[0] : "";

          const circle = (
            <span
              className={`${CIRCLE_SIZE} block rounded-full transition ${
                day.hasRecord
                  ? "bg-[#2F282B]"
                  : "border border-[#E8D7C4] bg-[#F5EDE3]"
              } ${
                isToday
                  ? "ring-2 ring-[#8B6F47] ring-offset-2 ring-offset-[#FAF5ED]"
                  : ""
              }`}
            />
          );

          return (
            <div key={day.dateKey} className="flex min-w-0 flex-col items-center">
              {day.hasRecord && onDayClick ? (
                <button
                  type="button"
                  onClick={() => onDayClick(day.dateKey)}
                  className="flex flex-col items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#8B6F47]/50"
                  aria-label={`${day.shortDate} ${toneWord} 기록 보기`}
                >
                  {circle}
                </button>
              ) : (
                <div className="flex flex-col items-center" aria-hidden={!day.hasRecord}>
                  {circle}
                </div>
              )}

              <p
                className={`mt-2 min-h-[1rem] max-w-full truncate text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
                  day.hasRecord ? "text-[#2F282B]" : ""
                }`}
                aria-hidden={!day.hasRecord}
              >
                {day.hasRecord ? toneWord : ""}
              </p>

              <p
                className={`mt-0.5 text-[10px] font-semibold tabular-nums ${
                  isToday ? "text-[#8B6F47]" : "text-[#8A7E78]"
                }`}
              >
                {day.shortDate}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
