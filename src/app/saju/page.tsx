"use client";

import { useState } from "react";

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

export default function SajuPage() {
  const currentYear = new Date().getFullYear();
  const [name, setName] = useState("");
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeMode, setTimeMode] = useState<"none" | "slot" | "exact">("none");
  const [slotValue, setSlotValue] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [gender, setGender] = useState<"남" | "여">("여");
  const [isLunar, setIsLunar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SajuResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      let sendHour: number | undefined;
      let sendMinute: number | undefined;
      if (timeMode === "exact") { sendHour = exactHour; sendMinute = exactMinute; }
      else if (timeMode === "slot") { sendHour = slotValue; sendMinute = 0; }

      const res = await fetch("/api/saju", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, year, month, day, hour: sendHour, minute: sendMinute, gender, isLunar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  function ohaengColor(name: string) {
    const map: Record<string, string> = { "목(木)": "#22c55e", "화(火)": "#ef4444", "토(土)": "#eab308", "금(金)": "#a3a3a3", "수(水)": "#3b82f6" };
    return map[name] || "#888";
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <span className="text-5xl">🔮</span>
        <h1 style={{ fontFamily: "Jua, sans-serif" }} className="text-2xl text-[#2D2B3D] mt-3">사주팔자 분석</h1>
        <p className="text-[#8A8498] text-sm mt-1">생년월일시를 입력하면 정확한 사주를 분석합니다</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-3">
              <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className="w-full p-2 rounded-lg border border-[#D7D3E7] text-[#2D2B3D] text-sm focus:outline-none focus:border-[#B8B0D0]" style={{ fontFamily: "Jua, sans-serif" }} />
            </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>출생년도</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-full bg-white border-2 border-[#D7D3E7] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                {Array.from({ length: currentYear - 1927 + 1 }, (_, i) => currentYear - i).map((y) => (<option key={y} value={y}>{y}년</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>월</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full bg-white border-2 border-[#D7D3E7] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (<option key={m} value={m}>{m}월</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>일</label>
              <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full bg-white border-2 border-[#D7D3E7] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (<option key={d} value={d}>{d}일</option>))}
              </select>
            </div>
          </div>

          {/* 시간 모드 */}
          <div>
            <label className="block text-xs text-[#8A8498] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>출생시간</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setTimeMode("none")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "none" ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>모름</button>
              <button type="button" onClick={() => setTimeMode("slot")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "slot" ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>시간대 선택</button>
              <button type="button" onClick={() => setTimeMode("exact")} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${timeMode === "exact" ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>⏰ 시/분 직접입력</button>
            </div>
            {timeMode === "slot" && (
              <select value={slotValue} onChange={(e) => setSlotValue(Number(e.target.value))} className="w-full bg-white border-2 border-[#D7D3E7] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                {timeSlots.map((slot) => (<option key={slot.value} value={slot.value}>{slot.label}</option>))}
              </select>
            )}
            {timeMode === "exact" && (
              <div className="bg-[#F0EEF6] rounded-xl p-4 space-y-3">
                <p className="text-xs text-[#8B7968]">정확한 출생 시각을 입력하면 진태양시(서울 기준 약 -32분) 보정이 자동 적용됩니다.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#8B7968] mb-1 font-medium">시</label>
                    <select value={exactHour} onChange={(e) => setExactHour(Number(e.target.value))} className="w-full bg-white border-2 border-[#D5CFF0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (<option key={h} value={h}>{String(h).padStart(2, "0")}시</option>))}
                    </select>
                  </div>
                  <span className="text-[#8A8498] font-bold text-xl mt-5">:</span>
                  <div className="flex-1">
                    <label className="block text-xs text-[#8B7968] mb-1 font-medium">분</label>
                    <select value={exactMinute} onChange={(e) => setExactMinute(Number(e.target.value))} className="w-full bg-white border-2 border-[#D5CFF0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#9B8EC8] outline-none">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (<option key={m} value={m}>{String(m).padStart(2, "0")}분</option>))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 양력/음력 */}
          <div>
            <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>달력</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsLunar(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${!isLunar ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>☀️ 양력</button>
              <button type="button" onClick={() => setIsLunar(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isLunar ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>🌙 음력</button>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-xs text-[#8A8498] mb-1" style={{ fontFamily: "Jua, sans-serif" }}>성별</label>
            <div className="flex gap-2">
            <button type="button" onClick={() => setGender("남")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${gender === "남" ? "bg-[#9B8EC8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>👨 남</button>
            <button type="button" onClick={() => setGender("여")} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${gender === "여" ? "bg-[#C4A8D8] text-white shadow-md" : "bg-white border-2 border-[#D7D3E7] text-[#8A8498]"}`}>👩 여</button>
            </div>
          </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-bold text-base transition-all bg-gradient-to-r from-[#9B8EC8] to-[#8B7968] hover:shadow-lg disabled:opacity-50" style={{ fontFamily: "Jua, sans-serif" }}>{loading ? "분석 중 ..." : "🔮 사주 분석하기"}</button>
        </form>
      </div>

      {error && <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">{error}</div>}

      {result && (
        <div className="space-y-5">
          {/* 기본 정보 */}
          <div className="card">
            <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>{result.ddi?.emoji} 기본 정보</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">생년월일:</span> <span className="font-medium">{result.birthDate}</span></div>
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">출생시간:</span> <span className="font-medium">{result.birthTime || "미입력"}</span></div>
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">성별:</span> <span className="font-medium">{result.gender}</span></div>
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">나이:</span> <span className="font-medium">{result.age}세</span></div>
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">띠:</span> <span className="font-medium">{result.ddi?.emoji} {result.ddi?.name} ({result.ddi?.hanja})</span></div>
              <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">일간:</span> <span className="font-medium">{result.dayGan} ({result.mainElement})</span></div>
              {result.strength && <div className="bg-[#F5F3FA] rounded-lg p-2"><span className="text-[#8A8498]">신강/신약:</span> <span className="font-medium">{result.strength}{result.strengthScore ? ` (${result.strengthScore}점)` : ""}</span></div>}
            {result.gyeok && <div className="bg-gradient-to-r from-[#EDE8F5] to-[#EDE9FE] rounded-xl p-3 border border-[#DDD6FE]"><span className="text-xs text-[#7C3AED] font-bold block mb-1">격국 (格局)</span><span className="text-sm font-bold text-[#2D2B3D]">{result.gyeok}</span></div>}
            {result.yongshin && <div className="bg-gradient-to-r from-[#E8E4F0] to-[#FDE68A] rounded-xl p-3 border border-[#FCD34D] col-span-2"><span className="text-xs text-[#B45309] font-bold block mb-1">용신 (用神)</span><span className="text-sm font-bold text-[#2D2B3D]">{result.yongshin}</span></div>}
            {result.gongmang && <div className="bg-[#F5F3FA] rounded-xl p-3 border border-[#E8E0D8] col-span-2"><span className="text-xs text-[#8A8498] font-bold block mb-1">공망 (空亡)</span><span className="text-sm font-bold text-[#2D2B3D]">{result.gongmang}</span></div>}
            </div>
          </div>

          {/* 사주 원국 */}
          <div className="card">
            <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📋 사주 원국</h2>
            <div className="grid grid-cols-4 gap-2">
              {(["hour", "day", "month", "year"] as const).map((key) => {
                const p = result.pillars?.[key];
                if (!p) return null;
                return (
                  <div key={key} className="rounded-xl border-2 p-3 text-center" style={{ borderColor: p.skyColor || "#D7D3E7" }}>
                    <div className="text-[10px] text-[#8A8498] mb-1">{p.label}</div>
                    <div className="text-xs text-[#8A8498]">{p.tenGodSky || ""}</div>
                    <div className="text-2xl my-1">{p.skyEmoji}</div>
                    <div className="font-bold text-lg" style={{ color: p.skyColor }}>{p.sky}</div>
                    <div className="text-xs text-[#8A8498]">{p.skyKo} ({p.skyElement})</div>
                    <hr className="my-2 border-[#D7D3E7]" />
                    <div className="text-xs text-[#8A8498]">{p.tenGodEarth || ""}</div>
                    <div className="text-2xl my-1">{p.earthEmoji}</div>
                    <div className="font-bold text-lg" style={{ color: p.earthColor }}>{p.earth}</div>
                    <div className="text-xs text-[#8A8498]">{p.earthKo} ({p.earthElement})</div>
                    {p.stage12 && <div className="text-[10px] mt-1 text-[#9B8EC8]">{p.stage12}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 지장간 */}
          <div className="card">
            <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🔍 지장간 (숨은 천간)</h2>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              {(["hour", "day", "month", "year"] as const).map((key) => {
                const p = result.pillars?.[key];
                if (!p) return null;
                const h = p.hiddenStems;
                return (
                  <div key={key} className="bg-[#F5F3FA] rounded-xl p-3">
                    <div className="text-[10px] text-[#8A8498] mb-2">{p.label}</div>
                    <div className="space-y-1">
                      {h?.yeogi && <div className="text-xs"><span className="text-[#8A8498]">여기:</span> {h.yeogi}</div>}
                      {h?.junggi && <div className="text-xs"><span className="text-[#8A8498]">중기:</span> {h.junggi}</div>}
                      {h?.jeonggi && <div className="text-xs"><span className="text-[#8A8498]">정기:</span> {h.jeonggi}</div>}
                      {!h?.yeogi && !h?.junggi && !h?.jeonggi && <div className="text-xs text-[#ccc]">-</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 오행 분포 */}
          {result.ohaengCount && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🌿 오행 분포</h2>
              <div className="flex gap-2 justify-center mb-4">
                {Object.entries(result.ohaengCount).map(([name, count]) => (
                  <div key={name} className="flex-1 text-center rounded-xl p-3" style={{ backgroundColor: ohaengColor(name) + "18", border: `2px solid ${ohaengColor(name)}40` }}>
                    <div className="text-xs text-[#5A5468]">{name}</div>
                    <div className="text-2xl font-bold" style={{ color: ohaengColor(name) }}>{count}</div>
                  </div>
                ))}
              </div>
              {result.ohaengAnalysis && result.ohaengAnalysis.length > 0 && (
                <div className="space-y-2">
                  {result.ohaengAnalysis.filter(o => o.count > 0).map((o) => (
                    <div key={o.name} className="bg-[#F8F7FC] rounded-lg p-2 text-xs text-[#5A5A5A]">
                      <span className="font-bold" style={{ color: ohaengColor(o.name) }}>{o.name} ({o.count}개)</span>: {o.desc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 십성 분석 */}
          {result.sipsinAnalysis && result.sipsinAnalysis.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>⭐ 십성 분석</h2>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {result.sipsinAnalysis.map((s) => (
                  <div key={s.name} className="bg-[#F5F3FA] rounded-lg px-3 py-2 text-center">
                    <div className="text-xs text-[#8A8498]">{s.name}</div>
                    <div className="font-bold text-[#2D2B3D]">{s.count}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {result.sipsinAnalysis.filter(s => s.desc && s.name !== "(일간)").map((s) => (
                  <div key={s.name} className="bg-[#F8F7FC] rounded-lg p-2 text-xs text-[#5A5A5A]">
                    <span className="font-bold text-[#2D2B3D]">{s.name} ({s.count}개)</span>: {s.desc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 천간/지지 관계 */}
          {((result.stemRelations && result.stemRelations.length > 0) || (result.branchRelations && result.branchRelations.length > 0)) && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🔗 천간·지지 관계</h2>
              {result.stemRelations && result.stemRelations.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-[#5A5A5A] mb-2">천간 관계</h3>
                  {result.stemRelations.map((r, i) => (
                    <div key={i} className="bg-[#F8F7FC] rounded-lg p-2 mb-1 text-xs text-[#5A5A5A]">
                      <span className={`font-bold ${r.type === "합" ? "text-green-600" : "text-red-500"}`}>[{r.type}]</span> {r.desc}
                    </div>
                  ))}
                </div>
              )}
              {result.branchRelations && result.branchRelations.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#5A5A5A] mb-2">지지 관계</h3>
                  {result.branchRelations.map((r, i) => (
                    <div key={i} className="bg-[#F0F0FA] rounded-lg p-2 mb-1 text-xs text-[#5A5A5A]">
                      <span className={`font-bold ${["육합", "삼합", "반합", "방합"].includes(r.type) ? "text-blue-600" : "text-orange-500"}`}>[{r.type}]</span>{" "}
                      {Object.entries(r.details).map(([k, v]) => `${k}: ${v}`).join(" | ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 신살 */}
          {result.salsSummary && result.salsSummary.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🛡️ 신살</h2>
              <div className="grid grid-cols-2 gap-2">
                {result.salsSummary.map((s, i) => (
                  <div key={i} className="bg-[#F5F3FA] rounded-xl p-3">
                    <div className="text-xs font-bold text-[#2D2B3D] mb-1">{s.pillar}</div>
                    {s.twelveSal && <div className="text-xs text-[#5A5A5A]">12신살: {s.twelveSal}</div>}
                    {s.specialSals.length > 0 && <div className="text-xs text-[#9B8EC8]">특수살: {s.specialSals.join(", ")}</div>}
                  </div>
                ))}
              </div>
              {result.gilsin && result.gilsin.length > 0 && (
                <div className="mt-3 bg-[#F0F5FA] rounded-lg p-2 text-xs"><span className="font-bold text-green-600">길신:</span> {result.gilsin.join(", ")}</div>
              )}
              {result.hyungsin && result.hyungsin.length > 0 && (
                <div className="mt-1 bg-[#F5F0FA] rounded-lg p-2 text-xs"><span className="font-bold text-red-500">흉신:</span> {result.hyungsin.join(", ")}</div>
              )}
            </div>
          )}

          {/* 성격 분석 */}
          {result.personality && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🧠 성격 분석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed">{result.personality}</p>
            </div>
          )}

          {/* 대운 */}
          {result.daeun && result.daeun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🔄 대운 (10년 단위)</h2>
              {result.daeunCurrent && <p className="text-xs text-[#9B8EC8] mb-2">현재 대운: {result.daeunCurrent.ganKo}{result.daeunCurrent.jiKo} ({result.daeunCurrent.ganzhi})</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A8498]">
                      <td className="p-1">나이</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1">{d.age}세~</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A8498]">간지</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 font-bold">{d.gan}{d.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">한글</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#8A8498]">{d.ganKo}{d.jiKo}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">십성</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#9B8EC8]">{d.tenGodStem}/{d.tenGodBranch}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">12운성</td>
                      {result.daeun.map((d, i) => (<td key={i} className="p-1 text-[#5A5468]">{d.stage12 || "-"}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 세운 */}
          {result.seyun && result.seyun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📅 세운 (연간)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A8498]">
                      <td className="p-1">년도</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1">{s.year}</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A8498]">간지</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 font-bold">{s.gan}{s.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">한글</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#8A8498]">{s.ganKo}{s.jiKo}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">십성</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#9B8EC8]">{s.tenGodStem}/{s.tenGodBranch}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">12운성</td>
                      {result.seyun.map((s, i) => (<td key={i} className="p-1 text-[#5A5468]">{s.stage12 || "-"}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 월운 */}
          {result.wolun && result.wolun.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📆 월운 ({new Date().getFullYear()}년)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center min-w-[600px]">
                  <thead>
                    <tr className="text-[#8A8498]">
                      <td className="p-1">월</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1">{w.month}월</td>))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-1 text-[#8A8498]">간지</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1 font-bold">{w.gan}{w.ji}</td>))}
                    </tr>
                    <tr>
                      <td className="p-1 text-[#8A8498]">십성</td>
                      {result.wolun.map((w, i) => (<td key={i} className="p-1 text-[#9B8EC8]">{w.tenGodStem}/{w.tenGodBranch}</td>))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 종합 해석 */}
          {result.summary && (
            <div className="card bg-gradient-to-br from-[#F0EEF6] to-[#EDE8F5]">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>📝 종합 해석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed whitespace-pre-line">{result.summary}</p>
            </div>
          )}

          {/* AI 해석 (라이브러리 제공) */}
          {result.interpretation && (
            <div className="card bg-gradient-to-br from-[#F8F7FC] to-[#FFF0E8]">
              <h2 className="text-lg font-bold text-[#2D2B3D] mb-3" style={{ fontFamily: "Jua, sans-serif" }}>🤖 AI 해석</h2>
              <p className="text-sm text-[#5A5A5A] leading-relaxed whitespace-pre-line">{result.interpretation}</p>
            </div>
          )}

            {/* 프리미엄 해설 유도 배너 */}
            <div className="rounded-2xl p-6 text-center shadow-lg" style={{ background: "linear-gradient(135deg, #E8DEF8 0%, #D4C6F0 50%, #C9B8E8 100%)", border: "1px solid #D1C4E9" }}>
              <div className="text-3xl mb-2">🔮</div>
              <h2 className="text-lg font-bold mb-2 text-[#4A3660]" style={{ fontFamily: "Jua, sans-serif" }}>더 깊은 사주 해설이 궁금하신가요?</h2>
              <p className="text-sm mb-1 text-[#6B5B7B]">AI가 분석하는 프리미엄 사주 리포트</p>
              <div className="text-xs mb-4 space-y-1 text-left inline-block text-[#5C4D6E]">
                <div>✨ 십성 심화 해설 & 성격 분석</div>
                <div>✨ 대운별 인생 흐름 상세 풀이</div>
                <div>✨ 올해 & 내년 운세 심층 분석</div>
                <div>✨ 재물운 · 직업운 · 건강운 · 연애운</div>
                <div>✨ 100페이지+ 맞춤형 리포트</div>
              </div>
              <br />
            <button className="bg-[#9B8EC8] text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-[#6B4D9E] transition text-sm" onClick={() => { localStorage.setItem("sajuUserName", name); localStorage.setItem("premiumSajuData", JSON.stringify({...result, userName: name})); window.location.href = "/saju/premium"; }}>
                프리미엄 해설 보기 →
              </button>
            <p className="text-[10px] text-[#8B7BA0] mt-2">10개 챕터 심층 분석 · AI 맞춤형 리포트</p>
            </div>
        </div>
      )}
    </div>
  );
}
