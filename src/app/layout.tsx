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