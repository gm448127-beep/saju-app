"use client";

import { useState } from "react";

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

export default function TodayPage() {
  const currentYear = new Date().getFullYear();

  // 폼 상태
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("none");
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState("남");

  // 결과 상태
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

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
          year, month, day, hour, minute,
          isLunar, gender,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "분석 실패");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const statItems = result
    ? [
        { label: "재물운", key: "wealth", color: "#E8A87C", emoji: "💰" },
        { label: "애정운", key: "love", color: "#D87A8C", emoji: "💕" },
        { label: "직장운", key: "career", color: "#5EA3B8", emoji: "💼" },
        { label: "건강운", key: "health", color: "#5FB88A", emoji: "💪" },
        { label: "행운", key: "luck", color: "#7B6CB8", emoji: "🍀" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center py-4">
        <span className="text-5xl">🌤️</span>
        <h1
          style={{ fontFamily: "Jua, sans-serif" }}
          className="text-2xl text-[#3D3338] mt-3"
        >
          오늘의 운세
        </h1>
        <p className="text-[#847A80] text-sm mt-1">
          생년월일시를 입력하면 오늘의 운세를 분석합니다
        </p>
      </div>

      {/* ────────── 입력 폼 (사주보기와 동일 구조) ────────── */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 년 / 월 / 일 */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#9B9B9B] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>출생년도</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none transition-colors">
                {Array.from({ length: currentYear - 1927 + 1 }, (_, i) => currentYear - i).map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9B9B9B] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>월</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none transition-colors">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#9B9B9B] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>일</label>
              <select value={day} onChange={e => setDay(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none transition-colors">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 출생시간 — 사주보기와 동일한 3가지 모드 */}
          <div>
            <label className="block text-xs text-[#9B9B9B] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>출생시간</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setTimeMode("none")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "none" ? "bg-[#5EA3B8] text-white shadow-md" : "bg-white border-2 border-[#E8E2DC] text-[#9B9B9B]"}`}>
                모름
              </button>
              <button type="button" onClick={() => setTimeMode("slot")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "slot" ? "bg-[#5EA3B8] text-white shadow-md" : "bg-white border-2 border-[#E8E2DC] text-[#9B9B9B]"}`}>
                시간대 선택
              </button>
              <button type="button" onClick={() => setTimeMode("exact")}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "exact" ? "bg-[#5EA3B8] text-white shadow-md" : "bg-white border-2 border-[#E8E2DC] text-[#9B9B9B]"}`}>
                ⏰ 시/분 직접입력
              </button>
            </div>

            {/* 시간대 선택 모드 */}
            {timeMode === "slot" && (
              <select value={slotHour} onChange={e => setSlotHour(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none transition-colors">
                {TIME_SLOTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}

            {/* 시/분 직접입력 모드 */}
            {timeMode === "exact" && (
              <div className="bg-[#EDF5F8] rounded-xl p-4 space-y-3">
                <p className="text-xs text-[#5EA3B8]">
                  정확한 출생 시각을 입력하면 시주까지 포함한 정밀 분석이 가능합니다.
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#5EA3B8] mb-1 font-medium">시</label>
                    <select value={exactHour} onChange={e => setExactHour(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#C8DFE8] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none">
                      {Array.from({ length: 24 }, (_, i) => i).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[#9B9B9B] font-bold text-xl mt-5">:</span>
                  <div className="flex-1">
                    <label className="block text-xs text-[#5EA3B8] mb-1 font-medium">분</label>
                    <select value={exactMinute} onChange={e => setExactMinute(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#C8DFE8] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#7EB3C8] outline-none">
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
              <label className="block text-xs text-[#9B9B9B] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>달력</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsLunar(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${!isLunar ? "bg-[#FFF9E6] text-[#E5C100] border-[#FFD700]" : "bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]"}`}>
                  ☀️ 양력
                </button>
                <button type="button" onClick={() => setIsLunar(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${isLunar ? "bg-[#F0EDF8] text-[#8B7EC8] border-[#8B7EC8]" : "bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]"}`}>
                  🌙 음력
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#9B9B9B] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>성별</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setGender("남")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${gender === "남" ? "bg-[#EDF5F8] text-[#7EB3C8] border-[#7EB3C8]" : "bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]"}`}>
                  👨 남
                </button>
                <button type="button" onClick={() => setGender("여")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${gender === "여" ? "bg-[#F8EDF0] text-[#E88B9C] border-[#E88B9C]" : "bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]"}`}>
                  👩 여
                </button>
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white text-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#5EA3B8", fontFamily: "Jua, sans-serif" }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                분석 중...
              </span>
            ) : "🌤️ 오늘의 운세 보기"}
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
        <div className="space-y-6 animate-fade-in">
          {/* ① 종합 등급 & 점수 */}
          <div className="card text-center">
            <p className="text-sm text-[#847A80] mb-1">{result.date}</p>
            <p className="text-sm text-[#5C5358] mb-3">
              오늘의 간지: {result.todayGan}{result.todayJi} {result.todayEmoji}
            </p>
            <div className="inline-block px-8 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: `${result.gradeColor}18` }}>
              <p className="text-4xl font-bold pixel-text" style={{ color: result.gradeColor }}>
                {result.grade}
              </p>
            </div>
            <p className="text-3xl mb-1">{result.gradeEmoji}</p>
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-xl text-[#3D3338]">
              종합 점수: <span style={{ color: result.gradeColor }}>{result.scores.overall}점</span>
            </p>
          </div>

          {/* ② 오늘의 명언 */}
          <div className="card text-center" style={{ backgroundColor: "#FFF9F0", borderColor: "#E8DCC8" }}>
            <p className="text-lg text-[#5C5358] italic leading-relaxed">
              &ldquo;{result.todayQuote.text}&rdquo;
            </p>
            <p className="text-sm text-[#847A80] mt-2">— {result.todayQuote.author}</p>
          </div>

          {/* ③ 오늘과 나의 관계 */}
          <div className="card">
            <h2 className="label mb-3">오늘과 나의 관계</h2>
            <div className="flex items-center justify-center gap-6 mb-3">
              <div className="text-center">
                <span className="text-3xl">{result.myEmoji}</span>
                <p className="text-sm text-[#5C5358] mt-1">나 ({result.myElement})</p>
              </div>
              <span className="text-[#D87A8C] text-xl">⚡</span>
              <div className="text-center">
                <span className="text-3xl">{result.todayEmoji}</span>
                <p className="text-sm text-[#5C5358] mt-1">오늘 ({result.todayGanOhaeng})</p>
              </div>
            </div>
            {result.todaySipsin && (
              <div className="text-center mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "#8B7EC8" }}>
                  {result.todaySipsin}
                </span>
              </div>
            )}
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-base text-[#3D3338] text-center mb-2">
              {result.relation}
            </p>
            <p className="text-sm text-[#5C5358] text-center">{result.relationDetail}</p>
          </div>

          {/* ④ 톱니바퀴 분석 */}
          {result.gearAnalysis && result.gearAnalysis.length > 0 && (
            <div className="card" style={{ backgroundColor: "#F5F0FF", borderColor: "#D4CCE8" }}>
              <h2 className="label mb-2">⚙️ 사주 톱니바퀴 분석</h2>
              <p className="text-xs text-[#847A80] mb-4">
                내 사주 8글자와 오늘의 일진이 어떻게 맞물리는지 보여줍니다
              </p>
              <div className="space-y-2">
                {result.gearAnalysis.map((line: string, i: number) => {
                  let icon = "⚙️";
                  if (line.includes("⬆⬆")) icon = "🔥";
                  else if (line.includes("⬆")) icon = "✨";
                  else if (line.includes("⬇⬇")) icon = "💥";
                  else if (line.includes("⬇")) icon = "⚡";
                  let bgColor = "bg-white/60";
                  if (line.includes("⬆")) bgColor = "bg-green-50";
                  else if (line.includes("⬇")) bgColor = "bg-red-50";
                  return (
                    <div key={i} className={`flex items-start gap-2 ${bgColor} border border-[#E8E2DC] rounded-xl px-3 py-2.5`}>
                      <span className="text-base mt-0.5">{icon}</span>
                      <p className="text-sm text-[#3D3338] flex-1 leading-relaxed">
                        {line.replace(/^⚙️\s*/, "")}
                      </p>
                    </div>
                  );
                })}
              </div>
              {result.pillars && (
                <div className="mt-4 pt-3 border-t border-[#E8E2DC]">
                  <p className="text-xs text-[#847A80] mb-2 text-center">내 사주 원국</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "년주", value: result.pillars.year },
                      { label: "월주", value: result.pillars.month },
                      { label: "일주", value: result.pillars.day },
                      { label: "시주", value: result.pillars.hour },
                    ].map((p) => (
                      <div key={p.label} className="bg-white border border-[#E8E2DC] rounded-lg py-2">
                        <p className="text-[10px] text-[#9B9B9B]">{p.label}</p>
                        <p className="text-sm font-bold text-[#3D3338] mt-0.5">{p.value || "-"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ⑤ 세부 운세 스탯 */}
          <div className="card">
            <h2 className="label mb-4">세부 운세 스탯</h2>
            <div className="space-y-4">
              {statItems.map((item) => {
                const score = result.scores[item.key];
                return (
                  <div key={item.key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#5C5358]">{item.emoji} {item.label}</span>
                      <span className="text-base font-bold" style={{ color: item.color }}>{score}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${score}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⑥ 시간대별 운세 */}
          <div className="card">
            <h2 className="label mb-4">⏰ 시간대별 운세</h2>
            <div className="space-y-3">
              {result.timeAdvice && !Array.isArray(result.timeAdvice) &&
                [
                  { time: "🌅 오전", emoji: "🌅", advice: result.timeAdvice.morning },
                  { time: "☀️ 오후", emoji: "☀️", advice: result.timeAdvice.afternoon },
                  { time: "🌙 저녁", emoji: "🌙", advice: result.timeAdvice.evening },
                ].map((item) => (
                  <div key={item.time} className="bg-[#FAF7F4] border-2 border-[#E8E2DC] rounded-xl p-3 flex items-start gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338] mb-1">{item.time}</p>
                      <p className="text-sm text-[#5C5358]">{item.advice}</p>
                    </div>
                  </div>
                ))}
              {result.timeAdvice && Array.isArray(result.timeAdvice) &&
                result.timeAdvice.map((item: any) => (
                  <div key={item.time} className="bg-[#FAF7F4] border-2 border-[#E8E2DC] rounded-xl p-3 flex items-start gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338]">{item.time}</p>
                        <span className="text-sm font-bold" style={{ color: item.score >= 70 ? "#5FB88A" : item.score >= 50 ? "#E8A87C" : "#D87A8C" }}>
                          {item.score}점
                        </span>
                      </div>
                      <p className="text-sm text-[#5C5358]">{item.advice}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* ⑦ 하면 좋은 것 / 피할 것 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card" style={{ backgroundColor: "#F0F8F2", borderColor: "#C8E8D4" }}>
              <h2 className="label mb-3">✅ 오늘 하면 좋은 것</h2>
              <div className="space-y-2">
                {result.todayDos?.map((item: string, i: number) => (
                  <p key={i} className="text-sm text-[#3D5838]">{item}</p>
                ))}
              </div>
            </div>
            <div className="card" style={{ backgroundColor: "#F8F0F0", borderColor: "#E8C8C8" }}>
              <h2 className="label mb-3">❌ 오늘 피할 것</h2>
              <div className="space-y-2">
                {result.todayDonts?.map((item: string, i: number) => (
                  <p key={i} className="text-sm text-[#583838]">{item}</p>
                ))}
              </div>
            </div>
          </div>

          {/* ⑧ 행운 아이템 */}
          <div className="card">
            <h2 className="label mb-4">🍀 행운 아이템</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {result.luckyItems && !Array.isArray(result.luckyItems) &&
                [
                  { emoji: "🎨", label: "행운의 색", value: result.luckyItems.color },
                  { emoji: "🔢", label: "행운의 숫자", value: result.luckyItems.number },
                  { emoji: "🧭", label: "행운의 방향", value: result.luckyItems.direction },
                  { emoji: "🍽️", label: "행운의 음식", value: result.luckyItems.food },
                  { emoji: "📍", label: "행운의 장소", value: result.luckyItems.place },
                  { emoji: "⏰", label: "행운의 시간", value: result.luckyItems.time },
                ].map((item) => (
                  <div key={item.label} className="bg-[#FAF7F4] border-2 border-[#E8E2DC] rounded-2xl p-4 text-center">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-xs text-[#847A80] mt-1">{item.label}</p>
                    <p className="text-base font-bold text-[#3D3338] mt-1">{item.value}</p>
                  </div>
                ))}
              {result.luckyItems && Array.isArray(result.luckyItems) &&
                result.luckyItems.map((item: any) => (
                  <div key={item.label} className="bg-[#FAF7F4] border-2 border-[#E8E2DC] rounded-2xl p-4 text-center">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className="text-xs text-[#847A80] mt-1">{item.label}</p>
                    <p className="text-base font-bold text-[#3D3338] mt-1">{item.value}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* ⑨ 팁 & 주의사항 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card" style={{ backgroundColor: "#F0F8F2", borderColor: "#C8E8D4" }}>
              <h2 className="label mb-2">💡 오늘의 팁</h2>
              <p className="text-base text-[#3D5838]">{result.tip}</p>
            </div>
            <div className="card" style={{ backgroundColor: "#F8F0F0", borderColor: "#E8C8C8" }}>
              <h2 className="label mb-2">⚠️ 주의사항</h2>
              <p className="text-base text-[#583838]">{result.warning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
