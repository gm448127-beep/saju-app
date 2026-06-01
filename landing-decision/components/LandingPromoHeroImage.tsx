type LandingPromoHeroImageProps = {
  src: string;
  alt: string;
};

export function LandingPromoHeroImage({ src, alt }: LandingPromoHeroImageProps) {
  return (
    <section className="landing-promo-hero" aria-label="소개">
      <img
        className="landing-promo-hero__img"
        src={src}
        alt={alt}
        width={1080}
        height={1080}
        loading="eager"
        decoding="async"
      />
    </section>
  );
}
