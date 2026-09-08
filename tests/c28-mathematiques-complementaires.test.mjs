import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { resolveCurriculumVersion } from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";

const root=process.cwd();
const niveau="terminale-mathematiques-complementaires";
const chapterRoot=path.join(root,"src/data/mathematiques/chapters/lycee",niveau);
const programmeDir=path.join(root,"src/data/mathematiques/programmes");
const current=JSON.parse(readFileSync(path.join(programmeDir,"terminale-complementaires-2019.mapping.json"),"utf8"));
const future=JSON.parse(readFileSync(path.join(programmeDir,"terminale-complementaires-2026.future.mapping.json"),"utf8"));
const readJson=file=>JSON.parse(readFileSync(file,"utf8"));

describe("C28 — Terminale mathématiques complémentaires V3",()=>{
 it("résout le programme 2019 en 2026-2027 pour le slug public",()=>{
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2026-2027",sourceId:"bo-2019-mathematiques-complementaires-terminale"})?.id,"mathematiques-complementaires-2019");
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2026-2027",sourceId:"bo-2026-mathematiques-complementaires-terminale"}),null);
  assert.equal(resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear:"2027-2028",sourceId:"bo-2026-mathematiques-complementaires-terminale"})?.id,"mathematiques-complementaires-2026");
 });

 it("conserve terminale-complementaires comme alias réglementaire équivalent",()=>{
  for(const schoolYear of ["2026-2027","2027-2028"]){
   const sourceId=schoolYear==="2026-2027"?"bo-2019-mathematiques-complementaires-terminale":"bo-2026-mathematiques-complementaires-terminale";
   const a=resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau:"terminale-complementaires",schoolYear,sourceId});
   const b=resolveCurriculumVersion({discipline:"mathematiques",cycle:"lycee",niveau,schoolYear,sourceId});
   assert.equal(a?.id,b?.id);
   assert.equal(a?.appliesFrom,b?.appliesFrom);
   assert.equal(a?.appliesUntil,b?.appliesUntil);
  }
 });

 it("garde le programme 2026 futur sans publication prématurée",()=>{
  assert.equal(future.status,"future");
  assert.equal(future.publication.published,false);
  assert.deepEqual(future.publication.publicRoutes,[]);
  assert.deepEqual(future.publication.activeChapters,[]);
  assert.equal(future.guardrails.firstApplicableSchoolYear,"2027-2028");
 });

 it("reprend exactement les neuf thèmes officiels de 2019",()=>{
  assert.equal(current.organization,"nine-official-study-themes");
  assert.deepEqual(current.chapters,[
   "modeles-fonction-variable",
   "modeles-evolution",
   "histoire-logarithme",
   "calculs-aires",
   "richesses-inegalites",
   "inference-bayesienne",
   "experiences-independantes-echantillonnage",
   "temps-attente",
   "correlation-causalite"
  ]);
 });

 it("publie neuf paquets V3 LaTeX complets",()=>{
  assert.equal(current.contract.chapters,9);
  assert.equal(current.contract.exercisesPerChapter,12);
  assert.deepEqual(current.contract.exerciseDistribution,{N1:4,N2:4,N3:4});
  assert.equal(current.contract.quizPerChapter,10);
  assert.equal(current.contract.flashcardsPerChapter,12);
  assert.equal(current.contract.minimumPedagogicalVisualsPerChapter,2);

  for(const slug of current.chapters){
   const dir=path.join(chapterRoot,slug);
   for(const file of ["meta.json","cours.tex","exercices.json","quiz.json","flashcards.json"])
    assert.equal(existsSync(path.join(dir,file)),true,`${slug}/${file}`);
   assert.equal(existsSync(path.join(dir,"cours.mdx")),false,`${slug}/cours.mdx doit être retiré`);

   const meta=readJson(path.join(dir,"meta.json"));
   const exercices=readJson(path.join(dir,"exercices.json"));
   const quiz=readJson(path.join(dir,"quiz.json"));
   const flash=readJson(path.join(dir,"flashcards.json"));

   assert.equal(meta.officialSource,"bo-2019-mathematiques-complementaires-terminale");
   assert.equal(meta.programmeVersion,"mathematiques-complementaires-2019");
   assert.equal(meta.courseFormat,"latex");
   assert.equal(meta.courseSource,"cours.tex");
   assert.equal(meta.courseFormatVersion,3);
   assert.equal(meta.courseQualityVersion,3);
   assert.equal(meta.contentQualityVersion,3);
   assert.ok(Array.isArray(meta.objectives)&&meta.objectives.length>=4);
   assert.ok(Array.isArray(meta.curriculumItems)&&meta.curriculumItems.length>=4);
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
   assert.equal(normalized.package?.chapter.programmeVersion.versionId,"mathematiques-complementaires-2019");
   assert.equal(normalized.package?.chapter.seo.canonical,`/mathematiques/lycee/${niveau}/${slug}`);
  }
 });

 it("couvre les quatre domaines du programme",()=>{
  assert.deepEqual(current.contentDomains,["analyse","probabilites-statistique","algorithmique-programmation","logique-ensembliste"]);
 });

 it("ne rattache aucun thème au programme 2026 avant 2027-2028",()=>{
  for(const slug of current.chapters){
   const meta=readJson(path.join(chapterRoot,slug,"meta.json"));
   assert.notEqual(meta.officialSource,"bo-2026-mathematiques-complementaires-terminale");
   assert.notEqual(meta.programmeVersion,"mathematiques-complementaires-2026");
  }
 });
});
