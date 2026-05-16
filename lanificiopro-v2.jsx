import {
  useState, useEffect, useRef, useReducer,
  useCallback, useMemo, createContext, useContext,
} from "react";

// ═══════════════════════════════════════════════════════════════════
//  SEED DATA
// ═══════════════════════════════════════════════════════════════════
const SEED_PHASES = [
  { id:"MP",   name:"Materia Prima",  color:"#4ECDC4", icon:"📦", loom:false },
  { id:"CARD", name:"Cardatura",      color:"#45B7D1", icon:"🔄", loom:false },
  { id:"FIL",  name:"Filatura",       color:"#96CEB4", icon:"🧵", loom:false },
  { id:"TIN",  name:"Tintoria",       color:"#A855F7", icon:"🎨", loom:false },
  { id:"ORD",  name:"Orditura",       color:"#F59E0B", icon:"⚙️", loom:false },
  { id:"TES",  name:"Tessitura",      color:"#EF4444", icon:"🪡", loom:true  },
  { id:"FIN",  name:"Finissaggio",    color:"#10B981", icon:"✨", loom:false },
  { id:"CQ",   name:"Qualità",        color:"#3B82F6", icon:"🔍", loom:false },
  { id:"DEL",  name:"Consegna",       color:"#6B7280", icon:"🚚", loom:false },
];
const SEED_RESOURCES = [
  { id:"R1", name:"Magazzino",       tipo:"interno",  color:"#4ECDC4" },
  { id:"R2", name:"Reparto Card.",   tipo:"interno",  color:"#45B7D1" },
  { id:"R3", name:"Rep. Filatura",   tipo:"interno",  color:"#96CEB4" },
  { id:"R4", name:"Fil. Rossi snc",  tipo:"terzista", color:"#F59E0B" },
  { id:"R5", name:"Tes. Montemurlo", tipo:"terzista", color:"#EF4444" },
  { id:"R6", name:"Finiss. Vaiano",  tipo:"terzista", color:"#10B981" },
  { id:"R7", name:"Card. Bisenzio",  tipo:"terzista", color:"#A855F7" },
  { id:"R8", name:"CQ Interno",      tipo:"interno",  color:"#3B82F6" },
  { id:"R9", name:"Logistica",       tipo:"interno",  color:"#6B7280" },
];
const SEED_ORDERS = [
  { id:"A", label:"Ordine A", sub:"🔴 URGENTE",       color:"#EF4444", deadline:27, price:25000 },
  { id:"B", label:"Ordine B", sub:"🟡 STANDARD",      color:"#F59E0B", deadline:44, price:42000 },
  { id:"C", label:"Ordine C", sub:"🟢 LUNGO TERMINE", color:"#10B981", deadline:68, price:68000 },
];
const SEED_LOOMS = Array.from({length:6},(_,i)=>({
  id:`L${i+1}`, name:`Telaio ${i+1}`,
  capacity:100, type:["pinza_pos","pinza_neg","getto_aria","jaquard"][i%4],
}));
const SEED_CATENE = [
  { id:"CAT1", name:"Catena Alpha", orderId:"A", pezze:12, color:"#EF444420" },
  { id:"CAT2", name:"Catena Beta",  orderId:"B", pezze:20, color:"#F59E0B20" },
  { id:"CAT3", name:"Catena Gamma", orderId:"C", pezze:30, color:"#10B98120" },
];
const SEED_TASKS = [
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

const COST_MAP = {MP:800,CARD:1200,FIL:2000,TES:3500,FIN:1500,CQ:600,DEL:400,TIN:1800,ORD:600};
const MAX_DAY  = 80;
const START    = new Date("2026-04-07");

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════
const addD  = (d,n)=>{ const x=new Date(d); x.setDate(x.getDate()+n); return x; };
const fmtD  = (d)  => d.toLocaleDateString("it-IT",{day:"2-digit",month:"short"});
const fmtDN = (d)  => d.toLocaleDateString("it-IT",{day:"2-digit",month:"short",year:"2-digit"});
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const toCost= (t)  => (COST_MAP[t.phaseId]||500)*t.rd*(t.tipo==="terzista"?1.15:1);

function tState(t,day){
  const done   = day>=t.rs+t.rd;
  const active = !done && day>=t.rs;
  const late   = !done && day>t.ps+t.pd;
  const pct    = done?100:active?clamp(Math.round((day-t.rs)/t.rd*100),0,99):0;
  return {done,active,late,pct};
}
function orderKPI(tasks,order,day){
  const ot=tasks.filter(t=>t.orderId===order.id);
  if(!ot.length) return null;
  const last=ot[ot.length-1];
  let wP=0,wT=0;
  ot.forEach(t=>{ const s=tState(t,day); wT+=t.rd; wP+=s.done?t.rd:s.active?t.rd*s.pct/100:0; });
  const progress=wT>0?Math.min(100,wP/wT*100):0;
  const ltPlan=last.ps+last.pd, ltReal=last.rs+last.rd;
  const delay=ltReal-ltPlan, onTime=ltReal<=order.deadline;
  const cost=ot.reduce((s,t)=>s+toCost(t),0);
  const margin=order.price-cost;
  return{progress,ltPlan,ltReal,delay,onTime,cost,margin,
    marginPct:Math.round(margin/order.price*100), eff:Math.round(ltPlan/ltReal*100)};
}

// ═══════════════════════════════════════════════════════════════════
//  REDUCER
// ═══════════════════════════════════════════════════════════════════
const S0={
  orders:SEED_ORDERS, tasks:SEED_TASKS, looms:SEED_LOOMS,
  phases:SEED_PHASES, resources:SEED_RESOURCES, catene:SEED_CATENE,
  ui:{ day:0,playing:false,speed:2,view:"order",zoom:"day",
       panel:"gantt",editId:null,selectedId:null,
       tooltip:null, leftOpen:true, rightOpen:true },
};
function reducer(s,{type:T,p}){
  const ui=patch=>({...s,ui:{...s.ui,...patch}});
  switch(T){
    case"SET_DAY":    return ui({day:p,playing:false});
    case"TICK":       { const nd=s.ui.day+1; return nd>MAX_DAY?ui({playing:false}):ui({day:nd}); }
    case"PLAY":       return ui({playing:p});
    case"SPEED":      return ui({speed:p});
    case"VIEW":       return ui({view:p});
    case"ZOOM":       return ui({zoom:p});
    case"PANEL":      return ui({panel:p});
    case"OPEN_EDIT":  return ui({editId:p,selectedId:p});
    case"CLOSE_EDIT": return ui({editId:null});
    case"SELECT":     return ui({selectedId:p,editId:null});
    case"TOOLTIP":    return ui({tooltip:p});
    case"LEFT":       return ui({leftOpen:p});
    case"RIGHT":      return ui({rightOpen:p});
    case"UPD_TASK":   return {...s,tasks:s.tasks.map(t=>t.id===p.id?{...t,...p}:t)};
    case"MOVE_TASK":  return {...s,tasks:s.tasks.map(t=>t.id===p.id?{...t,rs:Math.max(0,p.rs)}:t)};
    case"RESIZE_TASK":return {...s,tasks:s.tasks.map(t=>t.id===p.id?{...t,rd:Math.max(1,p.rd)}:t)};
    case"DEL_TASK":   return {...s,tasks:s.tasks.filter(t=>t.id!==p),ui:{...s.ui,editId:null,selectedId:null}};
    case"ADD_LOOM":   return {...s,looms:[...s.looms,{id:`L${Date.now()}`,name:`Telaio ${s.looms.length+1}`,capacity:100,type:"pinza_neg"}]};
    case"UPD_LOOM":   return {...s,looms:s.looms.map(l=>l.id===p.id?{...l,...p}:l)};
    case"DEL_LOOM":   return {...s,looms:s.looms.filter(l=>l.id!==p)};
    case"ADD_PHASE":  return {...s,phases:[...s.phases,{id:`PH${Date.now()}`,name:"Nuova Fase",color:"#888",icon:"📋",loom:false}]};
    case"UPD_PHASE":  return {...s,phases:s.phases.map(ph=>ph.id===p.id?{...ph,...p}:ph)};
    case"DEL_PHASE":  return {...s,phases:s.phases.filter(ph=>ph.id!==p)};
    case"ADD_RES":    return {...s,resources:[...s.resources,{id:`R${Date.now()}`,name:"Nuova Risorsa",tipo:"interno",color:"#888"}]};
    case"UPD_RES":    return {...s,resources:s.resources.map(r=>r.id===p.id?{...r,...p}:r)};
    case"DEL_RES":    return {...s,resources:s.resources.filter(r=>r.id!==p)};
    case"ADD_CAT":    return {...s,catene:[...s.catene,{id:`CAT${Date.now()}`,name:"Nuova Catena",orderId:s.orders[0]?.id,pezze:10,color:"#88888820"}]};
    case"UPD_CAT":    return {...s,catene:s.catene.map(c=>c.id===p.id?{...c,...p}:c)};
    case"DEL_CAT":    return {...s,catene:s.catene.filter(c=>c.id!==p)};
    case"UPD_ORD":    return {...s,orders:s.orders.map(o=>o.id===p.id?{...o,...p}:o)};
    case"ADD_ORD":    return {...s,orders:[...s.orders,{id:`O${Date.now()}`,label:"Nuovo Ordine",sub:"NUOVO",color:"#888",deadline:60,price:30000}]};
    case"LOAD":       return {...p,ui:{...S0.ui,...(p.ui||{})}};
    default:          return s;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CONTEXT
// ═══════════════════════════════════════════════════════════════════
const Ctx=createContext(null);
const useApp=()=>useContext(Ctx);

const API={
  KEY:"lanificio_v4",
  load(){ try{ const r=localStorage.getItem(this.KEY); return r?JSON.parse(r):null; }catch{return null;} },
  save(s){ try{ localStorage.setItem(this.KEY,JSON.stringify(s)); return true; }catch{return false;} },
};

// ═══════════════════════════════════════════════════════════════════
//  CANVAS ROUND-RECT
// ═══════════════════════════════════════════════════════════════════
function rr(ctx,x,y,w,h,r=5){
  if(w<0){x+=w;w=-w;} if(h<0){y+=h;h=-h;}
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

// ═══════════════════════════════════════════════════════════════════
//  TOOLTIP
// ═══════════════════════════════════════════════════════════════════
function Tooltip(){
  const {st}=useApp();
  const tt=st.ui.tooltip;
  if(!tt) return null;
  return(
    <div style={{position:"fixed",left:tt.x+14,top:tt.y-8,zIndex:999,pointerEvents:"none",
      background:"rgba(15,15,15,0.92)",color:"#fff",borderRadius:10,padding:"9px 13px",
      fontSize:11,boxShadow:"0 8px 30px rgba(0,0,0,0.35)",maxWidth:240,backdropFilter:"blur(6px)",
      border:"0.5px solid rgba(255,255,255,0.12)"}}>
      <p style={{fontWeight:600,margin:"0 0 5px",fontSize:12,color:tt.color||"#fff"}}>{tt.title}</p>
      {tt.rows?.map(([k,v],i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",gap:16,padding:"1px 0",
          borderBottom:i<tt.rows.length-1?"0.5px solid rgba(255,255,255,0.08)":"none"}}>
          <span style={{color:"rgba(255,255,255,0.55)",whiteSpace:"nowrap"}}>{k}</span>
          <span style={{fontWeight:500,color:v?.startsWith?.("⚠")?"#ff6b6b":v?.startsWith?.("✓")?"#51cf66":"#fff"}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TASK EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function TaskEditor(){
  const {st,dispatch}=useApp();
  const src=st.ui.editId?st.tasks.find(t=>t.id===st.ui.editId):null;
  const [f,setF]=useState(null);
  useEffect(()=>{ if(src) setF({...src}); },[st.ui.editId]);
  if(!src||!f) return null;

  const ord=st.orders.find(o=>o.id===f.orderId);
  const phase=st.phases.find(p=>p.id===f.phaseId);
  const resource=st.resources.find(r=>r.id===f.resourceId);

  const save=()=>{ dispatch({type:"UPD_TASK",p:f}); dispatch({type:"CLOSE_EDIT"}); };

  const inp={width:"100%",fontSize:12,padding:"7px 10px",borderRadius:8,
    border:"1.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",
    color:"var(--color-text-primary)",fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const lbl={fontSize:11,color:"var(--color-text-secondary)",marginBottom:4,display:"block",fontWeight:500};

  const statusColor=f.rs+f.rd>f.ps+f.pd?"#EF4444":"#10B981";

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:500,
      display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)"}}
      onClick={e=>e.target===e.currentTarget&&dispatch({type:"CLOSE_EDIT"})}>
      <div style={{background:"var(--color-background-primary)",borderRadius:16,padding:"24px",
        width:460,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.4)",
        border:"0.5px solid var(--color-border-secondary)"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:40,height:40,borderRadius:10,background:phase?.color+"22",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{phase?.icon||"📋"}</div>
            <div>
              <p style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)",margin:0}}>{phase?.name}</p>
              <p style={{fontSize:11,color:ord?.color,margin:"2px 0 0",fontWeight:500}}>{ord?.label} · <span style={{color:"var(--color-text-secondary)"}}>{f.id}</span></p>
            </div>
          </div>
          <button onClick={()=>dispatch({type:"CLOSE_EDIT"})}
            style={{width:32,height:32,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",
              background:"transparent",cursor:"pointer",fontSize:16,color:"var(--color-text-secondary)"}}>✕</button>
        </div>

        {/* Delay indicator */}
        {f.rd!==f.pd&&<div style={{background:statusColor+"18",border:`1px solid ${statusColor}44`,borderRadius:8,
          padding:"8px 12px",marginBottom:16,fontSize:11,color:statusColor,fontWeight:500}}>
          {f.rs+f.rd>f.ps+f.pd?`⚠ Ritardo: +${(f.rs+f.rd)-(f.ps+f.pd)} giorni rispetto al piano`
            :`✓ In anticipo: ${(f.ps+f.pd)-(f.rs+f.rd)} giorni`}
        </div>}

        {/* Fields grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          {[
            ["Fase",<select style={inp} value={f.phaseId} onChange={e=>setF({...f,phaseId:e.target.value})}>
              {st.phases.map(p=><option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}</select>],
            ["Risorsa",<select style={inp} value={f.resourceId} onChange={e=>setF({...f,resourceId:e.target.value})}>
              {st.resources.map(r=><option key={r.id} value={r.id}>{r.tipo==="terzista"?"🤝":"🏭"} {r.name}</option>)}</select>],
            ["Telaio",<select style={inp} value={f.loomId||""} onChange={e=>setF({...f,loomId:e.target.value||null})}>
              <option value="">Nessun telaio</option>
              {st.looms.map(l=><option key={l.id} value={l.id}>🪡 {l.name}</option>)}</select>],
            ["Catena",<select style={inp} value={f.catenaId||""} onChange={e=>setF({...f,catenaId:e.target.value||null})}>
              <option value="">Nessuna catena</option>
              {st.catene.map(c=><option key={c.id} value={c.id}>🔗 {c.name}</option>)}</select>],
          ].map(([label,field])=><div key={label}><label style={lbl}>{label}</label>{field}</div>)}
        </div>

        {/* Timeline visual */}
        <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:"14px",marginBottom:16}}>
          <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",margin:"0 0 12px",textTransform:"uppercase",letterSpacing:"0.5px"}}>Timeline</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
            {[
              ["Inizio piano","ps",f.ps,"#6B7280"],["Fine piano","pe_show",f.ps+f.pd,"#6B7280",true],
              ["Inizio reale","rs",f.rs,"#3B82F6"],["Fine reale","re_show",f.rs+f.rd,"#3B82F6",true],
            ].map(([label,key,val,color,readonly])=>(
              <div key={key}>
                <label style={{...lbl,color}}>{label}</label>
                <div style={{textAlign:"center",padding:"6px",background:color+"15",borderRadius:8,
                  fontSize:13,fontWeight:700,color}}>G{val}</div>
                <div style={{textAlign:"center",fontSize:9,color:"var(--color-text-secondary)",marginTop:2}}>{fmtD(addD(START,val))}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
            {[
              ["⏱ Durata pianificata (gg)","pd",f.pd,false],
              ["⏱ Durata reale (gg)","rd",f.rd,false],
              ["📅 Inizio reale (gg)","rs",f.rs,false],
              ["📅 Inizio pianificato (gg)","ps",f.ps,false],
            ].map(([label,key,val])=>(
              <div key={key}>
                <label style={lbl}>{label}</label>
                <input type="number" style={inp} value={val} min={key==="ps"||key==="rs"?0:1}
                  onChange={e=>setF({...f,[key]:+e.target.value})}/>
              </div>
            ))}
          </div>
        </div>

        {/* Tipo */}
        <div style={{marginBottom:20}}>
          <label style={lbl}>Tipo lavorazione</label>
          <div style={{display:"flex",gap:8}}>
            {[["interno","🏭 Interno"],["terzista","🤝 Terzista"]].map(([v,lbl2])=>(
              <button key={v} onClick={()=>setF({...f,tipo:v})}
                style={{flex:1,padding:"9px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:500,
                  border:f.tipo===v?"2px solid #3B82F6":"1.5px solid var(--color-border-secondary)",
                  background:f.tipo===v?"#3B82F618":"transparent",
                  color:f.tipo===v?"#3B82F6":"var(--color-text-secondary)"}}>
                {lbl2}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>dispatch({type:"DEL_TASK",p:f.id})}
            style={{padding:"10px 16px",borderRadius:10,border:"1.5px solid #EF444444",background:"transparent",
              color:"#EF4444",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit"}}>🗑 Elimina</button>
          <button onClick={()=>dispatch({type:"CLOSE_EDIT"})}
            style={{flex:1,padding:"10px",borderRadius:10,border:"1.5px solid var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Annulla</button>
          <button onClick={save}
            style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:"#3B82F6",
              color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>✓ Salva modifiche</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CONFIG PANEL  (left drawer)
// ═══════════════════════════════════════════════════════════════════
function ConfigPanel(){
  const {st,dispatch}=useApp();
  const [tab,setTab]=useState("looms");

  const TABS=[["looms","🪡","Telai"],["phases","🔄","Fasi"],["resources","👥","Risorse"],["catene","🔗","Catene"],["orders","📋","Ordini"]];

  const inp={width:"100%",fontSize:11,padding:"6px 9px",borderRadius:7,
    border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",
    color:"var(--color-text-primary)",fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const Row=({label,children})=><div style={{marginBottom:7}}><label style={{fontSize:10,color:"var(--color-text-secondary)",display:"block",marginBottom:3}}>{label}</label>{children}</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",
      background:"var(--color-background-primary)"}}>

      {/* tabs */}
      <div style={{padding:"10px 8px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
        <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",textTransform:"uppercase",
          letterSpacing:"0.6px",margin:"0 0 8px 2px"}}>Configurazione</p>
        <div style={{display:"flex",gap:3}}>
          {TABS.map(([id,ic,lbl])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{flex:1,padding:"5px 0",borderRadius:8,border:"none",cursor:"pointer",
                background:tab===id?"#3B82F6":"transparent",
                color:tab===id?"#fff":"var(--color-text-secondary)",
                fontSize:15,fontFamily:"inherit",transition:"all .15s"}} title={lbl}>{ic}</button>
          ))}
        </div>
        <p style={{fontSize:10,color:"#3B82F6",textAlign:"center",margin:"5px 0 0",fontWeight:500}}>
          {TABS.find(t=>t[0]===tab)?.[2]}
        </p>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"10px 10px"}}>

        {tab==="looms"&&<>
          {st.looms.map(l=>(
            <div key={l.id} style={{background:"var(--color-background-secondary)",borderRadius:10,
              padding:"10px",marginBottom:8,border:"0.5px solid var(--color-border-tertiary)"}}>
              <div style={{display:"flex",gap:6,marginBottom:6}}>
                <div style={{width:28,height:28,borderRadius:7,background:"#EF444420",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🪡</div>
                <input style={{...inp,fontWeight:500}} value={l.name}
                  onChange={e=>dispatch({type:"UPD_LOOM",p:{id:l.id,name:e.target.value}})}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <select style={{...inp,flex:2}} value={l.type}
                  onChange={e=>dispatch({type:"UPD_LOOM",p:{id:l.id,type:e.target.value}})}>
                  {["pinza_pos","pinza_neg","getto_aria","jaquard","smit","navetta"].map(v=><option key={v} value={v}>{v}</option>)}
                </select>
                <button onClick={()=>dispatch({type:"DEL_LOOM",p:l.id})}
                  style={{padding:"0 10px",borderRadius:7,border:"1px solid #EF444455",background:"transparent",
                    color:"#EF4444",cursor:"pointer",fontSize:13}}>✕</button>
              </div>
            </div>
          ))}
          {st.looms.length<40&&<button onClick={()=>dispatch({type:"ADD_LOOM"})}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",
              fontSize:11,fontFamily:"inherit"}}>+ Aggiungi Telaio ({st.looms.length}/40)</button>}
        </>}

        {tab==="phases"&&<>
          {st.phases.map(ph=>(
            <div key={ph.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <input type="color" value={ph.color.slice(0,7)}
                onChange={e=>dispatch({type:"UPD_PHASE",p:{id:ph.id,color:e.target.value}})}
                style={{width:30,height:30,border:"none",borderRadius:8,cursor:"pointer",padding:2,flexShrink:0}}/>
              <input style={{...inp,flex:1}} value={ph.name}
                onChange={e=>dispatch({type:"UPD_PHASE",p:{id:ph.id,name:e.target.value}})}/>
              <input style={{...inp,width:44}} type="number" value={ph.dur} min="1"
                onChange={e=>dispatch({type:"UPD_PHASE",p:{id:ph.id,dur:+e.target.value}})} title="Durata default"/>
              <button onClick={()=>dispatch({type:"DEL_PHASE",p:ph.id})}
                style={{width:28,height:28,borderRadius:7,border:"1px solid #EF444455",background:"transparent",
                  color:"#EF4444",cursor:"pointer",flexShrink:0}}>✕</button>
            </div>
          ))}
          <button onClick={()=>dispatch({type:"ADD_PHASE"})}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nuova Fase</button>
        </>}

        {tab==="resources"&&<>
          {st.resources.map(r=>(
            <div key={r.id} style={{background:"var(--color-background-secondary)",borderRadius:10,
              padding:"9px",marginBottom:7,border:"0.5px solid var(--color-border-tertiary)"}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <input type="color" value={r.color.slice(0,7)}
                  onChange={e=>dispatch({type:"UPD_RES",p:{id:r.id,color:e.target.value}})}
                  style={{width:26,height:26,border:"none",borderRadius:6,cursor:"pointer",padding:1,flexShrink:0}}/>
                <input style={{...inp,flex:1}} value={r.name}
                  onChange={e=>dispatch({type:"UPD_RES",p:{id:r.id,name:e.target.value}})}/>
                <button onClick={()=>dispatch({type:"DEL_RES",p:r.id})}
                  style={{width:26,height:26,borderRadius:6,border:"1px solid #EF444455",background:"transparent",
                    color:"#EF4444",cursor:"pointer",flexShrink:0,fontSize:12}}>✕</button>
              </div>
              <div style={{display:"flex",gap:5}}>
                {["interno","terzista"].map(t=>(
                  <button key={t} onClick={()=>dispatch({type:"UPD_RES",p:{id:r.id,tipo:t}})}
                    style={{flex:1,padding:"5px",borderRadius:7,cursor:"pointer",fontSize:10,fontFamily:"inherit",
                      border:r.tipo===t?"1.5px solid #3B82F6":"1px solid var(--color-border-secondary)",
                      background:r.tipo===t?"#3B82F618":"transparent",
                      color:r.tipo===t?"#3B82F6":"var(--color-text-secondary)"}}>
                    {t==="interno"?"🏭":"🤝"} {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={()=>dispatch({type:"ADD_RES"})}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nuova Risorsa</button>
        </>}

        {tab==="catene"&&<>
          {st.catene.map(c=>{
            const ord=st.orders.find(o=>o.id===c.orderId);
            return(
              <div key={c.id} style={{borderRadius:10,padding:"10px",marginBottom:8,
                background:c.color,border:`1.5px solid ${ord?.color||"#888"}44`}}>
                <div style={{display:"flex",gap:6,marginBottom:7,alignItems:"center"}}>
                  <input type="color" value={c.color.slice(0,7)}
                    onChange={e=>dispatch({type:"UPD_CAT",p:{id:c.id,color:e.target.value+"20"}})}
                    style={{width:26,height:26,border:"none",borderRadius:6,cursor:"pointer",padding:1,flexShrink:0}}/>
                  <input style={{...inp,flex:1,fontWeight:500}} value={c.name}
                    onChange={e=>dispatch({type:"UPD_CAT",p:{id:c.id,name:e.target.value}})}/>
                  <button onClick={()=>dispatch({type:"DEL_CAT",p:c.id})}
                    style={{width:26,height:26,borderRadius:6,border:"1px solid #EF444455",background:"transparent",
                      color:"#EF4444",cursor:"pointer",flexShrink:0,fontSize:12}}>✕</button>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <select style={{...inp,flex:2}} value={c.orderId}
                    onChange={e=>dispatch({type:"UPD_CAT",p:{id:c.id,orderId:e.target.value}})}>
                    {st.orders.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                  <div style={{width:70}}>
                    <input type="number" style={inp} value={c.pezze} min="1" placeholder="Pezze"
                      onChange={e=>dispatch({type:"UPD_CAT",p:{id:c.id,pezze:+e.target.value}})}/>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={()=>dispatch({type:"ADD_CAT"})}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>🔗 Lancia Nuova Catena</button>
        </>}

        {tab==="orders"&&<>
          {st.orders.map(o=>(
            <div key={o.id} style={{borderRadius:12,padding:"12px",marginBottom:8,
              background:o.color+"12",border:`1.5px solid ${o.color}44`}}>
              <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:9}}>
                <input type="color" value={o.color}
                  onChange={e=>dispatch({type:"UPD_ORD",p:{id:o.id,color:e.target.value}})}
                  style={{width:28,height:28,border:"none",borderRadius:8,cursor:"pointer",padding:2,flexShrink:0}}/>
                <input style={{...inp,flex:1,fontWeight:600,fontSize:13,color:o.color}} value={o.label}
                  onChange={e=>dispatch({type:"UPD_ORD",p:{id:o.id,label:e.target.value}})}/>
              </div>
              <Row label="Descrizione">
                <input style={inp} value={o.sub}
                  onChange={e=>dispatch({type:"UPD_ORD",p:{id:o.id,sub:e.target.value}})}/>
              </Row>
              <div style={{display:"flex",gap:7}}>
                <Row label="Scadenza (gg)"><input type="number" style={inp} value={o.deadline} min="1"
                  onChange={e=>dispatch({type:"UPD_ORD",p:{id:o.id,deadline:+e.target.value}})}/></Row>
                <Row label="Prezzo €"><input type="number" style={inp} value={o.price} min="0" step="500"
                  onChange={e=>dispatch({type:"UPD_ORD",p:{id:o.id,price:+e.target.value}})}/></Row>
              </div>
            </div>
          ))}
          <button onClick={()=>dispatch({type:"ADD_ORD"})}
            style={{width:"100%",padding:"9px",borderRadius:10,border:"1.5px dashed var(--color-border-secondary)",
              background:"transparent",color:"var(--color-text-secondary)",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>+ Nuovo Ordine</button>
        </>}

      </div>

      {/* save button */}
      <div style={{padding:"10px",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
        <button onClick={()=>API.save(st)}
          style={{width:"100%",padding:"10px",borderRadius:10,border:"none",background:"#10B981",
            color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>💾 Salva configurazione</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  KPI SIDEBAR  (right)
// ═══════════════════════════════════════════════════════════════════
function KPISidebar(){
  const {st}=useApp();
  const {day}=st.ui;

  const kpis=useMemo(()=>st.orders.map(o=>({o,k:orderKPI(st.tasks,o,day)})),[st.tasks,st.orders,day]);
  const active=useMemo(()=>st.tasks.filter(t=>tState(t,day).active),[st.tasks,day]);
  const lates=useMemo(()=>st.tasks.filter(t=>tState(t,day).late),[st.tasks,day]);

  const loomLoad=useMemo(()=>st.looms.map(l=>{
    const lt=st.tasks.filter(t=>t.loomId===l.id);
    const total=lt.reduce((s,t)=>s+t.rd,0);
    const conflict=lt.some(t=>lt.some(t2=>t2.id!==t.id&&t.rs<t2.rs+t2.rd&&t.rs+t.rd>t2.rs));
    return{l,total,conflict,sat:Math.min(100,Math.round(total/30*100))};
  }).filter(x=>x.total>0),[st.tasks,st.looms]);

  const PBar=({pct,color,h=6})=>(
    <div style={{background:"var(--color-background-secondary)",borderRadius:h,height:h,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:h,transition:"width .3s"}}/>
    </div>
  );

  const satC=p=>p>85?"#EF4444":p>60?"#F59E0B":"#10B981";

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden",
      background:"var(--color-background-primary)"}}>
      <div style={{padding:"10px 12px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",
          textTransform:"uppercase",letterSpacing:"0.6px",margin:0}}>Dashboard · G{day}</p>
        <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{fmtDN(addD(START,day))}</span>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"10px"}}>

        {/* Top summary chips */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
          {[[active.length,"Attive","#3B82F6"],[lates.length,"Ritardi","#EF4444"],[kpis.filter(({k})=>k?.onTime).length+"/"+kpis.length,"OTD","#10B981"]].map(([v,l,c])=>(
            <div key={l} style={{background:c+"15",borderRadius:10,padding:"8px 6px",textAlign:"center",
              border:`1px solid ${c}33`}}>
              <p style={{fontSize:18,fontWeight:800,color:c,margin:0,lineHeight:1}}>{v}</p>
              <p style={{fontSize:9,color:c,margin:"3px 0 0",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px"}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Orders */}
        {kpis.map(({o,k})=>{
          if(!k) return null;
          const f=Math.round(Math.min(100,k.progress)/10);
          return(
            <div key={o.id} style={{borderRadius:12,padding:"12px",marginBottom:8,
              background:"var(--color-background-secondary)",border:`1.5px solid ${o.color}33`,
              borderLeft:`4px solid ${o.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <span style={{fontSize:12,fontWeight:700,color:o.color}}>{o.label}</span>
                  <span style={{fontSize:10,color:"var(--color-text-secondary)",marginLeft:6}}>{o.sub}</span>
                </div>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,fontWeight:600,
                  background:k.onTime?"#10B98120":"#EF444420",
                  color:k.onTime?"#10B981":"#EF4444",border:`1px solid ${k.onTime?"#10B98144":"#EF444444"}`}}>
                  {k.onTime?"✓ On Time":"⚠ Ritardo"}
                </span>
              </div>
              <div style={{marginBottom:8}}>
                <PBar pct={Math.min(100,k.progress)} color={o.color} h={8}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  <span style={{fontSize:10,fontFamily:"monospace",color:"var(--color-text-secondary)"}}>{"█".repeat(f)}{"░".repeat(10-f)}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"var(--color-text-primary)"}}>{Math.round(k.progress)}%</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                {[["📅 LT Piano",`${k.ltPlan}gg`,"#6B7280"],
                  ["📅 LT Reale",`${k.ltReal}gg`,k.delay>0?"#EF4444":"#10B981"],
                  ["⚡ Efficienza",`${k.eff}%`,k.eff<80?"#F59E0B":"#10B981"],
                  ["💰 Margine",`${k.marginPct}%`,k.marginPct<20?"#EF4444":"#10B981"],
                ].map(([label,val,vc])=>(
                  <div key={label} style={{background:"var(--color-background-primary)",borderRadius:8,padding:"6px 8px",
                    display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{label}</span>
                    <span style={{fontSize:11,fontWeight:700,color:vc}}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:7,padding:"6px 8px",background:"var(--color-background-primary)",
                borderRadius:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>Costo · Ricavo</span>
                <span style={{fontSize:10,fontWeight:600}}>
                  <span style={{color:"#EF4444"}}>€{Math.round(k.cost/1000)}k</span>
                  <span style={{color:"var(--color-text-secondary)"}}> · </span>
                  <span style={{color:"#10B981"}}>€{Math.round(o.price/1000)}k</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* Ritardi */}
        {lates.length>0&&(
          <div style={{borderRadius:12,padding:"10px",marginBottom:8,
            background:"#EF444410",border:"1.5px solid #EF444433"}}>
            <p style={{fontSize:11,fontWeight:700,color:"#EF4444",margin:"0 0 8px"}}>⚠ Ritardi attivi ({lates.length})</p>
            {lates.map(t=>{
              const ph=st.phases.find(p=>p.id===t.phaseId);
              const ord=st.orders.find(o=>o.id===t.orderId);
              const dg=day-(t.ps+t.pd);
              const heat=dg>7?"#EF4444":dg>3?"#F59E0B":"#FBBF24";
              return(
                <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"5px 0",borderBottom:"0.5px solid #EF444422"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13}}>{ph?.icon||"📋"}</span>
                    <div>
                      <p style={{fontSize:10,fontWeight:500,color:"var(--color-text-primary)",margin:0}}>{ph?.name}</p>
                      <p style={{fontSize:9,color:ord?.color,margin:0}}>{ord?.label}</p>
                    </div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:heat,padding:"2px 7px",
                    background:heat+"20",borderRadius:8}}>+{dg}gg</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Loom saturation */}
        {loomLoad.length>0&&(
          <div style={{borderRadius:12,padding:"10px",marginBottom:8,
            background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)"}}>
            <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",margin:"0 0 9px",
              textTransform:"uppercase",letterSpacing:"0.5px"}}>🪡 Saturazione Telai</p>
            {loomLoad.map(({l,total,conflict,sat})=>(
              <div key={l.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <span style={{fontSize:12}}>{conflict?"⚠️":"🪡"}</span>
                    <span style={{fontSize:10,fontWeight:500,color:conflict?"#EF4444":"var(--color-text-primary)"}}>{l.name}</span>
                  </div>
                  <span style={{fontSize:10,color:satC(sat),fontWeight:600}}>{total}gg · {sat}%</span>
                </div>
                <PBar pct={sat} color={conflict?"#EF4444":satC(sat)}/>
                {conflict&&<p style={{fontSize:9,color:"#EF4444",margin:"3px 0 0"}}>⚠ Conflitto di schedulazione!</p>}
              </div>
            ))}
          </div>
        )}

        {/* Catene */}
        <div style={{borderRadius:12,padding:"10px",background:"var(--color-background-secondary)",
          border:"0.5px solid var(--color-border-tertiary)"}}>
          <p style={{fontSize:11,fontWeight:700,color:"var(--color-text-secondary)",margin:"0 0 8px",
            textTransform:"uppercase",letterSpacing:"0.5px"}}>🔗 Catene WIP</p>
          {st.catene.map(cat=>{
            const catT=st.tasks.filter(t=>t.catenaId===cat.id);
            const ord=st.orders.find(o=>o.id===cat.orderId);
            const done=catT.filter(t=>tState(t,day).done).length;
            const act=catT.filter(t=>tState(t,day).active).length;
            const pct=catT.length?Math.round(done/catT.length*100):0;
            return(
              <div key={cat.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:10,fontWeight:500,color:ord?.color||"var(--color-text-primary)"}}>{cat.name}</span>
                  <span style={{fontSize:9,color:"var(--color-text-secondary)"}}>{cat.pezze} pz · {done}/{catT.length} fasi</span>
                </div>
                <PBar pct={pct} color={ord?.color||"#888"}/>
                {act>0&&<p style={{fontSize:9,color:"#3B82F6",margin:"3px 0 0"}}>⚙ {act} fase/i in lavorazione</p>}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  GANTT  CANVAS
// ═══════════════════════════════════════════════════════════════════
function GanttView(){
  const {st,dispatch}=useApp();
  const canvasRef=useRef(null);
  const wrapRef=useRef(null);
  const raf=useRef(null);
  const stRef=useRef(st);
  stRef.current=st;
  const drag=useRef({on:false,id:null,mode:"move",sx:0,origRs:0,origRd:0});

  const {zoom}=st.ui;
  const LW=188, DW=zoom==="week"?4:12, RH=36, HH=50;

  const rows=useMemo(()=>{
    const s=st;
    if(s.ui.view==="loom"){
      const r=[]; const used=new Set();
      s.looms.forEach(l=>{
        s.tasks.filter(t=>t.loomId===l.id).forEach(t=>{
          const ord=s.orders.find(o=>o.id===t.orderId);
          const ph=s.phases.find(p=>p.id===t.phaseId);
          r.push({...t,rowLabel:`${l.name}`,subLabel:ph?.name||"",phaseColor:ph?.color||"#888",orderColor:ord?.color||"#888",loomName:l.name,phaseName:ph?.name,phaseIcon:ph?.icon});
          used.add(t.id);
        });
      });
      s.tasks.filter(t=>!used.has(t.id)).forEach(t=>{
        const ord=s.orders.find(o=>o.id===t.orderId);
        const ph=s.phases.find(p=>p.id===t.phaseId);
        r.push({...t,rowLabel:ph?.name||t.phaseId,subLabel:ord?.label||"",phaseColor:ph?.color||"#888",orderColor:ord?.color||"#888",phaseName:ph?.name,phaseIcon:ph?.icon});
      });
      return r;
    }
    // order view
    return s.orders.flatMap(ord=>
      s.tasks.filter(t=>t.orderId===ord.id).map(t=>{
        const ph=s.phases.find(p=>p.id===t.phaseId);
        return{...t,rowLabel:ph?.name||t.phaseId,subLabel:ord.label,phaseColor:ph?.color||ord.color,orderColor:ord.color,phaseName:ph?.name,phaseIcon:ph?.icon,ordLabel:ord.label};
      })
    );
  },[st]);

  const rowsRef=useRef(rows);
  rowsRef.current=rows;

  const W=LW+(MAX_DAY+5)*DW;
  const H=HH+rows.length*RH+20;

  const dk=window.matchMedia("(prefers-color-scheme:dark)").matches;

  const draw=useCallback(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const s=stRef.current;
    const day=s.ui.day, sel=s.ui.selectedId;
    const rs=rowsRef.current;

    const BG=dk?"#141414":"#ffffff";
    const BG2=dk?"#191919":"#f9f8f5";
    const BGH=dk?"#1f1f1f":"#f1efe8";
    const TX=dk?"#e5e5e5":"#1f1f1f";
    const MU=dk?"#444":"#c8c8c0";
    const BD=dk?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)";

    canvas.width=W; canvas.height=H;
    ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);
    ctx.fillStyle=BGH; ctx.fillRect(0,0,LW,H);
    ctx.fillStyle=BGH; ctx.fillRect(0,0,W,HH);

    // Grid lines
    const vl=(x,y1,y2,c,w=0.5)=>{ ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.stroke(); };
    const hl=(y,x1,x2,c,w=0.5)=>{ ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke(); };
    vl(LW,0,H,BD,1); hl(HH,0,W,BD,1);

    // Header label
    ctx.fillStyle=TX; ctx.font="500 11px -apple-system,system-ui"; ctx.textAlign="left";
    ctx.fillText(s.ui.view==="order"?"FASE · ORDINE":"TELAIO · FASE",12,HH/2+4);

    // Catena bands
    s.catene.forEach(cat=>{
      const ct=s.tasks.filter(t=>t.catenaId===cat.id); if(!ct.length)return;
      const minS=Math.min(...ct.map(t=>t.rs));
      const maxE=Math.max(...ct.map(t=>t.rs+t.rd));
      ctx.fillStyle=cat.color||"rgba(100,150,200,0.07)";
      ctx.fillRect(LW+minS*DW,HH,(maxE-minS)*DW,H-HH);
      // label at top
      ctx.fillStyle=dk?"rgba(255,255,255,0.2)":"rgba(0,0,0,0.2)";
      ctx.font="9px -apple-system"; ctx.textAlign="left";
      ctx.fillText("🔗 "+cat.name, LW+minS*DW+4, HH+12);
    });

    // Day columns + weekend shade
    for(let d=0;d<=MAX_DAY+4;d++){
      const x=LW+d*DW;
      // weekend shade
      const dow=addD(START,d).getDay();
      if(dow===0||dow===6){
        ctx.fillStyle=dk?"rgba(255,255,255,0.025)":"rgba(0,0,0,0.025)";
        ctx.fillRect(x,HH,DW,H-HH);
      }
      if(d%5===0||zoom==="week"){
        vl(x,HH,H,BD);
        ctx.fillStyle=MU; ctx.font="8px -apple-system"; ctx.textAlign="center";
        ctx.fillText(zoom==="week"?`W${Math.floor(d/7)+1}`:`G${d}`, x, HH-22);
        ctx.fillStyle=dk?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.35)";
        ctx.font="8px -apple-system";
        ctx.fillText(fmtD(addD(START,d)), x, HH-8);
      } else {
        vl(x,HH,H,dk?"rgba(255,255,255,0.015)":"rgba(0,0,0,0.02)",0.3);
      }
    }

    // Rows
    let lastOrd=null;
    rs.forEach((row,ri)=>{
      const ry=HH+ri*RH;
      const isSel=row.id===sel;

      // Order group header
      if(s.ui.view==="order"&&row.orderId!==lastOrd){
        if(ri>0) hl(ry,0,W,row.orderColor+"55",1.5);
        // subtle gradient band for order
        ctx.fillStyle=row.orderColor+"10";
        ctx.fillRect(0,ry,LW,RH);
        lastOrd=row.orderId;
      }

      // Row background
      ctx.fillStyle=isSel?(dk?"rgba(59,130,246,0.12)":"rgba(59,130,246,0.07)"):ri%2===0?BG:BG2;
      ctx.fillRect(s.ui.view==="order"?LW:0,ry,W,RH);

      // Row separator
      hl(ry+RH,0,W,BD);

      // Order color accent on left label panel
      ctx.fillStyle=row.orderColor;
      ctx.fillRect(0,ry+8,3,RH-16);

      // Phase icon + name
      ctx.fillStyle=row.phaseColor;
      ctx.font="13px -apple-system"; ctx.textAlign="left";
      ctx.fillText(row.phaseIcon||"📋",9,ry+RH/2+5);

      ctx.save(); ctx.beginPath(); ctx.rect(28,ry,LW-62,RH); ctx.clip();
      ctx.fillStyle=TX; ctx.font="11px -apple-system"; ctx.textAlign="left";
      ctx.fillText(row.rowLabel,28,ry+RH/2+4);
      ctx.restore();

      // Tipo badge
      ctx.fillStyle=row.tipo==="terzista"?"#F59E0B":"#10B981";
      ctx.font="700 7px -apple-system"; ctx.textAlign="right";
      ctx.fillText(row.tipo==="terzista"?"TRZ":"INT",LW-4,ry+RH/2+3);

      const {done,active,late,pct}=tState(row,day);

      // Ghost bar (planned)
      const pgx=LW+row.ps*DW+1, pgw=Math.max(2,row.pd*DW-2);
      ctx.fillStyle=dk?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)";
      rr(ctx,pgx,ry+11,pgw,RH-22,3); ctx.fill();

      // Real bar
      const bx=LW+row.rs*DW+1, by=ry+8, bh=RH-16;
      let barC=row.phaseColor;
      if(done)   barC="#10B981";
      if(late)   barC="#EF4444";

      if(done){
        rr(ctx,bx,by,Math.max(2,row.rd*DW-2),bh,5);
        ctx.globalAlpha=0.82; ctx.fillStyle=barC; ctx.fill(); ctx.globalAlpha=1;
        // checkmark overlay
        if(row.rd*DW>20){
          ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.font="9px -apple-system"; ctx.textAlign="center";
          ctx.fillText("✓",bx+row.rd*DW/2,by+bh/2+3);
        }
      } else if(active){
        const donePx=Math.min(row.rd*DW-2,Math.max(2,(day-row.rs)*DW));
        rr(ctx,bx,by,donePx,bh,5);
        ctx.globalAlpha=0.9; ctx.fillStyle=barC; ctx.fill(); ctx.globalAlpha=1;
        // animated border (pulsing handled by RAF)
        ctx.strokeStyle=barC; ctx.lineWidth=1.5;
        rr(ctx,bx-1,by-1,row.rd*DW,bh+2,6); ctx.stroke();
        // progress %
        if(donePx>30){
          ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.font="700 9px -apple-system"; ctx.textAlign="center";
          ctx.fillText(`${pct}%`,bx+donePx/2,by+bh/2+3);
        }
      } else if(late){
        const dp=Math.max(2,(row.ps+row.pd-row.rs)*DW);
        rr(ctx,bx,by,dp,bh,5);
        ctx.globalAlpha=0.8; ctx.fillStyle=barC; ctx.fill(); ctx.globalAlpha=1;
        ctx.fillStyle="#EF4444"; ctx.font="700 9px -apple-system"; ctx.textAlign="left";
        const lateX=LW+(row.ps+row.pd)*DW+4;
        ctx.fillText(`⚠ +${day-(row.ps+row.pd)}g`,lateX,ry+RH/2+3);
      }

      // Loom conflict outline
      const allRows=rowsRef.current;
      if(row.loomId){
        const conflict=allRows.some(r2=>r2.id!==row.id&&r2.loomId===row.loomId&&row.rs<r2.rs+r2.rd&&row.rs+row.rd>r2.rs);
        if(conflict){
          ctx.strokeStyle="#FF6B00"; ctx.lineWidth=2; ctx.setLineDash([4,3]);
          rr(ctx,bx-2,by-2,row.rd*DW+2,bh+4,6); ctx.stroke(); ctx.setLineDash([]);
        }
      }

      // Selected gold glow
      if(isSel){
        ctx.strokeStyle="#FFD700"; ctx.lineWidth=2;
        rr(ctx,bx-2,by-2,row.rd*DW+2,bh+4,6); ctx.stroke();
      }

      // Duration label inside bar
      const bw=row.rd*DW;
      if(bw>32&&!active&&!done){
        ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.font="8px -apple-system"; ctx.textAlign="center";
        ctx.fillText(`${row.rd}gg`,bx+bw/2,by+bh/2+3);
      }

      // Deadline marker
      const ord2=s.orders.find(o=>o.id===row.orderId);
      if(ord2){
        const dlx=LW+ord2.deadline*DW;
        ctx.strokeStyle=ord2.color+"cc"; ctx.lineWidth=1.5; ctx.setLineDash([3,2]);
        ctx.beginPath(); ctx.moveTo(dlx,ry+4); ctx.lineTo(dlx,ry+RH-4); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=ord2.color; ctx.font="7px -apple-system"; ctx.textAlign="center";
        ctx.fillText("▼",dlx,ry+6);
      }
    });

    // Today vertical line
    const tx=LW+day*DW;
    ctx.strokeStyle=dk?"rgba(239,68,68,0.8)":"rgba(239,68,68,0.7)";
    ctx.lineWidth=2; ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(tx,4); ctx.lineTo(tx,H); ctx.stroke();
    ctx.setLineDash([]);
    // today pill
    const label=`G${day}`;
    const tw=ctx.measureText(label).width+14;
    rr(ctx,tx-tw/2,2,tw,18,5);
    ctx.fillStyle="#EF4444"; ctx.fill();
    ctx.fillStyle="#fff"; ctx.font="700 9px -apple-system"; ctx.textAlign="center";
    ctx.fillText(label,tx,14);

  },[dk,W,H,DW,LW,RH,HH,zoom]);

  useEffect(()=>{
    const loop=()=>{ draw(); raf.current=requestAnimationFrame(loop); };
    raf.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf.current);
  },[draw]);

  // ── mouse ──
  const getRow=useCallback((my)=>{
    const ri=Math.floor((my-HH)/RH);
    return ri>=0&&ri<rowsRef.current.length?rowsRef.current[ri]:null;
  },[HH,RH]);

  const onDown=useCallback(e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const row=getRow(my); if(!row)return;
    const bx=LW+row.rs*DW, bw=row.rd*DW;
    if(mx<bx-2||mx>bx+bw+2)return;
    dispatch({type:"SELECT",p:row.id});
    const onEdge=mx>=bx+bw-8;
    drag.current={on:true,id:row.id,mode:onEdge?"resize":"move",sx:mx,origRs:row.rs,origRd:row.rd};
    e.preventDefault();
  },[getRow,dispatch,DW,LW]);

  const onMove=useCallback(e=>{
    const d=drag.current; if(!d.on)return;
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    const dt=Math.round((mx-d.sx)/DW);
    if(d.mode==="move"){
      dispatch({type:"MOVE_TASK",p:{id:d.id,rs:Math.max(0,d.origRs+dt)}});
    } else {
      dispatch({type:"RESIZE_TASK",p:{id:d.id,rd:Math.max(1,d.origRd+dt)}});
    }
  },[dispatch,DW]);

  const onUp=useCallback(()=>{ drag.current.on=false; },[]);

  const onDbl=useCallback(e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const row=getRow(my); if(!row)return;
    const bx=LW+row.rs*DW, bw=row.rd*DW;
    if(mx>=bx&&mx<=bx+bw) dispatch({type:"OPEN_EDIT",p:row.id});
  },[getRow,dispatch,DW,LW]);

  // cursor logic
  const onMouseMoveForCursor=useCallback(e=>{
    if(drag.current.on){ onMove(e); return; }
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!rect)return;
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const row=getRow(my);
    if(row){
      const bx=LW+row.rs*DW, bw=row.rd*DW;
      if(mx>=bx-2&&mx<=bx+bw+2){
        const onEdge=mx>=bx+bw-8;
        canvasRef.current.style.cursor=onEdge?"ew-resize":"grab";
        // tooltip
        const s=stRef.current;
        const ph=s.phases.find(p=>p.id===row.phaseId);
        const ord=s.orders.find(o=>o.id===row.orderId);
        const res=s.resources.find(r=>r.id===row.resourceId);
        const {done,active,late,pct}=tState(row,s.ui.day);
        dispatch({type:"TOOLTIP",p:{
          x:e.clientX, y:e.clientY,
          color:ph?.color||ord?.color||"#888",
          title:`${ph?.icon||"📋"} ${ph?.name} · ${ord?.label}`,
          rows:[
            ["Risorsa",res?.name||"—"],
            ["Pianificato",`G${row.ps}→G${row.ps+row.pd} (${row.pd}gg)`],
            ["Reale",`G${row.rs}→G${row.rs+row.rd} (${row.rd}gg)`],
            ["Stato",done?"✓ Completato":active?`⚙ In corso ${pct}%`:late?`⚠ Ritardo +${s.ui.day-(row.ps+row.pd)}gg`:"⏳ In attesa"],
            row.loomId?["Telaio",s.looms.find(l=>l.id===row.loomId)?.name||row.loomId]:null,
            row.catenaId?["Catena",s.catene.find(c=>c.id===row.catenaId)?.name||row.catenaId]:null,
          ].filter(Boolean),
        }});
        return;
      }
    }
    canvasRef.current.style.cursor="default";
    dispatch({type:"TOOLTIP",p:null});
  },[getRow,onMove,dispatch,DW,LW]);

  const onLeave=useCallback(()=>{
    drag.current.on=false;
    canvasRef.current&&(canvasRef.current.style.cursor="default");
    dispatch({type:"TOOLTIP",p:null});
  },[dispatch]);

  return(
    <div ref={wrapRef} style={{flex:1,overflow:"auto",position:"relative",minWidth:0}}>
      <canvas ref={canvasRef} style={{display:"block"}}
        onMouseDown={onDown} onMouseMove={onMouseMoveForCursor}
        onMouseUp={onUp} onMouseLeave={onLeave} onDoubleClick={onDbl}/>

      {/* Legend bar */}
      <div style={{position:"sticky",bottom:0,left:0,background:"var(--color-background-secondary)",
        borderTop:"0.5px solid var(--color-border-tertiary)",padding:"5px 14px",
        display:"flex",gap:18,flexWrap:"wrap",alignItems:"center"}}>
        {[
          ["▬","Ghost = pianificato","rgba(120,120,120,0.4)"],
          ["▬","In corso","#3B82F6"],["▬","Completato","#10B981"],["▬","Ritardo","#EF4444"],
          ["▬","Bordo oro = selezionato","#FFD700"],["▬","Bordo arancio = telaio overload","#FF6B00"],
          ["▼","Scadenza ordine","inherit"],
        ].map(([ic,txt,c])=>(
          <span key={txt} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"var(--color-text-secondary)"}}>
            <span style={{color:c,fontSize:12}}>{ic}</span>{txt}
          </span>
        ))}
        <span style={{fontSize:10,color:"var(--color-text-secondary)",marginLeft:"auto",fontStyle:"italic"}}>
          Click = seleziona · Drag = sposta · Drag bordo dx = ridimensiona · Doppio click = modifica
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TOPBAR
// ═══════════════════════════════════════════════════════════════════
function TopBar(){
  const {st,dispatch}=useApp();
  const {day,playing,speed,view,zoom,panel,leftOpen,rightOpen}=st.ui;

  const Btn=({label,on,onClick,accent})=>(
    <button onClick={onClick} style={{padding:"5px 12px",borderRadius:20,fontFamily:"inherit",fontSize:11,
      fontWeight:on?600:400,cursor:"pointer",transition:"all .15s",
      border:accent&&on?"none":"0.5px solid "+(on?"var(--color-border-info)":"var(--color-border-secondary)"),
      background:accent&&on?"#3B82F6":on?"var(--color-background-info)":"transparent",
      color:accent&&on?"#fff":on?"var(--color-text-info)":"var(--color-text-primary)"}}>
      {label}
    </button>
  );

  const Divider=()=><div style={{width:1,height:24,background:"var(--color-border-tertiary)",flexShrink:0}}/>;

  const totalTasks=st.tasks.length;
  const lateCount=useMemo(()=>st.tasks.filter(t=>tState(t,day).late).length,[st.tasks,day]);
  const activeCount=useMemo(()=>st.tasks.filter(t=>tState(t,day).active).length,[st.tasks,day]);

  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px",height:52,
      background:"var(--color-background-primary)",borderBottom:"0.5px solid var(--color-border-tertiary)",
      flexShrink:0,overflow:"hidden"}}>

      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginRight:8,flexShrink:0}}>
        <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#EF4444,#A855F7)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧵</div>
        <div>
          <p style={{fontSize:12,fontWeight:800,color:"var(--color-text-primary)",margin:0,lineHeight:1.1}}>LanificioPRO</p>
          <p style={{fontSize:9,color:"var(--color-text-secondary)",margin:0}}>Distretto Prato · APS 2026</p>
        </div>
      </div>

      <Divider/>

      {/* Status chips */}
      <div style={{display:"flex",gap:5,flexShrink:0}}>
        <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"#3B82F615",color:"#3B82F6",border:"1px solid #3B82F633",fontWeight:500}}>
          ⚙ {activeCount} attive
        </span>
        {lateCount>0&&<span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"#EF444415",color:"#EF4444",border:"1px solid #EF444433",fontWeight:500}}>
          ⚠ {lateCount} ritardi
        </span>}
        <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:"#6B728015",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-tertiary)",fontWeight:500}}>
          📋 {totalTasks} task
        </span>
      </div>

      <Divider/>

      {/* Player */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <button onClick={()=>{ dispatch({type:"SET_DAY",p:0}); dispatch({type:"PLAY",p:false}); }}
          style={{width:28,height:28,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",
            background:"transparent",cursor:"pointer",fontSize:14,color:"var(--color-text-secondary)"}}>⏮</button>
        <button onClick={()=>dispatch({type:"PLAY",p:!playing})}
          style={{width:36,height:36,borderRadius:10,border:"none",cursor:"pointer",fontSize:16,
            background:playing?"#EF4444":"#3B82F6",color:"#fff",transition:"all .15s",
            boxShadow:playing?"0 0 12px #EF444466":"0 0 12px #3B82F666"}}>
          {playing?"⏸":"▶"}
        </button>
      </div>

      {/* Timeline slider */}
      <div style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 80px",minWidth:80}}>
        <input type="range" min="0" max={MAX_DAY} value={day}
          onChange={e=>{ dispatch({type:"SET_DAY",p:+e.target.value}); }}
          style={{flex:1,accentColor:"#3B82F6"}}/>
        <div style={{textAlign:"center",flexShrink:0}}>
          <p style={{fontSize:12,fontWeight:700,color:"var(--color-text-primary)",margin:0}}>G{day}</p>
          <p style={{fontSize:9,color:"var(--color-text-secondary)",margin:0}}>{fmtD(addD(START,day))}</p>
        </div>
      </div>

      {/* Speed */}
      <div style={{display:"flex",gap:3,flexShrink:0}}>
        {[1,2,4,8].map(s=>(
          <button key={s} onClick={()=>dispatch({type:"SPEED",p:s})}
            style={{width:26,height:26,borderRadius:7,border:"0.5px solid "+(speed===s?"#3B82F6":"var(--color-border-secondary)"),
              background:speed===s?"#3B82F620":"transparent",color:speed===s?"#3B82F6":"var(--color-text-secondary)",
              cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:speed===s?700:400}}>
            {s}×
          </button>
        ))}
      </div>

      <Divider/>

      {/* View toggles */}
      <div style={{display:"flex",gap:3,flexShrink:0}}>
        <Btn label="📋 Ordini" on={view==="order"} onClick={()=>dispatch({type:"VIEW",p:"order"})}/>
        <Btn label="🪡 Telai"  on={view==="loom"}  onClick={()=>dispatch({type:"VIEW",p:"loom"})}/>
      </div>

      <div style={{display:"flex",gap:3,flexShrink:0}}>
        <Btn label="Giorni"    on={zoom==="day"}  onClick={()=>dispatch({type:"ZOOM",p:"day"})}/>
        <Btn label="Settimane" on={zoom==="week"} onClick={()=>dispatch({type:"ZOOM",p:"week"})}/>
      </div>

      <Divider/>

      {/* Panel toggles */}
      <div style={{display:"flex",gap:3,flexShrink:0}}>
        <Btn label="⚙ Config" on={leftOpen} onClick={()=>dispatch({type:"LEFT",p:!leftOpen})}/>
        <Btn label="📊 KPI"   on={rightOpen} onClick={()=>dispatch({type:"RIGHT",p:!rightOpen})}/>
      </div>

      <button onClick={()=>{ API.save(st); }}
        style={{marginLeft:4,padding:"5px 14px",borderRadius:20,border:"none",background:"#10B981",
          color:"#fff",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",flexShrink:0}}>
        💾 Salva
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  TIMER
// ═══════════════════════════════════════════════════════════════════
function TimerDriver(){
  const {st,dispatch}=useApp();
  const t=useRef(null);
  useEffect(()=>{
    if(st.ui.playing){
      t.current=setInterval(()=>dispatch({type:"TICK"}),900/st.ui.speed);
    }
    return()=>clearInterval(t.current);
  },[st.ui.playing,st.ui.speed,dispatch]);
  return null;
}

// ═══════════════════════════════════════════════════════════════════
//  ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App(){
  const [st,dispatch]=useReducer(reducer,S0);

  useEffect(()=>{
    const d=API.load();
    if(d) dispatch({type:"LOAD",p:d});
  },[]);

  const {leftOpen,rightOpen}=st.ui;
  const LEFT_W=260, RIGHT_W=290;

  return(
    <Ctx.Provider value={{st,dispatch}}>
      <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",
        background:"var(--color-background-tertiary)",fontFamily:"-apple-system,system-ui,sans-serif",
        color:"var(--color-text-primary)"}}>
        <TimerDriver/>
        <TopBar/>
        <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
          {/* Left config */}
          {leftOpen&&(
            <div style={{width:LEFT_W,flexShrink:0,borderRight:"0.5px solid var(--color-border-tertiary)",overflow:"hidden"}}>
              <ConfigPanel/>
            </div>
          )}
          {/* Center Gantt */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
            <GanttView/>
          </div>
          {/* Right KPI */}
          {rightOpen&&(
            <div style={{width:RIGHT_W,flexShrink:0,borderLeft:"0.5px solid var(--color-border-tertiary)",overflow:"hidden"}}>
              <KPISidebar/>
            </div>
          )}
        </div>
        <TaskEditor/>
        <Tooltip/>
      </div>
    </Ctx.Provider>
  );
}
