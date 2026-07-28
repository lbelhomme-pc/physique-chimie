import { siteConfig } from "../config/site";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /404",
    "",
    `Sitemap: ${siteConfig.productionUrl}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
