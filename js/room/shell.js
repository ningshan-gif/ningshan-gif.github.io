// shell.js — Japanese wooden / Ghibli-style room shell: tatami, shoji glow,
// post-and-beam walls, washi lantern. Exports buildShell(THREE). No imports.
// Interior 14 x 5 x 14 m centered at origin, floor top y=0, ceiling y=5.

// ---------------------------------------------------------------- utilities

function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function srgbTex(THREE, canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------- textures

// Tatami: 6 mats (2 cols x 3 rows) with fine horizontal weave + dark borders.
function makeTatamiTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#c9b87a';
  x.fillRect(0, 0, 512, 512);
  x.strokeStyle = 'rgba(138,118,62,0.38)';
  x.lineWidth = 1;
  for (let y = 0; y < 512; y += 3) {
    x.beginPath();
    x.moveTo(0, y + 0.5);
    x.lineTo(512, y + 0.5);
    x.stroke();
  }
  const mh = 512 / 3;
  for (let r = 0; r < 3; r++) {
    for (let cc = 0; cc < 2; cc++) {
      if ((r + cc) % 2) {
        x.fillStyle = 'rgba(255,244,198,0.07)';
        x.fillRect(cc * 256, r * mh, 256, mh);
      }
    }
  }
  const rand = makeRng(7);
  x.fillStyle = 'rgba(92,80,40,0.10)';
  for (let i = 0; i < 2400; i++) {
    x.fillRect(rand() * 512, rand() * 512, 2, 1);
  }
  // dark fabric border strips between mats + outer edge
  x.fillStyle = '#2a2018';
  x.fillRect(0, 0, 512, 4);
  x.fillRect(0, 508, 512, 4);
  x.fillRect(0, 0, 4, 512);
  x.fillRect(508, 0, 4, 512);
  x.fillRect(254, 0, 4, 512);
  x.fillRect(0, Math.round(mh) - 2, 512, 4);
  x.fillRect(0, Math.round(2 * mh) - 2, 512, 4);
  return srgbTex(THREE, c);
}

// Dark polished walkway planks.
function makePlankTexture(THREE, base, dark, seed) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  const rand = makeRng(seed);
  x.fillStyle = base;
  x.fillRect(0, 0, 512, 512);
  const rows = 8;
  for (let r = 0; r < rows; r++) {
    const y0 = r * 64;
    x.fillStyle = 'rgba(255,220,170,' + (0.03 + rand() * 0.05).toFixed(3) + ')';
    x.fillRect(0, y0, 512, 64);
    x.strokeStyle = dark;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(0, y0 + 0.5);
    x.lineTo(512, y0 + 0.5);
    x.stroke();
    // grain streaks
    x.strokeStyle = 'rgba(30,18,8,0.18)';
    x.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const gy = y0 + 6 + rand() * 52;
      x.beginPath();
      x.moveTo(rand() * 200, gy);
      x.lineTo(rand() * 200 + 300, gy + rand() * 4 - 2);
      x.stroke();
    }
    // butt joint
    const jx = rand() * 512;
    x.strokeStyle = dark;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(jx, y0);
    x.lineTo(jx, y0 + 64);
    x.stroke();
  }
  return srgbTex(THREE, c);
}

// Wainscot: vertical planks.
function makeWainscotTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const x = c.getContext('2d');
  const rand = makeRng(31);
  x.fillStyle = '#7a5230';
  x.fillRect(0, 0, 256, 128);
  for (let px = 0; px < 256; px += 32) {
    x.fillStyle = 'rgba(255,220,170,' + (0.02 + rand() * 0.06).toFixed(3) + ')';
    x.fillRect(px, 0, 32, 128);
    x.strokeStyle = 'rgba(38,22,10,0.7)';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(px + 0.5, 0);
    x.lineTo(px + 0.5, 128);
    x.stroke();
    x.strokeStyle = 'rgba(40,24,12,0.25)';
    x.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const gx = px + 4 + rand() * 24;
      x.beginPath();
      x.moveTo(gx, 0);
      x.lineTo(gx + rand() * 4 - 2, 128);
      x.stroke();
    }
  }
  return srgbTex(THREE, c);
}

// Open-window view: golden evening sky, Mount Fuji (violet + snow cap), and the sea.
function makeFujiSeaTexture(THREE) {
  const w = 768, h = 768;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  const HOR = 0.63; // horizon line
  // sky
  const sky = x.createLinearGradient(0, 0, 0, h * HOR);
  sky.addColorStop(0, '#ffe6b0');
  sky.addColorStop(0.6, '#ffc27a');
  sky.addColorStop(1, '#ff9a58');
  x.fillStyle = sky;
  x.fillRect(0, 0, w, h * HOR + 2);
  // low sun
  x.save();
  x.filter = 'blur(12px)';
  x.fillStyle = 'rgba(255,248,224,0.95)';
  x.beginPath();
  x.arc(w * 0.26, h * 0.5, w * 0.05, 0, Math.PI * 2);
  x.fill();
  x.restore();
  // Mount Fuji — violet-blue, hazy at the base, never green
  x.save();
  x.filter = 'blur(2px)';
  const mg = x.createLinearGradient(0, h * 0.16, 0, h * HOR);
  mg.addColorStop(0, 'rgba(90,74,120,0.95)');
  mg.addColorStop(0.8, 'rgba(138,106,136,0.55)');
  mg.addColorStop(1, 'rgba(158,126,140,0.2)');
  x.fillStyle = mg;
  x.beginPath();
  x.moveTo(w * 0.02, h * HOR);
  x.bezierCurveTo(w * 0.26, h * 0.56, w * 0.4, h * 0.24, w * 0.455, h * 0.185);
  x.lineTo(w * 0.545, h * 0.185);
  x.bezierCurveTo(w * 0.6, h * 0.24, w * 0.74, h * 0.56, w * 0.98, h * HOR);
  x.closePath();
  x.fill();
  // snow cap
  x.fillStyle = 'rgba(255,250,244,0.97)';
  x.beginPath();
  x.moveTo(w * 0.455, h * 0.185);
  x.lineTo(w * 0.545, h * 0.185);
  x.bezierCurveTo(w * 0.565, h * 0.22, w * 0.575, h * 0.26, w * 0.585, h * 0.31);
  const zig = [
    [0.565, 0.285], [0.552, 0.325], [0.535, 0.285], [0.518, 0.33],
    [0.5, 0.29], [0.482, 0.33], [0.465, 0.285], [0.448, 0.325], [0.435, 0.283],
  ];
  for (let i = 0; i < zig.length; i++) x.lineTo(w * zig[i][0], h * zig[i][1]);
  x.lineTo(w * 0.415, h * 0.31);
  x.bezierCurveTo(w * 0.425, h * 0.26, w * 0.435, h * 0.22, w * 0.455, h * 0.185);
  x.closePath();
  x.fill();
  x.restore();
  // the sea
  const sea = x.createLinearGradient(0, h * HOR, 0, h);
  sea.addColorStop(0, '#5a86a0');
  sea.addColorStop(0.35, '#3d6a84');
  sea.addColorStop(1, '#27455c');
  x.fillStyle = sea;
  x.fillRect(0, h * HOR, w, h * (1 - HOR));
  // sun glints on the water
  const rand = makeRng(97);
  for (let i = 0; i < 90; i++) {
    const gy = HOR + (1 - HOR) * Math.pow(rand(), 1.6);
    const spread = 0.1 + (gy - HOR) * 1.3;
    const gx = 0.26 + (rand() - 0.5) * spread + (rand() - 0.5) * 0.5;
    const gw = w * (0.008 + rand() * 0.03) * (0.4 + (gy - HOR) * 3);
    x.fillStyle = 'rgba(255,222,168,' + (0.14 + rand() * 0.32).toFixed(2) + ')';
    x.fillRect(w * gx - gw / 2, h * gy, gw, Math.max(2, h * 0.004));
  }
  // horizon haze
  x.save();
  x.filter = 'blur(10px)';
  x.fillStyle = 'rgba(255,220,170,0.4)';
  x.fillRect(-20, h * (HOR - 0.02), w + 40, h * 0.045);
  x.restore();
  // two little boats
  x.fillStyle = 'rgba(42,34,30,0.85)';
  for (const [bx, by, bs] of [[0.34, 0.72, 1], [0.63, 0.68, 0.7]]) {
    x.beginPath();
    x.moveTo(w * bx - 14 * bs, h * by);
    x.quadraticCurveTo(w * bx, h * by + 9 * bs, w * bx + 14 * bs, h * by);
    x.closePath();
    x.fill();
    x.fillStyle = 'rgba(255,246,230,0.9)';
    x.beginPath();
    x.moveTo(w * bx + 2 * bs, h * by - 2 * bs);
    x.lineTo(w * bx + 2 * bs, h * by - 16 * bs);
    x.lineTo(w * bx - 8 * bs, h * by - 3 * bs);
    x.closePath();
    x.fill();
    x.fillStyle = 'rgba(42,34,30,0.85)';
  }
  return srgbTex(THREE, c);
}

// Warm golden washi paper glow with soft foliage silhouettes.
// With `fuji` set, a distant Mount Fuji silhouette shows through the paper.
function makeWashiGlowTexture(THREE, w, h, top, mid, bot, blobs, bandY, fuji) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, top);
  gr.addColorStop(0.5, mid);
  gr.addColorStop(1, bot);
  x.fillStyle = gr;
  x.fillRect(0, 0, w, h);
  const rand = makeRng(53);
  if (fuji) {
    x.save();
    x.filter = 'blur(3px)';
    // low sun behind the mountain
    x.fillStyle = 'rgba(255,246,220,0.9)';
    x.beginPath();
    x.arc(w * 0.2, h * 0.58, w * 0.04, 0, Math.PI * 2);
    x.fill();
    // mountain body — wide graceful cone, hazy at the base
    const mg = x.createLinearGradient(0, h * 0.22, 0, h * 0.82);
    mg.addColorStop(0, 'rgba(116,100,134,0.9)');
    mg.addColorStop(0.75, 'rgba(146,120,138,0.45)');
    mg.addColorStop(1, 'rgba(160,132,140,0.12)');
    x.fillStyle = mg;
    x.beginPath();
    x.moveTo(w * 0.08, h * 0.82);
    x.bezierCurveTo(w * 0.3, h * 0.74, w * 0.42, h * 0.32, w * 0.465, h * 0.27);
    x.lineTo(w * 0.535, h * 0.27);
    x.bezierCurveTo(w * 0.58, h * 0.32, w * 0.7, h * 0.74, w * 0.92, h * 0.82);
    x.closePath();
    x.fill();
    // snow cap with an irregular melt line
    x.fillStyle = 'rgba(255,250,244,0.95)';
    x.beginPath();
    x.moveTo(w * 0.465, h * 0.27);
    x.lineTo(w * 0.535, h * 0.27);
    x.bezierCurveTo(w * 0.555, h * 0.3, w * 0.565, h * 0.34, w * 0.575, h * 0.39);
    const zig = [
      [0.558, 0.365], [0.545, 0.405], [0.528, 0.365], [0.512, 0.41],
      [0.5, 0.37], [0.487, 0.41], [0.47, 0.365], [0.455, 0.4], [0.443, 0.362],
    ];
    for (let i = 0; i < zig.length; i++) x.lineTo(w * zig[i][0], h * zig[i][1]);
    x.lineTo(w * 0.425, h * 0.39);
    x.bezierCurveTo(w * 0.435, h * 0.34, w * 0.445, h * 0.3, w * 0.465, h * 0.27);
    x.closePath();
    x.fill();
    // horizon haze
    x.filter = 'blur(' + Math.round(h / 36) + 'px)';
    x.fillStyle = 'rgba(255,224,180,0.5)';
    x.fillRect(-20, h * 0.78, w + 40, h * 0.12);
    x.restore();
  }
  if (blobs > 0) {
    x.save();
    x.filter = 'blur(' + Math.round(w / 60) + 'px)';
    x.fillStyle = 'rgba(154,160,74,0.25)';
    for (let i = 0; i < blobs; i++) {
      const bx = rand() * w;
      const by = h * (0.15 + rand() * 0.7);
      const cluster = 3 + Math.floor(rand() * 4);
      for (let k = 0; k < cluster; k++) {
        x.beginPath();
        x.ellipse(
          bx + (rand() - 0.5) * w * 0.08,
          by + (rand() - 0.5) * h * 0.16,
          w * (0.02 + rand() * 0.035),
          h * (0.05 + rand() * 0.08),
          rand() * Math.PI,
          0, Math.PI * 2
        );
        x.fill();
      }
    }
    x.restore();
  }
  // slightly brighter horizontal band (low evening sun) at eye level
  x.save();
  x.filter = 'blur(' + Math.round(h / 12) + 'px)';
  x.fillStyle = 'rgba(255,241,208,0.38)';
  x.fillRect(-20, h * bandY - h * 0.07, w + 40, h * 0.14);
  x.restore();
  // faint paper fiber noise
  x.fillStyle = 'rgba(120,90,50,0.05)';
  for (let i = 0; i < 500; i++) {
    x.fillRect(rand() * w, rand() * h, 2, 1);
  }
  return srgbTex(THREE, c);
}

// Wood plank ceiling.
function makeCeilingTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d');
  const rand = makeRng(97);
  x.fillStyle = '#6a4526';
  x.fillRect(0, 0, 512, 512);
  for (let r = 0; r < 8; r++) {
    const y0 = r * 64;
    x.fillStyle = 'rgba(255,214,160,' + (0.02 + rand() * 0.05).toFixed(3) + ')';
    x.fillRect(0, y0, 512, 64);
    x.strokeStyle = 'rgba(42,26,12,0.8)';
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(0, y0 + 0.5);
    x.lineTo(512, y0 + 0.5);
    x.stroke();
    x.strokeStyle = 'rgba(46,28,14,0.22)';
    x.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const gy = y0 + 8 + rand() * 48;
      x.beginPath();
      x.moveTo(0, gy);
      x.lineTo(512, gy + rand() * 6 - 3);
      x.stroke();
    }
  }
  return srgbTex(THREE, c);
}

// Ink-brush landscape for the hanging scroll.
function makeScrollTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 720;
  const x = c.getContext('2d');
  x.fillStyle = '#efe2c8';
  x.fillRect(0, 0, 256, 720);
  // paper mottling
  const rand = makeRng(11);
  x.fillStyle = 'rgba(180,150,100,0.06)';
  for (let i = 0; i < 260; i++) {
    x.fillRect(rand() * 256, rand() * 720, 3, 2);
  }
  // three soft mountain strokes
  const mount = function (baseY, peakX, peakY, alpha, blur) {
    x.save();
    x.filter = 'blur(' + blur + 'px)';
    x.fillStyle = 'rgba(40,42,48,' + alpha + ')';
    x.beginPath();
    x.moveTo(-10, baseY);
    x.quadraticCurveTo(peakX * 0.5, baseY - (baseY - peakY) * 0.4, peakX, peakY);
    x.quadraticCurveTo(peakX + 60, peakY + (baseY - peakY) * 0.55, 266, baseY - 8);
    x.lineTo(266, baseY + 26);
    x.lineTo(-10, baseY + 26);
    x.closePath();
    x.fill();
    x.restore();
  };
  mount(300, 150, 150, 0.55, 2);
  mount(360, 70, 240, 0.30, 4);
  mount(420, 200, 330, 0.16, 6);
  // thin ink mist line
  x.save();
  x.filter = 'blur(5px)';
  x.fillStyle = 'rgba(60,62,66,0.12)';
  x.fillRect(0, 430, 256, 14);
  x.restore();
  // red seal square
  x.fillStyle = '#b03020';
  x.fillRect(206, 560, 22, 22);
  x.fillStyle = '#efe2c8';
  x.fillRect(211, 565, 5, 5);
  x.fillRect(219, 570, 4, 7);
  return srgbTex(THREE, c);
}

// ---------------------------------------------------------------- factory

export function buildShell(THREE) {
  const g = new THREE.Group();
  const PI = Math.PI;

  // ---- shared materials -------------------------------------------------
  const M = {
    post: new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.8 }),
    darkTrim: new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.8 }),
    plaster: new THREE.MeshStandardMaterial({ color: 0xd9bd93, roughness: 0.95 }),
    shojiFrame: new THREE.MeshStandardMaterial({ color: 0x2e1d10, roughness: 0.7 }),
    wainTrim: new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.75 }),
    shelfWood: new THREE.MeshStandardMaterial({ color: 0x42291a, roughness: 0.75 }),
    leafA: new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.9 }),
    leafB: new THREE.MeshStandardMaterial({ color: 0x6a9a55, roughness: 0.9 })
  };
  const box = function (wx, wy, wz, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(wx, wy, wz), mat);
  };

  // ---- 1. floor: tatami center + light wood walkway border ---------------
  const walkMat = new THREE.MeshStandardMaterial({
    map: makePlankTexture(THREE, '#c99e63', 'rgba(122,82,48,0.6)', 41),
    roughness: 0.55
  });
  walkMat.map.wrapS = walkMat.map.wrapT = THREE.RepeatWrapping;
  walkMat.map.repeat.set(3.5, 3.5);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), walkMat);
  walk.rotation.x = -PI / 2;
  walk.position.y = 0;
  walk.receiveShadow = true;
  g.add(walk);

  const tatamiMat = new THREE.MeshStandardMaterial({
    map: makeTatamiTexture(THREE),
    roughness: 0.9
  });
  const tatami = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), tatamiMat);
  tatami.rotation.x = -PI / 2;
  tatami.position.y = 0.012;
  tatami.receiveShadow = true;
  g.add(tatami);
  // thin dark edge trim where tatami platform meets walkway
  const edgeGeoA = new THREE.BoxGeometry(10.08, 0.024, 0.04);
  for (let i = 0; i < 4; i++) {
    const e = new THREE.Mesh(edgeGeoA, M.darkTrim);
    e.position.y = 0.012;
    if (i < 2) e.position.z = i === 0 ? -5.02 : 5.02;
    else {
      e.rotation.y = PI / 2;
      e.position.x = i === 2 ? -5.02 : 5.02;
    }
    g.add(e);
  }

  // ---- 2. walls: post-and-beam with plaster infill ----------------------
  const wainMat = new THREE.MeshStandardMaterial({
    map: makeWainscotTexture(THREE),
    roughness: 0.8
  });
  wainMat.map.wrapS = THREE.RepeatWrapping;
  wainMat.map.repeat.set(6, 1);
  const postGeo = new THREE.BoxGeometry(0.14, 5, 0.14);

  // Wall local space: u along local +x in [-7,7], y up, inward = local +z.
  function makeWall(opts) {
    const w = new THREE.Group();
    const plasterSegs = opts.plasterSegs || [[-7, 7, 0, 5]];
    for (let i = 0; i < plasterSegs.length; i++) {
      const s = plasterSegs[i];
      const p = new THREE.Mesh(
        new THREE.PlaneGeometry(s[1] - s[0], s[3] - s[2]), M.plaster);
      p.position.set((s[0] + s[1]) / 2, (s[2] + s[3]) / 2, 0);
      p.receiveShadow = true;
      w.add(p);
    }
    (opts.posts || []).forEach(function (u) {
      const p = new THREE.Mesh(postGeo, M.post);
      p.position.set(u, 2.5, 0.03);
      p.castShadow = true;
      p.receiveShadow = true;
      w.add(p);
    });
    (opts.railSegs || []).forEach(function (s) {
      const r = box(s[1] - s[0], 0.1, 0.06, M.post);
      r.position.set((s[0] + s[1]) / 2, 2.6, 0.05);
      r.receiveShadow = true;
      w.add(r);
    });
    if (opts.plate !== false) {
      const tp = box(14, 0.14, 0.1, M.post);
      tp.position.set(0, 4.6, 0.06);
      tp.receiveShadow = true;
      w.add(tp);
    }
    (opts.wainSegs || []).forEach(function (s) {
      const wp = new THREE.Mesh(
        new THREE.PlaneGeometry(s[1] - s[0], 0.9), wainMat);
      wp.position.set((s[0] + s[1]) / 2, 0.45, 0.012);
      wp.receiveShadow = true;
      w.add(wp);
      const tr = box(s[1] - s[0], 0.04, 0.05, M.wainTrim);
      tr.position.set((s[0] + s[1]) / 2, 0.92, 0.03);
      w.add(tr);
    });
    (opts.baseSegs || [[-7, 7]]).forEach(function (s) {
      const b = box(s[1] - s[0], 0.1, 0.05, M.darkTrim);
      b.position.set((s[0] + s[1]) / 2, 0.05, 0.028);
      w.add(b);
    });
    w.rotation.y = opts.rotY;
    w.position.copy(opts.pos);
    return w;
  }

  // -Z wall (u = worldX). Photo zone x in [0.3,4.9], y in [1.5,3.5] kept bare.
  const wallNZ = makeWall({
    rotY: 0,
    pos: new THREE.Vector3(0, 0, -7),
    posts: [-6.93, -3.5, 0, 6.93],
    railSegs: [[-6.86, 0.3], [4.9, 6.86]],
    wainSegs: [[-6.86, 6.86]]
  });
  g.add(wallNZ);

  // +Z wall (rotY=PI, u = -worldX). Sliding door at worldX 4.2 -> u -4.2.
  const wallPZ = makeWall({
    rotY: PI,
    pos: new THREE.Vector3(0, 0, 7),
    posts: [-6.93, 0, 3.5, 6.93],
    railSegs: [[-6.86, 6.86]],
    wainSegs: [[-6.86, -5.05], [-3.35, 6.86]],
    baseSegs: [[-7, -5.05], [-3.35, 7]]
  });
  g.add(wallPZ);

  // +X wall (rotY=-PI/2, u = worldZ). Photo zone z in [-2.8,2.8] bare.
  const wallPX = makeWall({
    rotY: -PI / 2,
    pos: new THREE.Vector3(7, 0, 0),
    posts: [-6.93, -3.5, 3.5, 6.93],
    railSegs: [[-6.86, -2.8], [2.8, 6.86]],
    wainSegs: [[-6.86, 6.86]]
  });
  g.add(wallPX);

  // -X wall (rotY=PI/2, u = -worldZ): shoji window wall, plaster only
  // around the big opening (u in [-5.5,5.5], y in [0.35,4.1]).
  const wallNX = makeWall({
    rotY: PI / 2,
    pos: new THREE.Vector3(-7, 0, 0),
    plasterSegs: [
      [-7, 7, 4.1, 5],
      [-7, 7, 0, 0.35],
      [-7, -5.5, 0.35, 4.1],
      [5.5, 7, 0.35, 4.1]
    ],
    posts: [-6.93, 6.93],
    railSegs: [],
    wainSegs: []
  });
  g.add(wallNX);

  // ---- 3. shoji window wall glow + lattice (into wallNX local space) ----
  const windowGlowMat = new THREE.MeshStandardMaterial({
    color: 0x332211,
    emissive: 0xffffff,
    emissiveMap: makeWashiGlowTexture(
      THREE, 1024, 512, '#ffe2ae', '#ffc27a', '#e89050', 0, 0.66, false),
    emissiveIntensity: 1.6,
    roughness: 1
  });
  const winGlow = new THREE.Mesh(new THREE.PlaneGeometry(11, 3.75), windowGlowMat);
  winGlow.position.set(0, 2.225, -0.05);
  wallNX.add(winGlow);
  // open middle bay: clear view of Mount Fuji and the sea (center panel slides aside)
  const viewMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0xffffff,
    emissiveMap: makeFujiSeaTexture(THREE),
    emissiveIntensity: 1.7,
    roughness: 1
  });
  const openView = new THREE.Mesh(new THREE.PlaneGeometry(11 / 3, 3.75), viewMat);
  openView.position.set(0, 2.225, -0.045);
  wallNX.add(openView);
  // sill + header
  const sill = box(11.4, 0.09, 0.18, M.shojiFrame);
  sill.position.set(0, 0.32, 0.05);
  sill.castShadow = false;
  wallNX.add(sill);
  const header = box(11.4, 0.09, 0.14, M.shojiFrame);
  header.position.set(0, 4.14, 0.04);
  wallNX.add(header);
  // 3 sliding shoji panels with kumiko lattice
  const pw = 11 / 3;
  const vFrameGeo = new THREE.BoxGeometry(0.07, 3.75, 0.045);
  const hFrameGeo = new THREE.BoxGeometry(pw, 0.09, 0.045);
  const vBarGeo = new THREE.BoxGeometry(0.03, 3.75 - 0.18, 0.028);
  const hBarGeo = new THREE.BoxGeometry(pw - 0.14, 0.03, 0.028);
  // center panel (p=1) is slid open, stacked just past the left panel
  const bayX = [-5.5 + pw * 0.5, -5.5 + pw * 0.68, -5.5 + pw * 2.5];
  for (let p = 0; p < 3; p++) {
    const cx = bayX[p];
    const cy = 2.225;
    const zf = 0.02 - p * 0.004; // slight overlap like sliding tracks
    const fl = new THREE.Mesh(vFrameGeo, M.shojiFrame);
    fl.position.set(cx - pw / 2 + 0.035, cy, zf);
    const fr = new THREE.Mesh(vFrameGeo, M.shojiFrame);
    fr.position.set(cx + pw / 2 - 0.035, cy, zf);
    const ft = new THREE.Mesh(hFrameGeo, M.shojiFrame);
    ft.position.set(cx, cy + 3.75 / 2 - 0.045, zf);
    const fb = new THREE.Mesh(hFrameGeo, M.shojiFrame);
    fb.position.set(cx, cy - 3.75 / 2 + 0.045, zf);
    wallNX.add(fl, fr, ft, fb);
    for (let i = 1; i < 7; i++) { // 6 inner bars -> 7 columns
      const vb = new THREE.Mesh(vBarGeo, M.shojiFrame);
      vb.position.set(cx - pw / 2 + (pw / 7) * i, cy, zf - 0.006);
      wallNX.add(vb);
    }
    for (let i = 1; i < 5; i++) { // 4 inner bars -> 5 rows
      const hb = new THREE.Mesh(hBarGeo, M.shojiFrame);
      hb.position.set(cx, cy - 3.75 / 2 + (3.75 / 5) * i, zf - 0.006);
      wallNX.add(hb);
    }
  }

  // ---- 4. shoji transom on the -Z wall (worldX -6..-1.5, y 3.6..4.4) ----
  const transomMat = new THREE.MeshStandardMaterial({
    color: 0x332211,
    emissive: 0xffffff,
    emissiveMap: makeWashiGlowTexture(
      THREE, 512, 128, '#ffe9c0', '#ffd9a0', '#f0b070', 6, 0.55),
    emissiveIntensity: 1.3,
    roughness: 1
  });
  const trGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.8), transomMat);
  trGlow.position.set(-3.75, 4.0, 0.01);
  wallNZ.add(trGlow);
  const trTop = box(4.62, 0.06, 0.05, M.shojiFrame);
  trTop.position.set(-3.75, 4.43, 0.03);
  const trBot = box(4.62, 0.06, 0.05, M.shojiFrame);
  trBot.position.set(-3.75, 3.57, 0.03);
  wallNZ.add(trTop, trBot);
  const trVGeo = new THREE.BoxGeometry(0.05, 0.92, 0.05);
  const trBarGeo = new THREE.BoxGeometry(0.025, 0.8, 0.022);
  for (let i = 0; i <= 10; i++) {
    const u = -6 + (4.5 / 10) * i;
    const bar = new THREE.Mesh(i === 0 || i === 10 ? trVGeo : trBarGeo,
      M.shojiFrame);
    bar.position.set(u, 4.0, i === 0 || i === 10 ? 0.03 : 0.024);
    wallNZ.add(bar);
  }
  const trMid = box(4.5, 0.024, 0.022, M.shojiFrame);
  trMid.position.set(-3.75, 4.0, 0.024);
  wallNZ.add(trMid);

  // ---- 5. shoji sliding door on the +Z wall (worldX 4.2 -> u -4.2) ------
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x554433,
    emissive: 0xffffff,
    emissiveMap: makeWashiGlowTexture(
      THREE, 256, 512, '#ffe4b8', '#ffd9a0', '#eab27e', 4, 0.6),
    emissiveIntensity: 0.5,
    roughness: 1
  });
  const du = -4.2;
  const doorPaper = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 2.02),
    doorMat);
  doorPaper.position.set(du, 1.11, 0.02);
  wallPZ.add(doorPaper);
  const dV = new THREE.BoxGeometry(0.08, 2.2, 0.05);
  const dH = new THREE.BoxGeometry(1.7, 0.09, 0.05);
  const dvl = new THREE.Mesh(dV, M.shojiFrame);
  dvl.position.set(du - 0.81, 1.1, 0.045);
  const dvr = new THREE.Mesh(dV, M.shojiFrame);
  dvr.position.set(du + 0.81, 1.1, 0.045);
  const dht = new THREE.Mesh(dH, M.shojiFrame);
  dht.position.set(du, 2.155, 0.045);
  const dhb = new THREE.Mesh(dH, M.shojiFrame);
  dhb.position.set(du, 0.1, 0.045);
  wallPZ.add(dvl, dvr, dht, dhb);
  const dvBar = new THREE.BoxGeometry(0.028, 1.96, 0.026);
  const dhBar = new THREE.BoxGeometry(1.54, 0.028, 0.026);
  for (let i = 1; i < 4; i++) {
    const b = new THREE.Mesh(dvBar, M.shojiFrame);
    b.position.set(du - 0.85 + (1.7 / 4) * i, 1.11, 0.035);
    wallPZ.add(b);
  }
  for (let i = 1; i < 5; i++) {
    const b = new THREE.Mesh(dhBar, M.shojiFrame);
    b.position.set(du, 0.14 + (1.94 / 5) * i, 0.035);
    wallPZ.add(b);
  }
  // recessed round finger pull
  const pullRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.008, 8, 20), M.darkTrim);
  pullRing.position.set(du - 0.62, 0.95, 0.048);
  wallPZ.add(pullRing);
  const pullBack = new THREE.Mesh(new THREE.CircleGeometry(0.033, 16),
    new THREE.MeshStandardMaterial({ color: 0x1c120a, roughness: 0.9 }));
  pullBack.position.set(du - 0.62, 0.95, 0.044);
  wallPZ.add(pullBack);

  // ---- 6. ceiling: wood planks + beams + cross battens ------------------
  const ceilMat = new THREE.MeshStandardMaterial({
    map: makeCeilingTexture(THREE),
    roughness: 0.85
  });
  ceilMat.map.wrapS = ceilMat.map.wrapT = THREE.RepeatWrapping;
  ceilMat.map.repeat.set(3, 3);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), ceilMat);
  ceil.rotation.x = PI / 2;
  ceil.position.y = 5;
  ceil.receiveShadow = true;
  g.add(ceil);
  const beamGeo = new THREE.BoxGeometry(14, 0.16, 0.16);
  [-3.5, 0, 3.5].forEach(function (z) {
    const b = new THREE.Mesh(beamGeo, M.darkTrim);
    b.position.set(0, 4.92, z);
    b.castShadow = false;
    b.receiveShadow = true;
    g.add(b);
  });
  const battenGeo = new THREE.BoxGeometry(0.07, 0.07, 14);
  [-5.25, -3.5, -1.75, 0, 1.75, 3.5, 5.25].forEach(function (x) {
    const b = new THREE.Mesh(battenGeo, M.post);
    b.position.set(x, 4.965, 0);
    b.castShadow = false;
    g.add(b);
  });

  // ---- 7. square washi pendant lantern (bulb at exactly y=3.45) ---------
  const lantern = new THREE.Group();
  const cordMat = new THREE.MeshStandardMaterial({ color: 0x241812, roughness: 0.9 });
  const cordGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.5, 6);
  const cordL = new THREE.Mesh(cordGeo, cordMat);
  cordL.position.set(-0.09, 4.77, 0);
  cordL.rotation.z = 0.36;
  const cordR = new THREE.Mesh(cordGeo, cordMat);
  cordR.position.set(0.09, 4.77, 0);
  cordR.rotation.z = -0.36;
  lantern.add(cordL, cordR);
  const canopy = box(0.16, 0.05, 0.16, M.shojiFrame);
  canopy.position.y = 4.53;
  lantern.add(canopy);
  const drop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.76, 6), cordMat);
  drop.position.y = 4.15;
  lantern.add(drop);
  // lantern body: 0.62 wide x 0.34 tall, bottom edge y=3.41, top y=3.75
  const lanternPaperMat = new THREE.MeshStandardMaterial({
    color: 0x554433,
    emissive: 0xffdca6,
    emissiveIntensity: 1.8,
    roughness: 1,
    side: THREE.DoubleSide
  });
  const panelGeo = new THREE.PlaneGeometry(0.6, 0.32);
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(panelGeo, lanternPaperMat);
    const a = (PI / 2) * i;
    p.position.set(Math.sin(a) * 0.31, 3.58, Math.cos(a) * 0.31);
    p.rotation.y = a;
    lantern.add(p);
  }
  const edgeV = new THREE.BoxGeometry(0.025, 0.34, 0.025);
  const edgeH = new THREE.BoxGeometry(0.66, 0.025, 0.025);
  for (let i = 0; i < 4; i++) {
    const sx = i % 2 ? 0.31 : -0.31;
    const sz = i < 2 ? 0.31 : -0.31;
    const ev = new THREE.Mesh(edgeV, M.shojiFrame);
    ev.position.set(sx, 3.58, sz);
    lantern.add(ev);
    const et = new THREE.Mesh(edgeH, M.shojiFrame);
    et.position.set(0, i < 2 ? 3.75 : 3.41, i % 2 ? 0.31 : -0.31);
    lantern.add(et);
    const et2 = new THREE.Mesh(edgeH, M.shojiFrame);
    et2.rotation.y = PI / 2;
    et2.position.set(i % 2 ? 0.31 : -0.31, i < 2 ? 3.75 : 3.41, 0);
    lantern.add(et2);
  }
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe8c0,
    emissive: 0xffe8c0,
    emissiveIntensity: 3.5,
    roughness: 1
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), bulbMat);
  bulb.position.set(0, 3.45, 0); // main scene puts its PointLight here
  lantern.add(bulb);
  lantern.traverse(function (o) { o.castShadow = false; });
  g.add(lantern);

  // ---- 8. hanging scroll (kakejiku) on +X wall at z~4.3 -----------------
  const scroll = new THREE.Group();
  const scrollMat = new THREE.MeshStandardMaterial({
    map: makeScrollTexture(THREE),
    roughness: 0.9
  });
  const scrollPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.6),
    scrollMat);
  scrollPanel.rotation.y = -PI / 2;
  scrollPanel.position.set(6.9, 2.45, 4.3);
  scrollPanel.castShadow = false;
  scrollPanel.receiveShadow = true;
  scroll.add(scrollPanel);
  const dowelGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.68, 12);
  const dowelTop = new THREE.Mesh(dowelGeo, M.shelfWood);
  dowelTop.rotation.x = PI / 2;
  dowelTop.position.set(6.9, 3.28, 4.3);
  const dowelBot = new THREE.Mesh(dowelGeo, M.shelfWood);
  dowelBot.rotation.x = PI / 2;
  dowelBot.position.set(6.9, 1.62, 4.3);
  scroll.add(dowelTop, dowelBot);
  const scrollCord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.3, 6), M.darkTrim);
  scrollCord.position.set(6.93, 3.44, 4.3); // vertical hanger to the wall
  scroll.add(scrollCord);
  g.add(scroll);

  // ---- 9. low bookshelf on -Z wall centered x~-4 ------------------------
  const shelf = new THREE.Group();
  shelf.position.set(-4, 0, -6.8);
  const sideGeo = new THREE.BoxGeometry(0.05, 1.1, 0.32);
  const boardGeo = new THREE.BoxGeometry(1.8, 0.05, 0.32);
  const sideL = new THREE.Mesh(sideGeo, M.shelfWood);
  sideL.position.set(-0.875, 0.55, 0);
  const sideR = new THREE.Mesh(sideGeo, M.shelfWood);
  sideR.position.set(0.875, 0.55, 0);
  const topB = new THREE.Mesh(boardGeo, M.shelfWood);
  topB.position.set(0, 1.075, 0);
  const midB = new THREE.Mesh(boardGeo, M.shelfWood);
  midB.position.set(0, 0.58, 0);
  const botB = new THREE.Mesh(boardGeo, M.shelfWood);
  botB.position.set(0, 0.12, 0);
  const backP = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 1.02),
    M.shelfWood);
  backP.position.set(0, 0.55, -0.155);
  [sideL, sideR, topB, midB, botB].forEach(function (m) {
    m.castShadow = true;
    m.receiveShadow = true;
  });
  shelf.add(sideL, sideR, topB, midB, botB, backP);
  // books
  const bookCols = [0x8a5a3a, 0x6a4a5a, 0x4a5a6a, 0x7a6a3a, 0x9a4a3a,
    0x5a6a4a, 0xa08a5a, 0x3a4a5a];
  const bookMats = bookCols.map(function (col) {
    return new THREE.MeshStandardMaterial({ color: col, roughness: 0.85 });
  });
  const rand = makeRng(2026);
  let bx = -0.78;
  for (let i = 0; i < 16; i++) {
    const row = i < 9 ? 0 : 1;
    if (i === 9) bx = -0.72;
    const bw = 0.035 + rand() * 0.02;
    const bh = 0.18 + rand() * 0.09;
    const bk = box(bw, bh, 0.2 + rand() * 0.06, bookMats[i % 8]);
    bk.position.set(bx + bw / 2, (row === 0 ? 0.145 : 0.605) + bh / 2,
      -0.02 + rand() * 0.03);
    bk.rotation.y = (rand() - 0.5) * 0.06;
    if (i === 8 || i === 15) bk.rotation.z = 0.12; // a couple lean
    bk.castShadow = true;
    shelf.add(bk);
    bx += bw + 0.008 + (rand() < 0.2 ? 0.05 : 0);
  }
  // small globe on top
  const globeBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 0.025, 14), M.shelfWood);
  globeBase.position.set(-0.55, 1.113, 0.02);
  const globeMat = new THREE.MeshStandardMaterial({ color: 0x7a9aa8, roughness: 0.6 });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 14), globeMat);
  globe.position.set(-0.55, 1.21, 0.02);
  globe.rotation.z = 0.4;
  globe.castShadow = true;
  const globeArm = new THREE.Mesh(
    new THREE.TorusGeometry(0.082, 0.006, 6, 18, PI), M.darkTrim);
  globeArm.position.set(-0.55, 1.21, 0.02);
  globeArm.rotation.z = 0.4 + PI;
  shelf.add(globeBase, globe, globeArm);
  // old radio hint
  const radio = box(0.24, 0.13, 0.1, new THREE.MeshStandardMaterial({
    color: 0x4a3828, roughness: 0.6
  }));
  radio.position.set(0.25, 1.165, 0);
  radio.castShadow = true;
  shelf.add(radio);
  const knobGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.014, 10);
  for (let i = 0; i < 2; i++) {
    const kn = new THREE.Mesh(knobGeo, M.darkTrim);
    kn.rotation.x = PI / 2;
    kn.position.set(0.185 + i * 0.13, 1.15, 0.056);
    shelf.add(kn);
  }
  // trailing plant on top
  const potMatSmall = new THREE.MeshStandardMaterial({ color: 0xa05a3a, roughness: 0.85 });
  const shelfPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.042, 0.08, 12), potMatSmall);
  shelfPot.position.set(0.72, 1.14, 0);
  shelfPot.castShadow = true;
  shelf.add(shelfPot);
  const trailGeo = new THREE.SphereGeometry(0.045, 10, 8);
  for (let i = 0; i < 6; i++) {
    const lf = new THREE.Mesh(trailGeo, i % 2 ? M.leafA : M.leafB);
    lf.scale.set(1, 0.55, 0.8);
    lf.position.set(0.72 + Math.sin(i * 1.7) * 0.06,
      1.2 - i * 0.09, 0.05 + i * 0.035);
    shelf.add(lf);
  }
  g.add(shelf);

  // ---- 10. low tea table (chabudai) + teapot + cushions -----------------
  const table = new THREE.Group();
  table.position.set(0.7, 0, 0.35);
  const tableWood = new THREE.MeshStandardMaterial({ color: 0x4a2f1a, roughness: 0.45 });
  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24), tableWood);
  tableTop.position.y = 0.3;
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  table.add(tableTop);
  const legGeo = new THREE.CylinderGeometry(0.024, 0.032, 0.29, 10);
  for (let i = 0; i < 4; i++) {
    const a = PI / 4 + (PI / 2) * i;
    const leg = new THREE.Mesh(legGeo, tableWood);
    leg.position.set(Math.cos(a) * 0.3, 0.145, Math.sin(a) * 0.3);
    leg.rotation.z = -Math.cos(a) * 0.16;
    leg.rotation.x = Math.sin(a) * 0.16;
    leg.castShadow = true;
    table.add(leg);
  }
  // ceramic teapot
  const potMat = new THREE.MeshStandardMaterial({ color: 0x6a7a5a, roughness: 0.4 });
  const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 14), potMat);
  teapot.scale.set(1, 0.72, 1);
  teapot.position.set(-0.08, 0.375, 0.05);
  teapot.castShadow = true;
  table.add(teapot);
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.017, 0.09, 8), potMat);
  spout.position.set(0.0, 0.39, 0.05);
  spout.rotation.z = -1.1;
  table.add(spout);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.045, 0.008, 8, 16, PI * 1.2), potMat);
  handle.position.set(-0.145, 0.385, 0.05);
  handle.rotation.z = PI / 2 - 0.3;
  table.add(handle);
  const lidKnob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), potMat);
  lidKnob.position.set(-0.08, 0.432, 0.05);
  table.add(lidKnob);
  const cupGeo = new THREE.CylinderGeometry(0.028, 0.022, 0.032, 14);
  const cupMat = new THREE.MeshStandardMaterial({ color: 0x8a9a7a, roughness: 0.45 });
  const cup1 = new THREE.Mesh(cupGeo, cupMat);
  cup1.position.set(0.14, 0.336, -0.12);
  const cup2 = new THREE.Mesh(cupGeo, cupMat);
  cup2.position.set(0.2, 0.336, 0.16);
  table.add(cup1, cup2);
  g.add(table);
  // two zabuton floor cushions
  const zabGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);
  const zab1 = new THREE.Mesh(zabGeo, new THREE.MeshStandardMaterial({
    color: 0xc9a86a, roughness: 0.95
  }));
  zab1.position.set(0.7, 0.052, 1.25);
  zab1.rotation.y = 0.12;
  const zab2 = new THREE.Mesh(zabGeo, new THREE.MeshStandardMaterial({
    color: 0xa5573a, roughness: 0.95
  }));
  zab2.position.set(0.7, 0.052, -0.55);
  zab2.rotation.y = -0.09;
  [zab1, zab2].forEach(function (z) {
    z.castShadow = true;
    z.receiveShadow = true;
    g.add(z);
  });

  // ---- 11. fairy string lights along the -Z wall top --------------------
  const fairy = new THREE.Group();
  const fairyMatA = new THREE.MeshStandardMaterial({
    color: 0xffcf8f, emissive: 0xffcf8f, emissiveIntensity: 2.2, roughness: 1
  });
  const fairyMatB = new THREE.MeshStandardMaterial({
    color: 0xffcf8f, emissive: 0xffcf8f, emissiveIntensity: 2.2, roughness: 1
  });
  const bulbGeo = new THREE.SphereGeometry(0.02, 8, 6);
  const wirePts = [];
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const bx2 = -6.4 + 12.8 * t;
    const by = 4.78 - 0.26 * Math.sin(PI * t);
    wirePts.push(new THREE.Vector3(bx2, by, -6.82));
    const fb = new THREE.Mesh(bulbGeo, i % 2 ? fairyMatB : fairyMatA);
    fb.position.set(bx2, by - 0.028, -6.82);
    fairy.add(fb);
  }
  const wireCurve = new THREE.CatmullRomCurve3(wirePts);
  const wire = new THREE.Mesh(
    new THREE.TubeGeometry(wireCurve, 40, 0.004, 4, false),
    new THREE.MeshStandardMaterial({ color: 0x201510, roughness: 0.9 }));
  fairy.add(wire);
  fairy.traverse(function (o) { o.castShadow = false; });
  g.add(fairy);

  // ---- 12. floor plant in the (-X,-Z) corner ----------------------------
  const plant = new THREE.Group();
  plant.position.set(-6, 0, -6);
  const bigPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.2, 0.36, 16), potMatSmall);
  bigPot.position.y = 0.18;
  bigPot.castShadow = true;
  bigPot.receiveShadow = true;
  plant.add(bigPot);
  const potRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.275, 0.275, 0.05, 16), potMatSmall);
  potRim.position.y = 0.355;
  plant.add(potRim);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x5a7a3e, roughness: 0.8 });
  const leafGeo = new THREE.SphereGeometry(0.11, 10, 8);
  for (let s = 0; s < 3; s++) {
    const lean = 0.08 + s * 0.05;
    const ang = (2.1 * s) + 0.4;
    const h = 2.0 + s * 0.35;
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.022, h, 8), stemMat);
    stem.position.set(Math.cos(ang) * 0.07, 0.34 + h / 2, Math.sin(ang) * 0.07);
    stem.rotation.z = Math.cos(ang) * lean;
    stem.rotation.x = -Math.sin(ang) * lean;
    stem.castShadow = true;
    plant.add(stem);
    // layered leaf clusters near the top of each stem
    for (let k = 0; k < 4; k++) {
      const ly = 0.34 + h * (0.55 + k * 0.14);
      const tipX = Math.cos(ang) * (0.07 + lean * (ly - 0.34));
      const tipZ = Math.sin(ang) * (0.07 + lean * (ly - 0.34));
      const lf = new THREE.Mesh(leafGeo, (s + k) % 2 ? M.leafA : M.leafB);
      lf.scale.set(1.35 - k * 0.18, 0.32, 0.85 - k * 0.1);
      lf.rotation.y = ang + k * 0.9;
      lf.position.set(tipX, ly, tipZ);
      lf.castShadow = k < 2;
      plant.add(lf);
    }
  }
  g.add(plant);

  // ---- 13. wall vine / wreath charm over the +Z door corner -------------
  const vine = new THREE.Group();
  const vineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6.55, 2.45, 6.9),
    new THREE.Vector3(6.0, 2.85, 6.88),
    new THREE.Vector3(5.4, 3.02, 6.86),
    new THREE.Vector3(4.8, 2.95, 6.88),
    new THREE.Vector3(4.35, 2.7, 6.9)
  ]);
  const branch = new THREE.Mesh(
    new THREE.TubeGeometry(vineCurve, 24, 0.011, 5, false),
    new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 }));
  vine.add(branch);
  const vineLeafGeo = new THREE.SphereGeometry(0.05, 8, 6);
  for (let i = 0; i < 6; i++) {
    const pt = vineCurve.getPoint(0.08 + i * 0.165);
    const lf = new THREE.Mesh(vineLeafGeo, i % 2 ? M.leafA : M.leafB);
    lf.scale.set(1.4, 0.7, 0.5);
    lf.rotation.z = 0.6 * (i % 3 - 1);
    lf.position.set(pt.x, pt.y + 0.04, pt.z - 0.03);
    vine.add(lf);
  }
  const berryGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const berryMat = new THREE.MeshStandardMaterial({ color: 0xc03028, roughness: 0.5 });
  const berry1 = new THREE.Mesh(berryGeo, berryMat);
  berry1.position.set(5.65, 2.92, 6.85);
  const berry2 = new THREE.Mesh(berryGeo, berryMat);
  berry2.position.set(5.05, 2.88, 6.86);
  vine.add(berry1, berry2);
  vine.traverse(function (o) { o.castShadow = false; });
  g.add(vine);

  // ---- update: washi flicker + fairy twinkle (zero allocations) ---------
  g.userData.update = function (t) {
    lanternPaperMat.emissiveIntensity = 1.8 + Math.sin(t * 1.7) * 0.06;
    bulbMat.emissiveIntensity = 3.5 + Math.sin(t * 1.7 + 0.8) * 0.1;
    fairyMatA.emissiveIntensity = 2.2 + Math.sin(t * 2.1) * 0.45;
    fairyMatB.emissiveIntensity = 2.2 + Math.sin(t * 2.1 + 2.6) * 0.45;
  };

  return g;
}
