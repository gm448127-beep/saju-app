import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "운명비서 — MBTI보다 깊은 매일의 나 리포트",
  description:
    "같은 사람이어도 오늘은 결정의 날, 내일은 회복의 날. 운명비서는 매일 아침 1분, 당신의 오늘을 정리해 드립니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
