'use client';

import { useState } from 'react';

export interface BirthFormData {
  year: number;
  month: number;
  day: number;
  hour?: number;
  isLunar: boolean;
  gender: '남' | '여';
}

interface BirthFormProps {
  onSubmit: (data: BirthFormData) => void;
  loading?: boolean;
  showHour?: boolean;
  showGender?: boolean;
  buttonText?: string;
  buttonColor?: string;
}

export default function BirthForm({
  onSubmit,
  loading = false,
  showHour = true,
  showGender = true,
  buttonText = '분석하기',
  buttonColor = '#8B7EC8',
}: BirthFormProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(1995);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState<number | undefined>(undefined);
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<'남' | '여'>('남');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ year, month, day, hour, isLunar, gender });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>출생년도</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#8B7EC8] outline-none transition-colors">
            {Array.from({ length: 100 }, (_, i) => currentYear - i).map(y => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>월</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#8B7EC8] outline-none transition-colors">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>일</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))}
            className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#8B7EC8] outline-none transition-colors">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
      </div>

      {showHour && (
        <div>
          <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>태어난 시간 (선택)</label>
          <select value={hour ?? ''} onChange={e => setHour(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border-2 border-[#E8E2DC] rounded-xl px-3 py-2.5 text-[#2D2D2D] text-sm focus:border-[#8B7EC8] outline-none transition-colors">
            <option value="">모름 / 선택안함</option>
            <option value="0">자시 (23:00~01:00)</option>
            <option value="2">축시 (01:00~03:00)</option>
            <option value="4">인시 (03:00~05:00)</option>
            <option value="6">묘시 (05:00~07:00)</option>
            <option value="8">진시 (07:00~09:00)</option>
            <option value="10">사시 (09:00~11:00)</option>
            <option value="12">오시 (11:00~13:00)</option>
            <option value="14">미시 (13:00~15:00)</option>
            <option value="16">신시 (15:00~17:00)</option>
            <option value="18">유시 (17:00~19:00)</option>
            <option value="20">술시 (19:00~21:00)</option>
            <option value="22">해시 (21:00~23:00)</option>
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>달력</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsLunar(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${!isLunar ? 'bg-[#FFF9E6] text-[#E5C100] border-[#FFD700]' : 'bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]'}`}>
              ☀️ 양력
            </button>
            <button type="button" onClick={() => setIsLunar(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${isLunar ? 'bg-[#F0EDF8] text-[#8B7EC8] border-[#8B7EC8]' : 'bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]'}`}>
              🌙 음력
            </button>
          </div>
        </div>
        {showGender && (
          <div className="flex-1">
            <label className="block text-xs text-[#9B9B9B] mb-1" style={{fontFamily:'Jua, sans-serif'}}>성별</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setGender('남')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${gender === '남' ? 'bg-[#EDF5F8] text-[#7EB3C8] border-[#7EB3C8]' : 'bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]'}`}>
                👨 남
              </button>
              <button type="button" onClick={() => setGender('여')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${gender === '여' ? 'bg-[#F8EDF0] text-[#E88B9C] border-[#E88B9C]' : 'bg-white text-[#9B9B9B] border-[#E8E2DC] hover:border-[#D4CCE8]'}`}>
                👩 여
              </button>
            </div>
          </div>
        )}
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl text-white text-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: buttonColor, fontFamily: 'Jua, sans-serif' }}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            분석 중...
          </span>
        ) : buttonText}
      </button>
    </form>
  );
}
