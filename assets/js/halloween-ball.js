/* Language control only. Payment uses the event's hosted Stripe link. */
(() => {
  'use strict';
  const russian = {
    'Skip to event': 'К событию', 'Menu': 'Меню', 'Events': 'События', 'Visit': 'Как нас найти',
    '← All MESTO events': '← Все события MESTO', 'MESTO HALLOWEEN BALL': 'ХЭЛЛОУИНСКИЙ БАЛ MESTO',
    'Dracula is missing. His throne is empty.': 'Дракула исчез. Его трон пуст.',
    'Come dressed to claim it.': 'Приходите в образе претендента на трон.',
    'Enter a night of vampires, medieval fantasy, strange encounters and glorious costumes. Join the court, brave the dungeon and discover what awaits behind the castle gates.': 'Войдите в ночь вампиров, средневекового фэнтези, странных встреч и великолепных костюмов. Присоединитесь к двору, отважитесь спуститься в подземелье и узнайте, что ждёт за воротами замка.',
    'GET TICKETS': 'БИЛЕТЫ', 'EXPLORE THE NIGHT': 'ПРОГРАММА ВЕЧЕРА', '7 NOVEMBER 2026': '7 НОЯБРЯ 2026',
    'When': 'Когда', 'Saturday, 7 November 2026': 'Суббота, 7 ноября 2026',
    '20:00–02:00 · Ends 8 November · Island time (UTC+7)': '20:00–02:00 · До 8 ноября · Время острова (UTC+7)',
    'Where': 'Где', 'Find the castle (MESTO) on the map ↗': 'Замок (MESTO) на карте ↗',
    'Your part': 'Ваша роль', 'A guest. A character. A contender.': 'Гость. Персонаж. Претендент.',
    'Prepare your look for the court ↓': 'Подготовьте образ для двора ↓', 'THE CASTLE GATES ARE OPEN': 'ВОРОТА ЗАМКА ОТКРЫТЫ',
    'A kingdom without a king.': 'Королевство без короля.', 'A night with possibilities.': 'Ночь, полная возможностей.',
    'Dracula has disappeared. The throne stands empty. Vampires, knights, witches, nobles, monsters and adventurers gather at the castle. Anyone may imagine themselves a claimant to the throne. Yes, even you.': 'Дракула исчез. Трон пуст. Вампиры, рыцари, ведьмы, дворяне, чудовища и авантюристы собираются в замке. Каждый может представить себя претендентом на трон. Да, даже вы.',
    'MESTO is a creative community, and this world comes alive with the people inside it. Step into a character, meet the court and become part of the night.': 'MESTO — творческое сообщество. Этот мир оживает благодаря людям внутри него. Примерьте роль, познакомьтесь с двором и станьте частью вечера.',
    'I / THE DESCENT': 'I / СПУСК', 'II / CROSS YOUR BLADES': 'II / СКРЕСТИТЕ КЛИНКИ', 'III / MAKE AN ENTRANCE': 'III / ВАШ ВЫХОД',
    'IV / AT THE TABLE': 'IV / ЗА СТОЛОМ', 'V / TRUST YOUR LUCK': 'V / ДОВЕРЬТЕСЬ УДАЧЕ', 'VI / WHEN NIGHT TAKES OVER': 'VI / ПОД ПОКРОВОМ НОЧИ',
    'The Dungeon Experience': 'Подземелье', 'The Tournament': 'Турнир', 'The Night Court': 'Ночной двор', 'The Feast': 'Пир', 'Bingo of Fate': 'Бинго судьбы', 'After Dark': 'После наступления темноты',
    'Enter the dungeon as a prisoner. Meet its characters, follow its mysteries and see what stirs in the shadows. Charming accommodation. Questionable hosts.': 'Войдите в подземелье в роли узника. Познакомьтесь с персонажами, исследуйте его тайны и узнайте, кто скрывается в тени. Очаровательные покои. Сомнительные хозяева.',
    'A knightly tournament and fencing. Steel, nerve and a little courtly bravado.': 'Рыцарский турнир и фехтование. Сталь, смелость и немного придворной бравады.',
    'The guests become the spectacle: a runway for your glorious outfits. Let the court admire what you have become.': 'Гости становятся зрелищем: подиум для ваших великолепных нарядов. Позвольте двору полюбоваться вашим образом.',
    'A Halloween-themed snack buffet for the court: mini sandwiches, vegetables, bread and spreads, sweets and fruit — all served with a touch of dark fantasy.': 'Тематический хэллоуинский фуршет для двора: мини-сэндвичи, овощи, хлеб с намазками, сладости и фрукты — с подачей в духе тёмного фэнтези.',
    'The themed buffet is included in your ticket.': 'Тематический фуршет включён в билет.',
    'Bingo with prizes. Fate has a sense of humour. We hope it likes you.': 'Бинго с призами. У судьбы есть чувство юмора. Надеемся, вы ей понравитесь.',
    'Performances, a piñata, music and dancing. The court has many talents. Going to bed early is unlikely to be one of them.': 'Перформансы, пиньята, музыка и танцы. У двора много талантов. Рано ложиться спать — вряд ли один из них.',
    'Candles, castle shadows and heads on pikes set the scene. The heads are décor. The guests are the story.': 'Свечи, тени замка и головы на пиках создают атмосферу. Головы — антураж. Гости — история.',
    'YOUR COSTUME IS PART OF THE NIGHT': 'ВАШ КОСТЮМ — ЧАСТЬ ВЕЧЕРА', 'Dress for the court.': 'Оденьтесь для двора.',
    'Your costume is part of the night. We ask every guest to make an effort: vampires, knights, witches, nobles, rogues and creatures of your own invention are all welcome.': 'Ваш костюм — часть вечера. Мы просим каждого гостя подготовить образ: вампиры, рыцари, ведьмы, дворяне, плуты и придуманные вами существа — всем рады.',
    'Handmade, borrowed, thrifted or transformed — imagination matters more than budget.': 'Сделанный своими руками, одолженный, найденный в секонд-хенде или переделанный — фантазия важнее бюджета.',
    '24 OCTOBER 2026': '24 ОКТЯБРЯ 2026', '/ AT MESTO': '/ В MESTO',
    'Need help bringing your character to life?': 'Нужна помощь с вашим образом?',
    'Join us at MESTO on': 'Приходите в MESTO', '24 October': '24 октября',
    'for a costume preparation day. Bring your ideas and work on your look alongside others getting ready for the ball.': 'на день подготовки костюмов. Приносите идеи и работайте над образом вместе с другими гостями будущего бала.',
    'Time, cost, materials and registration details to be announced.': 'Время, стоимость, материалы и условия регистрации объявим позже.',
    'YOUR INVITATION TO THE COURT': 'ВАШЕ ПРИГЛАШЕНИЕ КО ДВОРУ', 'Choose your entrance.': 'Выберите свой билет.',
    'Early Bird available': 'Доступны Early Bird',
    'Early Bird is available now. Advance ticket prices rise with each release; later releases are shown below.': 'Сейчас доступны Early Bird. С каждым этапом предпродажи цена растёт; следующие этапы показаны ниже.',
    '01 / CURRENT RELEASE': '01 / ТЕКУЩИЙ ЭТАП', '02 / ADVANCE': '02 / ПРЕДПРОДАЖА', '03 / ADVANCE': '03 / ПРЕДПРОДАЖА', '04 / EVENT DAY': '04 / В ДЕНЬ СОБЫТИЯ',
    'Early Bird': 'Early Bird', 'Second Release': 'Второй этап', 'Final Release': 'Финальный этап', 'At the Door': 'На входе',
    'SEPARATE TICKET CATEGORY': 'ОТДЕЛЬНАЯ КАТЕГОРИЯ БИЛЕТОВ', 'Thai & Myanmar Community Ticket': 'Билет для граждан Таиланда и Мьянмы',
    '฿300 tickets for Thai and Myanmar nationals.': 'Билеты ฿300 для граждан Таиланда и Мьянмы.',
    'From sales launch through 18 October (inclusive)': 'Со старта продаж до 18 октября включительно',
    '19–31 October (inclusive)': '19–31 октября включительно',
    '1–6 November (inclusive)': '1–6 ноября включительно',
    '7 November · Online and at the bar': '7 ноября · Онлайн и на баре',
    'Available throughout the sales period.': 'Весь период продаж.',
    'Verification conditions to be confirmed.': 'Условия проверки уточняются.',
    'Your invitation awaits.': 'Ваше приглашение ждёт.',
    'Early Bird ฿500. The themed buffet is included in your ticket.': 'Early Bird ฿500. Тематический фуршет включён в билет.',
    'Buy on Stripe': 'Купить на Stripe',
    'You will be taken to Stripe to choose quantities and pay securely. Keep your payment confirmation.': 'Вы перейдёте на Stripe, чтобы выбрать количество билетов и безопасно оплатить. Сохраните подтверждение оплаты.',
    'Questions? Contact MESTO on Telegram ↗': 'Вопросы? Напишите MESTO в Telegram ↗', 'Whispers from the court.': 'Шёпот двора.',
    'How should I prepare my costume?': 'Как подготовить костюм?',
    'Start with a character you would love to become. Handmade, borrowed, thrifted and transformed looks are welcome. Join the costume preparation day at MESTO on 24 October if you would like to work on your ideas alongside others.': 'Начните с персонажа, которым хотите стать. Сделанные своими руками, одолженные, купленные в секонд-хенде и переделанные образы приветствуются. Приходите на день подготовки костюмов в MESTO 24 октября, если хотите поработать над идеями вместе с другими.',
    'Is the buffet included in my ticket?': 'Фуршет входит в билет?',
    'Yes. Your ticket includes a Halloween-themed snack buffet: mini sandwiches, vegetables, bread and spreads, sweets and fruit, with presentation inspired by the world of the ball.': 'Да. В билет включён тематический хэллоуинский фуршет: мини-сэндвичи, овощи, хлеб с намазками, сладости и фрукты, оформленные в духе мира бала.',
    'How will I pay and receive my ticket?': 'Как оплатить и получить билет?',
    'Use the Buy on Stripe button to choose quantities and pay securely. Keep your payment confirmation. For admission and ticket delivery questions, contact': 'Нажмите «Купить на Stripe», выберите количество билетов и безопасно оплатите. Сохраните подтверждение оплаты. По вопросам входа и получения билетов пишите',
    'MESTO on Telegram ↗': 'MESTO в Telegram ↗', 'See you at the ball!': 'До встречи на балу!',
    '7 November, 20:00–02:00. A night of medieval fantasy, strange encounters and glorious costumes.': '7 ноября, 20:00–02:00. Ночь средневекового фэнтези, странных встреч и великолепных костюмов.',
    'Exact location on the map ↗': 'Точная локация на карте ↗'
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const originals = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.parentElement.closest('script, style') && node.nodeValue.trim()) originals.push([node, node.nodeValue]);
  }
  function setLanguage(language) {
    document.documentElement.lang = language;
    for (const [node, original] of originals) {
      const key = original.trim();
      node.nodeValue = language === 'ru' && Object.hasOwn(russian, key) ? original.replace(key, russian[key]) : original;
    }
    for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === language));
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(null, '', url);
  }
  for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click', () => setLanguage(button.dataset.language));
  setLanguage(new URLSearchParams(location.search).get('lang') === 'ru' ? 'ru' : 'en');
})();
