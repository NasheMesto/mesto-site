// Keep the original photograph width; increase only its height when the
// event header grows. A single background continues behind the page content.
(() => {
  const hero = document.querySelector('.home-hero');
  const wrapper = document.querySelector('#wrapper');
  if (!hero || !wrapper) return;
  const resize = () => {
    const height = Math.max(hero.offsetHeight * 1.75, wrapper.clientWidth * 2000 / 1680);
    wrapper.style.setProperty('--event-photo-height', `${height}px`);
  };
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
  window.addEventListener('resize', resize, { passive: true });
})();
