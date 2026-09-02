(function(){
  const canvas = document.getElementById('sheepCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 180; // altezza logica
  let width = document.documentElement.clientWidth;

  canvas.width = width * dpr;
  canvas.height = size * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = size + 'px';

  function resize() {
    width = document.documentElement.clientWidth;
    canvas.width = width * dpr;
    canvas.height = size * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = size + 'px';
  }
  window.addEventListener('resize', resize);

  const sheep = [];
  const total = 13;
  for (let i = 0; i < total; i++) {
    let goingRight, startX;
    if (i === 0) {
      goingRight = true;
      startX = 60;
    } else if (i === 1) {
      goingRight = false;
      startX = width - 60;
    } else {
      goingRight = Math.random() < 0.5;
      startX = 50 + Math.random() * (width - 100);
    }
    sheep.push({
      x: startX,
      y: 60 + Math.random() * 100,
      direction: goingRight ? 1 : -1,
      speed: 0.3 + Math.random() * 0.6,
      scale: 0.6 + Math.random() * 0.9,
      bobOffset: Math.random() * Math.PI * 2,
      legOffset: Math.random() * Math.PI * 2,
    });
  }

  function drawSheep(cx, cy, dir, legPhase, scale) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir * scale, scale);

    // Ombra
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 26, 5, 0, 0, Math.PI * 2);
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
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(lx + swing, legY + 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Corpo di lana
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(0, -18, 28, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Texture lana
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

  let frame = 0;
  function animate() {
    if (document.hidden) {
      requestAnimationFrame(animate);
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, size);

    for (let s of sheep) {
      s.x += s.direction * s.speed;
      const margin = 80 * s.scale;
      if (s.x > width + margin) {
        s.x = width + margin;
        s.direction = -1;
      } else if (s.x < -margin) {
        s.x = -margin;
        s.direction = 1;
      }
      const bob = Math.sin(frame * 0.08 + s.bobOffset) * 3;
      drawSheep(s.x, s.y + bob, s.direction, frame * 0.3 + s.legOffset, s.scale);
    }

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
})();
