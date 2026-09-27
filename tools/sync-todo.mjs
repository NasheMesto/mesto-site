import { mkdir, writeFile, rename } from 'node:fs/promises';

const channel = 'https://todo.today/c/mesto-nashe-mesto/';
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Todo returned HTTP ${response.status}`);
  return response;
}
function safeUrl(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'todo.today') throw new Error('Unexpected event URL');
  return url.href;
}
function timestamp(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid event date');
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time);
  if (!match || +match[1] < 1 || +match[1] > 12 || +match[2] > 59) throw new Error('Invalid event time');
  const hour = (+match[1] % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return `${date}T${String(hour).padStart(2, '0')}:${match[2]}:00+07:00`;
}

// Read the public page's current configuration; never hard-code an expiring nonce.
const html = await (await request(channel)).text();
const match = html.match(/var public_channel_ajax\s*=\s*(\{[^\n]+\});/);
if (!match) throw new Error('Todo page format changed; existing schedule was preserved');
const config = JSON.parse(match[1]);
if (config.channel_id !== '2565' || config.ajaxurl !== 'https://todo.today/wp-admin/admin-ajax.php') {
  throw new Error('Unexpected Todo channel configuration');
}
const events = new Map();
let page = 1;
let expectedTotal;
for (let attempt = 0; attempt < 100; attempt++) {
  const response = await request(config.ajaxurl, {
    method: 'POST',
    body: new URLSearchParams({ action: 'get_public_channel_events', channel_id: config.channel_id,
      type: 'upcoming', page: String(page), nonce: config.nonce }),
  });
  const result = await response.json();
  if (result.success !== true || !Array.isArray(result.data?.events)) throw new Error('Invalid Todo response');
  const data = result.data;
  if (!Number.isInteger(data.total) || data.total < 0) throw new Error('Missing event total');
  expectedTotal ??= data.total;
  if (data.total !== expectedTotal) throw new Error('Schedule changed during download; please retry');
  for (const event of data.events) {
    if (!event.id || typeof event.name !== 'string' || !event.name.trim()) throw new Error('Incomplete event');
    const start = timestamp(event.start_date, event.start_time);
    let end = event.end_time ? timestamp(event.start_date, event.end_time) : null;
    if (end && Date.parse(end) <= Date.parse(start)) end = new Date(Date.parse(end) + 86400000).toISOString();
    events.set(event.id, { id: event.id, title: event.name, start, end,
      date: event.start_date, time: event.start_time + (event.end_time ? ` – ${event.end_time}` : ''),
      price: event.price_label || '', booking: event.join_label || '',
      url: safeUrl(event.link), image: event.image ? safeUrl(event.image) : null });
  }
  if (!data.has_more) break;
  if (!Number.isInteger(data.next_page) || data.next_page <= page || data.events.length === 0) throw new Error('Invalid pagination');
  page = data.next_page;
}
if (events.size !== expectedTotal) throw new Error(`Incomplete schedule: ${events.size}/${expectedTotal}`);
const schedule = { source: channel, updatedAt: new Date().toISOString(), timezone: 'Asia/Bangkok',
  events: [...events.values()].sort((a, b) => Date.parse(a.start) - Date.parse(b.start)) };
await mkdir('data', { recursive: true });
await writeFile('data/events.json.tmp', JSON.stringify(schedule, null, 2) + '\n');
await rename('data/events.json.tmp', 'data/events.json');
console.log(`Saved ${events.size} events from Todo.Today`);
