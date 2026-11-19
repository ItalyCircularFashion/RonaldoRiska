/* Sequenza «Fasi lavorative del lanificio».
   Due elementi video sovrapposti: il filmato successivo viene precaricato nel
   layer nascosto e la transizione è una dissolvenza incrociata, così non c'è il
   salto nero del cambio di src. Il layer liberato diventa subito il precaricamento
   del filmato successivo: non lo si deve mai svuotare, altrimenti il prefetch muore. */
(() => {
  const section = document.querySelector('#fasi-lanificio');
  if (!section) return;

  const figure = section.querySelector('.lanificio-sequence');
  const first = figure.querySelector('video');
  const status = section.querySelector('#lanificio-position');
  const next = section.querySelector('#lanificio-next');
  const links = [...section.querySelectorAll('.lanificio-list ol a')];
  const titleOf = (link) => (link.querySelector('.lanificio-title') || link).textContent.trim();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const total = links.length;
  if (!figure || !first || !status || !total) return;

  // Palcoscenico con i due layer sovrapposti.
  const stage = document.createElement('div');
  stage.className = 'lanificio-stage';
  figure.insertBefore(stage, first);
  stage.appendChild(first);

  const second = first.cloneNode(false);
  second.removeAttribute('id');
  second.removeAttribute('controls');
  second.setAttribute('aria-hidden', 'true');
  second.setAttribute('tabindex', '-1');
  stage.appendChild(second);

  const layers = [first, second];
  layers.forEach((layer) => {
    layer.classList.add('lanificio-layer');
    layer.muted = true;
    layer.defaultMuted = true;
    layer.playsInline = true;
  });
  first.classList.add('is-active');

  let slot = 0;            // indice del layer attualmente visibile
  let current = 0;         // indice del filmato in riproduzione
  let switching = false;

  const describe = () => {
    const numero = String(current + 1).padStart(2, '0');
    status.textContent = `Filmato ${numero} di ${total} · ${titleOf(links[current])}`;
    links.forEach((link, i) => {
      const on = i === current;
      link.classList.toggle('is-current', on);
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  async function go(index) {
    if (switching) return;
    const target = ((index % total) + total) % total;
    if (target === current) return;
    switching = true;

    const incoming = layers[1 - slot];
    incoming.preload = 'auto';
    incoming.src = links[target].href;
    try { await incoming.play(); } catch { /* i controlli nativi restano disponibili */ }

    incoming.classList.add('is-active');
    layers[slot].classList.remove('is-active');
    slot = 1 - slot;
    current = target;
    describe();

    // Il layer appena liberato precarica il filmato successivo.
    const prefetch = layers[1 - slot];
    prefetch.preload = 'auto';
    prefetch.src = links[(current + 1) % total].href;

    switching = false;
  }

  const advance = () => go((current + 1) % total);

  describe();
  next.hidden = false;
  next.addEventListener('click', advance);
  layers.forEach((layer) => layer.addEventListener('ended', advance));
  links.forEach((link, i) => {
    link.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      go(i);
    });
  });

  if (!motion.matches) {
    first.autoplay = true;
    first.play().catch(() => { /* se il browser blocca l'autoplay restano i controlli nativi */ });
    // Precarica il secondo filmato fin dall'inizio: la prima transizione è già pronta.
    const idle = layers[1];
    idle.preload = 'auto';
    idle.src = links[1].href;
  }
})();
