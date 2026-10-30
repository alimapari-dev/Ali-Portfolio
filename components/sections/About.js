import Corners from "@/components/Corners";
import { aboutIntro, education, interests, direction, profile } from "@/lib/content";

export function About() {
  return (
    <section id="about" className="sec" data-sec aria-labelledby="about-h">
      <div className="sec-head rv d1">
        <span className="tag mono"><Corners />About <b>03</b></span>
        <span className="note mono">{profile.title}</span>
      </div>
      <div className="lane l wide">
        <div data-card className="card prose">
          <h3 className="mono card-h">Introduction</h3>
          {aboutIntro.map((p) => <p key={p}>{p}</p>)}
        </div>
      </div>
      <div className="lane r wide">
        <div data-card className="card">
          <h3 className="mono card-h">Education</h3>
          <ol className="timeline">
            {education.map((e) => (
              <li key={e.title}>
                <time className="mono">{e.period}</time>
                <div>
                  <strong>{e.title}</strong>
                  <span>{e.place}</span>
                  {e.note && <em className="mono">{e.note}</em>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <h2 id="about-h" className="ptitle rv d4">
        <span className="dots mono" aria-hidden="true">··</span>
        <span className="ob">About</span>
        <span className="l2">Ali Mapari</span>
      </h2>
    </section>
  );
}

export function Direction() {
  return (
    <section id="direction" className="sec" data-sec aria-label="Learning journey and direction">
      <div className="sec-head rv d1">
        <span className="tag mono"><Corners />Direction <b>04</b></span>
        <span className="note mono">Learning journey</span>
      </div>
      <div className="lane l wide">
        <div data-card className="card">
          <blockquote className="quote">{direction.quote}</blockquote>
          <p className="quote-follow">{direction.follow}</p>
        </div>
      </div>
      <div className="lane r wide">
        <div data-card className="card">
          <h3 className="mono card-h">Interests</h3>
          <ul className="chips">{interests.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
