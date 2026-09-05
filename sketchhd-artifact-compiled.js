const {
  useState,
  useMemo,
  useReducer,
  useRef,
  useEffect,
  useCallback
} = React;

// ─────────────────────────────────────────────────────────────────
// DESIGN SYSTEM
// ─────────────────────────────────────────────────────────────────
const DS = {
  bg: "#0D0E12",
  surface: "#13151B",
  surface2: "#1A1D26",
  border: "rgba(255,255,255,0.07)",
  border2: "rgba(255,255,255,0.12)",
  amber: "#E8950A",
  amberDim: "#A86A07",
  teal: "#1FB896",
  red: "#F03E3E",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  green: "#22C55E",
  orange: "#F97316",
  pink: "#EC4899",
  yellow: "#EAB308",
  text: "#F0F1F5",
  text2: "rgba(240,241,245,0.55)",
  text3: "rgba(240,241,245,0.22)",
  font: "'SF Mono','JetBrains Mono',monospace",
  fontUI: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
};
const STATUS_C = {
  draft: DS.text3,
  confirmed: DS.blue,
  planned: DS.purple,
  fulfilled: DS.teal,
  suggested: DS.text2,
  approved: DS.amber,
  ordered: DS.blue,
  in_transit: DS.orange,
  received: DS.green,
  active: DS.teal,
  paused: DS.orange,
  completed: DS.green,
  cancelled: DS.red,
  pending: DS.amber
};
const STATUS_L = {
  draft: "Bozza",
  confirmed: "Confermato",
  planned: "Pianificato",
  fulfilled: "Evaso",
  suggested: "Suggerito",
  approved: "Approvato",
  ordered: "Ordinato",
  in_transit: "In Transito",
  received: "Ricevuto",
  active: "Attivo",
  paused: "Sospeso",
  completed: "Completato",
  cancelled: "Annullato",
  pending: "In attesa"
};
const LOT_L = {
  L4L: "Lotto×Lotto",
  MOQ: "MOQ",
  MULTIPLE: "Multiplo"
};
const PALETTE = ["#E8950A", "#1FB896", "#3B82F6", "#8B5CF6", "#F03E3E", "#F97316", "#22C55E", "#EC4899", "#06B6D4", "#A78BFA", "#34D399", "#FB923C"];
const PICONS = ["🏢", "🏭", "🏬", "🚢", "✈️", "🌍", "💼", "🤝", "⭐", "🎯", "🔵", "🏗", "🏆", "💎"];
const CICONS = ["📦", "🔩", "⚪", "🔘", "📏", "🧵", "🔷", "🔶", "⚙️", "🎯", "🏷", "🔑", "🧩", "📌", "🎲", "🪡", "🧶", "🪢"];
const uid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
const fNum = v => v === 0 ? "—" : Number(v).toLocaleString("it-IT");
const fEur = v => v === 0 ? "—" : `€ ${Number(v).toFixed(2)}`;
const fEurK = v => v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : `€${v.toFixed(0)}`;
const now = () => new Date().toLocaleDateString("it-IT");
const wSort = (a, b) => {
  const n = x => x <= 43 ? x + 53 : x;
  return n(a) - n(b);
};
const ALL_WEEKS = Array.from({
  length: 53
}, (_, i) => i + 1);

// PM PHASES from PDF (Bandinelli UNIFI)
const PM_PHASES = [{
  id: "concezione",
  label: "Concezione",
  color: DS.purple,
  icon: "💡",
  desc: "Ideazione, analisi bisogno, business case"
}, {
  id: "avvio",
  label: "Avvio",
  color: DS.blue,
  icon: "🚀",
  desc: "Project Charter, scope, stakeholder"
}, {
  id: "pianificazione",
  label: "Pianificazione",
  color: DS.amber,
  icon: "📋",
  desc: "WBS, OBS, pianificazione tempi/costi/rischi"
}, {
  id: "programmazione",
  label: "Programmazione",
  color: DS.orange,
  icon: "📅",
  desc: "Gantt, CPM, PERT, schedulazione attività"
}, {
  id: "esecuzione",
  label: "Esecuzione",
  color: DS.teal,
  icon: "⚙️",
  desc: "Realizzazione tecnica del progetto"
}, {
  id: "controllo",
  label: "Controllo",
  color: DS.pink,
  icon: "📊",
  desc: "Monitoraggio, EVM, scostamenti, reporting"
}, {
  id: "chiusura",
  label: "Chiusura",
  color: DS.green,
  icon: "✅",
  desc: "Lesson learned, chiusura formale"
}];
const RISK_LEVELS = [{
  v: "low",
  l: "Basso",
  c: DS.green
}, {
  v: "medium",
  l: "Medio",
  c: DS.orange
}, {
  v: "high",
  l: "Alto",
  c: DS.red
}, {
  v: "critical",
  l: "Critico",
  c: "#FF00FF"
}];

// ─────────────────────────────────────────────────────────────────
// DEFAULT STATE  (MRP + PM unified)
// ─────────────────────────────────────────────────────────────────
const buildDefault = () => {
  const pP = uid(),
    pJ = uid();
  const cEl = uid(),
    cRi = uid(),
    cPk = uid(),
    cBo = uid(),
    cSt = uid(),
    cTe = uid();
  const sF = uid(),
    sT = uid(),
    sO = uid(),
    sPk = uid();
  const siEl = uid(),
    siRi = uid(),
    siPk = uid(),
    siBo = uid(),
    siSt = uid(),
    siTe = uid();
  const cu1 = uid(),
    cu2 = uid(),
    cu3 = uid();
  const proj1 = uid(),
    proj2 = uid();
  const wp1 = uid(),
    wp2 = uid(),
    wp3 = uid(),
    wp4 = uid(),
    wp5 = uid();
  return {
    // MRP DATA
    weeks: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    products: [{
      id: pP,
      label: "Pantony",
      color: "#3B82F6"
    }, {
      id: pJ,
      label: "Jacket-shirt",
      color: "#8B5CF6"
    }],
    bom: {
      [cEl]: {
        [pP]: 1,
        [pJ]: 0
      },
      [cRi]: {
        [pP]: 1,
        [pJ]: 0
      },
      [cPk]: {
        [pP]: 1,
        [pJ]: 1
      },
      [cBo]: {
        [pP]: 24,
        [pJ]: 3
      },
      [cSt]: {
        [pP]: 0,
        [pJ]: 2
      },
      [cTe]: {
        [pP]: 5,
        [pJ]: 8
      }
    },
    components: [{
      id: cEl,
      label: "Elastico",
      icon: "⚪",
      color: "#8B5CF6",
      inventory: 10
    }, {
      id: cRi,
      label: "Rinforzo",
      icon: "🔩",
      color: "#6B7280",
      inventory: 20
    }, {
      id: cPk,
      label: "Packaging",
      icon: "📦",
      color: "#F97316",
      inventory: 80
    }, {
      id: cBo,
      label: "Bottoni",
      icon: "🔘",
      color: "#E8950A",
      inventory: 20
    }, {
      id: cSt,
      label: "Stecche",
      icon: "📏",
      color: "#22C55E",
      inventory: 50
    }, {
      id: cTe,
      label: "Comp. Tessuto",
      icon: "🧵",
      color: "#3B82F6",
      inventory: 0
    }],
    demand: [{
      id: uid(),
      type: "customer",
      productId: pP,
      week: 46,
      qty: 50,
      refId: cu1,
      status: "confirmed",
      note: "Ordine primavera"
    }, {
      id: uid(),
      type: "customer",
      productId: pJ,
      week: 46,
      qty: 40,
      refId: cu1,
      status: "confirmed",
      note: "Ordine primavera"
    }, {
      id: uid(),
      type: "customer",
      productId: pP,
      week: 1,
      qty: 60,
      refId: cu2,
      status: "confirmed",
      note: ""
    }, {
      id: uid(),
      type: "customer",
      productId: pJ,
      week: 1,
      qty: 60,
      refId: cu2,
      status: "confirmed",
      note: "Urgente"
    }, {
      id: uid(),
      type: "customer",
      productId: pP,
      week: 5,
      qty: 30,
      refId: cu3,
      status: "confirmed",
      note: ""
    }, {
      id: uid(),
      type: "customer",
      productId: pJ,
      week: 5,
      qty: 30,
      refId: cu3,
      status: "confirmed",
      note: ""
    }, {
      id: uid(),
      type: "customer",
      productId: pP,
      week: 8,
      qty: 50,
      refId: cu1,
      status: "confirmed",
      note: ""
    }, {
      id: uid(),
      type: "customer",
      productId: pJ,
      week: 8,
      qty: 50,
      refId: cu3,
      status: "confirmed",
      note: ""
    }],
    customers: [{
      id: cu1,
      label: "Manifattura Rossi S.r.l.",
      icon: "🏢",
      color: "#3B82F6",
      contact: "Mario Rossi",
      email: "m.rossi@manifattura.it",
      note: "Cliente storico"
    }, {
      id: cu2,
      label: "Fashion Nord SpA",
      icon: "🏬",
      color: "#8B5CF6",
      contact: "Anna Bianchi",
      email: "abianchi@fashionnord.com",
      note: "Pronto moda"
    }, {
      id: cu3,
      label: "Boutique Sud",
      icon: "⭐",
      color: "#E8950A",
      contact: "Luca Verdi",
      email: "info@boutiquesud.it",
      note: "Piccoli ordini"
    }],
    suppliers: [{
      id: sF,
      label: "Filatura Bini S.r.l.",
      icon: "🏭",
      color: "#8B5CF6",
      contact: "Paolo Bini",
      email: "p.bini@filaturabin.it",
      note: "Filatura principale"
    }, {
      id: sT,
      label: "Tintoria Mengoni",
      icon: "🎨",
      color: "#F03E3E",
      contact: "Sara Mengoni",
      email: "info@tintoria.it",
      note: "Specializzata lana"
    }, {
      id: sO,
      label: "Orditura Conti",
      icon: "🔗",
      color: "#22C55E",
      contact: "Marco Conti",
      email: "m.conti@ordconti.it",
      note: "Solo orditura"
    }, {
      id: sPk,
      label: "Stamperia Prato",
      icon: "📦",
      color: "#F97316",
      contact: "Giulia Neri",
      email: "g.neri@stamperia.it",
      note: "Packaging tessile"
    }],
    supplierItems: [{
      id: siEl,
      supplierId: sF,
      compId: cEl,
      price: 1.80,
      minOrder: 100,
      leadTime: 1,
      lotSizing: "MOQ"
    }, {
      id: siRi,
      supplierId: sF,
      compId: cRi,
      price: 2.10,
      minOrder: 50,
      leadTime: 3,
      lotSizing: "L4L"
    }, {
      id: siPk,
      supplierId: sPk,
      compId: cPk,
      price: 0.45,
      minOrder: 80,
      leadTime: 2,
      lotSizing: "MULTIPLE"
    }, {
      id: siBo,
      supplierId: sT,
      compId: cBo,
      price: 0.08,
      minOrder: 500,
      leadTime: 2,
      lotSizing: "MOQ"
    }, {
      id: siSt,
      supplierId: sO,
      compId: cSt,
      price: 3.20,
      minOrder: 50,
      leadTime: 3,
      lotSizing: "L4L"
    }, {
      id: siTe,
      supplierId: sF,
      compId: cTe,
      price: 8.50,
      minOrder: 100,
      leadTime: 3,
      lotSizing: "MULTIPLE"
    }],
    supplyOrders: [{
      id: uid(),
      compId: cEl,
      supplierId: sF,
      qty: 100,
      releaseWeek: 44,
      expectedWeek: 45,
      status: "in_transit",
      cost: 180,
      mrpRef: null,
      createdAt: now(),
      note: "OA esistente"
    }],
    // PROJECT MANAGEMENT DATA
    projects: [{
      id: proj1,
      name: "Collezione Primavera/Estate 2026",
      pm: "Marco Ferretti",
      phase: "pianificazione",
      status: "active",
      budget: 85000,
      spent: 12400,
      startWeek: 43,
      endWeek: 8,
      color: "#E8950A",
      description: "Sviluppo e produzione collezione P/E 2026 per 3 buyer principali.",
      objectives: "Consegnare 400 capi entro W8 · Qualità A-grade · Costo/capo ≤ €68",
      notes: "Analisi stakeholder completata. WBS in validazione."
    }, {
      id: proj2,
      name: "Implementazione ERP Tessile",
      pm: "Sofia Marchetti",
      phase: "esecuzione",
      status: "active",
      budget: 42000,
      spent: 28000,
      startWeek: 40,
      endWeek: 20,
      color: "#3B82F6",
      description: "Digitalizzazione cicli di lavorazione tessile con sistema ERP.",
      objectives: "Go-live moduli MRP e WMS entro W20 · Formazione operatori",
      notes: "Modulo WMS completato. MRP in test."
    }],
    workPackages: [{
      id: wp1,
      projectId: proj1,
      name: "Ricerca materiali e forniture",
      phase: "pianificazione",
      responsible: "Anna Bini",
      startWeek: 43,
      endWeek: 46,
      status: "completed",
      effort: 24,
      cost: 3200,
      isMilestone: false,
      description: "Selezione fornitori filati e tessuti stagione P/E"
    }, {
      id: wp2,
      projectId: proj1,
      name: "Sviluppo campionario",
      phase: "esecuzione",
      responsible: "Luca Rossi",
      startWeek: 46,
      endWeek: 52,
      status: "active",
      effort: 80,
      cost: 5800,
      isMilestone: false,
      description: "Produzione campioni per approvazione buyer"
    }, {
      id: wp3,
      projectId: proj1,
      name: "Approvazione buyer — MILESTONE",
      phase: "esecuzione",
      responsible: "Marco Ferretti",
      startWeek: 52,
      endWeek: 52,
      status: "pending",
      effort: 8,
      cost: 0,
      isMilestone: true,
      description: "Presentazione campionario ai 3 buyer principali"
    }, {
      id: wp4,
      projectId: proj1,
      name: "Produzione primo campionario",
      phase: "esecuzione",
      responsible: "Team produzione",
      startWeek: 1,
      endWeek: 5,
      status: "pending",
      effort: 120,
      cost: 8400,
      isMilestone: false,
      description: "Ordini di produzione attivati post-approvazione"
    }, {
      id: wp5,
      projectId: proj2,
      name: "Configurazione modulo MRP",
      phase: "esecuzione",
      responsible: "Sofia Marchetti",
      startWeek: 44,
      endWeek: 50,
      status: "completed",
      effort: 60,
      cost: 9000,
      isMilestone: false,
      description: "Setup parametri MRP: BOM, cicli, LT fornitori"
    }],
    risks: [{
      id: uid(),
      projectId: proj1,
      title: "Ritardo fornitore tessuto principale",
      level: "high",
      probability: 0.4,
      impact: 0.8,
      mitigation: "Fornitore alternativo pre-qualificato",
      status: "open"
    }, {
      id: uid(),
      projectId: proj1,
      title: "Variazioni colori non approvate dal buyer",
      level: "medium",
      probability: 0.3,
      impact: 0.5,
      mitigation: "Ciclo approvazione anticipato W50",
      status: "open"
    }, {
      id: uid(),
      projectId: proj2,
      title: "Resistenza adozione sistema da parte operatori",
      level: "medium",
      probability: 0.5,
      impact: 0.6,
      mitigation: "Piano formazione strutturato",
      status: "mitigated"
    }]
  };
};

// ─────────────────────────────────────────────────────────────────
// MRP ENGINE
// ─────────────────────────────────────────────────────────────────
function applyLotSizing(shortage, si) {
  if (shortage <= 0) return 0;
  switch (si.lotSizing) {
    case "L4L":
      return shortage;
    case "MOQ":
      return Math.max(shortage, si.minOrder);
    case "MULTIPLE":
      return Math.ceil(shortage / si.minOrder) * si.minOrder;
    default:
      return shortage;
  }
}
function runMRP({
  weeks,
  products,
  components,
  bom,
  demand,
  supplierItems,
  supplyOrders
}) {
  const N = weeks.length;
  const active = demand.filter(d => ["confirmed", "planned"].includes(d.status));
  const gross = {};
  for (const c of components) {
    gross[c.id] = Array(N).fill(0);
    for (const d of active) {
      const bq = (bom[c.id] || {})[d.productId] || 0;
      if (!bq) continue;
      const wi = weeks.indexOf(d.week);
      if (wi >= 0) gross[c.id][wi] += d.qty * bq;
    }
  }
  const schedRec = {};
  for (const c of components) schedRec[c.id] = Array(N).fill(0);
  for (const so of supplyOrders) {
    if (["approved", "ordered", "in_transit"].includes(so.status)) {
      const wi = weeks.indexOf(so.expectedWeek);
      if (wi >= 0 && schedRec[so.compId]) schedRec[so.compId][wi] += so.qty;
    }
  }
  const results = {};
  for (const comp of components) {
    const g = gross[comp.id],
      sr = schedRec[comp.id];
    const pab = Array(N).fill(0),
      netReq = Array(N).fill(0),
      planRec = Array(N).fill(0),
      planRel = Array(N).fill(0);
    const suggestedOrders = [],
      shortages = [];
    const cSIs = supplierItems.filter(si => si.compId === comp.id).sort((a, b) => a.price - b.price);
    const bestSI = cSIs[0] || null;
    const lt = bestSI?.leadTime || 1;
    let prev = comp.inventory || 0;
    for (let wi = 0; wi < N; wi++) {
      const proj = prev + sr[wi] - g[wi];
      if (proj < 0) {
        const sh = -proj;
        const si = cSIs.reduce((b, s) => {
          const q = applyLotSizing(sh, s);
          const bq = applyLotSizing(sh, b || s);
          return q * s.price < bq * b.price ? s : b;
        }, cSIs[0]) || bestSI;
        const qty = si ? applyLotSizing(sh, si) : sh;
        planRec[wi] = qty;
        netReq[wi] = sh;
        pab[wi] = proj + qty;
        const ri = wi - lt;
        if (ri >= 0) {
          planRel[ri] += qty;
          if (si) suggestedOrders.push({
            weekIdx: ri,
            receiptWi: wi,
            qty,
            si,
            cost: qty * si.price
          });
        } else shortages.push({
          weekIdx: wi,
          qty: sh,
          gross: g[wi]
        });
      } else {
        pab[wi] = proj;
      }
      prev = pab[wi];
    }
    const demandSources = weeks.map(w => active.filter(d => {
      const bq = (bom[comp.id] || {})[d.productId] || 0;
      return d.week === w && bq > 0;
    }).map(d => ({
      ...d,
      bomQty: (bom[comp.id] || {})[d.productId] || 0,
      compQty: d.qty * ((bom[comp.id] || {})[d.productId] || 0)
    })));
    results[comp.id] = {
      gross: g,
      schedRec: sr,
      pab,
      netReq,
      planRec,
      planRel,
      suggestedOrders,
      shortages,
      demandSources,
      hasShortage: shortages.length > 0,
      totalGross: g.reduce((a, b) => a + b, 0),
      minPAB: Math.min(...pab),
      bestSI
    };
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────
// REDUCER
// ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case "RESET":
      return buildDefault();
    case "TOGGLE_WEEK":
      {
        const ex = state.weeks.includes(action.w);
        const nw = ex ? state.weeks.filter(x => x !== action.w) : [...state.weeks, action.w].sort(wSort);
        return {
          ...state,
          weeks: nw
        };
      }
    case "ADD_PRODUCT":
      {
        const id = uid();
        const nb = {
          ...state.bom
        };
        for (const c of state.components) nb[c.id] = {
          ...(nb[c.id] || {}),
          [id]: 0
        };
        return {
          ...state,
          products: [...state.products, {
            id,
            label: "Prodotto",
            color: PALETTE[state.products.length % PALETTE.length]
          }],
          bom: nb
        };
      }
    case "UPD_PRODUCT":
      return {
        ...state,
        products: state.products.map(p => p.id === action.id ? {
          ...p,
          [action.f]: action.v
        } : p)
      };
    case "DEL_PRODUCT":
      {
        const nb = {
          ...state.bom
        };
        Object.keys(nb).forEach(k => {
          const r = {
            ...nb[k]
          };
          delete r[action.id];
          nb[k] = r;
        });
        return {
          ...state,
          products: state.products.filter(p => p.id !== action.id),
          bom: nb,
          demand: state.demand.filter(d => d.productId !== action.id)
        };
      }
    case "ADD_COMP":
      {
        const id = uid();
        const row = {};
        state.products.forEach(p => {
          row[p.id] = 0;
        });
        return {
          ...state,
          components: [...state.components, {
            id,
            label: "Componente",
            icon: CICONS[state.components.length % CICONS.length],
            color: PALETTE[(state.components.length + 3) % PALETTE.length],
            inventory: 0
          }],
          bom: {
            ...state.bom,
            [id]: row
          }
        };
      }
    case "UPD_COMP":
      return {
        ...state,
        components: state.components.map(c => c.id === action.id ? {
          ...c,
          [action.f]: action.v
        } : c)
      };
    case "DEL_COMP":
      {
        const nb = {
          ...state.bom
        };
        delete nb[action.id];
        return {
          ...state,
          components: state.components.filter(c => c.id !== action.id),
          bom: nb,
          supplierItems: state.supplierItems.filter(si => si.compId !== action.id)
        };
      }
    case "UPD_BOM":
      {
        const r = {
          ...(state.bom[action.cid] || {}),
          [action.pid]: action.qty
        };
        return {
          ...state,
          bom: {
            ...state.bom,
            [action.cid]: r
          }
        };
      }
    case "ADD_DEMAND":
      return {
        ...state,
        demand: [...state.demand, {
          id: uid(),
          createdAt: now(),
          ...action.item
        }]
      };
    case "UPD_DEMAND":
      return {
        ...state,
        demand: state.demand.map(d => d.id === action.id ? {
          ...d,
          ...action.patch
        } : d)
      };
    case "DEL_DEMAND":
      return {
        ...state,
        demand: state.demand.filter(d => d.id !== action.id)
      };
    case "ADD_CUSTOMER":
      return {
        ...state,
        customers: [...state.customers, {
          id: uid(),
          ...action.cust
        }]
      };
    case "UPD_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map(c => c.id === action.id ? {
          ...c,
          ...action.patch
        } : c)
      };
    case "DEL_CUSTOMER":
      return {
        ...state,
        customers: state.customers.filter(c => c.id !== action.id),
        demand: state.demand.filter(d => d.refId !== action.id)
      };
    case "ADD_SUPPLIER":
      return {
        ...state,
        suppliers: [...state.suppliers, {
          id: uid(),
          ...action.sup
        }]
      };
    case "UPD_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map(s => s.id === action.id ? {
          ...s,
          ...action.patch
        } : s)
      };
    case "DEL_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.id),
        supplierItems: state.supplierItems.filter(si => si.supplierId !== action.id)
      };
    case "ADD_SI":
      return {
        ...state,
        supplierItems: [...state.supplierItems, {
          id: uid(),
          ...action.si
        }]
      };
    case "UPD_SI":
      return {
        ...state,
        supplierItems: state.supplierItems.map(si => si.id === action.id ? {
          ...si,
          ...action.patch
        } : si)
      };
    case "DEL_SI":
      return {
        ...state,
        supplierItems: state.supplierItems.filter(si => si.id !== action.id)
      };
    case "ADD_SO":
      return {
        ...state,
        supplyOrders: [...state.supplyOrders, {
          id: uid(),
          createdAt: now(),
          ...action.so
        }]
      };
    case "UPD_SO_STATUS":
      return {
        ...state,
        supplyOrders: state.supplyOrders.map(so => so.id === action.id ? {
          ...so,
          status: action.status
        } : so)
      };
    case "DEL_SO":
      return {
        ...state,
        supplyOrders: state.supplyOrders.filter(so => so.id !== action.id)
      };
    // PM ACTIONS
    case "ADD_PROJECT":
      return {
        ...state,
        projects: [...state.projects, {
          id: uid(),
          createdAt: now(),
          ...action.proj
        }]
      };
    case "UPD_PROJECT":
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.id ? {
          ...p,
          ...action.patch
        } : p)
      };
    case "DEL_PROJECT":
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        workPackages: state.workPackages.filter(w => w.projectId !== action.id),
        risks: state.risks.filter(r => r.projectId !== action.id)
      };
    case "ADD_WP":
      return {
        ...state,
        workPackages: [...state.workPackages, {
          id: uid(),
          createdAt: now(),
          ...action.wp
        }]
      };
    case "UPD_WP":
      return {
        ...state,
        workPackages: state.workPackages.map(w => w.id === action.id ? {
          ...w,
          ...action.patch
        } : w)
      };
    case "DEL_WP":
      return {
        ...state,
        workPackages: state.workPackages.filter(w => w.id !== action.id)
      };
    case "ADD_RISK":
      return {
        ...state,
        risks: [...state.risks, {
          id: uid(),
          createdAt: now(),
          ...action.risk
        }]
      };
    case "UPD_RISK":
      return {
        ...state,
        risks: state.risks.map(r => r.id === action.id ? {
          ...r,
          ...action.patch
        } : r)
      };
    case "DEL_RISK":
      return {
        ...state,
        risks: state.risks.filter(r => r.id !== action.id)
      };
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────
const GS = () => /*#__PURE__*/React.createElement("style", null, `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Syne:wght@400;600;700;800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${DS.bg};color:${DS.text};font-family:${DS.fontUI}}
  ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
  input,select,button{font-family:inherit} input::placeholder{color:${DS.text3}} input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  .hr:hover{background:rgba(255,255,255,0.03)!important} .tbtn:hover{background:rgba(255,255,255,0.06)!important}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fi{animation:fadeIn 0.2s ease}
`);

// ─────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────
const Box = ({
  children,
  s = {}
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: DS.surface,
    border: `1px solid ${DS.border}`,
    borderRadius: 10,
    ...s
  }
}, children);
const Sep = ({
  l = 0
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height: 1,
    background: DS.border,
    marginLeft: l
  }
});
const Tag = ({
  c,
  label,
  s = {}
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    background: c + "25",
    color: c,
    borderRadius: 4,
    padding: "2px 7px",
    fontSize: 11,
    fontWeight: 600,
    ...s
  }
}, label);
const Mono = ({
  children,
  s = {}
}) => /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: DS.font,
    fontSize: 11,
    ...s
  }
}, children);
const Ico = ({
  icon,
  color,
  sz = 36
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: sz,
    height: sz,
    borderRadius: Math.round(sz * 0.26),
    background: color + "22",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: sz * 0.48,
    flexShrink: 0
  }
}, icon);
const StatusTag = ({
  s
}) => {
  const c = STATUS_C[s] || DS.text3;
  return /*#__PURE__*/React.createElement(Tag, {
    c: c,
    label: STATUS_L[s] || s
  });
};
function Btn({
  label,
  color = DS.amber,
  icon,
  onClick,
  sm,
  ghost,
  danger,
  disabled,
  style: ex = {}
}) {
  const bg = ghost ? "transparent" : danger ? DS.red + "18" : color;
  const tc = ghost ? DS.text2 : danger ? DS.red : color === DS.amber ? "#000" : "#fff";
  const br = ghost ? `1px solid ${DS.border2}` : danger ? `1px solid ${DS.red}` : "none";
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    style: {
      background: bg,
      color: tc,
      border: br,
      borderRadius: 7,
      padding: sm ? "4px 10px" : "8px 16px",
      fontSize: sm ? 11 : 13,
      fontWeight: 700,
      cursor: disabled ? "default" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: 5,
      transition: "opacity 0.1s",
      opacity: disabled ? 0.4 : 1,
      fontFamily: "inherit",
      whiteSpace: "nowrap",
      ...ex
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, icon), label);
}
function Inp({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  accent = DS.amber,
  mb = 12
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: mb
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(type === "number" ? Number(e.target.value) || 0 : e.target.value),
    style: {
      width: "100%",
      background: DS.surface2,
      border: `1px solid ${DS.border}`,
      borderRadius: 7,
      padding: "9px 12px",
      color: DS.text,
      fontSize: 14,
      outline: "none"
    },
    onFocus: e => e.target.style.borderColor = accent,
    onBlur: e => e.target.style.borderColor = DS.border
  }), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      marginTop: 4
    }
  }, hint));
}
function Sel({
  label,
  value,
  onChange,
  options,
  mb = 12
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: mb
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: e => onChange(e.target.value),
    style: {
      width: "100%",
      background: DS.surface2,
      border: `1px solid ${DS.border}`,
      borderRadius: 7,
      padding: "9px 12px",
      color: DS.text,
      fontSize: 14,
      outline: "none",
      cursor: "pointer"
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.v,
    value: o.v
  }, o.l))));
}
function Modal({
  open,
  onClose,
  title,
  width = 480,
  children
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)"
    },
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      position: "relative",
      background: DS.surface,
      border: `1px solid ${DS.border2}`,
      borderRadius: 14,
      width: "100%",
      maxWidth: width,
      maxHeight: "88vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 16,
      fontWeight: 700,
      color: DS.text
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: DS.text2,
      cursor: "pointer",
      fontSize: 18,
      padding: 4
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      padding: "20px",
      flex: 1
    }
  }, children)));
}
const ColorPicker = ({
  value,
  onChange
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 10,
    color: DS.text2,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8
  }
}, "Colore"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8
  }
}, PALETTE.map(c => /*#__PURE__*/React.createElement("div", {
  key: c,
  onClick: () => onChange(c),
  style: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: c,
    cursor: "pointer",
    border: value === c ? "2px solid #fff" : "2px solid transparent",
    transform: value === c ? "scale(1.1)" : "scale(1)",
    transition: "all 0.1s"
  }
}))));

// ─────────────────────────────────────────────────────────────────
// MRP GRID
// ─────────────────────────────────────────────────────────────────
function MRPGrid({
  result,
  weeks,
  onCellClick
}) {
  const ROWS = [{
    key: "gross",
    label: "Fabb. Lordo",
    color: DS.red
  }, {
    key: "schedRec",
    label: "Ord. Aperti",
    color: DS.orange
  }, {
    key: "pab",
    label: "Scorte PAB",
    color: DS.text
  }, {
    key: "netReq",
    label: "Fabb. Netto",
    color: DS.purple
  }, {
    key: "planRec",
    label: "Ric. Pian.",
    color: DS.teal
  }, {
    key: "planRel",
    label: "Ord. Rilascio",
    color: DS.amber
  }];
  const CW = 52,
    LW = 104;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      borderRadius: 8,
      border: `1px solid ${DS.border}`,
      background: DS.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: LW + CW * weeks.length
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: LW,
      minWidth: LW,
      flexShrink: 0,
      borderRight: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      background: DS.surface2,
      borderBottom: `1px solid ${DS.border}`,
      display: "flex",
      alignItems: "center",
      paddingLeft: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 700,
      color: DS.text3,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: DS.font
    }
  }, "Settimana")), ROWS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.key,
    style: {
      height: 32,
      display: "flex",
      alignItems: "center",
      paddingLeft: 10,
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: r.color,
      fontFamily: DS.font
    }
  }, r.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 28,
      background: DS.surface2,
      borderBottom: `1px solid ${DS.border}`
    }
  }, weeks.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: CW,
      minWidth: CW,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRight: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: DS.text2,
      fontFamily: DS.font
    }
  }, "W", w)))), ROWS.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.key,
    style: {
      display: "flex",
      height: 32,
      borderBottom: `1px solid ${DS.border}`
    }
  }, (result[r.key] || []).map((v, i) => {
    const isSht = r.key === "pab" && v < 0;
    const isRel = r.key === "planRel" && v > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: r.key === "gross" && v > 0 && onCellClick ? () => onCellClick(i) : undefined,
      style: {
        width: CW,
        minWidth: CW,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRight: `1px solid ${DS.border}`,
        background: isRel ? "rgba(232,149,10,0.12)" : isSht ? "rgba(240,62,62,0.12)" : v > 0 ? r.color + "10" : "transparent",
        cursor: r.key === "gross" && v > 0 && onCellClick ? "pointer" : "default"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontFamily: DS.font,
        fontWeight: v !== 0 ? 600 : 400,
        color: isSht ? DS.red : v > 0 ? r.color : DS.text3
      }
    }, v === 0 ? "—" : fNum(v)));
  }))))));
}

// ─────────────────────────────────────────────────────────────────
// GANTT CHART COMPONENT  (PDF: Diagramma di Gantt)
// ─────────────────────────────────────────────────────────────────
function GanttChart({
  workPackages,
  allWeeks,
  projectId
}) {
  const wps = workPackages.filter(w => w.projectId === projectId);
  if (!wps.length) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: "center",
      color: DS.text3
    }
  }, "Nessun work package. Aggiungine uno.");
  // Find range
  const minW = Math.min(...wps.map(w => w.startWeek));
  const maxW = Math.max(...wps.map(w => w.endWeek));
  // Build week list for display range (sorted)
  const allSorted = [...new Set([...wps.map(w => w.startWeek), ...wps.map(w => w.endWeek)])].sort(wSort);
  const displayWeeks = ALL_WEEKS.filter(w => {
    const sorted = allSorted;
    const s = sorted[0],
      e = sorted[sorted.length - 1];
    // naive: include weeks in range
    return true;
  });
  // Use a simplified range: just show allWeeks intersected with range
  const weekRange = allWeeks.filter(w => {
    const nw = x => x <= 43 ? x + 53 : x;
    return nw(w) >= nw(minW) && nw(w) <= nw(maxW);
  });
  if (!weekRange.length) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: "center",
      color: DS.text3
    }
  }, "Configura le settimane in Config.");
  const CW = 52,
    LW = 180;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto",
      borderRadius: 8,
      border: `1px solid ${DS.border}`,
      background: DS.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      minWidth: LW + CW * weekRange.length
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: LW,
      minWidth: LW,
      flexShrink: 0,
      borderRight: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 32,
      background: DS.surface2,
      borderBottom: `1px solid ${DS.border}`,
      display: "flex",
      alignItems: "center",
      paddingLeft: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: DS.text2,
      fontFamily: DS.font,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, "Work Package")), wps.map((wp, i) => /*#__PURE__*/React.createElement("div", {
    key: wp.id,
    style: {
      height: 36,
      display: "flex",
      alignItems: "center",
      padding: "0 10px",
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: wp.isMilestone ? 700 : 400,
      color: wp.isMilestone ? DS.amber : DS.text,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, wp.isMilestone ? "◆ " : "", wp.name)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: 32,
      background: DS.surface2,
      borderBottom: `1px solid ${DS.border}`
    }
  }, weekRange.map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: CW,
      minWidth: CW,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRight: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: DS.text2,
      fontFamily: DS.font
    }
  }, "W", w)))), wps.map(wp => {
    const ph = PM_PHASES.find(p => p.id === wp.phase) || PM_PHASES[0];
    return /*#__PURE__*/React.createElement("div", {
      key: wp.id,
      style: {
        display: "flex",
        height: 36,
        borderBottom: `1px solid ${DS.border}`,
        position: "relative"
      }
    }, weekRange.map((w, i) => {
      const nw = x => x <= 43 ? x + 53 : x;
      const inRange = nw(w) >= nw(wp.startWeek) && nw(w) <= nw(wp.endWeek);
      const isStart = w === wp.startWeek,
        isEnd = w === wp.endWeek;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: CW,
          minWidth: CW,
          flexShrink: 0,
          borderRight: `1px solid ${DS.border}`,
          display: "flex",
          alignItems: "center",
          padding: "6px 2px"
        }
      }, inRange && /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          height: wp.isMilestone ? 18 : 20,
          background: wp.isMilestone ? DS.amber : ph.color + "60",
          border: `1px solid ${wp.isMilestone ? DS.amber : ph.color}`,
          borderRadius: wp.isMilestone ? "50%" : isStart ? "4px 0 0 4px" : isEnd ? "0 4px 4px 0" : "0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 8,
          fontWeight: 700,
          color: wp.isMilestone ? "#000" : "#fff",
          overflow: "hidden"
        }
      }, wp.isMilestone && isStart ? "◆" : isStart ? wp.name.slice(0, 3) : ""));
    }));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      padding: "8px 12px",
      borderTop: `1px solid ${DS.border}`,
      flexWrap: "wrap"
    }
  }, PM_PHASES.map(ph => /*#__PURE__*/React.createElement("div", {
    key: ph.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 8,
      borderRadius: 2,
      background: ph.color,
      border: `1px solid ${ph.color}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: DS.text3,
      fontFamily: DS.font
    }
  }, ph.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: "50%",
      background: DS.amber,
      border: `1px solid ${DS.amber}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: DS.text3,
      fontFamily: DS.font
    }
  }, "Milestone"))));
}

// ─────────────────────────────────────────────────────────────────
// PROJECT MANAGEMENT TAB
// ─────────────────────────────────────────────────────────────────
function ProgettiTab({
  state,
  dispatch
}) {
  const {
    projects,
    workPackages,
    risks,
    weeks
  } = state;
  const [view, setView] = useState("list"); // list|detail|gantt
  const [selId, setSelId] = useState(null);
  const [modal, setModal] = useState(null);
  const [projForm, setProjForm] = useState({});
  const [wpForm, setWpForm] = useState({});
  const [riskForm, setRiskForm] = useState({});
  const proj = projects.find(p => p.id === selId);
  const projWPs = workPackages.filter(w => w.projectId === selId);
  const projRisks = risks.filter(r => r.projectId === selId);
  const phaseIdx = id => PM_PHASES.findIndex(p => p.id === id);
  const progress = id => {
    const wps = workPackages.filter(w => w.projectId === id);
    if (!wps.length) return 0;
    return Math.round(wps.filter(w => w.status === "completed").length / wps.length * 100);
  };
  const budgetPct = id => {
    const p = projects.find(x => x.id === id);
    if (!p || !p.budget) return 0;
    return Math.round((p.spent || 0) / p.budget * 100);
  };
  const saveProj = () => {
    if (projForm.id) dispatch({
      type: "UPD_PROJECT",
      id: projForm.id,
      patch: projForm
    });else dispatch({
      type: "ADD_PROJECT",
      proj: {
        ...projForm,
        phase: "concezione",
        status: "active",
        spent: 0
      }
    });
    setModal(null);
    setProjForm({});
  };
  const saveWP = () => {
    if (wpForm.id) dispatch({
      type: "UPD_WP",
      id: wpForm.id,
      patch: wpForm
    });else dispatch({
      type: "ADD_WP",
      wp: {
        ...wpForm,
        projectId: selId,
        status: "pending",
        isMilestone: wpForm.isMilestone || false
      }
    });
    setModal(null);
    setWpForm({});
  };
  const saveRisk = () => {
    if (riskForm.id) dispatch({
      type: "UPD_RISK",
      id: riskForm.id,
      patch: riskForm
    });else dispatch({
      type: "ADD_RISK",
      risk: {
        ...riskForm,
        projectId: selId,
        status: "open"
      }
    });
    setModal(null);
    setRiskForm({});
  };

  // ── PROJECT LIST ──
  if (!selId || view === "list") return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      padding: 24,
      maxWidth: 1100
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editProj",
    onClose: () => setModal(null),
    title: projForm.id ? "Modifica progetto" : "Nuovo progetto",
    width: 520
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Nome progetto",
    value: projForm.name || "",
    onChange: v => setProjForm(p => ({
      ...p,
      name: v
    })),
    placeholder: "es. Collezione P/E 2026"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Project Manager",
    value: projForm.pm || "",
    onChange: v => setProjForm(p => ({
      ...p,
      pm: v
    })),
    placeholder: "Nome PM"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Settimana inizio",
    value: projForm.startWeek || 1,
    onChange: v => setProjForm(p => ({
      ...p,
      startWeek: v
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Settimana fine",
    value: projForm.endWeek || 20,
    onChange: v => setProjForm(p => ({
      ...p,
      endWeek: v
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement(Inp, {
    label: "Budget totale (\u20AC)",
    value: projForm.budget || 0,
    onChange: v => setProjForm(p => ({
      ...p,
      budget: v
    })),
    type: "number"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Descrizione",
    value: projForm.description || "",
    onChange: v => setProjForm(p => ({
      ...p,
      description: v
    })),
    placeholder: "Breve descrizione..."
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Obiettivi (SMART)",
    value: projForm.objectives || "",
    onChange: v => setProjForm(p => ({
      ...p,
      objectives: v
    })),
    placeholder: "Obiettivi misurabili..."
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Fase attuale",
    value: projForm.phase || "concezione",
    onChange: v => setProjForm(p => ({
      ...p,
      phase: v
    })),
    options: PM_PHASES.map(ph => ({
      v: ph.id,
      l: `${ph.icon} ${ph.label}`
    }))
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    value: projForm.color || DS.amber,
    onChange: v => setProjForm(p => ({
      ...p,
      color: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.amber,
    onClick: saveProj
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 20,
      fontWeight: 800,
      color: DS.text
    }
  }, "\uD83D\uDCCB Gestione Progetti"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: DS.text3,
      fontFamily: DS.font
    }
  }, "basato su PMBOK\xAE \xB7 Bandinelli UNIFI"), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Nuovo Progetto",
    color: DS.amber,
    style: {
      marginLeft: "auto"
    },
    onClick: () => {
      setProjForm({
        name: "",
        pm: "",
        budget: 0,
        description: "",
        objectives: "",
        startWeek: weeks[0] || 1,
        endWeek: weeks[weeks.length - 1] || 20,
        color: DS.amber,
        phase: "concezione",
        status: "active"
      });
      setModal("editProj");
    }
  })), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: "14px 16px",
      marginBottom: 20,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      minWidth: 600
    }
  }, PM_PHASES.map((ph, i) => {
    const cnt = projects.filter(p => p.phase === ph.id).length;
    return /*#__PURE__*/React.createElement("div", {
      key: ph.id,
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: "10px 12px",
        background: cnt > 0 ? ph.color + "18" : DS.surface2,
        border: `1px solid ${cnt > 0 ? ph.color : DS.border}`,
        borderRadius: i === 0 ? "8px 0 0 8px" : i === PM_PHASES.length - 1 ? "0 8px 8px 0" : "0",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        marginBottom: 3
      }
    }, ph.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        fontWeight: 700,
        color: cnt > 0 ? ph.color : DS.text2,
        fontFamily: DS.font,
        textTransform: "uppercase",
        letterSpacing: 0.5
      }
    }, ph.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: ph.color,
        fontFamily: "'Syne',sans-serif"
      }
    }, cnt)), i < PM_PHASES.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: DS.text3,
        fontSize: 14,
        flexShrink: 0,
        margin: "0 -1px",
        zIndex: 1
      }
    }, "\u203A"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
      gap: 14
    }
  }, projects.map(p => {
    const ph = PM_PHASES.find(x => x.id === p.phase) || PM_PHASES[0];
    const prog = progress(p.id);
    const bpct = budgetPct(p.id);
    const pRisks = risks.filter(r => r.projectId === p.id && r.level === "high" && r.status === "open");
    return /*#__PURE__*/React.createElement(Box, {
      key: p.id,
      s: {
        cursor: "pointer",
        transition: "border-color 0.15s"
      },
      onClick: () => {
        setSelId(p.id);
        setView("detail");
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: `linear-gradient(90deg,${p.color},transparent)`,
        borderRadius: "10px 10px 0 0"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "14px 16px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: p.color,
        marginTop: 4,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: DS.text,
        marginBottom: 2
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, "PM: ", p.pm || "—")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      c: ph.color,
      label: `${ph.icon} ${ph.label}`,
      s: {
        fontSize: 9
      }
    }), pRisks.length > 0 && /*#__PURE__*/React.createElement(Tag, {
      c: DS.red,
      label: `⚠ ${pRisks.length}`,
      s: {
        fontSize: 9
      }
    }))), p.description && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text3,
        marginBottom: 10,
        lineHeight: 1.5
      }
    }, p.description), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: DS.text3,
        marginBottom: 3,
        fontFamily: DS.font,
        textTransform: "uppercase",
        letterSpacing: 1
      }
    }, "Avanzamento WP"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: DS.surface2,
        borderRadius: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 2,
        background: prog >= 100 ? DS.green : prog > 50 ? DS.teal : DS.amber,
        width: `${prog}%`,
        transition: "width 0.5s"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: DS.text2,
        marginTop: 2,
        fontFamily: DS.font
      }
    }, prog, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: DS.text3,
        marginBottom: 3,
        fontFamily: DS.font,
        textTransform: "uppercase",
        letterSpacing: 1
      }
    }, "Budget"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: DS.surface2,
        borderRadius: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 2,
        background: bpct > 90 ? DS.red : bpct > 70 ? DS.orange : DS.teal,
        width: `${Math.min(100, bpct)}%`,
        transition: "width 0.5s"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: DS.text2,
        marginTop: 2,
        fontFamily: DS.font
      }
    }, fEurK(p.spent || 0), " / ", fEurK(p.budget || 0)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.text3,
        fontSize: 10
      }
    }, "W", p.startWeek, " \u2192 W", p.endWeek), /*#__PURE__*/React.createElement(StatusTag, {
      s: p.status
    }))));
  }), projects.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 48,
      textAlign: "center",
      color: DS.text3,
      gridColumn: "1/-1"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 10
    }
  }, "\uD83D\uDCCB"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      marginBottom: 8
    }
  }, "Nessun progetto"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12
    }
  }, "Clicca \"Nuovo Progetto\" per iniziare"))));

  // ── PROJECT DETAIL ──
  const ph = PM_PHASES.find(x => x.id === proj?.phase) || PM_PHASES[0];
  const prog = progress(proj?.id);
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editProj",
    onClose: () => setModal(null),
    title: "Modifica progetto",
    width: 520
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Nome",
    value: projForm.name || "",
    onChange: v => setProjForm(p => ({
      ...p,
      name: v
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Project Manager",
    value: projForm.pm || "",
    onChange: v => setProjForm(p => ({
      ...p,
      pm: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "W inizio",
    value: projForm.startWeek || 1,
    onChange: v => setProjForm(p => ({
      ...p,
      startWeek: v
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "W fine",
    value: projForm.endWeek || 20,
    onChange: v => setProjForm(p => ({
      ...p,
      endWeek: v
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Budget \u20AC",
    value: projForm.budget || 0,
    onChange: v => setProjForm(p => ({
      ...p,
      budget: v
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Speso \u20AC",
    value: projForm.spent || 0,
    onChange: v => setProjForm(p => ({
      ...p,
      spent: v
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement(Sel, {
    label: "Fase",
    value: projForm.phase || "concezione",
    onChange: v => setProjForm(p => ({
      ...p,
      phase: v
    })),
    options: PM_PHASES.map(ph => ({
      v: ph.id,
      l: `${ph.icon} ${ph.label}`
    }))
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Stato",
    value: projForm.status || "active",
    onChange: v => setProjForm(p => ({
      ...p,
      status: v
    })),
    options: [{
      v: "active",
      l: "Attivo"
    }, {
      v: "paused",
      l: "Sospeso"
    }, {
      v: "completed",
      l: "Completato"
    }, {
      v: "cancelled",
      l: "Annullato"
    }]
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Obiettivi",
    value: projForm.objectives || "",
    onChange: v => setProjForm(p => ({
      ...p,
      objectives: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.amber,
    onClick: saveProj
  }))), /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editWP",
    onClose: () => setModal(null),
    title: wpForm.id ? "Modifica WP" : "Nuovo Work Package",
    width: 500
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Nome work package",
    value: wpForm.name || "",
    onChange: v => setWpForm(p => ({
      ...p,
      name: v
    })),
    placeholder: "es. Sviluppo campionario"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Responsabile",
    value: wpForm.responsible || "",
    onChange: v => setWpForm(p => ({
      ...p,
      responsible: v
    })),
    placeholder: "Nome/Funzione"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "W inizio",
    value: wpForm.startWeek || weeks[0] || 1,
    onChange: v => setWpForm(p => ({
      ...p,
      startWeek: v
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "W fine",
    value: wpForm.endWeek || weeks[0] || 1,
    onChange: v => setWpForm(p => ({
      ...p,
      endWeek: v
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Effort (ore)",
    value: wpForm.effort || 0,
    onChange: v => setWpForm(p => ({
      ...p,
      effort: v
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Costo (\u20AC)",
    value: wpForm.cost || 0,
    onChange: v => setWpForm(p => ({
      ...p,
      cost: v
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement(Sel, {
    label: "Fase PM",
    value: wpForm.phase || "pianificazione",
    onChange: v => setWpForm(p => ({
      ...p,
      phase: v
    })),
    options: PM_PHASES.map(ph => ({
      v: ph.id,
      l: `${ph.icon} ${ph.label}`
    }))
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Stato",
    value: wpForm.status || "pending",
    onChange: v => setWpForm(p => ({
      ...p,
      status: v
    })),
    options: [{
      v: "pending",
      l: "In attesa"
    }, {
      v: "active",
      l: "Attivo"
    }, {
      v: "completed",
      l: "Completato"
    }, {
      v: "paused",
      l: "Sospeso"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: !!wpForm.isMilestone,
    onChange: e => setWpForm(p => ({
      ...p,
      isMilestone: e.target.checked
    })),
    id: "ms",
    style: {
      width: 16,
      height: 16,
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "ms",
    style: {
      fontSize: 13,
      color: DS.text2,
      cursor: "pointer"
    }
  }, "\xC8 una ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: DS.amber
    }
  }, "milestone"))), /*#__PURE__*/React.createElement(Inp, {
    label: "Descrizione",
    value: wpForm.description || "",
    onChange: v => setWpForm(p => ({
      ...p,
      description: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.teal,
    onClick: saveWP
  }))), /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editRisk",
    onClose: () => setModal(null),
    title: riskForm.id ? "Modifica rischio" : "Nuovo rischio"
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Titolo rischio",
    value: riskForm.title || "",
    onChange: v => setRiskForm(p => ({
      ...p,
      title: v
    })),
    placeholder: "es. Ritardo fornitore principale"
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Livello",
    value: riskForm.level || "medium",
    onChange: v => setRiskForm(p => ({
      ...p,
      level: v
    })),
    options: RISK_LEVELS.map(r => ({
      v: r.v,
      l: r.l
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Probabilit\xE0 (0-1)",
    value: riskForm.probability || 0,
    onChange: v => setRiskForm(p => ({
      ...p,
      probability: Math.min(1, Math.max(0, v))
    })),
    type: "number",
    mb: 0
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Impatto (0-1)",
    value: riskForm.impact || 0,
    onChange: v => setRiskForm(p => ({
      ...p,
      impact: Math.min(1, Math.max(0, v))
    })),
    type: "number",
    mb: 0
  })), /*#__PURE__*/React.createElement(Inp, {
    label: "Piano di mitigazione",
    value: riskForm.mitigation || "",
    onChange: v => setRiskForm(p => ({
      ...p,
      mitigation: v
    })),
    placeholder: "Azione di risposta al rischio..."
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Stato",
    value: riskForm.status || "open",
    onChange: v => setRiskForm(p => ({
      ...p,
      status: v
    })),
    options: [{
      v: "open",
      l: "Aperto"
    }, {
      v: "mitigated",
      l: "Mitigato"
    }, {
      v: "closed",
      l: "Chiuso"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.red,
    onClick: saveRisk
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 20px",
      borderBottom: `1px solid ${DS.border}`,
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: DS.surface,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSelId(null);
      setView("list");
    },
    style: {
      background: "none",
      border: "none",
      color: DS.blue,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, "\u2039 Progetti"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 16,
      background: DS.border
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: DS.text,
      fontFamily: "'Syne',sans-serif"
    }
  }, proj?.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: DS.text2
    }
  }, "PM: ", proj?.pm || "—", " \xB7 W", proj?.startWeek, "\u2192W", proj?.endWeek)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, ["detail", "gantt"].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setView(v),
    style: {
      padding: "6px 14px",
      borderRadius: 7,
      border: `1px solid ${view === v ? DS.amber : DS.border}`,
      background: view === v ? DS.amber + "18" : "transparent",
      color: view === v ? DS.amber : DS.text2,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "inherit"
    }
  }, v === "detail" ? "📋 Dettaglio" : "📅 Gantt")), /*#__PURE__*/React.createElement(Btn, {
    label: "Modifica",
    ghost: true,
    sm: true,
    onClick: () => {
      setProjForm({
        ...proj
      });
      setModal("editProj");
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Elimina",
    danger: true,
    sm: true,
    onClick: () => {
      dispatch({
        type: "DEL_PROJECT",
        id: proj.id
      });
      setSelId(null);
      setView("list");
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 20
    }
  }, view === "gantt" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 12
    }
  }, "Diagramma di Gantt \u2014 ", proj?.name), /*#__PURE__*/React.createElement(GanttChart, {
    workPackages: workPackages,
    allWeeks: weeks,
    projectId: selId
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.amber,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Ciclo di vita progetto"), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: "12px 14px",
      marginBottom: 16,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 0,
      minWidth: 500
    }
  }, PM_PHASES.map((p, i) => {
    const isCurr = p.id === proj?.phase;
    const isPast = phaseIdx(proj?.phase) > i;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        flex: 1,
        textAlign: "center",
        padding: "8px 4px",
        background: isCurr ? p.color + "20" : isPast ? DS.surface2 : "transparent",
        border: `1px solid ${isCurr ? p.color : DS.border}`,
        borderRadius: i === 0 ? "6px 0 0 6px" : i === PM_PHASES.length - 1 ? "0 6px 6px 0" : "0",
        cursor: "pointer"
      },
      onClick: () => dispatch({
        type: "UPD_PROJECT",
        id: proj.id,
        patch: {
          phase: p.id
        }
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        marginBottom: 2
      }
    }, isPast ? "✓" : p.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        fontWeight: isCurr ? 700 : 400,
        color: isCurr ? p.color : isPast ? DS.text3 : DS.text2,
        fontFamily: DS.font,
        textTransform: "uppercase",
        letterSpacing: 0.5
      }
    }, p.label));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      marginTop: 6
    }
  }, "Clicca su una fase per aggiornare la fase corrente")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.teal,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Work Packages (WBS)"), /*#__PURE__*/React.createElement(Btn, {
    label: "+ WP / Milestone",
    color: DS.teal,
    sm: true,
    onClick: () => {
      setWpForm({
        name: "",
        responsible: "",
        startWeek: proj?.startWeek || 1,
        endWeek: proj?.endWeek || 1,
        effort: 0,
        cost: 0,
        phase: "esecuzione",
        status: "pending",
        isMilestone: false,
        description: ""
      });
      setModal("editWP");
    }
  })), /*#__PURE__*/React.createElement(Box, {
    s: {
      marginBottom: 16
    }
  }, projWPs.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: "center",
      color: DS.text3,
      fontSize: 13
    }
  }, "Nessun work package. WBS vuota."), projWPs.map((wp, i) => {
    const wph = PM_PHASES.find(p => p.id === wp.phase) || PM_PHASES[0];
    return /*#__PURE__*/React.createElement("div", {
      key: wp.id,
      className: "hr",
      style: {
        padding: "10px 14px",
        borderBottom: i < projWPs.length - 1 ? `1px solid ${DS.border}` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 2
      }
    }, wp.isMilestone ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: DS.amber,
        fontSize: 14
      }
    }, "\u25C6") : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: wph.color,
        marginTop: 2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: wp.isMilestone ? 700 : 500,
        color: wp.isMilestone ? DS.amber : DS.text
      }
    }, wp.name), /*#__PURE__*/React.createElement(StatusTag, {
      s: wp.status
    }), /*#__PURE__*/React.createElement(Tag, {
      c: wph.color,
      label: wph.label,
      s: {
        fontSize: 9
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, wp.responsible && /*#__PURE__*/React.createElement("span", null, wp.responsible, " \xB7 "), /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.text3
      }
    }, "W", wp.startWeek, "\u2192W", wp.endWeek, " \xB7 ", wp.effort, "h \xB7 ", fEur(wp.cost))), wp.description && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text3,
        marginTop: 2
      }
    }, wp.description)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: wp.status,
      onChange: e => dispatch({
        type: "UPD_WP",
        id: wp.id,
        patch: {
          status: e.target.value
        }
      }),
      style: {
        background: DS.surface2,
        border: `1px solid ${DS.border}`,
        borderRadius: 5,
        padding: "3px 6px",
        color: DS.text,
        fontSize: 10,
        cursor: "pointer"
      }
    }, ["pending", "active", "completed", "paused"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, STATUS_L[s]))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        setWpForm({
          ...wp
        });
        setModal("editWP");
      },
      style: {
        background: "none",
        border: "none",
        color: DS.text3,
        cursor: "pointer",
        fontSize: 13
      }
    }, "\u270E"), /*#__PURE__*/React.createElement("button", {
      onClick: () => dispatch({
        type: "DEL_WP",
        id: wp.id
      }),
      style: {
        background: "none",
        border: "none",
        color: DS.text3,
        cursor: "pointer",
        fontSize: 13
      }
    }, "\u2715"))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.red,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Registro Rischi"), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Rischio",
    color: DS.red,
    sm: true,
    onClick: () => {
      setRiskForm({
        title: "",
        level: "medium",
        probability: 0.3,
        impact: 0.5,
        mitigation: "",
        status: "open"
      });
      setModal("editRisk");
    }
  })), /*#__PURE__*/React.createElement(Box, null, projRisks.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      textAlign: "center",
      color: DS.text3,
      fontSize: 13
    }
  }, "Nessun rischio registrato."), projRisks.map((r, i) => {
    const rl = RISK_LEVELS.find(x => x.v === r.level) || RISK_LEVELS[1];
    const score = ((r.probability || 0) * (r.impact || 0)).toFixed(2);
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      className: "hr",
      style: {
        padding: "10px 14px",
        borderBottom: i < projRisks.length - 1 ? `1px solid ${DS.border}` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 50,
        background: rl.c,
        marginTop: 4,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        color: DS.text
      }
    }, r.title), /*#__PURE__*/React.createElement(Tag, {
      c: rl.c,
      label: rl.l,
      s: {
        fontSize: 9
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.text3,
        fontSize: 10
      }
    }, "score: ", score)), r.mitigation && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, "\u21B3 ", r.mitigation)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 5,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: r.status,
      onChange: e => dispatch({
        type: "UPD_RISK",
        id: r.id,
        patch: {
          status: e.target.value
        }
      }),
      style: {
        background: DS.surface2,
        border: `1px solid ${DS.border}`,
        borderRadius: 5,
        padding: "3px 6px",
        color: DS.text,
        fontSize: 10,
        cursor: "pointer"
      }
    }, ["open", "mitigated", "closed"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, s))), /*#__PURE__*/React.createElement("button", {
      onClick: () => dispatch({
        type: "DEL_RISK",
        id: r.id
      }),
      style: {
        background: "none",
        border: "none",
        color: DS.text3,
        cursor: "pointer",
        fontSize: 13
      }
    }, "\u2715"))));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10
    }
  }, "KPI Progetto"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16
    }
  }, [{
    l: "Avanzamento",
    v: `${prog}%`,
    c: prog >= 100 ? DS.green : DS.teal
  }, {
    l: "Budget usato",
    v: `${budgetPct(proj?.id)}%`,
    c: budgetPct(proj?.id) > 90 ? DS.red : DS.orange
  }, {
    l: "WP totali",
    v: projWPs.length,
    c: DS.blue
  }, {
    l: "Rischi aperti",
    v: projRisks.filter(r => r.status === "open").length,
    c: DS.red
  }].map((k, i) => /*#__PURE__*/React.createElement(Box, {
    key: i,
    s: {
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text2,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
      fontFamily: DS.font
    }
  }, k.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: k.c,
      fontFamily: "'Syne',sans-serif"
    }
  }, k.v)))), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10
    }
  }, "Piramide QTC (Archibald)"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 160",
    style: {
      width: "100%",
      maxWidth: 180
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "100,15 185,145 15,145",
    fill: "none",
    stroke: DS.amber,
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "100",
    y1: "15",
    x2: "100",
    y2: "145",
    stroke: DS.border2,
    strokeWidth: "1",
    strokeDasharray: "4,3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "15",
    y1: "145",
    x2: "100",
    y2: "80",
    stroke: DS.border2,
    strokeWidth: "1",
    strokeDasharray: "4,3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "185",
    y1: "145",
    x2: "100",
    y2: "80",
    stroke: DS.border2,
    strokeWidth: "1",
    strokeDasharray: "4,3"
  }), /*#__PURE__*/React.createElement("text", {
    x: "100",
    y: "10",
    textAnchor: "middle",
    fill: DS.teal,
    fontSize: "10",
    fontWeight: "700"
  }, "Qualit\xE0"), /*#__PURE__*/React.createElement("text", {
    x: "15",
    y: "158",
    textAnchor: "middle",
    fill: DS.amber,
    fontSize: "10",
    fontWeight: "700"
  }, "Costi"), /*#__PURE__*/React.createElement("text", {
    x: "185",
    y: "158",
    textAnchor: "middle",
    fill: DS.blue,
    fontSize: "10",
    fontWeight: "700"
  }, "Tempi"), /*#__PURE__*/React.createElement("text", {
    x: "100",
    y: "100",
    textAnchor: "middle",
    fill: DS.text3,
    fontSize: "9"
  }, "Rischi"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      lineHeight: 1.6
    }
  }, "Volume = Ambito del progetto.", /*#__PURE__*/React.createElement("br", null), "Lati: Qualit\xE0 \xB7 Costi \xB7 Tempi", /*#__PURE__*/React.createElement("br", null), "Base: Rischi (Archibald, 2004)")), proj?.objectives && /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 6
    }
  }, "Obiettivi (SMART)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.text2,
      lineHeight: 1.7
    }
  }, proj.objectives)), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10
    }
  }, "Budget"), [{
    l: "Budget totale",
    v: proj?.budget || 0,
    c: DS.text
  }, {
    l: "Speso (attuale)",
    v: proj?.spent || 0,
    c: DS.orange
  }, {
    l: "WP pianificato",
    v: projWPs.reduce((s, w) => s + w.cost, 0),
    c: DS.teal
  }, {
    l: "Residuo",
    v: (proj?.budget || 0) - (proj?.spent || 0),
    c: (proj?.budget || 0) - (proj?.spent || 0) < 0 ? DS.red : DS.green
  }].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: i < 3 ? `1px solid ${DS.border}` : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: DS.text2
    }
  }, r.l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: DS.font,
      fontSize: 12,
      fontWeight: 700,
      color: r.c
    }
  }, fEur(r.v)))))))));
}

// ─────────────────────────────────────────────────────────────────
// SKETCHHD TAB  (integrato, funzionante con Claude API)
// ─────────────────────────────────────────────────────────────────
const STYLE_PRESETS = [{
  id: "fashion",
  emoji: "✨",
  label: "Fashion",
  suffix: "high fashion editorial, vogue magazine, luxury clothing, studio lighting, elegant, couture, professional photography"
}, {
  id: "photo",
  emoji: "📷",
  label: "Realistic",
  suffix: "photorealistic, hyperrealistic, 8k uhd, sharp focus, professional photography, masterpiece"
}, {
  id: "product",
  emoji: "📦",
  label: "Product",
  suffix: "product photography, clean background, commercial photography, professional lighting, studio"
}, {
  id: "concept",
  emoji: "🎨",
  label: "Concept",
  suffix: "concept art, digital painting, artstation trending, cinematic, moody, detailed illustration"
}, {
  id: "textile",
  emoji: "🧵",
  label: "Textile",
  suffix: "fabric texture detail, material study, close-up textile, pattern, woven material, high resolution"
}];
const BSIZES = [2, 5, 10, 18, 28];
const PALETTE_SKETCH = ["#111", "#e63946", "#2196f3", "#2a9d8f", "#e9c46a", "#f4a261", "#9c27b0", "#b5838d", "#fff", "#666"];
function SketchHDTab() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastXY = useRef(null);
  const hist = useRef([]);
  const hIdx = useRef(-1);
  const W = 700,
    H = 480;
  const [tool, setTool] = useState("pen");
  const [szIdx, setSzIdx] = useState(1);
  const [color, setColor] = useState("#111");
  const [preset, setPreset] = useState("fashion");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("Disegna qualcosa → Analizza con AI →");
  const [msgType, setMsgType] = useState("idle");
  const [stabKey, setStabKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, W, H);
    push();
  }, []);
  const push = () => {
    if (!canvasRef.current) return;
    const d = canvasRef.current.toDataURL();
    hist.current = hist.current.slice(0, hIdx.current + 1);
    hist.current.push(d);
    hIdx.current = hist.current.length - 1;
  };
  const undo = useCallback(() => {
    if (hIdx.current < 1) return;
    hIdx.current--;
    const img = new Image();
    img.src = hist.current[hIdx.current];
    img.onload = () => {
      const c = canvasRef.current;
      c.getContext("2d").clearRect(0, 0, W, H);
      c.getContext("2d").drawImage(img, 0, 0);
    };
  }, []);
  const getXY = e => {
    const r = canvasRef.current.getBoundingClientRect();
    const sx = W / r.width,
      sy = H / r.height;
    const s = e.touches?.[0] ?? e;
    return {
      x: (s.clientX - r.left) * sx,
      y: (s.clientY - r.top) * sy
    };
  };
  const onDown = useCallback(e => {
    e.preventDefault();
    drawing.current = true;
    const p = getXY(e);
    lastXY.current = p;
    const ctx = canvasRef.current.getContext("2d");
    const sz = BSIZES[szIdx];
    ctx.beginPath();
    ctx.arc(p.x, p.y, (tool === "eraser" ? sz * 2.5 : sz) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#f8f8f8" : color;
    ctx.fill();
  }, [tool, szIdx, color]);
  const onMove = useCallback(e => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = getXY(e);
    const sz = BSIZES[szIdx];
    ctx.beginPath();
    ctx.moveTo(lastXY.current.x, lastXY.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = tool === "eraser" ? "#f8f8f8" : color;
    ctx.lineWidth = tool === "eraser" ? sz * 2.5 : sz;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastXY.current = p;
  }, [tool, szIdx, color]);
  const onUp = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    lastXY.current = null;
    push();
  }, []);
  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, W, H);
    push();
    setResult(null);
    setMsg("Canvas pulito. Ridisegna!");
    setMsgType("idle");
  };
  const getB64 = () => canvasRef.current.toDataURL("image/png").split(",")[1];
  const analyze = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setMsgType("loading");
    setMsg("🔍 Analisi sketch con Claude Vision...");
    try {
      const b64 = getB64();
      const p = STYLE_PRESETS.find(x => x.id === preset);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: [{
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: b64
              }
            }, {
              type: "text",
              text: `You are an expert AI image prompt engineer for the fashion and textile industry.
Analyze this hand-drawn sketch and create an optimized Stable Diffusion prompt.
User intent: "${prompt || "crea un'immagine realistica HD"}"
Style preset: "${p.label}" → ${p.suffix}
Respond ONLY with valid JSON (no markdown, no code blocks):
{"sd_prompt":"[detailed SD prompt]","negative_prompt":"blurry, low quality, sketch lines, distorted","description":"[1 sentence describing what you see in the sketch]","keywords":["keyword1","keyword2","keyword3"]}`
            }]
          }]
        })
      });
      if (!res.ok) throw new Error(`Claude API: ${res.status}`);
      const d = await res.json();
      const text = d.content[0].text.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(text);
      if (stabKey) {
        setMsg("🎨 Generazione immagine HD con Stability AI...");
        const fd = new FormData();
        const blob = await fetch(`data:image/png;base64,${b64}`).then(r => r.blob());
        fd.append("image", blob, "sketch.png");
        fd.append("prompt", analysis.sd_prompt);
        fd.append("negative_prompt", analysis.negative_prompt);
        fd.append("control_strength", "0.7");
        fd.append("output_format", "png");
        const sRes = await fetch("https://api.stability.ai/v2beta/stable-image/control/sketch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stabKey}`,
            Accept: "image/*"
          },
          body: fd
        });
        if (!sRes.ok) throw new Error(`Stability AI: ${sRes.status}`);
        const ab = await sRes.arrayBuffer();
        const imgUrl = "data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(ab)));
        setResult({
          url: imgUrl,
          type: "real",
          analysis
        });
        setMsg("✅ Immagine HD generata!");
        setMsgType("success");
      } else {
        setResult({
          url: null,
          type: "demo",
          analysis
        });
        setMsg("✅ Analisi completata! Aggiungi la chiave Stability AI per generare l'immagine.");
        setMsgType("demo");
      }
    } catch (err) {
      setMsgType("error");
      setMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }, [busy, prompt, preset, stabKey]);
  useEffect(() => {
    const h = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo]);
  const msgColor = {
    success: DS.green,
    error: DS.red,
    demo: DS.amber,
    loading: DS.purple,
    idle: DS.text3
  }[msgType] || DS.text3;
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      display: "flex",
      height: "100%",
      overflow: "hidden",
      gap: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      borderRight: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 16px",
      background: DS.surface,
      borderBottom: `1px solid ${DS.border}`,
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text
    }
  }, "\u270F\uFE0F SketchHD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4
    }
  }, ["pen", "eraser"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTool(t),
    style: {
      padding: "5px 12px",
      borderRadius: 6,
      border: `1px solid ${tool === t ? DS.amber : DS.border}`,
      background: tool === t ? DS.amber + "18" : "transparent",
      color: tool === t ? DS.amber : DS.text2,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 600
    }
  }, t === "pen" ? "🖊 Penna" : "⬜ Gomma"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3
    }
  }, BSIZES.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setSzIdx(i),
    style: {
      width: 20 + i * 4,
      height: 20 + i * 4,
      borderRadius: "50%",
      background: szIdx === i ? DS.amber : DS.surface2,
      border: `1px solid ${szIdx === i ? DS.amber : DS.border}`,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3
    }
  }, PALETTE_SKETCH.map(c => /*#__PURE__*/React.createElement("div", {
    key: c,
    onClick: () => setColor(c),
    style: {
      width: 20,
      height: 20,
      borderRadius: 5,
      background: c,
      border: color === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
      cursor: "pointer",
      transform: color === c ? "scale(1.15)" : "scale(1)",
      transition: "transform 0.1s"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: undo,
    style: {
      padding: "5px 10px",
      borderRadius: 6,
      border: `1px solid ${DS.border}`,
      background: "transparent",
      color: DS.text2,
      cursor: "pointer",
      fontSize: 11
    }
  }, "\u21A9 Undo"), /*#__PURE__*/React.createElement("button", {
    onClick: clearCanvas,
    style: {
      padding: "5px 10px",
      borderRadius: 6,
      border: `1px solid ${DS.border}`,
      background: "transparent",
      color: DS.text2,
      cursor: "pointer",
      fontSize: 11
    }
  }, "\uD83D\uDDD1 Clear"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#1a1a2a",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    width: W,
    height: H,
    style: {
      borderRadius: 8,
      boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
      touchAction: "none",
      cursor: tool === "eraser" ? "cell" : "crosshair",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain"
    },
    onMouseDown: onDown,
    onMouseMove: onMove,
    onMouseUp: onUp,
    onMouseLeave: onUp,
    onTouchStart: onDown,
    onTouchMove: onMove,
    onTouchEnd: onUp
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 16px",
      background: DS.surface,
      borderTop: `1px solid ${DS.border}`,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: msgColor,
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, msgType === "loading" && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      border: `2px solid ${DS.purple}`,
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      flexShrink: 0
    }
  }), msg))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 320,
      minWidth: 280,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, "Stile preset"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 5,
      flexWrap: "wrap",
      marginBottom: 14
    }
  }, STYLE_PRESETS.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    onClick: () => setPreset(p.id),
    style: {
      padding: "5px 10px",
      borderRadius: 20,
      border: `1.5px solid ${preset === p.id ? DS.amber : DS.border}`,
      background: preset === p.id ? DS.amber + "18" : "transparent",
      color: preset === p.id ? DS.amber : DS.text2,
      cursor: "pointer",
      fontSize: 11,
      fontWeight: preset === p.id ? 700 : 400,
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, p.emoji), p.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, "Descrizione aggiuntiva"), /*#__PURE__*/React.createElement("textarea", {
    value: prompt,
    onChange: e => setPrompt(e.target.value),
    placeholder: "es. cappotto in lana merino, colore camel, taglio sartoriale...",
    style: {
      width: "100%",
      background: DS.surface2,
      border: `1px solid ${DS.border}`,
      borderRadius: 7,
      padding: "8px 10px",
      color: DS.text,
      fontSize: 12,
      outline: "none",
      resize: "vertical",
      minHeight: 60,
      fontFamily: "inherit",
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 5
    }
  }, "Stability AI Key (opzionale)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: showKey ? "text" : "password",
    value: stabKey,
    onChange: e => setStabKey(e.target.value),
    placeholder: "sk-...",
    style: {
      flex: 1,
      background: DS.surface2,
      border: `1px solid ${DS.border}`,
      borderRadius: 7,
      padding: "7px 10px",
      color: DS.text,
      fontSize: 12,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowKey(s => !s),
    style: {
      padding: "7px 10px",
      borderRadius: 7,
      border: `1px solid ${DS.border}`,
      background: "transparent",
      color: DS.text2,
      cursor: "pointer",
      fontSize: 11
    }
  }, showKey ? "🙈" : "👁")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      marginBottom: 14,
      lineHeight: 1.5
    }
  }, "Senza chiave: analisi AI del testo + prompt SD.", /*#__PURE__*/React.createElement("br", null), "Con chiave: immagine HD reale generata via Stability AI."), /*#__PURE__*/React.createElement("button", {
    onClick: analyze,
    disabled: busy,
    style: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: 10,
      border: "none",
      background: busy ? DS.surface2 : `linear-gradient(135deg,${DS.amber},${DS.amberDim})`,
      color: busy ? DS.text3 : "#000",
      fontWeight: 700,
      fontSize: 14,
      cursor: busy ? "not-allowed" : "pointer",
      fontFamily: "inherit",
      transition: "all 0.2s",
      marginBottom: 14
    }
  }, busy ? "🔄 Elaborazione..." : "🚀 Analizza & Genera"), result && /*#__PURE__*/React.createElement(React.Fragment, null, result.url && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: DS.teal,
      marginBottom: 6
    }
  }, "\u2705 Immagine HD"), /*#__PURE__*/React.createElement("img", {
    src: result.url,
    alt: "HD result",
    loading: "lazy",
    style: {
      width: "100%",
      borderRadius: 8,
      border: `1px solid ${DS.border}`,
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      const a = document.createElement("a");
      a.href = result.url;
      a.download = `SketchHD-${Date.now()}.png`;
      a.click();
    },
    style: {
      width: "100%",
      padding: "8px",
      borderRadius: 7,
      border: `1px solid ${DS.teal}`,
      background: DS.teal + "18",
      color: DS.teal,
      fontWeight: 700,
      fontSize: 12,
      cursor: "pointer",
      marginBottom: 10
    }
  }, "\u2B07 Download PNG")), result.analysis && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 4
    }
  }, "\uD83D\uDCCB Analisi AI"), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: DS.text2,
      marginBottom: 6
    }
  }, "Descrizione: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: DS.text
    }
  }, result.analysis.description)), result.analysis.keywords && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      flexWrap: "wrap",
      marginBottom: 6
    }
  }, result.analysis.keywords.map(k => /*#__PURE__*/React.createElement(Tag, {
    key: k,
    c: DS.amber,
    label: k,
    s: {
      fontSize: 9
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text3,
      lineHeight: 1.6,
      fontFamily: DS.font
    }
  }, "SD Prompt: ", result.analysis.sd_prompt?.slice(0, 120), "...")))))));
}

// ─────────────────────────────────────────────────────────────────
// HOME DASHBOARD
// ─────────────────────────────────────────────────────────────────
function HomeTab({
  state,
  mrpResults,
  dispatch,
  onNav
}) {
  const {
    weeks,
    products,
    components,
    demand,
    customers,
    suppliers,
    supplyOrders,
    projects,
    workPackages,
    risks
  } = state;
  const confirmed = demand.filter(d => d.status === "confirmed");
  const totalDemand = confirmed.reduce((s, d) => s + d.qty, 0);
  const shortageComps = components.filter(c => mrpResults[c.id]?.hasShortage);
  const urgentRel = components.filter(c => mrpResults[c.id]?.planRel.slice(0, 4).some(v => v > 0));
  const openOrders = supplyOrders.filter(s => ["approved", "ordered"].includes(s.status));
  const activeProjs = projects.filter(p => p.status === "active");
  const openRisks = risks.filter(r => r.status === "open" && r.level === "high");
  const maxBar = Math.max(1, ...weeks.map(w => products.reduce((s, p) => s + confirmed.filter(d => d.productId === p.id && d.week === w).reduce((a, b) => a + b.qty, 0), 0)));
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      padding: 24,
      maxWidth: 1100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: 12,
      marginBottom: 20
    }
  }, [{
    l: "Domanda confermata",
    v: totalDemand,
    u: "pz",
    c: DS.blue,
    icon: "📊"
  }, {
    l: "Carenze MRP",
    v: shortageComps.length,
    u: "",
    c: shortageComps.length > 0 ? DS.red : DS.teal,
    icon: "⚠️"
  }, {
    l: "Ordini fornitore",
    v: openOrders.length,
    u: "aperti",
    c: DS.orange,
    icon: "📦"
  }, {
    l: "Progetti attivi",
    v: activeProjs.length,
    u: "",
    c: DS.purple,
    icon: "📋"
  }, {
    l: "Rischi alti aperti",
    v: openRisks.length,
    u: "",
    c: openRisks.length > 0 ? DS.red : DS.teal,
    icon: "🔴"
  }].map((k, i) => /*#__PURE__*/React.createElement(Box, {
    key: i,
    s: {
      padding: "16px 18px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18
    }
  }, k.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase"
    }
  }, k.l)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 32,
      fontWeight: 800,
      color: k.c,
      lineHeight: 1
    }
  }, k.v), k.u && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      marginTop: 3
    }
  }, k.u)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.amber,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Domanda MRP settimanale"), /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: "14px 14px 10px",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: 2,
      height: 70
    }
  }, weeks.map((w, i) => {
    const tot = products.reduce((s, p) => s + confirmed.filter(d => d.productId === p.id && d.week === w).reduce((a, b) => a + b.qty, 0), 0);
    const h = Math.max(2, tot / maxBar * 66);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        height: h,
        background: tot > 0 ? `linear-gradient(180deg,${DS.amber},${DS.amberDim})` : "rgba(255,255,255,0.04)",
        borderRadius: "2px 2px 0 0",
        transition: "height 0.5s"
      }
    }), (i === 0 || i === weeks.length - 1) && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        color: DS.text3,
        marginTop: 2,
        fontFamily: DS.font
      }
    }, "W", w));
  }))), urgentRel.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.red,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Rilasci MRP urgenti", /*#__PURE__*/React.createElement(Tag, {
    c: DS.red,
    label: urgentRel.length
  })), /*#__PURE__*/React.createElement(Box, {
    s: {
      marginBottom: 16
    }
  }, urgentRel.map((c, i) => {
    const r = mrpResults[c.id];
    const fw = r.planRel.findIndex(v => v > 0);
    const so = r.suggestedOrders[0];
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      className: "hr",
      onClick: () => onNav("mrp", c.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        borderBottom: i < urgentRel.length - 1 ? `1px solid ${DS.border}` : "none",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Ico, {
      icon: c.icon,
      color: c.color
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: DS.text
      }
    }, c.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, "Rilascio entro W", weeks[fw] || "?", " \xB7 ", r.planRel[fw] || 0, " pz", so?.si ? ` · est. ${fEur(so.cost)}` : "")), /*#__PURE__*/React.createElement(Tag, {
      c: DS.red,
      label: `W${weeks[fw]}`
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: DS.text3,
        fontSize: 18
      }
    }, "\u203A"));
  }))), activeProjs.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.purple,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Progetti attivi"), /*#__PURE__*/React.createElement(Box, null, activeProjs.map((p, i) => {
    const ph = PM_PHASES.find(x => x.id === p.phase) || PM_PHASES[0];
    const prog = workPackages.filter(w => w.projectId === p.id);
    const pct = prog.length ? Math.round(prog.filter(w => w.status === "completed").length / prog.length * 100) : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "hr",
      onClick: () => onNav("progetti", p.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        borderBottom: i < activeProjs.length - 1 ? `1px solid ${DS.border}` : "none",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 10,
        height: 10,
        borderRadius: 3,
        background: p.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: DS.text
      }
    }, p.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, ph.icon, " ", ph.label, " \xB7 PM: ", p.pm || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        background: DS.surface2,
        borderRadius: 2,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 2,
        background: p.color,
        width: `${pct}%`,
        transition: "width 0.5s"
      }
    }))), /*#__PURE__*/React.createElement(Tag, {
      c: ph.color,
      label: `${pct}%`
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: DS.text3,
        fontSize: 18
      }
    }, "\u203A"));
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.teal,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Copertura componenti"), /*#__PURE__*/React.createElement(Box, {
    s: {
      marginBottom: 16
    }
  }, components.map((c, i) => {
    const r = mrpResults[c.id];
    const minPAB = r?.minPAB || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      style: {
        padding: "9px 12px",
        borderBottom: i < components.length - 1 ? `1px solid ${DS.border}` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, c.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 500,
        color: DS.text,
        flex: 1
      }
    }, c.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DS.font,
        fontSize: 11,
        fontWeight: 700,
        color: minPAB >= 0 ? DS.teal : DS.red
      }
    }, minPAB), r?.hasShortage && /*#__PURE__*/React.createElement(Tag, {
      c: DS.red,
      label: "\u26A0",
      s: {
        fontSize: 9,
        padding: "1px 5px"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 3,
        background: DS.surface2,
        borderRadius: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        borderRadius: 2,
        background: r?.hasShortage ? DS.red : DS.teal,
        width: `${Math.min(100, Math.max(2, c.inventory > 0 ? c.inventory / (c.inventory + (r?.totalGross || 1)) * 100 : 0))}%`,
        transition: "width 0.5s"
      }
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      color: DS.text,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 14,
      background: DS.orange,
      display: "inline-block",
      borderRadius: 2
    }
  }), "Supply orders"), /*#__PURE__*/React.createElement(Box, null, ["approved", "ordered", "in_transit", "received"].map(s => {
    const n = supplyOrders.filter(o => o.status === s).length;
    if (!n) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: s,
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderBottom: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement(StatusTag, {
      s: s
    }), /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.text2
      }
    }, n, " ordini"));
  }), supplyOrders.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      textAlign: "center",
      color: DS.text3,
      fontSize: 12
    }
  }, "Nessun ordine")))));
}

// ─────────────────────────────────────────────────────────────────
// CLIENTI, MRP, FORNITORI, CONFIG TABS (inline concise versions)
// ─────────────────────────────────────────────────────────────────
function ClientiTab({
  state,
  dispatch
}) {
  const {
    customers,
    demand,
    products,
    weeks
  } = state;
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [editC, setEditC] = useState({});
  const [newD, setNewD] = useState({
    productId: "",
    week: "",
    qty: 0,
    note: "",
    status: "confirmed"
  });
  const cust = customers.find(c => c.id === sel);
  const cDemand = id => demand.filter(d => d.refId === id);
  const saveC = () => {
    if (editC.id) dispatch({
      type: "UPD_CUSTOMER",
      id: editC.id,
      patch: editC
    });else dispatch({
      type: "ADD_CUSTOMER",
      cust: editC
    });
    setModal(null);
    setEditC({});
  };
  const addD = () => {
    if (!newD.productId || !newD.week || !newD.qty) return;
    dispatch({
      type: "ADD_DEMAND",
      item: {
        type: "customer",
        productId: newD.productId,
        week: Number(newD.week),
        qty: Number(newD.qty),
        note: newD.note,
        status: newD.status,
        refId: sel
      }
    });
    setModal(null);
    setNewD({
      productId: "",
      week: "",
      qty: 0,
      note: "",
      status: "confirmed"
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editC",
    onClose: () => setModal(null),
    title: editC.id ? "Modifica cliente" : "Nuovo cliente"
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Nome",
    value: editC.label || "",
    onChange: v => setEditC(p => ({
      ...p,
      label: v
    })),
    placeholder: "Manifattura Rossi S.r.l."
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Contatto",
    value: editC.contact || "",
    onChange: v => setEditC(p => ({
      ...p,
      contact: v
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Email",
    value: editC.email || "",
    onChange: v => setEditC(p => ({
      ...p,
      email: v
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Note",
    value: editC.note || "",
    onChange: v => setEditC(p => ({
      ...p,
      note: v
    }))
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    value: editC.color || DS.blue,
    onChange: v => setEditC(p => ({
      ...p,
      color: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.teal,
    onClick: saveC
  }))), /*#__PURE__*/React.createElement(Modal, {
    open: modal === "addD",
    onClose: () => setModal(null),
    title: "Aggiungi ordine"
  }, /*#__PURE__*/React.createElement(Sel, {
    label: "Prodotto",
    value: newD.productId,
    onChange: v => setNewD(p => ({
      ...p,
      productId: v
    })),
    options: [{
      v: "",
      l: "— seleziona —"
    }, ...products.map(p => ({
      v: p.id,
      l: p.label
    }))]
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Settimana",
    value: newD.week,
    onChange: v => setNewD(p => ({
      ...p,
      week: Number(v)
    })),
    options: weeks.map(w => ({
      v: w,
      l: `W${w}`
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Quantit\xE0",
    value: newD.qty,
    onChange: v => setNewD(p => ({
      ...p,
      qty: v
    })),
    type: "number"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Note",
    value: newD.note,
    onChange: v => setNewD(p => ({
      ...p,
      note: v
    }))
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Stato",
    value: newD.status,
    onChange: v => setNewD(p => ({
      ...p,
      status: v
    })),
    options: [{
      v: "confirmed",
      l: "Confermato"
    }, {
      v: "draft",
      l: "Bozza"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Aggiungi",
    color: DS.teal,
    disabled: !newD.productId || !newD.week || !newD.qty,
    onClick: addD
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: `1px solid ${DS.border}`,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 14px 8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 15,
      fontWeight: 700
    }
  }, "Clienti"), /*#__PURE__*/React.createElement(Btn, {
    label: "+",
    color: DS.teal,
    sm: true,
    onClick: () => {
      setEditC({
        label: "",
        icon: "🏢",
        color: DS.blue,
        contact: "",
        email: "",
        note: ""
      });
      setModal("editC");
    }
  })), customers.map(c => {
    const n = cDemand(c.id).filter(d => d.status === "confirmed").reduce((s, d) => s + d.qty, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: c.id,
      className: "hr",
      onClick: () => setSel(c.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        cursor: "pointer",
        background: sel === c.id ? DS.surface2 : "transparent",
        borderBottom: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement(Ico, {
      icon: c.icon,
      color: c.color,
      sz: 34
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: DS.text,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, c.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, c.contact || "—")), /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.amber,
        fontWeight: 700,
        fontSize: 13
      }
    }, n));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto"
    }
  }, !cust ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: DS.text3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 10
    }
  }, "\uD83D\uDC65"), /*#__PURE__*/React.createElement("div", null, "Seleziona un cliente")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    icon: cust.icon,
    color: cust.color,
    sz: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 20,
      fontWeight: 800
    }
  }, cust.label), cust.contact && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.text2
    }
  }, cust.contact), cust.email && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.blue
    }
  }, cust.email)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Modifica",
    ghost: true,
    sm: true,
    onClick: () => {
      setEditC({
        ...cust
      });
      setModal("editC");
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Ordine",
    color: DS.teal,
    sm: true,
    onClick: () => {
      setNewD({
        productId: products[0]?.id || "",
        week: weeks[0] || 1,
        qty: 0,
        note: "",
        status: "confirmed"
      });
      setModal("addD");
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Elimina",
    danger: true,
    sm: true,
    onClick: () => {
      dispatch({
        type: "DEL_CUSTOMER",
        id: cust.id
      });
      setSel(null);
    }
  }))), /*#__PURE__*/React.createElement(Box, null, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: DS.surface2
    }
  }, ["Settimana", "Prodotto", "Qtà", "Tipo", "Stato", "Note", ""].map((h, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      padding: "8px 12px",
      textAlign: "left",
      fontSize: 9,
      fontWeight: 700,
      color: DS.text2,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: DS.font
    }
  }, h)))), /*#__PURE__*/React.createElement("tbody", null, cDemand(cust.id).map((d, i) => {
    const p = products.find(x => x.id === d.productId);
    return /*#__PURE__*/React.createElement("tr", {
      key: d.id,
      className: "hr",
      style: {
        borderTop: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      c: DS.amber,
      label: `W${d.week}`
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: p?.color || DS.text3
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: DS.text
      }
    }, p?.label || "—"))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.amber,
        fontWeight: 700,
        fontSize: 13
      }
    }, d.qty)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      c: d.type === "manual" ? DS.purple : DS.blue,
      label: d.type === "manual" ? "MPS" : "Cliente"
    })), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: d.status,
      onChange: e => dispatch({
        type: "UPD_DEMAND",
        id: d.id,
        patch: {
          status: e.target.value
        }
      }),
      style: {
        background: DS.surface2,
        border: `1px solid ${DS.border}`,
        borderRadius: 5,
        padding: "3px 6px",
        color: DS.text,
        fontSize: 11,
        cursor: "pointer"
      }
    }, ["draft", "confirmed", "planned", "fulfilled"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, STATUS_L[s])))), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: DS.text3
      }
    }, d.note || "—")), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 12px"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => dispatch({
        type: "DEL_DEMAND",
        id: d.id
      }),
      style: {
        background: "none",
        border: "none",
        color: DS.text3,
        cursor: "pointer",
        fontSize: 14
      }
    }, "\u2715")));
  }))), cDemand(cust.id).length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      textAlign: "center",
      color: DS.text3,
      fontSize: 13
    }
  }, "Nessun ordine per questo cliente")))));
}
function MRPTabFull({
  state,
  mrpResults,
  dispatch
}) {
  const {
    weeks,
    components,
    suppliers,
    supplierItems,
    supplyOrders,
    demand,
    customers,
    products
  } = state;
  const [selId, setSelId] = useState(components[0]?.id || "");
  const [drillWi, setDrillWi] = useState(null);
  const [releaseModal, setReleaseModal] = useState(null);
  const [selSupId, setSelSupId] = useState("");
  const comp = components.find(c => c.id === selId);
  const r = comp ? mrpResults[comp.id] : null;
  const compSIs = supplierItems.filter(si => si.compId === selId);
  const validSups = compSIs.map(si => ({
    ...si,
    supplier: suppliers.find(s => s.id === si.supplierId)
  })).filter(x => x.supplier);
  const doRelease = () => {
    if (!releaseModal || !selSupId) return;
    const si = supplierItems.find(s => s.id === selSupId);
    if (!si) return;
    dispatch({
      type: "ADD_SO",
      so: {
        compId: selId,
        supplierId: si.supplierId,
        qty: releaseModal.qty,
        releaseWeek: weeks[releaseModal.wi],
        expectedWeek: weeks[Math.min(releaseModal.wi + si.leadTime, weeks.length - 1)],
        status: "approved",
        cost: releaseModal.qty * si.price,
        mrpRef: "mrp",
        note: "Da piano MRP"
      }
    });
    setReleaseModal(null);
    setSelSupId("");
  };
  if (!comp) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 32,
      textAlign: "center",
      color: DS.text3
    }
  }, "Nessun componente.");
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: !!releaseModal,
    onClose: () => setReleaseModal(null),
    title: "Rilascia ordine acquisto"
  }, releaseModal && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Box, {
    s: {
      padding: "12px 14px",
      marginBottom: 14,
      borderColor: DS.amber + "40"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20
    }
  }, [["Comp.", comp.label], ["Rilascio", `W${weeks[releaseModal.wi]}`], ["Qty", `${releaseModal.qty} pz`]].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text2,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 2,
      fontFamily: DS.font
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: DS.amber
    }
  }, v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      color: DS.text2,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 8
    }
  }, "Fornitore"), validSups.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: DS.orange + "15",
      borderRadius: 8,
      padding: 12,
      fontSize: 13,
      color: DS.orange,
      marginBottom: 12
    }
  }, "\u26A0\uFE0F Nessun fornitore per questo componente.") : validSups.map(si => /*#__PURE__*/React.createElement("div", {
    key: si.id,
    onClick: () => setSelSupId(si.id),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 10,
      cursor: "pointer",
      marginBottom: 8,
      background: selSupId === si.id ? si.color + "18" : DS.surface2,
      border: `1.5px solid ${selSupId === si.id ? si.color : DS.border}`,
      transition: "all 0.1s"
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    icon: si.supplier.icon,
    color: si.supplier.color,
    sz: 34
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: DS.text
    }
  }, si.supplier.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: DS.text2
    }
  }, "LT ", si.leadTime, "w \xB7 ", LOT_L[si.lotSizing], " \xB7 min ", si.minOrder)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: DS.teal
    }
  }, fEur(si.price), "/pz"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text2
    }
  }, "tot ", fEur(releaseModal.qty * si.price))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setReleaseModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "\u2713 Rilascia",
    color: DS.amber,
    disabled: !selSupId || !validSups.length,
    onClick: doRelease
  })))), /*#__PURE__*/React.createElement(Modal, {
    open: drillWi !== null,
    onClose: () => setDrillWi(null),
    title: `Fonti domanda — ${comp.label} — W${weeks[drillWi]}`
  }, drillWi !== null && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: DS.text2,
      marginBottom: 12
    }
  }, "Fabb. lordo: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: DS.red
    }
  }, fNum(r?.gross[drillWi] || 0)), " pz"), (r?.demandSources[drillWi] || []).length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      color: DS.text3,
      textAlign: "center",
      padding: 20
    }
  }, "Nessuna fonte") : (r?.demandSources[drillWi] || []).map((d, i) => {
    const prod = products.find(p => p.id === d.productId);
    const cust = d.refId ? customers.find(c => c.id === d.refId) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: d.id,
      style: {
        padding: "10px 0",
        borderTop: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        alignItems: "center"
      }
    }, cust && /*#__PURE__*/React.createElement(Ico, {
      icon: cust.icon,
      color: cust.color,
      sz: 28
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, cust ? cust.label : "MPS Manuale", " \xB7 ", prod?.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, d.qty, " pz \xD7 BOM ", d.bomQty, " = ", /*#__PURE__*/React.createElement("strong", {
      style: {
        color: DS.red
      }
    }, d.compQty, " pz"))), /*#__PURE__*/React.createElement(StatusTag, {
      s: d.status
    })));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      overflowX: "auto",
      marginBottom: 16,
      paddingBottom: 4
    }
  }, components.map(c => {
    const sel = c.id === selId;
    const alert = mrpResults[c.id]?.hasShortage || mrpResults[c.id]?.planRel.slice(0, 4).some(v => v > 0);
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setSelId(c.id),
      style: {
        flexShrink: 0,
        padding: "6px 13px",
        borderRadius: 20,
        cursor: "pointer",
        fontFamily: "inherit",
        border: `1.5px solid ${sel ? c.color : DS.border}`,
        background: sel ? c.color + "20" : DS.surface,
        display: "flex",
        alignItems: "center",
        gap: 6,
        boxShadow: sel ? `0 0 10px ${c.color}40` : "none",
        transition: "all 0.15s"
      }
    }, /*#__PURE__*/React.createElement("span", null, c.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: sel ? 700 : 400,
        color: sel ? c.color : DS.text2,
        whiteSpace: "nowrap"
      }
    }, c.label), alert && !sel && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 3,
        background: DS.red,
        display: "inline-block"
      }
    }));
  })), r && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 10,
      marginBottom: 14
    }
  }, [{
    l: "Fabb.Tot.",
    v: fNum(r.totalGross),
    c: DS.red
  }, {
    l: "PAB Min.",
    v: r.minPAB,
    c: r.minPAB >= 0 ? DS.teal : DS.red
  }, {
    l: "Stock iniz.",
    v: comp.inventory,
    c: DS.blue
  }, {
    l: "Fornitori",
    v: compSIs.length,
    c: DS.amber
  }].map((k, i) => /*#__PURE__*/React.createElement(Box, {
    key: i,
    s: {
      padding: "10px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text2,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
      fontFamily: DS.font
    }
  }, k.l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: k.c,
      fontFamily: "'Syne',sans-serif"
    }
  }, k.v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(MRPGrid, {
    result: r,
    weeks: weeks,
    onCellClick: wi => setDrillWi(wi)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: DS.text3,
      marginBottom: 16
    }
  }, "\uD83D\uDCA1 Clicca su \"Fabb. Lordo\" per vedere le fonti domanda"), r.planRel.some(v => v > 0) && /*#__PURE__*/React.createElement(Box, null, r.planRel.map((v, wi) => {
    if (!v) return null;
    const relQty = supplyOrders.filter(so => so.compId === selId && so.releaseWeek === weeks[wi] && ["approved", "ordered", "in_transit"].includes(so.status)).reduce((s, so) => s + so.qty, 0);
    const pending = v - relQty;
    const si = r.suggestedOrders.find(s => s.weekIdx === wi)?.si;
    return /*#__PURE__*/React.createElement("div", {
      key: wi,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 14px",
        borderBottom: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: DS.amber + "20",
        borderRadius: 7,
        padding: "5px 10px",
        minWidth: 52,
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.amber,
        fontWeight: 700,
        fontSize: 12
      }
    }, "W", weeks[wi])), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, v.toLocaleString("it-IT"), " pz \u2014 ric. W", weeks[Math.min(wi + (si?.leadTime || 1), weeks.length - 1)], relQty > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: DS.teal
      }
    }, " \xB7 ", relQty, " gi\xE0 rilasciati"), si && /*#__PURE__*/React.createElement("span", {
      style: {
        color: DS.amber
      }
    }, " \xB7 est. ", fEur(v * si.price)))), pending > 0 ? /*#__PURE__*/React.createElement(Btn, {
      label: `Rilascia →`,
      color: DS.amber,
      onClick: () => {
        setReleaseModal({
          wi,
          qty: pending
        });
        setSelSupId(compSIs[0]?.id || "");
      }
    }) : /*#__PURE__*/React.createElement(Tag, {
      c: DS.teal,
      label: "\u2713 Rilasciato"
    }));
  }))));
}
function FornitoriTab({
  state,
  dispatch
}) {
  const {
    suppliers,
    supplierItems,
    supplyOrders,
    components
  } = state;
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const [editS, setEditS] = useState({});
  const [editSI, setEditSI] = useState({});
  const sup = suppliers.find(s => s.id === sel);
  const supItems = supplierItems.filter(si => si.supplierId === sel);
  const supOrds = supplyOrders.filter(so => so.supplierId === sel);
  const saveS = () => {
    if (editS.id) dispatch({
      type: "UPD_SUPPLIER",
      id: editS.id,
      patch: editS
    });else dispatch({
      type: "ADD_SUPPLIER",
      sup: editS
    });
    setModal(null);
    setEditS({});
  };
  const saveSI = () => {
    if (!editSI.compId) return;
    if (editSI.id) dispatch({
      type: "UPD_SI",
      id: editSI.id,
      patch: editSI
    });else dispatch({
      type: "ADD_SI",
      si: editSI
    });
    setModal(null);
    setEditSI({});
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      display: "grid",
      gridTemplateColumns: "260px 1fr",
      height: "100%"
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editS",
    onClose: () => setModal(null),
    title: editS.id ? "Modifica fornitore" : "Nuovo fornitore"
  }, /*#__PURE__*/React.createElement(Inp, {
    label: "Nome",
    value: editS.label || "",
    onChange: v => setEditS(p => ({
      ...p,
      label: v
    })),
    placeholder: "Filatura Bini S.r.l."
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Contatto",
    value: editS.contact || "",
    onChange: v => setEditS(p => ({
      ...p,
      contact: v
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Email",
    value: editS.email || "",
    onChange: v => setEditS(p => ({
      ...p,
      email: v
    }))
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Note",
    value: editS.note || "",
    onChange: v => setEditS(p => ({
      ...p,
      note: v
    }))
  }), /*#__PURE__*/React.createElement(ColorPicker, {
    value: editS.color || DS.purple,
    onChange: v => setEditS(p => ({
      ...p,
      color: v
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.purple,
    onClick: saveS
  }))), /*#__PURE__*/React.createElement(Modal, {
    open: modal === "editSI",
    onClose: () => setModal(null),
    title: "Articolo fornitore"
  }, /*#__PURE__*/React.createElement(Sel, {
    label: "Componente",
    value: editSI.compId || "",
    onChange: v => setEditSI(p => ({
      ...p,
      compId: v
    })),
    options: [{
      v: "",
      l: "— seleziona —"
    }, ...components.map(c => ({
      v: c.id,
      l: `${c.icon} ${c.label}`
    }))]
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Prezzo \u20AC/pz",
    value: editSI.price || 0,
    onChange: v => setEditSI(p => ({
      ...p,
      price: v
    })),
    type: "number"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Ordine minimo",
    value: editSI.minOrder || 0,
    onChange: v => setEditSI(p => ({
      ...p,
      minOrder: v
    })),
    type: "number"
  }), /*#__PURE__*/React.createElement(Inp, {
    label: "Lead Time (sett.)",
    value: editSI.leadTime || 1,
    onChange: v => setEditSI(p => ({
      ...p,
      leadTime: v
    })),
    type: "number"
  }), /*#__PURE__*/React.createElement(Sel, {
    label: "Lottizzazione",
    value: editSI.lotSizing || "L4L",
    onChange: v => setEditSI(p => ({
      ...p,
      lotSizing: v
    })),
    options: [{
      v: "L4L",
      l: "L4L — Lotto per lotto"
    }, {
      v: "MOQ",
      l: "MOQ — Ordine minimo"
    }, {
      v: "MULTIPLE",
      l: "MULTIPLE — Multiplo"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Annulla",
    ghost: true,
    onClick: () => setModal(null)
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Salva",
    color: DS.teal,
    disabled: !editSI.compId,
    onClick: saveSI
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRight: `1px solid ${DS.border}`,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 14px 8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 15,
      fontWeight: 700
    }
  }, "Fornitori"), /*#__PURE__*/React.createElement(Btn, {
    label: "+",
    color: DS.purple,
    sm: true,
    onClick: () => {
      setEditS({
        label: "",
        icon: "🏭",
        color: DS.purple,
        contact: "",
        email: "",
        note: ""
      });
      setModal("editS");
    }
  })), suppliers.map(s => {
    const tot = supplyOrders.filter(o => o.supplierId === s.id).reduce((s, o) => s + o.cost, 0);
    const items = supplierItems.filter(si => si.supplierId === s.id).length;
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      className: "hr",
      onClick: () => setSel(s.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        cursor: "pointer",
        background: sel === s.id ? DS.surface2 : "transparent",
        borderBottom: `1px solid ${DS.border}`
      }
    }, /*#__PURE__*/React.createElement(Ico, {
      icon: s.icon,
      color: s.color,
      sz: 34
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: DS.text,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, items, " art.")), /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.teal,
        fontWeight: 700,
        fontSize: 11
      }
    }, tot > 0 ? fEurK(tot) : ""));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto"
    }
  }, !sup ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: DS.text3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      marginBottom: 10
    }
  }, "\uD83C\uDFED"), /*#__PURE__*/React.createElement("div", null, "Seleziona un fornitore")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Ico, {
    icon: sup.icon,
    color: sup.color,
    sz: 48
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 20,
      fontWeight: 800
    }
  }, sup.label), sup.contact && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.text2
    }
  }, sup.contact), sup.email && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.blue
    }
  }, sup.email), sup.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: DS.text3,
      fontStyle: "italic"
    }
  }, sup.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "Modifica",
    ghost: true,
    sm: true,
    onClick: () => {
      setEditS({
        ...sup
      });
      setModal("editS");
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Articolo",
    color: DS.teal,
    sm: true,
    onClick: () => {
      setEditSI({
        supplierId: sel,
        compId: "",
        price: 0,
        minOrder: 1,
        leadTime: 1,
        lotSizing: "L4L"
      });
      setModal("editSI");
    }
  }), /*#__PURE__*/React.createElement(Btn, {
    label: "Elimina",
    danger: true,
    sm: true,
    onClick: () => {
      dispatch({
        type: "DEL_SUPPLIER",
        id: sup.id
      });
      setSel(null);
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Articoli forniti"), /*#__PURE__*/React.createElement(Box, {
    s: {
      marginBottom: 16
    }
  }, supItems.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      textAlign: "center",
      color: DS.text3,
      fontSize: 13
    }
  }, "Nessun articolo."), supItems.map((si, i) => {
    const c = components.find(x => x.id === si.compId);
    return /*#__PURE__*/React.createElement("div", {
      key: si.id,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderBottom: i < supItems.length - 1 ? `1px solid ${DS.border}` : "none"
      }
    }, c && /*#__PURE__*/React.createElement(Ico, {
      icon: c.icon,
      color: c.color,
      sz: 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, c?.label || "—"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, "LT ", si.leadTime, "w \xB7 min ", si.minOrder, " \xB7 ", LOT_L[si.lotSizing])), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        marginRight: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: DS.teal,
        fontFamily: "'Syne',sans-serif"
      }
    }, fEur(si.price)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: DS.text3
      }
    }, "per pz")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Btn, {
      label: "\u270E",
      ghost: true,
      sm: true,
      onClick: () => {
        setEditSI({
          ...si,
          supplierId: sel
        });
        setModal("editSI");
      }
    }), /*#__PURE__*/React.createElement(Btn, {
      label: "\u2715",
      danger: true,
      sm: true,
      onClick: () => dispatch({
        type: "DEL_SI",
        id: si.id
      })
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Ordini di acquisto"), /*#__PURE__*/React.createElement(Box, null, supOrds.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      textAlign: "center",
      color: DS.text3,
      fontSize: 13
    }
  }, "Nessun ordine."), supOrds.map((so, i) => {
    const c = components.find(x => x.id === so.compId);
    return /*#__PURE__*/React.createElement("div", {
      key: so.id,
      style: {
        padding: "11px 14px",
        borderBottom: i < supOrds.length - 1 ? `1px solid ${DS.border}` : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, c && /*#__PURE__*/React.createElement(Ico, {
      icon: c.icon,
      color: c.color,
      sz: 28
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600
      }
    }, c?.label), /*#__PURE__*/React.createElement(StatusTag, {
      s: so.status
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.text2
      }
    }, "W", so.releaseWeek, "\u2192W", so.expectedWeek, " \xB7 ", so.createdAt)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "right",
        marginRight: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      s: {
        color: DS.amber,
        fontWeight: 700,
        fontSize: 12
      }
    }, so.qty, " pz"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: DS.teal
      }
    }, fEur(so.cost))), /*#__PURE__*/React.createElement("select", {
      value: so.status,
      onChange: e => dispatch({
        type: "UPD_SO_STATUS",
        id: so.id,
        status: e.target.value
      }),
      style: {
        background: DS.surface2,
        border: `1px solid ${DS.border}`,
        borderRadius: 5,
        padding: "4px 6px",
        color: DS.text,
        fontSize: 11,
        cursor: "pointer"
      }
    }, ["approved", "ordered", "in_transit", "received"].map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s
    }, STATUS_L[s]))), /*#__PURE__*/React.createElement("button", {
      onClick: () => dispatch({
        type: "DEL_SO",
        id: so.id
      }),
      style: {
        background: "none",
        border: "none",
        color: DS.text3,
        cursor: "pointer",
        fontSize: 13,
        marginLeft: 4
      }
    }, "\u2715")));
  })))));
}
function ConfigTab({
  state,
  dispatch
}) {
  const {
    weeks,
    products,
    components,
    bom
  } = state;
  const [wModal, setWModal] = useState(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "fi",
    style: {
      padding: 24,
      maxWidth: 900
    }
  }, /*#__PURE__*/React.createElement(Modal, {
    open: wModal,
    onClose: () => setWModal(false),
    title: "Settimane del piano",
    width: 480
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16
    }
  }, ALL_WEEKS.map(w => {
    const sel = weeks.includes(w);
    return /*#__PURE__*/React.createElement("div", {
      key: w,
      onClick: () => dispatch({
        type: "TOGGLE_WEEK",
        w
      }),
      style: {
        width: 48,
        height: 36,
        borderRadius: 8,
        cursor: "pointer",
        background: sel ? DS.amber + "20" : DS.surface2,
        border: `1.5px solid ${sel ? DS.amber : DS.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: sel ? 700 : 400,
        color: sel ? DS.amber : DS.text2,
        fontFamily: DS.font,
        transition: "all 0.1s"
      }
    }, "W", w);
  })), /*#__PURE__*/React.createElement(Btn, {
    label: "Fatto \u2713",
    color: DS.amber,
    onClick: () => setWModal(false)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 16,
      fontWeight: 700
    }
  }, "Settimane (", weeks.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 5,
      flex: 1
    }
  }, weeks.map(w => /*#__PURE__*/React.createElement("div", {
    key: w,
    style: {
      padding: "3px 8px",
      background: DS.amber + "18",
      borderRadius: 5,
      fontSize: 11,
      fontWeight: 700,
      color: DS.amber,
      fontFamily: DS.font
    }
  }, "W", w))), /*#__PURE__*/React.createElement(Btn, {
    label: "Modifica",
    ghost: true,
    sm: true,
    onClick: () => setWModal(true)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700
    }
  }, "Prodotti"), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Prodotto",
    color: DS.blue,
    sm: true,
    onClick: () => dispatch({
      type: "ADD_PRODUCT"
    })
  })), /*#__PURE__*/React.createElement(Box, null, products.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      padding: "10px 14px",
      borderBottom: i < products.length - 1 ? `1px solid ${DS.border}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 5,
      background: p.color
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: p.label,
    onChange: e => dispatch({
      type: "UPD_PRODUCT",
      id: p.id,
      f: "label",
      v: e.target.value
    }),
    style: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: DS.text,
      fontSize: 14,
      fontWeight: 600,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => dispatch({
      type: "DEL_PRODUCT",
      id: p.id
    }),
    style: {
      background: "none",
      border: "none",
      color: DS.text3,
      cursor: "pointer",
      fontSize: 13
    }
  }, "\u2715")), /*#__PURE__*/React.createElement(ColorPicker, {
    value: p.color,
    onChange: v => dispatch({
      type: "UPD_PRODUCT",
      id: p.id,
      f: "color",
      v
    })
  }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700
    }
  }, "Componenti MRP"), /*#__PURE__*/React.createElement(Btn, {
    label: "+ Comp.",
    color: DS.teal,
    sm: true,
    onClick: () => dispatch({
      type: "ADD_COMP"
    })
  })), /*#__PURE__*/React.createElement(Box, null, components.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      padding: "10px 14px",
      borderBottom: i < components.length - 1 ? `1px solid ${DS.border}` : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, c.icon), /*#__PURE__*/React.createElement("input", {
    value: c.label,
    onChange: e => dispatch({
      type: "UPD_COMP",
      id: c.id,
      f: "label",
      v: e.target.value
    }),
    style: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: DS.text,
      fontSize: 13,
      fontWeight: 600,
      outline: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: DS.text3,
      fontFamily: DS.font
    }
  }, "stk:"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: c.inventory,
    onChange: e => dispatch({
      type: "UPD_COMP",
      id: c.id,
      f: "inventory",
      v: Number(e.target.value) || 0
    }),
    style: {
      width: 48,
      background: DS.surface2,
      border: `1px solid ${DS.border}`,
      borderRadius: 5,
      padding: "2px 6px",
      color: DS.teal,
      fontSize: 11,
      fontFamily: DS.font,
      fontWeight: 700,
      outline: "none",
      textAlign: "right"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => dispatch({
      type: "DEL_COMP",
      id: c.id
    }),
    style: {
      background: "none",
      border: "none",
      color: DS.text3,
      cursor: "pointer",
      fontSize: 13
    }
  }, "\u2715")), /*#__PURE__*/React.createElement(ColorPicker, {
    value: c.color,
    onChange: v => dispatch({
      type: "UPD_COMP",
      id: c.id,
      f: "color",
      v
    })
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10
    }
  }, "Distinta Base (BOM)"), /*#__PURE__*/React.createElement(Box, {
    s: {
      overflow: "auto",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: DS.surface2
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      padding: "8px 12px",
      textAlign: "left",
      fontSize: 9,
      fontWeight: 700,
      color: DS.text2,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: DS.font
    }
  }, "Componente"), products.map(p => /*#__PURE__*/React.createElement("th", {
    key: p.id,
    style: {
      padding: "8px 12px",
      textAlign: "center",
      fontSize: 9,
      fontWeight: 700,
      color: p.color,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      fontFamily: DS.font
    }
  }, p.label)))), /*#__PURE__*/React.createElement("tbody", null, components.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.id,
    className: "hr",
    style: {
      borderTop: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "9px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15
    }
  }, c.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, c.label))), products.map(p => {
    const qty = (bom[c.id] || {})[p.id] || 0;
    return /*#__PURE__*/React.createElement("td", {
      key: p.id,
      style: {
        padding: "7px 12px",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: qty,
      min: "0",
      onChange: e => dispatch({
        type: "UPD_BOM",
        cid: c.id,
        pid: p.id,
        qty: Number(e.target.value) || 0
      }),
      style: {
        width: 60,
        background: qty > 0 ? p.color + "18" : DS.surface2,
        border: `1px solid ${qty > 0 ? p.color : DS.border}`,
        borderRadius: 6,
        padding: "5px 8px",
        color: qty > 0 ? p.color : DS.text3,
        fontSize: 13,
        fontFamily: DS.font,
        fontWeight: 700,
        textAlign: "center",
        outline: "none"
      }
    }));
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(Btn, {
    label: "\uD83D\uDD04 Ripristina dati originali",
    danger: true,
    onClick: () => dispatch({
      type: "RESET"
    })
  })));
}

// ─────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────
const TABS = [{
  id: "home",
  label: "Dashboard",
  icon: "◈"
}, {
  id: "clienti",
  label: "Clienti",
  icon: "👥"
}, {
  id: "mrp",
  label: "MRP",
  icon: "🔧"
}, {
  id: "fornitori",
  label: "Fornitori",
  icon: "🏭"
}, {
  id: "progetti",
  label: "Progetti",
  icon: "📋"
}, {
  id: "sketch",
  label: "SketchHD",
  icon: "✏️"
}, {
  id: "config",
  label: "Config",
  icon: "⚙️"
}];
function App() {
  const [state, setS] = useState(buildDefault);
  const dispatch = useCallback(action => setS(prev => reducer(prev, action)), []);
  const [tab, setTab] = useState("home");
  const [mrpComp, setMrpComp] = useState(null);
  const [projNav, setProjNav] = useState(null);
  const mrpResults = useMemo(() => runMRP({
    weeks: state.weeks,
    products: state.products,
    components: state.components,
    bom: state.bom,
    demand: state.demand,
    supplierItems: state.supplierItems,
    supplyOrders: state.supplyOrders
  }), [state]);
  const alertCount = useMemo(() => state.components.filter(c => mrpResults[c.id]?.hasShortage || mrpResults[c.id]?.planRel.slice(0, 4).some(v => v > 0)).length, [mrpResults, state.components]);
  const pendingOrds = state.supplyOrders.filter(so => ["approved", "ordered"].includes(so.status)).length;
  const activeProjs = state.projects.filter(p => p.status === "active").length;
  const navTo = useCallback((t, id) => {
    if (t === "mrp" && id) {
      setMrpComp(id);
    }
    if (t === "progetti" && id) {
      setProjNav(id);
    }
    setTab(t);
  }, []);
  useEffect(() => {
    if (tab === "mrp" && mrpComp) {
      setMrpComp(null);
    }
    if (tab === "progetti" && projNav) {
      setProjNav(null);
    }
  }, [tab]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(GS, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      background: DS.bg,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 194,
      minWidth: 194,
      background: DS.surface,
      borderRight: `1px solid ${DS.border}`,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 14px 14px",
      borderBottom: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 10,
      fontWeight: 700,
      color: DS.amberDim,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      marginBottom: 3
    }
  }, "GEFITES \xB7 ERP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 19,
      fontWeight: 800,
      color: DS.text,
      lineHeight: 1
    }
  }, "Textile"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 19,
      fontWeight: 800,
      color: DS.amber,
      lineHeight: 1
    }
  }, "Platform"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text3,
      marginTop: 5,
      fontFamily: DS.font
    }
  }, "MRP + PM + SketchHD")), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: "8px 6px",
      overflowY: "auto"
    }
  }, TABS.map(t => {
    const active = tab === t.id;
    const dot = t.id === "mrp" && alertCount > 0 || t.id === "fornitori" && pendingOrds > 0;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      className: "tbtn",
      onClick: () => setTab(t.id),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 10px",
        marginBottom: 1,
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        background: active ? "rgba(232,149,10,0.1)" : "transparent",
        borderLeft: active ? `2px solid ${DS.amber}` : "2px solid transparent",
        transition: "all 0.1s",
        position: "relative",
        fontFamily: "inherit"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        filter: active ? "none" : "grayscale(0.5) opacity(0.7)"
      }
    }, t.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        color: active ? DS.amber : DS.text2
      }
    }, t.label), dot && !active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        width: 6,
        height: 6,
        borderRadius: 3,
        background: DS.red
      }
    }), active && t.id === "mrp" && alertCount > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        background: DS.red,
        color: "#fff",
        borderRadius: 8,
        padding: "1px 5px",
        fontSize: 9,
        fontWeight: 700
      }
    }, alertCount), active && t.id === "progetti" && activeProjs > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        background: DS.purple,
        color: "#fff",
        borderRadius: 8,
        padding: "1px 5px",
        fontSize: 9,
        fontWeight: 700
      }
    }, activeProjs));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "10px 14px",
      borderTop: `1px solid ${DS.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 5,
      height: 5,
      borderRadius: 3,
      background: DS.teal
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: DS.text3,
      fontFamily: DS.font
    }
  }, "Sistema attivo")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      color: DS.text3,
      fontFamily: DS.font,
      lineHeight: 1.6
    }
  }, state.weeks.length, "w \xB7 ", state.products.length, " prod \xB7 ", state.components.length, " comp", /*#__PURE__*/React.createElement("br", null), state.projects.length, " progetti \xB7 Claude API \u2713"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 50,
      minHeight: 50,
      background: DS.surface,
      borderBottom: `1px solid ${DS.border}`,
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 14,
      fontWeight: 700
    }
  }, TABS.find(t => t.id === tab)?.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: DS.font,
      fontSize: 9,
      color: DS.text3,
      letterSpacing: 1
    }
  }, "W", state.weeks[0], "\u2192W", state.weeks[state.weeks.length - 1], " \xB7 ", state.weeks.length, "w"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      gap: 8,
      alignItems: "center"
    }
  }, alertCount > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: DS.red + "18",
      borderRadius: 6,
      padding: "3px 9px",
      cursor: "pointer"
    },
    onClick: () => navTo("mrp")
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: DS.red
    }
  }, "\u26A0 ", alertCount, " carenze")), pendingOrds > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      background: DS.orange + "18",
      borderRadius: 6,
      padding: "3px 9px",
      cursor: "pointer"
    },
    onClick: () => navTo("fornitori")
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      color: DS.orange
    }
  }, pendingOrds, " ordini da confermare")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: DS.font,
      fontSize: 10,
      color: DS.text3
    }
  }, new Date().toLocaleDateString("it-IT")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }
  }, tab === "home" && /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(HomeTab, {
    state: state,
    mrpResults: mrpResults,
    dispatch: dispatch,
    onNav: navTo
  })), tab === "clienti" && /*#__PURE__*/React.createElement(ClientiTab, {
    state: state,
    dispatch: dispatch
  }), tab === "mrp" && /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(MRPTabFull, {
    state: state,
    mrpResults: mrpResults,
    dispatch: dispatch,
    initialComp: mrpComp
  })), tab === "fornitori" && /*#__PURE__*/React.createElement(FornitoriTab, {
    state: state,
    dispatch: dispatch
  }), tab === "progetti" && /*#__PURE__*/React.createElement(ProgettiTab, {
    state: state,
    dispatch: dispatch,
    initialId: projNav
  }), tab === "sketch" && /*#__PURE__*/React.createElement(SketchHDTab, null), tab === "config" && /*#__PURE__*/React.createElement("div", {
    style: {
      overflowY: "auto",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ConfigTab, {
    state: state,
    dispatch: dispatch
  }))))));
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
