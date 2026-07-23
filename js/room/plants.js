// plants.js — set of 4 distinct potted plants for the Japanese wooden room.
// ES module for Three.js r170. No imports; the THREE namespace is injected.
//
// buildPlants(THREE) -> THREE.Group whose direct children are four named
// sub-groups: 'monstera', 'rubber', 'fern', 'sapling'. Each sub-group's pot
// base sits on y=0 at its own local position, so the main scene can
// getObjectByName(...) and reposition/clone them freely.

export function buildPlants(THREE) {
  const root = new THREE.Group();
  root.name = 'plants';

  // Deterministic PRNG so the plants look the same on every load.
  let seed = 20260723;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const randIn = (a, b) => a + (b - a) * rand();

  // Shared dark potting-soil material.
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 1.0 });

  // ======================================================================
  // 1. MONSTERA — the big one (total height ~1.3), woven seagrass basket.
  // ======================================================================
  const monstera = new THREE.Group();
  monstera.name = 'monstera';
  monstera.position.set(-1.2, 0, 0);

  // Subtle horizontal weave stripes, painted procedurally.
  const weaveTex = (() => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c9a878';
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 8) {
      const row = y / 8;
      // staggered over-under blocks suggest the weave
      ctx.fillStyle = 'rgba(112, 82, 46, 0.14)';
      const off = (row % 2) * 8;
      for (let x = -8; x < 64; x += 16) ctx.fillRect(x + off, y, 8, 8);
      // horizontal strand shadow + highlight
      ctx.fillStyle = 'rgba(96, 70, 38, 0.28)';
      ctx.fillRect(0, y + 6, 64, 2);
      ctx.fillStyle = 'rgba(255, 238, 205, 0.20)';
      ctx.fillRect(0, y + 1, 64, 2);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 1.5);
    return t;
  })();

  const basketPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.105, 0.0),
    new THREE.Vector2(0.125, 0.015),
    new THREE.Vector2(0.148, 0.09),
    new THREE.Vector2(0.163, 0.18),
    new THREE.Vector2(0.172, 0.25),
    new THREE.Vector2(0.174, 0.265),
    new THREE.Vector2(0.158, 0.268),
    new THREE.Vector2(0.148, 0.25),
  ];
  const basketMat = new THREE.MeshStandardMaterial({
    map: weaveTex,
    roughness: 0.92,
    side: THREE.DoubleSide,
  });
  const basket = new THREE.Mesh(new THREE.LatheGeometry(basketPts, 24), basketMat);
  basket.castShadow = true;
  basket.receiveShadow = true;
  monstera.add(basket);

  const mSoil = new THREE.Mesh(new THREE.CylinderGeometry(0.149, 0.149, 0.02, 24), soilMat);
  mSoil.position.y = 0.24;
  mSoil.receiveShadow = true;
  monstera.add(mSoil);

  // Heart-ish monstera leaf outline (~0.28 long) with 3 notches per side.
  function monsteraLeafGeo(scale) {
    const R = [
      [0.0, 0.0],
      [0.06, 0.014],
      [0.094, 0.05],
      [0.106, 0.088],
      [0.098, 0.108],
      [0.032, 0.114], // notch 1 in
      [0.094, 0.13], //          out
      [0.088, 0.164],
      [0.027, 0.168], // notch 2 in
      [0.08, 0.186], //           out
      [0.066, 0.216],
      [0.021, 0.219], // notch 3 in
      [0.052, 0.238], //          out
      [0.026, 0.262],
      [0.0, 0.28], // tip
    ];
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.012);
    for (let i = 1; i < R.length; i++) {
      const j = i === R.length - 1 ? 0 : (rand() - 0.5) * 0.008;
      shape.lineTo(R[i][0] + j, R[i][1] + j * 0.5);
    }
    for (let i = R.length - 2; i >= 1; i--) {
      const j = (rand() - 0.5) * 0.008;
      shape.lineTo(-(R[i][0] + j), R[i][1] + j * 0.5);
    }
    shape.lineTo(0, -0.012);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 4,
    });
    geo.translate(0, 0, -0.002);
    geo.scale(scale, scale, 1);
    return geo;
  }

  const mStemMat = new THREE.MeshStandardMaterial({ color: 0x4f7a45, roughness: 0.8 });
  const N_MONSTERA_LEAVES = 7;
  for (let i = 0; i < N_MONSTERA_LEAVES; i++) {
    const ang = (i / N_MONSTERA_LEAVES) * Math.PI * 2 + randIn(-0.25, 0.25);
    const h = randIn(0.55, 1.08);
    const reach = randIn(0.18, 0.3) * (1.28 - h * 0.55); // taller stems stay more upright

    const holder = new THREE.Group();
    holder.rotation.y = ang;

    const stemCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0.24, 0),
      new THREE.Vector3(0, h * 0.72, reach * 0.25),
      new THREE.Vector3(0, h, reach)
    );
    const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 8, 0.0065, 5, false), mStemMat);
    stem.castShadow = true;
    holder.add(stem);

    const leafCol = new THREE.Color(0x3a6a3f).offsetHSL(
      randIn(-0.02, 0.02),
      randIn(-0.05, 0.08),
      randIn(-0.03, 0.03)
    );
    const leafMat = new THREE.MeshStandardMaterial({
      color: leafCol,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(monsteraLeafGeo(randIn(0.9, 1.25)), leafMat);
    leaf.position.set(0, h, reach);
    leaf.rotation.x = Math.PI / 2 - randIn(0.35, 0.75); // tip outward and up
    leaf.rotation.z = randIn(-0.15, 0.15);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    holder.add(leaf);

    monstera.add(holder);
  }

  // ======================================================================
  // 2. RUBBER PLANT — medium (~0.95), terracotta pot, glossy oval leaves.
  // ======================================================================
  const rubber = new THREE.Group();
  rubber.name = 'rubber';
  rubber.position.set(-0.4, 0, 0);

  const terraPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.082, 0.0),
    new THREE.Vector2(0.09, 0.012),
    new THREE.Vector2(0.107, 0.125),
    new THREE.Vector2(0.121, 0.13),
    new THREE.Vector2(0.124, 0.168),
    new THREE.Vector2(0.108, 0.168),
    new THREE.Vector2(0.104, 0.145),
  ];
  const terraMat = new THREE.MeshStandardMaterial({
    color: 0xa5573a,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const terraPot = new THREE.Mesh(new THREE.LatheGeometry(terraPts, 24), terraMat);
  terraPot.castShadow = true;
  terraPot.receiveShadow = true;
  rubber.add(terraPot);

  const rSoil = new THREE.Mesh(new THREE.CylinderGeometry(0.103, 0.103, 0.018, 20), soilMat);
  rSoil.position.y = 0.15;
  rSoil.receiveShadow = true;
  rubber.add(rSoil);

  const rStemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.15, 0),
    new THREE.Vector3(0.012, 0.45, 0.008),
    new THREE.Vector3(-0.008, 0.7, -0.006),
    new THREE.Vector3(0.006, 0.92, 0.01),
  ]);
  const rStemMat = new THREE.MeshStandardMaterial({ color: 0x5d4a30, roughness: 0.9 });
  const rStem = new THREE.Mesh(new THREE.TubeGeometry(rStemCurve, 12, 0.011, 6, false), rStemMat);
  rStem.castShadow = true;
  rubber.add(rStem);

  // Broad pointed oval, extruded thin.
  function ovalLeafGeo(len, wid) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(wid * 1.05, len * 0.22, wid * 0.92, len * 0.55);
    s.quadraticCurveTo(wid * 0.62, len * 0.92, 0, len);
    s.quadraticCurveTo(-wid * 0.62, len * 0.92, -wid * 0.92, len * 0.55);
    s.quadraticCurveTo(-wid * 1.05, len * 0.22, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.004,
      bevelEnabled: false,
      curveSegments: 6,
    });
    g.translate(0, 0, -0.002);
    return g;
  }

  const rubberLeafBase = new THREE.Color(0x2e5230);
  const N_RUBBER_LEAVES = 10;
  for (let i = 0; i < N_RUBBER_LEAVES; i++) {
    const t = 0.24 + (i / (N_RUBBER_LEAVES - 1)) * 0.72;
    const p = rStemCurve.getPoint(t);
    const ang = i * 2.62 + 0.4; // alternating spiral up the stem
    const len = 0.205 - i * 0.007; // slightly smaller toward the top
    const wid = len * 0.42;

    const lg = new THREE.Group();
    lg.position.copy(p);
    lg.rotation.y = ang;

    const mat = new THREE.MeshStandardMaterial({
      color: rubberLeafBase.clone().offsetHSL(0, randIn(-0.04, 0.05), randIn(-0.02, 0.02)),
      roughness: 0.38, // glossy
      side: THREE.DoubleSide,
    });
    const leaf = new THREE.Mesh(ovalLeafGeo(len, wid), mat);
    leaf.position.z = 0.008;
    leaf.rotation.x = Math.PI / 2 + randIn(0.18, 0.38); // slight droop
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    lg.add(leaf);

    rubber.add(lg);
  }

  // Little red new-leaf sheath at the crown (tiny — no shadow).
  const bud = new THREE.Mesh(
    new THREE.ConeGeometry(0.008, 0.05, 8),
    new THREE.MeshStandardMaterial({ color: 0xa8553f, roughness: 0.6 })
  );
  bud.position.set(0.006, 0.945, 0.01);
  rubber.add(bud);

  // ======================================================================
  // 3. FERN — small & fluffy (~0.45), sage ceramic pot, arching fronds.
  // ======================================================================
  const fern = new THREE.Group();
  fern.name = 'fern';
  fern.position.set(0.4, 0, 0);

  const sagePts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.062, 0.0),
    new THREE.Vector2(0.078, 0.012),
    new THREE.Vector2(0.096, 0.055),
    new THREE.Vector2(0.093, 0.1),
    new THREE.Vector2(0.083, 0.118),
    new THREE.Vector2(0.074, 0.106),
  ];
  const sageMat = new THREE.MeshStandardMaterial({
    color: 0x8a9a8a,
    roughness: 0.5, // soft ceramic glaze
    side: THREE.DoubleSide,
  });
  const fernPot = new THREE.Mesh(new THREE.LatheGeometry(sagePts, 24), sageMat);
  fernPot.castShadow = true;
  fernPot.receiveShadow = true;
  fern.add(fernPot);

  const fSoil = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.073, 0.014, 18), soilMat);
  fSoil.position.y = 0.1;
  fSoil.receiveShadow = true;
  fern.add(fSoil);

  const frondMat = new THREE.MeshStandardMaterial({ color: 0x6f963f, roughness: 0.8 });
  const leafletMat = new THREE.MeshStandardMaterial({
    color: 0x7aa04a,
    roughness: 0.75,
    side: THREE.DoubleSide,
  });

  const N_FRONDS = 14;
  const LEAFLETS_PER_FROND = 7;
  // One plane spans both sides of the frond stem; all pairs share one InstancedMesh.
  const leafletGeo = new THREE.PlaneGeometry(0.052, 0.013);
  const leaflets = new THREE.InstancedMesh(leafletGeo, leafletMat, N_FRONDS * LEAFLETS_PER_FROND);
  leaflets.castShadow = false; // tiny leaflets: no shadows

  const dummy = new THREE.Object3D();
  const upV = new THREE.Vector3(0, 1, 0);
  const tanV = new THREE.Vector3();
  const sideV = new THREE.Vector3();
  const normV = new THREE.Vector3();
  const basisM = new THREE.Matrix4();
  let li = 0;

  for (let i = 0; i < N_FRONDS; i++) {
    const ang = (i / N_FRONDS) * Math.PI * 2 + randIn(-0.2, 0.2);
    const dx = Math.sin(ang);
    const dz = Math.cos(ang);
    const L = randIn(0.15, 0.27); // horizontal reach
    const peakY = randIn(0.24, 0.4); // arch height
    const endY = randIn(0.1, 0.2); // drooping tip height

    const frondCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(dx * 0.015, 0.1, dz * 0.015),
      new THREE.Vector3(dx * L * 0.42, peakY, dz * L * 0.42),
      new THREE.Vector3(dx * L, endY, dz * L)
    );
    const tube = new THREE.Mesh(new THREE.TubeGeometry(frondCurve, 8, 0.0024, 4, false), frondMat);
    tube.castShadow = true;
    fern.add(tube);

    for (let k = 0; k < LEAFLETS_PER_FROND; k++) {
      const t = 0.22 + (k / (LEAFLETS_PER_FROND - 1)) * 0.72;
      frondCurve.getPoint(t, dummy.position);
      frondCurve.getTangent(t, tanV).normalize();
      sideV.crossVectors(tanV, upV);
      if (sideV.lengthSq() < 1e-6) sideV.set(1, 0, 0);
      else sideV.normalize();
      normV.crossVectors(sideV, tanV).normalize();
      // Leaflet plane: width across the stem, height along it, facing up-ish.
      basisM.makeBasis(sideV, tanV, normV);
      dummy.quaternion.setFromRotationMatrix(basisM);
      dummy.rotateY(randIn(-0.35, 0.35)); // twist about the frond axis
      const sc = 1.05 - (k / (LEAFLETS_PER_FROND - 1)) * 0.55; // taper to tip
      dummy.scale.set(sc, 1, 1);
      dummy.updateMatrix();
      leaflets.setMatrixAt(li++, dummy.matrix);
    }
  }
  leaflets.instanceMatrix.needsUpdate = true;
  fern.add(leaflets);

  // ======================================================================
  // 4. SAPLING — skinny indoor tree (~1.15), cream pot, blob foliage.
  // ======================================================================
  const sapling = new THREE.Group();
  sapling.name = 'sapling';
  sapling.position.set(1.2, 0, 0);

  const creamPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.068, 0.0),
    new THREE.Vector2(0.076, 0.01),
    new THREE.Vector2(0.086, 0.145),
    new THREE.Vector2(0.09, 0.152),
    new THREE.Vector2(0.088, 0.162),
    new THREE.Vector2(0.076, 0.162),
    new THREE.Vector2(0.073, 0.148),
  ];
  const creamMat = new THREE.MeshStandardMaterial({
    color: 0xe9e1cf,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const creamPot = new THREE.Mesh(new THREE.LatheGeometry(creamPts, 22), creamMat);
  creamPot.castShadow = true;
  creamPot.receiveShadow = true;
  sapling.add(creamPot);

  const tSoil = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.014, 18), soilMat);
  tSoil.position.y = 0.148;
  tSoil.receiveShadow = true;
  sapling.add(tSoil);

  const barkMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: 0.92 });
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.14, 0),
    new THREE.Vector3(0.03, 0.42, 0.012),
    new THREE.Vector3(-0.028, 0.7, -0.01),
    new THREE.Vector3(0.012, 0.97, 0.02),
  ]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 16, 0.0145, 7, false), barkMat);
  trunk.castShadow = true;
  sapling.add(trunk);

  const blobMatA = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.85 });
  const blobMatB = new THREE.MeshStandardMaterial({ color: 0x86a856, roughness: 0.8 });
  const blobGeo = new THREE.SphereGeometry(1, 14, 10);

  const branchDefs = [
    { t: 0.58, dir: new THREE.Vector3(0.8, 0.55, 0.35), len: 0.16, blob: 0.085 },
    { t: 0.74, dir: new THREE.Vector3(-0.75, 0.5, -0.3), len: 0.15, blob: 0.09 },
    { t: 0.88, dir: new THREE.Vector3(0.25, 0.6, -0.75), len: 0.13, blob: 0.08 },
  ];
  for (let i = 0; i < branchDefs.length; i++) {
    const b = branchDefs[i];
    const start = trunkCurve.getPoint(b.t);
    const dir = b.dir.clone().normalize();
    const end = start.clone().addScaledVector(dir, b.len);
    const mid = start.clone().addScaledVector(dir, b.len * 0.5);
    mid.y += 0.02;
    const branchCurve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const branch = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 6, 0.0068, 5, false), barkMat);
    branch.castShadow = true;
    sapling.add(branch);

    const blob = new THREE.Mesh(blobGeo, i % 2 ? blobMatB : blobMatA);
    blob.position.copy(end);
    blob.position.y += b.blob * 0.35;
    blob.scale.set(b.blob, b.blob * 0.72, b.blob);
    blob.castShadow = true;
    sapling.add(blob);
  }

  // Crown clusters at the trunk tip.
  const crownDefs = [
    { x: 0.012, y: 1.02, z: 0.02, r: 0.115, m: blobMatA },
    { x: 0.09, y: 0.975, z: -0.03, r: 0.08, m: blobMatB },
    { x: -0.06, y: 0.99, z: 0.07, r: 0.075, m: blobMatB },
  ];
  for (let i = 0; i < crownDefs.length; i++) {
    const c = crownDefs[i];
    const blob = new THREE.Mesh(blobGeo, c.m);
    blob.position.set(c.x, c.y, c.z);
    blob.scale.set(c.r, c.r * 0.7, c.r);
    blob.castShadow = true;
    sapling.add(blob);
  }

  root.add(monstera, rubber, fern, sapling);
  return root;
}
