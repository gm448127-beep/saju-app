import type { ReactNode } from "react";

type LandingCanvasHeroProps = {
  headline: ReactNode;
  tagline: string;
  imageSrc: string;
};

export function LandingCanvasHero({ headline, tagline, imageSrc }: LandingCanvasHeroProps) {
  return (
    <section className="landing-canvas" aria-labelledby="landing-canvas-headline">
      <header className="landing-canvas__brand">
        <span className="landing-canvas__hanja" aria-hidden>
          命
        </span>
        <span className="landing-canvas__logo">Unmyeong Biseo</span>
      </header>

      <h1 id="landing-canvas-headline" className="landing-canvas__headline">
        {headline}
      </h1>

      <p className="landing-canvas__tagline">{tagline}</p>

      <figure className="landing-canvas__art" aria-hidden>
        <img src={imageSrc} alt="" width={300} height={300} loading="eager" decoding="async" />
      </figure>
    </section>
  );
}
