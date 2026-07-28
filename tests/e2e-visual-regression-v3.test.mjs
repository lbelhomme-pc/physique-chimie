import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('./fixtures/e2e-visual.config.json', import.meta.url), 'utf8'));
const mobileDysConfig = JSON.parse(readFileSync(new URL('./fixtures/mobile-dys-validation.config.json', import.meta.url), 'utf8'));
const script = readFileSync(new URL('../scripts/e2e-visual-regression.mjs', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('E2E visual suite covers critical V3 and legacy journeys', () => {
  const labels = config.journeys.map((journey) => journey.label);
  for (const expected of [
    'accueil-public',
    'catalogue-college',
    'chapitre-cours-quiz-flashcards',
    'mega-quiz',
    'mega-flashcards',
    'laboratoire-circuit-rc',
    'kit-scientifique',
    'legacy-mega-quiz',
  ]) {
    assert.ok(labels.includes(expected), `missing journey ${expected}`);
  }

  assert.ok(config.journeys.some((journey) => journey.kind === 'legacy'));
  assert.ok(config.journeys.some((journey) => journey.captures?.some((capture) => capture.viewport === 'mobile')));
  assert.ok(config.journeys.some((journey) => journey.captures?.some((capture) => capture.profile === 'dyslexia')));
});

test('E2E visual suite checks selectors, text, keyboard path and captures', () => {
  for (const journey of config.journeys) {
    assert.ok(journey.route.startsWith('/'));
    assert.ok(Array.isArray(journey.requiredSelectors) && journey.requiredSelectors.length > 0);
    assert.ok(Array.isArray(journey.requiredText) && journey.requiredText.length > 0);
    assert.ok(Array.isArray(journey.captures) && journey.captures.length > 0);
  }

  const keyboardJourneys = config.journeys.filter((journey) => journey.keyboard);
  assert.ok(keyboardJourneys.length >= 2);
  for (const journey of keyboardJourneys) {
    assert.ok(journey.keyboard.focusableMin >= 4);
    assert.ok(journey.keyboard.requiredSelectors.length >= 1);
  }
});

test('E2E visual runner is dependency-light and deterministic', () => {
  assert.match(packageJson.scripts['e2e:visual'], /e2e-visual-regression\.mjs --capture/);
  assert.match(packageJson.scripts['e2e:visual:check'], /e2e-visual-regression\.mjs$/);
  assert.match(packageJson.scripts['mobile:dys:visual'], /mobile-dys-validation\.config\.json --capture/);
  assert.match(packageJson.scripts['mobile:dys:check'], /mobile-dys-validation\.config\.json$/);
  assert.match(script, /createServer/);
  assert.match(script, /--headless=new/);
  assert.match(script, /--config/);
  assert.match(script, /Emulation\.setDeviceMetricsOverride/);
  assert.match(script, /a11y_preferences/);
  assert.match(script, /reduced-motion/);
  assert.match(script, /manifest\.json/);
  assert.doesNotMatch(script, /playwright|puppeteer/);
});

test('mobile and DYS validation covers 360px, tablet, desktop and reduced motion', () => {
  assert.equal(mobileDysConfig.requirements.mobile360, true);
  assert.equal(mobileDysConfig.requirements.tablet, true);
  assert.equal(mobileDysConfig.requirements.reducedMotion, true);

  const captures = mobileDysConfig.journeys.flatMap((journey) => journey.captures ?? []);
  assert.ok(captures.some((capture) => capture.width === 360), 'missing mobile 360 capture');
  assert.ok(captures.some((capture) => capture.viewport === 'tablet'), 'missing tablet capture');
  assert.ok(captures.some((capture) => capture.viewport === 'desktop'), 'missing desktop capture');
  assert.ok(captures.some((capture) => capture.profile === 'dyslexia'), 'missing dyslexia capture');
  assert.ok(captures.some((capture) => capture.profile === 'reduced-motion'), 'missing reduced-motion capture');

  for (const expected of [
    'accueil-mobile-dys',
    'chapitre-mobile-dys',
    'laboratoire-mobile-dys',
    'kit-scientifique-mobile-dys',
    'legacy-mega-quiz-mobile',
  ]) {
    assert.ok(mobileDysConfig.journeys.some((journey) => journey.label === expected), `missing journey ${expected}`);
  }
});
