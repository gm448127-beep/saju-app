import type { Viewport } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";
import { rootMetadata } from "@/lib/site-metadata";

export const metadata = rootMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&family=Jua&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen md:bg-[#ebe7e0]">
        <ClientProviders>
          <div className="app-viewport mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-gradient-to-b from-white to-[#FAF8F5] shadow-none md:my-3 md:min-h-[calc(100dvh-1.5rem)] md:rounded-[1.75rem] md:border md:border-[#ddd5c6]/80 md:shadow-[0_24px_64px_rgba(47,40,43,0.12)]">
            <Header />
            <main className="flex-1 px-4 py-6">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}