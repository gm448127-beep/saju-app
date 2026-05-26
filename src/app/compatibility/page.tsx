"use client";

import { useState } from "react";
import BirthDateNumberInputs, { isValidBirthDate } from "@/components/BirthDateNumberInputs";

/* ── 시간 선택용 상수 ── */
const TIME_SLOTS = [
  { value: 23, label: "자시 (23:00~01:00)" },
  { value: 1,  label: "축시 (01:00~03:00)" },
  { value: 3,  label: "인시 (03:00~05:00)" },
  { value: 5,  label: "묘시 (05:00~07:00)" },
  { value: 7,  label: "진시 (07:00~09:00)" },
  { value: 9,  label: "사시 (09:00~11:00)" },
  { value: 11, label: "오시 (11:00~13:00)" },
  { value: 13, label: "미시 (13:00~15:00)" },
  { value: 15, label: "신시 (15:00~17:00)" },
  { value: 17, label: "유시 (17:00~19:00)" },
  { value: 19, label: "술시 (19:00~21:00)" },
  { value: 21, label: "해시 (21:00~23:00)" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

type TimeMode = "none" | "slot" | "exact";

interface PersonInput {
  name: string;
  year: string;
  month: string;
  day: string;
  gender: string;
  calendarType: string;
  timeMode: TimeMode;
  slotHour: number | "";
  exactHour: number | "";
  exactMinute: number | "";
}

const defaultPerson = (gender: string): PersonInput => ({
  name: "",
  year: "",
  month: "",
  day: "",
  gender,
  calendarType: "solar",
  timeMode: "none",
  slotHour: "",
  exactHour: "",
  exactMinute: "",
});

/* ── 점수 색상 ── */
function scoreColor(s: number) {
  if (s >= 80) return "#B89968";
  if (s >= 60) return "#8B6F47";
  if (s >= 40) return "#9B9591";
  return "#6B5E58";
}

/* ── 시간 입력 서브컴포넌트 ── */
function TimeInput({ person, onChange }: { person: PersonInput; onChange: (k: string, v: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#5A4E48] font-bold block mb-1">태어난 시간</label>
      <div className="flex gap-2">
        {([
          { mode: "none" as TimeMode, label: "모름" },
          { mode: "slot" as TimeMode, label: "시간대" },
          { mode: "exact" as TimeMode, label: "정확히" },
        ]).map((m) => (
          <button
            key={m.mode}
            onClick={() => onChange("timeMode", m.mode)}
            className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${
              person.timeMode === m.mode
                ? "border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]"
                : "border-[#D9C8C0] bg-white text-[#5A4E48] hover:border-[#8B6F47]"
            }`}
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {person.timeMode === "slot" && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {TIME_SLOTS.map((ts) => (
            <button
              key={ts.value}
              onClick={() => onChange("slotHour", ts.value)}
              className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${
                person.slotHour === ts.value
                  ? "border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]"
                  : "border-[#D9C8C0] bg-white text-[#5A4E48] hover:border-[#8B6F47]"
              }`}
            >
              {ts.label}
            </button>
          ))}
        </div>
      )}

      {person.timeMode === "exact" && (
        <div className="flex gap-2 mt-2">
          <select
            value={person.exactHour}
            onChange={(e) => onChange("exactHour", e.target.value === "" ? "" : Number(e.target.value))}
            className="flex-1 p-2 rounded-xl border-2 border-[#D9C8C0]"
          >
            <option value="">시</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>{h}시</option>
            ))}
          </select>
          <select
            value={person.exactMinute}
            onChange={(e) => onChange("exactMinute", e.target.value === "" ? "" : Number(e.target.value))}
            className="flex-1 p-2 rounded-xl border-2 border-[#D9C8C0]"
          >
            <option value="">분</option>
            {MINUTES.map((m) => (
              <option key={m} value={m}>{m}분</option>
            ))}
          </select>
        </div>
      )}

      {person.timeMode === "none" && (
        <p className="text-xs text-[#8A7E78] bg-[#F5EDE8] p-2 rounded-lg border border-[#D9C8C0]">
          시간 미입력 시 시주(時柱)가 제외되어 정확도가 다소 떨어질 수 있습니다.
        </p>
      )}
    </div>
  );
}

/* ── 인물 입력 카드 ── */
function PersonCard({
  label, person, onChange,
}: {
  label: string;
  person: PersonInput; onChange: (k: string, v: any) => void;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <h3 style={{ fontFamily: "Jua, sans-serif" }} className="text-lg text-[#3D3338]">{label}</h3>
      </div>
      <div className="space-y-3">
        {/* 이름 */}
        <div>
          <label className="text-sm text-[#5A4E48] font-bold block mb-1">이름 (선택)</label>
          <input
            type="text"
            placeholder="이름 입력"
            value={person.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="w-full p-3 rounded-xl border border-[#D9C8C0] bg-white text-[#3D3338] focus:border-[#8B6F47] outline-none"
            style={{ fontSize: "16px", fontWeight: 600 }}
          />
        </div>

        {/* 성별 */}
        <div>
          <label className="text-sm text-[#5A4E48] font-bold block mb-1">성별</label>
          <div className="flex gap-2">
            {["남", "여"].map((g) => (
              <button
                key={g}
                onClick={() => onChange("gender", g)}
                className={`flex-1 py-2 rounded-xl border text-base font-bold transition-all ${
                  person.gender === g
                    ? "border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]"
                    : "border-[#D9C8C0] bg-white text-[#5A4E48] hover:border-[#8B6F47]"
                }`}
                style={{ fontFamily: "Jua, sans-serif" }}
              >
                {g === "남" ? "남자" : "여자"}
              </button>
            ))}
          </div>
        </div>

        {/* 달력 */}
        <div>
          <label className="text-sm text-[#5A4E48] font-bold block mb-1">달력 구분</label>
          <div className="flex gap-2">
            {[
              { value: "solar", label: "양력" },
              { value: "lunar", label: "음력" },
              { value: "lunarLeap", label: "윤달" },
            ].map((c) => (
              <button
                key={String(c.value)}
                onClick={() => onChange("calendarType", c.value)}
                className={`flex-1 py-2 rounded-xl border text-base font-bold transition-all ${
                  person.calendarType === c.value
                    ? "border-[#8B6F47] bg-[#FAF8F5] text-[#2F282B]"
                    : "border-[#D9C8C0] bg-white text-[#5A4E48] hover:border-[#8B6F47]"
                }`}
                style={{ fontFamily: "Jua, sans-serif" }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 년/월/일 */}
        <BirthDateNumberInputs
          year={person.year}
          month={person.month}
          day={person.day}
          onYearChange={(value) => onChange("year", value)}
          onMonthChange={(value) => onChange("month", value)}
          onDayChange={(value) => onChange("day", value)}
        />

        {/* 시간 */}
        <TimeInput person={person} onChange={onChange} />

        {person.calendarType !== "solar" && (
          <p className="text-xs text-[#EAE5DA] bg-[#F5EDE8] p-2 rounded-lg border border-[#E8DCC8]">
            음력 생년월일을 입력해주세요. 서버에서 양력으로 변환하여 계산합니다.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── 사주 기둥 표시 ── */
function PillarTable({ label, pillars, hasHour }: { label: string; pillars: any; hasHour: boolean }) {
  if (!pillars) return null;
  const cols = [
    { key: "hour", name: "시주" },
    { key: "day", name: "일주" },
    { key: "month", name: "월주" },
    { key: "year", name: "연주" },
  ];
  return (
    <div className="mb-3">
      <p className="text-sm font-bold text-[#5A4E48] mb-1">{label}</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {cols.map((c) => {
          const p = pillars[c.key];
          const noHour = c.key === "hour" && !hasHour;
          return (
            <div key={c.key} className="bg-white rounded-xl p-2 border border-[#D9C8C0]">
              <p className="text-xs text-[#8A7E78]">{c.name}</p>
              <p className="text-lg font-bold" style={{ fontFamily: "Jua, sans-serif", color: noHour ? "#ccc" : "#3D3338" }}>
                {noHour ? "—" : (p?.stem || "?")}
              </p>
              <p className="text-lg font-bold" style={{ fontFamily: "Jua, sans-serif", color: noHour ? "#ccc" : "#3D3338" }}>
                {noHour ? "—" : (p?.branch || "?")}
              </p>
              <p className="text-xs text-[#8A7E78]">
                {noHour ? "미입력" : `${p?.stemKo || ""}${p?.branchKo || ""}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   메인 페이지 컴포넌트
   ══════════════════════════════════════════ */
export default function CompatibilityPage() {
  const [person1, setPerson1] = useState<PersonInput>(defaultPerson("남"));
  const [person2, setPerson2] = useState<PersonInput>(defaultPerson("여"));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 시간 값 추출 */
  function extractTime(p: PersonInput) {
    if (p.timeMode === "slot" && p.slotHour !== "") return { hour: p.slotHour as number };
    if (p.timeMode === "exact" && p.exactHour !== "") return { hour: p.exactHour as number, minute: p.exactMinute !== "" ? (p.exactMinute as number) : 0 };
    return {};
  }

  /* 제출 */
  const handleSubmit = async () => {
    if (!isValidBirthDate(person1.year, person1.month, person1.day) || !isValidBirthDate(person2.year, person2.month, person2.day)) {
      alert("두 사람의 생년월일을 숫자로 정확히 입력해주세요!");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person1: {
            name: person1.name || "첫째",
            year: Number(person1.year),
            month: Number(person1.month),
            day: Number(person1.day),
            gender: person1.gender,
            isLunar: person1.calendarType !== "solar",
            ...extractTime(person1),
          },
          person2: {
            name: person2.name || "둘째",
            year: Number(person2.year),
            month: Number(person2.month),
            day: Number(person2.day),
            gender: person2.gender,
            isLunar: person2.calendarType !== "solar",
            ...extractTime(person2),
          },
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (e: any) {
      setError(e instanceof SyntaxError ? "서버 응답을 해석하지 못했습니다." : e.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#E2D7D0] bg-white px-5 py-5 shadow-[0_10px_30px_rgba(61,51,56,0.05)]">
        <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-2">두 사람의 관계 리포트</p>
        <h1 style={{ fontFamily: "Jua, sans-serif" }} className="text-2xl text-[#2F282B]">궁합 분석</h1>
        <p className="text-[#8A7E78] text-sm mt-1">두 사람의 사주 흐름과 관계의 강약을 정리합니다.</p>
      </div>

      {/* 인물 입력 */}
      <PersonCard label="내 정보" person={person1} onChange={(k, v) => setPerson1((p) => ({ ...p, [k]: v }))} />
      <div className="flex justify-center">
        <span className="h-px w-16 bg-[#D9C8C0]" />
      </div>
      <PersonCard label="상대방 정보" person={person2} onChange={(k, v) => setPerson2((p) => ({ ...p, [k]: v }))} />

      {/* 제출 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl text-white text-lg transition-all active:scale-[0.98] disabled:opacity-50"
        style={{ fontFamily: "Jua, sans-serif", background: "#7B7355" }}
      >
        {loading ? "분석 중..." : "궁합 분석하기"}
      </button>

      {error && <p className="text-center text-red-500 font-bold">{error}</p>}

      {/* ── 결과 ── */}
      {result && (
        <div className="space-y-6 animate-fade-in">

          {/* 종합 점수 */}
          <div className="card text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* 인물 1 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-[#E2D7D0] bg-[#FAF8F5]">
                  <span className="text-sm font-semibold text-[#3D3338]">{result.person1.mainElement}</span>
                </div>
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mt-1">{result.person1.name}</p>
                <p className="text-xs text-[#8A7E78]">{result.person1.ddi}띠</p>
              </div>
              {/* 점수 */}
              <div className="text-center">
                <p style={{ fontFamily: "Jua, sans-serif", color: "#2F282B" }} className="text-3xl mt-1">{result.overallScore}점</p>
                <p style={{ fontFamily: "Jua, sans-serif", color: "#8B6F47" }} className="text-lg">{result.grade} 등급</p>
              </div>
              {/* 인물 2 */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-[#E2D7D0] bg-[#FAF8F5]">
                  <span className="text-sm font-semibold text-[#3D3338]">{result.person2.mainElement}</span>
                </div>
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mt-1">{result.person2.name}</p>
                <p className="text-xs text-[#8A7E78]">{result.person2.ddi}띠</p>
              </div>
            </div>
            <p className="text-base text-[#5A4E48] leading-relaxed">{result.mainAdvice}</p>
          </div>

          {/* 사주 기둥 표시 */}
          <div className="card">
            <h2 className="label mb-4">사주 기둥 (四柱)</h2>
            <PillarTable label={result.person1.name} pillars={result.person1.pillarDetails} hasHour={result.person1.hasHour} />
            <PillarTable label={result.person2.name} pillars={result.person2.pillarDetails} hasHour={result.person2.hasHour} />
          </div>

          {/* 기운의 상호작용 */}
          {result.gearAnalysis && result.gearAnalysis.length > 0 && (
            <div className="card">
              <h2 className="label mb-3">기운의 상호작용</h2>
              <div className="space-y-2">
                {result.gearAnalysis.map((g: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-3 border border-[#E2D7D0]">
                    <div>
                      <p className="text-sm font-bold text-[#3D3338]">{g.label}</p>
                      <p className="text-sm text-[#5A4E48]">{g.desc}</p>
                      <p className="text-xs mt-1 text-[#8B6F47]">
                        {g.score > 0 ? `+${g.score}` : g.score} 점
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 성격 */}
          <div className="card">
            <h2 className="label mb-4">두 사람의 성격</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[result.person1, result.person2].map((p: any, i: number) => (
                <div key={i} className="bg-white border border-[#E2D7D0] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338]">{p.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E2D7D0] text-[#5A4E48]">{p.eumyang} {p.mainElement}</span>
                  </div>
                  <p className="text-sm text-[#8B6F47] font-bold mb-1">{p.personality.title}</p>
                  <p className="text-sm text-[#5A4E48]">{p.personality.traits}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 오행 궁합 */}
          <div className="card">
            <h2 className="label mb-2">오행 궁합</h2>
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-lg text-[#3D3338] mb-3">{result.ohaengCombo.title}</p>
            <p className="text-base text-[#5A4E48] leading-relaxed mb-4">{result.ohaengCombo.chemistry}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 border border-[#E2D7D0]">
                <p className="text-sm text-[#8B6F47] font-bold mb-1">장점</p>
                <p className="text-sm text-[#5A4E48]">{result.ohaengCombo.strength}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-[#E2D7D0]">
                <p className="text-sm text-[#8B6F47] font-bold mb-1">주의점</p>
                <p className="text-sm text-[#5A4E48]">{result.ohaengCombo.weakness}</p>
              </div>
            </div>
            <div className="mt-3 bg-white rounded-xl p-3 border border-[#E2D7D0]">
              <p className="text-sm text-[#8B6F47] font-bold mb-1">관계 팁</p>
              <p className="text-sm text-[#5A4E48]">{result.ohaengCombo.tip}</p>
            </div>
          </div>

          {/* 음양 궁합 */}
          <div className="card">
            <h2 className="label mb-2">음양 궁합</h2>
            <div className="flex items-center gap-4 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-bold border border-[#E2D7D0] bg-[#FAF8F5] text-[#3D3338]">
                {result.person1.name}: {result.person1.eumyang}
              </span>
              <span className="h-px w-8 bg-[#D9C8C0]" />
              <span className="px-3 py-1 rounded-full text-sm font-bold border border-[#E2D7D0] bg-[#FAF8F5] text-[#3D3338]">
                {result.person2.name}: {result.person2.eumyang}
              </span>
            </div>
            <p className="text-base text-[#5A4E48] leading-relaxed">{result.eumyangDesc}</p>
          </div>

          {/* 띠 궁합 */}
          <div className="card">
            <h2 className="label mb-2">띠 궁합</h2>
            <div className="flex items-center gap-4 mb-3 text-sm text-[#8A7E78]">
              <span>{result.person1.ddi}띠</span>
              <span className="h-px w-8 bg-[#D9C8C0]" />
              <span>{result.person2.ddi}띠</span>
            </div>
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#5C4B3A] mb-2">{result.ddiCombo.title}</p>
            <p className="text-base text-[#5A4E48] leading-relaxed">{result.ddiCombo.desc}</p>
          </div>

          {/* 일주 궁합 (추가) */}
          {result.ilju && (
            <div className="card">
              <h2 className="label mb-2">일주(日柱) 궁합</h2>
              <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mb-2">{result.ilju.title}</p>
              <p className="text-sm text-[#5A4E48] leading-relaxed">{result.ilju.desc}</p>
            </div>
          )}

          {/* 세부 궁합 */}
          <div className="card">
            <h2 className="label mb-4">세부 궁합 분석</h2>
            <div className="space-y-4">
              {result.categories.map((cat: any) => (
                <div key={cat.label} className="bg-white border border-[#E2D7D0] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338]">{cat.label}</span>
                    <span className="text-lg font-bold" style={{ color: scoreColor(cat.score) }}>{cat.score}점</span>
                  </div>
                  <div className="h-3 bg-[#FAF8F5] rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.score}%`, backgroundColor: scoreColor(cat.score) }} />
                  </div>
                  <p className="text-sm text-[#5A4E48] leading-relaxed">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 관계 분석 요약 */}
          <div className="card">
            <h2 className="label mb-4">관계 분석 요약</h2>
            <div className="space-y-4">
              <div className="bg-white border border-[#E2D7D0] rounded-xl p-4">
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mb-2">이 관계의 장점</p>
                {result.strengths.map((s: string, i: number) => <p key={i} className="text-sm text-[#5A4E48] mb-1">• {s}</p>)}
              </div>
              <div className="bg-white border border-[#E2D7D0] rounded-xl p-4">
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mb-2">주의할 점</p>
                {result.weaknesses.map((s: string, i: number) => <p key={i} className="text-sm text-[#5A4E48] mb-1">• {s}</p>)}
              </div>
              <div className="bg-white border border-[#E2D7D0] rounded-xl p-4">
                <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] mb-2">관계 개선 팁</p>
                {result.tips.map((s: string, i: number) => <p key={i} className="text-sm text-[#5A4E48] mb-1">• {s}</p>)}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
