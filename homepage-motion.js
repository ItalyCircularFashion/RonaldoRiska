/* Homepage experimental — motion layer (GSAP + ScrollTrigger, progressive enhancement)
   Senza GSAP o con prefers-reduced-motion: nessun nascondimento, solo micro-interazioni CSS/JS leggere. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined";
  var qs = function (s, c) { return (c || document).querySelector(s); };
  var qsa = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  document.body.classList.add("page-home");
  document.body.dataset.hpPointer = finePointer ? "fine" : "coarse";

  /* ── Scroll progress (rAF, indipendente da GSAP) ── */
  var progress = qs(".hp-progress");
  if (progress && !reduced) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        progress.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Cursor glow (lerp, solo pointer fine) ── */
  var cursor = qs(".hp-cursor");
  if (cursor && finePointer && !reduced) {
    var cx = -400, cy = -400, tx = cx, ty = cy;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      cursor.style.transform = "translate(" + cx + "px," + cy + "px)";
      requestAnimationFrame(loop);
    })();
  }

  if (reduced) return; // da qui in poi: solo CSS + reveal esistente di main.js

  /* ── Split typography: hero h1 (caratteri), headings (parole), aria preservata ── */
  function splitInto(el, mode) {
    if (!el || el.dataset.hpSplit) return;
    var text = el.textContent.trim();
    el.dataset.hpSplit = "1";
    el.setAttribute("aria-label", text);
    el.textContent = "";
    var parts = mode === "char" ? text.split("") : text.split(/\s+/);
    parts.forEach(function (part, i) {
      var mask = document.createElement("span");
      mask.className = "hp-mask"; mask.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = mode === "char" ? "hp-char" : "hp-word";
      inner.textContent = part;
      mask.appendChild(inner); el.appendChild(mask);
      if (i < parts.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }
  splitInto(qs(".hero h1"), "char");
  qsa(".hero-role").forEach(function (el) { splitInto(el, "word"); });
  qsa(".section-heading h2, .metrics-heading h2, .lca-hero-content h2, .contact-section h2, .dashboard-grid h2").forEach(function (el) { splitInto(el, "word"); });

  /* ── Magnetic buttons ── */
  if (finePointer) {
    qsa(".hero-actions .button, .lca-actions .button, .category-cta, .button-primary").forEach(function (btn) {
      if (btn.dataset.hpMag) return; btn.dataset.hpMag = "1";
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = clamp((e.clientX - r.left - r.width / 2) / (r.width / 2), -1, 1) * 7;
        var y = clamp((e.clientY - r.top - r.height / 2) / (r.height / 2), -1, 1) * 7;
        if (hasGsap) gsap.to(btn, { x: x, y: y, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        else btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        if (hasGsap) gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.5)" });
        else btn.style.transform = "";
      });
    });
  }

  /* ── Tilt 3D + spotlight (delegato: copre anche le card renderizzate da main.js) ── */
  var TILT = ".hero-visual, .lca-visual-card, .contact-panel, .featured-card, .project-card";
  function bindTilt(el) {
    if (!finePointer || el.dataset.hpTilt) return;
    el.dataset.hpTilt = "1";
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (px * 100) + "%");
      el.style.setProperty("--my", (py * 100) + "%");
      var rx = (0.5 - py) * 7, ry = (px - 0.5) * 9;
      el.style.transform = "perspective(900px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
    });
    el.addEventListener("pointerleave", function () { el.style.transform = ""; });
  }
  function bindAllTilt() { qsa(TILT).forEach(bindTilt); }

  /* ── Categorie: tap/click alterna espansione (oltre hover) ── */
  qsa(".category-block").forEach(function (block) {
    block.addEventListener("click", function (e) {
      if (e.target.closest("a, button")) return;
      block.classList.toggle("is-expanded");
    });
  });

  /* ── Filtri progetti: animazione di ingresso delle card visibili ── */
  qsa("[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!hasGsap) return;
      requestAnimationFrame(function () {
        var visible = qsa("[data-project-card]:not(.is-hidden)");
        if (visible.length) gsap.fromTo(visible,
          { y: 26, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", stagger: 0.05, clearProps: "transform,opacity" });
      });
    });
  });

  /* ── GSAP ScrollTrigger: hero, parallax, reveal, pie ── */
  function initGsap() {
    if (!hasGsap || typeof window.ScrollTrigger === "undefined") return;
    gsap.registerPlugin(window.ScrollTrigger);

    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero h1 .hp-char", { yPercent: 115, rotateX: -55, opacity: 0, duration: 1.1, stagger: 0.035 }, 0.1)
      .from(".hero-role .hp-word", { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.04 }, 0.45)
      .from(".hero .eyebrow, .hero .lead, .hero-actions, .hero-meta", { y: 34, opacity: 0, duration: 0.85, stagger: 0.09 }, 0.55)
      .from(".hero-visual", { y: 60, opacity: 0, rotateY: 8, duration: 1.1 }, 0.4)
      .from(".hero-video", { opacity: 0, scale: 1.15, duration: 1.2, stagger: 0.15 }, 0.3);

    /* Parallax multilivello (desktop; su mobile resta una leggera oscillazione) */
    qsa(".hero-visual img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    });
    qsa(".hero-video").forEach(function (v, i) {
      gsap.to(v, { yPercent: i === 0 ? -14 : 14, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    });
    qsa(".lca-hero-visual, .intel-block, .contact-panel").forEach(function (el) {
      gsap.fromTo(el, { y: 40 }, { y: -30, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* Reveal cinematografico per headings (parole) */
    qsa(".section-heading h2 .hp-word, .metrics-heading h2 .hp-word, .lca-hero-content h2 .hp-word, .contact-section h2 .hp-word, .dashboard-grid h2 .hp-word")
      .forEach(function (word) {
        gsap.from(word, { yPercent: 110, opacity: 0, duration: 0.8, ease: "power4.out",
          scrollTrigger: { trigger: word, start: "top 88%", once: true } });
      });

    /* Gruppi stagger per sezione */
    [[".metrics-dashboard .metric-card", 0.08], [".featured-grid .featured-card", 0.1],
     [".categories-stack .category-block", 0.08], [".kpi-pie-row .kpi-pie", 0.08],
     [".process-list li", 0.07], [".contact-tags span", 0.05]].forEach(function (cfg) {
      var items = qsa(cfg[0]);
      if (!items.length) return;
      gsap.from(items, { y: 48, opacity: 0, rotateX: 6, duration: 0.9, ease: "power3.out", stagger: cfg[1],
        scrollTrigger: { trigger: items[0], start: "top 86%", once: true } });
    });

    /* KPI pie: riempimento animato allo scroll */
    qsa(".pie-fill").forEach(function (path) {
      var raw = path.getAttribute("stroke-dasharray") || "0,100";
      var pct = parseFloat(raw.split(",")[0]) || 0;
      path.setAttribute("stroke-dasharray", "0, 100");
      gsap.to(path, { strokeDasharray: pct + ", 100", duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: path, start: "top 88%", once: true } });
    });
  }

  function boot() { bindAllTilt(); initGsap(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  /* GSAP è async: se non è ancora arrivato, attendi (max ~4s) poi inizializza */
  if (hasGsap) { /* già presente */ } else {
    var tries = 0;
    var poll = setInterval(function () {
      tries++;
      if (typeof window.gsap !== "undefined") { hasGsap = true; clearInterval(poll); initGsap(); }
      else if (tries > 40) clearInterval(poll);
    }, 100);
  }
  /* Le card progetti/featured sono renderizzate da main.js: ribinda quando arrivano */
  new MutationObserver(function () { bindAllTilt(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
