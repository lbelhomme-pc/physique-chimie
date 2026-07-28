#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { JSDOM } from "jsdom";

const root = process.cwd();
const distDir = path.join(root, "dist");
const configArgIndex = process.argv.indexOf("--config");
const configPath = configArgIndex >= 0
  ? path.resolve(root, process.argv[configArgIndex + 1] ?? "")
  : path.join(root, "tests/fixtures/e2e-visual.config.json");
const capture = process.argv.includes("--capture");
const updateManifest = process.argv.includes("--update-manifest") || capture;

const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    journeys: 0,
    checks: 0,
    errors: 0,
    captures: 0,
  },
  errors: [],
  captures: [],
};

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function check(condition, message, details = {}) {
  report.summary.checks += 1;
  if (!condition) {
    report.summary.errors += 1;
    report.errors.push({ message, ...details });
  }
}

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  const clean = route.split("#")[0].split("?")[0].replace(/\/+$/, "");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

function htmlCandidatesForRoute(route) {
  const normalized = normalizeRoute(route);
  if (normalized === "/") return [path.join(distDir, "index.html")];
  const segment = normalized.slice(1);
  return [
    path.join(distDir, segment, "index.html"),
    path.join(distDir, `${segment}.html`),
  ];
}

function htmlFileForRoute(route) {
  const candidates = htmlCandidatesForRoute(route);
  return candidates.find((file) => fs.existsSync(file)) ?? candidates[0];
}

function pageText(document) {
  return (document.body?.textContent ?? "").replace(/\s+/g, " ").trim();
}

function focusableElements(document) {
  return [...document.querySelectorAll([
    "a[href]",
    "button:not([disabled])",
    "summary",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex=\"-1\"])",
  ].join(","))].filter((node) => {
    const hidden = node.getAttribute("hidden") !== null || node.getAttribute("aria-hidden") === "true";
    return !hidden;
  });
}

function verifyJourney(journey) {
  const file = htmlFileForRoute(journey.route);
  check(fs.existsSync(file), "Page E2E absente du build", { label: journey.label, route: journey.route, expected: rel(file) });
  if (!fs.existsSync(file)) return;

  const html = fs.readFileSync(file, "utf8");
  const dom = new JSDOM(html, { url: `http://127.0.0.1${journey.route}` });
  const { document } = dom.window;

  for (const selector of journey.requiredSelectors ?? []) {
    check(Boolean(document.querySelector(selector)), "Selecteur E2E absent", { label: journey.label, route: journey.route, selector });
  }

  const text = pageText(document);
  for (const expected of journey.requiredText ?? []) {
    check(text.toLowerCase().includes(expected.toLowerCase()), "Texte E2E absent", { label: journey.label, route: journey.route, expected });
  }

  if (journey.expectedRedirect) {
    const refresh = document.querySelector("meta[http-equiv]");
    const content = refresh?.getAttribute("content") ?? "";
    check(content.includes(journey.expectedRedirect), "Redirection legacy incoherente", {
      label: journey.label,
      route: journey.route,
      expected: journey.expectedRedirect,
      content,
    });
  }

  if (journey.keyboard) {
    const focusables = focusableElements(document);
    check(focusables.length >= journey.keyboard.focusableMin, "Parcours clavier trop pauvre", {
      label: journey.label,
      route: journey.route,
      count: focusables.length,
      minimum: journey.keyboard.focusableMin,
    });
    for (const selector of journey.keyboard.requiredSelectors ?? []) {
      const node = document.querySelector(selector);
      check(Boolean(node && focusables.includes(node)), "Element obligatoire absent du chemin clavier", {
        label: journey.label,
        route: journey.route,
        selector,
      });
    }
  }
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.EDGE_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json" || ext === ".webmanifest") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".woff2") return "font/woff2";
  return "application/octet-stream";
}

function prefsForProfile(profile) {
  const base = {
    theme: "light",
    fontFamily: "default",
    fontSize: "normal",
    lineHeight: "normal",
    letterSpacing: "normal",
    wordSpacing: "normal",
    textAlign: "left",
    maxLineWidth: "normal",
    readingGuide: false,
    syllableColoring: false,
    highlightLinks: false,
    reducedMotion: false,
    ttsEnabled: false,
    ttsRate: 1,
    focusMode: false,
    cursorSize: "normal",
  };

  if (profile === "dyslexia") {
    return {
      ...base,
      fontFamily: "opendyslexic",
      fontSize: "large",
      lineHeight: "large",
      letterSpacing: "large",
      wordSpacing: "large",
      maxLineWidth: "narrow",
      highlightLinks: true,
      reducedMotion: true,
    };
  }

  if (profile === "reduced-motion") {
    return {
      ...base,
      reducedMotion: true,
    };
  }

  return base;
}

function startServer() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    if (requestUrl.pathname === "/__visual_bootstrap") {
      const route = requestUrl.searchParams.get("route") ?? "/";
      const profile = requestUrl.searchParams.get("profile") ?? "dyslexia";
      const prefs = prefsForProfile(profile);
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(`<!doctype html><meta charset="utf-8"><script>localStorage.setItem("a11y_preferences", ${JSON.stringify(JSON.stringify(prefs))}); location.replace(${JSON.stringify(route)});</script>`);
      return;
    }

    const distRoot = path.resolve(distDir);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const cleanPath = pathname.replace(/^\/+/, "");
    const candidates = pathname === "/"
      ? [path.join(distDir, "index.html")]
      : path.extname(cleanPath)
        ? [path.join(distDir, cleanPath)]
        : [
            path.join(distDir, cleanPath, "index.html"),
            path.join(distDir, `${cleanPath}.html`),
          ];
    const resolved = candidates.map((file) => path.resolve(file))
      .find((file) => file.startsWith(distRoot) && fs.existsSync(file));

    if (!resolved) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType(resolved) });
    fs.createReadStream(resolved).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function browserShot(browser, url, output, viewport) {
  if (viewport.width < 500 && typeof WebSocket === "function") {
    return browserShotViaDevTools(browser, url, output, viewport);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "site-v2-visual-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${viewport.width},${viewport.height}`,
    "--virtual-time-budget=3500",
    `--screenshot=${output}`,
    url,
  ];

  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: "ignore" });
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Browser screenshot timed out for ${url}`));
    }, 45000);
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch {
        // Chrome can keep a transient lock on Windows; stale temp profiles are non-blocking for capture validity.
      }
      if (code === 0) resolve();
      else reject(new Error(`Browser screenshot failed with code ${code}`));
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function browserShotViaDevTools(browser, url, output, viewport) {
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "site-v2-visual-"));
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${Math.max(500, viewport.width)},${viewport.height}`,
    "--remote-debugging-port=0",
    "about:blank",
  ];

  const child = spawn(browser, args, { stdio: ["ignore", "ignore", "pipe"] });
  let devtoolsUrl = "";
  const timeout = setTimeout(() => child.kill("SIGTERM"), 45000);

  try {
    child.stderr.on("data", (chunk) => {
      const match = String(chunk).match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) devtoolsUrl = match[1];
    });

    for (let i = 0; i < 100 && !devtoolsUrl; i += 1) await wait(100);
    if (!devtoolsUrl) throw new Error(`Browser DevTools endpoint timed out for ${url}`);

    const devtoolsPort = new URL(devtoolsUrl).port;
    const tabs = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json`)).json();
    const page = tabs.find((tab) => tab.type === "page");
    if (!page?.webSocketDebuggerUrl) throw new Error("Browser page endpoint introuvable");

    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      }
    };
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    const send = (method, params = {}) => new Promise((resolve) => {
      const messageId = ++id;
      pending.set(messageId, resolve);
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.width < 700,
    });
    await send("Emulation.setEmulatedMedia", {
      features: [
        {
          name: "prefers-reduced-motion",
          value: viewport.profile === "reduced-motion" ? "reduce" : "no-preference",
        },
      ],
    });
    await send("Page.navigate", { url });
    await wait(3500);
    await send("Runtime.evaluate", {
      expression: "document.fonts?.ready",
      awaitPromise: true,
    });

    const screenshot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
      fromSurface: true,
    });
    if (!screenshot.result?.data) throw new Error(`Browser screenshot failed for ${url}`);
    fs.writeFileSync(output, Buffer.from(screenshot.result.data, "base64"));
    ws.close();
  } finally {
    clearTimeout(timeout);
    child.kill("SIGTERM");
    await wait(500);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // Chrome can keep a transient lock on Windows; stale temp profiles are non-blocking for capture validity.
    }
  }
}

async function runCaptures(config) {
  const browser = findBrowser();
  check(Boolean(browser), "Navigateur headless introuvable pour les captures", {});
  if (!browser) return;

  const server = await startServer();
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const outputDir = path.join(root, config.outputDir);
  const manifest = {
    generatedAt: report.generatedAt,
    browser,
    origin,
    captures: [],
  };

  try {
    for (const journey of config.journeys) {
      for (const viewport of journey.captures ?? []) {
        const suffix = `${journey.label}-${viewport.viewport}-${viewport.width}x${viewport.height}.png`;
        const output = path.join(outputDir, suffix);
        const route = normalizeRoute(journey.route);
        const url = viewport.profile
          ? `${origin}/__visual_bootstrap?route=${encodeURIComponent(route)}&profile=${encodeURIComponent(viewport.profile)}`
          : `${origin}${route}`;

        await browserShot(browser, url, output, viewport);
        const size = fs.existsSync(output) ? fs.statSync(output).size : 0;
        check(size > 10000, "Capture visuelle vide ou trop legere", {
          label: journey.label,
          viewport: viewport.viewport,
          file: rel(output),
          bytes: size,
        });
        report.summary.captures += 1;
        const entry = {
          label: journey.label,
          route: journey.route,
          viewport: viewport.viewport,
          width: viewport.width,
          height: viewport.height,
          profile: viewport.profile ?? null,
          file: rel(output),
          bytes: size,
        };
        manifest.captures.push(entry);
        report.captures.push(entry);
      }
    }
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }

  if (updateManifest) {
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

const config = readJson(configPath);
report.summary.journeys = config.journeys.length;

check(fs.existsSync(distDir), "Dossier dist absent. Lancer npm.cmd run build avant l'E2E visuel.", { dir: rel(distDir) });
check(config.journeys.some((journey) => journey.kind === "legacy"), "Aucun parcours legacy capture", {});
check(config.journeys.some((journey) => journey.captures?.some((item) => item.viewport?.startsWith("mobile"))), "Aucune capture mobile declaree", {});
check(config.journeys.some((journey) => journey.captures?.some((item) => item.profile === "dyslexia")), "Aucune capture DYS declaree", {});
if (config.requirements?.mobile360) {
  check(config.journeys.some((journey) => journey.captures?.some((item) => item.width === 360)), "Aucune capture mobile 360 declaree", {});
}
if (config.requirements?.tablet) {
  check(config.journeys.some((journey) => journey.captures?.some((item) => item.viewport === "tablet")), "Aucune capture tablette declaree", {});
}
if (config.requirements?.reducedMotion) {
  check(config.journeys.some((journey) => journey.captures?.some((item) => item.profile === "reduced-motion")), "Aucune capture reduced motion declaree", {});
}

if (fs.existsSync(distDir)) {
  for (const journey of config.journeys) verifyJourney(journey);
  if (capture) await runCaptures(config);
}

console.log(JSON.stringify(report, null, 2));

if (report.summary.errors > 0) {
  process.exit(1);
}
