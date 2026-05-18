'use client';

const OHAENG_COLOR: Record<string, string> = {
  목: '#5C8B6F',
  화: '#B85C4C',
  토: '#B89968',
  금: '#9B9591',
  수: '#3D4A5C',
};

interface OhaengChartProps { data: Record<string, number>; }

export default function OhaengChart({ data }: OhaengChartProps) {
  const ohaengOrder = ['목', '화', '토', '금', '수'];
  const radius = 90; // 원의 배치 반지름

  return (
    <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
      {/* 중앙 별 모양 가이드 라인 */}
      <svg className="absolute w-48 h-48 opacity-20" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="2" fill="none">
        <polygon points="50,5 95,95 5,40 95,40 5,95" />
      </svg>

      {/* 오행 원 배치 */}
      {ohaengOrder.map((oh, index) => {
        const angle = (index * 72 - 90) * (Math.PI / 180);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const count = data[oh] || 0;

        return (
          <div
            key={oh}
            className="absolute flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-sm border border-white"
            style={{
              transform: `translate(${x}px, ${y}px)`,
              backgroundColor: OHAENG_COLOR[oh]
            }}
          >
            <span className="text-xs text-white font-bold">{oh}</span>
            <span className="text-sm text-white font-bold">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
