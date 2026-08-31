import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  disciplineIdentities,
  getDisciplineFromLevelSlug,
  getPhysiqueChimieTrackFromLevelSlug,
  publicDisciplineIds,
} from "../src/data/disciplineIdentity";
import { getSubjectContextFromPath } from "../src/components/navigation/SubjectContext";

const root = process.cwd();

const files = {
  nav: path.join(root, "src/components/navigation/PublicNavigationV3.astro"),
  switcher: path.join(root, "src/components/navigation/SubjectSwitcher.astro"),
  gateCard: path.join(root, "src/components/home/SubjectGateCard.astro"),
  home: path.join(root, "src/pages/index.astro"),
  lycee: path.join(root, "src/pages/lycee/index.astro"),
  pcPortal: path.join(root, "src/pages/physique-chimie/index.astro"),
  identities: path.join(root, "src/data/disciplineIdentity.ts"),
  publicMenu: path.join(root, "src/data/publicMenu.ts"),
  tokens: path.join(root, "src/styles/tokens-v3.css"),
};

test("V3 exposes exactly two public disciplines", () => {
  assert.deepEqual([...publicDisciplineIds], ["mathematiques", "physique-chimie"]);

  for (const id of publicDisciplineIds) {
    const identity = disciplineIdentities[id];

    assert.equal(identity.id, id);
    assert.ok(identity.label.length > 3, `${id} needs a visible label`);
    assert.ok(identity.mark.length >= 1, `${id} needs a non-color symbol`);
    assert.ok(identity.microcopy.length > 12, `${id} needs explanatory microcopy`);
    assert.ok(identity.href.startsWith("/"), `${id} needs a route`);
    assert.ok(identity.accentVar.startsWith("--v3-color-discipline-"));
    assert.ok(identity.surfaceVar.endsWith("-bg"));
    assert.ok(identity.borderVar.endsWith("-border"));
  }

  assert.equal(publicDisciplineIds.includes("enseignement-scientifique"), false);
  assert.equal(disciplineIdentities["enseignement-scientifique"].href, "/lycee/1ere-ens-scientifique");
});

test("enseignement scientifique is a Physique-Chimie subject with a distinct lycée track", () => {
  assert.equal(getDisciplineFromLevelSlug("1ere-ens-scientifique"), "physique-chimie");
  assert.equal(getDisciplineFromLevelSlug("terminale-ens-scientifique"), "physique-chimie");
  assert.equal(getPhysiqueChimieTrackFromLevelSlug("1ere-ens-scientifique"), "enseignement-scientifique");
  assert.equal(getPhysiqueChimieTrackFromLevelSlug("terminale-ens-scientifique"), "enseignement-scientifique");
  assert.equal(getPhysiqueChimieTrackFromLevelSlug("1ere-spe"), "physique-chimie");

  assert.equal(getSubjectContextFromPath("/lycee/1ere-ens-scientifique").subject, "physique-chimie");
  assert.equal(getSubjectContextFromPath("/lycee/terminale-ens-scientifique").subject, "physique-chimie");
  assert.equal(
    getSubjectContextFromPath("/physique-chimie/lycee/1ere-ens-scientifique/chimie/exemple").subject,
    "physique-chimie",
  );
});

test("public navigation folds Enseignement scientifique into Physique-Chimie", () => {
  const publicMenu = readFileSync(files.publicMenu, "utf8");
  const home = readFileSync(files.home, "utf8");
  const lycee = readFileSync(files.lycee, "utf8");
  const pcPortal = readFileSync(files.pcPortal, "utf8");

  assert.match(publicMenu, /title:\s*"Physique-Chimie"/);
  assert.match(publicMenu, /1re — Enseignement scientifique/);
  assert.match(publicMenu, /Terminale — Enseignement scientifique/);
  assert.doesNotMatch(publicMenu, /discipline:\s*"enseignement-scientifique"/);

  assert.match(home, /Deux matières, une seule expérience/);
  assert.match(home, /data-subject-card=\{card\.tone === "maths" \? "mathematiques" : "physique-chimie"\}/);
  assert.doesNotMatch(home, /subject-card--science/);
  assert.match(home, /Enseignement scientifique/i);

  assert.match(lycee, /data-discipline="physique-chimie"/);
  assert.match(lycee, /data-track=\{level\.trackId\}/);
  assert.match(lycee, /La discipline parente reste Physique-Chimie/);
  assert.match(pcPortal, /Enseignement scientifique/);
});

test("a11y color review: public discipline information is never color-only", () => {
  const nav = readFileSync(files.nav, "utf8");
  const switcher = readFileSync(files.switcher, "utf8");
  const gateCard = readFileSync(files.gateCard, "utf8");
  const home = readFileSync(files.home, "utf8");
  const lycee = readFileSync(files.lycee, "utf8");
  const identities = readFileSync(files.identities, "utf8");
  const publicMenu = readFileSync(files.publicMenu, "utf8");

  assert.match(nav, /data-discipline=\{section\.discipline\}/);

  for (const id of publicDisciplineIds) {
    const identity = disciplineIdentities[id];
    const routePattern = new RegExp(identity.href.replaceAll("/", "\\/"));

    assert.match(publicMenu, new RegExp(`discipline:\\s*"${id}"`));
    assert.match(switcher, /subject-switcher__mark/);
    assert.match(gateCard, /subject-gate-card__mark/);
    assert.match(home, new RegExp(identity.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(home + publicMenu, routePattern, `${id} route should be linked from home`);
    assert.match(lycee + home + nav + switcher + gateCard + identities, new RegExp(identity.microcopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(lycee, /discipline-badge/);
  assert.match(lycee, /Enseignement scientifique/);
});

test("discipline tokens include accent, surface and border variables", () => {
  const tokens = readFileSync(files.tokens, "utf8");

  for (const identity of Object.values(disciplineIdentities).filter((item) => item.id !== "transversal")) {
    assert.match(tokens, new RegExp(identity.accentVar.replace("--", "--")));
    assert.match(tokens, new RegExp(identity.surfaceVar.replace("--", "--")));
    assert.match(tokens, new RegExp(identity.borderVar.replace("--", "--")));
  }
});
