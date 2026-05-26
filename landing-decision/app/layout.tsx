import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "운명비서 — 매일의 작은 결정이 어려운 당신에게",
  description:
    "결정장애는 의지의 문제가 아닙니다. 오늘이 결정의 날인지, 흐름을 따라가는 날인지 알면 결정이 가벼워집니다.",
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
