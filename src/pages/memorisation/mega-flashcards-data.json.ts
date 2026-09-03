import { getMathematicsLevelsByCycle } from "../../data/mathematiques/levels";
import { collectMegaFlashcards } from "../../utils/megaMemorizationData";

const physicalScienceFlashFiles = import.meta.glob("../../data/chapters/**/flashcards.json", { eager: true });
const physicalScienceMetaFiles = import.meta.glob("../../data/chapters/**/meta.json", { eager: true });
const mathematicsFlashFiles = import.meta.glob("../../data/mathematiques/chapters/**/flashcards.json", { eager: true });
const mathematicsMetaFiles = import.meta.glob("../../data/mathematiques/chapters/**/meta.json", { eager: true });

const publishedMathematicsLevels = new Set(
  (["college", "lycee"] as const).flatMap((cycle) =>
    getMathematicsLevelsByCycle(cycle)
      .filter((level) => level.status === "available")
      .map((level) => `${cycle}:${level.slug}`),
  ),
);

export function GET() {
  const physicalScienceCards = collectMegaFlashcards(physicalScienceFlashFiles, physicalScienceMetaFiles, {
    discipline: "physique-chimie",
  });
  const mathematicsCards = collectMegaFlashcards(mathematicsFlashFiles, mathematicsMetaFiles, {
    discipline: "mathematiques",
    defaultMatiere: "mathematiques",
    include: ({ cycle, niveau }) => Boolean(cycle && publishedMathematicsLevels.has(`${cycle}:${niveau}`)),
  });
  const cards = [...physicalScienceCards, ...mathematicsCards];

  return new Response(`${JSON.stringify({ cards })}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
