export type MathematicsCycle = "college" | "lycee";

export type MathematicsDomain =
  | "nombres-calculs"
  | "algebre"
  | "analyse"
  | "geometrie"
  | "grandeurs-mesures"
  | "probabilites"
  | "statistiques"
  | "algorithmique"
  | "logique-raisonnement";

export const mathematicsDomainLabels: Record<MathematicsDomain, string> = {
  "nombres-calculs": "Nombres et calculs",
  algebre: "Algèbre",
  analyse: "Analyse",
  geometrie: "Géométrie",
  "grandeurs-mesures": "Grandeurs et mesures",
  probabilites: "Probabilités",
  statistiques: "Statistiques",
  algorithmique: "Algorithmique",
  "logique-raisonnement": "Logique et raisonnement",
};

export interface MathematicsLevel {
  slug: string;
  label: string;
  shortLabel?: string;
  cycle: MathematicsCycle;
  path: string;
  description?: string;
  enabled: boolean;
  status: "available" | "planned" | "draft";
  order: number;
}

export interface MathematicsFigureData {
  title?: string;
  description?: string;
  caption?: string;
  alt?: string;
  svg?: string;
  src?: string;
  interactive?: boolean;
}

export interface MathematicsChapterMeta {
  title: string;
  description: string;
  objectives?: string[];
  cycle: MathematicsCycle;
  niveau: string;
  slug: string;
  order: number;
  theme?: string;
  domain?: MathematicsDomain;
  duration?: string;
  tags?: string[];
  prerequisites?: string[];
  competencies?: string[];
  tools?: string[];
  relatedChapters?: string[];
  officialSource?: string;
  xp?: {
    course?: number;
    exercise?: number;
    quiz?: number;
    flashcard?: number;
    cours?: number;
    exercice_each?: number;
    exercice_all?: number;
    quiz_base?: number;
    quiz_per_correct?: number;
    quiz_perfect?: number;
    flashcards_base?: number;
    flashcard_known?: number;
  };
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    noindex?: boolean;
  };
}

export interface MathematicsChapterListItem extends MathematicsChapterMeta {
  path: string;
}

export interface MathematicsExercise {
  id: string;
  title: string;
  difficulty?: number;
  difficultyLabel?: string;
  statement: string;
  hints?: {
    clue?: string;
    method?: string;
    reminder?: string;
    commonMistake?: string;
  };
  correction?: string | string[];
  expectedAnswer?: string;
  answerType?: "text" | "number" | "expression" | "choice";
  figure?: MathematicsFigureData;
  tags?: string[];
}

export interface MathematicsQuizQuestion {
  id: string;
  type: "mcq" | "multiple" | "true-false" | "numeric" | "short";
  question: string;
  choices?: string[];
  answer: number | number[] | string | boolean;
  explanation?: string;
  figure?: MathematicsFigureData;
}

export interface MathematicsFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: number;
  tags?: string[];
  formula?: string;
  figure?: MathematicsFigureData;
}

export interface MathematicsResource {
  id: string;
  title: string;
  description: string;
  href?: string;
  cycle?: MathematicsCycle | "transverse";
  status: "planned" | "available";
  tags?: string[];
}
