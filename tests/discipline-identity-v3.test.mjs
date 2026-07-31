import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  disciplineIdentities,
  getDisciplineFromLevelSlug,
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
  identities: path.join(root, "src/data/disciplineIdentity.ts"),
  publicMenu: path.join(root, "src/data/publicMenu.ts"),
  tokens: path.join(root, "src/styles/tokens-v3.css"),
};

test("V3 exposes three public discipline identities", () => {
  assert.deepEqual([...publicDisciplineIds], [
    "mathematiques",
    "physique-chimie",
    "enseignement-scientifique",
  ]);

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
});

test("enseignement scientifique is routed as its own subject context", () => {
  assert.equal(getDisciplineFromLevelSlug("1ere-ens-scientifique"), "enseignement-scientifique");
  assert.equal(getDisciplineFromLevelSlug("terminale-ens-scientifique"), "enseignement-scientifique");
  assert.equal(getSubjectContextFromPath("/lycee/1ere-ens-scientifique").subject, "enseignement-scientifique");
  assert.equal(getSubjectContextFromPath("/lycee/terminale-ens-scientifique").subject, "enseignement-scientifique");
  assert.equal(
    getSubjectContextFromPath("/physique-chimie/lycee/1ere-ens-scientifique/chimie/exemple").subject,
    "enseignement-scientifique",
  );
});

test("a11y color review: discipline information is never color-only", () => {
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
  assert.doesNotMatch(lycee, /sous-rubrique de physique-chimie/i);
});

test("discipline tokens include accent, surface and border variables", () => {
  const tokens = readFileSync(files.tokens, "utf8");

  for (const identity of Object.values(disciplineIdentities).filter((item) => item.id !== "transversal")) {
    assert.match(tokens, new RegExp(identity.accentVar.replace("--", "--")));
    assert.match(tokens, new RegExp(identity.surfaceVar.replace("--", "--")));
    assert.match(tokens, new RegExp(identity.borderVar.replace("--", "--")));
  }
});
