import { getMathematicsLevelsByCycle } from "../../data/mathematiques/levels";
import { collectMegaQuestions } from "../../utils/megaMemorizationData";

const physicalScienceQuizFiles = import.meta.glob("../../data/chapters/**/quiz.json", { eager: true });
const physicalScienceMetaFiles = import.meta.glob("../../data/chapters/**/meta.json", { eager: true });
const mathematicsQuizFiles = import.meta.glob("../../data/mathematiques/chapters/**/quiz.json", { eager: true });
const mathematicsMetaFiles = import.meta.glob("../../data/mathematiques/chapters/**/meta.json", { eager: true });

const publishedMathematicsLevels = new Set(
  (["college", "lycee"] as const).flatMap((cycle) =>
    getMathematicsLevelsByCycle(cycle)
      .filter((level) => level.status === "available")
      .map((level) => `${cycle}:${level.slug}`),
  ),
);

export function GET() {
  const physicalScienceQuestions = collectMegaQuestions(physicalScienceQuizFiles, physicalScienceMetaFiles, {
    discipline: "physique-chimie",
  });
  const mathematicsQuestions = collectMegaQuestions(mathematicsQuizFiles, mathematicsMetaFiles, {
    discipline: "mathematiques",
    defaultMatiere: "mathematiques",
    include: ({ cycle, niveau }) => Boolean(cycle && publishedMathematicsLevels.has(`${cycle}:${niveau}`)),
  });
  const questions = [...physicalScienceQuestions, ...mathematicsQuestions];

  return new Response(`${JSON.stringify({ questions })}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
