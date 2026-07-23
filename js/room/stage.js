// stage.js — moody live-house / studio stage room.
// Near-black, intimate, electric: deep blues and violets with hot warm accents.
// Three.js r170 module. No imports, no real lights (glow = emissive).

export function buildStage(THREE) {
  const g = new THREE.Group();

  // ---------- helpers ----------
  function mkCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }
  function srgb(tex) {
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  function addBox(w, h, d, mat, x, y, z, cast, recv) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = !!cast;
    m.receiveShadow = recv === undefined ? true : !!recv;
    g.add(m);
    return m;
  }

  // ---------- 1. ROOM SHELL ----------
  // floor: dark stained concrete/wood, procedural planks + scuffs
  const fc = mkCanvas(512, 512);
  const fx = fc.getContext('2d');
  fx.fillStyle = '#17151c';
  fx.fillRect(0, 0, 512, 512);
  // plank tone variation
  for (let i = 0; i < 8; i++) {
    const shade = 8 + Math.floor(Math.random() * 10);
    fx.fillStyle = 'rgba(' + (20 + shade) + ',' + (18 + shade) + ',' + (26 + shade) + ',0.35)';
    fx.fillRect(0, i * 64, 512, 64);
  }
  // plank seams
  fx.strokeStyle = 'rgba(0,0,0,0.5)';
  fx.lineWidth = 2;
  for (let i = 1; i < 8; i++) {
    fx.beginPath();
    fx.moveTo(0, i * 64);
    fx.lineTo(512, i * 64);
    fx.stroke();
    // butt joints, staggered
    const off = (i % 2) * 200 + 60;
    fx.beginPath();
    fx.moveTo(off, (i - 1) * 64);
    fx.lineTo(off, i * 64);
    fx.stroke();
  }
  // subtle scuffs
  for (let i = 0; i < 46; i++) {
    fx.strokeStyle = 'rgba(190,180,200,' + (0.02 + Math.random() * 0.03) + ')';
    fx.lineWidth = 1 + Math.random() * 2;
    const sx = Math.random() * 512, sy = Math.random() * 512;
    fx.beginPath();
    fx.moveTo(sx, sy);
    fx.lineTo(sx + (Math.random() - 0.5) * 90, sy + (Math.random() - 0.5) * 30);
    fx.stroke();
  }
  const floorTex = srgb(new THREE.CanvasTexture(fc));
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2, 2);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // walls (boxes centered at +/-8, inner faces ~ +/-7.93)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1720, roughness: 0.95 });
  addBox(16.3, 6.4, 0.14, wallMat, 0, 3, -8, false, true);
  addBox(16.3, 6.4, 0.14, wallMat, 0, 3, 8, false, true);
  addBox(0.14, 6.4, 16.3, wallMat, -8, 3, 0, false, true);
  addBox(0.14, 6.4, 16.3, wallMat, 8, 3, 0, false, true);

  // ceiling
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x121017, roughness: 1.0 });
  addBox(16.3, 0.14, 16.3, ceilMat, 0, 6.07, 0, false, true);

  // acoustic panel band along side walls
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x221e2a, roughness: 0.95 });
  for (let zi = -6; zi <= 6; zi += 2) {
    addBox(0.08, 1.8, 1.1, panelMat, -7.89, 2.4, zi, false, true);
    addBox(0.08, 1.8, 1.1, panelMat, 7.89, 2.4, zi, false, true);
  }

  // ceiling truss hint: 2 dark pipes running x-direction
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x2a2730, metalness: 0.6, roughness: 0.5 });
  for (const tz of [-2.5, 2.5]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 15.6, 12), trussMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, 5.6, tz);
    g.add(pipe);
  }

  // ---------- 2. STAGE PLATFORM ----------
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0x0d0c10, roughness: 0.9 });
  const stageWoodMat = new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 0.6 });
  addBox(7, 0.40, 3, skirtMat, 0, 0.20, -6.1, true, true);            // black skirt body
  addBox(7.04, 0.05, 3.04, stageWoodMat, 0, 0.425, -6.1, true, true); // dark wood top
  // worn edge strip along the front lip
  const wornMat = new THREE.MeshStandardMaterial({ color: 0x3b2f1f, roughness: 0.8 });
  addBox(7.06, 0.025, 0.07, wornMat, 0, 0.443, -4.585, false, true);
  // 3 shallow steps up at stage-right (x ~ 3.2)
  addBox(0.7, 0.34, 0.3, stageWoodMat, 3.2, 0.17, -4.45, true, true);
  addBox(0.7, 0.23, 0.3, stageWoodMat, 3.2, 0.115, -4.15, true, true);
  addBox(0.7, 0.115, 0.3, stageWoodMat, 3.2, 0.0575, -3.85, true, true);

  // ---------- 3. VIDEO WALL MOUNT (empty grid on -Z wall) ----------
  const mullMat = new THREE.MeshStandardMaterial({ color: 0x16141a, metalness: 0.3, roughness: 0.6 });
  for (let i = 0; i <= 4; i++) {
    const mx = -3.3 + i * 1.65;
    addBox(0.06, 4.06, 0.06, mullMat, mx, 3, -7.88, false, false);
  }
  for (let j = 0; j <= 3; j++) {
    const my = 1 + j * (4 / 3);
    addBox(6.66, 0.06, 0.06, mullMat, 0, my, -7.88, false, false);
  }
  // slim outer frame
  addBox(6.9, 0.1, 0.12, mullMat, 0, 5.05, -7.87, false, false);
  addBox(6.9, 0.1, 0.12, mullMat, 0, 0.95, -7.87, false, false);
  addBox(0.1, 4.3, 0.12, mullMat, -3.4, 3, -7.87, false, false);
  addBox(0.1, 4.3, 0.12, mullMat, 3.4, 3, -7.87, false, false);

  // ---------- 4. BAND GEAR ----------
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xc8c8d0, metalness: 0.9, roughness: 0.25 });
  const gearBlackMat = new THREE.MeshStandardMaterial({ color: 0x141216, roughness: 0.8 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 });

  // MIC STAND at (0.6, 0.45, -4.9)
  const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 20), gearBlackMat);
  micBase.position.set(0.6, 0.465, -4.9);
  micBase.castShadow = true;
  g.add(micBase);
  const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 10), chromeMat);
  micPole.position.set(0.6, 1.205, -4.9);
  micPole.castShadow = true;
  g.add(micPole);
  const micClip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 0.16, 10), gearBlackMat);
  micClip.position.set(0.6, 1.96, -4.93);
  micClip.rotation.x = -0.55;
  g.add(micClip);
  const micBall = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0x33343a, metalness: 0.6, roughness: 0.5 }));
  micBall.position.set(0.6, 2.01, -4.965);
  micBall.castShadow = true;
  g.add(micBall);
  // mic cable curling on the stage floor
  const micCablePts = [
    new THREE.Vector3(0.63, 0.47, -4.9),
    new THREE.Vector3(0.85, 0.463, -4.98),
    new THREE.Vector3(0.95, 0.462, -5.2),
    new THREE.Vector3(0.8, 0.462, -5.35),
    new THREE.Vector3(0.6, 0.462, -5.25),
    new THREE.Vector3(0.56, 0.462, -5.05),
    new THREE.Vector3(0.78, 0.462, -5.12),
    new THREE.Vector3(1.1, 0.462, -5.32),
    new THREE.Vector3(1.5, 0.462, -5.65),
    new THREE.Vector3(1.95, 0.462, -6.05),
    new THREE.Vector3(2.35, 0.47, -6.38)
  ];
  const micCable = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(micCablePts), 64, 0.012, 6, false), cableMat);
  g.add(micCable);

  // AMP STACK at (2.4, 0.45, -6.6)
  const gc = mkCanvas(128, 128);
  const gx = gc.getContext('2d');
  gx.fillStyle = '#0c0b0a';
  gx.fillRect(0, 0, 128, 128);
  gx.strokeStyle = 'rgba(46,40,32,0.55)';
  gx.lineWidth = 1;
  for (let i = 0; i < 128; i += 4) {
    gx.beginPath(); gx.moveTo(0, i); gx.lineTo(128, i); gx.stroke();
    gx.beginPath(); gx.moveTo(i, 0); gx.lineTo(i, 128); gx.stroke();
  }
  for (let i = 0; i < 60; i++) {
    gx.fillStyle = 'rgba(70,62,50,' + (0.05 + Math.random() * 0.1) + ')';
    gx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const grilleTex = srgb(new THREE.CanvasTexture(gc));
  grilleTex.wrapS = grilleTex.wrapT = THREE.RepeatWrapping;
  grilleTex.repeat.set(2, 2);
  const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, roughness: 0.95 });
  addBox(0.78, 0.6, 0.42, gearBlackMat, 2.4, 0.75, -6.6, true, true);   // cab
  addBox(0.72, 0.32, 0.38, gearBlackMat, 2.4, 1.21, -6.6, true, true);  // head
  const grille1 = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.5), grilleMat);
  grille1.position.set(2.4, 0.75, -6.388);
  g.add(grille1);
  const grille2 = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2), grilleMat);
  grille2.position.set(2.4, 1.19, -6.408);
  g.add(grille2);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x200806, emissive: 0xff4a3a, emissiveIntensity: 2.5, roughness: 0.5
  });
  const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), ledMat);
  led1.position.set(2.68, 1.32, -6.405);
  g.add(led1);
  const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), ledMat);
  led2.position.set(2.7, 0.96, -6.385);
  g.add(led2);
  // tiny red standby glow
  const standby = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a0a08, emissive: 0xff4a3a, emissiveIntensity: 1.1, roughness: 0.6 }));
  standby.position.set(2.12, 1.28, -6.4);
  g.add(standby);

  // MONITOR WEDGES at (+/-1.8, 0.45, -4.8)
  for (const wx of [-1.8, 1.8]) {
    const wedge = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.42), gearBlackMat);
    wedge.position.set(wx, 0.63, -4.8);
    wedge.rotation.x = -0.5;
    wedge.castShadow = true;
    wedge.receiveShadow = true;
    g.add(wedge);
  }

  // coiled cables on the stage floor
  const coilA = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.013, 8, 24, 5.4), cableMat);
  coilA.rotation.x = Math.PI / 2;
  coilA.position.set(1.7, 0.465, -5.9);
  g.add(coilA);
  const coilB = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 8, 24, 5.9), cableMat);
  coilB.rotation.x = Math.PI / 2;
  coilB.position.set(-1.6, 0.465, -6.5);
  g.add(coilB);
  const coilC = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.011, 8, 20, 4.8), cableMat);
  coilC.rotation.x = Math.PI / 2;
  coilC.position.set(2.0, 0.464, -5.15);
  g.add(coilC);

  // ---------- 5. NEON SIGN 'otonoori' ----------
  const backMat = new THREE.MeshStandardMaterial({
    color: 0x0d0b10, emissive: 0xff6ab0, emissiveIntensity: 0.12, roughness: 0.9
  });
  addBox(3.9, 0.95, 0.05, backMat, 0, 5.35, -7.895, false, false);
  const neonMat = new THREE.MeshStandardMaterial({
    color: 0x2a0a18, emissive: 0xff6ab0, emissiveIntensity: 2.2, roughness: 0.4
  });
  function neonStroke(pts2d, seg) {
    const pts = [];
    for (let i = 0; i < pts2d.length; i++) {
      pts.push(new THREE.Vector3(pts2d[i][0], pts2d[i][1], -7.83 + (i % 2) * 0.006));
    }
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, 0.035, 8, false), neonMat);
    g.add(mesh);
    return mesh;
  }
  // flowing cursive ribbon, 3 pen lifts (not letter-perfect on purpose)
  neonStroke([
    [-1.6, 5.12], [-1.42, 5.5], [-1.22, 5.18], [-1.02, 5.48], [-0.85, 5.16],
    [-0.66, 5.5], [-0.5, 5.2], [-0.3, 5.5], [-0.14, 5.16], [0.05, 5.48],
    [0.22, 5.2], [0.42, 5.46], [0.6, 5.24], [0.75, 5.34]
  ], 120);
  neonStroke([
    [0.85, 5.14], [1.0, 5.48], [1.15, 5.2], [1.32, 5.44], [1.5, 5.3], [1.62, 5.5], [1.72, 5.1]
  ], 60);
  neonStroke([[-1.72, 5.55], [-1.56, 5.63], [-1.42, 5.56]], 16);
  // teal neon circle + note accent
  const tealMat = new THREE.MeshStandardMaterial({
    color: 0x06201d, emissive: 0x4ae0d0, emissiveIntensity: 2.0, roughness: 0.4
  });
  const tealRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.024, 8, 24), tealMat);
  tealRing.position.set(2.25, 5.35, -7.83);
  g.add(tealRing);
  const noteHead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), tealMat);
  noteHead.position.set(2.2, 5.27, -7.83);
  g.add(noteHead);
  const noteStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), tealMat);
  noteStem.position.set(2.24, 5.38, -7.83);
  noteStem.rotation.z = -0.08;
  g.add(noteStem);

  // ---------- 6. HAZE + ATMOSPHERE ----------
  const coneDefs = [
    { from: [-1.8, 5.6, -2.5], to: [-1.5, 0.45, -6.2], color: 0x8a5ae0, r: 1.0, op: 0.09 },
    { from: [1.8, 5.6, -2.5],  to: [1.4, 0.45, -6.0],  color: 0x4ae0d0, r: 0.95, op: 0.08 },
    { from: [-0.8, 5.6, 2.5],  to: [0.0, 0.45, -5.5],  color: 0xffb060, r: 1.15, op: 0.06 },
    { from: [2.6, 5.6, 2.5],   to: [2.2, 0.45, -5.8],  color: 0xff6ab0, r: 1.05, op: 0.07 }
  ];
  const coneMats = [];
  const coneBase = [];
  const vDown = new THREE.Vector3(0, -1, 0);
  for (const cd of coneDefs) {
    const src = new THREE.Vector3(cd.from[0], cd.from[1], cd.from[2]);
    const dst = new THREE.Vector3(cd.to[0], cd.to[1], cd.to[2]);
    const dir = dst.clone().sub(src);
    const len = dir.length();
    dir.normalize();
    const geo = new THREE.ConeGeometry(cd.r, len, 20, 1, true);
    geo.translate(0, -len / 2, 0); // apex at origin, opening along -y
    const mat = new THREE.MeshStandardMaterial({
      color: 0x000000, emissive: cd.color, emissiveIntensity: 1.2,
      transparent: true, opacity: cd.op, side: THREE.DoubleSide,
      depthWrite: false, roughness: 1.0
    });
    const cone = new THREE.Mesh(geo, mat);
    cone.quaternion.setFromUnitVectors(vDown, dir);
    cone.position.copy(src);
    cone.castShadow = false;
    cone.receiveShadow = false;
    g.add(cone);
    coneMats.push(mat);
    coneBase.push(cd.op);
  }
  // floating dust motes
  const moteMat = new THREE.MeshStandardMaterial({
    color: 0x201c28, emissive: 0xb0a8d8, emissiveIntensity: 0.9, roughness: 1.0
  });
  const moteGeo = new THREE.SphereGeometry(0.012, 8, 6);
  const moteMeshes = [];
  const moteSpeed = [];
  const moteBaseX = [];
  for (let i = 0; i < 12; i++) {
    const m = new THREE.Mesh(moteGeo, moteMat);
    const bx = -3 + Math.random() * 6;
    m.position.set(bx, 0.5 + Math.random() * 4.5, -6.5 + Math.random() * 5);
    g.add(m);
    moteMeshes.push(m);
    moteSpeed.push(0.06 + Math.random() * 0.09);
    moteBaseX.push(bx);
  }

  // ---------- 7. AUDIENCE-SIDE COZY BITS ----------
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x191720, roughness: 0.7 });
  const teaMat = new THREE.MeshStandardMaterial({
    color: 0x2a1608, emissive: 0xffb060, emissiveIntensity: 1.6, roughness: 0.6
  });
  const tablePos = [[-2.3, 1.3], [0.9, 2.5], [2.9, 0.7]];
  for (const tp of tablePos) {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 20), tableMat);
    top.position.set(tp[0], 0.76, tp[1]);
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.73, 12), tableMat);
    col.position.set(tp[0], 0.385, tp[1]);
    col.castShadow = true;
    g.add(col);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.025, 20), tableMat);
    base.position.set(tp[0], 0.0125, tp[1]);
    g.add(base);
    const tea = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), teaMat);
    tea.position.set(tp[0] + 0.08, 0.805, tp[1]);
    g.add(tea);
  }
  // worn rug in front of the stage
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.02, 24),
    new THREE.MeshStandardMaterial({ color: 0x4a1f24, roughness: 1.0 }));
  rug.position.set(0, 0.01, -3.3);
  rug.receiveShadow = true;
  g.add(rug);
  // 2 floor cushions
  const cushA = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12),
    new THREE.MeshStandardMaterial({ color: 0x2c2333, roughness: 0.95 }));
  cushA.scale.set(1, 0.35, 1);
  cushA.position.set(-0.9, 0.115, -2.3);
  cushA.castShadow = true;
  cushA.receiveShadow = true;
  g.add(cushA);
  const cushB = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12),
    new THREE.MeshStandardMaterial({ color: 0x33222a, roughness: 0.95 }));
  cushB.scale.set(1, 0.35, 1);
  cushB.position.set(1.2, 0.115, -1.7);
  cushB.castShadow = true;
  cushB.receiveShadow = true;
  g.add(cushB);
  // vinyl-record crate leaning by the stage
  const crate = new THREE.Group();
  crate.position.set(-3.05, 0.17, -4.28);
  crate.rotation.y = 0.35;
  crate.rotation.z = 0.08;
  const crateBox = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.34),
    new THREE.MeshStandardMaterial({ color: 0x241c14, roughness: 0.85 }));
  crateBox.castShadow = true;
  crateBox.receiveShadow = true;
  crate.add(crateBox);
  const sleeveColors = [0xb5544c, 0x4a7fb5, 0xd8b04a];
  for (let i = 0; i < 3; i++) {
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.012),
      new THREE.MeshStandardMaterial({ color: sleeveColors[i], roughness: 0.9 }));
    sleeve.position.set(0, 0.1, -0.1 + i * 0.05);
    sleeve.rotation.x = -0.12 + i * 0.09;
    sleeve.castShadow = true;
    crate.add(sleeve);
  }
  g.add(crate);

  // ---------- 8. EXIT DOOR (+Z wall, x = -3.5) ----------
  const door = new THREE.Group();
  door.name = 'exitDoor';
  door.position.set(-3.5, 0, 7.9);
  const doorSlab = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x15121a, roughness: 0.85 }));
  doorSlab.position.set(0, 1.05, 0);
  doorSlab.castShadow = true;
  doorSlab.receiveShadow = true;
  door.add(doorSlab);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), chromeMat);
  knob.position.set(0.38, 1.05, -0.05);
  door.add(knob);
  // warm glowing outline seam
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x201408, emissive: 0xffb060, emissiveIntensity: 1.4, roughness: 0.6
  });
  const seamL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.14, 0.02), seamMat);
  seamL.position.set(-0.52, 1.07, -0.02);
  door.add(seamL);
  const seamR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.14, 0.02), seamMat);
  seamR.position.set(0.52, 1.07, -0.02);
  door.add(seamR);
  const seamT = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.02, 0.02), seamMat);
  seamT.position.set(0, 2.13, -0.02);
  door.add(seamT);
  // dark frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x221e2a, roughness: 0.9 });
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.08, 0.1), frameMat);
  frameTop.position.set(0, 2.2, -0.01);
  door.add(frameTop);
  for (const fxo of [-0.58, 0.58]) {
    const fs = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.24, 0.1), frameMat);
    fs.position.set(fxo, 1.12, -0.01);
    door.add(fs);
  }
  // canvas sign above the door
  const sc = mkCanvas(512, 128);
  const sx = sc.getContext('2d');
  sx.fillStyle = '#141218';
  sx.fillRect(0, 0, 512, 128);
  sx.strokeStyle = 'rgba(255,176,96,0.5)';
  sx.lineWidth = 3;
  sx.strokeRect(6, 6, 500, 116);
  sx.fillStyle = '#ffcf9a';
  sx.font = 'italic 44px Georgia, serif';
  sx.textAlign = 'center';
  sx.textBaseline = 'middle';
  sx.fillText('← back to the room', 256, 66);
  const signTex = srgb(new THREE.CanvasTexture(sc));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.32),
    new THREE.MeshStandardMaterial({
      map: signTex, emissive: 0xffffff, emissiveMap: signTex,
      emissiveIntensity: 0.55, roughness: 0.9
    }));
  sign.position.set(0, 2.52, -0.035);
  sign.rotation.y = Math.PI;
  door.add(sign);
  g.add(door);

  // ---------- 9. userData.update ----------
  const NEON_BASE = 2.2;
  const BACK_BASE = 0.12;
  g.userData.update = function (t, dt) {
    const d = dt || 0.016;
    // neon flicker: +/-8% at ~7 Hz with occasional dips
    let f = 1 + 0.08 * Math.sin(t * 43.98);
    const dip = Math.sin(t * 2.17) * Math.sin(t * 5.71 + 1.3);
    if (dip > 0.98) f *= 0.45;
    neonMat.emissiveIntensity = NEON_BASE * f;
    backMat.emissiveIntensity = BACK_BASE * f;
    // dust motes drifting upward, wrap at y = 5.5
    for (let i = 0; i < moteMeshes.length; i++) {
      const m = moteMeshes[i];
      m.position.y += moteSpeed[i] * d;
      if (m.position.y > 5.5) m.position.y = 0.3;
      m.position.x = moteBaseX[i] + Math.sin(t * 0.4 + i * 1.7) * 0.15;
    }
    // spotlight cones breathing
    for (let i = 0; i < coneMats.length; i++) {
      coneMats[i].opacity = coneBase[i] + Math.sin(t * 0.6 + i * 1.9) * 0.02;
    }
  };

  return g;
}
