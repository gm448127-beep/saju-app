import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-metadata";

const PUBLIC_ROUTES = [
  "", "/today", "/saju", "/saju/premium", "/compatibility", "/tojeong",
  "/tarot", "/dream", "/about", "/privacy", "/terms", "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date("2026-09-02");
  return PUBLIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: path === "" || path === "/today" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/today" ? 0.9 : 0.7,
  }));
}
