// The music room — a little live house. Stage + instruments + a glowing wall
// of performance videos (@otonoori). Completely different mood from the tatami room.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildDrums } from './drums.js?v=8';
import { buildGuitar } from './guitar.js?v=8';

const canvasHost = document.getElementById('room-canvas');
const overlay = document.getElementById('room-loading');
const tip = document.getElementById('video-tip');
const hint = document.getElementById('room-hint');

const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE_HINT = IS_TOUCH
  ? 'drag to look around · tap a screen to play · tap away to stop'
  : 'drag to look around · click a screen to play · esc to stop';
const PLAYING_HINT = IS_TOUCH
  ? 'tap another screen to switch · tap away to stop'
  : '← → to switch videos · esc or click away to stop';

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  if (overlay) {
    overlay.innerHTML = '<div class="load-inner"><h1>no WebGL tonight</h1>' +
      '<p><a href="/">back to the room &rarr;</a></p></div>';
  }
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
canvasHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2344);
scene.fog = new THREE.FogExp2(0x2e2848, 0.013);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.05, 60);
camera.position.set(0.6, 2.0, 5.6);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2.0, -4.5);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 1.2;
controls.maxDistance = 11;
controls.maxPolarAngle = 1.6;
renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; }, { once: true });

// ---------- lights: soft dusky pastel — ghibli night, not a club ----------
scene.add(new THREE.AmbientLight(0x6a6090, 1.1));
scene.add(new THREE.HemisphereLight(0x8a78b0, 0x3a2e3c, 0.7));

function spot(color, intensity, pos, target, angle, castShadow) {
  const s = new THREE.SpotLight(color, intensity, 0, angle, 0.45, 1.6);
  s.position.set(pos[0], pos[1], pos[2]);
  s.target.position.set(target[0], target[1], target[2]);
  s.castShadow = !!castShadow;
  if (castShadow) {
    s.shadow.mapSize.set(1024, 1024);
    s.shadow.bias = -0.002;
    s.shadow.normalBias = 0.02;
  }
  scene.add(s, s.target);
  return s;
}
spot(0xffc9a0, 70, [0, 5.6, -2.5], [0, 0.5, -6.0], 0.52, true);  // warm peach key on the stage
spot(0xe8b0c8, 28, [-2.5, 5.6, -2.0], [-2.2, 0.4, -5.8], 0.45);  // soft rose on the guitar
spot(0x9ad0c8, 22, [2.5, 5.6, -2.0], [0.6, 0.4, -5.4], 0.45);    // gentle celadon cross light
const fireGlow = new THREE.PointLight(0xff8a40, 14, 8, 2);       // stove ember pool
fireGlow.position.set(5.0, 0.9, -1.5);
scene.add(fireGlow);
const lampGlow = new THREE.PointLight(0xffcf9a, 10, 6, 2);       // floor lamp by the sofa
lampGlow.position.set(1.6, 1.9, 1.4);
scene.add(lampGlow);
const moonlight = new THREE.DirectionalLight(0x9ab0e8, 0.9);     // round window moon
moonlight.position.set(-8, 3.4, 0.5);
moonlight.target.position.set(0, 1, 0.5);
scene.add(moonlight, moonlight.target);

// ---------- build the venue ----------
const updatables = [];
let exitDoor = null;

import('./stage.js?v=8').then(m => {
  const stage = m.buildStage(THREE);
  scene.add(stage);
  if (stage.userData && typeof stage.userData.update === 'function') updatables.push(stage.userData.update);
  exitDoor = stage.getObjectByName('exitDoor');
}).catch(() => { /* bare stage still works: floor fallback below */ });

// minimal floor fallback so the scene is never a void while stage.js loads
const fallbackFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.MeshStandardMaterial({ color: 0x17151c, roughness: 0.95 })
);
fallbackFloor.rotation.x = -Math.PI / 2;
fallbackFloor.receiveShadow = true;
scene.add(fallbackFloor);

// the band setup, on stage (stage platform top is y = 0.45)
const drums = buildDrums(THREE);
drums.position.set(0, 0.3, -6.2);
scene.add(drums);
const guitar = buildGuitar(THREE);
guitar.position.set(-2.2, 0.3, -5.8);
guitar.rotation.y = 0.5;
scene.add(guitar);

// a second Strat in gloss black (the body extrude uses a material array;
// swapping it turns the sunburst into a black one, pickguard stays white)
const guitar2 = buildGuitar(THREE);
guitar2.position.set(1.8, 0.3, -6.6);
guitar2.rotation.y = -0.45;
const blackBody = new THREE.MeshPhysicalMaterial({
  color: 0x0e0e12, roughness: 0.22, clearcoat: 0.7, clearcoatRoughness: 0.25,
});
guitar2.traverse(o => {
  if (o.isMesh && Array.isArray(o.material)) o.material = [blackBody, blackBody];
});
scene.add(guitar2);

// ---------- dreamcore: floating pastel star-motes + big soft wisps ----------
function glowSprite(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const MOTES = 96;
const motePos = new Float32Array(MOTES * 3);
const moteCol = new Float32Array(MOTES * 3);
const moteSeed = [];
const PASTELS = [
  [1.0, 0.79, 0.63], [0.91, 0.69, 0.78], [0.68, 0.63, 0.9],
  [0.63, 0.87, 0.82], [1.0, 0.92, 0.75],
];
for (let i = 0; i < MOTES; i++) {
  motePos[i * 3] = (Math.random() * 2 - 1) * 7.4;
  motePos[i * 3 + 1] = 0.3 + Math.random() * 5.4;
  motePos[i * 3 + 2] = (Math.random() * 2 - 1) * 7.4;
  const c = PASTELS[i % PASTELS.length];
  moteCol[i * 3] = c[0]; moteCol[i * 3 + 1] = c[1]; moteCol[i * 3 + 2] = c[2];
  moteSeed.push([Math.random() * Math.PI * 2, 0.05 + Math.random() * 0.12]);
}
const moteGeo = new THREE.BufferGeometry();
moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
moteGeo.setAttribute('color', new THREE.BufferAttribute(moteCol, 3));
const moteMat = new THREE.PointsMaterial({
  size: 0.13, map: glowSprite(64), transparent: true, opacity: 0.85,
  vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false,
});
const motes = new THREE.Points(moteGeo, moteMat);
scene.add(motes);

const wisps = [];
const wispTex = glowSprite(128);
for (let i = 0; i < 7; i++) {
  const c = PASTELS[i % PASTELS.length];
  const sm = new THREE.SpriteMaterial({
    map: wispTex, transparent: true, opacity: 0.35,
    color: new THREE.Color(c[0], c[1], c[2]),
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const sp = new THREE.Sprite(sm);
  const s = 0.35 + Math.random() * 0.35;
  sp.scale.set(s, s, 1);
  scene.add(sp);
  wisps.push({
    sp, mat: sm,
    ax: (Math.random() * 2 - 1) * 5.5, az: (Math.random() * 2 - 1) * 5.5,
    ay: 1.2 + Math.random() * 3.6,
    rx: 0.8 + Math.random() * 1.6, ry: 0.4 + Math.random() * 0.8,
    sx: 0.05 + Math.random() * 0.1, sy: 0.07 + Math.random() * 0.09,
    ph: Math.random() * Math.PI * 2,
  });
}

// ---------- video wall ----------
const WALL = { cols: 4, rows: 3, x0: -3.3, x1: 3.3, y0: 1.05, y1: 4.95, z: -7.84 };
const PER_PAGE = WALL.cols * WALL.rows;
const bayW = (WALL.x1 - WALL.x0) / WALL.cols;
const bayH = (WALL.y1 - WALL.y0) / WALL.rows;
const screenGeom = new THREE.PlaneGeometry(bayW * 0.66, bayH * 0.92); // portrait-ish for reels
const screenOffMat = new THREE.MeshStandardMaterial({
  color: 0x0d0b14, roughness: 0.4, emissive: 0x141020, emissiveIntensity: 0.6,
});

const screens = [];
const screensGroup = new THREE.Group();
scene.add(screensGroup);
for (let r = 0; r < WALL.rows; r++) {
  for (let c = 0; c < WALL.cols; c++) {
    const mesh = new THREE.Mesh(screenGeom, screenOffMat);
    mesh.position.set(
      WALL.x0 + bayW * (c + 0.5),
      WALL.y1 - bayH * (r + 0.5),
      WALL.z
    );
    mesh.userData.screenIndex = screens.length;
    screensGroup.add(mesh);
    screens.push({ mesh, video: null, loaded: false, loading: false });
  }
}

// paging arrows (only shown when needed)
function arrowMesh(dir) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(255,138,196,0.9)';
  g.beginPath();
  if (dir > 0) { g.moveTo(38, 24); g.lineTo(96, 64); g.lineTo(38, 104); }
  else { g.moveTo(90, 24); g.lineTo(32, 64); g.lineTo(90, 104); }
  g.closePath();
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  m.position.set(dir > 0 ? 4.05 : -4.05, 3.0, WALL.z + 0.02);
  m.userData.pageDir = dir;
  m.visible = false;
  scene.add(m);
  return m;
}
const nextArrow = arrowMesh(1);
const prevArrow = arrowMesh(-1);

let videos = [];  // {code, caption, video, poster}
let page = 0;

fetch('/music-room.json?t=' + Math.floor(Date.now() / 600000))
  .then(r => r.json())
  .then(data => {
    const byCode = new Map();
    for (const p of data.files || []) {
      const m = p.match(/\/([^\/]+)\.(mp4|jpe?g)$/i);
      if (!m) continue;
      if (!byCode.has(m[1])) byCode.set(m[1], {});
      byCode.get(m[1])[m[2].toLowerCase() === 'mp4' ? 'video' : 'poster'] = p;
    }
    const meta = new Map((data.videos || []).map(v => [v.code, v]));
    videos = Array.from(byCode.entries())
      .filter(([, v]) => v.video)
      .map(([code, v]) => ({
        code, video: v.video, poster: v.poster || null,
        caption: (meta.get(code) || {}).caption || '',
        ts: (meta.get(code) || {}).ts || 0,
      }))
      .sort((a, b) => b.ts - a.ts);
    applyPage();
  })
  .catch(() => { /* empty wall */ });

function applyPage() {
  const maxPage = Math.max(0, Math.ceil(videos.length / PER_PAGE) - 1);
  page = Math.min(Math.max(0, page), maxPage);
  nextArrow.visible = page < maxPage;
  prevArrow.visible = page > 0;
  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const v = videos[page * PER_PAGE + i] || null;
    s.video = v;
    s.loaded = false;
    s.loading = false;
    s.mesh.material = screenOffMat;
    s.mesh.visible = !!v;
    if (v && v.poster) loadPoster(s, v.poster);
  }
}

function loadPoster(s, src) {
  s.loading = true;
  const img = new Image();
  img.onload = () => {
    if (s.video && s.video.poster !== src) return; // page changed meanwhile
    const c = document.createElement('canvas');
    c.width = 256; c.height = 384;
    const g = c.getContext('2d');
    const A = (bayW * 0.66) / (bayH * 0.92);
    let sw = img.width, sh = img.height;
    if (sw / sh > A) sw = sh * A; else sh = sw / A;
    g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, 256, 384);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    s.mesh.material = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55,
    });
    s.loaded = true;
    s.loading = false;
  };
  img.onerror = () => { s.loading = false; };
  img.src = src;
}

// ---------- the player: one big screen floating over the stage ----------
const vid = document.createElement('video');
vid.playsInline = true;
vid.loop = true;
vid.preload = 'metadata';
const videoTex = new THREE.VideoTexture(vid);
videoTex.colorSpace = THREE.SRGBColorSpace;

const playerMat = new THREE.MeshBasicMaterial({
  map: videoTex, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const playerFrameMat = new THREE.MeshBasicMaterial({
  color: 0x14101e, transparent: true, opacity: 0, depthTest: false, depthWrite: false,
});
const playerGroup = new THREE.Group();
playerGroup.visible = false;
scene.add(playerGroup);
const playerFrame = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), playerFrameMat);
playerFrame.renderOrder = 20;
playerGroup.add(playerFrame);
const player = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), playerMat);
player.position.z = 0.002;
player.renderOrder = 21;
playerGroup.add(player);

const playerState = { active: false, index: -1, open: 0 };

function playerFit() {
  const a = vid.videoWidth && vid.videoHeight ? vid.videoWidth / vid.videoHeight : 0.5625;
  const maxH = 3.2, maxW = 4.6;
  let h = maxH, w = maxH * a;
  if (w > maxW) { w = maxW; h = maxW / a; }
  player.scale.set(w, h, 1);
  playerFrame.scale.set(w + 0.12, h + 0.12, 1);
}

function playerOpen(globalIndex) {
  const v = videos[globalIndex];
  if (!v) return;
  playerState.active = true;
  playerState.index = globalIndex;
  // show the poster immediately — a black rectangle while a reel buffers on
  // cellular reads as "not playing"
  const slot = globalIndex - page * PER_PAGE;
  const posterMap = slot >= 0 && slot < screens.length && screens[slot].loaded
    ? screens[slot].mesh.material.map : null;
  playerMat.map = posterMap || videoTex;
  playerMat.needsUpdate = true;
  vid.onplaying = () => {
    if (playerState.active && playerState.index === globalIndex) {
      playerMat.map = videoTex;
      playerMat.needsUpdate = true;
    }
  };
  vid.src = v.video;
  vid.preload = 'auto';
  vid.muted = false;
  vid.volume = 0.95;
  vid.onloadedmetadata = playerFit;
  const p = vid.play();
  if (p && p.catch) p.catch(() => {
    vid.muted = true;
    const q = vid.play();
    if (q && q.catch) q.catch(() => {});
  });
  playerFit();
  playerGroup.visible = true;
  if (hint) hint.textContent = PLAYING_HINT;
  if (tip) tip.style.display = 'none';
}

function playerClose() {
  playerState.active = false;
  vid.pause();
  if (hint) hint.textContent = BASE_HINT;
}

function playerSwitch(dir) {
  if (!videos.length) return;
  const n = videos.length;
  const i = ((playerState.index + dir) % n + n) % n;
  page = Math.floor(i / PER_PAGE);
  applyPage();
  playerOpen(i);
}

window.addEventListener('keydown', (e) => {
  if (!playerState.active) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); playerSwitch(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); playerSwitch(-1); }
  else if (e.key === 'Escape') playerClose();
});

// ---------- picking ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;
let hoveredScreen = null;

function castAt(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
}

renderer.domElement.addEventListener('pointermove', (e) => {
  if (IS_TOUCH) return;
  castAt(e.clientX, e.clientY);
  const hits = raycaster.intersectObjects(screensGroup.children, false);
  const s = hits.length ? screens[hits[0].object.userData.screenIndex] : null;
  hoveredScreen = s && s.video ? s : null;
  const arrowHit = raycaster.intersectObjects([nextArrow, prevArrow].filter(a => a.visible), false).length > 0;
  const doorHit = exitDoor ? raycaster.intersectObject(exitDoor, true).length > 0 : false;
  renderer.domElement.style.cursor = (hoveredScreen || arrowHit || doorHit) ? 'pointer' : 'grab';
  if (hoveredScreen && tip && !playerState.active) {
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top = (e.clientY + 14) + 'px';
    const cap = (hoveredScreen.video.caption || '').split('\n')[0].slice(0, 90);
    tip.innerHTML = '<strong>' + cap.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])) + (cap ? '' : '▶ play') + '</strong>';
  } else if (tip) {
    tip.style.display = 'none';
  }
});

renderer.domElement.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  castAt(e.clientX, e.clientY);
  // door first — it works whether or not a video is playing
  if (exitDoor && raycaster.intersectObject(exitDoor, true).length) {
    window.location.href = '/';
    return;
  }
  const arrows = [nextArrow, prevArrow].filter(a => a.visible);
  const arrowHits = raycaster.intersectObjects(arrows, false);
  if (arrowHits.length) {
    page += arrowHits[0].object.userData.pageDir;
    applyPage();
    return;
  }
  const hits = raycaster.intersectObjects(screensGroup.children, false);
  if (hits.length) {
    const s = screens[hits[0].object.userData.screenIndex];
    if (s.video) {
      playerOpen(page * PER_PAGE + hits[0].object.userData.screenIndex);
      return;
    }
  }
  if (playerState.active) playerClose();
});

// ---------- loop ----------
const clock = new THREE.Clock();
let firstFrame = true;
window.__music = { scene, camera, controls, screens, playerOpen, playerClose, vid };

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  controls.update();
  for (const fn of updatables) fn(t, dt);
  // ember flicker
  fireGlow.intensity = 14 + Math.sin(t * 9.1) * 1.6 + Math.sin(t * 23.7) * 0.9;

  // dream-light: motes rise and sway, wisps drift on slow orbits
  if (!REDUCED_MOTION) {
    const pos = moteGeo.attributes.position;
    for (let i = 0; i < MOTES; i++) {
      let y = pos.getY(i) + moteSeed[i][1] * dt;
      if (y > 5.8) y = 0.25;
      pos.setY(i, y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.32 + moteSeed[i][0]) * 0.0009);
    }
    pos.needsUpdate = true;
    moteMat.opacity = 0.75 + Math.sin(t * 0.8) * 0.15;
    for (const w of wisps) {
      w.sp.position.set(
        w.ax + Math.sin(t * w.sx + w.ph) * w.rx,
        w.ay + Math.sin(t * w.sy + w.ph * 2) * w.ry,
        w.az + Math.cos(t * w.sx + w.ph) * w.rx
      );
      w.mat.opacity = 0.28 + Math.sin(t * 0.5 + w.ph) * 0.1;
    }
  }

  const target = playerState.active ? 1 : 0;
  playerState.open += (target - playerState.open) * Math.min(1, dt * 6);
  if (playerState.open > 0.01) {
    playerGroup.visible = true;
    playerGroup.position.set(0, 2.6, -5.4);
    if (!REDUCED_MOTION) {
      playerGroup.position.y += Math.sin(t * 0.7) * 0.02;
      playerGroup.rotation.z = Math.sin(t * 0.4) * 0.004;
    }
    playerGroup.lookAt(camera.position.x, 2.4, camera.position.z);
    playerMat.opacity = playerState.open;
    playerFrameMat.opacity = playerState.open * 0.9;
    playerGroup.scale.setScalar(0.9 + 0.1 * playerState.open);
  } else {
    playerGroup.visible = false;
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
