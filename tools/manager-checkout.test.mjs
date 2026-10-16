import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/js/manager-checkout.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../events/scary-house-2026-10-31.html',import.meta.url),'utf8');
const event='event-19cfa24b-4ddc-44df-a38c-abea37767ba7',origin='https://manager.nashemesto.com',token='a'.repeat(48);
function fixture(saved,{blocked=false,lang='en',slug=event}={}){
 const listeners={},status={hidden:false,textContent:''},fallback={addEventListener:(name,fn)=>listeners[name]=fn},scripts=[];let changed,widget=false,cleared=false;
 const slot={dataset:{mestoEvent:slug},append:script=>scripts.push(script),querySelector:()=>widget?{}:null};
 const context={URL,JSON,document:{getElementById:id=>({'manager-checkout':slot,'manager-checkout-status':status,'ticket-checkout':fallback}[id]),documentElement:{lang},createElement:()=>({dataset:{},listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}})},sessionStorage:{getItem:key=>{assert.equal(key,'mesto_embedded_order_v1:'+origin+':'+event);if(blocked)throw Error('Storage disabled');return saved;}},window:{addEventListener(){}},MutationObserver:class{constructor(fn){changed=fn;}observe(){}disconnect(){cleared=true;}},setTimeout:()=>1,clearTimeout(){},fetch:()=>{throw Error('Page loader must never create orders');}};
 vm.runInNewContext(source,context);return {scripts,status,fallback,click:()=>listeners.click(),mount:()=>{widget=true;changed();},get cleared(){return cleared;}};
}
test('published Scary House page uses one manager window and removes the old direct Payment Link',()=>{
 assert.match(html,/data-checkout-mode="manager"/);assert.match(html,new RegExp('data-mesto-event="'+event+'"'));
 assert.equal((html.match(/id="manager-checkout"/g)||[]).length,1);assert.doesNotMatch(html,/buy\.stripe\.com/);
 assert.match(html,/https:\/\/t\.me\/Nashemesto_kpg/);assert.match(html,/email a QR ticket for each person/);
 const f=fixture(null);assert.equal(f.scripts.length,1);assert.equal(new URL(f.scripts[0].src).origin,origin);assert.equal(f.scripts[0].dataset.event,event);assert.equal(f.scripts[0].dataset.showTitle,'false');assert.equal(f.scripts[0].dataset.showDate,'false');
});
test('separate window resumes the same saved order; no buyer data or secret appears in its URL',()=>{
 const f=fixture(JSON.stringify({orderToken:token,clientSecret:'NEVER_COPY',email:'buyer@test.invalid',requestKey:'do-not-copy'}));f.click();
 const url=new URL(f.fallback.href);assert.equal(url.origin,origin);assert.equal(url.searchParams.get('event'),event);assert.equal(url.hash,'#order='+token);assert.doesNotMatch(url.href,/NEVER_COPY|buyer|requestKey/);
});
test('invalid or disabled storage cannot produce an invalid return token or break the normal fallback',()=>{
 for(const [saved,options]of [['{',{}],[JSON.stringify({orderToken:'bad#token'}),{}],[null,{blocked:true}]]){const f=fixture(saved,options);f.click();assert.equal(new URL(f.fallback.href).hash,'');assert.equal(new URL(f.fallback.href).searchParams.get('event'),event);}
});
test('blocked widget offers a useful alternative; a mounted widget removes only the loading notice',()=>{
 const f=fixture(null,{lang:'ru'});f.scripts[0].listeners.error();assert.match(f.status.textContent,/Telegram/);assert.equal(f.status.hidden,false);f.mount();assert.equal(f.status.hidden,true);assert.equal(f.cleared,true);
 assert.equal(fixture(null,{slug:'../bad'}).scripts.length,0);
});


test('adult Halloween reuses the same loader with its own event; closed releases are not hard-coded as current',()=>{
 const pageUrl=new URL('../events/dungeons-dracula-2026-11-07.html',import.meta.url),page=fs.readFileSync(pageUrl,'utf8');
 assert.match(page,/data-checkout-mode="manager"/);assert.match(page,/data-mesto-event="event-b67c1b6c-81c3-4e3b-b94d-e4d1f8368f9d"/);assert.equal((page.match(/id="manager-checkout"/g)||[]).length,1);
 assert.doesNotMatch(page,/buy\.stripe\.com|Early Bird available|class="is-current"/);assert.match(page,/Card &amp; PromptPay/);assert.match(page,/we email a QR ticket for each guest/);assert.match(page,/Can’t complete payment/);
 for(const [,ref]of page.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(?:https?:|mailto:|#)/.test(ref))continue;assert.ok(fs.existsSync(new URL(ref,pageUrl)),ref);}
 const f=fixture(null,{slug:'event-b67c1b6c-81c3-4e3b-b94d-e4d1f8368f9d'});assert.equal(f.scripts[0].dataset.event,'event-b67c1b6c-81c3-4e3b-b94d-e4d1f8368f9d');assert.equal(new URL(f.fallback.href).searchParams.get('event'),'event-b67c1b6c-81c3-4e3b-b94d-e4d1f8368f9d');
});
