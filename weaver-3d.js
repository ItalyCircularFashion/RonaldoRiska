/* Weaver 3D — mini CAD tessile: crea un filo in 3D.
   Weft (orizzontale) che scorre + warp (verticale) fissi.
   Pattern di tessitura: plain / twill / satin.   */
import * as THREE from 'three';

const canvas = document.getElementById('weaver-canvas');
const overlay = document.getElementById('weaver-overlay');
const closeBtn = document.getElementById('weaver-close');
const presetBtns = document.querySelectorAll('.weave-presets button');

const controls = {
  weftColor: '#e8cf8f',
  warpColor: '#b85a3a',
  pattern: 'plain', // plain | twill | satin
  speed: 0.8,
  warpCount: 8,
  weftCount: 8,
};

if (!canvas) throw new Error('weaver canvas mancante');
if (!overlay) throw new Error('weaver overlay mancante');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR_CAP = Math.min(window.devicePixelRatio || 1, 2);

let renderer, scene, camera, clock;
let warpMeshes = [];
let weftMeshes = [];
let warpPositions = [];
let weftPositions = [];
let frame = 0;

/* ── Renderer / Scene / Camera ── */
function createRenderer() {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const w = canvas.clientWidth || 800;
  const h = canvas.clientHeight || 520;
  r.setSize(w, h, false);
  return r;
}

function createScene() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x0b0d0c);
  s.fog = new THREE.Fog(0x0b0d0c, 50, 160);
  return s;
}

function createCamera() {
  const c = new THREE.PerspectiveCamera(45, 1, 0.1, 260);
  c.position.set(0, 7, 14);
  c.lookAt(0, 0, 0);
  return c;
}

function createLights() {
  const group = new THREE.Group();
  const hemi = new THREE.HemisphereLight(0xd8e6ff, 0x1a241c, 1.4);
  const sun = new THREE.DirectionalLight(0xffe2a8, 1.8);
  sun.position.set(14, 22, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  group.add(hemi, sun);
  return group;
}

/* ── Fabric builder ── */
function buildFabric() {
  const group = new THREE.Group();
  const fabricMat = new THREE.MeshStandardMaterial({
    color: 0x0b0d0c,
    roughness: 0.92,
    side: THREE.DoubleSide,
  });
  const fabricGeo = new THREE.PlaneGeometry(8, 8);
  const fabric = new THREE.Mesh(fabricGeo, fabricMat);
  fabric.rotation.x = -Math.PI / 2;
  fabric.position.set(0, -0.04, 0);
  fabric.receiveShadow = true;
  group.add(fabric);

  // Warp threads (vertical, fixed in Z)
  const warpMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(controls.warpColor),
    roughness: 0.7, metalness: 0.1,
  });
  const warpGeo = new THREE.CylinderGeometry(0.045, 0.045, 8, 6);
  for (let i = 0; i <= controls.warpCount; i++) {
    const z = -4 + (i / controls.warpCount) * 8;
    const m = new THREE.Mesh(warpGeo, warpMat);
    m.position.set(0, 0, z);
    m.castShadow = true;
    warpMeshes.push(m);
    group.add(m);
  }

  // Weft threads (horizontal, moving up/down)
  const weftMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(controls.weftColor),
    roughness: 0.7, metalness: 0.1,
  });
  const weftGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 6);
  for (let i = 0; i <= controls.weftCount; i++) {
    const x = -4 + (i / controls.weftCount) * 8;
    const m = new THREE.Mesh(weftGeo, weftMat);
    m.position.set(x, 0, 0);
    m.castShadow = true;
    weftMeshes.push(m);
    group.add(m);
  }

  // Border frame
  const frameMat = new THREE.LineBasicMaterial({ color: 0xc7a45b });
  const frameGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 0.08, 8));
  const frame = new THREE.LineSegments(frameGeo, frameMat);
  frame.position.set(0, 0, 0);
  group.add(frame);

  return group;
}

/* ── Weave pattern logic ── */
function getWeftY(i, total, t, speed, pattern) {
  const base = Math.sin(t * speed * 1.3) * 0.45;
  const phase = (i / total) * Math.PI * 2;
  if (pattern === 'plain') {
    return base + Math.sin(t * speed * 0.9 + phase) * 0.05;
  } else if (pattern === 'twill') {
    return base * 0.7 + Math.sin(t * speed * 0.6 + phase + 1.1) * 0.18;
  } else if (pattern === 'satin') {
    return base * 1.15 + Math.sin(t * speed * 0.5 + phase + 2.3) * 0.12;
  }
  return base;
}

/* ── Setup ── */
function setup() {
  renderer = createRenderer();
  scene = createScene();
  camera = createCamera();
  const lights = createLights();
  scene.add(lights);
  const fabricGroup = buildFabric();
  scene.add(fabricGroup);
  clock = new THREE.Clock();
  animate();
}

/* ── Animation loop ── */
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  const offset = getWeftY(0, 1, t, controls.speed, controls.pattern);
  for (let i = 0; i < weftMeshes.length; i++) {
    const y = -3.6 + (i / (weftMeshes.length - 1)) * 7.2 - offset;
    weftMeshes[i].position.y = y;
  }

  // Subtle warp rotation
  for (const m of warpMeshes) {
    m.rotation.y = Math.sin(t * 0.15 + m.position.z * 0.08) * 0.02;
  }

  // Subtle fabric wobble
  const fabric = fabricGroup.children.find(c => c.geometry && c.geometry.type === 'PlaneGeometry');
  if (fabric && fabric.geometry) {
    const pos = fabric.geometry.attributes.position;
    const verts = pos.array;
    for (let i = 0; i < verts.length; i += 3) {
      const dist = Math.hypot(verts[i], verts[i + 1]);
      const wave = Math.sin(t * 2 + dist * 0.6) * 0.004;
      verts[i + 2] += wave;
    }
    pos.needsUpdate = true;
  }

  renderer.render(scene, camera);
  frame++;
}

/* ── Control UI bindings ── */
function bindControls() {
  const setPattern = (p) => { controls.pattern = p; presetBtns.forEach(b => b.classList.toggle('is-active', b.dataset.pattern === p)); };
  presetBtns.forEach(b => {
    b.addEventListener('click', () => setPattern(b.dataset.pattern));
  });

  // Speed slider
  const speedInput = document.getElementById('weaver-speed');
  if (speedInput) {
    speedInput.addEventListener('input', () => {
      controls.speed = parseFloat(speedInput.value);
    });
  }

  // Color
  const weftColor = document.getElementById('weaver-weft-color');
  if (weftColor) {
    weftColor.addEventListener('input', () => {
      controls.weftColor = weftColor.value;
      const mat = weftMeshes[0]?.material;
      if (mat && mat instanceof THREE.MeshStandardMaterial) {
        mat.color = new THREE.Color(controls.weftColor);
      }
    });
  }
  const warpColor = document.getElementById('weaver-warp-color');
  if (warpColor) {
    warpColor.addEventListener('input', () => {
      controls.warpColor = warpColor.value;
      const mat = warpMeshes[0]?.material;
      if (mat && mat instanceof THREE.MeshStandardMaterial) {
        mat.color = new THREE.Color(controls.warpColor);
      }
    });
  }

  // Pattern selector
  const patternSelect = document.getElementById('weaver-pattern');
  if (patternSelect) {
    patternSelect.addEventListener('change', () => {
      controls.pattern = patternSelect.value;
      presetBtns.forEach(b => b.classList.toggle('is-active', b.dataset.pattern === controls.pattern));
    });
  }
}

/* ── Overlay open/close ── */
function bindOverlay() {
  const trigger = document.getElementById('weaver-trigger');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.hidden = false;
      overlay.classList.add('open');
      // focus trap: focus the close button
      setTimeout(() => closeBtn?.focus(), 50);
    });
  }
  closeBtn?.addEventListener('click', () => {
    overlay.classList.remove('open');
    setTimeout(() => { overlay.hidden = true; }, 350);
  });
  // Close on overlay click outside panel
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      setTimeout(() => { overlay.hidden = true; }, 350);
    }
  });
  // Close on ESC
  const onKey = (e) => {
    if (e.key === 'Escape') {
      overlay.classList.remove('open');
      setTimeout(() => { overlay.hidden = true; }, 350);
      document.removeEventListener('keydown', onKey);
    }
  };
  overlay.addEventListener('transitionend', () => {
    if (!overlay.classList.contains('open')) {
      overlay.removeEventListener('transitionend', onKey);
    }
  });
  overlay.addEventListener('transitionend', onKey);
}

setup();
bindControls();
bindOverlay();
