import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const navFile = path.join(root, "src/components/navigation/PublicNavigationV3.astro");
const menuFile = path.join(root, "src/data/publicMenu.ts");
const layoutFile = path.join(root, "src/layouts/BaseLayout.astro");
const disciplineIdentityFile = path.join(root, "src/data/disciplineIdentity.ts");
const pcPortalFile = path.join(root, "src/pages/physique-chimie/index.astro");
const pcNavigationFile = path.join(root, "src/data/physiqueChimie/navigation.ts");

const expectedRouteFiles = {
  "/college": "src/pages/college/index.astro",
  "/lycee": "src/pages/lycee/index.astro",
  "/mathematiques": "src/pages/mathematiques/index.astro",
  "/physique-chimie": "src/pages/physique-chimie/index.astro",
  "/laboratoire": "src/pages/laboratoire.astro",
  "/outils-methodes": "src/pages/outils-methodes.astro",
  "/memorisation": "src/pages/memorisation/index.astro",
  "/profil": "src/pages/profil.astro",
};

test("BaseLayout uses the shared public navigation component", () => {
  const source = readFileSync(layoutFile, "utf8");

  assert.match(source, /PublicNavigationV3/);
  assert.doesNotMatch(source, /<header class="site-header"/);
  assert.doesNotMatch(source, /isActive\("/);
});

test("public navigation exposes the expected public routes", () => {
  const source = `${readFileSync(navFile, "utf8")}\n${readFileSync(menuFile, "utf8")}\n${readFileSync(disciplineIdentityFile, "utf8")}`;

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
  assert.match(source, /aria-label="Navigation principale"/);
  assert.match(source, /class="ui5-nav__menu"/);
  assert.match(source, /<summary class:list=/);
  assert.match(readFileSync(path.join(root, "src/ui-v5/index.css"), "utf8"), /:focus-visible/);
});

test("public navigation covers V4 information architecture", () => {
  const globalSource = `${readFileSync(navFile, "utf8")}\n${readFileSync(menuFile, "utf8")}`;
  const pcPortalSource = `${readFileSync(pcPortalFile, "utf8")}\n${readFileSync(pcNavigationFile, "utf8")}`;

  for (const label of [
    "Mathématiques",
    "Physique-Chimie",
    "Réviser",
    "Outils",
    "QCM et quiz",
    "Flashcards",
    "Recherche",
    "Compte",
    "Laboratoire virtuel",
    "Kit scientifique",
    "Tableau périodique",
    "Méthodes",
  ]) {
    assert.match(globalSource, new RegExp(label), `missing ${label}`);
  }

  assert.doesNotMatch(readFileSync(menuFile, "utf8"), /discipline:\s*"enseignement-scientifique"/);
  assert.doesNotMatch(readFileSync(menuFile, "utf8"), /1re — Enseignement scientifique/);
  assert.match(pcPortalSource, /Première — Enseignement scientifique/);
  assert.match(pcPortalSource, /Terminale — Enseignement scientifique/);

  for (const route of ["/outils-methodes/kit-scientifique", "/outils-methodes/tableau-periodique"]) {
    assert.match(globalSource, new RegExp(route.replaceAll("/", "\\/").replace("#", "\\#")), `missing ${route}`);
  }
});

test("public navigation remains the single global menu source", () => {
  const navSource = readFileSync(navFile, "utf8");
  const homeSource = readFileSync(path.join(root, "src/pages/index.astro"), "utf8");
  const menuSource = readFileSync(menuFile, "utf8");

  assert.match(navSource, /publicMenuSections/);
  assert.doesNotMatch(homeSource, /publicMenuSections/);
  assert.doesNotMatch(homeSource, /const mainMenuSections/);
  assert.doesNotMatch(homeSource, /home-main-menu/);
  assert.doesNotMatch(homeSource, /feature-strip/);
  assert.doesNotMatch(menuSource, /label:\s*"Seconde"/);
  assert.doesNotMatch(menuSource, /label:\s*"Compte"/);
  assert.match(navSource, /class:list=\{\["ui5-nav__link"/);
  assert.match(navSource, /href="\/profil"/);
  assert.match(navSource, /data-open/);
  assert.match(navSource, /aria-expanded="false"/);
  assert.match(navSource, /href="\/#global-search"/);
});
