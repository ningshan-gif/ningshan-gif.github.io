// Teddy — a cute brown toy poodle (teddy-bear cut), sitting, facing +Z.
// Everything is round pompoms of dense curls: fluffy crown, pompom ears, plush body, pompom tail.
export function buildDog(THREE) {
  const g = new THREE.Group();

  // deterministic pseudo-random for curl scatter
  const h01 = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const furMats = [0xa5713f, 0x96652f, 0xb58050, 0x9c6b36, 0xae7846].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })
  );
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xc49a66, roughness: 0.9 });
  const earMat = new THREE.MeshStandardMaterial({ color: 0x8f5f33, roughness: 0.95 });
  const glossyDark = new THREE.MeshStandardMaterial({ color: 0x1d1410, roughness: 0.15 });
  const glintMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xb34a3a, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.8 });

  const sphere = (r, ws, hs) => new THREE.SphereGeometry(r, ws || 16, hs || 12);
  const mesh = (geo, mat, shadow) => {
    const m = new THREE.Mesh(geo, mat);
    // small curl/detail spheres neither cast nor receive shadows — avoids
    // shadow-map acne speckles across the pompom surfaces
    m.castShadow = shadow !== false;
    m.receiveShadow = shadow !== false;
    return m;
  };

  // scatter `count` low-segment curls on the surface of a base sphere.
  // Curls sit mostly buried (only ~40% of each pokes out) so the coat reads
  // as tight poodle curl texture, not lumps.
  function addCurls(parent, cx, cy, cz, baseR, count, seed, mats, rMin, rMax, yBias) {
    for (let i = 0; i < count; i++) {
      const u = h01(seed + i * 3);
      const v = h01(seed + i * 3 + 1);
      const theta = u * Math.PI * 2;
      // yBias > 0 favors upper hemisphere, < 0 lower, 0 uniform
      let phi = Math.acos(2 * v - 1);
      if (yBias > 0) phi = phi * 0.55;
      if (yBias < 0) phi = Math.PI - phi * 0.55;
      const cr = rMin + h01(seed + i * 3 + 2) * (rMax - rMin);
      const rr = baseR - cr * 0.6;
      const c = mesh(sphere(cr, 10, 8), mats[i % mats.length], false);
      c.position.set(
        cx + rr * Math.sin(phi) * Math.cos(theta),
        cy + rr * Math.cos(phi),
        cz + rr * Math.sin(phi) * Math.sin(theta)
      );
      parent.add(c);
    }
  }

  // ---------------- body ----------------
  const bodyGroup = new THREE.Group();
  g.add(bodyGroup);

  const BODY_SY = 1.12;
  const body = mesh(sphere(0.135, 24, 16), furMats[0]);
  body.scale.set(1, BODY_SY, 0.95);
  body.position.set(0, 0.145, 0);
  bodyGroup.add(body);
  addCurls(bodyGroup, 0, 0.155, 0, 0.132, 26, 11, furMats, 0.016, 0.026, 0.35);

  // hind thighs + paws (sitting) — paws peek out wide of the front legs
  for (const s of [-1, 1]) {
    const thigh = mesh(sphere(0.075, 16, 12), furMats[1]);
    thigh.scale.set(0.9, 1, 0.9);
    thigh.position.set(s * 0.098, 0.085, 0.02);
    bodyGroup.add(thigh);
    const paw = mesh(new THREE.CapsuleGeometry(0.024, 0.05, 6, 10), creamMat);
    paw.rotation.x = Math.PI / 2;
    paw.rotation.z = s * 0.25;
    paw.position.set(s * 0.093, 0.026, 0.14);
    bodyGroup.add(paw);
  }

  // front legs + paws — tucked against the chest so they read attached
  for (const s of [-1, 1]) {
    const leg = mesh(new THREE.CapsuleGeometry(0.034, 0.1, 6, 12), furMats[2]);
    leg.position.set(s * 0.06, 0.105, 0.072);
    leg.rotation.x = -0.08;
    bodyGroup.add(leg);
    const paw = mesh(sphere(0.034, 12, 10), creamMat);
    paw.scale.set(1, 0.7, 1.2);
    paw.position.set(s * 0.06, 0.026, 0.09);
    bodyGroup.add(paw);
    // fluffy cuffs at leg tops
    for (let i = 0; i < 3; i++) {
      const c = mesh(sphere(0.02 + h01(60 + i) * 0.008, 10, 8), furMats[(i + 1) % 5], false);
      c.position.set(
        s * (0.055 + (h01(70 + i) - 0.5) * 0.04),
        0.16 + (h01(80 + i) - 0.5) * 0.03,
        0.09 + (h01(90 + i) - 0.5) * 0.04
      );
      bodyGroup.add(c);
    }
  }

  // ---------------- head ----------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.34, 0.02);
  const BASE_TILT = 0.06;
  headGroup.rotation.x = BASE_TILT;
  g.add(headGroup);

  // smooth round head — no bumps
  const head = mesh(sphere(0.125, 24, 16), furMats[0]);
  headGroup.add(head);

  // muzzle — round, fluffy, low on the face
  const muzzle = mesh(sphere(0.05, 16, 12), creamMat);
  muzzle.scale.set(1, 0.8, 0.9);
  muzzle.position.set(0, -0.038, 0.105);
  headGroup.add(muzzle);

  // big glossy nose
  const nose = mesh(sphere(0.02, 12, 10), glossyDark, false);
  nose.scale.set(1.15, 0.85, 0.8);
  nose.position.set(0, -0.012, 0.152);
  headGroup.add(nose);

  // little pink tongue peeking out (like the reference photo)
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xd9848a, roughness: 0.55 });
  const tongue = mesh(sphere(0.02, 12, 10), tongueMat, false);
  tongue.scale.set(0.6, 0.32, 0.9);
  tongue.position.set(0, -0.058, 0.128);
  tongue.rotation.x = 0.35;
  headGroup.add(tongue);

  // tiny smile — two thin torus arcs under the nose
  for (const s of [-1, 1]) {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0022, 6, 10, Math.PI * 0.8), glossyDark);
    arc.position.set(s * 0.012, -0.032, 0.143);
    arc.rotation.set(0.25, s * 0.35, s * -2.05);
    headGroup.add(arc);
  }

  // button eyes, wide and low, each with a glint
  for (const s of [-1, 1]) {
    const eye = mesh(sphere(0.016, 12, 10), glossyDark, false);
    eye.position.set(s * 0.052, 0.012, 0.107);
    headGroup.add(eye);
    const glint = mesh(sphere(0.004, 8, 6), glintMat, false);
    glint.position.set(s * 0.052 - 0.004, 0.018, 0.121);
    headGroup.add(glint);
  }

  // drooping pompom ears
  for (const s of [-1, 1]) {
    const earGroup = new THREE.Group();
    earGroup.position.set(s * 0.105, 0.035, 0.005);
    earGroup.rotation.z = s * -0.25;
    const ear = mesh(sphere(0.065, 16, 12), earMat);
    ear.scale.set(0.6, 1.15, 0.4);
    ear.position.set(s * 0.022, -0.05, 0);
    earGroup.add(ear);
    headGroup.add(earGroup);
  }

  // ---------------- tail pompom ----------------
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 0.155, -0.115);
  tailGroup.rotation.x = -0.5; // perky
  g.add(tailGroup);
  const tail = mesh(sphere(0.05, 14, 10), furMats[1]);
  tail.position.set(0, 0.045, -0.02);
  tailGroup.add(tail);
  addCurls(tailGroup, 0, 0.045, -0.02, 0.048, 10, 601, furMats, 0.01, 0.016, 0);

  // ---------------- collar + brass tag ----------------
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.078, 0.009, 8, 20), collarMat);
  collar.position.set(0, 0.252, 0.012);
  collar.rotation.x = Math.PI / 2 - 0.18;
  g.add(collar);
  const tag = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.004, 12), brassMat);
  tag.position.set(0, 0.215, 0.093);
  tag.rotation.x = Math.PI / 2 - 0.1;
  g.add(tag);

  // ---------------- animation: head sway, happy tail wag, breathing ----------------
  g.userData.update = (t) => {
    headGroup.rotation.z = Math.sin(t * 0.9) * 0.045;
    headGroup.rotation.x = BASE_TILT + Math.sin(t * 0.62) * 0.03;
    tailGroup.rotation.y = Math.sin(t * 5.2) * 0.4;
    // breathe with the whole plush so the curls stay attached to the body
    bodyGroup.scale.y = 1 + 0.008 * Math.sin(t * 1.8);
  };

  return g;
}
