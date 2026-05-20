import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata("today");

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
