/* Homepage Experimental — ricostruzione interattiva.
   GSAP + ScrollTrigger + Flip (CDN async). Senza GSAP: solo CSS/JS base, contenuti intatti.
   8+ interazioni: menu fullscreen, hero mouse-3D, split title, aperture FLIP,
   filtro FLIP, story sticky stacked, rail espandibile, particelle warp-thread, magnetici, curtain. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = function () { return typeof window.gsap !== "undefined"; };
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  document.body.classList.add("page-home");
  document.body.dataset.fxPointer = finePointer ? "fine" : "coarse";

  /* ── Progress bar ── */
  var progress = qs(".fx-progress");
  if (progress && !reduced) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ── Cursor ring + hot state ── */
  var cursor = qs(".fx-cursor");
  if (cursor && finePointer && !reduced) {
    var cx = -100, cy = -100, tx = cx, ty = cy;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      cursor.classList.toggle("is-hot", !!e.target.closest("a,button,.project-card,.featured-card,.category-block"));
    });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
  }

  /* ── Particelle warp-thread (canvas, mouse-repulsione) ── */
  (function particles() {
    var cv = qs(".fx-canvas"); if (!cv) return;
    var ctx = cv.getContext("2d"); if (!ctx) return;
    var W, H, pts = [], mouse = { x: -9999, y: -9999 };
    var COLORS = ["199,164,91", "255,45,111", "45,212,191"];
    function size() {
      W = cv.width = Math.min(window.innerWidth, 1600);
      H = cv.height = Math.min(window.innerHeight, 1100);
      cv.style.width = "100%"; cv.style.height = "100%";
    }
    function spawn() {
      pts = [];
      var n = reduced ? 0 : Math.min(90, Math.floor(W * H / 16000));
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() * 0.5) + 0.15,
        r: Math.random() * 1.8 + 0.6, c: COLORS[i % 3], l: i % 5 === 0
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(function (p) {
        if (!reduced) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.1) { p.vx += (dx / d) * 0.12; p.vy += (dy / d) * 0.12; }
          p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.004;
          p.x += p.vx; p.y += p.vy;
          if (p.y > H + 6) { p.y = -6; p.x = Math.random() * W; }
          if (p.x < -6) p.x = W + 6; if (p.x > W + 6) p.x = -6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c + "," + (p.l ? 0.85 : 0.4) + ")";
        ctx.fill();
        if (p.l) { ctx.strokeStyle = "rgba(" + p.c + ",0.25)"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 34); ctx.stroke(); }
      });
    }
    size(); spawn();
    window.addEventListener("resize", function () { size(); spawn(); draw(); });
    window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    if (reduced) { draw(); return; }
    var raf, running = true;
    (function tick() { if (running) draw(); raf = requestAnimationFrame(tick); })();
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) tick(); else cancelAnimationFrame(raf);
    });
  })();

  if (reduced) return; // da qui: niente GSAP, aperture base via CSS

  /* ── Split hero title (caratteri, aria preservata) ── */
  function splitHero() {
    var h1 = qs(".fx-hero-title"); if (!h1 || h1.dataset.fxSplit) return;
    var text = h1.textContent.trim();
    h1.dataset.fxSplit = "1"; h1.setAttribute("aria-label", text); h1.textContent = "";
    text.split("").forEach(function (ch) {
      var m = document.createElement("span"); m.className = "fx-mask"; m.setAttribute("aria-hidden", "true");
      var s = document.createElement("span"); s.className = "fx-char"; s.textContent = ch === " " ? "\u00A0" : ch;
      m.appendChild(s); h1.appendChild(m);
    });
  }
  splitHero();

  /* Attesa GSAP completi (async, ordine non garantito): gsap + ScrollTrigger + Flip */
  var tries = 0;
  (function wait() {
    if (window.gsap && window.ScrollTrigger && window.Flip) { try { init(); } catch (e) {} return; }
    if (++tries > 60) { /* fallback: core solo — init gestisce i plugin mancanti */
      if (window.gsap) try { init(); } catch (e) {}
      return;
    }
    setTimeout(wait, 100);
  })();

  /* ── Aperture fullscreen (shared-element da card a pannello) ── */
  var aperture = qs(".fx-aperture"), panel = qs(".fx-aperture-panel"), closeBtn = qs(".fx-aperture-close");
  var lastCard = null, apertureOpen = false;
  function openAperture(card) {
    if (!aperture || !panel || !card) return;
    lastCard = card; apertureOpen = true;
    panel.innerHTML = "";
    var clone = card.cloneNode(true);
    clone.removeAttribute("id");
    clone.classList.add("is-open");
    var hint = clone.querySelector("[data-planet-toggle]");
    if (hint) { hint.setAttribute("aria-expanded", "true"); hint.textContent = "Nascondi i dettagli"; }
    panel.appendChild(clone);
    aperture.classList.add("open");
    document.body.style.overflow = "hidden";
    aperture.scrollTop = 0;
    var rect = card.getBoundingClientRect();
    if (hasGsap()) {
      var pr = panel.getBoundingClientRect();
      var sx = clamp(rect.width / pr.width, 0.05, 1), sy = clamp(rect.height / pr.height, 0.05, 1);
      var dx = rect.left - pr.left, dy = rect.top - pr.top;
      gsap.fromTo(panel, { scaleX: sx, scaleY: sy, x: dx, y: dy, transformOrigin: "top left", opacity: 0.6, borderRadius: "20px" },
        { scaleX: 1, scaleY: 1, x: 0, y: 0, opacity: 1, duration: 0.75, ease: "power4.inOut" });
      gsap.fromTo(".fx-aperture-back", { opacity: 0 }, { opacity: 1, duration: 0.4 });
      /* Fail-safe: se il ticker rAF è in pausa (tab inattivo), il pannello deve comunque atterrare */
      setTimeout(function () { if (apertureOpen && panel && hasGsap()) { gsap.killTweensOf(panel); gsap.set(panel, { clearProps: "transform,opacity" }); } }, 1000);
    }
    if (closeBtn) closeBtn.focus();
  }
  function closeAperture() {
    if (!apertureOpen) return;
    apertureOpen = false;
    var doneOnce = false;
    var done = function () {
      if (doneOnce) return; doneOnce = true;
      if (panel && hasGsap()) { gsap.killTweensOf(panel); gsap.set(panel, { clearProps: "transform,opacity" }); }
      aperture.classList.remove("open"); document.body.style.overflow = "";
    };
    setTimeout(done, 1200); /* fail-safe: la chiusura non deve mai bloccarsi */
    if (hasGsap() && lastCard && lastCard.isConnected) {
      var rect = lastCard.getBoundingClientRect();
      var pr = panel.getBoundingClientRect();
      var sx = clamp(rect.width / pr.width, 0.05, 1), sy = clamp(rect.height / pr.height, 0.05, 1);
      var dx = rect.left - pr.left, dy = rect.top - pr.top;
      gsap.to(panel, { scaleX: sx, scaleY: sy, x: dx, y: dy, transformOrigin: "top left", opacity: 0.5, duration: 0.55, ease: "power3.inOut", onComplete: done });
    } else done();
  }
  document.addEventListener("click", function (e) {
    var card = e.target.closest(".project-card, .featured-card");
    if (card && !e.target.closest("a,button,input,textarea") && !apertureOpen) openAperture(card);
    if (e.target.closest(".fx-aperture-close")) closeAperture();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAperture(); });
  if (aperture) aperture.addEventListener("click", function (e) { if (e.target.classList.contains("fx-aperture-back")) closeAperture(); });

  /* ── Categorie: tap espande (desktop usa hover/focus via CSS) ── */
  qsa(".category-block").forEach(function (b) {
    b.addEventListener("click", function (e) {
      if (e.target.closest("a,button")) return;
      b.classList.toggle("is-expanded");
    });
  });

  /* ── Menu: stagger link + curtain wipe su nav interna ── */
  var toggle = qs("[data-nav-toggle]"), menu = qs("[data-nav-menu]");
  if (toggle && menu) toggle.addEventListener("click", function () {
    if (!hasGsap()) return;
    setTimeout(function () {
      if (!menu.classList.contains("is-open")) return;
      gsap.fromTo(menu.querySelectorAll(":scope > a, :scope .nav-group"),
        { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06 });
    }, 60);
  });
  document.addEventListener("click", function (e) {
    var a = e.target.closest('.nav-links a[href^="#"], .fx-cta a[href^="#"]');
    if (!a || !hasGsap()) return;
    var target = qs(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    var curtain = qs(".fx-curtain");
    var go = function () { target.scrollIntoView({ behavior: "smooth" }); };
    if (curtain) {
      gsap.timeline()
        .to(curtain, { yPercent: 101, duration: 0.5, ease: "power3.inOut", onStart: function () { curtain.style.transform = "translateY(-101%)"; } })
        .add(go)
        .to(curtain, { yPercent: 202, duration: 0.5, ease: "power3.inOut" })
        .set(curtain, { yPercent: 0 });
    } else go();
  });

  function init() {
    var hasST = !!window.ScrollTrigger, hasFL = !!window.Flip;
    var plugins = [];
    if (hasST) plugins.push(window.ScrollTrigger);
    if (hasFL) plugins.push(window.Flip);
    if (plugins.length) gsap.registerPlugin(plugins);

    /* Hero: assemblaggio tipografia + scena ── */
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".fx-hero-title .fx-char", { yPercent: 120, rotateX: -70, opacity: 0, duration: 1.2, stagger: 0.04 }, 0.15)
      .from(".fx-hero-role, .fx-hero-lead, .fx-hero-actions, .fx-hero-meta", { y: 44, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.6)
      .from(".fx-hero-fig", { y: 80, opacity: 0, rotateY: 10, duration: 1.1 }, 0.5)
      .from(".fx-chip", { scale: 0, opacity: 0, duration: 0.7, ease: "back.out(2)", stagger: 0.12 }, 0.9)
      .from(".fx-hero-videos video", { clipPath: "inset(50% 0 50% 0)", opacity: 0, duration: 1.2, stagger: 0.2 }, 0.3);

    /* Hero mouse-3D: figura + chip + video (parallax differenziale) ── */
    if (finePointer) {
      var hero = qs(".fx-hero"), fig = qs(".fx-hero-fig");
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(fig, { rotateY: px * 10, rotateX: -py * 8, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
        gsap.to(".fx-chip.c1", { x: px * -34, y: py * -26, duration: 0.8 });
        gsap.to(".fx-chip.c2", { x: px * 40, y: py * 30, duration: 0.8 });
        gsap.to(".fx-chip.c3", { x: px * -24, y: py * 34, duration: 0.8 });
        gsap.to(".fx-hero-fig img", { x: px * -14, y: py * -12, scale: 1.06, duration: 0.8 });
        gsap.to(".fx-hero-videos video", { x: px * (20), duration: 1 });
      });
    }

    /* Magnetici ── */
    if (finePointer) qsa(".button, .fx-hero-actions a").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: clamp((e.clientX - r.left - r.width / 2) / (r.width / 2), -1, 1) * 8, y: clamp((e.clientY - r.top - r.height / 2) / (r.height / 2), -1, 1) * 7, duration: 0.4, ease: "power3.out" });
      });
      btn.addEventListener("pointerleave", function () { gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.5)" }); });
    });

    /* Marquee infinito ── */
    var track = qs(".fx-marquee-track");
    if (track) gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });

    /* Story: pannelli sticky che si comprimono/ruotano mentre arriva il successivo ── */
    if (hasST) qsa(".fx-panel").forEach(function (panelEl, i, arr) {
      if (i === arr.length - 1) return;
      gsap.to(panelEl, { scale: 0.9, rotate: -2, opacity: 0.55, borderRadius: "32px", ease: "none",
        scrollTrigger: { trigger: arr[i + 1], start: "top bottom", end: "top top+=120", scrub: true } });
    });
    /* Vero e proprio scroll-storytelling sugli heading giganti */
    if (hasST) qsa(".fx-h2").forEach(function (h) {
      gsap.from(h, { y: 90, opacity: 0, rotate: 2, duration: 1, ease: "power4.out",
        scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });

    /* Gruppi stagger ── */
    if (hasST) [[".fx-bento .fx-tile", 0.08], [".fx-featured .featured-card", 0.09], [".fx-grid .project-card", 0.06],
     [".fx-rail .category-block", 0.08], [".fx-kpi", 0.07], [".fx-journal article", 0.09], [".fx-cv-list li", 0.07]].forEach(function (cfg) {
      var items = qsa(cfg[0]);
      if (!items.length) return;
      gsap.from(items, { y: 60, opacity: 0, rotateX: 8, duration: 0.9, ease: "power3.out", stagger: cfg[1],
        scrollTrigger: { trigger: items[0], start: "top 88%", once: true } });
    });

    /* Pie: riempimento animato */
    if (hasST) qsa(".pie-fill").forEach(function (path) {
      var raw = path.getAttribute("stroke-dasharray") || "0,100";
      var pct = parseFloat(raw.split(",")[0]) || 0;
      path.setAttribute("stroke-dasharray", "0, 100");
      gsap.to(path, { strokeDasharray: pct + ", 100", duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: path, start: "top 90%", once: true } });
    });

    /* Contatori: pop scala */
    if (hasST) qsa("[data-count-to]").forEach(function (n) {
      gsap.from(n, { scale: 0.6, duration: 0.8, ease: "back.out(2)",
        scrollTrigger: { trigger: n, start: "top 90%", once: true } });
    });

    /* Filtro progetti: FLIP re-layout (stato catturato su pointerdown, prima di main.js) ── */
    if (hasFL) {
    var flipState = null;
    qsa("[data-filter]").forEach(function (btn) {
      btn.addEventListener("pointerdown", function () {
        if (window.Flip) flipState = Flip.getState("[data-project-card]:not(.is-hidden)");
      });
      btn.addEventListener("click", function () {
        if (!window.Flip || !flipState) return;
        Flip.from(flipState, { duration: 0.7, ease: "power3.inOut", absolute: true, stagger: 0.03, onComplete: function () { flipState = null; } });
      });
    });
    }

    /* Tilt lieve sulle card bento (pointer fine) */
    if (finePointer) {
      var tiltEls = qsa(".fx-tile");
      tiltEls.forEach(function (el) {
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          gsap.to(el, { rotateY: (px - 0.5) * 8, rotateX: (0.5 - py) * 8, transformPerspective: 800, duration: 0.4 });
        });
        el.addEventListener("pointerleave", function () { gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6 }); });
      });
    }
  }
})();
