import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { siteConfig } from '../../src/config/site.ts';

const vercelConfig = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const baseLayout = readFileSync(new URL('../../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');

function headersMap() {
  assert.ok(Array.isArray(vercelConfig.headers));
  const globalHeaders = vercelConfig.headers.find((entry) => entry.source === '/(.*)');
  assert.ok(globalHeaders, 'global Vercel headers are required');
  return new Map(globalHeaders.headers.map((header) => [header.key.toLowerCase(), header.value]));
}

function cspDirectives(policy) {
  return new Map(policy.split(';').map((directive) => {
    const parts = directive.trim().split(/\s+/);
    return [parts[0], parts.slice(1)];
  }));
}

test('final security headers are declared for the Vercel deployment', () => {
  const headers = headersMap();

  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('x-permitted-cross-domain-policies'), 'none');
  assert.match(headers.get('strict-transport-security') ?? '', /^max-age=31536000\b/);
  assert.match(headers.get('permissions-policy') ?? '', /camera=\(\)/);
  assert.match(headers.get('permissions-policy') ?? '', /microphone=\(\)/);
  assert.match(headers.get('permissions-policy') ?? '', /geolocation=\(\)/);
});

test('final CSP keeps Astro and KaTeX working without unsafe evaluation', () => {
  const csp = headersMap().get('content-security-policy');
  assert.ok(csp, 'CSP header is required');
  const directives = cspDirectives(csp);

  assert.deepEqual(directives.get('default-src'), ["'self'"]);
  assert.deepEqual(directives.get('object-src'), ["'none'"]);
  assert.deepEqual(directives.get('base-uri'), ["'self'"]);
  assert.deepEqual(directives.get('frame-ancestors'), ["'none'"]);
  assert.deepEqual(directives.get('form-action'), ["'self'"]);
  assert.ok(directives.has('upgrade-insecure-requests'));
  assert.ok(directives.get('script-src')?.includes("'self'"));
  assert.ok(directives.get('script-src')?.includes("'unsafe-inline'"));
  assert.ok(directives.get('script-src')?.includes('https://www.googletagmanager.com'));
  assert.ok(directives.get('style-src')?.includes("'self'"));
  assert.ok(directives.get('style-src')?.includes("'unsafe-inline'"));
  assert.ok(directives.get('font-src')?.includes("'self'"));
  assert.ok(directives.get('font-src')?.includes('data:'));
  assert.ok(directives.get('img-src')?.includes('data:'));
  assert.ok(directives.get('connect-src')?.includes('https://www.google-analytics.com'));
  assert.ok(directives.get('connect-src')?.includes('https://region1.google-analytics.com'));
  assert.doesNotMatch(csp, /unsafe-eval|wasm-unsafe-eval/i);
});

test('analytics remains consent gated under the CSP allowlist', () => {
  assert.equal(siteConfig.analytics.consentStorageKey, 'site.analyticsConsent');
  assert.match(siteConfig.analytics.googleMeasurementId, /^G-/);
  assert.doesNotMatch(baseLayout, /<script[^>]+src=["']https:\/\/www\.googletagmanager\.com/i);
  assert.match(baseLayout, /document\.createElement\("script"\)/);
  assert.match(baseLayout, /data-analytics-consent="granted"/);
  assert.match(baseLayout, /data-analytics-consent="denied"/);
});
