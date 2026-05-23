import PersonaLanding from "@/components/landing/PersonaLanding";
import { LANDING_SELF } from "@/lib/landing-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LANDING_SELF.metaTitle,
  description: LANDING_SELF.heroLead,
};

export default function LandingSelfPage() {
  return <PersonaLanding copy={LANDING_SELF} />;
}
