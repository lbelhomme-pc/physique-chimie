import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const historicalRootFiles = [
  'ANALYSE_ARCHITECTURE_SITE.md',
  'AUDIT_ORGANISATION_ARBORESCENCE.md',
  'INVENTAIRE_CHEMINS_CANONIQUES.md',
  'PROMPTS_CLAUDE_CODE.md',
  'RAPPORT_ALIAS_PROGRESSIONS_PHYSIQUE_CHIMIE.md',
  'RAPPORT_BRANCHEMENT_ALIAS_APPLICATIF.md',
  'RAPPORT_CHAINE_QUALITE_NPM.md',
  'RAPPORT_CONTRAT_CONTENU_COMMUN.md',
  'RAPPORT_CONVENTION_4E_4EME.md',
  'RAPPORT_IDENTIFIANTS_PROGRESSIONS.md',
  'RAPPORT_INTEGRATION_CONTENT_IDS.md',
  'RAPPORT_MIGRATION_IDS_PROGRESSION.md',
  'RAPPORT_ROUTES_TEMPLATES_MIGRATION.md',
  'RAPPORT_SECURISATION_ROUTES_CONTENUS.md',
  'RESUME_COMPLET_PROJET_CLAUDE_CODE.txt',
  'arbo.txt',
  'cours-python.pdf',
  'fichier.txt',
  'python_cours.pdf',
  'recommandations_priorites_seconde.txt',
  'terminales-verification-report.json',
  'terminales-verification-report.md',
];

test('repository README describes the real educational platform', () => {
  const readme = read('README.md');

  assert.doesNotMatch(readme, /Astro Starter Kit/i);
  assert.match(readme, /Maths & Physique-Chimie/);
  assert.match(readme, /deux disciplines/i);
  assert.match(readme, /Enseignement scientifique/);
  assert.match(readme, /parcours rattaché à l’espace Physique-Chimie/);
  assert.match(readme, /npm run verify:content/);
  assert.match(readme, /quality/);
  assert.match(readme, /dist-fast/);
  assert.match(readme, /dist-a11y/);
  assert.match(readme, /docs\/README\.md/);
});

test('coding assistant documentation no longer advertises stale architecture', () => {
  const instructions = read('CLAUDE.md');

  assert.match(instructions, /Astro 7/);
  assert.match(instructions, /React 19/);
  assert.match(instructions, /Mathématiques/);
  assert.match(instructions, /Enseignement scientifique/);
  assert.doesNotMatch(instructions, /Astro\.js v5/i);
  assert.doesNotMatch(instructions, /OpenDyslexic \(CDN\)/i);
});

test('documentation has explicit current and historical entrypoints', () => {
  const docsIndex = read('docs/README.md');
  const architectureIndex = read('docs/architecture/README.md');
  const taxonomy = read('docs/architecture/taxonomie-disciplines.md');
  const legacyInventory = read('docs/historique/racine-legacy.md');

  assert.match(docsIndex, /Documentation autoritative actuelle/);
  assert.match(docsIndex, /Documents historiques/);
  assert.match(architectureIndex, /Invariants actuels/);
  assert.match(architectureIndex, /taxonomie-disciplines\.md/);
  assert.match(taxonomy, /deux disciplines publiques/i);
  assert.match(taxonomy, /parcours du lycée rattaché à l’espace Physique-Chimie/i);
  assert.match(legacyInventory, /Politique pour les nouvelles contributions/);
});

test('every known historical root artifact is explicitly inventoried', () => {
  const rootEntries = new Set(readdirSync(root));
  const legacyInventory = read('docs/historique/racine-legacy.md');

  for (const file of historicalRootFiles) {
    assert.ok(rootEntries.has(file), `historical root artifact missing from expected baseline: ${file}`);
    assert.ok(legacyInventory.includes(`\`${file}\``), `historical root artifact not documented: ${file}`);
  }
});

test('no additional report or verification artifact appears silently at repository root', () => {
  const allowed = new Set(historicalRootFiles);
  const suspicious = readdirSync(root).filter((name) =>
    /^RAPPORT_.*\.md$/i.test(name)
    || /^terminales-verification-report\./i.test(name)
    || /^(?:ANALYSE|AUDIT|INVENTAIRE)_.*\.md$/i.test(name)
    || /^(?:arbo|fichier)\.txt$/i.test(name)
  );

  const unexpected = suspicious.filter((name) => !allowed.has(name));
  assert.deepEqual(unexpected, [], `unexpected historical artifact(s) at root: ${unexpected.join(', ')}`);
});
