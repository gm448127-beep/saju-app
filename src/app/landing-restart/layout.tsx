import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "운명비서 — 다시 시작하는 당신을 위한 사주 매거진",
  description:
    "끌리는 사람과 맞는 사람은 다릅니다. 운명비서는 차분한 매거진 톤으로, 두 번째 인연을 위한 인사이트를 드립니다.",
};

export default function LandingRestartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
