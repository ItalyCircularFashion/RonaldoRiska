(() => {
'use strict';

// ====================================================
// NAVIGATION
// ====================================================
const sectionLabels = {
  s0: null,
  s1: 'Make or Buy',
  s2: 'Analisi dei Costi',
  s3: 'Gli Acquisti',
  s4: 'Partnership',
  s5: 'Supply Chain',
  s6: 'Simulatore',
  s7: 'Pianificatore SC'
};

function showSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(button => button.classList.remove('active'));
  target.classList.add('active');

  document.querySelectorAll(`.nav-btn[data-section-target="${id}"]`).forEach(button => {
    button.classList.add('active');
  });

  const fab = document.getElementById('home-fab');
  if (fab) fab.classList.toggle('visible', id !== 's0');

  const main = document.getElementById('main');
  if (main) main.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    if (id === 's2') { drawCostChart(); calcBEP(); calcLO(); calcMulti(); }
    if (id === 's5') { drawPushPull(); drawBullwhip(); selectSCStrategy(); }
    if (id === 's6') { calcWhatIf(); drawKPChart(); }
    if (id === 's1') { updateMoB(); calcLeva(); }
  }, 50);
}

function showSubTab(group, id, trigger = null) {
  const target = document.getElementById(id);
  if (!target) return;

  document.querySelectorAll(`[id^="${group}-"]`).forEach(element => {
    if (element.classList.contains('sub-content')) element.classList.remove('active');
  });
  document.querySelectorAll(`.sub-tab[data-subtab-group="${group}"]`).forEach(tab => {
    tab.classList.remove('active');
  });

  target.classList.add('active');
  if (trigger) {
    trigger.classList.add('active');
  } else {
    document.querySelector(`.sub-tab[data-subtab-target="${id}"]`)?.classList.add('active');
  }

  setTimeout(() => {
    if (group === 'cost') { drawCostChart(); calcBEP(); calcLO(); calcMulti(); }
    if (group === 'sc') { drawPushPull(); drawBullwhip(); selectSCStrategy(); }
    if (group === 'mob') { updateMoB(); calcLeva(); }
    if (group === 'acq') { classifyKraljic(); classifyVendor(); }
  }, 50);
}

// ====================================================
// MAKE OR BUY
// ====================================================
// MAKE OR BUY SIMULATOR
// ====================================================
function updateMoB() {
  const comp = parseInt(document.getElementById('comp-sl').value);
  const spec = parseInt(document.getElementById('spec-sl').value);
  const unc  = parseInt(document.getElementById('unc-sl').value);

  document.getElementById('comp-val').textContent = comp;
  document.getElementById('spec-val').textContent = spec;
  document.getElementById('unc-val').textContent = unc;

  const avg = (comp + spec + unc) / 3;
  const score = Math.round(avg * 10);
  document.getElementById('ct-score').textContent = score + '/100';

  // Update SVG bars
  const svgComp = document.getElementById('svg-comp');
  const svgSpec = document.getElementById('svg-spec');
  const svgUnc  = document.getElementById('svg-unc');
  if (svgComp) {
    svgComp.setAttribute('width', (comp / 10) * 220);
    svgSpec.setAttribute('width', (spec / 10) * 220);
    svgUnc.setAttribute('width',  (unc  / 10) * 220);
    document.getElementById('svg-comp-t').textContent = comp;
    document.getElementById('svg-spec-t').textContent = spec;
    document.getElementById('svg-unc-t').textContent = unc;
  }

  // Segments
  const segs = document.querySelectorAll('#ct-segs .score-seg');
  const lit = Math.round(avg);
  segs.forEach((s, i) => {
    s.className = 'score-seg';
    if (i < lit) {
      if (avg <= 3.5) s.classList.add('lit','low');
      else if (avg <= 6.5) s.classList.add('lit','medium');
      else s.classList.add('lit','high');
    }
  });

  // Recommendation
  const reco = document.getElementById('mob-reco');
  if (avg <= 3.5) {
    reco.innerHTML = `<div class="reco-box lean">
      <h4>✅ Mercato Competitivo (Outsourcing)</h4>
      <p>I costi di transazione sono bassi. Bassa complessità descrittiva, bassa specificità e bassa incertezza favoriscono il mercato intermedio. Consigliato: multiple sourcing con fornitori in competizione. Nel settore tessile di Prato: terzisti specializzati su lavorazioni standard.</p>
    </div>`;
  } else if (avg <= 6.5) {
    reco.innerHTML = `<div class="reco-box collab">
      <h4>⚡ Mercato Collaborativo (Partnership)</h4>
      <p>I costi di transazione sono sostenibili. Esistono le condizioni per un mercato intermedio collaborativo. Consigliato: single/dual sourcing con investimenti relazionali. Nel tessile: co-sviluppo con terzisti specializzati, contratti quadro di stagione.</p>
    </div>`;
  } else {
    reco.innerHTML = `<div class="reco-box vertical">
      <h4>⚠️ Integrazione Verticale (Make)</h4>
      <p>I costi di transazione sono molto alti. Complessità, specificità o incertezza elevate rendono difficile il mercato intermedio. Valutare l'integrazione verticale per questa attività o investire nella creazione di un mercato (come P&G con 3M).</p>
    </div>`;
  }
}

// ====================================================
// EFFETTO LEVA
// ====================================================
function calcLeva() {
  const fat = parseFloat(document.getElementById('lv-fat').value) || 5000;
  const acq = parseFloat(document.getElementById('lv-acq').value) || 3500;
  const alt = parseFloat(document.getElementById('lv-alt').value) || 1100;
  const scr = parseFloat(document.getElementById('lv-scr').value) || 500;
  const ac  = parseFloat(document.getElementById('lv-ac').value)  || 600;
  const af  = parseFloat(document.getElementById('lv-af').value)  || 2900;
  const rid = parseFloat(document.getElementById('lv-rid').value) || 5;
  const aum = parseFloat(document.getElementById('lv-aum').value) || 15;

  document.getElementById('lv-ridval').textContent = rid + '%';
  document.getElementById('lv-aumval').textContent = aum + '%';

  function calcRow(fatNew, acqNew, altNew) {
    const altNew2 = acqNew > 0 ? alt * (fatNew / fat) : alt;
    const ebit = fatNew - acqNew - altNew;
    const scrNew = scr * (acqNew / acq);
    const ci = scrNew + ac + af;
    const ros = fatNew > 0 ? (ebit / fatNew * 100) : 0;
    const trc = ci > 0 ? (fatNew / ci) : 0;
    const roi = ros * trc / 100;
    return { fat: fatNew, acq: acqNew, alt: altNew, ebit, ci, ros, trc, roi };
  }

  const base   = calcRow(fat, acq, alt);
  const ridAcq = calcRow(fat, acq * (1 - rid/100), alt);
  const aumFat = calcRow(fat * (1 + aum/100), acq * (1 + aum/100), alt * (1 + aum/100 * 0.7));

  function fmt(v, dec=0, sym='€') { return sym + ' ' + v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function fmtPct(v) { return v.toFixed(1) + '%'; }
  function cls(v, base) { return v > base ? 'good' : (v < base ? 'bad' : ''); }

  document.getElementById('leva-results').innerHTML = `
    <div class="card-title">Confronto Scenari</div>
    <table>
      <thead><tr><th>Voce</th><th>Partenza</th><th>−${rid}% Acquisti</th><th>+${aum}% Fatturato</th></tr></thead>
      <tbody>
        <tr><td>Fatturato</td><td>${fmt(base.fat)}</td><td>${fmt(ridAcq.fat)}</td><td class="td-accent">${fmt(aumFat.fat)}</td></tr>
        <tr><td>Acquisti</td><td>${fmt(base.acq)}</td><td class="td-gold">${fmt(ridAcq.acq)}</td><td>${fmt(aumFat.acq)}</td></tr>
        <tr><td>Altri Costi</td><td>${fmt(base.alt)}</td><td>${fmt(ridAcq.alt)}</td><td>${fmt(aumFat.alt)}</td></tr>
        <tr style="border-top:2px solid var(--border)"><td><strong>EBIT</strong></td><td><strong>${fmt(base.ebit)}</strong></td><td class="td-gold"><strong>${fmt(ridAcq.ebit)}</strong></td><td class="td-accent"><strong>${fmt(aumFat.ebit)}</strong></td></tr>
        <tr><td>Cap. Investito</td><td>${fmt(base.ci)}</td><td>${fmt(ridAcq.ci)}</td><td>${fmt(aumFat.ci)}</td></tr>
        <tr style="border-top:2px solid var(--border)"><td>ROS</td><td>${fmtPct(base.ros)}</td><td class="td-gold">${fmtPct(ridAcq.ros)}</td><td>${fmtPct(aumFat.ros)}</td></tr>
        <tr><td>TRC</td><td>${base.trc.toFixed(2)}</td><td>${ridAcq.trc.toFixed(2)}</td><td>${aumFat.trc.toFixed(2)}</td></tr>
        <tr style="font-size:15px;"><td><strong>ROI</strong></td><td><strong>${fmtPct(base.roi)}</strong></td><td class="td-gold" style="font-size:15px;font-weight:bold;">${fmtPct(ridAcq.roi)}</td><td class="td-accent" style="font-size:15px;font-weight:bold;">${fmtPct(aumFat.roi)}</td></tr>
      </tbody>
    </table>
    <div style="margin-top:10px;padding:8px;background:var(--bg3);border-radius:4px;font-size:12px;color:var(--text2);">
      💡 Riduzione acquisti del ${rid}%: ROI passa da ${fmtPct(base.roi)} a ${fmtPct(ridAcq.roi)} (${ridAcq.roi > base.roi ? '+' : ''}${(ridAcq.roi - base.roi).toFixed(1)}pp). 
      L'aumento del fatturato del ${aum}% produce un ROI di ${fmtPct(aumFat.roi)}.
      ${ridAcq.roi > aumFat.roi ? 'In questo scenario, razionalizzare gli acquisti è più efficace.' : 'In questo scenario, crescere è più efficace.'}
    </div>`;
}

// ====================================================
// COST CHART
// ====================================================
function drawCostChart() {
  const canvas = document.getElementById('costChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cvu = parseFloat(document.getElementById('cv-cvu').value);
  const cft = parseFloat(document.getElementById('cv-cft').value);
  const volMax = parseFloat(document.getElementById('cv-vol').value);

  document.getElementById('cv-cvu-val').textContent = cvu;
  document.getElementById('cv-cft-val').textContent = cft;
  document.getElementById('cv-vol-val').textContent = volMax;

  ctx.clearRect(0, 0, W, H);
  const pad = {l:40, r:10, t:10, b:30};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  const maxCost = cft + cvu * volMax;

  function sx(v) { return pad.l + (v / volMax) * gW; }
  function sy(c) { return pad.t + (1 - c / maxCost) * gH; }

  // Grid
  ctx.strokeStyle = '#dce8f5'; ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = pad.t + (i / 5) * gH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke();
  }

  // Fixed cost
  ctx.strokeStyle = '#b05c00'; ctx.lineWidth = 2; ctx.setLineDash([5,3]);
  ctx.beginPath(); ctx.moveTo(sx(0), sy(cft)); ctx.lineTo(sx(volMax), sy(cft)); ctx.stroke();
  ctx.setLineDash([]);

  // Variable cost
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(0)); ctx.lineTo(sx(volMax), sy(cvu * volMax)); ctx.stroke();

  // Total cost
  ctx.strokeStyle = '#1e3a6e'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(cft));
  for (let x = 0; x <= volMax; x += volMax/100) {
    ctx.lineTo(sx(x), sy(cft + cvu * x));
  }
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#6688aa'; ctx.font = '10px Gill Sans, sans-serif';
  ctx.fillText('0', pad.l - 12, pad.t + gH + 16);
  ctx.fillText(Math.round(volMax/2), sx(volMax/2) - 10, pad.t + gH + 16);
  ctx.fillText(volMax, sx(volMax) - 10, pad.t + gH + 16);

  ctx.fillStyle = '#b05c00'; ctx.fillText('CFT', sx(volMax * 0.6), sy(cft) - 4);
  ctx.fillStyle = '#1a6fa8'; ctx.fillText('CVT', sx(volMax * 0.7), sy(cvu * volMax * 0.7) + 12);
  ctx.fillStyle = '#1e3a6e'; ctx.fillText('CT', sx(volMax * 0.8), sy(cft + cvu * volMax * 0.8) - 4);

  // Update stats
  const ctMax = cft + cvu * volMax;
  document.getElementById('cv-cu').textContent = '€ ' + (ctMax / volMax).toFixed(2);
  document.getElementById('cv-cm').textContent = '€ ' + cvu.toFixed(2);
  document.getElementById('cv-inc').textContent = Math.round(cft / ctMax * 100) + '%';
}

// ====================================================
// BREAK-EVEN
// ====================================================
function calcBEP() {
  const p   = parseFloat(document.getElementById('bep-p').value);
  const cvu = parseFloat(document.getElementById('bep-cvu').value);
  const cft = parseFloat(document.getElementById('bep-cft').value);
  const x   = parseFloat(document.getElementById('bep-x').value);

  document.getElementById('bep-p-val').textContent   = '€ ' + p.toLocaleString();
  document.getElementById('bep-cvu-val').textContent = '€ ' + cvu.toLocaleString();
  document.getElementById('bep-cft-val').textContent = '€ ' + cft.toLocaleString();
  document.getElementById('bep-x-val').textContent   = x;

  const mdcu = p - cvu;
  if (mdcu <= 0) {
    document.getElementById('r-mdcu').textContent = '€ ' + mdcu.toFixed(2);
    document.getElementById('r-mdcu').className = 'val bad';
    document.getElementById('r-xp').textContent = '∞ (impossibile)';
    return;
  }
  const mdcup = mdcu / p;
  const xp  = cft / mdcu;
  const rtp = cft / mdcup;
  const mdc = mdcu * x;
  const pr  = mdc - cft;
  const ms  = x > xp ? ((x - xp) / x * 100) : -(Math.abs(x - xp)/x*100);

  document.getElementById('r-mdcu').textContent = '€ ' + mdcu.toFixed(2);
  document.getElementById('r-mdcu').className = 'val ' + (mdcu > 0 ? 'good' : 'bad');
  document.getElementById('r-mdcup').textContent = (mdcup * 100).toFixed(1) + '%';
  document.getElementById('r-xp').textContent = xp.toFixed(1) + ' unità';
  document.getElementById('r-rtp').textContent = '€ ' + rtp.toLocaleString('it-IT', {maximumFractionDigits:0});
  document.getElementById('r-pr').textContent = '€ ' + pr.toLocaleString('it-IT', {maximumFractionDigits:0});
  document.getElementById('r-pr').className = 'val ' + (pr >= 0 ? 'good' : 'bad');
  document.getElementById('r-ms').textContent = ms.toFixed(1) + '%';
  document.getElementById('r-ms').className = 'val ' + (ms >= 0 ? 'good' : 'bad');

  drawBEPChart(p, cvu, cft, x, xp, mdcu);
}

function drawBEPChart(p, cvu, cft, xEff, xp, mdcu) {
  const canvas = document.getElementById('bepChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  const pad = {l:50, r:20, t:20, b:40};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  const xMax = Math.max(xp * 2.2, xEff * 1.3, 10);
  const maxVal = Math.max(p * xMax, cft + cvu * xMax) * 1.05;

  function sx(v) { return pad.l + (v / xMax) * gW; }
  function sy(v) { return pad.t + (1 - v / maxVal) * gH; }

  // Grid
  ctx.strokeStyle = '#dce8f5'; ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const y = pad.t + f * gH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + gW, y); ctx.stroke();
    ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans';
    ctx.fillText((maxVal * (1-f) / 1000).toFixed(1) + 'k', 2, y + 3);
  });

  // Axis
  ctx.strokeStyle = '#c0cfe0'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH); ctx.stroke();

  // CFT
  ctx.strokeStyle = '#b05c00'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(sx(0), sy(cft)); ctx.lineTo(sx(xMax), sy(cft)); ctx.stroke();
  ctx.setLineDash([]);

  // Total Cost line
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(cft)); ctx.lineTo(sx(xMax), sy(cft + cvu * xMax)); ctx.stroke();

  // Revenue line
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(0)); ctx.lineTo(sx(xMax), sy(p * xMax)); ctx.stroke();

  // Break-even point
  ctx.strokeStyle = '#1e3a6e'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(sx(xp), sy(0)); ctx.lineTo(sx(xp), sy(p * xp)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1e3a6e';
  ctx.beginPath(); ctx.arc(sx(xp), sy(p * xp), 5, 0, Math.PI * 2); ctx.fill();

  // Effective volume marker
  if (xEff > 0 && xEff <= xMax) {
    const prEff = mdcu * xEff - cft;
    ctx.strokeStyle = prEff >= 0 ? '#1a7a4a' : '#c0392b'; ctx.lineWidth = 1; ctx.setLineDash([2,2]);
    ctx.beginPath(); ctx.moveTo(sx(xEff), sy(0)); ctx.lineTo(sx(xEff), sy(p * xEff)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = prEff >= 0 ? '#1a7a4a' : '#c0392b';
    ctx.beginPath(); ctx.arc(sx(xEff), sy(p * xEff), 5, 0, Math.PI * 2); ctx.fill();
  }

  // Labels
  ctx.fillStyle = '#1a6fa8'; ctx.font = 'bold 10px Gill Sans';
  ctx.fillText('RT', sx(xMax * 0.85), sy(p * xMax * 0.85) - 5);
  ctx.fillStyle = '#c0392b';
  ctx.fillText('CT', sx(xMax * 0.85), sy(cft + cvu * xMax * 0.85) + 12);
  ctx.fillStyle = '#1e3a6e';
  ctx.fillText('Xp=' + xp.toFixed(0), sx(xp) + 4, sy(p * xp / 2));

  // X axis labels
  ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans';
  [0, Math.round(xMax/4), Math.round(xMax/2), Math.round(xMax * 3/4), Math.round(xMax)].forEach(v => {
    ctx.fillText(v, sx(v) - 5, pad.t + gH + 18);
  });
  ctx.fillText('Volume', pad.l + gW / 2 - 20, pad.t + gH + 32);
}

// ====================================================
// LEVA OPERATIVA
// ====================================================
function calcLO() {
  const pf = parseFloat(document.getElementById('lo-pf').value);
  const xv  = parseFloat(document.getElementById('lo-x').value);
  const dr  = parseFloat(document.getElementById('lo-dr').value);

  document.getElementById('lo-pf-val').textContent = pf + '%';
  document.getElementById('lo-x-val').textContent = xv;
  document.getElementById('lo-dr-val').textContent = (dr >= 0 ? '+' : '') + dr + '%';

  // Simulate: p=100, cvu based on pf
  const p = 100, cft = xv * p * (pf / 100), cvu = p * (1 - pf / 100) * 0.6;
  const mdcu = p - cvu;
  const mdc = mdcu * xv;
  const pr  = mdc - cft;
  if (pr <= 0) {
    document.getElementById('lo-results').innerHTML = '<div class="result-row"><span class="lbl">Situazione in perdita</span><span class="val bad">PR ≤ 0</span></div>';
    return;
  }
  const L = mdc / pr;
  const ms = 1 / L * 100;
  const xp = cft / mdcu;
  const dpr = L * dr;

  document.getElementById('lo-results').innerHTML = `
    <div class="result-row"><span class="lbl">Grado Leva Operativa L(X)</span><span class="val">${L.toFixed(2)}x</span></div>
    <div class="result-row"><span class="lbl">Margine di Sicurezza MS(X)</span><span class="val">${ms.toFixed(1)}%</span></div>
    <div class="result-row"><span class="lbl">Volume di Pareggio Xp</span><span class="val">${xp.toFixed(0)} unità</span></div>
    <div class="result-divider"></div>
    <div class="result-row"><span class="lbl">Con variazione ricavi ${dr >= 0 ? '+' : ''}${dr}%:</span><span class="val ${dpr >= 0 ? 'good' : 'bad'}">${dpr >= 0 ? '+' : ''}${dpr.toFixed(1)}% profitto</span></div>
    <div style="margin-top:8px;font-size:11px;color:var(--text3);">L(X) = MDC/PR = 1/MS(X). Struttura costi: ${pf}% fissi → leva ${L > 3 ? 'alta (rischio!)' : L > 1.5 ? 'media' : 'bassa'}</div>`;

  drawLOChart(p, cvu, cft, xv, xp, L);
}

function drawLOChart(p, cvu, cft, x, xp, L) {
  const canvas = document.getElementById('loChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const pad = {l:50, r:20, t:30, b:40};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  const mdcu = p - cvu;
  const xMax = Math.max(xp * 2.5, x * 1.4);
  const prMin = mdcu * 0 - cft;
  const prMax = mdcu * xMax - cft;
  const vRange = prMax - prMin;

  function sx(v) { return pad.l + (v / xMax) * gW; }
  function sy(v) { return pad.t + (1 - (v - prMin) / vRange) * gH; }

  // Grid
  ctx.strokeStyle = '#dce8f5'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, sy(0)); ctx.lineTo(pad.l + gW, sy(0)); ctx.strokeStyle = '#1e3a6e'; ctx.lineWidth = 1; ctx.stroke();

  ctx.strokeStyle = '#c0cfe0'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH); ctx.stroke();

  // Profit line
  ctx.strokeStyle = '#1a6fa8'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(-cft)); ctx.lineTo(sx(xMax), sy(mdcu * xMax - cft)); ctx.stroke();

  // Break-even
  ctx.strokeStyle = '#1e3a6e'; ctx.lineWidth = 1; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(sx(xp), pad.t); ctx.lineTo(sx(xp), pad.t + gH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#1e3a6e'; ctx.font = '10px Gill Sans';
  ctx.fillText('Xp', sx(xp) + 3, pad.t + 14);

  // Current X
  const pr = mdcu * x - cft;
  ctx.fillStyle = pr >= 0 ? '#1a7a4a' : '#c0392b';
  ctx.beginPath(); ctx.arc(sx(x), sy(pr), 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1e3a6e'; ctx.font = '10px Gill Sans';
  ctx.fillText('X=' + x, sx(x) + 8, sy(pr));

  // -CFT label
  ctx.fillStyle = '#c0392b'; ctx.font = '10px Gill Sans';
  ctx.fillText('-CFT', pad.l - 45, sy(-cft) + 3);

  // Profit/Loss zones
  const yZero = sy(0);
  ctx.fillStyle = 'rgba(26,122,74,0.06)';
  ctx.fillRect(pad.l, pad.t, gW, yZero - pad.t);
  ctx.fillStyle = 'rgba(192,57,43,0.06)';
  ctx.fillRect(pad.l, yZero, gW, pad.t + gH - yZero);

  ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans';
  [0, Math.round(xMax/4), Math.round(xMax/2), Math.round(xMax)].forEach(v => {
    ctx.fillText(v, sx(v) - 5, pad.t + gH + 18);
  });
  ctx.fillText('Volume', pad.l + gW/2 - 20, pad.t + gH + 32);
  ctx.fillStyle = '#1a6fa8'; ctx.font = 'bold 11px Gill Sans';
  ctx.fillText('Reddito Volume (Profitto)', pad.l + 5, pad.t + 14);
}

// ====================================================
// MULTI-PRODUCT
// ====================================================
function calcMulti() {
  const p1p = parseFloat(document.getElementById('mp-p1p').value) || 80;
  const p1c = parseFloat(document.getElementById('mp-p1c').value) || 45;
  const p1m = parseFloat(document.getElementById('mp-p1m').value) || 60;
  const p2p = parseFloat(document.getElementById('mp-p2p').value) || 250;
  const p2c = parseFloat(document.getElementById('mp-p2c').value) || 120;
  const cft = parseFloat(document.getElementById('mp-cft').value) || 20000;
  const p2m = 100 - p1m;

  document.getElementById('mp-cft-val').textContent = '€ ' + cft.toLocaleString();
  document.getElementById('mp-p2m-td').textContent = p2m + '%';

  const mdcu1 = p1p - p1c, mdcu2 = p2p - p2c;
  const mdcumix = (p1m/100) * mdcu1 + (p2m/100) * mdcu2;
  const xp = mdcumix > 0 ? cft / mdcumix : null;
  const rt_p1 = xp ? xp * (p1m/100) * p1p : null;
  const rt_p2 = xp ? xp * (p2m/100) * p2p : null;

  document.getElementById('multi-results').innerHTML = `
    <div class="result-row"><span class="lbl">MDC unitario P1</span><span class="val ${mdcu1>=0?'good':'bad'}">€ ${mdcu1.toFixed(2)}</span></div>
    <div class="result-row"><span class="lbl">MDC unitario P2</span><span class="val ${mdcu2>=0?'good':'bad'}">€ ${mdcu2.toFixed(2)}</span></div>
    <div class="result-row"><span class="lbl">MDC unitario del Mix</span><span class="val">€ ${mdcumix.toFixed(2)}</span></div>
    <div class="result-divider"></div>
    <div class="result-row"><span class="lbl">Volume di Pareggio Mix</span><span class="val">${xp ? xp.toFixed(0) + ' unità' : 'N/D'}</span></div>
    <div class="result-row"><span class="lbl">di cui P1 (${p1m}%)</span><span class="val">${xp ? Math.round(xp * p1m/100) + ' unità' : 'N/D'}</span></div>
    <div class="result-row"><span class="lbl">di cui P2 (${p2m}%)</span><span class="val">${xp ? Math.round(xp * p2m/100) + ' unità' : 'N/D'}</span></div>`;
}

// ====================================================
// KRALJIC INTERACTIVE
// ====================================================
const kraljicData = {
  strat: {
    title: '🔑 Prodotti Strategici',
    color: 'var(--red)',
    desc: 'Alta importanza strategica + mercato di fornitura difficile.',
    strategy: 'Partnership di lungo termine. Single o dual sourcing. Co-design. Investimenti relazionali specifici. Contratti quadro con garanzie di volumi. Vendor development.',
    examples: 'Tessuto jacquard su misura, filato Nm speciale, stampi esclusivi, tecnologie di finishing proprietarie.',
    tools: 'Early Supplier Involvement, VMI, Colocation, Contratti revenue-sharing',
    risk: 'Alto rischio supply: monitorare continuamente le prestazioni del fornitore.'
  },
  collo: {
    title: '⚠️ Collo di Bottiglia',
    color: 'var(--amber)',
    desc: 'Bassa importanza strategica + mercato difficile (pochi/unici fornitori).',
    strategy: 'Scorte di sicurezza elevate. Contratti con garanzie di fornitura. Dual sourcing se possibile. Sviluppo fornitori alternativi nel lungo periodo.',
    examples: 'Cashmere (monopolio geografico), coloranti specifici, elastici speciali, zip YKK particolari.',
    tools: 'Risk hedging, scorte di buffer, backup supplier',
    risk: 'Rischio di stock-out critico anche se il valore unitario è basso.'
  },
  leva: {
    title: '💪 Prodotti Leva',
    color: 'var(--gold)',
    desc: 'Alta importanza strategica + mercato di fornitura facile.',
    strategy: 'Massimizzare il potere contrattuale. Multiple sourcing. Aste al ribasso. Contratti a breve termine. E-sourcing. Pressione sui prezzi.',
    examples: 'Tessuti jersey standard, bottoni commodity, imbottiture, fermagli standard, filo comune.',
    tools: 'Aste inverse elettroniche, e-procurement, spot buying, benchmark continuo',
    risk: 'Attenzione a non danneggiare relazioni strategiche future per risparmi marginali.'
  },
  non: {
    title: '📦 Non Critico',
    color: 'var(--teal)',
    desc: 'Bassa importanza strategica + mercato di fornitura facile.',
    strategy: 'Automazione e standardizzazione del processo di acquisto. E-procurement con catalogi. Aggregazione fabbisogni. Riduzione numero fornitori. Ridurre il costo del processo.',
    examples: 'Cancelleria, MRO generico, prodotti pulizia, attrezzatura ufficio, forniture IT generiche.',
    tools: 'E-procurement, cataloghi online, P-Card, contratti quadro aperti',
    risk: 'Rischio "maverick buying" — gestire con sistemi informativi e politiche chiare.'
  }
};

function selectKraljic(quad) {
  document.querySelectorAll('.matrix-cell').forEach(c => c.classList.remove('selected'));
  document.getElementById('kq-' + quad).classList.add('selected');
  const d = kraljicData[quad];
  document.getElementById('kraljic-detail').innerHTML = `
    <div class="card-title" style="color:${d.color}">${d.title}</div>
    <p>${d.desc}</p>
    <div class="theory-block" style="border-left-color:${d.color}; margin-top:8px;">
      <h4 style="color:${d.color}">Strategia Raccomandata</h4>
      <p>${d.strategy}</p>
    </div>
    <div style="margin-top:10px;">
      <div class="card-sub">Esempi Settore Moda-Tessile</div>
      <p style="margin-top:4px;">${d.examples}</p>
    </div>
    <div style="margin-top:8px;">
      <div class="card-sub">Strumenti</div>
      <p style="margin-top:4px;">${d.tools}</p>
    </div>
    <div style="margin-top:8px;padding:8px;background:rgba(231,111,81,0.08);border-radius:4px;font-size:11px;color:var(--amber);">
      ⚠️ ${d.risk}
    </div>`;
}

function classifyKraljic() {
  const imp  = parseInt(document.getElementById('kq-imp').value);
  const diff = parseInt(document.getElementById('kq-diff').value);
  document.getElementById('kq-imp-val').textContent  = imp;
  document.getElementById('kq-diff-val').textContent = diff;

  let quad, color, name;
  if (imp >= 5 && diff >= 5) { quad = 'STRATEGICO'; color = 'var(--red)'; name = 'Partnership, single sourcing, co-design'; }
  else if (imp < 5 && diff >= 5) { quad = 'COLLO DI BOTTIGLIA'; color = 'var(--amber)'; name = 'Scorte sicurezza, dual sourcing, contratti garanzia'; }
  else if (imp >= 5 && diff < 5) { quad = 'LEVA'; color = 'var(--gold)'; name = 'Multiple sourcing, aste, pressione prezzi'; }
  else { quad = 'NON CRITICO'; color = 'var(--teal)'; name = 'E-procurement, catalogo, aggregazione fabbisogni'; }

  document.getElementById('kq-class-result').innerHTML = `
    <div class="result-row"><span class="lbl">Quadrante</span><span class="val" style="color:${color}">${quad}</span></div>
    <div class="result-row"><span class="lbl">Strategia</span></div>
    <div style="font-size:12px;color:var(--text2);margin-top:4px;">${name}</div>`;
}

// ====================================================
// VENDOR RATING
// ====================================================
function classifyVendor() {
  const attr  = parseInt(document.getElementById('vr-attr').value);
  const forza = parseInt(document.getElementById('vr-forza').value);
  document.getElementById('vr-attr-val').textContent  = attr;
  document.getElementById('vr-forza-val').textContent = forza;

  let strategy, color, action;
  if (attr >= 5 && forza >= 5) {
    strategy = 'PARTNERSHIP STRATEGICA'; color = 'var(--green)';
    action = 'Investire in collaborazione e innovazione congiunta. Integrare i processi. Relazione di lungo periodo.';
  } else if (attr >= 5 && forza < 5) {
    strategy = 'SVILUPPO RELAZIONE'; color = 'var(--gold)';
    action = 'Rafforzare il rapporto. Aumentare interazioni e fiducia. Investimenti relazionali selettivi.';
  } else if (attr < 5 && forza >= 5) {
    strategy = 'RAZIONALIZZAZIONE'; color = 'var(--amber)';
    action = 'Valutare riduzione dipendenza. Migliorare efficienza o rinegoziare. Evitare over-investment.';
  } else {
    strategy = 'DISIMPEGNO / SOSTITUZIONE'; color = 'var(--red)';
    action = 'Minimizzare investimenti relazionali. Standardizzare. Cercare fornitori alternativi.';
  }

  document.getElementById('vr-result').innerHTML = `
    <div class="result-row"><span class="lbl">Strategia Suggerita</span><span class="val" style="color:${color}">${strategy}</span></div>
    <div style="font-size:12px;color:var(--text2);margin-top:6px;">${action}</div>`;
}

// ====================================================
// SC STRATEGY SELECTOR
// ====================================================
function selectSCStrategy() {
  const vd = parseInt(document.getElementById('sc-vd').value);
  const ip = parseInt(document.getElementById('sc-ip').value);
  document.getElementById('sc-vd-val').textContent = vd;
  document.getElementById('sc-ip-val').textContent = ip;

  let strategy, color, desc, example;
  if (vd < 5 && ip < 5) {
    strategy = 'LEAN'; color = 'var(--teal)';
    desc = 'Domanda stabile, processi maturi. Massimizzare efficienza. Eliminazione waste, economie di scala, automazione informatica.';
    example = 'Alimentari industria, abbigliamento base (basic tees, uniformi), produzione conto terzi standardizzata.';
  } else if (vd >= 5 && ip < 5) {
    strategy = 'RESPONSIVE'; color = 'var(--gold)';
    desc = 'Alta variabilità domanda, processi stabili. Build-to-order, mass customization. Time-to-market critico.';
    example = 'Abbigliamento moda stagionale (Prato → showroom), computer, musica, abbigliamento firmato.';
  } else if (vd < 5 && ip >= 5) {
    strategy = 'RISK HEDGING'; color = 'var(--amber)';
    desc = 'Domanda relativamente stabile ma processi/fornitura instabili. Backup sistematici, condivisione risorse di capacità.';
    example = 'Petrolio, energia idroelettrica, prodotti agricoli, materie prime con volatilità supply.';
  } else {
    strategy = 'AGILE'; color = 'var(--red)';
    desc = 'Alta variabilità domanda + processi instabili. Reattività massima + gestione rischio. La sfida più complessa.';
    example = 'TLC, semiconduttori, computer professionali, moda lusso avanguardia con nuove tecnologie di produzione.';
  }

  document.getElementById('sc-strategy-result').innerHTML = `
    <div class="result-row"><span class="lbl">Strategia Ottimale</span><span class="val" style="color:${color};font-size:16px;">${strategy}</span></div>
    <div style="font-size:12px;color:var(--text2);margin-top:6px;">${desc}</div>
    <div style="font-size:11px;color:var(--text3);margin-top:6px;">Es: ${example}</div>`;
}

// ====================================================
// PUSH PULL CHART
// ====================================================
function drawPushPull() {
  const dp = parseFloat(document.getElementById('pp-dp').value);
  document.getElementById('pp-dp-val').textContent = Math.round(dp) + '%';

  const canvas = document.getElementById('ppChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const pushW = (dp / 100) * W;
  const y0 = 20, h = 50, y1 = y0 + h;

  // Push zone
  ctx.fillStyle = 'rgba(42,157,143,0.2)';
  ctx.fillRect(0, y0, pushW, h);
  ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 2;
  ctx.strokeRect(0, y0, pushW, h);
  ctx.fillStyle = '#2a9d8f'; ctx.font = 'bold 11px Gill Sans';
  ctx.textAlign = 'center';
  if (pushW > 50) ctx.fillText('PUSH', pushW / 2, y0 + h/2 + 4);

  // Pull zone
  ctx.fillStyle = 'rgba(244,162,97,0.2)';
  ctx.fillRect(pushW, y0, W - pushW, h);
  ctx.strokeStyle = '#f4a261'; ctx.lineWidth = 2;
  ctx.strokeRect(pushW, y0, W - pushW, h);
  ctx.fillStyle = '#f4a261';
  if (W - pushW > 50) ctx.fillText('PULL', pushW + (W - pushW) / 2, y0 + h/2 + 4);

  // Decoupling point marker
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(pushW - 2, y0 - 5, 4, h + 10);
  ctx.font = '10px Gill Sans'; ctx.textAlign = 'center';
  ctx.fillText('Decoupling', pushW, y0 - 8);

  // Labels below
  ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans'; ctx.textAlign = 'left';
  ctx.fillText('Fornitori', 4, H - 5);
  ctx.textAlign = 'right';
  ctx.fillText('Clienti', W - 4, H - 5);

  // Mode description
  let mode, color;
  if (dp < 20) { mode = 'Pull totale — Build to order puro (es. sartoria su misura)'; color = '#f4a261'; }
  else if (dp < 40) { mode = 'Prevalentemente Pull — Assemblaggio su ordine (ATO)'; color = '#f4a261'; }
  else if (dp < 60) { mode = 'Bilanciato — Postponement ottimale (es. vernici, Dell)'; color = '#e9c46a'; }
  else if (dp < 80) { mode = 'Prevalentemente Push — Produzione su previsione, stock base'; color = '#2a9d8f'; }
  else { mode = 'Push totale — Make to Stock puro (es. commodity)'; color = '#2a9d8f'; }

  document.getElementById('pp-result').innerHTML = `
    <div class="result-row"><span class="lbl" style="color:${color};">${mode}</span></div>
    <div class="result-row"><span class="lbl">Rischio sovrascorta</span><span class="val ${dp > 60 ? 'bad' : dp > 40 ? 'warn' : 'good'}">${dp > 60 ? 'Alto' : dp > 40 ? 'Medio' : 'Basso'}</span></div>
    <div class="result-row"><span class="lbl">Reattività al mercato</span><span class="val ${dp < 40 ? 'good' : dp < 60 ? 'warn' : 'bad'}">${dp < 40 ? 'Alta' : dp < 60 ? 'Media' : 'Bassa'}</span></div>`;
}

// ====================================================
// BULLWHIP CHART
// ====================================================
function drawBullwhip() {
  const cv  = parseFloat(document.getElementById('bw-cv').value) / 100;
  const amp = parseFloat(document.getElementById('bw-amp').value);
  document.getElementById('bw-cv-val').textContent  = Math.round(cv * 100) + '%';
  document.getElementById('bw-amp-val').textContent = amp.toFixed(1) + 'x';

  const canvas = document.getElementById('bullwhipChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const N = 50;
  const base = 100;
  const stages = [
    { label: 'Clienti Finali', color: '#2a9d8f', ampFactor: 1 },
    { label: 'Dettagliante',   color: '#52b788', ampFactor: amp },
    { label: 'Distributore',  color: '#e9c46a', ampFactor: amp * amp },
    { label: 'Produttore',    color: '#f4a261', ampFactor: amp * amp * amp },
  ];

  const pad = {l:10, r:80, t:20, b:30};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  const stH = gH / stages.length;

  stages.forEach((stage, si) => {
    const y0 = pad.t + si * stH;
    const ymid = y0 + stH / 2;
    const amplitude = base * cv * stage.ampFactor;
    const maxAmp = base * cv * stages[stages.length-1].ampFactor;
    const scale = stH * 0.4 / maxAmp;

    ctx.strokeStyle = stage.color; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const wave = Math.sin(t * Math.PI * 4) * amplitude + Math.sin(t * Math.PI * 7 + si * 0.5) * amplitude * 0.3;
      const x = pad.l + t * gW;
      const y = ymid - wave * scale;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Center line
    ctx.strokeStyle = stage.color; ctx.lineWidth = 0.5; ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.moveTo(pad.l, ymid); ctx.lineTo(pad.l + gW, ymid); ctx.stroke();
    ctx.setLineDash([]);

    // CV label
    ctx.fillStyle = stage.color; ctx.font = '9px Gill Sans'; ctx.textAlign = 'left';
    ctx.fillText(stage.label, pad.l + gW + 4, ymid - 8);
    ctx.fillStyle = '#607080'; ctx.font = '8px Gill Sans';
    ctx.fillText('CV≈' + (cv * stage.ampFactor * 100).toFixed(0) + '%', pad.l + gW + 4, ymid + 10);
  });

  // Arrow showing amplification direction
  ctx.fillStyle = '#e76f51'; ctx.font = 'bold 10px Gill Sans'; ctx.textAlign = 'center';
  ctx.fillText('↑ Amplificazione', pad.l + gW / 2, pad.t + 10);
}

// ====================================================
// REVENUE SHARING CALC
// ====================================================
function calcRevenueShare() {
  const price = parseFloat(document.getElementById('rs-price').value) || 9;
  const rent  = parseFloat(document.getElementById('rs-rent').value) || 3;
  const split = parseFloat(document.getElementById('rs-split').value) || 50;
  document.getElementById('rs-split-val').textContent = split + '%';

  const custShare = rent * (split / 100);
  const supplierShare = rent * (1 - split / 100);
  const bepCust = price / custShare;
  const bepFull = price / rent;

  document.getElementById('rs-result').innerHTML = `
    <div class="result-row"><span class="lbl">Ricavi per noleggio al cliente</span><span class="val">€ ${custShare.toFixed(2)}</span></div>
    <div class="result-row"><span class="lbl">Royalty al fornitore</span><span class="val">€ ${supplierShare.toFixed(2)}</span></div>
    <div class="result-divider"></div>
    <div class="result-row"><span class="lbl">Break-even noleggi (rev. sharing)</span><span class="val good">${bepCust.toFixed(1)} noleggi</span></div>
    <div class="result-row"><span class="lbl">Break-even senza condivisione</span><span class="val bad">${bepFull.toFixed(1)} noleggi</span></div>
    <div style="margin-top:6px;font-size:11px;color:var(--text3)">Riduzione break-even del ${Math.round((bepFull-bepCust)/bepFull*100)}% → incentivo a tenere più scorte → ↑ livello di servizio</div>`;
}

// ====================================================
// WHAT-IF CHART
// ====================================================
function calcWhatIf() {
  const p   = parseFloat(document.getElementById('wi-p').value)   || 150;
  const cvu = parseFloat(document.getElementById('wi-cvu').value) || 80;
  const cft = parseFloat(document.getElementById('wi-cft').value) || 5000;
  const x   = parseFloat(document.getElementById('wi-x').value)   || 120;

  const mdcu = p - cvu;
  const xp   = mdcu > 0 ? cft / mdcu : null;
  const pr   = mdcu * x - cft;
  const ms   = (xp && x > xp) ? (x - xp) / x * 100 : null;
  const L    = (pr > 0) ? (mdcu * x / pr) : null;

  document.getElementById('wi-results').innerHTML = `
    <div class="result-row"><span class="lbl">MDC Unitario</span><span class="val ${mdcu >= 0 ? 'good' : 'bad'}">€ ${mdcu.toFixed(2)}</span></div>
    <div class="result-row"><span class="lbl">Volume di Pareggio</span><span class="val">${xp ? xp.toFixed(1) + ' unità' : 'N/D'}</span></div>
    <div class="result-row"><span class="lbl">Profitto @ ${x} unità</span><span class="val ${pr >= 0 ? 'good' : 'bad'}">€ ${pr.toLocaleString('it-IT', {maximumFractionDigits:0})}</span></div>
    <div class="result-row"><span class="lbl">Margine di Sicurezza</span><span class="val ${ms && ms > 0 ? 'good' : 'bad'}">${ms ? ms.toFixed(1) + '%' : 'Perdita'}</span></div>
    <div class="result-row"><span class="lbl">Grado Leva Operativa</span><span class="val">${L ? L.toFixed(2) + 'x' : 'N/D'}</span></div>`;

  const canvas = document.getElementById('wiChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const pad = {l:50, r:20, t:20, b:40};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  const xMax = xp ? Math.max(xp * 2.5, x * 1.5) : x * 2;
  const maxV = Math.max(p * xMax, cft + cvu * xMax) * 1.05;

  function sx(v) { return pad.l + (v / xMax) * gW; }
  function sy(v) { return pad.t + (1 - v / maxV) * gH; }

  ctx.strokeStyle = '#c0cfe0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + gH); ctx.lineTo(pad.l + gW, pad.t + gH); ctx.stroke();

  // CT
  ctx.strokeStyle = '#e76f51'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(cft)); ctx.lineTo(sx(xMax), sy(cft + cvu * xMax)); ctx.stroke();
  // RT
  ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(0)); ctx.lineTo(sx(xMax), sy(p * xMax)); ctx.stroke();
  // BEP
  if (xp) {
    ctx.strokeStyle = '#e9c46a'; ctx.setLineDash([4,3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx(xp), pad.t); ctx.lineTo(sx(xp), pad.t + gH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#e9c46a'; ctx.font = '9px Gill Sans'; ctx.textAlign = 'center';
    ctx.fillText('Xp=' + xp.toFixed(0), sx(xp), pad.t + 14);
  }
  // X marker
  ctx.fillStyle = pr >= 0 ? '#52b788' : '#e76f51';
  ctx.beginPath(); ctx.arc(sx(x), sy(p * x), 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans'; ctx.textAlign = 'left';
  [0, Math.round(xMax/3), Math.round(xMax*2/3), Math.round(xMax)].forEach(v => {
    ctx.fillText(v, sx(v) - 8, pad.t + gH + 14);
  });
  ctx.fillStyle = '#2a9d8f'; ctx.fillText('RT', sx(xMax * 0.8), sy(p * xMax * 0.8) - 5);
  ctx.fillStyle = '#e76f51'; ctx.fillText('CT', sx(xMax * 0.8), sy(cft + cvu * xMax * 0.8) + 12);
}

// ====================================================
// KRALJIC PORTFOLIO CHART
// ====================================================
let kpItems = [];

function addKraljicItem() {
  const name = document.getElementById('kp-name').value.trim();
  const imp  = parseFloat(document.getElementById('kp-imp').value);
  const diff = parseFloat(document.getElementById('kp-diff').value);
  if (!name || !imp || !diff) return;
  if (imp < 1 || imp > 10 || diff < 1 || diff > 10) return;
  kpItems.push({ name, imp, diff });
  document.getElementById('kp-name').value = '';
  document.getElementById('kp-imp').value  = '';
  document.getElementById('kp-diff').value = '';
  drawKPChart();
  renderKPList();
}

function renderKPList() {
  const list = document.getElementById('kp-list');
  if (!list) return;
  list.innerHTML = kpItems.map((it, i) => `
    <div class="kp-list-item">
      <span class="kp-list-name">${it.name}</span>
      <span class="kp-list-meta">Imp:${it.imp} Diff:${it.diff}</span>
      <button type="button" class="kp-remove" data-index="${i}" aria-label="Rimuovi ${it.name}">✕</button>
    </div>`).join('');

  list.querySelectorAll('.kp-remove').forEach(button => {
    button.addEventListener('click', () => {
      kpItems.splice(Number(button.dataset.index), 1);
      drawKPChart();
      renderKPList();
    });
  });
}

function drawKPChart() {
  const canvas = document.getElementById('kpChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const pad = {l:30, r:20, t:20, b:30};
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;

  // Grid lines
  ctx.strokeStyle = '#c0cfe0'; ctx.lineWidth = 1;
  ctx.strokeRect(pad.l, pad.t, gW, gH);
  ctx.beginPath(); ctx.moveTo(pad.l + gW/2, pad.t); ctx.lineTo(pad.l + gW/2, pad.t + gH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t + gH/2); ctx.lineTo(pad.l + gW, pad.t + gH/2); ctx.stroke();

  // Quadrant backgrounds
  const quadColors = [
    {x:0, y:0, c:'rgba(231,111,81,0.08)'},    // top-left (high imp, low diff) = leva
    {x:gW/2, y:0, c:'rgba(231,111,81,0.14)'},  // top-right = strat
    {x:0, y:gH/2, c:'rgba(42,157,143,0.08)'}, // bot-left = non crit
    {x:gW/2, y:gH/2, c:'rgba(244,162,97,0.08)'} // bot-right = collo
  ];
  quadColors.forEach(q => {
    ctx.fillStyle = q.c;
    ctx.fillRect(pad.l + q.x, pad.t + q.y, gW/2, gH/2);
  });

  // Labels
  ctx.fillStyle = '#6688aa'; ctx.font = '9px Gill Sans'; ctx.textAlign = 'center';
  ctx.fillText('Difficoltà Mercato →', pad.l + gW/2, pad.t + gH + 20);
  ctx.save(); ctx.translate(14, pad.t + gH/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('← Importanza Strategica', 0, 0); ctx.restore();

  // Quadrant labels
  ctx.font = '8px Gill Sans';
  ctx.fillStyle = '#b05c00'; ctx.fillText('LEVA', pad.l + gW/4, pad.t + 12);
  ctx.fillStyle = '#c0392b'; ctx.fillText('STRATEGICO', pad.l + gW * 3/4, pad.t + 12);
  ctx.fillStyle = '#1a6fa8'; ctx.fillText('NON CRITICO', pad.l + gW/4, pad.t + gH - 6);
  ctx.fillStyle = '#b05c00'; ctx.fillText('COLLO BOTT.', pad.l + gW * 3/4, pad.t + gH - 6);

  // Points
  const colors = ['#2a9d8f','#e9c46a','#f4a261','#e76f51','#52b788','#9b5de5','#f15bb5','#00bbf9'];
  kpItems.forEach((it, i) => {
    const x = pad.l + (it.diff / 10) * gW;
    const y = pad.t + (1 - it.imp / 10) * gH;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 8px Gill Sans'; ctx.textAlign = 'center';
    ctx.fillText(i + 1, x, y + 3);
    ctx.fillStyle = colors[i % colors.length]; ctx.font = '8px Gill Sans';
    const labelX = x > pad.l + gW * 0.75 ? x - 4 : x + 10;
    ctx.textAlign = x > pad.l + gW * 0.75 ? 'right' : 'left';
    ctx.fillText(it.name, labelX, y - 8);
  });
}

// ====================================================
// STRATEGIC PLANNER
// ====================================================
const planDB = {
  base: {
    stabil: { strat: 'LEAN', sc: 'Supply chain efficiente (lean)', mob: 'Multiple sourcing', collab: 'Visibilità informazioni' },
    crescita: { strat: 'LEAN + RESPONSIVE', sc: 'Lean a monte, Responsive a valle', mob: 'Parallel sourcing', collab: 'EDI con fornitori chiave' },
    turbolento: { strat: 'RESPONSIVE', sc: 'Build-to-order, fast replenishment', mob: 'Dual/Multiple sourcing flessibile', collab: 'VMI con grandi fornitori tessuto' },
    crisi: { strat: 'RISK HEDGING', sc: 'Scorte di buffer, dual sourcing', mob: 'Dual sourcing + stock componenti critici', collab: 'Contratti quadro con garanzie volume' }
  },
  fashion: {
    stabil: { strat: 'RESPONSIVE', sc: 'Reattiva, TtM breve', mob: 'Single/Dual sourcing per lead tessuto', collab: 'Co-design con terzisti chiave' },
    crescita: { strat: 'RESPONSIVE + AGILE', sc: 'Fast fashion, mass customization', mob: 'Parallel sourcing, local + nearshore', collab: 'CPFR con distributori' },
    turbolento: { strat: 'AGILE', sc: 'Maximum agility, postponement', mob: 'Multiple sourcing con buffer', collab: 'Full integration + information sharing' },
    crisi: { strat: 'RISK HEDGING + RESPONSIVE', sc: 'Near-reshoring, buffer stocks', mob: 'Local sourcing prioritario', collab: 'Vendor development locale (Prato)' }
  },
  lusso: {
    stabil: { strat: 'RESPONSIVE', sc: 'Build-to-order artigianale', mob: 'Single sourcing strategico', collab: 'Partnership profonda, co-design' },
    crescita: { strat: 'RESPONSIVE', sc: 'Espansione controllata, qualità prioritaria', mob: 'Dual sourcing con sviluppo fornitori', collab: 'Joint function development' },
    turbolento: { strat: 'RESPONSIVE', sc: 'Brand protection + flessibilità', mob: 'Integrazione verticale parziale core', collab: 'Contratti quadro blindati' },
    crisi: { strat: 'RISK HEDGING', sc: 'Integrazione verticale core, outsource non core', mob: 'Insourcing selettivo + dual sourcing', collab: 'Capacity options con fornitori critici' }
  },
  tecnico: {
    stabil: { strat: 'LEAN + RISK HEDGING', sc: 'Efficienza + backup certifications', mob: 'Dual sourcing certificato', collab: 'Collaborazione normativa, R&D congiunto' },
    crescita: { strat: 'RISK HEDGING + RESPONSIVE', sc: 'Scala + certificazioni + reattività', mob: 'Parallel sourcing con standard', collab: 'ESI — Early Supplier Involvement' },
    turbolento: { strat: 'AGILE', sc: 'Rapid prototyping supply chain', mob: 'Agile sourcing + open innovation', collab: 'Co-design + collaborazione operativa' },
    crisi: { strat: 'RISK HEDGING', sc: 'Reshoring + Nearshoring per certif.', mob: 'Local sourcing certificato', collab: 'Contratti buy-back + capacity option' }
  }
};

function generatePlan() {
  const prod = document.getElementById('plan-prod').value;
  const size = document.getElementById('plan-size').value;
  const mkt  = document.getElementById('plan-mkt').value;

  const plan = planDB[prod] ? planDB[prod][mkt] : planDB.base[mkt];
  const output = document.getElementById('plan-output');

  const prodLabel = document.getElementById('plan-prod').options[document.getElementById('plan-prod').selectedIndex].text;
  const sizeLabel = document.getElementById('plan-size').options[document.getElementById('plan-size').selectedIndex].text;
  const mktLabel  = document.getElementById('plan-mkt').options[document.getElementById('plan-mkt').selectedIndex].text;

  output.innerHTML = `
    <div class="card-title">Piano Strategico Generato</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <span class="badge teal">${prodLabel.split('(')[0].trim()}</span>
      <span class="badge amber">${sizeLabel.split('(')[0].trim()}</span>
      <span class="badge gold">${mktLabel.split('(')[0].trim()}</span>
    </div>
    <div class="theory-block">
      <h4>Strategia SC Raccomandata</h4>
      <p style="font-size:14px;color:var(--teal);">${plan.strat}</p>
    </div>
    <div class="theory-block amber" style="margin-top:8px;">
      <h4>Configurazione Supply Chain</h4>
      <p>${plan.sc}</p>
    </div>
    <div class="theory-block green" style="margin-top:8px;">
      <h4>Strategia Make or Buy</h4>
      <p>${plan.mob}</p>
    </div>
    <div class="theory-block" style="margin-top:8px;">
      <h4>Livello di Collaborazione</h4>
      <p>${plan.collab}</p>
    </div>`;

  document.getElementById('plan-details').style.display = 'block';

  const sizeReco = {
    micro: { kraljic: 'Collo di Bottiglia → Near Bottleneck per filati speciali; Non critico per tutto il resto', leva: 'Dipendenza dal committente (make on demand) — TRC elevatissimo', negoziazione: 'Posizione debole — collaborazione vs competizione' },
    piccola: { kraljic: 'Mix: prodotti leva (tessuti base), qualche strategico (know-how esclusivo)', leva: 'Variabilizzare costi tramite terzisti per la parte volatile', negoziazione: 'Aggregazione volumi con altri organizzatori (es. consorzio Prato)' },
    media: { kraljic: 'Matrice completa applicabile. Presidio dei prodotti strategici', leva: 'Leverage su acquisti possibile, KPI acquisti su fatturato', negoziazione: 'Posizione negoziabile — single sourcing su strategici, multiple su leva' },
    grande: { kraljic: 'Full Kraljic. Strategic sourcing. Vendor development attivo', leva: 'Effetto leva acquisti molto rilevante. ROI sensitivity alta', negoziazione: 'Potere contrattuale elevato — dual/parallel sourcing ottimale' }
  };

  const r = sizeReco[size];
  document.getElementById('plan-detail-grid').innerHTML = `
    <div class="card card-accent">
      <div class="card-title">📊 Portafoglio Acquisti</div>
      <p>${r.kraljic}</p>
    </div>
    <div class="card card-gold">
      <div class="card-title">💰 Gestione Costi</div>
      <p>${r.leva}</p>
    </div>
    <div class="card card-amber">
      <div class="card-title">🤝 Negoziazione</div>
      <p>${r.negoziazione}</p>
    </div>`;
}

// ====================================================
// INIT
// ====================================================

function bindInput(ids, handler) {
  ids.forEach(id => document.getElementById(id)?.addEventListener('input', handler));
}

function bindChange(ids, handler) {
  ids.forEach(id => document.getElementById(id)?.addEventListener('change', handler));
}

function updatePlan() {
  const details = document.getElementById('plan-details');
  if (!details || details.style.display !== 'none') generatePlan();
}

function bindAppEvents() {
  document.querySelectorAll('[data-section-target]').forEach(element => {
    element.addEventListener('click', () => showSection(element.dataset.sectionTarget));
  });

  document.querySelectorAll('[data-subtab-target]').forEach(tab => {
    tab.addEventListener('click', () => showSubTab(tab.dataset.subtabGroup, tab.dataset.subtabTarget, tab));
  });

  document.querySelectorAll('.accord-item').forEach(item => {
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.addEventListener('click', () => item.classList.toggle('open'));
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  document.querySelectorAll('[data-kraljic]').forEach(cell => {
    cell.addEventListener('click', () => selectKraljic(cell.dataset.kraljic));
  });

  document.querySelector('[data-action="add-kraljic-item"]')?.addEventListener('click', addKraljicItem);
  document.querySelector('[data-action="generate-plan"]')?.addEventListener('click', generatePlan);

  bindInput(['comp-sl', 'spec-sl', 'unc-sl'], updateMoB);
  bindInput(['lv-fat', 'lv-acq', 'lv-alt', 'lv-scr', 'lv-ac', 'lv-af', 'lv-rid', 'lv-aum'], calcLeva);
  bindInput(['cv-cvu', 'cv-cft', 'cv-vol'], drawCostChart);
  bindInput(['bep-p', 'bep-cvu', 'bep-cft', 'bep-x'], calcBEP);
  bindInput(['lo-pf', 'lo-x', 'lo-dr'], calcLO);
  bindInput(['mp-p1p', 'mp-p1c', 'mp-p1m', 'mp-p2p', 'mp-p2c', 'mp-cft'], calcMulti);
  bindInput(['kq-imp', 'kq-diff'], classifyKraljic);
  bindInput(['vr-attr', 'vr-forza'], classifyVendor);
  bindInput(['sc-vd', 'sc-ip'], selectSCStrategy);
  bindInput(['pp-dp'], drawPushPull);
  bindInput(['bw-cv', 'bw-amp'], drawBullwhip);
  bindInput(['rs-price', 'rs-rent', 'rs-split'], calcRevenueShare);
  bindInput(['wi-p', 'wi-cvu', 'wi-cft', 'wi-x'], calcWhatIf);
  bindChange(['plan-prod', 'plan-size', 'plan-mkt'], updatePlan);

  ['kp-name', 'kp-imp', 'kp-diff'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', event => {
      if (event.key === 'Enter') addKraljicItem();
    });
  });
}

function initApp() {
  bindAppEvents();
  updateMoB();
  calcLeva();
  drawCostChart();
  calcBEP();
  calcLO();
  calcMulti();
  classifyKraljic();
  classifyVendor();
  selectSCStrategy();
  drawPushPull();
  drawBullwhip();
  calcRevenueShare();
  calcWhatIf();

  kpItems = [
    {name:'Filato base', imp:7, diff:3},
    {name:'Cashmere', imp:5, diff:9},
    {name:'Jacquard speciale', imp:9, diff:8},
    {name:'Cancelleria', imp:2, diff:2},
  ];
  drawKPChart();
  renderKPList();
}

document.addEventListener('DOMContentLoaded', initApp);

})();
