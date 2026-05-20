import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL("https://saju-app-vert.vercel.app"),
  title: {
    default: "운명비서 - AI 맞춤 사주 분석",
    template: "%s | 운명비서",
  },
  description: "오늘의 운세부터 사주·궁합까지, 매일 다시 보고 싶은 AI 운명 리포트.",
  applicationName: "운명비서",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "운명비서 - AI 맞춤 사주 분석",
    description: "오늘의 운세부터 사주·궁합까지, 매일 다시 보고 싶은 AI 운명 리포트.",
    url: "/",
    siteName: "운명비서",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "https://saju-app-vert.vercel.app/kakao-og-20260518.png",
        width: 1200,
        height: 630,
        alt: "운명비서 - AI 맞춤 사주 분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "운명비서 - AI 맞춤 사주 분석",
    description: "오늘의 운세부터 사주·궁합까지, 매일 다시 보고 싶은 AI 운명 리포트.",
    images: ["https://saju-app-vert.vercel.app/kakao-og-20260518.png"],
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
        <ClientProviders>
          <Header />
          <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        </ClientProviders>
      </body>
    </html>
  );
}