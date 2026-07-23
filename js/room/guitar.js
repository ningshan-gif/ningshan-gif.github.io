// Fender Stratocaster on a tripod A-frame stand — cozy 3D room module.
// Export: buildGuitar(THREE). Units: meters. Base center at y=0, front faces +Z.

function makeSunburstTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1d0f08';
  ctx.fillRect(0, 0, 512, 512);
  const grd = ctx.createRadialGradient(256, 256, 24, 256, 256, 252);
  grd.addColorStop(0.0, '#e8a84a');
  grd.addColorStop(0.38, '#dd9440');
  grd.addColorStop(0.7, '#8a3a1e');
  grd.addColorStop(1.0, '#1d0f08');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  // ExtrudeGeometry cap UVs equal shape-space (x, y) in meters; remap the
  // body bounding box (incl. bevel) into [0,1] canvas space.
  tex.repeat.set(1 / 0.35, 1 / 0.49);
  tex.offset.set(0.5, 0.5);
  return tex;
}

// Stratocaster body outline (XY plane, ~0.46 tall x 0.33 wide, centered).
function makeBodyShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(0.0, -0.23);
  s.bezierCurveTo(0.09, -0.234, 0.158, -0.19, 0.163, -0.11);   // lower bout, treble
  s.bezierCurveTo(0.166, -0.052, 0.13, -0.03, 0.12, 0.005);    // treble waist
  s.bezierCurveTo(0.112, 0.04, 0.146, 0.058, 0.15, 0.105);     // out to treble horn
  s.bezierCurveTo(0.153, 0.148, 0.133, 0.178, 0.108, 0.188);   // horn tip
  s.bezierCurveTo(0.09, 0.195, 0.08, 0.185, 0.082, 0.168);     // tip rounding
  s.bezierCurveTo(0.086, 0.14, 0.07, 0.116, 0.042, 0.128);     // cutaway scoop
  s.bezierCurveTo(0.015, 0.138, -0.015, 0.138, -0.042, 0.126); // across neck pocket
  s.bezierCurveTo(-0.07, 0.114, -0.082, 0.15, -0.088, 0.19);   // bass cutaway rise
  s.bezierCurveTo(-0.092, 0.218, -0.1, 0.232, -0.113, 0.228);  // long bass horn tip
  s.bezierCurveTo(-0.128, 0.223, -0.133, 0.205, -0.136, 0.175);// tip outer edge
  s.bezierCurveTo(-0.141, 0.128, -0.152, 0.095, -0.155, 0.048);// bass upper bout
  s.bezierCurveTo(-0.158, 0.005, -0.14, -0.02, -0.146, -0.06); // shallow bass waist
  s.bezierCurveTo(-0.16, -0.095, -0.163, -0.13, -0.155, -0.165); // lower bout, bass
  s.bezierCurveTo(-0.14, -0.215, -0.08, -0.234, 0.0, -0.23);   // round the bottom
  return s;
}

// Classic strat pickguard (same shape space as the body, slightly inset).
function makePickguardShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(0.038, 0.118);
  s.bezierCurveTo(0.058, 0.128, 0.075, 0.15, 0.092, 0.158);
  s.bezierCurveTo(0.112, 0.15, 0.12, 0.118, 0.122, 0.085);
  s.bezierCurveTo(0.126, 0.03, 0.13, -0.01, 0.133, -0.06);
  s.bezierCurveTo(0.135, -0.11, 0.12, -0.15, 0.08, -0.162);
  s.bezierCurveTo(0.03, -0.172, -0.03, -0.15, -0.06, -0.11);
  s.bezierCurveTo(-0.082, -0.075, -0.09, -0.03, -0.092, 0.02);
  s.bezierCurveTo(-0.094, 0.07, -0.088, 0.11, -0.07, 0.14);
  s.bezierCurveTo(-0.055, 0.152, -0.045, 0.14, -0.038, 0.118);
  s.bezierCurveTo(-0.012, 0.108, 0.012, 0.108, 0.038, 0.118);
  return s;
}

// Curvy strat headstock (local: y=0 at the nut, +y up, tuners on -x side).
function makeHeadstockShape(THREE) {
  const s = new THREE.Shape();
  s.moveTo(-0.0235, 0.0);
  s.lineTo(0.0235, 0.0);
  s.bezierCurveTo(0.028, 0.018, 0.04, 0.028, 0.045, 0.052);
  s.bezierCurveTo(0.05, 0.08, 0.034, 0.096, 0.036, 0.114);
  s.bezierCurveTo(0.038, 0.134, 0.03, 0.15, 0.01, 0.153);
  s.bezierCurveTo(-0.008, 0.156, -0.018, 0.147, -0.02, 0.136);
  s.bezierCurveTo(-0.022, 0.126, -0.014, 0.12, -0.016, 0.11);
  s.bezierCurveTo(-0.019, 0.098, -0.028, 0.094, -0.029, 0.08);
  s.bezierCurveTo(-0.03, 0.05, -0.027, 0.02, -0.0235, 0.0);
  return s;
}

export function buildGuitar(THREE) {
  const g = new THREE.Group();
  const UP = new THREE.Vector3(0, 1, 0);
  const _a = new THREE.Vector3();
  const _b = new THREE.Vector3();
  const _d = new THREE.Vector3();

  // ---------------- materials ----------------
  const bodyFrontMat = new THREE.MeshPhysicalMaterial({
    map: makeSunburstTexture(THREE),
    roughness: 0.25, metalness: 0,
    clearcoat: 0.6, clearcoatRoughness: 0.25
  });
  const bodySideMat = new THREE.MeshPhysicalMaterial({
    color: 0x1d0f08, roughness: 0.25, metalness: 0,
    clearcoat: 0.6, clearcoatRoughness: 0.25
  });
  const pickguardMat = new THREE.MeshStandardMaterial({ color: 0xf6f1e4, roughness: 0.4 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf3ecdc, roughness: 0.45 });
  const mapleMat = new THREE.MeshStandardMaterial({ color: 0xe0b878, roughness: 0.5 });
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xc99f5f, roughness: 0.55 });
  const fretMat = new THREE.MeshStandardMaterial({ color: 0xc9c9ce, metalness: 0.8, roughness: 0.35 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcfd2d6, metalness: 0.85, roughness: 0.35 });
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.9, roughness: 0.3 });
  const dotMat = new THREE.MeshStandardMaterial({ color: 0x2a2118, roughness: 0.7 });
  const standMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.6 });
  const padMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.85 });

  function solid(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Rounded tube between two world points (capsule), for the stand.
  function tube(ax, ay, az, bx, by, bz, r, mat) {
    _a.set(ax, ay, az);
    _b.set(bx, by, bz);
    _d.subVectors(_b, _a);
    const len = _d.length();
    const geo = new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.002), 4, 10);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(_a).add(_b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, _d.normalize());
    return solid(m);
  }

  // Straight thin cylinder between two points (strings, whammy post).
  function rod(ax, ay, az, bx, by, bz, r, mat, radial) {
    _a.set(ax, ay, az);
    _b.set(bx, by, bz);
    _d.subVectors(_b, _a);
    const len = _d.length();
    const geo = new THREE.CylinderGeometry(r, r, len, radial || 6);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(_a).add(_b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, _d.normalize());
    return m;
  }

  // ================= GUITAR (built upright, then leaned back) =================
  // Local frame: origin at bottom tip of the body, +y up, strings toward +z.
  const gtr = new THREE.Group();

  // ---- body ----
  const bodyGeo = new THREE.ExtrudeGeometry(makeBodyShape(THREE), {
    depth: 0.045, curveSegments: 12,
    bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 3
  });
  bodyGeo.translate(0, 0, -0.0225); // center the slab: z in [-0.0305, 0.0305]
  const body = solid(new THREE.Mesh(bodyGeo, [bodyFrontMat, bodySideMat]));
  body.position.set(0, 0.23, 0);
  gtr.add(body);
  const FACE = 0.0305; // flat front of the body

  // ---- pickguard ----
  const pgGeo = new THREE.ExtrudeGeometry(makePickguardShape(THREE), {
    depth: 0.003, curveSegments: 10, bevelEnabled: false
  });
  const pickguard = solid(new THREE.Mesh(pgGeo, pickguardMat));
  pickguard.position.set(0, 0.23, FACE + 0.002);
  gtr.add(pickguard);
  const PG = FACE + 0.005; // pickguard front face

  // ---- three single-coil pickups ----
  const puGeo = new THREE.BoxGeometry(0.07, 0.017, 0.008);
  const puY = [0.315, 0.26, 0.205];
  for (let i = 0; i < 3; i++) {
    const pu = new THREE.Mesh(puGeo, whiteMat);
    pu.position.set(0, puY[i], PG + 0.004);
    if (i === 2) pu.rotation.z = 0.15; // slanted bridge pickup
    pu.castShadow = true;
    gtr.add(pu);
  }

  // ---- controls: 1 volume + 2 tone knobs ----
  const knobGeo = new THREE.CylinderGeometry(0.011, 0.0115, 0.012, 16);
  const knobPos = [[0.093, 0.185], [0.107, 0.148], [0.113, 0.112]];
  for (let i = 0; i < 3; i++) {
    const k = new THREE.Mesh(knobGeo, whiteMat);
    k.rotation.x = Math.PI / 2;
    k.position.set(knobPos[i][0], knobPos[i][1], PG + 0.006);
    k.castShadow = true;
    gtr.add(k);
  }

  // 5-way selector: tiny tilted stick with a white tip
  const sel = new THREE.Mesh(new THREE.CylinderGeometry(0.0017, 0.0017, 0.022, 6), whiteMat);
  sel.position.set(0.06, 0.228, PG + 0.008);
  sel.rotation.set(1.05, 0, 0.35);
  gtr.add(sel);

  // Output jack hint (chrome disc on the lower treble edge)
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.007, 12), chromeMat);
  jack.rotation.x = Math.PI / 2;
  jack.position.set(0.126, 0.072, FACE + 0.003);
  gtr.add(jack);

  // ---- tremolo bridge ----
  const block = solid(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.02, 0.01), chromeMat));
  block.position.set(0, 0.152, PG + 0.005);
  gtr.add(block);
  const saddleGeo = new THREE.BoxGeometry(0.008, 0.009, 0.007);
  for (let i = 0; i < 6; i++) {
    const sd = new THREE.Mesh(saddleGeo, chromeMat);
    sd.position.set(-0.026 + i * 0.0104, 0.158, PG + 0.0115);
    gtr.add(sd);
  }
  // whammy bar: thin bent tube arcing over the body
  const whammyCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.038, 0.15, 0.046),
    new THREE.Vector3(0.018, 0.118, 0.06),
    new THREE.Vector3(-0.03, 0.088, 0.054)
  );
  const whammy = new THREE.Mesh(new THREE.TubeGeometry(whammyCurve, 12, 0.0018, 6, false), chromeMat);
  gtr.add(whammy);

  // ---- neck (tapered maple slab, y 0.33 -> 0.955) ----
  const NECK_Y0 = 0.33, NECK_Y1 = 0.955, NECK_LEN = NECK_Y1 - NECK_Y0;
  const neckShape = new THREE.Shape();
  neckShape.moveTo(-0.029, 0);
  neckShape.lineTo(0.029, 0);
  neckShape.lineTo(0.024, NECK_LEN);
  neckShape.lineTo(-0.024, NECK_LEN);
  neckShape.lineTo(-0.029, 0);
  const neckGeo = new THREE.ExtrudeGeometry(neckShape, { depth: 0.02, bevelEnabled: false });
  const neck = solid(new THREE.Mesh(neckGeo, mapleMat));
  neck.position.set(0, NECK_Y0, 0.012); // z in [0.012, 0.032]
  gtr.add(neck);

  // fretboard: slightly darker maple face, 0.004 thick
  const boardShape = new THREE.Shape();
  boardShape.moveTo(-0.0285, 0);
  boardShape.lineTo(0.0285, 0);
  boardShape.lineTo(0.0235, NECK_LEN);
  boardShape.lineTo(-0.0235, NECK_LEN);
  boardShape.lineTo(-0.0285, 0);
  const boardGeo = new THREE.ExtrudeGeometry(boardShape, { depth: 0.004, bevelEnabled: false });
  const board = solid(new THREE.Mesh(boardGeo, boardMat));
  board.position.set(0, NECK_Y0, 0.032); // z in [0.032, 0.036]
  gtr.add(board);
  const BOARD_FACE = 0.036;

  // frets: 21 nickel bars, gaps shrinking by x0.944 toward the body
  const NUT_Y = 0.947;
  const fretY = [];
  {
    let y = NUT_Y, gap = 0.035;
    for (let i = 0; i < 21; i++) {
      y -= gap;
      fretY.push(y);
      gap *= 0.944;
    }
  }
  const neckWidthAt = (y) => 0.057 - 0.01 * (y - NECK_Y0) / NECK_LEN;
  for (let i = 0; i < 21; i++) {
    const f = new THREE.Mesh(
      new THREE.BoxGeometry(neckWidthAt(fretY[i]), 0.0015, 0.0012),
      fretMat
    );
    f.position.set(0, fretY[i], BOARD_FACE + 0.0006);
    gtr.add(f);
  }

  // dot inlays at frets 3,5,7,9,15,17 + double at 12
  const dotGeo = new THREE.CircleGeometry(0.0026, 10);
  const dotAt = (n, x) => {
    const d = new THREE.Mesh(dotGeo, dotMat);
    d.position.set(x, (fretY[n - 2] + fretY[n - 1]) / 2, BOARD_FACE + 0.0003);
    gtr.add(d);
  };
  [3, 5, 7, 9, 15, 17].forEach((n) => dotAt(n, 0));
  dotAt(12, -0.009);
  dotAt(12, 0.009);

  // nut: tiny white box at the top of the fretboard
  const nut = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.005, 0.006), whiteMat);
  nut.position.set(0, NUT_Y, 0.037);
  gtr.add(nut);

  // ---- headstock ----
  const headGeo = new THREE.ExtrudeGeometry(makeHeadstockShape(THREE), {
    depth: 0.012, curveSegments: 10, bevelEnabled: false
  });
  const head = solid(new THREE.Mesh(headGeo, mapleMat));
  head.position.set(0, 0.945, 0.018); // face slightly below fretboard, strat style
  gtr.add(head);

  // 6 tuner posts (front) + 6 tuner buttons (back side)
  const postGeo = new THREE.CylinderGeometry(0.0025, 0.0025, 0.009, 8);
  const buttonGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.009, 10);
  for (let i = 0; i < 6; i++) {
    const yl = 0.945 + 0.026 + i * 0.0195;
    const post = new THREE.Mesh(postGeo, chromeMat);
    post.rotation.x = Math.PI / 2;
    post.position.set(-0.012, yl, 0.0335);
    gtr.add(post);
    const btn = new THREE.Mesh(buttonGeo, whiteMat);
    btn.rotation.z = Math.PI / 2;
    btn.position.set(-0.032, yl, 0.012);
    gtr.add(btn);
  }

  // ---- strings: 6 thin cylinders, saddles -> nut, fanning wider at bridge ----
  const stringR = [0.0012, 0.0011, 0.001, 0.0009, 0.0008, 0.0007];
  for (let i = 0; i < 6; i++) {
    const s = rod(
      -0.026 + i * 0.0104, 0.156, PG + 0.0165,
      -0.0165 + i * 0.0066, NUT_Y, 0.0395,
      stringR[i], stringMat, 6
    );
    gtr.add(s);
  }

  // lean the whole guitar back ~12 deg onto the stand
  gtr.position.set(0, 0.068, 0.055);
  gtr.rotation.x = -0.21;
  g.add(gtr);

  // ================= STAND (black tubular tripod A-frame) =================
  const stand = new THREE.Group();
  // main post, tilted back
  stand.add(tube(0, 0.055, -0.176, 0, 0.745, -0.088, 0.012, standMat));
  // tripod legs from a hub low on the post
  stand.add(tube(0, 0.14, -0.165, -0.165, 0.008, 0.125, 0.012, standMat));
  stand.add(tube(0, 0.14, -0.165, 0.165, 0.008, 0.125, 0.012, standMat));
  stand.add(tube(0, 0.14, -0.165, 0, 0.003, -0.275, 0.012, standMat));
  // cradle arms reaching forward under the lower body
  stand.add(tube(-0.006, 0.09, -0.168, -0.075, 0.052, 0.052, 0.009, standMat));
  stand.add(tube(0.006, 0.09, -0.168, 0.075, 0.052, 0.052, 0.009, standMat));
  // padded cradle sleeves the body rests on
  for (const sx of [-1, 1]) {
    const pad = solid(new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.05, 4, 10), padMat));
    pad.position.set(sx * 0.075, 0.06, 0.038);
    pad.rotation.x = Math.PI / 2 - 0.18; // lies along z, nose tipped up
    stand.add(pad);
  }
  // neck-rest yoke near the top of the post
  stand.add(tube(-0.008, 0.745, -0.088, -0.03, 0.788, -0.062, 0.0065, padMat));
  stand.add(tube(0.008, 0.745, -0.088, 0.03, 0.788, -0.062, 0.0065, padMat));
  g.add(stand);

  return g;
}
