(() => {
  const section = document.querySelector('#fasi-lanificio');
  const player = section.querySelector('video');
  const links = [...section.querySelectorAll('ol a')];
  const status = section.querySelector('#lanificio-position');
  const next = section.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, switching = false;
  const describe = () => { status.textContent = `Filmato ${current + 1} di ${links.length} · ${links[current].textContent}`; };
  async function go(index) {
    if (switching) return;
    switching = true;
    player.classList.add('changing');
    if (!motion.matches) await new Promise(resolve => setTimeout(resolve, 350));
    current = index;
    player.src = links[index].href;
    describe();
    player.classList.remove('changing');
    switching = false;
    try { await player.play(); } catch { /* Native controls remain available. */ }
  }
  describe();
  next.hidden = false;
  next.onclick = () => go((current + 1) % links.length);
  player.addEventListener('ended', next.onclick);
  links.forEach((link, i) => link.addEventListener('click', e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; e.preventDefault(); go(i); }));
  if (!motion.matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); player.play().catch(() => {}); }
    }, { threshold: 0.4 });
    io.observe(player);
  }
})();
