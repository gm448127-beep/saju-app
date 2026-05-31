import { LANDING_META_AD_MATCH } from "@/lib/landing-service-pitch";

type LandingPromoHeroProps = {
  illustrationSrc?: string;
};

/** 메타 광고 소재형 히어로 — 1번째 화면 */
export function LandingPromoHero({ illustrationSrc }: LandingPromoHeroProps) {
  return (
    <section className="landing-promo-card" aria-label="오늘의 운세 무료 확인">
      <p className="landing-promo-card__brand">
        <span aria-hidden>命</span> 운명비서
      </p>

      <div className="landing-promo-card__body">
        <h2 className="landing-promo-card__headline">{LANDING_META_AD_MATCH.headline}</h2>
        <p className="landing-promo-card__lead">{LANDING_META_AD_MATCH.lead}</p>
        <ul className="landing-promo-card__list">
          {LANDING_META_AD_MATCH.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="landing-promo-card__closing">{LANDING_META_AD_MATCH.closing}</p>
      </div>

      <p className="landing-promo-card__footer">{LANDING_META_AD_MATCH.footer}</p>

      {illustrationSrc ? (
        <figure className="landing-promo-card__art" aria-hidden>
          <img src={illustrationSrc} alt="" width={140} height={140} loading="eager" decoding="async" />
        </figure>
      ) : null}
    </section>
  );
}
