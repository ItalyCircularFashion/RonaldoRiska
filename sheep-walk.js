(function(){
  const canvas = document.getElementById('sheepCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 220;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = '180px';
  canvas.style.height = '180px';
  ctx.scale(dpr, dpr);

  let x = -80;
  let direction = 1; // 1 = destra, -1 = sinistra
  const speed = 0.6;
  const bobAmp = 3;
  let frame = 0;

  function drawSheep(cx, cy, dir, legPhase) {
    ctx.save();
    ctx.translate(cx, cy);
    if (dir === -1) ctx.scale(-1, 1);

    // Corpo di lana (ovale)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -18, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Texture lana (piccoli cerchi)
    ctx.fillStyle = '#f1f5f9';
    for (let i = -12; i <= 12; i += 8) {
      for (let j = -12; j <= 12; j += 8) {
        if (i * i / 256 + j * j / 144 <= 1) {
          ctx.beginPath();
          ctx.arc(i, -18 + j * 0.7, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Testa
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(26, -28, 11, 0, Math.PI * 2);
    ctx.fill();

    // Orecchie
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(22, -38, 4, 7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(32, -38, 4, 7, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Occhio
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(29, -30, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(30, -30, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Zampe
    const legY = 4;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let lx = -14; lx <= 14; lx += 10) {
      const swing = Math.sin(legPhase + (lx === -14 ? 0 : Math.PI)) * 6;
      ctx.beginPath();
      ctx.moveTo(lx, 2);
      ctx.lineTo(lx + swing, legY + 14);
      ctx.stroke();
      // Zoccolo
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(lx + swing, legY + 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Codina
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-26, -16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  function animate() {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }
    ctx.clearRect(0, 0, size, size);

    // Movimento morbido con easing
    x += direction * speed;
    const margin = 80;
    if (x > size + margin) {
      direction = -1;
      x = size + margin;
    } else if (x < -margin) {
      direction = 1;
      x = -margin;
    }

    const bob = Math.sin(frame * 0.08) * bobAmp;
    const legPhase = frame * 0.3;

    drawSheep(x, 110 + bob, direction, legPhase);

    // Ombra per dare profondità
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(x, 148, 26, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
})();
