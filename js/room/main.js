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
// Frames come in varied shapes (salon-style), so geometry is unit-sized and scaled per card.
const unitPlane = new THREE.PlaneGeometry(1, 1);
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const wallWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.55 });
const wallMatMat = new THREE.MeshStandardMaterial({
  color: 0xefe6d2, roughness: 0.9, emissive: 0xefe6d2, emissiveIntensity: 0.12,
});
// aligned gallery grid: every frame the same square shape
const FRAME_SHAPE = [0.5, 0.5];

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

function addCard(post, shape) {
  const root = new THREE.Group();
  const idx = cards.length;
  const fw = shape[0], fh = shape[1];
  // frames hug the walls — casting shadows would cost a 6-face cube-shadow pass
  // over ~200 boxes for shadows nobody can see
  const back = new THREE.Mesh(unitBox, wallWoodMat);
  back.scale.set(fw, fh, 0.024);
  const mat = new THREE.Mesh(unitPlane, wallMatMat);
  mat.scale.set(fw - 0.07, fh - 0.07, 1);
  mat.position.z = 0.0125;
  // writing posts render as a piece of manuscript instead of a photo
  const writing = isWriting(post);
  const photo = new THREE.Mesh(
    unitPlane,
    writing ? makeWritingWallMaterial(post) : (post.image ? placeholderMat : letterMat)
  );
  photo.scale.set(fw - 0.14, fh - 0.14, 1);
  photo.position.z = 0.014;
  back.userData.cardIndex = idx;
  mat.userData.cardIndex = idx;
  photo.userData.cardIndex = idx;
  root.add(back, mat, photo);
  cardsGroup.add(root);
  const baseScale = 0.9 + hash01(idx + 77) * 0.12;
  root.scale.setScalar(baseScale);
  const card = {
    root, photoMesh: photo, post, pinned: true, baseScale, index: idx, writing,
    aspect: (fw - 0.14) / (fh - 0.14),
    loaded: writing, loading: false, targetScale: baseScale,
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
  { cols: 7, rows: 4, flat: true, at: (c, r) => [-6.25 + c * 0.75, 3.2 - r * 0.56, -6.88, 0] }, // -Z wall, above bookshelf (tight rows: flat shapes only)
];
const WALL_COUNT = WALL_ZONES.reduce((s, z) => s + z.cols * z.rows, 0);

function pinToWalls(posts) {
  // posts arrive newest-first here
  let k = 0;
  for (const zone of WALL_ZONES) {
    for (let r = 0; r < zone.rows; r++) {
      for (let c = 0; c < zone.cols; c++) {
        if (k >= posts.length) return;
        const post = posts[k];
        // writings stay square (their manuscript canvas is square); photos vary
        const card = addCard(post, FRAME_SHAPE);
        const [x, y, z, ry] = zone.at(c, r);
        const jx = (hash01(k + 40) - 0.5) * 0.06;
        const jy = (hash01(k + 80) - 0.5) * 0.06;
        const tilt = (hash01(k + 120) - 0.5) * 0.05;
        card.root.position.set(x + (ry === 0 || ry === Math.PI ? jx : 0), y + jy, z);
        if (ry === -Math.PI / 2 || ry === Math.PI / 2) card.root.position.z += jx;
        card.root.rotation.set(0, ry, tilt);
        // tiny outward offset so touching frames never share a plane (no z-fighting)
        card.root.translateZ(0.002 + hash01(k + 555) * 0.012);
        k++;
      }
    }
  }
}

// ---------- post helpers: writings, galleries, music, captions ----------
const AUDIO_SHORTCODES = new Set();
const galleryMap = new Map(); // instagram shortcode -> ordered image paths

function buildGalleryMap(paths) {
  // items keyed by shortcode then slide number; a slide with both a .jpg and
  // a .mp4 is a video with a poster
  for (const path of paths) {
    const m = path.match(/\/([^\/]+?)(?:_(\d{1,2}))?\.(jpe?g|png|webp|mp4)$/i);
    if (!m) continue;
    const key = m[1];
    const ord = m[2] ? parseInt(m[2], 10) : 1;
    if (!galleryMap.has(key)) galleryMap.set(key, new Map());
    const slides = galleryMap.get(key);
    if (!slides.has(ord)) slides.set(ord, { ord, img: null, video: null });
    if (m[3].toLowerCase() === 'mp4') slides.get(ord).video = path;
    else slides.get(ord).img = path;
  }
}

function shortcodeOf(post) {
  if (!post.image) return null;
  const m = post.image.match(/\/([^\/]+)\.[a-z0-9]+$/i);
  return m ? m[1] : null;
}

function galleryOf(post) {
  const sc = shortcodeOf(post);
  const slides = sc && galleryMap.get(sc);
  if (slides && slides.size) return Array.from(slides.values()).sort((a, b) => a.ord - b.ord);
  return post.image ? [{ ord: 1, img: post.image, video: null }] : [];
}

function musicFor(post) {
  const sc = shortcodeOf(post);
  return sc && AUDIO_SHORTCODES.has(sc) ? '/audio/' + sc + '.mp3' : null;
}

function isWriting(post) {
  return !((post.tags || []).indexOf('instagram') >= 0);
}

// captionless instagram posts get auto-titles like "@sleepychunk · 2026-07-13"
function captionOf(post) {
  const t = (post.title || '').trim();
  if (!t) return null;
  if (/^@\S+\s*·\s*\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  if (/^photo from @/i.test(t)) return null;
  return t;
}

// character-level wrap that survives CJK text (no spaces needed)
function wrapLines(g, text, maxW) {
  const out = [];
  let line = '';
  for (const ch of String(text)) {
    if (ch === '\n') { out.push(line); line = ''; continue; }
    const test = line + ch;
    if (g.measureText(test).width > maxW && line) {
      const sp = line.lastIndexOf(' ');
      if (sp > 0 && sp > line.length - 14) { out.push(line.slice(0, sp)); line = line.slice(sp + 1) + ch; }
      else { out.push(line); line = ch; }
    } else line = test;
  }
  if (line.trim()) out.push(line);
  return out;
}

// a piece of warm manuscript paper: title, date, opening lines of the writing
function drawWriting(post, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#f4e9d3');
  grad.addColorStop(1, '#e6d3ac');
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(90,58,34,0.4)';
  g.lineWidth = Math.max(2, w / 128);
  g.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
  g.strokeStyle = 'rgba(90,58,34,0.18)';
  g.lineWidth = Math.max(1, w / 256);
  g.strokeRect(w * 0.075, h * 0.075, w * 0.85, h * 0.85);
  const pad = w * 0.13;
  const titleSize = Math.round(w * 0.058);
  g.fillStyle = '#4a3423';
  g.font = '600 ' + titleSize + 'px Georgia, "Songti SC", serif';
  let y = h * 0.16;
  for (const ln of wrapLines(g, post.title || 'untitled', w - pad * 2).slice(0, 2)) {
    g.fillText(ln, pad, y);
    y += titleSize * 1.25;
  }
  g.font = 'italic ' + Math.round(w * 0.032) + 'px Georgia, serif';
  g.fillStyle = 'rgba(90,58,34,0.7)';
  g.fillText(post.date || '', pad, y);
  y += h * 0.055;
  if (post.excerpt) {
    const bodySize = Math.round(w * 0.034);
    g.font = 'italic ' + bodySize + 'px Georgia, "Songti SC", serif';
    g.fillStyle = 'rgba(58,38,22,0.85)';
    const maxLines = Math.floor((h * 0.87 - y) / (bodySize * 1.55));
    const lines = wrapLines(g, post.excerpt, w - pad * 2);
    const shown = lines.slice(0, Math.max(2, maxLines));
    if (lines.length > shown.length) shown[shown.length - 1] += ' …';
    for (const ln of shown) { g.fillText(ln, pad, y); y += bodySize * 1.55; }
  }
  g.fillStyle = 'rgba(140,80,50,0.55)';
  g.font = Math.round(w * 0.05) + 'px Georgia, serif';
  g.fillText('❧', w / 2 - w * 0.025, h * 0.94);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeWritingWallMaterial(post) {
  const tex = drawWriting(post, 256, 256);
  return new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.9, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.28,
  });
}

// ---------- music snippets (instagram audio, keyed by shortcode) ----------
const music = new Audio();
music.preload = 'none';
let musicVol = 0, musicTarget = 0, musicStopTimer = 0;
const SNIPPET_SECONDS = 25;

function playMusic(src) {
  clearTimeout(musicStopTimer);
  const abs = new URL(src, window.location.origin).href;
  if (music.src !== abs) music.src = src;
  try { music.currentTime = 0; } catch (e) { /* not seekable yet */ }
  musicTarget = 1;
  const p = music.play();
  if (p && p.catch) p.catch(() => { /* autoplay refused — stay silent */ });
  musicStopTimer = setTimeout(() => { musicTarget = 0; }, SNIPPET_SECONDS * 1000);
}

function stopMusic(immediate) {
  musicTarget = 0;
  clearTimeout(musicStopTimer);
  if (immediate) {
    musicVol = 0;
    music.volume = 0;
    if (!music.paused) music.pause();
  }
}

fetch('/room-posts.json')
  .then(r => r.json())
  .then(data => {
    const posts = data.posts || data; // tolerate the old flat-array shape
    (data.audio || []).forEach(sc => AUDIO_SHORTCODES.add(sc));
    buildGalleryMap(data.gallery || []);
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
    // cover-crop to the frame's aspect (drawn to a square canvas, un-squeezed by the plane)
    const A = card.aspect || 1;
    let sw = img.width, sh = img.height;
    if (sw / sh > A) sw = sh * A; else sh = sw / A;
    g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, 256, 256);
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
    const cap = captionOf(hovered.post);
    const label = cap || (musicFor(hovered.post) ? '♪ click to listen' : (hovered.post.date || ''));
    tip.innerHTML = '<strong>' + escapeHtml(label) + '</strong><span>' +
      escapeHtml(hovered.post.date || '') + '</span>';
  } else if (tip) {
    tip.style.display = 'none';
  }
});

renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a drag
  if (viewerState.active) {
    // tap a companion -> bring it to front; tap the big photo -> next post; elsewhere -> close
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const active = [];
    for (const comp of companions) if (comp.active) active.push(comp.photo);
    const compHits = raycaster.intersectObjects(active, false);
    if (compHits.length) swapCompanion(compHits[0].object.userData.companionIndex);
    else if (raycaster.intersectObject(viewerPhoto, false).length) viewerNext(1);
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

const viewerCaptionMat = new THREE.MeshBasicMaterial({
  transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const viewerCaption = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), viewerCaptionMat);
viewerCaption.renderOrder = 23;
viewerPanel.add(viewerCaption);
let captionVisible = false;
let captionRatio = 0.3; // canvas height / width, drives the plane shape

// companion planes: the other pictures of a multi-image post, fanned around the main one
const MAX_COMPANIONS = 9;
const companions = [];
for (let ci = 0; ci < MAX_COMPANIONS; ci++) {
  const grp = new THREE.Group();
  const fMat = new THREE.MeshBasicMaterial({
    color: 0x3a2412, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
  });
  const frame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), fMat);
  frame.renderOrder = 21;
  const pMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
  });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), pMat);
  photo.position.z = 0.001;
  photo.renderOrder = 21.2;
  photo.userData.companionIndex = ci;
  grp.add(frame, photo);
  grp.visible = false;
  viewerPanel.add(grp);
  companions.push({ group: grp, frame, photo, frameMat: fMat, photoMat: pMat, active: false, aspect: 1 });
}

const viewerState = { active: false, index: -1, open: 0, slide: 0 };
const fullTexCache = new Map();
let viewerGen = 0;
let viewerAspect = 1;
let mainW = 1.4, mainH = 1.4;

// Full caption text on a translucent panel — every line, not a teaser.
function drawViewerCaption(post) {
  const caption = captionOf(post);
  const hasMusic = !!musicFor(post);
  if (!caption && !hasMusic) {
    captionVisible = false;
    return;
  }
  captionVisible = true;
  const W = 640, pad = 34;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = '500 30px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
  const text = caption || '♪ a little tune from this day';
  const lines = wrapLines(probe, text, W - pad * 2).slice(0, 22);
  const lineH = 42;
  const H = 26 + lines.length * lineH + (hasMusic && caption ? 44 : 0) + 52;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,12,5,0.68)';
  g.beginPath();
  if (g.roundRect) g.roundRect(3, 3, W - 6, H - 6, 20); else g.rect(3, 3, W - 6, H - 6);
  g.fill();
  g.strokeStyle = 'rgba(255,217,160,0.35)';
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = '#ffe6bd';
  g.font = '500 30px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
  let y = 52;
  for (const ln of lines) { g.fillText(ln, pad, y); y += lineH; }
  if (hasMusic && caption) {
    g.fillStyle = '#e8c98a';
    g.font = '400 26px Inter, sans-serif';
    g.fillText('♪ now playing', pad, y);
    y += 44;
  }
  g.font = '400 24px Inter, sans-serif';
  g.fillStyle = '#d9b98c';
  g.fillText(post.date || '', pad, y);
  if (viewerCaptionMat.map) viewerCaptionMat.map.dispose();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  viewerCaptionMat.map = tex;
  viewerCaptionMat.needsUpdate = true;
  captionRatio = H / W;
}

function layoutCompanion(i) {
  const comp = companions[i];
  const side = i % 2 === 0 ? 1 : -1;
  const ring = Math.floor(i / 2);
  const ch = Math.max(0.3, mainH * (0.52 - ring * 0.05));
  const cw = ch * (comp.aspect || 1);
  comp.photo.scale.set(cw, ch, 1);
  comp.frame.scale.set(cw + 0.05, ch + 0.05, 1);
  comp.group.position.set(
    side * (mainW * 0.56 + cw * 0.4 + ring * 0.12),
    ((i % 3) - 1) * mainH * 0.17 + ring * 0.04,
    -0.12 - i * 0.05
  );
  comp.group.rotation.set(0, -side * 0.22, side * (0.05 + 0.02 * ring));
}

function fitViewerPhoto(aspect) {
  const dist = 2.2;
  const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * camera.aspect;
  const maxW = visW * 0.62;
  const maxH = visH * 0.62;
  const a = aspect || 1;
  mainW = maxW; mainH = maxW / a;
  if (mainH > maxH) { mainH = maxH; mainW = maxH * a; }
  viewerPhoto.scale.set(mainW, mainH, 1);
  viewerFrame.scale.set(mainW + 0.08, mainH + 0.08, 1);
  // caption: beside the photo when there's room, tucked under it when not
  const capW = Math.min(1.05, Math.max(0.7, (visW - mainW) * 0.6));
  viewerCaption.scale.set(capW, capW * captionRatio, 1);
  if (visW - mainW > capW + 0.3) {
    viewerCaption.position.set(mainW / 2 + capW / 2 + 0.14, -mainH * 0.06, 0.18);
    viewerCaption.rotation.set(0, -0.2, 0);
  } else {
    viewerCaption.position.set(mainW / 2 - capW / 2, -mainH / 2 - capW * captionRatio / 2 - 0.1, 0.18);
    viewerCaption.rotation.set(-0.12, -0.1, 0);
  }
  for (let i = 0; i < companions.length; i++) if (companions[i].active) layoutCompanion(i);
}

function setViewerTexture(tex, aspect) {
  viewerPhotoMat.map = tex;
  viewerPhotoMat.needsUpdate = true;
  viewerAspect = aspect || 1;
  fitViewerPhoto(viewerAspect);
}

function ensureTexture(src, cb) {
  const cached = fullTexCache.get(src);
  if (cached) { cb(cached.tex, cached.aspect); return; }
  const img = new Image();
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    const aspect = img.width / img.height;
    fullTexCache.set(src, { tex, aspect });
    cb(tex, aspect);
  };
  img.src = src;
}

// shared video element for reels — plays in the main slot with its own audio
const vid = document.createElement('video');
vid.playsInline = true;
vid.loop = true;
vid.preload = 'metadata';
const videoTex = new THREE.VideoTexture(vid);
videoTex.colorSpace = THREE.SRGBColorSpace;

let viewerItems = [];   // slides of the open post: {ord, img, video}
let viewerMainIdx = 0;  // which slide is in the big frame

function renderViewerSlots(gen) {
  const main = viewerItems[viewerMainIdx];
  if (!main) return;
  if (main.video) {
    stopMusic(false); // the reel carries its own sound
    vid.src = main.video;
    vid.volume = 0.9;
    const applyAspect = () => {
      if (gen === viewerGen && vid.videoWidth) {
        setViewerTexture(videoTex, vid.videoWidth / vid.videoHeight);
      }
    };
    vid.onloadedmetadata = applyAspect;
    const p = vid.play();
    if (p && p.catch) p.catch(() => { /* will start on the next tap */ });
    // poster while the video buffers
    if (main.img) ensureTexture(main.img, (tex, a) => {
      if (gen === viewerGen && vid.readyState < 2) setViewerTexture(tex, a);
    });
    applyAspect();
  } else {
    vid.pause();
    if (main.img) ensureTexture(main.img, (tex, a) => {
      if (gen === viewerGen) setViewerTexture(tex, a);
    });
  }
  const others = [];
  for (let ix = 0; ix < viewerItems.length; ix++) if (ix !== viewerMainIdx) others.push(ix);
  for (let i = 0; i < companions.length; i++) {
    const comp = companions[i];
    comp.active = i < others.length;
    comp.group.visible = comp.active;
    if (!comp.active) continue;
    comp.itemIndex = others[i];
    comp.photoMat.map = placeholderTex;
    comp.photoMat.needsUpdate = true;
    comp.aspect = 1;
    layoutCompanion(i);
    const item = viewerItems[others[i]];
    if (item.img) ensureTexture(item.img, (tex, aspect) => {
      if (gen !== viewerGen) return;
      comp.photoMat.map = tex;
      comp.photoMat.needsUpdate = true;
      comp.aspect = aspect;
      layoutCompanion(i);
    });
  }
}

function swapCompanion(i) {
  const comp = companions[i];
  if (!comp.active) return;
  viewerMainIdx = comp.itemIndex;
  renderViewerSlots(viewerGen);
}

function viewerShow(i) {
  const n = cards.length;
  if (!n) return;
  viewerState.index = ((i % n) + n) % n;
  const card = cards[viewerState.index];
  const gen = ++viewerGen;
  drawViewerCaption(card.post);

  if (card.writing) {
    // a writing hangs as a large manuscript page — no companions
    const tune = musicFor(card.post);
    if (tune) playMusic(tune); else stopMusic(false);
    vid.pause();
    const key = 'writing:' + (card.post.url || viewerState.index);
    let cached = fullTexCache.get(key);
    if (!cached) {
      cached = { tex: drawWriting(card.post, 768, 960), aspect: 0.8 };
      fullTexCache.set(key, cached);
    }
    setViewerTexture(cached.tex, cached.aspect);
    viewerItems = [];
    renderViewerSlots(gen);
    return;
  }

  // photo/video post: wall thumbnail immediately, then real slides
  viewerItems = galleryOf(card.post);
  viewerMainIdx = 0;
  const tune = musicFor(card.post);
  const opensWithVideo = viewerItems[0] && viewerItems[0].video;
  if (tune && !opensWithVideo) playMusic(tune); else stopMusic(false);
  const thumb = card.loaded && card.photoMesh.material.map ? card.photoMesh.material.map : placeholderTex;
  setViewerTexture(thumb, card.loaded ? (card.aspect || 1) : 1);
  renderViewerSlots(gen);
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
  stopMusic(false);
  vid.pause();
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
window.__room = { scene, camera, controls, cards, pick: pickCard, viewerOpen, viewerClose, music, vid };

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
    viewerCaptionMat.opacity = op * (captionVisible ? 1 : 0);
    for (const comp of companions) {
      if (!comp.active) continue;
      comp.photoMat.opacity = op * 0.96;
      comp.frameMat.opacity = op * 0.96;
    }
    viewerPanel.scale.setScalar(0.88 + 0.12 * viewerState.open);
  } else {
    viewerGroup.visible = false;
  }

  // music snippet fade in/out
  if (music.src) {
    musicVol += (musicTarget - musicVol) * Math.min(1, dt * (musicTarget ? 1.8 : 3.5));
    music.volume = Math.max(0, Math.min(1, musicVol)) * 0.85;
    if (!musicTarget && musicVol < 0.02 && !music.paused) music.pause();
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
