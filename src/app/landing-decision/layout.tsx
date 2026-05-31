import type { Metadata } from "next";
import { LANDING_SEO } from "@/lib/landing-service-pitch";

export const metadata: Metadata = {
  title: LANDING_SEO.title,
  description: LANDING_SEO.description,
};

export default function LandingDecisionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
