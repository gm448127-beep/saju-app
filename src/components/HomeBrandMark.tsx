"use client";

import Image from "next/image";
import { useState } from "react";
import brandMarkImage from "../../public/brand-mark.png";
import styles from "./HomeBrandMark.module.css";

type HomeBrandMarkProps = {
  /** logo: 상단 / hero: 히어로 카드 / watermark: 연한 배경(레거시) */
  variant?: "logo" | "hero" | "watermark";
  className?: string;
  priority?: boolean;
};

/** 命 자리 — public/brand-mark.png (교체 시 dev 서버 재시작 또는 강력 새로고침) */
export default function HomeBrandMark({
  variant = "logo",
  className = "",
  priority = false,
}: HomeBrandMarkProps) {
  const [failed, setFailed] = useState(false);
  const isHero = variant === "hero" || variant === "watermark";

  if (failed) {
    return (
      <span
        className={isHero ? `gyeol-hero-hanja ${className}` : `gyeol-brand-hanja ${className}`}
        aria-hidden={isHero}
      >
        命
      </span>
    );
  }

  if (variant === "hero") {
    return (
      <div className={`${styles.heroFigure} ${className}`.trim()} data-hero-brand-mark>
        <div className={styles.heroFrame}>
          <Image
            src={brandMarkImage}
            alt="운명비서 — 달을 품은 일러스트"
            fill
            className={styles.heroImg}
            sizes="(max-width: 430px) 74vw, 220px"
            onError={() => setFailed(true)}
            priority={priority}
          />
        </div>
      </div>
    );
  }

  if (variant === "watermark") {
    return (
      <div className={`gyeol-hero-mark ${className}`} aria-hidden>
        <Image
          src={brandMarkImage}
          alt=""
          fill
          className="gyeol-hero-mark__img"
          sizes="(max-width: 640px) 45vw, 280px"
          onError={() => setFailed(true)}
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className={`gyeol-brand-mark ${className}`}>
      <Image
        src={brandMarkImage}
        alt="운명비서"
        fill
        className="gyeol-brand-mark__img"
        onError={() => setFailed(true)}
        priority={priority}
      />
    </div>
  );
}
