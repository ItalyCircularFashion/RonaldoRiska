# Ronaldo Riska — Portfolio Interattivo

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github)](https://italycircularfashion.github.io/RonaldoRiska/)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)]()
[![Commit Convention](https://img.shields.io/badge/Commit-Conventional%20Commits-green)]()

Portfolio professionale interattivo di **Ronaldo Riska**, Textile & Fashion Specialist focalizzato su sostenibilità, supply chain e ottimizzazione della produzione. Il repository contiene una piattaforma digitale modulare con simulatori tessili, dashboard supply chain, tool CAD moda e prototipi React.

---

## 📋 Indice

- [Demo live](#-demo-live)
- [Ambiti professionali](#-ambiti-professionali)
- [Stack tecnologico](#-stack-tecnologico)
- [Architettura del progetto](#-architettura-del-progetto)
- [Struttura repository](#-struttura-repository)
- [Convenzione commit](#-convenzione-commit)
- [Deploy](#-deploy)
- [Metriche](#-metriche)
- [Roadmap](#-roadmap)
- [Licenza](#-licenza)
- [Contatti](#-contatti)

---

## 🚀 Demo live

👉 **https://italycircularfashion.github.io/RonaldoRiska/**

Il sito è servito tramite GitHub Pages con deploy automatico da `main`.

---

## 🧵 Ambiti professionali

### Tessitura
Simulatori interattivi per armature tessili (tela, saia, raso, panama), calcolo note colore, Gantt ciclo tessile e visualizzazione tessuto in tempo reale.

**Tool principali:**
- WeaveCAD Draft Studio — tie-up / threading / treadling / drawdown
- Gantt Ciclo Tessile — pianificazione cardatura → confezione
- Calcolatore Note Colore — conversione RGB/LAB, break-down

### ✂️ CAD Moda
Applicazioni CAD moda web-based per modellistica, cartamodelli, concept design e sketch AI-enhanced.

**Tool principali:**
- ModaCAD Studio — workspace tecnico modellistica digitale
- SketchHD — sketch → HD con Claude Vision + SD
- Cartamodelli Jeans — costruzione interattiva con tolleranze

### 📦 Supply Chain & Production
Piattaforme MRP, dashboard KPI, simulatore make-or-buy, Kanban e business planning per il distretto tessile pratese.

**Tool principali:**
- Textile Platform v5 — ERP-grade con MRP, PMBOK, SketchHD integrato
- MRP iPhone Planner — simulatore mobile-first L4L/FOQ
- FilieraOS — Make-or-Buy, CVP, Matrice Kraljic
- Business Plan Tessile — analisi mercato e pitch investitori

---

## 🛠️ Stack tecnologico

| Layer | Tecnologia |
|-------|------------|
| **Markup** | HTML5 semantico |
| **Stili** | CSS3 con variabili custom, Grid/Flexbox, media query mobile-first |
| **Logica** | JavaScript vanilla — routing client-side, store locale, temi dinamici |
| **Interfacce** | Canvas 2D, slider, simulazioni interattive |
| **Font** | Inter, DM Sans, Cormorant Garamond |
| **Deploy** | GitHub Pages + CI workflow |
| **Design** | Dark mode, responsive 375px–1440px+, touch-friendly |

**Caratteristiche architetturali:**
- Routing client-side con URL canonici
- Store locale per preferenze utente
- CSS variables per theming dinamico
- Moduli standalone caricabili dinamicamente
- 404 custom per gestione URL puliti

---

## 🏗️ Architettura del progetto

```
┌─────────────────────────────────────────────┐
│                 Browser / Client             │
├─────────────────────────────────────────────┤
│  main.js (Router, Store, Animazioni)         │
├─────────────┬─────────────┬─────────────────┤
│  index.html │ tessitura   │ cad-moda        │
│  curriculum │ filieraos   │ business-plan   │
│  progetto   │ gantt       │ textile-platform│
├─────────────┴─────────────┴─────────────────┤
│  site.css + site-patch.css (Theming)        │
├─────────────────────────────────────────────┤
│  project-data.js (Metadati progetti)        │
├─────────────────────────────────────────────┤
│  GitHub Pages (Static Hosting + CI)         │
└─────────────────────────────────────────────┘
```

**Flusso di navigazione:**
1. `index.html` — entry point, router principale
2. `main.js` — gestisce routing, filtri, animazioni
3. `project-data.js` — database progetti con metadati
4. `progetto.html` — router universale per singolo progetto
5. Moduli standalone — tool autonomi caricabili direttamente

---

## 📂 Struttura repository

```
RonaldoRiska/
├── .github/
│   └── workflows/
│       └── pages.yml           # CI deploy GitHub Pages
├── archive/
│   └── index_backup.html       # Backup storico index
├── index.html                  # Homepage portfolio
├── curriculum.html             # CV online interattivo
├── tessitura.html              # Area tessitura
├── cad-moda.html               # Area CAD moda
├── supply-chain-production.html # Area supply chain
├── progetto.html               # Router progetti
├── 404.html                    # Gestione URL puliti
├── site.css                    # Stili globali
├── site-patch.css              # Patch/override stili
├── main.js                     # Core: routing, store, animazioni
├── project-data.js             # Database progetti
├── loader.js                   # Lazy loader moduli
├── area-progetti.js            # Logica area progetti
├── sitemap.xml                 # SEO sitemap
├── robots.txt                  # Crawler directives
├── profile.jpg                 # Immagine profilo
├── Ronaldo-Riska-CV-2026.pdf   # CV scaricabile
├── LICENSE                     # Licenza
├── README.md                   # Documentazione progetto
│
├── [moduli standalone]
│   ├── weavecad.html           # Simulatore armature
│   ├── gantt-tessile.html      # Gantt ciclo tessile
│   ├── filieraos.html          # Supply chain simulator
│   ├── textile-platform-v5.html # ERP-grade platform
│   ├── mrp-iphone-v3.jsx       # MRP mobile
│   ├── sketchhd-artifact.jsx   # Sketch AI
│   ├── modacad.html            # CAD moda
│   ├── business-plan.html      # Business plan
│   └── ...
│
└── progetti/                   # URL canonici dinamici
    └── (serviti tramite router)
```

---

## 🔄 Convenzione commit

Messaggi descrittivi nella forma:
`type(scope): descrizione`

**Tipi:**
- `feat(scope)` — nuova funzionalità
- `fix(scope)` — correzione bug
- `docs(scope)` — documentazione
- `refactor(scope)` — refactor senza cambio comportamento
- `chore(scope)` — manutenzione, build, dipendenze

**Esempi:**
```bash
feat(tessitura): aggiungi preset armatura saia 2/2
fix(supply-chain): correggi calcolo MRP L4L
docs(readme): aggiorna struttura progetto
refactor(cad): centralizza gestione tolleranze
chore(ci): aggiorna workflow deploy GitHub Pages
```

---

## 🚢 Deploy

Il deploy è automatizzato via GitHub Actions:

1. Push su `main` → trigger workflow
2. Upload artifact della root repository
3. Deploy su GitHub Pages
4. Disponibile su `https://italycircularfashion.github.io/RonaldoRiska/`

**Deploy manuale:**
```bash
git push origin main
```

**Locale:**
```bash
python3 -m http.server 5173
# Apri http://localhost:5173
```

---

## 📊 Metriche

| Indicatore | Valore |
|-----------|--------|
| **Progetti attivi** | 20+ tool e dashboard |
| **Moduli interattivi** | 18 applicazioni navigabili |
| **Aree professionali** | 3 (Tessitura, CAD Moda, Supply Chain) |
| **Copertura responsive** | 375px – 1440px+ |
| **Commit history** | 198+ commit |
| **SEO** | sitemap.xml, robots.txt, 404 custom |

---

## 🗺️ Roadmap

### Q3 2026
- [ ] Ottimizzazione performance: lazy loading immagini, code splitting
- [ ] Aggiunta Open Graph meta tags per preview social
- [ ] Implementazione PWA baseline (manifest, service worker)
- [ ] Test suite per moduli critici (WeaveCAD, MRP)
- [ ] Miglioramento accessibilità: ARIA labels, keyboard navigation

### Q4 2026
- [ ] Integrazione backend per persistenza dati (IndexedDB → API)
- [ ] Export PDF migliorato per report progetti
- [ ] Multi-language support (IT/EN)
- [ ] Dark/light mode toggle con preferenza persistente
- [ ] Analytics dashboard per tracking utilizzo tool

---

## 📄 Licenza

Tutti i contenuti (testi, immagini, codice) sono © **Ronaldo Riska**.

Il codice è rilasciato a scopo dimostrativo — per usi commerciali contattare l'autore.

---

## 📬 Contatti

- **Email:** [ronaldo.riska@gmail.com](mailto:ronaldo.riska@gmail.com)
- **GitHub:** [@ItalyCircularFashion](https://github.com/ItalyCircularFashion)
- **Location:** Prato, Toscana — Italia

---

## 🙏 Ringraziamenti

Progetto realizzato come vetrina di competenze tecniche e di product design per il settore tessile‑moda pratese.

Sviluppato con approccio **industrial tech**: integrazione tra competenze operative di produzione, qualità e pianificazione con strumenti digitali, analytics e sistemi AI-driven.

---

*Ultimo aggiornamento: Settembre 2026*
