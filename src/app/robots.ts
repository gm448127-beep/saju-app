import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-metadata";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/history", "/landing-assets"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
