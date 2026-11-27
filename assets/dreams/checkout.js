/* Reuse the existing production checkout without creating an order on page view. */
(() => {
 'use strict';
 const slot=document.getElementById('manager-checkout'),event=slot?.dataset.mestoEvent;
 if(!slot||!event||event==='DREAMS_EVENT_ID')return;
 const origin='https://manager.nashemesto.com';
 const fallback=document.getElementById('ticket-checkout');
 const destination=new URL('/embed-preview.html',origin);destination.searchParams.set('event',event);
 if(fallback){fallback.href=destination.href;const restore=()=>{const next=new URL(destination);try{const saved=JSON.parse(sessionStorage.getItem('mesto_embedded_order_v1:'+origin+':'+event)||'null');if(/^[A-Za-z0-9]{48}$/.test(saved?.orderToken||''))next.hash='order='+saved.orderToken}catch{}fallback.href=next.href};for(const action of ['click','auxclick','contextmenu','focus'])fallback.addEventListener(action,restore)}
 const status=document.getElementById('manager-checkout-status');let timer;
 const fail=()=>{if(slot.querySelector('.mesto-ticket-widget'))return;status.hidden=false;status.textContent=({ru:'Не удалось загрузить форму. Открой отдельное окно оплаты ниже или напиши MESTO.',th:'ไม่สามารถโหลดแบบฟอร์มได้ กรุณาเปิดหน้าชำระเงินด้านล่าง หรือติดต่อ MESTO'})[document.documentElement.lang]||'The payment form could not load. Open the payment window below or contact MESTO.'};
 const observer=new MutationObserver(()=>{if(!slot.querySelector('.mesto-ticket-widget'))return;status.hidden=true;clearTimeout(timer);observer.disconnect()});observer.observe(slot,{childList:true,subtree:true});
 const script=document.createElement('script');script.src=origin+'/ticket-embed.js?v=20261103-hide-counts-1';script.dataset.event=event;script.dataset.showTitle='false';script.dataset.showDate='false';script.addEventListener('error',fail,{once:true});timer=setTimeout(fail,20000);slot.append(script);window.addEventListener('pagehide',()=>{clearTimeout(timer);observer.disconnect()},{once:true});
})();
