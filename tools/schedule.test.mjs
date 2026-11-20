import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/schedule.js', import.meta.url), 'utf8');
async function render(events, now = '2026-10-11T16:00:00+07:00', offline = false) {
  class Element {
    children = [];
    textContent = '';
    append(...children) { this.children.push(...children); }
    replaceChildren(fragment) { this.children = fragment.children; }
    addEventListener() {}
    querySelectorAll() { return []; }
  }
  const host = new Element();
  const status = new Element();
  const document = {
    querySelector: selector => ({ '#weekly-events': host, '#schedule-status': status }[selector] || null),
    createElement: () => new Element(), createDocumentFragment: () => new Element(),
  };
  class FixedDate extends Date { static now() { return Date.parse(now); } }
  vm.runInNewContext(source, {
    document, Date: FixedDate, Intl, URL,
    window: { addEventListener() {} },
    fetch: async () => { if(offline) throw new Error('offline'); return { ok: true, json: async () => ({ events, updatedAt: now }) }; },
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.match(status.textContent, offline ? /could not be loaded/ : /^Last updated:/);
  return host.children;
}
const event = (overrides = {}) => ({
  id: 1, title: 'Workshop', date: '2026-10-12', start: '2026-10-12T16:00:00+07:00',
  end: '2026-10-12T18:00:00+07:00', time: '4:00 PM – 6:00 PM',
  url: 'https://todo.today/workshop', image: 'https://todo.today/workshop.jpg', ...overrides,
});
const scary = event({ id: 226758, title: 'Scary House: Halloween Fun for Kids', date: '2026-10-31',
  start: '2026-10-31T18:00:00+07:00', end: '2026-10-31T22:00:00+07:00' });
const ball = event({ id: 999, title: 'Dungeons & Dracula w/ Mesto', date: '2026-11-07',
  start: '2026-11-07T20:00:00+07:00', end: '2026-11-08T02:00:00+07:00' });

test('Todo cards stay external; Scary House and added ball link to local ticket pages', async () => {
  const cards = await render([scary, event()]);
  assert.equal(cards.length, 4);
  assert.equal(cards[0].children[1].href, 'https://todo.today/workshop');
  for (const [index, path] of [[1, 'events/scary-house-2026-10-31.html'], [2, 'events/dungeons-dracula-2026-11-07.html']]) {
    assert.equal(cards[index].children[1].href, path);
    assert.equal(cards[index].children[3].href, path);
    assert.equal(cards[index].children[3].textContent, 'Details & tickets →');
  }
  assert.equal(cards[2].children[1].children[0].src, 'images/halloween-ball/poster.jpg');
});

test('a future Todo ball replaces the fallback, preserving feed details without a duplicate', async () => {
  for (const title of ['Dungeons & Dracula w/ Mesto', 'Dungeons and Dracula', 'MESTO Halloween Ball']) {
    const cards = await render([event(), { ...ball, title }]);
    assert.equal(cards.length, 3);
    assert.equal(cards[1].children[1].href, 'events/dungeons-dracula-2026-11-07.html');
    assert.equal(cards[1].children[1].children[1].textContent, title);
    assert.equal(cards[1].children[1].children[0].src, ball.image);
  }
});

test('costume meetup keeps its Todo link, and renamed Scary House still matches its ID', async () => {
  const craft = event({ title: 'Craft Meetup: Getting Ready for Dungeons & Dracula', date: '2026-10-18' });
  const cards = await render([craft, { ...scary, title: 'New event title' }]);
  assert.equal(cards[0].children[1].href, craft.url);
  assert.equal(cards[1].children[1].href, 'events/scary-house-2026-10-31.html');
});

test('ball remains visible after midnight and disappears at its end', async () => {
  assert.equal((await render([], '2026-11-08T01:00:00+07:00')).length, 2);
  const ended = await render([], '2026-11-08T02:00:00+07:00');
  assert.equal(ended.length, 1);
  assert.match(ended[0].children[1].children[1].textContent, /MESTO Dreams/);
});


test('Dreams is the last upcoming card with the correct page, date and Early Bird price', async () => {
 const cards=await render([event()], '2026-11-20T12:00:00+07:00');
 const card=cards.at(-1);
 assert.equal(card.children[1].href, 'events/dreams-2026-12-27.html');
 assert.equal(card.children[1].children[0].src,'assets/dreams/share-poster.png');
 assert.match(card.children[2].textContent,/Early Bird ฿500/);
});
test('Dreams feed listing replaces the fallback without duplication',async()=>{
 const dreams=event({title:'MESTO Dreams',date:'2026-12-27',start:'2026-12-27T16:00:00+07:00',end:'2026-12-28T02:00:00+07:00'});
 const cards=await render([dreams], '2026-11-20T12:00:00+07:00');
 assert.equal(cards.length,1);
 assert.equal(cards[0].children[1].href,'events/dreams-2026-12-27.html');
});
test('Dreams remains after midnight, ends at 02:00, and survives an unavailable external feed',async()=>{
 const still=await render([], '2026-12-28T01:59:59+07:00');
 assert.equal(still.length,1);assert.match(still[0].children[1].children[1].textContent,/MESTO Dreams/);
 const ended=await render([], '2026-12-28T02:00:00+07:00');assert.match(ended[0].textContent,/Next week/);
 const offline=await render([], '2026-11-20T12:00:00+07:00',true);assert.equal(offline.length,1);assert.equal(offline[0].children[1].href,'events/dreams-2026-12-27.html');
});
