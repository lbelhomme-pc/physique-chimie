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
  { id: "all", label: "Toutes", tone: "all" },
  { id: "mathematiques", label: "Mathématiques", tone: "maths" },
  { id: "physique-chimie", label: "Physique-Chimie", tone: "pc" },
  { id: "enseignement-scientifique", label: "Enseignement scientifique", tone: "science" },
] as const;

const CYCLE_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "college", label: "Collège" },
  { id: "lycee", label: "Lycée" },
] as const;

const ACCESS_FILTERS = [
  { id: "all", label: "Tous" },
  { id: "free", label: "Gratuit" },
  { id: "premium", label: "Premium" },
] as const;

const SEARCH_SUGGESTIONS = ["Fonctions", "Atomes", "Vitesse"];

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

  useEffect(() => {
    const urlQuery = new URLSearchParams(window.location.search).get("q")?.trim();
    if (urlQuery) setQuery(urlQuery);
  }, []);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;
  const resultsLabel = hasQuery
    ? `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${trimmedQuery} »`
    : `${resources.length} chapitres disponibles`;

  function openActiveResult() {
    const result = results[activeIndex] ?? results[0];
    if (result) window.location.href = result.path;
  }

  function resetSearch() {
    setQuery("");
    setSubject("all");
    setCycle("all");
    setAccessTier("all");
  }

  return (
    <section className="global-search" aria-labelledby="global-search-title">
      <header className="global-search__header">
        <div>
          <p className="global-search__eyebrow">Recherche globale</p>
          <h2 id="global-search-title">Que veux-tu réviser ?</h2>
          <span>Retrouve un chapitre par notion, niveau ou matière.</span>
        </div>
        <b className="global-search__total" aria-label={`${resources.length} chapitres indexés`}>
          {resources.length}
          <small>chapitres</small>
        </b>
      </header>

      <div className="global-search__field">
        <label htmlFor="global-search-input">Rechercher un chapitre ou une notion</label>
        <div className="global-search__input-wrap">
          <span className="global-search__search-icon" aria-hidden="true"></span>
          <input
            id="global-search-input"
            name="search_term_string"
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
            placeholder="Ex. fonctions, atomes, vitesse"
          />
          {query && (
            <button
              className="global-search__clear"
              type="button"
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="global-search__suggestions" aria-label="Suggestions de recherche">
        <span>Suggestions</span>
        <div>
          {SEARCH_SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="global-search__filter-grid">
        <fieldset>
          <legend>Discipline</legend>
          <div className="global-search__filters" aria-label="Filtrer par discipline">
            {SUBJECT_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                data-tone={item.tone}
                className={subject === item.id ? "active" : undefined}
                aria-pressed={subject === item.id}
                onClick={() => setSubject(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Niveau</legend>
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
        </fieldset>

        <fieldset>
          <legend>Accès</legend>
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
        </fieldset>
      </div>

      <div className="global-search__summary">
        <p aria-live="polite">{resultsLabel}</p>
        {(query || subject !== "all" || cycle !== "all" || accessTier !== "all") && (
          <button type="button" onClick={resetSearch}>Réinitialiser</button>
        )}
      </div>

      <div
        className="global-search__results"
        id="global-search-results"
        role={hasQuery && results.length > 0 ? "listbox" : "status"}
        aria-label={hasQuery && results.length > 0 ? "Résultats de recherche" : undefined}
      >
        {!hasQuery ? (
          <p className="global-search__empty">
            Saisis au moins deux caractères ou choisis une suggestion.
          </p>
        ) : results.length > 0 ? (
          results.map((resource, index) => (
            <a
              href={resource.path}
              id={`global-search-result-${index}`}
              key={resource.id}
              className={index === activeIndex ? "global-search__result active" : "global-search__result"}
              data-subject={resource.subject}
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
              <span className="global-search__result-side">
                <span className="global-search__badges">
                  <b>{getSearchResourceTypeLabel(resource.resourceType)}</b>
                  <b>{getSearchAccessLabel(resource.accessTier)}</b>
                </span>
                <span className="global-search__arrow" aria-hidden="true">→</span>
              </span>
            </a>
          ))
        ) : (
          <p className="global-search__empty">
            Aucun chapitre ne correspond à ces critères.
          </p>
        )}
      </div>

      <style>{`
        .global-search {
          background: #ffffff;
          border: 1px solid #cbdcf7;
          border-radius: 8px;
          box-shadow: 0 18px 45px rgba(12, 48, 106, 0.09);
          color: #061849;
          display: grid;
          gap: 1.35rem;
          padding: 2rem;
        }

        .global-search__header {
          align-items: start;
          display: grid;
          gap: 2rem;
          grid-template-columns: minmax(0, 1fr) auto;
        }

        .global-search__eyebrow {
          color: #1765ff;
          font-size: 0.75rem;
          font-weight: 950;
          letter-spacing: 0;
          margin: 0 0 0.5rem;
          text-transform: uppercase;
        }

        .global-search__header h2 {
          color: #00184d;
          font-size: 2rem;
          font-weight: 950;
          letter-spacing: 0;
          line-height: 1.08;
          margin: 0;
        }

        .global-search__header div > span {
          color: #52617c;
          display: block;
          font-size: 0.95rem;
          font-weight: 650;
          margin-top: 0.55rem;
        }

        .global-search__total {
          align-items: center;
          background: #edf5ff;
          border-left: 3px solid #1765ff;
          color: #00184d;
          display: flex;
          font-size: 1.3rem;
          gap: 0.45rem;
          min-height: 42px;
          padding: 0.5rem 0.75rem;
        }

        .global-search__total small {
          color: #52617c;
          font-size: 0.72rem;
          font-weight: 850;
        }

        .global-search__field {
          display: grid;
          gap: 0.45rem;
        }

        .global-search__field label,
        .global-search fieldset legend {
          color: #1f355f;
          font-size: 0.78rem;
          font-weight: 900;
        }

        .global-search__input-wrap {
          align-items: center;
          background: #ffffff;
          border: 2px solid #a9c3ef;
          border-radius: 8px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          min-height: 56px;
          padding: 0 0.65rem 0 1rem;
          transition: border-color 120ms ease, box-shadow 120ms ease;
        }

        .global-search__input-wrap:focus-within {
          border-color: #1765ff;
          box-shadow: 0 0 0 4px rgba(23, 101, 255, 0.14);
        }

        .global-search__search-icon {
          border: 2px solid #1765ff;
          border-radius: 50%;
          height: 15px;
          margin-right: 0.8rem;
          position: relative;
          width: 15px;
        }

        .global-search__search-icon::after {
          background: #1765ff;
          bottom: -5px;
          content: "";
          height: 2px;
          position: absolute;
          right: -5px;
          transform: rotate(45deg);
          width: 7px;
        }

        .global-search input {
          background: transparent;
          border: 0;
          color: #061849;
          font: inherit;
          font-size: 1rem;
          font-weight: 700;
          min-height: 52px;
          min-width: 0;
          outline: none;
          padding: 0;
          width: 100%;
        }

        .global-search input::placeholder {
          color: #71809a;
          opacity: 1;
        }

        .global-search input::-webkit-search-cancel-button {
          display: none;
        }

        .global-search__clear {
          align-items: center;
          background: #edf3fb;
          border: 0;
          border-radius: 50%;
          color: #1f355f;
          cursor: pointer;
          display: inline-flex;
          font-size: 1.15rem;
          height: 34px;
          justify-content: center;
          padding: 0;
          width: 34px;
        }

        .global-search__suggestions {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          gap: 0.65rem;
        }

        .global-search__suggestions > span {
          color: #52617c;
          font-size: 0.76rem;
          font-weight: 850;
        }

        .global-search__suggestions > div {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .global-search__suggestions button {
          background: #ffffff;
          border: 1px solid #bcd0ef;
          border-radius: 6px;
          color: #1765ff;
          cursor: pointer;
          font: inherit;
          font-size: 0.76rem;
          font-weight: 850;
          min-height: 34px;
          padding: 0.35rem 0.65rem;
        }

        .global-search__filter-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: minmax(0, 1.5fr) minmax(190px, 0.75fr) minmax(190px, 0.75fr);
        }

        .global-search fieldset {
          border: 0;
          display: grid;
          gap: 0.4rem;
          margin: 0;
          min-width: 0;
          padding: 0;
        }

        .global-search fieldset legend {
          margin-bottom: 0.4rem;
          padding: 0;
        }

        .global-search__filters {
          background: #edf3fb;
          border: 1px solid #d3e0f2;
          border-radius: 8px;
          display: grid;
          gap: 0.25rem;
          grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
          padding: 0.25rem;
        }

        .global-search__filters button {
          --filter-accent: #1765ff;
          background: transparent;
          border: 0;
          border-radius: 6px;
          color: #40506c;
          cursor: pointer;
          font: inherit;
          font-size: 0.76rem;
          font-weight: 850;
          line-height: 1.2;
          min-height: 40px;
          min-width: 0;
          padding: 0.45rem 0.55rem;
        }

        .global-search__filters button[data-tone="maths"] {
          --filter-accent: #1765ff;
        }

        .global-search__filters button[data-tone="pc"] {
          --filter-accent: #7050ee;
        }

        .global-search__filters button[data-tone="science"] {
          --filter-accent: #008f78;
        }

        .global-search__filters button.active {
          background: var(--filter-accent);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--filter-accent) 22%, transparent);
          color: #ffffff;
        }

        .global-search__suggestions button:hover,
        .global-search__suggestions button:focus-visible {
          background: #edf5ff;
          border-color: #1765ff;
        }

        .global-search button:focus-visible {
          box-shadow: 0 0 0 3px rgba(23, 101, 255, 0.26);
          outline: none;
        }

        .global-search__summary {
          align-items: center;
          border-top: 1px solid #e1e9f5;
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          padding-top: 1rem;
        }

        .global-search__summary p {
          color: #1f355f;
          font-size: 0.82rem;
          font-weight: 900;
          margin: 0;
        }

        .global-search__summary button {
          background: transparent;
          border: 0;
          color: #1765ff;
          cursor: pointer;
          font: inherit;
          font-size: 0.78rem;
          font-weight: 900;
          min-height: 36px;
          padding: 0.35rem 0.4rem;
        }

        .global-search__results {
          display: grid;
          gap: 0.55rem;
        }

        .global-search__result {
          --result-accent: #1765ff;
          align-items: flex-start;
          background: #fbfdff;
          border: 1px solid #d8e4f5;
          border-left: 4px solid var(--result-accent);
          border-radius: 6px;
          color: inherit;
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          min-height: 74px;
          padding: 0.9rem 1rem;
          text-decoration: none;
        }

        .global-search__result[data-subject="physique-chimie"] {
          --result-accent: #7050ee;
        }

        .global-search__result[data-subject="enseignement-scientifique"] {
          --result-accent: #008f78;
        }

        .global-search__result-main {
          display: grid;
          gap: 0.3rem;
          min-width: 0;
        }

        .global-search__result strong {
          color: #061849;
          display: block;
          font-size: 0.94rem;
          line-height: 1.3;
        }

        .global-search__result small {
          color: #52617c;
          line-height: 1.45;
        }

        .global-search__meta,
        .global-search__badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .global-search__meta {
          color: #5e6d86;
          font-size: 0.72rem;
          font-weight: 750;
        }

        .global-search__meta i {
          font-style: normal;
        }

        .global-search__meta i:not(:last-child)::after {
          color: #9bacbf;
          content: "·";
          padding-left: 0.35rem;
        }

        .global-search__result-side {
          align-items: center;
          display: flex;
          flex: 0 0 auto;
          gap: 0.75rem;
        }

        .global-search__badges {
          justify-content: flex-end;
        }

        .global-search__badges b {
          background: #ffffff;
          border: 1px solid #d3e0f2;
          border-radius: 4px;
          color: #40506c;
          font-size: 0.68rem;
          padding: 0.25rem 0.4rem;
          white-space: nowrap;
        }

        .global-search__arrow {
          color: var(--result-accent);
          font-size: 1.1rem;
          font-weight: 950;
        }

        .global-search__result:hover,
        .global-search__result:focus-visible,
        .global-search__result.active {
          background: #ffffff;
          border-color: var(--result-accent);
          box-shadow: 0 7px 18px rgba(12, 48, 106, 0.08);
          outline: none;
        }

        .global-search__empty {
          background: #f7faff;
          border: 1px dashed #a9c3ef;
          border-radius: 6px;
          color: #52617c;
          font-size: 0.86rem;
          margin: 0;
          padding: 1rem;
        }

        @media (max-width: 900px) {
          .global-search__filter-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .global-search {
            gap: 1.15rem;
            padding: 1.25rem;
          }

          .global-search__header {
            gap: 1rem;
            grid-template-columns: 1fr;
          }

          .global-search__header h2 {
            font-size: 1.65rem;
          }

          .global-search__total {
            justify-self: start;
          }

          .global-search__filters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .global-search__summary {
            align-items: flex-start;
            flex-direction: column;
            gap: 0.35rem;
          }

          .global-search__result {
            flex-direction: column;
          }

          .global-search__result-side {
            justify-content: space-between;
            width: 100%;
          }

          .global-search__badges {
            justify-content: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
