import {
  LANDING_PRIVACY_NOTICE,
  LANDING_WHY_FREE,
} from "@/lib/landing-trust-copy";

type LandingTrustPanelProps = {
  variant: "privacy" | "why-free";
};

/** 랜딩 — 신뢰 문구 (개인정보 / 무료 이유) */
export function LandingTrustPanel({ variant }: LandingTrustPanelProps) {
  if (variant === "privacy") {
    return (
      <aside className="landing-trust landing-trust--privacy" aria-label={LANDING_PRIVACY_NOTICE.title}>
        <p className="landing-trust__title">{LANDING_PRIVACY_NOTICE.title}</p>
        <ul className="landing-trust__list">
          {LANDING_PRIVACY_NOTICE.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </aside>
    );
  }

  return (
    <aside className="landing-trust landing-trust--why-free" aria-label={LANDING_WHY_FREE.title}>
      <p className="landing-trust__title">{LANDING_WHY_FREE.title}</p>
      <ul className="landing-trust__list">
        {LANDING_WHY_FREE.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="landing-trust__footnote">{LANDING_WHY_FREE.footnote}</p>
    </aside>
  );
}
