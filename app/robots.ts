import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://keino.dev/sitemap.xml",
    host: "https://keino.dev",
  };
}
