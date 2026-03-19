// src/components/ui/SearchBar.tsx
// Barre de recherche fonctionnelle — cherche dans tous les chapitres

import { useState, useRef, useEffect } from "react";

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

  // Fermer les résultats quand on clique ailleurs
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const results = query.trim().length < 2 ? [] : chapters.filter(ch => {
    const q = query.toLowerCase();
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.slug.toLowerCase().includes(q) ||
      ch.matiere.toLowerCase().includes(q) ||
      (ch.description ?? "").toLowerCase().includes(q) ||
      (ch.keywords ?? []).some(k => k.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  return (
    <div ref={ref} style={{ position: "relative", maxWidth: 700, margin: "1rem auto" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.75rem 1.25rem",
        background: "var(--bg-card)", border: "1px solid var(--border-color)",
        borderRadius: open && results.length > 0 ? "var(--radius-lg) var(--radius-lg) 0 0" : "var(--radius-pill)",
        boxShadow: "var(--shadow-xs)", transition: "border-radius 0.2s"
      }}>
        <span>🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1, border: "none", background: "transparent",
            fontSize: "0.95rem", color: "var(--text-primary)",
            outline: "none", fontFamily: "inherit"
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: "0.85rem"
          }}>✕</button>
        )}
      </div>

      {/* Résultats dropdown */}
      {open && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          boxShadow: "var(--shadow-lg)", maxHeight: 350, overflowY: "auto"
        }}>
          {results.map(ch => (
            <a
              key={ch.id}
              href={ch.path}
              onClick={() => setOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1.25rem", textDecoration: "none", color: "inherit",
                borderBottom: "1px solid var(--border-light)", transition: "background 0.15s"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{
                fontSize: "0.7rem", fontWeight: 700,
                padding: "0.15rem 0.5rem", borderRadius: "var(--radius-pill)",
                background: ch.matiere === "chimie" ? "var(--accent-purple-light)" : "var(--accent-primary-light)",
                color: ch.matiere === "chimie" ? "var(--accent-purple)" : "var(--accent-primary)"
              }}>
                {ch.matiere === "chimie" ? "🧪" : "⚡"} {ch.matiere}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>{ch.title}</span>
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>{ch.niveau}</span>
              </span>
              <span style={{ color: "var(--accent-primary)", fontSize: "0.85rem" }}>→</span>
            </a>
          ))}
        </div>
      )}

      {/* Pas de résultats */}
      {open && query.trim().length >= 2 && results.length === 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
          background: "var(--bg-card)", border: "1px solid var(--border-color)",
          borderTop: "none", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          boxShadow: "var(--shadow-lg)", padding: "1rem 1.25rem",
          textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem"
        }}>
          Aucun chapitre trouvé pour « {query} »
        </div>
      )}
    </div>
  );
}
