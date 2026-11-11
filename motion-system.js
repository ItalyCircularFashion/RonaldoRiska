/* ── MOTION SYSTEM 2.0 (JS) ──
 * Implements effects 03, 06, 07, 08, 09, 11, 12, 13 from the PRATOTEXTILE spec.
 * Orchestrated by a single coordinator to avoid duplicate listeners.
 * Existing public API and site behaviour are preserved.
 */
(function (global, factory) {
  if (typeof define === "function" && define.amd) { define([], factory); }
  else if (typeof module !== "undefined") { module.exports = factory(); }
  else { global.motionSystem = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ── Coordinator ──────────────────────────────────────────────
  const Coordinator = {
    page: null,
    components: new Set(),
    effects: new Map(),       // effectId -> { init, destroy, active }
    breakpoint: 768,
    reducedMotion: false,
    webglReady: false,
    error: null,

    init() {
      this.page = document.querySelector("body").className;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.breakpoint = window.innerWidth <= 768 ? 0 : 768;

      // Reactive breakpoints
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          this.breakpoint = window.innerWidth <= 768 ? 0 : 768;
          this.updateTriggers();
        });
        ro.observe(document.body);
      }
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.pauseAll(); else this.resumeAll();
      });
      return this;
    },

    register(id, initFn) {
      this.effects.set(id, { init: initFn, active: false });
      return this;
    },

    async initEffect(id) {
      const effect = this.effects.get(id);
      if (!effect || effect.active) return;
      try {
        await effect.init();
        effect.active = true;
        if (this.error) this.error = null;
        console.log("[motion] effect ready:", id);
      } catch (err) {
        effect.active = false;
        this.error = err;
        console.warn("[motion] effect failed:", id, err);
      }
    },

    destroyEffect(id) {
      const effect = this.effects.get(id);
      if (effect && effect.active) {
        const d = effect.destroy || (() => {});
        d();
        effect.active = false;
      }
    },

    destroyAll() {
      for (const [id, effect] of this.effects) {
        if (effect.active) this.destroyEffect(id);
      }
    },

    pauseAll() {
      for (const [id, effect] of this.effects) {
        if (effect.active) {
          const d = effect.pause || (() => {});
          d();
        }
      }
    },

    resumeAll() {
      for (const [id, effect] of this.effects) {
        if (effect.active) {
          const r = effect.resume || (() => {});
          r();
        }
      }
    },

    updateTriggers() {
      // Called after layout changes (ResizeObserver). Subclasses override
      // per-effect to re-sync ScrollTrigger etc. Default is a no-op.
    },

    getReducedMotion() { return this.reducedMotion; },
    getBreakpoint() { return this.breakpoint; },
    getPage() { return this.page; },
    hasEffect(id) { return this.effects.has(id); },
  };

  // ── Helper: safe dispatch to a Three.js scene manager ──────
  function getSceneManager() {
    // Look for an existing scene manager in the global scope (e.g. flower-spiral)
    return globalThis.__Scena || null;
  }

  // ── Effect 03 — LOADER (loading / ready / error) ───────────
  function effectLoader() {
    let loadingEl = null;
    let state = "idle"; // idle | loading | ready | error

    const init = async () => {
      // Find or create a loader element
      let el = document.getElementById("pt-loader");
      if (!el) {
        el = document.createElement("div");
        el.id = "pt-loader";
        el.className = "pt-loader";
        el.setAttribute("role", "status");
        el.setAttribute("aria-live", "polite");
        el.textContent = "Caricamento…";
        document.body.appendChild(el);
      }
      loadingEl = el;

      // Listen for global loading events (if any)
      const onLoad = () => setLoading(true);
      const onReady = () => setReady();
      const onError = (err) => setError(err);

      // Hook into common loading patterns on this page
      const obs = new MutationObserver(() => {
        // no-op: loaders are typically toggled by other scripts
      });
      // Allow consumers to signal state via window.ptLoader
      if (!window.__ptLoader) {
        window.__ptLoader = {
          setLoading: (v) => setLoading(v),
          setReady: () => setReady(),
          setError: (e) => setError(e),
        };
      }

      // Initial: if any GLTFLoader/Three async load is in flight, show loader
      if (globalThis.__GLTFLoaders && globalThis.__GLTFLoaders.length) {
        setLoading(true);
      }

      return () => {
        // Cleanup
        if (loadingEl && loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
        loadingEl = null;
      };
    };

    function setLoading(v) {
      if (v) { state = "loading"; if (loadingEl) loadingEl.classList.add("pt-pulse"); }
      else if (state === "loading" || state === "error") { state = "ready"; if (loadingEl) loadingEl.classList.remove("pt-pulse"); }
    }
    function setReady() {
      state = "ready";
      if (loadingEl) loadingEl.classList.remove("pt-pulse");
    }
    function setError(err) {
      state = "error";
      if (loadingEl) {
        loadingEl.classList.remove("pt-pulse");
        loadingEl.textContent = "Caricamento fallito: " + (err && err.message ? err.message : "errore sconosciuto");
        loadingEl.classList.add("pt-pulse");
      }
      window.__ptLoader && window.__ptLoader.setError(err);
    }

    return { init, destroy: () => {}, pause: () => {}, resume: () => {} };
  }

  // ── Effect 06 — GSAP HORIZONTAL SCROLL ─────────────────────
  function effectHorizontalScroll() {
    if (!window.gsap || !window.ScrollTrigger) return async () => {};

    const section = document.querySelector(".textile-journey");
    if (!section) return async () => {};

    const track = section.querySelector(".textile-journey__track");
    if (!track) return async () => {};

    const getDistance = () => Math.max(0, track.scrollWidth - section.clientWidth);

    const distance = getDistance();
    if (distance === 0) return async () => {}; // nothing to scroll

    const tl = gsap.to(track, {
      x: () => -distance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${distance}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      }
    });

    // ResizeObserver
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        const d = getDistance();
        if (d !== distance) {
          distance = d;
          tl.scrollTrigger && tl.scrollTrigger.reload();
        }
      });
      ro.observe(section);
    }

    // Cleanup
    return () => {
      if (ro) ro.disconnect();
      if (tl) tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }

  // ── Effect 07 — PARALLAX MULTILAYER ────────────────────────
  function effectParallax() {
    if (!window.gsap || !window.ScrollTrigger) return async () => {};

    const sections = document.querySelectorAll(".parallax-section");
    if (!sections.length) return async () => {};

    const tweens = [];
    sections.forEach((sec) => {
      const bg = sec.querySelector(".parallax-background");
      const mid = sec.querySelector(".parallax-midground");
      const fg = sec.querySelector(".parallax-foreground");

      if (bg) {
        tweens.push(gsap.to(bg, {
          yPercent: -12, ease: "none",
          scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }
        }));
      }
      if (mid) {
        tweens.push(gsap.to(mid, {
          yPercent: -6, ease: "none",
          scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }
        }));
      }
      if (fg) {
        tweens.push(gsap.to(fg, {
          yPercent: 9, ease: "none",
          scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }
        }));
      }
    });

    return () => { tweens.forEach(t => t.kill()); };
  }

  // ── Effect 08 — TYPED TEXT (internal, no dependency) ──────
  function effectTyped() {
    if (window.Typed) return async () => {}; // Typed.js already present

    const el = document.getElementById("hero-typed");
    if (!el) return async () => {};

    const strings = [
      "Esplora il distretto tessile",
      "Scopri i materiali sostenibili",
      "Connettiti alla filiera",
    ];

    let i = 0;
    let currentIndex = 0;
    let isDeleting = false;
    let currentStr = "";
    let currentIdx = 0;

    const type = () => {
      const text = strings[i];
      const c = text.charAt(currentIdx++);
      if (c) {
        el.textContent = currentStr + c;
        currentStr = el.textContent;
        setTimeout(type, 45);
      } else {
        isDeleting = true;
        setTimeout(type, 24);
      }
    };

    const reset = () => {
      const text = strings[i];
      el.textContent = "";
      currentStr = "";
      currentIdx = 0;
      isDeleting = false;
      setTimeout(type, 1800);
    };

    const start = () => {
      el.textContent = "";
      i = 0;
      reset();
    };

    // Cycle: next string on arrow/right click or after loop
    const cycle = () => {
      i = (i + 1) % strings.length;
      reset();
    };

    el.addEventListener("click", cycle);

    // Initial run (run once before the loop, then loop)
    const loop = () => {
      start();
      // Reschedule if element removed (SPA route change)
    };
    loop();

    return () => {
      el.removeEventListener("click", cycle);
      // Reset to static text
      el.textContent = strings[0];
    };
  }

  // ── Effect 09 — STAGGERED REVEAL (GSAP) ───────────────────
  function effectStagger() {
    if (!window.gsap || !window.ScrollTrigger) return async () => {};

    const container = document.querySelector(".stagger-container");
    if (!container) return async () => {};

    // Use Flip for dynamic/dynamic-content scenarios — but here we use GSAP fromTo
    const tl = gsap.fromTo(
      ".stagger-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          once: true,
        },
      }
    );

    // Guard against duplicate triggers on dynamic content
    const origObserve = MutationObserver.prototype.observe;
    new MutationObserver(() => {
      const cards = container.querySelectorAll(".stagger-card");
      // Only initialise once
      if (cards.length && !tl.scrollTrigger) {
        // already handled by GSAP once
      }
    }).observe(container, { childList: true, subtree: true });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }

  // ── Effect 11 — SCROLL STORYTELLING ────────────────────────
  function effectStorytelling() {
    if (!window.gsap || !window.ScrollTrigger) return async () => {};

    const section = document.querySelector(".textile-story");
    if (!section) return async () => {};

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=2400",
        pin: true,
        scrub: 1,
      }
    });

    // Add steps to the timeline
    const steps = section.querySelectorAll(".story-step");
    steps.forEach((step, i) => {
      const opacity = i === 0 ? 0 : 1;
      const y = i === 0 ? 25 : 0;
      timeline.fromTo(
        step, { opacity, y },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    });

    // Shared progress state (consumed by other scenes, e.g. Three.js)
    const progress = () => {
      const progress = timeline.scrollTrigger ? timeline.scrollTrigger.progress : 0;
      globalThis.__storyProgress = Math.min(1, Math.max(0, progress));
      return globalThis.__storyProgress;
    };

    // Attach to timeline for refresh
    timeline.scrollTrigger && timeline.scrollTrigger.addEventListener("refresh", progress);

    // Cleanup
    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }

  // ── Effect 12 — MAGNETIC BUTTONS ───────────────────────────
  function effectMagnetic() {
    if (!window.gsap) return async () => {};

    const buttons = document.querySelectorAll(".magnetic-button");
    if (!buttons.length) return async () => {};

    buttons.forEach((btn) => {
      const moveX = gsap.quickTo(btn, "x", { duration: 0.35, ease: "power3.out" });
      const moveY = gsap.quickTo(btn, "y", { duration: 0.35, ease: "power3.out" });

      const onMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        moveX(x * 0.16);
        moveY(y * 0.16);
      };

      const onLeave = () => {
        moveX(0);
        moveY(0);
      };

      btn.addEventListener("pointermove", onMove);
      btn.addEventListener("pointerleave", onLeave);

      // Store for cleanup
      btn._magnetic = { onMove, onLeave, moveX, moveY };
    });

    return () => {
      buttons.forEach((btn) => {
        const m = btn._magnetic;
        if (m) {
          btn.removeEventListener("pointermove", m.onMove);
          btn.removeEventListener("pointerleave", m.onLeave);
          delete btn._magnetic;
        }
      });
    };
  }

  // ── Effect 13 — THREE.JS INTERACTIVE SHOWCASE ──────────────
  function effectThreeJs() {
    // Lazy: only run if Three.js is available
    if (typeof THREE === "undefined") return async () => {};

    const container = document.getElementById("three-showcase");
    if (!container) return async () => {};

    // Scene manager singleton to avoid duplicate instances
    let manager = globalThis.__ThreeManager;
    if (!manager) {
      manager = new ThreeShowcase(container);
      globalThis.__ThreeManager = manager;
    } else {
      // Reuse existing manager if it has a container
      manager = globalThis.__ThreeManager;
    }

    return () => {
      if (manager) manager.dispose();
    };
  }

  // ── Three.js Showcase class ────────────────────────────────
  class ThreeShowcase {
    constructor(container) {
      this.container = container;
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.controls = null;
      this.animations = [];
      this.objects = new Map(); // stable ids
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
      this.intersections = new Set();
      this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.init();
    }

    init() {
      const rect = this.container.getBoundingClientRect();
      this.resize(rect.width, rect.height);
      this.initScene();
      this.initCamera();
      this.initLights();
      this.initControls();
      this.initRaycasting();
      this.initObjects();
      this.beginRender();
    }

    initScene() {
      this.scene = new THREE.Scene();
      // Clear any default background so alpha shows through
      this.scene.background = new THREE.Color(0x000000);
    }

    initCamera() {
      this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 6);
    }

    initLights() {
      const ambient = new THREE.AmbientLight(0xffffff, 0.5);
      this.scene.add(ambient);
      const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
      this.scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 1);
      dir.position.set(2, 1, 3);
      this.scene.add(dir);
    }

    initControls() {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = 0.08;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 2;
      this.controls.maxDistance = 20;
      this.controls.target.set(0, 0, 0);
      this.controls.maxPolarAngle = Math.PI / 2;
      this.controls.minPolarAngle = 0;
    }

    initRaycasting() {
      this.renderer.domElement.addEventListener("pointermove", (e) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersections = this.raycaster.intersectObjects(
          Array.from(this.objects.values()), true
        );
        this.intersections = new Set(intersections.map(i => i.object));
      });
    }

    initObjects() {
      // Add a simple tessile-inspired mesh (a flat plane with a pattern)
      const geo = new THREE.PlaneGeometry(4, 4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xff2d6f,
        roughness: 0.4,
        metalness: 0.1,
        wireframe: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, 0, 0);
      this.objects.set("tessile-plane", mesh);
      this.scene.add(mesh);

      // Add a second object for raycast demonstration
      const geo2 = new THREE.SphereGeometry(0.8, 32, 32);
      const mat2 = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.3, metalness: 0.2 });
      const sphere = new THREE.Mesh(geo2, mat2);
      sphere.position.set(1.5, 0.5, 0);
      this.objects.set("tessile-sphere", sphere);
      this.scene.add(sphere);
    }

    beginRender() {
      const loop = () => {
        if (this.reduced) {
          // Skip heavy animation when reduced motion is on
        } else {
          this.controls && this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);

      // Expose for external scene consumption
      globalThis.__storyProgress = () => 0;
    }

    resize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.renderer.setSize(w, h);
      this.renderer.setPixelRatio(dpr);
      if (this.camera) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }
    }

    dispose() {
      cancelAnimationFrame(this._raf);
      this.controls && this.controls.dispose();
      if (this.renderer) {
        this.renderer.dispose();
      }
      // Clean up objects
      this.objects.forEach((obj) => {
        obj.geometry?.dispose();
        obj.material?.dispose();
      });
      this.objects.clear();
      // Remove from global
      try { delete globalThis.__ThreeManager; } catch (e) {}
    }
  }

  // ── Registration ────────────────────────────────────────────
  const coord = Coordinator;

  coord.register("loader", effectLoader());
  coord.register("horizontal-scroll", effectHorizontalScroll());
  coord.register("parallax", effectParallax());
  coord.register("typed", effectTyped());
  coord.register("stagger", effectStagger());
  coord.register("storytelling", effectStorytelling());
  coord.register("magnetic", effectMagnetic());
  coord.register("threejs", effectThreeJs());

  // ── Boot ────────────────────────────────────────────────────
  const boot = async () => {
    await coord.init();

    // Initialise effects (in priority order)
    const effectOrder = [
      "loader", "horizontal-scroll", "parallax", "typed",
      "stagger", "storytelling", "magnetic", "threejs"
    ];
    for (const id of effectOrder) {
      if (coord.hasEffect(id)) {
        await coord.initEffect(id);
      }
    }
  };

  // If GSAP/Three are not loaded yet, wait briefly then fallback
  if (window.gsap && window.THREE) {
    boot().catch(console.error);
  } else {
    // Fallback: GSAP/CDN may still be loading async
    const raf = setInterval(() => {
      if (window.gsap && window.THREE) {
        clearInterval(raf);
        boot().catch(console.error);
      }
    }, 100);
    setTimeout(() => clearInterval(raf), 3000);
  }

  return Coordinator;
});
