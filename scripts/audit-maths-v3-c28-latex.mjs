// C28 certified preview trigger — 2026-09-08
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const LEVEL_ROOT=path.join(ROOT,"src","data","mathematiques","chapters","lycee","terminale-mathematiques-complementaires");
const MAPPING_FILE=path.join(ROOT,"src","data","mathematiques","programmes","terminale-complementaires-2019.mapping.json");
const EXPECTED_CHAPTERS=9;
const SUPPORTED_ENVIRONMENTS=new Set(["itemize","enumerate","tabular","array","verbatim","lstlisting","definition","propriete","methode","exemple","attention","remarque","aretenir"]);
const CANONICAL_SKILLS=["chercher","modéliser","représenter","raisonner","calculer","communiquer"];
const readJson=file=>JSON.parse(readFileSync(file,"utf8"));
const count=(text,regexp)=>[...text.matchAll(regexp)].length;
const correctionText=exercise=>Array.isArray(exercise.correction)?exercise.correction.join(" "):String(exercise.correction??"");

function stripLatexAndCode(value){
 return String(value??"")
  .replace(/`[^`]*`/g," ")
  .replace(/\$\$[\s\S]*?\$\$/g," ")
  .replace(/\$[^$\n]+\$/g," ")
  .replace(/\\\\\([\s\S]*?\\\\\)/g," ")
  .replace(/\\\\\[[\s\S]*?\\\\\]/g," ");
}
function rawMathIssue(value){
 const remaining=stripLatexAndCode(value);
 const suspicious=remaining.match(/(?:\d+[.,]\d+|\d+\s*%|\d+\s*[×÷=<>≈≤≥+−*/]\s*\d+|[A-Za-z]\s*[∩∪=<>≈≤≥]\s*[A-Za-z0-9]|[∩∪√∞])/u);
 return suspicious?.[0]??null;
}
const errors=[];
function validateLatexFields(label,fields){
 for(const [field,value] of fields){
  if(typeof value!=="string") continue;
  const issue=rawMathIssue(value);
  if(issue) errors.push(label+": écriture mathématique hors LaTeX dans "+field+" -> "+issue);
 }
}
function environmentBalance(tex){
 const begins=new Map(),ends=new Map();
 for(const m of tex.matchAll(/\\begin\{([^}]+)\}/g)) begins.set(m[1],(begins.get(m[1])??0)+1);
 for(const m of tex.matchAll(/\\end\{([^}]+)\}/g)) ends.set(m[1],(ends.get(m[1])??0)+1);
 const names=new Set([...begins.keys(),...ends.keys()]);
 return [...names].filter(name=>(begins.get(name)??0)!==(ends.get(name)??0)).map(name=>({name,begin:begins.get(name)??0,end:ends.get(name)??0}));
}

const mapping=readJson(MAPPING_FILE);
const slugs=mapping.chapters??[];
const chapterDirs=slugs.map(slug=>path.join(LEVEL_ROOT,slug));
const metrics=[];

for(const dir of chapterDirs){
 const slug=path.basename(dir);
 const meta=readJson(path.join(dir,"meta.json"));
 const texFile=path.join(dir,"cours.tex");
 const exercisesFile=path.join(dir,"exercices.json");
 const quizFile=path.join(dir,"quiz.json");
 const flashFile=path.join(dir,"flashcards.json");

 if(meta.courseFormat!=="latex") errors.push(slug+": courseFormat != latex");
 if(meta.courseSource!=="cours.tex") errors.push(slug+": courseSource != cours.tex");
 if(Number(meta.courseFormatVersion)!==3) errors.push(slug+": courseFormatVersion != 3");
 if(Number(meta.courseQualityVersion)!==3) errors.push(slug+": courseQualityVersion != 3");
 if(Number(meta.contentQualityVersion)!==3) errors.push(slug+": contentQualityVersion != 3");
 if(meta.officialSource!=="bo-2019-mathematiques-complementaires-terminale") errors.push(slug+": mauvaise source officielle");
 if(meta.programmeVersion!=="mathematiques-complementaires-2019") errors.push(slug+": mauvaise version de programme");
 if(!Array.isArray(meta.objectives)||meta.objectives.length<4) errors.push(slug+": moins de 4 objectifs");
 if(!Array.isArray(meta.curriculumItems)||meta.curriculumItems.length<4) errors.push(slug+": curriculumItems insuffisants");

 for(const file of [texFile,exercisesFile,quizFile,flashFile]) if(!existsSync(file)) errors.push(slug+": fichier absent -> "+path.basename(file));
 if(existsSync(path.join(dir,"cours.mdx"))) errors.push(slug+": cours.mdx résiduel");
 if(![texFile,exercisesFile,quizFile,flashFile].every(existsSync)) continue;

 const tex=readFileSync(texFile,"utf8");
 const normalized=tex.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
 const significant=tex.replace(/\s+/g," ").trim().length;
 const sections=count(tex,/^\\section\*?\{.+\}\s*$/gm);
 const displayOpen=count(tex,/^\\\[\s*$/gm);
 const displayClose=count(tex,/^\\\]\s*$/gm);
 const figurePaths=[...tex.matchAll(/^\\coursefigure\{([^}]+)\}/gm)].map(m=>m[1]);
 const figures=figurePaths.length;
 const environments=[...new Set([...tex.matchAll(/\\begin\{([^}]+)\}/g)].map(m=>m[1]))];

 if(significant<7000) errors.push(slug+": cours trop court ("+significant+" < 7000)");
 if(sections<6) errors.push(slug+": moins de 6 sections");
 if(figures<2) errors.push(slug+": moins de 2 figures pédagogiques");
 if(displayOpen!==displayClose) errors.push(slug+": blocs \\[...\\] déséquilibrés");
 if(!/^\\section\*?\{Objectifs\}/m.test(tex)) errors.push(slug+": section Objectifs absente");
 if(!/^\\section\*?\{.*Erreurs? frequentes.*\}/mi.test(normalized)) errors.push(slug+": section Erreurs fréquentes absente");
 if(!/^\\section\*?\{.*A retenir.*\}/mi.test(normalized)) errors.push(slug+": section À retenir absente");
 for(const issue of environmentBalance(tex)) errors.push(slug+": environnement "+issue.name+" déséquilibré ("+issue.begin+"/"+issue.end+")");
 for(const env of environments) if(!SUPPORTED_ENVIRONMENTS.has(env)) errors.push(slug+": environnement non supporté -> "+env);
 const forbidden=[["titre Markdown",/^#{1,6}\s+/m],["gras Markdown",/\*\*[^*]+\*\*/],["bloc Markdown",/```/],["figure HTML",/<(?:figure|img|svg|figcaption)\b/i]];
 for(const [label,regexp] of forbidden) if(regexp.test(tex)) errors.push(slug+": résidu "+label);

 for(const figureUrl of figurePaths){
  if(!figureUrl.startsWith("/")){errors.push(slug+": figure non locale -> "+figureUrl);continue;}
  const figureFile=path.join(ROOT,"public",figureUrl.replace(/^\/+/, ""));
  if(!existsSync(figureFile)){errors.push(slug+": figure absente -> "+figureUrl);continue;}
  const svg=readFileSync(figureFile,"utf8");
  if(!/<svg\b/i.test(svg)||!/role=["']img["']/i.test(svg)) errors.push(slug+": SVG non accessible -> "+figureUrl);
  if(!/<title\b/i.test(svg)||!/<desc\b/i.test(svg)) errors.push(slug+": SVG sans title/desc -> "+figureUrl);
 }

 const exercises=readJson(exercisesFile).exercices??[];
 const levels={N1:0,N2:0,N3:0},exerciseIds=new Set(),types=new Set(),skills=new Set(),curriculumCovered=new Set();
 let developed=0;
 if(exercises.length!==12) errors.push(slug+": "+exercises.length+" exercices au lieu de 12");
 for(const exercise of exercises){
  if(levels[exercise.level]!==undefined) levels[exercise.level]+=1; else errors.push(slug+": niveau exercice invalide -> "+exercise.id);
  if(exerciseIds.has(exercise.id)) errors.push(slug+": id exercice dupliqué -> "+exercise.id); exerciseIds.add(exercise.id);
  if(exercise.pedagogicalType) types.add(exercise.pedagogicalType);
  for(const skill of exercise.skills??[]) skills.add(skill);
  for(const item of exercise.curriculumItems??[]){curriculumCovered.add(item);if(!(meta.curriculumItems??[]).includes(item)) errors.push(slug+": curriculumItem hors chapitre -> "+exercise.id);}
  const statementLength=String(exercise.statement??"").trim().length;
  const correctionLength=correctionText(exercise).trim().length;
  const questions=Array.isArray(exercise.questions)?exercise.questions:[];
  const minQuestions=exercise.level==="N1"?1:exercise.level==="N2"?2:3;
  const minStatement=exercise.level==="N1"?45:exercise.level==="N2"?90:120;
  const minCorrection=exercise.level==="N1"?45:exercise.level==="N2"?110:170;
  if(questions.length<minQuestions) errors.push(slug+": questions insuffisantes -> "+exercise.id+" ("+questions.length+" < "+minQuestions+")");
  if(statementLength<minStatement) errors.push(slug+": énoncé trop court -> "+exercise.id+" ("+statementLength+" < "+minStatement+")");
  if(correctionLength<minCorrection) errors.push(slug+": correction trop courte -> "+exercise.id+" ("+correctionLength+" < "+minCorrection+")");
  if(Array.isArray(exercise.correction)&&exercise.correction.length<questions.length) errors.push(slug+": correction non alignée -> "+exercise.id);
  validateLatexFields(slug+"/"+exercise.id,[["statement",exercise.statement],["consigne",exercise.consigne],...questions.map((value,index)=>["questions["+index+"]",typeof value==="string"?value:value?.text??value?.question]),["hint clue",exercise.hints?.clue],["hint method",exercise.hints?.method],["hint reminder",exercise.hints?.reminder],["hint commonMistake",exercise.hints?.commonMistake],...((Array.isArray(exercise.correction)?exercise.correction:[exercise.correction]).map((value,index)=>["correction["+index+"]",value]))]);
  if((exercise.level==="N2"||exercise.level==="N3")&&statementLength>=100&&correctionLength>=140) developed+=1;
 }
 for(const level of ["N1","N2","N3"]) if(levels[level]!==4) errors.push(slug+": "+level+"="+levels[level]+" au lieu de 4");
 if(developed<4) errors.push(slug+": seulement "+developed+" problèmes N2/N3 développés (< 4)");
 if(types.size<3) errors.push(slug+": diversité pédagogique insuffisante ("+types.size+" types)");
 for(const skill of CANONICAL_SKILLS) if(!skills.has(skill)) errors.push(slug+": compétence non mobilisée -> "+skill);
 const curriculum=meta.curriculumItems??[];
 const curriculumRate=curriculum.length?curriculum.filter(item=>curriculumCovered.has(item)).length/curriculum.length:0;
 if(curriculumRate<0.8) errors.push(slug+": couverture curriculum < 80 %");

 const quiz=readJson(quizFile).questions??[],quizIds=new Set(),quizExplanations=new Set();
 if(quiz.length<10) errors.push(slug+": quiz insuffisant ("+quiz.length+" < 10)");
 for(const item of quiz){
  if(quizIds.has(item.id)) errors.push(slug+": id quiz dupliqué -> "+item.id); quizIds.add(item.id);
  if(!Array.isArray(item.choices)||item.choices.length<2) errors.push(slug+": choix quiz insuffisants -> "+item.id);
  const explanation=String(item.explanation??"").trim();
  if(explanation.length<25) errors.push(slug+": explication quiz trop courte -> "+item.id);
  const normalizedExplanation=explanation.toLocaleLowerCase("fr").replace(/\s+/g," ");
  if(normalizedExplanation&&quizExplanations.has(normalizedExplanation)) errors.push(slug+": explication quiz dupliquée -> "+item.id);
  quizExplanations.add(normalizedExplanation);
  validateLatexFields(slug+"/"+item.id,[["question",item.question??item.prompt],...((item.choices??[]).map((value,index)=>["choices["+index+"]",value])),["explanation",item.explanation]]);
 }

 const cards=readJson(flashFile).cards??[],flashIds=new Set();
 if(cards.length<12) errors.push(slug+": flashcards insuffisantes ("+cards.length+" < 12)");
 for(const card of cards){
  if(flashIds.has(card.id)) errors.push(slug+": id flashcard dupliqué -> "+card.id); flashIds.add(card.id);
  if(String(card.front??"").trim().length<2||String(card.back??"").trim().length<2) errors.push(slug+": flashcard vide -> "+card.id);
  validateLatexFields(slug+"/"+card.id,[["front",card.front],["back",card.back]]);
 }
 metrics.push({slug,significant,sections,figures,exercises:exercises.length,levels,developed,pedagogicalTypes:types.size,skills:skills.size,curriculumCoverage:Math.round(curriculumRate*100),quiz:quiz.length,flashcards:cards.length});
}

if(chapterDirs.length!==EXPECTED_CHAPTERS) errors.push("C28: "+chapterDirs.length+" chapitres trouvés au lieu de "+EXPECTED_CHAPTERS);
console.log("Audit Mathématiques V3 — C28 Terminale mathématiques complémentaires");
for(const item of metrics) console.log("- "+item.slug+": "+item.significant+" car., "+item.figures+" figures, ex "+item.exercises+" ("+item.levels.N1+"/"+item.levels.N2+"/"+item.levels.N3+"), développés "+item.developed+", types "+item.pedagogicalTypes+", compétences "+item.skills+"/6, curriculum "+item.curriculumCoverage+" %, quiz "+item.quiz+", flash "+item.flashcards);
if(errors.length){console.error("\nECHEC — "+errors.length+" anomalie(s)");for(const error of errors) console.error("  - "+error);process.exit(1);}
console.log("\nOK — les 9 paquets C28 satisfont le contrat pédagogique V3.");
