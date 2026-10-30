"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * - `[data-sec]`  : gets `.in` once, the first time it is 15 % visible (fades in `.rv` blocks).
 * - `[data-card]` : gets `.in` every time it scrolls into view and loses it when it leaves,
 *                   so the glass cards animate in on the way down and again on the way back up.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const secs = document.querySelectorAll("[data-sec]");
    const cards = document.querySelectorAll("[data-card]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // stagger: left lane first, right lane slightly after, then by position in the lane
    cards.forEach((c) => {
      const lane = c.closest(".lane");
      const idx = lane ? [...lane.querySelectorAll("[data-card]")].indexOf(c) : 0;
      const side = lane?.classList.contains("r") ? 0.12 : 0;
      c.style.setProperty("--cd", `${(idx * 0.14 + side).toFixed(2)}s`);
      c.querySelectorAll(".chips li").forEach((li, k) => li.style.setProperty("--k", k));
    });

    if (!("IntersectionObserver" in window) || reduce) {
      secs.forEach((s) => s.classList.add("in"));
      cards.forEach((c) => c.classList.add("in"));
      return;
    }

    const secIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            secIO.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    const cardIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    secs.forEach((s) => secIO.observe(s));
    cards.forEach((c) => cardIO.observe(c));
    return () => {
      secIO.disconnect();
      cardIO.disconnect();
    };
  }, [pathname]);

  return null;
}
