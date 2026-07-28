#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import axe from "axe-core";
import { JSDOM } from "jsdom";
import { siteConfig } from "../src/config/site.ts";

const root = process.cwd();
const distDir = path.join(root, "dist");
const configPath = path.join(root, "tests/fixtures/dist-audit.config.json");
const updateSnapshot = process.argv.includes("--update-snapshot");
const skipAxe = process.argv.includes("--skip-axe");
const onlyAxe = process.argv.includes("--only-axe");

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    pages: 0,
    sitemapRoutes: 0,
    snapshotRoutes: 0,
    checks: 0,
    errors: 0,
    warnings: 0,
  },
  errors: [],
  warnings: [],
  notes: [],
  budgets: {},
};

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function readJson(file, fallback = null) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(readText(file));
}

function check(condition, message, details = {}) {
  report.summary.checks += 1;
  if (!condition) {
    report.summary.errors += 1;
    report.errors.push({ message, ...details });
  }
}

function warn(condition, message, details = {}) {
  report.summary.checks += 1;
  if (!condition) {
    report.summary.warnings += 1;
    report.warnings.push({ message, ...details });
  }
}

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) files.push(full);
    }
  }
  return files.sort();
}

function normalizeRoute(route) {
  if (!route) return "/";
  let cleaned = route.replace(/\\/g, "/").split("#")[0].split("?")[0];
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      cleaned = new URL(cleaned).pathname;
    } catch {
      return route;
    }
  }
  if (!cleaned.startsWith("/")) cleaned = `/${cleaned}`;
  cleaned = cleaned.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
  cleaned = cleaned.replace(/\/{2,}/g, "/");
  if (cleaned.length > 1) cleaned = cleaned.replace(/\/$/g, "");
  return cleaned || "/";
}

function routeFromHtmlFile(file) {
  const relative = rel(file).replace(/^dist\//, "");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404";
  if (relative.endsWith("/index.html")) return normalizeRoute(relative.slice(0, -"/index.html".length));
  return normalizeRoute(relative);
}

function localFileFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    /^(mailto|tel|data|blob):/i.test(trimmed) ||
    trimmed.startsWith("//")
  ) {
    return null;
  }
  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (!isInternalOrigin(parsed.origin)) return null;
      pathname = parsed.pathname;
    } catch {
      return null;
    }
  }
  pathname = pathname.split("#")[0].split("?")[0];
  if (!pathname.startsWith("/")) return null;
  return path.join(distDir, decodeURIComponent(pathname).replace(/^\/+/, ""));
}

function isInternalOrigin(origin) {
  return config.siteOrigins.includes(origin.replace(/\/$/, ""));
}

function expectedOrigin() {
  return siteConfig.productionUrl.replace(/\/$/, "");
}

function isRouteLike(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith("#")) return false;
  if (/^(mailto|tel|data|blob):/i.test(trimmed) || trimmed.startsWith("//")) return false;
  if (/^https?:\/\//i.test(trimmed)) {
    const parsed = new URL(trimmed);
    if (!isInternalOrigin(parsed.origin)) return false;
    return !path.extname(parsed.pathname.replace(/\/$/, ""));
  }
  const pathname = trimmed.split("#")[0].split("?")[0];
  return !path.extname(pathname.replace(/\/$/, ""));
}

function routeExists(route, routes) {
  return routes.has(normalizeRoute(route));
}

function splitSrcset(value) {
  return value
    .split(",")
    .map((item) => item.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function attrValues(document, selector, attribute) {
  return [...document.querySelectorAll(selector)]
    .map((node) => node.getAttribute(attribute))
    .filter((value) => typeof value === "string" && value.trim());
}

function readSitemapRoutes() {
  const indexFile = path.join(distDir, "sitemap-index.xml");
  if (!fs.existsSync(indexFile)) return new Set();

  const sitemapFiles = new Set([indexFile]);
  const indexXml = readText(indexFile);
  for (const loc of indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const local = localFileFromUrl(loc[1]);
    if (local && local.endsWith(".xml")) sitemapFiles.add(local);
  }

  const routes = new Set();
  for (const file of sitemapFiles) {
    if (!fs.existsSync(file)) continue;
    const xml = readText(file);
    if (!/<urlset[\s>]/.test(xml)) continue;
    for (const loc of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = loc[1].trim();
      try {
        const parsed = new URL(url);
        if (isInternalOrigin(parsed.origin)) routes.add(normalizeRoute(parsed.pathname));
      } catch {
        // Non URL sitemap entries are reported below by the route comparison.
      }
    }
  }
  return routes;
}

function routeAllowed(route, entries = []) {
  return entries.some((entry) => normalizeRoute(entry.route) === normalizeRoute(route));
}

function valueAllowed(value, entries = [], key = "url") {
  return entries.some((entry) => entry[key] === value);
}

function routeBudgetFor(route) {
  const exact = config.budgets.routeOverrides[route] ?? config.budgets.routeOverrides[`${route}/`];
  return { ...config.budgets.defaultRoute, ...(exact ?? {}) };
}

function redirectRuleFor(route) {
  return (config.redirectRoutes ?? []).find((entry) => normalizeRoute(entry.from) === normalizeRoute(route));
}

function allowedH1CountFor(route) {
  const exact = config.allowedH1Counts[route];
  if (typeof exact === "number") return exact;
  const explicitPhysicalScience = route.match(/^\/physique-chimie\/(college|lycee)\/(.+)$/);
  if (!explicitPhysicalScience) return undefined;
  const legacyRoute = `/${explicitPhysicalScience[1]}/${explicitPhysicalScience[2]}`;
  return config.allowedH1Counts[legacyRoute];
}

function fileSize(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : 0;
}

function sumLocalAssetSizes(urls) {
  let total = 0;
  const files = new Set();
  for (const url of urls) {
    const local = localFileFromUrl(url);
    if (!local || !fs.existsSync(local) || files.has(local)) continue;
    files.add(local);
    total += fileSize(local);
  }
  return total;
}

function analyzePage(page, allRoutes, sitemapRoutes) {
  const html = readText(page.file);
  const dom = new JSDOM(html, { url: `${config.siteOrigins[0]}${page.route}` });
  const { document } = dom.window;

  const titleNodes = [...document.querySelectorAll("head > title")];
  const titleTexts = titleNodes.map((node) => node.textContent?.trim() ?? "").filter(Boolean);
  check(titleNodes.length === 1 && titleTexts.length === 1, "Title absent ou non unique", {
    route: page.route,
    count: titleNodes.length,
  });

  const redirectRule = redirectRuleFor(page.route);
  if (redirectRule) {
    const targetRoute = normalizeRoute(redirectRule.to);
    const refreshValues = [...document.querySelectorAll("meta[http-equiv]")]
      .filter((node) => node.getAttribute("http-equiv")?.toLowerCase() === "refresh")
      .map((node) => node.getAttribute("content") ?? "");
    const refreshTargets = refreshValues
      .map((value) => value.match(/url\s*=\s*([^;]+)/i)?.[1]?.trim())
      .filter(Boolean)
      .map(normalizeRoute);
    check(refreshTargets.includes(targetRoute), "Redirection statique incoherente", {
      route: page.route,
      expected: targetRoute,
      refreshValues,
    });
    check(routeExists(targetRoute, allRoutes), "Redirection pointe vers une route inexistante", {
      route: page.route,
      target: targetRoute,
    });
    const robots = attrValues(document, 'meta[name="robots"]', "content").join(",").toLowerCase();
    check(robots.includes("noindex"), "Redirection indexable", { route: page.route, robots });
    const canonicalValues = attrValues(document, 'link[rel~="canonical"]', "href");
    check(canonicalValues.length === 1 && normalizeRoute(canonicalValues[0]) === targetRoute, "Canonical de redirection incoherent", {
      route: page.route,
      canonical: canonicalValues[0],
      expected: targetRoute,
    });
    const anchorTargets = attrValues(document, "a[href]", "href").map(normalizeRoute);
    check(anchorTargets.includes(targetRoute), "Lien de redirection absent", {
      route: page.route,
      expected: targetRoute,
    });

    const htmlBytes = fileSize(page.file);
    const budget = routeBudgetFor(page.route);
    check(htmlBytes <= budget.htmlBytes, "Budget HTML depasse", { route: page.route, bytes: htmlBytes, budget: budget.htmlBytes });
    check(htmlBytes <= budget.totalBytes, "Budget total page depasse", {
      route: page.route,
      bytes: htmlBytes,
      budget: budget.totalBytes,
    });
    page.metrics = { htmlBytes, jsBytes: 0, cssBytes: 0, totalBytes: htmlBytes };
    return;
  }

  const descriptions = attrValues(document, 'meta[name="description"]', "content").filter((value) => value.trim());
  check(descriptions.length === 1, "Meta-description absente ou non unique", {
    route: page.route,
    count: descriptions.length,
  });

  const h1Count = document.querySelectorAll("h1").length;
  const allowedH1 = allowedH1CountFor(page.route);
  check(h1Count === 1 || h1Count === allowedH1, "Nombre de H1 non autorise", {
    route: page.route,
    count: h1Count,
    allowed: allowedH1 ?? 1,
  });

  const canonicalValues = attrValues(document, 'link[rel~="canonical"]', "href");
  check(canonicalValues.length === 1, "Canonical absent ou non unique", {
    route: page.route,
    count: canonicalValues.length,
  });
  if (canonicalValues.length === 1) {
    try {
      const canonicalUrl = new URL(canonicalValues[0]);
      check(isInternalOrigin(canonicalUrl.origin), "Canonical utilise un domaine inattendu", {
        route: page.route,
        canonical: canonicalValues[0],
        expectedOrigins: config.siteOrigins,
      });
    } catch (error) {
      check(false, "Canonical invalide", { route: page.route, canonical: canonicalValues[0], detail: error.message });
    }
    const canonicalRoute = normalizeRoute(canonicalValues[0]);
    const canonicalAllowed = routeAllowed(page.route, config.allowedCanonicalMismatches);
    check(routeExists(canonicalRoute, allRoutes), "Canonical pointe vers une route inexistante", {
      route: page.route,
      canonical: canonicalValues[0],
    });
    check(canonicalAllowed || canonicalRoute === page.route, "Canonical incoherent avec la route", {
      route: page.route,
      canonical: canonicalRoute,
    });
    if (sitemapRoutes.has(page.route)) {
      check(canonicalAllowed || sitemapRoutes.has(canonicalRoute), "Canonical absent du sitemap", {
        route: page.route,
        canonical: canonicalRoute,
      });
    }
  }

  const ogUrls = attrValues(document, 'meta[property="og:url"]', "content");
  check(ogUrls.length === 1, "Open Graph URL absente ou non unique", {
    route: page.route,
    count: ogUrls.length,
  });
  if (ogUrls.length === 1) {
    check(ogUrls[0] === fullUrlFromRoute(page.route), "Open Graph URL incoherente avec la route", {
      route: page.route,
      ogUrl: ogUrls[0],
      expected: fullUrlFromRoute(page.route),
    });
  }

  const jsonLdScripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
  jsonLdScripts.forEach((script, index) => {
    try {
      const parsed = JSON.parse(script.textContent ?? "");
      check(parsed && typeof parsed === "object", "JSON-LD vide", { route: page.route, index });
      verifySearchTargets(parsed, page.route, allRoutes);
    } catch (error) {
      check(false, "JSON-LD invalide", { route: page.route, index, detail: error.message });
    }
  });

  const anchorHrefs = attrValues(document, "a[href]", "href");
  for (const href of anchorHrefs) {
    if (!isRouteLike(href)) continue;
    const route = normalizeRoute(href);
    if (valueAllowed(route, config.allowedMissingInternalLinks, "route")) continue;
    check(routeExists(route, allRoutes), "Lien interne casse", { route: page.route, href });
  }

  verifyHashLinks(document, page.route);

  const localAssetUrls = [
    ...attrValues(document, "script[src]", "src"),
    ...attrValues(document, "img[src]", "src"),
    ...attrValues(document, "source[src]", "src"),
    ...attrValues(document, "video[poster]", "poster"),
    ...attrValues(document, 'link[href]:not([rel~="canonical"])', "href"),
    ...attrValues(document, "[srcset]", "srcset").flatMap(splitSrcset),
  ];
  for (const url of localAssetUrls) {
    const local = localFileFromUrl(url);
    if (!local) continue;
    const allowed = valueAllowed(url, config.allowedMissingAssets, "url") || valueAllowed(`/${rel(local).replace(/^dist\//, "")}`, config.allowedMissingAssets, "url");
    check(allowed || fs.existsSync(local), "Asset local inexistant", {
      route: page.route,
      url,
      expected: rel(local),
    });
  }

  const jsBytes = sumLocalAssetSizes(attrValues(document, "script[src]", "src"));
  const cssBytes = sumLocalAssetSizes(attrValues(document, 'link[rel~="stylesheet"][href]', "href"));
  const htmlBytes = fileSize(page.file);
  const budget = routeBudgetFor(page.route);
  check(htmlBytes <= budget.htmlBytes, "Budget HTML depasse", { route: page.route, bytes: htmlBytes, budget: budget.htmlBytes });
  check(jsBytes <= budget.jsBytes, "Budget JS depasse", { route: page.route, bytes: jsBytes, budget: budget.jsBytes });
  check(cssBytes <= budget.cssBytes, "Budget CSS depasse", { route: page.route, bytes: cssBytes, budget: budget.cssBytes });
  check(htmlBytes + jsBytes + cssBytes <= budget.totalBytes, "Budget total page depasse", {
    route: page.route,
    bytes: htmlBytes + jsBytes + cssBytes,
    budget: budget.totalBytes,
  });

  page.metrics = { htmlBytes, jsBytes, cssBytes, totalBytes: htmlBytes + jsBytes + cssBytes };
}

function verifyHashLinks(document, route) {
  for (const href of attrValues(document, 'a[href^="#"]', "href")) {
    if (href === "#") continue;
    const id = href.slice(1);
    check(Boolean(document.getElementById(id)), "Ancre locale inexistante", { route, href });
  }
}

function verifySearchTargets(value, route, allRoutes) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => verifySearchTargets(item, route, allRoutes));
    return;
  }
  if (value["@type"] === "SearchAction" || value.target) {
    const target = typeof value.target === "string" ? value.target : value.target?.urlTemplate;
    if (typeof target === "string") {
      const cleanTarget = target.replace(/\{[^}]+\}/g, "test").split("?")[0];
      const targetRoute = normalizeRoute(cleanTarget);
      if (!routeExists(targetRoute, allRoutes)) {
        const allowed = valueAllowed(targetRoute, config.allowedMissingSearchTargets, "route");
        warn(allowed, "URL de recherche inexistante dans le JSON-LD", {
          route,
          target,
          targetRoute,
        });
      }
    }
  }
  Object.values(value).forEach((item) => verifySearchTargets(item, route, allRoutes));
}

function fullUrlFromRoute(route) {
  return `${expectedOrigin()}${normalizeRoute(route) === "/" ? "/" : normalizeRoute(route)}`;
}

function verifyRobotsAndManifest() {
  const robotsFile = path.join(distDir, "robots.txt");
  check(fs.existsSync(robotsFile), "robots.txt absent du build");
  if (fs.existsSync(robotsFile)) {
    const robots = readText(robotsFile);
    const sitemapLines = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((match) => match[1]);
    check(sitemapLines.length >= 1, "robots.txt ne declare aucun sitemap");
    for (const sitemapUrl of sitemapLines) {
      try {
        const parsed = new URL(sitemapUrl);
        check(isInternalOrigin(parsed.origin), "robots.txt declare un domaine de sitemap inattendu", {
          sitemap: sitemapUrl,
          expectedOrigins: config.siteOrigins,
        });
        check(parsed.pathname === "/sitemap-index.xml", "robots.txt ne pointe pas vers le sitemap index attendu", {
          sitemap: sitemapUrl,
        });
      } catch (error) {
        check(false, "robots.txt contient une URL de sitemap invalide", { sitemap: sitemapUrl, detail: error.message });
      }
    }
  }

  const manifestFile = path.join(distDir, "manifest.json");
  check(fs.existsSync(manifestFile), "manifest.json absent du build");
  const manifest = readJson(manifestFile, null);
  if (manifest) {
    check(manifest.name === siteConfig.name, "Nom du manifeste incoherent avec la configuration centrale", {
      actual: manifest.name,
      expected: siteConfig.name,
    });
    check(manifest.short_name === siteConfig.shortName, "Nom court du manifeste incoherent avec la configuration centrale", {
      actual: manifest.short_name,
      expected: siteConfig.shortName,
    });
    check(manifest.description === siteConfig.defaultDescription, "Description du manifeste incoherente avec la configuration centrale");
    check(manifest.theme_color === siteConfig.pwa.themeColor, "Couleur theme du manifeste incoherente");
    check(manifest.background_color === siteConfig.pwa.backgroundColor, "Couleur de fond du manifeste incoherente");
    check(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Manifest sans icones");
    for (const icon of manifest.icons ?? []) {
      const iconPath = typeof icon.src === "string" ? icon.src : "";
      const local = localFileFromUrl(iconPath);
      check(Boolean(local && fs.existsSync(local)), "Icone de manifeste inexistante", {
        icon: iconPath,
        expected: local ? rel(local) : null,
      });
    }
  }
}

function verifyNoContradictoryDomains() {
  const expected = expectedOrigin();
  const scannedFiles = walkFiles(distDir, (file) => /\.(html|xml|json|txt|webmanifest)$/i.test(file));
  for (const file of scannedFiles) {
    const text = readText(file);
    const origins = [...text.matchAll(/https:\/\/[a-z0-9.-]+/gi)]
      .map((match) => match[0].replace(/\/$/, ""))
      .filter((origin) => origin.includes("physique-chimie") || origin.includes("vercel.app"));
    for (const origin of origins) {
      check(origin === expected, "Domaine contradictoire dans le build", {
        file: rel(file),
        origin,
        expected,
      });
    }
  }
}

async function runAxeSample(pages) {
  const sampledRoutes = config.a11ySampleRoutes.map(normalizeRoute);
  for (const route of sampledRoutes) {
    const page = pages.find((item) => item.route === route);
    check(Boolean(page), "Page d'echantillon accessibilite absente", { route });
    if (!page) continue;

    const html = readText(page.file);
    const dom = new JSDOM(html, {
      url: `${config.siteOrigins[0]}${page.route}`,
      runScripts: "outside-only",
      pretendToBeVisual: true,
    });
    dom.window.eval(axe.source);
    const results = await dom.window.axe.run(dom.window.document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
      rules: {
        "color-contrast": { enabled: false },
        "region": { enabled: false },
      },
    });
    const allowed = config.allowedAxeViolations[route] ?? {};
    for (const violation of results.violations) {
      const allowedCount = allowed[violation.id] ?? 0;
      check(
        violation.nodes.length <= allowedCount,
        "Violation axe non autorisee",
        {
          route,
          rule: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length,
          allowed: allowedCount,
          help: violation.help,
        },
      );
    }
    report.notes.push({
      message: `Axe ${route}: ${results.violations.length} regles avec violation, ${results.passes.length} regles passees`,
    });
  }
}

function runSmokeSamples(pages) {
  for (const sample of config.smokeSamples) {
    const route = normalizeRoute(sample.route);
    const page = pages.find((item) => item.route === route);
    check(Boolean(page), "Page d'echantillon E2E absente", { route, label: sample.label });
    if (!page) continue;
    const dom = new JSDOM(readText(page.file));
    const { document } = dom.window;
    for (const selector of sample.requiredSelectors) {
      check(Boolean(document.querySelector(selector)), "Selecteur E2E absent", {
        route,
        label: sample.label,
        selector,
      });
    }
  }
}

function compareRouteSets(routes, sitemapRoutes, snapshotRoutes) {
  if (updateSnapshot) {
    const snapshotPath = path.join(root, config.routeSnapshotPath);
    fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
    fs.writeFileSync(snapshotPath, `${JSON.stringify([...routes].sort(), null, 2)}\n`);
    report.notes.push({ message: `Snapshot routes mis a jour: ${config.routeSnapshotPath}` });
  }

  for (const route of snapshotRoutes) {
    check(routes.has(route), "Route snapshot absente du build", { route });
  }
  for (const route of routes) {
    check(snapshotRoutes.has(route), "Route generee absente du snapshot versionne", { route });
  }

  const sitemapExcluded = config.sitemapExclusions.map((entry) => normalizeRoute(entry.route));
  for (const route of routes) {
    if (sitemapExcluded.includes(route)) continue;
    check(sitemapRoutes.has(route), "Route generee absente du sitemap", { route });
  }
  for (const route of sitemapRoutes) {
    check(routes.has(route), "Route sitemap absente du build", { route });
  }
}

function printReport() {
  const compact = {
    generatedAt: report.generatedAt,
    summary: report.summary,
    budgets: report.budgets,
    errors: report.errors.slice(0, 80),
    warnings: report.warnings.slice(0, 80),
    notes: report.notes,
  };
  console.log(JSON.stringify(compact, null, 2));
}

const loadedConfig = readJson(configPath);
if (!loadedConfig) {
  console.error(`Configuration introuvable: ${rel(configPath)}`);
  process.exit(1);
}
const configuredOrigins = Array.isArray(loadedConfig.siteOrigins) ? loadedConfig.siteOrigins : [];
const config = {
  ...loadedConfig,
  siteOrigins: [...new Set([siteConfig.productionUrl, ...configuredOrigins].map((origin) => origin.replace(/\/$/, "")))],
};

check(fs.existsSync(distDir), "Dossier dist introuvable. Lancer npm run build avant audit:dist.", {
  dir: rel(distDir),
});

const htmlFiles = walkFiles(distDir, (file) => file.endsWith(".html"));
const pages = htmlFiles.map((file) => ({ file, route: routeFromHtmlFile(file), metrics: null }));
const routeList = pages.map((page) => page.route).sort();
const routes = new Set(routeList);
const sitemapRoutes = readSitemapRoutes();
const snapshotRoutes = new Set((readJson(path.join(root, config.routeSnapshotPath), []) ?? []).map(normalizeRoute));

report.summary.pages = pages.length;
report.summary.sitemapRoutes = sitemapRoutes.size;
report.summary.snapshotRoutes = snapshotRoutes.size;

check(pages.length > 0, "Aucune page HTML generee dans dist");
check(new Set(routeList).size === routeList.length, "Routes HTML dupliquees dans dist");
if (!onlyAxe) {
  verifyRobotsAndManifest();
  verifyNoContradictoryDomains();
  compareRouteSets(routes, sitemapRoutes, snapshotRoutes);

  for (const page of pages) {
    analyzePage(page, routes, sitemapRoutes);
  }

  runSmokeSamples(pages);
}

if (!skipAxe) {
  await runAxeSample(pages);
}

const allJsBytes = walkFiles(path.join(distDir, "_astro"), (file) => file.endsWith(".js")).reduce((sum, file) => sum + fileSize(file), 0);
const allCssBytes = walkFiles(path.join(distDir, "_astro"), (file) => file.endsWith(".css")).reduce((sum, file) => sum + fileSize(file), 0);
report.budgets = onlyAxe
  ? {
      totalJsBytes: allJsBytes,
      totalCssBytes: allCssBytes,
    }
  : {
      maxHtmlBytes: Math.max(...pages.map((page) => page.metrics?.htmlBytes ?? 0)),
      maxPageTotalBytes: Math.max(...pages.map((page) => page.metrics?.totalBytes ?? 0)),
      totalJsBytes: allJsBytes,
      totalCssBytes: allCssBytes,
    };

if (!onlyAxe) {
  check(allJsBytes <= config.budgets.global.jsBytes, "Budget JS global depasse", {
    bytes: allJsBytes,
    budget: config.budgets.global.jsBytes,
  });
  check(allCssBytes <= config.budgets.global.cssBytes, "Budget CSS global depasse", {
    bytes: allCssBytes,
    budget: config.budgets.global.cssBytes,
  });
}

printReport();

if (report.summary.errors > 0) {
  process.exit(1);
}
