import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata("history"),
  robots: { index: false, follow: true },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
