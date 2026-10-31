import SkillsRing from "@/components/SkillsRing";
import { skillCards, skillsAlso } from "@/lib/content";

/**
 * The ring itself lives in two fixed layers (one behind the robot, one in front), so this section is mostly
 * scroll runway: the robot stays centred and the ring stays on screen while it is scrolled through (`data-pin`).
 */
export default function Skills() {
  return (
    <section id="skills" className="sec skills-sec" data-sec data-pin aria-labelledby="skills-h">
      <h2 id="skills-h" className="ptitle rv d2">
        <span className="ob">Skills</span> <span className="l2">What I work with</span>
      </h2>
      <SkillsRing cards={skillCards} also={skillsAlso} />
    </section>
  );
}
