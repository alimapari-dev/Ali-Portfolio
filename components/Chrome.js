"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, STAGES, stagePosition, sectionTops } from "@/lib/poses";

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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
      <path
        d="M21.5 4.5H9A5.5 5.5 0 0 0 3.5 10v7A5.5 5.5 0 0 0 9 22.5h12.5"
        stroke="url(#lg)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="13.5" r="1.7" fill="currentColor" />
      <circle cx="16.5" cy="13.5" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Top bar, nav, right rail and the full-screen menu. */
export default function Chrome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [barClosed, setBarClosed] = useState(false);
  const [sec, setSec] = useState(0);
  const topsRef = useRef([]);
  const progRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const firstLink = useRef(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  useEffect(() => {
    document.documentElement.classList.toggle("bar-closed", barClosed);
  }, [barClosed]);

  useEffect(() => {
    const measure = () => (topsRef.current = sectionTops());
    const onScroll = () => {
      const y = window.scrollY;
      document.documentElement.classList.toggle("is-scrolled", y > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progRef.current?.style.setProperty("--prog", max > 0 ? String(Math.min(1, y / max)) : "0");
      // a section is "current" once it is more than half visible
      const pos = stagePosition(topsRef.current, y + window.innerHeight * 0.0);
      setSec(Math.min(STAGES.length - 1, Math.round(pos)));
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 600); // after fonts/layout settle
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;
    firstLink.current?.focus();
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const stage = STAGES[sec];
  const activeDot = Math.round((stage.railPos / 62) * 13);
  const isActive = (item) => item.ids.includes(stage.id);

  return (
    <>
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="topbar">
        <a href="#about">
          <b>Now:</b> First-year B.Voc in AI &amp; Data Science · 2026–2029 ↗
        </a>
        <button type="button" className="topbar-x" aria-label="Dismiss announcement" onClick={() => setBarClosed(true)}>
          ×
        </button>
      </div>

      <header className="nav">
        <a href="#home" className="logo" aria-label="Ali Mapari, home">
          <LogoMark />
          <span>ALI MAPARI</span>
        </a>
        <nav className="menu" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} aria-current={isActive(item) ? "page" : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <a href="#projects" className="pad">
          Projects ↗
        </a>
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
          <a href="#contact" className="btn desk-only">
            <span aria-hidden="true">••</span> Get in touch
          </a>
          <button
            type="button"
            className="btn mob-only"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span aria-hidden="true">≡</span> {menuOpen ? "Close" : "Menu"}
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
      <button type="button" className="rail-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
        ≡ Menu
      </button>

      <div id="site-menu" className="overlay" inert={!menuOpen} data-open={menuOpen}>
        <nav aria-label="Site menu">
          {NAV.map((item, i) => (
            <a key={item.href} href={item.href} ref={i === 0 ? firstLink : undefined} onClick={() => setMenuOpen(false)}>
              <small>0{i + 1}</small>
              {item.label}
            </a>
          ))}
        </nav>
        <button type="button" className="overlay-x" onClick={() => setMenuOpen(false)}>
          × Close
        </button>
      </div>
    </>
  );
}
