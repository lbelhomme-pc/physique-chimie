import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  CURRICULUM_VERSIONS,
  PUBLISHED_CONTENT_SCHOOL_YEAR,
  isSchoolYearInWindow,
  parseSchoolYear,
  resolveCurriculumVersion,
} from "../src/data/curriculumVersions.ts";
import { normalizeChapterPackage } from "../src/data/contentAdapters.ts";
import { ProgrammeVersionSchema, SchoolYearSchema } from "../src/data/contentContract.ts";

const root = process.cwd();

function resolve(input) {
  const result = resolveCurriculumVersion(input);
  assert.ok(result, JSON.stringify(input));
  return result;
}

function walkMetaFiles(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkMetaFiles(full));
    else if (entry.isFile() && entry.name === "meta.json") files.push(full);
  }
  return files;
}

function curriculumSourceId(meta) {
  if (typeof meta.programme === "string" && meta.programme.startsWith("bo-")) return meta.programme;
  if (typeof meta.officialSource === "string" && meta.officialSource.trim()) return meta.officialSource.trim();
  return meta.sources?.find((source) => source?.kind === "official" && typeof source.id === "string")?.id;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function packageFor({ discipline, cycle, niveau, matiere, slug }) {
  const directory = discipline === "mathematiques"
    ? path.join(root, "src/data/mathematiques/chapters", cycle, niveau, slug)
    : path.join(root, "src/data/chapters", cycle, niveau, matiere, slug);
  const readOptional = (name) => {
    const file = path.join(directory, name);
    return existsSync(file) ? readJson(file) : undefined;
  };
  return normalizeChapterPackage({
    sourcePath: path.relative(root, path.join(directory, "meta.json")).replaceAll("\\", "/"),
    discipline,
    cycle,
    niveau,
    ...(matiere ? { matiere } : {}),
    slug,
    meta: readJson(path.join(directory, "meta.json")),
    coursePath: path.relative(root, path.join(directory, "cours.mdx")).replaceAll("\\", "/"),
    coursePresent: existsSync(path.join(directory, "cours.mdx")),
    courseFormat: "mdx",
    exercices: readOptional("exercices.json"),
    quiz: readOptional("quiz.json"),
    flashcards: readOptional("flashcards.json"),
  });
}

describe("C09 — versionnement des programmes officiels", () => {
  it("valide strictement le format des annees scolaires", () => {
    assert.deepEqual(parseSchoolYear("2026-2027"), { start: 2026, end: 2027 });
    assert.equal(SchoolYearSchema.safeParse("2026-2027").success, true);
    assert.equal(SchoolYearSchema.safeParse("2026-2028").success, false);
    assert.equal(SchoolYearSchema.safeParse("2026").success, false);
    assert.throws(() => parseSchoolYear("2026-2028"), /consecutive/);
    assert.equal(isSchoolYearInWindow("2026-2027", { appliesFrom: "2026-2027" }), true);
    assert.equal(isSchoolYearInWindow("2025-2026", { appliesFrom: "2026-2027" }), false);
  });

  it("applique le programme de mathématiques cycle 3 publié en 2025 à la 6e", () => {
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "6eme", schoolYear: "2024-2025", sourceId: "bo-cycle3-mathematiques-2020" }).id, "mathematiques-cycle3-2020");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "6eme", schoolYear: "2025-2026", sourceId: "bo-cycle3-mathematiques-2025" }).id, "mathematiques-cycle3-2025");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "6eme", schoolYear: "2026-2027", sourceId: "bo-cycle3-mathematiques-2025" }).id, "mathematiques-cycle3-2025");
    assert.equal(resolveCurriculumVersion({ discipline: "mathematiques", cycle: "college", niveau: "6eme", schoolYear: "2024-2025", sourceId: "bo-cycle3-mathematiques-2025" }), null);
  });

  it("applique progressivement le programme de mathematiques cycle 4 de 2026", () => {
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "5eme", schoolYear: "2025-2026", sourceId: "bo-cycle4-mathematiques-2020" }).id, "mathematiques-cycle4-2020");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "5eme", schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2026" }).id, "mathematiques-cycle4-2026");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "4eme", schoolYear: "2026-2027", sourceId: "bo-cycle4-mathematiques-2020" }).id, "mathematiques-cycle4-2020");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "4eme", schoolYear: "2027-2028", sourceId: "bo-cycle4-mathematiques-2026" }).id, "mathematiques-cycle4-2026");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "3eme", schoolYear: "2027-2028", sourceId: "bo-cycle4-mathematiques-2020" }).id, "mathematiques-cycle4-2020");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "college", niveau: "3eme", schoolYear: "2028-2029", sourceId: "bo-cycle4-mathematiques-2026" }).id, "mathematiques-cycle4-2026");
  });

  it("maintient le programme Sciences et technologie 2023 en 6e jusqu en 2026-2027", () => {
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "college", niveau: "6eme", schoolYear: "2026-2027", sourceId: "bo-cycle3-sciences-technologie-2023" }).id, "sciences-technologie-cycle3-2023");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "college", niveau: "6eme", schoolYear: "2027-2028", sourceId: "bo-cycle3-sciences-technologie-2026" }).id, "sciences-technologie-cycle3-2026");
    assert.equal(resolveCurriculumVersion({ discipline: "physique-chimie", cycle: "college", niveau: "6eme", schoolYear: "2026-2027", sourceId: "bo-cycle3-sciences-technologie-2026" }), null);
  });

  it("bascule les mathematiques de seconde et de premiere a la rentree 2026", () => {
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "2nde", schoolYear: "2025-2026", sourceId: "bo-2019-mathematiques-seconde-gt" }).id, "mathematiques-seconde-2019");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "2nde", schoolYear: "2026-2027", sourceId: "bo-2026-mathematiques-seconde-gt" }).id, "mathematiques-seconde-2026");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "1ere-spe", schoolYear: "2025-2026", sourceId: "bo-2019-mathematiques-premiere-specialite" }).id, "mathematiques-premiere-specialite-2019");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "1ere-spe", schoolYear: "2026-2027", sourceId: "bo-2026-mathematiques-premiere-specialite" }).id, "mathematiques-premiere-specialite-2026");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "1ere-ens-scientifique", schoolYear: "2026-2027", sourceId: "bo-2026-mathematiques-integrees-es-premiere" }).id, "mathematiques-integrees-es-premiere-2026");
  });

  it("ne bascule pas prematurement la terminale mathematique avant 2027-2028", () => {
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "terminale-spe", schoolYear: "2026-2027", sourceId: "bo-2019-mathematiques-terminale-specialite" }).id, "mathematiques-terminale-specialite-2019");
    assert.equal(resolveCurriculumVersion({ discipline: "mathematiques", cycle: "lycee", niveau: "terminale-spe", schoolYear: "2026-2027", sourceId: "bo-2026-mathematiques-terminale-specialite" }), null);
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "terminale-spe", schoolYear: "2027-2028", sourceId: "bo-2026-mathematiques-terminale-specialite" }).id, "mathematiques-terminale-specialite-2026");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "terminale-complementaires", schoolYear: "2026-2027", sourceId: "bo-2019-mathematiques-complementaires-terminale" }).id, "mathematiques-complementaires-2019");
    assert.equal(resolve({ discipline: "mathematiques", cycle: "lycee", niveau: "terminale-complementaires", schoolYear: "2027-2028", sourceId: "bo-2026-mathematiques-complementaires-terminale" }).id, "mathematiques-complementaires-2026");
  });

  it("garde les programmes Physique-Chimie et Enseignement scientifique actuellement applicables", () => {
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "college", niveau: "5eme", schoolYear: "2026-2027", sourceId: "bo-cycle4-physique-chimie-2020" }).id, "physique-chimie-cycle4-2020");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "lycee", niveau: "2nde", schoolYear: "2026-2027", sourceId: "bo-lycee-pc-seconde" }).id, "physique-chimie-seconde-2019");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "lycee", niveau: "1ere-spe", schoolYear: "2026-2027", sourceId: "bo-lycee-pc-premiere-specialite" }).id, "physique-chimie-premiere-specialite-2019");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "lycee", niveau: "terminale-spe", schoolYear: "2026-2027", sourceId: "bo-lycee-pc-terminale-specialite" }).id, "physique-chimie-terminale-specialite-2019");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "lycee", niveau: "1ere-ens-scientifique", schoolYear: "2026-2027", sourceId: "bo-enseignement-scientifique-premiere-2023" }).id, "enseignement-scientifique-premiere-2023");
    assert.equal(resolve({ discipline: "physique-chimie", cycle: "lycee", niveau: "terminale-ens-scientifique", schoolYear: "2026-2027", sourceId: "bo-enseignement-scientifique-terminale-2023" }).id, "enseignement-scientifique-terminale-2023");
  });

  it("ne contient aucune fenetre d application invalide dans le registre", () => {
    assert.ok(CURRICULUM_VERSIONS.length >= 20);
    for (const definition of CURRICULUM_VERSIONS) {
      for (const niveau of definition.niveaux) {
        const application = definition.applicationByLevel[niveau];
        assert.ok(application, `${definition.id}/${niveau}`);
        assert.doesNotThrow(() => parseSchoolYear(application.appliesFrom), `${definition.id}/${niveau}`);
        if (application.appliesUntil) {
          assert.doesNotThrow(() => parseSchoolYear(application.appliesUntil), `${definition.id}/${niveau}`);
          assert.ok(application.appliesUntil >= application.appliesFrom, `${definition.id}/${niveau}`);
        }
      }
    }
  });

  it("versionne tout le corpus actuellement publie pour 2026-2027", () => {
    const roots = [
      { directory: path.join(root, "src/data/chapters"), discipline: "physique-chimie" },
      { directory: path.join(root, "src/data/mathematiques/chapters"), discipline: "mathematiques" },
    ];
    const records = roots.flatMap(({ directory, discipline }) =>
      walkMetaFiles(directory).map((file) => ({ file, discipline })),
    );
    assert.ok(records.length >= 112, `corpus detecte: ${records.length}`);

    for (const record of records) {
      const meta = readJson(record.file);
      const sourceId = curriculumSourceId(meta);
      assert.ok(sourceId, `${record.file}: source officielle manquante`);
      const cycle = record.file.includes(`${path.sep}college${path.sep}`) ? "college" : "lycee";
      const version = resolveCurriculumVersion({
        discipline: record.discipline,
        cycle,
        niveau: meta.niveau,
        schoolYear: PUBLISHED_CONTENT_SCHOOL_YEAR,
        sourceId,
      });
      assert.ok(version, `${record.file}: ${sourceId} non versionne pour ${PUBLISHED_CONTENT_SCHOOL_YEAR}`);
    }
  });

  it("injecte programmeVersion dans le contrat normalise sans changer les canoniques", () => {
    const cases = [
      {
        input: { discipline: "physique-chimie", cycle: "college", niveau: "6eme", matiere: "chimie", slug: "etats-proprietes-matiere" },
        versionId: "sciences-technologie-cycle3-2023",
        canonical: "/college/6eme/chimie/etats-proprietes-matiere",
      },
      {
        input: { discipline: "physique-chimie", cycle: "college", niveau: "5eme", matiere: "chimie", slug: "melanges-dissolution" },
        versionId: "physique-chimie-cycle4-2020",
        canonical: "/college/5eme/chimie/melanges-dissolution",
      },
      {
        input: { discipline: "mathematiques", cycle: "lycee", niveau: "2nde", slug: "arithmetique-ensembles-logique" },
        versionId: "mathematiques-seconde-2026",
        canonical: "/mathematiques/lycee/2nde/arithmetique-ensembles-logique",
      },
    ];

    for (const item of cases) {
      const result = packageFor(item.input);
      assert.equal(result.errors.length, 0, JSON.stringify(result.errors));
      assert.ok(result.package, JSON.stringify(item.input));
      const version = result.package.chapter.programmeVersion;
      assert.equal(version.versionId, item.versionId);
      assert.equal(version.schoolYear, PUBLISHED_CONTENT_SCHOOL_YEAR);
      assert.equal(version.applicable, true);
      assert.equal(ProgrammeVersionSchema.safeParse(version).success, true);
      assert.equal(result.package.chapter.seo.canonical, item.canonical);
    }
  });
});
