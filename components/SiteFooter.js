"use client";

import { useEffect, useState } from "react";
import BeamWordmarkFooter from "@/components/ui/beam-wordmark-footer";
import { getContactLinks, site } from "@/lib/site";

/* 24×24 icon nodes for the two socials the footer component does not ship with (outline style, lucide-like) */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
const MAIL = (
  <g {...line}>
    <rect width="18" height="14" x="3" y="5" rx="2.5" />
    <path d="m3.8 7.6 7.2 4.9a1.7 1.7 0 0 0 2 0l7.2-4.9" />
  </g>
);
const CHAT = <path {...line} d="M7.9 20A9 9 0 1 0 4 16.1L2.6 21.4Z" />;
const ICON = { email: MAIL, github: "github", linkedin: "linkedin", whatsapp: CHAT };

/* the footer follows the site's light / dark theme */
const PALETTE = {
  light: { background: "#f3f6fd", ink: "#0a0f1e", muted: "#4d5875", accent: "#1f5cff", wordTop: "#1f5cff", wordFoot: "#c9d8ff" },
  dark: { background: "#04060d", ink: "#f1f5ff", muted: "#8f9ab8", accent: "#5b95ff", wordTop: "#2f5fe0", wordFoot: "#0a1230" },
};

const EXPLORE = [
  { label: "Home", href: "#home" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Direction", href: "#direction" },
  { label: "Contact", href: "#contact" },
];

export default function SiteFooter() {
  const [theme, setTheme] = useState("light");
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    read();
    setYear(new Date().getFullYear());
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const links = getContactLinks();

  // Icons are always shown; the ones without a verified link yet are dimmed and not clickable.
  const socials = links
    .filter((l) => ICON[l.id])
    .map((l) => ({
      label: l.href ? l.label : `${l.label} · to be added`,
      href: l.href || undefined,
      icon: ICON[l.id],
    }));

  const connect = links.filter((l) => l.href).map((l) => ({ label: l.label, href: l.href }));

  return (
    <BeamWordmarkFooter
      className="site-foot"
      brand={site.name}
      wordmark={site.name}
      company={site.name}
      year={year}
      socials={socials}
      credits={[
        { label: site.title },
        { lead: "B.Voc in AI & Data Science, ", label: "Nexcore Institute of Technology (NIT)", tail: " · 2026–2029" },
      ]}
      columns={[
        { title: "Explore", links: EXPLORE },
        { title: "Connect", links: connect.length ? connect : [{ label: "Contact details", href: "#contact" }] },
      ]}
      fontSans="var(--sans)"
      wordWeight={700}
      {...PALETTE[theme]}
    />
  );
}
