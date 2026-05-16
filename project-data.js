window.portfolioCategories = {
  tessitura: {
    label: "Tessitura",
    shortLabel: "Textile Tech",
    page: "tessitura.html",
    tone: "Processi tessili, armature, filati, colore e cicli di lavorazione.",
    summary:
      "Simulatori trama/ordito, calcoli tessili, dashboard di tessitura e prototipi per gestire processi tecnici di lanificio.",
    metrics: ["8 moduli", "WeaveCAD", "Pattern", "KPI reparto"],
  },
  cad: {
    label: "CAD Moda",
    shortLabel: "Fashion CAD",
    page: "cad-moda.html",
    tone: "Progettazione prodotto, modellistica digitale e workflow moda.",
    summary:
      "Strumenti per modellistica, cartamodelli, concept design, sketch enhancement e sviluppo prodotto digitale.",
    metrics: ["8 moduli", "Pattern", "Sketch", "Product flow"],
  },
  supply: {
    label: "Supply Chain & Production",
    shortLabel: "Industrial Ops",
    page: "supply-chain-production.html",
    tone: "Pianificazione, produzione, stock, ordini, MRP/MPS e KPI industriali.",
    summary:
      "Dashboard enterprise, simulatori make-or-buy, sistemi Kanban, business planning e analytics per operations tessili.",
    metrics: ["11 moduli", "SCM", "Kanban", "Planning"],
  },
};

window.portfolioProjects = [
  {
    id: "weavecad-draft-studio",
    title: "WeaveCAD Draft Studio",
    category: "tessitura",
    type: "html",
    status: "Tool interattivo",
    url: "weavecad-draft-studio.html",
    featured: true,
    description:
      "Editor tecnico per armature tessili con simulazione trama/ordito, repeat, colori filati, pattern e operazioni di progettazione.",
    value:
      "Dimostra capacita di trasformare logiche tessili complesse in un'interfaccia digitale usabile per prototipazione e analisi.",
    tags: ["Trama", "Ordito", "Armature", "Pattern", "Weaving"],
    stack: ["HTML", "CSS", "JavaScript", "Canvas/UI"],
    deliverables: ["Simulatore armature", "Editor pattern", "Vista tecnica", "Parametri struttura"],
  },
  {
    id: "calcolatore-note-colore",
    title: "Calcolatore Note Colore Tessili",
    category: "tessitura",
    type: "html",
    status: "Tool tecnico",
    url: "calcolatore-note-colore-tessili.html",
    featured: true,
    description:
      "Calcolatore per note colore, simmetrie, spezzature e nuove partenze centrate nella costruzione di sequenze tessili.",
    value:
      "Porta un calcolo tecnico ripetitivo dentro un workflow digitale chiaro, riducendo errori manuali e tempi di controllo.",
    tags: ["Colore", "Note tessili", "Sequenze", "Calcolo"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Nota simmetrica", "Dettaglio spezzatura", "Partenza centrata"],
  },
  {
    id: "gantt-ciclo-tessile",
    title: "Gantt Dispositore Ciclo Tessile Prato",
    category: "tessitura",
    type: "html",
    status: "Dashboard ciclo",
    url: "gantt-ciclo-tessile-prato.html",
    featured: true,
    description:
      "Vista Gantt per organizzare un ciclo tessile nel distretto pratese, con fasi operative e pianificazione temporale.",
    value:
      "Collega competenze tessili e produzione in una rappresentazione visuale adatta al coordinamento di reparto.",
    tags: ["Gantt", "Ciclo tessile", "Planning", "Prato"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Timeline produttiva", "Fasi ciclo", "Vista dispositore"],
  },
  {
    id: "lanificio-pro-v2",
    title: "LanificioPRO v2",
    category: "tessitura",
    type: "jsx",
    status: "Prototipo React",
    url: "lanificiopro-v2.jsx",
    description:
      "Prototipo React per gestione digitale di un lanificio, con logiche di reparto, produzione e controllo operativo.",
    value:
      "Mostra progettazione applicativa orientata a un contesto tessile reale, con mentalita da prodotto software.",
    tags: ["Lanificio", "React", "Operations", "KPI"],
    stack: ["React", "JSX", "Product design"],
    deliverables: ["Control panel", "Workflow reparto", "Modello dati"],
  },
  {
    id: "lanificio-pro",
    title: "LanificioPRO",
    category: "tessitura",
    type: "jsx",
    status: "Prototipo React",
    url: "lanificiopro.jsx",
    description:
      "Prima versione del prototipo gestionale per lanificio, utile per documentare iterazione progettuale e sviluppo incrementale.",
    value:
      "Evidenzia evoluzione del progetto, miglioramento progressivo dell'interfaccia e ragionamento sui processi.",
    tags: ["Lanificio", "React", "Prototype"],
    stack: ["React", "JSX"],
    deliverables: ["Versione base", "Flussi operativi", "Componenti UI"],
  },
  {
    id: "antilope-studio",
    title: "CAD Textile Antilope Studio",
    category: "tessitura",
    type: "jsx",
    status: "Prototipo CAD",
    url: "antilope-studio.jsx",
    description:
      "Studio CAD tessile in JSX per sperimentare interfacce di progettazione tecnica e controllo digitale di pattern.",
    value:
      "Unisce progettazione tessile, UI tecnica e architettura di prodotto per applicazioni specialistiche.",
    tags: ["CAD tessile", "React", "Pattern", "Studio"],
    stack: ["React", "JSX", "CAD workflow"],
    deliverables: ["UI CAD", "Pattern logic", "Workspace tecnico"],
  },
  {
    id: "weave-backend-server",
    title: "Weave Backend Server",
    category: "tessitura",
    type: "js",
    status: "Backend prototype",
    url: "weave-backend-server.js",
    description:
      "Server JavaScript per sperimentare il backend di un ambiente Weave Studio con logiche applicative separate dal frontend.",
    value:
      "Documenta competenze di architettura oltre l'interfaccia: backend, API e separazione delle responsabilita.",
    tags: ["Backend", "Node", "Weave studio", "API"],
    stack: ["JavaScript", "Node.js"],
    deliverables: ["Server prototype", "Base API", "Backend studio"],
  },
  {
    id: "modacad-ep1",
    title: "ModaCAD Studio EP1",
    category: "cad",
    type: "html",
    status: "Tool CAD",
    url: "modacad-studio-ep1.html",
    featured: true,
    description:
      "Ambiente di modellistica digitale per moda con UI editoriale, strumenti laterali e logica da studio CAD.",
    value:
      "Presenta un workflow di progettazione prodotto con attenzione a interfaccia, strumenti e contesto moda.",
    tags: ["ModaCAD", "Modellistica", "Product design", "CAD"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Workspace CAD", "Toolbar", "Gestione capo"],
  },
  {
    id: "modacad-ep2",
    title: "ModaCAD Studio EP2",
    category: "cad",
    type: "html",
    status: "Tool CAD",
    url: "modacad-studio-ep2.html",
    description:
      "Seconda iterazione del CAD moda, con affinamento dell'esperienza utente e della struttura di lavoro digitale.",
    value:
      "Mostra capacita di iterare un prodotto digitale mantenendo coerenza visiva e migliorando le funzionalita.",
    tags: ["CAD moda", "Iterazione", "Workflow", "UX"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Versione evoluta", "Workspace", "Product tools"],
  },
  {
    id: "modacad-ep3",
    title: "ModaCAD MVP EP3",
    category: "cad",
    type: "html",
    status: "MVP interattivo",
    url: "modacad-mvp-ep3.html",
    featured: true,
    description:
      "MVP CAD per selezione capo e generazione di un flusso iniziale di progettazione digitale.",
    value:
      "Trasforma una scelta progettuale in percorso applicativo, utile per prototipare strumenti prodotto.",
    tags: ["MVP", "CAD", "Capo", "Workflow"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Scelta capo", "Flusso guidato", "Interfaccia MVP"],
  },
  {
    id: "modacad-ep4",
    title: "ModaCAD EP4",
    category: "cad",
    type: "html",
    status: "Prototype",
    url: "modacad-ep4.html",
    description:
      "Quarta iterazione del concept ModaCAD, centrata su accesso rapido alla creazione del capo.",
    value:
      "Evidenzia sperimentazione rapida e affinamento progressivo di una soluzione CAD moda.",
    tags: ["ModaCAD", "Prototype", "Product flow"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Iterazione UI", "Scelta capo", "Prototype flow"],
  },
  {
    id: "cartamodello-jeans",
    title: "Cartamodello Pantalone Jeans 38-48",
    category: "cad",
    type: "html",
    status: "Pattern tool",
    url: "cartamodello-jeans.html",
    featured: true,
    description:
      "Strumento per cartamodello pantalone jeans con taglie 38-48, utile per collegare modellistica e visualizzazione digitale.",
    value:
      "Rende dimostrabile la competenza nel tradurre regole di modellistica in strumenti web consultabili.",
    tags: ["Jeans", "Cartamodello", "Taglie", "Modellistica"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Pattern jeans", "Range taglie", "Vista modello"],
  },
  {
    id: "cartamodello-jeans-donna",
    title: "Cartamodello Jeans Donna",
    category: "cad",
    type: "html",
    status: "Pattern tool",
    url: "cartamodello-jeans-donna.html",
    featured: true,
    description:
      "Cartamodello digitale per jeans donna regular fit, con interfaccia dedicata alla costruzione del modello.",
    value:
      "Integra progettazione moda, regole tecniche e output visuale per comunicare competenza CAD/prodotto.",
    tags: ["Jeans donna", "Regular fit", "Pattern", "CAD"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Pattern donna", "Regular fit", "Vista tecnica"],
  },
  {
    id: "sketchhd-artifact",
    title: "SketchHD Artifact",
    category: "cad",
    type: "jsx",
    status: "AI design prototype",
    url: "sketchhd-artifact.jsx",
    description:
      "Prototipo JSX per workflow di miglioramento sketch verso output ad alta definizione.",
    value:
      "Collega design moda, AI-assisted workflow e prototipazione frontend.",
    tags: ["Sketch", "AI", "HD", "React"],
    stack: ["React", "JSX", "AI workflow"],
    deliverables: ["Sketch workflow", "Artifact UI", "Enhancement flow"],
  },
  {
    id: "sketchhd-source",
    title: "SketchHD Source",
    category: "cad",
    type: "jsx",
    status: "React source",
    url: "sketchhd.jsx",
    description:
      "Sorgente React del concept SketchHD per gestione di immagini, concept e output visuali.",
    value:
      "Mostra codice applicativo e ragionamento su componenti, stato e interfaccia utente.",
    tags: ["React", "Sketch", "Frontend"],
    stack: ["React", "JSX"],
    deliverables: ["Source code", "Componenti", "Image flow"],
  },
  {
    id: "scm-gefites-evolved",
    title: "SCM GEFITES Evolved",
    category: "supply",
    type: "html",
    status: "Dashboard SCM",
    url: "scm-gefites-evolved.html",
    featured: true,
    description:
      "Dashboard interattiva per supply chain management con moduli su make-or-buy, costi, acquisti, partnership e pianificazione.",
    value:
      "Ha un taglio enterprise e rende visibile la capacita di costruire strumenti didattici e operativi complessi.",
    tags: ["SCM", "Make or Buy", "Costi", "Planning", "Dashboard"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Dashboard", "Simulatori", "Navigazione moduli", "Piano supply chain"],
  },
  {
    id: "filieraos-4",
    title: "FilieraOS 4",
    category: "supply",
    type: "html",
    status: "Enterprise platform",
    url: "filieraos-4.html",
    featured: true,
    description:
      "Piattaforma di supply chain intelligence per fashion con dashboard, quick actions, decisioner make-or-buy e analytics.",
    value:
      "Comunica una visione SaaS per operations moda: dati, decisioni e workflow in un ambiente unico.",
    tags: ["Fashion SCM", "SaaS", "Analytics", "Decisioner"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Dashboard", "Decisioner", "Analytics", "Quick actions"],
  },
  {
    id: "filieraos-3",
    title: "FilieraOS 3",
    category: "supply",
    type: "html",
    status: "Enterprise platform",
    url: "filieraos-3.html",
    description:
      "Versione precedente della piattaforma FilieraOS, utile per mostrare evoluzione e iterazione del concept.",
    value:
      "Rende leggibile il percorso di miglioramento di un prodotto digitale per supply chain moda.",
    tags: ["SCM", "Iteration", "Dashboard", "Fashion"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Dashboard", "Moduli SCM", "Analytics"],
  },
  {
    id: "scm-gefites-standalone",
    title: "SCM GEFITES Standalone",
    category: "supply",
    type: "html",
    status: "Dashboard SCM",
    url: "scm-gefites-standalone.html",
    description:
      "Versione standalone della dashboard SCM con moduli formativi e strumenti interattivi.",
    value:
      "Dimostra capacita di condensare contenuti complessi in un'esperienza navigabile e operativa.",
    tags: ["SCM", "Dashboard", "Acquisti", "Costi"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Mappa corso", "Simulatori", "Moduli SCM"],
  },
  {
    id: "scm-visintin-riassunto",
    title: "SCM Visintin Riassunto",
    category: "supply",
    type: "html",
    status: "Knowledge dashboard",
    url: "scm-visintin-riassunto.html",
    description:
      "Riassunto interattivo su supply chain management, costi di transazione, CVP, acquisti e partnership.",
    value:
      "Trasforma materiali teorici in contenuto digitale consultabile e strutturato.",
    tags: ["SCM", "Riassunto", "CVP", "Acquisti"],
    stack: ["HTML", "CSS"],
    deliverables: ["Knowledge base", "Moduli teorici", "Navigazione"],
  },
  {
    id: "scm-visintin-riassunto-1",
    title: "SCM Visintin Riassunto v1",
    category: "supply",
    type: "html",
    status: "Knowledge dashboard",
    url: "scm-visintin-riassunto-v1.html",
    description:
      "Variante del riassunto SCM, mantenuta come storico di iterazione e confronto contenutistico.",
    value:
      "Mostra controllo documentale e capacita di tenere versioni alternative di un modulo.",
    tags: ["SCM", "Versioning", "Knowledge"],
    stack: ["HTML", "CSS"],
    deliverables: ["Versione alternativa", "Contenuti SCM"],
  },
  {
    id: "kanbanflow",
    title: "KanbanFlow",
    category: "supply",
    type: "html",
    status: "Production board",
    url: "kanbanflow.html",
    featured: true,
    description:
      "Board Kanban per flussi di lavoro, avanzamento attivita e gestione visuale delle priorita operative.",
    value:
      "Avvicina produzione e project management con un'interfaccia immediata e orientata all'azione.",
    tags: ["Kanban", "WIP", "Priorita", "Operations"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Board", "Card lavoro", "Stati flusso"],
  },
  {
    id: "kanbanflow-1",
    title: "KanbanFlow v1",
    category: "supply",
    type: "html",
    status: "Production board",
    url: "kanbanflow-v1.html",
    description:
      "Seconda variante del sistema KanbanFlow per confronto e iterazione della board operativa.",
    value:
      "Mostra sviluppo incrementale di strumenti per controllo WIP e coordinamento attivita.",
    tags: ["Kanban", "WIP", "Iteration"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Board alternativa", "Flusso lavoro"],
  },
  {
    id: "business-plan-tessilenext",
    title: "Business Plan TessileNext",
    category: "supply",
    type: "html",
    status: "Business planning",
    url: "business-plan-tessilenext.html",
    featured: true,
    description:
      "Business plan digitale per TessileNext S.r.l. con struttura da Smart&Start, mercato, prodotto, marketing e piano operativo.",
    value:
      "Integra visione industriale, sostenibilita e capacita di comunicare un progetto imprenditoriale in formato web.",
    tags: ["Business plan", "Smart&Start", "Tessile", "Strategy"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Executive summary", "Market analysis", "Piano operativo", "Team"],
  },
  {
    id: "business-plan-web",
    title: "Business Plan Web",
    category: "supply",
    type: "html",
    status: "Business planning",
    url: "business-plan-web.html",
    description:
      "Template evoluto di business plan web con sezioni su progetto, opportunita, soluzione e modello operativo.",
    value:
      "Mostra capacita di strutturare presentazioni business in formato web interattivo.",
    tags: ["Business", "Planning", "Web", "Startup"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Piano web", "Narrativa progetto", "Sezioni business"],
  },
  {
    id: "business-plan-web-1",
    title: "Business Plan Web v1",
    category: "supply",
    type: "html",
    status: "Business planning",
    url: "business-plan-web-v1.html",
    description:
      "Variante del business plan web, utile come storico progettuale e base per ulteriori personalizzazioni.",
    value:
      "Evidenzia iterazione e capacita di creare sistemi documentali digitali riusabili.",
    tags: ["Business", "Versioning", "Web"],
    stack: ["HTML", "CSS", "JavaScript"],
    deliverables: ["Versione alternativa", "Piano web"],
  },
  {
    id: "erp-control-panel",
    title: "ERP Frontend Control Panel",
    category: "supply",
    type: "jsx",
    status: "ERP prototype",
    url: "erp-control-panel.jsx",
    description:
      "Prototipo frontend ERP per controllo operativo, pensato come ponte fra CAD tessile, produzione e gestione dati.",
    value:
      "Dimostra pensiero sistemico: prodotto, reparto, dati e controllo in un'unica architettura applicativa.",
    tags: ["ERP", "Frontend", "Operations", "Control panel"],
    stack: ["React", "JSX", "ERP workflow"],
    deliverables: ["Control panel", "Componenti ERP", "Workflow dati"],
  },
];
