function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#EDE4DC]/80 ${className}`} />;
}

export default function HistoryPageSkeleton() {
  return (
    <div className="space-y-5 pb-8" aria-busy="true" aria-label="패턴 불러오는 중">
      <section className="rounded-[28px] border border-[#E2D7D0] bg-white px-5 py-6">
        <Bone className="h-3 w-16" />
        <Bone className="mt-3 h-8 w-32" />
        <Bone className="mt-3 h-4 w-full max-w-sm" />
      </section>
      <section className="rounded-[26px] border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-6">
        <Bone className="h-3 w-28" />
        <Bone className="mt-4 h-6 w-56" />
        <Bone className="mt-3 h-4 w-full" />
      </section>
      {[1, 2, 3, 4].map((i) => (
        <section key={i} className="rounded-[26px] border border-[#E2D7D0] bg-white px-5 py-5">
          <Bone className="h-3 w-24" />
          <Bone className="mt-3 h-5 w-36" />
          <Bone className="mt-4 h-12 w-full" />
          <Bone className="mt-2 h-12 w-full" />
        </section>
      ))}
    </div>
  );
}
