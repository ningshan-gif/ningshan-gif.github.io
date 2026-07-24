// The secret room — a starlit observatory holding a pocket universe:
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
  blob([[0.08, 0.28], [0.16, 0.18], [0.24, 0.24], [0.27, 0.38], [0.22, 0.5], [0.12, 0.46], [0.06, 0.36]]);
  blob([[0.24, 0.55], [0.3, 0.52], [0.32, 0.66], [0.28, 0.82], [0.24, 0.7]]);
  blob([[0.44, 0.3], [0.52, 0.26], [0.56, 0.4], [0.52, 0.6], [0.46, 0.72], [0.42, 0.52], [0.42, 0.38]]);
  blob([[0.5, 0.2], [0.62, 0.14], [0.78, 0.2], [0.86, 0.3], [0.78, 0.42], [0.66, 0.4], [0.56, 0.3]]);
  blob([[0.78, 0.62], [0.86, 0.6], [0.88, 0.7], [0.8, 0.72]]);
  g.fillStyle = 'rgba(240,246,250,0.9)';
  g.fillRect(0, 0, w, h * 0.06);
  g.fillRect(0, h * 0.95, w, h * 0.05);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 48, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture(1024), roughness: 0.7, emissive: 0x223a66, emissiveIntensity: 0.35,
  })
);
globe.position.set(0, 1.9, 0);
globe.rotation.z = 0.41;
scene.add(globe);

// ---------- a sky of colorful floating planets ----------
function planetTexture(colors) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = colors[0];
  g.fillRect(0, 0, 256, 128);
  // soft horizontal bands
  for (let i = 0; i < 7; i++) {
    g.fillStyle = colors[1 + (i % (colors.length - 1))];
    g.globalAlpha = 0.35 + (i % 3) * 0.15;
    const y = 8 + i * 17 + Math.sin(i * 2.1) * 5;
    g.fillRect(0, y, 256, 7 + (i % 3) * 5);
  }
  g.globalAlpha = 0.25;
  for (let i = 0; i < 9; i++) {
    g.fillStyle = colors[(i % (colors.length - 1)) + 1];
    g.beginPath();
    g.ellipse(20 + i * 27, 20 + (i * 37) % 88, 10 + (i % 3) * 6, 5 + (i % 2) * 3, 0.3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const planets = [];
const PLANET_DEFS = [
  { r: 0.55, cols: ['#e8788a', '#f6a8b8', '#d95a78'], ring: '#f0d8a0', pos: [-5.5, 4.8, -6.5], spin: 0.15 },
  { r: 0.38, cols: ['#7ad0c8', '#a8e8e0', '#4aa89a'], ring: null, pos: [6.2, 5.6, -3.5], spin: 0.22 },
  { r: 0.72, cols: ['#8a78c8', '#a898e0', '#6a5aa8'], ring: '#c8b8f0', pos: [4.5, 7.4, -9], spin: 0.1 },
  { r: 0.3, cols: ['#f0c060', '#f8d890', '#d9a040'], ring: null, pos: [-6.8, 6.8, 2.5], spin: 0.3 },
  { r: 0.46, cols: ['#f09a58', '#f8b880', '#d97a38'], ring: '#c8e8f0', pos: [7.5, 4.2, 4.5], spin: 0.18 },
  { r: 0.26, cols: ['#a8d878', '#c8eca0', '#7ab850'], ring: null, pos: [-3.5, 8.2, 6.5], spin: 0.26 },
  { r: 0.34, cols: ['#78a8e8', '#a0c8f8', '#5a88c8'], ring: null, pos: [0.5, 9.0, -4], spin: 0.2 },
  { r: 0.2, cols: ['#e8b8d8', '#f8d8ec', '#c890b8'], ring: '#f8f0d8', pos: [-8.2, 5.4, -2], spin: 0.34 },
];
for (const def of PLANET_DEFS) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(def.r, 24, 16),
    new THREE.MeshStandardMaterial({
      map: planetTexture(def.cols), roughness: 0.75,
      emissive: new THREE.Color(def.cols[0]), emissiveIntensity: 0.22,
    })
  );
  grp.add(body);
  if (def.ring) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(def.r * 1.35, def.r * 1.9, 32),
      new THREE.MeshBasicMaterial({
        color: def.ring, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = Math.PI / 2 - 0.35;
    grp.add(ring);
  }
  grp.position.set(def.pos[0], def.pos[1], def.pos[2]);
  grp.rotation.z = (Math.random() - 0.5) * 0.4;
  scene.add(grp);
  planets.push({ grp, body, spin: def.spin, bob: Math.random() * Math.PI * 2, baseY: def.pos[1] });
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
        letters = JSON.parse(new TextDecoder().decode(await decryptFile(lf)));
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

if (hint) {
  hint.textContent = IS_TOUCH
    ? 'you found it · photos orbit · tap the mailbox for a letter'
    : 'you found it · click a photo · the mailbox holds letters · esc leaves quietly';
}

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
