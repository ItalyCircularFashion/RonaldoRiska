import { useState, useRef, useEffect, useCallback } from "react";

// ─── PRESET ARMATURE ────────────────────────────────────────────────────────
const PRESETS = {
  tela: {
    name: "Tela 1/1",
    desc: "plain weave",
    matrix: [
      [1, 0],
      [0, 1],
    ],
  },
  saia22: {
    name: "Saia 2/2",
    desc: "twill 2/2",
    matrix: [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
      [1, 0, 0, 1],
    ],
  },
  saia31: {
    name: "Saia 3/1",
    desc: "twill 3/1",
    matrix: [
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [1, 0, 1, 1],
      [0, 1, 1, 1],
    ],
  },
  saia13: {
    name: "Saia 1/3",
    desc: "twill 1/3",
    matrix: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
  },
  raso5: {
    name: "Raso 5",
    desc: "satin 5 licci",
    matrix: [
      [1, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
    ],
  },
  raso8: {
    name: "Raso 8",
    desc: "satin 8 licci",
    matrix: [
      [1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1],
    ],
  },
  panama: {
    name: "Panama 2/2",
    desc: "basket weave",
    matrix: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
  },
  chevron: {
    name: "Chevron",
    desc: "punto a spina",
    matrix: [
      [1, 1, 0, 0, 0, 1, 1, 1],
      [0, 1, 1, 0, 0, 0, 1, 1],
      [0, 0, 1, 1, 0, 0, 0, 1],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 1],
    ],
  },
};

// ─── UTILITY ────────────────────────────────────────────────────────────────
function makeEmptyMatrix(rows, cols, fill = 0) {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function getCoverage(matrix) {
  if (!matrix.length) return 0;
  const total = matrix.length * matrix[0].length;
  const on = matrix.flat().filter(Boolean).length;
  return Math.round((on / total) * 100);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function WeaveStudio() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null);

  // Grid parameters
  const [warpCount, setWarpCount] = useState(32);
  const [weftCount, setWeftCount] = useState(32);
  const [cellSize, setCellSize] = useState(18);

  // Pattern
  const [pattern, setPattern] = useState(() => PRESETS.tela.matrix.map((r) => [...r]));
  const [selectedPreset, setSelectedPreset] = useState("tela");

  // Colors
  const [warpColor, setWarpColor] = useState("#c8a46e");
  const [weftColor, setWeftColor] = useState("#3a6e8c");

  // View
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [showGrid, setShowGrid] = useState(true);
  const [showRepeatBorder, setShowRepeatBorder] = useState(true);
  const [showTension, setShowTension] = useState(true);

  // Interaction
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(null);

  // Notifications
  const [toast, setToast] = useState(null);

  // Keep a ref to current state for event handlers
  stateRef.current = { zoom, pan, cellSize, warpCount, weftCount, pattern, warpColor, weftColor, showGrid, showRepeatBorder, showTension, isPanning, lastMouse, isDragging, dragValue };

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  // ── CELL LOGIC ────────────────────────────────────────────────────────────
  const getCellValue = useCallback(
    (col, row) => {
      const pr = pattern.length;
      const pc = pattern[0]?.length || 1;
      return pattern[row % pr][col % pc];
    },
    [pattern]
  );

  const screenToCell = useCallback(
    (sx, sy) => {
      const { zoom: z, pan: p, cellSize: cs } = stateRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = (sx - rect.left - p.x) / z;
      const y = (sy - rect.top - p.y) / z;
      const col = Math.floor(x / cs);
      const row = Math.floor(y / cs);
      const { warpCount: wc, weftCount: wfc } = stateRef.current;
      if (col < 0 || col >= wc || row < 0 || row >= wfc) return null;
      return { col, row };
    },
    []
  );

  const toggleCell = useCallback(
    (col, row, forceValue = null) => {
      setPattern((prev) => {
        const pr = prev.length;
        const pc = prev[0]?.length || 1;
        const pi = col % pc;
        const pj = row % pr;
        return prev.map((r, ri) =>
          r.map((c, ci) => {
            if (ri === pj && ci === pi) return forceValue !== null ? forceValue : c === 1 ? 0 : 1;
            return c;
          })
        );
      });
      setSelectedPreset("custom");
    },
    []
  );

  // ── CANVAS RENDERING ──────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { zoom: z, pan: p, cellSize: cs, warpCount: wc, weftCount: wfc, showGrid: sg, showRepeatBorder: srb, showTension: st, warpColor: wCol, weftColor: wfCol } = stateRef.current;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#1a1a18";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);

    const warpRgb = hexToRgb(wCol);
    const weftRgb = hexToRgb(wfCol);

    const visX0 = Math.max(0, Math.floor(-p.x / z / cs));
    const visY0 = Math.max(0, Math.floor(-p.y / z / cs));
    const visX1 = Math.min(wc, Math.ceil((W - p.x) / z / cs) + 1);
    const visY1 = Math.min(wfc, Math.ceil((H - p.y) / z / cs) + 1);

    for (let row = visY0; row < visY1; row++) {
      for (let col = visX0; col < visX1; col++) {
        const pr = stateRef.current.pattern.length;
        const pc = stateRef.current.pattern[0]?.length || 1;
        const val = stateRef.current.pattern[row % pr][col % pc];

        const [r, g, b] = val === 1 ? warpRgb : weftRgb;

        // Base fill
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(col * cs, row * cs, cs, cs);

        // Tension simulation - warp ribs
        if (st && z > 0.3) {
          if (val === 1) {
            // warp above: vertical rib highlight
            const grad = ctx.createLinearGradient(col * cs, 0, col * cs + cs, 0);
            grad.addColorStop(0, `rgba(255,255,255,0.18)`);
            grad.addColorStop(0.4, `rgba(255,255,255,0.06)`);
            grad.addColorStop(1, `rgba(0,0,0,0.12)`);
            ctx.fillStyle = grad;
            ctx.fillRect(col * cs, row * cs, cs, cs);
          } else {
            // weft above: horizontal rib
            const grad = ctx.createLinearGradient(0, row * cs, 0, row * cs + cs);
            grad.addColorStop(0, `rgba(255,255,255,0.14)`);
            grad.addColorStop(0.5, `rgba(255,255,255,0.04)`);
            grad.addColorStop(1, `rgba(0,0,0,0.14)`);
            ctx.fillStyle = grad;
            ctx.fillRect(col * cs, row * cs, cs, cs);
          }

          // Crimp shadow at interlacing points
          const pr2 = stateRef.current.pattern.length;
          const pc2 = stateRef.current.pattern[0]?.length || 1;
          const left = col > 0 ? stateRef.current.pattern[row % pr2][(col - 1) % pc2] : val;
          const right = col < wc - 1 ? stateRef.current.pattern[row % pr2][(col + 1) % pc2] : val;
          if (val !== left) {
            ctx.fillStyle = val === 1 ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.15)";
            ctx.fillRect(col * cs, row * cs, cs * 0.18, cs);
          }
          if (val !== right) {
            ctx.fillStyle = val === 1 ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.15)";
            ctx.fillRect(col * cs + cs * 0.82, row * cs, cs * 0.18, cs);
          }
        }
      }
    }

    // Grid lines
    if (sg && z > 0.35) {
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 0.5 / z;
      for (let col = visX0; col <= visX1; col++) {
        ctx.beginPath();
        ctx.moveTo(col * cs, visY0 * cs);
        ctx.lineTo(col * cs, visY1 * cs);
        ctx.stroke();
      }
      for (let row = visY0; row <= visY1; row++) {
        ctx.beginPath();
        ctx.moveTo(visX0 * cs, row * cs);
        ctx.lineTo(visX1 * cs, row * cs);
        ctx.stroke();
      }
    }

    // Repeat border
    if (srb && z > 0.25) {
      const pr = stateRef.current.pattern.length;
      const pc = stateRef.current.pattern[0]?.length || 1;
      ctx.strokeStyle = "rgba(255,160,50,0.55)";
      ctx.lineWidth = 1.5 / z;
      ctx.setLineDash([3 / z, 2 / z]);
      for (let col = 0; col <= wc; col += pc) {
        ctx.beginPath();
        ctx.moveTo(col * cs, 0);
        ctx.lineTo(col * cs, wfc * cs);
        ctx.stroke();
      }
      for (let row = 0; row <= wfc; row += pr) {
        ctx.beginPath();
        ctx.moveTo(0, row * cs);
        ctx.lineTo(wc * cs, row * cs);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Hovered cell highlight
    const hov = stateRef.current.hoveredCell ?? hoveredCell;
    // use closure value
    ctx.restore();
  }, []);

  // Draw hovered cell on top
  const drawHover = useCallback((hCell) => {
    const canvas = canvasRef.current;
    if (!canvas || !hCell) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const { zoom: z, pan: p, cellSize: cs } = stateRef.current;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);
    ctx.strokeStyle = "rgba(255,220,80,0.9)";
    ctx.lineWidth = 2 / z;
    ctx.strokeRect(hCell.col * cs + 1 / z, hCell.row * cs + 1 / z, cs - 2 / z, cs - 2 / z);
    ctx.restore();
  }, []);

  // ── RESIZE CANVAS ─────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  // ── REDRAW ON STATE CHANGE ────────────────────────────────────────────────
  useEffect(() => {
    draw();
    if (hoveredCell) drawHover(hoveredCell);
  }, [warpCount, weftCount, pattern, warpColor, weftColor, cellSize, zoom, pan, showGrid, showRepeatBorder, showTension, draw, drawHover, hoveredCell]);

  // ── MOUSE EVENTS ──────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button === 1 || e.altKey) {
        setIsPanning(true);
        setLastMouse({ x: e.clientX, y: e.clientY });
        e.preventDefault();
        return;
      }
      if (e.button === 0) {
        const cell = screenToCell(e.clientX, e.clientY);
        if (cell) {
          const cur = getCellValue(cell.col, cell.row);
          const newVal = cur === 1 ? 0 : 1;
          setDragValue(newVal);
          setIsDragging(true);
          toggleCell(cell.col, cell.row, newVal);
        }
      }
    },
    [screenToCell, getCellValue, toggleCell]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const { isPanning: ip, lastMouse: lm, isDragging: id, dragValue: dv } = stateRef.current;
      if (ip) {
        setPan((p) => ({ x: p.x + e.clientX - lm.x, y: p.y + e.clientY - lm.y }));
        setLastMouse({ x: e.clientX, y: e.clientY });
        return;
      }
      const cell = screenToCell(e.clientX, e.clientY);
      setHoveredCell(cell);
      if (id && cell) {
        toggleCell(cell.col, cell.row, dv);
      }
    },
    [screenToCell, toggleCell]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsDragging(false);
    setDragValue(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setZoom((z) => {
      const nz = Math.min(Math.max(z * factor, 0.15), 8);
      setPan((p) => ({
        x: mx - (mx - p.x) * (nz / z),
        y: my - (my - p.y) * (nz / z),
      }));
      return nz;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── PRESETS ───────────────────────────────────────────────────────────────
  const applyPreset = (key) => {
    setPattern(PRESETS[key].matrix.map((r) => [...r]));
    setSelectedPreset(key);
  };

  // ── RESIZE PATTERN MATRIX ─────────────────────────────────────────────────
  const resizePattern = (newSize) => {
    const s = Math.max(2, Math.min(16, parseInt(newSize) || 2));
    const old = pattern;
    const np = makeEmptyMatrix(s, s, 0);
    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s; c++) {
        if (r < old.length && c < old[0].length) np[r][c] = old[r][c];
      }
    }
    setPattern(np);
    setSelectedPreset("custom");
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const exportPNG = () => {
    const cs = cellSize * 2;
    const off = document.createElement("canvas");
    off.width = warpCount * cs;
    off.height = weftCount * cs;
    const ctx = off.getContext("2d");
    const wRgb = hexToRgb(warpColor);
    const fRgb = hexToRgb(weftColor);
    for (let row = 0; row < weftCount; row++) {
      for (let col = 0; col < warpCount; col++) {
        const pr = pattern.length;
        const pc = pattern[0].length;
        const val = pattern[row % pr][col % pc];
        const [r, g, b] = val === 1 ? wRgb : fRgb;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(col * cs, row * cs, cs, cs);
        // Grid
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(col * cs, row * cs, cs, cs);
      }
    }
    const link = document.createElement("a");
    link.download = `weave_${selectedPreset}_${warpCount}x${weftCount}.png`;
    link.href = off.toDataURL("image/png");
    link.click();
    showToast("PNG esportato ✓");
  };

  const exportJSON = () => {
    const data = {
      meta: { tool: "WeaveStudio", version: "1.0", date: new Date().toISOString() },
      grid: { warpCount, weftCount },
      colors: { warp: warpColor, weft: weftColor },
      pattern: { preset: selectedPreset, matrix: pattern, rows: pattern.length, cols: pattern[0]?.length },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = `weave_${selectedPreset}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    showToast("JSON esportato ✓");
  };

  // ── UI HELPERS ────────────────────────────────────────────────────────────
  const coverage = getCoverage(pattern);
  const patCols = pattern[0]?.length || 1;
  const patRows = pattern.length;

  return (
    <div style={styles.root}>
      {/* ── TOPBAR ── */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {[0,1,2,3].map(i => (
              <rect key={i} x={i*5} y="0" width="4" height="20" fill={i%2===0 ? "#c8a46e" : "#3a6e8c"} opacity="0.9"/>
            ))}
            {[0,1,2,3].map(i => (
              <rect key={i+4} x="0" y={i*5} width="20" height="4" fill={i%2===0 ? "#3a6e8c" : "#c8a46e"} opacity="0.5"/>
            ))}
          </svg>
          <span style={styles.logoText}>WEAVE STUDIO</span>
          <span style={styles.logoSub}>simulatore armature tessili</span>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {hoveredCell && (
            <span style={styles.cellInfo}>
              ordito {hoveredCell.col + 1} · trama {hoveredCell.row + 1}
              {" · "}
              {getCellValue(hoveredCell.col, hoveredCell.row) ? "↑ ordito sopra" : "↓ trama sopra"}
            </span>
          )}
          <Btn onClick={exportPNG} accent="#4a7a4c">⬇ PNG</Btn>
          <Btn onClick={exportJSON} accent="#3a5a7a">⬇ JSON</Btn>
        </div>
      </div>

      <div style={styles.body}>
        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>

          <PanelSection title="GRIGLIA">
            <ParamRow label="Fili ordito">
              <NumInput value={warpCount} min={4} max={200} onChange={setWarpCount} />
            </ParamRow>
            <ParamRow label="Colpi trama">
              <NumInput value={weftCount} min={4} max={200} onChange={setWeftCount} />
            </ParamRow>
            <ParamRow label={`Cella ${cellSize}px`}>
              <input type="range" min={6} max={48} value={cellSize}
                onChange={(e) => setCellSize(+e.target.value)} style={styles.range} />
            </ParamRow>
          </PanelSection>

          <PanelSection title="COLORI FILO">
            <ColorRow label="Ordito" color={warpColor} onChange={setWarpColor} />
            <ColorRow label="Trama" color={weftColor} onChange={setWeftColor} />
          </PanelSection>

          <PanelSection title="LIBRERIA ARMATURE">
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {Object.entries(PRESETS).map(([key, p]) => (
                <button key={key} onClick={() => applyPreset(key)}
                  style={{ ...styles.presetBtn, background: selectedPreset === key ? "#3a2e18" : "transparent",
                    borderColor: selectedPreset === key ? "#c8a46e" : "#3a3a35", color: selectedPreset === key ? "#e8c888" : "#a0a09a" }}>
                  <span style={{ color: selectedPreset === key ? "#c8a46e" : "#555", marginRight: "6px" }}>
                    {selectedPreset === key ? "▸" : "◦"}
                  </span>
                  <span>{p.name}</span>
                  <span style={{ marginLeft: "auto", color: "#555", fontSize: "10px" }}>{p.desc}</span>
                </button>
              ))}
              <button onClick={() => setSelectedPreset("custom")}
                style={{ ...styles.presetBtn, background: selectedPreset === "custom" ? "#1e2a30" : "transparent",
                  borderColor: selectedPreset === "custom" ? "#3a6e8c" : "#3a3a35", color: selectedPreset === "custom" ? "#7ab8d4" : "#a0a09a" }}>
                <span style={{ color: selectedPreset === "custom" ? "#3a6e8c" : "#555", marginRight: "6px" }}>
                  {selectedPreset === "custom" ? "▸" : "◦"}
                </span>
                <span>Custom</span>
                <span style={{ marginLeft: "auto", color: "#555", fontSize: "10px" }}>matrice libera</span>
              </button>
            </div>
          </PanelSection>

          <PanelSection title="VISUALIZZAZIONE">
            <CheckRow label="Griglia" checked={showGrid} onChange={setShowGrid} />
            <CheckRow label="Bordo repeat" checked={showRepeatBorder} onChange={setShowRepeatBorder} />
            <CheckRow label="Tensione filo" checked={showTension} onChange={setShowTension} />
            <button onClick={() => { setZoom(1); setPan({ x: 20, y: 20 }); }}
              style={{ ...styles.presetBtn, marginTop: "6px", width: "100%", justifyContent: "center" }}>
              ⟲ reset vista
            </button>
          </PanelSection>
        </div>

        {/* ── CANVAS ── */}
        <div ref={containerRef} style={styles.canvasArea}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}
          style={{ ...styles.canvasArea, cursor: isPanning ? "grabbing" : isDragging ? "cell" : "crosshair" }}>
          <canvas ref={canvasRef} style={{ display: "block" }} />

          {/* Zoom badge */}
          <div style={styles.zoomBadge}>
            <button onClick={() => setZoom(z => Math.min(z * 1.2, 8))} style={styles.zoomBtn}>+</button>
            <span style={{ minWidth: "42px", textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.max(z * 0.83, 0.15))} style={styles.zoomBtn}>−</button>
          </div>

          {/* Hint */}
          <div style={styles.hint}>
            scroll → zoom · alt+drag → pan · click/drag → modifica cella
          </div>
        </div>

        {/* ── RIGHT PANEL - Pattern Matrix ── */}
        <div style={styles.rightPanel}>

          <div style={styles.sectionHeader}>MATRICE RAPPORTO</div>
          <div style={{ color: "#666", fontSize: "11px", marginBottom: "10px" }}>
            {patRows}×{patCols} · click per modificare
          </div>

          {/* Matrix Grid */}
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "260px" }}>
            <div style={{
              display: "grid",
              gap: "1px",
              gridTemplateColumns: `repeat(${patCols}, 18px)`,
              background: "#111",
              border: "1px solid #3a3a35",
              padding: "1px",
              width: "fit-content",
            }}>
              {pattern.map((row, ri) =>
                row.map((cell, ci) => (
                  <div key={`${ri}-${ci}`}
                    onClick={() => {
                      const np = pattern.map((r, rr) => r.map((c, cc) => rr === ri && cc === ci ? (c ? 0 : 1) : c));
                      setPattern(np);
                      setSelectedPreset("custom");
                    }}
                    style={{
                      width: "18px", height: "18px", cursor: "pointer",
                      background: cell ? warpColor : weftColor,
                      transition: "filter 0.1s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
                  />
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: "12px" }}>
            <ParamRow label="Dim. matrice">
              <NumInput value={patRows} min={2} max={16} onChange={resizePattern} />
            </ParamRow>
          </div>

          {/* Legend */}
          <div style={{ marginTop: "14px", borderTop: "1px solid #2a2a28", paddingTop: "10px" }}>
            <div style={styles.sectionHeader}>LEGENDA</div>
            <LegendRow color={warpColor} label="ordito sopra (1)" />
            <LegendRow color={weftColor} label="trama sopra (0)" />
            {showRepeatBorder && (
              <LegendRow color="#ff9a30" label="bordo rapporto" dash />
            )}
          </div>

          {/* Stats */}
          <div style={{ marginTop: "14px", borderTop: "1px solid #2a2a28", paddingTop: "10px" }}>
            <div style={styles.sectionHeader}>STATISTICHE</div>
            <StatRow label="Copertura ordito" value={`${coverage}%`} />
            <StatRow label="Copertura trama" value={`${100 - coverage}%`} />
            <StatRow label="Rapporto" value={`${patRows}×${patCols}`} />
            <StatRow label="Fili totali" value={`${warpCount * weftCount}`} />
            <div style={{ marginTop: "8px" }}>
              <div style={{ fontSize: "10px", color: "#555", marginBottom: "4px" }}>bilancio ordito/trama</div>
              <div style={{ height: "8px", background: "#252520", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${coverage}%`,
                  background: `linear-gradient(90deg, ${warpColor}, ${warpColor}cc)`,
                  transition: "width 0.3s",
                }} />
              </div>
            </div>
          </div>

          {/* Quick fills */}
          <div style={{ marginTop: "14px", borderTop: "1px solid #2a2a28", paddingTop: "10px" }}>
            <div style={styles.sectionHeader}>RIEMPI MATRICE</div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
              {[
                { label: "tutto ordito", fn: () => setPattern(p => p.map(r => r.map(() => 1))) },
                { label: "tutto trama", fn: () => setPattern(p => p.map(r => r.map(() => 0))) },
                { label: "inverti", fn: () => setPattern(p => p.map(r => r.map(c => c ? 0 : 1))) },
                { label: "diag ↗", fn: () => { const s = Math.max(patRows, patCols); setPattern(p => p.map((r, ri) => r.map((_, ci) => (ri + ci) % 2 === 0 ? 1 : 0))); } },
              ].map(({ label, fn }) => (
                <button key={label} onClick={() => { fn(); setSelectedPreset("custom"); }}
                  style={{ ...styles.miniBtn }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function PanelSection({ title, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={styles.sectionHeader}>{title}</div>
      <div style={{ marginTop: "8px" }}>{children}</div>
    </div>
  );
}

function ParamRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "7px", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: "#888", flex: 1, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1.2 }}>{children}</div>
    </div>
  );
}

function NumInput({ value, min, max, onChange }) {
  return (
    <input type="number" value={value} min={min} max={max}
      onChange={(e) => onChange(+e.target.value)}
      style={styles.numInput} />
  );
}

function ColorRow({ label, color, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "7px", gap: "8px" }}>
      <span style={{ fontSize: "11px", color: "#888", flex: 1 }}>{label}</span>
      <input type="color" value={color} onChange={(e) => onChange(e.target.value)}
        style={{ width: "28px", height: "22px", border: "1px solid #3a3a35", background: "none", cursor: "pointer", padding: "1px" }} />
      <span style={{ fontSize: "10px", color: "#555", fontFamily: "monospace" }}>{color}</span>
    </div>
  );
}

function CheckRow({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginBottom: "5px" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "#c8a46e", width: "13px", height: "13px" }} />
      <span style={{ fontSize: "12px", color: "#a0a09a" }}>{label}</span>
    </label>
  );
}

function LegendRow({ color, label, dash }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
      <div style={{
        width: "16px", height: "10px", background: dash ? "transparent" : color,
        border: dash ? `1.5px dashed ${color}` : "none",
        flexShrink: 0,
      }} />
      <span style={{ fontSize: "11px", color: "#777" }}>{label}</span>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
      <span style={{ fontSize: "11px", color: "#666" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#c8a46e", fontFamily: "monospace" }}>{value}</span>
    </div>
  );
}

function Btn({ onClick, children, accent = "#3a3a35" }) {
  return (
    <button onClick={onClick} style={{
      background: accent + "33", border: `1px solid ${accent}`,
      color: "#c8c4b0", padding: "5px 12px", cursor: "pointer",
      fontFamily: "'Courier New', monospace", fontSize: "12px",
      letterSpacing: "0.5px", transition: "background 0.15s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.background = accent + "66"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = accent + "33"; }}>
      {children}
    </button>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: "'Courier New', Courier, monospace",
    background: "#1a1a18",
    color: "#c8c4b0",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    userSelect: "none",
  },
  topbar: {
    background: "#111110",
    borderBottom: "2px solid #3a3a35",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
    zIndex: 10,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoText: {
    color: "#c8a46e",
    fontWeight: "bold",
    fontSize: "13px",
    letterSpacing: "2px",
  },
  logoSub: {
    color: "#555",
    fontSize: "11px",
    letterSpacing: "0.5px",
  },
  cellInfo: {
    fontSize: "11px",
    color: "#888",
    background: "#252520",
    padding: "4px 10px",
    border: "1px solid #3a3a35",
    fontFamily: "monospace",
  },
  body: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },
  leftPanel: {
    width: "210px",
    background: "#141412",
    borderRight: "1px solid #3a3a35",
    padding: "12px",
    overflowY: "auto",
    flexShrink: 0,
  },
  canvasArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background: "#1a1a18",
  },
  rightPanel: {
    width: "200px",
    background: "#141412",
    borderLeft: "1px solid #3a3a35",
    padding: "12px",
    overflowY: "auto",
    flexShrink: 0,
  },
  sectionHeader: {
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#c8a46e",
    borderBottom: "1px solid #2a2a28",
    paddingBottom: "4px",
    marginBottom: "4px",
  },
  presetBtn: {
    display: "flex",
    alignItems: "center",
    padding: "5px 8px",
    border: "1px solid transparent",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontSize: "12px",
    width: "100%",
    textAlign: "left",
    transition: "all 0.1s",
  },
  numInput: {
    background: "#252520",
    border: "1px solid #3a3a35",
    color: "#c8c4b0",
    padding: "3px 6px",
    width: "100%",
    fontFamily: "'Courier New', monospace",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },
  range: {
    width: "100%",
    accentColor: "#c8a46e",
  },
  zoomBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    background: "rgba(20,20,18,0.85)",
    border: "1px solid #3a3a35",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 6px",
    fontSize: "12px",
    color: "#888",
    fontFamily: "monospace",
  },
  zoomBtn: {
    background: "none",
    border: "1px solid #3a3a35",
    color: "#c8c4b0",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  hint: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    fontSize: "10px",
    color: "#444",
    fontFamily: "monospace",
    pointerEvents: "none",
  },
  miniBtn: {
    background: "#252520",
    border: "1px solid #3a3a35",
    color: "#888",
    padding: "3px 6px",
    cursor: "pointer",
    fontFamily: "'Courier New', monospace",
    fontSize: "10px",
    transition: "all 0.1s",
  },
  toast: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#3a2e18",
    border: "1px solid #c8a46e",
    color: "#e8c888",
    padding: "8px 20px",
    fontSize: "12px",
    fontFamily: "monospace",
    letterSpacing: "0.5px",
    zIndex: 1000,
    pointerEvents: "none",
  },
};
