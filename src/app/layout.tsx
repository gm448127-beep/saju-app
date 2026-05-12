import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "사주도우미 - AI 사주 분석",
  description: "데이터 기반 사주팔자, 오늘의 운세, 토정비결, 궁합 분석, AI 사주상담",
  openGraph: {
    title: "✨ 사주도우미 - AI 맞춤 사주 분석",
    description: "나만을 위한 사주팔자, 오늘의 운세, 토정비결, 궁합, AI 사주상담까지! 무료로 바로 확인하세요 ✨",
    url: "https://saju-app-vert.vercel.app",
    siteName: "사주도우미",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://saju-app-vert.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "사주도우미 - AI 맞춤 사주 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "✨ 사주도우미 - AI 맞춤 사주 분석",
    description: "나만을 위한 사주팔자, 오늘의 운세, 토정비결, 궁합, AI 사주상담까지!",
    images: ["https://saju-app-vert.vercel.app/og-image.png"],
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