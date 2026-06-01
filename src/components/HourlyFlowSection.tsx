"use client";

import { BIRTH_TIME_MARKETING } from "@/lib/engine-copy";
import { stripScoreMentions } from "@/lib/today-score-ui-copy";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

export interface HourlyFlowSlot {
  hour: string;
  hanja: string;
  range: string;
  score: number;
  label: string;
  branch?: string;
  branchName?: string;
  element?: string;
  keyword?: string;
  sipsin?: string;
  sipsinTitle?: string;
  labelDesc?: string;
  goodFor?: string;
  avoid?: string;
  relations?: string[];
  advice?: string;
  isMyHour?: boolean;
}

interface HourlyFlowSectionProps {
  hourlyFlow: HourlyFlowSlot[];
  hourlyFlowIntro?: string;
  hourlyPeak?: HourlyFlowSlot;
  hourlyCaution?: HourlyFlowSlot;
  /** false면 시진 카드 목록 대신 자세히 탭 안내 */
  showSijinDetails?: boolean;
  onOpenDetail?: () => void;
}

function pickPeak(flow: HourlyFlowSlot[]) {
  return flow.reduce((a, b) => (a.score > b.score ? a : b));
}

function pickCaution(flow: HourlyFlowSlot[]) {
  return flow.reduce((a, b) => (a.score < b.score ? a : b));
}

function getStartHourLabel(slot?: HourlyFlowSlot) {
  const startHour = slot?.range?.split("-")[0]?.replace(/^0/, "");
  return startHour ? `${startHour}시` : "";
}

function rotateFlowFromFive(flow: HourlyFlowSlot[]) {
  const startIndex = flow.findIndex((slot) => getStartHourLabel(slot) === "5시");
  if (startIndex <= 0) return flow;
  return [...flow.slice(startIndex), ...flow.slice(0, startIndex)];
}

function getTooltipSummary(slot: HourlyFlowSlot) {
  if (slot.score >= 70) {
    return slot.goodFor
      ? `${slot.goodFor}에 힘을 주면 좋은 시간입니다.`
      : "중요한 일을 진행하기 좋은 시간입니다.";
  }

  if (slot.score >= 55) {
    return slot.goodFor
      ? `${slot.goodFor}을 차분히 진행하기 좋은 시간입니다.`
      : "크게 무리하지 않으면 안정적인 시간입니다.";
  }

  if (slot.score >= 40) {
    return slot.avoid
      ? `${slot.avoid}은 줄이고 한 번 더 확인하세요.`
      : "서두르기보다 확인이 필요한 시간입니다.";
  }

  return slot.avoid
    ? `${slot.avoid}은 피하고 잠시 쉬어 가세요.`
    : "무리하지 말고 쉬어 가면 좋은 시간입니다.";
}

function PeakCautionCard({
  type,
  slot,
}: {
  type: "peak" | "caution";
  slot: HourlyFlowSlot;
}) {
  const isPeak = type === "peak";

  return (
    <div className="rounded-xl border border-[#E2D7D0] bg-white p-4">
      <div
        className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold tracking-tight ${
          isPeak ? "bg-[#3D5838] text-[#F5F1EB]" : "bg-[#7A4A3D] text-[#FFF8F5]"
        }`}
      >
        <span aria-hidden className="text-[10px] leading-none opacity-90">
          {isPeak ? "▲" : "▼"}
        </span>
        {isPeak ? "가장 좋은 시간" : "조심할 시간"}
      </div>

      <p className="text-xs font-semibold leading-snug text-[#5A4E48]">
        {isPeak ? "중요한 일·연락·결정을 이 시간에 맞춰보세요" : "서두른 확답과 큰 결정은 이 시간대를 피하세요"}
      </p>

      <div className="mt-3 rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-3.5 py-3">
        <p className="text-base text-[#2F282B]" style={{ fontFamily: "Jua, sans-serif" }}>
          {slot.hour} <span className="text-[#8B6F47]">{slot.range}시</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-[#4A403B]">
          {slot.label}
          {slot.sipsin ? ` · ${slot.sipsin}` : ""}
        </p>
        {slot.advice && (
          <p className="mt-2 border-t border-[#EDE4DC] pt-2 text-xs leading-relaxed text-[#5A4E48]">
            {stripScoreMentions(slot.advice)}
          </p>
        )}
      </div>
    </div>
  );
}

function SijinDetailCard({
  slot,
  isPeak,
  isCaution,
}: {
  slot: HourlyFlowSlot;
  isPeak: boolean;
  isCaution: boolean;
}) {
  const isMyHour = slot.isMyHour;

  return (
    <div
      className={`rounded-xl border p-3 ${
        isMyHour
          ? "border-[#8B6F47] bg-[#FFF8EE] ring-1 ring-[#8B6F47]/25"
          : isPeak
            ? "border-[#D9C8C0] bg-[#FAF8F5]"
            : isCaution
              ? "border-[#D9C8C0] bg-[#FAF8F5]"
              : "border-[#E2D7D0] bg-white"
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm shrink-0 text-[#B8A78D]">{slot.hanja}</span>
          <div className="min-w-0">
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338]">
              {slot.hour} · {slot.range}시
              {isMyHour && (
                <span className="ml-1.5 inline-block rounded-full bg-[#8B6F47] px-1.5 py-0.5 text-[10px] font-bold text-[#F5F1EB] align-middle">
                  내 시(時)
                </span>
              )}
            </p>
            <p className="text-[11px] text-[#8A7E78]">
              시진 · {slot.element} · {slot.keyword}
            </p>
            {slot.label && (
              <p className="mt-0.5 text-[11px] font-semibold text-[#5A4E48]">{slot.label}</p>
            )}
          </div>
        </div>
      </div>

      {slot.sipsin && (
        <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#EDE4DC] text-[#5A4E48] mb-2">
          십성 · {slot.sipsin}
          {slot.sipsinTitle ? ` (${slot.sipsinTitle})` : ""}
        </span>
      )}

      {slot.relations?.map((rel, i) => (
        <p key={i} className="text-[11px] text-[#8B6F47] mb-1">
          {rel}
        </p>
      ))}

      {slot.advice && <p className="text-xs text-[#5A4E48] leading-relaxed">{stripScoreMentions(slot.advice)}</p>}

      {(slot.goodFor || slot.avoid) && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 pt-2 border-t border-[#EDE4DC]">
          {slot.goodFor && <p className="text-[11px] text-[#3D5838]">좋은 선택: {slot.goodFor}</p>}
          {slot.avoid && <p className="text-[11px] text-[#583838]">주의: {slot.avoid}</p>}
        </div>
      )}
    </div>
  );
}

export default function HourlyFlowSection({
  hourlyFlow,
  hourlyFlowIntro,
  hourlyPeak,
  hourlyCaution,
  showSijinDetails = true,
  onOpenDetail,
}: HourlyFlowSectionProps) {
  const peak = hourlyPeak ?? pickPeak(hourlyFlow);
  const caution = hourlyCaution ?? pickCaution(hourlyFlow);
  const chartFlow = rotateFlowFromFive(hourlyFlow);

  return (
    <div className="card">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="label mb-1">{BIRTH_TIME_MARKETING.hourlyFlowTitle}</h2>
          <p className="text-xs text-[#8A7E78] mt-1">12시진 · 시간의 흐름</p>
        </div>
        <p className="text-xs text-[#B8A78D]">하루 리듬</p>
      </div>

      {hourlyFlowIntro && (
        <p className="text-sm text-[#5A4E48] leading-relaxed mb-5 bg-[#FAF8F5] border border-[#E2D7D0] rounded-xl px-4 py-3">
          {hourlyFlowIntro}
        </p>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartFlow} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
          <XAxis
            dataKey="hanja"
            interval={0}
            axisLine={{ stroke: "#D9C8C0" }}
            tickLine={false}
            height={44}
            tick={(props: { x: number; y: number; payload: { value: string }; index: number }) => {
              const { x, y, payload, index } = props;
              const item = chartFlow[index];
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={12} textAnchor="middle" fill="#3D3338" fontSize={11} fontWeight="600">
                    {getStartHourLabel(item)}
                  </text>
                  <text x={0} y={0} dy={26} textAnchor="middle" fill="#B8A78D" fontSize={11}>
                    {payload.value}
                  </text>
                </g>
              );
            }}
          />
          <YAxis domain={[0, 100]} hide />
          <ReferenceLine y={50} stroke="#D9C8C0" strokeDasharray="2 4" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as HourlyFlowSlot;
              const summary = getTooltipSummary(d);
              return (
                <div className="max-w-[180px] rounded-xl border border-[#D9C8C0] bg-[#FAF6F2] px-2.5 py-2 text-[10px] text-[#3D3338] shadow-[0_8px_20px_rgba(61,51,56,0.08)] sm:max-w-[280px] sm:px-3.5 sm:py-3 sm:text-xs">
                  <p className="mb-1 font-semibold leading-tight" style={{ fontFamily: "Jua, sans-serif" }}>
                    {d.hour} ({d.range}시)
                  </p>
                  <p className="mt-1 leading-snug text-[#5A4E48]">{summary}</p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8B6F47"
            strokeWidth={2}
            dot={(props: { cx?: number; cy?: number; payload?: HourlyFlowSlot }) => {
              const { cx = 0, cy = 0, payload } = props;
              if (payload?.isMyHour) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#8B6F47"
                    stroke="#2F282B"
                    strokeWidth={2}
                  />
                );
              }
              return <circle cx={cx} cy={cy} r={3} fill="#8B6F47" />;
            }}
            activeDot={{ r: 5, fill: "#3D3338" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6 border-t border-[#D9C8C0]">
        <p className="mb-3 text-xs font-bold tracking-[0.06em] text-[#8B6F47]">오늘의 시간 가이드</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PeakCautionCard type="peak" slot={peak} />
          <PeakCautionCard type="caution" slot={caution} />
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[#D9C8C0]">
        <h3 className="label mb-3">시진별 상세 해설</h3>
        {showSijinDetails ? (
          <>
            <p className="text-xs text-[#8A7E78] mb-4">
              각 시진은 2시간 단위입니다. 십성·합충을 반영한 오늘 맞춤 해석이에요.
            </p>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {hourlyFlow.map((slot) => (
                <SijinDetailCard
                  key={slot.hour}
                  slot={slot}
                  isPeak={peak.hour === slot.hour}
                  isCaution={caution.hour === slot.hour}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[#E8D7C4] bg-[#FAF5ED] px-4 py-3">
            <p className="text-sm leading-relaxed text-[#5A4E48]">
              시진별 상세 해설은 <span className="font-bold text-[#8B6F47]">자세히</span> 탭에서 확인할 수
              있어요.
            </p>
            {onOpenDetail ? (
              <button
                type="button"
                onClick={onOpenDetail}
                className="mt-3 rounded-xl bg-[#2F282B] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#3D3338]"
              >
                자세히 탭에서 보기
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
