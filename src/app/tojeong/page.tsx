'use client';

import { useState } from 'react';

const TIME_SLOTS = [
  { value: 23, label: '자시 (23:00~01:00)' },
  { value: 1,  label: '축시 (01:00~03:00)' },
  { value: 3,  label: '인시 (03:00~05:00)' },
  { value: 5,  label: '묘시 (05:00~07:00)' },
  { value: 7,  label: '진시 (07:00~09:00)' },
  { value: 9,  label: '사시 (09:00~11:00)' },
  { value: 11, label: '오시 (11:00~13:00)' },
  { value: 13, label: '미시 (13:00~15:00)' },
  { value: 15, label: '신시 (15:00~17:00)' },
  { value: 17, label: '유시 (17:00~19:00)' },
  { value: 19, label: '술시 (19:00~21:00)' },
  { value: 21, label: '해시 (21:00~23:00)' },
];

export default function TojeongPage() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [timeMode, setTimeMode] = useState<'none' | 'slot' | 'exact'>('none');
  const [slotHour, setSlotHour] = useState(9);
  const [exactHour, setExactHour] = useState(9);
  const [exactMinute, setExactMinute] = useState(0);
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState('남');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    let hour: number | undefined;
    let minute: number | undefined;

    if (timeMode === 'exact') {
      hour = exactHour;
      minute = exactMinute;
    } else if (timeMode === 'slot') {
      hour = slotHour;
      minute = 0;
    }

    try {
      const res = await fetch('/api/tojeong', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, day, hour, minute, isLunar, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      setResult(data);
      setSelectedMonth(null);
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  function scoreColor(score: number) {
    if (score >= 80) return '#f59e0b';
    if (score >= 60) return '#CCB6B0';
    if (score >= 40) return '#5EA3B8';
    return '#D87A8C';
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center py-4">
        <span className="text-5xl">📜</span>
        <h1 style={{ fontFamily: 'Jua, sans-serif' }} className="text-2xl text-[#3D3338] mt-3">토정비결</h1>
        <p className="text-[#8A7E78] text-sm mt-1">조선시대 토정 이지함 선생의 한 해 운세</p>
      </div>

      {/* 입력 폼 */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: 'Jua, sans-serif' }}>출생년도</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                {Array.from({ length: currentYear - 1927 + 1 }, (_, i) => currentYear - i).map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: 'Jua, sans-serif' }}>월</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: 'Jua, sans-serif' }}>일</label>
              <select value={day} onChange={e => setDay(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
            </div>
          </div>

          {/* 시간 입력 (사주보기와 동일 3모드) */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-2" style={{ fontFamily: 'Jua, sans-serif' }}>출생시간</label>
            <div className="flex gap-2 mb-3">
              {([
                { mode: 'none' as const, label: '모름' },
                { mode: 'slot' as const, label: '시간대 선택' },
                { mode: 'exact' as const, label: '⏰ 시/분 직접입력' },
              ]).map(({ mode, label }) => (
                <button key={mode} type="button" onClick={() => setTimeMode(mode)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    timeMode === mode
                      ? 'bg-[#CCB6B0] text-white shadow-md'
                      : 'bg-white border-2 border-[#D9C8C0] text-[#8A7E78]'
                  }`}>{label}</button>
              ))}
            </div>

            {timeMode === 'slot' && (
              <select value={slotHour} onChange={e => setSlotHour(Number(e.target.value))}
                className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                {TIME_SLOTS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}

            {timeMode === 'exact' && (
              <div className="bg-[#F2E4DC] rounded-xl p-4 space-y-3">
                <p className="text-xs text-[#6B5FA0]">정확한 출생 시각을 입력하면 진태양시 보정이 자동 적용됩니다.</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-[#6B5FA0] mb-1 font-medium">시</label>
                    <select value={exactHour} onChange={e => setExactHour(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                      {Array.from({ length: 24 }, (_, i) => i).map(h => (
                        <option key={h} value={h}>{String(h).padStart(2, '0')}시</option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[#8A7E78] font-bold text-xl mt-5">:</span>
                  <div className="flex-1">
                    <label className="block text-xs text-[#6B5FA0] mb-1 font-medium">분</label>
                    <select value={exactMinute} onChange={e => setExactMinute(Number(e.target.value))}
                      className="w-full bg-white border-2 border-[#D9C8C0] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#CCB6B0] outline-none">
                      {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 달력 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: 'Jua, sans-serif' }}>달력</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsLunar(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  !isLunar ? 'bg-[#CCB6B0] text-white shadow-md' : 'bg-white border-2 border-[#D9C8C0] text-[#8A7E78]'
                }`}>☀️ 양력</button>
              <button type="button" onClick={() => setIsLunar(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isLunar ? 'bg-[#CCB6B0] text-white shadow-md' : 'bg-white border-2 border-[#D9C8C0] text-[#8A7E78]'
                }`}>🌙 음력</button>
            </div>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-xs text-[#8A7E78] mb-1" style={{ fontFamily: 'Jua, sans-serif' }}>성별</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setGender('남')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  gender === '남' ? 'bg-[#5B8AF0] text-white shadow-md' : 'bg-white border-2 border-[#D9C8C0] text-[#8A7E78]'
                }`}>👨 남</button>
              <button type="button" onClick={() => setGender('여')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  gender === '여' ? 'bg-[#F06292] text-white shadow-md' : 'bg-white border-2 border-[#D9C8C0] text-[#8A7E78]'
                }`}>👩 여</button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white text-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#CCB6B0', fontFamily: 'Jua, sans-serif' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                분석 중...
              </span>
            ) : '📜 토정비결 보기'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm text-center">{error}</div>
      )}

      {/* 결과 */}
      {result && (
        <div className="space-y-6 animate-fade-in">

          {/* 기본 정보 + 사주원국 + 등급 */}
          <div className="card text-center">
            <div className="flex justify-center gap-3 flex-wrap mb-4">
              <div className="bg-[#F5EDE8] border-2 border-[#D9C8C0] rounded-xl px-4 py-2">
                <p className="text-xs text-[#8A7E78]">생년월일</p>
                <p className="text-base font-bold text-[#3D3338]">{result.birthDate}</p>
              </div>
              <div className="bg-[#F5EDE8] border-2 border-[#D9C8C0] rounded-xl px-4 py-2">
                <p className="text-xs text-[#8A7E78]">나이</p>
                <p className="text-base font-bold text-[#3D3338]">{result.age}세</p>
              </div>
              <div className="bg-[#F5EDE8] border-2 border-[#D9C8C0] rounded-xl px-4 py-2">
                <p className="text-xs text-[#8A7E78]">연간지</p>
                <p className="text-base font-bold text-[#3D3338]">{result.yearGanji} ({result.ddi}띠)</p>
              </div>
              <div className="bg-[#F5EDE8] border-2 border-[#D9C8C0] rounded-xl px-4 py-2">
                <p className="text-xs text-[#8A7E78]">일간 오행</p>
                <p className="text-base font-bold text-[#3D3338]">{result.myElementEmoji} {result.myElement}</p>
              </div>
            </div>

            {/* 사주 원국 4주 */}
            {result.pillars && (
              <div className="mb-4">
                <p className="text-xs text-[#8A7E78] mb-2">내 사주 원국</p>
                <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                  {(['hour', 'day', 'month', 'year'] as const).map(key => (
                    <div key={key} className="bg-white border-2 border-[#D9C8C0] rounded-lg py-2 text-center">
                      <p className="text-[10px] text-[#8A7E78]">
                        {key === 'year' ? '년주' : key === 'month' ? '월주' : key === 'day' ? '일주' : '시주'}
                      </p>
                      <p className="text-sm font-bold text-[#3D3338]">{result.pillars[key]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 괘 정보 */}
            <div className="bg-[#EFDED5] border-2 border-[#D9C8C0] rounded-2xl p-4 mb-3">
              <p className="text-xs text-[#8A7E78] mb-1">태수 {result.taesu} · 월건 {result.wolgeon} · 일진 {result.iljin}</p>
              <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-xl text-[#3D3338]">
                제 {result.totalGwae}괘 · {result.hexagram}({result.hexagramHanja})
              </p>
            </div>

            {/* 등급 */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
              style={{ backgroundColor: `${result.gradeColor}15` }}>
              <span className="text-3xl">{result.gradeEmoji}</span>
              <div>
                <p style={{ fontFamily: 'Jua, sans-serif', color: result.gradeColor }} className="text-2xl">{result.grade} 등급</p>
                <p className="text-sm text-[#5A4E48]">올해의 전체 운세</p>
              </div>
            </div>

            {/* 삼재 */}
            {result.samjae && (
              <div className={`mt-4 p-3 rounded-xl border-2 ${
                result.samjae.active ? 'bg-[#F2E8DC] border-[#E8C8C8]' : 'bg-[#F0E8DC] border-[#C8E8D4]'
              }`}>
                <p className="text-sm font-bold mb-1">{result.samjae.active ? '⚠️ 삼재 해당' : '✅ 삼재 비해당'}</p>
                <p className="text-xs text-[#5A4E48]">{result.samjae.description}</p>
              </div>
            )}
          </div>

          {/* 톱니바퀴 분석 */}
          {result.gearAnalysis && result.gearAnalysis.length > 0 && (
            <div className="card" style={{ backgroundColor: '#F5F0FF', borderColor: '#D4CCE8' }}>
              <h2 className="label mb-2">⚙️ 사주 톱니바퀴 분석</h2>
              <p className="text-xs text-[#8A7E78] mb-3">내 사주 8글자와 2026 병오(丙午)년이 어떻게 맞물리는지 보여줍니다</p>
              <div className="space-y-2">
                {result.gearAnalysis.map((line: string, i: number) => {
                  const isBigUp = line.includes('⬆⬆');
                  const isUp = line.includes('⬆');
                  const isBigDown = line.includes('⬇⬇');
                  const isDown = line.includes('⬇');
                  const icon = isBigUp ? '🔥' : isUp ? '✨' : isBigDown ? '💥' : isDown ? '⚡' : '⚙️';
                  const bg = isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : 'bg-white/60';
                  return (
                    <div key={i} className={`flex items-start gap-2 ${bg} border rounded-xl px-3 py-2.5`}>
                      <span className="text-base mt-0.5">{icon}</span>
                      <p className="text-sm flex-1 text-[#3D3338]">{line.replace(/^⚙️\s*/, '')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 토정비결 시(詩) */}
          <div className="card" style={{ backgroundColor: '#F5EDE8', borderColor: '#E8DCC8' }}>
            <h2 className="label mb-3">🖊️ 토정비결 시(詩)</h2>
            <div className="bg-white/60 rounded-xl p-4 border border-[#E8DCC8]">
              {result.poem.split('\n').map((line: string, i: number) => (
                <p key={i} style={{ fontFamily: 'Jua, sans-serif' }}
                  className="text-base text-[#5C4B3A] leading-loose text-center">{line}</p>
              ))}
            </div>
          </div>

          {/* 괘의 의미 */}
          <div className="card" style={{ backgroundColor: '#EFDED5', borderColor: '#D4CCE8' }}>
            <h2 className="label mb-2">🔮 괘의 의미</h2>
            <p className="text-base text-[#5A4E48] leading-relaxed">{result.meaning}</p>
          </div>

          {/* 총평 + 심화 해석 */}
          <div className="card">
            <h2 className="label mb-2">📋 올해의 운세 총평</h2>
            <p className="text-base text-[#3D3338] leading-relaxed mb-4">{result.summary}</p>

            {result.deepContent && (
              <div className="bg-[#EFDED5] border-2 border-[#D4CCE8] rounded-xl p-4 mb-4">
                <h3 className="text-sm font-bold text-[#7B6CB8] mb-2">📖 2026 병오년 심화 해석</h3>
                {result.deepContent.split('\n\n').map((para: string, i: number) => (
                  <p key={i} className="text-sm text-[#5A4E48] leading-relaxed mb-2">{para}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F0E8DC] border-2 border-[#C8E8D4] rounded-xl p-3">
                <p className="text-sm text-[#5FB88A] font-bold mb-1">💡 조언</p>
                <p className="text-sm text-[#3D5838]">{result.advice}</p>
              </div>
              <div className="bg-[#F2E8DC] border-2 border-[#E8C8C8] rounded-xl p-3">
                <p className="text-sm text-[#D87A8C] font-bold mb-1">⚠️ 주의</p>
                <p className="text-sm text-[#5C3838]">{result.caution}</p>
              </div>
            </div>
          </div>

          {/* 분야별 운세 */}
          <div className="card">
            <h2 className="label mb-4">📊 분야별 운세</h2>
            <div className="space-y-4">
              {result.categories.map((cat: any) => (
                <div key={cat.label} className="bg-[#F5EDE8] border-2 border-[#D9C8C0] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontFamily: 'Jua, sans-serif' }} className="text-base text-[#3D3338]">{cat.emoji} {cat.label}</span>
                    <span className="text-lg font-bold" style={{ color: scoreColor(cat.score) }}>{cat.score}점</span>
                  </div>
                  <div className="h-3 bg-[#D9C8C0] rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.score}%`, backgroundColor: scoreColor(cat.score) }} />
                  </div>
                  <p className="text-sm text-[#5A4E48] leading-relaxed mb-2">{cat.description}</p>
                  <div className="bg-white/60 rounded-lg p-2 border border-[#D9C8C0]">
                    <p className="text-xs text-[#7B6CB8]">💜 TIP: {cat.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 월별 운세 */}
          <div className="card">
            <h2 className="label mb-4">📅 월별 운세</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
              {result.monthlyFortunes.map((mf: any) => (
                <button key={mf.month}
                  onClick={() => setSelectedMonth(selectedMonth === mf.month ? null : mf.month)}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    selectedMonth === mf.month
                      ? 'bg-[#CCB6B0] border-[#7B6CB8] text-white'
                      : 'bg-[#F5EDE8] border-[#D9C8C0] hover:border-[#CCB6B0]'
                  }`}>
                  <p className="text-lg">{mf.emoji}</p>
                  <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-sm">{mf.label}</p>
                  <p className="text-xs font-bold" style={{ color: selectedMonth === mf.month ? 'white' : scoreColor(mf.score) }}>{mf.score}점</p>
                </button>
              ))}
            </div>
            {selectedMonth && (() => {
              const mf = result.monthlyFortunes.find((m: any) => m.month === selectedMonth);
              if (!mf) return null;
              return (
                <div className="bg-[#EFDED5] border-2 border-[#D4CCE8] rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{mf.emoji}</span>
                    <div>
                      <p style={{ fontFamily: 'Jua, sans-serif' }} className="text-lg text-[#3D3338]">{mf.label} - {mf.theme}</p>
                      <p className="text-sm font-bold" style={{ color: scoreColor(mf.score) }}>{mf.score}점</p>
                    </div>
                  </div>
                  <div className="h-3 bg-[#D9C8C0] rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${mf.score}%`, backgroundColor: scoreColor(mf.score) }} />
                  </div>
                  <p className="text-base text-[#5A4E48] leading-relaxed">{mf.description}</p>
                  {mf.gearNote && (
                    <div className="mt-3 bg-white/60 rounded-lg p-2 border border-[#D4CCE8]">
                      <p className="text-xs text-[#7B6CB8]">⚙️ {mf.gearNote}</p>
                    </div>
                  )}
                </div>
              );
            })()}
            {!selectedMonth && (
              <p className="text-center text-sm text-[#8A7E78]">👆 월을 클릭하면 상세 운세를 볼 수 있어요!</p>
            )}
          </div>

          {/* 월별 그래프 */}
          <div className="card">
            <h2 className="label mb-4">📈 월별 운세 흐름</h2>
            <div className="flex items-end gap-1 h-40">
              {result.monthlyFortunes.map((mf: any) => (
                <div key={mf.month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <p className="text-xs font-bold mb-1" style={{ color: scoreColor(mf.score) }}>{mf.score}</p>
                  <div className="w-full rounded-t-lg transition-all duration-500"
                    style={{ height: `${mf.score}%`, backgroundColor: scoreColor(mf.score), opacity: 0.7 }} />
                  <p className="text-xs text-[#8A7E78] mt-1">{mf.month}월</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
