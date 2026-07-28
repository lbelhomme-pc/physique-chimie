import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dashboardSource = readFileSync(path.join(root, "src/components/pedagogie/Dashboard.tsx"), "utf8");
const profileSource = readFileSync(path.join(root, "src/components/pedagogie/ProfilePage.tsx"), "utf8");

test("dashboard V3 uses local progress data without server account assumptions", () => {
  assert.match(dashboardSource, /getGamificationEngine/);
  assert.match(dashboardSource, /getSRSEngine/);
  assert.match(dashboardSource, /getLastChapter/);
  assert.match(dashboardSource, /getGlobalDueByChapter/);
  assert.match(dashboardSource, /resources: GlobalSearchResource\[\]/);
  assert.doesNotMatch(dashboardSource, /fetch\(|supabase|auth|checkout|stripe/i);
});

test("dashboard V3 exposes empty and populated states", () => {
  assert.match(dashboardSource, /Aucun chapitre commence/);
  assert.match(dashboardSource, /Aucune carte due/);
  assert.match(dashboardSource, /Aucune activite locale enregistree/);
  assert.match(dashboardSource, /historyItems\.length > 0/);
  assert.match(dashboardSource, /reviewItems\.length > 0/);
  assert.match(dashboardSource, /priorityItem/);
});

test("dashboard V3 includes connected layout, review, progression and history table", () => {
  for (const marker of [
    "dashboard-v3__sidebar",
    "Navigation de l'espace local",
    "A faire maintenant",
    "A revoir",
    "Revision du jour",
    "Progression",
    "Poursuivre autrement",
    "Historique local",
  ]) {
    assert.match(dashboardSource, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(dashboardSource, /<table>/);
  assert.match(dashboardSource, /<th scope="col">Chapitre<\/th>/);
  assert.match(dashboardSource, /<td colSpan=\{4\}>/);
});

test("dashboard V3 keeps keyboard and responsive affordances", () => {
  assert.match(dashboardSource, /:focus-visible/);
  assert.match(dashboardSource, /box-shadow: var\(--v3-shadow-focus\)/);
  assert.match(dashboardSource, /@media \(max-width: 1080px\)/);
  assert.match(dashboardSource, /@media \(max-width: 760px\)/);
  assert.match(dashboardSource, /overflow-x: auto/);
});

test("dashboard V3 does not hard-code a fake public user", () => {
  assert.doesNotMatch(dashboardSource, /Camille|Martin|Terminale - PC|Bonjour\s+[A-Z]/);
  assert.doesNotMatch(profileSource, /Camille|Martin|Terminale - PC/);
  assert.match(dashboardSource, /Profil local/);
  assert.match(dashboardSource, /Sans compte serveur/);
});

