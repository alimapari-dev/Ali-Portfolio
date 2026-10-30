import { skillGroups, projects } from "@/lib/content";

export const metadata = {
  title: "Skills & Projects",
  description: "Technical skills by category, plus Prime Video Clone and The Pasta Lane.",
};

function Corners() {
  return (
    <>
      <i className="cb tl" />
      <i className="cb tr" />
      <i className="cb bl" />
      <i className="cb br" />
    </>
  );
}

function Project({ p }) {
  return (
    <article className="card proj" aria-labelledby={`p-${p.no}`}>
      <p className="mono kicker">
        Project {p.no} · {p.category}
      </p>
      <h2 id={`p-${p.no}`}>{p.name}</h2>
      <p className="body">{p.purpose}</p>

      <h3 className="mono sub-h">{p.focusTitle}</h3>
      {p.no === "02" ? (
        <ul className="chips">
          {p.focus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : (
        <ul className="ticks">
          {p.focus.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {p.direction && (
        <>
          <h3 className="mono sub-h">Design direction</h3>
          <p className="body small">{p.direction}</p>
        </>
      )}
      {p.extra && (
        <>
          <h3 className="mono sub-h">{p.extraTitle}</h3>
          <ul className="chips">
            {p.extra.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {p.stack?.length > 0 && (
        <>
          <h3 className="mono sub-h">Stack</h3>
          <ul className="chips">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {(p.liveUrl || p.repoUrl) && (
        <p className="links mono">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">
              Live ↗
            </a>
          )}
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">
              Code ↗
            </a>
          )}
        </p>
      )}
    </article>
  );
}

export default function SkillsProjectsPage() {
  return (
    <>
      <section className="sec" data-sec aria-labelledby="skills-h">
        <div className="sec-head rv d1">
          <span className="tag mono">
            <Corners />
            Skills <b>01</b>
          </span>
          <span className="note mono">Tools and areas I'm actively building</span>
        </div>

        <div className="lane l rv d2">
          {skillGroups.slice(0, 2).map((g) => (
            <section key={g.title} className="card" aria-label={g.title}>
              <h2 className="mono card-h">{g.title}</h2>
              <ul className="chips">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="lane r rv d3">
          {skillGroups.slice(2).map((g) => (
            <section key={g.title} className="card" aria-label={g.title}>
              <h2 className="mono card-h">{g.title}</h2>
              <ul className="chips">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <h1 id="skills-h" className="ptitle rv d4">
          <span className="dots mono" aria-hidden="true">
            ··
          </span>
          <span className="ob">Skills</span>
          <span className="l2">&amp; Projects</span>
        </h1>
      </section>

      <section className="sec" data-sec aria-label="Projects">
        <div className="sec-head rv d1">
          <span className="tag mono">
            <Corners />
            Projects <b>02</b>
          </span>
          <span className="note mono">Two projects · frontend and design</span>
        </div>
        <div className="lane l wide rv d2">
          <Project p={projects[0]} />
        </div>
        <div className="lane r wide rv d3">
          <Project p={projects[1]} />
        </div>
      </section>
    </>
  );
}
