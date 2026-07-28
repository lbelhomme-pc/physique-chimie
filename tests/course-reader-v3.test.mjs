import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderMathTextToTrustedHtml } from "../src/utils/trustedContent.ts";

const root = process.cwd();
const files = {
  reader: path.join(root, "src/components/pedagogie/CourseReader.astro"),
  shell: path.join(root, "src/components/pedagogie/ChapterPageShell.astro"),
  tabs: path.join(root, "src/components/pedagogie/ChapterTabs.astro"),
  styles: path.join(root, "src/styles/design-system.css"),
  collegeMatter: path.join(root, "src/data/chapters/college/5eme/chimie/proprietes-matiere/cours.mdx"),
  lyceeLight: path.join(root, "src/data/chapters/lycee/2nde/physique/lumiere-vision-image/cours.mdx"),
  mathFunctions: path.join(root, "src/data/mathematiques/chapters/lycee/2nde/fonctions-generalites/cours.mdx"),
};

function source(name) {
  return readFileSync(files[name], "utf8");
}

describe("course reader V3", () => {
  it("wraps the course slot without removing existing chapter players", () => {
    const shell = source("shell");

    assert.match(shell, /import CourseReader from "\.\/CourseReader\.astro";/);
    assert.match(shell, /<CourseReader chapterId=\{chapterId\}/);
    assert.match(shell, /<CoursTracker client:load chapterId=\{chapterId\}/);
    assert.match(shell, /<CoursContent \/>/);
    assert.match(shell, /<\/CourseReader>/);
    assert.match(shell, /<ExercicesPlayer client:load/);
    assert.match(shell, /<QuizPlayer client:load/);
    assert.match(shell, /<FlashcardsPlayer client:load/);
  });

  it("keeps MathML available to assistive technologies", () => {
    const reader = source("reader");
    const styles = source("styles");
    const rendered = renderMathTextToTrustedHtml("La relation est $U = R \\times I$.");

    assert.match(reader, /data-course-reader-v3/);
    assert.match(rendered, /class="katex-mathml"/);
    assert.doesNotMatch(reader, /\.course-reader-v3 \.katex \.katex-mathml\s*\{[^}]*display:\s*none/is);
    assert.doesNotMatch(styles, /\.cours-content \.katex \.katex-mathml\s*\{[^}]*display:\s*none/is);
    assert.match(reader, /clip-path:\s*inset\(50%\)/);
    assert.match(styles, /clip-path:\s*inset\(50%\)/);
  });

  it("classifies the expected pedagogical headings", () => {
    const tabs = source("tabs");
    const reader = source("reader");
    const styles = source("styles");

    for (const label of [
      "course-definition-heading",
      "course-method-heading",
      "course-example-heading",
      "course-warning-heading",
      "course-law-heading",
      "course-synthesis-heading",
      "course-vocabulary-heading",
    ]) {
      assert.match(tabs, new RegExp(label));
      assert.match(reader + styles, new RegExp(label));
    }

    for (const cue of ["propriete", "loi de ", "formules importantes", "points cles", "vocabulaire"]) {
      assert.match(tabs, new RegExp(cue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("has real examples for formulas, tables and SVG without changing MDX content", () => {
    const collegeMatter = source("collegeMatter");
    const lyceeLight = source("lyceeLight");
    const mathFunctions = source("mathFunctions");

    assert.match(collegeMatter, /<svg[\s>]/);
    assert.match(collegeMatter, /definition-box/);
    assert.match(lyceeLight, /\$\$/);
    assert.match(lyceeLight, /<figure class="schema-block">/);
    assert.match(lyceeLight, /<svg[\s>]/);
    assert.match(mathFunctions, /<svg[\s>]/);
  });
});
