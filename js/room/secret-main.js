// The secret room — a starlit observatory:
// encrypted photos orbiting a luminous earth, and a mailbox of letters.
// Requires both the password verifier and the decryption key from the door.
const KEY_HASH = 'b7814f71f1913760dfd032701c80d7a84e4ad1a91a741432ee491b9da863023d';
const ENC_HEX = sessionStorage.getItem('room-enc');
if (sessionStorage.getItem('room-key') !== KEY_HASH || !ENC_HEX) {
  window.location.replace('/');
  throw new Error('no key');
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvasHost = document.getElementById('room-canvas');
const letterCard = document.getElementById('letter-card');
const letterNo = document.getElementById('letter-no');
const letterText = document.getElementById('letter-text');
const hint = document.getElementById('room-hint');
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_TOUCH ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = !IS_TOUCH;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
canvasHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05070f);
scene.fog = new THREE.FogExp2(0x070a16, 0.014);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 120);
camera.position.set(0, 2.2, 7.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.7, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 2.2;
controls.maxDistance = 10;
controls.maxPolarAngle = 1.6; // stay above the lake
controls.autoRotate = !REDUCED_MOTION;
controls.autoRotateSpeed = 0.4;
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

// night light: cold moon, one warm pool by the mailbox
const updatables = [];
scene.add(new THREE.AmbientLight(0x30395c, 1.1));
const moonLight = new THREE.PointLight(0xbcd0ff, 30, 40, 2);
moonLight.position.set(-4, 6, 3);
scene.add(moonLight);
const warmLight = new THREE.PointLight(0xffb060, 12, 18, 2);
warmLight.position.set(2.5, 2.2, 2);
scene.add(warmLight);

// a vast dark sea, still as glass, with a moon-path shimmer
const sea = new THREE.Mesh(
  new THREE.CircleGeometry(60, 64),
  new THREE.MeshStandardMaterial({ color: 0x0a0e1c, roughness: 0.12, metalness: 0.45 })
);
sea.rotation.x = -Math.PI / 2;
sea.position.y = -0.02;
scene.add(sea);
const moonPath = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 34),
  new THREE.MeshBasicMaterial({
    color: 0x9ab8e8, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })
);
moonPath.rotation.x = -Math.PI / 2;
moonPath.position.set(-6, 0.005, -8);
moonPath.rotation.z = 0.5;
scene.add(moonPath);

// starfield
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
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const sg = c.getContext('2d');
  const grad = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 32, 32);
  const stex = new THREE.CanvasTexture(c);
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.22, map: stex, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false, color: 0xcfe0ff,
  })));
}

// the earth
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
  const LANDS = [
    [[0.08, 0.28], [0.16, 0.18], [0.24, 0.24], [0.27, 0.38], [0.22, 0.5], [0.12, 0.46], [0.06, 0.36]],
    [[0.24, 0.55], [0.3, 0.52], [0.32, 0.66], [0.28, 0.82], [0.24, 0.7]],
    [[0.44, 0.3], [0.52, 0.26], [0.56, 0.4], [0.52, 0.6], [0.46, 0.72], [0.42, 0.52], [0.42, 0.38]],
    [[0.5, 0.2], [0.62, 0.14], [0.78, 0.2], [0.86, 0.3], [0.78, 0.42], [0.66, 0.4], [0.56, 0.3]],
    [[0.78, 0.62], [0.86, 0.6], [0.88, 0.7], [0.8, 0.72]],
  ];
  // soft coastline shadow first, then the land with a deeper green edge
  g.save();
  g.translate(w * 0.004, h * 0.01);
  g.fillStyle = 'rgba(16,40,60,0.5)';
  for (const L of LANDS) blob(L);
  g.restore();
  for (const L of LANDS) blob(L);
  g.strokeStyle = 'rgba(46,74,48,0.8)';
  g.lineWidth = Math.max(2, w / 300);
  for (const L of LANDS) {
    g.beginPath();
    g.moveTo(L[0][0] * w, L[0][1] * h);
    for (let i = 1; i < L.length; i++) {
      const a = L[i - 1], b = L[i];
      g.quadraticCurveTo(a[0] * w, a[1] * h, (a[0] + b[0]) / 2 * w, (a[1] + b[1]) / 2 * h);
    }
    g.closePath();
    g.stroke();
  }
  // dry interiors + little archipelagos
  g.fillStyle = 'rgba(190,170,110,0.45)';
  g.beginPath(); g.ellipse(w * 0.49, h * 0.42, w * 0.03, h * 0.07, 0.3, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(w * 0.7, h * 0.27, w * 0.035, h * 0.05, -0.2, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7a9a68';
  for (const [ax, ay] of [[0.83, 0.45], [0.85, 0.48], [0.87, 0.44], [0.35, 0.44], [0.9, 0.56], [0.63, 0.52]]) {
    g.beginPath(); g.ellipse(ax * w, ay * h, w * 0.008, h * 0.012, 0, 0, Math.PI * 2); g.fill();
  }
  // polar ice, softened
  const ice = g.createLinearGradient(0, 0, 0, h * 0.1);
  ice.addColorStop(0, 'rgba(240,246,250,0.95)');
  ice.addColorStop(1, 'rgba(240,246,250,0)');
  g.fillStyle = ice;
  g.fillRect(0, 0, w, h * 0.1);
  const ice2 = g.createLinearGradient(0, h * 0.9, 0, h);
  ice2.addColorStop(0, 'rgba(240,246,250,0)');
  ice2.addColorStop(1, 'rgba(240,246,250,0.95)');
  g.fillStyle = ice2;
  g.fillRect(0, h * 0.9, w, h * 0.1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 512, 256);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  let sd = 9;
  const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 46; i++) {
    const x = rnd() * 512, y = 30 + rnd() * 196;
    for (let k = 0; k < 5; k++) {
      g.globalAlpha = 0.12 + rnd() * 0.2;
      g.beginPath();
      g.ellipse(x + (rnd() - 0.5) * 46, y + (rnd() - 0.5) * 12, 14 + rnd() * 22, 4 + rnd() * 6, 0, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const earthMap = earthTexture(1024);
const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 48, 32),
  new THREE.MeshStandardMaterial({
    map: earthMap, roughness: 0.62, metalness: 0.05,
    emissive: 0xaabbd8, emissiveIntensity: 0.5, emissiveMap: earthMap,
  })
);
globe.position.set(0, 1.9, 0);
globe.rotation.z = 0.41;
scene.add(globe);

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(1.075, 48, 32),
  new THREE.MeshStandardMaterial({
    map: cloudTexture(), transparent: true, opacity: 0.75,
    roughness: 1, depthWrite: false,
  })
);
clouds.position.copy(globe.position);
clouds.rotation.z = 0.41;
scene.add(clouds);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.22, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0x6a90e0, transparent: true, opacity: 0.2,
    blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
  })
);
atmosphere.position.copy(globe.position);
scene.add(atmosphere);

// ---------- little-prince planets: small pastel worlds you could live on ----------
// each carries tiny flowers, and some a bare sprig, a volcano, a pastel ring
const planets = [];
function surfacePoint(grp, r, theta, phi) {
  // returns a group oriented so +Y points out of the planet at that spot
  const holder = new THREE.Group();
  const n = new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta)
  );
  holder.position.copy(n).multiplyScalar(r);
  holder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  grp.add(holder);
  return holder;
}

function makeB612(def) {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: def.col, roughness: 0.95,
    emissive: new THREE.Color(def.col), emissiveIntensity: 0.18,
  });
  const body = new THREE.Mesh(new THREE.SphereGeometry(def.r, 22, 16), mat);
  grp.add(body);
  // a few soft craters — slightly darker flattened discs hugging the surface
  const craterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.col).multiplyScalar(0.82), roughness: 1,
  });
  for (let i = 0; i < 4; i++) {
    const h = surfacePoint(grp, def.r * 0.99, i * 2.1 + def.seed, 0.7 + (i % 3) * 0.6);
    const crater = new THREE.Mesh(new THREE.CircleGeometry(def.r * (0.16 + (i % 2) * 0.08), 14), craterMat);
    crater.rotation.x = -Math.PI / 2;
    crater.position.y = 0.004;
    h.add(crater);
  }
  // tiny flowers, petals like the rose's cousins
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 1 });
  const petalCols = [0xe86a90, 0xf0d060, 0xf6f0e6];
  for (let i = 0; i < def.flowers; i++) {
    const h = surfacePoint(grp, def.r, i * 1.7 + def.seed * 2, 0.5 + (i * 0.9) % 2.1);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.07, 6), stemMat);
    stem.position.y = 0.035;
    h.add(stem);
    const petalMat = new THREE.MeshStandardMaterial({
      color: petalCols[i % 3], roughness: 0.9,
      emissive: petalCols[i % 3], emissiveIntensity: 0.25,
    });
    for (let p = 0; p < 5; p++) {
      const a = p / 5 * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), petalMat);
      petal.position.set(Math.cos(a) * 0.02, 0.075, Math.sin(a) * 0.02);
      h.add(petal);
    }
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.011, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xd9a040, roughness: 0.8 })
    );
    heart.position.y = 0.08;
    h.add(heart);
  }
  // a bare little sprig on some worlds
  if (def.sprig) {
    const h = surfacePoint(grp, def.r, def.seed * 3.3, 0.5);
    const twigMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3c, roughness: 1 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, def.r * 0.8, 6), twigMat);
    trunk.position.y = def.r * 0.4;
    trunk.rotation.z = 0.15;
    h.add(trunk);
    for (const s of [-1, 1]) {
      const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.007, def.r * 0.4, 5), twigMat);
      twig.position.set(s * 0.03, def.r * 0.66, 0);
      twig.rotation.z = s * 0.7;
      h.add(twig);
    }
  }
  // a sleepy volcano with a smoke wisp
  if (def.volcano) {
    const h = surfacePoint(grp, def.r * 0.98, def.seed * 5.1, 1.9);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(def.r * 0.22, def.r * 0.3, 12),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(def.col).multiplyScalar(0.7), roughness: 1 })
    );
    cone.position.y = def.r * 0.13;
    h.add(cone);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xd8d8e0, transparent: true, opacity: 0.35 });
    for (let s = 0; s < 3; s++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.02 + s * 0.008, 8, 6), smokeMat);
      puff.position.set(Math.sin(s * 1.8) * 0.02, def.r * 0.3 + s * 0.05, 0);
      h.add(puff);
    }
  }
  if (def.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(def.r * 1.4, def.r * 1.85, 32),
      new THREE.MeshBasicMaterial({ color: def.ring, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2 - 0.35;
    grp.add(ring);
  }
  grp.position.set(def.pos[0], def.pos[1], def.pos[2]);
  grp.rotation.z = def.seed % 0.5 - 0.25;
  scene.add(grp);
  planets.push({ grp, body: grp, spin: def.spin, bob: def.seed, baseY: def.pos[1] });
}

[
  { r: 0.62, col: 0xb8a8d0, pos: [-5.5, 4.8, -6.5], spin: 0.1, flowers: 5, sprig: true, volcano: true, ring: null, seed: 1.3 },   // B612 itself, lavender
  { r: 0.4, col: 0xa8d8c8, pos: [6.2, 5.6, -3.5], spin: 0.16, flowers: 3, sprig: false, volcano: false, ring: null, seed: 2.7 },
  { r: 0.52, col: 0xf0c8a0, pos: [4.5, 7.4, -9], spin: 0.08, flowers: 4, sprig: true, volcano: false, ring: 0xf0d8a0, seed: 4.1 },
  { r: 0.28, col: 0xf0d060, pos: [-6.8, 6.8, 2.5], spin: 0.22, flowers: 2, sprig: false, volcano: false, ring: null, seed: 5.9 },  // little yellow moon
  { r: 0.44, col: 0xe8a8b8, pos: [7.5, 4.2, 4.5], spin: 0.13, flowers: 4, sprig: false, volcano: true, ring: 0xc8e8f0, seed: 7.2 },
  { r: 0.3, col: 0xa8c0e8, pos: [-3.5, 8.2, 6.5], spin: 0.19, flowers: 2, sprig: true, volcano: false, ring: null, seed: 8.8 },
  { r: 0.36, col: 0xd0e8a8, pos: [0.5, 9.0, -4], spin: 0.15, flowers: 3, sprig: false, volcano: false, ring: null, seed: 10.4 },
].forEach(makeB612);

// hand-drawn golden star sprinkles, like ink stars on the page
{
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#f0d060';
  g.translate(32, 32);
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? 24 : 9;
    const a = i / 10 * Math.PI * 2 - Math.PI / 2;
    g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
  g.fill();
  const starTex = new THREE.CanvasTexture(c);
  starTex.colorSpace = THREE.SRGBColorSpace;
  for (let i = 0; i < 24; i++) {
    const m = new THREE.SpriteMaterial({
      map: starTex, transparent: true, opacity: 0.75 + (i % 3) * 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const sp = new THREE.Sprite(m);
    const s = 0.1 + (i % 4) * 0.05;
    sp.scale.set(s, s, 1);
    const a = i / 24 * Math.PI * 2;
    sp.position.set(
      Math.cos(a) * (6 + (i % 5) * 1.6),
      2.4 + ((i * 1.63) % 6.5),
      Math.sin(a) * (6 + (i % 5) * 1.6)
    );
    scene.add(sp);
  }
}

// one small sunset at the edge of the dark sea — B612 always had time for sunsets
{
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,240,210,1)');
  grad.addColorStop(0.25, 'rgba(255,178,110,0.85)');
  grad.addColorStop(0.6, 'rgba(232,120,138,0.35)');
  grad.addColorStop(1, 'rgba(232,120,138,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sunset = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  sunset.scale.set(9, 9, 1);
  sunset.position.set(-14, 1.2, -21);
  scene.add(sunset);
  // its long reflection reaching across the water
  const refl = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 26),
    new THREE.MeshBasicMaterial({
      color: 0xff9a6a, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  refl.rotation.x = -Math.PI / 2;
  refl.rotation.z = 0.6;
  refl.position.set(-8, 0.006, -12);
  scene.add(refl);
}

// floating paper lanterns
const lanterns = [];
for (let i = 0; i < 7; i++) {
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.1, 6, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffd9a0, emissive: 0xffb060, emissiveIntensity: 1.6, roughness: 0.9,
    })
  ));
  const a = i / 7 * Math.PI * 2;
  grp.position.set(Math.cos(a) * (4.2 + (i % 3) * 0.7), 1.4 + (i % 4) * 0.6, Math.sin(a) * (4.2 + (i % 3) * 0.7));
  scene.add(grp);
  lanterns.push({ grp, ph: a * 2, sp: 0.25 + (i % 3) * 0.1 });
}

// ---------- decryption ----------
function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
let aesKey = null;
async function getKey() {
  if (!aesKey) {
    aesKey = await crypto.subtle.importKey('raw', hexToBytes(ENC_HEX), 'AES-GCM', false, ['decrypt']);
  }
  return aesKey;
}
async function decryptFile(url) {
  const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
  const iv = buf.slice(0, 12);
  const data = buf.slice(12);
  const key = await getKey();
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
}

// ---------- the photo ring ----------
const photoFrames = [];
const ringA = new THREE.Group();
const ringB = new THREE.Group();
scene.add(ringA, ringB);
const frameMat = new THREE.MeshStandardMaterial({
  color: 0xf2ead8, roughness: 0.85, emissive: 0xf2ead8, emissiveIntensity: 0.18,
});
const backMat = new THREE.MeshStandardMaterial({ color: 0x1a2030, roughness: 0.9 });

function addPhoto(i, total) {
  const ring = i % 2 === 0 ? ringA : ringB;
  const idxInRing = Math.floor(i / 2);
  const perRing = Math.ceil(total / 2);
  const a = idxInRing / perRing * Math.PI * 2;
  const r = ring === ringA ? 2.7 : 3.6;
  const y = ring === ringA ? 1.55 : 2.5;
  const grp = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.74), frameMat);
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 0.54),
    new THREE.MeshBasicMaterial({ color: 0x223048 })
  );
  photo.position.set(0, 0.06, 0.004);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.74), backMat);
  back.rotation.y = Math.PI;
  grp.add(frame, photo, back);
  grp.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
  photo.userData.photoIndex = i;
  frame.userData.photoIndex = i;
  ring.add(grp);
  photoFrames.push({ grp, photo, loaded: false, bob: Math.random() * Math.PI * 2 });
  return photoFrames[i];
}

async function loadPhotos(files) {
  const pics = files.filter(f => f.endsWith('.pic.bin')).sort();
  pics.forEach((_, i) => addPhoto(i, pics.length));
  for (let i = 0; i < pics.length; i++) {
    try {
      const plain = await decryptFile(pics[i]);
      const bmp = await createImageBitmap(new Blob([plain], { type: 'image/jpeg' }), { imageOrientation: 'flipY' });
      const tex = new THREE.Texture(bmp);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      const pf = photoFrames[i];
      const a = bmp.width / bmp.height;
      pf.photo.material = new THREE.MeshBasicMaterial({ map: tex });
      if (a > 1) pf.photo.scale.y = 1 / a; else pf.photo.scale.x = a;
      pf.loaded = true;
    } catch (e) { /* wrong key or bad file — leave the placeholder */ }
  }
}

// focused photo viewer
const focusMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthTest: false, depthWrite: false });
const focusPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), focusMat);
focusPlane.renderOrder = 30;
focusPlane.visible = false;
scene.add(focusPlane);
const focusState = { active: false, open: 0 };

function focusPhoto(i) {
  const pf = photoFrames[i];
  if (!pf || !pf.loaded) return;
  focusMat.map = pf.photo.material.map;
  focusMat.needsUpdate = true;
  const img = focusMat.map.image;
  const a = img.width / img.height;
  const H = 2.4;
  focusPlane.scale.set(Math.min(3.6, H * a), Math.min(3.6 / a, H), 1);
  focusState.active = true;
}

// ---------- the mailbox ----------
const mailbox = new THREE.Group();
(function buildMailbox() {
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 1.0, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.8 })
  );
  post.position.y = 0.5;
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb34a3a, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.5), bodyMat);
  body.position.y = 1.12;
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.5, 16, 1, false, 0, Math.PI), bodyMat);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = Math.PI / 2;
  roof.position.y = 1.24;
  const door = new THREE.Mesh(
    new THREE.CircleGeometry(0.1, 20),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.6 })
  );
  door.position.set(0, 1.14, 0.251);
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.7, roughness: 0.35 })
  );
  flagPole.position.set(0.19, 1.28, 0);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.12, 0.09),
    new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.4, roughness: 0.5, side: THREE.DoubleSide })
  );
  flag.position.set(0.19, 1.37, 0.06);
  mailbox.add(post, body, roof, door, flagPole, flag);
  mailbox.position.set(2.6, 0, 2.4);
  mailbox.rotation.y = -0.6;
  scene.add(mailbox);
})();

// letters: one NEW letter per day, in order; once all are read, any visit
// may re-read a random one from the archive
let letters = [];
function openLetter() {
  if (!letterCard) return;
  if (!letters.length) {
    letterNo.textContent = '…';
    letterText.textContent = '信还在路上。';
  } else {
    const read = parseInt(localStorage.getItem('secret-letters-read') || '0', 10);
    if (read < letters.length) {
      const today = new Date().toDateString();
      if (localStorage.getItem('secret-letter-day') === today && read > 0) {
        letterNo.textContent = '今日已读';
        letterText.textContent = '今天的信已经送到了。\n明天再来，会有新的一封。';
      } else {
        const L = letters[read];
        localStorage.setItem('secret-letters-read', String(read + 1));
        localStorage.setItem('secret-letter-day', today);
        letterNo.textContent = '第 ' + (L.n || read + 1) + ' 封';
        letterText.textContent = L.text || '';
      }
    } else {
      const idx = Math.floor(Math.random() * letters.length);
      const L = letters[idx];
      letterNo.textContent = '第 ' + (L.n || idx + 1) + ' 封 · 重读';
      letterText.textContent = L.text || '';
    }
  }
  letterCard.classList.add('on');
}
if (letterCard) letterCard.addEventListener('pointerup', () => letterCard.classList.remove('on'));

// ---------- data ----------
fetch('/secret-room.json?t=' + Math.floor(Date.now() / 600000))
  .then(r => r.json())
  .then(async data => {
    const files = data.files || [];
    const lf = files.find(f => f.endsWith('letters.bin'));
    if (lf) {
      try {
        const payload = JSON.parse(new TextDecoder().decode(await decryptFile(lf)));
        letters = Array.isArray(payload) ? payload : (payload.letters || []);
        if (!Array.isArray(payload)) {
          // the greeting and postmark live inside the ciphertext, never in the page
          if (payload.greeting && hint) hint.textContent = payload.greeting;
          const sig = document.getElementById('letter-sig');
          if (payload.signature && sig) sig.textContent = payload.signature;
        }
      } catch (e) { letters = []; }
    }
    await loadPhotos(files);
  })
  .catch(() => {});

// ---------- picking ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;
renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointermove', (e) => {
  if (IS_TOUCH) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(mailbox, true).length ||
    raycaster.intersectObjects([ringA, ringB], true).some(h => h.object.userData.photoIndex !== undefined);
  renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (focusState.active) { focusState.active = false; return; }
  if (raycaster.intersectObject(mailbox, true).length) { openLetter(); return; }
  const hits = raycaster.intersectObjects([ringA, ringB], true);
  for (const h of hits) {
    if (h.object.userData.photoIndex !== undefined) { focusPhoto(h.object.userData.photoIndex); return; }
  }
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (letterCard && letterCard.classList.contains('on')) letterCard.classList.remove('on');
    else if (focusState.active) focusState.active = false;
    else window.location.href = '/';
  }
});

const clock = new THREE.Clock();
const _fwd = new THREE.Vector3();
window.__secret = { scene, camera, openLetter, focusPhoto };
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  controls.update();
  for (const fn of updatables) fn(t, dt);
  globe.rotation.y += dt * 0.12;
  clouds.rotation.y += dt * 0.155;
  for (const p of planets) {
    p.body.rotation.y += dt * p.spin;
    if (!REDUCED_MOTION) p.grp.position.y = p.baseY + Math.sin(t * 0.3 + p.bob) * 0.12;
  }
  if (!REDUCED_MOTION) {
    ringA.rotation.y += dt * 0.05;
    ringB.rotation.y -= dt * 0.035;
    for (const pf of photoFrames) {
      pf.grp.position.y += Math.sin(t * 0.5 + pf.bob) * 0.0009;
    }
    for (const L of lanterns) {
      L.grp.position.y += Math.sin(t * L.sp + L.ph) * 0.0012;
    }
  }
  // photos always face you
  for (const pf of photoFrames) pf.grp.lookAt(camera.position);
  const ft = focusState.active ? 1 : 0;
  focusState.open += (ft - focusState.open) * Math.min(1, dt * 6);
  if (focusState.open > 0.01) {
    focusPlane.visible = true;
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    focusPlane.position.copy(camera.position).addScaledVector(_fwd, 3);
    focusPlane.quaternion.copy(camera.quaternion);
    focusMat.opacity = focusState.open;
  } else {
    focusPlane.visible = false;
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
