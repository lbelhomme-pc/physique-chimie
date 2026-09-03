import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { publicMenuSections } from "../src/data/publicMenu.ts";
import {
  physiqueChimieLyceeTracks,
  physiqueChimieMainNavigation,
  physiqueChimieResourceNavigation,
} from "../src/data/physiqueChimie/navigation.ts";
import { mathematicsMainNavigation } from "../src/data/mathematiques/navigation.ts";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

describe("C10 — portail Physique-Chimie", () => {
  it("donne aux deux disciplines publiques un portail racine symetrique", () => {
    const maths = read("src/pages/mathematiques/index.astro");
    const pc = read("src/pages/physique-chimie/index.astro");

    for (const source of [maths, pc]) {
      assert.match(source, /V3LandingHero/);
      assert.match(source, /Choisir son parcours/);
      assert.match(source, /Collège ou lycée/);
    }

    assert.match(maths, /canonical="\/mathematiques"/);
    assert.match(pc, /canonical="\/physique-chimie"/);
    assert.match(maths, /subject="mathematiques"/);
    assert.match(pc, /subject="physique-chimie"/);
  });

  it("expose exactement College et Lycee comme premier niveau des deux portails", () => {
    assert.deepEqual(
      mathematicsMainNavigation.map(({ id }) => id),
      ["college", "lycee"],
    );
    assert.deepEqual(
      physiqueChimieMainNavigation.map(({ id }) => id),
      ["college", "lycee"],
    );
    assert.deepEqual(
      physiqueChimieMainNavigation.map(({ href }) => href),
      ["/college", "/lycee"],
    );
  });

  it("garde Enseignement scientifique comme parcours lycee de Physique-Chimie", () => {
    const pc = read("src/pages/physique-chimie/index.astro");
    const esTracks = physiqueChimieLyceeTracks.filter((track) => track.id.includes("ens-scientifique"));

    assert.equal(physiqueChimieLyceeTracks.length, 5);
    assert.equal(esTracks.length, 2);
    assert.ok(esTracks.every((track) => track.description.includes("rattaché à l’espace Physique-Chimie")));
    assert.match(pc, /L’Enseignement scientifique reste un parcours identifié à l’intérieur de l’espace Physique-Chimie/);
    assert.doesNotMatch(pc, /subject="enseignement-scientifique"/);
  });

  it("aligne la profondeur du menu global des deux disciplines", () => {
    const maths = publicMenuSections.find((section) => section.discipline === "mathematiques");
    const pc = publicMenuSections.find((section) => section.discipline === "physique-chimie");

    assert.ok(maths);
    assert.ok(pc);
    assert.equal(maths.href, "/mathematiques");
    assert.equal(pc.href, "/physique-chimie");
    assert.deepEqual(maths.links.map(({ label }) => label), ["Collège", "Lycée", "Méthodes"]);
    assert.deepEqual(pc.links.map(({ label }) => label), ["Collège", "Lycée", "Méthodes"]);
    assert.equal(pc.links.some(({ label }) => label.includes("Enseignement scientifique")), false);
  });

  it("centralise les ressources du portail PC sans creer de nouvelle discipline", () => {
    assert.deepEqual(
      physiqueChimieResourceNavigation.map(({ id }) => id),
      ["laboratoire", "methodes", "memorisation"],
    );
    assert.ok(physiqueChimieResourceNavigation.every(({ href }) => href.startsWith("/")));
  });

  it("conserve les routes historiques des cinq parcours lycee", () => {
    assert.deepEqual(
      physiqueChimieLyceeTracks.map(({ href }) => href),
      [
        "/lycee/2nde",
        "/lycee/1ere-spe",
        "/lycee/1ere-ens-scientifique",
        "/lycee/terminale-spe",
        "/lycee/terminale-ens-scientifique",
      ],
    );
  });
});
