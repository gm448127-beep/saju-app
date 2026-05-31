"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StoredProfileBar from "@/components/StoredProfileBar";
import { useUserProfile } from "@/components/UserProfileProvider";
import ShareButton from "@/components/ShareButton";
import PdfButton from "@/components/PdfButton";
import TodayPageHeader from "@/components/today/TodayPageHeader";
import TodayPersonalizeForm, { isValidBirthDate } from "@/components/TodayPersonalizeForm";
import TodaySecretaryReport from "@/components/today/TodaySecretaryReport";
import { formatKstDateLabel } from "@/lib/kst-date";
import type { DailyFortuneContent } from "@/lib/today-content-engine";
import {
  consumeOnboardingInputTarget,
  ONBOARDING_INPUT_TARGET_TODAY,
} from "@/lib/onboarding-storage";
import {
  birthKeyFromTodayPayload,
  type TodayFetchPayload,
} from "@/lib/today-score-display";
import {
  applyProfileToBirthForm,
  profileBirthTimeSummary,
  profileToBirthKey,
  profileToTodayPayload,
  type UserBirthProfile,
} from "@/lib/user-profile-storage";

function formatTodayLabel(date = new Date()) {
  const label = formatKstDateLabel(date);
  const m = label.match(/^(\d+)년 (\d+)월 (\d+)일 \((.)요일\)$/);
  if (!m) return label;
  return `${m[1]}.${String(m[2]).padStart(2, "0")}.${String(m[3]).padStart(2, "0")} (${m[4]})`;
}

function applyProfileToFormState(
  profile: UserBirthProfile,
  setters: Parameters<typeof applyProfileToBirthForm>[1],
) {
  applyProfileToBirthForm(profile, setters);
}

export default function TodayPage() {
  const { profile, saveProfile, displayName, isReady: profileReady } = useUserProfile();
  const [year, setYear] = useState("1995");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("slot");
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [calendarType, setCalendarType] = useState("solar");
  const [gender, setGender] = useState("남");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const formPayload = useMemo((): TodayFetchPayload => {
    let hour: number | undefined;
    let minute: number | undefined;
    if (timeMode === "exact") {
      hour = exactHour;
      minute = exactMinute;
    } else if (timeMode === "slot") {
      hour = slotHour;
      minute = 0;
    }
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour,
      minute,
      isLunar: calendarType !== "solar",
      gender,
    };
  }, [
    year,
    month,
    day,
    timeMode,
    slotHour,
    exactHour,
    exactMinute,
    calendarType,
    gender,
  ]);

  const isPersonalized = Boolean(result?.dailyReport);
  const personalizedReport = isPersonalized ? (result.dailyReport as DailyFortuneContent) : null;
  const birthKey = useMemo(() => {
    if (profile) return profileToBirthKey(profile);
    return birthKeyFromTodayPayload(formPayload);
  }, [profile, formPayload]);
  const todayLabel = formatTodayLabel();
  const [highlightPersonalize, setHighlightPersonalize] = useState(false);

  const scrollToPersonalizeForm = useCallback(() => {
    document.getElementById("personalize")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    let scrollTimer: ReturnType<typeof window.setTimeout> | undefined;
    let highlightTimer: ReturnType<typeof window.setTimeout> | undefined;

    const fromIntro =
      consumeOnboardingInputTarget() === ONBOARDING_INPUT_TARGET_TODAY;
    const fromHash = window.location.hash === "#personalize";

    if (fromIntro || fromHash) {
      setHighlightPersonalize(true);
      scrollTimer = window.setTimeout(() => {
        scrollToPersonalizeForm();
        highlightTimer = window.setTimeout(() => setHighlightPersonalize(false), 2400);
      }, fromIntro ? 120 : 0);
    }

    const onHashChange = () => {
      if (window.location.hash === "#personalize") scrollToPersonalizeForm();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      if (highlightTimer) window.clearTimeout(highlightTimer);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [scrollToPersonalizeForm]);

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
    await fetchTodayReport(formPayload);
  };

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
      highlighted={highlightPersonalize}
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
    <>
      {!isPersonalized && (
        <div className="-my-6 flex h-[calc(100dvh-3.5rem)] flex-col">
          {profile && loading ? (
            <div className="mb-3 shrink-0 rounded-[24px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-5 text-center">
              <p className="text-sm font-semibold text-[#8B6F47]">{displayName}의 오늘 흐름을 읽는 중…</p>
            </div>
          ) : profile ? (
            <div className="mb-3 shrink-0">
              <StoredProfileBar
                profile={profile}
                subtitle={`한국 시간 기준 오늘 · ${profileBirthTimeSummary(profile)} · PC·폰 프로필이 같으면 결과도 같습니다`}
                onEdit={scrollToPersonalizeForm}
              />
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col">
            {personalizeForm}
          </div>
        </div>
      )}

      {isPersonalized && (
        <div className="space-y-10">
          {personalizedReport && (
            <div ref={resultRef} className="space-y-6">
              <section aria-label="나의 오늘의 흐름" className="space-y-6">
                <TodayPageHeader
                  title={profile ? `${displayName}의 오늘` : "나의 오늘"}
                  dateLabel={todayLabel}
                  subtitle="흐름 → 타이밍 → 실수 장면 → 비서 제안까지 무료로 읽고, 아래에서 상세 리포트를 확인하세요."
                />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-pdf-ignore>
                  <p className="text-sm text-[#5A4E48]">저장 · 공유 · PDF</p>
                  <div
                    id="today-share-actions"
                    className="flex w-full flex-nowrap gap-1 sm:w-auto sm:gap-2"
                    data-pdf-ignore
                  >
                    <PdfButton targetRef={resultRef} fileName="today-fortune" />
                    <ShareButton targetRef={resultRef} fileName="today-fortune" />
                  </div>
                </div>

                <TodaySecretaryReport
                  report={personalizedReport}
                  result={result}
                  birthKey={birthKey}
                  dateLabel={todayLabel}
                />
              </section>
            </div>
          )}

          <div className="border-t border-[#E2D7D0] pt-2" aria-hidden="true" />
          {personalizeForm}
        </div>
      )}
    </>
  );
}
