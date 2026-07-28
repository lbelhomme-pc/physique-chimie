import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const navFile = path.join(root, "src/components/navigation/PublicNavigationV3.astro");
const layoutFile = path.join(root, "src/layouts/BaseLayout.astro");
const disciplineIdentityFile = path.join(root, "src/data/disciplineIdentity.ts");

const expectedRouteFiles = {
  "/college": "src/pages/college/index.astro",
  "/lycee": "src/pages/lycee/index.astro",
  "/mathematiques": "src/pages/mathematiques/index.astro",
  "/laboratoire": "src/pages/laboratoire.astro",
  "/outils-methodes": "src/pages/outils-methodes.astro",
  "/memorisation": "src/pages/memorisation/index.astro",
  "/profil": "src/pages/profil.astro",
};

test("BaseLayout uses the public navigation V3 component", () => {
  const source = readFileSync(layoutFile, "utf8");

  assert.match(source, /PublicNavigationV3/);
  assert.doesNotMatch(source, /<header class="site-header"/);
  assert.doesNotMatch(source, /isActive\("/);
});

test("public navigation exposes the expected public routes", () => {
  const source = `${readFileSync(navFile, "utf8")}\n${readFileSync(disciplineIdentityFile, "utf8")}`;

  for (const route of Object.keys(expectedRouteFiles)) {
    assert.match(source, new RegExp(`href:\\s*"${route.replace("/", "\\/")}"|href="${route.replace("/", "\\/")}`), `missing ${route}`);
  }
});

test("public navigation links point to existing route entrypoints", () => {
  for (const [route, file] of Object.entries(expectedRouteFiles)) {
    assert.ok(existsSync(path.join(root, file)), `${route} should have ${file}`);
  }
});

test("public navigation supports keyboard and screen reader basics", () => {
  const source = readFileSync(navFile, "utf8");

  assert.match(source, /href="#main-content"/);
  assert.match(source, /aria-label="Navigation publique V3"/);
  assert.match(source, /<details class="public-nav__menu">/);
  assert.match(source, /<summary aria-label=/);
  assert.match(source, /:focus-visible/);
});

test("public navigation covers V3 information architecture", () => {
  const source = readFileSync(navFile, "utf8");

  for (const label of ["Matières", "Niveaux", "Ressources", "Recherche", "Labo", "Compte"]) {
    assert.match(source, new RegExp(label), `missing ${label}`);
  }

  for (const route of ["/#recherche", "/outils-methodes/kit-scientifique", "/outils-methodes/tableau-periodique"]) {
    assert.match(source, new RegExp(route.replaceAll("/", "\\/").replace("#", "\\#")), `missing ${route}`);
  }
});
