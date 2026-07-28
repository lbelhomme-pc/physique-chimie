#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  activeRedirectRules,
  buildPreparedPhysicalScienceRedirectRules,
  findRedirectTargetIssues,
  getPhysicalScienceKnownRoutes,
  normalizeRoutePath,
} from "../src/config/redirects.ts";
import { auditContentContracts } from "../src/data/contentContractAudit.ts";
import {
  MEMORIZATION_CANONICAL_ROUTES,
  V3_ROUTE_STRATEGY,
} from "../src/data/contentRoutes.ts";
import {
  buildChapterContentId,
  buildCourseContentId,
  buildExerciseContentId,
  buildFlashcardContentId,
  buildFlashcardDeckContentId,
  buildLaboratoryContentId,
  buildQuizContentId,
  buildQuizQuestionContentId,
  getContentIdAliases,
  getLegacyContentIdCandidates,
  isCanonicalContentId,
  resolveContentIdAlias,
} from "../src/utils/contentIds.ts";

const root = process.cwd();
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    pcChapters: 0,
    mathChapters: 0,
    dynamicRouteFiles: 0,
    expectedPublicRoutes: 0,
    laboratoryApps: 0,
    checks: 0,
    errors: 0,
    warnings: 0,
  },
  errors: [],
  warnings: [],
  notes: [],
  routes: [],
  counts: {},
};

const requiredDynamicRouteFiles = [
  "src/pages/college/[niveau]/index.astro",
  "src/pages/college/[niveau]/[matiere]/index.astro",
  "src/pages/college/[niveau]/[matiere]/[chapitre].astro",
  "src/pages/lycee/[niveau]/index.astro",
  "src/pages/lycee/[niveau]/[matiere]/index.astro",
  "src/pages/lycee/[niveau]/[matiere]/[chapitre].astro",
  "src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro",
  "src/pages/mathematiques/college/[niveau]/index.astro",
  "src/pages/mathematiques/college/[niveau]/[chapitre].astro",
  "src/pages/mathematiques/lycee/[niveau]/index.astro",
  "src/pages/mathematiques/lycee/[niveau]/[chapitre].astro",
  "src/pages/laboratoire/[slug].astro",
  "src/pages/outils-methodes/methodes-maths-college/[fiche].astro",
  "src/pages/outils-methodes/methodes-maths-lycee/[fiche].astro",
];

const sensitiveStaticRoutes = [
  "/",
  "/college",
  "/lycee",
  "/mathematiques",
  "/mathematiques/college",
  "/mathematiques/lycee",
  "/laboratoire",
  "/outils-methodes",
  "/memorisation",
  "/memorisation/revision-du-jour",
  "/memorisation/mega-quiz",
  "/memorisation/mega-flashcards",
  "/profil",
];

function rel(file) {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function abs(file) {
  return path.join(root, file);
}

function exists(file) {
  return fs.existsSync(abs(file));
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

function readText(file) {
  return fs.readFileSync(abs(file), "utf8");
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    check(false, "JSON invalide", { file, detail: error.message });
    return null;
  }
}

function walkFiles(dir, predicate = () => true) {
  const start = abs(dir);
  if (!fs.existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) files.push(rel(full));
    }
  }
  return files.sort();
}

function normalizeArray(raw, keys) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    for (const key of keys) {
      if (Array.isArray(raw[key])) return raw[key];
    }
  }
  return null;
}

function isKebabSlug(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function uniqueValues(items) {
  return new Set(items).size === items.length;
}

function routeToPageCandidates(route) {
  if (route === "/") return ["src/pages/index.astro"];
  const clean = route.replace(/^\/|\/$/g, "");
  return [`src/pages/${clean}.astro`, `src/pages/${clean}/index.astro`];
}

function physicalScienceChapterRouteInputs() {
  return walkFiles("src/data/chapters", (file) => path.basename(file) === "meta.json")
    .map((metaFile) => {
      const parts = metaFile.split("/");
      const index = parts.indexOf("chapters");
      const [cycle, niveau, matiere, chapitre] = parts.slice(index + 1, -1);
      return { cycle, niveau, matiere, chapitre };
    })
    .filter((chapter) =>
      (chapter.cycle === "college" || chapter.cycle === "lycee") &&
      (chapter.matiere === "physique" || chapter.matiere === "chimie") &&
      Boolean(chapter.niveau && chapter.chapitre)
    );
}

function validateQuiz(raw, file, expectedChapterIds) {
  const questions = normalizeArray(raw, ["questions", "quiz"]);
  check(Array.isArray(questions), "Quiz absent ou format non reconnu", { file });
  if (!Array.isArray(questions)) return;
  warn(questions.length > 0, "Quiz vide", { file });
  const ids = [];
  questions.forEach((q, index) => {
    const context = { file, item: index };
    check(q && typeof q === "object", "Question de quiz invalide", context);
    if (!q || typeof q !== "object") return;
    check(typeof q.id === "string" && q.id.trim().length > 0, "Question de quiz sans id", context);
    if (typeof q.id === "string") ids.push(q.id);
    check(typeof q.question === "string" && q.question.trim().length > 0, "Question de quiz sans libelle", context);
    check(Array.isArray(q.choices) && q.choices.length >= 2, "Question de quiz sans choix suffisants", context);
    check(Number.isInteger(q.answer), "Question de quiz sans reponse numerique", context);
    if (Array.isArray(q.choices) && Number.isInteger(q.answer)) {
      check(q.answer >= 0 && q.answer < q.choices.length, "Reponse de quiz hors bornes", context);
    }
    if (q.chapterId !== undefined) {
      warn(expectedChapterIds.includes(q.chapterId), "chapterId de quiz different du format attendu", {
        ...context,
        chapterId: q.chapterId,
        expected: expectedChapterIds.join(" ou "),
      });
    }
  });
  check(uniqueValues(ids), "IDs de quiz dupliques dans un fichier", { file });
}

function validateFlashcards(raw, file, expectedChapterIds) {
  const cards = normalizeArray(raw, ["cards", "flashcards"]);
  check(Array.isArray(cards), "Flashcards absentes ou format non reconnu", { file });
  if (!Array.isArray(cards)) return;
  warn(cards.length > 0, "Fichier de flashcards vide", { file });
  const ids = [];
  cards.forEach((card, index) => {
    const context = { file, item: index };
    check(card && typeof card === "object", "Flashcard invalide", context);
    if (!card || typeof card !== "object") return;
    check(typeof card.id === "string" && card.id.trim().length > 0, "Flashcard sans id", context);
    if (typeof card.id === "string") ids.push(card.id);
    check(typeof (card.front ?? card.recto ?? card.question) === "string", "Flashcard sans recto/front", context);
    check(typeof (card.back ?? card.verso ?? card.answer) === "string", "Flashcard sans verso/back", context);
    if (card.chapterId !== undefined) {
      warn(expectedChapterIds.includes(card.chapterId), "chapterId de flashcard different du format attendu", {
        ...context,
        chapterId: card.chapterId,
        expected: expectedChapterIds.join(" ou "),
      });
    }
  });
  check(uniqueValues(ids), "IDs de flashcards dupliques dans un fichier", { file });
}

function validateExercises(raw, file, expectedChapterIds) {
  const exercices = normalizeArray(raw, ["exercices", "exercises"]);
  check(Array.isArray(exercices), "Exercices absents ou format non reconnu", { file });
  if (!Array.isArray(exercices)) return;
  warn(exercices.length > 0, "Fichier d'exercices vide", { file });
  const ids = [];
  exercices.forEach((exo, index) => {
    const context = { file, item: index };
    check(exo && typeof exo === "object", "Exercice invalide", context);
    if (!exo || typeof exo !== "object") return;
    check(typeof exo.id === "string" && exo.id.trim().length > 0, "Exercice sans id", context);
    if (typeof exo.id === "string") ids.push(exo.id);
    check(
      typeof (exo.consigne ?? exo.statement ?? exo.title ?? exo.titre) === "string",
      "Exercice sans consigne, statement ou titre",
      context,
    );
    warn(exo.correction !== undefined, "Exercice sans correction explicite", context);
    if (exo.chapterId !== undefined) {
      warn(expectedChapterIds.includes(exo.chapterId), "chapterId d'exercice different du format attendu", {
        ...context,
        chapterId: exo.chapterId,
        expected: expectedChapterIds.join(" ou "),
      });
    }
  });
  check(uniqueValues(ids), "IDs d'exercices dupliques dans un fichier", { file });
}

function validateCourse(file) {
  check(exists(file), "Cours MDX manquant", { file });
  if (!exists(file)) return;
  const content = readText(file);
  warn(content.trim().length > 0, "Cours MDX vide", { file });
  const fragmentMatch = content.match(/import\s+html\s+from\s+["']\.\/cours\.fragment\.html\?raw["']/);
  if (fragmentMatch) {
    const fragmentFile = path.posix.join(path.posix.dirname(file), "cours.fragment.html");
    check(exists(fragmentFile), "cours.fragment.html importe mais absent", { file, fragmentFile });
    warn(content.includes("RawHtml"), "Fragment HTML importe sans RawHtml visible", { file });
  }
}

function validatePcChapters() {
  const metaFiles = walkFiles("src/data/chapters", (file) => path.basename(file) === "meta.json");
  report.summary.pcChapters = metaFiles.length;
  const routes = [];
  for (const metaFile of metaFiles) {
    const parts = metaFile.split("/");
    const index = parts.indexOf("chapters");
    const segments = parts.slice(index + 1, -1);
    const [cycle, niveau, matiere, slug] = segments;
    const chapterDir = parts.slice(0, -1).join("/");
    const route = `/${cycle}/${niveau}/${matiere}/${slug}`;
    routes.push(route);
    report.routes.push({ kind: "pc-chapter", route, source: metaFile });

    check(segments.length === 4, "Chemin de chapitre PC invalide", { file: metaFile, segments: segments.join("/") });
    check(cycle === "college" || cycle === "lycee", "Cycle PC invalide", { file: metaFile, cycle });
    check(matiere === "physique" || matiere === "chimie", "Matiere PC invalide", { file: metaFile, matiere });
    check(isKebabSlug(slug), "Slug de chapitre PC non kebab-case strict", { file: metaFile, slug });

    const meta = readJson(metaFile);
    if (!meta) continue;
    warn(meta.slug !== undefined, "Slug meta absent ; la route repose alors uniquement sur le dossier", { file: metaFile, folderSlug: slug });
    if (meta.slug !== undefined) {
      check(meta.slug === slug, "Slug meta different du dossier", { file: metaFile, metaSlug: meta.slug, folderSlug: slug });
    }
    warn(meta.niveau === niveau, "Niveau meta different du dossier", { file: metaFile, metaNiveau: meta.niveau, folderNiveau: niveau });
    warn(meta.matiere === matiere, "Matiere meta differente du dossier", { file: metaFile, metaMatiere: meta.matiere, folderMatiere: matiere });
    check(typeof meta.title === "string" && meta.title.trim().length > 0, "Meta sans title", { file: metaFile });
    check(typeof meta.description === "string" && meta.description.trim().length > 0, "Meta sans description", { file: metaFile });
    warn(meta.seo?.canonical !== undefined, "Canonical PC absent ; fallback route utilise par la page", { file: metaFile, expected: route });
    if (meta.seo?.canonical !== undefined) {
      check(meta.seo.canonical === route, "Canonical PC different de la route publique", {
        file: metaFile,
        canonical: meta.seo.canonical,
        expected: route,
      });
    }

    validateCourse(`${chapterDir}/cours.mdx`);
    validateExercises(readJson(`${chapterDir}/exercices.json`), `${chapterDir}/exercices.json`, [`${cycle}/${niveau}/${matiere}/${slug}`]);
    validateQuiz(readJson(`${chapterDir}/quiz.json`), `${chapterDir}/quiz.json`, [`${cycle}/${niveau}/${matiere}/${slug}`]);
    validateFlashcards(readJson(`${chapterDir}/flashcards.json`), `${chapterDir}/flashcards.json`, [`${cycle}/${niveau}/${matiere}/${slug}`]);
  }
  check(uniqueValues(routes), "Routes PC dupliquees", {});
  report.counts.pcRoutes = routes.length;
}

function validateMathChapters() {
  const metaFiles = walkFiles("src/data/mathematiques/chapters", (file) => path.basename(file) === "meta.json");
  report.summary.mathChapters = metaFiles.length;
  const routes = [];
  for (const metaFile of metaFiles) {
    const parts = metaFile.split("/");
    const index = parts.indexOf("chapters");
    const segments = parts.slice(index + 1, -1);
    const [cycle, niveau, slug] = segments;
    const chapterDir = parts.slice(0, -1).join("/");
    const route = `/mathematiques/${cycle}/${niveau}/${slug}`;
    routes.push(route);
    report.routes.push({ kind: "math-chapter", route, source: metaFile });

    check(segments.length === 3, "Chemin de chapitre mathematiques invalide", { file: metaFile, segments: segments.join("/") });
    check(cycle === "college" || cycle === "lycee", "Cycle mathematiques invalide", { file: metaFile, cycle });
    check(isKebabSlug(slug), "Slug de chapitre mathematiques non kebab-case strict", { file: metaFile, slug });

    const meta = readJson(metaFile);
    if (!meta) continue;
    check(meta.slug === slug, "Slug meta mathematiques different du dossier", { file: metaFile, metaSlug: meta.slug, folderSlug: slug });
    check(meta.niveau === niveau, "Niveau meta mathematiques different du dossier", { file: metaFile, metaNiveau: meta.niveau, folderNiveau: niveau });
    check(meta.cycle === cycle, "Cycle meta mathematiques different du dossier", { file: metaFile, metaCycle: meta.cycle, folderCycle: cycle });
    check(typeof meta.title === "string" && meta.title.trim().length > 0, "Meta mathematiques sans title", { file: metaFile });
    check(typeof meta.description === "string" && meta.description.trim().length > 0, "Meta mathematiques sans description", { file: metaFile });
    check(meta.seo?.canonical === route, "Canonical mathematiques different de la route publique", {
      file: metaFile,
      canonical: meta.seo?.canonical,
      expected: route,
    });

    const routeChapterId = `mathematiques:${cycle}:${niveau}:${slug}`;
    const contentChapterId = `${cycle}/${niveau}/${slug}`;
    validateCourse(`${chapterDir}/cours.mdx`);
    validateExercises(readJson(`${chapterDir}/exercices.json`), `${chapterDir}/exercices.json`, [routeChapterId, contentChapterId]);
    validateQuiz(readJson(`${chapterDir}/quiz.json`), `${chapterDir}/quiz.json`, [routeChapterId, contentChapterId]);
    validateFlashcards(readJson(`${chapterDir}/flashcards.json`), `${chapterDir}/flashcards.json`, [routeChapterId, contentChapterId]);
  }
  check(uniqueValues(routes), "Routes mathematiques dupliquees", {});
  report.counts.mathRoutes = routes.length;
}

function validateRoutesAndGlobs() {
  for (const file of requiredDynamicRouteFiles) {
    check(exists(file), "Fichier de route dynamique manquant", { file });
    if (exists(file)) {
      report.summary.dynamicRouteFiles += 1;
      const content = readText(file);
      check(content.includes("getStaticPaths"), "Route dynamique sans getStaticPaths", { file });
    }
  }

  for (const route of sensitiveStaticRoutes) {
    const candidates = routeToPageCandidates(route);
    const file = candidates.find((candidate) => exists(candidate)) ?? candidates[0];
    check(candidates.some((candidate) => exists(candidate)), "Route statique sensible sans fichier Astro attendu", {
      route,
      candidates,
    });
    report.routes.push({ kind: "static-sensitive", route, source: file });
  }

  const criticalGlobs = [
    ["src/pages/index.astro", "/src/data/chapters/**/meta.json"],
    ["src/pages/index.astro", "/src/data/chapters/**/flashcards.json"],
    ["src/pages/index.astro", "/src/data/mathematiques/chapters/**/meta.json"],
    ["src/pages/college/[niveau]/[matiere]/[chapitre].astro", "/src/data/chapters/**/cours.mdx"],
    ["src/pages/college/[niveau]/[matiere]/[chapitre].astro", "/src/data/chapters/**/quiz.json"],
    ["src/pages/lycee/[niveau]/[matiere]/[chapitre].astro", "/src/data/chapters/**/cours.mdx"],
    ["src/pages/lycee/[niveau]/[matiere]/[chapitre].astro", "/src/data/chapters/**/flashcards.json"],
    ["src/pages/physique-chimie/[cycle]/[niveau]/[matiere]/[chapitre].astro", "/src/data/chapters/**/meta.json"],
    ["src/pages/mathematiques/college/[niveau]/[chapitre].astro", "/src/data/mathematiques/chapters/college/**/meta.json"],
    ["src/pages/mathematiques/lycee/[niveau]/[chapitre].astro", "/src/data/mathematiques/chapters/lycee/**/meta.json"],
    ["src/pages/memorisation/mega-quiz.astro", "../../data/chapters/**/quiz.json"],
    ["src/pages/memorisation/mega-flashcards.astro", "../../data/chapters/**/flashcards.json"],
  ];
  for (const [file, glob] of criticalGlobs) {
    check(exists(file) && readText(file).includes(glob), "Glob critique absent ou modifie", { file, glob });
  }
}

function parseLabApps() {
  const file = "src/data/laboratoire/apps.ts";
  check(exists(file), "Catalogue laboratoire manquant", { file });
  if (!exists(file)) return [];
  const content = readText(file);
  const appBlocks = [...content.matchAll(/\{\s*slug:\s*"([^"]+)"[\s\S]*?legacyPath:\s*"([^"]+)"[\s\S]*?status:\s*"([^"]+)"[\s\S]*?\}/g)];
  return appBlocks.map((match) => {
    const block = match[0];
    const route = block.match(/route:\s*"([^"]+)"/)?.[1] ?? "";
    const renderer = block.match(/renderer:\s*"([^"]+)"/)?.[1] ?? "generic";
    return {
      slug: match[1],
      route,
      legacyPath: match[2],
      status: match[3],
      renderer,
    };
  });
}

function parseGenericConfigKeys() {
  const file = "src/data/laboratoire/genericConfigs.ts";
  check(exists(file), "Configurations laboratoire generiques manquantes", { file });
  if (!exists(file)) return new Set();
  const content = readText(file);
  const keys = new Set();
  for (const match of content.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z0-9_-]+)):\s*\{/gm)) {
    keys.add(match[1] ?? match[2]);
  }
  return keys;
}

function validateLaboratory() {
  const apps = parseLabApps();
  const genericKeys = parseGenericConfigKeys();
  report.summary.laboratoryApps = apps.length;

  check(apps.length > 0, "Aucune application laboratoire detectee", {});
  check(uniqueValues(apps.map((app) => app.slug)), "Slugs laboratoire dupliques", {});

  for (const app of apps) {
    const route = `/laboratoire/${app.slug}`;
    report.routes.push({ kind: "laboratory", route, source: "src/data/laboratoire/apps.ts" });
    check(isKebabSlug(app.slug), "Slug laboratoire non kebab-case strict", { slug: app.slug });
    check(app.route === route, "Route laboratoire differente du slug", { slug: app.slug, route: app.route, expected: route });
    check(app.legacyPath.startsWith("laboratoire/"), "legacyPath laboratoire hors dossier legacy", {
      slug: app.slug,
      legacyPath: app.legacyPath,
    });
    check(fs.existsSync(abs(app.legacyPath)), "Fichier legacyPath laboratoire introuvable", {
      slug: app.slug,
      legacyPath: app.legacyPath,
    });
    warn(app.status === "migrated" || app.status === "pending", "Statut laboratoire inattendu", { slug: app.slug, status: app.status });
    warn(["generic", "dedicated-component", "explicit-page"].includes(app.renderer), "Renderer laboratoire inattendu", {
      slug: app.slug,
      renderer: app.renderer,
    });
    if (app.renderer === "explicit-page") {
      check(exists(`src/pages/laboratoire/${app.slug}.astro`), "Page laboratoire explicite manquante", { slug: app.slug });
    } else if (app.renderer === "generic") {
      check(genericKeys.has(app.slug), "Configuration generique laboratoire manquante", { slug: app.slug });
    }
  }
}

function validateCanonicalPages() {
  const pages = walkFiles("src/pages", (file) => file.endsWith(".astro"));
  for (const file of pages) {
    const content = readText(file);
    if (content.includes("canonical=") || content.includes("const canonical")) {
      warn(!content.includes("http://"), "Canonical potentiellement non HTTPS", { file });
    }
  }
}

function validateRedirectStrategy() {
  const pcChapters = physicalScienceChapterRouteInputs();
  const preparedPhysicalScienceRules = buildPreparedPhysicalScienceRedirectRules(pcChapters);
  const rules = [...activeRedirectRules, ...preparedPhysicalScienceRules];
  const availableRoutes = new Set([
    ...sensitiveStaticRoutes,
    V3_ROUTE_STRATEGY.notFoundRoute,
    ...Object.values(MEMORIZATION_CANONICAL_ROUTES),
    ...getPhysicalScienceKnownRoutes(pcChapters),
    ...report.routes.map((item) => item.route),
  ].map(normalizeRoutePath));
  const issues = findRedirectTargetIssues(rules, availableRoutes);

  check(exists("src/pages/404.astro"), "Page 404 manquante", { file: "src/pages/404.astro" });
  check(V3_ROUTE_STRATEGY.physicalScienceCanonicalMode === "explicit", "Strategie canonique PC V3 inattendue", {
    expected: "explicit",
    actual: V3_ROUTE_STRATEGY.physicalScienceCanonicalMode,
  });
  check(preparedPhysicalScienceRules.length === pcChapters.length, "Nombre de redirections PC preparees divergent", {
    expected: pcChapters.length,
    actual: preparedPhysicalScienceRules.length,
  });

  for (const rule of preparedPhysicalScienceRules) {
    check(availableRoutes.has(normalizeRoutePath(rule.from)), "Route legacy PC absente avant activation de redirection", {
      from: rule.from,
      to: rule.to,
    });
    check(rule.phase === "prepared", "Redirection PC activee trop tot", {
      from: rule.from,
      to: rule.to,
      phase: rule.phase,
    });
  }

  for (const issue of issues) {
    check(false, "Redirection sans cible valide", issue);
  }

  report.counts.redirects = {
    active: activeRedirectRules.length,
    preparedPhysicalScience: preparedPhysicalScienceRules.length,
    targetIssues: issues.length,
    notFoundRoute: V3_ROUTE_STRATEGY.notFoundRoute,
  };
  report.notes.push({
    message: `Redirections verifiees : ${activeRedirectRules.length} actives, ${preparedPhysicalScienceRules.length} preparees, ${issues.length} cible manquante`,
  });
}

function validateContentIdAliases() {
  const startChecks = report.summary.checks;
  const cases = [
    {
      canonicalId: "physique-chimie:college:4eme:chimie:atomes-molecules",
      expectedAliases: ["college/4eme/chimie/atomes-molecules"],
      expectedPrefix: "physique-chimie:",
    },
    {
      canonicalId: "physique-chimie:college:4eme:physique:mouvement-vitesse",
      expectedAliases: ["college/4eme/physique/mouvement-vitesse"],
      expectedPrefix: "physique-chimie:",
    },
    {
      canonicalId: "physique-chimie:lycee:terminale-spe:chimie:acide-base-ph",
      expectedAliases: ["lycee/terminale-spe/chimie/acide-base-ph"],
      expectedPrefix: "physique-chimie:",
    },
    {
      canonicalId: "physique-chimie:college:4eme:chimie:atomes-molecules:flashcard:atom-mol-fc-1",
      expectedAliases: ["college/4eme/chimie/atomes-molecules::atom-mol-fc-1"],
      expectedPrefix: "physique-chimie:",
    },
    {
      canonicalId: "mathematiques:college:4eme:calcul-litteral",
      expectedAliases: [],
      expectedPrefix: "mathematiques:",
    },
    {
      canonicalId: "laboratoire:titrage-ph-metrique",
      expectedAliases: [],
      expectedPrefix: "laboratoire:",
    },
  ];

  const aliasOwners = new Map();
  const canonicalIds = cases.map((item) => item.canonicalId);
  check(uniqueValues(canonicalIds), "IDs canoniques contentIds dupliques dans les cas de verification", {});

  for (const item of cases) {
    const context = { canonicalId: item.canonicalId };
    let aliases = [];
    let candidates = [];

    try {
      aliases = Array.from(getContentIdAliases(item.canonicalId));
      candidates = Array.from(getLegacyContentIdCandidates(item.canonicalId));
    } catch (error) {
      check(false, "Exception pendant la resolution des alias contentIds", {
        ...context,
        detail: error.message,
      });
      continue;
    }

    check(typeof item.canonicalId === "string" && item.canonicalId.length > 0, "ID canonique contentIds vide", context);
    check(!item.canonicalId.includes("/"), "ID canonique contentIds contenant un slash", context);
    check(item.canonicalId.includes(":"), "ID canonique contentIds sans separateur deux-points", context);
    check(item.canonicalId.startsWith(item.expectedPrefix), "Prefixe contentIds inattendu", {
      ...context,
      expectedPrefix: item.expectedPrefix,
    });
    check(isCanonicalContentId(item.canonicalId), "ID contentIds non reconnu comme canonique", context);
    check(resolveContentIdAlias(item.canonicalId) === item.canonicalId, "ID canonique contentIds non stable a la resolution", context);
    check(Array.isArray(aliases), "getContentIdAliases ne retourne pas une liste", context);
    check(Array.isArray(candidates), "getLegacyContentIdCandidates ne retourne pas une liste", context);
    check(
      aliases.length === candidates.length && aliases.every((alias, index) => alias === candidates[index]),
      "Alias contentIds et candidats legacy divergents",
      context,
    );

    for (const expectedAlias of item.expectedAliases) {
      check(aliases.includes(expectedAlias), "Alias contentIds attendu absent", {
        ...context,
        expectedAlias,
        aliases,
      });
    }

    for (const alias of aliases) {
      const aliasContext = { ...context, alias };
      check(typeof alias === "string" && alias.trim().length > 0, "Alias contentIds vide", aliasContext);
      check(resolveContentIdAlias(alias) === item.canonicalId, "Alias contentIds ne se resout pas vers son canonique", aliasContext);

      const owner = aliasOwners.get(alias);
      check(!owner || owner === item.canonicalId, "Alias contentIds associe a plusieurs canoniques", {
        ...aliasContext,
        firstCanonicalId: owner,
      });
      aliasOwners.set(alias, item.canonicalId);
    }
  }

  const unknownId = "id-inconnu-test";
  check(resolveContentIdAlias(unknownId) === unknownId, "ID contentIds inconnu modifie par resolveContentIdAlias", {
    id: unknownId,
  });

  report.counts.contentIdAliasChecks = report.summary.checks - startChecks;
  report.notes.push({
    message: `Alias contentIds verifies : ${report.counts.contentIdAliasChecks} controles, 0 erreur, 0 avertissement`,
  });
}

function validateContentContracts() {
  const contentAudit = auditContentContracts(root);
  report.counts.contentContract = contentAudit.summary;

  check(contentAudit.summary.chapters === 112, "Nombre de chapitres du contrat de contenu inattendu", {
    expected: 112,
    actual: contentAudit.summary.chapters,
  });
  check(contentAudit.summary.pcChapters === report.summary.pcChapters, "Nombre de chapitres PC divergent dans le contrat", {
    expected: report.summary.pcChapters,
    actual: contentAudit.summary.pcChapters,
  });
  check(contentAudit.summary.mathChapters === report.summary.mathChapters, "Nombre de chapitres mathematiques divergent dans le contrat", {
    expected: report.summary.mathChapters,
    actual: contentAudit.summary.mathChapters,
  });
  check(contentAudit.summary.bloquants === 0, "Contrat de contenu avec chapitre bloquant", {
    bloquants: contentAudit.summary.bloquants,
  });

  for (const error of contentAudit.errors) {
    check(false, "Erreur de contrat de contenu", { detail: error });
  }

  report.notes.push({
    message: `Contrat contenu commun : ${contentAudit.summary.chapters} chapitres, ${contentAudit.summary.conformes} conformes, ${contentAudit.summary.adaptes} adaptes, ${contentAudit.summary.incompletsPubliables} incomplets publiables, ${contentAudit.summary.bloquants} bloquant`,
  });
}

function validateCanonicalResourceIds() {
  const startChecks = report.summary.checks;
  const owners = new Map();

  function add(id, context) {
    check(typeof id === "string" && id.length > 0, "ID canonique de ressource vide", context);
    check(!id.includes("/"), "ID canonique de ressource contenant un slash", { ...context, id });
    check(id.includes(":"), "ID canonique de ressource sans separateur deux-points", { ...context, id });
    check(isCanonicalContentId(id), "ID canonique de ressource hors espace connu", { ...context, id });
    const owner = owners.get(id);
    check(!owner, "Collision d'ID canonique de ressource", {
      ...context,
      id,
      firstOwner: owner,
    });
    owners.set(id, context.file ?? context.source ?? context.kind ?? "unknown");
  }

  for (const metaFile of walkFiles("src/data/chapters", (file) => path.basename(file) === "meta.json")) {
    const parts = metaFile.split("/");
    const index = parts.indexOf("chapters");
    const [cycle, niveau, matiere, slug] = parts.slice(index + 1, -1);
    if ((cycle !== "college" && cycle !== "lycee") || !matiere || !slug) continue;
    const chapter = buildChapterContentId({
      discipline: "physique-chimie",
      cycle,
      niveau,
      matiere,
      chapitre: slug,
    });
    const chapterDir = parts.slice(0, -1).join("/");
    add(chapter, { file: metaFile, kind: "chapter" });
    add(buildCourseContentId({ chapter }), { file: `${chapterDir}/cours.mdx`, kind: "course" });
    add(buildQuizContentId({ chapter }), { file: `${chapterDir}/quiz.json`, kind: "quiz" });
    add(buildFlashcardDeckContentId({ chapter }), { file: `${chapterDir}/flashcards.json`, kind: "flashcard-deck" });

    for (const item of normalizeArray(readJson(`${chapterDir}/exercices.json`), ["exercices", "exercises"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildExerciseContentId({ chapter, exerciseId: item.id }), { file: `${chapterDir}/exercices.json`, kind: "exercise", localId: item.id });
      }
    }
    for (const item of normalizeArray(readJson(`${chapterDir}/quiz.json`), ["questions", "quiz"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildQuizQuestionContentId({ chapter, questionId: item.id }), { file: `${chapterDir}/quiz.json`, kind: "quiz-question", localId: item.id });
      }
    }
    for (const item of normalizeArray(readJson(`${chapterDir}/flashcards.json`), ["cards", "flashcards"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildFlashcardContentId({ chapter, flashcardId: item.id }), { file: `${chapterDir}/flashcards.json`, kind: "flashcard", localId: item.id });
      }
    }
  }

  for (const metaFile of walkFiles("src/data/mathematiques/chapters", (file) => path.basename(file) === "meta.json")) {
    const parts = metaFile.split("/");
    const index = parts.indexOf("chapters");
    const [cycle, niveau, slug] = parts.slice(index + 1, -1);
    if ((cycle !== "college" && cycle !== "lycee") || !slug) continue;
    const chapter = buildChapterContentId({
      discipline: "mathematiques",
      cycle,
      niveau,
      chapitre: slug,
    });
    const chapterDir = parts.slice(0, -1).join("/");
    add(chapter, { file: metaFile, kind: "chapter" });
    add(buildCourseContentId({ chapter }), { file: `${chapterDir}/cours.mdx`, kind: "course" });
    add(buildQuizContentId({ chapter }), { file: `${chapterDir}/quiz.json`, kind: "quiz" });
    add(buildFlashcardDeckContentId({ chapter }), { file: `${chapterDir}/flashcards.json`, kind: "flashcard-deck" });

    for (const item of normalizeArray(readJson(`${chapterDir}/exercices.json`), ["exercices", "exercises"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildExerciseContentId({ chapter, exerciseId: item.id }), { file: `${chapterDir}/exercices.json`, kind: "exercise", localId: item.id });
      }
    }
    for (const item of normalizeArray(readJson(`${chapterDir}/quiz.json`), ["questions", "quiz"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildQuizQuestionContentId({ chapter, questionId: item.id }), { file: `${chapterDir}/quiz.json`, kind: "quiz-question", localId: item.id });
      }
    }
    for (const item of normalizeArray(readJson(`${chapterDir}/flashcards.json`), ["cards", "flashcards"]) ?? []) {
      if (item && typeof item === "object" && typeof item.id === "string") {
        add(buildFlashcardContentId({ chapter, flashcardId: item.id }), { file: `${chapterDir}/flashcards.json`, kind: "flashcard", localId: item.id });
      }
    }
  }

  for (const app of parseLabApps()) {
    add(buildLaboratoryContentId({ slug: app.slug, kind: "simulation" }), { source: "src/data/laboratoire/apps.ts", kind: "laboratory", slug: app.slug });
  }

  report.counts.canonicalResourceIds = owners.size;
  report.counts.canonicalResourceIdChecks = report.summary.checks - startChecks;
  report.notes.push({
    message: `IDs canoniques de ressources verifies : ${owners.size} IDs, ${report.counts.canonicalResourceIdChecks} controles`,
  });
}

function validatePackageAndInventory() {
  check(exists("INVENTAIRE_CHEMINS_CANONIQUES.md"), "Inventaire de reference manquant", {
    file: "INVENTAIRE_CHEMINS_CANONIQUES.md",
  });
  const pkg = readJson("package.json");
  const allowedBuildScripts = ["astro build", "cross-env ASTRO_TELEMETRY_DISABLED=1 astro build"];
  check(allowedBuildScripts.includes(pkg?.scripts?.build), "Script build inattendu", {
    file: "package.json",
    build: pkg?.scripts?.build,
    expected: allowedBuildScripts,
  });
}

function main() {
  validatePackageAndInventory();
  validateRoutesAndGlobs();
  validatePcChapters();
  validateMathChapters();
  validateLaboratory();
  validateCanonicalPages();
  validateRedirectStrategy();
  validateContentIdAliases();
  validateContentContracts();
  validateCanonicalResourceIds();

  report.summary.expectedPublicRoutes = new Set(report.routes.map((item) => item.route)).size;
  const exitCode = report.summary.errors > 0 ? 1 : 0;
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = exitCode;
}

main();
