"use client";

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
}

interface HourlyFlowSectionProps {
  hourlyFlow: HourlyFlowSlot[];
  hourlyFlowIntro?: string;
  hourlyPeak?: HourlyFlowSlot;
  hourlyCaution?: HourlyFlowSlot;
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
    <div className="rounded-xl p-4 border border-[#E2D7D0] bg-white">
      <p className="text-[10px] tracking-[0.08em] mb-2 font-semibold text-[#8B6F47]">
        {isPeak ? "가장 좋은 시간" : "조심할 시간"}
      </p>
      <p className="text-sm text-[#3D3338]" style={{ fontFamily: "Jua, sans-serif" }}>
        {slot.hour} <span className="text-[#8B6F47]">{slot.range}시</span>
      </p>
      <p className="text-xs text-[#5A4E48] mt-1">
        {slot.score}점 · {slot.label}
        {slot.sipsin ? ` · ${slot.sipsin}` : ""}
      </p>
      {slot.advice && <p className="text-xs text-[#5A4E48] mt-2 leading-relaxed">{slot.advice}</p>}
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
  const scoreColor = slot.score >= 70 ? "#5FB88A" : slot.score >= 50 ? "#E8A87C" : "#D87A8C";

  return (
    <div
      className={`rounded-xl border p-3 ${
        isPeak
          ? "border-[#D9C8C0] bg-[#FAF8F5]"
          : isCaution
            ? "border-[#D9C8C0] bg-[#FAF8F5]"
            : "border-[#E2D7D0] bg-white"
      }`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0 text-[#B8A78D]">{slot.hanja}</span>
          <div className="min-w-0">
            <p style={{ fontFamily: "Jua, sans-serif" }} className="text-sm text-[#3D3338]">
              {slot.hour} · {slot.range}시
            </p>
            <p className="text-[11px] text-[#8A7E78]">
              시진 · {slot.element} · {slot.keyword}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold" style={{ color: scoreColor }}>
            {slot.score}점
          </p>
          <p className="text-[11px] text-[#8A7E78]">{slot.label}</p>
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

      {slot.advice && <p className="text-xs text-[#5A4E48] leading-relaxed">{slot.advice}</p>}

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
}: HourlyFlowSectionProps) {
  const peak = hourlyPeak ?? pickPeak(hourlyFlow);
  const caution = hourlyCaution ?? pickCaution(hourlyFlow);
  const chartFlow = rotateFlowFromFive(hourlyFlow);

  return (
    <div className="card">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="label mb-1">12시진 운세 흐름</h2>
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
                    {d.hour} ({d.range}시) · {d.score}점
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
            dot={{ r: 3, fill: "#8B6F47", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#3D3338" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-[#D9C8C0]">
        <PeakCautionCard type="peak" slot={peak} />
        <PeakCautionCard type="caution" slot={caution} />
      </div>

      <div className="mt-6 pt-6 border-t border-[#D9C8C0]">
        <h3 className="label mb-3">시진별 상세 해설</h3>
        <p className="text-xs text-[#8A7E78] mb-4">
          각 시진은 2시간 단위입니다. 점수·십성·합충을 반영한 오늘 맞춤 해석이에요.
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
      </div>
    </div>
  );
}
