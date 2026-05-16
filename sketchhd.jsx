import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const STYLE_PRESETS = [
  {
    id: "photo",
    emoji: "📷",
    label: "Realistic",
    suffix:
      "photorealistic, hyperrealistic, 8k uhd, sharp focus, professional photography, masterpiece, highly detailed",
  },
  {
    id: "fashion",
    emoji: "✨",
    label: "Fashion",
    suffix:
      "high fashion editorial photography, vogue magazine, luxury clothing, studio lighting, elegant, sophisticated, couture",
  },
  {
    id: "product",
    emoji: "📦",
    label: "Product",
    suffix:
      "product photography, clean white background, commercial photography, professional lighting, sharp details",
  },
  {
    id: "interior",
    emoji: "🛋️",
    label: "Interior",
    suffix:
      "interior design photography, architectural digest, modern living space, warm ambient lighting, ultra detailed",
  },
  {
    id: "portrait",
    emoji: "👤",
    label: "Portrait",
    suffix:
      "cinematic portrait, professional studio photography, dramatic lighting, shallow depth of field, film grain",
  },
  {
    id: "concept",
    emoji: "🎨",
    label: "Concept Art",
    suffix:
      "concept art, digital painting, artstation trending, illustration, fantasy, cinematic, moody",
  },
];

const PALETTE = [
  "#111111","#e63946","#457b9d","#2a9d8f",
  "#e9c46a","#f4a261","#a8dadc","#b5838d",
];
const BRUSH_SIZES = [2, 4, 8, 16, 26];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function SketchHD() {
  const canvasRef  = useRef(null);
  const isDrawing  = useRef(false);
  const lastPos    = useRef(null);
  const history    = useRef([]);
  const histIdx    = useRef(-1);

  /* ── Tool state ── */
  const [tool,     setTool]     = useState("pen");
  const [sizeIdx,  setSizeIdx]  = useState(1);
  const [color,    setColor]    = useState("#111111");

  /* ── Generation state ── */
  const [generated, setGenerated] = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [statusMsg, setStatusMsg] = useState("Draw something and click Generate →");
  const [statusType,setStatusType]= useState("idle");
  const [progress,  setProgress]  = useState(0);

  /* ── Settings ── */
  const [promptText,    setPromptText]    = useState("");
  const [preset,        setPreset]        = useState("photo");
  const [stabilityKey,  setStabilityKey]  = useState("");
  const [showKeyInput,  setShowKeyInput]  = useState(false);

  const W = 900, H = 650;

  /* ─── init canvas ─── */
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, W, H);
    pushHistory();
  }, []);

  const pushHistory = () => {
    if (!canvasRef.current) return;
    const d = canvasRef.current.toDataURL();
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(d);
    histIdx.current = history.current.length - 1;
  };

  const undo = useCallback(() => {
    if (histIdx.current < 1) return;
    histIdx.current--;
    const img = new Image();
    img.src = history.current[histIdx.current];
    img.onload = () => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);
    };
  }, []);

  /* ─── canvas drawing ─── */
  const getXY = (e) => {
    const r  = canvasRef.current.getBoundingClientRect();
    const sx = W / r.width, sy = H / r.height;
    const s  = e.touches?.[0] ?? e;
    return { x: (s.clientX - r.left) * sx, y: (s.clientY - r.top) * sy };
  };

  const onDown = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const p = getXY(e);
    lastPos.current = p;
    const ctx = canvasRef.current.getContext("2d");
    const sz  = BRUSH_SIZES[sizeIdx];
    ctx.beginPath();
    ctx.arc(p.x, p.y, (tool === "eraser" ? sz * 2.5 : sz) / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#f9f9f9" : color;
    ctx.fill();
  }, [tool, sizeIdx, color]);

  const onMove = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p   = getXY(e);
    const sz  = BRUSH_SIZES[sizeIdx];
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = tool === "eraser" ? "#f9f9f9" : color;
    ctx.lineWidth   = tool === "eraser" ? sz * 2.5 : sz;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.stroke();
    lastPos.current = p;
  }, [tool, sizeIdx, color]);

  const onUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current   = null;
    pushHistory();
  }, []);

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, W, H);
    pushHistory();
    setGenerated(null);
    setStatusMsg("Canvas cleared. Draw something new!");
    setStatusType("idle");
    setProgress(0);
  };

  /* ─── AI pipeline ─── */
  const getB64 = () => canvasRef.current.toDataURL("image/png").split(",")[1];

  const callClaude = async (b64) => {
    const p = STYLE_PRESETS.find((x) => x.id === preset);
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/png", data: b64 } },
              {
                type: "text",
                text: `You are an expert AI prompt engineer. Analyze this hand-drawn sketch carefully and create an optimized image generation prompt.

User intent: "${promptText || "create a realistic HD image from this sketch"}"
Target style: "${p.label}" → ${p.suffix}

Respond ONLY with valid JSON (no markdown fences, no preamble):
{
  "sd_prompt": "detailed, comma-separated positive Stable Diffusion prompt based on sketch content + style. Be specific about subjects, composition, materials, colors, lighting. End with quality boosters.",
  "negative_prompt": "blurry, low quality, distorted, sketch lines, cartoon, drawing, bad anatomy, watermark, signature",
  "description": "One sentence describing what you see in the sketch."
}`,
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Claude API error ${res.status}`);
    const d = await res.json();
    const txt = d.content[0].text.replace(/```json|```/g, "").trim();
    return JSON.parse(txt);
  };

  const callStability = async (b64, sdPrompt, negPrompt) => {
    const fd = new FormData();
    const blob = await fetch(`data:image/png;base64,${b64}`).then((r) => r.blob());
    fd.append("image", blob, "sketch.png");
    fd.append("prompt", sdPrompt);
    fd.append("negative_prompt", negPrompt);
    fd.append("control_strength", "0.7");
    fd.append("output_format", "png");
    const res = await fetch("https://api.stability.ai/v2beta/stable-image/control/sketch", {
      method: "POST",
      headers: { Authorization: `Bearer ${stabilityKey}`, Accept: "image/*" },
      body: fd,
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Stability AI ${res.status}: ${msg.slice(0, 120)}`);
    }
    const ab = await res.arrayBuffer();
    return "data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(ab)));
  };

  const generate = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setProgress(6);
    setStatusType("loading");
    setStatusMsg("Analyzing sketch with Claude Vision...");
    try {
      const b64      = getB64();
      const analysis = await callClaude(b64);
      setProgress(42);
      setStatusMsg(`Detected: ${analysis.description}`);

      if (stabilityKey) {
        setProgress(54);
        setStatusMsg("Generating HD image via Stability AI...");
        const imgUrl = await callStability(b64, analysis.sd_prompt, analysis.negative_prompt);
        setGenerated({ url: imgUrl, type: "real", analysis });
        setProgress(100);
        setStatusType("success");
        setStatusMsg("✅ HD image ready!");
      } else {
        setGenerated({ url: null, type: "demo", analysis });
        setProgress(100);
        setStatusType("demo");
        setStatusMsg("Analysis complete — add Stability AI key to generate the actual image");
      }
    } catch (err) {
      setStatusType("error");
      setStatusMsg(`❌ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }, [busy, promptText, preset, stabilityKey]);

  const download = () => {
    if (!generated?.url) return;
    const a = document.createElement("a");
    a.href = generated.url;
    a.download = `SketchHD-${Date.now()}.png`;
    a.click();
  };

  /* ─── keyboard shortcuts ─── */
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); undo(); }
      if (e.key === "e" && !e.target.matches("input,textarea")) setTool("eraser");
      if (e.key === "p" && !e.target.matches("input,textarea")) setTool("pen");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [undo]);

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      background: "#07070f",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      color: "#dde0f0",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        canvas { cursor: crosshair; touch-action: none; display: block; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:.7; } 50% { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .glow-btn:hover:not(:disabled) {
          box-shadow: 0 0 28px rgba(109,95,255,.55), 0 0 8px rgba(109,95,255,.3);
          transform: translateY(-1px);
        }
        .glow-btn { transition: all 0.2s; }
        .tool-btn  { transition: all 0.15s; }
        .tool-btn:hover { border-color: #4d47cc !important; color: #9d98ff !important; }
        .preset-btn { transition: all 0.15s; }
        .preset-btn:hover { border-color: #4d47cc !important; }
        .swatch { transition: transform 0.1s, outline 0.1s; border-radius: 50%; cursor: pointer; }
        .swatch:hover { transform: scale(1.3); }
        input[type=range] { accent-color: #6d5fff; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #0d0d1a; }
        ::-webkit-scrollbar-thumb { background: #2a2a44; border-radius: 3px; }
        .shimmer-line {
          background: linear-gradient(90deg, #1a1a2e 25%, #2a2a48 50%, #1a1a2e 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 4px;
        }
      `}</style>

      {/* ── TOP NAV ── */}
      <header style={{
        height: 54, borderBottom: "1px solid #191928",
        background: "#0c0c1a",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "linear-gradient(135deg, #6d5fff 0%, #00d4ff 100%)",
            borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15,
          }}>✏️</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.6px" }}>
            Sketch<span style={{ color: "#6d5fff" }}>HD</span>
          </span>
          <span style={{
            fontSize: 10, background: "#12122a", border: "1px solid #2a2a44",
            color: "#6d5fff", padding: "2px 7px", borderRadius: 20,
            fontFamily: "'DM Mono', monospace", letterSpacing: 1,
          }}>BETA</span>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "#44445a", fontFamily: "'DM Mono', monospace" }}>
            ⌘Z undo · P pen · E eraser
          </span>
          <button
            onClick={() => setShowKeyInput((v) => !v)}
            style={{
              background: stabilityKey ? "rgba(74,222,128,.08)" : "rgba(109,95,255,.1)",
              border: `1px solid ${stabilityKey ? "#4ade80" : "#6d5fff"}`,
              borderRadius: 8, padding: "5px 13px",
              color: stabilityKey ? "#4ade80" : "#9d98ff",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {stabilityKey ? "⚡ API Connected" : "+ Connect API"}
          </button>
        </div>
      </header>

      {/* ── API KEY PANEL ── */}
      {showKeyInput && (
        <div style={{
          background: "#0f0f20", borderBottom: "1px solid #191928",
          padding: "12px 20px", display: "flex", alignItems: "center", gap: 12,
          animation: "slideUp .2s ease", flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: "#44445a", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
            STABILITY AI KEY
          </span>
          <input
            type="password"
            value={stabilityKey}
            onChange={(e) => setStabilityKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: 320, background: "#191928", border: "1px solid #2a2a44",
              borderRadius: 8, padding: "7px 13px",
              color: "#dde0f0", fontSize: 12,
              fontFamily: "'DM Mono', monospace", outline: "none",
            }}
          />
          <span style={{ fontSize: 12, color: "#44445a" }}>
            Get free credits → <span style={{ color: "#6d5fff" }}>platform.stability.ai</span>
          </span>
          <button
            onClick={() => setShowKeyInput(false)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#44445a", cursor: "pointer", fontSize: 18 }}
          >✕</button>
        </div>
      )}

      {/* ── MAIN SPLIT ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0 }}>

        {/* ══ LEFT: DRAWING PANEL ══ */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #191928", minHeight: 0 }}>

          {/* Panel header */}
          <div style={{
            height: 40, padding: "0 16px",
            borderBottom: "1px solid #191928", background: "#0c0c1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>
              Drawing Canvas
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {[["↩ Undo", undo], ["⌫ Clear", clearCanvas]].map(([label, fn]) => (
                <button key={label} onClick={fn} style={{
                  background: "#191928", border: "1px solid #2a2a44",
                  borderRadius: 6, padding: "3px 10px",
                  color: "#6666aa", fontSize: 11, cursor: "pointer",
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas area */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "#09091a", overflow: "hidden",
            backgroundImage: "radial-gradient(circle, #1a1a2e 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}>
            <div style={{
              boxShadow: "0 0 0 1px #2a2a44, 0 24px 80px rgba(0,0,0,.6)",
              borderRadius: 3, lineHeight: 0,
            }}>
              <canvas
                ref={canvasRef}
                width={W}
                height={H}
                style={{
                  width: "min(calc(50vw - 80px), 100%)",
                  aspectRatio: `${W}/${H}`,
                  borderRadius: 3,
                }}
                onMouseDown={onDown}
                onMouseMove={onMove}
                onMouseUp={onUp}
                onMouseLeave={onUp}
                onTouchStart={onDown}
                onTouchMove={onMove}
                onTouchEnd={onUp}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div style={{
            padding: "10px 16px", borderTop: "1px solid #191928",
            background: "#0c0c1a", display: "flex", flexDirection: "column", gap: 8,
            flexShrink: 0,
          }}>
            {/* Row 1: tools + brush sizes */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Pen / Eraser */}
              {[["pen", "✏️ Pen"], ["eraser", "⬜ Eraser"]].map(([t, lbl]) => (
                <button
                  key={t}
                  className="tool-btn"
                  onClick={() => setTool(t)}
                  style={{
                    background: tool === t ? "rgba(109,95,255,.2)" : "#191928",
                    border: `1px solid ${tool === t ? "#6d5fff" : "#2a2a44"}`,
                    borderRadius: 8, padding: "5px 13px",
                    color: tool === t ? "#9d98ff" : "#6666aa",
                    fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {lbl}
                </button>
              ))}

              <div style={{ width: 1, height: 24, background: "#2a2a44", margin: "0 4px" }} />

              {/* Brush sizes */}
              {BRUSH_SIZES.map((sz, i) => (
                <button
                  key={i}
                  onClick={() => setSizeIdx(i)}
                  style={{
                    width: 28, height: 28,
                    background: sizeIdx === i ? "rgba(109,95,255,.25)" : "#191928",
                    border: `1px solid ${sizeIdx === i ? "#6d5fff" : "#2a2a44"}`,
                    borderRadius: 7, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}
                >
                  <div style={{
                    width: Math.min(sz * 0.7 + 2, 18), height: Math.min(sz * 0.7 + 2, 18),
                    background: sizeIdx === i ? "#9d98ff" : "#44445a",
                    borderRadius: "50%",
                  }} />
                </button>
              ))}
            </div>

            {/* Row 2: colors */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono', monospace", marginRight: 2 }}>CLR</span>
              {PALETTE.map((c) => (
                <div
                  key={c}
                  className="swatch"
                  onClick={() => { setColor(c); setTool("pen"); }}
                  style={{
                    width: 20, height: 20, background: c,
                    outline: color === c ? "2.5px solid #fff" : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => { setColor(e.target.value); setTool("pen"); }}
                style={{
                  width: 20, height: 20, border: "none", background: "none",
                  cursor: "pointer", padding: 0, borderRadius: "50%",
                }}
                title="Custom color"
              />
              <div style={{
                width: 20, height: 20, background: color, borderRadius: "50%",
                border: "1px solid #2a2a44", flexShrink: 0,
              }} />
            </div>
          </div>
        </div>

        {/* ══ RIGHT: OUTPUT PANEL ══ */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

          {/* Panel header */}
          <div style={{
            height: 40, padding: "0 16px",
            borderBottom: "1px solid #191928", background: "#0c0c1a",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase" }}>
              AI Generated
            </span>
            {generated?.url && (
              <button
                onClick={download}
                style={{
                  background: "rgba(109,95,255,.1)", border: "1px solid #6d5fff",
                  borderRadius: 6, padding: "3px 11px",
                  color: "#9d98ff", fontSize: 11, cursor: "pointer",
                }}
              >
                ↓ Download PNG
              </button>
            )}
          </div>

          {/* Generated image or placeholder */}
          <div style={{
            flex: 1, position: "relative", overflow: "hidden",
            background: "#09091a",
            backgroundImage: "radial-gradient(circle, #1a1a2e 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}>

            {/* Loading overlay */}
            {busy && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                background: "rgba(7,7,15,.92)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 20,
              }}>
                {/* Spinner ring */}
                <div style={{ position: "relative", width: 88, height: 88 }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "conic-gradient(from 0deg, #6d5fff, #00d4ff, #6d5fff)",
                    animation: "spin 1.4s linear infinite",
                  }} />
                  <div style={{
                    position: "absolute", inset: 5, borderRadius: "50%",
                    background: "#07070f", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                  }}>🎨</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#dde0f0", fontSize: 14, fontWeight: 500, marginBottom: 12 }}>
                    {statusMsg}
                  </div>
                  {/* Progress bar */}
                  <div style={{
                    width: 220, height: 4, background: "#191928",
                    borderRadius: 2, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #6d5fff, #00d4ff)",
                      transition: "width .6s cubic-bezier(.4,0,.2,1)",
                    }} />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "#44445a", fontFamily: "'DM Mono', monospace" }}>
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            )}

            {generated?.url ? (
              /* Real generated image */
              <div style={{
                boxShadow: "0 0 0 1px #2a2a44, 0 24px 80px rgba(0,0,0,.6)",
                borderRadius: 3, lineHeight: 0,
                animation: "slideUp .4s ease",
              }}>
                <img
                  src={generated.url}
                  alt="Generated HD"
                  style={{
                    maxWidth: "min(calc(50vw - 80px), 100%)",
                    maxHeight: "calc(100vh - 340px)",
                    borderRadius: 3, display: "block",
                  }}
                />
              </div>
            ) : generated?.type === "demo" ? (
              /* Demo mode: show analysis */
              <div style={{
                maxWidth: 400, width: "100%",
                background: "#0f0f20", borderRadius: 14, border: "1px solid #2a2a44",
                padding: 24, animation: "slideUp .3s ease",
              }}>
                <div style={{ fontSize: 10, color: "#6d5fff", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
                  Claude Vision Analysis
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#dde0f0", marginBottom: 18, lineHeight: 1.5 }}>
                  {generated.analysis.description}
                </div>

                <div style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                  Enhanced Prompt
                </div>
                <div style={{
                  background: "#07070f", border: "1px solid #1f1f30",
                  borderRadius: 8, padding: 12, marginBottom: 16,
                  fontSize: 11, color: "#6666aa", lineHeight: 1.7,
                  fontFamily: "'DM Mono', monospace", maxHeight: 100, overflowY: "auto",
                }}>
                  {generated.analysis.sd_prompt}
                </div>

                <div style={{
                  background: "rgba(109,95,255,.07)",
                  border: "1px solid rgba(109,95,255,.25)",
                  borderRadius: 10, padding: "12px 16px",
                  fontSize: 12, color: "#9d98ff", lineHeight: 1.6, textAlign: "center",
                }}>
                  Add your <strong>Stability AI key</strong> above to generate<br />
                  the actual HD image from this prompt
                </div>
              </div>
            ) : (
              /* Empty state */
              <div style={{ textAlign: "center", color: "#2a2a44", animation: "pulse 3s ease infinite" }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>🖼️</div>
                <div style={{ fontSize: 13, color: "#44445a" }}>Your HD render will appear here</div>
                <div style={{ fontSize: 11, color: "#2a2a44", marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
                  Draw → Choose style → Generate
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div style={{
            height: 32, padding: "0 16px", borderTop: "1px solid #191928",
            background: "#0c0c1a", display: "flex", alignItems: "center",
            flexShrink: 0, gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background:
                statusType === "success" ? "#4ade80" :
                statusType === "error"   ? "#f87171" :
                statusType === "demo"    ? "#fbbf24" :
                statusType === "loading" ? "#6d5fff" : "#2a2a44",
              animation: statusType === "loading" ? "pulse 1s ease infinite" : "none",
            }} />
            <span style={{
              fontSize: 11, fontFamily: "'DM Mono', monospace",
              color:
                statusType === "success" ? "#4ade80" :
                statusType === "error"   ? "#f87171" :
                statusType === "demo"    ? "#fbbf24" :
                statusType === "loading" ? "#9d98ff" : "#44445a",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {statusMsg}
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROL BAR ── */}
      <div style={{
        borderTop: "1px solid #191928", background: "#0c0c1a",
        padding: "12px 20px", flexShrink: 0,
      }}>
        {/* Style presets */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "#44445a", fontFamily: "'DM Mono', monospace", letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            STYLE
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STYLE_PRESETS.map((p) => (
              <button
                key={p.id}
                className="preset-btn"
                onClick={() => setPreset(p.id)}
                style={{
                  background: preset === p.id ? "rgba(109,95,255,.15)" : "#191928",
                  border: `1px solid ${preset === p.id ? "#6d5fff" : "#2a2a44"}`,
                  borderRadius: 20, padding: "4px 13px",
                  color: preset === p.id ? "#9d98ff" : "#6666aa",
                  fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  transition: "all .15s",
                }}
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt input + action buttons */}
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <input
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Describe your sketch or add style details... (optional)"
            style={{
              flex: 1, background: "#191928", border: "1px solid #2a2a44",
              borderRadius: 10, padding: "9px 15px",
              color: "#dde0f0", fontSize: 13, fontFamily: "inherit",
              outline: "none", transition: "border-color .15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6d5fff")}
            onBlur={(e)  => (e.target.style.borderColor = "#2a2a44")}
          />

          {/* Regenerate */}
          <button
            onClick={generate}
            disabled={busy || !generated}
            style={{
              background: "#191928", border: "1px solid #2a2a44",
              borderRadius: 10, padding: "9px 16px",
              color: generated && !busy ? "#6666aa" : "#2a2a44",
              fontSize: 12, cursor: generated && !busy ? "pointer" : "not-allowed",
              fontFamily: "inherit", whiteSpace: "nowrap", transition: "all .15s",
            }}
          >
            ↻ Regen
          </button>

          {/* Generate */}
          <button
            onClick={generate}
            disabled={busy}
            className="glow-btn"
            style={{
              background: busy
                ? "#2a2a44"
                : "linear-gradient(135deg, #6d5fff 0%, #5a50e8 100%)",
              border: "none", borderRadius: 10, padding: "9px 28px",
              color: busy ? "#44445a" : "#fff",
              fontSize: 14, fontWeight: 600, letterSpacing: "-0.3px",
              cursor: busy ? "not-allowed" : "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap",
            }}
          >
            {busy ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, border: "2px solid #44445a", borderTopColor: "#9d98ff", borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite" }} />
                Generating…
              </span>
            ) : "✨ Generate HD"}
          </button>
        </div>
      </div>
    </div>
  );
}
