// art.js — five art pieces for the room: Calder mobile, bronze sculpture,
// slat wave relief, two Monet-style paintings, and an easel mid-painting.
// Three.js r170 module. No imports; factory receives THREE.

export function buildArt(THREE) {
  const g = new THREE.Group();
  g.name = 'art';

  // ---------------------------------------------------------------- helpers
  let _seed = 987654321;
  const rnd = () => {
    _seed = (_seed * 16807) % 2147483647;
    return (_seed - 1) / 2147483646;
  };
  const rr = (a, b) => a + (b - a) * rnd();

  const UP = new THREE.Vector3(0, 1, 0);
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();
  const _d = new THREE.Vector3();

  // thin cylinder between two points (build-time only)
  function wireBetween(ax, ay, az, bx, by, bz, r, mat, radial) {
    _a.set(ax, ay, az);
    _b.set(bx, by, bz);
    _d.copy(_b).sub(_a);
    const len = _d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, radial || 6), mat);
    m.position.copy(_a).add(_b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, _d.normalize());
    m.castShadow = false;
    return m;
  }

  // box beam between two points (easel members)
  function beamBetween(ax, ay, az, bx, by, bz, sx, sz, mat) {
    _a.set(ax, ay, az);
    _b.set(bx, by, bz);
    _d.copy(_b).sub(_a);
    const len = _d.length();
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, len, sz), mat);
    m.position.copy(_a).add(_b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, _d.normalize());
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // color jitter: '#rrggbb' +- amt fraction per channel
  function jitter(hex, amt) {
    const v = parseInt(hex.slice(1), 16);
    const j = (c) => Math.max(0, Math.min(255, Math.round(c * (1 + (rnd() * 2 - 1) * amt))));
    const r = j((v >> 16) & 255);
    const gg = j((v >> 8) & 255);
    const b = j(v & 255);
    return 'rgb(' + r + ',' + gg + ',' + b + ')';
  }

  // one soft impressionist dab (rotated ellipse)
  function dab(ctx, x, y, w, h, rot, fill, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function makeTex(w, h, painter) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    painter(ctx, w, h);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  // ======================================================================
  // 1) CALDER-STYLE HANGING MOBILE — ceiling point (3.4, 5.0, 1.8)
  // ======================================================================
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x1d1d1d, roughness: 0.55, metalness: 0.35 });

  function blobDisc(r, color) {
    const s = new THREE.Shape();
    const w1 = rr(0.95, 1.3), w2 = rr(0.8, 1.15), h1 = rr(0.7, 1.0), h2 = rr(0.65, 1.0);
    s.moveTo(0, -r);
    s.bezierCurveTo(r * w1, -r * h1, r * w2, r * h2, 0, r);
    s.bezierCurveTo(-r * w2, r * h1, -r * w1, -r * h2, 0, -r);
    const geo = new THREE.ShapeGeometry(s, 8);
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: color, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide
    }));
    m.rotation.z = rr(-0.09, 0.09);
    m.rotation.x = rr(-0.07, 0.07);
    m.castShadow = false;
    return m;
  }

  const mobile = new THREE.Group();
  mobile.position.set(3.4, 5.0, 1.8);

  // ceiling mount button
  const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.02, 12), wireMat);
  mount.position.y = -0.01;
  mobile.add(mount);

  // top wire (sways in z): drops 0.5 to the balance point
  const topWire = new THREE.Group();
  mobile.add(topWire);
  topWire.add(wireBetween(0, 0, 0, 0, -0.5, 0, 0.004, wireMat));

  // ---- tier 1 (arm ~1.0 across -> whole mobile spans ~1.2)
  const tier1 = new THREE.Group();
  tier1.position.set(0, -0.5, 0);
  topWire.add(tier1);
  tier1.add(wireBetween(-0.5, 0.06, 0, 0.5, -0.06, 0, 0.0035, wireMat));
  tier1.add(wireBetween(0.5, -0.06, 0, 0.5, -0.13, 0, 0.0025, wireMat));
  const discRed = blobDisc(0.11, 0xc03a2a); // matte red, size ~0.22
  discRed.position.set(0.5, -0.135, 0);
  tier1.add(discRed);
  tier1.add(wireBetween(-0.5, 0.06, 0, -0.5, -0.26, 0, 0.0025, wireMat));

  // ---- tier 2 (hangs at tier1's high end), abs y ~4.24
  const tier2 = new THREE.Group();
  tier2.position.set(-0.5, -0.26, 0);
  tier1.add(tier2);
  tier2.add(wireBetween(-0.3, 0.05, 0, 0.3, -0.05, 0, 0.003, wireMat));
  tier2.add(wireBetween(0.3, -0.05, 0, 0.3, -0.11, 0, 0.0022, wireMat));
  const discCobalt = blobDisc(0.09, 0x2a5aa0);
  discCobalt.position.set(0.3, -0.115, 0);
  tier2.add(discCobalt);
  tier2.add(wireBetween(-0.3, 0.05, 0, -0.3, -0.26, 0, 0.0022, wireMat));

  // ---- tier 3, abs y ~3.98; lowest disc ~3.85 (stays above y=3.3)
  const tier3 = new THREE.Group();
  tier3.position.set(-0.3, -0.26, 0);
  tier2.add(tier3);
  tier3.add(wireBetween(-0.22, 0.04, 0, 0.22, -0.04, 0, 0.0028, wireMat));
  tier3.add(wireBetween(0.22, -0.04, 0, 0.22, -0.1, 0, 0.002, wireMat));
  const discMustard = blobDisc(0.08, 0xd9a531);
  discMustard.position.set(0.22, -0.105, 0);
  tier3.add(discMustard);
  tier3.add(wireBetween(-0.22, 0.04, 0, -0.22, -0.05, 0, 0.002, wireMat));
  const discCream = blobDisc(0.075, 0xefe6d2);
  discCream.position.set(-0.22, -0.055, 0);
  tier3.add(discCream);
  tier3.add(wireBetween(0.05, -0.009, 0, 0.05, -0.085, 0, 0.002, wireMat));
  const discBlack = blobDisc(0.055, 0x1d1d1d);
  discBlack.position.set(0.05, -0.09, 0);
  tier3.add(discBlack);

  g.add(mobile);

  // ======================================================================
  // 2) MODERN SCULPTURE ON PEDESTAL — (-5.7, 0, 5.6)
  // ======================================================================
  const sculpt = new THREE.Group();
  sculpt.position.set(-5.7, 0, 5.6);

  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.025, 0.52),
    new THREE.MeshStandardMaterial({ color: 0x26221e, roughness: 0.85 })
  );
  basePlate.position.y = 0.0125;
  basePlate.castShadow = true;
  basePlate.receiveShadow = true;
  sculpt.add(basePlate);

  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 1.0, 0.42),
    new THREE.MeshStandardMaterial({ color: 0xefece4, roughness: 0.9 })
  );
  pedestal.position.y = 0.525;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  sculpt.add(pedestal);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.16, 0.05, 90, 12, 2, 3),
    new THREE.MeshPhysicalMaterial({
      color: 0x8a5a28, metalness: 0.9, roughness: 0.25, clearcoat: 0.5
    })
  );
  knot.position.y = 1.27;
  knot.rotation.z = 0.4;
  knot.rotation.y = 0.6;
  knot.castShadow = true;
  knot.receiveShadow = true;
  sculpt.add(knot);

  g.add(sculpt);

  // ======================================================================
  // 3) WOODEN SLAT WAVE RELIEF — above the door on the +Z wall, (4.2, 4.25, 6.9)
  // ======================================================================
  const relief = new THREE.Group();
  relief.position.set(4.2, 4.25, 6.9);

  const backboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.62, 0.5, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x3a2e22, roughness: 0.9 })
  );
  backboard.castShadow = false;
  backboard.receiveShadow = true;
  relief.add(backboard);

  const slatMatA = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.8 });
  const slatMatB = new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.8 });
  const slatMatTeal = new THREE.MeshStandardMaterial({ color: 0x4a7a78, roughness: 0.8 });
  const tealIdx = { 3: true, 9: true, 14: true };
  const NSLATS = 17;
  for (let i = 0; i < NSLATS; i++) {
    const t = i / (NSLATS - 1);
    const depth = 0.02 + 0.08 * Math.abs(Math.sin(t * Math.PI * 2)); // two humps
    const mat = tealIdx[i] ? slatMatTeal : (i % 2 === 0 ? slatMatA : slatMatB);
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, depth), mat);
    slat.position.set(-0.75 + t * 1.5, 0, -(0.015 + depth * 0.5)); // protrudes into room (-Z)
    slat.castShadow = false;
    slat.receiveShadow = true;
    relief.add(slat);
  }
  g.add(relief);

  // ======================================================================
  // 4) MONET-STYLE PAINTINGS
  // ======================================================================
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xb08a3a, metalness: 0.6, roughness: 0.4 });

  function framedPainting(wm, hm, tex) {
    const grp = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.BoxGeometry(wm + 0.07, hm + 0.07, 0.03), goldMat);
    outer.position.z = -0.006;
    const inner = new THREE.Mesh(new THREE.BoxGeometry(wm + 0.025, hm + 0.025, 0.04), goldMat);
    const canvas = new THREE.Mesh(
      new THREE.PlaneGeometry(wm, hm),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92 })
    );
    canvas.position.z = 0.021;
    outer.castShadow = false; inner.castShadow = false; canvas.castShadow = false;
    outer.receiveShadow = true; inner.receiveShadow = true; canvas.receiveShadow = true;
    grp.add(outer, inner, canvas);
    return grp;
  }

  // ---- (a) Water Lilies, 1.15 x 0.85, on the +X wall at (6.9, 2.35, 5.5), facing -X
  const texLilies = makeTex(320, 256, (ctx, W, H) => {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#2e5248');
    grad.addColorStop(1, '#4a7a68');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // loose water body
    for (let i = 0; i < 320; i++) {
      const base = rnd() < 0.5 ? '#35604f' : '#48765f';
      dab(ctx, rnd() * W, rnd() * H, rr(3, 7), rr(2, 4), rr(-0.3, 0.3), jitter(base, 0.08), rr(0.35, 0.7));
    }
    // sky reflection streaks — long thin horizontals in the mid band
    for (let i = 0; i < 70; i++) {
      dab(ctx, rnd() * W, H * (0.25 + rnd() * 0.45), rr(9, 24), rr(1.5, 3), rr(-0.05, 0.05),
        jitter('#a8c8d8', 0.08), rr(0.22, 0.48));
    }
    // willow shadow hints in the top corners
    for (let i = 0; i < 70; i++) {
      const left = i % 2 === 0;
      const x = left ? rnd() * W * 0.22 : W - rnd() * W * 0.22;
      dab(ctx, x, rnd() * H * 0.3, rr(2, 5), rr(6, 14), (left ? 0.3 : -0.3) + rr(-0.2, 0.2),
        jitter(i % 3 ? '#274a35' : '#1e3c2c', 0.08), rr(0.3, 0.6));
    }
    // drifting lily pad clusters
    for (let c = 0; c < 9; c++) {
      const cx = rr(0.08, 0.92) * W, cy = rr(0.3, 0.92) * H;
      const cw = rr(14, 30), ch = cw * rr(0.28, 0.42);
      for (let i = 0; i < 13; i++) {
        dab(ctx, cx + (rnd() - 0.5) * cw, cy + (rnd() - 0.5) * ch, rr(4, 9), rr(2, 4), rr(-0.25, 0.25),
          jitter(rnd() < 0.5 ? '#6a9a55' : '#86b06a', 0.08), rr(0.5, 0.85));
      }
      if (c % 2 === 0) { // pink + white blossoms on some pads
        for (let i = 0; i < 5; i++) {
          dab(ctx, cx + (rnd() - 0.5) * cw * 0.4, cy + (rnd() - 0.5) * ch * 0.5, rr(2, 4), rr(2, 3.5),
            rr(-0.4, 0.4), jitter(rnd() < 0.6 ? '#e8a8c0' : '#f6efe6', 0.08), rr(0.6, 0.9));
        }
      }
    }
    // a few thick bright impasto dabs last
    for (let i = 0; i < 18; i++) {
      dab(ctx, rnd() * W, H * rr(0.35, 0.95), rr(3, 5.5), rr(2.5, 4), rr(-0.4, 0.4),
        jitter(rnd() < 0.5 ? '#f6efe6' : '#e8a8c0', 0.05), rr(0.85, 0.95));
    }
  });
  const lilies = framedPainting(1.15, 0.85, texLilies);
  lilies.position.set(6.9, 2.35, 5.5);
  lilies.rotation.y = -Math.PI / 2; // face -X into the room
  g.add(lilies);

  // ---- (b) Sunrise, 0.62 x 0.5, leaning on the bookshelf against the -Z wall
  const texSunrise = makeTex(320, 256, (ctx, W, H) => {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#8898a8');
    grad.addColorStop(0.5, '#7a90a0');
    grad.addColorStop(1, '#6e8496');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // violet mist haze
    for (let i = 0; i < 240; i++) {
      const base = rnd() < 0.55 ? '#8a86a8' : '#8ea2b0';
      dab(ctx, rnd() * W, rnd() * H, rr(5, 12), rr(3, 6), rr(-0.2, 0.2), jitter(base, 0.08), rr(0.18, 0.4));
    }
    // harbor water strokes in the lower half
    for (let i = 0; i < 200; i++) {
      dab(ctx, rnd() * W, H * (0.48 + rnd() * 0.5), rr(8, 18), rr(1.5, 3), rr(-0.04, 0.04),
        jitter(rnd() < 0.5 ? '#6a8296' : '#78909e', 0.08), rr(0.3, 0.6));
    }
    // faint smoke and rigging hints in the upper mist
    for (let i = 0; i < 45; i++) {
      dab(ctx, rnd() * W, rnd() * H * 0.4, rr(3, 8), rr(2, 5), rr(-0.5, 0.5),
        jitter('#70809a', 0.08), rr(0.15, 0.3));
    }
    const sx = W * 0.62, sy = H * 0.34;
    // sun halo dabs
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2, rad = rr(12, 27);
      dab(ctx, sx + Math.cos(a) * rad, sy + Math.sin(a) * rad * 0.8, rr(4, 8), rr(3, 6), rr(-0.3, 0.3),
        jitter('#ff9a58', 0.08), rr(0.14, 0.3));
    }
    // the burning sun — one bold dab
    dab(ctx, sx, sy, 19, 18, 0, '#ff6a2a', 0.96);
    // broken column of orange reflection below it
    for (let i = 0; i < 16; i++) {
      const y = H * (0.46 + 0.48 * (i / 16));
      dab(ctx, sx + (rnd() - 0.5) * 12, y, rr(6, 14), rr(1.6, 3), rr(-0.05, 0.05),
        jitter(rnd() < 0.5 ? '#ff7a36' : '#ff9a58', 0.08), rr(0.5, 0.8));
    }
    // small dark boat silhouettes
    const boats = [[0.38, 0.6, 1.0], [0.52, 0.72, 1.3], [0.72, 0.66, 0.8]];
    for (let i = 0; i < boats.length; i++) {
      const bx = boats[i][0] * W, by = boats[i][1] * H, s = boats[i][2];
      dab(ctx, bx, by, 15 * s, 3.2 * s, 0.03, '#2a3440', 0.85); // hull
      dab(ctx, bx, by - 7 * s, 1.4, 13 * s, 0.05, '#2a3440', 0.7); // mast
      dab(ctx, bx + 3 * s, by - 2.5 * s, 3 * s, 4 * s, 0, '#2a3440', 0.8); // rower
    }
  });
  const sunrise = framedPainting(0.62, 0.5, texSunrise);
  // frame half-height 0.285; bottom edge rests on the bookshelf top surface (y=1.1)
  sunrise.position.set(-4.55, 1.385, -6.7);
  sunrise.rotation.x = -0.12; // leaning back against the wall, facing +Z
  g.add(sunrise);

  // ======================================================================
  // 5) EASEL WITH A CANVAS IN PROGRESS — (-5.45, 0, 2.3), rot.y = 0.85
  // ======================================================================
  const easel = new THREE.Group();
  easel.position.set(-5.45, 0, 2.3);
  easel.rotation.y = 0.85;

  const easelWood = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 });

  // A-frame: two front legs + rear leg, leaning back ~8 degrees
  easel.add(beamBetween(-0.30, 0.0, 0.16, -0.05, 1.62, -0.06, 0.045, 0.03, easelWood));
  easel.add(beamBetween(0.30, 0.0, 0.16, 0.05, 1.62, -0.06, 0.045, 0.03, easelWood));
  easel.add(beamBetween(0, 0.0, -0.40, 0, 1.58, -0.10, 0.045, 0.03, easelWood));
  // mid crossbar
  easel.add(beamBetween(-0.21, 0.55, 0.085, 0.21, 0.55, 0.085, 0.04, 0.025, easelWood));

  // cross ledge that holds the canvas
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.035, 0.1), easelWood);
  ledge.position.set(0, 0.86, 0.06);
  ledge.rotation.x = -0.135;
  ledge.castShadow = true;
  ledge.receiveShadow = true;
  easel.add(ledge);

  // half-finished japanese-bridge-over-pond canvas
  const texBridge = makeTex(320, 256, (ctx, W, H) => {
    ctx.fillStyle = '#efe8d8'; // bare cream canvas
    ctx.fillRect(0, 0, W, H);
    // pencil-sketch hints in the unfinished top third
    ctx.strokeStyle = '#b0a890';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.65;
    ctx.beginPath(); // arch under-drawing
    ctx.moveTo(W * 0.12, H * 0.52);
    ctx.quadraticCurveTo(W * 0.5, H * 0.2, W * 0.88, H * 0.52);
    ctx.stroke();
    ctx.beginPath(); // upper rail sketch line
    ctx.moveTo(W * 0.14, H * 0.46);
    ctx.quadraticCurveTo(W * 0.5, H * 0.13, W * 0.86, H * 0.46);
    ctx.stroke();
    for (let i = 0; i < 9; i++) { // railing tick sketches
      const t = 0.18 + 0.64 * (i / 8);
      const yb = H * (0.52 - Math.sin(Math.PI * ((t - 0.12) / 0.76)) * 0.3);
      ctx.beginPath();
      ctx.moveTo(W * t, yb);
      ctx.lineTo(W * t, yb - H * 0.055);
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) { // loose foliage scribbles
      const x0 = rnd() * W, y0 = rnd() * H * 0.24;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x0 + rr(-14, 14), y0 + rr(-8, 8), x0 + rr(-14, 14), y0 + rr(-8, 8),
        x0 + rr(-18, 18), y0 + rr(-4, 10));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // transition zone: sparse dabs dissolving up into bare canvas
    for (let i = 0; i < 70; i++) {
      const y = H * rr(0.3, 0.5);
      const p = (y / H - 0.3) / 0.2; // denser lower down
      if (rnd() > p * 0.9 + 0.1) continue;
      dab(ctx, rnd() * W, y, rr(3, 7), rr(2, 4), rr(-0.3, 0.3),
        jitter(rnd() < 0.6 ? '#6a9a55' : '#4a7a4a', 0.08), rr(0.3, 0.6));
    }
    // densely dabbed finished bottom half: greens + pond blues
    for (let i = 0; i < 430; i++) {
      const y = H * rr(0.48, 1.0);
      let base;
      if (y > H * 0.72) base = rnd() < 0.55 ? '#5a8ab0' : (rnd() < 0.5 ? '#4a7a4a' : '#6a9a55');
      else base = rnd() < 0.5 ? '#4a7a4a' : '#6a9a55';
      dab(ctx, rnd() * W, y, rr(3, 8), rr(2, 4.5), rr(-0.35, 0.35), jitter(base, 0.08), rr(0.4, 0.8));
    }
    // the arched bridge in soft teal — short curved strokes
    for (let i = 0; i < 90; i++) {
      const t = rnd();
      const x = W * (0.12 + 0.76 * t);
      const y = H * (0.52 - Math.sin(t * Math.PI) * 0.18) + rr(-3, 3);
      dab(ctx, x, y, rr(5, 9), rr(2, 3.5), -Math.cos(t * Math.PI) * 0.45,
        jitter('#4a7a88', 0.08), rr(0.5, 0.85));
    }
    for (let i = 0; i < 40; i++) { // upper rail strokes, thinner
      const t = rnd();
      const x = W * (0.14 + 0.72 * t);
      const y = H * (0.46 - Math.sin(t * Math.PI) * 0.17) + rr(-2, 2);
      dab(ctx, x, y, rr(4, 7), rr(1.5, 2.5), -Math.cos(t * Math.PI) * 0.45,
        jitter('#4a7a88', 0.08), rr(0.4, 0.7));
    }
    // water sparkle impasto in the finished part
    for (let i = 0; i < 14; i++) {
      dab(ctx, rnd() * W, H * rr(0.75, 0.97), rr(4, 7), rr(1.5, 2.5), rr(-0.1, 0.1),
        jitter('#a8c8d8', 0.06), rr(0.7, 0.9));
    }
  });

  const canvasGrp = new THREE.Group();
  canvasGrp.position.set(0, 1.155, 0.03);
  canvasGrp.rotation.x = -0.135;
  const canvasBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.55, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.95 })
  );
  canvasBack.castShadow = true;
  canvasBack.receiveShadow = true;
  canvasGrp.add(canvasBack);
  const paintedFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.68, 0.53),
    new THREE.MeshStandardMaterial({ map: texBridge, roughness: 0.92 })
  );
  paintedFace.position.z = 0.0115;
  paintedFace.castShadow = false;
  paintedFace.receiveShadow = true;
  canvasGrp.add(paintedFace);
  // top clamp
  const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.06), easelWood);
  clamp.position.set(0, 0.3, 0);
  clamp.castShadow = true;
  canvasGrp.add(clamp);
  // small lower lip
  const lip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05), easelWood);
  lip.position.set(0, -0.295, 0.005);
  lip.castShadow = true;
  canvasGrp.add(lip);
  easel.add(canvasGrp);

  // wooden palette with 6 paint blobs, hooked on the ledge
  const palette = new THREE.Group();
  palette.position.set(0.19, 0.9, 0.1);
  palette.rotation.set(-0.135, 0, 0.15);
  const palBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.105, 0.105, 0.012, 20),
    new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: 0.75 })
  );
  palBody.scale.z = 0.72; // flat oval
  palBody.castShadow = false;
  palBody.receiveShadow = true;
  palette.add(palBody);
  const blobCols = [0xc03a2a, 0x2a5aa0, 0xd9a531, 0xefe6d2, 0x4a7a4a, 0x2a3440];
  for (let i = 0; i < 6; i++) {
    const a = -0.6 + i * 0.42;
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(0.013, 10, 6),
      new THREE.MeshStandardMaterial({ color: blobCols[i], roughness: 0.4 })
    );
    blob.scale.y = 0.45;
    blob.position.set(Math.cos(a) * 0.075, 0.008, Math.sin(a) * 0.055);
    blob.castShadow = false;
    palette.add(blob);
  }
  easel.add(palette);

  // two thin brushes resting on the ledge
  function makeBrush(len) {
    const br = new THREE.Group();
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0045, 0.006, len, 8),
      new THREE.MeshStandardMaterial({ color: 0xb08a58, roughness: 0.6 })
    );
    br.add(handle);
    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.018, 8),
      new THREE.MeshStandardMaterial({ color: 0xb0b0b8, metalness: 0.8, roughness: 0.3 })
    );
    ferrule.position.y = len * 0.5 + 0.009;
    br.add(ferrule);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.0045, 0.02, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a3440, roughness: 0.9 })
    );
    tip.position.y = len * 0.5 + 0.028;
    br.add(tip);
    br.traverse((o) => { o.castShadow = false; });
    return br;
  }
  const brush1 = makeBrush(0.2);
  brush1.position.set(-0.13, 0.905, 0.09);
  brush1.rotation.set(-0.135, 0.35, 1.62);
  easel.add(brush1);
  const brush2 = makeBrush(0.17);
  brush2.position.set(-0.05, 0.907, 0.105);
  brush2.rotation.set(-0.135, -0.25, 1.52);
  easel.add(brush2);

  g.add(easel);

  // ---------------------------------------------------------------- update
  // Precomputed refs only — zero allocations per call.
  g.userData.update = (t, dt) => {
    topWire.rotation.z = Math.sin(t * 0.3) * 0.01; // barely-visible sway
    tier1.rotation.y = t * 0.05;
    tier2.rotation.y = t * 0.08;
    tier3.rotation.y = -t * 0.06;
  };

  return g;
}
