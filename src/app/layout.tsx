import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://saju-app-vert.vercel.app"),
  title: {
    default: "운명비서 - AI 맞춤 사주 분석",
    template: "%s | 운명비서",
  },
  description: "오늘의 운세, 사주팔자, 토정비결, 궁합을 차분한 리포트로 정리해주는 AI 운세 비서",
  applicationName: "운명비서",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "운명비서 - AI 맞춤 사주 분석",
    description: "나만을 위한 오늘의 운세, 사주팔자, 토정비결, 궁합을 전문 리포트처럼 확인하세요.",
    url: "/",
    siteName: "운명비서",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png?v=4",
        width: 1200,
        height: 630,
        alt: "운명비서 - AI 맞춤 사주 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "운명비서 - AI 맞춤 사주 분석",
    description: "오늘의 운세, 사주팔자, 토정비결, 궁합을 AI 리포트로 확인하세요.",
    images: ["/og-image.png?v=4"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&family=Jua&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}