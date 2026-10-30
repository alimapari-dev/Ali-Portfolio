"use client";

import { useEffect, useRef, useState } from "react";
import { LiquidNavbar, NimbusIcons } from "@/components/ui/liquid-glass-navbar";
import { NAV, STAGES, stagePosition, sectionTops } from "@/lib/poses";

const I = (d) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);
const ICONS = {
  skills: I(<><path d="m8.5 8-4.5 4 4.5 4" /><path d="m15.5 8 4.5 4-4.5 4" /><path d="m13.5 5.5-3 13" /></>),
  contact: NimbusIcons.plane,
};
const NAV_ITEMS = [
  { label: "Home", href: "#home", icon: NimbusIcons.home, fx: "glow" },
  { label: "Skills & Projects", href: "#skills", icon: ICONS.skills, fx: "pop" },
  { label: "About", href: "#about", icon: NimbusIcons.user, fx: "wave" },
  { label: "Contact", href: "#contact", icon: ICONS.contact, fx: "plane" },
];

function LogoMark() {
  return (
    <svg className="logo-mark" width="27" height="27" viewBox="0 0 27 27" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="3" y1="4" x2="22" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#00a8ff" />
          <stop offset=".55" stopColor="#1f5cff" />
          <stop offset="1" stopColor="#5a3dff" />
        </linearGradient>
      </defs>
      <path d="M21.5 4.5H9A5.5 5.5 0 0 0 3.5 10v7A5.5 5.5 0 0 0 9 22.5h12.5" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1.7" fill="currentColor" />
      <circle cx="16.5" cy="13.5" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Liquid-glass nav pill, theme toggle, right rail and scroll progress. */
export default function Chrome() {
  const [sec, setSec] = useState(0);
  const [lock, setLock] = useState(null);
  const [theme, setTheme] = useState("light");
  const topsRef = useRef([]);
  const progRef = useRef(null);
  const lockTimer = useRef(0);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-anim"); // lets every colour fade instead of snapping
    root.dataset.theme = next;
    setTimeout(() => root.classList.remove("theme-anim"), 700);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  useEffect(() => {
    const measure = () => (topsRef.current = sectionTops());
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progRef.current?.style.setProperty("--prog", max > 0 ? String(Math.min(1, y / max)) : "0");
      const pos = stagePosition(topsRef.current, y);
      setSec(Math.min(STAGES.length - 1, Math.round(pos)));
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 600);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const stage = STAGES[sec];
  const scrollActive = Math.max(0, NAV.findIndex((n) => n.ids.includes(stage.id)));
  const active = lock ?? scrollActive;
  const activeDot = Math.round((stage.railPos / 62) * 13);

  // while a click-scroll is travelling, keep the water drop on the target item
  const onNavChange = (i) => {
    setLock(i);
    clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => setLock(null), 1900);
  };

  return (
    <>
      <div className="progress" ref={progRef} aria-hidden="true" />

      <header className="nav">
        <a href="#home" className="logo" aria-label="Ali Mapari, home">
          <LogoMark />
          <span>ALI MAPARI</span>
        </a>

        <div className="nav-pill">
          <LiquidNavbar
            items={NAV_ITEMS}
            active={active}
            onChange={onNavChange}
            tone={theme === "dark" ? "dark" : "light"}
            style={{ "--n-fg": "var(--ink)", "--n-fg-soft": "var(--dim)" }}
          />
        </div>

        <div className="nav-end">
          <button
            type="button"
            className="theme-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={theme === "dark"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
            </svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
            </svg>
          </button>
        </div>
      </header>

      <aside className="rail" aria-hidden="true">
        <div className="rail-dots">
          {Array.from({ length: 14 }).map((_, i) => (
            <i key={i} className={i === activeDot ? "on" : ""} />
          ))}
          <div className="rail-label" style={{ top: `${stage.railPos}%` }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" />
              <path d="M7 7 10 3.6" stroke="currentColor" strokeLinecap="round" />
              <circle cx="7" cy="7" r="1" fill="currentColor" />
            </svg>
            <span>{stage.rail}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
