import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/github/", "/compare/"], disallow: ["/api/", "/dashboard", "/login", "/register"] }],
    sitemap: "https://gitrate.dev/sitemap.xml",
    host: "https://gitrate.dev",
  };
}