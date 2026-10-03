(() => {
  const host = document.querySelector('#weekly-events');
  if (!host) return;
  const status = document.querySelector('#schedule-status');
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
    if (!active.length) host.append(element('p', 'Next week’s lineup is on its way. Check back Monday, or visit our Todo.Today channel for the latest announcements.'));
    const updated = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt));
    status.textContent = `Last updated: ${updated} (Koh Phangan time).`;
    if (now - Date.parse(data.updatedAt) > 8 * 86400000) status.textContent += ' Please check Todo.Today for the latest schedule.';
  }).catch(() => {
    status.textContent = 'The schedule could not be loaded. Please open our Todo.Today channel below.';
  });
})();
