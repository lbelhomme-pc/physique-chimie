import fs from "node:fs";
import path from "node:path";
import http from "node:http";
// QA-only: resolve Playwright externally, without adding an application dependency.
const { chromium } = await import(
  process.env.UI5_PLAYWRIGHT_MODULE || "playwright-core"
);
const root = process.cwd(),
  out = path.join(root, "docs/qa-ui-v5-2026-10-01");
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  );
  const distDir = path.resolve(root, "dist");
  let p = path.resolve(distDir, `.${pathname}`);
  if (p !== distDir && !p.startsWith(`${distDir}${path.sep}`)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory())
    p = path.join(p, "index.html");
  if (!fs.existsSync(p)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
  };
  res.setHeader(
    "Content-Type",
    types[path.extname(p)] || "application/octet-stream",
  );
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(44965, "127.0.0.1", r));
const launch = () =>
  chromium.launch({
    executablePath: process.env.UI5_CHROMIUM_PATH || undefined,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--no-zygote",
      "--single-process",
    ],
  });
let browser = await launch();
const report = {
  browserVersion: browser.version(),
  generatedAt: new Date().toISOString(),
  checks: [],
  errors: [],
  consoleErrors: [],
  screenshots: [],
};
function check(ok, label, detail) {
  report.checks.push({ label, ok, detail });
  if (!ok) report.errors.push({ label, detail });
}
let page;
async function geometry(label) {
  const detail = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    smallButtons: [...document.querySelectorAll("main button")]
      .filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.height < 43.5;
      })
      .map((b) => ({
        text: b.textContent.trim().slice(0, 45),
        height: b.getBoundingClientRect().height,
      })),
    blank: document.querySelector("main")?.textContent.trim().length < 20,
  }));
  check(
    detail.scrollWidth <= detail.width + 1,
    label + " horizontal overflow",
    detail,
  );
  check(!detail.blank, label + " meaningful content", detail);
  check(
    detail.smallButtons.length === 0,
    label + " 44px controls",
    detail.smallButtons,
  );
}
async function load(route, label) {
  const res = await page.goto("http://127.0.0.1:44965" + route, {
    waitUntil: "networkidle",
  });
  check(res.status() === 200, label + " route", res.status());
  await page.waitForFunction(
    () => !document.querySelector('astro-island[ssr][client="load"]'),
    { timeout: 15000 },
  );
  await geometry(label);
}
async function shot(label) {
  const file = label + ".png";
  await page.screenshot({ path: path.join(out, file), fullPage: false });
  report.screenshots.push(file);
}
try {
  for (const [vp, width, height] of [
    ["desktop", 1440, 1100],
    ["tablet", 768, 1024],
    ["mobile", 390, 844],
  ]) {
    if (!browser.isConnected()) browser = await launch();
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    page = await context.newPage();
    page.on("pageerror", (e) =>
      report.consoleErrors.push({ vp, route: page.url(), message: e.message }),
    );
    await load("/", vp + " home");
    await shot(vp + "-home");
    // Consent is visible in the first capture. Dismiss it for unobstructed interaction captures.
    await page.locator('[data-analytics-consent="denied"]').click();
    await page.locator("[data-global-a11y-launcher]").click();
    await page.locator(".a11y-panel.is-open").waitFor();
    await page.getByRole("tab", { name: "Réglages", exact: true }).click();
    const smallA11y = await page
      .locator(".a11y-panel")
      .evaluate((el) =>
        [...el.querySelectorAll("button")]
          .filter((b) => b.getBoundingClientRect().height < 43.5)
          .map((b) => b.textContent.trim()),
      );
    check(
      smallA11y.length === 0,
      vp + " accessibility controls 44px",
      smallA11y,
    );
    await page.keyboard.press("Escape");
    check(
      (await page
        .locator(".a11y-panel-toggle")
        .getAttribute("aria-expanded")) === "false",
      vp + " accessibility Escape",
    );
    if (await page.locator(".ui5-nav__toggle").isVisible()) {
      await page.locator(".ui5-nav__toggle").click();
      check(
        (await page
          .locator(".ui5-nav__toggle")
          .getAttribute("aria-expanded")) === "true",
        vp + " mobile menu open",
      );
      await page.keyboard.press("Escape");
      check(
        (await page
          .locator(".ui5-nav__toggle")
          .getAttribute("aria-expanded")) === "false",
        vp + " mobile menu Escape",
      );
    }
    if (await page.locator(".ui5-nav__toggle").isVisible())
      await page.locator(".ui5-nav__toggle").click();
    await page.locator("details.ui5-nav__menu summary").first().click();
    check(
      (await page
        .locator("details.ui5-nav__menu")
        .first()
        .getAttribute("open")) !== null,
      vp + " discipline menu",
    );
    await page.keyboard.press("Escape");
    for (const route of [
      "/college",
      "/college/4eme",
      "/mathematiques/college",
      "/mathematiques/college/6eme",
    ])
      await load(route, vp + " " + route);
    await page.locator("[data-catalogue-search]").first().fill("zzzzzzzz");
    await page.waitForTimeout(80);
    check(
      (await page.locator("[data-catalogue-item]:visible").count()) === 0,
      vp + " catalogue no-results filter",
    );
    await page.locator("[data-catalogue-search]").first().fill("");
    check(
      (await page.locator("[data-catalogue-item]:visible").count()) > 0,
      vp + " catalogue reset",
    );
    await load(
      "/physique-chimie/college/4eme/chimie/atomes-molecules",
      vp + " chapter",
    );
    await shot(vp + "-course");
    const panels = () => page.locator(".ui5-tab-panel.active");
    await page.locator('[data-tab="cours"]').focus();
    await page.keyboard.press("ArrowRight");
    check(
      (await page
        .locator('[data-tab="exercices"]')
        .getAttribute("aria-selected")) === "true",
      vp + " tabs ArrowRight",
    );
    await page.locator('[data-tab="exercices"]').click();
    await geometry(vp + " exercises");
    const p = panels();
    check(
      (await p.getByText("Correction essentielle", { exact: true }).count()) ===
        0,
      vp + " correction initially hidden",
    );
    const textarea = p.locator("textarea");
    if (await textarea.count())
      await textarea.first().fill("Une réponse de vérification");
    else {
      const input = p.locator(
        'input:not([type="radio"]):not([type="checkbox"])',
      );
      if (await input.count()) await input.first().fill("2");
      else await p.locator('input[type="radio"]').first().check();
    }
    await p
      .getByRole("button", { name: "Voir la correction", exact: true })
      .click();
    check(
      await p.getByText("Correction essentielle", { exact: true }).isVisible(),
      vp + " exercise correction after answer",
    );
    await shot(vp + "-exercises");
    await page.locator('[data-tab="quiz"]').click();
    await geometry(vp + " quiz");
    await panels().locator(".learning-choice").first().click();
    await panels()
      .getByRole("button", { name: /Valider/ })
      .click();
    check(
      await panels().locator(".learning-feedback").isVisible(),
      vp + " quiz feedback",
    );
    await shot(vp + "-quiz");
    await page.locator('[data-tab="flashcards"]').click();
    await panels().locator(".learning-session-option").last().click();
    await geometry(vp + " flashcards");
    await panels()
      .getByRole("button", { name: "Afficher la réponse", exact: true })
      .click();
    check(
      await panels().locator(".flashcard-expected-answer").isVisible(),
      vp + " flashcard answer reveal",
    );
    await panels().locator('[data-rating="good"]').click();
    await geometry(vp + " flashcards rated");
    await shot(vp + "-flashcards");
    await load(
      "/mathematiques/college/6eme/nombres-entiers-decimaux",
      vp + " latex",
    );
    check(
      await page.locator(".latex-course-document").isVisible(),
      vp + " LaTeX course visible",
    );
    check(
      (await page.locator(".katex-mathml").count()) > 0,
      vp + " MathML present",
    );
    await load("/laboratoire", vp + " lab");
    if (await page.locator(".ui5-nav__toggle").isVisible())
      await page.locator("[data-lab-filter-toggle]").click();
    await page.locator("[data-lab-search]").fill("zzzzzzzz");
    check(
      await page.locator("[data-lab-no-results]").isVisible(),
      vp + " lab no-results",
    );
    await page.locator("[data-lab-search]").fill("");
    for (const route of [
      "/outils-methodes",
      "/outils-methodes/kit-scientifique",
      "/outils-methodes/python-lab",
      "/outils-methodes/python",
      "/outils-methodes/cours-python",
      "/outils-methodes/seconde-numerique",
      "/mathematiques/lycee/2nde/fonctions-generalites",
      "/outils-methodes/methodes-maths-college",
      "/leane",
      "/leane/flashcards",
      "/profil",
      "/memorisation/mega-quiz",
      "/memorisation/mega-flashcards",
    ])
      await load(route, vp + " " + route);
    for (const slug of [
      "circuit-rc",
      "titrage-ph-metrique",
      "gaz-parfaits",
      "lois-kepler",
      "diffusion-temperature",
      "decroissance-radioactive",
    ]) {
      await load(`/laboratoire/${slug}`, vp + " simulation " + slug);
    }
    await load(
      "/mathematiques/lycee/2nde/fonctions-generalites",
      vp + " affine activity",
    );
    await page.locator('[data-tab="activite"]').click();
    await geometry(vp + " affine activity");
    await page.locator('[data-affine-param="a"]').fill("2");
    check(
      (await page.locator("[data-affine-formula]").textContent()).includes(
        "2x",
      ),
      vp + " affine parameter update",
    );
    await load("/outils-methodes/python-lab", vp + " Python editor");
    const original = await page.locator("#python-code").inputValue();
    await page.locator("#python-code").fill("print(42)");
    await page
      .getByRole("button", { name: "Réinitialiser", exact: true })
      .click();
    check(
      (await page.locator("#python-code").inputValue()) === original,
      vp + " Python reset",
    );
    await page.locator("#python-example").selectOption({ index: 1 });
    check(
      (await page.locator("#python-code").inputValue()) !== original,
      vp + " Python example selection",
    );
    await browser.close();
    console.log(vp, "complete", report.errors.length, "issues");
  }
  browser = await launch();
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    reducedMotion: "reduce",
  });
  await ctx.addInitScript(() =>
    localStorage.setItem(
      "a11y_preferences",
      JSON.stringify({
        theme: "dark",
        fontFamily: "verdana",
        fontSize: "large",
        lineHeight: "large",
        maxLineWidth: "very-narrow",
        reducedMotion: true,
      }),
    ),
  );
  page = await ctx.newPage();
  page.on("pageerror", (e) =>
    report.consoleErrors.push({
      vp: "dys",
      route: page.url(),
      message: e.message,
    }),
  );
  for (const route of [
    "/",
    "/physique-chimie/college/4eme/chimie/atomes-molecules",
    "/mathematiques/college/6eme/nombres-entiers-decimaux",
    "/outils-methodes/python-lab",
  ])
    await load(route, "DYS360 " + route);
  const prefs = await page.evaluate(() => ({
    font: getComputedStyle(document.documentElement).fontSize,
    surface: getComputedStyle(document.documentElement)
      .getPropertyValue("--ui5-surface")
      .trim(),
    reader: getComputedStyle(document.documentElement)
      .getPropertyValue("--ui5-reading")
      .trim(),
  }));
  check(prefs.font === "18.4px", "DYS actual font enlargement", prefs);
  check(prefs.surface !== "#ffffff", "DYS dark theme inherited", prefs);
  await page.locator('[data-analytics-consent="denied"]').click();
  await shot("dys360-python");
  await ctx.close();
} catch (e) {
  report.errors.push({ label: "matrix exception", detail: e.stack });
  console.error(e);
} finally {
  await browser.close();
  server.close();
  fs.writeFileSync(
    path.join(out, "matrix.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      errors: report.errors,
      consoleErrors: report.consoleErrors,
    }),
  );
  if (report.errors.length || report.consoleErrors.length) process.exitCode = 1;
}
