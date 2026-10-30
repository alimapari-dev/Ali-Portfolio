import HeroName from "@/components/HeroName";
import Typer from "@/components/Typer";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import { About, Direction } from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { profile, heroPrompts, heroFocus } from "@/lib/content";

function Home() {
  return (
    <section id="home" className="sec home" data-sec>
      <div className="home-left">
        <p className="eyebrow rv d1">{profile.title}</p>
        <h1 className="hero-name rv d2">
          <HeroName />
        </h1>
        <p className="sub rv d3">
          First-year B.Voc student in AI &amp; Data Science at {profile.institution}, building practical web projects.
        </p>
        <div className="cta rv d4">
          <a href="#skills" className="btn solid">
            View work <span aria-hidden="true">↓</span>
          </a>
          <a href="#contact" className="btn">
            Contact
          </a>
        </div>
      </div>

      <div className="home-right">
        <div className="prompt rv d2">
          <div className="prompt-tab" aria-hidden="true">
            &gt;_
          </div>
          <Typer lines={heroPrompts} />
        </div>
        <ul className="feat rv d3" aria-label="Areas of focus">
          {heroFocus.map((f) => (
            <li key={f.label} className={f.dim ? "dim" : ""}>
              {f.label}
            </li>
          ))}
        </ul>
      </div>
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
