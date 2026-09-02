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

  function drawWeft(yPos, pattern, width, fromLeft) {
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    if (fromLeft) {
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
    } else {
      ctx.moveTo(size, yPos);
      ctx.lineTo(size - width, yPos);
    }
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    for (let i = 1; i < cols; i++) {
      if ((i + pattern) % 2 === 0) {
        let x = i * spacing;
        let isCrossed = fromLeft ? (width >= x - 2) : (size - width <= x + 2);
        if (isCrossed) {
          ctx.beginPath();
          ctx.moveTo(x, yPos - 5);
          ctx.lineTo(x, yPos + 5);
          ctx.stroke();
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

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * spacing, 0);
      ctx.lineTo(i * spacing, size);
      ctx.stroke();
    }

    for (let w of wefts) {
      drawWeft(w.y + shiftOffset, w.pattern, size, true);
    }
    if (p < 0.9) drawWeft(newWeftY, isEven ? 1 : 0, newWeftWidth, isEven);

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

    if (beaterY > -10) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= cols; i++) {
        let x = (i * spacing) - (spacing / 2);
        if (x > 0 && x < size) {
          ctx.beginPath();
          ctx.moveTo(x, beaterY - 18);
          ctx.lineTo(x, beaterY + 2);
          ctx.stroke();
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
