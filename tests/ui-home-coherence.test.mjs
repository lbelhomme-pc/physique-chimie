import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=(relative)=>readFileSync(path.join(root,relative),"utf8");

describe("UI — cohérence avec la charte de la page d'accueil",()=>{
  it("charge la couche de cohérence globale après les styles pédagogiques",()=>{
    const layout=read("src/layouts/BaseLayout.astro");
    const learning=layout.indexOf('import "../styles/learning-workspace.css";');
    const coherence=layout.indexOf('import "../styles/home-coherence.css";');
    assert.ok(learning>=0);
    assert.ok(coherence>learning);
  });

  it("utilise les mêmes primitives visuelles que l'accueil",()=>{
    const css=read("src/styles/home-coherence.css");
    assert.match(css,/--ui-home-navy: #00184d/);
    assert.match(css,/--ui-home-blue: #0f5bff/);
    assert.match(css,/--ui-home-border: #d9e6fb/);
    assert.match(css,/--ui-home-soft: #f4f8ff/);
    assert.match(css,/--ui-home-radius: 8px/);
    assert.match(css,/--ui-home-radius-sm: 6px/);
  });

  it("supprime le style pill et les largeurs étroites des onglets pédagogiques",()=>{
    const tabs=read("src/components/pedagogie/ChapterTabs.astro");
    assert.match(tabs,/border-radius: var\\\(--v3-radius-md\\\)/);
    assert.match(tabs,/background: #0f5bff/);
    assert.doesNotMatch(tabs,/border-radius: 18px/);
    assert.doesNotMatch(tabs,/max-width: 900px/);
  });

  it("aligne les onglets génériques V3 sur la charte d'accueil",()=>{
    const tabs=read("src/components/design-system/V3Tabs.astro");
    assert.match(tabs,/border: 1px solid #d9e6fb/);
    assert.match(tabs,/border-radius: 8px/);
    assert.match(tabs,/background: #0f5bff/);
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
    const css=read("src/styles/laboratoire/global-lab.css");
    assert.match(page,/class="lab-search-icon"/);
    assert.doesNotMatch(page,/🔍/);
    assert.match(css,/border: 1px solid #d9e6fb/);
    assert.match(css,/border-color: #0f5bff/);
  });

  it("les espaces pédagogiques restent sur 1120px avec la géométrie de l'accueil",()=>{
    const css=read("src/styles/learning-workspace.css");
    assert.match(css,/--learning-max: 1120px/);
    assert.match(css,/--learning-radius-lg: 8px/);
    assert.match(css,/--learning-radius-md: 6px/);
    assert.doesNotMatch(css,/--learning-radius-lg: 20px/);
  });
});
