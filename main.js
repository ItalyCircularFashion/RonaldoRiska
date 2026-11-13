const categories = window.portfolioCategories || {};
const projects = window.portfolioProjects || [];

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const fromRoot = (path = "") => path;

const getProjectIdFromUrl = () => {
  const savedPath = sessionStorage.getItem('redirectPath');
  if (savedPath) {
    sessionStorage.removeItem('redirectPath');
    const match = savedPath.match(/\/progetti\/([^\/]+)\.html$/);
    if (match) return decodeURIComponent(match[1]);
  }
  const path = window.location.pathname;
  const match = path.match(/\/progetti\/([^\/]+)\.html$/);
  if (match) return decodeURIComponent(match[1]);
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

// Genera URL canonico per i link interni
const detailHref = (project) => project.url;

const categoryHref = (categoryKey) => fromRoot(categories[categoryKey]?.page || "index.html");

const getCategoryProjects = (categoryKey) =>
  projects.filter((project) => project.category === categoryKey);

const projectTypeLabel = {
  html: "Apri tool",
  jsx: "Apri sorgente",
  js: "Apri sorgente",
  zip: "Scarica asset",
};

const initNavigation = () => {
  const trigger = document.querySelector(".mobile-sidebar-trigger");
  const sidebar = document.getElementById("mobile-sidebar");
  const overlay = document.querySelector(".topbar-sidebar-overlay");

  if (trigger && sidebar) {
    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!isOpen));
      sidebar.classList.toggle("is-open", !isOpen);
      if (overlay) {
        overlay.classList.toggle("is-visible", !isOpen);
      }
    });

    if (overlay) {
      overlay.addEventListener("click", () => {
        if (sidebar.classList.contains("is-open")) {
          trigger.setAttribute("aria-expanded", "false");
          sidebar.classList.remove("is-open");
          overlay.classList.remove("is-visible");
        }
      });
    }
  }

  // Close mobile sidebar on link click
  document.querySelectorAll(".mobile-sidebar-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      const trigger = document.querySelector(".mobile-sidebar-trigger");
      const sidebar = document.getElementById("mobile-sidebar");
      const overlay = document.querySelector(".topbar-sidebar-overlay");
      if (sidebar && sidebar.classList.contains("is-open")) {
        trigger?.setAttribute("aria-expanded", "false");
        sidebar.classList.remove("is-open");
        overlay?.classList.remove("is-visible");
      }
    });
  });
};

const initReveal = () => {
  const items = qsa(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
  );

  items.forEach((item) => observer.observe(item));
};

const renderTagList = (items = []) =>
  items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

const renderProjectCard = (project, options = {}) => {
  const category = categories[project.category] || {};
  const typeClass = project.type === "html" ? "is-live" : "is-source";
  const statusClass = project.status === "Live" ? "is-status-live" : "is-status-draft";
  const directHref = fromRoot(project.url);
  const schedaHref = project.detailPage ? project.detailPage : detailHref(project);
  const headingTag = options.heading || "h3";
  const initial = (category.shortLabel || category.label || project.category || "?").trim().charAt(0).toUpperCase();

  return `
    <article class="project-card planet-card reveal ${typeClass} ${statusClass}" data-project-card data-category="${escapeHtml(
    project.category
  )}" data-search="${escapeHtml(`${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase())}">
      <a class="planet-sphere planet-sphere--${escapeHtml(project.category)}" href="${schedaHref}" aria-label="Apri scheda ${escapeHtml(project.title)}">
        <span class="planet-orbit" aria-hidden="true"></span>
        <span class="planet-initial" aria-hidden="true">${escapeHtml(initial)}</span>
        <${headingTag} class="planet-title">${escapeHtml(project.title)}</${headingTag}>
      </a>
      <p class="planet-status"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(project.status)} · ${escapeHtml(category.label || project.category)}</p>
      <button class="planet-hint-btn" type="button" data-planet-toggle aria-expanded="false" aria-controls="planet-details-${escapeHtml(project.id)}">Scopri i dettagli</button>
      <div class="planet-details" id="planet-details-${escapeHtml(project.id)}">
        <p>${escapeHtml(project.description)}</p>
        <ul class="tag-list" aria-label="Tag progetto">${renderTagList(project.tags.slice(0, 5))}</ul>
        <div class="card-actions">
          <a class="button button-primary" href="${schedaHref}" aria-label="Scheda tecnica di ${escapeHtml(project.title)}">Scheda tecnica</a>
          <a class="button button-ghost" href="${directHref}" target="_blank" rel="noopener" aria-label="${escapeHtml(projectTypeLabel[project.type] || "Apri")} — ${escapeHtml(project.title)}">${projectTypeLabel[project.type] || "Apri"}</a>
        </div>
      </div>
    </article>
  `;
};

const renderProjectLists = () => {
  if (!projects.length) return;

  const groupsMount = qs("[data-project-groups]");
  if (groupsMount) {
    const groupOrder = ["tessitura", "cad", "supply"];
    groupsMount.innerHTML = groupOrder
      .map((key) => {
        const category = categories[key] || {};
        const list = getCategoryProjects(key);
        if (!list.length) return "";
        return `
          <section class="project-constellation" data-constellation="${escapeHtml(key)}" aria-labelledby="constellation-${escapeHtml(key)}">
            <header class="constellation-head">
              <p class="eyebrow">${escapeHtml(category.tone || category.label || key)}</p>
              <h3 id="constellation-${escapeHtml(key)}">${escapeHtml(category.label || key)} <span class="constellation-count">${list.length}</span></h3>
              <p>${escapeHtml(category.summary || "")}</p>
            </header>
            <div class="project-grid planet-grid">${list.map((project) => renderProjectCard(project, { heading: "h4" })).join("")}</div>
          </section>`;
      })
      .join("");
  }

  qsa("[data-project-list]").forEach((mount) => {
    const category = mount.dataset.category || "all";
    const featuredOnly = mount.dataset.featured === "true";
    const limit = Number.parseInt(mount.dataset.limit || "0", 10);
    let list = category === "all" ? [...projects] : getCategoryProjects(category);

    if (featuredOnly) list = list.filter((project) => project.featured);
    if (limit > 0) list = list.slice(0, limit);

    mount.innerHTML = list.map((project) => renderProjectCard(project, {})).join("");
  });
};

const renderFeaturedProjects = () => {
  const mount = qs("[data-featured-grid]");
  if (!mount || !projects.length) return;
  const featured = projects.filter((project) => project.featured);
  if (!featured.length) return;
  mount.innerHTML = featured
    .map((project) => {
      const category = categories[project.category] || {};
      const statusClass = project.status === "Live" ? "is-status-live" : "is-status-draft";
      const directHref = fromRoot(project.url);
      const schedaHref = project.detailPage ? project.detailPage : detailHref(project);
      return `
    <article class="featured-card project-card reveal ${statusClass}">
      <p class="planet-status"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(project.status)} \u00b7 ${escapeHtml(category.label || project.category)}</p>
      <h3 class="planet-title"><a href="${escapeHtml(schedaHref)}" aria-label="Apri scheda ${escapeHtml(project.title)}">${escapeHtml(project.title)}</a></h3>
      <p class="featured-desc">${escapeHtml(project.description)}</p>
      <ul class="tag-list" aria-label="Tag progetto">${renderTagList(project.tags.slice(0, 4))}</ul>
      <div class="featured-actions">
        <a class="button button-primary" href="${escapeHtml(directHref)}">Apri tool</a>
        <a class="button button-ghost" href="${escapeHtml(schedaHref)}">Scheda tecnica</a>
      </div>
    </article>`;
    })
    .join("");
};

const applyProjectFilters = () => {
  const activeFilter = qs("[data-filter].is-active")?.dataset.filter || "all";
  const searchValue = (qs("[data-project-search]")?.value || "").trim().toLowerCase();

  qsa("[data-project-card]").forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !searchValue || (card.dataset.search || "").includes(searchValue);
    card.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
  });

  qsa("[data-constellation]").forEach((group) => {
    const hasVisible = qsa("[data-project-card]", group).some((card) => !card.classList.contains("is-hidden"));
    group.classList.toggle("is-hidden", !hasVisible);
    group.hidden = !hasVisible;
  });

  const totalVisible = qsa("[data-project-card]:not(.is-hidden)").length;
  const emptyEl = qs("[data-project-empty]");
  if (emptyEl) {
    emptyEl.classList.toggle("is-hidden", totalVisible > 0);
    emptyEl.hidden = totalVisible > 0;
  }
};

const initProjectFilters = () => {
  qsa("[data-filter]").forEach((button) => {
    const filterKey = button.dataset.filter;
    const count = filterKey === "all" ? projects.length : getCategoryProjects(filterKey).length;
    const countEl = qs("[data-filter-count]", button);
    if (countEl) countEl.textContent = String(count);
    button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
    button.addEventListener("click", () => {
      qsa("[data-filter]").forEach((item) => {
        item.classList.remove("is-active");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
      applyProjectFilters();
    });
  });

  qs("[data-project-search]")?.addEventListener("input", applyProjectFilters);

  qs("[data-project-reset]")?.addEventListener("click", () => {
    const searchInput = qs("[data-project-search]");
    if (searchInput) searchInput.value = "";
    qsa("[data-filter]").forEach((item) => {
      const isAll = item.dataset.filter === "all";
      item.classList.toggle("is-active", isAll);
      item.setAttribute("aria-pressed", isAll ? "true" : "false");
    });
    applyProjectFilters();
  });

  qsa("[data-planet-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const card = toggle.closest("[data-project-card]");
      if (!card) return;
      const isOpen = card.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.textContent = isOpen ? "Nascondi i dettagli" : "Scopri i dettagli";
    });
  });

  applyProjectFilters();
};

const hydrateCategoryBlocks = () => {
  qsa("[data-category-card]").forEach((card) => {
    const categoryKey = card.dataset.categoryCard;
    const category = categories[categoryKey];
    if (!category) return;

    qs("[data-category-title]", card).textContent = category.label;
    qs("[data-category-summary]", card).textContent = category.summary;
    qs("[data-category-tone]", card).textContent = category.tone;
    qs("[data-category-link]", card).setAttribute("href", categoryHref(categoryKey));
    qs("[data-category-count]", card).textContent = String(getCategoryProjects(categoryKey).length);
  });

  qsa("[data-category-page-title]").forEach((node) => {
    const category = categories[document.body.dataset.categoryPage];
    if (category) node.textContent = category.label;
  });

  qsa("[data-category-page-summary]").forEach((node) => {
    const category = categories[document.body.dataset.categoryPage];
    if (category) node.textContent = category.summary;
  });

  qsa("[data-category-page-tone]").forEach((node) => {
    const category = categories[document.body.dataset.categoryPage];
    if (category) node.textContent = category.tone;
  });
};

const renderProjectDetail = () => {
  const mount = qs("[data-project-detail]");
  if (!mount) return;

  const projectId = getProjectIdFromUrl();
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    document.title = "Progetto non trovato | Ronaldo Riska";
    mount.innerHTML = `
      <section class="section">
        <div class="container narrow">
          <p class="eyebrow">Scheda progetto</p>
          <h1>Progetto non trovato</h1>
          <p class="lead">Il link non corrisponde a un progetto registrato nel portfolio.</p>
          <a class="button button-primary" href="../index.html#progetti">Torna ai progetti</a>
        </div>
      </section>
    `;
    return;
  }

  const category = categories[project.category] || {};
  const directHref = fromRoot(project.url);
  const related = getCategoryProjects(project.category)
    .filter((item) => item.id !== project.id)
    .slice(0, 3);

  document.title = `${project.title} | Ronaldo Riska Portfolio`;

  mount.innerHTML = `
    <section class="project-hero section">
      <div class="container project-hero-grid">
        <div class="reveal">
          <p class="eyebrow">${escapeHtml(category.label || project.category)}</p>
          <h1>${escapeHtml(project.title)}</h1>
          <p class="lead">${escapeHtml(project.description)}</p>
          <div class="hero-actions">
            <a class="button button-primary" href="${directHref}" target="_blank" rel="noopener">${projectTypeLabel[project.type] || "Apri progetto"}</a>
            <a class="button button-secondary" href="${categoryHref(project.category)}">Torna alla categoria</a>
          </div>
        </div>
        <aside class="project-facts reveal" aria-label="Dati progetto">
          <dl>
            <div><dt>Stato</dt><dd>${escapeHtml(project.status)}</dd></div>
            <div><dt>Categoria</dt><dd>${escapeHtml(category.label || project.category)}</dd></div>
            <div><dt>Formato</dt><dd>${escapeHtml(project.type.toUpperCase())}</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="section section-tight">
      <div class="container project-analysis">
        <article class="analysis-panel reveal">
          <p class="eyebrow">Valore professionale</p>
          <h2>Che cosa dimostra</h2>
          <p>${escapeHtml(project.value)}</p>
        </article>
        <article class="analysis-panel reveal">
          <p class="eyebrow">Stack</p>
          <h2>Tecnologie e output</h2>
          <ul class="tag-list">${renderTagList(project.stack)}</ul>
          <ul class="check-list">${renderTagList(project.deliverables)}</ul>
        </article>
      </div>
    </section>

    <section class="section section-tight">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">${project.type === "html" ? "Preview interattiva" : "Asset sorgente"}</p>
          <h2>${project.type === "html" ? "Progetto embeddato" : "Modulo collegato"}</h2>
        </div>
        ${
          project.type === "html"
            ? `<div class="project-frame-shell reveal"><iframe src="${directHref}" title="${escapeHtml(project.title)}" loading="lazy"></iframe></div>`
            : `<div class="source-panel reveal">
                <p>Questo elemento e' un prototipo sorgente. Aprilo per ispezionare il codice e valutarne architettura, componenti e logica applicativa.</p>
                <a class="button button-primary" href="${directHref}" target="_blank" rel="noopener">Apri file sorgente</a>
              </div>`
        }
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">Progetti collegati</p>
          <h2>Altri moduli ${escapeHtml(category.label || "")}</h2>
        </div>
        <div class="project-grid">${related.map((item) => renderProjectCard(item, { compact: true })).join("")}</div>
      </div>
    </section>
  `;
};


const drawKpiCanvas = () => {

  requestAnimationFrame(() => {

    qsa("[data-kpi-canvas]").forEach((canvas) => {

      const ctx = canvas.getContext("2d");

      const bounds = canvas.getBoundingClientRect();

      // Cap devicePixelRatio at 1 for performance (1x is sufficient for UI)
      const dpr = Math.min(window.devicePixelRatio || 1, 1);

      const width = Math.max(320, bounds.width);
      const height = Math.max(180, bounds.height || 220);

      // evita resize inutili
      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
      }

      // reset transform matrix (1x scale, dpr capped at 1)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const css = getComputedStyle(document.documentElement);

      const line =
        css.getPropertyValue("--chart-line").trim() ||
        "#c7a45b";

      const fill =
        css.getPropertyValue("--chart-fill").trim() ||
        "rgba(199, 164, 91, 0.16)";

      const grid =
        css.getPropertyValue("--line").trim() ||
        "rgba(255,255,255,0.14)";

      const text =
        css.getPropertyValue("--muted").trim() ||
        "#9ba8a1";

      const data = [18, 29, 24, 42, 50, 47, 64, 72, 81, 76, 88, 96];

      const padding = 26;

      const max = Math.max(...data);
      const min = Math.min(...data);

      // grid
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;

      for (let i = 0; i < 4; i += 1) {

        const y =
          padding +
          ((height - padding * 2) / 3) * i;

        ctx.beginPath();

        ctx.moveTo(padding, y);

        ctx.lineTo(width - padding, y);

        ctx.stroke();

      }

      // points
      const points = data.map((value, index) => {

        const x =
          padding +
          ((width - padding * 2) / (data.length - 1)) *
          index;

        const y =
          height -
          padding -
          ((value - min) / (max - min)) *
          (height - padding * 2);

        return { x, y };

      });

      // fill area
      ctx.beginPath();

      points.forEach((point, index) => {

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }

      });

      ctx.lineTo(
        points[points.length - 1].x,
        height - padding
      );

      ctx.lineTo(
        points[0].x,
        height - padding
      );

      ctx.closePath();

      ctx.fillStyle = fill;

      ctx.fill();

      // line
      ctx.beginPath();

      points.forEach((point, index) => {

        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }

      });

      ctx.strokeStyle = line;

      ctx.lineWidth = 3;

      ctx.stroke();

      // dots
      points.forEach((point) => {

        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          4,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = line;

        ctx.fill();

      });

      // labels
      ctx.fillStyle = text;

      ctx.font =
        "700 12px Inter, system-ui, sans-serif";

      ctx.fillText(
        "Digital maturity index",
        padding,
        padding - 8
      );

      ctx.fillText(
        "Tooling + analytics + textile process",
        padding,
        height - 8
      );

    });

  });

};

const initCounters = () => {
  qsa("[data-count-to]").forEach((node) => {
    const target = Number.parseInt(node.dataset.countTo || "0", 10);
    const suffix = node.dataset.suffix || "";
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = window.setInterval(() => {
      current = Math.min(target, current + step);
      node.textContent = `${current}${suffix}`;
      if (current >= target) window.clearInterval(timer);
    }, 28);
  });
};

const initFooter = () => {
  qsa("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
};

// Gestione navigazione interna - DISABILITATA
// I link ora portano direttamente ai file HTML dei tools
const initInternalNavigation = () => {
  // Non intercettiamo più i link - ogni tool ha il suo file HTML
  // La navigazione è gestita normalmente dal browser
};



document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  hydrateCategoryBlocks();
  renderProjectLists();
  renderFeaturedProjects();
  initProjectFilters();
  initReveal();
  initCounters();
  initFooter();
  drawKpiCanvas();
  window.addEventListener("resize", drawKpiCanvas);
  initHeroVideos();
});

// Video hero: se l'utente preferisce meno movimento, restano fermi (primo frame) invece di autoplay.
function initHeroVideos() {
  const videos = document.querySelectorAll(".hero-video");
  if (!videos.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videos.forEach((v) => {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }
}


