import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceId = "bo-cycle3-sciences-technologie-2023";
const sourceUrl = "https://www.education.gouv.fr/bo/2023/Hebdo25/MENE2314101A";
const officialTheme = "Matière, mouvement, énergie, information";

const metaPaths = [
  "src/data/chapters/college/6eme/chimie/etats-proprietes-matiere/meta.json",
  "src/data/chapters/college/6eme/chimie/masse-volume-longueur/meta.json",
  "src/data/chapters/college/6eme/chimie/melanges-solutions/meta.json",
  "src/data/chapters/college/6eme/physique/sources-formes-energie/meta.json",
  "src/data/chapters/college/6eme/physique/mouvements/meta.json",
  "src/data/chapters/college/6eme/physique/electricite/meta.json",
  "src/data/chapters/college/6eme/physique/signaux/meta.json",
  "src/data/chapters/college/6eme/physique/astronomie/meta.json",
];

function loadMeta(relativePath) {
  const raw = readFileSync(join(root, relativePath), "utf8");
  return { raw, meta: JSON.parse(raw) };
}

describe("C07 — Sciences et technologie en 6e", () => {
  it("rattache exactement les huit chapitres au BO 2023 de Sciences et technologie", () => {
    assert.equal(metaPaths.length, 8);

    for (const relativePath of metaPaths) {
      const { raw, meta } = loadMeta(relativePath);
      assert.equal(meta.niveau, "6eme", relativePath);
      assert.equal(meta.theme, officialTheme, relativePath);
      assert.match(meta.seo.meta_title, /Sciences et technologie 6e/, relativePath);
      assert.equal(meta.sources?.length, 1, relativePath);
      assert.equal(meta.sources[0].id, sourceId, relativePath);
      assert.equal(meta.sources[0].kind, "official", relativePath);
      assert.equal(meta.sources[0].url, sourceUrl, relativePath);
      assert.match(meta.sources[0].citation, /BO n° 25 du 22 juin 2023/, relativePath);
      assert.match(meta.sources[0].citation, /MENE2314101A/, relativePath);
      assert.doesNotMatch(raw, /bo-college-physique-chimie-2025/, relativePath);

      const lessonSourceIds = (meta.lessons ?? [])
        .flatMap((lesson) => lesson.blocks ?? [])
        .flatMap((block) => block.sourceIds ?? []);
      assert.ok(lessonSourceIds.length > 0, relativePath);
      assert.ok(lessonSourceIds.every((id) => id === sourceId), relativePath);
    }
  });

  it("conserve les routes canoniques historiques de la 6e", () => {
    for (const relativePath of metaPaths) {
      const { meta } = loadMeta(relativePath);
      assert.equal(
        meta.seo.canonical,
        `/college/6eme/${meta.matiere}/${meta.slug}`,
        relativePath,
      );
    }
  });

  it("documente le programme 2026 comme futur pour la 6e, pas comme programme actif 2026-2027", () => {
    const programmeDoc = readFileSync(
      join(root, "docs/programmes/6e-sciences-technologie-2026-2027.md"),
      "utf8",
    );
    assert.match(programmeDoc, /2026-2027/);
    assert.match(programmeDoc, /MENE2314101A/);
    assert.match(programmeDoc, /2027-2028/);
    assert.match(programmeDoc, /MENE2611650A/);
    assert.match(programmeDoc, /ne doit donc pas être utilisé comme programme actif/i);
  });

  it("présente publiquement la 6e comme Sciences et technologie dans l’espace Physique-Chimie", () => {
    const collegeIndex = readFileSync(join(root, "src/pages/college/index.astro"), "utf8");
    const levelIndex = readFileSync(join(root, "src/pages/college/[niveau]/index.astro"), "utf8");

    assert.match(collegeIndex, /Sciences et technologie/);
    assert.match(collegeIndex, /parcours Physique-Chimie/i);
    assert.match(levelIndex, /Sciences et technologie/);
    assert.match(levelIndex, /Matière, mouvement, énergie, information/);
    assert.match(levelIndex, /parcours Physique-Chimie/i);
  });
});
