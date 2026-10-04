// Preserve language and order parameters from previously shared event links.
(() => {
  const target = new URL('events/scary-house-2026-10-31.html', location.href);
  target.search = location.search;
  target.hash = location.hash === '#embedded-payment' ? '#tickets' : location.hash;
  location.replace(target.href);
})();
