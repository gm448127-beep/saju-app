'use client';

const OHAENG_COLOR: Record<string,string> = {목:'#22c55e',화:'#ef4444',토:'#f59e0b',금:'#8B7EC8',수:'#3b82f6'};
const OHAENG_EMOJI: Record<string,string> = {목:'🌳',화:'🔥',토:'🏔️',금:'⚔️',수:'💧'};

interface OhaengChartProps { data: Record<string, number>; }

export default function OhaengChart({ data }: OhaengChartProps) {
  const max = Math.max(...Object.values(data), 1);
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const ohaengOrder = ['목', '화', '토', '금', '수'];

  return (
    <div className="space-y-3">
      {ohaengOrder.map((oh) => {
        const count = data[oh] || 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        const widthPercent = max > 0 ? (count / max) * 100 : 0;
        return (
          <div key={oh} className="flex items-center gap-3">
            <div className="w-16 flex items-center gap-1.5 shrink-0">
              <span className="text-base">{OHAENG_EMOJI[oh]}</span>
              <span className="text-sm font-bold text-[#5C5358]">{oh}</span>
            </div>
            <div className="flex-1 h-7 bg-[#E8E2DC] rounded-full overflow-hidden relative">
              <div className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${widthPercent}%`, backgroundColor: OHAENG_COLOR[oh], minWidth: count > 0 ? '8px' : '0px' }} />
            </div>
            <div className="w-20 text-right shrink-0">
              <span className="text-sm font-bold text-[#3D3338]">{count}</span>
              <span className="text-xs text-[#847A80] ml-1">({percent}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
