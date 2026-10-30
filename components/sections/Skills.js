import Corners from "@/components/Corners";
import { skillGroups } from "@/lib/content";

const Group = ({ g }) => (
  <section data-card className="card" aria-label={g.title}>
    <h3 className="mono card-h">{g.title}</h3>
    <ul className="chips">
      {g.items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  </section>
);

export default function Skills() {
  return (
    <section id="skills" className="sec" data-sec aria-labelledby="skills-h">
      <div className="sec-head rv d1">
        <span className="tag mono"><Corners />Skills <b>01</b></span>
        <span className="note mono">Tools and areas I&apos;m actively building</span>
      </div>
      <div className="lane l">
        {skillGroups.slice(0, 2).map((g) => <Group key={g.title} g={g} />)}
      </div>
      <div className="lane r">
        {skillGroups.slice(2).map((g) => <Group key={g.title} g={g} />)}
      </div>
      <h2 id="skills-h" className="ptitle rv d4">
        <span className="dots mono" aria-hidden="true">··</span>
        <span className="ob">Skills</span>
        <span className="l2">&amp; Projects</span>
      </h2>
    </section>
  );
}
