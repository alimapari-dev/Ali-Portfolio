"use client";

import { useEffect, useRef } from "react";
import { POSES, STAGES, stagePosition, sectionTops } from "@/lib/poses";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const KEYS = ["z", "y", "look", "body", "hy", "hp", "hr"];
const mixPose = (a, b, t) => {
  const o = {};
  KEYS.forEach((k) => (o[k] = lerp(a[k], b[k], t)));
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
      // On phones the content sits in the lower half, so lift the robot up the screen
      // (less on Home, where the robot is the poster).
      const applyView = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (w < 900) camera.setViewOffset(w, h, 0, h * (0.07 + 0.13 * clamp(sp, 0, 1)), w, h);
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
      };
      resize();
      window.addEventListener("resize", resize);

      /* pointer (normalised, smoothed) */
      const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
      const onMove = (e) => {
        ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
        ptr.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      /* scroll-driven pose */
      let tops = sectionTops();
      const measure = () => (tops = sectionTops());
      window.addEventListener("resize", measure);
      const settle = setTimeout(measure, 600);
      const clock = new THREE.Clock();
      let raf = 0;

      const frame = () => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;
        const stages = STAGES;
        const n = stages.length;

        const rawP = stagePosition(tops, window.scrollY);
        sp += (rawP - sp) * (reduce ? 1 : 0.08);
        if (window.innerWidth < 900) applyView();

        const i0 = Math.min(Math.floor(sp), n - 1);
        const i1 = Math.min(i0 + 1, n - 1);
        const pose = mixPose(POSES[stages[i0].pose], POSES[stages[i1].pose], ease(sp - i0));

        face.setMode(stages[clamp(Math.floor(sp + 0.45), 0, n - 1)].face);
        face.update(t, dt, !reduce);

        ptr.sx += (ptr.x - ptr.sx) * (reduce ? 1 : 0.06);
        ptr.sy += (ptr.y - ptr.sy) * (reduce ? 1 : 0.06);

        const zMul = window.innerWidth < 900 ? 1.25 : 1;
        camera.position.set(ptr.sx * 0.25, pose.y - ptr.sy * 0.1, pose.z * zMul);
        camera.lookAt(0, pose.look, 0);

        const idle = reduce ? 0 : 1;
        robot.rotation.y = pose.body + ptr.sx * 0.12;
        robot.position.y = Math.sin(t * 1.4) * 0.02 * idle;
        head.rotation.set(
          pose.hp + ptr.sy * 0.18 + Math.sin(t * 0.9) * 0.02 * idle,
          pose.hy + ptr.sx * 0.45,
          pose.hr + Math.sin(t * 0.7) * 0.02 * idle,
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
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
        pmrem.dispose();
        renderer.dispose();
        document.documentElement.classList.remove("robot-ready");
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="stage" aria-hidden="true" />;
}
