// Main scene for the 3D room homepage.
// Builders live in ./: shell, guitar, dog, desk, fruits — each exports build*(THREE) -> Group.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildShell } from './shell.js';
import { buildGuitar } from './guitar.js';
import { buildDog } from './dog.js';
import { buildDesk } from './desk.js';
import { buildFruits } from './fruits.js';

const canvasHost = document.getElementById('room-canvas');
const overlay = document.getElementById('room-loading');
const tip = document.getElementById('card-tip');
const hint = document.getElementById('room-hint');

function fatal(msg) {
  if (overlay) {
    overlay.innerHTML =
      '<div class="load-inner"><p>' + msg + '</p>' +
      '<p><a href="/classic/">enter the classic site instead &rarr;</a></p></div>';
  }
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  fatal('This browser could not start WebGL, so the room stays dark.');
  throw e;
}

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const BASE_HINT = IS_TOUCH
  ? 'drag to look around · pinch to zoom · tap any photo to view it'
  : 'drag to look around · scroll to zoom · click any photo to view it';
const VIEWER_HINT = IS_TOUCH
  ? 'tap the photo for the next one · tap away to close'
  : '← → to browse · esc or click away to close';
if (hint) hint.textContent = BASE_HINT;

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
canvasHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x140a04);
scene.fog = new THREE.FogExp2(0x2a1608, 0.013);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 60);
camera.position.set(1.4, 1.9, 6.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.7, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 0.6;
controls.maxDistance = 8.6;
controls.maxPolarAngle = 1.62;
controls.autoRotate = !REDUCED_MOTION;
controls.autoRotateSpeed = 0.35;
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0xffe2b4, 0x5e3d24, 0.55));
scene.add(new THREE.AmbientLight(0xffd9a8, 0.22));

const pendant = new THREE.PointLight(0xffc98a, 46, 20, 2);
pendant.position.set(0, 3.42, 0);
pendant.castShadow = true;
pendant.shadow.mapSize.set(1024, 1024);
pendant.shadow.bias = -0.002;
pendant.shadow.normalBias = 0.03;
pendant.shadow.radius = 5;
scene.add(pendant);

const windowGlow = new THREE.DirectionalLight(0xffab68, 1.1);
windowGlow.position.set(-9, 3.2, 0.8);
windowGlow.target.position.set(0, 0.8, 0);
scene.add(windowGlow, windowGlow.target);

// ---------- furniture ----------
const updatables = [];
function place(group, x, z, rotY) {
  group.position.set(x, 0, z);
  if (rotY) group.rotation.y = rotY;
  scene.add(group);
  if (group.userData && typeof group.userData.update === 'function') updatables.push(group.userData.update);
  return group;
}

place(buildShell(THREE), 0, 0, 0);
place(buildDesk(THREE), 2.6, -5.55, 0);
place(buildGuitar(THREE), -4.9, -4.6, 0.72);
place(buildFruits(THREE), 4.9, 0.7, 0);
place(buildDog(THREE), -1.15, 1.95, -0.22);

// Optional modules (drums, plants) — the room still works while they don't exist yet.
Promise.allSettled([import('./drums.js'), import('./plants.js')]).then(([d, p]) => {
  if (d.status === 'fulfilled') place(d.value.buildDrums(THREE), -3.35, -4.65, 0.5);
  if (p.status === 'fulfilled') {
    const set = p.value.buildPlants(THREE);
    const spots = {
      monstera: [2.35, 6.0, -2.6],
      rubber: [6.2, -6.15, -0.7],
      fern: [4.5, 1.75, 0],
      sapling: [-6.0, 4.2, 1.2],
    };
    for (const name of Object.keys(spots)) {
      const plant = set.getObjectByName(name);
      if (!plant) continue;
      const [x, z, ry] = spots[name];
      plant.removeFromParent();
      plant.position.set(x, 0, z);
      plant.rotation.y = ry;
      scene.add(plant);
    }
  }
});

// ---------- floating post cards ----------
const cardsGroup = new THREE.Group();
scene.add(cardsGroup);

// Every post is a wooden picture frame on a wall: dark wood box + cream mat + photo.
const wallPhotoGeom = new THREE.PlaneGeometry(0.38, 0.38);
const wallBackGeom = new THREE.BoxGeometry(0.52, 0.52, 0.024);
const wallMatGeom = new THREE.PlaneGeometry(0.45, 0.45);
const wallWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.55 });
const wallMatMat = new THREE.MeshStandardMaterial({
  color: 0xefe6d2, roughness: 0.9, emissive: 0xefe6d2, emissiveIntensity: 0.12,
});

function makePaperTexture(lines) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 118, 30, 128, 128, 190);
  grad.addColorStop(0, '#f7ecd8');
  grad.addColorStop(1, '#e8d5b0');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  if (lines) {
    g.strokeStyle = 'rgba(122,82,48,0.35)';
    g.lineWidth = 3;
    for (let y = 56; y < 220; y += 26) {
      g.beginPath();
      g.moveTo(34, y);
      g.lineTo(34 + 150 + 40 * Math.sin(y), y);
      g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
const placeholderTex = makePaperTexture(false);
const placeholderMat = new THREE.MeshStandardMaterial({
  map: placeholderTex, roughness: 0.9, emissive: 0xffffff, emissiveMap: placeholderTex, emissiveIntensity: 0.25,
});
const letterMat = new THREE.MeshStandardMaterial({ map: makePaperTexture(true), roughness: 0.9 });

const cards = [];        // {root, photoMesh, post, baseY, phase, speed, loaded, loading, targetScale}
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function hash01(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

function addCard(post) {
  const root = new THREE.Group();
  const idx = cards.length;
  // frames hug the walls — casting shadows would cost a 6-face cube-shadow pass
  // over ~200 boxes for shadows nobody can see
  const back = new THREE.Mesh(wallBackGeom, wallWoodMat);
  const mat = new THREE.Mesh(wallMatGeom, wallMatMat);
  mat.position.z = 0.0125;
  const photo = new THREE.Mesh(wallPhotoGeom, post.image ? placeholderMat : letterMat);
  photo.position.z = 0.014;
  back.userData.cardIndex = idx;
  mat.userData.cardIndex = idx;
  photo.userData.cardIndex = idx;
  root.add(back, mat, photo);
  cardsGroup.add(root);
  const baseScale = 0.85 + hash01(idx + 77) * 0.25;
  root.scale.setScalar(baseScale);
  const card = {
    root, photoMesh: photo, post, pinned: true, baseScale, index: idx,
    loaded: false, loading: false, targetScale: baseScale,
  };
  cards.push(card);
  return card;
}

// Gallery wall zones — every post hangs framed on a wall. Frames sit 0.12 out
// from the wall plane so they clear the posts/rails (which protrude ~0.07).
const WALL_ZONES = [
  { cols: 7, rows: 5, at: (c, r) => [0.45 + c * 0.717, 3.99 - r * 0.66, -6.88, 0] },            // -Z wall, above desk
  { cols: 14, rows: 5, at: (c, r) => [6.88, 3.99 - r * 0.66, -6.3 + c * 0.696, -Math.PI / 2] }, // +X wall (clears scroll at z=4.3)
  { cols: 13, rows: 5, at: (c, r) => [2.85 - c * 0.766, 3.99 - r * 0.66, 6.88, Math.PI] },      // +Z wall, left of door
  { cols: 7, rows: 4, at: (c, r) => [-6.25 + c * 0.75, 3.2 - r * 0.56, -6.88, 0] },             // -Z wall, above bookshelf (bottom row clears the shelf top even on hover)
];
const WALL_COUNT = WALL_ZONES.reduce((s, z) => s + z.cols * z.rows, 0);

function pinToWalls(posts) {
  // posts arrive newest-first here
  let k = 0;
  for (const zone of WALL_ZONES) {
    for (let r = 0; r < zone.rows; r++) {
      for (let c = 0; c < zone.cols; c++) {
        if (k >= posts.length) return;
        const card = addCard(posts[k]);
        const [x, y, z, ry] = zone.at(c, r);
        const jx = (hash01(k + 40) - 0.5) * 0.06;
        const jy = (hash01(k + 80) - 0.5) * 0.06;
        const tilt = (hash01(k + 120) - 0.5) * 0.05;
        card.root.position.set(x + (ry === 0 || ry === Math.PI ? jx : 0), y + jy, z);
        if (ry === -Math.PI / 2 || ry === Math.PI / 2) card.root.position.z += jx;
        card.root.rotation.set(0, ry, tilt);
        k++;
      }
    }
  }
}

fetch('/room-posts.json')
  .then(r => r.json())
  .then(posts => {
    // newest first; every post hangs on a wall (zone capacity >= post count)
    posts.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    pinToWalls(posts.slice(0, WALL_COUNT));
  })
  .catch(() => { /* room still works without cards */ });

// Lazy photo loading: nearest-first, throttled, downscaled to 256px for GPU memory.
// No total cap — cards are bounded by wall capacity, and a cap tied to today's
// post count would strand future Instagram-synced posts as blank frames.
let activeLoads = 0;
const MAX_CONCURRENT = 8;

function loadCardTexture(card) {
  card.loading = true;
  activeLoads++;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const g = c.getContext('2d');
    // cover-crop to square
    const s = Math.min(img.width, img.height);
    g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    card.photoMesh.material = new THREE.MeshStandardMaterial({
      map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, roughness: 0.7,
    });
    card.loaded = true;
    card.loading = false;
    activeLoads--;
  };
  img.onerror = () => { card.loading = false; card.loaded = true; activeLoads--; };
  img.src = card.post.image;
}

const camPos = new THREE.Vector3();
const loadTimer = setInterval(() => {
  if (activeLoads >= MAX_CONCURRENT) return;
  camera.getWorldPosition(camPos);
  const candidates = [];
  let pending = false;
  for (const card of cards) {
    if (card.loading) { pending = true; continue; }
    if (card.loaded || !card.post.image) continue;
    candidates.push([card.root.position.distanceTo(camPos), card]);
  }
  if (!candidates.length) {
    if (!pending && cards.length) clearInterval(loadTimer); // everything settled
    return;
  }
  candidates.sort((a, b) => a[0] - b[0]);
  for (const [, card] of candidates) {
    if (activeLoads >= MAX_CONCURRENT) break;
    loadCardTexture(card);
  }
}, 350);

// ---------- hover / click ----------
let downX = 0, downY = 0;

function pickCard(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(cardsGroup.children, true);
  for (const h of hits) {
    if (h.object.userData.cardIndex !== undefined) return cards[h.object.userData.cardIndex];
  }
  return null;
}

renderer.domElement.addEventListener('pointermove', (e) => {
  if (IS_TOUCH || viewerState.active) return;
  const card = pickCard(e.clientX, e.clientY);
  if (card !== hovered) {
    if (hovered) hovered.targetScale = hovered.baseScale;
    hovered = card;
    if (hovered) hovered.targetScale = hovered.baseScale * 1.4;
    renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
  }
  if (hovered && tip) {
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
    tip.innerHTML = '<strong>' + escapeHtml(hovered.post.title || 'untitled') + '</strong><span>' +
      escapeHtml(hovered.post.date || '') + '</span>';
  } else if (tip) {
    tip.style.display = 'none';
  }
});

renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a drag
  if (viewerState.active) {
    // tap the big photo -> next; tap anywhere else -> close
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(viewerPhoto, false).length) viewerNext(1);
    else viewerClose();
    return;
  }
  const card = pickCard(e.clientX, e.clientY);
  if (card) viewerOpen(card.index);
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// ---------- artistic viewer: click a photo, it floats up with its story ----------
const viewerGroup = new THREE.Group();
viewerGroup.visible = false;
scene.add(viewerGroup);

const backdropMat = new THREE.MeshBasicMaterial({
  color: 0x140a04, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), backdropMat);
backdrop.position.z = -0.8;
backdrop.renderOrder = 20;
viewerGroup.add(backdrop);

const viewerPanel = new THREE.Group();
viewerGroup.add(viewerPanel);

const viewerFrameMat = new THREE.MeshBasicMaterial({
  color: 0x3a2412, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const viewerFrame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), viewerFrameMat);
viewerFrame.renderOrder = 21;
viewerPanel.add(viewerFrame);

const viewerPhotoMat = new THREE.MeshBasicMaterial({
  color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const viewerPhoto = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), viewerPhotoMat);
viewerPhoto.position.z = 0.001;
viewerPhoto.renderOrder = 22;
viewerPanel.add(viewerPhoto);

const captionCanvas = document.createElement('canvas');
captionCanvas.width = 640;
captionCanvas.height = 200;
const captionTex = new THREE.CanvasTexture(captionCanvas);
captionTex.colorSpace = THREE.SRGBColorSpace;
const viewerCaptionMat = new THREE.MeshBasicMaterial({
  map: captionTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const viewerCaption = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.4), viewerCaptionMat);
viewerCaption.renderOrder = 23;
viewerPanel.add(viewerCaption);

const viewerState = { active: false, index: -1, open: 0, slide: 0 };
const fullTexCache = new Map();

function drawViewerCaption(post) {
  const g = captionCanvas.getContext('2d');
  g.clearRect(0, 0, 640, 200);
  g.fillStyle = 'rgba(20,12,5,0.62)';
  g.beginPath();
  if (g.roundRect) g.roundRect(4, 4, 632, 192, 22); else g.rect(4, 4, 632, 192);
  g.fill();
  g.strokeStyle = 'rgba(255,217,160,0.35)';
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = '#ffe6bd';
  g.font = '600 38px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
  const title = post.title || 'untitled';
  let line1 = title, line2 = '';
  if (g.measureText(title).width > 560) {
    let i = title.length;
    while (i > 1 && g.measureText(title.slice(0, i)).width > 560) i--;
    line1 = title.slice(0, i);
    line2 = title.slice(i);
    if (g.measureText(line2).width > 520) {
      let j = line2.length;
      while (j > 1 && g.measureText(line2.slice(0, j) + '…').width > 520) j--;
      line2 = line2.slice(0, j) + '…';
    }
  }
  g.fillText(line1, 36, line2 ? 76 : 96);
  if (line2) g.fillText(line2, 36, 126);
  g.font = '400 26px Inter, sans-serif';
  g.fillStyle = '#d9b98c';
  g.fillText(post.date || '', 36, 166);
  captionTex.needsUpdate = true;
}

function fitViewerPhoto(aspect) {
  const dist = 2.2;
  const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * camera.aspect;
  const maxW = visW * 0.76;
  const maxH = visH * 0.6;
  const a = aspect || 1;
  let w = maxW, h = maxW / a;
  if (h > maxH) { h = maxH; w = maxH * a; }
  viewerPhoto.scale.set(w, h, 1);
  viewerFrame.scale.set(w + 0.08, h + 0.08, 1);
  const capS = Math.min(1, visW * 0.5 / 1.28);
  viewerCaption.scale.setScalar(capS);
  viewerCaption.position.set(w / 2 - 1.28 * capS * 0.42, -h / 2 - 0.27 * capS, 0.15);
  viewerCaption.rotation.set(-0.1, -0.16, 0);
}

function setViewerTexture(tex, aspect) {
  viewerPhotoMat.map = tex;
  viewerPhotoMat.needsUpdate = true;
  fitViewerPhoto(aspect);
}

function viewerShow(i) {
  const n = cards.length;
  if (!n) return;
  viewerState.index = ((i % n) + n) % n;
  const card = cards[viewerState.index];
  drawViewerCaption(card.post);
  // show the wall thumbnail instantly, then swap in the full-resolution image
  const thumb = card.loaded && card.photoMesh.material.map ? card.photoMesh.material.map : placeholderTex;
  setViewerTexture(thumb, 1);
  const src = card.post.image;
  if (!src) return;
  const cached = fullTexCache.get(src);
  if (cached) { setViewerTexture(cached.tex, cached.aspect); return; }
  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    const aspect = img.width / img.height;
    fullTexCache.set(src, { tex, aspect });
    if (viewerState.active && cards[viewerState.index] === card) setViewerTexture(tex, aspect);
  };
  img.src = src;
}

function viewerOpen(i) {
  viewerState.active = true;
  controls.enabled = false;
  if (hovered) { hovered.targetScale = hovered.baseScale; hovered = null; }
  if (tip) tip.style.display = 'none';
  renderer.domElement.style.cursor = 'default';
  if (hint) hint.textContent = VIEWER_HINT;
  viewerShow(i);
}

function viewerClose() {
  viewerState.active = false;
  controls.enabled = true;
  renderer.domElement.style.cursor = 'grab';
  if (hint) hint.textContent = BASE_HINT;
}

function viewerNext(dir) {
  viewerState.slide = dir * 0.5;
  viewerShow(viewerState.index + dir);
}

window.addEventListener('keydown', (e) => {
  if (!viewerState.active) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); viewerNext(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); viewerNext(-1); }
  else if (e.key === 'Escape') viewerClose();
});

// ---------- loop ----------
const clock = new THREE.Clock();
let firstFrame = true;

// debug/inspection hook (harmless in production)
window.__room = { scene, camera, controls, cards, pick: pickCard, viewerOpen, viewerClose };

const _fwd = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  controls.update();
  for (const fn of updatables) fn(t, dt);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const s = card.root.scale.x + (card.targetScale - card.root.scale.x) * Math.min(1, dt * 10);
    card.root.scale.setScalar(s);
  }

  // viewer: floats 2.2m in front of the camera, fades and drifts gently
  const vTarget = viewerState.active ? 1 : 0;
  viewerState.open += (vTarget - viewerState.open) * Math.min(1, dt * 6);
  if (viewerState.open > 0.01) {
    viewerGroup.visible = true;
    _fwd.set(0, 0, -1).applyQuaternion(camera.quaternion);
    viewerGroup.position.copy(camera.position).addScaledVector(_fwd, 2.2);
    viewerGroup.quaternion.copy(camera.quaternion);
    viewerState.slide += (0 - viewerState.slide) * Math.min(1, dt * 9);
    viewerPanel.position.x = viewerState.slide;
    if (!REDUCED_MOTION) {
      viewerPanel.position.y = Math.sin(t * 0.8) * 0.012;
      viewerPanel.rotation.z = Math.sin(t * 0.5) * 0.006;
    }
    const op = viewerState.open * (1 - Math.min(1, Math.abs(viewerState.slide) * 1.6));
    backdropMat.opacity = 0.8 * viewerState.open;
    viewerPhotoMat.opacity = op;
    viewerFrameMat.opacity = op;
    viewerCaptionMat.opacity = op;
    viewerPanel.scale.setScalar(0.88 + 0.12 * viewerState.open);
  } else {
    viewerGroup.visible = false;
  }

  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    if (overlay) {
      overlay.classList.add('done');
      setTimeout(() => overlay.remove(), 900);
    }
  }
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
