// src/components/pedagogie/MathText.tsx
// Composant qui rend le texte avec des formules LaTeX ($...$) en HTML via KaTeX
// Usage : <MathText text="La formule $E=mc^2$ est célèbre" />

import { useMemo } from "react";

interface MathTextProps {
  text: string;
  /** Rendu en bloc (div) ou en ligne (span) */
  block?: boolean;
  /** Style CSS appliqué au container */
  style?: React.CSSProperties;
  /** Classe CSS */
  className?: string;
}

// ─── Rendu KaTeX côté client ──────────────────────────────
// On utilise l'API KaTeX chargée via CDN dans le <head>
// Si KaTeX n'est pas disponible, on affiche le texte brut

function renderLatex(latex: string, displayMode: boolean): string {
  try {
    // KaTeX est chargé globalement via le CDN dans BaseLayout
    const katex = (window as any).katex;
    if (!katex) return latex;
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: "html",
    });
  } catch {
    return latex;
  }
}

function processText(text: string): string {
  if (!text) return "";

  // Étape 1 : formules en bloc ($$...$$)
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), true);
    return `<div class="katex-block">${rendered}</div>`;
  });

  // Étape 2 : formules inline ($...$) — attention à ne pas matcher les $$
  result = result.replace(/(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), false);
    return `<span class="katex-inline">${rendered}</span>`;
  });

  // Étape 3 : retours à la ligne (\n) en <br>
  result = result.replace(/\n/g, "<br>");

  return result;
}

export default function MathText({ text, block = false, style, className }: MathTextProps) {
  const html = useMemo(() => processText(text), [text]);

  const Tag = block ? "div" : "span";

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Composant pour un bloc de formule seul ──────────────
export function MathBlock({ formula, style }: { formula: string; style?: React.CSSProperties }) {
  const html = useMemo(() => renderLatex(formula, true), [formula]);
  return (
    <div
      style={{ textAlign: "center", margin: "1rem 0", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
