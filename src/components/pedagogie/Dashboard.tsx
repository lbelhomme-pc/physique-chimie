import { useEffect, useMemo, useState } from "react";
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

type DashboardSubjectFilter = "all" | "mathematiques" | "physique-chimie";

const dashboardSubjects: Array<{ id: DashboardSubjectFilter; label: string }> = [
  { id: "all", label: "Toutes" },
  { id: "mathematiques", label: "Mathématiques" },
  { id: "physique-chimie", label: "Physique-Chimie" },
];

const quickActions = [
  { label: "Cours et exercices", href: "__subject__", detail: "Choisir dans la discipline" },
  { label: "Quiz", href: "/memorisation/mega-quiz", detail: "Tester" },
  { label: "Flashcards", href: "/memorisation/mega-flashcards", detail: "Reviser" },
  { label: "Laboratoire", href: "/laboratoire", detail: "Simuler" },
  { label: "Profil", href: "/profil", detail: "Progression" },
];

const navItems = [
  { label: "Accueil", href: "/" },
  { label: "Cours", href: "__subject__" },
  { label: "Exercices", href: "__subject__" },
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
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [engine] = useState(() => getGamificationEngine());
  const [srs] = useState(() => getSRSEngine());
  const [lastChapter, setLastChapter] = useState<LastChapter | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<DashboardSubjectFilter>("all");
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

  const visibleResources = useMemo(
    () => subjectFilter === "all" ? resources : resources.filter((resource) => resource.subject === subjectFilter),
    [resources, subjectFilter],
  );
  const visibleLastChapter = lastChapter && visibleResources.some(
    (resource) => lastChapter.path === resource.path || lastChapter.path.startsWith(`${resource.path}#`),
  ) ? lastChapter : null;
  const progressItems = useMemo(() => visibleResources
    .map((resource) => ({ resource, percent: engine.getChapterProgress(resource.id).percent }))
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent || a.resource.title.localeCompare(b.resource.title)), [engine, visibleResources]);

  const priorityItem = getPriorityItem(visibleResources, progressItems, visibleLastChapter);
  const completedCount = progressItems.filter((item) => item.percent >= 100).length;
  const successfulQuizRate = stats.totalQuizCompleted > 0
    ? Math.round((stats.totalQuizPerfect / stats.totalQuizCompleted) * 100)
    : 0;

  const reviewItems = dueByChapter
    .map((entry) => ({
      count: entry.count,
      resource: visibleResources.find((resource) => resource.id === entry.chapterId),
    }))
    .filter((item): item is { count: number; resource: GlobalSearchResource } => Boolean(item.resource))
    .slice(0, 3);

  const historyItems = progressItems.slice(0, 6);
  const hasLocalActivity = progressItems.length > 0 || xp > 0 || globalDue > 0 || Boolean(visibleLastChapter);
  const subjectRoot = subjectFilter === "mathematiques" ? "/mathematiques" : subjectFilter === "physique-chimie" ? "/physique-chimie" : "/";
  const priorityHref = visibleLastChapter?.path ?? priorityItem?.resource.path ?? subjectRoot;
  const priorityTitle = visibleLastChapter?.title ?? priorityItem?.resource.title ?? "Choisir un chapitre";
  const priorityMeta = priorityItem ? formatResourceMeta(priorityItem.resource) : "Aucune activite locale detectee";

  if (!ready) return <p role="status" aria-live="polite">Chargement du profil local…</p>;

  return (
    <section className="dashboard-v3" aria-labelledby="dashboard-v3-title">
      <aside className="dashboard-v3__sidebar" aria-label="Navigation de l'espace local">
        <a className="dashboard-v3__brand" href="/">
          <span aria-hidden="true">R</span>
          <strong>Tableau local</strong>
          <small>Sans compte serveur</small>
        </a>

        <nav className="dashboard-v3__nav">
          {navItems.map((item) => (
            <a key={`${item.label}-${item.href}`} href={item.href === "__subject__" ? subjectRoot : item.href} aria-current={item.href === "/" ? "page" : undefined}>
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

        <div data-dashboard-subject-filter="true" aria-label="Filtrer le tableau de bord par discipline" className="ui5-u-display-flex ui5-u-gap-0-5rem ui5-u-flex-wrap-wrap">
          {dashboardSubjects.map((subject) => (
            <button
              type="button"
              key={subject.id}
             aria-pressed={subjectFilter === subject.id}
              onClick={() => setSubjectFilter(subject.id)}
              className={"ui5-u-border-1px-solid-v3-color-border ui5-u-border-radius-999px ui5-u-padding-0-45rem-0-75rem ui5-u-cursor-pointer ui5-u-font-weight-800" + " " + (subjectFilter === subject.id ? "ui5-u-background-v3-color-primary" : "ui5-u-background-v3-color-surface") + " " + (subjectFilter === subject.id ? "ui5-u-color-fff" : "ui5-u-color-v3-color-text")}
            >
              {subject.label}
            </button>
          ))}
        </div>

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
              <i className="ui5-u-width-ui5-value-width" style={{ "--ui5-value-width": `${priorityItem?.percent ?? 0}%` } as React.CSSProperties} />
            </div>
            <a href={priorityHref}>{(priorityItem?.percent ?? 0) > 0 ? "Continuer" : "Commencer"}</a>
          </article>

          <article className="dashboard-v3__metric">
            <span>Chapitres termines</span>
            <strong>{completedCount} / {visibleResources.length}</strong>
            <small>{visibleResources.length > 0 ? `${Math.round((completedCount / visibleResources.length) * 100)}% du catalogue affiché` : "Catalogue vide"}</small>
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
            <div  className="dashboard-v3__ring ui5-u---progress-ui5-value-progress" style={{ "--ui5-value---progress": `${priorityItem?.percent ?? 0}%` } as React.CSSProperties}>
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
              <a key={`${action.label}-${action.href}`} href={action.href === "__subject__" ? subjectRoot : action.href}>
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


    </section>
  );
}
