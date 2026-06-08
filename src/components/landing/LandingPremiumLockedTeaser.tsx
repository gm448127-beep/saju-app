"use client";

import Link from "next/link";
import { trackLandingUnlockReport, type LandingAnalyticsSource } from "@/lib/landing-analytics";
import {
  LANDING_PREMIUM_LOCKED,
  LANDING_RESULT_FREE_BADGE,
} from "@/lib/landing-trust-copy";

/** 결과 하단 — 유료 상세 리포트 잠금 티저 */
export function LandingPremiumLockedTeaser({
  analyticsSource = "landing_decision",
}: {
  analyticsSource?: LandingAnalyticsSource;
}) {
  return (
    <section className="landing-premium-lock" aria-label={LANDING_PREMIUM_LOCKED.title}>
      <p className="landing-premium-lock__eyebrow">{LANDING_RESULT_FREE_BADGE}</p>
      <h3 className="landing-premium-lock__title">{LANDING_PREMIUM_LOCKED.title}</h3>
      <p className="landing-premium-lock__subtitle">{LANDING_PREMIUM_LOCKED.subtitle}</p>
      <ul className="landing-premium-lock__list">
        {LANDING_PREMIUM_LOCKED.items.map((item) => (
          <li key={item.title} className="landing-premium-lock__item">
            <div className="landing-premium-lock__item-head">
              <p className="landing-premium-lock__item-title">{item.title}</p>
              <span className="landing-premium-lock__item-badge" aria-hidden>
                🔒
              </span>
            </div>
            <p className="landing-premium-lock__item-desc">{item.desc}</p>
            <div className="landing-premium-lock__item-blur" aria-hidden />
          </li>
        ))}
      </ul>
      <Link
        href="/today"
        className="landing-premium-lock__cta"
        onClick={() => trackLandingUnlockReport(analyticsSource)}
      >
        {LANDING_PREMIUM_LOCKED.cta}
      </Link>
      <p className="landing-premium-lock__cta-hint">{LANDING_PREMIUM_LOCKED.ctaHint}</p>
    </section>
  );
}
