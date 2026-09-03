import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const c19Mapping = readJson("src/data/mathematiques/programmes/cycle4-5e-2026.mapping.json");
const c19StagedChapters = new Set(c19Mapping.chapters ?? []);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function walkFiles(dir, name) {
  const start = path.join(root, dir);
  if (!fs.existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === name) files.push(path.relative(root, full).replaceAll(path.sep, "/"));
    }
  }
  return files.sort();
}

function listChapterDirs(rootDir) {
  return walkFiles(rootDir, "meta.json").map((file) => file.replace(/\/meta\.json$/, ""));
}

function asArray(raw, key) {
  return Array.isArray(raw) ? raw : raw[key] ?? [];
}

function isC19StagedMath5e(dir) {
  if (!dir.startsWith("src/data/mathematiques/chapters/college/5eme/")) return false;
  const meta = readJson(`${dir}/meta.json`);
  return (
    c19Mapping.mission === "C19" &&
    c19Mapping.c19Contract?.publicLevelStatus === "planned" &&
    c19Mapping.c19Contract?.quiz === false &&
    c19Mapping.c19Contract?.flashcards === false &&
    meta.niveau === "5eme" &&
    meta.seo?.noindex === true &&
    c19StagedChapters.has(meta.slug)
  );
}

test("all chapter resource families keep their required schema files", () => {
  const chapterDirs = [
    ...listChapterDirs("src/data/chapters"),
    ...listChapterDirs("src/data/mathematiques/chapters"),
  ];

  assert.ok(chapterDirs.length >= 100);

  for (const dir of chapterDirs) {
    const meta = readJson(`${dir}/meta.json`);
    assert.equal(typeof meta.title, "string", `${dir}: title`);
    assert.equal(typeof meta.slug, "string", `${dir}: slug`);
    assert.equal(typeof meta.niveau, "string", `${dir}: niveau`);
    assert.ok(meta.seo && typeof meta.seo.canonical === "string", `${dir}: seo.canonical`);

    for (const name of ["exercices.json", "quiz.json", "flashcards.json"]) {
      assert.ok(fs.existsSync(path.join(root, dir, name)), `${dir}: ${name}`);
    }
    assert.ok(
      fs.existsSync(path.join(root, dir, "cours.mdx")) || fs.existsSync(path.join(root, dir, "cours.fragment.html")),
      `${dir}: course body`,
    );
  }
});

test("quiz, flashcard and exercise ids are unique inside each chapter", () => {
  for (const dir of [...listChapterDirs("src/data/chapters"), ...listChapterDirs("src/data/mathematiques/chapters")]) {
    const quiz = asArray(readJson(`${dir}/quiz.json`), "questions");
    const cards = asArray(readJson(`${dir}/flashcards.json`), "cards");
    const exercices = asArray(readJson(`${dir}/exercices.json`), "exercices");
    const stagedC19 = isC19StagedMath5e(dir);

    for (const [kind, items] of [["quiz", quiz], ["flashcards", cards], ["exercices", exercices]]) {
      assert.ok(Array.isArray(items), `${dir}: ${kind} array`);
      const deferredByC19 = stagedC19 && (kind === "quiz" || kind === "flashcards");
      if (deferredByC19) {
        assert.equal(items.length, 0, `${dir}: ${kind} must remain deferred to C20`);
      } else {
        assert.ok(items.length > 0, `${dir}: ${kind} not empty`);
      }
      const ids = items.map((item) => item.id);
      assert.equal(new Set(ids).size, ids.length, `${dir}: duplicated ${kind} ids`);
      assert.ok(ids.every((id) => typeof id === "string" && id.trim()), `${dir}: valid ${kind} ids`);
    }
  }
});

test("laboratory app data references stable routes and legacy paths", async () => {
  const { labApps } = await import("../src/data/laboratoire/apps.ts");
  assert.ok(labApps.length >= 20);

  for (const app of labApps) {
    assert.equal(app.route, `/laboratoire/${app.slug}`);
    assert.equal(typeof app.title, "string");
    assert.ok(["physique", "chimie"].includes(app.theme));
    assert.ok(Array.isArray(app.tags) && app.tags.length > 0);
    assert.equal(typeof app.legacyPath, "string");
  }
});
