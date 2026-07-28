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

      <style>{`
        .resume-learning {
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(0, 1fr) minmax(16rem, 0.9fr);
          padding: 1.25rem;
        }

        .resume-learning p {
          color: var(--accent-primary);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin: 0 0 0.35rem;
          text-transform: uppercase;
        }

        .resume-learning h2 {
          color: var(--text-primary);
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          letter-spacing: 0;
          margin: 0 0 0.35rem;
        }

        .resume-learning span,
        .resume-learning small {
          color: var(--text-secondary);
        }

        .resume-learning a {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: inherit;
          display: grid;
          gap: 0.25rem;
          min-height: 76px;
          padding: 0.9rem 1rem;
          text-decoration: none;
        }

        .resume-learning a:hover,
        .resume-learning a:focus-visible {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-xs);
          outline: none;
        }

        .resume-learning strong {
          color: var(--text-primary);
        }

        @media (max-width: 760px) {
          .resume-learning {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
