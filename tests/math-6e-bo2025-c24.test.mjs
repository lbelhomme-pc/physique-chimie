import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const chaptersRoot = join(root, 'src/data/mathematiques/chapters/college/6eme');
const mapping = JSON.parse(readFileSync(join(root, 'src/data/mathematiques/programmes/cycle3-6e-2025.mapping.json'), 'utf8'));
const levels = readFileSync(join(root, 'src/data/mathematiques/levels.ts'), 'utf8');
const routes = JSON.parse(readFileSync(join(root, 'tests/fixtures/dist-routes.snapshot.json'), 'utf8'));
const slugs = ['nombres-entiers-decimaux','fractions','algebre','longueurs','aires','volumes','temps-durees','proportionnalite','donnees','probabilites','configurations-planes','vision-espace','pensee-informatique'];

function uniqueIds(items, label) {
  const ids = items.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, `${label}: IDs dupliqués`);
  assert.ok(ids.every((id) => typeof id === 'string' && id.length > 0), `${label}: ID vide`);
}

test('C24 staged couvre les 13 blocs officiels de mathématiques 6e', () => {
  assert.equal(mapping.mission, 'C24');
  assert.equal(mapping.status, 'staged');
  assert.equal(mapping.source.nor, 'MENE2504620A');
  assert.equal(mapping.source.application6e, 'Rentrée scolaire 2025-2026');
  assert.equal(mapping.c24Contract.coverage, 'complete-6e');
  assert.equal(mapping.chapters.length, 13);
  assert.deepEqual(mapping.chapters.map((item) => item.slug), slugs);
});

test('C24 staged certifie les paquets cours, exercices N1-N3, quiz et flashcards', () => {
  let exercises = 0;
  let quizQuestions = 0;
  let flashcards = 0;
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    for (const file of ['meta.json','cours.mdx','exercices.json','exercices-n3.json','quiz.json','flashcards.json']) {
      assert.ok(existsSync(join(dir, file)), `${slug}: ${file} manquant`);
    }
    const meta = JSON.parse(readFileSync(join(dir, 'meta.json'), 'utf8'));
    const course = readFileSync(join(dir, 'cours.mdx'), 'utf8');
    const base = JSON.parse(readFileSync(join(dir, 'exercices.json'), 'utf8')).exercices;
    const n3 = JSON.parse(readFileSync(join(dir, 'exercices-n3.json'), 'utf8')).exercices;
    const quiz = JSON.parse(readFileSync(join(dir, 'quiz.json'), 'utf8')).questions;
    const cards = JSON.parse(readFileSync(join(dir, 'flashcards.json'), 'utf8')).cards;

    assert.equal(meta.niveau, '6eme');
    assert.equal(meta.slug, slug);
    assert.equal(meta.officialSource, 'bo-cycle3-mathematiques-2025');
    assert.equal(meta.programme, 'bo-cycle3-mathematiques-2025');
    assert.equal(meta.applicableFrom, '2025-2026');
    assert.equal(meta.seo?.noindex, true, `${slug}: doit rester noindex en staged`);
    assert.match(meta.seo?.canonical ?? '', new RegExp(`/mathematiques/college/6eme/${slug}$`));
    assert.match(course, /## Synthèse/);

    assert.equal(base.filter((item) => item.level === 'N1').length, 2, `${slug}: 2 N1 attendus`);
    assert.equal(base.filter((item) => item.level === 'N2').length, 2, `${slug}: 2 N2 attendus`);
    assert.equal(n3.length, 2, `${slug}: 2 N3 attendus`);
    assert.ok(n3.every((item) => Number(item.difficulty) === 3), `${slug}: difficulté N3 incohérente`);
    uniqueIds([...base, ...n3], `${slug} exercices`);
    assert.equal(quiz.length, 5, `${slug}: 5 quiz attendus`);
    uniqueIds(quiz, `${slug} quiz`);
    assert.equal(cards.length, 6, `${slug}: 6 flashcards attendues`);
    uniqueIds(cards, `${slug} flashcards`);
    exercises += base.length + n3.length;
    quizQuestions += quiz.length;
    flashcards += cards.length;
  }
  assert.equal(exercises, 78);
  assert.equal(quizQuestions, 65);
  assert.equal(flashcards, 78);
});

test('C24 staged ne publie encore aucune route de mathématiques 6e', () => {
  assert.match(levels, /slug:\s*"6eme"[\s\S]*?status:\s*"planned"/);
  assert.ok(!routes.some((route) => route === '/mathematiques/college/6eme' || route.startsWith('/mathematiques/college/6eme/')));
  assert.equal(mapping.c24Contract.publicLevelStatus, 'planned');
  assert.equal(mapping.publication.stagedRoutesExpected, 0);
  assert.equal(mapping.publication.activationRoutesExpected, 14);
});

test('C24 maintient les bornes de 6e et reporte la migration massive des figures', () => {
  assert.ok(mapping.deferredAfterC24.some((item) => item.mission === 'C31' && /LaTeX|TikZ|PGFPlots/.test(item.scope)));
  const forbidden = [/Pythagore/i, /Thal[eè]s/i, /trigonom/i, /équation du second degré/i, /fonction affine/i, /logarith/i];
  for (const slug of slugs) {
    const dir = join(chaptersRoot, slug);
    const resources = ['cours.mdx','exercices.json','exercices-n3.json','quiz.json','flashcards.json'].map((file) => readFileSync(join(dir, file), 'utf8')).join('\n');
    for (const pattern of forbidden) assert.doesNotMatch(resources, pattern, `${slug}: notion hors périmètre 6e détectée`);
  }
});
