/** 12시진 — 앱 전역 공통 */
export const BIRTH_TIME_SLOTS = [
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
] as const;

export function birthSlotLabel(hour: number) {
  return BIRTH_TIME_SLOTS.find((slot) => slot.value === hour)?.label ?? "시간대 선택";
}
