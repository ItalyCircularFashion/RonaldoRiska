/* Prato 3D — mini mondo low-poly originale ispirato ai portfolio 3D.
   Scena procedurale: distretto tessile, fiume, ponti, fabbriche, telai, car guidabile.
   Nessun asset esterno oltre Three.js CDN. Contenuti/link esistenti preservati. */
import * as THREE from 'three';

const canvas = document.getElementById('prato3dCanvas');
const hudZone = document.getElementById('prato3dZone');
const hudSpeed = document.getElementById('prato3dSpeed');
const fallback = document.getElementById('prato3dFallback');
const statusEl = document.getElementById('prato3dStatus');

if (!canvas) throw new Error('prato3d canvas mancante');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const DPR_CAP = coarse ? 1.5 : 2;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  if (statusEl) statusEl.textContent = 'WebGL non disponibile: esplora le sezioni sotto.';
  if (fallback) fallback.hidden = false;
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.info.autoReset = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d0c);
scene.fog = new THREE.Fog(0x0b0d0c, 95, 280);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
camera.position.set(0, 26, 34);

const hemi = new THREE.HemisphereLight(0xd8e6ff, 0x1a241c, 1.6);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2a8, 2.2);
sun.position.set(38, 55, 22);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -90; sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90; sun.shadow.camera.bottom = -90;
sun.shadow.camera.far = 180;
scene.add(sun);

const MAT = {
  ground: new THREE.MeshStandardMaterial({ color: 0x1b2a1e, roughness: 1 }),
  road: new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 1 }),
  line: new THREE.MeshBasicMaterial({ color: 0xc7a45b }),
  water: new THREE.MeshStandardMaterial({ color: 0x1b5f7a, roughness: 0.35, metalness: 0.1 }),
  factory: new THREE.MeshStandardMaterial({ color: 0x8f7d62, roughness: 0.9, flatShading: true }),
  factory2: new THREE.MeshStandardMaterial({ color: 0x6f7f8a, roughness: 0.9, flatShading: true }),
  roof: new THREE.MeshStandardMaterial({ color: 0x3b3428, roughness: 1, flatShading: true }),
  chimney: new THREE.MeshStandardMaterial({ color: 0xa95848, roughness: 0.8, flatShading: true }),
  wood: new THREE.MeshStandardMaterial({ color: 0x7a5a36, roughness: 1, flatShading: true }),
  thread: new THREE.MeshBasicMaterial({ color: 0xe8cf8f }),
  yarn: new THREE.MeshStandardMaterial({ color: 0xd8c7a0, roughness: 1, flatShading: true }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x2e7d4f, roughness: 1, flatShading: true }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 1, flatShading: true }),
  car: new THREE.MeshStandardMaterial({ color: 0xc7a45b, roughness: 0.45, metalness: 0.2 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x10151f, roughness: 0.2, metalness: 0.4 }),
  tire: new THREE.MeshStandardMaterial({ color: 0x0c0e10, roughness: 1 }),
  light: new THREE.MeshBasicMaterial({ color: 0xffe9a8 }),
};

const world = new THREE.Group();
scene.add(world);
const colliders = [];

function mesh(geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.y = ry;
  m.castShadow = true;
  m.receiveShadow = true;
  world.add(m);
  return m;
}
function box(w, h, d, mat, x, y, z, ry = 0) { return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry); }
function cyl(rt, rb, h, seg, mat, x, y, z) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z); }

function addCollider(x, z, r) { colliders.push({ x, z, r }); }

// Terreno + strade
const ground = mesh(new THREE.PlaneGeometry(240, 170), MAT.ground, 0, 0, 0);
ground.rotation.x = -Math.PI / 2;
ground.castShadow = false;
for (const x of [-60, -20, 20, 60]) { const r = mesh(new THREE.PlaneGeometry(7, 170), MAT.road, x, 0.03, 0); r.rotation.x = -Math.PI / 2; r.castShadow = false; }
for (const z of [-45, 0, 45]) { const r = mesh(new THREE.PlaneGeometry(240, 7), MAT.road, 0, 0.04, z); r.rotation.x = -Math.PI / 2; r.castShadow = false; }
for (let x = -110; x < 115; x += 8) { box(3.2, 0.06, 0.35, MAT.line, x, 0.09, 0); }
for (let z = -80; z < 85; z += 8) { box(0.35, 0.06, 3.2, MAT.line, -20, 0.09, z); }

// Fiume Arno (segmenti sinusoidali) + ponti
for (let i = 0; i < 42; i++) {
  const x = -125 + i * 6.2;
  const z = Math.sin(x * 0.045) * 10 - 58;
  const seg = box(7.2, 0.35, 15, MAT.water, x, 0.12, z, Math.cos(x * 0.045) * 0.35);
  seg.castShadow = false;
}
for (const bx of [-48, 0, 48]) {
  const bz = Math.sin(bx * 0.045) * 10 - 58;
  box(6, 1.1, 22, MAT.factory2, bx, 1.1, bz, Math.cos(bx * 0.045) * 0.3);
  box(1.1, 2.6, 1.1, MAT.factory, bx - 2.2, 0.6, bz - 6);
  box(1.1, 2.6, 1.1, MAT.factory, bx + 2.2, 0.6, bz + 6);
}

// Fabbriche, capannoni e ciminiere
function factory(x, z, w, d, h, mat, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z); g.rotation.y = ry;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true; g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, h * 0.38, d * 1.12), MAT.roof);
  roof.position.y = h + h * 0.14; roof.rotation.z = 0.42; roof.castShadow = true; g.add(roof);
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.05, h * 1.5, 8), MAT.chimney);
  ch.position.set(w * 0.32, h * 1.45, 0); ch.castShadow = true; g.add(ch);
  world.add(g);
  addCollider(x, z, Math.max(w, d) * 0.55);
  return g;
}
factory(-78, 18, 26, 16, 7, MAT.factory, 0.1);
factory(-72, -18, 30, 14, 6, MAT.factory2, -0.08);
factory(72, 24, 24, 15, 7, MAT.factory, -0.12);
factory(78, -22, 28, 13, 5, MAT.factory2, 0.06);
factory(-34, 62, 18, 12, 5, MAT.factory, 0.2);
factory(38, 64, 20, 12, 5, MAT.factory2, -0.15);

// Telai da tessitura animati
const loomThreads = [];
function loom(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 4), MAT.wood); base.position.y = 0.6; base.castShadow = true; g.add(base);
  for (const sx of [-3.8, 3.8]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), MAT.wood); post.position.set(sx, 2.4, -1.7); g.add(post);
    const post2 = post.clone(); post2.position.z = 1.7; g.add(post2);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.5, 0.5), MAT.wood); beam.position.y = 4.5; g.add(beam);
  const pts = [];
  for (let i = 0; i < 11; i++) {
    const tx = -3.6 + i * 0.72;
    pts.push(new THREE.Vector3(tx, 4.15, -1.7), new THREE.Vector3(tx, 1.45, 1.7));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const lines = new THREE.LineSegments(geo, MAT.thread);
  g.add(lines);
  loomThreads.push({ geo, base: pts });
  world.add(g);
  addCollider(x, z, 4.6);
}
loom(-52, 34, 0.25); loom(-44, 34, 0.25); loom(52, 8, -0.3); loom(58, 8, -0.3); loom(10, -34, 0.05);

// Coni di filato e balle
for (let i = 0; i < 26; i++) {
  const x = -90 + Math.random() * 180;
  const z = -70 + Math.random() * 135;
  if (Math.abs(z + 58) < 12) continue;
  if (i % 3 === 0) {
    cyl(0.55, 0.75, 1.6, 8, MAT.yarn, x, 0.8, z);
  } else {
    box(2.2, 1.1, 1.4, MAT.factory2, x, 0.55, z, Math.random());
  }
}
// Alberi
for (let i = 0; i < 34; i++) {
  const x = -105 + Math.random() * 210;
  const z = -75 + Math.random() * 150;
  if (Math.abs(z + 58) < 9) continue;
  cyl(0.22, 0.3, 1.4, 6, MAT.trunk, x, 0.7, z);
  const crown = mesh(new THREE.IcosahedronGeometry(0.9 + Math.random() * 0.7, 0), MAT.leaf, x, 2.1, z);
  crown.castShadow = true;
}

// Auto low-poly guidabile
const car = new THREE.Group();
const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.55, 1.15), MAT.car);
carBody.position.y = 0.55; carBody.castShadow = true; car.add(carBody);
const carTop = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.5, 1.0), MAT.glass);
carTop.position.set(-0.1, 1.05, 0); carTop.castShadow = true; car.add(carTop);
const wheels = [];
for (const [wx, wz] of [[-0.8, -0.62], [0.8, -0.62], [-0.8, 0.62], [0.8, 0.62]]) {
  const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 12), MAT.tire);
  w.rotation.x = Math.PI / 2; w.position.set(wx, 0.34, wz); w.castShadow = true; car.add(w); wheels.push(w);
}
for (const hx of [1.22]) {
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), MAT.light);
  hl.position.set(hx, 0.62, -0.32); car.add(hl);
  const hr = hl.clone(); hr.position.z = 0.32; car.add(hr);
}
car.position.set(0, 0, 30);
world.add(car);

// Cartelli delle aree progetto
function makeSign(text, sub, color) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#101316'; ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.strokeRect(14, 14, 484, 228);
  ctx.fillStyle = '#f2f0e9'; ctx.font = '900 64px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(text, 256, 118);
  ctx.fillStyle = color; ctx.font = '600 34px Inter, system-ui, sans-serif';
  ctx.fillText(sub, 256, 184);
  const tex = new THREE.CanvasTexture(c);
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  spr.scale.set(9, 4.5, 1);
  return spr;
}
const zones = [
  { label: 'Tessitura', href: 'tessitura.html', x: -52, z: 28, color: '#c7a45b', sub: 'Telai · armature · note colore' },
  { label: 'CAD Moda', href: 'cad-moda.html', x: 52, z: 2, color: '#ff2d6f', sub: 'Modellistica · sketch · prodotto' },
  { label: 'Supply Chain', href: 'supply-chain-production.html', x: 72, z: 30, color: '#2dd4bf', sub: 'MRP · dashboard · operations' },
];
for (const zn of zones) {
  const sign = makeSign(zn.label, zn.sub, zn.color);
  sign.position.set(zn.x, 7, zn.z);
  sign.userData.zone = zn;
  world.add(sign);
  const pole = cyl(0.16, 0.16, 4.5, 6, MAT.factory2, zn.x, 1.6, zn.z);
  pole.castShadow = true;
  const ring = mesh(new THREE.RingGeometry(3.2, 3.7, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(zn.color), transparent: true, opacity: 0.55, side: THREE.DoubleSide }), zn.x, 0.08, zn.z);
  ring.rotation.x = -Math.PI / 2; ring.castShadow = false;
  zn.sign = sign; zn.ring = ring;
}

// Stato guida e camera
const state = { speed: 0, steer: 0, yaw: Math.PI, orbitYaw: Math.PI, orbitPitch: 0.42, camDist: 13, zone: '' };
const keys = new Set();
let touch = { fwd: false, back: false, left: false, right: false };
let dragging = false, lastPX = 0, lastPY = 0;

function setKey(code, down) {
  if (down) keys.add(code); else keys.delete(code);
}
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) && canvas.contains(document.activeElement) === false && e.target === document.body) e.preventDefault();
  setKey(e.code, true);
});
window.addEventListener('keyup', (e) => setKey(e.code, false));
canvas.addEventListener('pointerdown', (e) => { dragging = true; lastPX = e.clientX; lastPY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  state.orbitYaw -= (e.clientX - lastPX) * 0.006;
  state.orbitPitch = Math.min(1.1, Math.max(0.15, state.orbitPitch + (e.clientY - lastPY) * 0.005));
  lastPX = e.clientX; lastPY = e.clientY;
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });

document.querySelectorAll('[data-drive]').forEach((btn) => {
  const k = btn.dataset.drive;
  const on = (e) => { e.preventDefault(); touch[k] = true; btn.setPointerCapture(e.pointerId); };
  const off = () => { touch[k] = false; };
  btn.addEventListener('pointerdown', on);
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointercancel', off);
  btn.addEventListener('pointerleave', off);
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(zones.map((z) => z.sign), false);
  if (hits.length && hits[0].object.userData.zone) window.location.href = hits[0].object.userData.zone.href;
});

function resize() {
  const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
  const h = canvas.clientHeight || 520;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

const clock = new THREE.Clock();
function updateCar(dt) {
  const fwd = keys.has('KeyW') || keys.has('ArrowUp') || touch.fwd;
  const back = keys.has('KeyS') || keys.has('ArrowDown') || touch.back;
  const left = keys.has('KeyA') || keys.has('ArrowLeft') || touch.left;
  const right = keys.has('KeyD') || keys.has('ArrowRight') || touch.right;
  if (reduced) { state.speed = 0; return; }
  const accel = fwd ? 9.5 : back ? -6.5 : 0;
  state.speed += accel * dt;
  state.speed *= Math.pow(0.35, dt);
  state.speed = Math.max(-6, Math.min(11, state.speed));
  if (left) state.steer = Math.min(1, state.steer + dt * 3.2);
  if (right) state.steer = Math.max(-1, state.steer - dt * 3.2);
  if (!left && !right) state.steer *= Math.pow(0.001, dt);
  state.yaw += state.steer * state.speed * dt * 0.16;
  car.position.x += Math.sin(state.yaw) * state.speed * dt;
  car.position.z += Math.cos(state.yaw) * state.speed * dt;
  car.position.x = Math.max(-108, Math.min(108, car.position.x));
  car.position.z = Math.max(-78, Math.min(78, car.position.z));
  for (const c of colliders) {
    const dx = car.position.x - c.x, dz = car.position.z - c.z;
    const d = Math.hypot(dx, dz);
    if (d < c.r + 1.1 && d > 0.001) {
      car.position.x = c.x + (dx / d) * (c.r + 1.1);
      car.position.z = c.z + (dz / d) * (c.r + 1.1);
      state.speed *= 0.45;
    }
  }
  car.rotation.y = state.yaw;
  wheels.forEach((w) => { w.rotation.y += state.speed * dt * 2.4; });
}

function updateCamera(dt) {
  const target = car.position.clone();
  if (reduced) {
    const t = performance.now() * 0.00008;
    camera.position.set(Math.sin(t) * 46, 24, Math.cos(t) * 46);
    camera.lookAt(0, 2, 0);
    return;
  }
  const dist = state.camDist;
  const desired = new THREE.Vector3(
    target.x - Math.sin(state.orbitYaw) * dist * Math.cos(state.orbitPitch),
    target.y + dist * Math.sin(state.orbitPitch) + 4,
    target.z - Math.cos(state.orbitYaw) * dist * Math.cos(state.orbitPitch)
  );
  camera.position.lerp(desired, 1 - Math.pow(0.0001, dt));
  camera.lookAt(target.x, target.y + 1.4, target.z);
}

function updateThreads(t) {
  for (const l of loomThreads) {
    const pos = l.geo.attributes.position;
    for (let i = 0; i < pos.count; i += 2) {
      const sx = l.base[i].x;
      pos.setX(i, sx);
      pos.setX(i + 1, sx);
      pos.setY(i, 4.15 + Math.sin(t * 3 + i) * 0.06);
      pos.setY(i + 1, 1.45 + Math.sin(t * 3 + i) * 0.10);
    }
    pos.needsUpdate = true;
  }
}

function updateZones() {
  let found = '';
  for (const zn of zones) {
    const d = Math.hypot(car.position.x - zn.x, car.position.z - zn.z);
    zn.ring.material.opacity = d < 7 ? 0.95 : 0.45 + Math.sin(performance.now() * 0.004) * 0.15;
    if (d < 7) found = zn.label;
  }
  if (found !== state.zone) {
    state.zone = found;
    if (hudZone) hudZone.textContent = found ? found : 'Distretto di Prato';
  }
  if (hudSpeed) hudSpeed.textContent = `${Math.round(Math.abs(state.speed) * 10)} km/h circa`;
}

let frame = 0;
let active = true;
document.addEventListener('visibilitychange', () => { active = !document.hidden; });
function animate() {
  requestAnimationFrame(animate);
  if (!active) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateCar(dt);
  updateCamera(dt);
  updateThreads(t);
  zones.forEach((zn, i) => {
    zn.sign.position.y = 7 + Math.sin(t * 1.4 + i * 1.7) * 0.35;
  });
  updateZones();
  renderer.info.reset();
  renderer.render(scene, camera);
  frame++;
  if (frame % 20 === 0) {
    window.__prato3d = { ready: true, calls: renderer.info.render.calls, speed: state.speed, zone: state.zone, fps: 1000 / Math.max(dt * 1000, 1) };
  }
}
animate();
window.__prato3d = { ready: true, calls: renderer.info.render.calls, speed: state.speed, zone: state.zone, fps: 60 };
if (statusEl) statusEl.textContent = 'Scena 3D pronta: guida con WASD/frecce oppure usa i comandi su schermo.';
