"use client";

import { useEffect, useState } from "react";

/**
 * Auto-typing prompt box.
 * 38 ms per character, hold 2.6 s, delete 2 chars / 14 ms, wait 250 ms, next line.
 * With reduced motion it shows the lines one after another without typing.
 */
export default function Typer({ lines }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;
    let cancelled = false;
    const line = lines[idx];

    if (reduce) {
      setText(line);
      timer = setTimeout(() => setIdx((i) => (i + 1) % lines.length), 5000);
      return () => clearTimeout(timer);
    }

    let n = 0;
    const type = () => {
      if (cancelled) return;
      n += 1;
      setText(line.slice(0, n));
      if (n < line.length) timer = setTimeout(type, 38);
      else timer = setTimeout(erase, 2600);
    };
    const erase = () => {
      if (cancelled) return;
      n = Math.max(0, n - 2);
      setText(line.slice(0, n));
      if (n > 0) timer = setTimeout(erase, 14);
      else timer = setTimeout(() => !cancelled && setIdx((i) => (i + 1) % lines.length), 250);
    };
    timer = setTimeout(type, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [idx, lines]);

  const next = lines[(idx + 1) % lines.length];

  return (
    <>
      <div className="prompt-box" aria-hidden="true">
        <i className="cb tl" />
        <i className="cb tr" />
        <i className="cb bl" />
        <i className="cb br" />
        <span>{text}</span>
        <span className="caret" />
      </div>
      <div className="prompt-next" aria-hidden="true">
        {next}
      </div>
      <p className="sr-only">{lines.join(" ")}</p>
    </>
  );
}
