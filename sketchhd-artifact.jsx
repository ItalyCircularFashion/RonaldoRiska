import { useState, useRef, useEffect, useCallback } from "react";

const STYLE_PRESETS = [
  { id: "photo",    emoji: "📷", label: "Realistic", suffix: "photorealistic, hyperrealistic, 8k uhd, sharp focus, professional photography, masterpiece" },
  { id: "fashion",  emoji: "✨", label: "Fashion",   suffix: "high fashion editorial, vogue magazine, luxury clothing, studio lighting, elegant, couture" },
  { id: "product",  emoji: "📦", label: "Product",   suffix: "product photography, clean white background, commercial photography, professional lighting" },
  { id: "interior", emoji: "🛋️", label: "Interior",  suffix: "interior design photography, architectural digest, modern living space, warm ambient lighting" },
  { id: "portrait", emoji: "👤", label: "Portrait",  suffix: "cinematic portrait, professional studio photography, dramatic lighting, shallow depth of field" },
  { id: "concept",  emoji: "🎨", label: "Concept",   suffix: "concept art, digital painting, artstation trending, cinematic, moody, detailed illustration" },
];

const PALETTE   = ["#111111","#e63946","#2196f3","#2a9d8f","#e9c46a","#f4a261","#9c27b0","#b5838d"];
const BSIZES    = [2, 4, 8, 16, 26];

export default function SketchHD() {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastXY    = useRef(null);
  const hist      = useRef([]);
  const hIdx      = useRef(-1);

  const [tool,     setTool]     = useState("pen");
  const [sizeIdx,  setSizeIdx]  = useState(1);
  const [color,    setColor]    = useState("#111111");
  const [preset,   setPreset]   = useState("photo");
  const [prompt,   setPrompt]   = useState("");
  const [stabKey,  setStabKey]  = useState("");
  const [showKey,  setShowKey]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [busy,     setBusy]     = useState(false);
  const [sMsg,     setSMsg]     = useState("Draw something and click Generate →");
  const [sType,    setSType]    = useState("idle");
  const [prog,     setProg]     = useState(0);

  const W = 800, H = 580;

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#f9f9f9"; ctx.fillRect(0,0,W,H);
    push();
  }, []);

  const push = () => {
    if (!canvasRef.current) return;
    const d = canvasRef.current.toDataURL();
    hist.current = hist.current.slice(0, hIdx.current + 1);
    hist.current.push(d); hIdx.current = hist.current.length - 1;
  };

  const undo = useCallback(() => {
    if (hIdx.current < 1) return;
    hIdx.current--;
    const img = new Image(); img.src = hist.current[hIdx.current];
    img.onload = () => { const c = canvasRef.current; c.getContext("2d").clearRect(0,0,W,H); c.getContext("2d").drawImage(img,0,0); };
  }, []);

  const getXY = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const sx = W/r.width, sy = H/r.height;
    const s = e.touches?.[0] ?? e;
    return { x:(s.clientX-r.left)*sx, y:(s.clientY-r.top)*sy };
  };

  const onDown = useCallback((e) => {
    e.preventDefault(); drawing.current = true;
    const p = getXY(e); lastXY.current = p;
    const ctx = canvasRef.current.getContext("2d");
    const sz = BSIZES[sizeIdx];
    ctx.beginPath(); ctx.arc(p.x,p.y,(tool==="eraser"?sz*2.5:sz)/2,0,Math.PI*2);
    ctx.fillStyle = tool==="eraser"?"#f9f9f9":color; ctx.fill();
  }, [tool,sizeIdx,color]);

  const onMove = useCallback((e) => {
    e.preventDefault(); if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = getXY(e); const sz = BSIZES[sizeIdx];
    ctx.beginPath(); ctx.moveTo(lastXY.current.x,lastXY.current.y); ctx.lineTo(p.x,p.y);
    ctx.strokeStyle = tool==="eraser"?"#f9f9f9":color;
    ctx.lineWidth = tool==="eraser"?sz*2.5:sz;
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastXY.current = p;
  }, [tool,sizeIdx,color]);

  const onUp = useCallback(() => { if (!drawing.current) return; drawing.current=false; lastXY.current=null; push(); }, []);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle="#f9f9f9"; ctx.fillRect(0,0,W,H); push();
    setResult(null); setSMsg("Canvas cleared. Draw something new!"); setSType("idle"); setProg(0);
  };

  const getB64 = () => canvasRef.current.toDataURL("image/png").split(",")[1];

  const callClaude = async (b64) => {
    const p = STYLE_PRESETS.find(x=>x.id===preset);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:700,
        messages:[{ role:"user", content:[
          { type:"image", source:{ type:"base64", media_type:"image/png", data:b64 } },
          { type:"text", text:`You are an expert AI image prompt engineer. Analyze this hand-drawn sketch and create an optimized Stable Diffusion prompt.

User intent: "${prompt || "create a realistic HD image"}"
Style preset: "${p.label}" → ${p.suffix}

Respond ONLY with valid JSON (no markdown):
{"sd_prompt":"[detailed SD prompt based on sketch + style]","negative_prompt":"blurry, low quality, distorted, sketch lines, bad anatomy, watermark","description":"[1 sentence describing the sketch]"}` }
        ]}]
      })
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const d = await res.json();
    return JSON.parse(d.content[0].text.replace(/```json|```/g,"").trim());
  };

  const callStability = async (b64, sdP, negP) => {
    const fd = new FormData();
    const blob = await fetch(`data:image/png;base64,${b64}`).then(r=>r.blob());
    fd.append("image", blob, "sketch.png");
    fd.append("prompt", sdP); fd.append("negative_prompt", negP);
    fd.append("control_strength","0.7"); fd.append("output_format","png");
    const res = await fetch("https://api.stability.ai/v2beta/stable-image/control/sketch", {
      method:"POST", headers:{ Authorization:`Bearer ${stabKey}`, Accept:"image/*" }, body:fd
    });
    if (!res.ok) throw new Error(`Stability AI ${res.status}: ${(await res.text()).slice(0,100)}`);
    const ab = await res.arrayBuffer();
    return "data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(ab)));
  };

  const generate = useCallback(async () => {
    if (busy) return;
    setBusy(true); setProg(6); setSType("loading"); setSMsg("Analyzing sketch with Claude Vision…");
    try {
      const b64 = getB64();
      const analysis = await callClaude(b64);
      setProg(42); setSMsg(`Detected: ${analysis.description}`);
      if (stabKey) {
        setProg(56); setSMsg("Generating HD image via Stability AI…");
        const imgUrl = await callStability(b64, analysis.sd_prompt, analysis.negative_prompt);
        setResult({ url:imgUrl, type:"real", analysis });
        setProg(100); setSType("success"); setSMsg("✅ HD image ready!");
      } else {
        setResult({ url:null, type:"demo", analysis });
        setProg(100); setSType("demo");
        setSMsg("Analysis complete — add Stability AI key to generate the actual image");
      }
    } catch(err) { setSType("error"); setSMsg(`❌ ${err.message}`); }
    finally { setBusy(false); }
  }, [busy, prompt, preset, stabKey]);

  const download = () => {
    if (!result?.url) return;
    const a = document.createElement("a"); a.href=result.url; a.download=`SketchHD-${Date.now()}.png`; a.click();
  };

  useEffect(() => {
    const h = (e) => { if ((e.metaKey||e.ctrlKey)&&e.key==="z"){e.preventDefault();undo();} };
    window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h);
  }, [undo]);

  const statusColor = { success:"#4ade80", error:"#f87171", demo:"#fbbf24", loading:"#9d98ff", idle:"#44445a" };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#07070f", height:"100vh", display:"flex", flexDirection:"column", color:"#dde0f0", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        canvas{cursor:crosshair;touch-action:none;display:block}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .gbtn:hover:not(:disabled){box-shadow:0 0 28px rgba(109,95,255,.55);transform:translateY(-1px)}
        .gbtn{transition:all .2s}
        .tbtn{transition:all .15s}.tbtn:hover{border-color:#4d47cc!important;color:#9d98ff!important}
        .pbtn{transition:all .15s}.pbtn:hover{border-color:#4d47cc!important}
        .sw{transition:transform .1s;border-radius:50%;cursor:pointer}.sw:hover{transform:scale(1.3)}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0d0d1a}::-webkit-scrollbar-thumb{background:#2a2a44;border-radius:3px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ height:52, borderBottom:"1px solid #191928", background:"#0c0c1a", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30,height:30, background:"linear-gradient(135deg,#6d5fff,#00d4ff)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>✏️</div>
          <span style={{ fontSize:18, fontWeight:700, letterSpacing:"-0.6px" }}>Sketch<span style={{ color:"#6d5fff" }}>HD</span></span>
          <span style={{ fontSize:10, background:"#12122a", border:"1px solid #2a2a44", color:"#6d5fff", padding:"2px 7px", borderRadius:20, fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>BETA</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:"#33334a", fontFamily:"'DM Mono',monospace" }}>⌘Z undo · P pen · E eraser</span>
          <button onClick={()=>setShowKey(v=>!v)} style={{ background:stabKey?"rgba(74,222,128,.08)":"rgba(109,95,255,.1)", border:`1px solid ${stabKey?"#4ade80":"#6d5fff"}`, borderRadius:8, padding:"5px 13px", color:stabKey?"#4ade80":"#9d98ff", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
            {stabKey ? "⚡ API Connected" : "+ Connect API Key"}
          </button>
        </div>
      </div>

      {/* ── API KEY PANEL ── */}
      {showKey && (
        <div style={{ background:"#0f0f20", borderBottom:"1px solid #191928", padding:"10px 18px", display:"flex", alignItems:"center", gap:12, animation:"slideUp .2s ease", flexShrink:0 }}>
          <span style={{ fontSize:11, color:"#44445a", fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>STABILITY AI KEY</span>
          <input type="password" value={stabKey} onChange={e=>setStabKey(e.target.value)} placeholder="sk-..." style={{ width:300, background:"#191928", border:"1px solid #2a2a44", borderRadius:7, padding:"7px 12px", color:"#dde0f0", fontSize:12, fontFamily:"'DM Mono',monospace", outline:"none" }} />
          <span style={{ fontSize:11, color:"#44445a" }}>Free credits at <span style={{ color:"#6d5fff" }}>platform.stability.ai</span></span>
          <button onClick={()=>setShowKey(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#44445a", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
      )}

      {/* ── MAIN SPLIT ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:0 }}>

        {/* LEFT: CANVAS */}
        <div style={{ display:"flex", flexDirection:"column", borderRight:"1px solid #191928", minHeight:0 }}>
          <div style={{ height:38, padding:"0 14px", borderBottom:"1px solid #191928", background:"#0c0c1a", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <span style={{ fontSize:10, color:"#33334a", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>Drawing Canvas</span>
            <div style={{ display:"flex", gap:6 }}>
              {[["↩ Undo",undo],["⌫ Clear",clearCanvas]].map(([l,fn])=>(
                <button key={l} onClick={fn} style={{ background:"#191928", border:"1px solid #2a2a44", borderRadius:6, padding:"3px 9px", color:"#6666aa", fontSize:11, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:14, background:"#09091a", backgroundImage:"radial-gradient(circle,#1a1a2e 1px,transparent 1px)", backgroundSize:"22px 22px", overflow:"hidden" }}>
            <div style={{ boxShadow:"0 0 0 1px #2a2a44,0 20px 60px rgba(0,0,0,.6)", borderRadius:3, lineHeight:0 }}>
              <canvas ref={canvasRef} width={W} height={H}
                style={{ width:"min(calc(50vw - 72px),100%)", aspectRatio:`${W}/${H}`, borderRadius:3 }}
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
            </div>
          </div>

          <div style={{ padding:"9px 14px", borderTop:"1px solid #191928", background:"#0c0c1a", display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              {[["pen","✏️ Pen"],["eraser","⬜ Eraser"]].map(([t,lbl])=>(
                <button key={t} className="tbtn" onClick={()=>setTool(t)} style={{ background:tool===t?"rgba(109,95,255,.2)":"#191928", border:`1px solid ${tool===t?"#6d5fff":"#2a2a44"}`, borderRadius:8, padding:"5px 12px", color:tool===t?"#9d98ff":"#6666aa", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{lbl}</button>
              ))}
              <div style={{ width:1,height:22,background:"#2a2a44",margin:"0 3px" }} />
              {BSIZES.map((sz,i)=>(
                <button key={i} onClick={()=>setSizeIdx(i)} style={{ width:26,height:26, background:sizeIdx===i?"rgba(109,95,255,.25)":"#191928", border:`1px solid ${sizeIdx===i?"#6d5fff":"#2a2a44"}`, borderRadius:7, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" }}>
                  <div style={{ width:Math.min(sz*.7+2,16),height:Math.min(sz*.7+2,16), background:sizeIdx===i?"#9d98ff":"#44445a", borderRadius:"50%" }} />
                </button>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:10,color:"#33334a",fontFamily:"'DM Mono',monospace",marginRight:2 }}>COLOR</span>
              {PALETTE.map(c=>(
                <div key={c} className="sw" onClick={()=>{setColor(c);setTool("pen")}} style={{ width:19,height:19,background:c, outline:color===c?"2.5px solid #fff":"2px solid transparent", outlineOffset:2 }} />
              ))}
              <input type="color" value={color} onChange={e=>{setColor(e.target.value);setTool("pen")}} style={{ width:19,height:19,border:"none",background:"none",cursor:"pointer",padding:0,borderRadius:"50%" }} />
              <div style={{ width:19,height:19,background:color,borderRadius:"50%",border:"1px solid #2a2a44",flexShrink:0 }} />
            </div>
          </div>
        </div>

        {/* RIGHT: OUTPUT */}
        <div style={{ display:"flex", flexDirection:"column", minHeight:0 }}>
          <div style={{ height:38, padding:"0 14px", borderBottom:"1px solid #191928", background:"#0c0c1a", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <span style={{ fontSize:10, color:"#33334a", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>AI Generated</span>
            {result?.url && <button onClick={download} style={{ background:"rgba(109,95,255,.1)", border:"1px solid #6d5fff", borderRadius:6, padding:"3px 10px", color:"#9d98ff", fontSize:11, cursor:"pointer" }}>↓ Download PNG</button>}
          </div>

          <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#09091a", backgroundImage:"radial-gradient(circle,#1a1a2e 1px,transparent 1px)", backgroundSize:"22px 22px", display:"flex", alignItems:"center", justifyContent:"center", padding:14 }}>
            {busy && (
              <div style={{ position:"absolute",inset:0,zIndex:20,background:"rgba(7,7,15,.93)", display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20 }}>
                <div style={{ position:"relative",width:80,height:80 }}>
                  <div style={{ position:"absolute",inset:0,borderRadius:"50%",background:"conic-gradient(from 0deg,#6d5fff,#00d4ff,#6d5fff)",animation:"spin 1.4s linear infinite" }} />
                  <div style={{ position:"absolute",inset:5,borderRadius:"50%",background:"#07070f",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>🎨</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ color:"#dde0f0",fontSize:13,fontWeight:500,marginBottom:10 }}>{sMsg}</div>
                  <div style={{ width:200,height:3,background:"#191928",borderRadius:2,overflow:"hidden" }}>
                    <div style={{ height:"100%",borderRadius:2,width:`${prog}%`,background:"linear-gradient(90deg,#6d5fff,#00d4ff)",transition:"width .6s cubic-bezier(.4,0,.2,1)" }} />
                  </div>
                  <div style={{ marginTop:5,fontSize:10,color:"#33334a",fontFamily:"'DM Mono',monospace" }}>{Math.round(prog)}%</div>
                </div>
              </div>
            )}

            {result?.url ? (
              <div style={{ boxShadow:"0 0 0 1px #2a2a44,0 20px 60px rgba(0,0,0,.6)",borderRadius:3,lineHeight:0,animation:"slideUp .4s ease" }}>
                <img src={result.url} alt="Generated HD" style={{ maxWidth:"min(calc(50vw-72px),100%)",maxHeight:"calc(100vh - 310px)",borderRadius:3,display:"block" }} />
              </div>
            ) : result?.type === "demo" ? (
              <div style={{ maxWidth:380,width:"100%",background:"#0f0f20",borderRadius:14,border:"1px solid #2a2a44",padding:22,animation:"slideUp .3s ease" }}>
                <div style={{ fontSize:10,color:"#6d5fff",fontFamily:"'DM Mono',monospace",letterSpacing:1.5,marginBottom:8,textTransform:"uppercase" }}>Claude Vision Analysis</div>
                <div style={{ fontSize:14,fontWeight:500,color:"#dde0f0",marginBottom:16,lineHeight:1.5 }}>{result.analysis.description}</div>
                <div style={{ fontSize:10,color:"#33334a",fontFamily:"'DM Mono',monospace",letterSpacing:1,marginBottom:6,textTransform:"uppercase" }}>Enhanced Prompt</div>
                <div style={{ background:"#07070f",border:"1px solid #1f1f30",borderRadius:8,padding:10,marginBottom:14,fontSize:11,color:"#6666aa",lineHeight:1.7,fontFamily:"'DM Mono',monospace",maxHeight:88,overflowY:"auto" }}>
                  {result.analysis.sd_prompt}
                </div>
                <div style={{ background:"rgba(109,95,255,.07)",border:"1px solid rgba(109,95,255,.25)",borderRadius:10,padding:"11px 14px",fontSize:12,color:"#9d98ff",lineHeight:1.6,textAlign:"center" }}>
                  Add your <strong>Stability AI key</strong> above<br/>to generate the actual HD image
                </div>
              </div>
            ) : (
              <div style={{ textAlign:"center",color:"#2a2a44",animation:"pulse 3s ease infinite" }}>
                <div style={{ fontSize:52,marginBottom:12 }}>🖼️</div>
                <div style={{ fontSize:13,color:"#44445a" }}>HD render will appear here</div>
                <div style={{ fontSize:11,color:"#2a2a44",marginTop:5,fontFamily:"'DM Mono',monospace" }}>Draw → Choose style → Generate</div>
              </div>
            )}
          </div>

          <div style={{ height:30,padding:"0 14px",borderTop:"1px solid #191928",background:"#0c0c1a",display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:statusColor[sType]||"#2a2a44",animation:sType==="loading"?"pulse 1s ease infinite":"none",flexShrink:0 }} />
            <span style={{ fontSize:11,fontFamily:"'DM Mono',monospace",color:statusColor[sType]||"#44445a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{sMsg}</span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop:"1px solid #191928",background:"#0c0c1a",padding:"10px 18px",flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:10 }}>
          <span style={{ fontSize:10,color:"#33334a",fontFamily:"'DM Mono',monospace",letterSpacing:1.5,textTransform:"uppercase",whiteSpace:"nowrap" }}>STYLE</span>
          {STYLE_PRESETS.map(p=>(
            <button key={p.id} className="pbtn" onClick={()=>setPreset(p.id)} style={{ background:preset===p.id?"rgba(109,95,255,.15)":"#191928", border:`1px solid ${preset===p.id?"#6d5fff":"#2a2a44"}`, borderRadius:20, padding:"4px 12px", color:preset===p.id?"#9d98ff":"#6666aa", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex",gap:9,alignItems:"stretch" }}>
          <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()} placeholder="Describe your sketch or add style hints… (optional)" style={{ flex:1,background:"#191928",border:"1px solid #2a2a44",borderRadius:9,padding:"8px 14px",color:"#dde0f0",fontSize:13,fontFamily:"inherit",outline:"none" }}
            onFocus={e=>e.target.style.borderColor="#6d5fff"} onBlur={e=>e.target.style.borderColor="#2a2a44"} />
          <button onClick={generate} disabled={busy||!result} style={{ background:"#191928",border:"1px solid #2a2a44",borderRadius:9,padding:"8px 15px",color:result&&!busy?"#6666aa":"#2a2a44",fontSize:12,cursor:result&&!busy?"pointer":"not-allowed",fontFamily:"inherit",whiteSpace:"nowrap" }}>
            ↻ Regen
          </button>
          <button onClick={generate} disabled={busy} className="gbtn" style={{ background:busy?"#2a2a44":"linear-gradient(135deg,#6d5fff 0%,#5a50e8 100%)",border:"none",borderRadius:9,padding:"8px 26px",color:busy?"#44445a":"#fff",fontSize:14,fontWeight:600,letterSpacing:"-0.3px",cursor:busy?"not-allowed":"pointer",fontFamily:"inherit",whiteSpace:"nowrap" }}>
            {busy ? (
              <span style={{ display:"flex",alignItems:"center",gap:8 }}>
                <span style={{ width:12,height:12,border:"2px solid #44445a",borderTopColor:"#9d98ff",borderRadius:"50%",display:"inline-block",animation:"spin .8s linear infinite" }} />
                Generating…
              </span>
            ) : "✨ Generate HD"}
          </button>
        </div>
      </div>
    </div>
  );
}
