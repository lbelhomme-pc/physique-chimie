import { collectMegaQuestions } from "../../utils/megaMemorizationData";

const quizFiles = import.meta.glob("../../data/chapters/**/quiz.json", { eager: true });
const metaFiles = import.meta.glob("../../data/chapters/**/meta.json", { eager: true });

export function GET() {
  const questions = collectMegaQuestions(quizFiles, metaFiles);
  return new Response(`${JSON.stringify({ questions })}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

