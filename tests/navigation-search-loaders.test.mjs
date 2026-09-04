import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getMathematicsChapterId,
  getMathematicsChapterPath,
  getMathematicsLevelPath,
} from "../src/data/mathematiques/paths.ts";
import { getPublishedMathematicsLevels } from "../src/data/contentRoutes.ts";
import { getMathematicsLevelsByCycle } from "../src/data/mathematiques/levels.ts";
import { chapterEntryFromGlob } from "../src/data/mathematiques/content.ts";

const root = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function walkMeta(rootDir) {
  const start = path.join(root, rootDir);
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === "meta.json") files.push(path.relative(root, full).replaceAll(path.sep, "/"));
    }
  }
  return files.sort();
}

function loadPhysicalScienceChapters() {
  return walkMeta("src/data/chapters").map((file) => {
    const meta = readJson(file);
    const [cycle, niveau, matiere, chapitre] = file.replace("src/data/chapters/", "").replace("/meta.json", "").split("/");
    return {
      id: `${cycle}/${niveau}/${matiere}/${chapitre}`,
      title: meta.title,
      slug: chapitre,
      niveau,
      matiere,
      description: meta.description,
      keywords: meta.keywords ?? [],
      order: meta.order ?? 999,
      path: `/${cycle}/${niveau}/${matiere}/${chapitre}`,
    };
  });
}

function loadPublishedMathematicsChapters() {
  const chapters = walkMeta("src/data/mathematiques/chapters")
    .map((file) => chapterEntryFromGlob(`/${file}`, { default: readJson(file) }))
    .filter(Boolean);
  const publishedLevels = [
    ...getPublishedMathematicsLevels(getMathematicsLevelsByCycle("college"), chapters),
    ...getPublishedMathematicsLevels(getMathematicsLevelsByCycle("lycee"), chapters),
  ];
  const publishedLevelKeys = new Set(publishedLevels.map((level) => `${level.cycle}:${level.slug}`));
  return chapters
    .filter((chapter) => publishedLevelKeys.has(`${chapter.cycle}:${chapter.niveau}`))
    .map((chapter) => ({
      id: getMathematicsChapterId(chapter.cycle, chapter.niveau, chapter.slug),
      title: chapter.title,
      slug: chapter.slug,
      niveau: chapter.niveau,
      matiere: "mathematiques",
      description: chapter.description,
      keywords: chapter.tags ?? [],
      path: chapter.path,
    }));
}

function searchChapters(chapters, query) {
  const q = query.toLowerCase();
  return chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(q) ||
    chapter.slug.toLowerCase().includes(q) ||
    chapter.matiere.toLowerCase().includes(q) ||
    (chapter.description ?? "").toLowerCase().includes(q) ||
    (chapter.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(q)),
  );
}

function chapterSiblings(chapters, id) {
  const current = chapters.find((chapter) => chapter.id === id);
  assert.ok(current, `Current chapter missing: ${id}`);
  const siblings = chapters
    .filter((chapter) => chapter.niveau === current.niveau && chapter.matiere === current.matiere && chapter.id.startsWith(id.split("/").slice(0, 3).join("/")))
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const index = siblings.findIndex((chapter) => chapter.id === id);
  return {
    previous: siblings[index - 1] ?? null,
    current: siblings[index],
    next: siblings[index + 1] ?? null,
  };
}

test("mathematics path helpers keep stable public routes and ids", () => {
  assert.equal(getMathematicsLevelPath("lycee", "2nde"), "/mathematiques/lycee/2nde");
  assert.equal(getMathematicsChapterPath("lycee", "2nde", "fonctions-generalites"), "/mathematiques/lycee/2nde/fonctions-generalites");
  assert.equal(getMathematicsChapterId("lycee", "2nde", "fonctions-generalites"), "mathematiques:lycee:2nde:fonctions-generalites");
});

test("chapter loaders expose route-ready chapter records", () => {
  const chapters = loadPhysicalScienceChapters();
  assert.ok(chapters.length >= 100);
  const target = chapters.find((chapter) => chapter.id === "college/4eme/chimie/atomes-molecules");
  assert.ok(target);
  assert.equal(target.path, "/college/4eme/chimie/atomes-molecules");
  assert.equal(target.slug, "atomes-molecules");
});

test("previous and next navigation remains order-based inside a subject", () => {
  const chapters = loadPhysicalScienceChapters();
  const nav = chapterSiblings(chapters, "college/4eme/chimie/atomes-molecules");

  assert.equal(nav.previous?.id, "college/4eme/chimie/solubilite");
  assert.equal(nav.current.id, "college/4eme/chimie/atomes-molecules");
  assert.equal(nav.next?.id, "college/4eme/chimie/reactifs-produits-conservation");
});

test("search corpus finds chapters by title, slug, subject and keywords", () => {
  const chapters = loadPhysicalScienceChapters();
  assert.ok(searchChapters(chapters, "atomes").some((chapter) => chapter.id === "college/4eme/chimie/atomes-molecules"));
  assert.ok(searchChapters(chapters, "vitesse").some((chapter) => chapter.id.includes("mouvement-vitesse")));
  assert.ok(searchChapters(chapters, "chimie").length > 20);
});

test("search corpus includes published mathematics chapters without planned levels", () => {
  const mathematicsChapters = loadPublishedMathematicsChapters();
  assert.ok(mathematicsChapters.length > 0);
  assert.ok(searchChapters(mathematicsChapters, "fonctions").some((chapter) => chapter.id.startsWith("mathematiques:lycee:2nde:")));
  assert.ok(searchChapters(mathematicsChapters, "fractions").some((chapter) => chapter.id.startsWith("mathematiques:college:5eme:")));
  assert.ok(searchChapters(mathematicsChapters, "produit scalaire").some((chapter) => chapter.id.startsWith("mathematiques:lycee:1ere-specialite-mathematiques:")));
  assert.deepEqual([...new Set(mathematicsChapters.map((chapter) => chapter.niveau))], ["5eme", "1ere-ens-scientifique", "1ere-specialite-mathematiques", "2nde"]);
});
