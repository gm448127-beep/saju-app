"use client";

import BirthDateNumberInputs, { isValidBirthDate } from "@/components/BirthDateNumberInputs";
import { TODAY_EMPTY_COPY } from "@/lib/history-copy";

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

type TimeMode = "none" | "slot" | "exact";

interface TodayPersonalizeFormProps {
  year: string;
  month: string;
  day: string;
  timeMode: TimeMode;
  slotHour: number;
  exactHour: number;
  exactMinute: number;
  calendarType: string;
  gender: string;
  loading: boolean;
  error: string;
  isPersonalized?: boolean;
  /** 인트로 CTA 직후 입력 폼 강조 */
  highlighted?: boolean;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  onTimeModeChange: (value: TimeMode) => void;
  onSlotHourChange: (value: number) => void;
  onExactHourChange: (value: number) => void;
  onExactMinuteChange: (value: number) => void;
  onCalendarTypeChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function TodayPersonalizeForm(props: TodayPersonalizeFormProps) {
  const {
    year, month, day, timeMode, slotHour, exactHour, exactMinute,
    calendarType, gender, loading, error, isPersonalized = false, highlighted = false,
    onYearChange, onMonthChange, onDayChange,
    onTimeModeChange, onSlotHourChange, onExactHourChange, onExactMinuteChange,
    onCalendarTypeChange, onGenderChange, onSubmit,
  } = props;

  return (
    <section id="personalize" className="scroll-mt-24">
      <div
        className={`relative overflow-hidden rounded-[28px] border bg-white shadow-[0_14px_38px_rgba(61,51,56,0.06)] transition-shadow duration-500 ${
          highlighted
            ? "border-[#8B6F47] ring-2 ring-[#8B6F47]/30 shadow-[0_18px_48px_rgba(139,111,71,0.18)]"
            : "border-[#E2D7D0]"
        }`}
      >
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#F1E7DE]/80" />
        <div className="absolute -bottom-20 left-6 h-44 w-44 rounded-full bg-[#FAF8F5]" />

        <div className="relative border-b border-[#E2D7D0]/80 px-5 py-6 sm:px-7">
          <p className="text-xs font-bold tracking-[0.14em] text-[#8B6F47]">PERSONAL FLOW</p>
          <h2 className="mt-2 text-2xl text-[#2F282B] sm:text-3xl" style={{ fontFamily: "Jua, sans-serif" }}>
            {isPersonalized ? "다른 사주로 다시 정렬" : TODAY_EMPTY_COPY.formTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#6B5E58]">
            {isPersonalized
              ? "생년월일을 바꾸면 같은 날의 흐름이 다른 결·점수로 다시 그려집니다."
              : TODAY_EMPTY_COPY.formSubtitle}
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative space-y-5 px-5 py-6 sm:px-7 sm:py-7">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#8B6F47]">출생시간 (시주)</label>
            <p className="mt-1 mb-2 text-xs leading-relaxed text-[#8B6F47]">
              태어난 시(時)는 그날 진짜 내 흐름을 가르는 핵심이에요. 알면 꼭 넣어주세요.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["slot", "시간대 선택"],
                ["exact", "시·분 입력"],
                ["none", "시간 모름"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onTimeModeChange(mode)}
                  className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition ${
                    timeMode === mode
                      ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                      : "border-[#E2D7D0] bg-[#FFFDF9] text-[#8A7E78] hover:border-[#D9C8C0]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {timeMode === "slot" && (
              <select
                value={slotHour}
                onChange={(e) => onSlotHourChange(Number(e.target.value))}
                className="mt-3 w-full rounded-2xl border-2 border-[#E2D7D0] bg-white px-4 py-3 text-sm text-[#3D3338] outline-none focus:border-[#8B6F47]"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            )}
            {timeMode === "exact" && (
              <div className="mt-3 rounded-2xl border border-[#E2D7D0] bg-[#FAF8F5] p-4">
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-[#8A7E78]">시</label>
                    <select
                      value={exactHour}
                      onChange={(e) => onExactHourChange(Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-[#E2D7D0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8B6F47]"
                    >
                      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                        <option key={h} value={h}>{String(h).padStart(2, "0")}시</option>
                      ))}
                    </select>
                  </div>
                  <span className="pb-3 text-[#A09488]">:</span>
                  <div>
                    <label className="mb-1 block text-xs text-[#8A7E78]">분</label>
                    <select
                      value={exactMinute}
                      onChange={(e) => onExactMinuteChange(Number(e.target.value))}
                      className="w-full rounded-xl border-2 border-[#E2D7D0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8B6F47]"
                    >
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
            {timeMode === "none" && (
              <p className="mt-2 text-xs text-[#8A7E78]">
                시간을 몰라도 오늘의 흐름은 볼 수 있어요. 다만 태어난 시를 넣으면 시간대별 흐름이 훨씬 정밀해집니다.
              </p>
            )}
          </div>

          <BirthDateNumberInputs
            year={year}
            month={month}
            day={day}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onDayChange={onDayChange}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#8B6F47]">달력</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["solar", "양력"],
                  ["lunar", "음력"],
                  ["lunarLeap", "윤달"],
                ] as const).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onCalendarTypeChange(type)}
                    className={`rounded-2xl border py-2.5 text-sm font-semibold transition ${
                      calendarType === type
                        ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                        : "border-[#E2D7D0] bg-white text-[#8A7E78]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#8B6F47]">성별</label>
              <div className="grid grid-cols-2 gap-2">
                {(["남", "여"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onGenderChange(value)}
                    className={`rounded-2xl border py-2.5 text-sm font-semibold transition ${
                      gender === value
                        ? "border-[#8B6F47] bg-[#FFF8EE] text-[#2F282B]"
                        : "border-[#E2D7D0] bg-white text-[#8A7E78]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isValidBirthDate(year, month, day)}
            className="w-full rounded-[20px] bg-[#2F282B] px-5 py-4 text-lg font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ fontFamily: "Jua, sans-serif" }}
          >
            {loading ? "내 흐름 정렬 중..." : isPersonalized ? "다시 정렬하기" : TODAY_EMPTY_COPY.formSubmit}
          </button>
        </form>
      </div>
    </section>
  );
}

export { isValidBirthDate };
