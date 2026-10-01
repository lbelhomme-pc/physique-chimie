import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(relative)=>readFileSync(path.join(root,relative),"utf8");

describe("UI — cohérence avec la charte de la page d'accueil",()=>{
  it("charge un seul système global pour toutes les pages",()=>{
    const layout=read("src/layouts/BaseLayout.astro");
    assert.match(layout,/ui-v5\/index\.css/);
    assert.doesNotMatch(layout,/styles\/(?:design-system|learning-workspace|home-coherence)\.css/);
  });
  it("utilise les mêmes primitives visuelles que l'accueil",()=>{
    const css=read("src/ui-v5/index.css");
    for (const token of ["--ui5-canvas", "--ui5-action", "--ui5-border", "--ui5-surface-soft", "--ui5-radius-sm"]) assert.ok(css.includes(token));
  });
  it("centralise les onglets pédagogiques sans largeur locale",()=>{
    const tabs=read("src/components/pedagogie/ChapterTabs.astro");
    const css=read("src/ui-v5/index.css");
    assert.match(tabs,/ui5-tabs/);
    assert.doesNotMatch(tabs,/<style/);
    assert.match(css,/\.ui5-tab-panel/);
    assert.match(css,/--ui5-content: 1120px/);
  });

  it("aligne les onglets génériques V3 sur la charte d'accueil",()=>{
    const tabs=read("src/components/design-system/V3Tabs.astro");
    assert.match(tabs,/border: 1px solid var\(--v3-color-border-default\)/);
    assert.match(tabs,/border-radius: var\(--v3-radius-md\)/);
    assert.match(tabs,/background: var\(--v3-color-action\)/);
  });

  it("la recherche historique n'utilise plus de styles inline ni d'emoji",()=>{
    const search=read("src/components/ui/SearchBar.tsx");
    assert.match(search,/className="legacy-search"/);
    assert.match(search,/legacy-search__field/);
    assert.match(search,/className="legacy-search__icon"/);
    assert.doesNotMatch(search,/🔍/);
    assert.doesNotMatch(search,/maxWidth:\s*700/);
    assert.doesNotMatch(search,/radius-pill/);
  });

  it("la recherche du laboratoire reprend la même icône et les mêmes contrôles",()=>{
    const page=read("src/pages/laboratoire.astro");
    const css=read("src/ui-v5/index.css");
    assert.match(page,/class="ui5-search"/);
    assert.doesNotMatch(page,/🔍/);
    assert.match(css,/border: 1px solid var\(--ui5-border\)/);
    assert.match(css,/\.ui5-search/);
  });

  it("les espaces pédagogiques restent sur 1120px avec la géométrie de l'accueil",()=>{
    const css=read("src/ui-v5/learning.css");
    assert.match(css,/--learning-max: var\(--ui5-content\)/);
    assert.match(css,/--learning-radius: var\(--ui5-radius-sm\)/);
    assert.match(css,/min-height: 44px/);
    assert.doesNotMatch(css,/--learning-radius-lg: 20px/);
    assert.match(css,/grid-template-columns: 230px minmax\(0, 1fr\)/);
    assert.match(css,/grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  });
});
