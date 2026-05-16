import {
  useState, useEffect, useRef, useReducer,
  useCallback, useMemo, createContext, useContext,
} from "react";

// ═══════════════════════════════════════════════════════════════════
//  INITIAL DATA
// ═══════════════════════════════════════════════════════════════════
const INIT_LOOMS = Array.from({ length: 8 }, (_, i) => ({
  id: `L${i + 1}`, name: `Telaio ${i + 1}`,
  capacity: 100, type: i < 4 ? "pinza_positiva" : "pinza_negativa",
}));

const INIT_PHASES = [
  { id:"MP",   name:"Ricezione MP",  color:"#1D9E75", dur:5,  loom:false },
  { id:"CARD", name:"Cardatura",     color:"#378ADD", dur:7,  loom:false },
  { id:"FIL",  name:"Filatura",      color:"#534AB7", dur:9,  loom:false },
  { id:"TIN",  name:"Tintoria",      color:"#973AA8", dur:10, loom:false },
  { id:"ORD",  name:"Orditura",      color:"#BA7517", dur:3,  loom:false },
  { id:"TES",  name:"Tessitura",     color:"#D85A30", dur:15, loom:true  },
  { id:"FIN",  name:"Finissaggio",   color:"#0F6E56", dur:8,  loom:false },
  { id:"CQ",   name:"Controllo Q.",  color:"#639922", dur:3,  loom:false },
  { id:"DEL",  name:"Consegna",      color:"#5F5E5A", dur:1,  loom:false },
];

const INIT_RESOURCES = [
  { id:"R1", name:"Mag. Interno",    tipo:"interno",  color:"#1D9E75" },
  { id:"R2", name:"Rep. Cardatura",  tipo:"interno",  color:"#378ADD" },
  { id:"R3", name:"Rep. Filatura",   tipo:"interno",  color:"#534AB7" },
  { id:"R4", name:"Fil. Rossi snc",  tipo:"terzista", color:"#BA7517" },
  { id:"R5", name:"Tes. Montemurlo", tipo:"terzista", color:"#D85A30" },
  { id:"R6", name:"Finiss. Vaiano",  tipo:"terzista", color:"#0F6E56" },
  { id:"R7", name:"Card. Bisenzio",  tipo:"terzista", color:"#973AA8" },
  { id:"R8", name:"CQ Interno",      tipo:"interno",  color:"#639922" },
  { id:"R9", name:"Logistica",       tipo:"interno",  color:"#5F5E5A" },
];

const INIT_ORDERS = [
  { id:"A", label:"Ordine A", sub:"URGENTE",       color:"#D85A30", deadline:27, price:25000 },
  { id:"B", label:"Ordine B", sub:"STANDARD",      color:"#378ADD", deadline:44, price:42000 },
  { id:"C", label:"Ordine C", sub:"LUNGO TERMINE", color:"#534AB7", deadline:68, price:68000 },
];

const INIT_CATENE = [
  { id:"CAT1", name:"Catena Alpha", orderId:"A", pezze:12, color:"#D85A3022" },
  { id:"CAT2", name:"Catena Beta",  orderId:"B", pezze:20, color:"#378ADD22" },
  { id:"CAT3", name:"Catena Gamma", orderId:"C", pezze:30, color:"#534AB722" },
];

// ps/pd = planned start/dur  rs/rd = real start/dur
const INIT_TASKS = [
  {id:"A1",orderId:"A",phaseId:"MP",  loomId:null,catenaId:null,  tipo:"interno",  ps:0, pd:3, rs:0, rd:3, resourceId:"R1",deps:[]},
  {id:"A2",orderId:"A",phaseId:"CARD",loomId:null,catenaId:null,  tipo:"interno",  ps:3, pd:4, rs:3, rd:5, resourceId:"R2",deps:["A1"]},
  {id:"A3",orderId:"A",phaseId:"FIL", loomId:null,catenaId:null,  tipo:"terzista", ps:7, pd:5, rs:8, rd:6, resourceId:"R4",deps:["A2"]},
  {id:"A4",orderId:"A",phaseId:"TES", loomId:"L1",catenaId:"CAT1",tipo:"terzista", ps:12,pd:6, rs:14,rd:7, resourceId:"R5",deps:["A3"]},
  {id:"A5",orderId:"A",phaseId:"FIN", loomId:null,catenaId:null,  tipo:"terzista", ps:18,pd:3, rs:21,rd:3, resourceId:"R6",deps:["A4"]},
  {id:"A6",orderId:"A",phaseId:"CQ",  loomId:null,catenaId:null,  tipo:"interno",  ps:21,pd:2, rs:24,rd:2, resourceId:"R8",deps:["A5"]},
  {id:"A7",orderId:"A",phaseId:"DEL", loomId:null,catenaId:null,  tipo:"interno",  ps:23,pd:1, rs:26,rd:1, resourceId:"R9",deps:["A6"]},
  {id:"B1",orderId:"B",phaseId:"MP",  loomId:null,catenaId:null,  tipo:"interno",  ps:0, pd:5, rs:0, rd:5, resourceId:"R1",deps:[]},
  {id:"B2",orderId:"B",phaseId:"CARD",loomId:null,catenaId:null,  tipo:"interno",  ps:5, pd:7, rs:5, rd:8, resourceId:"R2",deps:["B1"]},
  {id:"B3",orderId:"B",phaseId:"FIL", loomId:null,catenaId:null,  tipo:"terzista", ps:12,pd:8, rs:13,rd:9, resourceId:"R4",deps:["B2"]},
  {id:"B4",orderId:"B",phaseId:"TES", loomId:"L2",catenaId:"CAT2",tipo:"terzista", ps:20,pd:10,rs:22,rd:12,resourceId:"R5",deps:["B3"]},
  {id:"B5",orderId:"B",phaseId:"FIN", loomId:null,catenaId:null,  tipo:"terzista", ps:30,pd:5, rs:34,rd:5, resourceId:"R6",deps:["B4"]},
  {id:"B6",orderId:"B",phaseId:"CQ",  loomId:null,catenaId:null,  tipo:"interno",  ps:35,pd:3, rs:39,rd:3, resourceId:"R8",deps:["B5"]},
  {id:"B7",orderId:"B",phaseId:"DEL", loomId:null,catenaId:null,  tipo:"interno",  ps:38,pd:2, rs:42,rd:2, resourceId:"R9",deps:["B6"]},
  {id:"C1",orderId:"C",phaseId:"MP",  loomId:null,catenaId:null,  tipo:"interno",  ps:5, pd:7, rs:5, rd:7, resourceId:"R1",deps:[]},
  {id:"C2",orderId:"C",phaseId:"CARD",loomId:null,catenaId:null,  tipo:"terzista", ps:12,pd:10,rs:12,rd:13,resourceId:"R7",deps:["C1"]},
  {id:"C3",orderId:"C",phaseId:"FIL", loomId:null,catenaId:null,  tipo:"terzista", ps:22,pd:12,rs:25,rd:12,resourceId:"R4",deps:["C2"]},
  {id:"C4",orderId:"C",phaseId:"TES", loomId:"L3",catenaId:"CAT3",tipo:"terzista", ps:34,pd:15,rs:37,rd:16,resourceId:"R5",deps:["C3"]},
  {id:"C5",orderId:"C",phaseId:"FIN", loomId:null,catenaId:null,  tipo:"terzista", ps:49,pd:8, rs:53,rd:8, resourceId:"R6",deps:["C4"]},
  {id:"C6",orderId:"C",phaseId:"CQ",  loomId:null,catenaId:null,  tipo:"interno",  ps:57,pd:4, rs:61,rd:4, resourceId:"R8",deps:["C5"]},
  {id:"C7",orderId:"C",phaseId:"DEL", loomId:null,catenaId:null,  tipo:"interno",  ps:61,pd:3, rs:65,rd:3, resourceId:"R9",deps:["C6"]},
];

const PHASE_COST = { MP:800,CARD:1200,FIL:2000,TES:3500,FIN:1500,CQ:600,DEL:400,TIN:1800,ORD:600 };
const MAX_DAY    = 80;
const START_DATE = new Date("2026-04-07");

// ═══════════════════════════════════════════════════════════════════
//  REDUCER
// ═══════════════════════════════════════════════════════════════════
const INIT_STATE = {
  orders:    INIT_ORDERS,
  tasks:     INIT_TASKS,
  looms:     INIT_LOOMS,
  phases:    INIT_PHASES,
  resources: INIT_RESOURCES,
  catene:    INIT_CATENE,
  ui: {
    day:0, playing:false, speed:2,
    viewMode:"order", zoom:"day",
    activeTab:"gantt",
    selectedId:null, editId:null,
    leftW:270, rightW:310,
  },
};

function reducer(st, { type, payload }) {
  const ui = (patch) => ({ ...st, ui:{ ...st.ui, ...patch } });
  switch (type) {
    // ui
    case "SET_DAY":      return ui({ day:payload, playing:false });
    case "TICK":         return ui({ day:Math.min(st.ui.day+1, MAX_DAY), playing:st.ui.day+1<=MAX_DAY?st.ui.playing:false });
    case "PLAYING":      return ui({ playing:payload });
    case "SPEED":        return ui({ speed:payload });
    case "VIEW_MODE":    return ui({ viewMode:payload });
    case "ZOOM":         return ui({ zoom:payload });
    case "TAB":          return ui({ activeTab:payload });
    case "SELECT":       return ui({ selectedId:payload, editId:null });
    case "OPEN_EDIT":    return ui({ editId:payload });
    case "CLOSE_EDIT":   return ui({ editId:null });
    case "LEFT_W":       return ui({ leftW:Math.max(180,Math.min(400,st.ui.leftW+payload)) });
    case "RIGHT_W":      return ui({ rightW:Math.max(220,Math.min(420,st.ui.rightW-payload)) });
    // tasks
    case "UPD_TASK":     return { ...st, tasks:st.tasks.map(t=>t.id===payload.id?{...t,...payload}:t) };
    case "MOVE_TASK":    return { ...st, tasks:st.tasks.map(t=>t.id===payload.id?{...t,rs:Math.max(0,t.rs+payload.delta)}:t) };
    case "RESIZE_TASK":  return { ...st, tasks:st.tasks.map(t=>t.id===payload.id?{...t,rd:Math.max(1,payload.rd)}:t) };
    case "DEL_TASK":     return { ...st, tasks:st.tasks.filter(t=>t.id!==payload), ui:{...st.ui,editId:null,selectedId:null} };
    case "ADD_TASK":     return { ...st, tasks:[...st.tasks,payload] };
    // looms
    case "ADD_LOOM":     return { ...st, looms:[...st.looms,{ id:`L${Date.now()}`, name:`Telaio ${st.looms.length+1}`, capacity:100, type:"pinza_negativa" }] };
    case "UPD_LOOM":     return { ...st, looms:st.looms.map(l=>l.id===payload.id?{...l,...payload}:l) };
    case "DEL_LOOM":     return { ...st, looms:st.looms.filter(l=>l.id!==payload) };
    // phases
    case "ADD_PHASE":    return { ...st, phases:[...st.phases,{ id:`PH${Date.now()}`,name:"Nuova Fase",color:"#888",dur:5,loom:false }] };
    case "UPD_PHASE":    return { ...st, phases:st.phases.map(p=>p.id===payload.id?{...p,...payload}:p) };
    case "DEL_PHASE":    return { ...st, phases:st.phases.filter(p=>p.id!==payload) };
    // resources
    case "ADD_RES":      return { ...st, resources:[...st.resources,{ id:`R${Date.now()}`,name:"Nuova Risorsa",tipo:"interno",color:"#888" }] };
    case "UPD_RES":      return { ...st, resources:st.resources.map(r=>r.id===payload.id?{...r,...payload}:r) };
    case "DEL_RES":      return { ...st, resources:st.resources.filter(r=>r.id!==payload) };
    // catene
    case "ADD_CAT":      return { ...st, catene:[...st.catene,{ id:`CAT${Date.now()}`,name:"Nuova Catena",orderId:st.orders[0]?.id,pezze:10,color:"#37aad022" }] };
    case "UPD_CAT":      return { ...st, catene:st.catene.map(c=>c.id===payload.id?{...c,...payload}:c) };
    case "DEL_CAT":      return { ...st, catene:st.catene.filter(c=>c.id!==payload) };
    // orders
    case "ADD_ORD":      return { ...st, orders:[...st.orders,{ id:`O${Date.now()}`,label:"Nuovo Ordine",sub:"NUOVO",color:"#888",deadline:60,price:30000 }] };
    case "UPD_ORD":      return { ...st, orders:st.orders.map(o=>o.id===payload.id?{...o,...payload}:o) };
    // persist
    case "LOAD":         return { ...payload, ui:{ ...INIT_STATE.ui,...(payload.ui||{}) } };
    default:             return st;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CONTEXT + API LAYER
// ═══════════════════════════════════════════════════════════════════
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

const API = {
  KEY: "lanificio_pro_v3",
  async load()       { try { const r=localStorage.getItem(this.KEY); return r?JSON.parse(r):null; } catch { return null; } },
  async save(state)  { try { localStorage.setItem(this.KEY,JSON.stringify(state)); return true; } catch { return false; } },
  async getTasks()   { return (await this.load())?.tasks || INIT_TASKS; },
  async getConfig()  { return (await this.load()) || {}; },
};

// ═══════════════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════════════
const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const fmtD    = (d)   => d.toLocaleDateString("it-IT",{day:"2-digit",month:"short"});

function taskState(t, day) {
  const done   = day >= t.rs + t.rd;
  const active = day >= t.rs && !done;
  const late   = day > t.ps + t.pd && !done;
  const pct    = done ? 100 : active ? Math.min(99,Math.round((day-t.rs)/t.rd*100)) : 0;
  return { done, active, late, pct };
}

function orderKPI(tasks, order, day) {
  const ot   = tasks.filter(t=>t.orderId===order.id);
  const last = ot[ot.length-1];
  if (!last) return null;
  let wP=0, wT=0;
  ot.forEach(t => { const s=taskState(t,day); wT+=t.rd; wP+=s.done?t.rd:s.active?t.rd*s.pct/100:0; });
  const progress  = wT>0 ? Math.min(100,wP/wT*100) : 0;
  const ltPlan    = last.ps+last.pd;
  const ltReal    = last.rs+last.rd;
  const delay     = ltReal-ltPlan;
  const onTime    = ltReal<=order.deadline;
  const cost      = ot.reduce((s,t)=>s+(PHASE_COST[t.phaseId]||500)*t.rd*(t.tipo==="terzista"?1.15:1),0);
  const margin    = order.price-cost;
  const eff       = Math.round(ltPlan/ltReal*100);
  return { progress, ltPlan, ltReal, delay, onTime, cost, margin, marginPct:Math.round(margin/order.price*100), eff };
}

// canvas rR helper (module-level, no closure cost)
function rR(ctx,x,y,w,h,r) {
  if(w<0){x+=w;w=-w;} if(h<0){y+=h;h=-h;}
  r=Math.min(r,w/2,h/2,4);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════════
//  SHARED STYLE TOKENS
// ═══════════════════════════════════════════════════════════════════
const T = {
  inp: { width:"100%",fontSize:11,padding:"4px 8px",borderRadius:6,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",fontFamily:"inherit",outline:"none" },
  lbl: { fontSize:10,color:"var(--color-text-secondary)",marginBottom:3,display:"block" },
  row: { display:"flex",gap:6,alignItems:"center" },
  sec: { fontSize:11,fontWeight:500,color:"var(--color-text-primary)",padding:"6px 0 5px",borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:6 },
  card:{ background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:10,padding:"10px 12px",marginBottom:7 },
  mini:{ background:"var(--color-background-secondary)",borderRadius:8,padding:"8px 10px",textAlign:"center",flex:1 },
  pill:(c)=>({ fontSize:9,padding:"1px 7px",borderRadius:12,background:`${c}22`,color:c,border:`0.5px solid ${c}55`,fontWeight:500,whiteSpace:"nowrap" }),
  btn: (on,danger)=>({ padding:"3px 10px",fontSize:11,borderRadius:20,border:`0.5px solid ${danger?"#E24B4A55":"var(--color-border-secondary)"}`,background:on?"var(--color-background-info)":"transparent",color:danger?"#E24B4A":on?"var(--color-text-info)":"var(--color-text-primary)",cursor:"pointer",fontFamily:"inherit",transition:"background 0.1s" }),
};

// ═══════════════════════════════════════════════════════════════════
//  RESIZE HANDLE
// ═══════════════════════════════════════════════════════════════════
function ResizeHandle({ onDelta }) {
  const isDragging = useRef(false);
  const lastX      = useRef(0);
  const handleRef  = useRef(null);

  useEffect(() => {
    const onMove = (e) => { if(!isDragging.current)return; onDelta(e.clientX-lastX.current); lastX.current=e.clientX; };
    const onUp   = ()  => { isDragging.current=false; document.body.style.cursor=""; };
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  }, [onDelta]);

  return (
    <div ref={handleRef}
      onMouseDown={e=>{ isDragging.current=true; lastX.current=e.clientX; document.body.style.cursor="col-resize"; e.preventDefault(); }}
      style={{ width:5,flexShrink:0,cursor:"col-resize",background:"transparent",zIndex:10,transition:"background .15s" }}
      onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-info)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TASK EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function TaskEditor() {
  const { st, dispatch } = useApp();
  const { editId }       = st.ui;
  const src              = editId ? st.tasks.find(t=>t.id===editId) : null;
  const [loc, setLoc]    = useState(null);

  useEffect(()=>{ if(src) setLoc({...src}); },[editId]);

  if (!src || !loc) return null;

  const order = st.orders.find(o=>o.id===loc.orderId);
  const phase = st.phases.find(p=>p.id===loc.phaseId);

  const save = () => { dispatch({type:"UPD_TASK",payload:loc}); dispatch({type:"CLOSE_EDIT"}); };
  const del  = () => { dispatch({type:"DEL_TASK",payload:loc.id}); };

  const F = ({label,children}) => (
    <div style={{marginBottom:9}}><label style={T.lbl}>{label}</label>{children}</div>
  );

  const backdrop = { position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center" };
  const modal    = { background:"var(--color-background-primary)",borderRadius:12,padding:"18px 20px",width:400,maxHeight:"80vh",overflowY:"auto",border:"0.5px solid var(--color-border-secondary)" };

  return (
    <div style={backdrop} onClick={e=>e.target===e.currentTarget&&dispatch({type:"CLOSE_EDIT"})}>
      <div style={modal}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <p style={{fontSize:13,fontWeight:500,color:order?.color,margin:0}}>{order?.label} · {phase?.name}</p>
            <p style={{fontSize:10,color:"var(--color-text-secondary)",margin:"2px 0 0"}}>ID: {loc.id} · {loc.tipo}</p>
          </div>
          <button onClick={()=>dispatch({type:"CLOSE_EDIT"})} style={{...T.btn(false),padding:"2px 8px"}}>✕</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <F label="Fase">
            <select style={T.inp} value={loc.phaseId} onChange={e=>setLoc({...loc,phaseId:e.target.value})}>
              {st.phases.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </F>
          <F label="Risorsa">
            <select style={T.inp} value={loc.resourceId} onChange={e=>setLoc({...loc,resourceId:e.target.value})}>
              {st.resources.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </F>
          <F label="Telaio">
            <select style={T.inp} value={loc.loomId||""} onChange={e=>setLoc({...loc,loomId:e.target.value||null})}>
              <option value="">— nessuno —</option>
              {st.looms.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </F>
          <F label="Catena">
            <select style={T.inp} value={loc.catenaId||""} onChange={e=>setLoc({...loc,catenaId:e.target.value||null})}>
              <option value="">— nessuna —</option>
              {st.catene.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <F label="Inizio pianif. (gg)"><input type="number" style={T.inp} value={loc.ps} min="0" onChange={e=>setLoc({...loc,ps:+e.target.value})}/></F>
          <F label="Durata pianif. (gg)"><input type="number" style={T.inp} value={loc.pd} min="1" onChange={e=>setLoc({...loc,pd:+e.target.value})}/></F>
          <F label="Inizio reale (gg)"><input type="number" style={T.inp} value={loc.rs} min="0" onChange={e=>setLoc({...loc,rs:+e.target.value})}/></F>
          <F label="Durata reale (gg)"><input type="number" style={T.inp} value={loc.rd} min="1" onChange={e=>setLoc({...loc,rd:+e.target.value})}/></F>
        </div>

        <F label="Tipo risorsa">
          <div style={T.row}>
            {["interno","terzista"].map(t=>(
              <button key={t} onClick={()=>setLoc({...loc,tipo:t})} style={T.btn(loc.tipo===t)}>{t}</button>
            ))}
          </div>
        </F>

        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
          <button onClick={del} style={T.btn(false,true)}>Elimina</button>
          <button onClick={()=>dispatch({type:"CLOSE_EDIT"})} style={T.btn(false)}>Annulla</button>
          <button onClick={save} style={{...T.btn(true),background:"#1D9E75",color:"#fff",border:"none",padding:"4px 18px"}}>Salva</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CONFIG PANEL
// ═══════════════════════════════════════════════════════════════════
function ConfigPanel() {
  const { st, dispatch } = useApp();
  const [sec, setSec]    = useState("looms");

  const SECS = [["looms","Telai"],["phases","Fasi"],["resources","Risorse"],["catene","Catene"],["orders","Ordini"]];

  const Item = ({ children, onDel }) => (
    <div style={{background:"var(--color-background-secondary)",borderRadius:8,padding:"7px 9px",marginBottom:6}}>
      {children}
      {onDel && <button onClick={onDel} style={{...T.btn(false,true),fontSize:10,padding:"1px 7px",marginTop:5}}>Rimuovi</button>}
    </div>
  );

  const AddBtn = ({label,onClick}) => (
    <button onClick={onClick} style={{...T.btn(false),width:"100%",marginTop:4,fontSize:11}}>{label}</button>
  );

  const ColorSwatch = ({value, onChange}) => (
    <input type="color" value={value.slice(0,7)} onChange={e=>onChange(e.target.value)}
      style={{width:24,height:24,border:"none",borderRadius:4,cursor:"pointer",padding:0,flexShrink:0}}/>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <div style={{padding:"10px 12px 6px",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:12,fontWeight:500,color:"var(--color-text-primary)"}}>⚙ Configurazione</div>
      <div style={{display:"flex",gap:4,padding:"6px 8px",flexWrap:"wrap",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        {SECS.map(([id,lbl])=><button key={id} onClick={()=>setSec(id)} style={{...T.btn(sec===id),fontSize:10,padding:"2px 8px"}}>{lbl}</button>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>

        {sec==="looms" && <>
          {st.looms.map(l=>(
            <Item key={l.id} onDel={()=>dispatch({type:"DEL_LOOM",payload:l.id})}>
              <div style={{display:"flex",gap:5,marginBottom:5}}>
                <input style={{...T.inp,flex:1}} value={l.name} onChange={e=>dispatch({type:"UPD_LOOM",payload:{id:l.id,name:e.target.value}})}/>
                <input type="number" style={{...T.inp,width:52}} value={l.capacity} min="0" max="100" title="Capacità %"
                  onChange={e=>dispatch({type:"UPD_LOOM",payload:{id:l.id,capacity:+e.target.value}})}/>
              </div>
              <select style={T.inp} value={l.type} onChange={e=>dispatch({type:"UPD_LOOM",payload:{id:l.id,type:e.target.value}})}>
                {["pinza_positiva","pinza_negativa","getto_aria","jaquard","smit","navetta"].map(v=><option key={v} value={v}>{v}</option>)}
              </select>
            </Item>
          ))}
          {st.looms.length<40 && <AddBtn label={`+ Aggiungi Telaio (${st.looms.length}/40)`} onClick={()=>dispatch({type:"ADD_LOOM"})}/>}
        </>}

        {sec==="phases" && <>
          {st.phases.map(p=>(
            <div key={p.id} style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
              <ColorSwatch value={p.color} onChange={c=>dispatch({type:"UPD_PHASE",payload:{id:p.id,color:c}})}/>
              <input style={{...T.inp,flex:1}} value={p.name} onChange={e=>dispatch({type:"UPD_PHASE",payload:{id:p.id,name:e.target.value}})}/>
              <input type="number" style={{...T.inp,width:44}} value={p.dur} min="1" title="Durata default (gg)"
                onChange={e=>dispatch({type:"UPD_PHASE",payload:{id:p.id,dur:+e.target.value}})}/>
              <button onClick={()=>dispatch({type:"DEL_PHASE",payload:p.id})} style={{...T.btn(false,true),padding:"2px 7px",fontSize:11}}>✕</button>
            </div>
          ))}
          <AddBtn label="+ Aggiungi Fase" onClick={()=>dispatch({type:"ADD_PHASE"})}/>
        </>}

        {sec==="resources" && <>
          {st.resources.map(r=>(
            <Item key={r.id} onDel={()=>dispatch({type:"DEL_RES",payload:r.id})}>
              <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
                <ColorSwatch value={r.color} onChange={c=>dispatch({type:"UPD_RES",payload:{id:r.id,color:c}})}/>
                <input style={{...T.inp,flex:1}} value={r.name} onChange={e=>dispatch({type:"UPD_RES",payload:{id:r.id,name:e.target.value}})}/>
              </div>
              <div style={T.row}>
                {["interno","terzista"].map(tipo=>(
                  <button key={tipo} onClick={()=>dispatch({type:"UPD_RES",payload:{id:r.id,tipo}})} style={{...T.btn(r.tipo===tipo),fontSize:10}}>{tipo}</button>
                ))}
              </div>
            </Item>
          ))}
          <AddBtn label="+ Aggiungi Risorsa" onClick={()=>dispatch({type:"ADD_RES"})}/>
        </>}

        {sec==="catene" && <>
          {st.catene.map(c=>(
            <Item key={c.id} onDel={()=>dispatch({type:"DEL_CAT",payload:c.id})}>
              <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
                <ColorSwatch value={c.color.slice(0,7)} onChange={col=>dispatch({type:"UPD_CAT",payload:{id:c.id,color:col+"33"}})}/>
                <input style={{...T.inp,flex:1}} value={c.name} onChange={e=>dispatch({type:"UPD_CAT",payload:{id:c.id,name:e.target.value}})}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}>
                  <label style={T.lbl}>Ordine</label>
                  <select style={T.inp} value={c.orderId} onChange={e=>dispatch({type:"UPD_CAT",payload:{id:c.id,orderId:e.target.value}})}>
                    {st.orders.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{width:66}}>
                  <label style={T.lbl}>Pezze</label>
                  <input type="number" style={T.inp} value={c.pezze} min="1" onChange={e=>dispatch({type:"UPD_CAT",payload:{id:c.id,pezze:+e.target.value}})}/>
                </div>
              </div>
            </Item>
          ))}
          <AddBtn label="+ Lancia Catena" onClick={()=>dispatch({type:"ADD_CAT"})}/>
        </>}

        {sec==="orders" && <>
          {st.orders.map(o=>(
            <div key={o.id} style={{...T.card,borderLeft:`3px solid ${o.color}`,padding:"8px 10px",marginBottom:6}}>
              <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:5}}>
                <ColorSwatch value={o.color} onChange={c=>dispatch({type:"UPD_ORD",payload:{id:o.id,color:c}})}/>
                <input style={{...T.inp,flex:1}} value={o.label} onChange={e=>dispatch({type:"UPD_ORD",payload:{id:o.id,label:e.target.value}})}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <div style={{flex:1}}><label style={T.lbl}>Scadenza (gg)</label>
                  <input type="number" style={T.inp} value={o.deadline} min="1"
                    onChange={e=>dispatch({type:"UPD_ORD",payload:{id:o.id,deadline:+e.target.value}})}/>
                </div>
                <div style={{flex:1}}><label style={T.lbl}>Prezzo €</label>
                  <input type="number" style={T.inp} value={o.price} min="0" step="1000"
                    onChange={e=>dispatch({type:"UPD_ORD",payload:{id:o.id,price:+e.target.value}})}/>
                </div>
              </div>
            </div>
          ))}
          <AddBtn label="+ Aggiungi Ordine" onClick={()=>dispatch({type:"ADD_ORD"})}/>
        </>}

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  KPI PANEL
// ═══════════════════════════════════════════════════════════════════
function KPIPanel() {
  const { st } = useApp();
  const { day } = st.ui;

  const kpis = useMemo(()=>
    st.orders.map(o=>({...o, kpi:orderKPI(st.tasks,o,day)})),
    [st.tasks,st.orders,day]
  );

  const resSat = useMemo(()=>{
    const m={};
    st.tasks.forEach(t=>{ const r=st.resources.find(r=>r.id===t.resourceId); if(!r)return; m[r.id]=m[r.id]||{r,d:0}; m[r.id].d+=t.rd; });
    const max=Math.max(...Object.values(m).map(v=>v.d),1);
    return Object.values(m).map(v=>({...v,pct:Math.round(v.d/max*100)})).sort((a,b)=>b.pct-a.pct);
  },[st.tasks,st.resources]);

  const loomSat = useMemo(()=>
    st.looms.map(l=>{ const d=st.tasks.filter(t=>t.loomId===l.id).reduce((s,t)=>s+t.rd,0); return {l,d,pct:Math.min(100,Math.round(d/30*100))}; }),
    [st.tasks,st.looms]
  );

  const wip      = useMemo(()=>st.tasks.filter(t=>taskState(t,day).active).length,[st.tasks,day]);
  const delayed  = useMemo(()=>st.tasks.filter(t=>taskState(t,day).late),[st.tasks,day]);
  const totalCost= useMemo(()=>kpis.reduce((s,{kpi})=>s+(kpi?.cost||0),0),[kpis]);
  const totalMgn = useMemo(()=>kpis.reduce((s,{kpi,price})=>s+(kpi?.margin||0),0),[kpis]);

  const SBar = ({pct,c})=>(
    <div style={{background:"var(--color-background-secondary)",borderRadius:4,height:5,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:4,transition:"width .25s"}}/>
    </div>
  );

  const satColor = (pct)=> pct>85?"#E24B4A":pct>60?"#BA7517":"#1D9E75";

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      <div style={{padding:"10px 12px 6px",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:12,fontWeight:500,color:"var(--color-text-primary)"}}>
        📈 KPI · G{day} · {fmtD(addDays(START_DATE,day))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>

        {/* Summary row */}
        <div style={{display:"flex",gap:5,marginBottom:8}}>
          {[[wip,"WIP","#378ADD"],[delayed.length,"Ritardi","#E24B4A"],[st.orders.length,"Ordini","#534AB7"]].map(([v,l,c])=>(
            <div key={l} style={T.mini}><p style={{fontSize:9,color:"var(--color-text-secondary)",margin:"0 0 2px"}}>{l}</p>
              <p style={{fontSize:18,fontWeight:500,color:v>0&&l==="Ritardi"?"#E24B4A":"var(--color-text-primary)",margin:0}}>{v}</p>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          <div style={T.mini}><p style={{fontSize:9,color:"var(--color-text-secondary)",margin:"0 0 2px"}}>Costo tot.</p>
            <p style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",margin:0}}>€{Math.round(totalCost/1000)}k</p></div>
          <div style={T.mini}><p style={{fontSize:9,color:"var(--color-text-secondary)",margin:"0 0 2px"}}>Margine tot.</p>
            <p style={{fontSize:13,fontWeight:500,color:totalMgn>0?"#1D9E75":"#E24B4A",margin:0}}>€{Math.round(totalMgn/1000)}k</p></div>
        </div>

        {/* Per-order KPIs */}
        {kpis.map(({id,label,sub,color,kpi})=>{
          if(!kpi) return null;
          const f=Math.round(Math.min(100,kpi.progress)/10);
          return (
            <div key={id} style={{...T.card,borderLeft:`3px solid ${color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><p style={{fontSize:11,fontWeight:500,color,margin:0}}>{label}</p>
                  <p style={{fontSize:9,color:"var(--color-text-secondary)",margin:"1px 0 0"}}>{sub}</p>
                </div>
                <span style={T.pill(kpi.onTime?"#1D9E75":"#E24B4A")}>{kpi.onTime?"✓ OTD":"⚠ LATE"}</span>
              </div>
              <SBar pct={Math.min(100,kpi.progress)} c={color}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginTop:3,marginBottom:6}}>
                <span style={{fontFamily:"monospace",color:"var(--color-text-secondary)"}}>{"█".repeat(f)}{"░".repeat(10-f)}</span>
                <span style={{fontWeight:500}}>{Math.round(kpi.progress)}%</span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px 10px"}}>
                {[["LT Plan",`${kpi.ltPlan}gg`],["LT Reale",`${kpi.ltReal}gg`],
                  ["Δ Ritardo",kpi.delay>0?`+${kpi.delay}gg`:"—"],["Efficienza",`${kpi.eff}%`],
                  ["Costo",`€${Math.round(kpi.cost/1000)}k`],["Margine",`${kpi.marginPct}%`]
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:10,borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"2px 0"}}>
                    <span style={{color:"var(--color-text-secondary)"}}>{k}</span>
                    <span style={{fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Delay heatmap */}
        {delayed.length>0 && (
          <div style={T.card}>
            <p style={T.sec}>⚠ Ritardi attivi</p>
            {delayed.map(t=>{
              const ph=st.phases.find(p=>p.id===t.phaseId);
              const ord=st.orders.find(o=>o.id===t.orderId);
              const dg=day-(t.ps+t.pd);
              const heat=dg>7?"#E24B4A":dg>3?"#BA7517":"#FF9500";
              return (
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                  <span style={{color:ord?.color}}>{ord?.label}</span>
                  <span style={{color:"var(--color-text-primary)"}}>{ph?.name}</span>
                  <span style={{color:heat,fontWeight:500}}>+{dg}gg</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Loom saturation */}
        {loomSat.some(l=>l.d>0) && (
          <div style={T.card}>
            <p style={T.sec}>Telai — Saturazione</p>
            {loomSat.filter(l=>l.d>0).map(({l,d,pct})=>(
              <div key={l.id} style={{marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                  <span style={{color:"var(--color-text-primary)"}}>{l.name}</span>
                  <span style={{color:"var(--color-text-secondary)"}}>{d}gg · {pct}%</span>
                </div>
                <SBar pct={pct} c={satColor(pct)}/>
              </div>
            ))}
          </div>
        )}

        {/* Resource saturation */}
        <div style={T.card}>
          <p style={T.sec}>Risorse — Saturazione</p>
          {resSat.map(({r,d,pct})=>(
            <div key={r.id} style={{marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:10,marginBottom:2}}>
                <span style={{color:"var(--color-text-primary)"}}>{r.name}</span>
                <div style={T.row}><span style={T.pill(r.tipo==="terzista"?"#BA7517":"#1D9E75")}>{r.tipo==="terzista"?"TRZ":"INT"}</span></div>
              </div>
              <SBar pct={pct} c={satColor(pct)}/>
            </div>
          ))}
        </div>

        {/* Catene WIP */}
        <div style={T.card}>
          <p style={T.sec}>Catene — WIP</p>
          {st.catene.map(cat=>{
            const catT=st.tasks.filter(t=>t.catenaId===cat.id);
            const ord=st.orders.find(o=>o.id===cat.orderId);
            const done=catT.filter(t=>taskState(t,day).done).length;
            const active=catT.filter(t=>taskState(t,day).active).length;
            return (
              <div key={cat.id} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"3px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                <span style={{color:ord?.color||"var(--color-text-primary)"}}>{cat.name}</span>
                <span style={{color:"var(--color-text-secondary)"}}>{cat.pezze} pz</span>
                <span style={{color:"#1D9E75"}}>{done}/{catT.length} ✓ {active>0?`· ${active} WIP`:""}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GANTT CANVAS
// ═══════════════════════════════════════════════════════════════════
function GanttCanvas() {
  const { st, dispatch } = useApp();
  const canvasRef  = useRef(null);
  const wrapRef    = useRef(null);
  const rafRef     = useRef(null);
  const drag       = useRef({ on:false, id:null, mode:"move", sx:0, origRs:0, origRd:0 });
  const stRef      = useRef(st);
  stRef.current    = st;

  const { day, viewMode, zoom, selectedId } = st.ui;
  const dk = window.matchMedia("(prefers-color-scheme:dark)").matches;

  const LW = 185;
  const DW = zoom==="week" ? 3 : 11;
  const RH = 33;
  const HH = 46;

  // Build rows memo
  const rows = useMemo(()=>{
    if (viewMode==="order") {
      return st.orders.flatMap(ord=>{
        const tasks=st.tasks.filter(t=>t.orderId===ord.id);
        return tasks.map(t=>({
          ...t,
          rowLabel: st.phases.find(p=>p.id===t.phaseId)?.name||t.phaseId,
          phaseColor: st.phases.find(p=>p.id===t.phaseId)?.color||ord.color,
          orderColor: ord.color,
          orderLabel: ord.label,
        }));
      });
    }
    // loom view
    const result=[];
    const used=new Set();
    st.looms.forEach(loom=>{
      st.tasks.filter(t=>t.loomId===loom.id).forEach(t=>{
        const ord=st.orders.find(o=>o.id===t.orderId);
        result.push({ ...t, rowLabel:`${loom.name} · ${ord?.label||""}`, phaseColor:st.phases.find(p=>p.id===t.phaseId)?.color||"#888", orderColor:ord?.color||"#888", orderLabel:loom.name });
        used.add(t.id);
      });
    });
    st.tasks.filter(t=>!used.has(t.id)).forEach(t=>{
      const ord=st.orders.find(o=>o.id===t.orderId);
      result.push({ ...t, rowLabel:st.phases.find(p=>p.id===t.phaseId)?.name||t.phaseId, phaseColor:st.phases.find(p=>p.id===t.phaseId)?.color||"#888", orderColor:ord?.color||"#888", orderLabel:ord?.label||"" });
    });
    return result;
  },[st.tasks,st.orders,st.looms,st.phases,viewMode]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const W = LW+(MAX_DAY+4)*DW;
  const H = HH+rows.length*RH+10;

  // ── draw ──────────────────────────────────────────────────────
  const draw = useCallback(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const s=stRef.current;
    const d=s.ui.day;
    const sel=s.ui.selectedId;
    const vm=s.ui.viewMode;
    const rs=rowsRef.current;

    const BG  = dk?"#181818":"#ffffff";
    const BG2 = dk?"#1e1e1e":"#f6f5f2";
    const BGH = dk?"#242424":"#edebe3";
    const TX  = dk?"#e0e0e0":"#2c2c2a";
    const MU  = dk?"#505050":"#c0c0c0";
    const BD  = dk?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)";

    canvas.width=W; canvas.height=H;
    ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);
    ctx.fillStyle=BGH; ctx.fillRect(0,0,LW,H);
    ctx.fillStyle=BGH; ctx.fillRect(0,0,W,HH);

    const line=(x1,y1,x2,y2,c,lw=0.5)=>{ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
    line(LW,0,LW,H,BD); line(0,HH,W,HH,BD);

    // col header label
    ctx.fillStyle=TX; ctx.font="500 10px system-ui,sans-serif"; ctx.textAlign="left";
    ctx.fillText(vm==="order"?"Fase / Ordine":"Telaio / Fase",10,HH/2+4);

    // catena bands
    s.catene.forEach(cat=>{
      const ct=s.tasks.filter(t=>t.catenaId===cat.id); if(!ct.length)return;
      const minS=Math.min(...ct.map(t=>t.rs));
      const maxE=Math.max(...ct.map(t=>t.rs+t.rd));
      ctx.fillStyle=cat.color||"rgba(100,150,200,0.07)";
      ctx.fillRect(LW+minS*DW,HH,(maxE-minS)*DW,H-HH);
      ctx.fillStyle=dk?"rgba(255,255,255,0.22)":"rgba(0,0,0,0.28)";
      ctx.font="8px system-ui"; ctx.textAlign="left";
      ctx.fillText(cat.name,LW+minS*DW+3,HH+11);
    });

    // day/week ticks
    const step=zoom==="week"?7:5;
    for(let dd=0;dd<=MAX_DAY+3;dd++){
      const x=LW+dd*DW;
      if(dd%step===0){
        line(x,HH,x,H,BD);
        ctx.fillStyle=MU; ctx.font="8px system-ui,sans-serif"; ctx.textAlign="center";
        ctx.fillText(zoom==="week"?`S${Math.floor(dd/7)+1}`:`G${dd}`,x,HH-18);
        ctx.fillText(fmtD(addDays(START_DATE,dd)),x,HH-6);
      } else {
        line(x,HH,x,H,dk?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.02)",0.3);
      }
    }

    // rows
    let lastOrd=null;
    rs.forEach((row,ri)=>{
      const ry=HH+ri*RH;
      const isSel=row.id===sel;

      // order group header band
      if(vm==="order" && row.orderId!==lastOrd){
        if(lastOrd) line(0,ry,W,ry,row.orderColor+"88",1);
        ctx.fillStyle=row.orderColor+"18"; ctx.fillRect(0,ry,LW,RH);
        ctx.fillStyle=row.orderColor; ctx.font="500 9px system-ui"; ctx.textAlign="left";
        ctx.fillText(row.orderLabel,9,ry+RH/2+3);
        lastOrd=row.orderId;
      }

      // row bg
      ctx.fillStyle=isSel?(dk?"rgba(55,138,221,0.14)":"rgba(55,138,221,0.09)"):ri%2===0?BG:BG2;
      ctx.fillRect(vm==="order"?LW:0,ry,vm==="order"?W-LW:W,RH);
      line(0,ry+RH,W,ry+RH,BD);

      // phase accent stripe
      ctx.fillStyle=row.phaseColor; ctx.fillRect(2,ry+8,3,RH-16);

      // row label
      ctx.save(); ctx.beginPath(); ctx.rect(8,ry,LW-44,RH); ctx.clip();
      ctx.fillStyle=TX; ctx.font="10px system-ui"; ctx.textAlign="left";
      ctx.fillText(row.rowLabel,10,ry+RH/2+4);
      ctx.restore();
      ctx.fillStyle=row.tipo==="terzista"?"#BA7517":"#1D9E75";
      ctx.font="7px system-ui"; ctx.textAlign="right";
      ctx.fillText(row.tipo==="terzista"?"TRZ":"INT",LW-4,ry+RH/2+3);

      const { done,active,late,pct } = taskState(row,d);

      // planned ghost
      const pgx=LW+row.ps*DW+1, pgw=Math.max(2,row.pd*DW-2);
      ctx.fillStyle=dk?"rgba(200,200,200,0.09)":"rgba(80,80,80,0.08)";
      ctx.fillRect(pgx,ry+10,pgw,RH-20);

      // real bar
      const bx=LW+row.rs*DW+1, by=ry+7, bh=RH-14;
      let barColor=row.phaseColor;
      if(done) barColor="#1D9E75";
      else if(late) barColor="#E24B4A";

      if(done){
        rR(ctx,bx,by,Math.max(2,row.rd*DW-2),bh,4);
        ctx.globalAlpha=0.83; ctx.fillStyle=barColor; ctx.fill(); ctx.globalAlpha=1;
      } else if(active){
        const donePx=Math.min(row.rd*DW-2,Math.max(2,(d-row.rs)*DW));
        rR(ctx,bx,by,donePx,bh,4); ctx.globalAlpha=0.9; ctx.fillStyle=barColor; ctx.fill(); ctx.globalAlpha=1;
        ctx.strokeStyle=barColor; ctx.lineWidth=1.5;
        rR(ctx,bx-1,by-1,row.rd*DW,bh+2,5); ctx.stroke();
        if(donePx>28){ ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.font="8px system-ui"; ctx.textAlign="center"; ctx.fillText(`${pct}%`,bx+donePx/2,by+bh/2+3); }
      } else if(late){
        const dp=(row.ps+row.pd-row.rs)*DW;
        rR(ctx,bx,by,Math.max(2,dp),bh,4); ctx.globalAlpha=0.8; ctx.fillStyle=barColor; ctx.fill(); ctx.globalAlpha=1;
        ctx.fillStyle="#E24B4A"; ctx.font="8px system-ui"; ctx.textAlign="left";
        ctx.fillText(`⚠+${d-(row.ps+row.pd)}g`,LW+(row.ps+row.pd)*DW+3,ry+RH/2+3);
      }

      // loom overload orange border
      if(row.loomId){
        const conflict=rs.some(r2=>r2.id!==row.id&&r2.loomId===row.loomId&&row.rs<r2.rs+r2.rd&&row.rs+row.rd>r2.rs);
        if(conflict){ ctx.strokeStyle="#FF6B00"; ctx.lineWidth=1.8; ctx.setLineDash([3,2]); rR(ctx,bx-1,by-1,row.rd*DW,bh+2,5); ctx.stroke(); ctx.setLineDash([]); }
      }

      // selected gold border
      if(isSel){ ctx.strokeStyle="#FFD700"; ctx.lineWidth=2; rR(ctx,bx-2,by-2,row.rd*DW+2,bh+4,5); ctx.stroke(); }

      // deadline marker
      const ord=s.orders.find(o=>o.id===row.orderId);
      if(ord){ const dlx=LW+ord.deadline*DW; line(dlx,ry+3,dlx,ry+RH-3,ord.color+"aa",1.5); }

      // bar duration label
      const bw=row.rd*DW;
      if(bw>24&&!active){ ctx.fillStyle="rgba(255,255,255,0.92)"; ctx.font="8px system-ui"; ctx.textAlign="center"; ctx.fillText(`${row.rd}g`,bx+bw/2,by+bh/2+3); }
    });

    // today line
    const tx=LW+d*DW;
    ctx.strokeStyle="rgba(220,60,60,0.7)"; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,H); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#E24B4A"; ctx.font="500 9px system-ui"; ctx.textAlign="center";
    ctx.fillText(`G${d}`,tx,11); ctx.fillText(fmtD(addDays(START_DATE,d)),tx,23);

  },[dk,W,H,DW,LW,RH,HH,zoom]);

  // RAF loop
  useEffect(()=>{
    const loop=()=>{ draw(); rafRef.current=requestAnimationFrame(loop); };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[draw]);

  // ── mouse events ──
  const getRow = useCallback((my)=>{
    const ri=Math.floor((my-HH)/RH);
    return ri>=0&&ri<rowsRef.current.length?rowsRef.current[ri]:null;
  },[HH,RH]);

  const onMouseDown = useCallback((e)=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const row=getRow(my); if(!row)return;
    const bx=LW+row.rs*DW, bw=row.rd*DW;
    if(mx<bx||mx>bx+bw) return;
    dispatch({type:"SELECT",payload:row.id});
    const onEdge=mx>=bx+bw-7;
    drag.current={ on:true,id:row.id,mode:onEdge?"resize":"move",sx:mx,origRs:row.rs,origRd:row.rd };
    e.preventDefault();
  },[getRow,dispatch,DW,LW]);

  const onMouseMove = useCallback((e)=>{
    const d=drag.current; if(!d.on)return;
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    const delta=Math.round((mx-d.sx)/DW);
    if(d.mode==="move")   dispatch({type:"MOVE_TASK",  payload:{id:d.id,delta}});
    if(d.mode==="resize") dispatch({type:"RESIZE_TASK",payload:{id:d.id,rd:Math.max(1,d.origRd+delta)}});
    if(d.mode==="move") { drag.current.sx=mx; drag.current.origRs+=delta; }
  },[dispatch,DW]);

  const onMouseUp   = useCallback(()=>{ drag.current.on=false; },[]);
  const onDblClick  = useCallback((e)=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const row=getRow(my); if(!row)return;
    const bx=LW+row.rs*DW, bw=row.rd*DW;
    if(mx>=bx&&mx<=bx+bw) dispatch({type:"OPEN_EDIT",payload:row.id});
  },[getRow,dispatch,DW,LW]);

  const cursor = drag.current.on ? (drag.current.mode==="resize"?"ew-resize":"grabbing") : "crosshair";

  return (
    <div ref={wrapRef} style={{flex:1,overflow:"auto",position:"relative"}}>
      <canvas ref={canvasRef} style={{display:"block",cursor}}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onDoubleClick={onDblClick}/>
      <div style={{position:"sticky",bottom:0,left:0,background:"var(--color-background-secondary)",borderTop:"0.5px solid var(--color-border-tertiary)",padding:"3px 10px",fontSize:9,color:"var(--color-text-secondary)",display:"flex",gap:16,flexWrap:"wrap"}}>
        <span>Click = seleziona · Drag barra = sposta · Drag bordo destro = ridimensiona · Doppio click = apri editor</span>
        <span>▐ Bordo arancio = telaio sovraccarico · ◇ Oro = selezionato · ▲ Rosso = ritardo · Ghost = pianificato</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PLAYER BAR
// ═══════════════════════════════════════════════════════════════════
function PlayerBar() {
  const { st, dispatch } = useApp();
  const { day,playing,speed,viewMode,zoom,activeTab } = st.ui;
  const timer = useRef(null);

  useEffect(()=>{
    if(playing){ timer.current=setInterval(()=>dispatch({type:"TICK"}),820/speed); }
    return ()=>clearInterval(timer.current);
  },[playing,speed,dispatch]);

  const Btn=({label,onClick,on,danger})=>(
    <button onClick={onClick} style={{...T.btn(on,danger),fontFamily:"inherit"}}>{label}</button>
  );

  const Div=()=><div style={{width:"0.5px",height:24,background:"var(--color-border-tertiary)",flexShrink:0}}/>;

  return (
    <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 12px",background:"var(--color-background-secondary)",borderBottom:"0.5px solid var(--color-border-tertiary)",flexWrap:"wrap",flexShrink:0,zIndex:20}}>

      <div style={{flexShrink:0,marginRight:6}}>
        <p style={{fontSize:12,fontWeight:700,color:"var(--color-text-primary)",margin:0,lineHeight:1.2}}>🧵 LanificioPRO</p>
        <p style={{fontSize:9,color:"var(--color-text-secondary)",margin:0}}>APS · MES · Distretto Prato 2026</p>
      </div>

      <Div/>

      <Btn label={playing?"⏸":"▶"} onClick={()=>dispatch({type:"PLAYING",payload:!playing})} on={playing}/>
      <Btn label="↩ Reset" onClick={()=>{ dispatch({type:"SET_DAY",payload:0}); dispatch({type:"PLAYING",payload:false}); }}/>

      <div style={{display:"flex",alignItems:"center",gap:5,flex:"1 1 100px",minWidth:90}}>
        <input type="range" min="0" max={MAX_DAY} value={day}
          onChange={e=>{ dispatch({type:"SET_DAY",payload:+e.target.value}); dispatch({type:"PLAYING",payload:false}); }}
          style={{flex:1}}/>
        <span style={{fontSize:11,fontWeight:500,minWidth:30,color:"var(--color-text-primary)"}}>G{day}</span>
        <span style={{fontSize:9,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>{fmtD(addDays(START_DATE,day))}</span>
      </div>

      <div style={T.row}>
        {[1,2,4,8].map(s=><Btn key={s} label={`×${s}`} onClick={()=>dispatch({type:"SPEED",payload:s})} on={speed===s}/>)}
      </div>

      <Div/>

      <Btn label="Per Ordine" onClick={()=>dispatch({type:"VIEW_MODE",payload:"order"})} on={viewMode==="order"}/>
      <Btn label="Per Telaio" onClick={()=>dispatch({type:"VIEW_MODE",payload:"loom"})}  on={viewMode==="loom"}/>

      <Div/>

      <Btn label="Giorni"     onClick={()=>dispatch({type:"ZOOM",payload:"day"})}  on={zoom==="day"}/>
      <Btn label="Settimane"  onClick={()=>dispatch({type:"ZOOM",payload:"week"})} on={zoom==="week"}/>

      <Div/>

      {[["gantt","📊"],["kpi","📈"],["config","⚙"]].map(([id,ic])=>(
        <Btn key={id} label={ic+" "+id.charAt(0).toUpperCase()+id.slice(1)}
          onClick={()=>dispatch({type:"TAB",payload:id})} on={activeTab===id}/>
      ))}

      <button onClick={async()=>{ const ok=await API.save(st); }}
        style={{...T.btn(false),marginLeft:"auto",color:"#1D9E75",borderColor:"#1D9E7555",fontFamily:"inherit",fontSize:11}}>
        💾 Salva
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [st, dispatch] = useReducer(reducer, INIT_STATE);

  // restore from localStorage on mount
  useEffect(()=>{
    API.load().then(data=>{ if(data) dispatch({type:"LOAD",payload:data}); });
  },[]);

  const { activeTab, leftW, rightW } = st.ui;
  const setLeftW  = useCallback(d=>dispatch({type:"LEFT_W", payload:d}),[]);
  const setRightW = useCallback(d=>dispatch({type:"RIGHT_W",payload:d}),[]);

  const showLeft  = activeTab==="config";
  const showRight = activeTab==="gantt"||activeTab==="config";

  return (
    <Ctx.Provider value={{ st, dispatch }}>
      <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",background:"var(--color-background-tertiary)",color:"var(--color-text-primary)",fontFamily:"system-ui,sans-serif"}}>

        <PlayerBar/>

        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>

          {/* Left — Config */}
          {showLeft && (
            <>
              <div style={{width:leftW,flexShrink:0,overflow:"hidden",borderRight:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
                <ConfigPanel/>
              </div>
              <ResizeHandle onDelta={setLeftW}/>
            </>
          )}

          {/* Center */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"var(--color-background-primary)",minWidth:0}}>
            {activeTab==="gantt"  && <GanttCanvas/>}
            {activeTab==="config" && <GanttCanvas/>}
            {activeTab==="kpi"    && <div style={{flex:1,overflow:"auto"}}><KPIPanel/></div>}
          </div>

          {/* Right — KPI */}
          {showRight && (
            <>
              <ResizeHandle onDelta={setRightW}/>
              <div style={{width:rightW,flexShrink:0,overflow:"hidden",borderLeft:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
                <KPIPanel/>
              </div>
            </>
          )}

        </div>

        <TaskEditor/>
      </div>
    </Ctx.Provider>
  );
}
