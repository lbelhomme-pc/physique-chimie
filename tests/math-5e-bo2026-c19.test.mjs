import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const chaptersRoot = join(root, 'src/data/mathematiques/chapters/college/5eme');
const mapping = JSON.parse(readFileSync(join(root, 'src/data/mathematiques/programmes/cycle4-5e-2026.mapping.json'), 'utf8'));
const curriculum = readFileSync(join(root, 'src/data/curriculumVersions.ts'), 'utf8');
const slugs = ['operations-nombres','nombres-relatifs','nombres-rationnels','puissances','calcul-litteral','reperage-espace','transformations-angles','triangles-parallelogrammes','statistiques','probabilites','proportionnalite','fonctions','pensee-informatique'];
const expected = new Set(slugs);
const sameSet = (actual, target, message) => assert.deepEqual([...new Set(actual)].sort(), [...target].sort(), message);

test('C19 verrouille durablement le BO cycle 4 2026 applicable en 5e dès 2026-2027', () => {
  assert.equal(mapping.programmeId, 'bo-cycle4-mathematiques-2026');
  assert.equal(mapping.programmeVersion, 'mathematiques-cycle4-2026');
  assert.equal(mapping.source.nor, 'MENE2602912A');
  assert.equal(mapping.source.application5e, 'Rentrée scolaire 2026-2027');
  assert.match(curriculum, /id:\s*"mathematiques-cycle4-2026"/);
  assert.match(curriculum, /officialSourceIds:\s*\["bo-cycle4-mathematiques-2026"\]/);
  assert.match(curriculum, /"5eme":\s*window\("2026-2027"\)/);
});

test('C19 conserve les 13 chapitres éditoriaux et leur socle cours N1 N2', () => {
  sameSet(mapping.chapters, expected, 'le mapping doit conserver les 13 slugs de 5e');
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    for (const file of ['meta.json','cours.mdx','exercices.json','quiz.json','flashcards.json']) assert.ok(existsSync(join(dir, file)), `${slug}: fichier manquant ${file}`);
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    assert.equal(meta.niveau, '5eme');
    assert.equal(meta.slug, slug);
    assert.equal(meta.officialSource, 'bo-cycle4-mathematiques-2026');
    assert.equal(meta.seo?.canonical, `/mathematiques/college/5eme/${slug}`);
    const exercises = JSON.parse(readFileSync(join(dir, 'exercices.json'), 'utf8')).exercices;
    const levels = new Set(exercises.map((exercise) => exercise.level));
    assert.ok(levels.has('N1'), `${slug}: N1 absent`);
    assert.ok(levels.has('N2'), `${slug}: N2 absent`);
    assert.ok(exercises.every((exercise) => Array.isArray(exercise.correction) && exercise.correction.length > 0), `${slug}: correction C19 manquante`);
    const course = readFileSync(join(dir, 'cours.mdx'), 'utf8');
    for (const heading of ['Objectifs','Prérequis','Cours','Erreurs fréquentes','Synthèse']) assert.match(course, new RegExp(`##\\s+${heading}`, 'i'), `${slug}: section ${heading} manquante`);
  }
});

test('C19 mappe toujours toutes les rubriques officielles de 5e', () => {
  assert.deepEqual(mapping.domains.map((domain) => domain.name), ['Nombres et calculs','Espace et géométrie','Organisation et gestion de données et probabilités','Proportionnalité, fonctions','La pensée informatique']);
  const mappedSlugs = mapping.domains.flatMap((domain) => domain.subsections.flatMap((section) => section.chapters));
  sameSet(mappedSlugs, expected, 'chaque chapitre doit rester rattaché au BO');
  assert.match(mapping.decompositionNote, /décomposition éditoriale/i);
});
