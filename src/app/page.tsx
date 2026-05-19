"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HomeResultPreview from "@/components/HomeResultPreview";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import { getSajuHistory, getTarotFavorites } from "@/lib/archive-storage";
import { getUnifiedArchiveStats, getTodayHistory } from "@/lib/today-report-helpers";

const FEATURE_SLIDES = [
  {
    href: "/saju",
    headline: "타고난 흐름을 깊이 읽습니다",
    subcopy: "사주에 담긴 기질과 방향을\n차분한 리포트로 정리합니다",
    badge: "01",
    motif: "命",
    bg: "linear-gradient(135deg, #FFFDF9 0%, #F5EDE3 56%, #E8D7C4 100%)",
    accent: "#8B6F47",
  },
  {
    href: "/today",
    headline: "오늘의 결을 깊이 읽습니다",
    subcopy: "하루의 흐름과 움직임을\n한 장의 리포트로 정리합니다",
    badge: "02",
    motif: "運",
    bg: "linear-gradient(135deg, #FFFDF8 0%, #F3E8D5 56%, #E6CF9F 100%)",
    accent: "#B89968",
  },
  {
    href: "/tojeong",
    headline: "한 해의 흐름을 깊이 읽습니다",
    subcopy: "올해에 담긴 결과 방향을\n차분한 리포트로 정리합니다",
    badge: "03",
    motif: "年",
    bg: "linear-gradient(135deg, #FCFBF7 0%, #EEE7DC 58%, #D9C8B6 100%)",
    accent: "#6B5E58",
  },
  {
    href: "/compatibility",
    headline: "두 사람의 흐름을 읽습니다",
    subcopy: "관계의 온도와 결을\n차분한 리포트로 정리합니다",
    badge: "04",
    motif: "緣",
    bg: "linear-gradient(135deg, #FFF9F6 0%, #F1E0DA 58%, #E3C8BE 100%)",
    accent: "#9A685B",
  },
  {
    href: "/tarot",
    headline: "마음의 결을 깊이 읽습니다",
    subcopy: "카드가 비추는 흐름을\n짧은 리포트로 정리합니다",
    badge: "05",
    motif: "兆",
    bg: "linear-gradient(135deg, #FBFAFF 0%, #EDE6F4 58%, #D8C8E6 100%)",
    accent: "#7F6A8E",
  },
];

function buildLiveCards(
  dailyContent: ReturnType<typeof buildDailyFortuneContent>,
  historyStats: { todayCount: number; dayCount: number; sajuCount: number; tarotCount: number },
) {
  const totalSaved = historyStats.todayCount + historyStats.sajuCount + historyStats.tarotCount;
  const archiveText =
    totalSaved > 0
      ? `지금까지 ${historyStats.dayCount}일,\n기록 ${totalSaved}건이 쌓였습니다`
      : "오늘의 리포트를 읽는 순간\n기록은 조용히 이어집니다";

  return [
  {
    title: "오늘의 한 줄",
    eyebrow: "TODAY",
    text: dailyContent.sentence,
    cta: "자세히 보기",
    cardClass: "border-[#E8D7C4] bg-[#FFF8EE]",
    href: "/today",
  },
  {
    title: "이번 주의 흐름",
    eyebrow: "WEEKLY",
    text: `이번 주의 중심은 ${dailyContent.weekly.keyDay}에\n가장 또렷하게 놓여 있습니다`,
    trend: dailyContent.weekly.trend,
    keyDay: dailyContent.weekly.keyDay,
    cta: "주간 보기",
    cardClass: "border-[#E2D7D0] bg-white",
    graphClass: "bg-[#C49A4A]",
    href: "/today",
  },
  {
    title: "쌓인 흐름",
    eyebrow: "ARCHIVE",
    text: archiveText,
    cta: "기록 보기",
    cardClass: "border-[#ECE3DC] bg-[#FFFDF9]",
    stats: [`사주 리포트 ${historyStats.sajuCount}건`, `오늘의 흐름 ${historyStats.todayCount}건`],
    href: "/history",
  },
  {
    title: "오늘의 추천",
    eyebrow: "PICK",
    text: "걸리는 마음이 남는다면\nAI상담으로 더 깊게 읽어보세요",
    cta: "상담 열기",
    cardClass: "border-[#C49A4A] bg-white",
    href: dailyContent.recommendation.href,
  },
  ];
}

const DIFFERENCE_POINTS = [
  ["내 사주를 기준으로", "매일의 흐름을 다르게 읽습니다"],
  ["어려운 명리의 언어를", "이해되는 문장으로 풀어냅니다"],
  ["하루의 해석이 쌓일수록", "나의 흐름은 더 선명해집니다"],
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [historyStats, setHistoryStats] = useState({ todayCount: 0, dayCount: 0, sajuCount: 0, tarotCount: 0, totalCount: 0 });
  const selectedSlide = FEATURE_SLIDES[activeSlide];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const dailyContent = buildDailyFortuneContent();
  const liveCards = buildLiveCards(dailyContent, historyStats);

  useEffect(() => {
    setHistoryStats(
      getUnifiedArchiveStats(getTodayHistory(), getSajuHistory().length, getTarotFavorites().length),
    );
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % FEATURE_SLIDES.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setActiveSlide((index + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
  };

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null) return;

    const distance = touchStartX - x;
    if (Math.abs(distance) > 40) {
      goToSlide(activeSlide + (distance > 0 ? 1 : -1));
    }
    setTouchStartX(null);
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white p-3 shadow-[0_18px_48px_rgba(61,51,56,0.07)] sm:p-4">
        <div
          className="relative min-h-[200px] overflow-hidden rounded-[26px] border border-[#E2D7D0] px-5 py-5 text-[#2F282B] sm:min-h-[260px] sm:px-8 sm:py-6"
          style={{ background: selectedSlide.bg }}
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
        >
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border border-white/70" />
            <div className="absolute bottom-6 right-8 h-20 w-20 rounded-full bg-white/35" />
            <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-white/35" />
            <div className="absolute right-16 top-16 h-12 w-12 rounded-full" style={{ backgroundColor: `${selectedSlide.accent}22` }} />
          </div>

          <div className="relative flex min-h-[160px] flex-col justify-between sm:min-h-[200px]">
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-semibold text-[#8B6F47] backdrop-blur">
                DAILY REPORT {selectedSlide.badge}
              </span>
              <span className="text-xs font-semibold tracking-[0.18em] text-[#8B6F47]">
                {String(activeSlide + 1).padStart(2, "0")} / {String(FEATURE_SLIDES.length).padStart(2, "0")}
              </span>
            </div>

            <div>
              <h2 className="text-3xl leading-tight text-[#2F282B] sm:text-4xl" style={{ fontFamily: "Jua, sans-serif" }}>
                {selectedSlide.headline}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#6B5E58] sm:text-base">
                {selectedSlide.subcopy}
              </p>
              <div
                className="absolute bottom-2 right-6 hidden h-24 w-24 items-center justify-center rounded-[28px] border border-white/70 bg-white/35 text-5xl text-[#8B6F47] shadow-inner sm:flex"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                {selectedSlide.motif}
              </div>
              <Link
                href={selectedSlide.href}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2F282B] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,40,43,0.18)] transition hover:-translate-y-0.5"
              >
                리포트 보기
                <span className="text-lg leading-none">›</span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            aria-label="이전 메뉴"
            onClick={() => goToSlide(activeSlide - 1)}
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 메뉴"
            onClick={() => goToSlide(activeSlide + 1)}
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ›
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          {FEATURE_SLIDES.map((slide, index) => (
            <button
              key={slide.headline}
              type="button"
              aria-label={`${slide.headline} 선택`}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all ${
                activeSlide === index ? "w-9 bg-[#8B6F47]" : "w-3 bg-[#D8D5D4]"
              }`}
            />
          ))}
        </div>
      </section>

      <HomeResultPreview content={dailyContent} />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {liveCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`rounded-[24px] border px-4 py-4 shadow-[0_10px_26px_rgba(61,51,56,0.05)] transition hover:-translate-y-0.5 hover:bg-[#FFFDF9] ${card.cardClass}`}
          >
            <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">{card.eyebrow}</p>
            <h2 className="mt-2 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {card.title}
            </h2>
            {card.trend && (
              <div className="mt-3">
                {card.keyDay && (
                  <p className="mb-2 inline-flex rounded-full bg-[#FFF8EE] px-2 py-1 text-[11px] font-bold text-[#8B6F47]">
                    이번 주 중심: {card.keyDay}
                  </p>
                )}
                <div className="flex h-12 items-end gap-1.5">
                {card.trend.map((value, index) => (
                  <div key={index} className="relative flex flex-1 flex-col items-center gap-1">
                    {index === todayIndex && (
                      <span className="absolute -top-3 h-2 w-2 rounded-full bg-[#2F282B] ring-2 ring-[#F3E8D5]" />
                    )}
                    <div
                      className={`w-full rounded-t-full ${card.graphClass}`}
                      style={{ height: `${Math.max(value / 2, 16)}px`, opacity: 0.45 + index * 0.06 }}
                    />
                    <span className="text-[10px] text-[#A09488]">{"월화수목금토일"[index]}</span>
                  </div>
                ))}
                </div>
              </div>
            )}
            {card.stats && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {card.stats.map((stat) => (
                  <span key={stat} className="rounded-xl border border-[#E2D7D0] bg-white px-2 py-2 text-center text-[11px] font-semibold text-[#6B5E58]">
                    {stat}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#4A403B]">{card.text}</p>
            <p className="mt-3 text-xs font-bold text-[#8B6F47]">{card.cta} ›</p>
          </Link>
        ))}
      </section>

      <section className="relative overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white shadow-[0_18px_48px_rgba(61,51,56,0.07)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F1E7DE]" />
          <div className="absolute -bottom-28 left-8 h-80 w-80 rounded-full bg-[#F8F3EE]" />
          <div className="absolute bottom-16 right-14 hidden h-36 w-36 rounded-full border border-[#D9C8C0] sm:block" />
          <div className="absolute right-24 top-20 hidden h-20 w-20 rounded-full bg-[#EFE6DD] sm:block" />
        </div>

        <div className="relative px-6 py-8 sm:px-10 sm:py-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl leading-tight text-[#2F282B] sm:text-5xl" style={{ fontFamily: "Jua, sans-serif" }}>
              오늘의 흐름을
              <br />
              먼저 정리해두었습니다
            </h1>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#4A403B] sm:mt-4 sm:text-base">
              {"사주와 오늘의 해석, 상담까지\n매일 다시 찾게 되는 흐름을 모았습니다"}
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row">
              <Link
                href="/today"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2F282B] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#2F282B]/15 transition hover:-translate-y-0.5"
              >
                오늘 읽기
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-2xl border border-[#D9C8C0] bg-white px-5 py-3 text-sm font-bold text-[#2F282B] transition hover:bg-[#FAF8F5]"
              >
                AI 상담
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#E2D7D0] bg-white px-5 py-6 shadow-[0_18px_48px_rgba(61,51,56,0.06)] sm:px-7">
        <div className="mb-4">
          <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">WHY UNMYEONG SECRETARY</p>
          <h2 className="mt-2 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            운명비서가 흐름을 읽는 방식
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DIFFERENCE_POINTS.map(([line1, line2], index) => (
            <div key={line1} className="rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
              <p className="mb-2 text-xs font-bold text-[#8B6F47]">0{index + 1}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#3D3338]">
                {line1}
                {"\n"}
                {line2}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-10 text-sm text-[#A09488]">
        <p>운명비서는 재미와 참고용입니다.</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
        <p className="mt-3 text-xs">v1.1 · 2026.05 · 운명비서팀</p>
      </footer>
    </div>
  );
}