import { collectMegaFlashcards } from "../../utils/megaMemorizationData";

const flashFiles = import.meta.glob("../../data/chapters/**/flashcards.json", { eager: true });
const metaFiles = import.meta.glob("../../data/chapters/**/meta.json", { eager: true });

export function GET() {
  const cards = collectMegaFlashcards(flashFiles, metaFiles);
  return new Response(`${JSON.stringify({ cards })}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

