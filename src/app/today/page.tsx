"use client";

import { useRef, useState } from "react";
import ShareButton from "@/components/ShareButton";
import PdfButton from "@/components/PdfButton";
import BirthDateNumberInputs, { isValidBirthDate } from "@/components/BirthDateNumberInputs";
import HourlyFlowSection from "@/components/HourlyFlowSection";
import SajuTriggerSection from "@/components/SajuTriggerSection";
import TodayStatsSection, { type TodayStatItem } from "@/components/TodayStatsSection";
import TimeAdviceSection from "@/components/TimeAdviceSection";
import TodayActionGuideSection from "@/components/TodayActionGuideSection";
import TodayFiveCardReport from "@/components/TodayFiveCardReport";
import type { DailyFortuneContent } from "@/lib/today-content-engine";


const TIME_SLOTS = [
  { value: 23, label: "자시 (23:00~01:00)" },
  { value: 1, label: "축시 (01:00~03:00)" },
  { value: 3, label: "인시 (03:00~05:00)" },
  { value: 5, label: "묘시 (05:00~07:00)" },
  { value: 7, label: "진시 (07:00~09:00)" },
  { value: 9, label: "사시 (09:00~11:00)" },
  { value: 11, label: "오시 (11:00~13:00)" },
  { value: 13, label: "미시 (13:00~15:00)" },
  { value: 15, label: "신시 (15:00~17:00)" },
  { value: 17, label: "유시 (17:00~19:00)" },
  { value: 19, label: "술시 (19:00~21:00)" },
  { value: 21, label: "해시 (21:00~23:00)" },
];

const TAB_ITEMS = [
  { key: "summary", label: "요약" },
  { key: "detail", label: "상세" },
  { key: "myeongsik", label: "명식" },
] as const;

const SAMPLE_GAUGES = [
  { label: "관계", score: 78 },
  { label: "결정", score: 70 },
  { label: "감정 안정", score: 65 },
];

type TodayTab = (typeof TAB_ITEMS)[number]["key"];

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

export default function TodayPage() {
  // 폼 상태
  const [year, setYear] = useState("1995");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("none");
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [calendarType, setCalendarType] = useState("solar");
  const [gender, setGender] = useState("남");

  // 결과 상태
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TodayTab>("summary");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!isValidBirthDate(year, month, day)) {
      setError("생년월일을 숫자로 정확히 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      let hour: number | undefined;
      let minute: number | undefined;

      if (timeMode === "exact") {
        hour = exactHour;
        minute = exactMinute;
      } else if (timeMode === "slot") {
        hour = slotHour;
        minute = 0;
      }

      const res = await fetch("/api/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(year), month: Number(month), day: Number(day), hour, minute,
          isLunar: calendarType !== "solar", gender,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "분석 실패");
      setResult(json);
      setActiveTab("summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(61,51,56,0.05)]">
        <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-2">TODAY REPORT</p>
        <h1 style={{ fontFamily: "Jua, sans-serif" }} className="text-2xl text-[#2F282B]">
          오늘의 흐름
        </h1>
        <p className="text-[#8A7E78] text-sm mt-1">
          생년월일을 입력하면 오늘의 해석을 5장의 리포트로 정리합니다.
        </p>
      </div>

      {!result && (
        <section className="relative overflow-hidden rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-6 shadow-[0_14px_38px_rgba(61,51,56,0.06)]">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#F1E7DE]" />
          <div className="absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-[#FAF8F5]" />
          <div className="relative">
            <p className="mb-2 text-xs font-bold tracking-[0.14em] text-[#8B6F47]">TODAY PREVIEW</p>
            <h2 className="text-2xl text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
              오늘의 흐름은 이렇게 읽힙니다
            </h2>
            <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-4">
              <div className="pointer-events-none absolute inset-x-4 bottom-4 top-16 rounded-2xl bg-white/35 backdrop-blur-[1.5px]" />
              <div className="relative">
                <p className="text-lg leading-relaxed text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
                  결정은 오후가 유리하고, 말 한마디가 운을 좌우합니다.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {SAMPLE_GAUGES.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[#E2D7D0] bg-white/85 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold text-[#6B5E58]">{item.label}</p>
                        <p className="text-xs font-bold text-[#8B6F47]">{item.score}</p>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-[#EDE4DC]">
                        <div className="h-full rounded-full bg-[#8B6F47]" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-[#8A7E78]">입력 후 내 사주 기준으로 다시 읽힙니다</p>
              </div>
            </div>
            <p className="mt-4 rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3 text-sm leading-relaxed text-[#5A4E48]">
              생년월일을 입력하면 내 사주 기준 5카드 리포트가 열립니다.
            </p>
          </div>
        </section>
      )}

      {/* ────────── 입력 폼 (사주보기와 동일 구조) ────────── */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 년 / 월 / 일 */}
          <BirthDateNumberInputs
            year={year}
            month={month}
            day={day}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
          />

          {/* 출생시간 — 사주보기와 동일한 3가지 모드 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>출생시간</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setTimeMode("none")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "none" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>
                모름
              </button>
              <button type="button" onClick={() => setTimeMode("slot")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "slot" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>
                시간대 선택
              </button>
              <button type="button" onClick={() => setTimeMode("exact")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "exact" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>
                시/분 직접입력
              </button>
            </div>

            {/* 시간대 선택 모드 */}
            {timeMode === "slot" && (
              <select value={slotHour} onChange={e => setSlotHour(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#B8A78D] outline-none transition-colors">
                {TIME_SLOTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}

            {/* 시/분 직접입력 모드 */}
            {timeMode === "exact" && (
              <div className="bg-[#FAF8F5] border border-[#E2D7D0] rounded-xl p-4 space-y-3">
                <p className="text-xs text-[#8A7E78]">
                  정확한 출생 시각을 입력하면 시주까지 포함한 정밀 분석이 가능합니다.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#8A7E78] mb-1 font-medium">시</label>
                    <select value={exactHour} onChange={e => setExactHour(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#E8D9C8] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#B8A78D] outline-none">
                      {Array.from({ length: 24 }, (_, i) => i).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[#8A7E78] font-bold text-xl mt-5">:</span>
                  <div className="flex-1">
                    <label className="block text-xs text-[#8A7E78] mb-1 font-medium">분</label>
                    <select value={exactMinute} onChange={e => setExactMinute(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#E8D9C8] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#B8A78D] outline-none">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 달력 / 성별 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>달력</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCalendarType("solar")}
  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "solar" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white text-[#8A7E78] border-[#D9C8C0] hover:border-[#8B6F47]"}`}>
  양력
</button>

                <button type="button" onClick={() => setCalendarType("lunar")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "lunar" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white text-[#8A7E78] border-[#D9C8C0] hover:border-[#8B6F47]"}`}>
                  음력
                </button>
              <button type="button" onClick={() => setCalendarType("lunarLeap")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "lunarLeap" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white text-[#8A7E78] border-[#D9C8C0] hover:border-[#8B6F47]"}`}>
                윤달
              </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>성별</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setGender("남")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${gender === "남" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white text-[#8A7E78] border-[#D9C8C0] hover:border-[#8B6F47]"}`}>
                남
                </button>
                <button type="button" onClick={() => setGender("여")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${gender === "여" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white text-[#8A7E78] border-[#D9C8C0] hover:border-[#8B6F47]"}`}>
                여
                </button>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button type="submit" disabled={loading}
  className="w-full py-3.5 rounded-2xl text-white text-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
  style={{ 
    background: "#2F282B",
    fontFamily: "Jua, sans-serif" 
  }}>

            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                분석 중...
              </span>
            ) : "오늘의 흐름 읽기"}
          </button>
        </form>
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {/* ────────── 결과 영역 ────────── */}
      {result && (
        <div ref={resultRef} className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-pdf-ignore>
            <div>
              <p className="text-xs tracking-[0.12em] text-[#B8A78D]">TODAY REPORT</p>
              <p className="text-sm text-[#5A4E48]">5카드 리포트 · 점수와 흐름을 함께 읽습니다</p>
            </div>
            <div id="today-share-actions" className="flex w-full flex-nowrap gap-1 sm:w-auto sm:min-w-[340px] sm:gap-2">
              <PdfButton targetRef={resultRef} fileName="today-fortune" />
              <ShareButton targetRef={resultRef} fileName="today-fortune" />
            </div>
          </div>

          <div className="rounded-xl border border-[#E2D7D0] bg-white/95 p-0.5 shadow-[0_6px_18px_rgba(61,51,56,0.05)] backdrop-blur sm:sticky sm:top-16 sm:z-10 sm:rounded-2xl sm:p-1" data-pdf-ignore>
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

          {activeTab === "summary" && result.dailyReport && (
            <TodayFiveCardReport
              report={result.dailyReport as DailyFortuneContent}
              result={result}
              birthKey={`${year}-${month}-${day}-${gender}`}
            />
          )}

          {activeTab === "detail" && (
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

          {activeTab === "myeongsik" && (
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
        </div>
      )}
    </div>
  );
}