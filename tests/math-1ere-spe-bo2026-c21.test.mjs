import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root=process.cwd();
const chaptersRoot=join(root,'src/data/mathematiques/chapters/lycee/1ere-specialite-mathematiques');
const mapping=JSON.parse(readFileSync(join(root,'src/data/mathematiques/programmes/premiere-spe-2026.mapping.json'),'utf8'));
const levels=readFileSync(join(root,'src/data/mathematiques/levels.ts'),'utf8');
const routes=JSON.parse(readFileSync(join(root,'tests/fixtures/dist-routes.snapshot.json'),'utf8'));
const slugs=['suites-numeriques-modeles-discrets','second-degre','derivation','variations-courbes','fonction-exponentielle','trigonometrie'];

function unique(items,label){const ids=items.map(x=>x.id);assert.equal(new Set(ids).size,ids.length,`${label}: IDs dupliqués`);}
function c21Chapters(){return mapping.chapters.filter((chapter)=>chapter.mission==='C21'||slugs.includes(chapter.slug));}
function published(){return mapping.scope.publicLevelStatus==='available';}

test('C21 verrouille durablement le BO 2026 et ses six chapitres algèbre/analyse',()=>{
 assert.equal(mapping.source.nor,'MENE2602917A');
 assert.equal(mapping.source.application,'Rentrée scolaire 2026-2027');
 assert.deepEqual(c21Chapters().map(x=>x.slug),slugs);
 assert.deepEqual([...new Set(c21Chapters().map(x=>x.part))],['Algèbre','Analyse']);
});

test('C21 conserve six paquets pédagogiques complets pendant et après C22',()=>{
 for(const slug of slugs){
  const dir=join(chaptersRoot,slug);
  for(const file of ['meta.json','cours.mdx','exercices.json','quiz.json','flashcards.json']) assert.ok(existsSync(join(dir,file)),`${slug}: ${file} manquant`);
  const meta=JSON.parse(readFileSync(join(dir,'meta.json'),'utf8'));
  const ex=JSON.parse(readFileSync(join(dir,'exercices.json'),'utf8')).exercices;
  const q=JSON.parse(readFileSync(join(dir,'quiz.json'),'utf8')).questions;
  const fc=JSON.parse(readFileSync(join(dir,'flashcards.json'),'utf8')).cards;
  assert.equal(meta.officialSource,mapping.programmeId);
  assert.equal(meta.programme,mapping.programmeId);
  assert.equal(Boolean(meta.seo.noindex),!published());
  assert.equal(meta.seo.canonical,`/mathematiques/lycee/1ere-specialite-mathematiques/${slug}`);
  assert.ok(ex.filter(x=>x.level==='N1').length>=2);
  assert.ok(ex.filter(x=>x.level==='N2').length>=2);
  assert.ok(ex.filter(x=>x.level==='N3').length>=2);
  assert.ok(ex.every(x=>Array.isArray(x.correction)&&x.correction.length>0));
  assert.ok(q.length>=5);assert.ok(fc.length>=6);unique(ex,`${slug} exercices`);unique(q,`${slug} quiz`);unique(fc,`${slug} flashcards`);
  const course=readFileSync(join(dir,'cours.mdx'),'utf8');assert.match(course,/## Synthèse/i);
 }
 if(published()){
  assert.match(levels,/slug:\s*"1ere-specialite-mathematiques"[\s\S]*?status:\s*"available"/);
 }else{
  assert.match(levels,/slug:\s*"1ere-specialite-mathematiques"[\s\S]*?status:\s*"planned"/);
  assert.equal(routes.some(r=>r.startsWith('/mathematiques/lycee/1ere-specialite-mathematiques')),false,'C21-C22 ne doivent pas publier un programme incomplet');
 }
});

test('C21 maintient les bornes pédagogiques sensibles du BO',()=>{
 const suites=readFileSync(join(chaptersRoot,'suites-numeriques-modeles-discrets','cours.mdx'),'utf8');
 const sd=readFileSync(join(chaptersRoot,'second-degre','cours.mdx'),'utf8');
 assert.match(suites,/Aucune définition formelle/i);
 assert.match(sd,/cas général n'est pas un attendu/i);
 assert.ok(mapping.chapters.some(x=>x.part==='Géométrie'));
 assert.ok(mapping.boundaries.some(x=>/C30-C31/.test(x)));
});

test('C21 conserve une preuve textuelle de chacune de ses sections après extension C22',()=>{
 for(const chapter of c21Chapters()){const text=readFileSync(join(chaptersRoot,chapter.slug,'cours.mdx'),'utf8').toLocaleLowerCase('fr');for(const token of chapter.evidence) assert.ok(text.includes(token.toLocaleLowerCase('fr')),`${chapter.slug}: preuve absente ${token}`);}
});