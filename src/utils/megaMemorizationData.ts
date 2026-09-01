export type MemorizationDiscipline = "physique-chimie" | "mathematiques";
export type MemorizationCycle = "college" | "lycee";

type ChapterMeta = {
  title?: string;
  matiere?: string;
  niveau?: string;
  cycle?: MemorizationCycle;
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
  cycle?: MemorizationCycle;
  discipline: MemorizationDiscipline;
};

export type MegaFlashcard = {
  id: string;
  front: string;
  back: string;
  difficulty?: number;
  chapterTitle: string;
  matiere: string;
  niveau: string;
  cycle?: MemorizationCycle;
  discipline: MemorizationDiscipline;
};

type CollectOptions = {
  discipline?: MemorizationDiscipline;
  defaultMatiere?: string;
  include?: (item: { cycle?: MemorizationCycle; niveau: string; directory: string }) => boolean;
};

type QuizContainer = Partial<MegaQuestion>[] | { questions?: Partial<MegaQuestion>[] };
type FlashcardContainer = Partial<MegaFlashcard>[] | { cards?: Partial<MegaFlashcard>[] };

type ResolvedChapterMeta = {
  title: string;
  matiere: string;
  niveau: string;
  cycle?: MemorizationCycle;
};

function moduleDefault<T>(mod: unknown): T {
  return ((mod as { default?: T }).default ?? mod) as T;
}

function chapterMapFrom(
  metaFiles: Record<string, unknown>,
  defaultMatiere = "?",
): Record<string, ResolvedChapterMeta> {
  const chapterMap: Record<string, ResolvedChapterMeta> = {};
  for (const [path, mod] of Object.entries(metaFiles)) {
    const meta = moduleDefault<ChapterMeta>(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    const pathParts = dir.split("/");
    const inferredCycle = pathParts.find((part): part is MemorizationCycle => part === "college" || part === "lycee");
    chapterMap[dir] = {
      title: meta.title ?? "?",
      matiere: meta.matiere ?? defaultMatiere,
      niveau: meta.niveau ?? "?",
      cycle: meta.cycle ?? inferredCycle,
    };
  }
  return chapterMap;
}

function questionsFrom(mod: unknown): Partial<MegaQuestion>[] {
  const value = moduleDefault<QuizContainer>(mod);
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.questions) ? value.questions : [];
}

function cardsFrom(mod: unknown): Partial<MegaFlashcard>[] {
  const value = moduleDefault<FlashcardContainer>(mod);
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.cards) ? value.cards : [];
}

export function collectMegaQuestions(
  quizFiles: Record<string, unknown>,
  metaFiles: Record<string, unknown>,
  options: CollectOptions = {},
): MegaQuestion[] {
  const discipline = options.discipline ?? "physique-chimie";
  const chapterMap = chapterMapFrom(metaFiles, options.defaultMatiere ?? (discipline === "mathematiques" ? "mathematiques" : "?"));
  const allQuestions: MegaQuestion[] = [];

  for (const [path, mod] of Object.entries(quizFiles)) {
    const questions = questionsFrom(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    const info = chapterMap[dir] ?? {
      title: "?",
      matiere: options.defaultMatiere ?? (discipline === "mathematiques" ? "mathematiques" : "?"),
      niveau: "?",
      cycle: undefined,
    };
    if (options.include && !options.include({ cycle: info.cycle, niveau: info.niveau, directory: dir })) continue;

    for (const question of questions) {
      const legacyCorrectAnswer = (question as Partial<MegaQuestion> & { correctAnswer?: number }).correctAnswer;
      allQuestions.push({
        ...question,
        id: question.id ?? `${dir}-${allQuestions.length}`,
        question: question.question ?? "",
        choices: question.choices ?? [],
        answer: question.answer ?? legacyCorrectAnswer ?? 0,
        chapterTitle: info.title,
        matiere: info.matiere,
        niveau: info.niveau,
        cycle: info.cycle,
        discipline,
      });
    }
  }
  return allQuestions;
}

export function collectMegaFlashcards(
  flashFiles: Record<string, unknown>,
  metaFiles: Record<string, unknown>,
  options: CollectOptions = {},
): MegaFlashcard[] {
  const discipline = options.discipline ?? "physique-chimie";
  const chapterMap = chapterMapFrom(metaFiles, options.defaultMatiere ?? (discipline === "mathematiques" ? "mathematiques" : "?"));
  const allCards: MegaFlashcard[] = [];

  for (const [path, mod] of Object.entries(flashFiles)) {
    const cards = cardsFrom(mod);
    const dir = path.split("/").slice(0, -1).join("/");
    const info = chapterMap[dir] ?? {
      title: "?",
      matiere: options.defaultMatiere ?? (discipline === "mathematiques" ? "mathematiques" : "?"),
      niveau: "?",
      cycle: undefined,
    };
    if (options.include && !options.include({ cycle: info.cycle, niveau: info.niveau, directory: dir })) continue;

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
        cycle: info.cycle,
        discipline,
      });
    }
  }
  return allCards;
}
