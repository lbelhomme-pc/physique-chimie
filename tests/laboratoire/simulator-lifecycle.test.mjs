import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

test("diffusion-temperature simulator exposes a cleanup path for Astro navigation", () => {
  const component = fs.readFileSync(path.join(root, "src/components/laboratoire/DiffusionTemperatureSimulator.astro"), "utf8");
  const simulator = fs.readFileSync(path.join(root, "src/scripts/laboratoire/diffusion-temperature-simulator.js"), "utf8");

  assert.match(component, /astro:page-load/);
  assert.match(component, /astro:before-swap/);
  assert.match(component, /roots\.get\(root\)\?\.\(\)/);

  assert.match(simulator, /return\s+\(\)\s*=>\s*\{/);
  assert.match(simulator, /cancelAnimationFrame\(frameId\)/);
  assert.match(simulator, /removeEventListener/);
  assert.doesNotMatch(simulator, /setInterval\s*\(/);

  if (/new\s+Worker\s*\(/.test(simulator)) {
    assert.match(simulator, /\.terminate\s*\(/);
  }
});
