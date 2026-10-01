import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");

const ui = read("src/ui-v5/index.css");
const base = read("src/layouts/BaseLayout.astro");
const college = read("src/pages/college/index.astro");
const collegeLevel = read("src/pages/college/[niveau]/index.astro");
const catalogue = read("src/components/catalogue/CatalogueChapterList.astro");
const chapter = read("src/components/pedagogie/ChapterPageShell.astro");
const tabs = read("src/components/pedagogie/ChapterTabs.astro");
const leane = read("src/components/leane/LeaneShell.astro");
const methodsCollege = read("src/pages/outils-methodes/methodes-maths-college.astro");
const methodsLycee = read("src/pages/outils-methodes/methodes-maths-lycee.astro");

describe("UI V5 single-system contract", () => {
  it("loads the V5 design system globally", () => {
    assert.match(base, /ui-v5\/index\.css/);
    assert.match(ui, /--ui5-app:\s*1280px/);
    assert.match(ui, /--ui5-content:\s*1120px/);
    assert.match(ui, /--ui5-reading:\s*70ch/);
  });

  it("uses the same V5 shell for level and chapter catalogue pages", () => {
    assert.match(college, /class="ui5-page"/);
    assert.match(college, /ui5-grid ui5-grid--2/);
    assert.match(collegeLevel, /class="ui5-page"/);
    assert.match(catalogue, /ui5-chapter-list/);
    assert.doesNotMatch(collegeLevel, /catalogue-layout/);
  });

  it("keeps chapter header tabs reader and pagination in the unified shell", () => {
    assert.match(chapter, /ui5-chapter-page/);
    assert.match(chapter, /ui5-page-header ui5-chapter-header/);
    assert.match(chapter, /ui5-course-content/);
    assert.match(chapter, /ui5-chapter-pagination/);
    assert.match(tabs, /ui5-tabs/);
    assert.match(tabs, /ui5-tab-panel/);
    assert.doesNotMatch(tabs, /<style>/);
  });

  it("does not let Leane become a separate visual application", () => {
    assert.match(leane, /ui5-page ui5-leane-page/);
    assert.match(leane, /ui5-breadcrumb/);
    assert.match(leane, /ui5-filter-row ui5-leane-nav/);
    assert.doesNotMatch(leane, /leane-sidebar/);
    assert.doesNotMatch(leane, /body:has\(\.leane-app\).*public-nav/s);
    assert.doesNotMatch(leane, /<style/);
  });

  it("migrates maths-method list pages away from local design systems", () => {
    for (const source of [methodsCollege, methodsLycee]) {
      assert.match(source, /ui5-page ui5-methods-home/);
      assert.match(source, /ui5-breadcrumb/);
      assert.doesNotMatch(source, /<style>/);
    }
  });

  it("centralizes tabs course reader Leane and methods styles in V5", () => {
    for (const marker of [
      "Unified chapter tabs V5",
      "Unified course reader V5",
      "Leane V5 compatibility",
      "Maths methods V5",
    ]) {
      assert.match(ui, new RegExp(marker));
    }
  });
});
