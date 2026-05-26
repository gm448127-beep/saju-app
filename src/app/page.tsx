"use client";

import "./home-gyeol.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HomeBrandMark from "@/components/HomeBrandMark";
import HomePatternCard from "@/components/HomePatternCard";
import HomeResultPreview from "@/components/HomeResultPreview";
import MobileSnapRow, { MobileSnapCard } from "@/components/MobileSnapRow";
import { useUserProfile } from "@/components/UserProfileProvider";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import { pickTodayToneTooltipSource, type TodayToneTooltipSource } from "@/lib/today-basis-helpers";
import {
  PROFILE_UPDATED_EVENT,
  profileToBirthKey,
  profileToTodayPayload,
} from "@/lib/user-profile-storage";
import { getSajuHistory, getTarotFavorites } from "@/lib/archive-storage";
import { BIRTH_TIME_MARKETING, HOME_READING_WAY_CARDS, PRIMARY_TAGLINE } from "@/lib/engine-copy";
import { buildHomePatternCard, buildHomeWeeklyCard } from "@/lib/today-pattern-helpers";
import { getUnifiedArchiveStats, getTodayHistory } from "@/lib/today-report-helpers";
import { AI_CHAT_ENABLED } from "@/lib/feature-flags";

type FeatureSlide = {
  href: string;
  headline: string;
  subcopy: string;
  badge: string;
  motif: string;
  bg: string;
  accent: string;
};

const FEATURE_SLIDES: FeatureSlide[] = [
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

/** 저장된 사주가 있을 때 홈 히어로 캐러셀 카피 개인화 */
function buildFeatureSlides(displayName: string | null, year = new Date().getFullYear()): FeatureSlide[] {
  if (!displayName || displayName === "나") return FEATURE_SLIDES;

  const personalizedCopy: Record<string, { headline: string; subcopy: string }> = {
    "/saju": {
      headline: `${displayName}의 타고난 흐름을 정리해 두었습니다`,
      subcopy: "입력하신 사주 기준으로\n기질과 방향을 차분한 리포트로 읽습니다",
    },
    "/today": {
      headline: `${displayName}의 오늘의 결을 읽어보세요`,
      subcopy: "오늘 일진과 맞춘 흐름·점수를\n한 장의 리포트로 정리합니다",
    },
    "/tojeong": {
      headline: `${displayName}의 ${year}년 흐름을 정리해 두었습니다`,
      subcopy: `${year}년에 담긴 결과와 조심할 시기를\n차분한 리포트로 읽습니다`,
    },
    "/compatibility": {
      headline: `${displayName}의 인연 흐름을 읽어보세요`,
      subcopy: "두 사람의 온도와 결을\n입력 기준에 맞춰 정리합니다",
    },
    "/tarot": {
      headline: `${displayName}, 마음의 결을 짧게 읽어보세요`,
      subcopy: "지금 걸리는 마음을\n카드 리포트로 가볍게 정리합니다",
    },
  };

  return FEATURE_SLIDES.map((slide) => {
    const copy = personalizedCopy[slide.href];
    return copy ? { ...slide, headline: copy.headline, subcopy: copy.subcopy } : slide;
  });
}

function buildLiveCards(
  dailyContent: ReturnType<typeof buildDailyFortuneContent>,
  historyStats: { todayCount: number; dayCount: number; sajuCount: number; tarotCount: number },
  weeklyCard: ReturnType<typeof buildHomeWeeklyCard>,
  patternCard: ReturnType<typeof buildHomePatternCard>,
) {
  return [
  {
    title: "오늘의 한 줄",
    eyebrow: "TODAY",
    text: dailyContent.sentence,
    cta: "자세히 보기",
    cardClass: "",
    href: "/today",
  },
  {
    title: "이번 주의 흐름",
    eyebrow: "WEEKLY",
    text: weeklyCard.text,
    trend: weeklyCard.trend,
    highlightIndex: weeklyCard.highlightIndex,
    cta: "주간 보기",
    cardClass: "",
    graphClass: "gyeol-graph-bar",
    href: weeklyCard.href,
  },
  {
    title: "나의 패턴",
    eyebrow: "PATTERN",
    patternPreview: patternCard,
    href: "/history",
  },
  {
    title: "오늘의 추천",
    eyebrow: "PICK",
    text: AI_CHAT_ENABLED
      ? "걸리는 마음이 남는다면\nAI상담으로 더 깊게 읽어보세요"
      : "오늘의 흐름이 걸리면\n한 번 더 깊게 읽어보세요",
    cta: AI_CHAT_ENABLED ? "상담 열기" : "오늘 보기",
    cardClass: "",
    href: AI_CHAT_ENABLED ? dailyContent.recommendation.href : "/today",
  },
  ];
}

export default function HomePage() {
  const { profile, displayName, isReady: profileReady } = useUserProfile();
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [historyRecords, setHistoryRecords] = useState<ReturnType<typeof getTodayHistory>>([]);
  const [historyStats, setHistoryStats] = useState({ todayCount: 0, dayCount: 0, sajuCount: 0, tarotCount: 0, totalCount: 0 });
  const [personalizedContent, setPersonalizedContent] = useState<DailyFortuneContent | null>(null);
  const [personalizedToneBasis, setPersonalizedToneBasis] = useState<TodayToneTooltipSource | null>(null);
  const [personalizedOverall, setPersonalizedOverall] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const featureSlides = useMemo(
    () => buildFeatureSlides(profile ? displayName : null),
    [profile, displayName],
  );
  const selectedSlide = featureSlides[activeSlide];
  const isPersonalizedHome = Boolean(profile && personalizedContent);
  const dailyContent = isPersonalizedHome
    ? personalizedContent!
    : profile
      ? null
      : buildDailyFortuneContent();

  const weeklyCard = useMemo(() => {
    const content = dailyContent ?? buildDailyFortuneContent();
    return buildHomeWeeklyCard(historyRecords, {
      toneLabel: content.toneLabel,
      overall: Math.round(
        content.axisScores.relation * 0.3 +
          content.axisScores.decision * 0.3 +
          content.axisScores.emotion * 0.2 +
          content.axisScores.balance * 0.2,
      ),
    });
  }, [historyRecords, dailyContent]);

  const patternCard = useMemo(
    () =>
      buildHomePatternCard(
        historyRecords,
        {
          sajuCount: historyStats.sajuCount,
          todayCount: historyStats.todayCount,
        },
        { hasProfile: Boolean(profile) },
      ),
    [historyRecords, historyStats.sajuCount, historyStats.todayCount, profile],
  );

  const liveCards = buildLiveCards(
    dailyContent ?? buildDailyFortuneContent(),
    historyStats,
    weeklyCard,
    patternCard,
  );

  useEffect(() => {
    const syncHistory = () => {
      const records = getTodayHistory();
      setHistoryRecords(records);
      setHistoryStats(
        getUnifiedArchiveStats(records, getSajuHistory().length, getTarotFavorites().length),
      );
    };
    syncHistory();
    window.addEventListener("focus", syncHistory);
    const onVisible = () => {
      if (document.visibilityState === "visible") syncHistory();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", syncHistory);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!profileReady || !profile) {
      setPersonalizedContent(null);
      setPersonalizedToneBasis(null);
      setPersonalizedOverall(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profileToTodayPayload(profile)),
        });
        const json = await res.json();
        if (!cancelled && res.ok && json.dailyReport) {
          setPersonalizedContent(json.dailyReport as DailyFortuneContent);
          setPersonalizedToneBasis(pickTodayToneTooltipSource(json));
          setPersonalizedOverall(
            typeof json.scores?.overall === "number" ? json.scores.overall : null,
          );
        } else if (!cancelled) {
          setPersonalizedContent(null);
          setPersonalizedToneBasis(null);
          setPersonalizedOverall(null);
        }
      } catch {
        if (!cancelled) {
          setPersonalizedContent(null);
          setPersonalizedToneBasis(null);
          setPersonalizedOverall(null);
        }
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile, profileReady]);

  useEffect(() => {
    const refetch = () => {
      if (!profile) return;
      setPreviewLoading(true);
      fetch("/api/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileToTodayPayload(profile)),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.dailyReport) {
            setPersonalizedContent(json.dailyReport as DailyFortuneContent);
            setPersonalizedToneBasis(pickTodayToneTooltipSource(json));
            setPersonalizedOverall(
              typeof json.scores?.overall === "number" ? json.scores.overall : null,
            );
          }
        })
        .finally(() => setPreviewLoading(false));
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, refetch);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refetch);
  }, [profile]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featureSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [featureSlides.length]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + featureSlides.length) % featureSlides.length);
  };

  const handleTouchEnd = (x: number) => {
    if (touchStartX === null) return;

    const distance = touchStartX - x;
    if (Math.abs(distance) > 40) {
      goToSlide(activeSlide + (distance > 0 ? 1 : -1));
    }
    setTouchStartX(null);
  };

  const todayLabel = useMemo(() => {
    const now = new Date();
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${weekdays[now.getDay()]}`;
  }, []);

  return (
    <div className="home-gyeol">
      <div className="home-gyeol__inner">
      <header className="gyeol-top">
        <div className="gyeol-brand">
          <span className="gyeol-brand-hanja" aria-hidden>
            命
          </span>
          <div>
            <p className="gyeol-brand-name">운명비서</p>
            <p className="gyeol-brand-tag">Daily Self-Report</p>
          </div>
        </div>
        <time className="gyeol-date-pill" dateTime={todayLabel.replace(/\s/g, "")}>
          {todayLabel}
        </time>
      </header>

      {/* 히어로 */}
      <section className="gyeol-card gyeol-hero" aria-labelledby="home-hero-title">
        <div className="gyeol-hero-stack">
          <div className="gyeol-hero-copy">
            <p className="gyeol-eyebrow">오늘의 결</p>
            <h1 id="home-hero-title" className="gyeol-hero-title">
              {PRIMARY_TAGLINE}
            </h1>
            <div className="gyeol-hero-desc">
              {BIRTH_TIME_MARKETING.subcopy.split("\n").map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          <HomeBrandMark variant="hero" priority />
        </div>
      </section>

      {/* 기능 캐러셀 */}
      <section className="gyeol-card gyeol-carousel">
        <div
          className="gyeol-carousel-panel"
          onTouchStart={(event) => setTouchStartX(event.touches[0].clientX)}
          onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0].clientX)}
        >
          <div className="relative flex min-h-[160px] w-full min-w-0 flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="gyeol-carousel-badge">
                {profile ? "MY REPORT" : "DAILY REPORT"} {selectedSlide.badge}
              </span>
              <span className="gyeol-faint text-xs font-semibold tracking-[0.18em]">
                {String(activeSlide + 1).padStart(2, "0")} / {String(featureSlides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="relative w-full min-w-0">
              <h2 className="gyeol-carousel-headline">{selectedSlide.headline}</h2>
              <p className="gyeol-muted mt-2 whitespace-pre-line text-sm">
                {selectedSlide.subcopy}
              </p>
              <Link href={selectedSlide.href} className="gyeol-btn-primary relative z-10 mt-5 min-h-11">
                리포트 보기
                <span className="text-lg leading-none">›</span>
              </Link>
            </div>
          </div>

          <div className="gyeol-carousel-motif" aria-hidden>
            {selectedSlide.motif}
          </div>

          <button
            type="button"
            aria-label="이전 메뉴"
            onClick={() => goToSlide(activeSlide - 1)}
            className="gyeol-carousel-nav gyeol-carousel-nav--prev"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 메뉴"
            onClick={() => goToSlide(activeSlide + 1)}
            className="gyeol-carousel-nav gyeol-carousel-nav--next"
          >
            ›
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1">
          {featureSlides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              aria-label={`${slide.badge}번 리포트 선택`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => goToSlide(index)}
              className="touch-target flex items-center justify-center rounded-full transition"
            >
              <span className={activeSlide === index ? "gyeol-dot gyeol-dot--active" : "gyeol-dot"} />
            </button>
          ))}
        </div>
      </section>

      {profile && (
        <p className="gyeol-card gyeol-profile-banner">
          <span className="gyeol-accent">{displayName}의 오늘</span>
          {" · "}홈·오늘운세·사주·상담이 같은 사주 기준으로 연결됩니다
        </p>
      )}

      {profile && (previewLoading || !dailyContent) ? (
        <section aria-label="맞춤 오늘 흐름 로딩" className="gyeol-card gyeol-loading">
          <p className="gyeol-eyebrow">MY TODAY</p>
          <p className="gyeol-serif mt-2 text-lg">{displayName}의 오늘을 맞추는 중…</p>
          <p className="gyeol-faint mt-2 text-sm">입력하신 사주 기준으로 점수와 한 줄을 계산하고 있습니다.</p>
        </section>
      ) : (
        <div className="home-gyeol-preview">
        <HomeResultPreview
          content={dailyContent ?? buildDailyFortuneContent()}
          displayName={displayName}
          isPersonalized={isPersonalizedHome}
          isLoadingPersonalized={false}
          toneTooltipBasis={personalizedToneBasis}
          apiOverall={personalizedOverall}
          birthKey={profile ? profileToBirthKey(profile) : null}
        />
        </div>
      )}

      <MobileSnapRow className="gap-3" aria-label="바로가기 카드">
        {liveCards.map((card) =>
          "patternPreview" in card && card.patternPreview ? (
            <MobileSnapCard key={card.title} className="h-full">
              <HomePatternCard data={card.patternPreview} />
            </MobileSnapCard>
          ) : (
          <MobileSnapCard key={card.title} className="h-full">
          <Link href={card.href} className="gyeol-card-link">
            <p className="gyeol-eyebrow">{card.eyebrow}</p>
            <h2 className="mt-2 text-xl font-bold">{card.title}</h2>
            {card.trend && (
              <div className="mt-3">
                <div className="flex h-8 items-end gap-1.5">
                {card.trend.map((value, index) => (
                  <div key={index} className="relative flex flex-1 flex-col items-center gap-0.5">
                    {index === ("highlightIndex" in card ? card.highlightIndex : undefined) && (
                      <span className="absolute -top-2.5 h-1.5 w-1.5 rounded-full bg-[#333333] ring-2 ring-[#f5f2ed]" />
                    )}
                    <div
                      className={`w-full rounded-t-full ${card.graphClass}`}
                      style={{ height: `${Math.max(value / 3, 10)}px`, opacity: 0.45 + index * 0.06 }}
                    />
                    <span className="gyeol-faint text-[9px]">{"월화수목금토일"[index]}</span>
                  </div>
                ))}
                </div>
              </div>
            )}
            {card.stats && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {card.stats.map((stat) => (
                  <span key={stat} className="gyeol-stat-pill">
                    {stat}
                  </span>
                ))}
              </div>
            )}
            {"text" in card && card.text ? (
              <p className={`gyeol-muted mt-2 whitespace-pre-line ${card.trend ? "text-sm font-medium" : "text-sm"}`}>
                {card.text}
              </p>
            ) : null}
            {"cta" in card && card.cta ? (
              <p className="gyeol-accent mt-auto pt-3 text-xs">{card.cta} ›</p>
            ) : null}
          </Link>
          </MobileSnapCard>
          ),
        )}
      </MobileSnapRow>

      <section className="gyeol-card relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#ebe5d9]" />
          <div className="absolute -bottom-20 left-4 h-64 w-64 rounded-full border border-[#ddd5c6]" />
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="min-w-0 flex-1">
            <p className="gyeol-eyebrow">TODAY FIRST</p>
            <h2 className="mt-2 text-2xl leading-tight">
              오늘의 흐름을
              <br />
              먼저 정리해두었습니다
            </h2>
            <p className="gyeol-muted mt-3 text-base">
              {PRIMARY_TAGLINE}
            </p>
            <p className="gyeol-muted mt-2 text-sm">
              {AI_CHAT_ENABLED
                ? "사주·오늘의 흐름·토정·궁합·AI 상담까지 한곳에서 이어집니다."
                : "사주·오늘의 흐름·토정·궁합까지 한곳에서 이어집니다."}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <Link href="/today" className="gyeol-btn-primary">
                오늘 읽기
              </Link>
              {AI_CHAT_ENABLED && (
                <Link href="/chat" className="gyeol-btn-secondary">
                  AI 상담
                </Link>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-center">
            <div className="gyeol-today-myeong" aria-hidden>
              命
            </div>
          </div>
        </div>
      </section>

      <section className="gyeol-card">
        <p className="gyeol-eyebrow">WHY UNMYEONG SECRETARY</p>
        <h2 className="mt-2 text-2xl">운명비서가 흐름을 읽는 방식</h2>
        <p className="gyeol-muted mt-2 text-sm">
          {AI_CHAT_ENABLED
            ? "명리 계산 → 매일 리포트 → 필요할 때 AI 상담까지, 한 사주 기준으로 이어집니다."
            : "명리 계산 → 매일 리포트까지, 한 사주 기준으로 이어집니다."}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3">
          {HOME_READING_WAY_CARDS.map((card) => (
            <div key={card.num} className="gyeol-way-card">
              <p className="gyeol-eyebrow">{card.num}</p>
              <p className="mt-2 text-base font-semibold">{card.title}</p>
              <p className="gyeol-muted mt-2 text-sm">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="gyeol-faint py-10 text-center text-sm">
        <p>운명비서는 재미와 참고용입니다.</p>
        <p className="mt-1">중요한 결정은 전문가와 상담하세요.</p>
        <p className="mt-3">
          <a
            href="mailto:unmyeong.team@gmail.com?subject=운명비서 피드백"
            className="gyeol-accent underline-offset-2 transition hover:text-[#1c1a17] hover:underline"
          >
            피드백 보내기 · unmyeong.team@gmail.com
          </a>
        </p>
        <p className="mt-3 text-xs">v1.1 · 2026.05 · 운명비서팀</p>
      </footer>
      </div>
    </div>
  );
}