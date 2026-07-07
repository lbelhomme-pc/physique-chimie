// src/components/pedagogie/MathText.tsx
// Rend le texte avec des formules LaTeX ($...$, $$...$$, \(...\), \[...\]) via KaTeX.

import { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text?: string;
  /** Rendu en bloc (div) ou en ligne (span) */
  block?: boolean;
  /** Style CSS applique au container */
  style?: React.CSSProperties;
  /** Classe CSS */
  className?: string;
}

function renderLatex(latex: string, displayMode: boolean): string {
  try {
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

  // Formules en bloc : $$...$$ puis \[...\].
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), true);
    return `<div class="katex-block">${rendered}</div>`;
  });

  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), true);
    return `<div class="katex-block">${rendered}</div>`;
  });

  // Formules inline : \(...\) puis $...$.
  // Les donnees JSON issues du contenu scientifique utilisent beaucoup \(...\).
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), false);
    return `<span class="katex-inline">${rendered}</span>`;
  });

  // Attention a ne pas matcher les doubles dollars.
  result = result.replace(/(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g, (_, formula) => {
    const rendered = renderLatex(formula.trim(), false);
    return `<span class="katex-inline">${rendered}</span>`;
  });

  return result.replace(/\n/g, "<br>");
}

export default function MathText({ text = "", block = false, style, className }: MathTextProps) {
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

export function MathBlock({ formula, style }: { formula: string; style?: React.CSSProperties }) {
  const html = useMemo(() => renderLatex(formula, true), [formula]);
  return (
    <div
      style={{ textAlign: "center", margin: "1rem 0", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
