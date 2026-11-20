/* Shared public event announcement. It expires at the event's actual end. */
(() => {
 'use strict';
 if(Date.now() >= Date.parse('2026-12-28T02:00:00+07:00') || location.pathname.endsWith('/dreams-2026-12-27.html'))return;
 const content=document.querySelector('#main,main');
 if(!content||document.getElementById('mesto-dreams-promo'))return;
 const lang=new URLSearchParams(location.search).get('lang')||document.documentElement.lang;
 const copy={en:['Christmas & New Year Art Festival','Exhibition · Music · Immersive experiences','Discover Dreams'],ru:['Рождественский и новогодний фестиваль искусства','Выставка · Музыка · Инсталляции','О фестивале'],th:['เทศกาลศิลปะฉลองคริสต์มาสและปีใหม่','นิทรรศการ · ดนตรี · ศิลปะจัดวาง','รู้จัก Dreams']}[lang]||['Christmas & New Year Art Festival','Exhibition · Music · Immersive experiences','Discover Dreams'];
 const link=document.createElement('a');link.id='mesto-dreams-promo';
 link.href='/events/dreams-2026-12-27.html'+(['ru','th'].includes(lang)?'?lang='+lang:'');
 const date=document.createElement('span');date.className='dreams-promo-date';date.innerHTML='27<span>DEC</span>';
 const image=document.createElement('img');image.src='/assets/dreams/dreams-logo-poster.png';image.alt='MESTO Dreams';image.width=1774;image.height=887;image.decoding='async';
 const text=document.createElement('span');text.className='dreams-promo-copy';
 const title=document.createElement('strong');title.textContent=copy[0];const detail=document.createElement('span');detail.textContent=copy[1];const meta=document.createElement('span');meta.textContent='16:00–02:00 · Early Bird ฿500';
 text.append(title,detail,meta);const cta=document.createElement('span');cta.className='dreams-promo-cta';cta.textContent=copy[2];
 link.append(date,image,text,cta);
 const hero=document.querySelector('.home-page .hero-layout');
 if(hero){hero.classList.add('has-dreams-promo');hero.append(link);}else{content.before(link);}
})();
