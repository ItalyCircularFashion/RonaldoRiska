/**
 * area-progetti.js  — Ronaldo Riska Portfolio
 * ─────────────────────────────────────────────────────────────────────────────
 * Modulo condiviso per homepage e pagine area.
 * Tutti i file HTML sono in ROOT — nessuna sottocartella /progetti/.
 *
 * Includi nelle pagine area PRIMA di </body>:
 *   <script src="area-progetti.js" data-area="tessitura"></script>
 *   <script src="area-progetti.js" data-area="cad-moda"></script>
 *   <script src="area-progetti.js" data-area="supply-chain"></script>
 *
 * Homepage (index.html):
 *   <script src="area-progetti.js"></script>
 *
 * Richiede nella pagina: <div id="lista-progetti"></div>
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {

  /* ─── Mappa area-nome → chiave categoria in project-data.js ────────────── *
   * I file HTML usano nomi come "cad-moda" e "supply-chain",                  *
   * ma i progetti hanno category: "cad" e "supply".                           *
   * Questa mappa normalizza la corrispondenza.                                 */
  const AREA_KEY_MAP = {
    "tessitura":              "tessitura",
    "cad-moda":               "cad",
    "cad":                    "cad",
    "supply-chain":           "supply",
    "supply-chain-production":"supply",
    "supply":                 "supply",
  };

  const TIPO_ICONS = {
    dashboard: "📊", simulator: "🔬", tool: "🔧",
    platform:  "🏗️", cad: "📐", "ai-tool": "🤖",
  };
  const TIPO_LABELS = {
    dashboard: "Dashboard", simulator: "Simulatore", tool: "Tool",
    platform:  "Platform",  cad: "CAD",            "ai-tool": "AI Tool",
  };

  /* ─── Rileva area corrente ──────────────────────────────────────────────── */
  function detectArea() {
    // 1. Legge data-area dallo script tag corrente
    const me = document.currentScript || document.querySelector("script[data-area]");
    if (me && me.dataset.area) return AREA_KEY_MAP[me.dataset.area] || me.dataset.area;

    // 2. Fallback: legge dall'URL della pagina corrente
    const path = window.location.pathname.toLowerCase();
    if (path.includes("tessitura"))     return "tessitura";
    if (path.includes("cad-moda"))      return "cad";
    if (path.includes("supply-chain"))  return "supply";
    return null; // homepage o sconosciuta
  }

  /* ─── Fetch progetti.json dalla root ───────────────────────────────────── *
   * Funziona da qualsiasi pagina in root (tessitura.html, index.html, ecc.)   */
  async function fetchProjects() {
    // Costruisce sempre il path assoluto verso la root del sito
    const origin  = window.location.origin;
    const base    = window.location.pathname.replace(/\/[^/]*$/, "/"); // es: /RonaldoRiska/
    const jsonUrl = origin + base + "project-data.js";

    // project-data.js popola window.portfolioProjects — usa quello se già caricato
    if (window.portfolioProjects && window.portfolioProjects.length > 0) {
      return window.portfolioProjects;
    }

    // Fallback: prova a caricare progetti.json (versione statica semplificata)
    const fallbackUrl = origin + base + "progetti.json";
    const res = await fetch(fallbackUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${fallbackUrl}`);
    return await res.json();
  }

  /* ─── Build card HTML ───────────────────────────────────────────────────── */
  function buildCard(p) {
    const icon  = TIPO_ICONS[p.tipo || p.type]  || "📁";
    const tipo  = TIPO_LABELS[p.tipo || p.type] || p.tipo || p.type || "";
    const url   = p.url || p.link || "#";                           // compatibile con entrambi i campi
    const scheda = p.scheda || `progetto.html?id=${p.id}`;          // genera automaticamente se manca
    const tags   = (p.tags || []).slice(0, 4)
                     .map(t => `<span class="prog-tag">${escHtml(t)}</span>`).join("");
    const hlClass = (p.featured || p.highlight) ? " prog-card--highlight" : "";

    return `
      <article class="prog-card${hlClass}" data-tipo="${escHtml(p.tipo || p.type || "")}">
        <div class="prog-card__header">
          <span class="prog-icon">${icon}</span>
          <div class="prog-meta">
            <span class="prog-tipo">${escHtml(tipo)}</span>
            ${(p.status || p.stato) === "Live" ? '<span class="prog-live">● Live</span>' : ""}
            <span class="prog-anno">${p.anno || p.year || ""}</span>
          </div>
        </div>
        <h3 class="prog-nome">${escHtml(p.nome || p.title || "")}</h3>
        <p class="prog-sub">${escHtml(p.sottotitolo || p.description?.slice(0,80) || "")}</p>
        <p class="prog-desc">${escHtml((p.descrizione || p.description || "").slice(0,140))}…</p>
        <div class="prog-tags">${tags}</div>
        <div class="prog-actions">
          <a class="prog-btn prog-btn--outline" href="${escHtml(scheda)}">Scheda →</a>
          <a class="prog-btn prog-btn--primary"  href="${escHtml(url)}">${escHtml(p.linkLabel || "Apri")} →</a>
        </div>
      </article>`;
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;")
      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  /* ─── Stili inline (iniettati una sola volta) ───────────────────────────── */
  function injectStyles() {
    if (document.getElementById("_ap_css")) return;
    const s = document.createElement("style");
    s.id = "_ap_css";
    s.textContent = `
      #lista-progetti{
        display:grid;
        grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
        gap:18px;padding:8px 0 32px;
      }
      .prog-card{
        background:var(--surface,#0f1a12);
        border:1px solid var(--line,rgba(255,255,255,0.08));
        border-radius:12px;padding:18px 20px 16px;
        display:flex;flex-direction:column;gap:9px;
        transition:border-color .18s,transform .18s;
      }
      .prog-card:hover{border-color:rgba(201,168,76,.35);transform:translateY(-2px)}
      .prog-card--highlight{
        border-color:rgba(201,168,76,.22);
        background:linear-gradient(135deg,rgba(201,168,76,.06),var(--surface,#0f1a12));
      }
      .prog-card__header{display:flex;align-items:center;gap:9px}
      .prog-icon{font-size:20px;flex-shrink:0}
      .prog-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
      .prog-tipo{font-size:10px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;
                 color:var(--accent-2,#2ec4a0);font-family:monospace}
      .prog-live{font-size:10px;font-weight:600;color:#3db87a;font-family:monospace}
      .prog-anno{font-size:10px;color:rgba(238,242,238,.3);font-family:monospace;margin-left:auto}
      .prog-nome{font-size:16px;font-weight:700;color:var(--ink-strong,#eef2ee);
                 letter-spacing:-.3px;line-height:1.2;margin:0}
      .prog-sub{font-size:11px;color:rgba(238,242,238,.4);font-family:monospace;margin:0}
      .prog-desc{font-size:13px;color:rgba(238,242,238,.6);line-height:1.6;margin:0;flex:1}
      .prog-tags{display:flex;flex-wrap:wrap;gap:4px}
      .prog-tag{padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;
                font-family:monospace;background:rgba(255,255,255,.05);
                border:1px solid rgba(255,255,255,.1);color:rgba(238,242,238,.45)}
      .prog-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:3px}
      .prog-btn{display:inline-flex;align-items:center;padding:6px 13px;border-radius:7px;
                font-size:12px;font-weight:700;text-decoration:none;transition:all .15s}
      .prog-btn--primary{background:var(--accent,#c9a84c);color:#08110c}
      .prog-btn--primary:hover{opacity:.88;text-decoration:none}
      .prog-btn--outline{background:transparent;color:rgba(238,242,238,.6);
                         border:1px solid rgba(255,255,255,.14)}
      .prog-btn--outline:hover{border-color:var(--accent,#c9a84c);color:var(--accent,#c9a84c);text-decoration:none}
      .prog-loading,.prog-empty{grid-column:1/-1;text-align:center;padding:40px 20px;
                                color:rgba(238,242,238,.3);font-size:14px}
    `;
    document.head.appendChild(s);
  }

  /* ─── Animazione counter ────────────────────────────────────────────────── */
  function animateCount(el, target) {
    const start = parseInt(el.textContent) || 0;
    if (start === target) { el.textContent = target; return; }
    const steps = 24, dur = 700;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      el.textContent = Math.round(start + (target - start) * (i / steps));
      if (i >= steps) { el.textContent = target; clearInterval(iv); }
    }, dur / steps);
  }

  /* ─── Filtro per area (pagine area) ─────────────────────────────────────── */
  async function renderArea() {
    const area      = detectArea();
    const container = document.getElementById("lista-progetti");
    if (!container) return;

    injectStyles();
    container.innerHTML = '<p class="prog-loading">Caricamento progetti…</p>';

    let all;
    try {
      all = await fetchProjects();
    } catch (e) {
      container.innerHTML =
        `<div class="prog-empty">⚠️ Impossibile caricare i progetti.<br>
         <small>${e.message}</small></div>`;
      console.error("area-progetti.js:", e);
      return;
    }

    const filtered = area
      ? all.filter(p => (p.category || p.area) === area)
      : all;

    if (!filtered.length) {
      container.innerHTML = '<p class="prog-empty">Nessun progetto in questa area.</p>';
      return;
    }

    // Ordine: highlight/featured prima, poi anno desc
    filtered.sort((a, b) =>
      ((b.featured || b.highlight) ? 1 : 0) - ((a.featured || a.highlight) ? 1 : 0) ||
      (b.anno || b.year || 0) - (a.anno || a.year || 0)
    );

    container.innerHTML = filtered.map(buildCard).join("");

    // Aggiorna counter di area se presente
    document.querySelectorAll(`[data-counter="${area}"]`)
            .forEach(el => animateCount(el, filtered.length));
  }

  /* ─── Homepage: aggiorna tutti i counter e griglia ──────────────────────── */
  async function runHomepage() {
    let all;
    try { all = await fetchProjects(); }
    catch (e) { console.warn("area-progetti.js homepage:", e); return; }

    const byArea = {
      tessitura: all.filter(p => (p.category||p.area) === "tessitura").length,
      cad:       all.filter(p => (p.category||p.area) === "cad").length,
      supply:    all.filter(p => (p.category||p.area) === "supply").length,
    };

    // Counter generici
    const counts = {
      totale:   all.length,
      live:     all.filter(p => (p.status||p.stato) === "Live").length,
      ...byArea,
      "cad-moda":              byArea.cad,
      "supply-chain":          byArea.supply,
      "supply-chain-production": byArea.supply,
    };

    Object.entries(counts).forEach(([key, val]) =>
      document.querySelectorAll(`[data-counter="${key}"]`)
              .forEach(el => animateCount(el, val))
    );

    // Popola griglia progetti nella homepage se esiste
    const grid = document.getElementById("lista-progetti");
    if (grid) {
      injectStyles();
      const sorted = [...all].sort((a,b) =>
        ((b.featured||b.highlight)?1:0) - ((a.featured||a.highlight)?1:0) ||
        (b.anno||b.year||0) - (a.anno||a.year||0)
      );
      grid.innerHTML = sorted.map(buildCard).join("");
      setupFilter(grid, all);
    }
  }

  /* ─── Filtro tab su homepage ─────────────────────────────────────────────── */
  function setupFilter(grid, all) {
    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]")
                .forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");

        const raw    = btn.dataset.filter;
        const key    = AREA_KEY_MAP[raw] || raw;
        const subset = (raw === "all")
          ? all
          : all.filter(p => (p.category || p.area) === key);

        const sorted = [...subset].sort((a,b) =>
          ((b.featured||b.highlight)?1:0) - ((a.featured||a.highlight)?1:0) ||
          (b.anno||b.year||0) - (a.anno||a.year||0)
        );
        grid.innerHTML = sorted.map(buildCard).join("") ||
          '<p class="prog-empty">Nessun progetto.</p>';
      });
    });
  }

  /* ─── Entry point ───────────────────────────────────────────────────────── */
  function init() {
    const run = () => {
      const path = window.location.pathname.toLowerCase();
      const isHome = path.endsWith("/") || path.endsWith("index.html");
      if (isHome) runHomepage(); else renderArea();
    };
    if (document.readyState === "loading")
      document.addEventListener("DOMContentLoaded", run);
    else run();
  }

  init();

})();
