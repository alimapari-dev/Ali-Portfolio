import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/* ───────────────────────── helpers ───────────────────────── */

const rbox = (w, h, d, r, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, r);

/** Rounded rectangle outline centred on the origin. */
function rrShape(w, h, r, path) {
  const x = -w / 2;
  const y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}

/** Map UVs onto the geometry's xy bounds so a texture wraps the whole shape. */
function remapUV(geo) {
  geo.computeBoundingBox();
  const { min, max } = geo.boundingBox;
  const w = max.x - min.x;
  const h = max.y - min.y;
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) - min.x) / w, (pos.getY(i) - min.y) / h);
  }
  uv.needsUpdate = true;
  return geo;
}

function frameGeometry(ow, oh, or, iw, ih, ir, depth, bevel) {
  const shape = rrShape(ow, oh, or, new THREE.Shape());
  shape.holes.push(rrShape(iw, ih, ir, new THREE.Path()));
  return remapUV(
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 14,
    }),
  );
}

function plateGeometry(w, h, r, depth, bevel) {
  return remapUV(
    new THREE.ExtrudeGeometry(rrShape(w, h, r, new THREE.Shape()), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 14,
    }),
  );
}

/** Small deterministic PRNG so the circuit bars are identical on every load. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ───────────────────────── gradient ring texture ───────────────────────── */

function makeRingTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const x = c.getContext("2d");
  const g = x.createConicGradient
    ? x.createConicGradient(0, 256, 256)
    : x.createLinearGradient(0, 0, 512, 512);
  [
    [0, "#5a3dff"],
    [1 / 6, "#1f5cff"],
    [2 / 6, "#2f8bff"],
    [3 / 6, "#7ad7ff"],
    [4 / 6, "#2f8bff"],
    [5 / 6, "#1f5cff"],
    [1, "#5a3dff"],
  ].forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ───────────────────────── face screen ───────────────────────── */

function drawFace(ctx, mode, blink) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.shadowColor = "#5aa2ff";
  ctx.shadowBlur = 18;
  if (mode === "eyes") {
    const sy = 1 - 0.9 * blink;
    [
      [196, 262],
      [316, 252],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, 30, 38 * sy, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (mode === "quote") {
    ctx.font = '900 560px "Arial Black", Arial, Helvetica, sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("“", 256, 400);
  } else if (mode === "smile") {
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    [
      [196, 290],
      [316, 280],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 38, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
    });
  }
}

/** Canvas-backed face. `setMode` cross-fades; `update` handles blinking. */
export function createFace() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let from = "eyes";
  let to = "eyes";
  let mix = 1;
  let blink = 0;
  let blinkT = -1;
  let nextBlink = 2.5;
  let dirty = true;

  const render = () => {
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 512, 512);
    if (mix < 1) {
      ctx.globalAlpha = 1 - mix;
      drawFace(ctx, from, blink);
    }
    ctx.globalAlpha = mix;
    drawFace(ctx, to, blink);
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };

  return {
    texture,
    setMode(m) {
      if (m === to) return;
      from = to;
      to = m;
      mix = 0;
      dirty = true;
    },
    update(t, dt, allowBlink = true) {
      let b = 0;
      if (allowBlink) {
        if (blinkT < 0 && t >= nextBlink) blinkT = 0;
        if (blinkT >= 0) {
          blinkT += dt;
          const k = blinkT / 0.18;
          if (k >= 1) {
            blinkT = -1;
            nextBlink = t + 2.5 + Math.random() * 3;
          } else {
            b = Math.sin(Math.PI * k);
          }
        }
      }
      if (b !== blink) {
        blink = b;
        dirty = true;
      }
      if (mix < 1) {
        mix = Math.min(1, mix + 0.05);
        dirty = true;
      }
      if (dirty) {
        render();
        dirty = false;
      }
    },
  };
}

/* ───────────────────────── the robot ───────────────────────── */

export function createRobot(face) {
  const env = 0.9;
  const clear = { clearcoat: 0.45, clearcoatRoughness: 0.3 };
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xeeebe6, roughness: 0.38, envMapIntensity: env, ...clear });
  const shellLight = new THREE.MeshPhysicalMaterial({ color: 0xf8f6f2, roughness: 0.34, envMapIntensity: env, ...clear });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.55, metalness: 0.3, envMapIntensity: env });
  const deep = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.6, metalness: 0.2, envMapIntensity: env });
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x2a2928, roughness: 0.9, envMapIntensity: env });
  const ringTex = makeRingTexture();
  const ringMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: ringTex,
    emissive: 0xffffff,
    emissiveMap: ringTex,
    emissiveIntensity: 0.22,
    roughness: 0.5,
    clearcoat: 0.35,
    envMapIntensity: env,
  });
  const screenMat = new THREE.MeshPhysicalMaterial({
    color: 0x050507,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    emissive: 0xffffff,
    emissiveMap: face.texture,
    emissiveIntensity: 1.6,
    envMapIntensity: env,
  });
  const led = (c) =>
    new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 2.2, roughness: 0.4 });

  const add = (parent, geo, mat, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const world = new THREE.Group();
  const robot = new THREE.Group();
  world.add(robot);

  /* pedestal */
  const pedestal = add(world, new THREE.BoxGeometry(1.7, 1.6, 1.7), pedMat, 0, -2.22, 0);
  pedestal.castShadow = false;

  /* ── head ── */
  const head = new THREE.Group();
  head.position.y = 0.94;
  robot.add(head);
  const H = new THREE.Group();
  H.position.y = 0.78;
  head.add(H);

  add(H, rbox(1.5, 1.42, 1.3, 0.2), shell);
  add(H, rbox(1.28, 1.14, 0.9, 0.12), deep, 0, 0.02, -0.5);

  const rnd = seeded(7);
  for (let i = 0; i < 26; i++) {
    if (i < 16) {
      const w = 0.06 + rnd() * 0.16;
      add(H, new THREE.BoxGeometry(w, 0.03, 0.012), dark, (rnd() - 0.5) * 1.0, -0.48 + rnd() * 0.96, -0.955);
    } else {
      const w = 0.06 + rnd() * 0.14;
      add(H, new THREE.BoxGeometry(w, 0.012, 0.03), dark, (rnd() - 0.5) * 0.95, 0.595, -0.9 + rnd() * 0.7);
    }
  }

  add(H, frameGeometry(1.5, 1.44, 0.3, 1.08, 1.02, 0.2, 0.1, 0.03), ringMat, 0, 0, 0.6);
  add(H, frameGeometry(1.08, 1.02, 0.2, 0.9, 0.84, 0.14, 0.04, 0.01), shellLight, 0, 0, 0.62);
  add(H, plateGeometry(0.9, 0.84, 0.14, 0.03, 0.008), screenMat, 0, 0, 0.66);

  [-1, 1].forEach((s) => {
    const ear = add(H, new THREE.CylinderGeometry(0.22, 0.22, 0.14, 40), shell, s * 0.8, 0, 0);
    ear.rotation.z = Math.PI / 2;
    const cap = add(H, new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32), dark, s * 0.9, 0, 0);
    cap.rotation.z = Math.PI / 2;
  });
  const cable = add(H, new THREE.TorusGeometry(0.22, 0.026, 10, 32, Math.PI), dark, 0.9, -0.2, 0);
  cable.rotation.set(0, Math.PI / 2, Math.PI);

  /* ── neck + torso ── */
  add(robot, new THREE.CylinderGeometry(0.16, 0.18, 0.22, 24), dark, 0, 0.88, 0);
  add(robot, rbox(1.22, 1.12, 0.92, 0.24), shell, 0, 0.2, 0);
  add(robot, rbox(1.0, 0.1, 0.7, 0.05), shellLight, 0, 0.78, 0);
  add(robot, rbox(0.8, 0.2, 0.58, 0.06), dark, 0, -0.46, 0);

  [0x00c2ff, 0x2f6bff, 0x7a5cff].forEach((c, i) => {
    add(robot, new THREE.SphereGeometry(0.05, 20, 16), led(c), (i - 1) * 0.2, 0.46, 0.46);
  });
  [-1, 1].forEach((s) => {
    add(robot, new THREE.BoxGeometry(0.12, 0.4, 0.02), dark, s * 0.3, 0.06, 0.465);
    add(robot, new THREE.TorusGeometry(0.06, 0.014, 8, 20, Math.PI), dark, s * 0.3, 0.28, 0.468);
  });

  /* ── arms ── */
  const shoulders = [];
  const forearms = [];
  [-1, 1].forEach((s) => {
    const sh = new THREE.Group();
    sh.position.set(s * 0.78, 0.46, 0);
    sh.rotation.z = s * 0.16;
    robot.add(sh);
    add(sh, new THREE.SphereGeometry(0.14, 24, 20), dark);
    add(sh, rbox(0.2, 0.42, 0.22, 0.08), shell, 0, -0.26, 0);
    add(sh, new THREE.SphereGeometry(0.1, 20, 16), dark, 0, -0.52, 0);
    const fa = new THREE.Group();
    fa.position.set(0, -0.52, 0);
    fa.rotation.x = -0.35;
    sh.add(fa);
    add(fa, rbox(0.19, 0.4, 0.21, 0.08), shell, 0, -0.22, 0);
    add(fa, rbox(0.22, 0.2, 0.24, 0.07), shellLight, 0, -0.5, 0);
    add(fa, rbox(0.07, 0.12, 0.08, 0.03), shellLight, -s * 0.13, -0.46, 0.07);
    shoulders.push({ g: sh, side: s });
    forearms.push({ g: fa, side: s });
  });

  /* ── legs ── */
  [-1, 1].forEach((s) => {
    add(robot, new THREE.SphereGeometry(0.15, 24, 20), dark, s * 0.28, -0.56, 0);
    add(robot, rbox(0.34, 0.46, 0.36, 0.1), shell, s * 0.28, -0.86, 0);
    add(robot, new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20), dark, s * 0.28, -1.13, 0);
    add(robot, rbox(0.46, 0.2, 0.62, 0.09), shellLight, s * 0.28, -1.32, 0.08);
  });

  return { world, robot, head, shoulders, forearms };
}
