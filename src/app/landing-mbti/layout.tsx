import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운명비서 — MBTI보다 깊은 매일의 나 리포트",
  description:
    "같은 사람이어도 오늘은 결정의 날, 내일은 회복의 날. 운명비서는 매일 아침 1분, 당신의 오늘을 정리해 드립니다.",
};

export default function LandingMbtiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
