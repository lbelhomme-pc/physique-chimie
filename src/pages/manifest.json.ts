import { siteConfig } from "../config/site";

export function GET() {
  const manifest = {
    id: siteConfig.pwa.id,
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.defaultDescription,
    start_url: siteConfig.pwa.startUrl,
    scope: siteConfig.pwa.startUrl,
    display: siteConfig.pwa.display,
    background_color: siteConfig.pwa.backgroundColor,
    theme_color: siteConfig.pwa.themeColor,
    orientation: siteConfig.pwa.orientation,
    categories: siteConfig.pwa.categories,
    lang: siteConfig.pwa.lang,
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: siteConfig.assets.faviconSvg,
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: siteConfig.assets.icons.any192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.assets.icons.any512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.assets.icons.maskable512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(`${JSON.stringify(manifest, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
}
