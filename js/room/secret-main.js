// The secret room — a starlit observatory. Only reachable through the globe
// in the main room with the right password (a session key set on success).
const KEY_HASH = 'b7814f71f1913760dfd032701c80d7a84e4ad1a91a741432ee491b9da863023d';
if (sessionStorage.getItem('room-key') !== KEY_HASH) {
  window.location.replace('/');
  throw new Error('no key');
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvasHost = document.getElementById('room-canvas');
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_TOUCH ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
canvasHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070f);
scene.fog = new THREE.FogExp2(0x070a16, 0.02);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, 1.7, 5.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 2.2;
controls.maxDistance = 9;
controls.autoRotate = !REDUCED_MOTION;
controls.autoRotateSpeed = 0.5;
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

scene.add(new THREE.AmbientLight(0x30395c, 1.1));
const moon = new THREE.PointLight(0xbcd0ff, 30, 40, 2);
moon.position.set(-4, 6, 3);
scene.add(moon);
const warm = new THREE.PointLight(0xffb060, 12, 18, 2);
warm.position.set(2.5, 2.2, 2);
scene.add(warm);

// dark still-water floor
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(9, 48),
  new THREE.MeshStandardMaterial({ color: 0x0a0e1c, roughness: 0.15, metalness: 0.4 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// starfield sphere
{
  const N = 900;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 30 + Math.random() * 25;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.8 + 0.5;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const starTexC = document.createElement('canvas');
  starTexC.width = starTexC.height = 32;
  const sg = starTexC.getContext('2d');
  const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 32, 32);
  const stex = new THREE.CanvasTexture(starTexC);
  const stars = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.22, map: stex, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, color: 0xcfe0ff,
  }));
  scene.add(stars);
}

// the earth — hand-painted, luminous
function earthTexture(size) {
  const c = document.createElement('canvas');
  c.width = size; c.height = size / 2;
  const g = c.getContext('2d');
  const w = size, h = size / 2;
  const sea = g.createLinearGradient(0, 0, 0, h);
  sea.addColorStop(0, '#20486a');
  sea.addColorStop(0.5, '#2a5a80');
  sea.addColorStop(1, '#1c3f5e');
  g.fillStyle = sea;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a9a68';
  const blob = (pts) => {
    g.beginPath();
    g.moveTo(pts[0][0] * w, pts[0][1] * h);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      g.quadraticCurveTo(a[0] * w, a[1] * h, (a[0] + b[0]) / 2 * w, (a[1] + b[1]) / 2 * h);
    }
    g.closePath();
    g.fill();
  };
  // very loose continents — a memory of a map, not a map
  blob([[0.08, 0.28], [0.16, 0.18], [0.24, 0.24], [0.27, 0.38], [0.22, 0.5], [0.12, 0.46], [0.06, 0.36]]); // north america
  blob([[0.24, 0.55], [0.3, 0.52], [0.32, 0.66], [0.28, 0.82], [0.24, 0.7]]);                               // south america
  blob([[0.44, 0.3], [0.52, 0.26], [0.56, 0.4], [0.52, 0.6], [0.46, 0.72], [0.42, 0.52], [0.42, 0.38]]);    // africa
  blob([[0.5, 0.2], [0.62, 0.14], [0.78, 0.2], [0.86, 0.3], [0.78, 0.42], [0.66, 0.4], [0.56, 0.3]]);       // eurasia
  blob([[0.78, 0.62], [0.86, 0.6], [0.88, 0.7], [0.8, 0.72]]);                                              // australia
  g.fillStyle = 'rgba(240,246,250,0.9)';
  g.fillRect(0, 0, w, h * 0.06);
  g.fillRect(0, h * 0.95, w, h * 0.05);
  g.strokeStyle = 'rgba(255,255,255,0.07)';
  g.lineWidth = 1;
  for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(w * i / 12, 0); g.lineTo(w * i / 12, h); g.stroke(); }
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, h * i / 6); g.lineTo(w, h * i / 6); g.stroke(); }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1.15, 48, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture(1024), roughness: 0.7,
    emissive: 0x223a66, emissiveIntensity: 0.35,
  })
);
globe.position.set(0, 1.75, 0);
globe.rotation.z = 0.41; // the tilt of the world
scene.add(globe);
const halo = new THREE.Mesh(
  new THREE.SphereGeometry(1.28, 32, 24),
  new THREE.MeshBasicMaterial({
    color: 0x6a90e0, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  })
);
halo.position.copy(globe.position);
scene.add(halo);

// floating paper lanterns
const lanterns = [];
for (let i = 0; i < 7; i++) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.1, 6, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0, emissive: 0xffb060, emissiveIntensity: 1.6, roughness: 0.9,
    })
  );
  grp.add(body);
  const a = i / 7 * Math.PI * 2;
  grp.position.set(Math.cos(a) * (2.6 + (i % 3) * 0.7), 1.2 + (i % 4) * 0.5, Math.sin(a) * (2.6 + (i % 3) * 0.7));
  scene.add(grp);
  lanterns.push({ grp, ph: a * 2, sp: 0.25 + (i % 3) * 0.1 });
}

window.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.location.href = '/'; });

const clock = new THREE.Clock();
window.__secret = { scene, camera };
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  controls.update();
  globe.rotation.y += dt * 0.12;
  if (!REDUCED_MOTION) {
    for (const L of lanterns) {
      L.grp.position.y += Math.sin(t * L.sp + L.ph) * 0.0012;
      L.grp.rotation.y = Math.sin(t * 0.3 + L.ph) * 0.2;
    }
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
