import type { ReactNode } from "react";

type MobileSnapRowProps = {
  children: ReactNode;
  /** lg 이상에서 그리드로 전환할 때 클래스 (예: lg:grid lg:grid-cols-4) */
  desktopClassName?: string;
  className?: string;
  "aria-label"?: string;
};

/**
 * 모바일: 가로 스냅 스크롤 + 충분한 카드 폭
 * 데스크톱: desktopClassName으로 그리드/일반 레이아웃
 */
export default function MobileSnapRow({
  children,
  desktopClassName = "",
  className = "",
  "aria-label": ariaLabel,
}: MobileSnapRowProps) {
  return (
    <div
      className={`flex gap-3 overflow-x-auto overscroll-x-contain pb-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible lg:pb-0 ${desktopClassName} ${className}`}
      aria-label={ariaLabel}
      role={ariaLabel ? "list" : undefined}
    >
      {children}
    </div>
  );
}

/** 스냅 카드 한 장 — 모바일 min-width 보장 */
export function MobileSnapCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-[min(82vw,20rem)] shrink-0 snap-start lg:w-auto lg:shrink lg:snap-align-none ${className}`}
      role="listitem"
    >
      {children}
    </div>
  );
}
