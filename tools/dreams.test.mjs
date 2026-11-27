import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('events/dreams-2026-12-27.html',root),'utf8');
test('Dreams has complete RU and TH dictionaries for every translated field',()=>{
 const ctx=vm.createContext({});
 const th=fs.readFileSync(new URL('assets/dreams/th.js',root),'utf8');
 const js=fs.readFileSync(new URL('assets/dreams/page.js',root),'utf8').split('const elements=')[0];
 vm.runInContext(th+'\n'+js+'\nglobalThis.translations={ru,th}',ctx);
 for(const lang of ['ru','th'])for(const [,key] of html.matchAll(/data-t="([^"]+)"/g))assert.ok(ctx.translations[lang][key],lang+': '+key);
});
test('Dreams production assets exist and payment points to its dedicated manager event',()=>{
 assert.match(html,/data-mesto-event="event-bd5e5c94-6298-4bdc-8b5e-31180068157f"/);
 assert.doesNotMatch(html,/DREAMS_EVENT_ID|Design preview|No booking or charge is made|noindex/);
 for(const [,asset] of html.matchAll(/(?:src|href)="(\.\.\/assets\/[^"?#]+)/g))assert.ok(fs.existsSync(new URL('events/'+asset,root)),asset);
 assert.match(html,/Salem Witches/);assert.match(html,/Lu &amp; Nata/);assert.doesNotMatch(html,/Lu Maria/);
});
