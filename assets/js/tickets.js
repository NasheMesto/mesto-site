/* Payment Link on the static site; embedded test checkout where its backend is available. */
(() => {
  'use strict';
  let language = new URLSearchParams(location.search).get('lang') === 'ru' ? 'ru' : 'en';
  const russian = {
  "skip": "К мероприятию",
  "preview": "Локальный просмотр · Встроенная оплата в тестовом режиме",
  "menu": "Меню",
  "events": "События",
  "visit": "Как добраться",
  "back": "← Все события MESTO",
  "eyebrow": "Детский Halloween / Nashe Mesto",
  "tagline": "Увлекательные квесты, волшебная атмосфера и море развлечений для детей 5–12 лет.",
  "choose": "Купить билеты",
  "heroDate": "31 октября · 18:00–22:00",
  "when": "Когда",
  "date": "Суббота, 31 октября 2026",
  "time": "18:00–22:00 · время Koh Phangan",
  "where": "Где",
  "map": "Точная локация на карте ↗",
  "who": "Для кого",
  "ages": "Дети 5–12 лет",
  "accompaniment": "Сопровождение взрослого обязательно",
  "aboutEyebrow": "Что вас ждёт",
  "aboutTitle": "Вечер волшебных приключений.",
  "aboutCopy": "Игры и задания в атмосфере Halloween, встреча с волшебницей, декорации, персонажи и тематические зоны.",
  "quests": "Квесты и игры",
  "questsCopy": "Все активности и иммерсивные зоны.",
  "witch": "Гадание у волшебницы",
  "witchCopy": "Магическая встреча для юных гостей.",
  "photos": "Фотозоны и фотобудка",
  "photosCopy": "Можно фотографироваться сколько угодно.",
  "treats": "Угощение в Scary Bar",
  "treatsCopy": "Halloween-угощение входит в билет.",
  "includedNote": "Активности, иммерсивные зоны, фотозоны, фотобудка, гадание и угощение входят в билет.",
  "faqTitle": "Полезно знать",
  "ageQuestion": "Для какого возраста мероприятие?",
  "ageAnswer": "Для детей 5–12 лет. Сопровождение детей взрослыми обязательно.",
  "deliveryQuestion": "Как пройти на мероприятие?",
  "deliveryAnswer": "Сохраните подтверждение оплаты Stripe. На входе назовите email, указанный при покупке. Дети должны быть в сопровождении взрослого.",
  "refundQuestion": "К кому обратиться по поводу возврата?",
  "refundAnswer": "По вопросам возврата или отмены свяжитесь с tickets@nashemesto.com. Уточните условия до покупки.",
  "foodQuestion": "Где посмотреть меню?",
  "menuLink": "Открыть меню MESTO ↗",
  "embeddedEyebrow": "Купить билеты",
  "embeddedTitle": "Ваши билеты. Один шаг до приключения.",
  "testBadge": "Тестовый режим",
  "embeddedCopy": "Детский билет — 500 ฿, сопровождающий взрослый — 300 ฿. Выберите количество и оплатите на защищённой странице Stripe.",
  "placeholderTitle": "Здесь появится форма оплаты Stripe",
  "retry": "Попробовать снова",
  "resultLink": "Посмотреть статус тестового заказа ↗",
  "testNote": "Встроенная форма — тестовая. Деньги не списываются, билет для входа не выдаётся.",
  "alternative": "Или на отдельной странице",
  "checkoutButton": "Купить на Stripe",
  "noCharge": "По этой ссылке — настоящая оплата.",
  "questions": "Есть вопросы? Напишите нам ↗",
  "venueTitle": "До встречи в Scary House!",
  "venueCopy": "31 октября, 18:00–22:00. Детский Halloween для детей 5–12 лет и сопровождающих взрослых."
};
  const english = {
    skip: 'Skip to event', preview: 'Local preview · Embedded checkout in test mode',
    menu: 'Menu', events: 'Events', visit: 'Visit', back: '← All MESTO events',
    eyebrow: 'Kids Halloween / Nashe Mesto', tagline: 'Quests, a magical atmosphere, and Halloween fun for kids ages 5–12.',
    choose: 'Buy tickets', heroDate: 'October 31 · 6–10 PM', when: 'When', date: 'Saturday, October 31, 2026',
    time: '6–10 PM · Koh Phangan local time', where: 'Where', map: 'Exact location on the map ↗',
    who: 'Who it’s for', ages: 'Kids ages 5–12', accompaniment: 'Adult accompaniment is required',
    aboutEyebrow: 'What’s waiting', aboutTitle: 'An evening of spooky adventures.',
    aboutCopy: 'Halloween games and challenges, a magical encounter with the witch, characters, decorations, and immersive zones.',
    quests: 'Quests & games', questsCopy: 'All activities and immersive zones.', witch: 'Fortune telling with the witch',
    witchCopy: 'A magical encounter for young guests.', photos: 'Photo zones & photo booth',
    photosCopy: 'Take as many spooky photos as you like.', treats: 'Treat at the Scary Bar', treatsCopy: 'A Halloween treat is included with the ticket.',
    includedNote: 'Activities, immersive zones, photo zones, the photo booth, fortune telling, and a treat are included in the ticket.',
    faqTitle: 'Good to know', ageQuestion: 'Who is the event for?', ageAnswer: 'Kids ages 5–12. Children must be accompanied by an adult.',
    deliveryQuestion: 'How do I enter the event?',
    deliveryAnswer: 'Save your Stripe payment confirmation. At the entrance, tell us the email address used for your booking. Children must be accompanied by an adult.',
    refundQuestion: 'Who can I contact about refunds?', refundAnswer: 'For refund or cancellation questions, contact tickets@nashemesto.com. Please check the conditions before booking.',
    foodQuestion: 'Where can I see the menu?', menuLink: 'View the MESTO menu ↗',
    checkoutButton: 'Buy on Stripe', noCharge: 'This link accepts real payments.',
    testNote: 'The embedded form is a test. No money is charged and no admission ticket is issued.',
    alternative: 'Or on a separate page', embeddedEyebrow: 'Book your place',
    embeddedTitle: 'Your tickets. One step closer to adventure.', testBadge: 'Test mode',
    embeddedCopy: 'Child ticket: ฿500. Accompanying adult: ฿300. Choose quantities and pay on the secure Stripe payment page.',
    placeholderTitle: 'The Stripe payment form will appear here', retry: 'Try again', resultLink: 'View test order status ↗',
    questions: 'Have a question? Message us ↗', venueTitle: 'See you at Scary House!',
    venueCopy: 'October 31, 6–10 PM. Kids Halloween for ages 5–12 and accompanying adults.'
  };
  const messages = {
    ru: { checking: 'Проверяем доступность оплаты…', unavailable: 'Встроенная оплата пока недоступна. Можно открыть отдельную страницу Stripe.',
      loading: 'Открываем защищённую форму Stripe…', error: 'Не удалось открыть форму. Попробуйте ещё раз или откройте отдельную страницу Stripe.',
      waiting: 'Проверяем подтверждение оплаты…', paid: 'Тестовая оплата подтверждена. Этот заказ не даёт права входа.',
      pending: 'Подтверждение ещё не получено. Проверьте статус заказа по ссылке ниже.', closed: 'Заказ закрыт. Проверьте его статус по ссылке ниже.' },
    en: { checking: 'Checking checkout availability…', unavailable: 'Embedded checkout is currently unavailable. You can open the separate Stripe page.',
      loading: 'Opening the secure Stripe form…', error: 'Unable to open the form. Please retry or open the separate Stripe page.',
      waiting: 'Checking payment confirmation…', paid: 'Test payment confirmed. This order does not grant admission.',
      pending: 'Confirmation has not arrived yet. Check your order status using the link below.', closed: 'This order is closed. Check its status using the link below.' }
  };
  const placeholder = document.querySelector('#embedded-placeholder');
  const mount = document.querySelector('#stripe-checkout');
  const resultLink = document.querySelector('#embedded-result');
  const retry = document.querySelector('#ticket-retry');
  const section = document.querySelector('#embedded-payment');
  let status = 'checking', ready = false, busy = false, completed = false;
  let checkout = null, stripePromise = null, request = null, orderId = null, publishableKey = '', confirmedOrder = null;
  function renderCheckoutMode() {
    for (const element of document.querySelectorAll('[data-embedded-only]')) element.hidden = !ready;
    if (ready) {
      document.querySelector('[data-i18n="embeddedEyebrow"]').textContent = language === 'ru' ? 'Оплата на этой странице' : 'Pay on this page';
      document.querySelector('[data-i18n="embeddedCopy"]').textContent = language === 'ru'
        ? 'Детский билет — 500 ฿, сопровождающий взрослый — 300 ฿. Выберите количество и оплатите прямо в форме Stripe.'
        : 'Child ticket: ฿500. Accompanying adult: ฿300. Choose quantities and pay directly in the Stripe form.';
    }
  }
  function renderOrderSummary() {
    if (!confirmedOrder) return;
    const summary = document.querySelector('#embedded-order-summary');
    const amount = new Intl.NumberFormat(language === 'ru' ? 'ru-RU' : 'en-US', { style: 'currency', currency: confirmedOrder.currency.toUpperCase() }).format(confirmedOrder.amount / 100);
    summary.textContent = `${language === 'ru' ? 'Заказ' : 'Order'} ${confirmedOrder.reference} · ${amount}`;
    summary.hidden = false;
  }
  function showStatus(next) {
    status = next;
    document.querySelector('#embedded-status').textContent = messages[language][status];
    if (completed) {
      const titles = language === 'ru'
        ? { waiting: 'Проверяем оплату', paid: 'Тестовая оплата прошла!', pending: 'Ожидаем подтверждение оплаты', closed: 'Статус заказа изменился' }
        : { waiting: 'Checking your payment', paid: 'Test payment successful!', pending: 'Awaiting payment confirmation', closed: 'Order status changed' };
      document.querySelector('#embedded-status-title').textContent = titles[status] || titles.waiting;
      document.querySelector('#embedded-icon').textContent = status === 'paid' ? '✓' : '…';
      placeholder.classList.toggle('is-confirmed', status === 'paid');
    }
  }
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = language;
    document.title = language === 'ru' ? 'Scary House · Билеты в MESTO' : 'Scary House · Tickets at MESTO';
    const translations = language === 'en' ? english : russian;
    for (const element of document.querySelectorAll('[data-i18n]')) {
      const value = translations[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    }
    for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === language));
    document.querySelector('.ticket-back').href = 'events.html#ticketed-events';
    if (completed) resultLink.href = `ticket-result.html?order=${encodeURIComponent(orderId)}&lang=${language}`;
    showStatus(status);
    renderOrderSummary();
    renderCheckoutMode();
  }
  for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click', () => {
    if (busy) return;
    setLanguage(button.dataset.language);
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
    if (completed) return;
    if (ready) {
      checkout?.destroy(); checkout = null; request = null;
      mount.hidden = true; placeholder.hidden = false;
      void startEmbedded();
    }
  });
  setLanguage(language);
  async function readJSON(url, options = {}) {
    const response = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'request_failed');
    return data;
  }
  function loadStripe() {
    if (stripePromise) return stripePromise;
    stripePromise = new Promise((resolve, reject) => {
      if (window.Stripe) return resolve(window.Stripe);
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/endive/stripe.js';
      const timeout = setTimeout(() => { script.remove(); reject(new Error('stripe_load_timeout')); }, 20000);
      script.onload = () => { clearTimeout(timeout); window.Stripe ? resolve(window.Stripe) : reject(new Error('stripe_unavailable')); };
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('stripe_unavailable')); };
      document.head.append(script);
    }).catch(error => { stripePromise = null; throw error; });
    return stripePromise;
  }
  async function handleCompletion() {
    if (completed) return;
    completed = true;
    checkout?.destroy(); checkout = null;
    mount.hidden = true; placeholder.hidden = false; retry.hidden = true;
    resultLink.href = `ticket-result.html?order=${encodeURIComponent(orderId)}&lang=${language}`;
    resultLink.hidden = false; showStatus('waiting');
    // Keep the completed order available on refresh without creating another checkout.
    const url = new URL(location.href);
    url.searchParams.set('order', orderId);
    url.searchParams.set('lang', language);
    url.hash = 'embedded-payment';
    history.replaceState(null, '', url);
    function revealResult() {
      placeholder.focus({ preventScroll: true });
      placeholder.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    revealResult();
    // Only the signed webhook, not this browser callback, can issue admissions.
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const order = await readJSON(`/api/orders/${encodeURIComponent(orderId)}/status`);
        if (order.status === 'paid') {
          showStatus('paid');
          confirmedOrder = order;
          renderOrderSummary();
          revealResult();
          return;
        }
        if (['failed', 'expired', 'refunded', 'partially_refunded'].includes(order.status)) { showStatus('closed'); return; }
      } catch { /* Keep the order status link available if the local service is offline. */ }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    showStatus('pending');
  }
  async function startEmbedded() {
    if (!ready || busy || checkout || completed) return;
    busy = true; retry.hidden = true; showStatus('loading');
    section.setAttribute('aria-busy', 'true');
    for (const button of document.querySelectorAll('[data-language]')) button.disabled = true;
    if (!request) request = { eventId: 'scary-house', language, requestId: crypto.randomUUID() };
    const activeRequest = request;
    try {
      const Stripe = await loadStripe();
      const stripe = Stripe(publishableKey, { locale: language });
      const instance = await stripe.createEmbeddedCheckoutPage({
        fetchClientSecret: async () => {
          const session = await readJSON('/api/checkout/embedded', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activeRequest) });
          orderId = session.orderId;
          return session.clientSecret;
        },
        onComplete: () => { if (request === activeRequest) void handleCompletion(); }
      });
      if (completed) { instance.destroy(); return; }
      checkout = instance; mount.hidden = false;
      checkout.mount('#stripe-checkout'); placeholder.hidden = true;
    } catch (error) {
      checkout?.destroy(); checkout = null;
      mount.hidden = true; placeholder.hidden = false; retry.hidden = false;
      if (error.message === 'order_closed') request = null;
      showStatus('error');
    } finally {
      busy = false; section.removeAttribute('aria-busy');
      for (const button of document.querySelectorAll('[data-language]')) button.disabled = false;
    }
  }
  retry.addEventListener('click', () => { void startEmbedded(); });
  async function configure() {
    // GitHub Pages has no private API. Its release explicitly uses the live Payment Link.
    if (document.body?.dataset.checkoutMode === 'payment-link') return;
    const previousOrder = new URLSearchParams(location.search).get('order');
    if (/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(previousOrder || '')) {
      orderId = previousOrder;
      await handleCompletion();
      return;
    }
    try {
      const config = await readJSON('/api/ticket-config');
      ready = config.mode === 'test' && config.embeddedEnabled && config.publishableKey?.startsWith('pk_test_') && config.events?.['scary-house']?.salesEnabled;
      publishableKey = ready ? config.publishableKey : '';
    } catch { ready = false; }
    renderCheckoutMode();
    if (ready) { placeholder.hidden = false; await startEmbedded(); }
    else showStatus('unavailable');
  }
  void configure();
})();
