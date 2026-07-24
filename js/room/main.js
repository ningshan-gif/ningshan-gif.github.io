// Main scene for the 3D room homepage.
// Builders live in ./: shell, guitar, dog, desk, fruits — each exports build*(THREE) -> Group.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildShell } from './shell.js?v=9';
import { buildGuitar } from './guitar.js?v=9';
import { buildDog } from './dog.js?v=9';
import { buildDesk } from './desk.js?v=9';
import { buildFruits } from './fruits.js?v=9';

const canvasHost = document.getElementById('room-canvas');
const overlay = document.getElementById('room-loading');
const tip = document.getElementById('card-tip');
const hint = document.getElementById('room-hint');
const musicBar = document.getElementById('music-bar');
const mbTitle = document.getElementById('mb-title');
const mbArtist = document.getElementById('mb-artist');
const mbYt = document.getElementById('mb-yt');

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
const WRITING_HINT = IS_TOUCH
  ? 'tap the right page to turn · left page goes back · tap away to close'
  : '← → or click a page to turn it · esc closes';
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
// unlock audio at the very first touch anywhere — costs nothing on desktop
window.addEventListener('pointerdown', () => { primeMusic(); }, { once: true });

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

// Optional modules (drums, plants, art) — the room still works while they don't exist yet.
Promise.allSettled([import('./drums.js?v=9'), import('./plants.js?v=9'), import('./art.js?v=9')]).then(([d, p, a]) => {
  if (a.status === 'fulfilled') place(a.value.buildArt(THREE), 0, 0, 0);
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

// ---------- the way to the music room: glowing sign by the instruments ----------
const musicSign = new THREE.Group();
(function buildMusicSign() {
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.026, 1.15, 10),
    new THREE.MeshStandardMaterial({ color: 0x2a2024, roughness: 0.6 })
  );
  post.position.y = 0.575;
  post.castShadow = true;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 224;
  const g = c.getContext('2d');
  g.fillStyle = '#14101e';
  g.fillRect(0, 0, 512, 224);
  g.strokeStyle = 'rgba(255,138,196,0.9)';
  g.lineWidth = 6;
  g.strokeRect(10, 10, 492, 204);
  g.fillStyle = '#ff9ecb';
  g.font = '600 62px "Darker Grotesque", Inter, sans-serif';
  g.fillText('♪ the music room', 40, 100);
  g.fillStyle = '#4ae0d0';
  g.font = '500 42px Inter, sans-serif';
  g.fillText('live videos this way →', 40, 172);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.32),
    new THREE.MeshStandardMaterial({
      map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.15, roughness: 0.6,
    })
  );
  panel.position.y = 1.28;
  musicSign.add(post, panel);
  musicSign.position.set(-2.25, 0, -5.15);
  musicSign.rotation.y = 0.25;
  scene.add(musicSign);
})();

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
// small gold ♪ badge for frames whose post carries a tune
const noteTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.beginPath();
  g.arc(32, 32, 28, 0, Math.PI * 2);
  g.fillStyle = 'rgba(26,15,7,0.78)';
  g.fill();
  g.strokeStyle = 'rgba(255,217,160,0.8)';
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = '#ffd9a0';
  g.font = '600 34px Georgia, serif';
  g.fillText('♪', 17, 44);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();
const noteMat = new THREE.MeshBasicMaterial({ map: noteTex, transparent: true });
const noteGeom = new THREE.PlaneGeometry(0.11, 0.11);

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
  if (hasTuneFor(post)) {
    const note = new THREE.Mesh(noteGeom, noteMat);
    note.position.set(fw / 2 - 0.1, -(fh / 2) + 0.1, 0.022);
    note.userData.cardIndex = idx;
    root.add(note);
  }
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

const MUSIC_META = {}; // shortcode -> {title, artist, file} (local preview excerpts)

function musicFor(post) {
  const sc = shortcodeOf(post);
  if (!sc) return null;
  if (AUDIO_SHORTCODES.has(sc)) return '/audio/' + sc + '.mp3'; // full local mp3 wins
  const m = MUSIC_META[sc];
  return (m && m.file) || null; // local ~30s excerpt: instant + mobile-safe
}

function musicLabelFor(post) {
  const sc = shortcodeOf(post);
  const m = sc && MUSIC_META[sc];
  if (m && m.title) return { name: m.title, artist: m.artist || '' };
  const raw = sc && MUSIC_QUERIES[sc];
  return raw ? { name: raw, artist: '' } : null;
}

// songs named in _data/post_music.yml, resolved to ~30s iTunes previews on demand
const MUSIC_QUERIES = {};
const previewCache = new Map();

function musicQueryFor(post) {
  const sc = shortcodeOf(post);
  return (sc && MUSIC_QUERIES[sc]) || null;
}

function hasTuneFor(post) {
  return !!(musicFor(post) || musicQueryFor(post));
}

// Mobile browsers only allow audio started inside the tap itself. Preview URLs
// arrive async, so we "prime" the element with a silent clip synchronously in
// the gesture — once an element has played from a gesture, later src swaps
// are allowed to play too.
const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACAgICA';
let musicPrimed = false;
function primeMusic() {
  if (musicPrimed) return;
  try {
    music.src = SILENT_WAV;
    music.volume = 0;
    const p = music.play();
    if (p && p.then) p.then(() => { musicPrimed = true; }).catch(() => {});
  } catch (e) { /* priming is best-effort */ }
}

// Chinese/Japanese tracks often only exist in the TW/JP iTunes stores.
function resolvePreview(q) {
  const hasCJK = /[぀-ヿ㐀-鿿]/.test(q);
  const stores = hasCJK ? ['tw', 'jp', 'us'] : ['us', 'tw', 'jp'];
  let chain = Promise.resolve(null);
  for (const c of stores) {
    chain = chain.then(meta => meta ||
      fetch('https://itunes.apple.com/search?media=music&limit=1&country=' + c + '&term=' + encodeURIComponent(q))
        .then(r => r.json())
        .then(d => {
          const r0 = d.results && d.results[0];
          return r0 && r0.previewUrl
            ? { url: r0.previewUrl, name: r0.trackName || '', artist: r0.artistName || '' }
            : null;
        })
        .catch(() => null));
  }
  return chain;
}

function playMusicQuery(q, gen) {
  const hit = previewCache.get(q);
  if (hit) {
    if (hit.url) {
      playMusic(hit.url);
      showMusicBar(hit.name || q, hit.artist);
    }
    return;
  }
  primeMusic(); // synchronously, while the tap still counts
  resolvePreview(q).then(meta => {
    previewCache.set(q, meta || { url: null });
    if (meta && meta.url && viewerState.active && gen === viewerGen) {
      playMusic(meta.url);
      showMusicBar(meta.name || q, meta.artist);
    }
  });
}

function isWriting(post) {
  return !((post.tags || []).indexOf('instagram') >= 0);
}

// captionless instagram posts carry filler titles — treat them all as "no caption"
function captionOf(post) {
  const t = (post.title || '').trim();
  if (!t) return null;
  if (/^instagram post$/i.test(t)) return null;
  if (/^@\S+\s*[·•\-–]\s*[\d\-\/.]+$/.test(t)) return null;
  if (/^photo from @/i.test(t)) return null;
  return t;
}

const POST_CAPTIONS = {}; // shortcode -> full caption straight from Instagram

// titles were historically truncated by the sync — prefer the caption captured
// from Instagram itself, then the post body, then the title
function fullCaptionOf(post) {
  const t = captionOf(post);
  if (isWriting(post)) return t; // writings show their text as the book
  const sc = shortcodeOf(post);
  const igCap = sc && POST_CAPTIONS[sc];
  if (igCap) return igCap;
  let b = String(post.body || '');
  if (!b.trim()) return t;
  b = b.replace(/@[\w.]+\s*·[^\n]*$/m, '');      // trailing attribution line
  b = b.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(); // gallery debris
  if (b && (!t || b.length > t.length)) return b;
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
  if (music.src !== abs) {
    music.src = src;
    musicVol = 0;          // fresh fade-in for a new song
    music.volume = 0;
  }
  try { music.currentTime = 0; } catch (e) { /* not seekable yet */ }
  musicTarget = 1;
  const p = music.play();
  if (p && p.catch) p.catch(() => { /* autoplay refused — stay silent */ });
  musicStopTimer = setTimeout(() => { musicTarget = 0; }, SNIPPET_SECONDS * 1000);
}

function stopMusic(immediate) {
  musicTarget = 0;
  clearTimeout(musicStopTimer);
  hideMusicBar();
  if (immediate) {
    musicVol = 0;
    music.volume = 0;
    if (!music.paused) music.pause();
  }
}

// the now-playing bar: song, artist, and a YouTube link
function showMusicBar(name, artist) {
  if (!musicBar || !name) return;
  mbTitle.textContent = name;
  mbArtist.textContent = artist || '';
  mbYt.href = 'https://www.youtube.com/results?search_query=' +
    encodeURIComponent((name + ' ' + (artist || '')).trim());
  musicBar.classList.add('on');
}
function hideMusicBar() {
  if (musicBar) musicBar.classList.remove('on');
}

fetch('/room-posts.json?t=' + Math.floor(Date.now() / 600000))
  .then(r => r.json())
  .then(data => {
    const posts = data.posts || data; // tolerate the old flat-array shape
    (data.audio || []).forEach(sc => AUDIO_SHORTCODES.add(sc));
    Object.assign(MUSIC_QUERIES, data.music || {});
    Object.assign(MUSIC_META, data.musicMeta || {});
    Object.assign(POST_CAPTIONS, data.captions || {});
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
  // the music-room sign glows under the cursor
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObject(musicSign, true).length) {
    if (hovered) { hovered.targetScale = hovered.baseScale; hovered = null; }
    renderer.domElement.style.cursor = 'pointer';
    if (tip) {
      tip.style.display = 'block';
      tip.style.left = (e.clientX + 14) + 'px';
      tip.style.top = (e.clientY + 14) + 'px';
      tip.innerHTML = '<strong>♪ enter the music room</strong>';
    }
    return;
  }
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
    const hasTune = hasTuneFor(hovered.post);
    const label = cap ? (hasTune ? '♪ ' + cap : cap)
      : (hasTune ? '♪ click to listen' : (hovered.post.date || ''));
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
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (book.active) {
      // right page turns forward, left page turns back, elsewhere closes
      if (raycaster.intersectObjects([pageR, turnFront], false).length) flipBook(1);
      else if (raycaster.intersectObjects([pageL, turnBack], false).length) flipBook(-1);
      else viewerClose();
      return;
    }
    // tap a companion -> bring it to front; tap the big photo -> next post; elsewhere -> close
    const active = [];
    for (const comp of companions) if (comp.active) active.push(comp.photo);
    const compHits = raycaster.intersectObjects(active, false);
    if (compHits.length) swapCompanion(compHits[0].object.userData.companionIndex);
    else if (raycaster.intersectObject(viewerPhoto, false).length) viewerNext(1);
    else viewerClose();
    return;
  }
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.intersectObject(musicSign, true).length) {
    window.location.href = '/music-room/';
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
const MAX_COMPANIONS = 19; // posts can carry 20 slides — show them all
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

// ---------- the book: writings open as an old flippable manuscript ----------
const PAGE_W = 0.72, PAGE_H = 0.98;
const bookGroup = new THREE.Group();
bookGroup.visible = false;
bookGroup.rotation.x = -0.1; // lecturn tilt
viewerPanel.add(bookGroup);

const bookMats = [];
function bookBasic(extra) {
  const m = new THREE.MeshBasicMaterial(Object.assign(
    { transparent: true, opacity: 0, depthTest: false, depthWrite: false }, extra));
  bookMats.push(m);
  return m;
}
const coverMat = bookBasic({ color: 0x4a3020 });
const cover = new THREE.Mesh(new THREE.PlaneGeometry(PAGE_W * 2 + 0.09, PAGE_H + 0.07), coverMat);
cover.position.z = -0.012;
cover.renderOrder = 21;
bookGroup.add(cover);

const pageGeom = new THREE.PlaneGeometry(PAGE_W, PAGE_H);
const pageLMat = bookBasic({ color: 0xffffff });
const pageL = new THREE.Mesh(pageGeom, pageLMat);
pageL.position.set(-PAGE_W / 2, 0, 0);
pageL.renderOrder = 22;
bookGroup.add(pageL);
const pageRMat = bookBasic({ color: 0xffffff });
const pageR = new THREE.Mesh(pageGeom, pageRMat);
pageR.position.set(PAGE_W / 2, 0, 0);
pageR.renderOrder = 22;
bookGroup.add(pageR);

// the turning leaf pivots at the spine; front and back faces carry different
// pages. Segmented geometry so the paper CURLS while it turns.
const TURN_SEGS = 18;
const turnGeomF = new THREE.PlaneGeometry(PAGE_W, PAGE_H, TURN_SEGS, 1);
const turnGeomB = new THREE.PlaneGeometry(PAGE_W, PAGE_H, TURN_SEGS, 1);
const turnGroup = new THREE.Group();
turnGroup.position.z = 0.004;
bookGroup.add(turnGroup);
const turnFrontMat = bookBasic({ color: 0xffffff });
const turnFront = new THREE.Mesh(turnGeomF, turnFrontMat);
turnFront.position.x = PAGE_W / 2;
turnFront.renderOrder = 23;
turnGroup.add(turnFront);
const turnBackMat = bookBasic({ color: 0xffffff });
const turnBack = new THREE.Mesh(turnGeomB, turnBackMat);
turnBack.position.x = PAGE_W / 2;
turnBack.rotation.y = Math.PI;
turnBack.renderOrder = 23;
turnGroup.add(turnBack);
turnGroup.visible = false;

// bow the leaf: amp > 0 bulges toward the reader mid-flight
function bendTurnLeaf(amp) {
  const pf = turnGeomF.attributes.position;
  const pb = turnGeomB.attributes.position;
  for (let i = 0; i < pf.count; i++) {
    const u = (pf.getX(i) + PAGE_W / 2) / PAGE_W; // 0 at spine, 1 at free edge
    const z = Math.sin(u * Math.PI) * amp;
    pf.setZ(i, z);
    pb.setZ(i, -z); // mirrored so both faces stay coincident after the π flip
  }
  pf.needsUpdate = true;
  pb.needsUpdate = true;
}

// a soft paper swish, synthesized — no audio files needed
let swishCtx = null;
function flipSwish() {
  try {
    swishCtx = swishCtx || new (window.AudioContext || window.webkitAudioContext)();
    const dur = 0.3;
    const buf = swishCtx.createBuffer(1, Math.floor(swishCtx.sampleRate * dur), swishCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(t * Math.PI), 2) * (0.35 + 0.65 * t);
    }
    const src = swishCtx.createBufferSource();
    src.buffer = buf;
    const filt = swishCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 950;
    filt.Q.value = 0.7;
    const gain = swishCtx.createGain();
    gain.gain.value = 0.15;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(swishCtx.destination);
    src.start();
  } catch (e) { /* silence is fine */ }
}

const book = { active: false, spread: 0, pages: [], post: null, turning: 0, prog: 0 };
const bookPageCache = new Map();

// aged-paper page canvas: title block on the first leaf, body lines, page number
function bookPageTexture(post, pageIndex) {
  const key = 'booktex:' + post.url + ':' + pageIndex;
  const hit = fullTexCache.get(key);
  if (hit) return hit.tex;
  // high-resolution pages so the text stays crisp up close
  const BW = 1024, BH = 1392, padX = 108;
  const c = document.createElement('canvas');
  c.width = BW; c.height = BH;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, BW, BH);
  grad.addColorStop(0, '#f0e4c8');
  grad.addColorStop(1, '#e2d0a8');
  g.fillStyle = grad;
  g.fillRect(0, 0, BW, BH);
  // edge age + gutter shading (gutter is the spine side)
  const leftLeaf = pageIndex % 2 === 0;
  const gutterX = leftLeaf ? BW : 0;
  const gsh = g.createLinearGradient(gutterX, 0, gutterX === 0 ? 120 : BW - 120, 0);
  gsh.addColorStop(0, 'rgba(90,60,30,0.28)');
  gsh.addColorStop(1, 'rgba(90,60,30,0)');
  g.fillStyle = gsh;
  g.fillRect(0, 0, BW, BH);
  g.strokeStyle = 'rgba(110,80,44,0.35)';
  g.lineWidth = 4;
  g.strokeRect(12, 12, BW - 24, BH - 24);
  const page = book.pages[pageIndex];
  const ink = '#3a2a1c';
  let y = 148;
  if (page && page.first) {
    g.fillStyle = ink;
    g.font = '600 68px Georgia, "Songti SC", serif';
    const probeLines = wrapLines(g, post.title || 'untitled', BW - padX * 2).slice(0, 3);
    for (const ln of probeLines) { g.fillText(ln, padX, y); y += 88; }
    g.font = 'italic 44px Georgia, serif';
    g.fillStyle = 'rgba(90,58,34,0.75)';
    g.fillText(post.date || '', padX, y + 8);
    y += 68;
    g.fillStyle = 'rgba(140,80,50,0.6)';
    g.font = '52px Georgia, serif';
    g.fillText('❧', BW / 2 - 24, y + 12);
    y += 80;
  }
  if (page) {
    g.fillStyle = ink;
    g.font = '50px Georgia, "Songti SC", serif';
    for (const ln of page.lines) { g.fillText(ln, padX, y); y += 68; }
  }
  g.fillStyle = 'rgba(90,58,34,0.6)';
  g.font = 'italic 40px Georgia, serif';
  g.fillText(String(pageIndex + 1), leftLeaf ? padX : BW - padX - 28, BH - 52);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  fullTexCache.set(key, { tex, aspect: BW / BH });
  return tex;
}

function paginateWriting(post) {
  const key = 'bookpages:' + post.url;
  let pages = bookPageCache.get(key);
  if (pages) return pages;
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = '50px Georgia, "Songti SC", serif';
  const raw = String(post.body || post.excerpt || '').trim().replace(/\n{2,}/g, '\n \n');
  const lines = wrapLines(probe, raw, 1024 - 108 * 2);
  const perPage = 17;
  const firstPageLines = 10;
  pages = [];
  let idx = 0;
  pages.push({ first: true, lines: lines.slice(0, firstPageLines) });
  idx = firstPageLines;
  while (idx < lines.length) {
    pages.push({ first: false, lines: lines.slice(idx, idx + perPage) });
    idx += perPage;
  }
  if (pages.length % 2 === 1) pages.push({ first: false, lines: [] }); // even leaves
  bookPageCache.set(key, pages);
  return pages;
}

function applySpread() {
  const post = book.post;
  const li = book.spread * 2;
  pageLMat.map = bookPageTexture(post, li);
  pageLMat.needsUpdate = true;
  pageRMat.map = bookPageTexture(post, li + 1);
  pageRMat.needsUpdate = true;
}

function openBook(post) {
  book.active = true;
  book.post = post;
  book.pages = paginateWriting(post);
  book.spread = 0;
  book.turning = 0;
  turnGroup.visible = false;
  turnGroup.rotation.y = 0;
  applySpread();
  // fit the open book to the view
  const dist = 2.2;
  const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * camera.aspect;
  const s = Math.min(1.3, (visH * 0.72) / PAGE_H, (visW * 0.88) / (PAGE_W * 2));
  bookGroup.scale.setScalar(s);
  bookGroup.visible = true;
}

function closeBook() {
  book.active = false;
  bookGroup.visible = false;
}

function flipBook(dir) {
  if (!book.active || book.turning) return;
  const maxSpread = Math.ceil(book.pages.length / 2) - 1;
  if (dir > 0 && book.spread >= maxSpread) { viewerNext(1); return; }
  if (dir < 0 && book.spread <= 0) { viewerNext(-1); return; }
  const post = book.post;
  book.turning = dir;
  book.prog = 0;
  turnGroup.visible = true;
  if (dir > 0) {
    turnFrontMat.map = bookPageTexture(post, book.spread * 2 + 1);
    turnBackMat.map = bookPageTexture(post, (book.spread + 1) * 2);
    pageRMat.map = bookPageTexture(post, (book.spread + 1) * 2 + 1);
    turnGroup.rotation.y = 0;
  } else {
    turnFrontMat.map = bookPageTexture(post, (book.spread - 1) * 2 + 1);
    turnBackMat.map = bookPageTexture(post, book.spread * 2);
    pageLMat.map = bookPageTexture(post, (book.spread - 1) * 2);
    turnGroup.rotation.y = -Math.PI;
  }
  turnFrontMat.needsUpdate = turnBackMat.needsUpdate = pageLMat.needsUpdate = pageRMat.needsUpdate = true;
  flipSwish();
}

const captionSheet = document.getElementById('caption-sheet');
const csText = document.getElementById('cs-text');
const csDate = document.getElementById('cs-date');

// Full caption text on a translucent panel — every line, not a teaser.
// On phones the 3D panel is unreadable, so an HTML sheet takes over there.
function drawViewerCaption(post) {
  const caption = fullCaptionOf(post);
  const hasMusic = hasTuneFor(post);
  if (IS_TOUCH && captionSheet) {
    captionVisible = false;
    csText.textContent = caption || '';
    csDate.textContent = post.date || '';
    captionSheet.classList.add('on');
    return;
  }
  captionVisible = true;
  // high-resolution panel so long captions read crisply
  const W = 960, pad = 50;
  const probe = document.createElement('canvas').getContext('2d');
  // no caption, no music -> a small date-only chip (never say "instagram post")
  const text = caption || (hasMusic ? '♪ a little tune from this day' : '');
  // every line shows — long captions shrink their type instead of truncating
  let fontPx = 44;
  probe.font = '500 44px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
  let lines = text ? wrapLines(probe, text, W - pad * 2) : [];
  if (lines.length > 26) {
    fontPx = 34;
    probe.font = '500 34px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
    lines = wrapLines(probe, text, W - pad * 2);
  }
  const lineH = Math.round(fontPx * 1.42);
  const H = 40 + lines.length * lineH + (hasMusic && caption ? 66 : 0) + 78;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,12,5,0.68)';
  g.beginPath();
  if (g.roundRect) g.roundRect(4, 4, W - 8, H - 8, 30); else g.rect(4, 4, W - 8, H - 8);
  g.fill();
  g.strokeStyle = 'rgba(255,217,160,0.35)';
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = '#ffe6bd';
  g.font = '500 ' + fontPx + 'px Inter, "PingFang SC", "Hiragino Sans GB", sans-serif';
  let y = 34 + fontPx;
  for (const ln of lines) { g.fillText(ln, pad, y); y += lineH; }
  if (hasMusic && caption) {
    g.fillStyle = '#e8c98a';
    g.font = '400 38px Inter, sans-serif';
    g.fillText('♪ now playing', pad, y);
    y += 66;
  }
  g.font = '400 34px Inter, sans-serif';
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
  // caption: beside the photo when there's room, tucked under it when not.
  // very long captions cap at the view height rather than overflowing it
  let capW = Math.min(1.05, Math.max(0.7, (visW - mainW) * 0.6));
  if (capW * captionRatio > visH * 0.78) capW = (visH * 0.78) / captionRatio;
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
    vid.muted = false;
    vid.volume = 0.9;
    const applyAspect = () => {
      if (gen === viewerGen && vid.videoWidth) {
        setViewerTexture(videoTex, vid.videoWidth / vid.videoHeight);
      }
    };
    vid.onloadedmetadata = applyAspect;
    const p = vid.play();
    if (p && p.catch) p.catch(() => {
      // strict mobile autoplay: at least play silently rather than freeze
      vid.muted = true;
      const q = vid.play();
      if (q && q.catch) q.catch(() => { /* will start on the next tap */ });
    });
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
  if (hint && viewerState.active) hint.textContent = card.writing ? WRITING_HINT : VIEWER_HINT;

  if (card.writing) {
    // writings open as an old book holding the whole piece
    const tune = musicFor(card.post);
    const q = tune ? null : musicQueryFor(card.post);
    if (tune) {
      playMusic(tune);
      const lbl = musicLabelFor(card.post);
      if (lbl) showMusicBar(lbl.name, lbl.artist);
    } else { stopMusic(false); if (q) playMusicQuery(q, gen); }
    vid.pause();
    viewerItems = [];
    for (const comp of companions) { comp.active = false; comp.group.visible = false; }
    if (captionSheet) captionSheet.classList.remove('on'); // the book IS the text
    openBook(card.post);
    return;
  }

  // photo/video post: wall thumbnail immediately, then real slides
  closeBook();
  viewerItems = galleryOf(card.post);
  viewerMainIdx = 0;
  const tune = musicFor(card.post);
  const q = tune ? null : musicQueryFor(card.post);
  const opensWithVideo = viewerItems[0] && viewerItems[0].video;
  if (opensWithVideo) stopMusic(false);
  else if (tune) {
    playMusic(tune);
    const lbl = musicLabelFor(card.post);
    if (lbl) showMusicBar(lbl.name, lbl.artist);
  } else { stopMusic(false); if (q) playMusicQuery(q, gen); }
  const thumb = card.loaded && card.photoMesh.material.map ? card.photoMesh.material.map : placeholderTex;
  setViewerTexture(thumb, card.loaded ? (card.aspect || 1) : 1);
  renderViewerSlots(gen);
}

function viewerOpen(i) {
  primeMusic(); // inside the click — keeps mobile happy for everything that follows
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
  closeBook();
  if (captionSheet) captionSheet.classList.remove('on');
}

function viewerNext(dir) {
  viewerState.slide = dir * 0.5;
  viewerShow(viewerState.index + dir);
}

window.addEventListener('keydown', (e) => {
  if (!viewerState.active) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); book.active ? flipBook(1) : viewerNext(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); book.active ? flipBook(-1) : viewerNext(-1); }
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
    viewerPhotoMat.opacity = op * (book.active ? 0 : 1);
    viewerFrameMat.opacity = op * (book.active ? 0 : 1);
    viewerCaptionMat.opacity = op * (captionVisible && !book.active ? 1 : 0);
    for (const m of bookMats) m.opacity = book.active ? op : 0;
    if (book.turning) {
      book.prog += dt * 1.25;
      const pr = Math.min(1, book.prog);
      const ease = pr * pr * (3 - 2 * pr); // smoothstep — paper settles gently
      turnGroup.rotation.y = book.turning > 0 ? -ease * Math.PI : -(1 - ease) * Math.PI;
      bendTurnLeaf(Math.sin(pr * Math.PI) * 0.1); // the sheet bows mid-flight
      if (pr >= 1) {
        book.spread += book.turning > 0 ? 1 : -1;
        book.turning = 0;
        turnGroup.visible = false;
        turnGroup.rotation.y = 0;
        bendTurnLeaf(0);
        applySpread();
      }
    }
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
