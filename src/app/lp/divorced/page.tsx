import PersonaLanding from "@/components/landing/PersonaLanding";
import { LANDING_DIVORCED } from "@/lib/landing-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LANDING_DIVORCED.metaTitle,
  description: LANDING_DIVORCED.heroLead,
};

export default function LandingDivorcedPage() {
  return <PersonaLanding copy={LANDING_DIVORCED} />;
}
