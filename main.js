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

// Nuova funzione: estrae l'id dall'URL canonico /progetti/xxx.html
const getProjectIdFromUrl = () => {
  const path = window.location.pathname;
  // Match pattern /progetti/nome-progetto.html
  const match = path.match(/\/progetti\/([^\/]+)\.html$/);
  if (match) return decodeURIComponent(match[1]);
  // Fallback al vecchio ?id=
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

// Genera URL canonico per i link interni
const detailHref = (project) => `progetti/${encodeURIComponent(project.id)}.html`;

const categoryHref = (categoryKey) => fromRoot(categories[categoryKey]?.page || "index.html");

const getCategoryProjects = (categoryKey) =>
  projects.filter((project) => project.category === categoryKey);

const projectTypeLabel = {
  html: "Apri tool",
  jsx: "Apri sorgente",
  js: "Apri sorgente",
  zip: "Scarica asset",
};

const initTheme = () => {
  const toggle = qs("[data-theme-toggle]");
  const savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;

  const syncLabel = () => {
    if (toggle) {
      toggle.textContent = document.documentElement.dataset.theme === "dark" ? "Light" : "Dark";
      toggle.setAttribute("aria-label", `Attiva tema ${toggle.textContent.toLowerCase()}`);
    }
  };

  syncLabel();

  toggle?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
    syncLabel();
  });
};

const initNavigation = () => {
  const toggle = qs("[data-nav-toggle]");
  const menu = qs("[data-nav-menu]");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    menu.classList.toggle("is-open", !isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
    }
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
    { threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
};

const renderTagList = (items = []) =>
  items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

const renderProjectCard = (project, options = {}) => {
  const category = categories[project.category] || {};
  const typeClass = project.type === "html" ? "is-live" : "is-source";
  const directHref = fromRoot(project.url);

  return `
    <article class="project-card reveal ${typeClass}" data-project-card data-category="${escapeHtml(
    project.category
  )}" data-search="${escapeHtml(`${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase())}">
      <a class="project-preview" href="${detailHref(project)}" aria-label="Apri scheda ${escapeHtml(project.title)}">
        <span class="preview-topline"></span>
        <span class="preview-grid" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </span>
        <span class="preview-label">${escapeHtml(category.shortLabel || category.label || project.category)}</span>
      </a>
      <div class="project-card-body">
        <div class="project-card-meta">
          <span>${escapeHtml(category.label || project.category)}</span>
          <span>${escapeHtml(project.status)}</span>
        </div>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <ul class="tag-list" aria-label="Tag progetto">${renderTagList(project.tags.slice(0, options.compact ? 3 : 5))}</ul>
      </div>
      <div class="card-actions">
        <a class="button button-primary" href="${detailHref(project)}">Scheda tecnica</a>
        <a class="button button-ghost" href="${directHref}" target="_blank" rel="noopener">${projectTypeLabel[project.type] || "Apri"}</a>
      </div>
    </article>
  `;
};

const renderProjectLists = () => {
  qsa("[data-project-list]").forEach((mount) => {
    const category = mount.dataset.category || "all";
    const featuredOnly = mount.dataset.featured === "true";
    const limit = Number.parseInt(mount.dataset.limit || "0", 10);
    let list = category === "all" ? [...projects] : getCategoryProjects(category);

    if (featuredOnly) list = list.filter((project) => project.featured);
    if (limit > 0) list = list.slice(0, limit);

    mount.innerHTML = list.map((project) => renderProjectCard(project, { compact: category === "all" })).join("");
  });
};

const applyProjectFilters = () => {
  const activeFilter = qs("[data-filter].is-active")?.dataset.filter || "all";
  const searchValue = (qs("[data-project-search]")?.value || "").trim().toLowerCase();

  qsa("[data-project-card]").forEach((card) => {
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !searchValue || (card.dataset.search || "").includes(searchValue);
    card.classList.toggle("is-hidden", !(matchesFilter && matchesSearch));
  });
};

const initProjectFilters = () => {
  qsa("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      qsa("[data-filter]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      applyProjectFilters();
    });
  });

  qs("[data-project-search]")?.addEventListener("input", applyProjectFilters);
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

      const bounds = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      const width = Math.max(320, bounds.width);
      const height = Math.max(180, bounds.height || 220);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext("2d");

      ctx.scale(dpr, dpr);

    const css = getComputedStyle(document.documentElement);
    const line = css.getPropertyValue("--chart-line").trim() || "#c7a45b";
    const fill = css.getPropertyValue("--chart-fill").trim() || "rgba(199, 164, 91, 0.16)";
    const grid = css.getPropertyValue("--line").trim() || "rgba(255,255,255,0.14)";
    const text = css.getPropertyValue("--muted").trim() || "#9ba8a1";
    const data = [18, 29, 24, 42, 50, 47, 64, 72, 81, 76, 88, 96];
    const padding = 26;
    const max = Math.max(...data);
    const min = Math.min(...data);

    ctx.strokeStyle = grid;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      const y = padding + ((height - padding * 2) / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

const drawKpiCanvas = () => {

  requestAnimationFrame(() => {

    qsa("[data-kpi-canvas]").forEach((canvas) => {

      const ctx = canvas.getContext("2d");

      const bounds = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      const width = Math.max(320, bounds.width);
      const height = Math.max(180, bounds.height || 220);

      // evita resize inutili
      if (
        canvas.width !== width * dpr ||
        canvas.height !== height * dpr
      ) {

        canvas.width = width * dpr;
        canvas.height = height * dpr;

      }

      // reset transform matrix
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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

// Gestione navigazione interna con URL canonici (History API)
const initInternalNavigation = () => {
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;
    // Intercetta solo link interni che puntano a /progetti/... o alle pagine principali
    if (href.startsWith("/progetti/") && href.endsWith(".html")) {
      e.preventDefault();
      const url = new URL(href, window.location.origin);
      history.pushState({}, "", url.pathname);
      renderProjectDetail();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (href === "index.html" || href === "/" || href === "./") {
      // Gestione home per evitare ricariche complete (opzionale)
      // Lasciamo il comportamento default per semplicità
    }
  });

  // Gestione back/forward
  window.addEventListener("popstate", () => {
    renderProjectDetail();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  hydrateCategoryBlocks();
  renderProjectLists();
  renderProjectDetail();
  initProjectFilters();
  initReveal();
  initCounters();
  initFooter();
  drawKpiCanvas();
  initInternalNavigation();
  window.addEventListener("resize", drawKpiCanvas);
});
