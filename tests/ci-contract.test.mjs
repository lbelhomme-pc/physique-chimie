import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workflowUrl = new URL("../.github/workflows/ci.yml", import.meta.url);
const workflow = fs.readFileSync(workflowUrl, "utf8");
const packageUrl = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageUrl, "utf8"));

function jobBlock(jobName) {
  const marker = `  ${jobName}:\n`;
  const start = workflow.indexOf(marker);
  assert.notEqual(start, -1, `Job CI manquant: ${jobName}`);

  const bodyStart = start + marker.length;
  const rest = workflow.slice(bodyStart);
  const nextJob = rest.search(/^ {2}[a-zA-Z0-9_-]+:\n/m);
  return nextJob === -1 ? rest : rest.slice(0, nextJob);
}

test("la CI garde les trois checks requis avec des noms stables", () => {
  for (const jobName of ["quality", "dist-fast", "dist-a11y"]) {
    const block = jobBlock(jobName);
    assert.match(block, new RegExp(`^    name: ${jobName}$`, "m"));
  }
});

test("la CI s'exécute sur les PR vers main et reste en lecture seule", () => {
  assert.match(workflow, /pull_request:\n {4}branches: \["main"\]/);
  assert.match(workflow, /permissions:\n {2}contents: read/);
});

test("les contrôles dist dépendent de quality mais restent indépendants entre eux", () => {
  const fast = jobBlock("dist-fast");
  const a11y = jobBlock("dist-a11y");

  assert.match(fast, /^ {4}needs: quality$/m);
  assert.match(a11y, /^ {4}needs: quality$/m);
  assert.doesNotMatch(a11y, /needs: dist-fast/);
});

test("chaque check appelle le script npm autoritatif attendu", () => {
  assert.match(jobBlock("quality"), /run: npm run ci:quality/);
  assert.match(jobBlock("dist-fast"), /run: npm run ci:dist/);
  assert.match(jobBlock("dist-a11y"), /run: npm run ci:a11y/);
});

test("les exécutions obsolètes sont annulées pour éviter des statuts contradictoires", () => {
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /cancel-in-progress: true/);
});

test("quality bloque toute vulnérabilité npm high ou critical", () => {
  assert.equal(packageJson.scripts["audit:security"], "npm audit --audit-level=high");
  assert.match(packageJson.scripts["ci:quality"], /npm run audit:security/);
});
