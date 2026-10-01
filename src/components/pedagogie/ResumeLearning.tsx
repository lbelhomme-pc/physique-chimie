import { useEffect, useState } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import type { GlobalSearchResource } from "../search/GlobalSearch";

interface Props {
  resources: GlobalSearchResource[];
}

interface LastChapter {
  path: string;
  tab: string;
  title: string;
}

export default function ResumeLearning({ resources }: Props) {
  const [engine] = useState(() => getGamificationEngine());
  const [lastChapter, setLastChapter] = useState<LastChapter | null>(null);
  const [, refresh] = useState(0);

  useEffect(() => {
    setLastChapter(engine.getLastChapter());
    const unsubscribe = engine.subscribe(() => {
      setLastChapter(engine.getLastChapter());
      refresh((value) => value + 1);
    });
    return unsubscribe;
  }, [engine]);

  const fallbackResource = resources
    .map((resource) => ({ resource, progress: engine.getChapterProgress(resource.id).percent }))
    .filter((item) => item.progress > 0)
    .sort((a, b) => b.progress - a.progress)[0];

  const lastResource = lastChapter
    ? resources.find((resource) => resource.path === lastChapter.path || lastChapter.path.startsWith(`${resource.path}#`))
    : null;
  const target = lastResource ?? fallbackResource?.resource ?? resources[0];
  const targetPath = lastChapter?.path ?? target?.path ?? "/";
  const progress = target ? engine.getChapterProgress(target.id).percent : 0;

  return (
    <section className="resume-learning" aria-labelledby="resume-learning-title">
      <div>
        <p>Reprendre</p>
        <h2 id="resume-learning-title">Continuer mon travail</h2>
        <span>
          {target
            ? `${target.subjectLabel} · ${target.levelLabel}${target.matiereLabel ? ` · ${target.matiereLabel}` : ""}`
            : "Aucune ressource commencee"}
        </span>
      </div>
      <a href={targetPath}>
        <strong>{lastChapter?.title ?? target?.title ?? "Choisir une matiere"}</strong>
        <small>{progress > 0 ? `${progress}% complete` : "Commencer un chapitre publie"}</small>
      </a>


    </section>
  );
}
