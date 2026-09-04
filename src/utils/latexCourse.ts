import katex from "katex";

type BoxKind = "definition" | "propriete" | "methode" | "exemple" | "attention" | "remarque" | "aretenir";

const BOX_LABELS: Record<BoxKind, string> = {
  definition: "Définition",
  propriete: "Propriété",
  methode: "Méthode",
  exemple: "Exemple",
  attention: "Attention",
  remarque: "Remarque",
  aretenir: "À retenir",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function findClosingBrace(source: string, openIndex: number) {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{" && source[index - 1] !== "\\") depth += 1;
    if (char === "}" && source[index - 1] !== "\\") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function readCommandArg(source: string, commandStart: number, command: string) {
  const openIndex = commandStart + command.length;
  if (source[openIndex] !== "{") return null;
  const closeIndex = findClosingBrace(source, openIndex);
  if (closeIndex < 0) return null;
  return { value: source.slice(openIndex + 1, closeIndex), end: closeIndex + 1 };
}

function renderMath(source: string, displayMode: boolean) {
  try {
    return katex.renderToString(source.trim(), {
      displayMode,
      throwOnError: false,
      strict: "warn",
      trust: false,
      output: "htmlAndMathml",
    });
  } catch {
    return '<code class="latex-course-error">' + escapeHtml(source) + "</code>";
  }
}

export function renderLatexInline(source: string): string {
  let html = "";
  let index = 0;

  while (index < source.length) {
    if (source.startsWith("\\(", index)) {
      const end = source.indexOf("\\)", index + 2);
      if (end >= 0) {
        html += renderMath(source.slice(index + 2, end), false);
        index = end + 2;
        continue;
      }
    }

    if (source[index] === "$" && source[index - 1] !== "\\") {
      const end = source.indexOf("$", index + 1);
      if (end >= 0) {
        html += renderMath(source.slice(index + 1, end), false);
        index = end + 1;
        continue;
      }
    }

    const commands: Array<[string, string]> = [
      ["\\textbf", "strong"],
      ["\\emph", "em"],
      ["\\textit", "em"],
      ["\\texttt", "code"],
    ];

    let handled = false;
    for (const [command, tag] of commands) {
      if (!source.startsWith(command, index)) continue;
      const arg = readCommandArg(source, index, command);
      if (!arg) continue;
      html += "<" + tag + ">" + renderLatexInline(arg.value) + "</" + tag + ">";
      index = arg.end;
      handled = true;
      break;
    }
    if (handled) continue;

    if (source.startsWith("\\LaTeX", index)) {
      html += "LaTeX";
      index += "\\LaTeX".length;
      continue;
    }

    const escapedTextCommands: Record<string, string> = {
      "\\%": "%",
      "\\&": "&",
      "\\_": "_",
      "\\#": "#",
      "\\{": "{",
      "\\}": "}",
      "\\textasciitilde{}": "~",
    };

    let escapedHandled = false;
    for (const [command, value] of Object.entries(escapedTextCommands)) {
      if (!source.startsWith(command, index)) continue;
      html += escapeHtml(value);
      index += command.length;
      escapedHandled = true;
      break;
    }
    if (escapedHandled) continue;

    if (source.startsWith("\\\\", index)) {
      html += "<br />";
      index += 2;
      continue;
    }

    html += escapeHtml(source[index]);
    index += 1;
  }

  return html;
}

function stripComments(source: string) {
  return source
    .split(/\r?\n/)
    .map((line) => {
      let escaped = false;
      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === "\\" && !escaped) {
          escaped = true;
          continue;
        }
        if (char === "%" && !escaped) return line.slice(0, index);
        escaped = false;
      }
      return line;
    })
    .join("\n");
}

function stripDocumentWrapper(source: string) {
  return source
    .replace(/\\documentclass(?:\[[^\]]*\])?\{[^}]+\}/g, "")
    .replace(/\\usepackage(?:\[[^\]]*\])?\{[^}]+\}/g, "")
    .replace(/\\title\{[^}]*\}/g, "")
    .replace(/\\author\{[^}]*\}/g, "")
    .replace(/\\date\{[^}]*\}/g, "")
    .replace(/\\maketitle/g, "")
    .replace(/\\begin\{document\}/g, "")
    .replace(/\\end\{document\}/g, "");
}

function readBracedArguments(line: string, command: string, count: number) {
  if (!line.startsWith(command)) return null;
  const values: string[] = [];
  let index = command.length;
  while (values.length < count) {
    while (/\s/.test(line[index] ?? "")) index += 1;
    if (line[index] !== "{") return null;
    const end = findClosingBrace(line, index);
    if (end < 0) return null;
    values.push(line.slice(index + 1, end));
    index = end + 1;
  }
  return { values, rest: line.slice(index).trim() };
}

function renderFigure(line: string) {
  const parsed = readBracedArguments(line.trim(), "\\coursefigure", 3);
  if (!parsed) return null;
  const src = parsed.values[0];
  const alt = parsed.values[1];
  const caption = parsed.values[2];
  const safeSrc = src.startsWith("/") ? src : "/" + src;
  return [
    '<figure class="latex-course-figure">',
    '<img src="' + escapeHtml(safeSrc) + '" alt="' + escapeHtml(alt) + '" loading="lazy" decoding="async" />',
    caption ? "<figcaption>" + renderLatexInline(caption) + "</figcaption>" : "",
    "</figure>",
  ].join("");
}

function renderSectionCommand(line: string) {
  const specs: Array<[RegExp, number, string]> = [
    [/^\\section\*?\{(.+)\}\s*$/, 2, "section"],
    [/^\\subsection\*?\{(.+)\}\s*$/, 3, "subsection"],
    [/^\\subsubsection\*?\{(.+)\}\s*$/, 4, "subsubsection"],
  ];

  for (const [pattern, rank, kind] of specs) {
    const match = line.match(pattern);
    if (!match) continue;
    const title = renderLatexInline(match[1]);
    const normalized = match[1]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return "<h" + rank + ' id="' + escapeHtml(normalized) + '" class="latex-course-heading ' + kind + '">' + title + "</h" + rank + ">";
  }
  return null;
}

function renderTabular(lines: string[]) {
  const body = lines.join("\n").replace(/\\hline/g, "").replace(/\\toprule|\\midrule|\\bottomrule/g, "").trim();
  const rows = body
    .split(/\\\\/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => row.split("&").map((cell) => cell.trim()));

  if (!rows.length) return "";
  return '<div class="latex-course-table-wrap"><table class="latex-course-table"><tbody>' +
    rows.map((cells) => "<tr>" + cells.map((cell) => "<td>" + renderLatexInline(cell) + "</td>").join("") + "</tr>").join("") +
    "</tbody></table></div>";
}

function normalizeEnvironmentName(value: string): BoxKind | null {
  return Object.prototype.hasOwnProperty.call(BOX_LABELS, value) ? value as BoxKind : null;
}

export function renderLatexCourse(source: string): string {
  const cleaned = stripDocumentWrapper(stripComments(source)).replace(/\r\n/g, "\n");
  const lines = cleaned.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let boxKind: BoxKind | null = null;
  let tabularLines: string[] | null = null;
  let displayMath: string[] | null = null;
  let displayMathEnd: string | null = null;
  let verbatimLines: string[] | null = null;
  let verbatimEnd: string | null = null;

  const flushParagraph = () => {
    const value = paragraph.join(" ").replace(/\s+/g, " ").trim();
    if (value) html.push("<p>" + renderLatexInline(value) + "</p>");
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push("</" + listType + ">");
    listType = null;
  };

  for (let rawIndex = 0; rawIndex < lines.length; rawIndex += 1) {
    const rawLine = lines[rawIndex];
    const line = rawLine.trim();

    if (verbatimLines) {
      if (line === verbatimEnd) {
        html.push('<pre class="latex-course-code"><code>' + escapeHtml(verbatimLines.join("\n")) + "</code></pre>");
        verbatimLines = null;
        verbatimEnd = null;
      } else {
        verbatimLines.push(rawLine);
      }
      continue;
    }

    if (displayMath) {
      if (line === displayMathEnd) {
        html.push('<div class="latex-course-display">' + renderMath(displayMath.join("\n"), true) + "</div>");
        displayMath = null;
        displayMathEnd = null;
      } else {
        displayMath.push(rawLine);
      }
      continue;
    }

    if (tabularLines) {
      if (/^\\end\{tabular\}/.test(line)) {
        html.push(renderTabular(tabularLines));
        tabularLines = null;
      } else {
        tabularLines.push(rawLine);
      }
      continue;
    }

    if (/^\\begin\{(verbatim|lstlisting)\}/.test(line)) {
      flushParagraph();
      closeList();
      const env = line.includes("lstlisting") ? "lstlisting" : "verbatim";
      verbatimLines = [];
      verbatimEnd = "\\end{" + env + "}";
      continue;
    }

    if (line === "\\[" || line === "$" || /^\\begin\{equation\*?\}/.test(line)) {
      flushParagraph();
      closeList();
      displayMath = [];
      displayMathEnd = line === "\\[" ? "\\]" : line === "$$" ? "$$" : line.includes("equation*") ? "\\end{equation*}" : "\\end{equation}";
      continue;
    }

    if (/^\\begin\{tabular\}/.test(line)) {
      flushParagraph();
      closeList();
      tabularLines = [];
      continue;
    }

    const beginList = line.match(/^\\begin\{(itemize|enumerate)\}/);
    if (beginList) {
      flushParagraph();
      closeList();
      listType = beginList[1] === "enumerate" ? "ol" : "ul";
      html.push("<" + listType + ' class="latex-course-list">');
      continue;
    }

    if (/^\\end\{(itemize|enumerate)\}/.test(line)) {
      flushParagraph();
      closeList();
      continue;
    }

    if (listType && line.startsWith("\\item")) {
      flushParagraph();
      html.push("<li>" + renderLatexInline(line.replace(/^\\item\s*/, "")) + "</li>");
      continue;
    }

    const beginBox = line.match(/^\\begin\{([a-zA-Z]+)\}/);
    if (beginBox) {
      const kind = normalizeEnvironmentName(beginBox[1]);
      if (kind) {
        flushParagraph();
        closeList();
        boxKind = kind;
        html.push('<aside class="latex-course-box ' + kind + '"><p class="latex-course-box-title">' + BOX_LABELS[kind] + "</p>");
        continue;
      }
    }

    if (boxKind && line === "\\end{" + boxKind + "}") {
      flushParagraph();
      closeList();
      html.push("</aside>");
      boxKind = null;
      continue;
    }

    const figure = renderFigure(line);
    if (figure) {
      flushParagraph();
      closeList();
      html.push(figure);
      continue;
    }

    const heading = renderSectionCommand(line);
    if (heading) {
      flushParagraph();
      closeList();
      html.push(heading);
      continue;
    }

    if (!line) {
      flushParagraph();
      continue;
    }

    if (/^\\(documentclass|usepackage|newcommand|renewcommand|input|include)\b/.test(line)) continue;

    paragraph.push(line);
  }

  flushParagraph();
  closeList();
  if (boxKind) html.push("</aside>");
  return html.join("\n");
}
