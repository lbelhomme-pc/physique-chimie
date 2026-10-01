import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");

const base = read("src/layouts/BaseLayout.astro");
const css = read("src/ui-v5/index.css");
const college = read("src/pages/college/index.astro");
const level = read("src/pages/college/[niveau]/index.astro");
const chapter = read("src/components/pedagogie/ChapterPageShell.astro");

describe("UI V5 unified rebuild", () => {
  it("loads one isolated V5 namespace from the global layout", () => {
    assert.match(base, /ui-v5\/index\.css/);
    assert.match(css, /\.ui5-page\s*\{/);
    assert.doesNotMatch(css, /!important/);
  });

  it("uses a stable geometry hierarchy", () => {
    assert.match(css, /--ui5-app:\s*1280px/);
    assert.match(css, /--ui5-content:\s*1120px/);
    assert.match(css, /--ui5-reading:\s*70ch/);
    assert.match(css, /\.ui5-chapter-list\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
  });

  it("rebuilds the college selector without V3 hero/card overrides", () => {
    assert.match(college, /class="ui5-page"/);
    assert.match(college, /ui5-level-card/);
    assert.doesNotMatch(college, /V3LandingHero/);
    assert.doesNotMatch(college, /<style>/);
  });

  it("removes the nested catalogue grids that crushed chapter cards", () => {
    assert.match(level, /ui5-chapter-list/);
    assert.match(level, /data-ui5-search/);
    assert.doesNotMatch(level, /CatalogueChapterList/);
    assert.doesNotMatch(level, /catalogue-layout/);
    assert.doesNotMatch(level, /grid-template-columns:\s*repeat\(3/);
  });

  it("uses the same V5 shell for chapter header, intro, course and pagination", () => {
    assert.match(chapter, /ui5-chapter-page/);
    assert.match(chapter, /ui5-page-header ui5-chapter-header/);
    assert.match(chapter, /ui5-chapter-before/);
    assert.match(chapter, /ui5-course-content/);
    assert.match(chapter, /ui5-chapter-pagination/);
    assert.doesNotMatch(chapter, /import Breadcrumb/);
    assert.doesNotMatch(chapter, /chapter-hero-v3/);
  });
});
