import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  premiumAccessMatrix,
  premiumGatePrototype,
  resolveAccessGate,
} from "../src/types/accessControl.ts";

const root = process.cwd();
const accessTypes = readFileSync(path.join(root, "src/types/accessControl.ts"), "utf8");
const gatePrototype = readFileSync(path.join(root, "src/components/access/PremiumGatePrototype.astro"), "utf8");
const gatingDoc = readFileSync(path.join(root, "docs/refonte-v3/reference/matrice-premium-gating-v3.md"), "utf8");
const accountDoc = readFileSync(path.join(root, "docs/refonte-v3/11-comptes-gratuit-premium.md"), "utf8");
const packageJson = readFileSync(path.join(root, "package.json"), "utf8");

describe("premium gating V3", () => {
  it("couvre les familles de ressources attendues sans bloquer les essentiels", () => {
    const expectedFamilies = [
      "chapter-overview",
      "essential-course",
      "level-1-exercise",
      "essential-correction",
      "detailed-correction",
      "quiz",
      "flashcards",
      "laboratory",
      "scientific-kit",
      "personalized-progress",
      "personalized-review",
      "pdf-annals",
    ];

    assert.deepEqual(
      premiumAccessMatrix.map((row) => row.family),
      expectedFamilies,
    );

    for (const row of premiumAccessMatrix.filter((item) => item.essential)) {
      assert.notEqual(row.free, "upgrade-required", row.family);
      assert.equal(row.premium, "allow", row.family);
      assert.ok(["allow", "preview"].includes(row.visitor), row.family);
      assert.equal(row.premiumUse, "none", row.family);
    }
  });

  it("resout les etats visiteur, gratuit, premium, enseignant et brouillon", () => {
    assert.deepEqual(
      resolveAccessGate({
        audience: "visitor",
        policy: { tier: "free", preview: true, requiresAccount: false },
      }).decision,
      "allow",
    );

    const accountRequired = resolveAccessGate({
      audience: "visitor",
      policy: { tier: "free", preview: true, requiresAccount: true },
    });
    assert.equal(accountRequired.decision, "account-required");
    assert.equal(accountRequired.preview, true);
    assert.equal(accountRequired.cta, "sign-in");

    const visitorPremium = resolveAccessGate({
      audience: "visitor",
      policy: {
        tier: "premium",
        preview: true,
        requiresAccount: false,
        premiumReason: "Serie d'approfondissement.",
      },
    });
    assert.equal(visitorPremium.decision, "preview");
    assert.equal(visitorPremium.allowed, false);
    assert.equal(visitorPremium.cta, "sign-in");

    const freePremium = resolveAccessGate({
      audience: "free",
      policy: { tier: "premium", preview: true, requiresAccount: false },
    });
    assert.equal(freePremium.decision, "upgrade-required");
    assert.equal(freePremium.cta, "upgrade");

    assert.equal(
      resolveAccessGate({
        audience: "premium",
        policy: { tier: "premium", preview: true, requiresAccount: false },
      }).decision,
      "allow",
    );

    assert.equal(
      resolveAccessGate({
        audience: "free",
        rights: ["use-premium-content"],
        policy: { tier: "premium", preview: false, requiresAccount: false },
      }).decision,
      "allow",
    );

    assert.equal(
      resolveAccessGate({
        audience: "free",
        policy: { tier: "teacher", preview: false, requiresAccount: true },
      }).decision,
      "teacher-only",
    );

    assert.equal(
      resolveAccessGate({
        audience: "teacher",
        policy: { tier: "teacher", preview: false, requiresAccount: true },
      }).decision,
      "allow",
    );

    assert.equal(
      resolveAccessGate({
        audience: "premium",
        policy: { tier: "draft", preview: false, requiresAccount: false },
      }).decision,
      "draft-hidden",
    );
  });

  it("documente un verrou accessible et non CSS-only", () => {
    assert.match(gatePrototype, /role="note"/);
    assert.match(gatePrototype, /aria-labelledby/);
    assert.match(gatePrototype, /focus-visible/);
    assert.match(gatePrototype, /data-gating-source="access-control-decision"/);
    assert.match(gatePrototype, /<svg viewBox="0 0 24 24"/);
    assert.doesNotMatch(gatePrototype, /display:\s*none|visibility:\s*hidden/i);
    assert.match(accessTypes, /resolveAccessGate/);
    assert.match(gatingDoc, /Pas de CSS-only gating/);
  });

  it("conserve le Premium comme confort ou approfondissement sans prix reel", () => {
    assert.match(gatingDoc, /contenu essentiel non bloque/);
    assert.match(gatingDoc, /approfondissement/);
    assert.match(gatingDoc, /confort/);
    assert.match(accountDoc, /Etats de gating prepares/);
    assert.match(premiumGatePrototype.message, /notion essentielle reste disponible/);
    assert.doesNotMatch(packageJson, /stripe|checkout|paddle|lemonsqueezy/i);
    assert.doesNotMatch(accessTypes, /fetch\(|document\.cookie|localStorage\.setItem|clientSecret|serviceRole|privateKey/i);
    assert.doesNotMatch(gatingDoc, /[0-9]+([,.][0-9]+)?\s*(eur|euros|EUR)/);
  });
});
