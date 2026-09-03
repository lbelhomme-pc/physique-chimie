import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const chaptersRoot=join(root,'src/data/mathematiques/chapters/lycee/1ere-generale');
const mapping=JSON.parse(readFileSync(join(root,'src/data/mathematiques/programmes/premiere-es-integrees-2026.mapping.json'),'utf8'));
const levels=readFileSync(join(root,'src/data/mathematiques/levels.ts'),'utf8');
const routes=JSON.parse(readFileSync(join(root,'tests/fixtures/dist-routes.snapshot.json'),'utf8'));
const slugs=['analyse-information-chiffree','phenomenes-aleatoires','variation-lineaire','modelisation-quadratique','variation-exponentielle'];
const levelPath='/mathematiques/lycee/1ere-generale';
function unique(items,label){const ids=items.map(x=>x.id);assert.equal(new Set(ids).size,ids.length,`${label}: IDs dupliqués`);}
function published(){return mapping.scope.publicLevelStatus==='available';}

test('C23 verrouille le BO 2026 des mathématiques intégrées à l enseignement scientifique',()=>{
 assert.equal(mapping.mission,'C23');
 assert.equal(mapping.source.nor,'MENE2602916A');
 assert.equal(mapping.source.application,'Rentrée scolaire 2026-2027');
 assert.deepEqual(mapping.chapters.map(x=>x.slug),slugs);
 assert.deepEqual(mapping.scope.parts,["Analyse de l'information chiffrée","Phénomènes aléatoires","Phénomènes d'évolution"]);
 assert.deepEqual(mapping.scope.transversalParts,['Automatismes']);
});

test('C23 fournit cinq paquets pédagogiques complets avec N1 N2 N3 quiz et flashcards',()=>{
 for(const slug of slugs){
  const dir=join(chaptersRoot,slug);
  for(const file of ['meta.json','cours.mdx','exercices.json','quiz.json','flashcards.json']) assert.ok(existsSync(join(dir,file)),`${slug}: ${file} manquant`);
  const meta=JSON.parse(readFileSync(join(dir,'meta.json'),'utf8'));
  const ex=JSON.parse(readFileSync(join(dir,'exercices.json'),'utf8')).exercices;
  const q=JSON.parse(readFileSync(join(dir,'quiz.json'),'utf8')).questions;
  const fc=JSON.parse(readFileSync(join(dir,'flashcards.json'),'utf8')).cards;
  assert.equal(meta.officialSource,mapping.programmeId);
  assert.equal(meta.programme,mapping.programmeId);
  assert.equal(meta.seo.canonical,`${levelPath}/${slug}`);
  assert.equal(Boolean(meta.seo.noindex),!published());
  assert.ok(ex.filter(x=>x.level==='N1').length>=2);
  assert.ok(ex.filter(x=>x.level==='N2').length>=2);
  assert.ok(ex.filter(x=>x.level==='N3').length>=2);
  assert.ok(ex.every(x=>Array.isArray(x.correction)&&x.correction.length>0));
  assert.ok(q.length>=5);assert.ok(fc.length>=6);unique(ex,`${slug} exercices`);unique(q,`${slug} quiz`);unique(fc,`${slug} flashcards`);
  const course=readFileSync(join(dir,'cours.mdx'),'utf8');
  assert.match(course,/## Synthèse/i);assert.match(course,/## Automatismes à entretenir/i);assert.ok(!/^#\s/m.test(course),`${slug}: le H1 est fourni par la page Astro`);
 }
});

test('C23 conserve les bornes pédagogiques sensibles du BO',()=>{
 const stats=readFileSync(join(chaptersRoot,'analyse-information-chiffree','cours.mdx'),'utf8');
 const proba=readFileSync(join(chaptersRoot,'phenomenes-aleatoires','cours.mdx'),'utf8');
 const quad=readFileSync(join(chaptersRoot,'modelisation-quadratique','cours.mdx'),'utf8');
 const exp=readFileSync(join(chaptersRoot,'variation-exponentielle','cours.mdx'),'utf8');
 assert.match(stats,/Aucune connaissance théorique sur les moindres carrés n’est exigée/i);
 assert.match(proba,/quatre répétitions identiques et indépendantes/i);
 assert.match(quad,/discriminant ne figure pas au programme/i);
 assert.match(quad,/aucune formule générale du sommet n’est attendue/i);
 assert.match(exp,/x\\mapsto a\^x/);
 assert.match(exp,/logarithme, qui n’appartient pas à ce programme/i);
 assert.ok(mapping.boundaries.some(x=>/C30-C31/.test(x)));
});

test('C23 conserve une preuve textuelle de chacune des sections officielles',()=>{
 for(const chapter of mapping.chapters){const text=readFileSync(join(chaptersRoot,chapter.slug,'cours.mdx'),'utf8').toLocaleLowerCase('fr');for(const token of chapter.evidence) assert.ok(text.includes(token.toLocaleLowerCase('fr')),`${chapter.slug}: preuve absente ${token}`);}
});

test('C23 reste staged avant certification puis publie atomiquement niveau et six routes',()=>{
 if(published()){
  assert.match(levels,/slug:\s*"1ere-generale"[\s\S]*?status:\s*"available"/);
  assert.equal(routes.includes(levelPath),true);
  for(const slug of slugs) assert.equal(routes.includes(`${levelPath}/${slug}`),true,`${slug}: route publique absente`);
 }else{
  assert.match(levels,/slug:\s*"1ere-generale"[\s\S]*?status:\s*"planned"/);
  assert.equal(routes.some(r=>r.startsWith(levelPath)),false,'C23 ne doit pas publier avant certification');
 }
});