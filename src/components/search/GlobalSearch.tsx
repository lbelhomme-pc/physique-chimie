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
  resources?: GlobalSearchResource[];
  resourceUrl?: string;
  resourceCount?: number;
  initialSubject?: SearchSubject | "all";
}

const SUBJECT_FILTERS = [
  { id: "all", label: "Toutes", tone: "all" },
  { id: "mathematiques", label: "Mathématiques", tone: "maths" },
  { id: "physique-chimie", label: "Physique-Chimie", tone: "pc" },
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

export default function GlobalSearch({
  resources: initialResources = [],
  resourceUrl,
  resourceCount = initialResources.length,
  initialSubject = "all",
}: Props) {
  const [resources, setResources] = useState<GlobalSearchResource[]>(initialResources);
  const [isLoading, setIsLoading] = useState(Boolean(resourceUrl && initialResources.length === 0));
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<SearchSubject | "all">(initialSubject);
  const [cycle, setCycle] = useState<SearchCycle | "all">("all");
  const [accessTier, setAccessTier] = useState<SearchAccessTier | "all">("all");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!resourceUrl || initialResources.length > 0) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);

    fetch(resourceUrl, { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error(`Search index HTTP ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!cancelled && Array.isArray(payload)) {
          setResources(payload as GlobalSearchResource[]);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialResources.length, resourceUrl]);

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
  const displayedResourceCount = resources.length || resourceCount;
  const resultsLabel = isLoading
    ? "Chargement de l’index de recherche…"
    : loadError
      ? "Index de recherche indisponible."
      : hasQuery
        ? `${results.length} résultat${results.length > 1 ? "s" : ""} pour « ${trimmedQuery} »`
        : `${displayedResourceCount} chapitres disponibles`;

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
    <section id="global-search" className="global-search" aria-labelledby="global-search-title">
      <header className="global-search__header">
        <div>
          <p className="global-search__eyebrow">Recherche globale</p>
          <h2 id="global-search-title">Que veux-tu réviser ?</h2>
          <span>Retrouve un chapitre par notion, niveau ou matière.</span>
        </div>
        <b className="global-search__total" aria-label={`${displayedResourceCount} chapitres indexés`}>
          {displayedResourceCount}
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
        {hasQuery && isLoading ? (
          <p className="global-search__empty">Chargement de l’index de recherche…</p>
        ) : hasQuery && loadError ? (
          <p className="global-search__empty">La recherche est momentanément indisponible.</p>
        ) : !hasQuery ? (
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


    </section>
  );
}
