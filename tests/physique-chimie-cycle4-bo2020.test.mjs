import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const SOURCE_ID = "bo-cycle4-physique-chimie-2020";
const SOURCE_URL = "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm";
const LEGACY_SOURCE_ID = "bo-college-physique-chimie-2025";
const levels = ["5eme", "4eme", "3eme"];
const matieres = ["chimie", "physique"];

function discoverMetaFiles() {
  const files = [];
  for (const niveau of levels) {
    for (const matiere of matieres) {
      const subjectDir = path.join(root, "src/data/chapters/college", niveau, matiere);
      for (const entry of readdirSync(subjectDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const file = path.join(subjectDir, entry.name, "meta.json");
        if (existsSync(file)) files.push({ niveau, matiere, slug: entry.name, file });
      }
    }
  }
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

function load(record) {
  const raw = readFileSync(record.file, "utf8");
  return { raw, meta: JSON.parse(raw) };
}

describe("C08 — sources officielles Physique-Chimie cycle 4", () => {
  it("couvre exactement les 29 chapitres publies de 5e, 4e et 3e", () => {
    const files = discoverMetaFiles();
    assert.equal(files.length, 29);
    assert.equal(files.filter(({ niveau }) => niveau === "5eme").length, 8);
    assert.equal(files.filter(({ niveau }) => niveau === "4eme").length, 9);
    assert.equal(files.filter(({ niveau }) => niveau === "3eme").length, 12);
  });

  it("rattache chaque meta.json au BO n° 31 du 30 juillet 2020", () => {
    for (const record of discoverMetaFiles()) {
      const { raw, meta } = load(record);
      assert.equal(meta.sources?.length, 1, record.file);
      const source = meta.sources[0];
      assert.equal(source.id, SOURCE_ID, record.file);
      assert.equal(source.kind, "official", record.file);
      assert.equal(source.url, SOURCE_URL, record.file);
      assert.match(source.label, /BO n° 31 du 30 juillet 2020/, record.file);
      assert.match(source.label, /Physique-Chimie, cycle 4/, record.file);
      assert.match(source.citation, /arrêté du 17 juillet 2020/, record.file);
      assert.match(source.citation, /J\.O\. du 28 juillet 2020/, record.file);
      assert.match(source.citation, /MENE2018714A/, record.file);
      assert.doesNotMatch(raw, new RegExp(LEGACY_SOURCE_ID), record.file);
    }
  });

  it("utilise la meme source officielle dans tous les blocs de lecon du cycle 4", () => {
    for (const record of discoverMetaFiles()) {
      const { meta } = load(record);
      const blocks = (meta.lessons ?? []).flatMap((lesson) => lesson.blocks ?? []);
      assert.ok(blocks.length > 0, record.file);
      for (const block of blocks) {
        assert.ok(block.sourceIds?.includes(SOURCE_ID), `${record.file}/${block.id}`);
        assert.ok(!block.sourceIds?.includes(LEGACY_SOURCE_ID), `${record.file}/${block.id}`);
      }
    }
  });

  it("conserve les routes canoniques et la taxonomie des chapitres", () => {
    for (const record of discoverMetaFiles()) {
      const { meta } = load(record);
      assert.equal(meta.niveau, record.niveau, record.file);
      assert.equal(meta.matiere, record.matiere, record.file);
      assert.equal(meta.slug, record.slug, record.file);
      assert.equal(
        meta.seo?.canonical,
        `/college/${record.niveau}/${record.matiere}/${record.slug}`,
        record.file,
      );
    }
  });

  it("laisse intact le referentiel Sciences et technologie de 6e etabli par C07", () => {
    const file = path.join(
      root,
      "src/data/chapters/college/6eme/chimie/etats-proprietes-matiere/meta.json",
    );
    const sixieme = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(sixieme.sources?.[0]?.id, "bo-cycle3-sciences-technologie-2023");
    assert.notEqual(sixieme.sources?.[0]?.id, SOURCE_ID);
  });
});
