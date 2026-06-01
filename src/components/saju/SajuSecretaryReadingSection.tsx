"use client";

import type { SecretaryReading } from "@/lib/saju-secretary-reading";

type Props = {
  reading: SecretaryReading | null;
  /** secretaryReading 없을 때만 — v3 라벨 유지 */
  fallbackText?: string;
};

const SCENE_ROWS: {
  key: keyof SecretaryReading["scenes"];
  label: string;
}[] = [
  { key: "relationship", label: "관계에서" },
  { key: "work", label: "일에서" },
  { key: "money", label: "돈에서" },
  { key: "choice", label: "선택할 때" },
  { key: "emotion", label: "감정이 흔들릴 때" },
];

const ROLE_LABEL: Record<string, string> = {
  month: "월령",
  dayMaster: "일간",
  sipsin: "십성",
  relation: "합충",
  daeyun: "대운",
  sewoon: "세운",
};

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <h2
        className="text-lg font-bold text-[#3D3338] mb-1"
        style={{ fontFamily: "Jua, sans-serif" }}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="text-xs text-[#8A7E78] mb-3">{subtitle}</p>
      ) : (
        <div className="mb-3" />
      )}
      {children}
    </div>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[#5A4E48] leading-relaxed">{children}</p>
  );
}

/** 무료 사주 — 헌법 v3 secretaryReading UI */
export default function SajuSecretaryReadingSection({
  reading,
  fallbackText,
}: Props) {
  if (!reading) {
    if (!fallbackText?.trim()) return null;
    return (
      <SectionCard
        title="이 시기의 환경"
        subtitle="원국 데이터를 바탕으로 읽은 흐름이에요."
      >
        <BodyText>{fallbackText}</BodyText>
        <p className="mt-3 text-[11px] text-[#8A7E78]">
          상세 패턴 리포트는 분석을 다시 실행하면 볼 수 있어요.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="이 시기의 환경"
        subtitle="월령(월지)에서 읽은 지금의 공기·리듬이에요."
      >
        <p className="text-xs font-bold text-[#B89968] mb-2">{reading.environment.label}</p>
        <BodyText>{reading.environment.text}</BodyText>
      </SectionCard>

      <SectionCard
        title="나는 그 환경에 어떻게 반응하는가"
        subtitle="일간이 그 환경에 어떻게 반응하는지예요."
      >
        <p className="text-xs font-bold text-[#B89968] mb-2">{reading.responsePattern.label}</p>
        <BodyText>{reading.responsePattern.text}</BodyText>
      </SectionCard>

      <SectionCard title="반복되는 장면" subtitle="관계·일·돈·선택·감정에서 자주 나타나는 장면이에요.">
        <div className="space-y-3">
          {SCENE_ROWS.map(({ key, label }) => {
            const text = reading.scenes[key];
            if (!text?.trim()) return null;
            return (
              <div
                key={key}
                className="rounded-xl border border-[#E2D7D0] bg-[#FAF8F5] px-4 py-3"
              >
                <p className="text-xs font-bold text-[#8B6F47] mb-1">{label}</p>
                <p className="text-sm text-[#5A4E48] leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
        {reading.facts.mainSipsin.length > 0 && (
          <p className="mt-3 text-[11px] text-[#8A7E78]">
            전면 십성: {reading.facts.mainSipsin.join(" · ")}
            {reading.facts.mainSipsin.length >= 2 ? " (원국에서 두드러지는 1~2개)" : ""}
          </p>
        )}
      </SectionCard>

      <SectionCard title="흔들릴 때 나타나는 장면" subtitle="스트레스·실수가 나기 쉬운 순간이에요.">
        <p className="text-xs text-[#8A7E78] mb-2">{reading.stressPattern.trigger}</p>
        <p className="text-sm text-[#3D3338] leading-relaxed rounded-lg bg-white border border-[#E2D7D0] px-3 py-2.5">
          「{reading.stressPattern.scene}」
        </p>
      </SectionCard>

      {reading.secretarySuggestions.length > 0 && (
        <SectionCard title="운명비서의 제안" subtitle="지금 시기에 써 볼 구조·행동이에요.">
          <ul className="space-y-3">
            {reading.secretarySuggestions.map((s, i) => (
              <li
                key={`${s.title}-${i}`}
                className="rounded-xl border border-[#E2D7D0] bg-white px-4 py-3"
              >
                <p className="text-sm font-bold text-[#3D3338] mb-1">{s.title}</p>
                <p className="text-sm text-[#5A4E48] leading-relaxed">{s.action}</p>
                <p className="mt-2 text-[11px] text-[#8A7E78] leading-relaxed">{s.reason}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div className="rounded-2xl border border-[#E8D7C4] bg-[#FFFDF8] px-5 py-4 text-center">
        <p className="text-xs tracking-[0.1em] text-[#B89968] mb-2" style={{ fontFamily: "Jua, sans-serif" }}>
          한 문장으로
        </p>
        <p
          className="text-base leading-relaxed text-[#2F282B]"
          style={{ fontFamily: "Jua, sans-serif" }}
        >
          {reading.closingLine}
        </p>
      </div>

      {reading.evidence.length > 0 && (
        <details className="card group">
          <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center justify-between gap-2">
              <h2
                className="text-lg font-bold text-[#3D3338]"
                style={{ fontFamily: "Jua, sans-serif" }}
              >
                왜 이렇게 읽었는지
              </h2>
              <span className="text-xs text-[#8A7E78] group-open:hidden">펼치기</span>
              <span className="text-xs text-[#8A7E78] hidden group-open:inline">접기</span>
            </div>
            <p className="text-xs text-[#8A7E78] mt-1">월령 · 일간 · 십성 · 관계 팩트</p>
          </summary>
          <ul className="mt-4 space-y-2">
            {reading.evidence.map((ev, i) => (
              <li
                key={`${ev.term}-${i}`}
                className="flex flex-wrap gap-x-2 gap-y-1 rounded-lg border border-[#E2D7D0] bg-[#FAF8F5] px-3 py-2 text-xs"
              >
                <span className="font-bold text-[#8B6F47]">{ROLE_LABEL[ev.role] ?? ev.role}</span>
                <span className="text-[#3D3338] font-semibold">{ev.term}</span>
                <span className="text-[#8A7E78] w-full sm:w-auto">{ev.note}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
