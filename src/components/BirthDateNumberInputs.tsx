'use client';

interface BirthDateNumberInputsProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
}

const inputClass =
  'w-full rounded-xl border-2 border-[#D9C8C0] bg-white px-3 py-2.5 text-center text-base font-semibold text-[#3D3338] outline-none transition-colors focus:border-[#8B6F47]';

function onlyDigits(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength);
}

export function isValidBirthDate(year: string, month: string, day: string) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const currentYear = new Date().getFullYear();

  if (!year || !month || !day) return false;
  if (y < 1900 || y > currentYear) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export default function BirthDateNumberInputs({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
}: BirthDateNumberInputsProps) {
  return (
    <div>
      <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] gap-2">
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: 'Jua, sans-serif' }}>
            출생년도
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1995"
            value={year}
            onChange={(e) => onYearChange(onlyDigits(e.target.value, 4))}
            className={inputClass}
            aria-label="출생년도"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: 'Jua, sans-serif' }}>
            월
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="8"
            value={month}
            onChange={(e) => onMonthChange(onlyDigits(e.target.value, 2))}
            className={inputClass}
            aria-label="출생월"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#8A7E78]" style={{ fontFamily: 'Jua, sans-serif' }}>
            일
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="17"
            value={day}
            onChange={(e) => onDayChange(onlyDigits(e.target.value, 2))}
            className={inputClass}
            aria-label="출생일"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-[#8A7E78]">예: 1995 / 8 / 17 처럼 숫자만 입력하세요.</p>
    </div>
  );
}
