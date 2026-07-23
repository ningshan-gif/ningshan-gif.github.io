// fruits.js — round wooden side table with a ceramic fruit bowl.
// Cozy 3D room module for Three.js r170. No imports: the THREE namespace
// is injected into the factory. Units are meters, Y up, base center at y=0,
// front faces +Z (the grape bunch drapes toward the front).

function makeWoodTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a6a40';
  ctx.fillRect(0, 0, 256, 256);
  // Concentric growth rings, slightly off-center, deterministic wobble.
  const cx = 128;
  const cy = 116;
  for (let i = 0; i < 22; i++) {
    const r = 8 + i * 8.5 + Math.sin(i * 3.7) * 3;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(120,78,44,0.30)' : 'rgba(168,120,76,0.22)';
    ctx.lineWidth = 1.4 + (Math.sin(i * 2.3) + 1) * 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // A few soft grain flecks.
  for (let i = 0; i < 40; i++) {
    const x = (i * 61.7) % 256;
    const y = (i * 97.3) % 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(110,70,40,0.16)' : 'rgba(180,132,86,0.14)';
    ctx.fillRect(x, y, 2 + (i % 3), 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeAppleTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c73a2e';
  ctx.fillRect(0, 0, 128, 64);
  // Vertical (meridian) streaks, deterministic scatter.
  for (let i = 0; i < 34; i++) {
    const x = (i * 37.7) % 128;
    const w = 1 + (i * 13) % 3;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(238,118,82,0.20)' : 'rgba(138,30,20,0.18)';
    ctx.fillRect(x, 0, w, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildFruits(THREE) {
  const g = new THREE.Group();
  g.name = 'fruitSideTable';

  const TABLE_H = 0.52;
  const TOP_T = 0.035;
  const TOP_R = 0.3;

  // ------------------------------------------------------------ materials
  const topMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: makeWoodTexture(THREE),
    roughness: 0.6,
    metalness: 0
  });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x6b452a, roughness: 0.75 });
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xefe4d2,
    roughness: 0.35,
    metalness: 0,
    side: THREE.DoubleSide
  });
  const glazeMat = new THREE.MeshStandardMaterial({ color: 0xb0573a, roughness: 0.4 });
  const redAppleMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: makeAppleTexture(THREE),
    roughness: 0.35
  });
  const greenAppleMat = new THREE.MeshStandardMaterial({ color: 0xb7c24a, roughness: 0.4 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1a, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x5a8a3c, roughness: 0.7 });
  const bananaMat = new THREE.MeshStandardMaterial({ color: 0xe8c94a, roughness: 0.6 });
  const bananaTipMat = new THREE.MeshStandardMaterial({ color: 0x4f3618, roughness: 0.85 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xe8862e, roughness: 0.85 });
  const orangeDotMat = new THREE.MeshStandardMaterial({ color: 0x9c5a1c, roughness: 0.85 });
  const grapeMat = new THREE.MeshStandardMaterial({ color: 0x5a2a5e, roughness: 0.3 });
  const pearMat = new THREE.MeshStandardMaterial({ color: 0xcbbf5a, roughness: 0.5 });
  const pearBlushMat = new THREE.MeshStandardMaterial({ color: 0xd2ac52, roughness: 0.5 });
  const honeyMat = new THREE.MeshStandardMaterial({ color: 0xc9862f, roughness: 0.3 });
  const corkMat = new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.9 });

  // ------------------------------------------------------------ table
  const top = new THREE.Mesh(new THREE.CylinderGeometry(TOP_R, TOP_R, TOP_T, 24), topMat);
  top.position.y = TABLE_H - TOP_T / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  g.add(top);

  const tilt = THREE.MathUtils.degToRad(10);
  const legLen = 0.5;
  const legGeo = new THREE.CylinderGeometry(0.02, 0.022, legLen, 12);
  const legTopR = 0.17;
  const legMidX = legTopR + Math.tan(tilt) * 0.243;
  for (let i = 0; i < 3; i++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = i * (Math.PI * 2 / 3) + Math.PI / 6;
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.rotation.z = tilt; // top leans toward center, foot splays outward
    leg.position.set(legMidX, 0.243, 0);
    leg.castShadow = true;
    leg.receiveShadow = true;
    pivot.add(leg);
    g.add(pivot);
  }

  // ------------------------------------------------------------ bowl
  const bowlG = new THREE.Group();
  bowlG.position.y = TABLE_H;
  g.add(bowlG);

  const bowlProfile = [
    [0.001, 0.012],
    [0.040, 0.012],
    [0.058, 0.016],
    [0.090, 0.028],
    [0.118, 0.046],
    [0.140, 0.066],
    [0.154, 0.082],
    [0.160, 0.090],
    [0.164, 0.089] // slight outward lip
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry(bowlProfile, 24), bowlMat);
  bowl.castShadow = true;
  bowl.receiveShadow = true;
  bowlG.add(bowl);

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.014, 20), bowlMat);
  foot.position.y = 0.007;
  foot.castShadow = true;
  foot.receiveShadow = true;
  bowlG.add(foot);

  const glaze = new THREE.Mesh(new THREE.TorusGeometry(0.157, 0.0035, 8, 48), glazeMat);
  glaze.rotation.x = Math.PI / 2;
  glaze.position.y = 0.085;
  bowlG.add(glaze);

  // ------------------------------------------------------------ fruit helpers
  const appleGeo = new THREE.SphereGeometry(0.042, 20, 14);
  const stemGeo = new THREE.ConeGeometry(0.0035, 0.02, 6);
  const leafGeo = new THREE.SphereGeometry(0.011, 10, 8);

  function makeApple(mat) {
    const a = new THREE.Group();
    const body = new THREE.Mesh(appleGeo, mat);
    body.scale.set(1, 0.92, 1);
    body.castShadow = true;
    body.receiveShadow = true;
    a.add(body);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = 0.043; // base sunk into the top dimple
    a.add(stem);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(1, 0.32, 0.55);
    leaf.position.set(0.013, 0.04, 0.004);
    leaf.rotation.z = -0.55;
    a.add(leaf);
    return a;
  }

  function makeBanana() {
    const b = new THREE.Group();
    const pts = [
      new THREE.Vector3(-0.095, 0.03, 0),
      new THREE.Vector3(-0.05, 0.006, 0),
      new THREE.Vector3(0, -0.003, 0),
      new THREE.Vector3(0.05, 0.006, 0),
      new THREE.Vector3(0.095, 0.03, 0)
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.015, 10, false), bananaMat);
    tube.castShadow = true;
    tube.receiveShadow = true;
    b.add(tube);
    const tipGeo = new THREE.SphereGeometry(0.0155, 10, 8);
    const tipA = new THREE.Mesh(tipGeo, bananaTipMat);
    tipA.position.copy(pts[0]);
    tipA.scale.set(1.2, 0.9, 0.9);
    b.add(tipA);
    const tipB = new THREE.Mesh(tipGeo, bananaTipMat);
    tipB.position.copy(pts[4]);
    tipB.scale.set(1.2, 0.9, 0.9);
    b.add(tipB);
    return b;
  }

  // ------------------------------------------------------------ fruit pile (bowl-local coords)
  const apple1 = makeApple(redAppleMat);
  apple1.position.set(-0.055, 0.056, 0.02);
  apple1.rotation.set(0.15, 1.8, -0.1);
  bowlG.add(apple1);

  const apple2 = makeApple(redAppleMat);
  apple2.position.set(0.05, 0.058, -0.045);
  apple2.rotation.set(-0.1, 3.6, 0.18);
  bowlG.add(apple2);

  const apple3 = makeApple(greenAppleMat);
  apple3.position.set(0.008, 0.058, 0.062);
  apple3.rotation.set(0.2, 0.7, 0.12);
  bowlG.add(apple3);

  const orange = new THREE.Group();
  const orangeBody = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 14), orangeMat);
  orangeBody.castShadow = true;
  orangeBody.receiveShadow = true;
  orange.add(orangeBody);
  const orangeDot = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), orangeDotMat);
  orangeDot.scale.set(1, 0.5, 1);
  orangeDot.position.set(0, 0.039, 0.003);
  orange.add(orangeDot);
  orange.position.set(-0.022, 0.06, -0.062);
  orange.rotation.set(-0.25, 0.4, 0.1);
  bowlG.add(orange);

  const pear = new THREE.Group();
  const pearBody = new THREE.Mesh(new THREE.SphereGeometry(0.031, 16, 12), pearMat);
  pearBody.castShadow = true;
  pearBody.receiveShadow = true;
  pear.add(pearBody);
  const pearTop = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), pearBlushMat);
  pearTop.position.y = 0.028;
  pearTop.castShadow = true;
  pearTop.receiveShadow = true;
  pear.add(pearTop);
  const pearStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0028, 0.02, 6), stemMat);
  pearStem.position.set(0.002, 0.052, 0);
  pearStem.rotation.z = 0.25;
  pear.add(pearStem);
  pear.position.set(0.062, 0.062, 0.036);
  pear.rotation.set(0.5, 0.3, -0.9); // lounging against the bowl wall
  bowlG.add(pear);

  const banana1 = makeBanana();
  banana1.position.set(0.005, 0.108, -0.005);
  banana1.rotation.set(0.06, 0.55, 0.02);
  bowlG.add(banana1);

  const banana2 = makeBanana();
  banana2.position.set(-0.005, 0.128, 0.01);
  banana2.rotation.set(-0.05, -0.65, 0.08);
  bowlG.add(banana2);

  // Grapes draping over the front rim (+Z side). Hardcoded loose triangular bunch.
  const grapeGeo = new THREE.SphereGeometry(0.013, 10, 8);
  const grapePos = [
    [-0.035, 0.098, 0.112],
    [-0.008, 0.104, 0.118],
    [0.020, 0.098, 0.110],
    [0.040, 0.092, 0.122],
    [-0.028, 0.090, 0.136],
    [-0.002, 0.094, 0.140],
    [0.024, 0.088, 0.138],
    [0.044, 0.080, 0.140],
    [-0.018, 0.075, 0.155],
    [0.006, 0.078, 0.158],
    [0.028, 0.072, 0.152],
    [-0.006, 0.058, 0.163],
    [0.016, 0.056, 0.160],
    [0.005, 0.042, 0.158]
  ];
  for (let i = 0; i < grapePos.length; i++) {
    const grape = new THREE.Mesh(grapeGeo, grapeMat);
    grape.position.set(grapePos[i][0], grapePos[i][1], grapePos[i][2]);
    grape.castShadow = false; // perf: tiny
    grape.receiveShadow = true;
    bowlG.add(grape);
  }
  const grapeStem = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0022, 0.035, 6), stemMat);
  grapeStem.position.set(-0.004, 0.114, 0.118);
  grapeStem.rotation.x = 0.5;
  bowlG.add(grapeStem);

  // ------------------------------------------------------------ table charm: loose apple + honey jar
  const looseApple = makeApple(redAppleMat);
  looseApple.position.set(0.21, TABLE_H + 0.0388, 0.09);
  looseApple.rotation.set(0.12, 2.1, 0.15);
  g.add(looseApple);

  const jarG = new THREE.Group();
  const jarProfile = [
    [0.001, 0.0],
    [0.026, 0.0],
    [0.031, 0.006],
    [0.033, 0.02],
    [0.031, 0.04],
    [0.024, 0.05],
    [0.02, 0.054],
    [0.021, 0.058]
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const jar = new THREE.Mesh(new THREE.LatheGeometry(jarProfile, 20), honeyMat);
  jar.castShadow = true;
  jar.receiveShadow = true;
  jarG.add(jar);
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.022, 0.009, 16), corkMat);
  cork.position.y = 0.062;
  cork.castShadow = true;
  jarG.add(cork);
  jarG.position.set(-0.2, TABLE_H, 0.05);
  jarG.rotation.y = 0.4;
  g.add(jarG);

  return g;
}
