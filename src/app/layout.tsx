import type { Viewport } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import AppChrome from "@/components/AppChrome";
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
      <body className="min-h-screen md:bg-[var(--paper-desktop)]">
        <ClientProviders>
          <div className="app-viewport mx-auto flex min-h-[100dvh] w-full flex-col shadow-none md:my-3 md:min-h-[calc(100dvh-1.5rem)] md:rounded-[1.75rem] md:border md:border-[color-mix(in_srgb,var(--line)_85%,transparent)] md:shadow-[0_24px_64px_rgba(51,51,51,0.12)]">
            <AppChrome>{children}</AppChrome>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}