(() => {
  const host = document.querySelector('#weekly-events');
  if (!host) return;
  const status = document.querySelector('#schedule-status');
  const controls = document.querySelector('.schedule-controls');
  const previous = document.querySelector('#schedule-prev');
  const next = document.querySelector('#schedule-next');
  const position = document.querySelector('#schedule-position');
  function updateControls() {
    const cards = host.querySelectorAll('.schedule-card');
    if (!controls || !cards.length) return;
    const maxScroll = host.scrollWidth - host.clientWidth;
    controls.hidden = maxScroll <= 2;
    previous.disabled = host.scrollLeft <= 2;
    next.disabled = host.scrollLeft >= maxScroll - 2;
    const viewport = host.getBoundingClientRect();
    const visible = Array.from(cards).map((card, index) => ({ rect: card.getBoundingClientRect(), index }))
      .filter(card => card.rect.left < viewport.right - 8 && card.rect.right > viewport.left + 8);
    if (visible.length) position.textContent = `${visible[0].index + 1}–${visible[visible.length - 1].index + 1} of ${cards.length} events`;
  }
  function move(direction) {
    const card = host.querySelector('.schedule-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(host).gap) || 0;
    host.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  host.addEventListener('scroll', updateControls, { passive: true });
  host.addEventListener('keydown', event => {
    if (event.target !== host || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowRight' ? 1 : -1);
  });
  window.addEventListener('resize', updateControls);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(updateControls).observe(host);
  const dateFormat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', weekday: 'short', day: 'numeric', month: 'short' });
  function element(tag, text, className) {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function todoUrl(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'todo.today') throw new Error('Invalid URL');
    return url.href;
  }
  fetch('data/events.json', { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error('Schedule unavailable');
    return r.json();
  }).then(data => {
    if (!Array.isArray(data.events) || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Invalid schedule');
    const now = Date.now();
    const active = data.events.filter(e => {
      const cutoff = e.end || `${e.date}T23:59:59+07:00`;
      return Date.parse(cutoff) > now;
    });
    const fragment = document.createDocumentFragment();
    for (const event of active) {
      const card = element('article', '', 'schedule-card');
      const link = element('a');
      link.href = todoUrl(event.url);
      if (event.image) {
        const img = element('img');
        img.src = todoUrl(event.image); img.alt = ''; img.loading = 'lazy';
        link.append(img);
      }
      link.append(element('h3', event.title));
      card.append(element('p', `${dateFormat.format(new Date(event.start))} · ${event.time}`, 'schedule-date'), link);
      card.append(element('p', [event.price, event.booking].filter(Boolean).join(' · '), 'schedule-details'));
      const more = element('a', 'Event details →', 'schedule-link'); more.href = link.href; card.append(more);
      fragment.append(card);
    }
    host.replaceChildren(fragment);
    updateControls();
    if (!active.length) host.append(element('p', 'Next week’s lineup is on its way. Check back Monday, or visit our Todo.Today channel for the latest announcements.'));
    const updated = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt));
    status.textContent = `Last updated: ${updated} (Koh Phangan time).`;
    if (now - Date.parse(data.updatedAt) > 8 * 86400000) status.textContent += ' Please check Todo.Today for the latest schedule.';
  }).catch(() => {
    status.textContent = 'The schedule could not be loaded. Please open our Todo.Today channel below.';
  });
})();
