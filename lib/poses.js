/**
 * Camera + robot poses, and which pose/face each section of the page uses.
 * z / y = camera, look = look-at height, body = body yaw,
 * hy / hp / hr = head yaw / pitch / roll.
 */
export const POSES = {
  // ml = how far (fraction of the screen height) the robot is lifted on phones, where content sits below him
  // sx = how far (fraction of the screen width) he is moved to the right on desktop
  intro: { z: 11.6, y: 1.1, look: 0.55, body: -0.42, hy: -0.6, hp: 0.16, hr: 0.22, ml: 0.07 },
  // robot stands on the right of the screen (centred on phones) while the skills ring orbits around him
  skills: { z: 11.2, y: 1.1, look: 0.55, body: -0.32, hy: -0.2, hp: 0.08, hr: 0.04, ml: 0.17, sx: 0.185 },
  close: { z: 6.9, y: 1.95, look: 1.72, body: -0.2, hy: -0.06, hp: 0.04, hr: 0, ml: 0.2 },
  closeRight: { z: 7.8, y: 1.75, look: 1.4, body: -0.1, hy: 0.3, hp: 0.06, hr: -0.08, ml: 0.2 },
  closeLeft: { z: 7.4, y: 1.8, look: 1.5, body: -0.28, hy: -0.32, hp: 0.05, hr: 0.07, ml: 0.2 },
};

/** One entry per `<section data-sec>` on the page, in DOM order. */
export const STAGES = [
  { id: "home", pose: "intro", face: "eyes", rail: "HOME", railPos: 0 },
  { id: "skills", pose: "skills", face: "eyes", rail: "SKILLS", railPos: 12.4 },
  { id: "projects", pose: "closeRight", face: "eyes", rail: "PROJECTS", railPos: 24.8 },
  { id: "about", pose: "closeLeft", face: "eyes", rail: "ABOUT", railPos: 37.2 },
  { id: "direction", pose: "close", face: "quote", rail: "DIRECTION", railPos: 49.6 },
  { id: "contact", pose: "close", face: "smile", rail: "CONTACT", railPos: 62 },
];

/** Nav links; `ids` = sections that count as "current" for the link. */
export const NAV = [
  { href: "#home", label: "Home", ids: ["home"] },
  { href: "#skills", label: "Skills & Projects", ids: ["skills", "projects"] },
  { href: "#about", label: "About", ids: ["about", "direction"] },
  { href: "#contact", label: "Contact", ids: ["contact"] },
];

/**
 * Scroll position → fractional stage index (e.g. 1.4 = 40 % of the way from stage 1 to 2).
 * `holds[i]` = extra scroll distance (px) a section keeps its pose before the move to the next one starts
 * (used by the pinned skills section).
 */
export function stagePosition(tops, y, holds = []) {
  const n = tops.length;
  let i = 0;
  for (let k = 0; k < n; k++) if (y >= tops[k] - 1) i = k;
  if (i >= n - 1) return n - 1;
  const from = tops[i] + (holds[i] || 0);
  if (y <= from) return i;
  return i + (y - from) / Math.max(1, tops[i + 1] - from);
}

export function sectionTops() {
  return [...document.querySelectorAll("[data-sec]")].map((s) => s.getBoundingClientRect().top + window.scrollY);
}

/** Sections marked `data-pin` stay on screen for (height − viewport) px of scrolling. */
export function sectionHolds() {
  return [...document.querySelectorAll("[data-sec]")].map((s) =>
    s.hasAttribute("data-pin") ? Math.max(0, s.offsetHeight - window.innerHeight) : 0,
  );
}
