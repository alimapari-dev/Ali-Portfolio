"use client";

import { useEffect, useRef, useState } from "react";

const TAU = Math.PI * 2;
const BASE_SPEED = 0.3; // rad / s
const RING_UNITS = 1.8; // ring radius in robot units (1 unit ≈ the robot's shoulder width), so the cards hug him
const SHUFFLE_MS = 3800; // how long each skill's details stay in the deck before the next one comes forward
const HOT_SCALE = 1.16;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const two = (v) => String(v).padStart(2, "0");

/* a loose, slightly uneven band rather than a perfect circle */
const RADIUS = [1, 0.94, 1.06, 0.97, 1.05, 0.92, 1.03];
const LIFT = [0.02, -0.1, 0.08, -0.05, 0.12, -0.08, 0.05];

function Icons({ c }) {
  return c.images.map((src) => (
    <img
      key={src}
      src={src}
      alt=""
      width="56"
      height="56"
      draggable={false}
      className={c.invertInDark?.includes(src) ? "inv" : undefined}
    />
  ));
}

function CardView({ c, i, layer, on, onSelect, onFocus, onBlur }) {
  const front = layer === "front";
  return (
    <div
      className={"sk-card" + (on ? " on" : "")}
      data-i={i}
      data-layer={layer}
      role={front ? "button" : undefined}
      tabIndex={front ? 0 : -1}
      aria-label={front ? c.title : undefined}
      onClick={() => onSelect(i)}
      onFocus={front ? () => onFocus(i) : undefined}
      onBlur={front ? onBlur : undefined}
    >
      <div className="sk-ico">
        <Icons c={c} />
      </div>
      <h3 className="sk-title">{c.title}</h3>
    </div>
  );
}

/**
 * Skills as a free-floating ring of small glass cards that orbits the robot.
 * - The robot stands on the right; the ring is centred on wherever he is on screen (RobotStage publishes it).
 * - Two fixed layers: cards on the far side of the ring sit BEHIND the robot's canvas, cards on the near side in front.
 * - No axis is drawn and none stays put: the ring's tilt and roll drift on their own, lean towards the cursor and
 *   follow drags, and every card floats a little on its own path.
 * - It is moved by hand only (mouse drag / finger swipe, with a little inertia): there are no buttons.
 * - On the left a deck of detail cards keeps shuffling through the skills by itself; hovering (or tapping) a ring card
 *   brings that skill's details forward straight away.
 */
export default function SkillsRing({ cards, also = [] }) {
  const dragRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const [active, setActive] = useState(0); // skill whose details are on top of the deck
  const [hover, setHover] = useState(-1); // ring card under the cursor / focused
  const [panelHover, setPanelHover] = useState(false);
  const [tapHold, setTapHold] = useState(false);
  const [deckIn, setDeckIn] = useState(false); // the details deck has been scrolled to: it slides in, then stays put
  const [entering, setEntering] = useState(false);
  const sideRef = useRef(null);
  const n = cards.length;
  const step = TAU / n;
  const hold = hover >= 0 || panelHover || tapHold; // the shuffle pauses while someone is looking

  const s = useRef({
    angle: 0, omega: 0, speed: 1, drag: null, dragged: false,
    tiltA: 0.38, tiltB: 0, dragTilt: 0,
    px: 0, py: 0, hover: -1, hoverIdx: -1, leaveT: 0, tapT: 0,
    vis: 0, hot: cards.map(() => 0), mode: cards.map(() => -1),
    layers: -1, drags: -1, deck: false, cardW: 100, sideH: 380, sideT: 0,
  }).current;
  s.hover = hover;

  const showSkill = (i) => {
    setActive(i);
    setHover(i);
  };
  const onFocus = (i) => showSkill(i);
  const onBlur = () => setHover(-1);
  const select = (i) => {
    if (s.dragged) return;
    setActive(i);
    setTapHold(true); // a tap (touch screens have no hover) keeps the details up for a while
    clearTimeout(s.tapT);
    s.tapT = setTimeout(() => setTapHold(false), 7000);
  };

  /* the deck slides in when the section is reached (starting from the first skill) and out when it is left */
  useEffect(() => {
    if (!deckIn) {
      setEntering(false);
      return undefined;
    }
    if (s.hover < 0) setActive(0);
    setEntering(true);
    const id = setTimeout(() => setEntering(false), 1700);
    return () => clearTimeout(id);
  }, [deckIn, s]);

  /* the deck shuffles by itself */
  useEffect(() => {
    if (hold || !deckIn) return undefined;
    const id = setInterval(() => {
      if (document.hidden || s.vis < 0.2) return;
      setActive((a) => (a + 1) % n);
    }, SHUFFLE_MS);
    return () => clearInterval(id);
  }, [hold, deckIn, n, s]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const backEls = [...backRef.current.querySelectorAll(".sk-card")];
    const frontEls = [...frontRef.current.querySelectorAll(".sk-card")];
    let raf = 0;
    let last = performance.now();
    let top = 0;
    let height = 0;

    const measure = () => {
      const sec = document.getElementById("skills");
      if (sec) {
        top = sec.getBoundingClientRect().top + window.scrollY;
        height = sec.offsetHeight;
      }
      s.cardW = frontEls[0]?.offsetWidth || 100;
      s.sideH = sideRef.current?.offsetHeight || 380;
    };
    measure();
    const t0 = setTimeout(measure, 700);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    /* pointer: tilts the ring, drags it, and decides which card is hovered */
    const setPtr = (x, y) => {
      s.px = (x / window.innerWidth) * 2 - 1;
      s.py = (y / window.innerHeight) * 2 - 1;
    };
    const onMove = (e) => {
      setPtr(e.clientX, e.clientY);
      const d = s.drag;
      if (d) {
        const dx = e.clientX - d.lastX;
        const dy = e.clientY - d.lastY;
        if (!d.active && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
          d.active = true;
          s.dragged = true;
          dragRef.current?.classList.add("grabbing");
        }
        if (d.active) {
          const now = performance.now();
          const dt = Math.max(8, now - d.lastT) / 1000;
          s.angle += dx * 0.0055;
          s.dragTilt = clamp(s.dragTilt + dy * 0.0022, -0.5, 0.5);
          d.v = lerp(d.v, (dx * 0.0055) / dt, 0.35);
          d.lastT = now;
        }
        d.lastX = e.clientX;
        d.lastY = e.clientY;
        return;
      }
      if (e.pointerType !== "mouse") return;
      const card = e.target.closest?.(".sk-card");
      const idx = card ? Number(card.dataset.i) : -1;
      if (idx >= 0) {
        clearTimeout(s.leaveT);
        s.leaveT = 0;
        if (s.hoverIdx !== idx) {
          s.hoverIdx = idx;
          setActive(idx); // its details come to the front straight away
          setHover(idx);
        }
      } else if (s.hoverIdx >= 0 && !s.leaveT) {
        s.leaveT = setTimeout(() => {
          s.leaveT = 0;
          s.hoverIdx = -1;
          setHover(-1);
        }, 180);
      }
    };
    const onUp = () => {
      const d = s.drag;
      if (!d) return;
      s.drag = null;
      dragRef.current?.classList.remove("grabbing");
      if (d.active) s.omega = clamp(d.v, -7, 7);
      setTimeout(() => (s.dragged = false), 0);
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) setPtr(t.clientX, t.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });

    const place = (el, tf, op, z, tt) => {
      el.style.transform = tf;
      el.style.opacity = op;
      el.style.zIndex = z;
      el.style.setProperty("--t", tt);
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const k = (x) => 1 - Math.pow(1 - x, dt * 60);
      const w = window.innerWidth;
      const h = window.innerHeight;

      /* fade the whole thing in / out with the scroll position (the skills section is pinned for a while) */
      const y = window.scrollY;
      const ramp = h * 0.6;
      const pinEnd = top + height - h;
      const vin = smooth(clamp((y - (top - ramp)) / ramp, 0, 1));
      const vout = smooth(clamp((pinEnd + ramp - y) / ramp, 0, 1));
      s.vis += (Math.min(vin, vout) - s.vis) * k(0.3);
      const shown = s.vis > 0.004 ? 1 : 0;
      if (shown !== s.layers) {
        s.layers = shown;
        backRef.current.style.display = frontRef.current.style.display = shown ? "block" : "none";
      }
      const drags = s.vis > 0.7 ? 1 : 0;
      if (drags !== s.drags) {
        s.drags = drags;
        dragRef.current.style.display = drags ? "block" : "none";
        frontRef.current.classList.toggle("idle", !drags); // while it fades, it must not catch clicks meant for the next section
      }
      /* the details deck only comes in once the section has been reached, and goes when it is left */
      const deckOn = y >= top - h * 0.05 && y <= pinEnd + h * 0.05;
      if (deckOn !== s.deck) {
        s.deck = deckOn;
        setDeckIn(deckOn);
      }
      if (!shown) return;
      frontRef.current.style.setProperty("--vis", s.vis.toFixed(3));
      /* the deck + toolkit block is centred on the robot's middle (kept clear of the title above and the bottom edge) */
      if (now - s.sideT > 400) {
        s.sideT = now;
        s.sideH = sideRef.current?.offsetHeight || s.sideH; // (can only be measured while the layer is displayed)
      }
      const mid = window.__robotRing?.midY ?? h * 0.52;
      const sideTop = clamp(mid - s.sideH / 2, 250, Math.max(250, h - s.sideH - 24));
      frontRef.current.style.setProperty("--side-top", sideTop.toFixed(1) + "px");

      /* rotation: slow drift, paused while a card is hovered, thrown by a drag */
      const auto = !reduce && s.hover < 0 && !(s.drag && s.drag.active) && !document.hidden;
      s.speed += ((auto ? 1 : 0) - s.speed) * k(s.hover >= 0 ? 0.2 : 0.045);
      if (!(s.drag && s.drag.active)) {
        s.angle += (s.omega + BASE_SPEED * s.speed * (1 + 0.3 * Math.sin(t * 0.45))) * dt;
        s.omega *= Math.pow(0.94, dt * 60);
        if (Math.abs(s.omega) < 0.01) s.omega = 0;
      }

      /* the ring's orientation wanders by itself, leans to the cursor and follows vertical drags */
      const live = reduce ? 0 : 1;
      const wantA = 0.36 + live * (0.1 * Math.sin(t * 0.31) + 0.05 * Math.sin(t * 0.83 + 1.1)) - s.py * 0.15 + s.dragTilt;
      const wantB = live * (0.12 * Math.sin(t * 0.23 + 0.7) + 0.06 * Math.sin(t * 0.61)) + s.px * 0.12;
      s.tiltA += (clamp(wantA, 0.12, 0.9) - s.tiltA) * k(0.05);
      s.tiltB += (wantB - s.tiltB) * k(0.05);
      if (!(s.drag && s.drag.active)) s.dragTilt *= Math.pow(0.94, dt * 60);
      const ca = Math.cos(s.tiltA);
      const sa = Math.sin(s.tiltA);
      const cb = Math.cos(s.tiltB);
      const sb = Math.sin(s.tiltB);

      /* geometry: centred on the robot, as close to him as the cards allow */
      const narrow = w <= 900;
      const rob = window.__robotRing;
      const ppu = rob?.ppu || Math.min(w * 0.5, h * 0.9) / 6;
      const cx = rob ? rob.x : narrow ? w / 2 : w * 0.7;
      const baseY = rob ? rob.y : h * 0.5;
      let R = ppu * RING_UNITS;
      if (narrow) R = Math.min(R, w / 2 - s.cardW / 2 - 8);
      R *= (0.85 + 0.15 * s.vis) * (1 + live * 0.03 * Math.sin(t * 0.4));
      const D = R * 3;
      const cy = baseY + (1 - vin) * h * 0.1 - (1 - vout) * h * 0.08;

      for (let i = 0; i < n; i++) {
        s.hot[i] += ((i === s.hover ? 1 : 0) - s.hot[i]) * k(0.16);
        const o = s.hot[i];
        const ph = i * 1.7;
        const th = s.angle + i * step + live * 0.1 * Math.sin(t * 0.5 + ph);
        const rr = R * (RADIUS[i % RADIUS.length] + live * 0.035 * Math.sin(t * 0.63 + ph * 1.3));
        const px = Math.sin(th) * rr;
        const py = (LIFT[i % LIFT.length] + live * 0.035 * Math.sin(t * 0.9 + ph * 0.7)) * R;
        const pz = Math.cos(th) * rr;
        // tilt about X, then roll about Z, then perspective
        const y1 = py * ca + pz * sa;
        const z1 = -py * sa + pz * ca;
        const x2 = px * cb - y1 * sb;
        const y2 = px * sb + y1 * cb;
        const persp = D / (D - z1);
        const X = cx + x2 * persp;
        const Y = cy + y2 * persp;
        const depth = clamp((z1 / R + 1.1) / 2.2, 0, 1); // 1 = nearest

        const sc = persp * 0.92 * lerp(1, HOT_SCALE, o);
        const turn = lerp(clamp((-x2 / R) * 16, -18, 18), 0, o);
        const op = lerp(0.5 + 0.5 * depth, 1, o) * s.vis;
        const tf = `translate3d(${X.toFixed(2)}px,${Y.toFixed(2)}px,0) translate(-50%,-50%) perspective(900px) rotateY(${turn.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
        const z = Math.round(depth * 30) + (o > 0.05 ? 40 : 0);
        const tt = lerp(depth, 1, o).toFixed(3);

        // which twin is drawn: near side → front layer, far side → back layer (behind the robot)
        const mode = z1 >= 0 ? 1 : 0;
        const bk = backEls[i];
        const fr = frontEls[i];
        if (mode !== s.mode[i]) {
          s.mode[i] = mode;
          bk.style.display = mode === 1 ? "none" : "block";
          fr.style.display = mode === 0 ? "none" : "block";
        }
        place(mode === 1 ? fr : bk, tf, op.toFixed(3), z, tt);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t0);
      clearTimeout(s.leaveT);
      clearTimeout(s.tapT);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("touchmove", onTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const onPointerDown = (e) => {
    s.drag = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), v: 0, active: false };
    s.dragged = false;
  };

  return (
    <>
      <div ref={dragRef} className="ring-drag" onPointerDown={onPointerDown} />

      <div ref={backRef} className="ring-layer back" aria-hidden="true" onPointerDown={onPointerDown}>
        {cards.map((c, i) => (
          <CardView key={c.id} c={c} i={i} layer="back" on={deckIn && active === i} onSelect={select} />
        ))}
      </div>

      <div
        ref={frontRef}
        className="ring-layer front"
        role="group"
        aria-label="Skills. Drag to turn the ring."
        onPointerDown={onPointerDown}
      >
        {cards.map((c, i) => (
          <CardView key={c.id} c={c} i={i} layer="front" on={deckIn && active === i} onSelect={select} onFocus={onFocus} onBlur={onBlur} />
        ))}

        <div ref={sideRef} className={"sk-side" + (deckIn ? " in" : "") + (entering ? " enter" : "")}>
          <div
            className="sk-deck"
            onPointerEnter={(e) => e.pointerType === "mouse" && setPanelHover(true)}
            onPointerLeave={() => setPanelHover(false)}
          >
            {cards.map((c, i) => {
              const pos = (i - active + n) % n;
              const state = pos === 0 ? "0" : pos === 1 ? "1" : pos === 2 ? "2" : pos === n - 1 ? "out" : "x";
              return (
                <article key={c.id} className="sk-slide" data-pos={state} aria-hidden={pos !== 0}>
                  <header>
                    <div className="sk-sico">
                      <Icons c={c} />
                    </div>
                    <div className="sk-head">
                      <p className="mono sk-cat">{c.category}</p>
                      <h3>{c.title}</h3>
                    </div>
                    <span className="mono sk-num">
                      {two(i + 1)} / {two(n)}
                    </span>
                  </header>
                  <p className="sk-blurb">{c.blurb}</p>
                  <ul className="chips sm">
                    {c.related.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                  {pos === 0 && (
                    <span
                      key={`${active}-${hold}-${deckIn}`}
                      className={"sk-prog" + (hold ? " hold" : "")}
                      style={{ animationDuration: `${SHUFFLE_MS}ms` }}
                    />
                  )}
                </article>
              );
            })}
          </div>

          {also.length > 0 && (
            <p className="skills-also">
              <span className="mono">Also in my toolkit</span>
              {also.join(" · ")}
            </p>
          )}
        </div>
      </div>

      <ul className="sr-only">
        {cards.map((c) => (
          <li key={c.id}>
            {c.title}: {c.blurb}
          </li>
        ))}
      </ul>
    </>
  );
}
