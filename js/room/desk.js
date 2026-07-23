// desk.js — cozy computer desk setup module for the 3D room.
// Exports buildDesk(THREE). No imports; THREE namespace is injected.
// Units: meters. Origin: base center on floor (y=0). Front faces +Z.

// ---------- small helpers ----------

function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// filled rounded rect on a 2d canvas context
function rrect(ctx, x, y, w, h, r) {
  if (r > w / 2) r = w / 2;
  if (r > h / 2) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

// cylinder mesh stretched between two points
function barBetween(THREE, a, b, radius, material, radialSegs) {
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(radius, radius, len, radialSegs || 10);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a).normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  return mesh;
}

function shadowed(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------- procedural screen (dark code editor) ----------

const SCREEN_BG = '#14100e';
const CODE_COLORS = ['#ff9e64', '#9ece6a', '#7aa2f7', '#bb9af7', '#e0af68'];

function drawCodeLine(ctx, rand, i) {
  const y = 26 + i * 18;
  // erase the line strip (editor area only)
  ctx.fillStyle = SCREEN_BG;
  ctx.fillRect(68, y - 3, 768 - 68, 17);
  // dim line-number tick
  ctx.fillStyle = '#3a2f24';
  rrect(ctx, 76, y + 1, 8, 7, 3.5);
  // code bars
  const indents = [0, 0, 1, 1, 2, 2, 1, 3];
  let x = 100 + indents[(rand() * indents.length) | 0] * 26;
  const n = 1 + ((rand() * 3) | 0);
  for (let k = 0; k < n; k++) {
    const w = 28 + rand() * 84;
    ctx.fillStyle = CODE_COLORS[(rand() * CODE_COLORS.length) | 0];
    ctx.globalAlpha = 0.72 + rand() * 0.25;
    rrect(ctx, x, y, w, 9, 4.5);
    x += w + 12;
    if (x > 690) break;
  }
  ctx.globalAlpha = 1;
  return x; // end x, used to seat the cursor
}

function paintEditor(ctx, rand) {
  // background
  ctx.fillStyle = SCREEN_BG;
  ctx.fillRect(0, 0, 768, 432);
  // sidebar
  ctx.fillStyle = '#1d1712';
  ctx.fillRect(0, 0, 68, 432);
  for (let i = 0; i < 9; i++) {
    const y = 20 + i * 26;
    if (i === 2) {
      ctx.fillStyle = '#ff9e64';
      ctx.globalAlpha = 0.7;
    } else {
      ctx.fillStyle = '#55432e';
      ctx.globalAlpha = 0.55;
    }
    rrect(ctx, 10, y, 30 + ((i * 37) % 22), 7, 3.5);
  }
  ctx.globalAlpha = 1;
  // tab strip
  ctx.fillStyle = '#1a1410';
  ctx.fillRect(68, 0, 700, 18);
  ctx.fillStyle = '#e0af68';
  ctx.globalAlpha = 0.6;
  rrect(ctx, 84, 5, 54, 8, 4);
  ctx.fillStyle = '#55432e';
  rrect(ctx, 150, 5, 44, 8, 4);
  ctx.globalAlpha = 1;
  // code lines
  let cursorX = 400;
  const cursorLine = 12;
  for (let i = 0; i < 20; i++) {
    const endX = drawCodeLine(ctx, rand, i);
    if (i === cursorLine) cursorX = Math.min(endX, 700);
  }
  // status bar
  ctx.fillStyle = '#2b2018';
  ctx.fillRect(0, 406, 768, 26);
  ctx.fillStyle = '#ff9e64';
  ctx.fillRect(0, 406, 62, 26);
  ctx.fillStyle = '#9ece6a';
  rrect(ctx, 78, 414, 34, 10, 5);
  ctx.fillStyle = '#7aa2f7';
  rrect(ctx, 122, 414, 26, 10, 5);
  ctx.fillStyle = '#bb9af7';
  rrect(ctx, 690, 414, 60, 10, 5);
  return { cursorX: cursorX, cursorY: 26 + cursorLine * 18 - 2, cursorLine: cursorLine };
}

// ---------- factory ----------

export function buildDesk(THREE) {
  const g = new THREE.Group();
  const rand = makeRng(20260723);

  // shared materials
  const walnutMat = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.55, metalness: 0 });
  const walnutDarkMat = new THREE.MeshStandardMaterial({ color: 0x64432a, roughness: 0.6, metalness: 0 });
  const darkPlasticMat = new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.4, metalness: 0 });
  const kbBaseMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.6, metalness: 0 });
  const keycapMat = new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.7, metalness: 0 });
  const keycapAccentMat = new THREE.MeshStandardMaterial({ color: 0xc9784a, roughness: 0.7, metalness: 0 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x35363c, roughness: 0.35, metalness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb08d57, roughness: 0.3, metalness: 0.85 });
  const matPadMat = new THREE.MeshStandardMaterial({ color: 0xb3714a, roughness: 0.9, metalness: 0 });
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0xc98a5e, roughness: 1.0, metalness: 0 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xf2e7d5, roughness: 0.85, metalness: 0 });
  const terracottaMat = new THREE.MeshStandardMaterial({ color: 0xb85c3e, roughness: 0.85, metalness: 0 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x7fa15c, roughness: 0.9, metalness: 0 });
  const notebookMat = new THREE.MeshStandardMaterial({ color: 0xb34a3a, roughness: 0.8, metalness: 0 });

  const deskZ = -0.2;      // desk top center z
  const deskTopY = 0.74;   // desk work surface height

  // ----- 1. DESK -----
  const top = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.68), walnutMat));
  top.position.set(0, deskTopY - 0.02, deskZ);
  g.add(top);

  const legGeo = new THREE.BoxGeometry(0.04, 0.72, 0.58);
  const legL = shadowed(new THREE.Mesh(legGeo, walnutDarkMat));
  legL.position.set(-0.7, 0.36, deskZ);
  const legR = shadowed(new THREE.Mesh(legGeo, walnutDarkMat));
  legR.position.set(0.7, 0.36, deskZ);
  g.add(legL, legR);

  // foot rails so the panels feel grounded
  const footGeo = new THREE.BoxGeometry(0.06, 0.02, 0.62);
  const footL = shadowed(new THREE.Mesh(footGeo, walnutDarkMat));
  footL.position.set(-0.7, 0.01, deskZ);
  const footR = shadowed(new THREE.Mesh(footGeo, walnutDarkMat));
  footR.position.set(0.7, 0.01, deskZ);
  g.add(footL, footR);

  // slim cable tray hint under the back edge
  const tray = shadowed(new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 0.08), darkMetalMat));
  tray.position.set(0, deskTopY - 0.09, deskZ - 0.27);
  g.add(tray);

  // ----- 2. MONITOR -----
  const monZ = deskZ - 0.14; // -0.34
  const standBase = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.13, 0.02, 22), darkPlasticMat));
  standBase.position.set(0, deskTopY + 0.01, monZ - 0.02);
  standBase.scale.set(1, 1, 0.62); // oval footprint
  g.add(standBase);

  const post = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.024, 0.34, 14), darkPlasticMat));
  post.position.set(0, deskTopY + 0.19, monZ - 0.03);
  g.add(post);

  const bezel = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.38, 0.02), darkPlasticMat));
  bezel.position.set(0, 1.12, monZ);
  g.add(bezel);

  // procedural editor canvas
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 432;
  const ctx = canvas.getContext('2d');
  const cursor = paintEditor(ctx, rand);
  const screenTex = new THREE.CanvasTexture(canvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.9,
    metalness: 0,
    emissive: 0xffffff,
    emissiveMap: screenTex,
    emissiveIntensity: 1.4
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.596, 0.335), screenMat);
  screen.position.set(0, 1.12, monZ + 0.011);
  g.add(screen);

  // faint warm spill light floating in front of the screen
  const screenLight = new THREE.PointLight(0xffd9b0, 3, 2.5, 2);
  screenLight.position.set(0, 1.12, monZ + 0.011 + 0.25);
  screenLight.castShadow = false;
  g.add(screenLight);

  // ----- 3. KEYBOARD + MOUSE + MAT -----
  const kbZ = deskZ + 0.16; // -0.04
  const kbBase = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.012, 0.11), kbBaseMat));
  kbBase.position.set(0, deskTopY + 0.006, kbZ);
  g.add(kbBase);

  const keyGeo = new THREE.BoxGeometry(0.016, 0.01, 0.016);
  const keyY = deskTopY + 0.012 + 0.005;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 14; col++) {
      const accent = rand() < 0.06 || (row === 0 && col === 0) || (row === 4 && col === 13);
      const key = new THREE.Mesh(keyGeo, accent ? keycapAccentMat : keycapMat);
      key.position.set(-0.13 + col * 0.02, keyY, kbZ - 0.04 + row * 0.02);
      key.castShadow = false;
      key.receiveShadow = false;
      g.add(key);
    }
  }

  // desk mat (rounded thin slab) + mouse, to the right
  const matShape = new THREE.Shape();
  const mw = 0.24, mh = 0.18, mr = 0.03;
  matShape.moveTo(-mw / 2 + mr, -mh / 2);
  matShape.lineTo(mw / 2 - mr, -mh / 2);
  matShape.quadraticCurveTo(mw / 2, -mh / 2, mw / 2, -mh / 2 + mr);
  matShape.lineTo(mw / 2, mh / 2 - mr);
  matShape.quadraticCurveTo(mw / 2, mh / 2, mw / 2 - mr, mh / 2);
  matShape.lineTo(-mw / 2 + mr, mh / 2);
  matShape.quadraticCurveTo(-mw / 2, mh / 2, -mw / 2, mh / 2 - mr);
  matShape.lineTo(-mw / 2, -mh / 2 + mr);
  matShape.quadraticCurveTo(-mw / 2, -mh / 2, -mw / 2 + mr, -mh / 2);
  const matGeo = new THREE.ExtrudeGeometry(matShape, { depth: 0.004, bevelEnabled: false, curveSegments: 8 });
  const deskPad = new THREE.Mesh(matGeo, matPadMat);
  deskPad.rotation.x = -Math.PI / 2;
  deskPad.position.set(0.33, deskTopY + 0.0005, kbZ + 0.09);
  deskPad.receiveShadow = true;
  g.add(deskPad);

  const mouse = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.019, 0.022, 4, 12), kbBaseMat));
  mouse.rotation.x = Math.PI / 2; // lie along z
  mouse.scale.set(1, 1, 0.55);    // squash height (local z is now world y)
  mouse.position.set(0.33, deskTopY + 0.015, kbZ + 0.04);
  g.add(mouse);

  // ----- 4. DESK LAMP (left corner) -----
  const lampX = -0.58, lampZ = deskZ - 0.12;
  const lampBase = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.022, 18), darkMetalMat));
  lampBase.position.set(lampX, deskTopY + 0.011, lampZ);
  g.add(lampBase);

  const p0 = new THREE.Vector3(lampX, deskTopY + 0.02, lampZ);
  const p1 = new THREE.Vector3(lampX + 0.07, deskTopY + 0.31, lampZ + 0.02);
  const p2 = new THREE.Vector3(lampX + 0.19, deskTopY + 0.27, lampZ + 0.07);
  const arm1 = shadowed(barBetween(THREE, p0, p1, 0.008, brassMat, 10));
  const arm2 = shadowed(barBetween(THREE, p1, p2, 0.007, brassMat, 10));
  g.add(arm1, arm2);
  const joint = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 8), brassMat));
  joint.position.copy(p1);
  g.add(joint);

  // dome shade (open bottom), aimed at the desk center
  const shadePts = [];
  shadePts.push(new THREE.Vector2(0.012, 0.1));
  shadePts.push(new THREE.Vector2(0.045, 0.088));
  shadePts.push(new THREE.Vector2(0.066, 0.058));
  shadePts.push(new THREE.Vector2(0.075, 0.022));
  shadePts.push(new THREE.Vector2(0.076, 0.0));
  const shadeGeo = new THREE.LatheGeometry(shadePts, 20);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0x8a6a3e, roughness: 0.35, metalness: 0.8, side: THREE.DoubleSide
  });
  const shade = shadowed(new THREE.Mesh(shadeGeo, shadeMat));
  shade.position.copy(p2);
  const aim = new THREE.Vector3(0.1, deskTopY, deskZ + 0.05).sub(p2).normalize();
  shade.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), aim);
  g.add(shade);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffd9a0, roughness: 0.6, metalness: 0,
    emissive: 0xffd9a0, emissiveIntensity: 3
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), bulbMat);
  bulb.position.copy(p2).addScaledVector(aim, 0.045);
  g.add(bulb);

  const lampLight = new THREE.PointLight(0xffc98a, 10, 5, 2);
  lampLight.position.copy(p2).addScaledVector(aim, 0.1);
  lampLight.castShadow = false;
  g.add(lampLight);

  // ----- 5. CLUTTER -----
  // mug with steam
  const mugX = 0.56, mugZ = deskZ + 0.12;
  const mug = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.03, 0.095, 18), creamMat));
  mug.position.set(mugX, deskTopY + 0.0475, mugZ);
  g.add(mug);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.0348, 0.0348, 0.02, 18), terracottaMat);
  stripe.position.set(mugX, deskTopY + 0.07, mugZ);
  g.add(stripe);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.0055, 8, 14), creamMat);
  handle.position.set(mugX + 0.038, deskTopY + 0.05, mugZ);
  g.add(handle);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), new THREE.MeshStandardMaterial({ color: 0x4a2e1e, roughness: 0.6, metalness: 0 }));
  coffee.rotation.x = -Math.PI / 2;
  coffee.position.set(mugX, deskTopY + 0.0955, mugZ);
  g.add(coffee);

  const steamGroup = new THREE.Group();
  steamGroup.position.set(mugX, deskTopY + 0.098, mugZ);
  const steamMat = new THREE.MeshStandardMaterial({
    color: 0xfff3e0, roughness: 1, metalness: 0,
    emissive: 0xfff3e0, emissiveIntensity: 0.6,
    transparent: true, opacity: 0.25, depthWrite: false
  });
  for (let w = 0; w < 3; w++) {
    const a = (w / 3) * Math.PI * 2;
    const ox = Math.cos(a) * 0.012, oz = Math.sin(a) * 0.012;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ox, 0, oz),
      new THREE.Vector3(ox + 0.008, 0.03, oz - 0.004),
      new THREE.Vector3(ox - 0.007, 0.062, oz + 0.005),
      new THREE.Vector3(ox + 0.005, 0.095 + w * 0.012, oz - 0.003)
    ]);
    const wisp = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.0032, 5, false), steamMat);
    steamGroup.add(wisp);
  }
  g.add(steamGroup);

  // stack of 3 books (front-left)
  const bookData = [
    [0.17, 0.03, 0.23, 0x9c4a35, 0],
    [0.155, 0.026, 0.21, 0xd0954c, 0.18],
    [0.13, 0.022, 0.185, 0x6f7a4a, -0.12]
  ];
  let bookY = 0;
  for (let i = 0; i < bookData.length; i++) {
    const b = bookData[i];
    const book = shadowed(new THREE.Mesh(
      new THREE.BoxGeometry(b[0], b[1], b[2]),
      new THREE.MeshStandardMaterial({ color: b[3], roughness: 0.85, metalness: 0 })
    ));
    book.position.set(-0.52, deskTopY + bookY + b[1] / 2, deskZ + 0.16);
    book.rotation.y = b[4];
    g.add(book);
    bookY += b[1];
  }

  // tiny succulent (back right)
  const pot = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.024, 0.045, 14), terracottaMat));
  pot.position.set(0.62, deskTopY + 0.0225, deskZ - 0.16);
  g.add(pot);
  const potRim = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 6, 14), terracottaMat);
  potRim.rotation.x = Math.PI / 2;
  potRim.position.set(0.62, deskTopY + 0.045, deskZ - 0.16);
  g.add(potRim);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r = i === 0 ? 0 : 0.014;
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.011 + (i === 0 ? 0.005 : 0), 10, 7), greenMat);
    blob.scale.set(1, 1.5, 1);
    blob.position.set(0.62 + Math.cos(a) * r, deskTopY + 0.058 + (i === 0 ? 0.01 : 0), deskZ - 0.16 + Math.sin(a) * r);
    g.add(blob);
  }

  // closed notebook + pen
  const notebook = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.012, 0.2), notebookMat));
  notebook.position.set(-0.31, deskTopY + 0.006, deskZ + 0.17);
  notebook.rotation.y = 0.16;
  g.add(notebook);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.135, 8), kbBaseMat);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.5;
  pen.position.set(-0.31, deskTopY + 0.012 + 0.0042, deskZ + 0.17);
  g.add(pen);
  const penClip = new THREE.Mesh(new THREE.CylinderGeometry(0.0046, 0.0046, 0.018, 8), brassMat);
  penClip.rotation.z = Math.PI / 2;
  penClip.rotation.y = 0.5;
  penClip.position.set(-0.31 - Math.cos(0.5) * 0.05, deskTopY + 0.012 + 0.0042, deskZ + 0.17 + Math.sin(0.5) * 0.05);
  g.add(penClip);

  // ----- 6. CHAIR (front, facing the desk / -Z) -----
  const chairZ = 0.34;
  const seat = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.07, 20), fabricMat));
  seat.position.set(0, 0.455, chairZ);
  g.add(seat);

  const backrest = shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.24, 4, 12), fabricMat));
  backrest.rotation.z = Math.PI / 2; // lie along x
  backrest.scale.set(1, 1, 0.5);     // flatten front-back
  backrest.position.set(0, 0.65, chairZ + 0.165);
  g.add(backrest);

  const backSupport = shadowed(barBetween(
    THREE,
    new THREE.Vector3(0, 0.45, chairZ + 0.17),
    new THREE.Vector3(0, 0.62, chairZ + 0.17),
    0.012, darkMetalMat, 10
  ));
  g.add(backSupport);

  const chairPost = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.37, 12), darkMetalMat));
  chairPost.position.set(0, 0.255, chairZ);
  g.add(chairPost);
  const gasCyl = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.14, 12), darkMetalMat));
  gasCyl.position.set(0, 0.14, chairZ);
  g.add(gasCyl);

  const hub = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.05, 12), darkMetalMat));
  hub.position.set(0, 0.055, chairZ);
  g.add(hub);
  const armGeo = new THREE.BoxGeometry(0.04, 0.024, 0.17);
  const casterGeo = new THREE.SphereGeometry(0.026, 10, 7);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + Math.PI / 5;
    const arm = shadowed(new THREE.Mesh(armGeo, darkMetalMat));
    arm.position.set(Math.sin(a) * 0.105, 0.042, chairZ + Math.cos(a) * 0.105);
    arm.rotation.y = a;
    g.add(arm);
    const caster = new THREE.Mesh(casterGeo, kbBaseMat);
    caster.position.set(Math.sin(a) * 0.185, 0.026, chairZ + Math.cos(a) * 0.185);
    caster.castShadow = false;
    caster.receiveShadow = false;
    g.add(caster);
  }

  // ----- animation: cursor blink + occasional line shuffle + steam sway -----
  let acc = 0;
  let blinkOn = true;
  let blinkCount = 0;
  const cursorColor = '#ffd9b0';

  g.userData.update = function (t, dt) {
    steamGroup.rotation.z = Math.sin(t * 0.8) * 0.06;
    steamGroup.rotation.x = Math.cos(t * 0.63) * 0.04;
    acc += dt;
    if (acc < 0.6) return;
    acc = 0;
    blinkOn = !blinkOn;
    blinkCount++;
    // erase + optionally redraw the cursor cell only
    ctx.fillStyle = SCREEN_BG;
    ctx.fillRect(cursor.cursorX - 1, cursor.cursorY - 1, 6, 16);
    if (blinkOn) {
      ctx.fillStyle = cursorColor;
      ctx.fillRect(cursor.cursorX, cursor.cursorY, 3, 13);
    }
    // every ~3.6s, rewrite one random code line (never the cursor's line)
    if (blinkCount % 6 === 0) {
      let line = (rand() * 20) | 0;
      if (line === cursor.cursorLine) line = (line + 1) % 20;
      drawCodeLine(ctx, rand, line);
    }
    screenTex.needsUpdate = true;
  };

  return g;
}
