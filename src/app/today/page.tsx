"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StoredProfileBar from "@/components/StoredProfileBar";
import { useUserProfile } from "@/components/UserProfileProvider";
import ShareButton from "@/components/ShareButton";
import PdfButton from "@/components/PdfButton";
import HourlyFlowSection from "@/components/HourlyFlowSection";
import SajuTriggerSection from "@/components/SajuTriggerSection";
import TodayStatsSection, { type TodayStatItem } from "@/components/TodayStatsSection";
import TimeAdviceSection from "@/components/TimeAdviceSection";
import TodayActionGuideSection from "@/components/TodayActionGuideSection";
import TodayEmptyState from "@/components/TodayEmptyState";
import TodayFiveCardReport from "@/components/TodayFiveCardReport";
import TodayPersonalizeForm, { isValidBirthDate } from "@/components/TodayPersonalizeForm";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import {
  profileToTodayPayload,
  type UserBirthProfile,
} from "@/lib/user-profile-storage";

const TAB_ITEMS = [
  { key: "summary", label: "요약" },
  { key: "detail", label: "상세" },
  { key: "myeongsik", label: "명식" },
] as const;

type TodayTab = (typeof TAB_ITEMS)[number]["key"];

function formatTodayLabel(date = new Date()) {
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} (${weekdays[date.getDay()]})`;
}

function SectionTitle({ title, caption }: { title: string; caption?: string }) {
  return (
    <div className="mb-4">
      <h2 className="label mb-1">{title}</h2>
      {caption && <p className="text-xs text-[#8A7E78]">{caption}</p>}
    </div>
  );
}

function TodayBriefingReport({ result }: { result: any }) {
  const briefing = result.briefing;
  if (!briefing) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-[#E2D7D0] bg-white px-6 py-7 shadow-[0_14px_40px_rgba(61,51,56,0.06)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#B8A78D]">{briefing.date}</p>
            <h2 className="mt-3 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              {briefing.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5A4E48]">{briefing.headline}</p>
          </div>
          <div className="rounded-3xl border border-[#E2D7D0] bg-[#FAF8F5] px-6 py-4 text-center">
            <p className="text-xs text-[#8A7E78]">종합 점수</p>
            <p className="mt-1 text-5xl font-bold text-[#2F282B]">{result.scores.overall}</p>
            <p className="mt-1 text-sm text-[#8B6F47]">{briefing.scoreTone}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-5 py-4">
          <p className="text-xs tracking-[0.12em] text-[#8B6F47]">핵심 한 줄</p>
          <p className="mt-2 text-lg leading-relaxed text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
            {briefing.oneLine}
          </p>
        </div>
      </div>

      <div className="card">
        <SectionTitle title="오늘의 브리핑" caption="십성, 일진, 합충, 시간 흐름을 종합한 요약입니다." />
        <div className="space-y-3">
          {briefing.executiveSummary?.map((line: string, index: number) => (
            <div key={index} className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
              <p className="text-sm leading-relaxed text-[#5A4E48]">{line}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#8B6F47]">오늘의 활용법</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">{briefing.focus}</p>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
            <p className="text-xs font-semibold text-[#8B6F47]">오늘의 주의점</p>
            <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">{briefing.caution}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainScoreSummary({ domains }: { domains?: any[] }) {
  if (!domains?.length) return null;

  return (
    <div className="card">
      <SectionTitle title="영역별 점수 요약" caption="기존 운세 점수를 바탕으로 오늘 활용할 영역을 세분화했습니다." />
      <div className="space-y-3">
        {domains.map((domain) => (
          <div key={domain.key} className="grid grid-cols-[72px_1fr_56px] items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-[#3D3338]">{domain.label}</p>
              <p className="text-[11px] text-[#8A7E78]">{domain.grade}</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EDE4DC]">
              <div
                className="h-full rounded-full bg-[#8B6F47]"
                style={{ width: `${Math.min(Math.max(domain.score, 0), 100)}%` }}
              />
            </div>
            <p className="text-right text-lg font-bold text-[#2F282B]">{domain.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedFortuneReport({ items }: { items?: any[] }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.key} className="card">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.12em] text-[#B8A78D]">DETAILED REPORT</p>
              <h2 className="mt-1 text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {item.label}
              </h2>
              <p className="mt-1 text-xs text-[#8A7E78]">{item.desc}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-[#2F282B]">{item.score}</p>
              <p className="text-xs text-[#8B6F47]">{item.grade}</p>
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#EDE4DC]">
            <div className="h-full rounded-full bg-[#8B6F47]" style={{ width: `${item.score}%` }} />
          </div>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#5A4E48]">
            <p>{item.overview}</p>
            <div>
              <p className="mb-1 font-semibold text-[#3D5838]">긍정 요소</p>
              <p>{item.positive}</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-[#7A4A3D]">주의 요소</p>
              <p>{item.cautionText}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 border-t border-[#E2D7D0] pt-4 md:grid-cols-2">
              <div className="rounded-2xl bg-[#FAF8F5] px-4 py-3">
                <p className="text-xs font-semibold text-[#8B6F47]">오늘의 행동</p>
                <p className="mt-1">{item.action}</p>
              </div>
              <div className="rounded-2xl bg-[#FAF8F5] px-4 py-3">
                <p className="text-xs font-semibold text-[#8B6F47]">피하면 좋은 것</p>
                <p className="mt-1">{item.avoid}</p>
              </div>
            </div>
            <p className="border-t border-[#E2D7D0] pt-4 text-xs text-[#8A7E78]">{item.basis}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyeongsikReport({ report }: { report?: any }) {
  if (!report) return null;

  return (
    <div className="space-y-4">
      <div className="card">
        <SectionTitle title={report.title} caption="오늘의 일진과 나의 원국을 함께 읽은 전문가용 요약입니다." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {report.natal.pillars.map((pillar: any) => (
            <div key={pillar.key} className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-4 text-center">
              <p className="text-xs text-[#8A7E78]">{pillar.label}</p>
              <p className="mt-2 text-lg text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
                {pillar.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <SectionTitle title="오늘 일진" caption="오늘 들어온 천간과 지지가 나에게 어떤 십성으로 작용하는지 정리했습니다." />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
            <p className="text-xs text-[#8A7E78]">오늘 천간</p>
            <p className="mt-1 text-base text-[#3D3338]">{report.today.gan}</p>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
            <p className="text-xs text-[#8A7E78]">오늘 지지</p>
            <p className="mt-1 text-base text-[#3D3338]">{report.today.ji}</p>
          </div>
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
            <p className="text-xs text-[#8A7E78]">내 일간 기준</p>
            <p className="mt-1 text-base text-[#3D3338]">
              {report.today.sipsin} / {report.today.branchSipsin}
            </p>
          </div>
        </div>
      </div>

      {(report.triggers?.length > 0 || report.legacyLines?.length > 0) && (
        <div className="card">
          <SectionTitle title="반영 요소" caption="점수와 해석에 반영된 합충, 십성, 오행 근거입니다." />
          <div className="space-y-2">
            {(report.triggers?.length ? report.triggers : report.legacyLines).map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3">
                <p className="text-sm leading-relaxed text-[#5A4E48]">
                  {typeof item === "string" ? item : `${item.label || item.title || "반영"} · ${item.desc || item.description || item.reason || ""}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function applyProfileToFormState(
  profile: UserBirthProfile,
  setters: {
    setYear: (v: string) => void;
    setMonth: (v: string) => void;
    setDay: (v: string) => void;
    setTimeMode: (v: "none" | "slot" | "exact") => void;
    setSlotHour: (v: number) => void;
    setExactHour: (v: number) => void;
    setExactMinute: (v: number) => void;
    setCalendarType: (v: string) => void;
    setGender: (v: string) => void;
  },
) {
  setters.setYear(profile.year);
  setters.setMonth(profile.month);
  setters.setDay(profile.day);
  setters.setTimeMode(profile.timeMode);
  setters.setSlotHour(profile.slotHour);
  setters.setExactHour(profile.exactHour);
  setters.setExactMinute(profile.exactMinute);
  setters.setCalendarType(profile.calendarType);
  setters.setGender(profile.gender);
}

export default function TodayPage() {
  const { profile, saveProfile, displayName, isReady: profileReady } = useUserProfile();
  const [year, setYear] = useState("1995");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("none");
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [calendarType, setCalendarType] = useState("solar");
  const [gender, setGender] = useState("남");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TodayTab>("summary");
  const resultRef = useRef<HTMLDivElement>(null);

  const isPersonalized = Boolean(result?.dailyReport);
  const personalizedReport = isPersonalized ? (result.dailyReport as DailyFortuneContent) : null;
  const birthKey = `${year}-${month}-${day}-${gender}`;
  const todayLabel = formatTodayLabel();
  const commonPreview = useMemo(() => buildDailyFortuneContent(), []);

  const scrollToPersonalizeForm = () => {
    document.getElementById("personalize")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const persistProfileFromForm = useCallback(() => {
    if (!isValidBirthDate(year, month, day)) return;
    const next: Omit<UserBirthProfile, "savedAt"> = {
      name: profile?.name,
      year,
      month,
      day,
      gender: gender as "남" | "여",
      calendarType: calendarType as UserBirthProfile["calendarType"],
      timeMode,
      slotHour,
      exactHour,
      exactMinute,
    };
    saveProfile(next);
  }, [
    year,
    month,
    day,
    gender,
    calendarType,
    timeMode,
    slotHour,
    exactHour,
    exactMinute,
    profile?.name,
    saveProfile,
  ]);

  const fetchTodayReport = useCallback(
    async (payload: ReturnType<typeof profileToTodayPayload>, scrollToResult = true) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/today", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "분석 실패");
        setResult(json);
        setActiveTab("summary");
        if (scrollToResult) {
          window.setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!profileReady || !profile) return;
    applyProfileToFormState(profile, {
      setYear,
      setMonth,
      setDay,
      setTimeMode,
      setSlotHour,
      setExactHour,
      setExactMinute,
      setCalendarType,
      setGender,
    });
  }, [profile, profileReady]);

  const autoLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!profileReady || !profile) return;
    if (autoLoadedRef.current === profile.savedAt) return;
    autoLoadedRef.current = profile.savedAt;
    fetchTodayReport(profileToTodayPayload(profile), true);
  }, [profile, profileReady, fetchTodayReport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidBirthDate(year, month, day)) {
      setError("생년월일을 숫자로 정확히 입력해주세요.");
      return;
    }

    persistProfileFromForm();

    let hour: number | undefined;
    let minute: number | undefined;
    if (timeMode === "exact") {
      hour = exactHour;
      minute = exactMinute;
    } else if (timeMode === "slot") {
      hour = slotHour;
      minute = 0;
    }

    await fetchTodayReport({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour,
      minute,
      isLunar: calendarType !== "solar",
      gender,
    });
  };

  const statItems: Omit<TodayStatItem, "score">[] = result
    ? [
        { label: "재물운", key: "wealth", color: "#8B6F47", emoji: "" },
        { label: "애정운", key: "love", color: "#8B6F47", emoji: "" },
        { label: "직장운", key: "career", color: "#8B6F47", emoji: "" },
        { label: "건강운", key: "health", color: "#8B6F47", emoji: "" },
        { label: "행운", key: "luck", color: "#8B6F47", emoji: "" },
      ]
    : [];

  const personalizeForm = (
    <TodayPersonalizeForm
      year={year}
      month={month}
      day={day}
      timeMode={timeMode}
      slotHour={slotHour}
      exactHour={exactHour}
      exactMinute={exactMinute}
      calendarType={calendarType}
      gender={gender}
      loading={loading}
      error={error}
      isPersonalized={isPersonalized}
      onYearChange={setYear}
      onMonthChange={setMonth}
      onDayChange={setDay}
      onTimeModeChange={setTimeMode}
      onSlotHourChange={setSlotHour}
      onExactHourChange={setExactHour}
      onExactMinuteChange={setExactMinute}
      onCalendarTypeChange={setCalendarType}
      onGenderChange={setGender}
      onSubmit={handleSubmit}
    />
  );

  return (
    <div className="space-y-10">
      {!isPersonalized && (
        <>
          {profile && loading ? (
            <div className="rounded-[24px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-8 text-center">
              <p className="text-sm font-semibold text-[#8B6F47]">{displayName}의 오늘 흐름을 읽는 중…</p>
            </div>
          ) : profile ? (
            <StoredProfileBar
              profile={profile}
              subtitle="저장된 사주 기준으로 자동 분석합니다"
              onEdit={scrollToPersonalizeForm}
            />
          ) : (
            <TodayEmptyState
              dateLabel={todayLabel}
              toneLabel={commonPreview.toneLabel}
              sentence={commonPreview.sentence}
              onScrollToForm={scrollToPersonalizeForm}
            />
          )}
          {personalizeForm}
        </>
      )}

      {isPersonalized && personalizedReport && (
        <div ref={resultRef} className="space-y-6">
          <section aria-label="나의 오늘의 흐름" className="space-y-6">
            <div className="rounded-[24px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-4">
              <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">MY TODAY</p>
              <h2 className="mt-1 text-xl text-[#2F282B] sm:text-2xl" style={{ fontFamily: "Jua, sans-serif" }}>
                {profile ? `${displayName}의 오늘` : "나의 오늘의 흐름"}
              </h2>
              <p className="mt-1 text-sm text-[#8A7E78]">{todayLabel}</p>
            </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-pdf-ignore>
            <p className="text-sm text-[#5A4E48]">점수 · 어제 비교 · 상세 리포트</p>
            <div id="today-share-actions" className="flex w-full flex-nowrap gap-1 sm:w-auto sm:min-w-[340px] sm:gap-2">
              <PdfButton targetRef={resultRef} fileName="today-fortune" />
              <ShareButton targetRef={resultRef} fileName="today-fortune" />
            </div>
          </div>

        {isPersonalized && personalizedReport && (
          <div
            className="rounded-xl border border-[#E2D7D0] bg-white/95 p-0.5 shadow-[0_6px_18px_rgba(61,51,56,0.05)] backdrop-blur sm:sticky sm:top-16 sm:z-10 sm:rounded-2xl sm:p-1"
            data-pdf-ignore
          >
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm ${
                    activeTab === tab.key
                      ? "bg-[#2F282B] text-white"
                      : "text-[#8A7E78] hover:bg-[#FAF8F5] hover:text-[#3D3338]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isPersonalized && personalizedReport && activeTab === "summary" && (
          <TodayFiveCardReport
            report={personalizedReport}
            mode="personalized"
            result={result}
            birthKey={birthKey}
            dateLabel={todayLabel}
          />
        )}

        {isPersonalized && activeTab === "detail" && (
          <div className="space-y-6">
            <TodayBriefingReport result={result} />
            <DomainScoreSummary domains={result.domainScores} />
            <TodayStatsSection
              overall={result.scores.overall}
              items={statItems.map((item) => ({
                ...item,
                score: result.scores[item.key],
              }))}
            />
            <DetailedFortuneReport items={result.detailedFortunes} />
            {result.hourlyFlow && (
              <HourlyFlowSection
                hourlyFlow={result.hourlyFlow}
                hourlyFlowIntro={result.hourlyFlowIntro}
                hourlyPeak={result.hourlyPeak}
                hourlyCaution={result.hourlyCaution}
              />
            )}
            <TimeAdviceSection items={result.timeAdvice ?? []} />
            <TodayActionGuideSection
              dos={result.todayDos}
              donts={result.todayDonts}
              dosDetailed={result.todayDosDetailed}
              dontsDetailed={result.todayDontsDetailed}
              luckyItems={result.luckyItems}
              tip={result.tip}
              warning={result.warning}
              sipsinTitle={result.sipsinTitle}
            />
          </div>
        )}

        {isPersonalized && activeTab === "myeongsik" && (
          <div className="space-y-6">
            <MyeongsikReport report={result.myeongsikReport} />
            {(result.sajuTriggers?.length > 0 || result.gearAnalysis?.length > 0) && (
              <SajuTriggerSection
                intro={result.sajuTriggerIntro}
                triggers={result.sajuTriggers?.length ? result.sajuTriggers : []}
                pillars={result.pillars}
              />
            )}
          </div>
        )}
          </section>
        </div>
      )}

      {isPersonalized && (
        <>
          <div className="border-t border-[#E2D7D0] pt-2" aria-hidden="true" />
          {personalizeForm}
        </>
      )}
    </div>
  );
}
