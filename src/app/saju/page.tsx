"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildDailyFortuneContent } from "@/lib/today-content-engine";
import ShareButton from "@/components/ShareButton";
import BirthDateNumberInputs, { isValidBirthDate } from "@/components/BirthDateNumberInputs";
import OhaengChart from "@/components/OhaengChart";
import { buildSajuBirthKey, saveSajuRecord } from "@/lib/archive-storage";
import { matchCharacter, findStrongestSipsin } from "@/data/matchCharacter";
import { Character } from "@/data/characters";
import { CHEONGAN_DICT, GYEOK_DICT, STRENGTH_DICT, GONGMANG_DICT, GILSIN_DICT, HYUNGSIN_DICT, OHAENG_DICT } from "@/data/wisdomDict";




interface PillarData {
  label: string;
  sky: string; earth: string;
  skyKo: string; earthKo: string;
  skyElement: string; earthElement: string;
  skyEmoji: string; earthEmoji: string;
  skyColor: string; earthColor: string;
  skyEum?: string; earthEum?: string;
  tenGodSky: string; tenGodEarth: string;
  stage12: string; stage12Bong?: string; stage12Geo?: string;
  hiddenStems?: { yeogi: string | null; junggi: string | null; jeonggi: string | null };
}

interface SajuResult {
  birthDate: string; birthTime: string; gender: string; age: number;
  ddi: { emoji: string; name: string; hanja: string };
  eumyang: string; dayGan: string; mainElement: string;
  strength: string; strengthScore?: number; gyeok: string; yongshin: string;
  gilsin?: string[]; hyungsin?: string[]; interpretation?: string;
  pillars: { hour: PillarData; day: PillarData; month: PillarData; year: PillarData };
  ohaengCount: Record<string, number>;
  ohaengAnalysis?: Array<{ name: string; count: number; desc: string }>;
  sipsinCount: Record<string, number>;
  sipsinAnalysis?: Array<{ name: string; count: number; desc: string }>;
  personality: string;
  stemRelations?: Array<{ type: string; desc: string; pillars: string[]; stems: string[] }>;
  branchRelations?: Array<{ type: string; details: Record<string, string> }>;
  salsSummary?: Array<{ pillar: string; twelveSal: string; specialSals: string[] }>;
  gongmang?: string;
  summary: string; compactText: string; markdownText: string;
  daeun?: Array<{ age: number; endAge?: number; ganzhi?: string; gan: string; ji: string; ganKo: string; jiKo: string; tenGodStem?: string; tenGodBranch?: string; stage12?: string; sal?: string[] }>;
  daeunStartAge?: number;
  daeunCurrent?: { age: number; ganzhi: string; ganKo: string; jiKo: string } | null;
  seyun?: Array<{ year: number; ganzhi?: string; gan: string; ji: string; ganKo: string; jiKo: string; tenGodStem?: string; tenGodBranch?: string; stage12?: string }>;
  wolun?: Array<{ month: number; monthName?: string; ganzhi?: string; gan: string; ji: string; ganKo: string; jiKo: string; tenGodStem?: string; tenGodBranch?: string; stage12?: string }>;
}

const timeSlots = [
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

const RELATION_GUIDE: Record<string, { title: string; desc: string; advice: string; tone: "good" | "caution" | "neutral" }> = {
  합: {
    title: "서로 끌어당겨 하나로 묶이는 관계",
    desc: "사람, 일, 기회가 자연스럽게 연결되는 힘입니다. 협업이나 약속, 관계 형성에 도움이 됩니다.",
    advice: "좋은 제안이 오면 바로 끊지 말고 조건을 차분히 살펴보세요.",
    tone: "good",
  },
  충: {
    title: "서로 부딪히며 변화를 만드는 관계",
    desc: "이동, 변화, 갈등, 결단이 생기기 쉬운 흐름입니다. 답답한 상황을 깨는 힘도 있지만 급하면 마찰이 커집니다.",
    advice: "중요한 결정은 한 번 더 확인하고, 말은 짧고 분명하게 하세요.",
    tone: "caution",
  },
  육합: {
    title: "부드럽게 협력하는 짝궁 관계",
    desc: "두 지지가 서로 손을 잡는 관계입니다. 인간관계, 도움, 협력운이 살아납니다.",
    advice: "혼자 밀어붙이기보다 누군가와 같이 움직이면 결과가 좋아집니다.",
    tone: "good",
  },
  삼합: {
    title: "목표가 모여 큰 흐름을 만드는 관계",
    desc: "세 지지가 한 방향으로 힘을 모으는 강한 결합입니다. 장기 목표나 팀워크에 유리합니다.",
    advice: "큰 계획은 관련 사람들과 방향을 맞추는 데서 시작하세요.",
    tone: "good",
  },
  반합: {
    title: "완성 전이지만 서로 돕는 관계",
    desc: "삼합의 일부가 맞은 상태입니다. 완전한 결실 전 단계라 가능성과 도움운이 있습니다.",
    advice: "아직 부족한 한 조각을 채우면 일이 더 잘 풀립니다.",
    tone: "good",
  },
  방합: {
    title: "같은 계절의 기운이 모이는 관계",
    desc: "비슷한 성향과 환경의 힘이 모입니다. 한 분야에 집중력이 생기지만 고집도 강해질 수 있습니다.",
    advice: "한 방향으로 몰아붙이되, 주변 의견을 한 번은 확인하세요.",
    tone: "neutral",
  },
  형: {
    title: "불편함과 압박이 생기는 관계",
    desc: "마음이 예민해지고 작은 문제가 반복되기 쉬운 흐름입니다. 규칙, 책임, 스트레스 관리가 중요합니다.",
    advice: "불편한 일을 미루지 말고 절차대로 정리하세요.",
    tone: "caution",
  },
  파: {
    title: "작은 균열과 방해가 생기는 관계",
    desc: "계획이 살짝 틀어지거나 약속이 어긋날 수 있습니다. 큰 문제보다 작은 변수에 주의해야 합니다.",
    advice: "일정, 금액, 메시지처럼 세부 사항을 확인하세요.",
    tone: "caution",
  },
  해: {
    title: "보이지 않는 오해가 생기기 쉬운 관계",
    desc: "겉으로 크게 부딪히지는 않아도 마음속 불편함이나 서운함이 쌓일 수 있습니다.",
    advice: "짐작으로 판단하지 말고 직접 물어보는 편이 안전합니다.",
    tone: "caution",
  },
  원진: {
    title: "감정이 꼬이기 쉬운 관계",
    desc: "끌림과 불편함이 함께 나타날 수 있습니다. 가까운 관계에서 서운함이 커지기 쉽습니다.",
    advice: "감정이 올라올 때 바로 결론 내리지 말고 시간을 두세요.",
    tone: "caution",
  },
  귀문: {
    title: "예민한 직감과 생각이 강해지는 관계",
    desc: "감각이 섬세해지고 생각이 깊어지는 흐름입니다. 창작과 연구에는 좋지만 과한 의심은 피해야 합니다.",
    advice: "떠오르는 생각은 메모하되, 사실 확인 전에는 단정하지 마세요.",
    tone: "neutral",
  },
};

const SAL_GUIDE: Record<string, { title: string; desc: string; advice: string; tone: "good" | "caution" | "neutral" }> = {
  장성살: { title: "리더십과 주도권", desc: "앞에 서서 책임지는 힘입니다. 사람을 이끌거나 기준을 세우는 데 강점이 있습니다.", advice: "주도하되 독단적으로 보이지 않게 의견을 나누세요.", tone: "good" },
  반안살: { title: "인정과 안정", desc: "자리가 잡히고 주변의 도움을 얻기 쉬운 기운입니다.", advice: "평판과 신뢰를 쌓는 일을 우선하세요.", tone: "good" },
  역마살: { title: "이동과 변화", desc: "움직임이 많고 새로운 환경과 연결되기 쉬운 기운입니다.", advice: "이동, 출장, 새 시도는 좋지만 무리한 일정은 줄이세요.", tone: "neutral" },
  도화살: { title: "매력과 인기", desc: "사람들의 시선을 끌고 관계가 활발해지는 기운입니다.", advice: "표현은 좋지만 가벼운 오해가 생기지 않게 선을 지키세요.", tone: "good" },
  화개살: { title: "몰입과 예술성", desc: "혼자 깊이 파고드는 힘입니다. 공부, 창작, 종교성, 전문성에 강합니다.", advice: "혼자만의 시간을 생산적으로 쓰면 좋습니다.", tone: "neutral" },
  재살: { title: "돌발 변수 주의", desc: "갑작스러운 지출, 실수, 일정 변경에 주의가 필요한 기운입니다.", advice: "중요한 일은 보험처럼 대안을 하나 준비하세요.", tone: "caution" },
  천살: { title: "외부 압력과 큰 흐름", desc: "내 뜻만으로 조절하기 어려운 흐름이 들어올 수 있습니다.", advice: "무리하게 맞서기보다 상황을 읽고 타이밍을 보세요.", tone: "caution" },
  지살: { title: "이동과 현장성", desc: "가만히 있기보다 움직일 때 정보와 기회가 생기는 기운입니다.", advice: "필요한 곳에는 직접 가서 확인하는 편이 좋습니다.", tone: "neutral" },
  월살: { title: "막힘 뒤의 조정", desc: "바로 풀리지 않아도 방향을 바꾸면 길이 생기는 기운입니다.", advice: "정면 돌파보다 우회로를 찾아보세요.", tone: "caution" },
  망신살: { title: "구설과 노출 주의", desc: "말이나 행동이 평소보다 크게 드러날 수 있습니다.", advice: "공개적인 자리에서는 표현을 부드럽게 조절하세요.", tone: "caution" },
  겁살: { title: "손실과 빼앗김 주의", desc: "돈, 시간, 에너지가 새기 쉬운 기운입니다.", advice: "계약, 결제, 부탁은 조건을 분명히 하세요.", tone: "caution" },
  육해살: { title: "작은 방해와 피로", desc: "사소한 문제들이 겹쳐 피로가 쌓일 수 있습니다.", advice: "작은 일을 빨리 정리하고 무리한 약속을 줄이세요.", tone: "caution" },
  월덕귀인: { title: "어려움을 부드럽게 풀어주는 귀인", desc: "막힌 상황에서 도움과 완충 작용이 들어오는 길한 기운입니다.", advice: "도움을 받을 수 있는 사람에게 먼저 정중히 요청하세요.", tone: "good" },
  천을귀인: { title: "귀인의 도움", desc: "중요한 순간에 사람의 도움이나 좋은 조언이 들어오기 쉽습니다.", advice: "혼자 끙끙대지 말고 믿을 만한 사람에게 상의하세요.", tone: "good" },
  문창귀인: { title: "공부와 문서 재능", desc: "학습, 글쓰기, 문서, 기획에서 재능이 살아나는 기운입니다.", advice: "정리한 내용을 글이나 자료로 남기면 좋습니다.", tone: "good" },
  학당귀인: { title: "배움과 전문성", desc: "공부, 자격, 연구처럼 배움의 운이 깊어지는 기운입니다.", advice: "꾸준히 익혀야 하는 분야에 시간을 배분하세요.", tone: "good" },
  천주귀인: { title: "먹을 복과 생활 안정", desc: "생활 기반, 먹을 복, 주변의 보살핌과 관련된 길한 기운입니다.", advice: "감사 표현과 생활 리듬 관리가 복을 키웁니다.", tone: "good" },
};

const PILLAR_LABELS: Record<string, string> = {
  year: "연주",
  month: "월주",
  day: "일주",
  hour: "시주",
};

function getGuide<T extends { title: string; desc: string; advice: string; tone: "good" | "caution" | "neutral" }>(
  dict: Record<string, T>,
  key: string
) {
  return dict[key] || {
    title: "개별 해석이 필요한 기운",
    desc: "원국 안에서 특정 작용이 나타난다는 뜻입니다. 전체 사주 흐름과 함께 보아야 정확합니다.",
    advice: "좋고 나쁨으로 단정하기보다 어느 자리에서 작용하는지 함께 살펴보세요.",
    tone: "neutral" as const,
  };
}

function toneClass(tone: "good" | "caution" | "neutral") {
  if (tone === "good") return "border-[#C9DBCE] bg-[#F7FBF8] text-[#2F6B45]";
  if (tone === "caution") return "border-[#E6CCC3] bg-[#FFF8F5] text-[#8A4A3D]";
  return "border-[#E2D7D0] bg-white text-[#5A4E48]";
}

function formatRelationDetail(key: string, value: string) {
  const label = PILLAR_LABELS[key] || key;
  return `${label}: ${value}`;
}

export default function SajuPage() {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("1995");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("none");
  const [slotValue, setSlotValue] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [gender, setGender] = useState<"남" | "여">("여");
  const [calendarType, setCalendarType] = useState("solar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);
  const todayFortune = useMemo(() => buildDailyFortuneContent(), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setResult(null);
    if (!isValidBirthDate(year, month, day)) {
      setError("생년월일을 숫자로 정확히 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      let sendHour: number | undefined;
      let sendMinute: number | undefined;
      if (timeMode === "exact") { sendHour = exactHour; sendMinute = exactMinute; }
      else if (timeMode === "slot") { sendHour = slotValue; sendMinute = 0; }

      const res = await fetch("/api/saju", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, year: Number(year), month: Number(month), day: Number(day), hour: sendHour, minute: sendMinute, gender, isLunar: calendarType !== "solar" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!result) return;
    saveSajuRecord({
      savedAt: new Date().toISOString(),
      birthKey: buildSajuBirthKey(name, year, month, day, gender),
      name: name || "이름 없음",
      birthDate: result.birthDate,
      dayGan: result.dayGan,
      gyeok: result.gyeok,
      mainElement: result.mainElement,
      summary: result.summary?.slice(0, 160) || result.personality?.slice(0, 160) || "사주 리포트",
    });
  }, [result, name, year, month, day, gender]);

  function ohaengColor(name: string) {
    const map: Record<string, string> = { "목(木)": "#22c55e", "화(火)": "#ef4444", "토(土)": "#eab308", "금(金)": "#a3a3a3", "수(水)": "#3b82f6" };
    return map[name] || "#888";
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(61,51,56,0.05)]">
        <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-2">나를 이해하는 기본 리포트</p>
        <h1 style={{ fontFamily: "Jua, sans-serif" }} className="text-2xl text-[#2F282B]">사주팔자 분석</h1>
        <p className="text-[#8A7E78] text-sm mt-1">생년월일시를 입력하면 사주 원국과 주요 흐름을 정리합니다.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-3">
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className="w-full p-2 rounded-lg border border-[#D9C8C0] text-[#3D3338] text-sm focus:outline-none focus:border-[#EAE5DA]" style={{ fontFamily: "Jua, sans-serif" }} />
            </div>
          <BirthDateNumberInputs
            year={year}
            month={month}
            day={day}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onDayChange={setDay}
          />

          {/* 시간 모드 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>출생시간</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setTimeMode("none")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "none" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>모름</button>
              <button type="button" onClick={() => setTimeMode("slot")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "slot" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>시간대 선택</button>
              <button type="button" onClick={() => setTimeMode("exact")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${timeMode === "exact" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>시/분 직접입력</button>
            </div>
            {timeMode === "slot" && (
              <select value={slotValue} onChange={(e) => setSlotValue(Number(e.target.value))} className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#EAE5DA] outline-none">
                {timeSlots.map((slot) => (<option key={slot.value} value={slot.value}>{slot.label}</option>))}
              </select>
            )}
            {timeMode === "exact" && (
              <div className="bg-[#FAF8F5] border border-[#E2D7D0] rounded-xl p-4 space-y-3">
                <p className="text-xs text-[#8B7968]">정확한 출생 시각을 입력하면 진태양시(서울 기준 약 -32분) 보정이 자동 적용됩니다.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#8B7968] mb-1 font-medium">시</label>
                    <select value={exactHour} onChange={(e) => setExactHour(Number(e.target.value))} className="w-full bg-white border-2 border-[#E2D7D0] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#8B6F47] outline-none">
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (<option key={h} value={h}>{String(h).padStart(2, "0")}시</option>))}
                    </select>
                  </div>
                  <span className="text-[#8A7E78] font-bold text-xl mt-5">:</span>
                  <div className="flex-1">
                    <label className="block text-xs text-[#8B7968] mb-1 font-medium">분</label>
                    <select value={exactMinute} onChange={(e) => setExactMinute(Number(e.target.value))} className="w-full bg-white border-2 border-[#E2D7D0] rounded-xl px-3 py-2.5 text-[#3D3338] text-sm focus:border-[#8B6F47] outline-none">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (<option key={m} value={m}>{String(m).padStart(2, "0")}분</option>))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 양력/음력 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>달력</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setCalendarType("solar")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "solar" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>양력</button>
              <button type="button" onClick={() => setCalendarType("lunar")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "lunar" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>음력</button>
              <button type="button" onClick={() => setCalendarType("lunarLeap")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${calendarType === "lunarLeap" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>윤달</button>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>성별</label>
            <div className="flex gap-2">
            <button type="button" onClick={() => setGender("남")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${gender === "남" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>남</button>
            <button type="button" onClick={() => setGender("여")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${gender === "여" ? "bg-[#FAF8F5] text-[#2F282B] border-[#8B6F47]" : "bg-white border-[#D9C8C0] text-[#8A7E78]"}`}>여</button>
            </div>
          </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-bold text-base transition-all hover:brightness-110 disabled:opacity-50" style={{ fontFamily: "Jua, sans-serif", background: "#2F282B" }}>{loading ? "분석 중 ..." : "사주 분석하기"}</button>
        </form>
      </div>

      {error && <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">{error}</div>}

      {result && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#E2D7D0] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(61,51,56,0.05)]" data-pdf-ignore>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.12em] text-[#B8A78D]">SAJU REPORT</p>
                <p className="text-sm text-[#5A4E48]">사주 결과를 이미지로 저장하거나 공유할 수 있습니다.</p>
              </div>
              <ShareButton targetRef={resultRef} fileName="saju-report" />
            </div>
          </div>

          <div ref={resultRef} className="space-y-5">
            <div className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#E2D7D0] bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#8B6F47]">
                  오늘의 결 · {todayFortune.toneLabel}
                </span>
                <span className="text-[11px] font-bold tracking-[0.14em] text-[#8B6F47]">SAJU TRIGGER</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#5A4E48]">
                사주 원국과 오늘의 흐름이 맞물릴 때의 신호를 읽습니다.
              </p>
            </div>

                  {/* 🌟 캐릭터 카드 (운명비서 핵심 - A 시적·감성형) */}
          {(() => {
            const strongestSipsin = findStrongestSipsin(result.sipsinCount);
            const character: Character = matchCharacter(
              result.dayGan,
              strongestSipsin
            );
            const greetingName = name && name.trim() !== "" ? `${name}님은` : "당신은";

            return (
              <div className="card text-center">
                {/* 이름 인사 */}
                <p
                  className="text-sm mb-4 tracking-wide"
                  style={{
                    fontFamily: "Jua, sans-serif",
                    color: "#8A7E78",
                  }}
                >
                  {greetingName}
                </p>

                                {/* 캐릭터 타이틀 (라인 없는 깔끔한 버전) */}
                <h2
                  className="text-xl md:text-2xl font-bold mb-4"
                  style={{
                    fontFamily: "Jua, sans-serif",
                    color: "#2F282B",
                    letterSpacing: "-0.01em",
                  }}
                >
                  &lsquo;{character.title}&rsquo;
                </h2>


                {/* 설명 */}
                <p
                  className="text-sm md:text-base leading-relaxed px-2"
                  style={{
                    fontFamily: "Jua, sans-serif",
                    color: "#5A4E48",
                  }}
                >
                  {character.description}
                </p>

              </div>
            );
          })()}




         {/* 🎨 기본 정보 - 콤팩트 + 풀이 (음양관 정통 + 운명비서 톤) */}
<div
  className="relative rounded-3xl px-5 py-6 shadow-[0_10px_30px_rgba(61,51,56,0.05)] overflow-hidden bg-white"
  style={{
    border: "1px solid #E2D7D0",
  }}
>
  {/* 상단 별·라인 장식 */}
  <div className="hidden">
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    <div
      className="h-px w-16"
      style={{
        background:
          "linear-gradient(to right, transparent, #B89968, transparent)",
      }}
    />
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
  </div>

  {/* 타이틀 */}
  <div className="text-center mb-2">
    <h2
      className="text-xl font-bold"
      style={{
        fontFamily: "Jua, sans-serif",
        color: "#3D3338",
        letterSpacing: "-0.01em",
      }}
    >
      기본 정보
    </h2>
    <p
      className="text-[10px] mt-0.5"
      style={{
        fontFamily: "'Noto Serif KR', serif",
        color: "#8A7E78",
        letterSpacing: "0.2em",
      }}
    >
      基 本 情 報
    </p>
  </div>

  {/* 중앙 골드 라인 */}
  <div className="hidden">
    <div
      className="h-px w-20"
      style={{
        background:
          "linear-gradient(to right, transparent, #B89968, transparent)",
      }}
    />
  </div>

  {/* 👤 인사 영역 (콤팩트) */}
  <div
    className="rounded-xl px-4 py-3 mb-4 transition-all hover:shadow-md"
    style={{
      background: "#FAF8F5",
      border: "1px solid #E2D7D0",
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      <h3
        className="text-sm font-bold"
        style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}
      >
        {name || "이름 미입력"}
      </h3>
    </div>
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78", minWidth: "60px" }}>
          생년월일
        </span>
        <span style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {result.birthDate}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78", minWidth: "60px" }}>
          출생시간
        </span>
        <span style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {result.birthTime || "미입력"}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {result.gender}
        </span>
        <span style={{ color: "#D4C8B8" }}>·</span>
        <span style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {result.age}세
        </span>
        <span style={{ color: "#D4C8B8" }}>·</span>
        <span style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {result.ddi?.name}띠
          {result.ddi?.hanja && (
            <span
              className="ml-1"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: "#8A7E78",
                fontSize: "0.85em",
              }}
            >
              ({result.ddi.hanja})
            </span>
          )}
        </span>
      </div>
    </div>
  </div>

  {/* 섹션 구분선: 핵심 명식 */}
  <div className="flex items-center justify-center gap-2 my-3">
    <div
      className="h-px flex-1"
      style={{
        background:
          "linear-gradient(to right, transparent, #D4C8B8, transparent)",
      }}
    />
    <span
      className="text-[10px] px-2"
      style={{
        fontFamily: "Jua, sans-serif",
        color: "#B89968",
        letterSpacing: "0.1em",
      }}
    >
      핵심 명식
    </span>
    <div
      className="h-px flex-1"
      style={{
        background:
          "linear-gradient(to right, transparent, #D4C8B8, transparent)",
      }}
    />
  </div>

  {/* 🎯 일간 + 격국 (2열, 콤팩트) */}
  <div className="grid grid-cols-2 gap-2 mb-3">
    {/* 일간 카드 */}
    <div
      className="rounded-xl px-3 py-3 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2D7D0",
      }}
    >
      <div className="flex items-center justify-center gap-1 mb-1">
        <span
          className="text-[11px] font-bold"
          style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}
        >
          일간
        </span>
        <span
          className="text-[9px]"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#A89F95",
            letterSpacing: "0.15em",
          }}
        >
          日 干
        </span>
      </div>
      <div className="text-center mb-1">
        <span
          className="text-3xl font-bold"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#3D3338",
            lineHeight: 1,
          }}
        >
          {result.dayGan?.match(/[\u4e00-\u9fff]/)?.[0] || result.dayGan?.[0]}
        </span>
      </div>
      <p
        className="text-[11px] text-center mb-2"
        style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}
      >
        {result.dayGan?.replace(/[()]/g, " ").trim()}
      </p>
      <div
        className="text-[10px] leading-relaxed pt-2"
        style={{
          fontFamily: "Jua, sans-serif",
          color: "#8A7E78",
          borderTop: "1px dashed #D4C8B8",
        }}
      >
        <span style={{ color: "#B89968", fontWeight: 700 }}>당신의 본성</span>
        <br />
        타고난 성품의 핵심 기운
      </div>
    </div>

    {/* 격국 카드 */}
    {result.gyeok && (
      <div
        className="rounded-xl px-3 py-3 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid #EAE0D5",
        }}
      >
        <div className="flex items-center justify-center gap-1 mb-1">
          <span
            className="text-[11px] font-bold"
            style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}
          >
            격국
          </span>
          <span
            className="text-[9px]"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#A89F95",
              letterSpacing: "0.15em",
            }}
          >
            格 局
          </span>
        </div>
        <div className="text-center mb-2 mt-2">
          <span
            className="text-lg font-bold"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#3D3338",
              lineHeight: 1.1,
            }}
          >
            {result.gyeok}
          </span>
        </div>
        <div
          className="text-[10px] leading-relaxed pt-2"
          style={{
            fontFamily: "Jua, sans-serif",
            color: "#8A7E78",
            borderTop: "1px dashed #D4C8B8",
          }}
        >
          <span style={{ color: "#B89968", fontWeight: 700 }}>사주의 짜임</span>
          <br />
          전체 구조의 특성
        </div>
      </div>
    )}
  </div>

  {/* ⭐ 용신 (한자별 + 종합 풀이) */}
  {((result as any).yongshin || (result as any).yongsin) && (() => {
    const yongshinStr = ((result as any).yongshin || (result as any).yongsin) as string;
    // 한자만 추출 (콤마/공백 제거)
    const yongshinList = yongshinStr
      .split(/[,，\s·]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    return (
      <div
        className="rounded-xl px-4 py-4 mb-3 transition-all hover:shadow-lg cursor-default relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FAF6E8 0%, #F5EBD0 100%)",
          border: "2px solid #B89968",
          boxShadow: "0 4px 12px rgba(184,153,104,0.15)",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-sm">⭐</span>
          <span
            className="text-xs font-bold"
            style={{ fontFamily: "Jua, sans-serif", color: "#8B6F3D" }}
          >
            용신
          </span>
          <span
            className="text-[10px]"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#B89968",
              letterSpacing: "0.15em",
            }}
          >
            用 神
          </span>
        </div>
        <div
          className="text-2xl font-bold text-center mb-3"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#3D3338",
            letterSpacing: "0.15em",
          }}
        >
          {yongshinStr}
        </div>

        {/* 한자별 풀이 */}
        <div className="space-y-1.5 mb-3">
          {yongshinList.map((gan: string, idx: number) => {
            const dict = CHEONGAN_DICT[gan];
            if (!dict) return null;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid rgba(184,153,104,0.2)",
                }}
              >
                <span className="text-base">{dict.emoji}</span>
                <span
                  className="text-base font-bold"
                  style={{
                    fontFamily: "'Noto Serif KR', serif",
                    color: "#3D3338",
                    minWidth: "20px",
                  }}
                >
                  {gan}
                </span>
                <span
                  className="text-[11px]"
                  style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78" }}
                >
                  {dict.meaning}
                </span>
                <span style={{ color: "#D4C8B8" }}>·</span>
                <span
                  className="text-[11px]"
                  style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}
                >
                  {dict.vibe || "이로운 기운"}
                </span>
              </div>
            );
          })}
        </div>

        {/* 종합 풀이 */}
        <div
          className="text-[11px] text-center leading-relaxed pt-2"
          style={{
            fontFamily: "Jua, sans-serif",
            color: "#5A4E48",
            borderTop: "1px dashed #B89968",
          }}
        >
          <span style={{ color: "#8B6F3D", fontWeight: 700 }}>
            나에게 가장 이로운 기운
          </span>
          <br />
          이 기운을 가까이하면 운이 잘 풀려요
        </div>
      </div>
    );
  })()}

  {/* 🎯 신강·신약 + 공망 (2열) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {/* 신강·신약 카드 */}
    {result.strength && (
      <div
        className="rounded-xl px-3 py-3 transition-all hover:shadow-md cursor-default"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid #EAE0D5",
        }}
      >
        <div className="flex items-center justify-center gap-1 mb-2">
          <span
            className="text-[11px] font-bold"
            style={{ fontFamily: "Jua, sans-serif", color: "#B85C4C" }}
          >
            신강·신약
          </span>
          <span
            className="text-[9px]"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#A89F95",
              letterSpacing: "0.15em",
            }}
          >
            身 强 弱
          </span>
        </div>
        <div className="text-center mb-2">
          <span
            className="text-base font-bold"
            style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}
          >
            {result.strength}
          </span>
          {result.strengthScore !== undefined && (
            <span
              className="ml-1.5 text-xs"
              style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78" }}
            >
              {result.strengthScore}점
            </span>
          )}
        </div>
        {/* 게이지 바 */}
        {result.strengthScore !== undefined && (
          <>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "#EAE0D5" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(result.strengthScore, 0), 100)}%`,
                  background:
                    "linear-gradient(to right, #D4C8B8, #B89968, #B85C4C)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span
                className="text-[9px]"
                style={{ fontFamily: "Jua, sans-serif", color: "#A89F95" }}
              >
                신약
              </span>
              <span
                className="text-[9px]"
                style={{ fontFamily: "Jua, sans-serif", color: "#A89F95" }}
              >
                신강
              </span>
            </div>
          </>
        )}
        <div
          className="text-[10px] leading-relaxed pt-2 mt-2"
          style={{
            fontFamily: "Jua, sans-serif",
            color: "#8A7E78",
            borderTop: "1px dashed #D4C8B8",
          }}
        >
          {result.strength === "신강" || result.strength === "매우 신강" ? (
            <>
              <span style={{ color: "#B85C4C", fontWeight: 700 }}>기운이 강한 편</span>
              <br />
              추진력·자신감 ↑, 듣는 자세도 중요
            </>
          ) : result.strength === "신약" || result.strength === "매우 신약" ? (
            <>
              <span style={{ color: "#5C7A9B", fontWeight: 700 }}>기운이 약한 편</span>
              <br />
              신중함·섬세함이 강점
            </>
          ) : (
            <>
              <span style={{ color: "#5C8B6F", fontWeight: 700 }}>균형 잡힌 기운</span>
              <br />
              안정감과 유연성이 매력
            </>
          )}
        </div>
      </div>
    )}

    {/* 공망 카드 */}
    {result.gongmang && (
      <div
        className="rounded-xl px-3 py-3 transition-all hover:shadow-md cursor-default"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid #EAE0D5",
        }}
      >
        <div className="flex items-center justify-center gap-1 mb-2">
          <span
            className="text-[11px] font-bold"
            style={{ fontFamily: "Jua, sans-serif", color: "#8B7AB8" }}
          >
            공망
          </span>
          <span
            className="text-[9px]"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: "#A89F95",
              letterSpacing: "0.15em",
            }}
          >
            空 亡
          </span>
        </div>
        <div
          className="text-base font-bold text-center mb-2"
          style={{
            fontFamily: "'Noto Serif KR', serif",
            color: "#3D3338",
            letterSpacing: "0.1em",
          }}
        >
          {result.gongmang}
        </div>
        <div
          className="text-[10px] leading-relaxed pt-2 mt-2"
          style={{
            fontFamily: "Jua, sans-serif",
            color: "#8A7E78",
            borderTop: "1px dashed #D4C8B8",
          }}
        >
          <span style={{ color: "#8B7AB8", fontWeight: 700 }}>비어있는 자리</span>
          <br />
          해당 시간·인연은 신중하게
        </div>
      </div>
    )}
  </div>

  {/* 하단 별·라인 장식 */}
  <div className="flex items-center justify-center gap-3 mt-5">
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    <div
      className="h-px w-16"
      style={{
        background:
          "linear-gradient(to right, transparent, #B89968, transparent)",
      }}
    />
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
  </div>
</div>



     {/* 📜 사주 원국 (음양관 정통 + 운명비서 톤) */}
<div
  className="relative rounded-3xl px-5 py-7 shadow-[0_10px_30px_rgba(61,51,56,0.05)] overflow-hidden bg-white"
  style={{
    border: "1px solid #E2D7D0",
  }}
>
  {/* 상단 별·라인 */}
  <div className="hidden">
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
  </div>

  {/* 타이틀 */}
  <div className="text-center mb-6">
    <h2
      className="text-2xl font-bold"
      style={{ fontFamily: "Jua, sans-serif", color: "#3D3338", letterSpacing: "-0.01em" }}
    >
      사주 원국
    </h2>
    <p
      className="text-xs mt-1"
      style={{ fontFamily: "'Noto Serif KR', serif", color: "#8A7E78", letterSpacing: "0.2em" }}
    >
      四 柱 原 局
    </p>
  </div>

  {/* 4기둥 그리드 */}
  <div className="grid grid-cols-4 gap-2 md:gap-3">
    {(["hour", "day", "month", "year"] as const).map((key) => {
      const p = result.pillars?.[key];
      if (!p) return null;

      const isDay = key === "day";

      // 한자 라벨 매핑
      const hanjaLabel: Record<string, string> = {
        hour: "時柱",
        day: "日柱",
        month: "月柱",
        year: "年柱",
      };

      // 오행별 정통 색상 (음양관 톤 + 운명비서 채도 조정)
      const elementColorMap: Record<string, { bg: string; text: string }> = {
        "목(木)": { bg: "#5C8B6F", text: "#FFFFFF" },
        "화(火)": { bg: "#B85C4C", text: "#FFFFFF" },
        "토(土)": { bg: "#B89968", text: "#FFFFFF" },
        "금(金)": { bg: "#9B9591", text: "#FFFFFF" },
        "수(水)": { bg: "#3D4A5C", text: "#FFFFFF" },
        "목": { bg: "#5C8B6F", text: "#FFFFFF" },
        "화": { bg: "#B85C4C", text: "#FFFFFF" },
        "토": { bg: "#B89968", text: "#FFFFFF" },
        "금": { bg: "#9B9591", text: "#FFFFFF" },
        "수": { bg: "#3D4A5C", text: "#FFFFFF" },
      };

      const skyColors = elementColorMap[p.skyElement] || { bg: "#8A7E78", text: "#FFFFFF" };
      const earthColors = elementColorMap[p.earthElement] || { bg: "#8A7E78", text: "#FFFFFF" };

      return (
        <div
          key={key}
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            background: "#FFFFFF",
            border: isDay ? "2px solid #B89968" : "1px solid #E2D7D0",
            boxShadow: isDay
              ? "0 4px 12px rgba(184,153,104,0.25)"
              : "0 1px 4px rgba(42,37,32,0.04)",
            transform: isDay ? "translateY(-4px)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          {/* 카드 헤더 - 기둥 라벨 */}
          <div
            className="text-center py-2 px-1"
            style={{
              background: isDay ? "#FAF8F5" : "#FFFFFF",
              borderBottom: "1px solid #E2D7D0",
            }}
          >
            <div
              className="text-[10px] md:text-xs font-bold"
              style={{
                fontFamily: "Jua, sans-serif",
                color: isDay ? "#B89968" : "#5A4E48",
                letterSpacing: "0.05em",
              }}
            >
              {isDay && "★ "}{p.label}
            </div>
            <div
              className="text-[9px] md:text-[10px] mt-0.5"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: "#A89F95",
                letterSpacing: "0.15em",
              }}
            >
              {hanjaLabel[key]}
            </div>
          </div>

          {/* 천간 십성 */}
          <div
            className="text-center py-1.5 px-1"
            style={{ background: "#FAFAF7", borderBottom: "1px solid #F0EBE3" }}
          >
            <div
              className="text-[10px] md:text-xs"
              style={{
                fontFamily: "Jua, sans-serif",
                color: isDay ? "#B89968" : "#8A7E78",
                fontWeight: isDay ? 700 : 500,
              }}
            >
              {isDay ? "일간" : p.tenGodSky || "-"}
            </div>
          </div>

          {/* 천간 (오행색 배경) */}
          <div
            className="text-center py-3 px-1"
            style={{
              background: skyColors.bg,
              color: skyColors.text,
            }}
          >
            <div
              className="text-3xl md:text-4xl font-bold leading-none"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: skyColors.text,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {p.sky}
            </div>
            <div
              className="text-[10px] md:text-xs mt-1.5 opacity-95"
              style={{ fontFamily: "Jua, sans-serif" }}
            >
              {p.skyKo}({p.skyElement})
            </div>
          </div>

          {/* 구분선 */}
          <div style={{ height: "1px", background: "#E2D7D0" }} />

          {/* 지지 (오행색 배경) */}
          <div
            className="text-center py-3 px-1"
            style={{
              background: earthColors.bg,
              color: earthColors.text,
            }}
          >
            <div
              className="text-3xl md:text-4xl font-bold leading-none"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: earthColors.text,
                textShadow: "0 1px 2px rgba(0,0,0,0.15)",
              }}
            >
              {p.earth}
            </div>
            <div
              className="text-[10px] md:text-xs mt-1.5 opacity-95"
              style={{ fontFamily: "Jua, sans-serif" }}
            >
              {p.earthKo}({p.earthElement})
            </div>
          </div>

          {/* 지지 십성 */}
          <div
            className="text-center py-1.5 px-1"
            style={{ background: "#FAFAF7", borderTop: "1px solid #F0EBE3" }}
          >
            <div
              className="text-[10px] md:text-xs"
              style={{
                fontFamily: "Jua, sans-serif",
                color: "#8A7E78",
              }}
            >
              {p.tenGodEarth || "-"}
            </div>
          </div>

          {/* 12운성 */}
          {p.stage12 && (
            <div
              className="text-center py-2 px-1 mt-auto"
              style={{
                background: isDay ? "#FAF8F5" : "#FFFFFF",
                borderTop: "1px solid #E2D7D0",
              }}
            >
              <div
                className="text-[9px] md:text-[10px]"
                style={{
                  fontFamily: "Jua, sans-serif",
                  color: "#A89F95",
                  letterSpacing: "0.05em",
                }}
              >
                운성
              </div>
              <div
                className="text-xs md:text-sm font-bold mt-0.5"
                style={{
                  fontFamily: "Jua, sans-serif",
                  color: isDay ? "#B89968" : "#5A4E48",
                }}
              >
                {p.stage12}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>

  {/* 하단 별·라인 */}
  <div className="hidden">
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
    <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
  </div>
</div>



{/* 🎯 종합 분석 (격국·용신·강약·공망·길흉신 - 우리말 풀이 포함) */}
{((result as any).gyeok || (result as any).yongshin || (result as any).strength) && (
  <div
    className="relative rounded-3xl px-6 py-8 shadow-[0_10px_30px_rgba(61,51,56,0.05)] overflow-hidden bg-white"
    style={{
      border: "1px solid #E2D7D0",
    }}
  >
    {/* 상단 별·라인 */}
    <div className="hidden">
      <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
      <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
      <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    </div>

    {/* 타이틀 */}
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338", letterSpacing: "-0.01em" }}>
        종합 분석
      </h2>
      <p className="text-xs mt-1" style={{ fontFamily: "'Noto Serif KR', serif", color: "#8A7E78", letterSpacing: "0.2em" }}>
        綜 合 分 析
      </p>
    </div>

    <div className="hidden">
      <div className="h-px w-24" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
    </div>

    {/* 📜 격국 카드 (우리말 풀이 포함) */}
    {result.gyeok && (
      <div className="rounded-2xl px-5 py-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#B89968", color: "#FFF", fontFamily: "Jua, sans-serif", letterSpacing: "0.05em" }}>
            격국
          </span>
          <span className="text-xs" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.15em" }}>
            格 局
          </span>
        </div>
        <div className="text-center py-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h3 className="text-2xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: "#3D3338", letterSpacing: "0.1em" }}>
              {result.gyeok}
            </h3>
          </div>

          {GYEOK_DICT[result.gyeok] && (
            <div className="mt-4 mb-2">
              <p className="text-base font-bold mb-2" style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}>
                {GYEOK_DICT[result.gyeok].title}
              </p>
              <p className="text-sm leading-relaxed px-4" style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}>
                {GYEOK_DICT[result.gyeok].desc}
              </p>
            </div>
          )}
        </div>
      </div>
    )}

    {/* 💎 용신 카드 (천간별 우리말 풀이) */}
    {((result as any).yongshin || (result as any).yongsin) && (
      <div className="rounded-2xl px-5 py-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#5C8B6F", color: "#FFF", fontFamily: "Jua, sans-serif", letterSpacing: "0.05em" }}>
            용신
          </span>
          <span className="text-xs" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.15em" }}>
            用 神
          </span>
        </div>
        <div className="text-center py-3">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h3 className="text-2xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: "#3D3338", letterSpacing: "0.15em" }}>
              {(result as any).yongshin || (result as any).yongsin}
            </h3>
          </div>

          {/* 천간별 우리말 풀이 */}
          <div className="mt-3 mb-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {String((result as any).yongshin || (result as any).yongsin || "")
                .split(/[,\s]+/)
                .filter(Boolean)
                .map((gan: string, i: number) => {
                  const info = CHEONGAN_DICT[gan];
                  if (!info) return null;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                      style={{
                        background: "#E8F0EA",
                        color: "#3D5C46",
                        fontFamily: "Jua, sans-serif",
                        border: "1px solid #C9DBCE",
                      }}
                    >
                      <span className="font-bold">{info.meaning}</span>
                    </span>
                  );
                })}
            </div>
          </div>

          <p className="text-xs mt-2 leading-relaxed" style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78" }}>
            나에게 가장 이로운 기운입니다. 이 기운을 가까이하세요.
          </p>
        </div>
      </div>
    )}

    {/* 💪 강약 카드 (우리말 풀이 포함) */}
    {result.strength && (
      <div className="rounded-2xl px-5 py-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#B85C4C", color: "#FFF", fontFamily: "Jua, sans-serif", letterSpacing: "0.05em" }}>
            강약
          </span>
          <span className="text-xs" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.15em" }}>
            強 弱
          </span>
        </div>
        <div className="text-center py-2">
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
            {result.strength}
          </h3>

          {typeof result.strengthScore === "number" && (
            <>
              <div className="flex items-center gap-2 px-4 mb-2">
                <span className="text-[10px] flex-shrink-0" style={{ color: "#8A7E78", fontFamily: "Jua, sans-serif" }}>
                  신약
                </span>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#FAF8F5" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.max(result.strengthScore, 0), 100)}%`,
                      background: "#8B6F47",
                    }}
                  />
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: "#8A7E78", fontFamily: "Jua, sans-serif" }}>
                  신강
                </span>
              </div>
              <p className="text-sm font-bold" style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}>
                {result.strengthScore}점
              </p>
            </>
          )}

          {/* 우리말 풀이 */}
          {STRENGTH_DICT[result.strength] ? (
            <div className="mt-3">
              <p className="text-base font-bold mb-1" style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}>
                {STRENGTH_DICT[result.strength].title}
              </p>
              <p className="text-sm leading-relaxed px-4" style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}>
                {STRENGTH_DICT[result.strength].desc}
              </p>
            </div>
          ) : (
            <p className="text-xs mt-3 leading-relaxed" style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78" }}>
              고유한 흐름이 있는 사주입니다.
            </p>
          )}
        </div>
      </div>
    )}

    {/* 🌀 공망 카드 (우리말 풀이) */}
    {(result as any).gongmang && (
      <div className="rounded-2xl px-5 py-4 mb-4" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "#8B7AB8", color: "#FFF", fontFamily: "Jua, sans-serif", letterSpacing: "0.05em" }}>
            공망
          </span>
          <span className="text-xs" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.15em" }}>
            空 亡
          </span>
        </div>
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h3 className="text-xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: "#3D3338", letterSpacing: "0.1em" }}>
              {(result as any).gongmang}
            </h3>
          </div>

          {/* 우리말 풀이 */}
          <div className="mt-3 mb-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {String((result as any).gongmang)
                .split(/[,\s]+/)
                .filter(Boolean)
                .map((ji: string, i: number) => {
                  const meaning = GONGMANG_DICT[ji];
                  if (!meaning) return null;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                      style={{
                        background: "#EFE8F5",
                        color: "#5C4A7A",
                        fontFamily: "Jua, sans-serif",
                        border: "1px solid #D4C4E0",
                      }}
                    >
                      <span className="font-bold">{meaning}</span>
                    </span>
                  );
                })}
            </div>
          </div>

          <p className="text-xs mt-2 leading-relaxed" style={{ fontFamily: "Jua, sans-serif", color: "#8A7E78" }}>
            해당 자리가 비어있는 운. 채워질 때 큰 변화가 따라옵니다.
          </p>
        </div>
      </div>
    )}

    {/* ✨⚡ 길신·흉신 카드 (우리말 풀이 포함) */}
    {(result.gilsin !== undefined || result.hyungsin !== undefined) && (
      <div className="grid grid-cols-2 gap-3">
        {/* 길신 */}
        <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #EAE0D5" }}>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#5C8B6F", color: "#FFF", fontFamily: "Jua, sans-serif" }}>
              길신
            </span>
            <span className="text-[10px]" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.1em" }}>
              吉 神
            </span>
          </div>
          <div className="text-center min-h-[60px] flex items-center justify-center">
            {Array.isArray(result.gilsin) && result.gilsin.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {result.gilsin.map((item: string, i: number) => {
                  const info = GILSIN_DICT[item];
                  return (
                    <span
                      key={i}
                      className="inline-flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
                      style={{
                        background: "#E8F0EA",
                        color: "#3D5C46",
                        fontFamily: "Jua, sans-serif",
                        border: "1px solid #C9DBCE",
                        minWidth: "70px",
                      }}
                    >
                      <span className="text-[11px] font-bold">{info?.title || item}</span>
                      {info?.desc && (
                        <span className="text-[9px] mt-0.5 text-center leading-tight" style={{ color: "#5A6E5C" }}>
                          {info.desc}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs" style={{ color: "#A89F95", fontFamily: "Jua, sans-serif" }}>
                ─ 없음 ─
              </span>
            )}
          </div>
        </div>

        {/* 흉신 */}
        <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid #EAE0D5" }}>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#B85C4C", color: "#FFF", fontFamily: "Jua, sans-serif" }}>
              흉신
            </span>
            <span className="text-[10px]" style={{ fontFamily: "'Noto Serif KR', serif", color: "#A89F95", letterSpacing: "0.1em" }}>
              凶 神
            </span>
          </div>
          <div className="text-center min-h-[60px] flex items-center justify-center">
            {Array.isArray(result.hyungsin) && result.hyungsin.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {result.hyungsin.map((item: string, i: number) => {
                  const info = HYUNGSIN_DICT[item];
                  return (
                    <span
                      key={i}
                      className="inline-flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
                      style={{
                        background: "#F5E5E2",
                        color: "#8B3D33",
                        fontFamily: "Jua, sans-serif",
                        border: "1px solid #E5C9C4",
                        minWidth: "70px",
                      }}
                    >
                      <span className="text-[11px] font-bold">{info?.title || item}</span>
                      {info?.desc && (
                        <span className="text-[9px] mt-0.5 text-center leading-tight" style={{ color: "#A65A50" }}>
                          {info.desc}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs" style={{ color: "#A89F95", fontFamily: "Jua, sans-serif" }}>
                ─ 없음 ─
              </span>
            )}
          </div>
        </div>
      </div>
    )}

    {/* 하단 별·라인 */}
    <div className="hidden">
      <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
      <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
      <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
    </div>
  </div>
)}


          {/* 지장간 (기존 + 친근한 풀이 박스) */}
<div className="card">
  <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🔍 지장간 (숨은 천간)</h2>
  <div className="grid grid-cols-4 gap-2 text-center text-sm">
    {(["hour", "day", "month", "year"] as const).map((key) => {
      const p = result.pillars?.[key];
      if (!p) return null;
      const h = p.hiddenStems;
      return (
        <div key={key} className="rounded-xl border border-[#E2D7D0] bg-white p-3">
          <div className="text-[10px] text-[#8A7E78] mb-2">{p.label}</div>
          <div className="space-y-1">
            {h?.yeogi && <div className="text-xs"><span className="text-[#8A7E78]">여기:</span> {h.yeogi}</div>}
            {h?.junggi && <div className="text-xs"><span className="text-[#8A7E78]">중기:</span> {h.junggi}</div>}
            {h?.jeonggi && <div className="text-xs"><span className="text-[#8A7E78]">정기:</span> {h.jeonggi}</div>}
            {!h?.yeogi && !h?.junggi && !h?.jeonggi && <div className="text-xs text-[#ccc]">-</div>}
          </div>
        </div>
      );
    })}
  </div>

  {/* 💎 친근한 풀이 박스 (운명비서 차별화) */}
  <div className="mt-4 rounded-xl p-4" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-sm font-bold" style={{ fontFamily: "Jua, sans-serif", color: "#B89968" }}>
        쉽게 풀어드릴게요
      </h3>
    </div>

    <div className="space-y-2">
      {(["hour", "day", "month", "year"] as const).map((key) => {
        const p = result.pillars?.[key];
        if (!p) return null;
        const mainGan = p.hiddenStems?.jeonggi;
        const mainInfo = mainGan ? CHEONGAN_DICT[mainGan] : null;

        const pillarMeaning: Record<string, string> = {
          hour: "미래·자식 자리",
          day: "나 자신·배우자",
          month: "부모·환경",
          year: "조상·뿌리",
        };

        if (!mainGan || !mainInfo) {
          return (
            <div key={key} className="text-xs flex items-start gap-2 px-2 py-1" style={{ fontFamily: "Jua, sans-serif" }}>
              <span className="font-bold flex-shrink-0" style={{ color: "#B89968", minWidth: "60px" }}>{p.label}</span>
              <span style={{ color: "#A89F95" }}>{pillarMeaning[key]}</span>
            </div>
          );
        }

        return (
          <div key={key} className="text-xs px-2 py-1.5 rounded-lg" style={{ fontFamily: "Jua, sans-serif", background: "#FAF8F5" }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold flex-shrink-0" style={{ color: "#B89968", minWidth: "60px" }}>{p.label}</span>
              <span style={{ color: "#8A7E78" }}>{pillarMeaning[key]}</span>
              <span style={{ color: "#A89F95" }}>→</span>
              <span style={{ color: "#5A4E48" }}>
                <strong>{mainInfo.meaning}</strong>{" "}
                <span style={{ color: "#8A7E78" }}>({mainInfo.vibe})</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>

    <div className="mt-3 pt-3" style={{ borderTop: "1px dashed #D4C8B8" }}>
      <p className="text-xs leading-relaxed" style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}>
        <span style={{ color: "#B89968", fontWeight: 700 }}>지장간이란?</span><br/>
        내 사주에 숨어있는 잠재 기운들이에요.{" "}
        <strong>정기(메인)</strong>가 가장 큰 영향을 주고, 여기·중기는 보조 역할을 해요.{" "}
        이 숨은 기운들이 나의 잠재력·인연·숨은 재능을 만들어냅니다.
      </p>
    </div>
  </div>
</div>


          {/* 🌿 오행 분포 — 새로운 오행표 차트 */}
          

{/* 🌟 오행표 (五行表) - 정통 전문가형 */}

          {/* 🌟 오행표 (五行表) - 정통 전문가형 */}
{result.ohaengCount && (() => {
  const ohaengList = [
  { key: "wood",  ko: "목", hanja: "木", count: (result.ohaengCount as any)["목(木)"] ?? 0, color: "#5C8B6F" },
  { key: "fire",  ko: "화", hanja: "火", count: (result.ohaengCount as any)["화(火)"] ?? 0, color: "#B85C4C" },
  { key: "earth", ko: "토", hanja: "土", count: (result.ohaengCount as any)["토(土)"] ?? 0, color: "#B89968" },
  { key: "metal", ko: "금", hanja: "金", count: (result.ohaengCount as any)["금(金)"] ?? 0, color: "#9B9591" },
  { key: "water", ko: "수", hanja: "水", count: (result.ohaengCount as any)["수(水)"] ?? 0, color: "#3D4A5C" },
];


  const getStatus = (count: number) => {
    if (count === 0) return { label: "비어있음", highlight: false, warning: true };
    if (count === 1) return { label: "약함",     highlight: false, warning: false };
    if (count === 2) return { label: "보통",     highlight: false, warning: false };
    if (count === 3) return { label: "균형",     highlight: true,  warning: false };
    if (count === 4) return { label: "강함",     highlight: false, warning: false };
    return                  { label: "과함",     highlight: false, warning: true };
  };

  const strong = ohaengList.filter(o => o.count >= 4).map(o => `${o.ko}(${o.hanja})`);
  const weak   = ohaengList.filter(o => o.count <= 1).map(o => `${o.ko}(${o.hanja})`);
  const balanced = ohaengList.filter(o => o.count === 3);

  let diagnosis = "";
  if (strong.length > 0 && weak.length > 0) {
    diagnosis = `${strong.join("·")}이(가) 강하고, ${weak.join("·")}이(가) 약한 사주입니다.`;
  } else if (strong.length > 0) {
    diagnosis = `${strong.join("·")}이(가) 강한 사주입니다.`;
  } else if (weak.length > 0) {
    diagnosis = `${weak.join("·")}이(가) 약한 사주입니다.`;
  } else if (balanced.length >= 3) {
    diagnosis = "오행이 비교적 균형 잡힌 사주입니다.";
  } else {
    diagnosis = "오행이 비교적 고르게 분포된 사주입니다.";
  }

  return (
    <div
      className="relative rounded-3xl px-6 py-8 shadow-[0_10px_30px_rgba(61,51,56,0.05)] overflow-hidden bg-white"
      style={{
        border: "1px solid #E2D7D0",
      }}
    >
      <div className="hidden">
        <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
        <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
        <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338", letterSpacing: "-0.01em" }}>
          오행표
        </h2>
        <p className="text-xs mt-1" style={{ fontFamily: "'Noto Serif KR', serif", color: "#8A7E78", letterSpacing: "0.2em" }}>
          五 行 表
        </p>
      </div>

      <div className="hidden">
        <div className="h-px w-24" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
      </div>

      <div className="space-y-4 mb-6">
        {ohaengList.map((o) => {
          const status = getStatus(o.count);
          const totalSegments = 5;
          const filled = Math.min(o.count, 5);

          return (
            <div key={o.key} className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5 flex-shrink-0" style={{ width: "70px" }}>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Noto Serif KR', serif", color: o.color, lineHeight: 1 }}>
                  {o.hanja}
                </span>
                <span className="text-sm" style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}>
                  {o.ko}
                </span>
              </div>

              <div className="flex gap-1 flex-1">
                {Array.from({ length: totalSegments }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 flex-1 rounded-sm transition-all"
                    style={{
                      background: i < filled ? o.color : "#EAE0D5",
                      opacity: i < filled ? 1 : 0.4,
                    }}
                  />
                ))}
                {o.count > 5 && (
                  <div className="h-3 px-1 flex items-center justify-center rounded-sm text-[10px] font-bold" style={{ background: o.color, color: "#fff" }}>
                    +{o.count - 5}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 justify-end" style={{ width: "80px" }}>
                <span className="text-sm font-bold" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
                  {o.count}개
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    fontFamily: "Jua, sans-serif",
                    background: status.highlight ? "#B89968" : status.warning ? "#C9766B" : "transparent",
                    color: status.highlight || status.warning ? "#FFF" : "#8A7E78",
                    border: status.highlight || status.warning ? "none" : "1px solid #D4C8B8",
                  }}
                >
                  {status.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-24" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
      </div>

      <div className="rounded-2xl px-5 py-4 text-center" style={{ background: "#FFFFFF", border: "1px solid #E2D7D0" }}>
        <p className="text-xs mb-2" style={{ fontFamily: "Jua, sans-serif", color: "#B89968", letterSpacing: "0.1em" }}>
          ─── 균형 한 줄 진단 ───
        </p>

        {/* 🌳 오행별 우리말 풀이 */}
<div className="mt-5 space-y-2">
  {ohaengList.map((o) => {
    const dict = OHAENG_DICT[o.ko];
    if (!dict) return null;
    return (
      <div
        key={`desc-${o.key}`}
        className="rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid #EAE0D5"
        }}
      >
        <p
          className="text-xs leading-relaxed"
          style={{ fontFamily: "Jua, sans-serif", color: "#5A4E48" }}
        >
          <span
            style={{
              color: dict.color,
              fontWeight: 700,
              fontFamily: "'Noto Serif KR', serif"
            }}
          >
            {o.ko}({o.hanja})
          </span>
          <span style={{ color: "#8A7E78" }}> ({o.count}개)</span>
          <span style={{ color: "#B89968" }}>: </span>
          <span style={{ color: "#3D3338", fontWeight: 600 }}>
            {dict.keywords}
          </span>
          을(를) 상징합니다.{" "}
          {o.count >= 3 ? (
            <>
              <span style={{ color: dict.color, fontWeight: 600 }}>
                {o.ko}이(가) 강하니
              </span>{" "}
              {dict.strong}.
            </>
          ) : o.count <= 1 ? (
            <>
              <span style={{ color: "#C9766B", fontWeight: 600 }}>
                {o.ko}이(가) 부족하여
              </span>{" "}
              {dict.weak}.
            </>
          ) : (
            <>{o.ko}의 기운이 보통 수준으로 균형 잡혀 있습니다.</>
          )}
        </p>
      </div>
    );
  })}
</div>

        <p className="text-sm leading-relaxed" style={{ fontFamily: "Jua, sans-serif", color: "#3D3338" }}>
          {diagnosis}
        </p>
      </div>

      <div className="hidden">
        <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
        <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #B89968, transparent)" }} />
        <span className="text-sm" style={{ color: "#B89968" }}>✦</span>
      </div>
    </div>
  );
})()}



          {/* 십성 분석 */}
          {result.sipsinAnalysis && result.sipsinAnalysis.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>⭐ 십성 분석</h2>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {result.sipsinAnalysis.map((s) => (
                  <div key={s.name} className="rounded-lg border border-[#E2D7D0] bg-white px-3 py-2 text-center">
                    <div className="text-xs text-[#8A7E78]">{s.name}</div>
                    <div className="font-bold text-[#3D3338]">{s.count}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {result.sipsinAnalysis.filter(s => s.desc && s.name !== "(일간)").map((s) => (
                  <div key={s.name} className="rounded-lg border border-[#E2D7D0] bg-white p-2 text-xs text-[#5A5A5A]">
                    <span className="font-bold text-[#3D3338]">{s.name} ({s.count}개)</span>: {s.desc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 천간/지지 관계 */}
          {((result.stemRelations && result.stemRelations.length > 0) || (result.branchRelations && result.branchRelations.length > 0)) && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>천간·지지 관계</h2>
              <p className="text-xs text-[#8A7E78] mb-4">
                사주 안의 글자들이 서로 돕는지, 부딪히는지, 변화시키는지를 쉽게 풀어 정리했습니다.
              </p>
              {result.stemRelations && result.stemRelations.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-[#3D3338] mb-2">천간 관계</h3>
                  <p className="text-xs text-[#8A7E78] mb-3">
                    천간은 겉으로 드러나는 생각, 태도, 사회적 표현의 흐름을 봅니다.
                  </p>
                  {result.stemRelations.map((r, i) => (
                    <div key={i} className="rounded-2xl border border-[#E2D7D0] bg-white p-4 mb-2">
                      {(() => {
                        const guide = getGuide(RELATION_GUIDE, r.type);
                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${toneClass(guide.tone)}`}>
                                {r.type}
                              </span>
                              <p className="text-sm font-bold text-[#3D3338]">{guide.title}</p>
                            </div>
                            <p className="text-xs text-[#8A7E78] mb-2">{r.desc}</p>
                            <p className="text-sm leading-relaxed text-[#5A4E48]">{guide.desc}</p>
                            <p className="mt-2 rounded-xl bg-[#FAF8F5] px-3 py-2 text-xs leading-relaxed text-[#5A4E48]">
                              이렇게 보면 좋아요: {guide.advice}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
              {result.branchRelations && result.branchRelations.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#3D3338] mb-2">지지 관계</h3>
                  <p className="text-xs text-[#8A7E78] mb-3">
                    지지는 생활 습관, 감정, 실제 사건의 흐름을 봅니다.
                  </p>
                  {result.branchRelations.map((r, i) => (
                    <div key={i} className="rounded-2xl border border-[#E2D7D0] bg-white p-4 mb-2">
                      {(() => {
                        const guide = getGuide(RELATION_GUIDE, r.type);
                        return (
                          <>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${toneClass(guide.tone)}`}>
                                {r.type}
                              </span>
                              <p className="text-sm font-bold text-[#3D3338]">{guide.title}</p>
                            </div>
                            <div className="mb-3 flex flex-wrap gap-2">
                              {Object.entries(r.details).map(([k, v]) => (
                                <span key={k} className="rounded-full border border-[#E2D7D0] bg-[#FAF8F5] px-2.5 py-1 text-xs text-[#5A4E48]">
                                  {formatRelationDetail(k, v)}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm leading-relaxed text-[#5A4E48]">{guide.desc}</p>
                            <p className="mt-2 rounded-xl bg-[#FAF8F5] px-3 py-2 text-xs leading-relaxed text-[#5A4E48]">
                              이렇게 보면 좋아요: {guide.advice}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 신살 */}
          {result.salsSummary && result.salsSummary.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>신살</h2>
              <p className="text-xs text-[#8A7E78] mb-4">
                신살은 인생의 특정 성향이나 사건 패턴을 보는 보조 지표입니다. 좋고 나쁨보다 어떻게 쓰느냐가 중요합니다.
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {result.salsSummary.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-[#E2D7D0] bg-white p-4">
                    <div className="text-sm font-bold text-[#3D3338] mb-3">{s.pillar}</div>
                    {s.twelveSal && (() => {
                      const guide = getGuide(SAL_GUIDE, s.twelveSal);
                      return (
                        <div className="mb-3 rounded-xl bg-[#FAF8F5] p-3">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${toneClass(guide.tone)}`}>
                              12신살 · {s.twelveSal}
                            </span>
                            <span className="text-xs font-bold text-[#3D3338]">{guide.title}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-[#5A4E48]">{guide.desc}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#8A7E78]">활용법: {guide.advice}</p>
                        </div>
                      );
                    })()}
                    {s.specialSals.length > 0 && (
                      <div className="space-y-2">
                        {s.specialSals.map((sal) => {
                          const guide = getGuide(SAL_GUIDE, sal);
                          return (
                            <div key={sal} className="rounded-xl border border-[#E2D7D0] bg-white px-3 py-2">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${toneClass(guide.tone)}`}>
                                  {sal}
                                </span>
                                <span className="text-xs font-bold text-[#3D3338]">{guide.title}</span>
                              </div>
                              <p className="text-xs leading-relaxed text-[#5A4E48]">{guide.desc}</p>
                              <p className="mt-1 text-[11px] leading-relaxed text-[#8A7E78]">활용법: {guide.advice}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {result.gilsin && result.gilsin.length > 0 && (
                <div className="mt-4 rounded-xl border border-[#C9DBCE] bg-[#F7FBF8] p-3 text-xs leading-relaxed text-[#2F6B45]">
                  <span className="font-bold">길신:</span> 도움, 보호, 회복을 뜻하는 좋은 보조 기운입니다. {result.gilsin.join(", ")}
                </div>
              )}
              {result.hyungsin && result.hyungsin.length > 0 && (
                <div className="mt-2 rounded-xl border border-[#E6CCC3] bg-[#FFF8F5] p-3 text-xs leading-relaxed text-[#8A4A3D]">
                  <span className="font-bold">흉신:</span> 피해야 할 운이라기보다 주의해서 다루면 되는 기운입니다. {result.hyungsin.join(", ")}
                </div>
              )}
            </div>
          )}

          {/* 성격 분석 */}
          {result.personality && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🧠 성격 분석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed">{result.personality}</p>
            </div>
          )}

          {/* 대운 */}
          {result.daeun && result.daeun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🔄 대운 (10년 단위)</h2>
              {result.daeunCurrent && <p className="text-xs text-[#EAE5DA] mb-2">현재 대운: {result.daeunCurrent.ganKo}{result.daeunCurrent.jiKo} ({result.daeunCurrent.ganzhi})</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A7E78]">
                      <td className="p-1">나이</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1">{d.age}세~</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">간지</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 font-bold">{d.gan}{d.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">한글</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#8A7E78]">{d.ganKo}{d.jiKo}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">십성</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#EAE5DA]">{d.tenGodStem}/{d.tenGodBranch}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">12운성</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#5A4E48]">{d.stage12 || "-"}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 세운 */}
          {result.seyun && result.seyun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📅 세운 (연간)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A7E78]">
                      <td className="p-1">년도</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1">{s.year}</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">간지</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 font-bold">{s.gan}{s.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">한글</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#8A7E78]">{s.ganKo}{s.jiKo}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">십성</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#EAE5DA]">{s.tenGodStem}/{s.tenGodBranch}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">12운성</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#5A4E48]">{s.stage12 || "-"}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 월운 */}
          {result.wolun && result.wolun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📆 월운 ({new Date().getFullYear()}년)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A7E78]">
                      <td className="p-1">월</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1">{w.month}월</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">간지</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1 font-bold">{w.gan}{w.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A7E78]">십성</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1 text-[#EAE5DA]">{w.tenGodStem}/{w.tenGodBranch}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 종합 해석 */}
          {result.summary && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>종합 해석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed whitespace-pre-line">{result.summary}</p>
            </div>
          )}

          {/* AI 해석 (라이브러리 제공) */}
          {result.interpretation && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#3D3338] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>AI 해석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed whitespace-pre-line">{result.interpretation}</p>
            </div>
          )}
          </div>

            {/* 프리미엄 해설 유도 배너 */}
            <div className="rounded-2xl p-6 text-center shadow-[0_10px_30px_rgba(61,51,56,0.06)]" style={{ background: "#FAF8F5", border: "1px solid #E2D7D0" }}>
              <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-2">구독 안내</p>
              <h2 className="text-lg font-bold mb-2 text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>더 깊은 사주 해설이 궁금하신가요?</h2>
              <p className="text-sm mb-4 text-[#5A4E48]">AI가 분석하는 프리미엄 사주 리포트</p>
              <div className="text-xs mb-4 space-y-2 text-left inline-block text-[#3D3338]">
                <div>십성 심화 해설과 성격 분석</div>
                <div>대운별 인생 흐름 상세 풀이</div>
                <div>올해와 내년 운세 심층 분석</div>
                <div>재물운 · 직업운 · 건강운 · 연애운</div>
                <div>맞춤형 장문 리포트</div>
              </div>
              <br />
            <button className="bg-[#2F282B] text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-[#463A40] transition text-sm" onClick={() => { localStorage.setItem("sajuUserName", name); localStorage.setItem("premiumSajuData", JSON.stringify({...result, userName: name})); window.location.href = "/saju/premium"; }}>
                프리미엄 해설 보기 →
              </button>
            <p className="text-[10px] text-[#8A7E78] mt-2">10개 챕터 심층 분석 · AI 맞춤형 리포트</p>
            </div>
        </div>
      )}
    </div>
  );
}
