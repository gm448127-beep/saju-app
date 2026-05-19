export default function PatternDots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`흐름 강도 ${filled}/${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i < filled ? "bg-[#8B6F47]" : "bg-[#E8DDD4]"}`}
        />
      ))}
    </span>
  );
}
