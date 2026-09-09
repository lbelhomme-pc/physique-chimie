import { useEffect, useRef, useState } from "react";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  niveau: string;
  matiere: string;
  description?: string;
  keywords?: string[];
  path: string;
}

interface Props {
  chapters: Chapter[];
  placeholder?: string;
}

export default function SearchBar({ chapters, placeholder = "Rechercher un chapitre, un thème..." }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = query.trim().length < 2 ? [] : chapters.filter((chapter) => {
    const q = query.toLowerCase();
    return (
      chapter.title.toLowerCase().includes(q) ||
      chapter.slug.toLowerCase().includes(q) ||
      chapter.matiere.toLowerCase().includes(q) ||
      (chapter.description ?? "").toLowerCase().includes(q) ||
      (chapter.keywords ?? []).some((keyword) => keyword.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const showResults = open && results.length > 0;
  const showEmpty = open && query.trim().length >= 2 && results.length === 0;

  return (
    <div ref={ref} className="legacy-search">
      <div className={showResults ? "legacy-search__field is-open" : "legacy-search__field"}>
        <span className="legacy-search__icon" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={showResults}
        />
        {query && (
          <button
            type="button"
            className="legacy-search__clear"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {showResults && (
        <div className="legacy-search__results" role="listbox" aria-label="Résultats de recherche">
          {results.map((chapter) => (
            <a
              key={chapter.id}
              href={chapter.path}
              className="legacy-search__result"
              onClick={() => setOpen(false)}
            >
              <span
                className="legacy-search__badge"
                data-subject={chapter.matiere === "chimie" ? "chimie" : "physique"}
              >
                {chapter.matiere}
              </span>
              <span className="legacy-search__result-copy">
                <strong>{chapter.title}</strong>
                <small>{chapter.niveau}</small>
              </span>
              <span className="legacy-search__arrow" aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      )}

      {showEmpty && (
        <div className="legacy-search__empty" role="status">
          Aucun chapitre trouvé pour « {query} »
        </div>
      )}
    </div>
  );
}
