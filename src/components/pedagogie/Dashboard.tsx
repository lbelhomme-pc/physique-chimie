import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getGamificationEngine } from "../../data/gamification/engine";
import { getSRSEngine } from "../../data/gamification/srs";
import type { GlobalSearchResource } from "../search/GlobalSearch";

interface Props {
  resources: GlobalSearchResource[];
}

interface LastChapter {
  path: string;
  tab: string;
  title: string;
}

type DashboardItem = {
  resource: GlobalSearchResource;
  percent: number;
};

const quickActions = [
  { label: "Exercices", href: "/college", detail: "S'entrainer" },
  { label: "Quiz", href: "/memorisation/mega-quiz", detail: "Tester" },
  { label: "Flashcards", href: "/memorisation/mega-flashcards", detail: "Reviser" },
  { label: "Laboratoire", href: "/laboratoire", detail: "Simuler" },
  { label: "Profil", href: "/profil", detail: "Progression" },
];

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Cours", href: "/college" },
  { label: "Exercices", href: "/college#exercices" },
  { label: "Quiz", href: "/memorisation/mega-quiz" },
  { label: "Flashcards", href: "/memorisation/mega-flashcards" },
  { label: "Laboratoire", href: "/laboratoire" },
  { label: "Ressources", href: "/outils-methodes" },
];

function subjectPercent(
  resources: GlobalSearchResource[],
  subject: GlobalSearchResource["subject"],
  engine: ReturnType<typeof getGamificationEngine>,
) {
  const filtered = resources.filter((resource) => resource.subject === subject);
  if (filtered.length === 0) return 0;
  return Math.round(
    filtered.reduce((sum, resource) => sum + engine.getChapterProgress(resource.id).percent, 0) / filtered.length,
  );
}

function formatResourceMeta(resource: GlobalSearchResource): string {
  return [
    resource.subjectLabel,
    resource.levelLabel,
    resource.matiereLabel,
  ].filter(Boolean).join(" · ");
}

function progressLabel(percent: number): string {
  if (percent >= 100) return "Termine";
  if (percent > 0) return "En cours";
  return "A commencer";
}

function getPriorityItem(
  resources: GlobalSearchResource[],
  items: DashboardItem[],
  lastChapter: LastChapter | null,
): DashboardItem | null {
  const lastResource = lastChapter
    ? resources.find((resource) => lastChapter.path === resource.path || lastChapter.path.startsWith(`${resource.path}#`))
    : null;

  if (lastResource) {
    return {
      resource: lastResource,
      percent: items.find((item) => item.resource.id === lastResource.id)?.percent ?? 0,
    };
  }

  return items.find((item) => item.percent > 0 && item.percent < 100) ?? items[0] ?? (
    resources[0] ? { resource: resources[0], percent: 0 } : null
  );
}

export default function Dashboard({ resources }: Props) {
  const [engine] = useState(() => getGamificationEngine());
  const [srs] = useState(() => getSRSEngine());
  const [lastChapter, setLastChapter] = useState<LastChapter | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setLastChapter(engine.getLastChapter());
    const unsubscribe = engine.subscribe(() => {
      setLastChapter(engine.getLastChapter());
      forceUpdate((n) => n + 1);
    });
    return unsubscribe;
  }, [engine]);

  const xp = engine.getXP();
  const rank = engine.getRank();
  const nextRank = engine.getNextRank();
  const rankProgress = engine.getRankProgress();
  const streak = engine.getStreak();
  const stats = engine.getStats();
  const globalDue = srs.getGlobalDueCount();
  const dueByChapter = srs.getGlobalDueByChapter();

  const progressBySubject = {
    mathematiques: subjectPercent(resources, "mathematiques", engine),
    physiqueChimie: subjectPercent(resources, "physique-chimie", engine),
  };

  const progressItems = useMemo(() => resources
    .map((resource) => ({ resource, percent: engine.getChapterProgress(resource.id).percent }))
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent || a.resource.title.localeCompare(b.resource.title)), [engine, resources]);

  const priorityItem = getPriorityItem(resources, progressItems, lastChapter);
  const completedCount = progressItems.filter((item) => item.percent >= 100).length;
  const successfulQuizRate = stats.totalQuizCompleted > 0
    ? Math.round((stats.totalQuizPerfect / stats.totalQuizCompleted) * 100)
    : 0;

  const reviewItems = dueByChapter
    .map((entry) => ({
      count: entry.count,
      resource: resources.find((resource) => resource.id === entry.chapterId),
    }))
    .filter((item): item is { count: number; resource: GlobalSearchResource } => Boolean(item.resource))
    .slice(0, 3);

  const historyItems = progressItems.slice(0, 6);
  const hasLocalActivity = progressItems.length > 0 || xp > 0 || globalDue > 0 || Boolean(lastChapter);
  const priorityHref = lastChapter?.path ?? priorityItem?.resource.path ?? "/college";
  const priorityTitle = lastChapter?.title ?? priorityItem?.resource.title ?? "Choisir un chapitre";
  const priorityMeta = priorityItem ? formatResourceMeta(priorityItem.resource) : "Aucune activite locale detectee";

  return (
    <section className="dashboard-v3" aria-labelledby="dashboard-v3-title">
      <aside className="dashboard-v3__sidebar" aria-label="Navigation de l'espace local">
        <a className="dashboard-v3__brand" href="/">
          <span aria-hidden="true">PC</span>
          <strong>Tableau local</strong>
          <small>Sans compte serveur</small>
        </a>

        <nav className="dashboard-v3__nav">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} aria-current={item.href === "/" ? "page" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="dashboard-v3__streak" aria-label="Serie en cours">
          <span>Serie en cours</span>
          <strong>{streak.current}</strong>
          <small>jour{streak.current > 1 ? "s" : ""} · meilleur {streak.best}</small>
        </div>
      </aside>

      <div className="dashboard-v3__main">
        <header className="dashboard-v3__header">
          <div>
            <p className="dashboard-v3__kicker">Prototype connecte local</p>
            <h2 id="dashboard-v3-title">Tableau de bord</h2>
            <span>{hasLocalActivity ? "Voici les actions issues de ta progression sur cet appareil." : "Commence une activite pour alimenter ce tableau."}</span>
          </div>
          <a href="/profil" className="dashboard-v3__profile-link">Profil local</a>
        </header>

        <div className="dashboard-v3__hero-grid" aria-label="Resume de progression">
          <article className="dashboard-v3__priority">
            <span className="dashboard-v3__label">A faire maintenant</span>
            <h3>{priorityTitle}</h3>
            <p>{priorityMeta}</p>
            <div
              className="dashboard-v3__progress-line"
              role="meter"
              aria-label="Progression"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={priorityItem?.percent ?? 0}
            >
              <i style={{ width: `${priorityItem?.percent ?? 0}%` }} />
            </div>
            <a href={priorityHref}>{(priorityItem?.percent ?? 0) > 0 ? "Continuer" : "Commencer"}</a>
          </article>

          <article className="dashboard-v3__metric">
            <span>Chapitres termines</span>
            <strong>{completedCount} / {resources.length}</strong>
            <small>{resources.length > 0 ? `${Math.round((completedCount / resources.length) * 100)}% du catalogue` : "Catalogue vide"}</small>
          </article>

          <article className="dashboard-v3__metric">
            <span>Quiz reussis</span>
            <strong>{successfulQuizRate}%</strong>
            <small>{stats.totalQuizCompleted} quiz termines</small>
          </article>

          <article className="dashboard-v3__metric">
            <span>XP local</span>
            <strong>{xp}</strong>
            <small>{nextRank ? `${rank.name} · ${nextRank.xpRequired - rankProgress.current} XP avant ${nextRank.name}` : rank.name}</small>
          </article>
        </div>

        <div className="dashboard-v3__content-grid">
          <section className="dashboard-v3__panel" aria-labelledby="dashboard-continue-title">
            <div className="dashboard-v3__panel-head">
              <h3 id="dashboard-continue-title">Continuer</h3>
              <a href="/profil">Voir tout</a>
            </div>
            {historyItems.length > 0 ? (
              <ul className="dashboard-v3__task-list">
                {historyItems.slice(0, 3).map((item) => (
                  <li key={item.resource.id}>
                    <a href={item.resource.path}>
                      <strong>{item.resource.title}</strong>
                      <span>{formatResourceMeta(item.resource)}</span>
                    </a>
                    <b>{item.percent}%</b>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-v3__empty">Aucun chapitre commence pour le moment.</p>
            )}
          </section>

          <section className="dashboard-v3__panel" aria-labelledby="dashboard-review-title">
            <div className="dashboard-v3__panel-head">
              <h3 id="dashboard-review-title">A revoir</h3>
              <a href="/memorisation/revision-du-jour">Revision du jour</a>
            </div>
            {reviewItems.length > 0 ? (
              <ul className="dashboard-v3__task-list dashboard-v3__task-list--review">
                {reviewItems.map((item) => (
                  <li key={item.resource.id}>
                    <a href={item.resource.path}>
                      <strong>{item.resource.title}</strong>
                      <span>{item.count} carte{item.count > 1 ? "s" : ""} a revoir</span>
                    </a>
                    <b>{item.count}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-v3__empty">Aucune carte due aujourd'hui.</p>
            )}
          </section>

          <section className="dashboard-v3__panel dashboard-v3__panel--progress" aria-labelledby="dashboard-progress-title">
            <div className="dashboard-v3__panel-head">
              <h3 id="dashboard-progress-title">Progression</h3>
              <a href="/profil">Detail</a>
            </div>
            <div className="dashboard-v3__ring" style={{ "--progress": `${priorityItem?.percent ?? 0}%` } as CSSProperties}>
              <strong>{priorityItem?.percent ?? 0}%</strong>
              <span>{priorityItem ? progressLabel(priorityItem.percent) : "Vide"}</span>
            </div>
            <dl className="dashboard-v3__subject-progress">
              <div>
                <dt>Mathematiques</dt>
                <dd>{progressBySubject.mathematiques}%</dd>
              </div>
              <div>
                <dt>Physique-Chimie</dt>
                <dd>{progressBySubject.physiqueChimie}%</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="dashboard-v3__quick" aria-labelledby="dashboard-quick-title">
          <h3 id="dashboard-quick-title">Poursuivre autrement</h3>
          <div>
            {quickActions.map((action) => (
              <a key={action.href} href={action.href}>
                <strong>{action.label}</strong>
                <span>{action.detail}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="dashboard-v3__history" aria-labelledby="dashboard-history-title">
          <div className="dashboard-v3__panel-head">
            <h3 id="dashboard-history-title">Historique local</h3>
            <span>{historyItems.length} entree{historyItems.length > 1 ? "s" : ""}</span>
          </div>
          <div className="dashboard-v3__table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Chapitre</th>
                  <th scope="col">Matiere</th>
                  <th scope="col">Etat</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.length > 0 ? historyItems.map((item) => (
                  <tr key={item.resource.id}>
                    <td>{item.resource.title}</td>
                    <td>{formatResourceMeta(item.resource)}</td>
                    <td>{item.percent}% · {progressLabel(item.percent)}</td>
                    <td><a href={item.resource.path}>Ouvrir</a></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4}>Aucune activite locale enregistree.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-v3 {
          background: var(--v3-color-surface-raised);
          border: 1px solid var(--v3-color-border);
          border-radius: var(--v3-radius-lg);
          box-shadow: var(--v3-shadow-md);
          display: grid;
          grid-template-columns: minmax(13rem, 0.22fr) minmax(0, 1fr);
          min-height: 760px;
          overflow: hidden;
        }

        .dashboard-v3 a {
          color: inherit;
          text-decoration: none;
        }

        .dashboard-v3 a:focus-visible,
        .dashboard-v3 button:focus-visible {
          box-shadow: var(--v3-shadow-focus);
          outline: none;
        }

        .dashboard-v3__sidebar {
          background: #071b4f;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: var(--v3-space-5);
          padding: var(--v3-space-5) var(--v3-space-4);
        }

        .dashboard-v3__brand {
          align-items: center;
          display: grid;
          gap: 0.15rem;
          grid-template-columns: 2.4rem minmax(0, 1fr);
        }

        .dashboard-v3__brand span {
          align-items: center;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: var(--v3-radius-md);
          display: inline-flex;
          font-weight: 900;
          height: 2.4rem;
          justify-content: center;
          width: 2.4rem;
        }

        .dashboard-v3__brand small {
          color: rgba(255, 255, 255, 0.72);
          grid-column: 2;
        }

        .dashboard-v3__nav {
          display: grid;
          gap: 0.35rem;
        }

        .dashboard-v3__nav a {
          border-radius: var(--v3-radius-md);
          color: rgba(255, 255, 255, 0.84);
          font-weight: 750;
          min-height: 42px;
          padding: 0.72rem 0.8rem;
        }

        .dashboard-v3__nav a[aria-current="page"],
        .dashboard-v3__nav a:hover,
        .dashboard-v3__nav a:focus-visible {
          background: var(--v3-color-action);
          color: #ffffff;
        }

        .dashboard-v3__streak {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: var(--v3-radius-md);
          display: grid;
          gap: 0.25rem;
          margin-top: auto;
          padding: var(--v3-space-4);
        }

        .dashboard-v3__streak strong {
          font-size: 2rem;
          line-height: 1;
        }

        .dashboard-v3__streak small,
        .dashboard-v3__streak span {
          color: rgba(255, 255, 255, 0.76);
        }

        .dashboard-v3__main {
          background: var(--v3-color-surface-soft);
          display: grid;
          gap: var(--v3-space-5);
          min-width: 0;
          padding: var(--v3-space-5);
        }

        .dashboard-v3__main > *,
        .dashboard-v3__header > *,
        .dashboard-v3__hero-grid > *,
        .dashboard-v3__content-grid > *,
        .dashboard-v3__quick > *,
        .dashboard-v3__history > * {
          min-width: 0;
        }

        .dashboard-v3__header {
          align-items: center;
          display: flex;
          gap: var(--v3-space-4);
          justify-content: space-between;
        }

        .dashboard-v3__kicker,
        .dashboard-v3__label {
          color: var(--v3-color-action);
          font-size: 0.76rem;
          font-weight: 900;
          letter-spacing: 0;
          margin: 0;
          text-transform: uppercase;
        }

        .dashboard-v3__header h2,
        .dashboard-v3 h3,
        .dashboard-v3 p {
          letter-spacing: 0;
          margin: 0;
        }

        .dashboard-v3__header h2 {
          color: var(--v3-color-text-main);
          font-size: 1.65rem;
        }

        .dashboard-v3__header span,
        .dashboard-v3__empty,
        .dashboard-v3 small,
        .dashboard-v3__task-list span,
        .dashboard-v3__quick span,
        .dashboard-v3__subject-progress dt {
          color: var(--v3-color-text-muted);
        }

        .dashboard-v3__profile-link,
        .dashboard-v3__priority a,
        .dashboard-v3__panel-head a,
        .dashboard-v3__history a {
          background: var(--v3-color-action);
          border: 1px solid var(--v3-color-action);
          border-radius: var(--v3-radius-md);
          color: #ffffff;
          font-weight: 850;
          min-height: 40px;
          padding: 0.65rem 0.9rem;
        }

        .dashboard-v3__hero-grid {
          display: grid;
          gap: var(--v3-space-3);
          grid-template-columns: minmax(16rem, 1.8fr) repeat(3, minmax(9rem, 0.75fr));
        }

        .dashboard-v3__priority,
        .dashboard-v3__metric,
        .dashboard-v3__panel,
        .dashboard-v3__quick,
        .dashboard-v3__history {
          background: var(--v3-color-surface-raised);
          border: 1px solid var(--v3-color-border);
          border-radius: var(--v3-radius-md);
          box-shadow: var(--v3-shadow-sm);
        }

        .dashboard-v3__priority {
          display: grid;
          gap: var(--v3-space-3);
          grid-template-columns: minmax(0, 1fr) auto;
          padding: var(--v3-space-4);
        }

        .dashboard-v3__priority h3,
        .dashboard-v3__priority p,
        .dashboard-v3__progress-line,
        .dashboard-v3__label {
          grid-column: 1;
        }

        .dashboard-v3__priority h3,
        .dashboard-v3__panel h3,
        .dashboard-v3__quick h3,
        .dashboard-v3__history h3 {
          color: var(--v3-color-text-main);
          font-size: 1rem;
        }

        .dashboard-v3__priority a {
          align-self: center;
          grid-column: 2;
          grid-row: 2 / span 2;
          justify-self: end;
        }

        .dashboard-v3__progress-line {
          background: var(--v3-color-surface-muted);
          border-radius: 999px;
          height: 0.55rem;
          overflow: hidden;
        }

        .dashboard-v3__progress-line i {
          background: var(--v3-color-action);
          display: block;
          height: 100%;
        }

        .dashboard-v3__metric {
          display: grid;
          gap: 0.35rem;
          min-height: 126px;
          padding: var(--v3-space-4);
        }

        .dashboard-v3__metric strong {
          color: var(--v3-color-text-main);
          font-size: 1.55rem;
        }

        .dashboard-v3__content-grid {
          display: grid;
          gap: var(--v3-space-3);
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(14rem, 0.8fr);
        }

        .dashboard-v3__panel,
        .dashboard-v3__quick,
        .dashboard-v3__history {
          padding: var(--v3-space-4);
        }

        .dashboard-v3__panel-head {
          align-items: center;
          display: flex;
          gap: var(--v3-space-3);
          justify-content: space-between;
          margin-bottom: var(--v3-space-3);
        }

        .dashboard-v3__panel-head a {
          background: transparent;
          color: var(--v3-color-action);
          min-height: 34px;
          padding: 0.45rem 0.65rem;
        }

        .dashboard-v3__task-list {
          display: grid;
          gap: 0.35rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .dashboard-v3__task-list li {
          align-items: center;
          border-bottom: 1px solid var(--v3-color-border);
          display: flex;
          gap: var(--v3-space-3);
          justify-content: space-between;
          min-height: 54px;
          padding: 0.45rem 0;
        }

        .dashboard-v3__task-list li:last-child {
          border-bottom: 0;
        }

        .dashboard-v3__task-list a {
          display: grid;
          gap: 0.1rem;
          min-width: 0;
        }

        .dashboard-v3__task-list strong,
        .dashboard-v3__quick strong,
        .dashboard-v3__history td:first-child {
          color: var(--v3-color-text-main);
        }

        .dashboard-v3__task-list b {
          color: var(--v3-color-action);
        }

        .dashboard-v3__ring {
          align-items: center;
          aspect-ratio: 1;
          background: conic-gradient(var(--v3-color-action) var(--progress), var(--v3-color-surface-muted) 0);
          border-radius: 50%;
          display: grid;
          justify-items: center;
          margin: 0 auto var(--v3-space-3);
          max-width: 128px;
          padding: 0.75rem;
          position: relative;
          width: 100%;
        }

        .dashboard-v3__ring::before {
          background: var(--v3-color-surface-raised);
          border-radius: 50%;
          content: "";
          inset: 0.75rem;
          position: absolute;
        }

        .dashboard-v3__ring strong,
        .dashboard-v3__ring span {
          position: relative;
          z-index: 1;
        }

        .dashboard-v3__ring strong {
          color: var(--v3-color-action);
          font-size: 1.35rem;
        }

        .dashboard-v3__subject-progress {
          display: grid;
          gap: 0.45rem;
          margin: 0;
        }

        .dashboard-v3__subject-progress div {
          display: flex;
          justify-content: space-between;
        }

        .dashboard-v3__subject-progress dd {
          color: var(--v3-color-text-main);
          font-weight: 850;
          margin: 0;
        }

        .dashboard-v3__quick {
          display: grid;
          gap: var(--v3-space-3);
        }

        .dashboard-v3__quick div {
          display: grid;
          gap: var(--v3-space-3);
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .dashboard-v3__quick a {
          background: var(--v3-color-surface-soft);
          border: 1px solid var(--v3-color-border);
          border-radius: var(--v3-radius-md);
          display: grid;
          gap: 0.15rem;
          min-height: 74px;
          padding: var(--v3-space-3);
        }

        .dashboard-v3__quick a:hover,
        .dashboard-v3__task-list a:hover,
        .dashboard-v3__history a:hover {
          border-color: var(--v3-color-action);
        }

        .dashboard-v3__table-wrap {
          overflow-x: auto;
        }

        .dashboard-v3__history table {
          border-collapse: collapse;
          min-width: 680px;
          width: 100%;
        }

        .dashboard-v3__history th,
        .dashboard-v3__history td {
          border-bottom: 1px solid var(--v3-color-border);
          padding: 0.75rem;
          text-align: left;
        }

        .dashboard-v3__history th {
          color: var(--v3-color-text-muted);
          font-size: 0.8rem;
          font-weight: 850;
        }

        .dashboard-v3__history a {
          display: inline-flex;
          min-height: 34px;
          padding: 0.42rem 0.7rem;
        }

        @media (max-width: 1080px) {
          .dashboard-v3 {
            grid-template-columns: 1fr;
          }

          .dashboard-v3__sidebar {
            display: grid;
            grid-template-columns: minmax(12rem, 1fr);
          }

          .dashboard-v3__nav {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .dashboard-v3__hero-grid,
          .dashboard-v3__content-grid {
            grid-template-columns: 1fr 1fr;
          }

          .dashboard-v3__priority {
            grid-column: 1 / -1;
          }

          .dashboard-v3__panel--progress {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 760px) {
          .dashboard-v3 {
            border-radius: var(--v3-radius-md);
            min-height: 0;
          }

          .dashboard-v3__main,
          .dashboard-v3__sidebar {
            padding: var(--v3-space-3);
          }

          .dashboard-v3__header,
          .dashboard-v3__priority,
          .dashboard-v3__task-list li {
            align-items: stretch;
            flex-direction: column;
          }

          .dashboard-v3__hero-grid,
          .dashboard-v3__content-grid,
          .dashboard-v3__quick div,
          .dashboard-v3__nav {
            grid-template-columns: 1fr;
          }

          .dashboard-v3__priority a,
          .dashboard-v3__priority h3,
          .dashboard-v3__priority p,
          .dashboard-v3__progress-line,
          .dashboard-v3__label {
            grid-column: 1;
            grid-row: auto;
            justify-self: stretch;
          }

          .dashboard-v3__priority a {
            text-align: center;
          }

          .dashboard-v3__profile-link,
          .dashboard-v3__panel-head a,
          .dashboard-v3__history a {
            align-items: center;
            display: inline-flex;
            justify-content: center;
            min-width: 0;
            text-align: center;
            white-space: normal;
          }

          .dashboard-v3__header h2,
          .dashboard-v3 h3,
          .dashboard-v3 p,
          .dashboard-v3 span,
          .dashboard-v3 small,
          .dashboard-v3 strong {
            overflow-wrap: anywhere;
          }
        }
      `}</style>
    </section>
  );
}
