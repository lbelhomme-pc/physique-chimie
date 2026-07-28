import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const accountTypes = readFileSync(path.join(root, "src/types/account.ts"), "utf8");
const architectureDoc = readFileSync(path.join(root, "docs/refonte-v3/reference/architecture-comptes-auth-v3.md"), "utf8");
const accountDoc = readFileSync(path.join(root, "docs/refonte-v3/11-comptes-gratuit-premium.md"), "utf8");
const packageJson = readFileSync(path.join(root, "package.json"), "utf8");

test("account architecture remains provider-neutral and inactive", () => {
  assert.match(accountTypes, /AccountProviderMode/);
  assert.match(accountTypes, /"local-only"/);
  assert.match(accountTypes, /enabled: false/);
  assert.match(architectureDoc, /Le choix fournisseur est reporte/);
  assert.match(architectureDoc, /pas selectionnee/);
  assert.doesNotMatch(packageJson, /supabase|auth0|clerk|firebase|stripe/i);
});

test("account architecture preserves localStorage migration and offline use", () => {
  for (const key of [
    "gamification_state",
    "srs_cards",
    "pc-platform-progress-v1",
    "pc-platform-progress-v2",
  ]) {
    assert.match(accountTypes, new RegExp(key));
    assert.match(architectureDoc, new RegExp(key));
  }

  assert.match(accountTypes, /preserveLocalCopy: true/);
  assert.match(accountTypes, /allowOfflineUse: true/);
  assert.match(architectureDoc, /ne jamais supprimer automatiquement les cles legacy/);
});

test("account architecture separates public basics from account and premium rights", () => {
  assert.match(accountDoc, /Cours essentiels/);
  assert.match(architectureDoc, /Il ne doit pas etre requis pour comprendre les bases/);
  assert.match(accountTypes, /"read-public-content"/);
  assert.match(accountTypes, /"use-premium-content"/);
  assert.match(architectureDoc, /jamais CSS-only/);
});

test("account architecture documents privacy and accessible forms", () => {
  assert.match(accountTypes, /AccountPrivacyRule/);
  assert.match(accountTypes, /AccountFormRequirement/);
  assert.match(accountTypes, /autocomplete: "email"/);
  assert.match(accountTypes, /accessibleName/);
  assert.match(architectureDoc, /aucun secret cote client/);
  assert.match(architectureDoc, /Consentement separe/);
});

test("account architecture does not introduce active auth, payment or client secrets", () => {
  assert.doesNotMatch(accountTypes, /fetch\(|localStorage\.setItem|document\.cookie|clientSecret|serviceRole|privateKey/i);
  assert.doesNotMatch(architectureDoc, /prix Premium.*[0-9]/i);
  assert.doesNotMatch(architectureDoc, /Camille|Martin|Terminale - PC/);
});

