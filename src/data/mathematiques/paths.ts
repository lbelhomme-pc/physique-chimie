import type { MathematicsCycle } from "./types";
import { buildChapterContentId } from "../../utils/contentIds";

export const MATHEMATICS_ROOT = "/mathematiques";

export function getMathematicsCyclePath(cycle: MathematicsCycle) {
  return `${MATHEMATICS_ROOT}/${cycle}`;
}

export function getMathematicsLevelPath(cycle: MathematicsCycle, niveau: string) {
  return `${MATHEMATICS_ROOT}/${cycle}/${niveau}`;
}

export function getMathematicsChapterPath(cycle: MathematicsCycle, niveau: string, chapitre: string) {
  return `${getMathematicsLevelPath(cycle, niveau)}/${chapitre}`;
}

export function getMathematicsChapterId(cycle: MathematicsCycle, niveau: string, chapitre: string) {
  return buildChapterContentId({
    discipline: "mathematiques",
    cycle,
    niveau,
    chapitre,
  });
}
