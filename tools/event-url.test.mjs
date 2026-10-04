import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const eventPath = '/events/scary-house-2026-10-31.html';
const redirect = fs.readFileSync(new URL('../assets/js/legacy-ticket-redirect.js', import.meta.url), 'utf8');

test('old ticket links keep language, order and map the payment anchor', () => {
  const location = {
    href: 'https://nashemesto.com/tickets.html?lang=ru&order=example#embedded-payment',
    search: '?lang=ru&order=example', hash: '#embedded-payment',
    replace(url) { this.destination = new URL(url); }
  };
  vm.runInNewContext(redirect, { location, URL });
  assert.equal(location.destination.pathname, eventPath);
  assert.equal(location.destination.search, location.search);
  assert.equal(location.destination.hash, '#tickets');
});

test('old links to other sections retain the section', () => {
  const location = { href: 'https://nashemesto.com/tickets.html#about-event', search: '', hash: '#about-event', replace(url) { this.destination = new URL(url); } };
  vm.runInNewContext(redirect, { location, URL });
  assert.equal(location.destination.hash, '#about-event');
});

test('public event has a working ticket anchor and local asset paths', () => {
  const page = fs.readFileSync(new URL('..' + eventPath, import.meta.url), 'utf8');
  assert.match(page, /id="tickets"/);
  assert.match(page, /data-checkout-mode="payment-link"/);
  const pageUrl = new URL('..' + eventPath, import.meta.url);
  for (const [, reference] of page.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
    const target = new URL(reference, pageUrl);
    // The private order result page is only exposed by the local ticket service.
    if (target.pathname.endsWith('/ticket-result.html')) continue;
    assert.ok(fs.existsSync(target), `Missing resource: ${reference}`);
  }
});
