import fs from "node:fs";
import path from "node:path";
import { normalizeChapterPackage, type ChapterPackageInput } from "./contentAdapters.ts";
import type { ChapterPackageContract } from "./contentContract.ts";

export interface ContentContractAudit {
  generatedAt: string;
  summary: {
    chapters: number;
    pcChapters: number;
    mathChapters: number;
    conformes: number;
    adaptes: number;
    incompletsPubliables: number;
    bloquants: number;
    exerciseFormats: Record<string, number>;
    quizFormats: Record<string, number>;
    flashcardFormats: Record<string, number>;
  };
  chapters: Array<{
    file: string;
    canonicalId: string | null;
    discipline: string;
    route: string;
    status: "conforme" | "adapte" | "incomplet-publiable" | "bloquant";
    adaptedFields: string[];
    missingEditorialFields: string[];
    errors: string[];
  }>;
  errors: string[];
}

function rel(root: string, file: string): string {
  return path.relative(root, file).replaceAll(path.sep, "/");
}

function walkFiles(start: string, name: string): string[] {
  if (!fs.existsSync(start)) return [];
  const files: string[] = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === name) files.push(full);
    }
  }
  return files.sort();
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function readJsonIfExists(file: string): unknown {
  return fs.existsSync(file) ? readJson(file) : undefined;
}

function resourceFormat(raw: unknown, canonical: string, aliases: string[]): string {
  if (Array.isArray(raw)) return "array-root";
  if (!raw || typeof raw !== "object") return "absent";
  const record = raw as Record<string, unknown>;
  if (Array.isArray(record[canonical])) return canonical;
  const alias = aliases.find((key) => Array.isArray(record[key]));
  return alias ?? "unknown";
}

function inc(target: Record<string, number>, key: string) {
  target[key] = (target[key] ?? 0) + 1;
}

function inputFromMeta(root: string, metaFile: string): ChapterPackageInput | null {
  const relative = rel(root, metaFile);
  const parts = relative.split("/");
  const dir = path.dirname(metaFile);

  if (relative.startsWith("src/data/chapters/")) {
    const [cycle, niveau, matiere, slug] = parts.slice(parts.indexOf("chapters") + 1, -1);
    if ((cycle !== "college" && cycle !== "lycee") || (matiere !== "physique" && matiere !== "chimie") || !niveau || !slug) return null;
    const coursMdx = path.join(dir, "cours.mdx");
    const coursFragment = path.join(dir, "cours.fragment.html");
    return {
      sourcePath: relative,
      discipline: "physique-chimie",
      cycle,
      niveau,
      matiere,
      slug,
      meta: readJson(metaFile),
      coursePath: fs.existsSync(coursMdx) ? rel(root, coursMdx) : rel(root, coursFragment),
      coursePresent: fs.existsSync(coursMdx) || fs.existsSync(coursFragment),
      courseFormat: fs.existsSync(coursMdx) ? "mdx" : "legacy-html-fragment",
      exercices: readJsonIfExists(path.join(dir, "exercices.json")),
      quiz: readJsonIfExists(path.join(dir, "quiz.json")),
      flashcards: readJsonIfExists(path.join(dir, "flashcards.json")),
    };
  }

  if (relative.startsWith("src/data/mathematiques/chapters/")) {
    const [cycle, niveau, slug] = parts.slice(parts.indexOf("chapters") + 1, -1);
    if ((cycle !== "college" && cycle !== "lycee") || !niveau || !slug) return null;
    const coursMdx = path.join(dir, "cours.mdx");
    const coursFragment = path.join(dir, "cours.fragment.html");
    return {
      sourcePath: relative,
      discipline: "mathematiques",
      cycle,
      niveau,
      slug,
      meta: readJson(metaFile),
      coursePath: fs.existsSync(coursMdx) ? rel(root, coursMdx) : rel(root, coursFragment),
      coursePresent: fs.existsSync(coursMdx) || fs.existsSync(coursFragment),
      courseFormat: fs.existsSync(coursMdx) ? "mdx" : "legacy-html-fragment",
      exercices: readJsonIfExists(path.join(dir, "exercices.json")),
      quiz: readJsonIfExists(path.join(dir, "quiz.json")),
      flashcards: readJsonIfExists(path.join(dir, "flashcards.json")),
    };
  }

  return null;
}

function routeFor(input: ChapterPackageInput): string {
  return input.discipline === "mathematiques"
    ? `/mathematiques/${input.cycle}/${input.niveau}/${input.slug}`
    : `/${input.cycle}/${input.niveau}/${input.matiere}/${input.slug}`;
}

export function auditContentContracts(root = process.cwd()): ContentContractAudit {
  const metaFiles = [
    ...walkFiles(path.join(root, "src/data/chapters"), "meta.json"),
    ...walkFiles(path.join(root, "src/data/mathematiques/chapters"), "meta.json"),
  ];
  const audit: ContentContractAudit = {
    generatedAt: new Date().toISOString(),
    summary: {
      chapters: 0,
      pcChapters: 0,
      mathChapters: 0,
      conformes: 0,
      adaptes: 0,
      incompletsPubliables: 0,
      bloquants: 0,
      exerciseFormats: {},
      quizFormats: {},
      flashcardFormats: {},
    },
    chapters: [],
    errors: [],
  };

  for (const metaFile of metaFiles) {
    let input: ChapterPackageInput | null = null;
    try {
      input = inputFromMeta(root, metaFile);
      if (!input) continue;
      audit.summary.chapters += 1;
      if (input.discipline === "physique-chimie") audit.summary.pcChapters += 1;
      if (input.discipline === "mathematiques") audit.summary.mathChapters += 1;
      inc(audit.summary.exerciseFormats, resourceFormat(input.exercices, "exercices", ["exercises"]));
      inc(audit.summary.quizFormats, resourceFormat(input.quiz, "questions", ["quiz"]));
      inc(audit.summary.flashcardFormats, resourceFormat(input.flashcards, "cards", ["flashcards"]));

      const result = normalizeChapterPackage(input);
      const item = result.package as ChapterPackageContract | null;
      const status = item?.validation.status ?? "bloquant";
      if (status === "conforme") audit.summary.conformes += 1;
      if (status === "adapte") audit.summary.adaptes += 1;
      if (status === "incomplet-publiable") audit.summary.incompletsPubliables += 1;
      if (status === "bloquant") audit.summary.bloquants += 1;
      audit.errors.push(...result.errors);
      audit.chapters.push({
        file: input.sourcePath,
        canonicalId: item?.chapter.canonicalId ?? null,
        discipline: input.discipline,
        route: routeFor(input),
        status,
        adaptedFields: item?.chapter.legacy.adaptedFields ?? [],
        missingEditorialFields: item?.chapter.legacy.missingEditorialFields ?? [],
        errors: result.errors,
      });
    } catch (error) {
      const file = input?.sourcePath ?? rel(root, metaFile);
      const message = `${file} :: (lecture) :: ${error instanceof Error ? error.message : String(error)}`;
      audit.summary.chapters += input ? 0 : 1;
      audit.summary.bloquants += 1;
      audit.errors.push(message);
      audit.chapters.push({
        file,
        canonicalId: null,
        discipline: input?.discipline ?? "inconnue",
        route: input ? routeFor(input) : "",
        status: "bloquant",
        adaptedFields: [],
        missingEditorialFields: [],
        errors: [message],
      });
    }
  }

  return audit;
}
