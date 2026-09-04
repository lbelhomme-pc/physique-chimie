import type { GlobalSearchResource } from "./searchIndex";
import { getMatiereLabel } from "./levels";
import { getPhysicalScienceExplicitChapterPath, getPublishedMathematicsLevels } from "./contentRoutes";
import { chapterEntryFromGlob } from "./mathematiques/content";
import { getMathematicsLevelsByCycle } from "./mathematiques/levels";
import { getLevelDisplayLabel } from "../utils/levels";

const physicalScienceMeta = import.meta.glob("/src/data/chapters/**/meta.json", { eager: true });
const mathematicsMeta = import.meta.glob("/src/data/mathematiques/chapters/**/meta.json", { eager: true });

export function getGlobalSearchCatalogue() {
  const resources: GlobalSearchResource[] = [];

  for (const [path, mod] of Object.entries(physicalScienceMeta)) {
    const [cycle, niveau, matiere, slug] = path
      .replace("/src/data/chapters/", "")
      .replace("/meta.json", "")
      .split("/");
    if ((cycle !== "college" && cycle !== "lycee") || !niveau || !matiere || !slug) continue;

    const data = (mod as any).default ?? mod;
    const isScientificEducation =
      data.disciplineIdentity === "enseignement-scientifique" ||
      niveau.includes("ens-scientifique");

    resources.push({
      id: data.canonicalId ?? `physique-chimie:${cycle}:${niveau}:${matiere}:${slug}`,
      title: data.title ?? slug,
      description: data.description,
      path: getPhysicalScienceExplicitChapterPath(cycle, niveau, matiere as "physique" | "chimie", slug),
      slug,
      keywords: data.keywords ?? data.tags ?? [],
      cycle,
      levelLabel: getLevelDisplayLabel(niveau),
      subject: "physique-chimie",
      subjectLabel: isScientificEducation ? "Physique-Chimie — Enseignement scientifique" : "Physique-Chimie",
      matiereLabel: getMatiereLabel(matiere),
      resourceType: "chapter",
      accessTier: data.access?.tier ?? "free",
    });
  }

  const mathChapters = Object.entries(mathematicsMeta)
    .map(([path, mod]) => chapterEntryFromGlob(path, mod))
    .filter((chapter): chapter is NonNullable<typeof chapter> => Boolean(chapter));

  const publishedMathLevels = [
    ...getPublishedMathematicsLevels(getMathematicsLevelsByCycle("college"), mathChapters),
    ...getPublishedMathematicsLevels(getMathematicsLevelsByCycle("lycee"), mathChapters),
  ];
  const publishedMathLevelKeys = new Set(
    publishedMathLevels.map((level) => `${level.cycle}:${level.slug}`),
  );
  const publishedMathChapters = mathChapters.filter((chapter) =>
    publishedMathLevelKeys.has(`${chapter.cycle}:${chapter.niveau}`),
  );

  for (const chapter of publishedMathChapters) {
    resources.push({
      id: `mathematiques:${chapter.cycle}:${chapter.niveau}:${chapter.slug}`,
      title: chapter.title,
      description: chapter.description,
      path: chapter.path,
      slug: chapter.slug,
      keywords: chapter.tags ?? [],
      cycle: chapter.cycle,
      levelLabel: getLevelDisplayLabel(chapter.niveau),
      subject: "mathematiques",
      subjectLabel: "Mathématiques",
      resourceType: "chapter",
      accessTier: "free",
    });
  }

  return { resources, publishedMathLevels, publishedMathChapters };
}
