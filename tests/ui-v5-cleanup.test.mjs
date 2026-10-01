import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import postcss from "postcss";

const read = (p) => readFileSync(p, "utf8");
const entry = read("src/ui-v5/index.css");
const layout = read("src/layouts/BaseLayout.astro");

test("V5 owns the global cascade without the retired structural stylesheets", () => {
  assert.match(layout, /import "\.\.\/ui-v5\/index\.css"/);
  assert.doesNotMatch(layout, /import "\.\.\/styles\//);
  function inspectImports(dir) {
    for (const node of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, node.name);
      if (node.isDirectory()) inspectImports(file);
      else if (/\.(astro|tsx?)$/.test(file)) assert.doesNotMatch(read(file), /import\s+["'][^"']*\/styles\/[^"']*\.css["']/, file);
    }
  }
  inspectImports("src");
  assert.doesNotMatch(read("src/components/pedagogie/CourseReader.astro"), /<style/);
  for (const name of ["design-system", "learning-workspace", "home-coherence", "reference-v3", "landing-v3", "components", "course-content", "utilities"]) {
    assert.equal(existsSync(`src/styles/${name}.css`), false, `${name} must not remain a second source of truth`);
  }
});

test("migrated React players and scientific tools keep only dynamic CSS custom properties inline", () => {
  const directories = ["pedagogie", "accessibility", "ui", "search"];
  const files = directories.flatMap((dir) => readdirSync(`src/components/${dir}`).filter((name) => name.endsWith(".tsx") && name !== "MathText.tsx").map((name) => `src/components/${dir}/${name}`));
  for (const file of files) {
    const name = path.basename(file);
    const source = read(file);
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isJsxAttribute(node) && node.name.getText(ast) === "style") {
        let value = node.initializer?.expression;
        while (value && (ts.isAsExpression(value) || ts.isParenthesizedExpression(value))) value = value.expression;
        assert.ok(value && ts.isObjectLiteralExpression(value), `${name}: style must expose dynamic values explicitly`);
        for (const prop of value.properties) {
          assert.ok(ts.isPropertyAssignment(prop), `${name}: no opaque style spread`);
          assert.match(prop.name.getText(ast), /^"--ui5-(?:value|guide)-[a-z-]+"$/, name);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.doesNotMatch(source, /<style>/, name);
  }
});

test("V5 stylesheets parse and route modules only consume the shared tokens", () => {
  function inspect(dir) {
    for (const node of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, node.name);
      if (node.isDirectory()) inspect(file);
      else if (file.endsWith(".css")) assert.doesNotThrow(() => postcss.parse(read(file), { from: file }));
    }
  }
  inspect("src/ui-v5");
  const utilities = read("src/ui-v5/react-utilities.css");
  postcss.parse(utilities).walkDecls("box-shadow", (decl) => assert.equal(decl.value, "none"));
  assert.match(entry, /a11y-theme-dark/);
  assert.match(entry, /--ui5-reading: var\(--max-line-width\)/);
  assert.match(entry, /prefers-reduced-motion/);
});
