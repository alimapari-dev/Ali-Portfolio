import { projects } from "@/lib/content";

const Chips = ({ items }) => (
  <ul className="chips">{items.map((f) => <li key={f}>{f}</li>)}</ul>
);

function Project({ p }) {
  return (
    <article data-card className="card proj" aria-labelledby={`p-${p.no}`}>
      <p className="mono kicker">Project {p.no} · {p.category}</p>
      <h3 id={`p-${p.no}`}>{p.name}</h3>
      <p className="body">{p.purpose}</p>
      <h4 className="mono sub-h">{p.focusTitle}</h4>
      {p.no === "02" ? (
        <Chips items={p.focus} />
      ) : (
        <ul className="ticks">{p.focus.map((f) => <li key={f}>{f}</li>)}</ul>
      )}
      {p.direction && (
        <>
          <h4 className="mono sub-h">Design direction</h4>
          <p className="body small">{p.direction}</p>
        </>
      )}
      {p.extra && (
        <>
          <h4 className="mono sub-h">{p.extraTitle}</h4>
          <Chips items={p.extra} />
        </>
      )}
      {p.stack?.length > 0 && (
        <>
          <h4 className="mono sub-h">Stack</h4>
          <Chips items={p.stack} />
        </>
      )}
      {(p.liveUrl || p.repoUrl) && (
        <p className="links mono">
          {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">Live ↗</a>}
          {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">Code ↗</a>}
        </p>
      )}
    </article>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="sec" data-sec aria-label="Projects">
      <h2 className="ptitle rv d2">
        <span className="ob">Projects</span> <span className="l2">Two builds</span>
      </h2>
      <div className="lane l wide"><Project p={projects[0]} /></div>
      <div className="lane r wide"><Project p={projects[1]} /></div>
    </section>
  );
}
