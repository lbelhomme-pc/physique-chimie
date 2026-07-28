import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  absoluteSiteUrl,
  buildPageJsonLd,
  normalizeSiteUrl,
  pageDescription,
  resolveRobotsContent,
  resolveSchemaType,
  siteConfig,
} from "../src/config/site.ts";

const root = process.cwd();

test("site configuration centralizes the production origin and public identity", () => {
  assert.equal(normalizeSiteUrl("https://example.test/path?q=1"), "https://example.test");
  assert.match(siteConfig.productionUrl, /^https:\/\/[^/]+$/);
  assert.ok(siteConfig.name.includes("Physique-Chimie"));
  assert.ok(siteConfig.name.includes("Mathématiques"));
  assert.notEqual(siteConfig.name, "Molly");
  assert.equal(absoluteSiteUrl("/college"), `${siteConfig.productionUrl}/college`);
});

test("schema.org helpers expose reliable V3 structured data", () => {
  assert.equal(resolveSchemaType("Course"), "Course");
  assert.equal(resolveSchemaType("EducationalContent"), "LearningResource");
  assert.equal(resolveSchemaType("SoftwareApplication"), "SoftwareApplication");
  assert.equal(resolveSchemaType(undefined), "WebPage");

  const canonicalUrl = absoluteSiteUrl("/physique-chimie/college/4eme/chimie/atomes-molecules");
  const jsonLd = buildPageJsonLd({
    title: "Atomes et molecules",
    description: "Cours, exercices et quiz pour reviser les atomes et molecules.",
    canonicalUrl,
    schemaType: "Course",
    subject: "physique-chimie",
    cycle: "college",
    level: "4eme",
    resourceType: "chapter",
    imageUrl: absoluteSiteUrl(siteConfig.assets.ogImage),
  });

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.ok(Array.isArray(jsonLd["@graph"]));

  const graph = jsonLd["@graph"];
  const course = graph.find((node) => node["@type"] === "Course");
  const website = graph.find((node) => node["@type"] === "WebSite");
  const webpage = graph.find((node) => node["@type"] === "WebPage");

  assert.equal(course.url, canonicalUrl);
  assert.equal(course.inLanguage, "fr-FR");
  assert.equal(course.isAccessibleForFree, true);
  assert.match(course.educationalLevel, /4eme/);
  assert.equal(course.learningResourceType, "course");
  assert.equal(course.mainEntityOfPage["@id"], `${canonicalUrl}#webpage`);
  assert.match(course.about.name, /Physique-Chimie/);

  assert.equal(webpage.url, canonicalUrl);
  assert.equal(website.potentialAction["@type"], "SearchAction");
  assert.match(website.potentialAction.target.urlTemplate, /\/\?q=\{search_term_string\}#recherche$/);
});

test("robots, canonical and sitemap settings are explicit", () => {
  assert.equal(resolveRobotsContent(), "index, follow");
  assert.equal(resolveRobotsContent(true), "noindex, nofollow");

  const layoutSource = fs.readFileSync(path.join(root, "src/layouts/BaseLayout.astro"), "utf8");
  assert.match(layoutSource, /<link rel="canonical" href=\{fullUrl\}>/);
  assert.match(layoutSource, /<meta name="robots" content=\{robotsContent\}>/);
  assert.match(layoutSource, /buildPageJsonLd/);
  assert.match(layoutSource, /application\/ld\+json/);

  const astroConfig = fs.readFileSync(path.join(root, "astro.config.mjs"), "utf8");
  assert.match(astroConfig, /sitemap\(/);
  assert.match(astroConfig, /!page\.includes\(['"]\/404['"]\)/);

  const robotsSource = fs.readFileSync(path.join(root, "src/pages/robots.txt.ts"), "utf8");
  assert.match(robotsSource, /Disallow: \/404/);
  assert.match(robotsSource, /sitemap-index\.xml/);
});

test("declared favicon and PWA assets exist in public", () => {
  const assets = [
    siteConfig.assets.faviconSvg,
    siteConfig.assets.faviconIco,
    siteConfig.assets.appleTouchIcon,
    siteConfig.assets.ogImage,
    siteConfig.assets.icons.any192,
    siteConfig.assets.icons.any512,
    siteConfig.assets.icons.maskable512,
  ];

  for (const asset of assets) {
    assert.ok(asset.startsWith("/"), `${asset}: public path`);
    assert.ok(fs.existsSync(path.join(root, "public", asset.slice(1))), `${asset}: exists`);
  }
});

test("fallback descriptions are contextual and analytics remains consent-gated", () => {
  assert.match(pageDescription(undefined, "Kit scientifique", "/outils-methodes/kit-scientifique"), /outil|méthode/i);
  assert.match(pageDescription(undefined, "Méga quiz", "/memorisation/mega-quiz"), /mémorisation|quiz/i);
  assert.equal(siteConfig.analytics.consentStorageKey, "site.analyticsConsent");
  assert.equal(siteConfig.analytics.consentGrantedValue, "granted");
  assert.equal(siteConfig.analytics.consentDeniedValue, "denied");
  assert.ok(siteConfig.analytics.cookieNames.includes("_ga"));
});
