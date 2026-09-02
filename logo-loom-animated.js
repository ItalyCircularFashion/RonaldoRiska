(function(){
  const canvas = document.getElementById('animatedLogoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 300;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = '240px';
  canvas.style.height = '240px';
  ctx.scale(dpr, dpr);

  const cols = 9;
  const spacing = size / cols;
  const cycleFrames = 140;
  let frames = 0;
  let wefts = [];
  for (let i = 0; i < 6; i++) {
    wefts.push({ y: 40 + spacing * i, pattern: i % 2 });
  }

  // Disegna un filo ondulato invece di una linea retta
  function drawYarn(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const segments = Math.max(10, Math.floor(dist / 4));
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;
    const amp = 1.2; // ampiezza ondulazione
    const freq = 0.4;
    ctx.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + dx * i + Math.sin(t * Math.PI * 6) * amp;
      const y = y1 + dy * i + Math.cos(t * Math.PI * 6) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Ombra/texture sottile per effetto filato
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = width * 0.35;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + dx * i + Math.sin(t * Math.PI * 6) * amp + 0.5;
      const y = y1 + dy * i + Math.cos(t * Math.PI * 6) * amp + 0.5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  }

  function drawWeft(yPos, pattern, width, fromLeft) {
    if (fromLeft) {
      drawYarn(0, yPos, width, yPos, '#ef4444', 4.2);
    } else {
      drawYarn(size, yPos, size - width, yPos, '#ef4444', 4.2);
    }
    // Intreccio: pezzetti di ordito che stanno sopra
    for (let i = 1; i < cols; i++) {
      if ((i + pattern) % 2 === 0) {
        let x = i * spacing;
        let isCrossed = fromLeft ? (width >= x - 2) : (size - width <= x + 2);
        if (isCrossed) {
          drawYarn(x, yPos - 5, x, yPos + 5, '#ffffff', 3.6);
        }
      }
    }
  }

  function draw() {
    if (document.hidden) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, size, size);
    let p = (frames % cycleFrames) / cycleFrames;
    let cycleIndex = Math.floor(frames / cycleFrames);
    let isEven = cycleIndex % 2 === 0;

    let shuttleX = -20;
    let newWeftY = 25;
    let beaterY = -20;
    let shiftOffset = 0;
    let newWeftWidth = 0;

    if (p < 0.4) {
      let tp = p / 0.4;
      tp = tp < 0.5 ? 2 * tp * tp : -1 + (4 - 2 * tp) * tp;
      if (isEven) {
        shuttleX = tp * (size + 40) - 20;
        newWeftWidth = Math.max(0, Math.min(size, shuttleX));
      } else {
        shuttleX = (size + 20) - tp * (size + 40);
        newWeftWidth = Math.max(0, Math.min(size, size - shuttleX));
      }
    } else {
      shuttleX = isEven ? size + 20 : -20;
      newWeftWidth = size;
    }

    if (p > 0.4 && p <= 0.5) {
      let tp = (p - 0.4) / 0.1;
      beaterY = -15 + tp * (newWeftY + 5);
    } else if (p > 0.5 && p <= 0.7) {
      let tp = (p - 0.5) / 0.2;
      tp = 1 - Math.pow(1 - tp, 3);
      beaterY = (25 + 5) + tp * (40 - 25);
      newWeftY = 25 + tp * (40 - 25);
      shiftOffset = tp * spacing;
    } else if (p > 0.7 && p <= 0.85) {
      let tp = (p - 0.7) / 0.15;
      tp = tp * tp;
      beaterY = (40 + 5) - tp * (40 + 5 + 15);
      newWeftY = 40;
      shiftOffset = spacing;
    } else if (p > 0.85) {
      beaterY = -15;
      newWeftY = 40;
      shiftOffset = spacing;
    }

    if (frames > 0 && frames % cycleFrames === 0) {
      wefts.unshift({ y: 40, pattern: isEven ? 1 : 0 });
      for (let w of wefts) w.y += spacing;
      if (wefts.length > 8) wefts.pop();
      shiftOffset = 0;
    }

    // Ordito come filati ondulati
    for (let i = 1; i < cols; i++) {
      drawYarn(i * spacing, 0, i * spacing, size, '#ffffff', 3.8);
    }

    for (let w of wefts) {
      drawWeft(w.y + shiftOffset, w.pattern, size, true);
    }
    if (p < 0.9) drawWeft(newWeftY, isEven ? 1 : 0, newWeftWidth, isEven);

    // Navetta
    if (p < 0.45) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      let w = 24, h = 9;
      ctx.moveTo(shuttleX - w/2, 25);
      ctx.lineTo(shuttleX - w/4, 25 - h/2);
      ctx.lineTo(shuttleX + w/4, 25 - h/2);
      ctx.lineTo(shuttleX + w/2, 25);
      ctx.lineTo(shuttleX + w/4, 25 + h/2);
      ctx.lineTo(shuttleX - w/4, 25 + h/2);
      ctx.fill();
    }

    // Pettine
    if (beaterY > -10) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= cols; i++) {
        let x = (i * spacing) - (spacing / 2);
        if (x > 0 && x < size) {
          drawYarn(x, beaterY - 18, x, beaterY + 2, '#16a34a', 2);
        }
      }
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, beaterY - 20, size, 5);
      ctx.fillRect(0, beaterY, size, 4);
    }

    frames++;
    requestAnimationFrame(draw);
  }

  draw();
})();
