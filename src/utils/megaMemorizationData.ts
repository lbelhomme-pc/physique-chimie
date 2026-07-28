type ChapterMeta = {
  title?: string;
  matiere?: string;
  niveau?: string;
};

export type MegaQuestion = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation?: string;
  chapterTitle: string;
  matiere: string;
  niveau: string;
};

export type MegaFlashcard = {
  id: string;
  front: string;
  back: string;
  difficulty?: number;
  chapterTitle: string;
  matiere: string;
  niveau: string;
};

function moduleDefault<T>(mod: unknown): T {
  return ((mod as { default?: T }).default ?? mod) as T;
}

function chapterMapFrom(metaFiles: Record<string, unknown>): Record<string, Required<ChapterMeta>> {
  const chapterMap: Record<string, Required<ChapterMeta>> = {};
  for (const [path, mod] of Object.entries(metaFiles)) {
    const meta = moduleDefault<ChapterMeta>(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    chapterMap[dir] = {
      title: meta.title ?? "?",
      matiere: meta.matiere ?? "?",
      niveau: meta.niveau ?? "?",
    };
  }
  return chapterMap;
}

export function collectMegaQuestions(quizFiles: Record<string, unknown>, metaFiles: Record<string, unknown>): MegaQuestion[] {
  const chapterMap = chapterMapFrom(metaFiles);
  const allQuestions: MegaQuestion[] = [];
  for (const [path, mod] of Object.entries(quizFiles)) {
    const questions = moduleDefault<Partial<MegaQuestion>[]>(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    const info = chapterMap[dir] ?? { title: "?", matiere: "?", niveau: "?" };
    for (const question of questions) {
      allQuestions.push({
        ...question,
        id: question.id ?? `${dir}-${allQuestions.length}`,
        question: question.question ?? "",
        choices: question.choices ?? [],
        answer: question.answer ?? 0,
        chapterTitle: info.title,
        matiere: info.matiere,
        niveau: info.niveau,
      });
    }
  }
  return allQuestions;
}

export function collectMegaFlashcards(flashFiles: Record<string, unknown>, metaFiles: Record<string, unknown>): MegaFlashcard[] {
  const chapterMap = chapterMapFrom(metaFiles);
  const allCards: MegaFlashcard[] = [];
  for (const [path, mod] of Object.entries(flashFiles)) {
    const cards = moduleDefault<Partial<MegaFlashcard>[]>(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    const info = chapterMap[dir] ?? { title: "?", matiere: "?", niveau: "?" };
    for (const card of cards) {
      allCards.push({
        ...card,
        id: card.id ?? `${dir}-${allCards.length}`,
        front: card.front ?? "",
        back: card.back ?? "",
        difficulty: card.difficulty,
        chapterTitle: info.title,
        matiere: info.matiere,
        niveau: info.niveau,
      });
    }
  }
  return allCards;
}

