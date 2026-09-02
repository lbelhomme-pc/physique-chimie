import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const programmePath = join(root, 'src/data/mathematiques/programmes/seconde-gt-2026.json');
const mappingPath = join(root, 'src/data/mathematiques/programmes/seconde-gt-2026.mapping.json');
const chaptersRoot = join(root, 'src/data/mathematiques/chapters/lycee/2nde');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const programme = readJson(programmePath);
const mapping = readJson(mappingPath);

const expectedSlugs = [
  'arithmetique-ensembles-logique',
  'nombres-reels-intervalles',
  'calcul-litteral-puissances-racines',
  'equations-inequations',
  'fonctions-generalites',
  'fonctions-reference-variations',
  'geometrie-reperee-vecteurs',
  'droites-plan',
  'statistiques-information-chiffree',
  'probabilites-conditionnelles',
  'algorithmique-python',
];

const expectedSet = new Set(expectedSlugs);
const assertSameSet = (actual, expected, message) => {
  assert.deepEqual([...new Set(actual)].sort(), [...expected].sort(), message);
};

test('C18 verrouille la source officielle du programme de seconde 2026', () => {
  assert.equal(programme.source.id, 'bo-2026-mathematiques-seconde-gt');
  assert.match(programme.source.bulletin, /n°\s*14 du 2 avril 2026/i);
  assert.match(programme.source.application, /2026-2027/);
  assert.match(programme.source.url, /MENE2602914A/);

  assert.equal(mapping.programmeId, programme.source.id);
  assert.equal(mapping.source.nor, 'MENE2602914A');
  assert.match(mapping.source.bulletin, /n°\s*14 du 2 avril 2026/i);
  assert.equal(mapping.source.application, 'Rentrée scolaire 2026-2027');
});

test('C18 conserve exactement les 11 chapitres de seconde et leurs slugs', () => {
  const progressionSlugs = programme.progression.map((chapter) => chapter.slug);
  assert.equal(progressionSlugs.length, 11);
  assert.equal(new Set(progressionSlugs).size, 11, 'les slugs de progression doivent être uniques');
  assertSameSet(progressionSlugs, expectedSet, 'la progression doit couvrir les 11 chapitres C18');
});

test('C18 garantit le paquet pédagogique et la source BO de chaque chapitre', () => {
  const requiredFiles = ['meta.json', 'cours.mdx', 'exercices.json', 'quiz.json', 'flashcards.json'];

  for (const slug of expectedSlugs) {
    const chapterRoot = join(chaptersRoot, slug);
    for (const file of requiredFiles) {
      const filePath = join(chapterRoot, file);
      assert.ok(existsSync(filePath), `${slug}: fichier manquant ${file}`);
    }

    const meta = readJson(join(chapterRoot, 'meta.json'));
    assert.equal(meta.slug, slug, `${slug}: slug meta incohérent`);
    assert.equal(meta.niveau, '2nde', `${slug}: niveau inattendu`);
    assert.equal(meta.officialSource, programme.source.id, `${slug}: officialSource inattendue`);
    assert.equal(meta.programme, programme.source.id, `${slug}: programme inattendu`);
    assert.equal(meta.seo?.canonical, `/mathematiques/lycee/2nde/${slug}`, `${slug}: canonical modifiée`);
    assert.ok(
      meta.sources?.some((source) => source.id === programme.source.id && /MENE2602914A/.test(source.url ?? '')),
      `${slug}: source officielle BO 2026 absente`,
    );

    for (const resource of ['exercices.json', 'quiz.json', 'flashcards.json']) {
      assert.doesNotThrow(() => readJson(join(chapterRoot, resource)), `${slug}: ${resource} invalide`);
    }

    const course = readFileSync(join(chapterRoot, 'cours.mdx'), 'utf8');
    assert.match(course, /##\s+Synthèse/i, `${slug}: synthèse absente du cours`);
  }
});

test('C18 mappe les 4 parties thématiques et les 3 parties transversales du BO', () => {
  assert.equal(mapping.principles.thematicParts, 4);
  assert.equal(mapping.principles.transversalParts, 3);
  assert.equal(mapping.principles.transversalIntegratedThroughoutYear, true);
  assert.equal(mapping.thematic.length, 4);
  assert.equal(mapping.transversal.length, 3);

  assert.deepEqual(
    mapping.thematic.map((part) => part.name),
    ['Nombres et calculs, algèbre', 'Géométrie', 'Fonctions', 'Statistiques et probabilités'],
  );
  assert.deepEqual(
    mapping.transversal.map((part) => part.name),
    ['Vocabulaire ensembliste et logique', 'Algorithmique et programmation', 'Automatismes'],
  );

  const referenced = [];
  for (const part of mapping.thematic) {
    for (const subsection of part.subsections) referenced.push(...subsection.chapters);
  }
  for (const part of mapping.transversal) {
    if (part.primaryChapter) referenced.push(part.primaryChapter);
    referenced.push(...part.integratedInto);
    assertSameSet(part.integratedInto, expectedSet, `${part.name}: intégration transversale incomplète`);
  }

  for (const slug of referenced) {
    assert.ok(expectedSet.has(slug), `mapping vers un slug inconnu: ${slug}`);
  }
  assertSameSet(referenced, expectedSet, 'chaque chapitre doit apparaître dans le mapping C18');
});

test('C18 maintient une preuve textuelle des attendus BO dans les 11 cours', () => {
  assertSameSet(Object.keys(mapping.chapterEvidence), expectedSet, 'chapterEvidence doit couvrir les 11 chapitres');

  for (const [slug, evidenceItems] of Object.entries(mapping.chapterEvidence)) {
    assert.ok(Array.isArray(evidenceItems) && evidenceItems.length > 0, `${slug}: aucune preuve C18 déclarée`);
    const course = readFileSync(join(chaptersRoot, slug, 'cours.mdx'), 'utf8').toLocaleLowerCase('fr');
    for (const evidence of evidenceItems) {
      assert.ok(
        course.includes(evidence.toLocaleLowerCase('fr')),
        `${slug}: attendu C18 introuvable dans le cours: ${evidence}`,
      );
    }
  }
});

test('C18 verrouille deux bornes de programme sensibles', () => {
  const proba = readFileSync(join(chaptersRoot, 'probabilites-conditionnelles', 'cours.mdx'), 'utf8');
  assert.match(proba, /formule des probabilités totales/i);
  assert.match(proba, /n['’]est pas un attendu du programme de seconde/i);

  const reels = readFileSync(join(chaptersRoot, 'nombres-reels-intervalles', 'cours.mdx'), 'utf8');
  assert.match(reels, /valeur absolue est introduite pour exprimer une distance/i);
  assert.match(reels, /chiffres significatifs/i);
});
