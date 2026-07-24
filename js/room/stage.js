// stage.js — cozy dark library-lounge at night.
// Art-nouveau organic modern: deep teal-black walls, rich wood, mustard and
// moss furniture, pools of warm light, plants trailing everywhere.
// Three.js r170 module. No imports, no real lights (glow = emissive only).

export function buildStage(THREE) {
  const g = new THREE.Group();
  const PI = Math.PI;

  // ---------- helpers ----------
  let seed = 1234567;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function mesh(geo, mat, x, y, z, cast, recv, parent) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = !!cast;
    m.receiveShadow = !!recv;
    (parent || g).add(m);
    return m;
  }
  const boxM = (w, h, d, mat, x, y, z, cast, recv, parent) =>
    mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, cast, recv, parent);
  const cylM = (rt, rb, h, seg, mat, x, y, z, cast, recv, parent) =>
    mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, cast, recv, parent);
  const sphM = (r, mat, x, y, z, cast, parent, ws, hs) =>
    mesh(new THREE.SphereGeometry(r, ws || 16, hs || 12), mat, x, y, z, cast, false, parent);
  const tubeM = (pts, r, mat, parent, seg, rad) =>
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg || 24, r, rad || 6, false),
      mat, 0, 0, 0, false, false, parent);

  // ---------- materials ----------
  const STD = (o) => new THREE.MeshStandardMaterial(o);
  const wallMat = STD({ color: 0x1a222b, roughness: 0.95 });
  const ceilMat = STD({ color: 0x12161c, roughness: 0.97 });
  const walnut = STD({ color: 0x5a3a24, roughness: 0.75 });
  const walnutDark = STD({ color: 0x33220f, roughness: 0.85 });
  const amberWood = STD({ color: 0x8a5a30, roughness: 0.7 });
  const darkIron = STD({ color: 0x22201e, metalness: 0.4, roughness: 0.6 });
  const stoneMat = STD({ color: 0x3a3a3e, roughness: 0.95 });
  const mustardMat = STD({ color: 0xc99230, roughness: 1.0 });
  const mossMat = STD({ color: 0x5a6a42, roughness: 1.0 });
  const creamMat = STD({ color: 0xe8dcc0, roughness: 1.0 });
  const rustMat = STD({ color: 0xa04a2a, roughness: 1.0 });
  const navyMat = STD({ color: 0x2a3a5a, roughness: 1.0 });
  const leafA = STD({ color: 0x3f5a35, roughness: 0.9 });
  const leafB = STD({ color: 0x5a6a42, roughness: 0.9 });
  const stemMat = STD({ color: 0x3a4a2c, roughness: 0.9 });
  const potMat = STD({ color: 0x6a4030, roughness: 0.9 });
  const matteBlack = STD({ color: 0x101114, roughness: 0.95, metalness: 0.1 });
  const beamMat = STD({ color: 0x171b21, roughness: 0.9 });
  const beamEdge = STD({ color: 0xc99230, emissive: 0xc99230, emissiveIntensity: 0.45, roughness: 0.6 });
  const creamBand = STD({ color: 0xd9b878, roughness: 1.0 });

  // animated glow materials (referenced by userData.update)
  const glowWarm = STD({ color: 0x553311, emissive: 0xffb060, emissiveIntensity: 1.25, roughness: 0.6 });
  const candleMat = STD({ color: 0x442200, emissive: 0xffcf8f, emissiveIntensity: 1.6, roughness: 0.5 });
  const emberMat = STD({ color: 0x220a02, emissive: 0xff7a30, emissiveIntensity: 1.0, roughness: 0.7 });
  const fairyA = STD({ color: 0x331f08, emissive: 0xffcf8f, emissiveIntensity: 1.1, roughness: 0.5 });
  const fairyB = STD({ color: 0x331f08, emissive: 0xffcf8f, emissiveIntensity: 1.1, roughness: 0.5 });
  const nookMat = STD({ color: 0x331f08, emissive: 0xffcf8f, emissiveIntensity: 1.3, roughness: 0.5 });
  const ledRed = STD({ color: 0x220404, emissive: 0xff2a20, emissiveIntensity: 2.2, roughness: 0.5 });
  const moteMat = STD({
    color: 0x332211, emissive: 0xffe0b0, emissiveIntensity: 0.8,
    transparent: true, opacity: 0.55, roughness: 1.0
  });
  const neonAmber = STD({ color: 0x2a1a08, emissive: 0xffb060, emissiveIntensity: 1.8, roughness: 0.4 });
  const neonTeal = STD({ color: 0x08302a, emissive: 0x4ae0d0, emissiveIntensity: 1.6, roughness: 0.4 });

  // ---------- 1. FLOOR : wood planks ----------
  const floorTex = canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#5a3a24';
    ctx.fillRect(0, 0, w, h);
    const plankH = 64;
    for (let i = 0; i < 8; i++) {
      const y = i * plankH;
      ctx.fillStyle = i % 2 ? '#63412a' : '#4e321d'; // two-tone strips
      ctx.fillRect(0, y, w, plankH);
      // grain streaks
      for (let k = 0; k < 22; k++) {
        const gy = y + 4 + rnd() * (plankH - 8);
        ctx.strokeStyle = rnd() < 0.5 ? 'rgba(28,16,7,0.22)' : 'rgba(190,132,72,0.10)';
        ctx.lineWidth = 1 + rnd() * 1.6;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        for (let x = 0; x <= w; x += 64) {
          ctx.lineTo(x, gy + Math.sin(x * 0.02 + k) * 2.2 + (rnd() - 0.5) * 2);
        }
        ctx.stroke();
      }
      // plank seam
      ctx.fillStyle = 'rgba(12,7,3,0.85)';
      ctx.fillRect(0, y, w, 2);
      // butt joints
      const nj = 2 + Math.floor(rnd() * 2);
      for (let j = 0; j < nj; j++) {
        ctx.fillRect(rnd() * w, y, 2, plankH);
      }
      // knots
      if (rnd() < 0.7) {
        const kx = rnd() * w, ky = y + plankH * 0.5;
        ctx.fillStyle = 'rgba(30,17,7,0.5)';
        ctx.beginPath(); ctx.ellipse(kx, ky, 5, 3, 0.3, 0, PI * 2); ctx.fill();
      }
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4, 4);
  const floorMat = STD({ map: floorTex, roughness: 0.5, metalness: 0.04 });
  const floor = mesh(new THREE.PlaneGeometry(16, 16), floorMat, 0, 0, 0, false, true);
  floor.rotation.x = -PI / 2;

  // ---------- 2. WALLS + CEILING ----------
  // -X wall with round window hole
  const wxShape = new THREE.Shape();
  wxShape.moveTo(-8, 0); wxShape.lineTo(8, 0); wxShape.lineTo(8, 6);
  wxShape.lineTo(-8, 6); wxShape.closePath();
  const winHole = new THREE.Path();
  winHole.absarc(-0.5, 3.0, 2.6, 0, PI * 2, true); // local x = -world z
  wxShape.holes.push(winHole);
  const wallX = mesh(new THREE.ShapeGeometry(wxShape, 48), wallMat, -7.93, 0, 0, false, true);
  wallX.rotation.y = PI / 2;

  const wallPX = mesh(new THREE.PlaneGeometry(16, 6), wallMat, 7.93, 3, 0, false, true);
  wallPX.rotation.y = -PI / 2;
  const wallNZ = mesh(new THREE.PlaneGeometry(16, 6), wallMat, 0, 3, -7.93, false, true);
  const wallPZ = mesh(new THREE.PlaneGeometry(16, 6), wallMat, 0, 3, 7.93, false, true);
  wallPZ.rotation.y = PI;
  const ceil = mesh(new THREE.PlaneGeometry(16, 16), ceilMat, 0, 6, 0, false, true);
  ceil.rotation.x = PI / 2;

  // two arched ceiling beams (broad flattened torus arcs, peak y≈5.9)
  const beamR = 30, beamArc = 0.55;
  for (const bz of [-2, 2.5]) {
    const beam = mesh(new THREE.TorusGeometry(beamR, 0.16, 8, 48, beamArc), beamMat, 0, 5.9 - beamR, bz, false, false);
    beam.rotation.z = PI / 2 - beamArc / 2;
    beam.scale.set(1, 1, 2.2);
    const edge = mesh(new THREE.TorusGeometry(beamR - 0.17, 0.026, 6, 48, beamArc), beamEdge, 0, 5.9 - beamR, bz, false, false);
    edge.rotation.z = PI / 2 - beamArc / 2;
  }

  // warm cream band high on +Z wall (arch hint)
  const band1 = mesh(new THREE.PlaneGeometry(10, 0.55), creamBand, 0.5, 5.15, 7.92, false, false);
  band1.rotation.y = PI;
  const band2 = mesh(new THREE.PlaneGeometry(10, 0.08), creamBand, 0.5, 4.78, 7.92, false, false);
  band2.rotation.y = PI;

  // ---------- 3. GIANT ROUND WINDOW (-X wall) ----------
  const win = new THREE.Group();
  win.position.set(-7.88, 3.0, 0.5);
  win.rotation.y = PI / 2;
  g.add(win);
  mesh(new THREE.TorusGeometry(2.6, 0.16, 12, 40), amberWood, 0, 0, 0, true, false, win);
  mesh(new THREE.TorusGeometry(2.35, 0.07, 8, 40), walnut, 0, 0, 0, false, false, win);
  mesh(new THREE.TorusGeometry(0.45, 0.04, 8, 24), amberWood, 0, 0, 0.02, false, false, win);
  // organic petal mullions: 5 S-curved tubes radiating from the small circle
  for (let i = 0; i < 5; i++) {
    const a = -PI / 2 + i * (PI * 2 / 5);
    tubeM([
      V3(0.45 * Math.cos(a), 0.45 * Math.sin(a), 0.02),
      V3(1.35 * Math.cos(a + 0.45), 1.35 * Math.sin(a + 0.45), 0.02),
      V3(2.33 * Math.cos(a + 0.05), 2.33 * Math.sin(a + 0.05), 0.02)
    ], 0.045, amberWood, win, 16, 6);
  }

  // emissive night scene behind the opening
  const nightTex = canvasTex(512, 512, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#16204a');
    grad.addColorStop(1, '#0c1226');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // stars
    for (let i = 0; i < 80; i++) {
      const sx = rnd() * w, sy = rnd() * h * 0.72;
      ctx.fillStyle = 'rgba(235,240,255,' + (0.35 + rnd() * 0.6).toFixed(2) + ')';
      const r = 0.6 + rnd() * 1.3;
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, PI * 2); ctx.fill();
    }
    // crescent moon, upper-left
    ctx.fillStyle = '#f2ead2';
    ctx.beginPath(); ctx.arc(w * 0.28, h * 0.24, 36, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#141d42';
    ctx.beginPath(); ctx.arc(w * 0.28 + 14, h * 0.24 - 7, 33, 0, PI * 2); ctx.fill();
    // faint mist band
    const mist = ctx.createLinearGradient(0, h * 0.55, 0, h * 0.72);
    mist.addColorStop(0, 'rgba(200,215,240,0)');
    mist.addColorStop(0.5, 'rgba(200,215,240,0.10)');
    mist.addColorStop(1, 'rgba(200,215,240,0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, h * 0.55, w, h * 0.2);
    // snowy mountain silhouettes
    const peaks = [[0, 400], [60, 336], [122, 392], [190, 318], [258, 384], [330, 330], [400, 396], [462, 352], [512, 402]];
    ctx.fillStyle = '#3a4a6a';
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (const p of peaks) ctx.lineTo(p[0], p[1]);
    ctx.lineTo(w, h);
    ctx.closePath(); ctx.fill();
    // white peak caps
    ctx.fillStyle = '#e6edf8';
    for (let i = 1; i < peaks.length - 1; i += 2) {
      const p = peaks[i];
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(p[0] - 20, p[1] + 30);
      ctx.lineTo(p[0] - 6, p[1] + 24);
      ctx.lineTo(p[0] + 6, p[1] + 32);
      ctx.lineTo(p[0] + 20, p[1] + 28);
      ctx.closePath(); ctx.fill();
    }
  });
  const nightMat = STD({
    color: 0x000000, emissive: 0xffffff, emissiveMap: nightTex,
    emissiveIntensity: 1.1, roughness: 1.0
  });
  const night = mesh(new THREE.CircleGeometry(2.85, 40), nightMat, -8.06, 3.0, 0.5, false, false);
  night.rotation.y = PI / 2;

  // deep wood window sill + 3 potted plants + tiny lantern
  boxM(0.62, 0.1, 2.3, walnut, -7.62, 0.34, 0.5, true, true);
  for (const sz of [-0.3, 0.5, 1.2]) {
    cylM(0.06, 0.05, 0.1, 10, potMat, -7.58, 0.44, sz, false, false);
    const fol = sphM(0.085, sz > 0.8 ? leafA : leafB, -7.58, 0.55, sz, false, null, 10, 8);
    fol.scale.set(1, 0.85 + rnd() * 0.4, 1);
  }
  cylM(0.05, 0.055, 0.03, 8, darkIron, -7.6, 0.405, 0.1, false, false);
  sphM(0.042, glowWarm, -7.6, 0.46, 0.1, false, null, 10, 8);
  cylM(0.012, 0.045, 0.035, 8, darkIron, -7.6, 0.52, 0.1, false, false);

  // ---------- 4. BOOK WALL (+X side) ----------
  const shelfZ0 = -6, shelfZ1 = 6.5, shelfZC = (shelfZ0 + shelfZ1) / 2, shelfSpan = shelfZ1 - shelfZ0;
  boxM(0.08, 4.7, shelfSpan + 0.2, walnutDark, 7.88, 2.35, shelfZC, false, true);
  for (let z = shelfZ0; z <= shelfZ1 + 0.01; z += 1.25) {
    boxM(0.36, 4.65, 0.09, walnut, 7.6, 2.32, z, true, true);
  }
  const rowY = [0.17, 0.91, 1.65, 2.39, 3.13, 3.87];
  for (const ry of rowY) {
    boxM(0.34, 0.06, shelfSpan + 0.1, walnut, 7.62, ry - 0.03, shelfZC, true, true);
  }
  boxM(0.34, 0.06, shelfSpan + 0.1, walnut, 7.62, 4.58, shelfZC, true, true);

  // packed books: one InstancedMesh, muted spine palette
  const spineColors = [0xc99230, 0xa0522d, 0x8a9a6a, 0x2a3a5a, 0xe8dcc0, 0x7a4a2a, 0x5a6a42, 0x8a3a30, 0xb08a4a, 0x4a5a6a];
  const bookCount = 700; // ~110 spines/row x 6 rows (~660 used); spares hidden below floor
  const books = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), STD({ color: 0xffffff, roughness: 0.9 }), bookCount);
  books.castShadow = false;
  books.receiveShadow = false;
  books.frustumCulled = false;
  {
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const col = new THREE.Color();
    let idx = 0;
    for (const ry of rowY) {
      let z = shelfZ0 + 0.1;
      while (z < shelfZ1 - 0.15 && idx < bookCount) {
        const bw = 0.07 + rnd() * 0.06;
        if (rnd() < 0.07) { z += 0.06 + rnd() * 0.1; continue; } // occasional gap
        const bh = 0.26 + rnd() * 0.13;
        p.set(7.68, ry + bh / 2, z + bw / 2);
        s.set(0.2, bh, bw);
        m4.compose(p, q, s);
        books.setMatrixAt(idx, m4);
        col.setHex(spineColors[Math.floor(rnd() * spineColors.length)]);
        col.multiplyScalar(0.72 + rnd() * 0.4);
        books.setColorAt(idx, col);
        z += bw + 0.004;
        idx++;
      }
    }
    // hide unused instances under floor
    p.set(0, -10, 0); s.set(0.001, 0.001, 0.001);
    for (let i = idx; i < bookCount; i++) { m4.compose(p, q, s); books.setMatrixAt(i, m4); }
    books.instanceMatrix.needsUpdate = true;
    if (books.instanceColor) books.instanceColor.needsUpdate = true;
  }
  g.add(books);

  // ledge / balcony strip + rail
  boxM(0.85, 0.08, shelfSpan + 0.4, walnut, 7.5, 4.7, shelfZC, true, true);
  for (let z = shelfZ0; z <= shelfZ1 + 0.01; z += 1.56) {
    cylM(0.02, 0.02, 0.3, 8, walnutDark, 7.12, 4.89, z, false, false);
  }
  boxM(0.04, 0.04, shelfSpan + 0.4, walnutDark, 7.12, 5.05, shelfZC, false, false);

  // hanging vines trailing from the ledge
  const leafGeo = new THREE.SphereGeometry(0.07, 10, 7);
  function vineDown(x0, y0, z0, len, parent) {
    const pts = [V3(x0, y0, z0)];
    let px = x0, py = y0, pz = z0;
    const n = 4;
    for (let i = 1; i <= n; i++) {
      px += (rnd() - 0.5) * 0.22;
      pz += (rnd() - 0.5) * 0.22;
      py -= len / n;
      pts.push(V3(px, py, pz));
    }
    tubeM(pts, 0.013, stemMat, parent, 16, 5);
    for (let i = 1; i <= n; i++) {
      const pt = pts[i];
      const lf = mesh(leafGeo, i % 2 ? leafA : leafB, pt.x + 0.03, pt.y + 0.04, pt.z, false, false, parent);
      lf.scale.set(1, 0.5, 0.8);
      lf.rotation.set(rnd(), rnd() * 3, rnd());
    }
  }
  vineDown(7.14, 4.68, -3.2, 1.9, g);
  vineDown(7.14, 4.68, 0.9, 1.5, g);
  vineDown(7.14, 4.68, 4.6, 1.8, g);

  // two tiny book-nook lamps on shelves
  for (const nl of [[7.56, 1.65, -3.6], [7.56, 3.13, 2.9]]) {
    sphM(0.05, nookMat, nl[0], nl[1] + 0.09, nl[2], false, null, 10, 8);
    mesh(new THREE.ConeGeometry(0.085, 0.1, 12, 1, true), STD({ color: 0x2a1c10, roughness: 0.9, side: THREE.DoubleSide }),
      nl[0], nl[1] + 0.17, nl[2], false, false);
    cylM(0.03, 0.045, 0.04, 8, walnutDark, nl[0], nl[1] + 0.02, nl[2], false, false);
  }

  // ---------- 5. WOOD STOVE ----------
  const stove = new THREE.Group();
  stove.position.set(5.2, 0, -1.5);
  stove.rotation.y = Math.atan2(-5.2, 2.3); // front (+z local) faces room center
  g.add(stove);
  const hearth = cylM(1.0, 1.05, 0.06, 24, stoneMat, 0, 0.03, 0, false, true, stove);
  hearth.castShadow = false;
  for (const lg of [[-0.3, -0.24], [0.3, -0.24], [-0.3, 0.24], [0.3, 0.24]]) {
    cylM(0.035, 0.045, 0.2, 8, darkIron, lg[0], 0.16, lg[1], false, false, stove);
  }
  boxM(0.85, 0.95, 0.7, darkIron, 0, 0.74, 0, true, true, stove);
  boxM(0.95, 0.06, 0.8, darkIron, 0, 1.24, 0, true, false, stove);
  // arched fire opening: dark frame + layered emissive fire
  mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 16, PI), STD({ color: 0x141210, roughness: 0.8 }), 0, 0.72, 0.352, false, false, stove);
  boxM(0.06, 0.32, 0.05, STD({ color: 0x141210, roughness: 0.8 }), -0.21, 0.58, 0.352, false, false, stove);
  boxM(0.06, 0.32, 0.05, STD({ color: 0x141210, roughness: 0.8 }), 0.21, 0.58, 0.352, false, false, stove);
  boxM(0.48, 0.05, 0.05, STD({ color: 0x141210, roughness: 0.8 }), 0, 0.42, 0.352, false, false, stove);
  const fireGlowMat = STD({ color: 0x220a02, emissive: 0xff7a30, emissiveIntensity: 1.2, roughness: 0.8 });
  mesh(new THREE.PlaneGeometry(0.38, 0.28), fireGlowMat, 0, 0.6, 0.354, false, false, stove);
  mesh(new THREE.CircleGeometry(0.185, 16, 0, PI), fireGlowMat, 0, 0.73, 0.354, false, false, stove);
  // flame blobs
  const flames = [];
  const flameDefs = [
    [-0.08, 0.58, 0.1, 0xffb060, 1.7],
    [0.05, 0.62, 0.085, 0xff7a30, 1.5],
    [0.0, 0.56, 0.075, 0xffb060, 1.8],
    [0.1, 0.55, 0.055, 0xff7a30, 1.4]
  ];
  for (let i = 0; i < flameDefs.length; i++) {
    const fd = flameDefs[i];
    const fm = STD({ color: 0x331303, emissive: fd[3], emissiveIntensity: fd[4], roughness: 0.6 });
    const fl = sphM(fd[2], fm, fd[0], fd[1], 0.365, false, stove, 12, 9);
    fl.scale.set(0.85, 1.5, 0.5);
    flames.push({ mesh: fl, mat: fm, bI: fd[4], bS: 1.5, ph: i * 2.3 });
  }
  for (const eb of [[-0.1, 0.47], [0.02, 0.455], [0.12, 0.47], [-0.03, 0.465]]) {
    sphM(0.02, emberMat, eb[0], eb[1], 0.36, false, stove, 8, 6);
  }
  // stove pipe with slight elbow, up to ceiling
  cylM(0.085, 0.085, 3.5, 14, darkIron, 0, 3.0, 0, true, false, stove);
  sphM(0.105, darkIron, 0, 4.78, 0, false, stove, 12, 9);
  const elbow = cylM(0.085, 0.085, 0.3, 12, darkIron, 0.09, 4.9, 0, false, false, stove);
  elbow.rotation.z = -0.6;
  cylM(0.085, 0.085, 1.05, 14, darkIron, 0.18, 5.5, 0, false, false, stove);
  cylM(0.14, 0.14, 0.05, 14, darkIron, 0, 1.29, 0, false, false, stove);
  // kettle
  const kettle = sphM(0.13, STD({ color: 0x2e2c2a, metalness: 0.5, roughness: 0.5 }), -0.2, 1.36, 0.08, true, stove, 14, 10);
  kettle.scale.set(1, 0.78, 1);
  const spout = cylM(0.018, 0.03, 0.14, 8, darkIron, -0.33, 1.4, 0.08, false, false, stove);
  spout.rotation.z = 1.0;
  sphM(0.025, walnutDark, -0.2, 1.47, 0.08, false, stove, 8, 6);
  // firewood stack
  for (const lw of [[0.72, 0.06, -0.1, 0], [0.72, 0.06, 0.02, 0.1], [0.72, 0.06, 0.14, -0.06], [0.72, 0.17, -0.04, 0.05], [0.72, 0.17, 0.08, -0.08]]) {
    const log = cylM(0.055, 0.05, 0.45, 9, STD({ color: 0x6a4a2c, roughness: 0.95 }), lw[0], lw[1], lw[2], true, false, stove);
    log.rotation.x = PI / 2;
    log.rotation.z = lw[3];
  }

  // ---------- 6. LOUNGE SET on a light modern rug ----------
  // big soft light-gray round rug, minimal — one thin blush ring for warmth
  const rugTex = canvasTex(512, 512, (ctx, w, h) => {
    const cx = 256, cy = 256;
    const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, 252);
    grad.addColorStop(0, '#e2e2e6');
    grad.addColorStop(1, '#cfd0d6');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 252, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(232,184,200,0.55)'; // blush ring
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 210, 0, PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(160,162,172,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, 246, 0, PI * 2); ctx.stroke();
    // soft speckle so it reads as wool
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 260; i++) {
      const a = Math.random() * PI * 2, rr = Math.sqrt(Math.random()) * 246;
      ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2);
    }
  });
  const rug = mesh(new THREE.CircleGeometry(2.4, 40), STD({ map: rugTex, roughness: 0.95 }), 0.6, 0.012, 0.8, false, true);
  rug.rotation.x = -PI / 2;
  // small pastel mint accent rug by the stove
  const rug2Tex = canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c8dcd0'; ctx.fillRect(0, 0, w, h);
    const rings = [[124, '#dce8e0'], [104, '#c8dcd0'], [64, '#dce8e0'], [44, '#c8dcd0']];
    for (const rr of rings) {
      ctx.fillStyle = rr[1];
      ctx.beginPath(); ctx.arc(128, 128, rr[0], 0, PI * 2); ctx.fill();
    }
  });
  const rug2 = mesh(new THREE.CircleGeometry(0.95, 28), STD({ map: rug2Tex, roughness: 0.95 }), 2.7, 0.02, -0.9, false, true);
  rug2.rotation.x = -PI / 2;

  // no sofa — a nest of floor seating: bean bags, poufs, fluffy patches, cushions
  function beanBag(mat, x, z, ry, s) {
    const bb = new THREE.Group();
    bb.position.set(x, 0, z);
    bb.rotation.y = ry;
    g.add(bb);
    const body = mesh(new THREE.SphereGeometry(0.42 * s, 20, 14), mat, 0, 0.3 * s, 0, true, true, bb);
    body.scale.set(1, 0.78, 1);
    const back = mesh(new THREE.SphereGeometry(0.3 * s, 16, 12), mat, 0, 0.5 * s, -0.22 * s, true, false, bb);
    back.scale.set(1, 0.9, 0.7);
    const dent = mesh(new THREE.SphereGeometry(0.26 * s, 14, 10), mat, 0, 0.34 * s, 0.1 * s, false, false, bb);
    dent.scale.set(1, 0.35, 1);
    return bb;
  }
  // pastel seat palette — soft and modern
  const pastelRose = new THREE.MeshStandardMaterial({ color: 0xe8b8c8, roughness: 1 });
  const pastelBlue = new THREE.MeshStandardMaterial({ color: 0xb8cce8, roughness: 1 });
  const pastelMint = new THREE.MeshStandardMaterial({ color: 0xbcd8c8, roughness: 1 });
  const pastelButter = new THREE.MeshStandardMaterial({ color: 0xf0e4b8, roughness: 1 });
  beanBag(pastelButter, 0.9, 1.0, PI + 0.2, 1.0);  // facing the stage
  beanBag(pastelMint, -0.9, 1.6, PI - 0.3, 0.9);
  beanBag(pastelRose, 4.0, 0.2, PI * 0.72, 0.85);  // by the stove
  // fluffy shag patches (thick soft discs) to sink into
  const fluffCream = new THREE.MeshStandardMaterial({ color: 0xf6f0e6, roughness: 1 });
  const fluffRose = new THREE.MeshStandardMaterial({ color: 0xecd4d8, roughness: 1 });
  const fl1 = mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.09, 22), fluffCream, 0.1, 0.045, 2.2, false, true);
  const fl2 = mesh(new THREE.CylinderGeometry(0.5, 0.54, 0.08, 20), fluffRose, 2.2, 0.04, 1.6, false, true);
  const fl3 = mesh(new THREE.CylinderGeometry(0.44, 0.48, 0.08, 20), fluffCream, -1.7, 0.04, 0.4, false, true);
  // scattered pastel cushions
  const cushionSpecs = [
    [pastelRose, 3.6, -0.4, 0.4], [fluffCream, -0.4, -0.9, -0.3],
    [pastelBlue, 1.7, 2.4, 0.8], [pastelMint, -0.2, 1.1, 0.2],
  ];
  for (const cs of cushionSpecs) {
    const fc = boxM(0.52, 0.11, 0.52, cs[0], cs[1], 0.055, cs[2], true, true);
    fc.rotation.y = cs[3];
  }
  const pouf2 = mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.26, 18), pastelBlue, 2.6, 0.13, 0.3, true, true);

  // round wood coffee table + props
  cylM(0.55, 0.55, 0.08, 24, walnut, 0.6, 0.44, 0.8, true, true);
  cylM(0.15, 0.18, 0.36, 14, walnutDark, 0.6, 0.22, 0.8, true, false);
  cylM(0.3, 0.32, 0.04, 18, walnutDark, 0.6, 0.02, 0.8, false, false);
  const tb1 = boxM(0.24, 0.035, 0.17, navyMat, 0.82, 0.5, 0.62, false, false);
  tb1.rotation.y = 0.3;
  const tb2 = boxM(0.21, 0.03, 0.15, rustMat, 0.83, 0.53, 0.63, false, false);
  tb2.rotation.y = 0.55;
  // steaming teacup
  cylM(0.042, 0.034, 0.055, 12, creamMat, 0.42, 0.51, 0.98, false, false);
  const cupH = mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12), creamMat, 0.47, 0.51, 0.98, false, false);
  cupH.rotation.y = PI / 2;
  const steamMat = STD({ color: 0xffffff, transparent: true, opacity: 0.16, roughness: 1.0 });
  sphM(0.02, steamMat, 0.42, 0.575, 0.98, false, null, 8, 6);
  sphM(0.014, steamMat, 0.44, 0.63, 0.97, false, null, 8, 6);
  // candle with flickering flame
  cylM(0.028, 0.03, 0.08, 10, creamMat, 0.6, 0.52, 0.75, false, false);
  const candleFlame = sphM(0.018, candleMat, 0.6, 0.575, 0.75, false, null, 8, 6);
  candleFlame.scale.set(0.7, 1.4, 0.7);

  // green armchair angled toward the stove + knit blanket
  const chair = new THREE.Group();
  chair.position.set(3.5, 0, 0.4);
  chair.rotation.y = Math.atan2(1.7, -1.9);
  g.add(chair);
  boxM(0.78, 0.2, 0.72, walnutDark, 0, 0.1, 0, false, false, chair);
  boxM(0.74, 0.24, 0.68, mossMat, 0, 0.4, 0.02, true, true, chair);
  const chairBack = boxM(0.74, 0.78, 0.24, mossMat, 0, 0.75, -0.3, true, false, chair);
  chairBack.rotation.x = -0.12;
  for (const sx of [-0.42, 0.42]) {
    const arm = mesh(new THREE.CapsuleGeometry(0.1, 0.42, 6, 12), mossMat, sx, 0.58, 0.02, true, false, chair);
    arm.rotation.x = PI / 2;
  }
  boxM(0.34, 0.04, 0.5, creamMat, -0.42, 0.7, 0.02, false, false, chair);
  boxM(0.34, 0.42, 0.035, creamMat, -0.54, 0.48, 0.02, false, false, chair);

  // ---------- 7. PLANTS EVERYWHERE ----------
  // big monstera left of the round window
  const mon = new THREE.Group();
  mon.position.set(-6.8, 0, 3.6);
  g.add(mon);
  cylM(0.26, 0.3, 0.42, 14, potMat, 0, 0.21, 0, true, true, mon);
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * PI * 2 + 0.4;
    const tilt = 0.28 + rnd() * 0.3;
    const hgt = 0.9 + rnd() * 0.8;
    const st = cylM(0.014, 0.02, hgt, 6, stemMat, 0, 0.4 + hgt / 2, 0, false, false, mon);
    st.rotation.z = Math.cos(a) * tilt;
    st.rotation.x = Math.sin(a) * tilt;
    const lx = Math.cos(a) * tilt * hgt * 0.8;
    const lz = Math.sin(a) * tilt * hgt * 0.8;
    const lf = sphM(0.16 + rnd() * 0.09, i % 2 ? leafA : leafB, lx, 0.42 + hgt * 0.94, lz, true, mon, 12, 8);
    lf.scale.set(1, 0.24, 0.75);
    lf.rotation.y = -a;
    lf.rotation.z = Math.cos(a) * 0.3;
  }
  // pothos on a stool by the stove
  const stool = new THREE.Group();
  stool.position.set(3.9, 0, -3.1);
  g.add(stool);
  cylM(0.2, 0.23, 0.46, 14, walnut, 0, 0.23, 0, true, true, stool);
  cylM(0.14, 0.11, 0.15, 12, potMat, 0, 0.54, 0, true, false, stool);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * PI * 2;
    const lf = sphM(0.08, i % 2 ? leafA : leafB, Math.cos(a) * 0.1, 0.66, Math.sin(a) * 0.1, false, stool, 10, 7);
    lf.scale.set(1, 0.55, 0.8);
    lf.rotation.y = a;
  }
  vineDown(0.14, 0.6, 0.05, 0.55, stool);
  // two hanging planters from the ceiling near the book ledge
  for (const hp of [[6.5, -4.6], [6.35, 2.3]]) {
    const hg = new THREE.Group();
    hg.position.set(hp[0], 0, hp[1]);
    g.add(hg);
    cylM(0.008, 0.008, 1.35, 6, darkIron, 0, 5.32, 0, false, false, hg);
    cylM(0.14, 0.1, 0.17, 12, potMat, 0, 4.56, 0, true, false, hg);
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * PI * 2 + 0.5;
      const lf = sphM(0.075, i % 2 ? leafA : leafB, Math.cos(a) * 0.1, 4.68, Math.sin(a) * 0.1, false, hg, 10, 7);
      lf.scale.set(1, 0.5, 0.8);
    }
    vineDown(0.1, 4.56, 0.04, 0.85, hg);
  }

  // ---------- 8. WARM LIGHT PROPS ----------
  // arched floor lamp by the sofa
  cylM(0.15, 0.17, 0.04, 14, darkIron, -1.7, 0.02, 2.9, true, false);
  tubeM([
    V3(-1.7, 0.04, 2.9), V3(-1.74, 1.15, 2.92), V3(-1.64, 1.9, 2.8),
    V3(-1.44, 2.12, 2.64), V3(-1.3, 2.0, 2.54)
  ], 0.02, darkIron, g, 24, 6);
  sphM(0.17, glowWarm, -1.28, 1.9, 2.5, false, null, 18, 14);
  // paper lantern on the stage corner (see section 9 dressing)
  cylM(0.06, 0.07, 0.03, 10, walnutDark, 2.6, 0.315, -5.4, false, false);
  const paperLan = sphM(0.15, glowWarm, 2.6, 0.5, -5.4, false, null, 16, 12);
  paperLan.scale.set(1, 1.2, 1);
  mesh(new THREE.TorusGeometry(0.15, 0.008, 6, 18), walnutDark, 2.6, 0.5, -5.4, false, false).rotation.x = PI / 2;
  mesh(new THREE.TorusGeometry(0.12, 0.008, 6, 18), walnutDark, 2.6, 0.62, -5.4, false, false).rotation.x = PI / 2;
  // fairy lights swagged along the book-ledge rail
  const fairyGeo = new THREE.SphereGeometry(0.025, 8, 6);
  for (let i = 0; i < 24; i++) {
    const fz = -5.9 + i * (12.25 / 23);
    const fy = 5.03 - 0.14 * Math.abs(Math.sin((fz + 6) * 1.05));
    mesh(fairyGeo, i % 2 ? fairyA : fairyB, 7.12, fy, fz, false, false);
  }
  // wall sconces flanking the video wall
  for (const sx of [-4.35, 4.35]) {
    boxM(0.12, 0.3, 0.04, darkIron, sx, 3.3, -7.89, false, false);
    sphM(0.065, glowWarm, sx, 3.34, -7.8, false, null, 12, 9);
    const shade = mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.2, 12, 1, true, 0, PI),
      STD({ color: 0x2a1c10, roughness: 0.9, side: THREE.DoubleSide }), sx, 3.32, -7.8, false, false);
    shade.rotation.y = PI / 2;
  }
  // floating dust motes
  const motes = [];
  const moteGeo = new THREE.SphereGeometry(0.014, 8, 6);
  for (let i = 0; i < 10; i++) {
    const bx = -3 + rnd() * 7;
    const bz = -3 + rnd() * 7;
    const mm = mesh(moteGeo, moteMat, bx, 0.5 + rnd() * 4.6, bz, false, false);
    motes.push({ mesh: mm, bx: bx, bz: bz, spd: 0.06 + rnd() * 0.09, sw: 0.4 + rnd() * 0.5, ph: rnd() * PI * 2 });
  }

  // ---------- 9a. VIDEO WALL MOUNT (-Z wall, hard contract) ----------
  // matte-black mullion grid: outer span x∈[-3.3,3.3], y∈[1.0,5.0], 4 cols × 3 rows, empty bays
  const mount = new THREE.Group();
  mount.position.set(0, 0, -7.87);
  g.add(mount);
  for (const vx of [-3.27, -1.635, 0, 1.635, 3.27]) {
    boxM(0.06, 4.0, 0.06, matteBlack, vx, 3.0, 0, false, false, mount);
  }
  for (const vy of [1.03, 2.343, 3.657, 4.97]) {
    boxM(6.6, 0.06, 0.06, matteBlack, 0, vy, 0, false, false, mount);
  }

  // ---------- 9b. LOW STAGE PLATFORM (hard contract: top exactly y=0.3) ----------
  boxM(6, 0.27, 2.4, walnutDark, 0, 0.135, -6.4, false, true); // dark skirt
  const platTop = boxM(6, 0.03, 2.4, floorMat, 0, 0.285, -6.4, false, true); // warm wood top → top face y=0.3
  platTop.castShadow = false;
  // dressing: coiled cable + low amp cube with red LED (outside the clear center zone)
  mesh(new THREE.TorusGeometry(0.12, 0.02, 6, 20), STD({ color: 0x17181a, roughness: 0.8 }), -2.82, 0.315, -5.5, false, false).rotation.x = PI / 2;
  mesh(new THREE.TorusGeometry(0.09, 0.018, 6, 18), STD({ color: 0x17181a, roughness: 0.8 }), -2.8, 0.335, -5.52, false, false).rotation.x = PI / 2;
  boxM(0.36, 0.34, 0.3, STD({ color: 0x1c1c1e, roughness: 0.85 }), 2.3, 0.47, -6.8, true, false);
  mesh(new THREE.PlaneGeometry(0.3, 0.24), STD({ color: 0x0c0c0e, roughness: 1.0 }), 2.3, 0.45, -6.645, false, false);
  sphM(0.013, ledRed, 2.42, 0.6, -6.64, false, null, 8, 6);

  // ---------- 9c. EXIT DOOR (+Z wall, name 'exitDoor') ----------
  const door = new THREE.Group();
  door.name = 'exitDoor';
  door.position.set(-3.5, 0, 7.9);
  g.add(door);
  const seam = mesh(new THREE.PlaneGeometry(1.14, 2.26), glowWarm, 0, 1.13, -0.015, false, false, door);
  seam.rotation.y = PI;
  boxM(1.02, 2.15, 0.07, walnut, 0, 1.075, -0.06, true, false, door);
  sphM(0.035, amberWood, 0.4, 1.05, -0.11, false, door, 10, 8);
  const signTex = canvasTex(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#201409'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c99230'; ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = '#ffcf8f';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('← back to the room', w / 2, h / 2 + 2);
  });
  const sign = mesh(new THREE.PlaneGeometry(1.3, 0.325),
    STD({ color: 0x000000, emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 1.2, roughness: 1.0 }),
    0, 2.5, -0.07, false, false, door);
  sign.rotation.y = PI;

  // ---------- 9d. '音の織り' — soft scribbled words floating on the wall ----------
  (function scribble() {
    const pc = document.createElement('canvas');
    pc.width = 1024; pc.height = 320;
    const pg = pc.getContext('2d');
    // hand-scribbled feel: the same strokes laid down a few times with jitter
    pg.font = '400 170px "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", serif';
    const passes = [
      [6, 5, 'rgba(232,176,200,0.28)'],   // rose under-glow
      [-4, -2, 'rgba(255,232,208,0.35)'],
      [2, -4, 'rgba(255,232,208,0.5)'],
      [0, 0, 'rgba(255,240,222,0.95)'],   // main stroke
    ];
    for (const p of passes) {
      pg.fillStyle = p[2];
      pg.fillText('音の織り', 200 + p[0], 218 + p[1]);
    }
    pg.font = '300 110px "Hiragino Mincho ProN", serif';
    pg.fillStyle = 'rgba(232,176,200,0.85)';
    pg.fillText('♪', 74, 190);
    const ptex = new THREE.CanvasTexture(pc);
    ptex.colorSpace = THREE.SRGBColorSpace;
    const words = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.75),
      new THREE.MeshStandardMaterial({
        map: ptex, emissive: 0xffffff, emissiveMap: ptex, emissiveIntensity: 0.85,
        transparent: true, roughness: 1, depthWrite: false,
      })
    );
    words.position.set(0, 5.32, -7.82);
    g.add(words);
  })();

  // ---------- 10. userData.update ----------
  g.userData.update = function (t, dt) {
    if (dt === undefined) dt = 0.016;
    // fire flicker ~9Hz with irregularity
    for (let i = 0; i < flames.length; i++) {
      const f = flames[i];
      const s = Math.sin(t * 56.5 + f.ph) * 0.55 + Math.sin(t * 23.7 + f.ph * 1.7) * 0.3 + Math.sin(t * 9.3 + f.ph * 0.6) * 0.15;
      f.mat.emissiveIntensity = f.bI * (0.82 + 0.3 * s);
      f.mesh.scale.y = f.bS * (0.9 + 0.14 * s);
    }
    fireGlowMat.emissiveIntensity = 1.05 + 0.25 * Math.sin(t * 41.0) + 0.12 * Math.sin(t * 17.3 + 1.1);
    emberMat.emissiveIntensity = 0.9 + 0.3 * Math.sin(t * 3.1) + 0.18 * Math.sin(t * 7.7 + 0.6);
    // candle + warm lantern gentle flicker
    candleMat.emissiveIntensity = 1.55 + 0.4 * Math.sin(t * 11.3) + 0.22 * Math.sin(t * 5.1 + 1.7);
    glowWarm.emissiveIntensity = 1.22 + 0.12 * Math.sin(t * 6.7 + 0.9) + 0.07 * Math.sin(t * 13.1);
    // fairy twinkle (two shared materials alternating)
    fairyA.emissiveIntensity = 1.1 + 0.55 * Math.sin(t * 2.3);
    fairyB.emissiveIntensity = 1.1 + 0.55 * Math.sin(t * 2.3 + PI);
    // dust motes drifting up, wrap at y 5.5
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.mesh.position.y += m.spd * dt;
      if (m.mesh.position.y > 5.5) m.mesh.position.y = 0.4;
      m.mesh.position.x = m.bx + 0.18 * Math.sin(t * m.sw + m.ph);
      m.mesh.position.z = m.bz + 0.15 * Math.cos(t * m.sw * 0.8 + m.ph);
    }
  };

  return g;
}
