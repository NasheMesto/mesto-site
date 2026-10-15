/* Reusable MESTO checkout. Prices, inventory, payment and delivery belong to the manager. */
(() => {
  'use strict';
  const slot = document.getElementById('manager-checkout');
  const event = slot?.dataset.mestoEvent;
  if (!slot || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/.test(event || '')) return;
  const origin = 'https://manager.nashemesto.com';
  const fallback = document.getElementById('ticket-checkout');
  const status = document.getElementById('manager-checkout-status');
  const destination = new URL('/embed-preview.html', origin);
  destination.searchParams.set('event', event);
  if (fallback) {
    fallback.href = destination.href;
    const restoreOrderLink = () => {
      const url = new URL(destination);
      // Opening the fallback after an uncertain payment resumes that same order.
      try {
        const saved = JSON.parse(sessionStorage.getItem('mesto_embedded_order_v1:' + origin + ':' + event) || 'null');
        if (/^[A-Za-z0-9]{48}$/.test(saved?.orderToken || '')) url.hash = 'order=' + saved.orderToken;
      } catch { /* Private storage may be disabled. The normal checkout link stays available. */ }
      fallback.href = url.href;
    };
    for (const action of ['click', 'auxclick', 'contextmenu', 'focus']) fallback.addEventListener(action, restoreOrderLink);
  }
  let timeout;
  const fail = () => {
    if (slot.querySelector('.mesto-ticket-widget')) return;
    status.hidden = false;
    status.textContent = document.documentElement.lang === 'ru'
      ? 'Не удалось загрузить форму. Откройте окно оплаты ниже или напишите нам в Telegram.'
      : 'The payment form could not load. Open the payment window below, or contact us on Telegram.';
  };
  const observer = new MutationObserver(() => {
    if (!slot.querySelector('.mesto-ticket-widget')) return;
    status.hidden = true; clearTimeout(timeout); observer.disconnect();
  });
  observer.observe(slot, {childList:true,subtree:true});
  const script = document.createElement('script');
  script.src = origin + '/ticket-embed.js?v=20261015-checkout-2';
  script.dataset.event = event;
  script.dataset.showTitle = 'false'; script.dataset.showDate = 'false';
  script.addEventListener('error', fail, {once:true});
  timeout = setTimeout(fail, 20000);
  slot.append(script);
  window.addEventListener('pagehide', () => {clearTimeout(timeout); observer.disconnect();}, {once:true});
})();
