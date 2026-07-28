import { useEffect, useMemo, useState } from "react";
import {
  getSearchAccessLabel,
  getSearchResourceTypeLabel,
  searchResources,
  type GlobalSearchResource,
  type SearchAccessTier,
  type SearchCycle,
  type SearchSubject,
} from "../../data/searchIndex";

export type { GlobalSearchResource, SearchSubject } from "../../data/searchIndex";

interface Props {
  resources: GlobalSearchResource[];
  initialSubject?: SearchSubject | "all";
}

const SUBJECT_FILTERS = [
  { id: "all", label: "Tout" },
  { id: "mathematiques", label: "Maths" },
  { id: "physique-chimie", label: "Physique-Chimie" },
] as const;

const CYCLE_FILTERS = [
  { id: "all", label: "Tous niveaux" },
  { id: "college", label: "College" },
  { id: "lycee", label: "Lycee" },
] as const;

const ACCESS_FILTERS = [
  { id: "all", label: "Tout acces" },
  { id: "free", label: "Gratuit" },
  { id: "premium", label: "Premium" },
] as const;

export default function GlobalSearch({ resources, initialSubject = "all" }: Props) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SearchSubject | "all">(initialSubject);
  const [cycle, setCycle] = useState<SearchCycle | "all">("all");
  const [accessTier, setAccessTier] = useState<SearchAccessTier | "all">("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    return searchResources(resources, { query, subject, cycle, accessTier, limit: 12 });
  }, [accessTier, cycle, query, resources, subject]);

  useEffect(() => {
    setActiveIndex(0);
  }, [accessTier, cycle, query, subject]);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;
  const resultsLabel = hasQuery
    ? `${results.length} resultat${results.length > 1 ? "s" : ""} pour ${trimmedQuery}`
    : "Saisis au moins deux caracteres pour lancer la recherche.";

  function openActiveResult() {
    const result = results[activeIndex] ?? results[0];
    if (result) window.location.href = result.path;
  }

  return (
    <section className="global-search" aria-labelledby="global-search-title" id="recherche">
      <div className="global-search__header">
        <p>Recherche globale</p>
        <h2 id="global-search-title">Trouver un chapitre</h2>
        <span>{resources.length} ressources indexees par discipline, niveau, type et acces.</span>
      </div>

      <div className="global-search__controls">
        <label>
          <span>Recherche</span>
          <input
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="global-search-results"
            aria-expanded={hasQuery && results.length > 0}
            aria-activedescendant={results[activeIndex] ? `global-search-result-${activeIndex}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (!results.length) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) => Math.min(index + 1, results.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                openActiveResult();
              }
            }}
            placeholder="Fonctions, atomes, vitesse..."
          />
        </label>

        <div className="global-search__filters" aria-label="Filtrer par discipline">
          {SUBJECT_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={subject === item.id ? "active" : undefined}
              aria-pressed={subject === item.id}
              onClick={() => setSubject(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="global-search__secondary-controls">
        <div className="global-search__filters" aria-label="Filtrer par cycle">
          {CYCLE_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cycle === item.id ? "active" : undefined}
              aria-pressed={cycle === item.id}
              onClick={() => setCycle(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="global-search__filters" aria-label="Filtrer par acces">
          {ACCESS_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={accessTier === item.id ? "active" : undefined}
              aria-pressed={accessTier === item.id}
              onClick={() => setAccessTier(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="global-search__count" aria-live="polite">{resultsLabel}</p>

      <div
        className="global-search__results"
        id="global-search-results"
        role={hasQuery && results.length > 0 ? "listbox" : "status"}
        aria-label={hasQuery && results.length > 0 ? "Resultats de recherche" : undefined}
      >
        {!hasQuery ? (
          <p className="global-search__empty">Saisis au moins deux caracteres pour lancer la recherche.</p>
        ) : results.length > 0 ? (
          results.map((resource, index) => (
            <a
              href={resource.path}
              id={`global-search-result-${index}`}
              key={resource.id}
              className={index === activeIndex ? "global-search__result active" : "global-search__result"}
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="global-search__result-main">
                <strong>{resource.title}</strong>
                {resource.description && <small>{resource.description}</small>}
                <span className="global-search__meta">
                  <i>{resource.subjectLabel}</i>
                  <i>{resource.levelLabel}</i>
                  {resource.matiereLabel && <i>{resource.matiereLabel}</i>}
                </span>
              </span>
              <span className="global-search__badges">
                <b>{getSearchResourceTypeLabel(resource.resourceType)}</b>
                <b>{getSearchAccessLabel(resource.accessTier)}</b>
              </span>
            </a>
          ))
        ) : (
          <p className="global-search__empty">Aucun resultat dans les niveaux publies.</p>
        )}
      </div>

      <style>{`
        .global-search {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          display: grid;
          gap: 1rem;
          padding: 1.25rem;
        }

        .global-search__header p {
          color: var(--accent-primary);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          margin: 0 0 0.35rem;
          text-transform: uppercase;
        }

        .global-search__header h2 {
          color: var(--text-primary);
          font-size: clamp(1.35rem, 3vw, 1.85rem);
          letter-spacing: 0;
          margin: 0;
        }

        .global-search__header span,
        .global-search__count {
          color: var(--text-secondary);
          display: block;
          margin-top: 0.35rem;
        }

        .global-search__controls {
          align-items: end;
          display: grid;
          gap: 0.85rem;
          grid-template-columns: minmax(0, 1fr) auto;
        }

        .global-search__secondary-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .global-search label {
          color: var(--text-secondary);
          display: grid;
          font-weight: 800;
          gap: 0.35rem;
        }

        .global-search input {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-pill);
          color: var(--text-primary);
          font: inherit;
          min-height: 48px;
          padding: 0.65rem 1rem;
        }

        .global-search__filters {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-pill);
          display: inline-flex;
          gap: 0.2rem;
          padding: 0.22rem;
        }

        .global-search__filters button {
          background: transparent;
          border: 0;
          border-radius: var(--radius-pill);
          color: var(--text-secondary);
          cursor: pointer;
          font: inherit;
          font-weight: 850;
          min-height: 44px;
          padding: 0.48rem 0.7rem;
        }

        .global-search__filters button.active {
          background: var(--accent-primary);
          color: #fff;
        }

        .global-search__filters button:focus-visible,
        .global-search input:focus-visible {
          outline: 3px solid color-mix(in srgb, var(--accent-primary) 38%, transparent);
          outline-offset: 2px;
        }

        .global-search__results {
          display: grid;
          gap: 0.55rem;
        }

        .global-search__count {
          font-weight: 800;
          margin: 0;
        }

        .global-search__result {
          align-items: flex-start;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: inherit;
          display: flex;
          gap: 0.8rem;
          justify-content: space-between;
          min-height: 58px;
          padding: 0.75rem 0.9rem;
          text-decoration: none;
        }

        .global-search__result-main {
          display: grid;
          gap: 0.25rem;
          min-width: 0;
        }

        .global-search__result strong {
          color: var(--text-primary);
          display: block;
        }

        .global-search__result small,
        .global-search__meta,
        .global-search__empty {
          color: var(--text-secondary);
        }

        .global-search__meta,
        .global-search__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .global-search__meta i {
          font-style: normal;
        }

        .global-search__meta i:not(:last-child)::after {
          content: "·";
          padding-left: 0.35rem;
        }

        .global-search__badges {
          justify-content: flex-end;
        }

        .global-search__badges b {
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-pill);
          color: var(--text-secondary);
          font-size: 0.78rem;
          padding: 0.25rem 0.5rem;
          white-space: nowrap;
        }

        .global-search__result:hover,
        .global-search__result:focus-visible,
        .global-search__result.active {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-xs);
          outline: none;
        }

        .global-search__empty {
          margin: 0;
        }

        @media (max-width: 760px) {
          .global-search__controls {
            grid-template-columns: 1fr;
          }

          .global-search__filters,
          .global-search__filters button {
            width: 100%;
          }

          .global-search__filters button {
            flex: 1;
          }

          .global-search__result {
            align-items: flex-start;
            flex-direction: column;
          }

          .global-search__badges {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
