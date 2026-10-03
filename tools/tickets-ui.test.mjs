import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/js/tickets.js', import.meta.url), 'utf8');
const orderId = '07548775-b0aa-4c3d-9263-45647a6a70c0';
function preview(search = '?lang=ru', checkoutMode = 'auto') {
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      hidden: true, textContent: '', classList: { toggle() {} },
      listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; }, setAttribute() {}, removeAttribute() {},
      focus() { this.focused = true; }, scrollIntoView() { this.scrolled = true; }
    });
    return elements.get(selector);
  };
  const languages = ['en', 'ru'].map(language => {
    const button = element(`[data-language="${language}"]`);
    button.dataset = { language };
    return button;
  });
  const calls = [];
  let onComplete;
  const location = { search, href: `http://127.0.0.1:4242/tickets.html${search}` };
  const context = vm.createContext({
    URL, URLSearchParams, Intl, AbortSignal, setTimeout, clearTimeout,
    location, history: { replaceState(_state, _unused, url) { location.href = String(url); } },
    crypto: { randomUUID: () => orderId },
    document: { querySelector: element, querySelectorAll: selector => selector === '[data-language]' ? languages : [], documentElement: {}, body: { dataset: { checkoutMode } }, head: {} },
    window: { Stripe: () => ({ async createEmbeddedCheckoutPage(options) {
      onComplete = options.onComplete;
      await options.fetchClientSecret();
      return { mount() {}, destroy() { calls.push('destroy'); } };
    } }) },
    fetch: async url => {
      calls.push(url);
      const data = url === '/api/ticket-config'
        ? { mode: 'test', embeddedEnabled: true, publishableKey: 'pk_test_fixture', events: { 'scary-house': { salesEnabled: true } } }
        : url === '/api/checkout/embedded' ? { orderId, clientSecret: 'test_fixture' }
          : { status: 'paid', reference: 'NM-TEST', amount: 80000, currency: 'thb' };
      return { ok: true, json: async () => data };
    }
  });
  vm.runInContext(source, context);
  return { element, calls, location, complete: () => onComplete(), language: next => element(`[data-language="${next}"]`).listeners.click(), document: context.document };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test('static Payment Link release makes no private API calls, including after a language change', async () => {
  const ui = preview('', 'payment-link');
  await settle();
  ui.language('ru');
  await settle();
  assert.deepEqual(ui.calls, []);
  assert.equal(ui.element('#stripe-checkout').hidden, true);
  assert.equal(ui.element('#embedded-placeholder').hidden, true);
  assert.equal(ui.document.documentElement.lang, 'ru');
});

test('static release ignores local test order parameters rather than displaying a test confirmation', async () => {
  const ui = preview(`?order=${orderId}`, 'payment-link');
  await settle();
  assert.deepEqual(ui.calls, []);
  assert.equal(ui.element('#embedded-result').hidden, true);
});

test('embedded completion replaces checkout with a visible, focused confirmation and retains the order URL', async () => {
  const ui = preview();
  await settle();
  ui.complete();
  await settle();
  assert.equal(ui.element('#stripe-checkout').hidden, true);
  assert.equal(ui.element('#embedded-placeholder').hidden, false);
  assert.equal(ui.element('#embedded-placeholder').focused, true);
  assert.equal(ui.element('#embedded-placeholder').scrolled, true);
  assert.equal(ui.element('#embedded-status-title').textContent, 'Тестовая оплата прошла!');
  assert.match(ui.element('#embedded-order-summary').textContent, /NM-TEST/);
  assert.equal(new URL(ui.location.href).searchParams.get('order'), orderId);
});

test('refreshing a completed order restores confirmation without creating another payment session', async () => {
  const ui = preview(`?lang=ru&order=${orderId}`);
  await settle();
  assert.deepEqual(ui.calls, [`/api/orders/${orderId}/status`]);
  assert.equal(ui.element('#embedded-status-title').textContent, 'Тестовая оплата прошла!');
  assert.equal(ui.element('#embedded-result').hidden, false);
});

test('English is the default; changing language retains it in the URL for refresh', async () => {
  const ui = preview('');
  await settle();
  assert.equal(ui.document.documentElement.lang, 'en');
  ui.language('ru');
  await settle();
  assert.equal(ui.document.documentElement.lang, 'ru');
  assert.equal(new URL(ui.location.href).searchParams.get('lang'), 'ru');
  const reloaded = preview(new URL(ui.location.href).search);
  await settle();
  assert.equal(reloaded.document.documentElement.lang, 'ru');
});

test('changing language on a confirmed order translates its result without another checkout', async () => {
  const ui = preview(`?order=${orderId}`);
  await settle();
  assert.equal(ui.element('#embedded-status-title').textContent, 'Test payment successful!');
  ui.language('ru');
  assert.equal(ui.element('#embedded-status-title').textContent, 'Тестовая оплата прошла!');
  assert.match(ui.element('#embedded-order-summary').textContent, /^Заказ /);
  assert.match(ui.element('#embedded-result').href, /lang=ru$/);
  assert.deepEqual(ui.calls, [`/api/orders/${orderId}/status`]);
});

test('duplicate completion callbacks do not run confirmation twice', async () => {
  const ui = preview('');
  await settle();
  ui.complete(); ui.complete();
  await settle();
  assert.equal(ui.calls.filter(url => url === `/api/orders/${orderId}/status`).length, 1);
});
