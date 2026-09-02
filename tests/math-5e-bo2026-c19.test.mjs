import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const chaptersRoot = join(root, 'src/data/mathematiques/chapters/college/5eme');
const mapping = JSON.parse(readFileSync(join(root, 'src/data/mathematiques/programmes/cycle4-5e-2026.mapping.json'), 'utf8'));
const curriculum = readFileSync(join(root, 'src/data/curriculumVersions.ts'), 'utf8');
const levels = readFileSync(join(root, 'src/data/mathematiques/levels.ts'), 'utf8');
const slugs = ['operations-nombres','nombres-relatifs','nombres-rationnels','puissances','calcul-litteral','reperage-espace','transformations-angles','triangles-parallelogrammes','statistiques','probabilites','proportionnalite','fonctions','pensee-informatique'];
const expected = new Set(slugs);
const sameSet = (actual, target, message) => assert.deepEqual([...new Set(actual)].sort(), [...target].sort(), message);

test('C19 verrouille le BO cycle 4 2026 applicable en 5e dès 2026-2027', () => {
  assert.equal(mapping.programmeId, 'bo-cycle4-mathematiques-2026');
  assert.equal(mapping.programmeVersion, 'mathematiques-cycle4-2026');
  assert.equal(mapping.source.nor, 'MENE2602912A');
  assert.equal(mapping.source.application5e, 'Rentrée scolaire 2026-2027');
  assert.match(curriculum, /id:\s*"mathematiques-cycle4-2026"/);
  assert.match(curriculum, /officialSourceIds:\s*\["bo-cycle4-mathematiques-2026"\]/);
  assert.match(curriculum, /"5eme":\s*window\("2026-2027"\)/);
});

test('C19 crée exactement les 13 chapitres éditoriaux du lot A', () => {
  assert.equal(slugs.length, 13);
  sameSet(mapping.chapters, expected, 'le mapping C19 doit couvrir les 13 slugs');
});

test('C19 conserve le paquet pédagogique mais limite les évaluations à N1 et N2', () => {
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    for (const file of ['meta.json','cours.mdx','exercices.json','quiz.json','flashcards.json']) {
      assert.ok(existsSync(join(dir, file)), `${slug}: fichier manquant ${file}`);
    }
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    assert.equal(meta.niveau, '5eme', `${slug}: niveau incorrect`);
    assert.equal(meta.slug, slug, `${slug}: slug incohérent`);
    assert.equal(meta.officialSource, 'bo-cycle4-mathematiques-2026', `${slug}: source officielle incorrecte`);
    assert.equal(meta.programme, 'bo-cycle4-mathematiques-2026', `${slug}: programme incorrect`);
    assert.equal(meta.programmeVersion, 'mathematiques-cycle4-2026', `${slug}: version de programme incorrecte`);
    assert.equal(meta.applicableFrom, '2026-2027', `${slug}: fenêtre d'application incorrecte`);
    assert.equal(meta.seo?.canonical, `/mathematiques/college/5eme/${slug}`, `${slug}: canonical incorrecte`);
    assert.equal(meta.seo?.noindex, true, `${slug}: C19 doit rester noindex`);

    const exercises = JSON.parse(readFileSync(join(dir, 'exercices.json'), 'utf8')).exercices;
    assert.ok(exercises.length >= 4, `${slug}: au moins quatre exercices N1/N2 attendus`);
    const exerciseLevels = new Set(exercises.map((exercise) => exercise.level));
    assert.ok(exerciseLevels.has('N1'), `${slug}: N1 absent`);
    assert.ok(exerciseLevels.has('N2'), `${slug}: N2 absent`);
    assert.ok([...exerciseLevels].every((level) => level === 'N1' || level === 'N2'), `${slug}: niveau d'exercice hors C19`);
    assert.ok(exercises.every((exercise) => Array.isArray(exercise.correction) && exercise.correction.length > 0), `${slug}: correction détaillée manquante`);

    const quiz = JSON.parse(readFileSync(join(dir, 'quiz.json'), 'utf8'));
    const flashcards = JSON.parse(readFileSync(join(dir, 'flashcards.json'), 'utf8'));
    assert.deepEqual(quiz.questions, [], `${slug}: quiz réservé à C20`);
    assert.deepEqual(flashcards.cards, [], `${slug}: flashcards réservées à C20`);
  }
});

test('C19 exige une structure de cours complète et ne commence pas les figures C20', () => {
  for (const slug of slugs) {
    const course = readFileSync(join(chaptersRoot, slug, 'cours.mdx'), 'utf8');
    for (const heading of ['Objectifs','Prérequis','Cours','Erreurs fréquentes','Synthèse']) {
      assert.match(course, new RegExp(`##\\s+${heading}`, 'i'), `${slug}: section ${heading} manquante`);
    }
    assert.doesNotMatch(course, /<svg|<figure|tikzpicture|pgfplots/i, `${slug}: figures réservées à C20`);
  }
});

test('C19 mappe toutes les rubriques officielles de 5e sans inventer un nombre officiel de chapitres', () => {
  assert.deepEqual(mapping.domains.map((domain) => domain.name), ['Nombres et calculs','Espace et géométrie','Organisation et gestion de données et probabilités','Proportionnalité, fonctions','La pensée informatique']);
  const subsectionNames = mapping.domains.flatMap((domain) => domain.subsections.map((section) => section.name));
  for (const expectedSection of ['Opérations','Nombres relatifs','Nombres rationnels','Puissances','Calcul littéral et algébrique','Repérage sur une droite et dans le plan','Représentation de l’espace','Transformations','Angles','Triangles','Parallélogrammes','Statistiques','Probabilités','Proportionnalité','Fonctions','Cinquième']) {
    assert.ok(subsectionNames.includes(expectedSection), `rubrique BO non mappée: ${expectedSection}`);
  }
  const mappedSlugs = mapping.domains.flatMap((domain) => domain.subsections.flatMap((section) => section.chapters));
  sameSet(mappedSlugs, expected, 'chaque chapitre C19 doit être rattaché au BO');
  assert.match(mapping.decompositionNote, /décomposition éditoriale/i);
});

test('C19 ne publie pas prématurément le niveau 5e et réserve le lot B à C20', () => {
  assert.match(levels, /slug:\s*"5eme"[\s\S]*?status:\s*"planned"/);
  assert.equal(mapping.c19Contract.publicLevelStatus, 'planned');
  assert.equal(mapping.c19Contract.chapterNoindex, true);
  assert.equal(mapping.c19Contract.quiz, false);
  assert.equal(mapping.c19Contract.flashcards, false);
  assert.equal(mapping.c19Contract.figures, false);
  assert.ok(mapping.deferredToC20.includes('exercices N3'));
  assert.ok(mapping.deferredToC20.includes('quiz finaux'));
  assert.ok(mapping.deferredToC20.includes('flashcards essentielles'));
});
