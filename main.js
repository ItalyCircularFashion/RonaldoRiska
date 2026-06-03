const C = window.portfolioCategories || {};
const P = window.portfolioProjects || [];

const qs = (s, r=document)=>r.querySelector(s);
const qsa = (s, r=document)=>[...r.querySelectorAll(s)];

const esc = v => String(v??"")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

const root = p => p;

const getId = () => {
  const s = sessionStorage.getItem("redirectPath");
  if (s) {
    sessionStorage.removeItem("redirectPath");
    const m = s.match(/\/progetti\/([^\/]+)\.html$/);
    if (m) return decodeURIComponent(m[1]);
  }
  const m = location.pathname.match(/progetti\/([^\/]+)\.html$/);
  return m ? decodeURIComponent(m[1]) :
    new URLSearchParams(location.search).get("id");
};

const hrefP = p => `progetto.html?id=${encodeURIComponent(p.id)}`;
const hrefC = k => root(C[k]?.page || "index.html");
const byCat = k => P.filter(x=>x.category===k);

const T = {
  html:"Apri tool",
  jsx:"Apri sorgente",
  js:"Apri sorgente",
  zip:"Scarica asset"
};

const nf = () => `
<section class="section"><div class="container narrow">
<h1>Progetto non trovato</h1>
<a class="button button-primary" href="index.html">Home</a>
</div></section>`;

const card = (p,o={})=>{
  const c=C[p.category]||{};
  const tag = p.tags.slice(0,o.compact?3:5)
    .map(t=>`<li>${esc(t)}</li>`).join("");

  return `
<article class="project-card reveal ${p.type==="html"?"is-live":"is-source"}"
 data-category="${esc(p.category)}"
 data-search="${esc((p.title+" "+p.description+" "+p.tags.join(" ")).toLowerCase())}">

<a class="project-preview" href="${hrefP(p)}">
<span class="preview-label">${esc(c.label||p.category)}</span>
</a>

<div class="project-card-body">
<h3>${esc(p.title)}</h3>
<p>${esc(p.description)}</p>
<ul class="tag-list">${tag}</ul>
</div>

<div class="card-actions">
<a class="button button-primary" href="${hrefP(p)}">Scheda</a>
<a class="button button-ghost" href="${root(p.url)}" target="_blank">
${T[p.type]||"Apri"}
</a>
</div>

</article>`;
};

const renderList = () => {
  qsa("[data-project-list]").forEach(m=>{
    let l = m.dataset.category==="all"
      ? [...P]
      : byCat(m.dataset.category);

    if (m.dataset.featured==="true") l = l.filter(x=>x.featured);
    if (m.dataset.limit) l = l.slice(0,+m.dataset.limit);

    m.innerHTML = l.map(x=>card(x,{compact:m.dataset.category==="all"})).join("");
  });
};

const renderDetail = (id) => {
  const m = qs("[data-project-detail]");
  if (!m) return;

  const p = P.find(x=>x.id===(id||getId()));
  if (!p) return m.innerHTML = nf();

  const c = C[p.category]||{};
  const related = byCat(p.category).filter(x=>x.id!==p.id).slice(0,3);

  document.title = `${p.title} | Portfolio`;

  m.innerHTML = `
<section class="project-hero section">
<div class="container project-hero-grid">

<div>
<h1>${esc(p.title)}</h1>
<p>${esc(p.description)}</p>
<a class="button button-primary" href="${root(p.url)}" target="_blank">
${T[p.type]||"Apri"}
</a>
<a class="button button-secondary" href="${hrefC(p.category)}">Categoria</a>
</div>

<aside class="project-facts">
<dl>
<div><dt>Stato</dt><dd>${esc(p.status)}</dd></div>
<div><dt>Categoria</dt><dd>${esc(c.label||p.category)}</dd></div>
<div><dt>Formato</dt><dd>${esc(p.type.toUpperCase())}</dd></div>
</dl>
</aside>

</div>
</section>

<section class="section">
<div class="container">
${related.map(x=>card(x,{compact:true})).join("")}
</div>
</section>`;
};

const filter = () => {
  const f = qs("[data-filter].is-active")?.dataset.filter||"all";
  const s = (qs("[data-project-search]")?.value||"").toLowerCase();

  qsa("[data-project-card]").forEach(c=>{
    c.classList.toggle("is-hidden",
      !( (f==="all"||c.dataset.category===f) &&
         (!s||c.dataset.search.includes(s)) )
    );
  });
};

document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  initNavigation();
  initReveal();
  renderList();
  renderDetail(getId());
});
