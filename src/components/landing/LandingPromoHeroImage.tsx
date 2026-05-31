type LandingPromoHeroImageProps = {
  src: string;
  alt: string;
};

/** 풀 디자인 프로모 이미지 히어로 (텍스트·일러스트 포함 목업) */
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
