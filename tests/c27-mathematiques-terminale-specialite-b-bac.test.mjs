import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root=process.cwd();
const niveau="terminale-specialite-mathematiques";
const chapterRoot=path.join(root,"src/data/mathematiques/chapters/lycee",niveau);
const programmeDir=path.join(root,"src/data/mathematiques/programmes");
const partA=JSON.parse(readFileSync(path.join(programmeDir,"terminale-specialite-2019.part-a.mapping.json"),"utf8"));
const partB=JSON.parse(readFileSync(path.join(programmeDir,"terminale-specialite-2019.part-b.mapping.json"),"utf8"));
const future=JSON.parse(readFileSync(path.join(programmeDir,"terminale-specialite-2026.future.mapping.json"),"utf8"));
const readJson=file=>JSON.parse(readFileSync(file,"utf8"));

describe("C27 — Terminale spécialité partie B + bac V3",()=>{
 it("garde le programme 2019 actif en 2026-2027 et le programme 2026 futur",()=>{
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2026-2027",sourceId:"bo-2019-mathematiques-terminale-specialite"})?.id,"mathematiques-terminale-specialite-2019");
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2026-2027",sourceId:"bo-2026-mathematiques-terminale-specialite"}),null);
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2027-2028",sourceId:"bo-2026-mathematiques-terminale-specialite"})?.id,"mathematiques-terminale-specialite-2026");
  assert.equal(future.publication.published,false);
  assert.deepEqual(future.publication.publicRoutes,[]);
 });

 it("complète exactement les éléments différés par C26",()=>{
  assert.deepEqual(partB.completesDeferredFromC26,partA.deferredToC27);
  assert.equal(partB.fullProgrammeCoverage.c26PartA.length,8);
  assert.equal(partB.fullProgrammeCoverage.c27PartB.length,6);
  assert.equal(partB.fullProgrammeCoverage.totalProgrammeChapters,14);
  assert.equal(partB.fullProgrammeCoverage.complete,true);
  assert.equal(partB.examResources.length,1);
 });

 it("publie 7 paquets V3 LaTeX complets",()=>{
  const slugs=[...partB.programmeChapters,...partB.examResources];
  assert.equal(slugs.length,7);
  for(const slug of slugs){
   const dir=path.join(chapterRoot,slug);
   for(const file of ["meta.json","cours.tex","exercices.json","quiz.json","flashcards.json"])
    assert.equal(existsSync(path.join(dir,file)),true,`${slug}/${file}`);
   assert.equal(existsSync(path.join(dir,"cours.mdx")),false,`${slug}/cours.mdx doit être retiré`);

   const meta=readJson(path.join(dir,"meta.json"));
   const exercices=readJson(path.join(dir,"exercices.json"));
   const quiz=readJson(path.join(dir,"quiz.json"));
   const flash=readJson(path.join(dir,"flashcards.json"));

   assert.equal(meta.officialSource,"bo-2019-mathematiques-terminale-specialite");
   assert.equal(meta.programmeVersion,"mathematiques-terminale-specialite-2019");
   assert.equal(meta.courseFormat,"latex");
   assert.equal(meta.courseSource,"cours.tex");
   assert.equal(meta.courseFormatVersion,3);
   assert.equal(meta.courseQualityVersion,3);
   assert.equal(meta.contentQualityVersion,3);
   assert.ok(Array.isArray(meta.objectives) && meta.objectives.length>=4);
   assert.ok(Array.isArray(meta.curriculumItems) && meta.curriculumItems.length>=4);
   assert.equal(meta.seo.noindex,false);

   assert.equal(exercices.exercices.length,12);
   assert.deepEqual(Object.fromEntries(["N1","N2","N3"].map(level=>[level,exercices.exercices.filter(e=>e.level===level).length])),{N1:4,N2:4,N3:4});
   assert.ok(exercices.exercices.every(e=>Array.isArray(e.questions)&&e.questions.length>0));
   assert.ok(exercices.exercices.every(e=>Array.isArray(e.correction)&&e.correction.length>0));
   assert.equal(quiz.questions.length,10);
   assert.equal(flash.cards.length,12);

   const normalized=normalizeChapterPackage({
    sourcePath:path.relative(root,path.join(dir,"meta.json")).replaceAll("\\","/"),
    discipline:"mathematiques",cycle:"lycee",niveau,slug,meta,
    coursePath:path.relative(root,path.join(dir,"cours.tex")).replaceAll("\\","/"),
    coursePresent:true,courseFormat:"latex",exercices,quiz,flashcards:flash
   });
   assert.deepEqual(normalized.errors,[],`${slug}: ${JSON.stringify(normalized.errors)}`);
   assert.equal(normalized.package?.chapter.programmeVersion.versionId,"mathematiques-terminale-specialite-2019");
   assert.equal(normalized.package?.chapter.seo.canonical,`/mathematiques/lycee/${niveau}/${slug}`);
  }
 });

 it("encode le format actuel de l'épreuve de spécialité avec une référence officielle 2026",()=>{
  assert.deepEqual(partB.bac,{
   durationHours:4,coefficient:16,exercises:4,
   source:"https://eduscol.education.gouv.fr/5706/les-epreuves-terminales-du-baccalaureat-general",
   structureSource:"https://eduscol.education.gouv.fr/sites/default/files/document/nds-consolidee-definition-epreuve-bac-maths-102105.pdf",
   referenceSubject2026:"https://www.education.gouv.fr/sites/default/files/document/baccalaureat-general-2026-mathematiques-jour-1-517442.pdf"
  });
  const meta=readJson(path.join(chapterRoot,"preparation-bac-specialite-mathematiques","meta.json"));
  assert.ok(meta.sources.some(source=>source.id==="eduscol-bac-general-epreuves-terminales-2026"));
  assert.ok(meta.sources.some(source=>source.id==="bo-maths-bac-structure-consolidee"));
  assert.ok(meta.sources.some(source=>source.id==="bac-maths-2026-jour1" && source.url===partB.bac.referenceSubject2026));
 });

 it("aucun chapitre C26/C27 n'est rattaché prématurément au programme 2026",()=>{
  const slugs=[...partB.fullProgrammeCoverage.c26PartA,...partB.fullProgrammeCoverage.c27PartB,...partB.examResources];
  for(const slug of slugs){
   const meta=readJson(path.join(chapterRoot,slug,"meta.json"));
   assert.notEqual(meta.officialSource,"bo-2026-mathematiques-terminale-specialite");
   assert.notEqual(meta.programmeVersion,"mathematiques-terminale-specialite-2026");
  }
 });
});
