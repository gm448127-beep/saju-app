import type { LandingInfoBlock } from "@/components/landing/LandingInfoAccordion";
import { LANDING_SERVICE_ABOUT, LANDING_SERVICE_DELIVERY } from "@/lib/landing-service-pitch";

function aboutBlock(): LandingInfoBlock {
  return {
    title: LANDING_SERVICE_ABOUT.title,
    children: (
      <p>
        {LANDING_SERVICE_ABOUT.lines.map((line, index) => (
          <span key={line}>
            {index > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </p>
    ),
  };
}

function deliveryBlock(): LandingInfoBlock {
  return {
    title: LANDING_SERVICE_DELIVERY.title,
    children: (
      <ul>
        {LANDING_SERVICE_DELIVERY.items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    ),
  };
}

export function buildLandingInfoBlocks(audience: LandingInfoBlock): LandingInfoBlock[] {
  return [aboutBlock(), audience, deliveryBlock()];
}
