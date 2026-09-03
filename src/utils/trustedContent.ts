import katex from "katex";

export type PlainText = string & { readonly __contentKind: "plain-text" };
export type MathFormulaText = string & { readonly __contentKind: "math-formula" };
export type TrustedHtml = string & { readonly __contentKind: "trusted-html" };

const ALLOWED_TAGS = new Set([
  "a", "abbr", "article", "aside", "b", "blockquote", "br", "caption", "cite", "code", "col", "colgroup",
  "dd", "details", "div", "dl", "dt", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
  "hr", "i", "img", "kbd", "li", "main", "mark", "ol", "p", "pre", "s", "section", "small", "span",
  "strong", "sub", "summary", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
  "svg", "g", "defs", "title", "desc", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon",
  "text", "tspan", "marker", "linearGradient", "radialGradient", "stop",
  "math", "semantics", "mrow", "mi", "mn", "mo", "ms", "mtext", "mspace", "msup", "msub", "msubsup",
  "mfrac", "msqrt", "mroot", "mover", "munder", "munderover", "mpadded", "mphantom", "menclose",
  "mtable", "mtr", "mtd", "annotation",
]);

const VOID_TAGS = new Set(["br", "hr", "img", "col"]);

const GLOBAL_ATTRS = new Set([
  "aria-hidden", "aria-label", "aria-labelledby", "aria-describedby", "class", "colspan", "focusable", "height",
  "id", "role", "rowspan", "title", "viewbox", "width", "x", "y",
]);

const URL_ATTRS = new Set(["href", "src", "xlink:href"]);

const SVG_ATTRS = new Set([
  "alignment-baseline", "cx", "cy", "d", "dx", "dy", "fill", "fill-opacity", "font-family", "font-size",
  "font-style", "font-weight", "marker-end", "marker-height", "marker-mid", "marker-start", "marker-width",
  "offset", "opacity", "orient", "points", "preserveaspectratio", "r", "refx", "refy", "rx", "ry", "stop-color",
  "stop-opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-opacity",
  "stroke-width", "text-anchor", "transform", "viewBox", "x1", "x2", "y1", "y2",
]);

const HTML_ATTRS = new Set(["alt", "scope"]);
const MATHML_ATTRS = new Set([
  "accent", "accentunder", "columnalign", "display", "encoding", "fence", "lspace", "mathvariant",
  "notation", "rowalign", "rowspan", "rspace", "scriptlevel", "separator", "stretchy", "xmlns",
]);

const SAFE_CSS_PROPERTY = /^(?:--[\w-]+|color|background(?:-color)?|border(?:-(?:color|width|style|radius))?|border-left|display|font(?:-(?:size|weight|style|family))?|height|line-height|margin(?:-(?:top|right|bottom|left))?|max-width|min-height|overflow-x|padding(?:-(?:top|right|bottom|left))?|text-align|width)$/i;
const SAFE_CSS_VALUE = /^(?!.*(?:url\s*\(|expression\s*\(|javascript:|data:text\/html|@import|\\|\/\*|\*\/|<|>)).{0,240}$/i;

export function asPlainText(value: string): PlainText {
  return String(value ?? "") as PlainText;
}

export function asMathFormulaText(value: string): MathFormulaText {
  return String(value ?? "") as MathFormulaText;
}

export function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(value: string): boolean {
  // Control characters are stripped before protocol checks to prevent obfuscated URLs.
  // eslint-disable-next-line no-control-regex
  const trimmed = value.trim().replace(/[\u0000-\u001f\u007f\s]+/g, "");
  if (!trimmed) return true;
  if (trimmed.startsWith("#")) return true;
  if (trimmed.startsWith("//") || trimmed.startsWith("\\\\") || trimmed.startsWith("/\\")) return false;
  if (trimmed.startsWith("/")) return true;
  if (/^(?:https?:|mailto:|tel:)/i.test(trimmed)) return true;
  if (/^data:image\/(?:png|gif|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(trimmed)) return true;
  return false;
}

function sanitizeStyle(value: string): string {
  const declarations = value.split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf(":");
      if (separator === -1) return "";
      const property = part.slice(0, separator).trim();
      const rawValue = part.slice(separator + 1).trim();
      if (!SAFE_CSS_PROPERTY.test(property) || !SAFE_CSS_VALUE.test(rawValue)) return "";
      return `${property}: ${rawValue}`;
    })
    .filter(Boolean);
  return declarations.join("; ");
}

function isAllowedAttr(tag: string, name: string): boolean {
  if (name.startsWith("on")) return false;
  if (name.startsWith("aria-") || name.startsWith("data-")) return true;
  return GLOBAL_ATTRS.has(name) || HTML_ATTRS.has(name) || SVG_ATTRS.has(name) || MATHML_ATTRS.has(name) || (tag === "a" && name === "target");
}

function sanitizeAttributes(tag: string, source: string): string {
  const attrs: string[] = [];
  const attrPattern = /([:@A-Za-z_][:@A-Za-z0-9_.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(attrPattern)) {
    const rawName = match[1];
    const name = rawName.trim();
    const lowerName = name.toLowerCase();
    if (!isAllowedAttr(tag, lowerName) && !URL_ATTRS.has(lowerName) && lowerName !== "style") continue;
    const rawValue = match[2] ?? match[3] ?? match[4] ?? "";
    if (URL_ATTRS.has(lowerName)) {
      if (!isSafeUrl(rawValue)) continue;
    } else if (lowerName === "style") {
      const sanitizedStyle = sanitizeStyle(rawValue);
      if (!sanitizedStyle) continue;
      attrs.push(`style="${escapeHtml(sanitizedStyle)}"`);
      continue;
    } else if (lowerName === "target" && !["_blank", "_self", "_parent", "_top"].includes(rawValue)) {
      continue;
    }
    attrs.push(`${name}="${escapeHtml(rawValue)}"`);
  }
  if (tag === "a" && attrs.some((attr) => attr.startsWith("target=\"_blank\""))) {
    attrs.push('rel="noopener noreferrer"');
  }
  return attrs.length ? ` ${attrs.join(" ")}` : "";
}

export function sanitizeTrustedHtml(source: string): TrustedHtml {
  const withoutDangerousBlocks = String(source ?? "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(?:script|iframe|object|embed|style|link|meta|base|form|input|button|textarea|select|option|video|audio|source|canvas)\b[\s\S]*?<\s*\/\s*(?:script|iframe|object|embed|style|link|meta|base|form|input|button|textarea|select|option|video|audio|source|canvas)\s*>/gi, "")
    .replace(/<\s*(?:script|iframe|object|embed|style|link|meta|base|form|input|button|textarea|select|option|video|audio|source|canvas)\b[^>]*\/?\s*>/gi, "");

  return withoutDangerousBlocks.replace(/<\s*(\/?)\s*([A-Za-z][A-Za-z0-9:-]*)([^>]*)>/g, (_full, slash, rawTag, rawAttrs) => {
    const tag = rawTag;
    const normalized = tag.toLowerCase();
    const allowedTag = [...ALLOWED_TAGS].find((item) => item.toLowerCase() === normalized);
    if (!allowedTag) return "";
    if (slash) return VOID_TAGS.has(allowedTag) ? "" : `</${allowedTag}>`;
    const attrs = sanitizeAttributes(allowedTag, rawAttrs);
    const selfClosing = /\/\s*$/.test(rawAttrs);
    if (selfClosing && !VOID_TAGS.has(allowedTag)) return `<${allowedTag}${attrs}></${allowedTag}>`;
    return `<${allowedTag}${attrs}>`;
  }) as TrustedHtml;
}

export function sanitizeTrustedSvg(source: string): TrustedHtml {
  const sanitized = sanitizeTrustedHtml(source);
  return String(sanitized).replace(/<(?!\/?(?:svg|g|defs|title|desc|path|rect|circle|ellipse|line|polyline|polygon|text|tspan|marker|linearGradient|radialGradient|stop)\b)[^>]+>/gi, "") as TrustedHtml;
}

export function renderKatexToTrustedHtml(formula: MathFormulaText, displayMode: boolean): TrustedHtml {
  try {
    return katex.renderToString(String(formula), {
      throwOnError: false,
      displayMode,
      output: "htmlAndMathml",
      trust: false,
      strict: "warn",
    }) as TrustedHtml;
  } catch {
    return escapeHtml(String(formula)) as TrustedHtml;
  }
}

type MathMatch = { start: number; end: number; formula: string; displayMode: boolean };

function findNextMath(source: string, from: number): MathMatch | null {
  const patterns = [
    { open: "$$", close: "$$", displayMode: true },
    { open: "\\[", close: "\\]", displayMode: true },
    { open: "\\(", close: "\\)", displayMode: false },
    { open: "$", close: "$", displayMode: false },
  ];
  let best: MathMatch | null = null;
  for (const pattern of patterns) {
    const start = source.indexOf(pattern.open, from);
    if (start === -1) continue;
    if (pattern.open === "$" && source[start + 1] === "$") continue;
    const contentStart = start + pattern.open.length;
    const end = source.indexOf(pattern.close, contentStart);
    if (end === -1) continue;
    if (pattern.close === "$" && source[end - 1] === "$") continue;
    const match = { start, end: end + pattern.close.length, formula: source.slice(contentStart, end), displayMode: pattern.displayMode };
    if (!best || match.start < best.start) best = match;
  }
  return best;
}

export function renderMathTextToTrustedHtml(source: PlainText): TrustedHtml {
  const text = String(source ?? "");
  let cursor = 0;
  let html = "";
  while (cursor < text.length) {
    const match = findNextMath(text, cursor);
    if (!match) {
      html += escapeHtml(text.slice(cursor));
      break;
    }
    html += escapeHtml(text.slice(cursor, match.start));
    const rendered = renderKatexToTrustedHtml(asMathFormulaText(match.formula.trim()), match.displayMode);
    html += match.displayMode
      ? `<div class="katex-block">${rendered}</div>`
      : `<span class="katex-inline">${rendered}</span>`;
    cursor = match.end;
  }
  return html.replace(/\n/g, "<br>") as TrustedHtml;
}

export function renderMathInTrustedHtml(source: string): TrustedHtml {
  const trusted = String(source ?? "")
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => `<div class="katex-block">${renderKatexToTrustedHtml(asMathFormulaText(String(formula).trim()), true)}</div>`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, formula) => `<div class="katex-block">${renderKatexToTrustedHtml(asMathFormulaText(String(formula).trim()), true)}</div>`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => `<span class="katex-inline">${renderKatexToTrustedHtml(asMathFormulaText(String(formula).trim()), false)}</span>`)
    .replace(/(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g, (_, formula) => `<span class="katex-inline">${renderKatexToTrustedHtml(asMathFormulaText(String(formula).trim()), false)}</span>`);
  return sanitizeTrustedHtml(trusted);
}
