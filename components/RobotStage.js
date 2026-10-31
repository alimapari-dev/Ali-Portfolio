"use client";

import { useEffect, useRef } from "react";
import { POSES, STAGES, stagePosition, sectionTops, sectionHolds } from "@/lib/poses";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const KEYS = ["z", "y", "look", "body", "hy", "hp", "hr", "ml", "sx"];
const RING_Y = 0.95; // height (world units) of the point the skills ring is centred on
const MID_Y = 0.3; // height of the robot's visual middle (head top to feet), used to level the skills details with him
const spring = (v0 = 0) => ({ x: v0, v: 0 });
/** Slightly under-damped spring: follows its target smoothly, with a touch of life. */
const stepSpring = (sp, target, dt, k = 110, d = 15) => {
  if (!Number.isFinite(sp.x) || !Number.isFinite(sp.v)) {
    sp.x = 0;
    sp.v = 0;
  }
  if (!Number.isFinite(target)) target = 0;
  const h = Math.min(dt, 0.033);
  sp.v += ((target - sp.x) * k - sp.v * d) * h;
  sp.x += sp.v * h;
  return sp.x;
};
const IDLE_FACES = ["smile", "wink", "surprised", "curious", "heart", "sleepy"];
const CLICK_FACES = ["surprised", "heart", "smile", "wink"];
const mixPose = (a, b, t) => {
  const o = {};
  KEYS.forEach((k) => (o[k] = lerp(a[k] || 0, b[k] || 0, t)));
  return o;
};

/** Fixed, full-screen WebGL canvas that holds the robot behind every page. */
export default function RobotStage() {
  const canvasRef = useRef(null);
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
      const { createFace, createRobot } = await import("./robot");
      if (disposed) return;

      const canvas = canvasRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        document.documentElement.classList.add("no-webgl");
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const setExposure = () => {
        renderer.toneMappingExposure = document.documentElement.dataset.theme === "dark" ? 0.92 : 1.05;
      };
      setExposure();
      const themeObs = new MutationObserver(setExposure);
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

      scene.add(new THREE.HemisphereLight(0xf2f6ff, 0xcfd8ea, 0.7));
      const key = new THREE.DirectionalLight(0xf6f9ff, 1.7);
      key.position.set(-3, 5, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.radius = 6;
      key.shadow.bias = -0.0005;
      Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 18 });
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xe8f0ff, 1.2);
      rim.position.set(4, 2, -4);
      scene.add(rim);
      const fill = new THREE.PointLight(0x4f8bff, 2.6, 6);
      fill.position.set(-3.2, 1.2, 0.6);
      scene.add(fill);

      const face = createFace();
      const { world, robot, head, shoulders, forearms } = createRobot(face);
      scene.add(world);

      let sp = 0;

      /* sizing */
      const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        applyView();
      };
      // On phones the content sits in the lower half, so lift the robot up the screen (`ml` = fraction of the height).
      // On desktop `sx` slides him to the right (fraction of the width), e.g. beside the skills text.
      const applyView = (lift = 0.2, shift = 0) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const offY = w < 900 ? h * lift : 0;
        const offX = w >= 900 ? -w * shift : 0;
        if (offY || offX) camera.setViewOffset(w, h, offX, offY, w, h);
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      /* pointer / touch: the head and eyes follow it, a click or tap makes the robot react */
      const P = { x: window.innerWidth / 2, y: window.innerHeight / 2, last: -99, sx: 0, sy: 0, act: 0 };
      let override = null;
      let overrideUntil = 0;
      let nextExpr = performance.now() / 1000 + 4;
      const bump = spring(0);
      const setP = (x, y) => {
        P.x = x;
        P.y = y;
        P.last = performance.now() / 1000;
      };
      const react = () => {
        const now = performance.now() / 1000;
        override = CLICK_FACES[Math.floor(Math.random() * CLICK_FACES.length)];
        overrideUntil = now + 1.5;
        nextExpr = overrideUntil + 3 + Math.random() * 3;
        bump.v += 2.4;
      };
      const onMove = (e) => setP(e.clientX, e.clientY);
      const onDown = (e) => {
        setP(e.clientX, e.clientY);
        react();
      };
      const onTouch = (e) => {
        const t0 = e.touches[0];
        if (t0) setP(t0.clientX, t0.clientY);
      };
      const onLeave = () => (P.last = -99);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);

      const yaw = spring(0);
      const pitch = spring(0);
      const bodyYaw = spring(0);
      const eyeX = spring(0);
      const eyeY = spring(0);
      const wander = { x: 0, y: 0, until: 0 };
      const headAt = new THREE.Vector3();
      const ringAt = new THREE.Vector3();
      const ringPx = new THREE.Vector3();
      const midAt = new THREE.Vector3();

      /* scroll-driven pose */
      let tops = sectionTops();
      let holds = sectionHolds();
      const measure = () => {
        tops = sectionTops();
        holds = sectionHolds();
      };
      window.addEventListener("resize", measure);
      const settle = setTimeout(measure, 600);
      const clock = new THREE.Clock();
      let raf = 0;

      const frame = () => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;
        const now = performance.now() / 1000;
        const stages = STAGES;
        const n = stages.length;

        const rawP = stagePosition(tops, window.scrollY, holds);
        const k60 = (k) => (reduce ? 1 : 1 - Math.pow(1 - k, dt * 60)); // frame-rate independent smoothing
        sp += (rawP - sp) * k60(0.08);

        const i0 = Math.min(Math.floor(sp), n - 1);
        const i1 = Math.min(i0 + 1, n - 1);
        const pose = mixPose(POSES[stages[i0].pose], POSES[stages[i1].pose], ease(sp - i0));

        /* expression: the section decides the base face, now and then the robot makes another one */
        const baseFace = stages[clamp(Math.floor(sp + 0.45), 0, n - 1)].face;
        if (override && now > overrideUntil) override = null;
        if (!override && !reduce && now > nextExpr) {
          if (baseFace === "eyes" || baseFace === "smile") {
            override = IDLE_FACES[Math.floor(Math.random() * IDLE_FACES.length)];
            overrideUntil = now + 1.3 + Math.random() * 1.2;
          }
          nextExpr = now + 4 + Math.random() * 4;
        }
        face.setMode(override || baseFace);

        applyView(pose.ml, pose.sx);
        const zMul = window.innerWidth < 900 ? 1.25 : 1;
        const w = window.innerWidth;
        const h = window.innerHeight;

        /* where is the head on screen, and where is the cursor / finger relative to it? */
        headAt.set(0, 0.78, 0);
        head.localToWorld(headAt);
        headAt.project(camera);
        const okHead = Number.isFinite(headAt.x) && Number.isFinite(headAt.y);
        const hx = okHead ? (headAt.x * 0.5 + 0.5) * w : w / 2; // (first frame: camera not placed yet)
        const hy = okHead ? (-headAt.y * 0.5 + 0.5) * h : h * 0.3;

        const active = now - P.last < 10 ? 1 : 0; // keeps looking at the last position for a while, then wanders
        P.act += (active - P.act) * k60(0.05);
        if (now > wander.until) {
          wander.x = (Math.random() - 0.5) * 1.4;
          wander.y = (Math.random() - 0.5) * 0.7;
          wander.until = now + 2.5 + Math.random() * 2.5;
        }
        const tanV = Math.tan((camera.fov * Math.PI) / 360);
        const tanH = tanV * camera.aspect;
        const dxP = (P.x - hx) / (w * 0.5);
        const dyP = (P.y - hy) / (h * 0.5);

        const lookYaw = Math.atan(dxP * tanH * 1.7);
        const lookPitch = Math.atan(dyP * tanV * 1.6);
        const idleYaw = pose.body + pose.hy + wander.x * 0.3;
        const idlePitch = pose.hp + wander.y * 0.2;
        const wantYaw = lerp(idleYaw, lookYaw, P.act);
        const wantPitch = lerp(idlePitch, clamp(lookPitch, -0.45, 0.55), P.act);

        const bodyTarget = pose.body + (wantYaw - pose.body) * 0.3;
        stepSpring(bodyYaw, bodyTarget, dt, 60, 12);
        stepSpring(yaw, clamp(wantYaw - bodyYaw.x, -1.15, 1.15), dt, 120, 15);
        stepSpring(pitch, wantPitch, dt, 120, 15);
        stepSpring(bump, 0, dt, 140, 9);

        const dxE = lerp(wander.x * 0.5, dxP, P.act);
        const dyE = lerp(wander.y * 0.6, dyP, P.act);
        face.setGaze(
          clamp(stepSpring(eyeX, clamp(dxE * 0.8, -1, 1), dt, 160, 18), -1, 1),
          clamp(stepSpring(eyeY, clamp(dyE * 0.9, -1, 1), dt, 160, 18), -1, 1),
        );
        face.update(t, dt, !reduce);

        P.sx += ((P.x / w) * 2 - 1 - P.sx) * k60(0.06);
        P.sy += ((P.y / h) * 2 - 1 - P.sy) * k60(0.06);
        const par = P.act;
        camera.position.set(P.sx * 0.25 * par, pose.y - P.sy * 0.1 * par, pose.z * zMul);
        camera.lookAt(0, pose.look, 0);

        /* where the robot's body axis is on screen (the skills ring orbits this point) and how big one world unit is */
        camera.updateMatrixWorld();
        ringAt.set(0, RING_Y, 0).project(camera);
        ringPx.set(1, RING_Y, 0).project(camera);
        midAt.set(0, MID_Y, 0).project(camera);
        if (Number.isFinite(ringAt.x) && Number.isFinite(ringAt.y) && Number.isFinite(midAt.y)) {
          window.__robotRing = {
            x: (ringAt.x * 0.5 + 0.5) * w,
            y: (-ringAt.y * 0.5 + 0.5) * h,
            midY: (-midAt.y * 0.5 + 0.5) * h,
            ppu: Math.abs(ringPx.x - ringAt.x) * 0.5 * w,
          };
        }

        const idle = reduce ? 0 : 1;
        robot.rotation.y = bodyYaw.x;
        robot.position.y = Math.sin(t * 1.4) * 0.02 * idle + bump.x * 0.07;
        head.rotation.set(
          pitch.x + Math.sin(t * 0.9) * 0.02 * idle + bump.x * 0.1,
          yaw.x,
          pose.hr + (wantYaw - idleYaw) * -0.04 + Math.sin(t * 0.7) * 0.02 * idle,
        );
        shoulders.forEach(({ g, side }) => (g.rotation.x = Math.sin(t * 1.4 + side) * 0.05 * idle));
        forearms.forEach(({ g, side }) => (g.rotation.x = -0.35 + Math.sin(t * 1.4 + side) * 0.06 * idle));

        renderer.render(scene, camera);
      };
      frame();
      document.documentElement.classList.add("robot-ready");

      cleanup = () => {
        themeObs.disconnect();
        cancelAnimationFrame(raf);
        clearTimeout(settle);
        window.removeEventListener("resize", measure);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchmove", onTouch);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
        pmrem.dispose();
        renderer.dispose();
        document.documentElement.classList.remove("robot-ready");
        delete window.__robotRing;
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="stage" aria-hidden="true" />;
}
