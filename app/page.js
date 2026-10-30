import Link from "next/link";
import Typer from "@/components/Typer";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import { About, Direction } from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { profile, heroPrompts, heroFocus } from "@/lib/content";

function Home() {
  return (
    <section id="home" className="sec home" data-sec>
      <div className="prompt rv d1">
        <div className="prompt-tab" aria-hidden="true">
          &gt;_
        </div>
        <Typer lines={heroPrompts} />
      </div>

      <div className="home-rule" aria-hidden="true" />
      <ul className="feat rv d2" aria-label="Areas of focus">
        {heroFocus.map((f) => (
          <li key={f.label} className={f.dim ? "dim" : ""}>
            {f.label}
          </li>
        ))}
      </ul>

      <div className="hl-wrap">
        <p className="eyebrow rv d1">{profile.title}</p>
        <h1 className="hl rv d2">
          <span className="hl-box hl-a">Ali</span> <span className="hl-box hl-b">Mapari</span>
        </h1>
      </div>

      <p className="sub rv d3">
        First-year B.Voc student in AI &amp; Data Science at {profile.institution}, building practical web projects.
      </p>

      <Link href="#skills" className="scroll rv d4">
        <i className="cb tl" />
        <i className="cb tr" />
        <i className="cb bl" />
        <i className="cb br" />
        <span>Work</span>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
          <path d="M6 1v11M1.5 8 6 12.5 10.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="bottom-rule" aria-hidden="true" />
    </section>
  );
}

export default function Page() {
  return (
    <>
      <Home />
      <Skills />
      <Projects />
      <About />
      <Direction />
      <Contact />
    </>
  );
}
