import { LANDING_RESULT_LABELS } from "@/lib/landing-insight-copy";
import { LANDING_LOCKED_PREVIEW } from "@/lib/landing-trust-copy";

/** 이메일 입력 전 — 4단 결과가 잠겨 있음을 보여 줌 */
export function LandingLockedPreview() {
  return (
    <section className="landing-locked-preview" aria-label={LANDING_LOCKED_PREVIEW.title}>
      <p className="landing-locked-preview__title">{LANDING_LOCKED_PREVIEW.title}</p>
      <p className="landing-locked-preview__hint">{LANDING_LOCKED_PREVIEW.hint}</p>
      <ol className="landing-locked-preview__list">
        {LANDING_RESULT_LABELS.map((label, index) => (
          <li key={label} className="landing-locked-preview__item">
            <p className="landing-locked-preview__label">
              {index + 1}. {label}
            </p>
            <div className="landing-locked-preview__blur" aria-hidden>
              <span className="landing-locked-preview__blur-line" />
              <span className="landing-locked-preview__blur-line landing-locked-preview__blur-line--short" />
            </div>
            <span className="landing-locked-preview__badge">{LANDING_LOCKED_PREVIEW.unlockLabel}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
