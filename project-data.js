/**
 * project-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * DATI DINAMICI DEL PORTFOLIO — Ronaldo Riska
 * Caricato da: index.html (defer, prima di main.js)
 *
 * Le chiavi categoria DEVONO coincidere con i data-filter e data-category-card
 * presenti in index.html: "tessitura" | "cad" | "supply"
 * ─────────────────────────────────────────────────────────────────────────────
 */

window.portfolioCategories = {

  tessitura: {
    label:      "Tessitura",
    shortLabel: "Tessitura",
    tone:       "Simulatori produttivi · Armature · Pianificazione",
    summary:    "Simulatori di armatura tessile, note colore, Gantt ciclo lanificio e strumenti per la produzione distretto-Prato.",
    page:       "tessitura.html",
  },

  cad: {
    label:      "CAD Moda",
    shortLabel: "CAD Moda",
    tone:       "Modellistica · Sketch AI · Prodotto",
    summary:    "Applicazioni CAD per modellistica, cartamodelli, sketch digitali AI-enhanced e concept di prodotto moda.",
    page:       "cad-moda.html",
  },

  supply: {
    label:      "Supply Chain",
    shortLabel: "Supply Chain",
    tone:       "MRP · Dashboard · Operations Analytics",
    summary:    "Piattaforme MRP, dashboard supply chain, simulatori make-or-buy, Kanban e tool di operations analytics.",
    page:       "supply-chain-production.html",
  },

};

window.portfolioProjects = [

  // ── SUPPLY CHAIN ─────────────────────────────────────────────────────────

  {
    id:          "textile-platform-v5",
    title:       "Textile Platform v5",
    description: "Piattaforma ERP-grade per il settore tessile. Motore MRP reale con lot sizing L4L/MOQ/MULTIPLE, gestione domanda unificata, ciclo vita ordini fornitore, modulo Project Management PMBOK con Gantt e registro rischi, SketchHD integrato con Claude Vision.",
    category:    "supply",
    status:      "Live",
    type:        "html",
    url:         "textile-platform-v5.html",
    featured:    true,
    tags:        ["MRP", "ERP", "React", "Supply Chain", "Project Management", "AI"],
    detail: {
      value:      "Strumento operativo completo per pianificazione materiali, gestione fornitori e monitoraggio progetti in un'unica interfaccia industrial dark-mode.",
      tech:       ["React 18", "useReducer", "MRP Engine puro", "Gantt", "Claude Vision API"],
      highlights: ["MRP engine con L4L/MOQ/MULTIPLE lot sizing", "Supply order lifecycle completo", "Gantt interattivo + WBS + Registro Rischi", "SketchHD AI integrato"],
    },
  },

  {
    id:          "mrp-iphone-planner",
    title:       "MRP iPhone Planner",
    description: "Simulatore MRP mobile-first con piano di produzione editabile, calcolo automatico fabbisogni componenti FOQ/LFL, gestione ordini aperti, clienti e fornitori. Dati reali dell'esercizio MPS/MRP (Pantony + Jacket-shirt, 20 settimane).",
    category:    "supply",
    status:      "Live",
    type:        "jsx",
    url:         "mrp-iphone-v3.jsx",
    featured:    false,
    tags:        ["MRP", "MPS", "Mobile", "React", "Pianificazione"],
    detail: {
      value:      "Tool MRP completamente configurabile da mobile, senza installazione.",
      tech:       ["React", "Hooks", "MRP Engine"],
      highlights: ["UI ottimizzata iPhone", "Master Config panel", "Lot sizing FOQ/LFL", "Multi-fornitore con prezzi"],
    },
  },

  {
    id:          "filieraos-4",
    title:       "FilieraOS — Supply Chain Simulator",
    description: "Simulatore decisionale per la supply chain tessile. Integra Make-or-Buy, CVP, leva operativa, margine di sicurezza e Matrice di Kraljic. Basato sui materiali IFTS GEFITES / Prof. Filippo Visintin (Università di Firenze).",
    category:    "supply",
    status:      "Live",
    type:        "html",
    url:         "progetti/filieraos.html",
    featured:    true,
    tags:        ["Make-or-Buy", "CVP", "Kraljic", "Dashboard", "KPI", "SCM"],
    detail: {
      value:      "Dashboard operativa per decisioni di pianificazione, acquisti e gestione fornitori nel distretto tessile.",
      tech:       ["HTML", "Chart.js", "JavaScript"],
      highlights: ["Analisi Make-or-Buy", "CVP e punto di pareggio", "Matrice di Kraljic", "KPI supply chain"],
    },
  },

  {
    id:          "business-plan-tessile",
    title:       "Business Plan Tessile",
    description: "Documento interattivo di business plan per startup tessile-digitale. Include analisi di mercato, modello finanziario, piano operativo e pitch per investitori. Orientato al distretto di Prato e compliance EU Digital Product Passport.",
    category:    "supply",
    status:      "Draft",
    type:        "html",
    url:         "progetti/business-plan.html",
    featured:    false,
    tags:        ["Business Plan", "Finanza", "Startup", "Prato", "EU DPP"],
    detail: {
      value:      "Framework riutilizzabile per business plan in ambito tessile-digitale.",
      tech:       ["HTML", "CSS", "JavaScript"],
      highlights: ["Modello canvas", "Proiezioni finanziarie", "Analisi competitiva"],
    },
  },

  // ── CAD MODA ─────────────────────────────────────────────────────────────

  {
    id:          "sketchhd-artifact",
    title:       "SketchHD — Sketch to HD",
    description: "Workflow AI per la trasformazione di sketch digitali in immagini ad alta definizione. Canvas di disegno integrato con Claude Vision per analisi e generazione prompt Stable Diffusion. Preset stilistici: Fashion, Realistic, Product, Concept, Textile.",
    category:    "cad",
    status:      "Live",
    type:        "jsx",
    url:         "sketchhd-artifact.jsx",
    featured:    true,
    tags:        ["AI", "Fashion", "Sketch", "Claude Vision", "Stability AI", "React"],
    detail: {
      value:      "Accelera il processo concept-to-image per designer e stylisti. Dalla matita digitale all'immagine fotorealistica.",
      tech:       ["React", "Canvas API", "Claude Vision API", "Stability AI API"],
      highlights: ["Canvas draw nativo", "5 stili preset tessili", "Analisi AI prompt SD", "Download PNG HD"],
    },
  },

  {
    id:          "modacad-ep1",
    title:       "ModaCAD Studio",
    description: "Applicazione CAD moda web-based ispirata a Audaces e Lectra. Workspace tecnico per modellistica digitale, costruzione cartamodelli, gradazione taglie e nesting. Interfaccia dark-mode con pannello strumenti professionale.",
    category:    "cad",
    status:      "Live",
    type:        "html",
    url:         "progetti/modacad.html",
    featured:    false,
    tags:        ["CAD", "Modellistica", "Pattern Making", "React", "Canvas"],
    detail: {
      value:      "Dimostratore di workflow CAD moda completamente in browser — accessibile senza licenze software.",
      tech:       ["React", "Canvas API", "SVG", "CSS"],
      highlights: ["Canvas pattern making", "Gradazione taglie", "Nesting automatico"],
    },
  },

  {
    id:          "cartamodelli-jeans",
    title:       "Cartamodelli Jeans Digitali",
    description: "Visualizzazione interattiva della costruzione di cartamodelli jeans uomo e donna con misure standard. Mostra logiche costruttive, tolleranze e sequenza di tracciatura. Risorsa didattica e tecnica per il comparto denim.",
    category:    "cad",
    status:      "Live",
    type:        "html",
    url:         "progetti/cartamodelli-jeans.html",
    featured:    false,
    tags:        ["CAD", "Cartamodelli", "Jeans", "Modellistica", "Denim"],
    detail: {
      value:      "Documentazione tecnica interattiva per cartamodelli denim.",
      tech:       ["SVG", "JavaScript", "HTML"],
      highlights: ["Misure standard EU", "Costruzione passo-passo", "Tolleranze cuciture"],
    },
  },

  // ── TESSITURA ──────────────────────────────────────────────────────────────

  {
    id:          "weavecad-draft-studio",
    title:       "WeaveCAD Draft Studio",
    description: "Simulatore interattivo per armature tessili: tela, saia, raso, panama e derivati. Disegno trama/ordito con parametri configurabili, visualizzazione in tempo reale del tessuto simulato, calcolo note colore e spezzature.",
    category:    "tessitura",
    status:      "Live",
    type:        "html",
    url:         "progetti/weavecad.html",
    featured:    true,
    tags:        ["Tessitura", "Armature", "Trama", "Ordito", "Simulatore", "Prato"],
    detail: {
      value:      "Simula visivamente il risultato di armatura prima della produzione — tool formativo e operativo.",
      tech:       ["Canvas API", "JavaScript", "HTML", "CSS"],
      highlights: ["7 armature di base", "Parametri trama/ordito configurabili", "Visualizzazione real-time", "Export note colore"],
    },
  },

  {
    id:          "gantt-tessile",
    title:       "Gantt Ciclo Tessile",
    description: "Diagramma di Gantt interattivo per la pianificazione del ciclo di lavorazione tessile: cardatura, filatura, orditura, tessitura, tintoria, rifinizione e confezione. Gestione ordini multipli, visualizzazione WIP e avanzamento per fase.",
    category:    "tessitura",
    status:      "Live",
    type:        "html",
    url:         "progetti/gantt-tessile.html",
    featured:    false,
    tags:        ["Gantt", "Pianificazione", "Ciclo Tessile", "Lanificio", "Prato"],
    detail: {
      value:      "Strumento di pianificazione visuale per operatori e responsabili di produzione nel distretto tessile.",
      tech:       ["React", "Canvas", "Hooks"],
      highlights: ["7 fasi ciclo laniero", "Ordini multipli", "WIP tracking", "Bottleneck analysis"],
    },
  },

  {
    id:          "note-colore-calculator",
    title:       "Note Colore Calculator",
    description: "Tool per il calcolo delle note colore in ordito: spezzature, simmetrie, nuove partenze centrate e sequenze ripetute. Input parametri e output lista note pronta per l'orditrice. Riduce gli errori nel passaggio da disegno a produzione.",
    category:    "tessitura",
    status:      "Live",
    type:        "html",
    url:         "progetti/note-colore.html",
    featured:    false,
    tags:        ["Tessitura", "Note Colore", "Orditura", "Calcolo", "Qualità"],
    detail: {
      value:      "Elimina i calcoli manuali per le note colore, fonte frequente di errori nella fase di orditura.",
      tech:       ["JavaScript", "HTML", "CSS"],
      highlights: ["Simmetrie automatiche", "Partenze centrate", "Export lista note", "Validazione input"],
    },
  },

];
