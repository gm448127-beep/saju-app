"use client";

import Image from "next/image";
import { useState } from "react";

type MiinAvatarProps = {
  /** 지름(px) */
  size?: number;
  className?: string;
  priority?: boolean;
};

/** miin.png 원형 아바타 — 로드 실패 시 命 폴백 */
export default function MiinAvatar({ size = 80, className = "", priority = false }: MiinAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass =
    size === 48
      ? "h-12 w-12"
      : size === 56
        ? "h-14 w-14"
        : size === 80
        ? "h-20 w-20"
        : size === 128
          ? "h-32 w-32"
          : size === 144
            ? "h-36 w-36"
            : "";

  const dimensionStyle = sizeClass ? undefined : { width: size, height: size };

  if (imageFailed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E8D7C4] bg-[#F5EDE3] shadow-[0_4px_14px_rgba(139,111,71,0.12)] ${sizeClass} ${className}`}
        style={dimensionStyle}
        role="img"
        aria-label="미인"
      >
        <span
          className="font-bold leading-none text-[#8B6F47]"
          style={{
            fontFamily: "Jua, sans-serif",
            fontSize: Math.round(size * 0.4),
          }}
          aria-hidden
        >
          命
        </span>
      </div>
    );
  }

  return (
    <Image
      src="/miin.png"
      alt="미인"
      width={size}
      height={size}
      className={`shrink-0 rounded-full border border-[#E8D7C4] bg-[#FFF8EE] object-cover object-center shadow-[0_4px_14px_rgba(139,111,71,0.15)] ${sizeClass} ${className}`}
      style={dimensionStyle}
      priority={priority}
      onError={() => setImageFailed(true)}
    />
  );
}
