import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const importer = new URL('./sync-todo.mjs', import.meta.url).href;
const event = { id: 1, name: 'Workshop', start_date: '2026-09-28', start_time: '11:00 PM', end_time: '1:00 AM', link: 'https://todo.today/event', image: '' };
async function run(pages) {
  const cwd = await mkdtemp(join(tmpdir(), 'mesto-sync-'));
  await mkdir(join(cwd, 'data'));
  await writeFile(join(cwd, 'data/events.json'), 'previous schedule');
  const fixture = `let pages=${JSON.stringify(pages)}; globalThis.fetch=async (url, options)=>({ok:true,text:async()=> 'var public_channel_ajax = {"channel_id":"2565","ajaxurl":"https://todo.today/wp-admin/admin-ajax.php","nonce":"public"};',json:async()=>pages.shift()});await import(${JSON.stringify(importer)});`;
  const proc = spawnSync(process.execPath, ['--input-type=module', '-e', fixture], { cwd, encoding: 'utf8' });
  return { code: proc.status, saved: await readFile(join(cwd, 'data/events.json'), 'utf8') };
}
test('combines pages and handles events ending after midnight', async () => {
  const result = await run([
    {success:true,data:{events:[event],total:2,has_more:true,next_page:2}},
    {success:true,data:{events:[{...event,id:2}],total:2,has_more:false}},
  ]);
  assert.equal(result.code, 0);
  const data=JSON.parse(result.saved);
  assert.equal(data.events.length,2);
  assert.equal(Date.parse(data.events[0].end)-Date.parse(data.events[0].start),7200000);
});
test('preserves existing schedule on incomplete response', async () => {
  const result=await run([{success:true,data:{events:[event],total:2,has_more:false}}]);
  assert.notEqual(result.code,0); assert.equal(result.saved,'previous schedule');
});
test('accepts an explicitly successful empty schedule', async () => {
  const result=await run([{success:true,data:{events:[],total:0,has_more:false}}]);
  assert.equal(result.code,0); assert.deepEqual(JSON.parse(result.saved).events,[]);
});
test('rejects unexpected external links without overwriting', async () => {
  const result=await run([{success:true,data:{events:[{...event,link:'https://example.com'}],total:1,has_more:false}}]);
  assert.notEqual(result.code,0); assert.equal(result.saved,'previous schedule');
});
