import Link from "next/link";
import PatternDots from "@/components/pattern/PatternDots";
import { HOME_PATTERN_COPY } from "@/lib/history-copy";
import { getTodayDateKey, type HomePatternCard as HomePatternCardData } from "@/lib/today-pattern-helpers";

type HomePatternCardProps = {
  data: HomePatternCardData;
};

/** 홈 하단 PATTERN 카드 — 패턴 인사이트·7일 흐름 미리보기 */
export default function HomePatternCard({ data }: HomePatternCardProps) {
  const { insight, subline, last7, topTones, stats, phase, emptyNudge, emptyCta } = data;
  const recordedCount = last7.filter((day) => day.hasRecord).length;
  const todayKey = getTodayDateKey();
  const isEmpty = phase === "empty";

  return (
    <Link
      href={data.href}
      className="group flex h-full flex-col rounded-[24px] border border-[#ECE3DC] bg-gradient-to-br from-[#FFFDF9] via-[#FFF8EE] to-[#F5EDE3] px-4 py-4 shadow-[0_10px_26px_rgba(61,51,56,0.06)] transition hover:-translate-y-0.5 hover:border-[#E8D7C4] hover:shadow-[0_14px_32px_rgba(139,111,71,0.12)]"
    >
      <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">PATTERN</p>
      <h2 className="mt-2 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
        나의 패턴
      </h2>

      <p
        className="mt-3 whitespace-pre-line text-base leading-snug text-[#2F282B] sm:text-lg"
        style={{ fontFamily: "Jua, sans-serif" }}
      >
        {insight}
      </p>
      {subline && <p className="mt-1.5 text-xs leading-relaxed text-[#6B5E58]">{subline}</p>}

      <div className="mt-4 rounded-2xl border border-[#E8D7C4]/80 bg-white/75 px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-[0.08em] text-[#8B6F47]">최근 7일</p>
          <p className="text-[10px] font-semibold text-[#8A7E78]">
            {recordedCount > 0 ? `${recordedCount}일 기록` : isEmpty ? "오늘 첫 점 대기" : "기록 대기"}
          </p>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {last7.map((day) => (
            <div key={day.dateKey} className="flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-[#A09488]">{day.weekday}</span>
              {day.hasRecord ? (
                <div className="flex flex-col items-center gap-0.5">
                  <PatternDots filled={day.dotsFilled} />
                  <span className="max-w-full truncate text-[8px] font-bold text-[#8B6F47]">
                    {day.toneLabel}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex h-[10px] w-full items-center justify-center rounded ${
                    isEmpty && day.dateKey === todayKey
                      ? "border border-dashed border-[#C49A4A]/60 bg-[#FFF8EE]"
                      : "bg-[#EDE4DC]/60"
                  }`}
                >
                  {isEmpty && day.dateKey === todayKey ? (
                    <span className="text-[7px] font-bold text-[#8B6F47]">시작</span>
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-[#D8D5D4]" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {topTones.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topTones.map((tone, index) => (
            <span
              key={tone.label}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                index === 0
                  ? "border-[#C49A4A]/50 bg-[#FFF8EE] text-[#8B6F47]"
                  : "border-[#E2D7D0] bg-white/90 text-[#5A4E48]"
              }`}
            >
              {tone.label}
              <span className="text-[10px] font-semibold text-[#8A7E78]">×{tone.count}</span>
            </span>
          ))}
        </div>
      )}

      {isEmpty && emptyNudge && (
        <div className="mt-3 rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
          <p className="text-sm font-semibold leading-snug text-[#3D3338]">{emptyNudge}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#6B5E58]">
            오늘의 결·점수가 자동으로 남고, 며칠이면 주간 패턴이 보입니다
          </p>
        </div>
      )}

      <p className="mt-auto pt-3 text-[10px] font-semibold text-[#8A7E78]">
        {isEmpty
          ? HOME_PATTERN_COPY.emptyStatsMuted
          : HOME_PATTERN_COPY.statsLine(stats.recordDays, stats.sajuCount, stats.todayCount)}
      </p>
      <p className="mt-1 text-xs font-bold text-[#8B6F47] transition group-hover:translate-x-0.5">
        {isEmpty && emptyCta ? `${emptyCta} ›` : "패턴 보기 ›"}
      </p>
    </Link>
  );
}
