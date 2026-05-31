import { pageMetadata } from "@/lib/site-metadata";
import "@/styles/landing-locked.css";
import "@/styles/today-secretary-report.css";

export const metadata = pageMetadata("today");

export default function TodayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
