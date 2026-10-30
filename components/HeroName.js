"use client";

import { useEffect, useState } from "react";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";

const PALETTE = {
  light: { background: "transparent", ink: "#1f5cff", warm: "#00c2ff" },
  dark: { background: "transparent", ink: "#6aa0ff", warm: "#9fe9ff" },
};

/** "Ali Mapari" printed as an interactive halftone dot wordmark; follows the light/dark theme. */
export default function HeroName() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return (
    <HalftoneWordmarkFooter
      className="name-halftone"
      wordmark="Ali Mapari"
      label=""
      meta=""
      columns={[]}
      backToTop={false}
      palette={PALETTE[theme]}
      dotGap={4}
      radius={70}
      crop={-0.3}
      grain={0}
      fontFamily={'"Schibsted Grotesk Variable", "Schibsted Grotesk", "Inter", "Helvetica Neue", Arial, system-ui, sans-serif'}
      fontWeight={700}
      monoFamily={'"IBM Plex Mono", ui-monospace, monospace'}
      height="clamp(96px, 7.6vw, 150px)"
    />
  );
}
