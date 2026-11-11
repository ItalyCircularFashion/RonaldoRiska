/* ═══════════════════════════════════════════════════════════
 * flower-spiral.js — Il fiore dei progetti
 * Scena 3D CSS3DRenderer: le card progetto sono i fiori di una
 * spirale che ruota seguendo lo scroll della pagina.
 * Nessun WebGL: solo DOM + transform CSS 3D.
 * ═══════════════════════════════════════════════════════════ */

(() => {
  const section = document.getElementById('fiore');
  if (!section) return;

  const mount = section.querySelector('[data-flower-mount]');
  const fallback = section.querySelector('[data-flower-fallback]');
  const hint = section.querySelector('[data-flower-hint]');
  const projects = window.portfolioProjects || [];
  const categories = window.portfolioCategories || {};

  if (!mount || !projects.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHtml = (value = '') =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const safeKey = (value = '') => String(value).replace(/[^a-z0-9-]/gi, '');

  /* ── Card-fiore ─────────────────────────────────────────── */

  const buildCard = (project) => {
    const category = categories[project.category] || {};
    const label = category.label || project.category || 'Progetto';
    const initial = label.trim().charAt(0).toUpperCase();
    const href = project.detailPage || project.url || '#';
    const categoryKey = safeKey(project.category) || 'supply';

    const el = document.createElement('a');
    el.className = 'fx-flower-card';
    el.href = href;
    el.setAttribute('aria-label', `Anteprima 3D: ${project.title} — apri la scheda`);
    el.innerHTML = `
      <span class="fx-flower-orb fx-flower-orb--${escapeHtml(categoryKey)}" aria-hidden="true">${escapeHtml(initial)}</span>
      <span class="fx-flower-title">${escapeHtml(project.title)}</span>
      <span class="fx-flower-meta">${escapeHtml(project.status || '')} · ${escapeHtml(label)}</span>
    `;
    return el;
  };

  /* ── Fallback ───────────────────────────────────────────── */

  const showFallback = (reason) => {
    section.classList.add('is-fallback');
    if (fallback) fallback.hidden = false;
    if (hint) hint.hidden = true;
    console.warn('[flower] fallback attivo:', reason);
  };

  /* ── Init ───────────────────────────────────────────────── */

  const init = async () => {
    let THREE;
    let CSS3DRenderer;
    let CSS3DObject;

    try {
      THREE = await import('three');
      ({ CSS3DRenderer, CSS3DObject } = await import('three/addons/renderers/CSS3DRenderer.js'));
    } catch (err) {
      showFallback(err);
      return;
    }

    const stage = section.querySelector('.fx-flower-stage');

    const renderer = new CSS3DRenderer();
    renderer.setSize(stage.clientWidth || window.innerWidth, stage.clientHeight || window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 6000);
    camera.position.set(0, 0, 1150);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    /* ── Spirale: una card per progetto ── */
    const N = projects.length;
    const TURNS = 1.6;
    const SPREAD = 1100;
    const RADIUS_BASE = 300;
    const RADIUS_BLOOM = 90;

    projects.forEach((project, i) => {
      const t = N === 1 ? 0 : i / (N - 1);
      const angle = t * Math.PI * 2 * TURNS;
      const radius = RADIUS_BASE + Math.sin(t * Math.PI) * RADIUS_BLOOM;
      const y = (t - 0.5) * SPREAD;

      const obj = new CSS3DObject(buildCard(project));
      obj.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      obj.rotation.y = -angle + Math.PI / 2;
      group.add(obj);
    });

    /* ── Resize / fit ─────────────────────────────────────── */

    const resize = () => {
      const w = stage.clientWidth || window.innerWidth;
      const h = stage.clientHeight || window.innerHeight;
      const aspect = w / h;

      camera.aspect = aspect;
      /* Su viewport strette (mobile) allontana la camera per tenere la spirale intera */
      camera.position.z = aspect < 1 ? 1150 * Math.min(2.6, 1.15 / aspect) : 1150;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    /* ── Scroll progress ──────────────────────────────────── */

    let target = 0;
    let current = 0;

    const measure = () => {
      const total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const top = section.getBoundingClientRect().top;
      target = Math.min(1, Math.max(0, -top / total));
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });

    /* ── Pausa fuori viewport ─────────────────────────────── */

    let visible = true;

    // Use measure() instead of IntersectionObserver: more reliable
    const checkVisible = () => {
      const top = section.getBoundingClientRect().top;
      const inView = top >= 0 && top < window.innerHeight;
      visible = inView;
    };

    // Check visibility on scroll and on load
    checkVisible();
    window.addEventListener('scroll', checkVisible, { passive: true });
    window.addEventListener('resize', checkVisible);

    /* ── Render ───────────────────────────────────────────── */

    const render = () => {
      current += (target - current) * 0.08;
      group.rotation.y = current * Math.PI * 2 * 2.4;
      group.position.y = (0.5 - current) * 420;
      const bloom = Math.sin(current * Math.PI);
      group.scale.setScalar(1 + bloom * 0.12);
      renderer.render(scene, camera);
    };

    if (reduced) {
      /* Fiore statico: nessuna rotazione legata allo scroll */
      group.rotation.y = 0.7;
      renderer.render(scene, camera);
      window.addEventListener('resize', () => renderer.render(scene, camera));
      return;
    }

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      // Update scroll progress: measure current scroll position
      const top = section.getBoundingClientRect().top;
      const total = section.offsetHeight - window.innerHeight;
      if (total > 0) {
        target = Math.min(1, Math.max(0, -top / total));
      }
      render();
    };
    loop();

    /* ── Hint: sparisce dopo il primo scroll ──────────────── */

    const onScroll = () => {
      if (target > 0.02 && hint) hint.style.opacity = '0';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  init();
})();
