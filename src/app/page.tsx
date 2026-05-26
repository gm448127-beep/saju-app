"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HomePatternCard from "@/components/HomePatternCard";
import HomeResultPreview from "@/components/HomeResultPreview";
import MiinAvatar from "@/components/MiinAvatar";
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
    headline: "?????? ????????? ??????????",
    subcopy: "???????? ???????????n??????????? ??????????,
    badge: "01",
    motif: "??,
    bg: "linear-gradient(135deg, #FFFDF9 0%, #F5EDE3 56%, #E8D7C4 100%)",
    accent: "#8B6F47",
  },
  {
    href: "/today",
    headline: "?????????? ??? ??????????",
    subcopy: "???????????????????n?????? ?????? ??????????,
    badge: "02",
    motif: "??,
    bg: "linear-gradient(135deg, #FFFDF8 0%, #F3E8D5 56%, #E6CF9F 100%)",
    accent: "#B89968",
  },
  {
    href: "/tojeong",
    headline: "?????? ????????? ??????????",
    subcopy: "?????????? ?? ??????n??????????? ??????????,
    badge: "03",
    motif: "??,
    bg: "linear-gradient(135deg, #FCFBF7 0%, #EEE7DC 58%, #D9C8B6 100%)",
    accent: "#6B5E58",
  },
  {
    href: "/compatibility",
    headline: "?????????????????????????",
    subcopy: "?????? ?????? ???\n??????????? ??????????,
    badge: "04",
    motif: "??,
    bg: "linear-gradient(135deg, #FFF9F6 0%, #F1E0DA 58%, #E3C8BE 100%)",
    accent: "#9A685B",
  },
  {
    href: "/tarot",
    headline: "????????? ??? ??????????",
    subcopy: "?????? ????????????n??? ?????? ??????????,
    badge: "05",
    motif: "??,
    bg: "linear-gradient(135deg, #FBFAFF 0%, #EDE6F4 58%, #D8C8E6 100%)",
    accent: "#7F6A8E",
  },
];

/** ?????? ????? ???? ????????????????? ???? ?????*/
function buildFeatureSlides(displayName: string | null, year = new Date().getFullYear()): FeatureSlide[] {
  if (!displayName || displayName === "??) return FEATURE_SLIDES;

  const personalizedCopy: Record<string, { headline: string; subcopy: string }> = {
    "/saju": {
      headline: `${displayName}???????? ???????????????????????,
      subcopy: "???????? ??? ???????\n?????????????????????? ??????????",
    },
    "/today": {
      headline: `${displayName}???????????? ???????????,
      subcopy: "????? ?????????? ????�???????n?????? ?????? ??????????,
    },
    "/tojeong": {
      headline: `${displayName}??${year}?????????????????????????,
      subcopy: `${year}????? ??? ???? ???????????n??????????? ??????????`,
    },
    "/compatibility": {
      headline: `${displayName}??????? ?????????????????,
      subcopy: "??????????????? ???\n??? ???????? ??????????,
    },
    "/tarot": {
      headline: `${displayName}, ????????? ??? ???????????,
      subcopy: "??????????????n???? ?????? ????? ??????????,
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
    title: "???????????,
    eyebrow: "TODAY",
    text: dailyContent.sentence,
    cta: "?????????",
    cardClass: "border-[#E8D7C4] bg-[#FFF8EE]",
    href: "/today",
  },
  {
    title: "???? ??? ????",
    eyebrow: "WEEKLY",
    text: weeklyCard.text,
    trend: weeklyCard.trend,
    highlightIndex: weeklyCard.highlightIndex,
    cta: "??? ??",
    cardClass: "border-[#E2D7D0] bg-white",
    graphClass: "bg-[#C49A4A]",
    href: weeklyCard.href,
  },
  {
    title: "???? ?????",
    eyebrow: "PATTERN",
    patternPreview: patternCard,
    href: "/history",
  },
  {
    title: "???????????",
    eyebrow: "PICK",
    text: "??????????????????\nAI????????? ?????? ???????????,
    cta: "????? ???",
    cardClass: "border-[#C49A4A] bg-white",
    href: dailyContent.recommendation.href,
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

  return (
    <div className="space-y-5">
      <p
        className="rounded-2xl border border-[#E2D7D0] bg-[#FFF8EE] px-4 py-3 text-center text-base leading-snug text-[#2F282B] sm:text-lg"
        style={{ fontFamily: "Jua, sans-serif" }}
      >
        {PRIMARY_TAGLINE}
      </p>
      <p className="whitespace-pre-line rounded-2xl border border-[#E2D7D0]/80 bg-white px-4 py-3 text-center text-sm leading-relaxed text-[#5A4E48]">
        {BIRTH_TIME_MARKETING.subcopy}
      </p>

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

          <div className="relative flex min-h-[160px] w-full min-w-0 flex-col justify-between sm:min-h-[200px]">
            <div className="flex items-center justify-between sm:px-10">
              <span className="rounded-full border border-white/70 bg-white/55 px-3 py-1 text-xs font-semibold text-[#8B6F47] backdrop-blur">
                {profile ? "MY REPORT" : "DAILY REPORT"} {selectedSlide.badge}
              </span>
              <span className="text-xs font-semibold tracking-[0.18em] text-[#8B6F47]">
                {String(activeSlide + 1).padStart(2, "0")} / {String(featureSlides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="relative w-full min-w-0 sm:px-10 sm:pr-32">
              <h2 className="w-full text-[2rem] leading-tight text-[#2F282B] sm:text-5xl" style={{ fontFamily: "Jua, sans-serif" }}>
                {selectedSlide.headline}
              </h2>
              <p className="mt-2 w-full whitespace-pre-line text-sm leading-relaxed text-[#6B5E58] sm:text-base">
                {selectedSlide.subcopy}
              </p>
              <Link
                href={selectedSlide.href}
                className="relative z-10 mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#7B7355] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(123,115,85,0.22)] transition hover:-translate-y-0.5"
              >
                ??????
                <span className="text-lg leading-none">??/span>
              </Link>
            </div>
          </div>

          <div
            className="pointer-events-none absolute -bottom-2 right-6 z-0 hidden h-32 w-32 items-center justify-center rounded-[34px] border border-white/55 bg-white/45 text-6xl font-semibold text-[#6F5435] shadow-[inset_0_2px_16px_rgba(255,255,255,0.45)] sm:flex"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            {selectedSlide.motif}
          </div>

          <button
            type="button"
            aria-label="???? ?????"
            onClick={() => goToSlide(activeSlide - 1)}
            className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ??          </button>
          <button
            type="button"
            aria-label="???? ?????"
            onClick={() => goToSlide(activeSlide + 1)}
            className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/55 text-[#2F282B] backdrop-blur transition hover:bg-white sm:flex"
          >
            ??          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1">
          {featureSlides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              aria-label={`${slide.badge}???????????`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => goToSlide(index)}
              className="touch-target flex items-center justify-center rounded-full transition"
            >
              <span
                className={`block h-2.5 rounded-full transition-all ${
                  activeSlide === index ? "w-9 bg-[#8B6F47]" : "w-2.5 bg-[#D8D5D4]"
                }`}
              />
            </button>
          ))}
        </div>
      </section>

      {profile && (
        <p className="rounded-2xl border border-[#E8D7C4] bg-[#FFF8EE] px-4 py-3 text-center text-sm font-semibold text-[#5A4E48]">
          <span className="text-[#8B6F47]">{displayName}???????</span>
          {" � "}??�??????????�????�?????? ???? ??? ??????? ??????????        </p>
      )}

      {profile && (previewLoading || !dailyContent) ? (
        <section
          aria-label="??? ????? ???? ?????"
          className="overflow-hidden rounded-[30px] border border-[#E8D7C4] bg-[#FFFDF8] p-8 text-center shadow-[0_18px_48px_rgba(61,51,56,0.07)]"
        >
          <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">MY TODAY</p>
          <p className="mt-2 text-lg font-semibold text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
            {displayName}????????????????????          </p>
          <p className="mt-2 text-sm text-[#8A7E78]">???????? ??? ??????? ??????? ?????? ???????? ??????????.</p>
        </section>
      ) : (
        <HomeResultPreview
          content={dailyContent ?? buildDailyFortuneContent()}
          displayName={displayName}
          isPersonalized={isPersonalizedHome}
          isLoadingPersonalized={false}
          toneTooltipBasis={personalizedToneBasis}
          apiOverall={personalizedOverall}
          birthKey={profile ? profileToBirthKey(profile) : null}
        />
      )}

      <MobileSnapRow
        desktopClassName="lg:grid lg:grid-cols-4 lg:gap-3"
        className="gap-3"
        aria-label="????????????"
      >
        {liveCards.map((card) =>
          "patternPreview" in card && card.patternPreview ? (
            <MobileSnapCard key={card.title} className="h-full lg:w-auto">
              <HomePatternCard data={card.patternPreview} />
            </MobileSnapCard>
          ) : (
          <MobileSnapCard key={card.title} className="h-full lg:w-auto">
          <Link
            href={card.href}
            className={`flex h-full min-h-[11rem] flex-col rounded-[24px] border px-4 py-4 shadow-[0_10px_26px_rgba(61,51,56,0.05)] transition hover:-translate-y-0.5 hover:bg-[#FFFDF9] ${"cardClass" in card ? card.cardClass : ""}`}
          >
            <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">{card.eyebrow}</p>
            <h2 className="mt-2 text-xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {card.title}
            </h2>
            {card.trend && (
              <div className="mt-3">
                <div className="flex h-8 items-end gap-1.5">
                {card.trend.map((value, index) => (
                  <div key={index} className="relative flex flex-1 flex-col items-center gap-0.5">
                    {index === ("highlightIndex" in card ? card.highlightIndex : undefined) && (
                      <span className="absolute -top-2.5 h-1.5 w-1.5 rounded-full bg-[#2F282B] ring-2 ring-[#F3E8D5]" />
                    )}
                    <div
                      className={`w-full rounded-t-full ${card.graphClass}`}
                      style={{ height: `${Math.max(value / 3, 10)}px`, opacity: 0.45 + index * 0.06 }}
                    />
                    <span className="text-[9px] text-[#A09488]">{"???????????????[index]}</span>
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
            {"text" in card && card.text ? (
              <p className={`mt-2 whitespace-pre-line leading-relaxed text-[#2F282B] ${card.trend ? "text-sm font-medium" : "text-sm text-[#4A403B]"}`}>
                {card.text}
              </p>
            ) : null}
            {"cta" in card && card.cta ? (
              <p className="mt-auto pt-3 text-xs font-bold text-[#8B6F47]">{card.cta} ??/p>
            ) : null}
          </Link>
          </MobileSnapCard>
          ),
        )}
      </MobileSnapRow>

      <section className="relative overflow-hidden rounded-[30px] border border-[#E2D7D0] bg-white shadow-[0_18px_48px_rgba(61,51,56,0.07)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#F1E7DE]" />
          <div className="absolute -bottom-28 left-8 h-80 w-80 rounded-full bg-[#F8F3EE]" />
        </div>

        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:px-10 sm:py-10">
          <div className="max-w-2xl min-w-0 flex-1">
            <h2 className="text-2xl leading-tight text-[#2F282B] sm:text-3xl lg:text-4xl" style={{ fontFamily: "Jua, sans-serif" }}>
              ?????????????              <br />
              ??? ??????????????????
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#4A403B] sm:mt-4 sm:text-lg" style={{ fontFamily: "Jua, sans-serif" }}>
              {PRIMARY_TAGLINE}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">
              ???�???????????�????�????�AI ????????? ???????? ????????????
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row">
              <Link
                href="/today"
                className="inline-flex items-center justify-center rounded-2xl bg-[#7B7355] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7B7355]/15 transition hover:-translate-y-0.5"
              >
                ????? ???
              </Link>
              <Link
                href="/chat"
                className="inline-flex items-center justify-center rounded-2xl border border-[#D9C8C0] bg-white px-5 py-3 text-sm font-bold text-[#2F282B] transition hover:bg-[#FAF8F5]"
              >
                AI ?????
              </Link>
            </div>
          </div>
          <div className="flex shrink-0 justify-end sm:justify-end">
            <MiinAvatar size={144} className="ring-4 ring-[#F5EDE3] ring-offset-2 ring-offset-white" priority />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#E2D7D0] bg-white px-5 py-6 shadow-[0_18px_48px_rgba(61,51,56,0.06)] sm:px-7">
        <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">WHY UNMYEONG SECRETARY</p>
        <h2 className="mt-2 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          ??????????? ??????????? ????
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#6B5E58]">
          ??? ????? ???? ???????????????AI ?????????, ????? ??????? ????????????
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {HOME_READING_WAY_CARDS.map((card) => (
            <div key={card.num} className="rounded-2xl border border-[#E8D7C4] bg-[#FAF5ED] px-4 py-4">
              <p className="text-xs font-bold text-[#8B6F47]">{card.num}</p>
              <p className="mt-1 text-base text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {card.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-10 text-sm text-[#A09488]">
        <p>????????????????? ????????????.</p>
        <p className="mt-1">???????????? ??????? ????????????</p>
        <p className="mt-3">
          <a
            href="mailto:unmyeong.team@gmail.com?subject=????????? ???????
            className="text-[#8B6F47] underline-offset-2 transition hover:text-[#6F5435] hover:underline"
          >
            ?????????????� unmyeong.team@gmail.com
          </a>
        </p>
        <p className="mt-3 text-xs">v1.1 � 2026.05 � ???????????</p>
      </footer>
    </div>
  );
}