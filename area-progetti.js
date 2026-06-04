/**
 * area-progetti.js
 * Modulo condiviso per le pagine area (tessitura, cad-moda, supply-chain).
 * Carica progetti.json, filtra per area, renderizza card e aggiorna contatori homepage.
 *
 * USO: includi in fondo a ogni pagina area con:
 *   <script src="js/area-progetti.js" data-area="tessitura"></script>
 *   <script src="js/area-progetti.js" data-area="cad-moda"></script>
 *   <script src="js/area-progetti.js" data-area="supply-chain"></script>
 *
 * Nella pagina ci deve essere un elemento con id="lista-progetti"
 */

(function () {
  const TIPO_ICONS = {
    dashboard: "📊",
    simulator: "🔬",
    tool:      "🔧",
    platform:  "🏗️",
    cad:       "📐",
    "ai-tool": "🤖",
  };
  const TIPO_LABELS = {
    dashboard: "Dashboard",
    simulator: "Simulatore",
    tool:      "Tool",
    platform:  "Platform",
    cad:       "CAD",
    "ai-tool": "AI Tool",
  };

  // Rileva area dal data-area dello script, oppure dall'URL
  function detectArea() {
    const me = document.currentScript || document.querySelector('script[data-area]');
    if (me && me.dataset.area) return me.dataset.area;
    const path = window.location.pathname;
    if (path.includes("tessitura"))     return "tessitura";
    if (path.includes("cad-moda"))      return "cad-moda";
    if (path.includes("supply-chain"))  return "supply-chain";
    return null;
  }

  function buildCard(p) {
    const icon  = TIPO_ICONS[p.tipo]   || "📁";
    const tipo  = TIPO_LABELS[p.tipo]  || p.tipo;
    const tagsHtml = (p.tags || []).slice(0, 4)
      .map(t => `<span class="prog-tag">${t}</span>`).join("");
    const highlightClass = p.highlight ? " prog-card--highlight" : "";

    return `
      <article class="prog-card${highlightClass}" data-tipo="${p.tipo}">
        <div class="prog-card__header">
          <span class="prog-icon">${icon}</span>
          <div class="prog-meta">
            <span class="prog-tipo">${tipo}</span>
            ${p.stato === "live" ? '<span class="prog-live">● Live</span>' : ""}
            <span class="prog-anno">${p.anno}</span>
          </div>
        </div>
        <h3 class="prog-nome">${p.nome}</h3>
        <p class="prog-sub">${p.sottotitolo || ""}</p>
        <p class="prog-desc">${(p.descrizione || "").slice(0, 140)}…</p>
        <div class="prog-tags">${tagsHtml}</div>
        <div class="prog-actions">
          ${p.scheda
            ? `<a class="prog-btn prog-btn--outline" href="${p.scheda}">Scheda tecnica</a>`
            : ""}
          ${p.link
            ? `<a class="prog-btn prog-btn--primary" href="${p.link}">${p.linkLabel || "Apri"} →</a>`
            : ""}
        </div>
      </article>
    `;
  }

  function injectStyles() {
    if (document.getElementById("_ap_styles")) return;
    const style = document.createElement("style");
    style.id = "_ap_styles";
    style.textContent = `
      /* ── GRIGLIA PROGETTI ── */
      #lista-progetti{
        display:grid;
        grid-template-columns:repeat(auto-fill,minmax(290px,1fr));
        gap:20px;
        padding:8px 0 32px;
      }

      /* ── CARD ── */
      .prog-card{
        background:#0f1a12;
        border:1px solid rgba(255,255,255,0.08);
        border-radius:12px;
        padding:20px 22px 18px;
        display:flex;
        flex-direction:column;
        gap:10px;
        transition:border-color .18s,transform .18s;
      }
      .prog-card:hover{
        border-color:rgba(201,168,76,0.35);
        transform:translateY(-2px);
      }
      .prog-card--highlight{
        border-color:rgba(201,168,76,0.25);
        background:linear-gradient(135deg,rgba(201,168,76,0.06),#0f1a12);
      }

      /* ── HEADER ── */
      .prog-card__header{
        display:flex;
        align-items:center;
        gap:10px;
      }
      .prog-icon{font-size:22px;flex-shrink:0}
      .prog-meta{
        display:flex;
        align-items:center;
        gap:7px;
        flex-wrap:wrap;
      }
      .prog-tipo{
        font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;
        color:#2ec4a0;font-family:'JetBrains Mono',monospace;
      }
      .prog-live{
        font-size:10px;font-weight:600;color:#3db87a;
        font-family:'JetBrains Mono',monospace;
      }
      .prog-anno{
        font-size:10px;color:rgba(238,242,238,0.3);
        font-family:'JetBrains Mono',monospace;margin-left:auto;
      }

      /* ── TESTI ── */
      .prog-nome{
        font-size:17px;font-weight:700;
        color:#eef2ee;letter-spacing:-.3px;line-height:1.2;
        font-family:'Syne',sans-serif;
        margin:0;
      }
      .prog-sub{
        font-size:12px;color:rgba(238,242,238,0.45);
        font-family:'JetBrains Mono',monospace;margin:0;
      }
      .prog-desc{
        font-size:13px;color:rgba(238,242,238,0.6);
        line-height:1.65;margin:0;flex:1;
      }

      /* ── TAGS ── */
      .prog-tags{display:flex;flex-wrap:wrap;gap:5px}
      .prog-tag{
        padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;
        font-family:'JetBrains Mono',monospace;
        background:rgba(255,255,255,0.05);
        border:1px solid rgba(255,255,255,0.1);
        color:rgba(238,242,238,0.45);
      }

      /* ── AZIONI ── */
      .prog-actions{
        display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;
      }
      .prog-btn{
        display:inline-flex;align-items:center;
        padding:7px 14px;border-radius:7px;
        font-size:12px;font-weight:700;
        text-decoration:none;transition:all .15s;
        font-family:'Syne',sans-serif;
      }
      .prog-btn--primary{
        background:#c9a84c;color:#08110c;
      }
      .prog-btn--primary:hover{opacity:.88;text-decoration:none}
      .prog-btn--outline{
        background:transparent;color:rgba(238,242,238,0.6);
        border:1px solid rgba(255,255,255,0.14);
      }
      .prog-btn--outline:hover{
        border-color:#c9a84c;color:#c9a84c;text-decoration:none;
      }

      /* ── LOADING / EMPTY ── */
      .prog-loading, .prog-empty{
        grid-column:1/-1;text-align:center;padding:48px 20px;
        color:rgba(238,242,238,0.3);font-size:14px;
      }

      /* ── COUNTER aggiornamento homepage ── */
      [data-counter]{
        font-variant-numeric:tabular-nums;
        transition:color .3s;
      }
    `;
    document.head.appendChild(style);
  }

  async function renderArea() {
    const area = detectArea();
    const container = document.getElementById("lista-progetti");
    if (!container) return; // pagina non ha la sezione — skip silenzioso

    injectStyles();
    container.innerHTML = '<p class="prog-loading">Caricamento progetti…</p>';

    let allProjects;
    try {
      // Percorso relativo robusto — funziona da root e da sottocartelle
      const base = document.querySelector('base')?.href || window.location.origin;
      const url  = new URL("progetti.json", window.location.href).href
                     .replace(/\/[^\/]+\.html.*$/, "/progetti.json");
      const res  = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allProjects = await res.json();
    } catch (e) {
      container.innerHTML = `
        <div class="prog-empty">
          ⚠️ Impossibile caricare progetti.json<br/>
          <small style="font-size:11px;opacity:.6">${e.message}</small>
        </div>`;
      console.error("area-progetti.js fetch error:", e);
      return;
    }

    // Filtra per area corrente
    const filtered = area
      ? allProjects.filter(p => p.area === area)
      : allProjects;

    if (!filtered.length) {
      container.innerHTML = '<p class="prog-empty">Nessun progetto in questa area.</p>';
      return;
    }

    // Ordina: highlight prima, poi per anno desc
    filtered.sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0)
                          || b.anno - a.anno);

    container.innerHTML = filtered.map(buildCard).join("");

    // Aggiorna contatori con data-counter="area"
    document.querySelectorAll(`[data-counter="${area}"]`).forEach(el => {
      el.textContent = filtered.length;
    });
    // Aggiorna contatore totale se presente
    document.querySelectorAll('[data-counter="totale"]').forEach(el => {
      el.textContent = allProjects.length;
    });
  }

  // ── HOMEPAGE: aggiorna tutti i contatori ──────────────────────────────
  async function updateHomepageCounters() {
    // Solo se siamo sulla homepage
    const isHome = window.location.pathname.endsWith("/")
                || window.location.pathname.endsWith("index.html");
    if (!isHome) return;

    try {
      const res  = await fetch("progetti.json");
      if (!res.ok) return;
      const all  = await res.json();

      const counts = {
        totale:         all.length,
        highlight:      all.filter(p => p.highlight).length,
        "supply-chain": all.filter(p => p.area === "supply-chain").length,
        "cad-moda":     all.filter(p => p.area === "cad-moda").length,
        tessitura:      all.filter(p => p.area === "tessitura").length,
        "ai-tool":      all.filter(p => p.tipo === "ai-tool").length,
        live:           all.filter(p => p.stato === "live").length,
      };

      // Aggiorna tutti gli elementi con data-counter="x"
      Object.entries(counts).forEach(([key, val]) => {
        document.querySelectorAll(`[data-counter="${key}"]`).forEach(el => {
          animateCounter(el, val);
        });
      });

      // Se esiste la sezione griglia nella homepage, renderizza tutti
      const homeGrid = document.getElementById("lista-progetti");
      if (homeGrid) {
        injectStyles();
        const sorted = [...all].sort((a,b)=>(b.highlight?1:0)-(a.highlight?1:0)||b.anno-a.anno);
        homeGrid.innerHTML = sorted.map(buildCard).join("");
        // Filtro tab se esistono
        setupAreaFilter(homeGrid, all);
      }

    } catch(e) {
      console.warn("area-progetti.js homepage counter error:", e);
    }
  }

  function animateCounter(el, target) {
    const start = parseInt(el.textContent) || 0;
    if (start === target) return;
    const dur = 600, steps = 20;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      el.textContent = Math.round(start + (target - start) * (step / steps));
      if (step >= steps) { el.textContent = target; clearInterval(interval); }
    }, dur / steps);
  }

  function setupAreaFilter(grid, all) {
    const filterBtns = document.querySelectorAll("[data-filter]");
    if (!filterBtns.length) return;
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const area = btn.dataset.filter;
        const filtered = area === "tutti" ? all : all.filter(p => p.area === area);
        const sorted = [...filtered].sort((a,b)=>(b.highlight?1:0)-(a.highlight?1:0)||b.anno-a.anno);
        grid.innerHTML = sorted.map(buildCard).join("") || '<p class="prog-empty">Nessun progetto.</p>';
      });
    });
  }

  // ── INIT ────────────────────────────────────────────────────────
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  }

  function run() {
    const isHome = window.location.pathname.endsWith("/")
                || window.location.pathname.endsWith("index.html")
                || window.location.pathname === "/RonaldoRiska/";
    if (isHome) {
      updateHomepageCounters();
    } else {
      renderArea();
    }
  }

  init();
})();
