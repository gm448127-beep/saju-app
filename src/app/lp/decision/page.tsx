import PersonaLanding from "@/components/landing/PersonaLanding";
import { LANDING_DECISION } from "@/lib/landing-copy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: LANDING_DECISION.metaTitle,
  description: LANDING_DECISION.heroLead,
};

export default function LandingDecisionPage() {
  return <PersonaLanding copy={LANDING_DECISION} />;
}
