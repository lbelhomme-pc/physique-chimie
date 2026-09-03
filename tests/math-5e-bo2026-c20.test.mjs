import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const chaptersRoot = join(root, 'src/data/mathematiques/chapters/college/5eme');
const mapping = JSON.parse(readFileSync(join(root, 'src/data/mathematiques/programmes/cycle4-5e-2026.mapping.json'), 'utf8'));
const levels = readFileSync(join(root, 'src/data/mathematiques/levels.ts'), 'utf8');
const chapterPage = readFileSync(join(root, 'src/pages/mathematiques/college/[niveau]/[chapitre].astro'), 'utf8');
const routes = JSON.parse(readFileSync(join(root, 'tests/fixtures/dist-routes.snapshot.json'), 'utf8'));
const slugs = ['operations-nombres','nombres-relatifs','nombres-rationnels','puissances','calcul-litteral','reperage-espace','transformations-angles','triangles-parallelogrammes','statistiques','probabilites','proportionnalite','fonctions','pensee-informatique'];

function uniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `${label}: IDs dupliqués`);
  assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0), `${label}: ID vide`);
}

test('C20 certifie le paquet complet des 13 chapitres de 5e', () => {
  assert.equal(mapping.mission, 'C20');
  assert.equal(mapping.c20Contract.coverage, 'complete-5e');
  assert.deepEqual(mapping.c20Contract.exerciseLevels, ['N1','N2','N3']);
  let figureCount = 0;
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    assert.ok(existsSync(join(dir, 'exercices-n3.json')), `${slug}: fichier N3 manquant`);
    const base = JSON.parse(readFileSync(join(dir, 'exercices.json'), 'utf8')).exercices;
    const n3 = JSON.parse(readFileSync(join(dir, 'exercices-n3.json'), 'utf8')).exercices;
    const quiz = JSON.parse(readFileSync(join(dir, 'quiz.json'), 'utf8')).questions;
    const cards = JSON.parse(readFileSync(join(dir, 'flashcards.json'), 'utf8')).cards;
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    assert.ok(base.some((exercise) => exercise.level === 'N1'), `${slug}: N1 absent`);
    assert.ok(base.some((exercise) => exercise.level === 'N2'), `${slug}: N2 absent`);
    assert.ok(n3.length >= 2, `${slug}: deux N3 minimum attendus`);
    assert.ok(n3.every((exercise) => Number(exercise.difficulty) === 3), `${slug}: difficulté N3 incohérente`);
    assert.ok(n3.every((exercise) => typeof exercise.correction === 'string' && exercise.correction.trim()), `${slug}: correction N3 manquante`);
    uniqueIds([...base, ...n3], `${slug} exercices`);
    assert.ok(quiz.length >= 5, `${slug}: cinq questions minimum attendues`);
    uniqueIds(quiz, `${slug} quiz`);
    for (const question of quiz) {
      assert.ok(Array.isArray(question.choices) && question.choices.length >= 3, `${slug}: choix insuffisants`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length, `${slug}: réponse quiz hors bornes`);
    }
    assert.ok(cards.length >= 6, `${slug}: six flashcards minimum attendues`);
    uniqueIds(cards, `${slug} flashcards`);
    assert.ok(cards.every((card) => card.front?.trim() && card.back?.trim()), `${slug}: flashcard incomplète`);
    assert.equal(meta.seo?.noindex, false, `${slug}: doit être indexable en C20`);
    for (const exercise of n3.filter((exercise) => exercise.schemaSvg)) {
      figureCount += 1;
      assert.match(exercise.schemaSvg, /^<svg[\s>]/i, `${slug}: SVG invalide`);
      assert.doesNotMatch(exercise.schemaSvg, /<script|\son[a-z]+\s*=/i, `${slug}: SVG non sûr`);
      assert.ok(exercise.schemaAlt?.trim(), `${slug}: alternative textuelle SVG manquante`);
      assert.ok(exercise.schemaCaption?.trim(), `${slug}: légende SVG manquante`);
    }
  }
  assert.ok(figureCount >= 6, `C20: au moins 6 figures accessibles attendues, obtenu ${figureCount}`);
});

test('C20 charge les N3 au rendu et publie la 5e avec ses 14 routes', () => {
  assert.match(chapterPage, /exercices-n3\.json/);
  assert.match(chapterPage, /\.\.\.baseExercises,\s*\.\.\.n3Exercises/);
  assert.match(levels, /slug:\s*"5eme"[\s\S]*?status:\s*"available"/);
  assert.equal(mapping.c20Contract.publicLevelStatus, 'available');
  const expectedRoutes = ['/mathematiques/college/5eme', ...slugs.map((slug) => `/mathematiques/college/5eme/${slug}`)];
  for (const route of expectedRoutes) assert.ok(routes.includes(route), `route C20 absente du snapshot: ${route}`);
});

test('C20 maintient la frontière de niveau et reporte la migration massive des figures à C31', () => {
  assert.equal(mapping.source.nor, 'MENE2602912A');
  assert.equal(mapping.source.application5e, 'Rentrée scolaire 2026-2027');
  assert.ok(mapping.deferredAfterC20.some((item) => item.mission === 'C31' && /LaTeX|TikZ|PGFPlots/.test(item.scope)));
  const forbidden = [/Pythagore/i,/Thal[eè]s/i,/trigonom/i,/fonction affine/i,/boucle conditionnelle/i,/deux épreuves/i];
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    const resources = ['exercices-n3.json','quiz.json','flashcards.json'].map((file) => readFileSync(join(dir, file), 'utf8')).join('\n');
    for (const pattern of forbidden) assert.doesNotMatch(resources, pattern, `${slug}: notion hors périmètre 5e détectée`);
  }
});
