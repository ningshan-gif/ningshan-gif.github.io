// Compact vintage 4-piece jazz drum kit — warm maple shells, chrome hardware,
// brass cymbals. Fits a Japanese wooden room. Faces +Z (kick front head toward
// the visitor), throne behind at -Z. Base of group sits on y = 0. Units: meters.
// Three.js r170 ES module — no imports; receives the THREE namespace.

export function buildDrums(THREE) {
  const g = new THREE.Group();

  // ---------------------------------------------------------------- materials
  const maple = new THREE.MeshPhysicalMaterial({
    color: 0xb3703a,
    roughness: 0.35,
    metalness: 0.0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35
  });
  const headMat = new THREE.MeshStandardMaterial({ color: 0xefe8d8, roughness: 0.6 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dcdf, metalness: 0.85, roughness: 0.3 });
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x55524e, metalness: 0.7, roughness: 0.45 });
  const brass = new THREE.MeshStandardMaterial({
    color: 0xc9a84a,
    metalness: 0.8,
    roughness: 0.35,
    side: THREE.DoubleSide
  });
  const leather = new THREE.MeshStandardMaterial({ color: 0x6a3028, roughness: 0.9 });
  const stickMat = new THREE.MeshStandardMaterial({ color: 0xd9b87f, roughness: 0.7 });

  // ------------------------------------------------------------------ helpers
  const UP = new THREE.Vector3(0, 1, 0);
  const _a = new THREE.Vector3();
  const _d = new THREE.Vector3();

  function M(geo, mat, cast, recv) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = !!cast;
    m.receiveShadow = recv !== false;
    return m;
  }

  // Thin chrome rod between two world points (legs, rods, posts).
  function strut(parent, ax, ay, az, bx, by, bz, r, mat, cast) {
    _a.set(ax, ay, az);
    _d.set(bx, by, bz).sub(_a);
    const len = _d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 10), mat);
    m.castShadow = !!cast;
    m.receiveShadow = true;
    m.position.copy(_a).addScaledVector(_d, 0.5);
    m.quaternion.setFromUnitVectors(UP, _d.normalize());
    parent.add(m);
    return m;
  }

  // Three splayed legs + rubber-ish feet around a stand base.
  function tripodLegs(parent, px, pz, jointY, spread, legR) {
    for (let i = 0; i < 3; i++) {
      const a = i * (Math.PI * 2 / 3) + Math.PI / 6;
      const fx = px + Math.cos(a) * spread;
      const fz = pz + Math.sin(a) * spread;
      strut(parent, px, jointY, pz, fx, 0.012, fz, legR, chrome, false);
      const foot = M(new THREE.SphereGeometry(0.011, 10, 8), darkMetal, false, false);
      foot.position.set(fx, 0.011, fz);
      parent.add(foot);
    }
  }

  // Maple shell + cream top head + chrome hoops + tension lugs, centered on
  // its own origin (y axis = drum axis).
  function drumShell(r, h, lugCount) {
    const d = new THREE.Group();
    const shell = M(new THREE.CylinderGeometry(r, r, h, 24), maple, true, true);
    d.add(shell);

    const top = M(new THREE.CircleGeometry(r * 0.985, 24), headMat, false, true);
    top.rotation.x = -Math.PI / 2;
    top.position.y = h / 2 + 0.0015;
    d.add(top);

    const hoopGeo = new THREE.TorusGeometry(r + 0.003, 0.0065, 8, 24);
    const hoopT = M(hoopGeo, chrome, false, true);
    hoopT.rotation.x = Math.PI / 2;
    hoopT.position.y = h / 2;
    const hoopB = M(hoopGeo, chrome, false, true);
    hoopB.rotation.x = Math.PI / 2;
    hoopB.position.y = -h / 2;
    d.add(hoopT, hoopB);

    if (lugCount) {
      const lugGeo = new THREE.BoxGeometry(0.016, Math.min(0.05, h * 0.45), 0.011);
      for (let i = 0; i < lugCount; i++) {
        const a = (i / lugCount) * Math.PI * 2 + Math.PI / lugCount;
        const lug = M(lugGeo, chrome, false, false);
        lug.position.set(Math.cos(a) * (r + 0.008), 0, Math.sin(a) * (r + 0.008));
        lug.rotation.y = Math.PI / 2 - a;
        d.add(lug);
      }
    }
    return d;
  }

  // Brass cymbal with a gentle dome and bell, base edge at local y = 0.
  function cymbal(r) {
    const pts = [
      new THREE.Vector2(0.004, 0.02),
      new THREE.Vector2(0.016, 0.017),
      new THREE.Vector2(0.024, 0.009),
      new THREE.Vector2(r * 0.5, 0.006),
      new THREE.Vector2(r * 0.85, 0.002),
      new THREE.Vector2(r, 0.0)
    ];
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), brass);
    m.castShadow = false; // thin
    m.receiveShadow = false;
    return m;
  }

  // Cream kick head with a subtle darker ring and a little hand-drawn paw print.
  function kickHeadTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    x.fillStyle = '#f0e9d9';
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(146,101,64,0.45)';
    x.lineWidth = 9;
    x.beginPath();
    x.arc(128, 128, 112, 0, Math.PI * 2);
    x.stroke();
    x.strokeStyle = 'rgba(146,101,64,0.18)';
    x.lineWidth = 3;
    x.beginPath();
    x.arc(128, 128, 98, 0, Math.PI * 2);
    x.stroke();
    // paw print, slightly off-center and rotated — cute nod to the dog
    x.save();
    x.translate(142, 142);
    x.rotate(-0.35);
    x.fillStyle = 'rgba(133,84,50,0.9)';
    x.beginPath();
    x.ellipse(0, 10, 20, 16, 0, 0, Math.PI * 2);
    x.fill();
    const toes = [[-24, -12], [-9, -22], [9, -22], [24, -12]];
    for (let i = 0; i < toes.length; i++) {
      x.beginPath();
      x.ellipse(toes[i][0], toes[i][1], 7.5, 9, 0, 0, Math.PI * 2);
      x.fill();
    }
    x.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // ------------------------------------------------------------- 1. KICK DRUM
  // Lying on its side, axis along Z, front head toward +Z. Hoops kiss floor.
  const kick = new THREE.Group();
  kick.position.set(0.05, 0.294, 0.12);
  g.add(kick);

  const kickShell = M(new THREE.CylinderGeometry(0.28, 0.28, 0.345, 24), maple, true, true);
  kickShell.rotation.x = Math.PI / 2;
  kick.add(kickShell);

  const kickFrontMat = new THREE.MeshStandardMaterial({ map: kickHeadTexture(), roughness: 0.6 });
  const kickFront = M(new THREE.CircleGeometry(0.272, 24), kickFrontMat, false, true);
  kickFront.position.z = 0.176; // faces +Z (CircleGeometry default)
  kick.add(kickFront);

  const kickBack = M(new THREE.CircleGeometry(0.272, 24), headMat, false, true);
  kickBack.position.z = -0.176;
  kickBack.rotation.y = Math.PI;
  kick.add(kickBack);

  // vintage wooden hoops
  const kickHoopGeo = new THREE.TorusGeometry(0.285, 0.008, 8, 24);
  const kickHoopF = M(kickHoopGeo, maple, true, true);
  kickHoopF.position.z = 0.176;
  const kickHoopB = M(kickHoopGeo, maple, true, true);
  kickHoopB.position.z = -0.176;
  kick.add(kickHoopF, kickHoopB);

  // claw lugs around both hoops
  const kickLugGeo = new THREE.BoxGeometry(0.013, 0.013, 0.05);
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const lug = M(kickLugGeo, chrome, false, false);
      lug.position.set(Math.cos(a) * 0.287, Math.sin(a) * 0.287, s * 0.15);
      lug.rotation.z = a;
      kick.add(lug);
    }
  }

  // two small splayed metal legs at the front sides
  for (let s = -1; s <= 1; s += 2) {
    strut(g, 0.05 + s * 0.24, 0.42, 0.24, 0.05 + s * 0.36, 0.02, 0.27, 0.006, chrome, false);
    const foot = M(new THREE.SphereGeometry(0.011, 10, 8), darkMetal, false, false);
    foot.position.set(0.05 + s * 0.36, 0.011, 0.27);
    g.add(foot);
  }

  // ------------------------------------------------------- 2. SNARE ON STAND
  const snare = new THREE.Group();
  snare.position.set(-0.32, 0.555, 0.1);
  snare.rotation.x = -0.12; // slight tilt toward the player (-Z)
  snare.add(drumShell(0.18, 0.14, 8));
  g.add(snare);

  // stand: center rod, tripod, three basket arms
  strut(g, -0.32, 0.03, 0.1, -0.32, 0.46, 0.1, 0.009, chrome, true);
  tripodLegs(g, -0.32, 0.1, 0.3, 0.13, 0.006);
  for (let i = 0; i < 3; i++) {
    const a = i * (Math.PI * 2 / 3) + Math.PI / 2;
    strut(
      g,
      -0.32, 0.44, 0.1,
      -0.32 + Math.cos(a) * 0.15, 0.505, 0.1 + Math.sin(a) * 0.15,
      0.004, chrome, false
    );
  }

  // -------------------------------------------- 8. DRUMSTICKS crossed on snare
  function drumstick() {
    const s = new THREE.Group();
    const shaft = M(new THREE.CylinderGeometry(0.0045, 0.0065, 0.37, 10), stickMat, true, false);
    shaft.rotation.z = Math.PI / 2; // axis along X, thin end at -X
    const tip = M(new THREE.SphereGeometry(0.0075, 10, 8), stickMat, false, false);
    tip.position.x = -0.185;
    tip.scale.set(1.4, 1, 1); // olive-shaped tip
    s.add(shaft, tip);
    return s;
  }
  const stickA = drumstick();
  stickA.position.set(0.01, 0.078, 0.015);
  stickA.rotation.y = 0.45;
  const stickB = drumstick();
  stickB.position.set(-0.015, 0.09, 0.03); // rests across the first stick
  stickB.rotation.y = -0.6;
  snare.add(stickA, stickB);

  // ------------------------------------------------------------- 3. RACK TOM
  const tom = new THREE.Group();
  tom.position.set(0.05, 0.78, 0.02);
  tom.rotation.x = -0.35; // ~20 deg toward the player
  tom.add(drumShell(0.15, 0.13, 6));
  g.add(tom);

  // short chrome mounting post rising from the kick shell
  strut(g, 0.05, 0.56, 0.05, 0.05, 0.73, 0.028, 0.009, chrome, false);
  const mountBlock = M(new THREE.BoxGeometry(0.03, 0.02, 0.03), chrome, false, false);
  mountBlock.position.set(0.05, 0.573, 0.05);
  g.add(mountBlock);

  // ------------------------------------------------------------ 4. FLOOR TOM
  const ftom = new THREE.Group();
  ftom.position.set(0.42, 0.36, 0.05); // top head at y = 0.45
  ftom.add(drumShell(0.2, 0.18, 6));
  g.add(ftom);

  for (let i = 0; i < 3; i++) {
    const a = i * (Math.PI * 2 / 3) + 0.4;
    const fx = 0.42 + Math.cos(a) * 0.245;
    const fz = 0.05 + Math.sin(a) * 0.245;
    strut(g, 0.42 + Math.cos(a) * 0.205, 0.38, 0.05 + Math.sin(a) * 0.205, fx, 0.012, fz, 0.005, chrome, false);
    const foot = M(new THREE.SphereGeometry(0.01, 10, 8), darkMetal, false, false);
    foot.position.set(fx, 0.01, fz);
    g.add(foot);
  }

  // --------------------------------------------------------------- 5. HI-HAT
  strut(g, -0.55, 0.02, 0.15, -0.55, 0.955, 0.15, 0.007, chrome, true);
  tripodLegs(g, -0.55, 0.15, 0.32, 0.14, 0.006);

  const pedal = M(new THREE.BoxGeometry(0.07, 0.014, 0.17), darkMetal, false, true);
  pedal.position.set(-0.55, 0.03, 0.075); // extends toward the player
  pedal.rotation.x = -0.18;
  g.add(pedal);

  const hatBottom = cymbal(0.14);
  hatBottom.position.set(-0.55, 0.9, 0.15);
  const hatTop = cymbal(0.14);
  hatTop.position.set(-0.55, 0.912, 0.15); // 0.012 gap, nearly touching
  hatTop.rotation.y = 0.5;
  g.add(hatBottom, hatTop);

  const clutch = M(new THREE.CylinderGeometry(0.011, 0.011, 0.035, 12), chrome, false, false);
  clutch.position.set(-0.55, 0.943, 0.15);
  g.add(clutch);

  // --------------------------------------------------------- 6. CRASH CYMBAL
  strut(g, 0.58, 0.02, -0.1, 0.58, 0.8, -0.1, 0.008, chrome, true);
  strut(g, 0.58, 0.8, -0.1, 0.58, 1.235, -0.1, 0.006, chrome, false);
  tripodLegs(g, 0.58, -0.1, 0.3, 0.15, 0.006);
  const boomJoint = M(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 12), chrome, false, false);
  boomJoint.position.set(0.58, 0.8, -0.1);
  g.add(boomJoint);

  const crashG = new THREE.Group();
  crashG.position.set(0.58, 1.243, -0.1);
  crashG.rotation.set(-0.24, 0, 0.1); // gentle ~15 deg tilt toward the player
  crashG.add(cymbal(0.17));
  const wingNut = M(new THREE.CylinderGeometry(0.008, 0.008, 0.018, 10), chrome, false, false);
  wingNut.position.y = 0.03;
  crashG.add(wingNut);
  g.add(crashG);

  // ------------------------------------------------------------ 7. DRUM THRONE
  strut(g, 0, 0.02, -0.5, 0, 0.44, -0.5, 0.012, chrome, true);
  tripodLegs(g, 0, -0.5, 0.28, 0.15, 0.007);

  const seat = M(new THREE.CylinderGeometry(0.17, 0.155, 0.075, 24), leather, true, true);
  seat.position.set(0, 0.462, -0.5); // seat top ~y = 0.5
  g.add(seat);
  const cushion = M(new THREE.TorusGeometry(0.142, 0.028, 10, 24), leather, false, true);
  cushion.rotation.x = Math.PI / 2;
  cushion.position.set(0, 0.492, -0.5);
  g.add(cushion);

  return g;
}
