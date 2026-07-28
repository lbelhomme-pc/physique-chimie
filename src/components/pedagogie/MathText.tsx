// src/components/pedagogie/MathText.tsx
// Rend le texte avec des formules LaTeX ($...$, $$...$$, \(...\), \[...\]) via KaTeX.

import { useMemo } from "react";
import {
  asMathFormulaText,
  asPlainText,
  renderKatexToTrustedHtml,
  renderMathTextToTrustedHtml,
} from "../../utils/trustedContent";

interface MathTextProps {
  text?: string;
  /** Rendu en bloc (div) ou en ligne (span) */
  block?: boolean;
  /** Style CSS applique au container */
  style?: React.CSSProperties;
  /** Classe CSS */
  className?: string;
}

export default function MathText({ text = "", block = false, style, className }: MathTextProps) {
  const html = useMemo(() => renderMathTextToTrustedHtml(asPlainText(text)), [text]);
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
  const html = useMemo(() => renderKatexToTrustedHtml(asMathFormulaText(formula), true), [formula]);
  return (
    <div
      style={{ textAlign: "center", margin: "1rem 0", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
