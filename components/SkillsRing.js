"use client";

import { useEffect, useRef, useState } from "react";

const TAU = Math.PI * 2;
const BASE_SPEED = 0.3; // rad / s
const OPEN_SCALE = 1.12;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const wrap = (a) => {
  const m = (a + Math.PI) % TAU;
  return (m < 0 ? m + TAU : m) - Math.PI;
};

/* a loose, slightly uneven band rather than a perfect circle */
const RADIUS = [1, 0.93, 1.07, 0.96, 1.05, 0.91, 1.03];
const LIFT = [0.02, -0.1, 0.08, -0.05, 0.12, -0.08, 0.05];

function CardView({ c, i, layer, open, onSelect }) {
  const front = layer === "front";
  return (
    <div
      className={"sk-card" + (open ? " open" : "")}
      data-i={i}
      data-layer={layer}
      role={front ? "button" : undefined}
      tabIndex={front ? 0 : -1}
      aria-expanded={front ? open : undefined}
      aria-label={front ? c.title : undefined}
      onClick={() => onSelect(i)}
      onKeyDown={(e) => {
        if (front && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(i);
        }
      }}
    >
      <div className="sk-ico">
        {c.images.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            width="56"
            height="56"
            draggable={false}
            className={c.invertInDark?.includes(src) ? "inv" : undefined}
          />
        ))}
      </div>
      <h3 className="sk-title">{c.title}</h3>
      <span className="sk-line" aria-hidden="true" />
      <div className="sk-info">
        <div>
          <p className="sk-cat mono">{c.category}</p>
          <p className="sk-blurb">{c.blurb}</p>
          <ul className="chips sm">
            {c.related.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Skills as a free-floating ring of glass cards that orbits the robot.
 * - Two fixed layers: cards on the far side of the ring sit BEHIND the robot's canvas, cards on the near side in front.
 * - No axis is drawn and none stays put: the ring's tilt and roll drift on their own, lean towards the cursor and
 *   follow drags, and every card floats a little on its own path.
 * - Hover / tap a card to open it; click pins it open beside the robot. Drag, arrow buttons or ←/→ rotate it.
 */
export default function SkillsRing({ cards, also = [] }) {
  const dragRef = useRef(null);
  const backRef = useRef(null);
  const frontRef = useRef(null);
  const [hover, setHover] = useState(-1);
  const [pinned, setPinned] = useState(-1);
  const [playing, setPlaying] = useState(true);
  const n = cards.length;
  const step = TAU / n;

  const s = useRef({
    angle: 0, omega: 0, speed: 1, target: null, drag: null, dragged: false,
    tiltA: 0.38, tiltB: 0, dragTilt: 0,
    px: 0, py: 0, hover: -1, hoverIdx: -1, leaveT: 0, pinned: -1, playing: true,
    vis: 0, open: cards.map(() => 0), mode: cards.map(() => -1),
    layers: -1, drags: -1,
  }).current;
  s.hover = hover;
  s.pinned = pinned;
  s.playing = playing;

  const sideTarget = (i) => {
    const th = s.angle + i * step;
    const toRight = wrap(Math.PI / 2 - th);
    const toLeft = wrap(-Math.PI / 2 - th);
    s.omega = 0;
    s.target = s.angle + (Math.abs(toRight) <= Math.abs(toLeft) ? toRight : toLeft);
  };
  const nudge = (dir) => {
    s.omega = 0;
    s.target = (Math.round(s.angle / step) + dir) * step;
    s.pinned = -1;
    setPinned(-1);
  };
  const select = (i) => {
    if (s.dragged) return;
    if (s.pinned === i) {
      setPinned(-1);
    } else {
      setPinned(i);
      sideTarget(i);
    }
  };

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
      if (!sec) return;
      top = sec.getBoundingClientRect().top + window.scrollY;
      height = sec.offsetHeight;
    };
    measure();
    const t0 = setTimeout(measure, 700);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    /* pointer: tilts the ring and decides which card is hovered */
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
          s.target = null;
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

      /* fade the whole ring in / out with the scroll position (the skills section is pinned for a while) */
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
      }
      if (!shown) return;
      frontRef.current.style.setProperty("--vis", s.vis.toFixed(3));

      /* rotation */
      const auto = s.playing && !reduce && s.hover < 0 && s.pinned < 0 && !(s.drag && s.drag.active) && !document.hidden;
      s.speed += ((auto ? 1 : 0) - s.speed) * k(s.hover >= 0 ? 0.2 : 0.045);
      if (s.drag && s.drag.active) {
        /* angle follows the pointer (handled in onMove) */
      } else if (s.target != null) {
        s.angle += (s.target - s.angle) * k(0.07);
        if (Math.abs(s.target - s.angle) < 0.0008) {
          s.angle = s.target;
          s.target = null;
        }
      } else {
        s.angle += (s.omega + BASE_SPEED * s.speed * (1 + 0.3 * Math.sin(t * 0.45))) * dt;
        s.omega *= Math.pow(0.94, dt * 60);
        if (Math.abs(s.omega) < 0.01) s.omega = 0;
      }

      /* the ring's orientation wanders by itself, leans to the cursor and follows vertical drags */
      const live = reduce ? 0 : 1;
      const wantA = 0.32 + live * (0.1 * Math.sin(t * 0.31) + 0.05 * Math.sin(t * 0.83 + 1.1)) - s.py * 0.15 + s.dragTilt;
      const wantB = live * (0.12 * Math.sin(t * 0.23 + 0.7) + 0.06 * Math.sin(t * 0.61)) + s.px * 0.12;
      s.tiltA += (clamp(wantA, 0.1, 0.9) - s.tiltA) * k(0.05);
      s.tiltB += (wantB - s.tiltB) * k(0.05);
      if (!(s.drag && s.drag.active)) s.dragTilt *= Math.pow(0.94, dt * 60);
      const ca = Math.cos(s.tiltA);
      const sa = Math.sin(s.tiltA);
      const cb = Math.cos(s.tiltB);
      const sb = Math.sin(s.tiltB);

      /* geometry */
      const R = Math.min(w * 0.34, 440) * (0.8 + 0.2 * s.vis) * (1 + live * 0.03 * Math.sin(t * 0.4));
      const D = R * 3;
      const cx = w / 2;
      const cy = h * 0.52 + (1 - vin) * h * 0.1 - (1 - vout) * h * 0.08;

      // sizes used to keep an opened card fully on screen (mirrors the CSS)
      const narrow = w <= 900;
      const cwPx = narrow ? 108 : clamp(w * 0.104, 118, 150);
      const halfW = ((narrow ? 196 : cwPx * 1.45) * OPEN_SCALE) / 2 + 10;
      const halfH = ((narrow ? 330 : 380) * OPEN_SCALE) / 2;

      for (let i = 0; i < n; i++) {
        const want = i === s.hover || i === s.pinned ? 1 : 0;
        s.open[i] += (want - s.open[i]) * k(0.14);
        const o = s.open[i];
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
        let X = cx + x2 * persp;
        let Y = cy + y2 * persp;
        if (s.open[i] > 0.001) {
          const o2 = s.open[i];
          X = lerp(X, clamp(X, halfW, w - halfW), o2);
          const lo = 96 + halfH;
          const hi = h - 12 - halfH;
          Y = lerp(Y, lo <= hi ? clamp(Y, lo, hi) : h / 2, o2);
        }
        const depth = clamp((z1 / R + 1.1) / 2.2, 0, 1); // 1 = nearest

        const sc = lerp(persp * 0.92, OPEN_SCALE, o);
        const turn = lerp(clamp((-x2 / R) * 16, -18, 18), 0, o);
        const op = lerp(0.5 + 0.5 * depth, 1, o) * s.vis;
        const tf = `translate3d(${X.toFixed(2)}px,${Y.toFixed(2)}px,0) translate(-50%,-50%) perspective(900px) rotateY(${turn.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
        const z = Math.round(depth * 30) + (o > 0.05 ? 40 : 0);
        const tt = lerp(depth, 1, o).toFixed(3);

        // which twin is drawn: near side → front layer, far side → back layer (an opened far card jumps to the front)
        const mode = z1 >= 0 ? 1 : o > 0.02 ? 2 : 0;
        const bk = backEls[i];
        const fr = frontEls[i];
        if (mode !== s.mode[i]) {
          s.mode[i] = mode;
          bk.style.display = mode === 1 ? "none" : "block";
          fr.style.display = mode === 0 ? "none" : "block";
          fr.style.pointerEvents = mode === 2 ? "none" : "";
        }
        if (mode === 1) {
          place(fr, tf, op.toFixed(3), z, tt);
        } else if (mode === 0) {
          place(bk, tf, op.toFixed(3), z, tt);
        } else {
          place(fr, tf, op.toFixed(3), z, tt);
          place(bk, tf, "0", z, tt); // invisible, but keeps the hover area where the card is
        }
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t0);
      clearTimeout(s.leaveT);
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
    if (e.target.closest?.(".ring-ctl")) return;
    s.drag = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, lastT: performance.now(), v: 0, active: false };
    s.dragged = false;
  };

  const onKey = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(-1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "Escape") setPinned(-1);
  };

  const isOpen = (i) => hover === i || pinned === i;

  return (
    <>
      <div
        ref={dragRef}
        className="ring-drag"
        onPointerDown={onPointerDown}
        onClick={() => !s.dragged && setPinned(-1)}
      />

      <div
        ref={backRef}
        className="ring-layer back"
        aria-hidden="true"
        onPointerDown={onPointerDown}
      >
        {cards.map((c, i) => (
          <CardView key={c.id} c={c} i={i} layer="back" open={isOpen(i)} onSelect={select} />
        ))}
      </div>

      <div
        ref={frontRef}
        className="ring-layer front"
        role="group"
        aria-roledescription="carousel"
        aria-label="Skills carousel. Drag, or use the arrow keys, to rotate."
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
      >
        {cards.map((c, i) => (
          <CardView key={c.id} c={c} i={i} layer="front" open={isOpen(i)} onSelect={select} />
        ))}

        <div className="ring-ctl">
          <button type="button" onClick={() => nudge(1)} aria-label="Previous skill">←</button>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause rotation" : "Start rotation"} aria-pressed={!playing}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button type="button" onClick={() => nudge(-1)} aria-label="Next skill">→</button>
          <span className="mono hint">Drag to rotate · hover or tap a card</span>
        </div>

        {also.length > 0 && (
          <p className="skills-also">
            <span className="mono">Also in my toolkit</span>
            {also.join(" · ")}
          </p>
        )}
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
