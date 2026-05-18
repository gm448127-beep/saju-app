"use client";

import type { SajuTriggerItem } from "@/lib/saju-triggers";

interface SajuTriggerSectionProps {
  intro?: string;
  triggers: SajuTriggerItem[];
  pillars?: Record<string, string>;
}

const TONE_STYLE: Record<
  string,
  { border: string; bg: string; label: string }
> = {
  positive: { border: "border-[#E2D7D0]", bg: "bg-white", label: "상승" },
  negative: { border: "border-[#E2D7D0]", bg: "bg-white", label: "주의" },
  neutral: { border: "border-[#E2D7D0]", bg: "bg-white", label: "중립" },
  info: { border: "border-[#E2D7D0]", bg: "bg-white", label: "정보" },
};

function TriggerCard({ item }: { item: SajuTriggerItem }) {
  const style = TONE_STYLE[item.tone] ?? TONE_STYLE.neutral;

  return (
    <div className={`rounded-xl border px-4 py-3 ${style.border} ${style.bg}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p
              className="text-sm font-semibold text-[#3D3338]"
              style={{ fontFamily: "Jua, sans-serif" }}
            >
              {item.title}
            </p>
            <span className="rounded-full bg-[#FAF8F5] px-2 py-0.5 text-[10px] text-[#8B6F47]">{style.label}</span>
          </div>
          {item.subtitle && (
            <p className="text-[11px] text-[#8A7E78] mb-2">{item.subtitle}</p>
          )}
          <p className="text-xs text-[#5A4E48] font-mono bg-[#EDE4DC]/60 rounded-lg px-2.5 py-1.5 mb-2 leading-relaxed">
            {item.formula}
          </p>
          {item.sipsin && (
            <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-[#EDE4DC] text-[#5A4E48] mb-2">
              십성 · {item.sipsin}
              {item.sipsinTitle ? ` (${item.sipsinTitle})` : ""}
            </span>
          )}
          <p className="text-sm text-[#3D3338] leading-relaxed">{item.explanation}</p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 text-[#8A7E78] border border-[#E8DCC8]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SajuTriggerSection({
  intro,
  triggers,
  pillars,
}: SajuTriggerSectionProps) {
  const grouped = [1, 2, 3, 4, 5].map((id) => ({
    id,
    items: triggers.filter((t) => t.id === id),
  }));

  return (
    <div className="card">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="label mb-1">사주 트리거</h2>
          <p className="text-xs text-[#8A7E78] mt-1">오늘이 깨우는 여덟 글자</p>
        </div>
        <p className="text-xs text-[#B8A78D]">오늘의 작용점</p>
      </div>

      {intro && (
        <p className="text-sm text-[#5A4E48] leading-relaxed mb-5 bg-[#FAF8F5] border border-[#E2D7D0] rounded-xl px-4 py-3">
          {intro}
        </p>
      )}

      <div className="space-y-5">
        {grouped.map(
          ({ id, items }) =>
            items.length > 0 && (
              <div key={id}>
                {items.length > 1 && (
                  <p className="text-[10px] tracking-[0.08em] text-[#B8A78D] mb-2">
                    {id}번 흐름 · {items.length}개 신호
                  </p>
                )}
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <TriggerCard key={`${id}-${idx}-${item.formula}`} item={item} />
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {pillars && (
        <div className="mt-6 pt-4 border-t border-[#D9C8C0]">
          <p className="text-xs tracking-[0.08em] text-[#B8A78D] mb-2 text-center">
            내 사주 원국
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "년주", value: pillars.year },
              { label: "월주", value: pillars.month },
              { label: "일주", value: pillars.day },
              { label: "시주", value: pillars.hour },
            ].map((p) => (
              <div
                key={p.label}
                className="bg-white border border-[#D9C8C0] rounded-lg py-2"
              >
                <p className="text-[10px] text-[#8A7E78]">{p.label}</p>
                <p className="text-sm font-bold text-[#3D3338] mt-0.5">{p.value || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
