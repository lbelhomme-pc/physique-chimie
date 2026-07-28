import test from 'node:test';
import assert from 'node:assert/strict';

import {
  asPlainText,
  renderMathTextToTrustedHtml,
  sanitizeTrustedHtml,
  sanitizeTrustedSvg,
} from '../../src/utils/trustedContent.ts';
import { evaluateScientificExpression } from '../../src/utils/scientificExpression.ts';

function assertInactive(html) {
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<img[^>]+onerror/i);
  assert.doesNotMatch(html, /<[^>]+\son(?:load|click|error|mouseover)\s*=/i);
  assert.doesNotMatch(html, /javascript\s*:/i);
}

test('les scripts et gestionnaires HTML sont retires', () => {
  const html = String(sanitizeTrustedHtml('<p>ok</p><script>alert(1)</script><img src="/x.png" onerror="alert(1)"><a href="javascript:alert(1)" onclick="x()">lien</a>'));
  assertInactive(html);
  assert.match(html, /<p>ok<\/p>/);
  assert.match(html, /<img src="\/x\.png">/);
  assert.match(html, /<a>lien<\/a>/);
});

test('les attributs SVG actifs et fermetures prematurees sont neutralises', () => {
  const svg = String(sanitizeTrustedSvg('<svg viewBox="0 0 10 10" onload="alert(1)"><text>ok</text></svg><script>alert(1)</script><svg><text onclick="x()">fin</text></svg>'));
  assertInactive(svg);
  assert.match(svg, /<svg viewBox="0 0 10 10"><text>ok<\/text><\/svg>/);
  assert.match(svg, /<svg><text>fin<\/text><\/svg>/);
});

test('les URL javascript et les styles dangereux sont retires', () => {
  const html = String(sanitizeTrustedHtml('<a href="javascript:alert(1)">x</a><p style="background:url(javascript:alert(1)); color: red">y</p>'));
  assertInactive(html);
  assert.match(html, /<a>x<\/a>/);
  assert.match(html, /<p style="color: red">y<\/p>/);
});

test('les URL protocol-relative et SVG data sont bloquees', () => {
  const html = String(sanitizeTrustedHtml([
    '<a href="//evil.example/path">externe</a>',
    '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
    '<img src="data:image/png;base64,aGVsbG8=" alt="schema">',
    '<a href="/cours" target="_blank">cours</a>',
  ].join('')));

  assert.doesNotMatch(html, /\/\/evil\.example/);
  assert.doesNotMatch(html, /data:image\/svg\+xml/i);
  assert.match(html, /<a>externe<\/a>/);
  assert.match(html, /<img src="data:image\/png;base64,aGVsbG8=" alt="schema">/);
  assert.match(html, /<a href="\/cours" target="_blank" rel="noopener noreferrer">cours<\/a>/);
});

test('les contournements CSS par echappement et commentaires sont retires', () => {
  const html = String(sanitizeTrustedHtml([
    '<p style="background:\\75rl(javascript:alert(1)); color: #123456">a</p>',
    '<p style="color: red; background: /*x*/ blue; --accent: var(--accent-primary)">b</p>',
  ].join('')));

  assertInactive(html);
  assert.doesNotMatch(html, /\\75rl/i);
  assert.doesNotMatch(html, /\/\*/);
  assert.match(html, /<p style="color: #123456">a<\/p>/);
  assert.match(html, /<p style="color: red; --accent: var\(--accent-primary\)">b<\/p>/);
});

test('les attributs pedagogiques SVG et accessibilite restent conserves', () => {
  const svg = String(sanitizeTrustedSvg('<svg viewBox="0 0 20 20" role="img" aria-labelledby="t d"><title id="t">Circuit</title><desc id="d">Schema simple</desc><line x1="1" y1="2" x2="10" y2="12" stroke="currentColor" stroke-width="2" /></svg>'));

  assert.match(svg, /<svg viewBox="0 0 20 20" role="img" aria-labelledby="t d">/);
  assert.match(svg, /<title id="t">Circuit<\/title>/);
  assert.match(svg, /<desc id="d">Schema simple<\/desc>/);
  assert.match(svg, /<line x1="1" y1="2" x2="10" y2="12" stroke="currentColor" stroke-width="2">/);
});

test('les formes SVG autofermantes ne masquent pas les elements suivants', () => {
  const svg = String(sanitizeTrustedSvg('<svg viewBox="0 0 40 20"><rect x="1" y="1" width="10" height="10" /><text x="15" y="10">Visible</text><circle cx="30" cy="10" r="4" /></svg>'));

  assert.match(svg, /<rect x="1" y="1" width="10" height="10"><\/rect>/);
  assert.match(svg, /<text x="15" y="10">Visible<\/text>/);
  assert.match(svg, /<circle cx="30" cy="10" r="4"><\/circle>/);
});

test('le texte mathematique echappe le HTML arbitraire et conserve KaTeX', () => {
  const html = String(renderMathTextToTrustedHtml(asPlainText('A <img src=x onerror=1> puis $E=mc^2$ & entites')));
  assertInactive(html);
  assert.match(html, /&lt;img src=x onerror=1&gt;/);
  assert.match(html, /katex/);
  assert.match(html, /&amp; entites/);
});

test('les expressions scientifiques autorisees sont calculees', () => {
  assert.equal(evaluateScientificExpression('sqrt(49)'), 7);
  assert.equal(evaluateScientificExpression('sin(30)'), 0.49999999999999994);
  assert.equal(evaluateScientificExpression('2,5*10^3'), 2500);
  assert.equal(evaluateScientificExpression('log(1000) + ln(e)'), 4);
});

test('les expressions dangereuses ou hors grammaire sont refusees', () => {
  assert.throws(() => evaluateScientificExpression('alert(1)'));
  assert.throws(() => evaluateScientificExpression('constructor.constructor("alert(1)")()'));
  assert.throws(() => evaluateScientificExpression('1;window.location=1'));
  assert.throws(() => evaluateScientificExpression('Math.sin(1)'));
});
