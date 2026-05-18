'use client';

interface SpiderDataItem { label: string; value: number; max: number; }
interface SpiderChartProps { data: SpiderDataItem[]; size?: number; color?: string; }

export default function SpiderChart({ data, size = 250, color = '#8B6F47' }: SpiderChartProps) {
  const cx = size / 2; const cy = size / 2;
  const radius = size * 0.35; const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (index: number, value: number, max: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / max) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const points = data.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (level / levels) * radius;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    });
    gridLines.push(<polygon key={`grid-${level}`} points={points.join(' ')} fill="none" stroke="#D5CEC8" strokeWidth="1.5" />);
  }

  const axisLines = data.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return <line key={`axis-${i}`} x1={cx} y1={cy} x2={cx + radius * Math.cos(angle)} y2={cy + radius * Math.sin(angle)} stroke="#D5CEC8" strokeWidth="1" />;
  });

  const dataPoints = data.map((item, i) => getPoint(i, item.value, item.max));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  const labels = data.map((item, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelR = radius + 28;
    const x = cx + labelR * Math.cos(angle);
    const y = cy + labelR * Math.sin(angle);
    const percent = Math.round((item.value / item.max) * 100);
    return (
      <g key={`label-${i}`}>
        <text x={x} y={y - 6} textAnchor="middle" className="text-[11px] font-bold" fill="#5C5358">{item.label}</text>
        <text x={x} y={y + 9} textAnchor="middle" className="text-[12px] font-bold" fill="#3D3338">{percent}%</text>
      </g>
    );
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLines}
        {axisLines}
        <polygon points={dataPolygon} fill={`${color}25`} stroke={color} strokeWidth="2.5" />
        {dataPoints.map((p, i) => <circle key={`point-${i}`} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2" />)}
        {labels}
      </svg>
    </div>
  );
}
