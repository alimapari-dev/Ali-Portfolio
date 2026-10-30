import { aboutIntro, education, interests, direction, profile } from "@/lib/content";

export const metadata = {
  title: "About",
  description:
    "Ali Mapari is a first-year B.Voc student in AI & Data Science at Nexcore Institute of Technology.",
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

export default function AboutPage() {
  return (
    <>
      <section className="sec" data-sec aria-labelledby="about-h">
        <div className="sec-head rv d1">
          <span className="tag mono">
            <Corners />
            About <b>01</b>
          </span>
          <span className="note mono">{profile.title}</span>
        </div>

        <div className="lane l wide rv d2">
          <div className="card prose">
            <h2 className="mono card-h">Introduction</h2>
            {aboutIntro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <div className="lane r wide rv d3">
          <div className="card">
            <h2 className="mono card-h">Education</h2>
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

        <h1 id="about-h" className="ptitle rv d4">
          <span className="dots mono" aria-hidden="true">
            ··
          </span>
          <span className="ob">About</span>
          <span className="l2">Ali Mapari</span>
        </h1>
      </section>

      <section className="sec" data-sec aria-label="Learning journey and direction">
        <div className="sec-head rv d1">
          <span className="tag mono">
            <Corners />
            Direction <b>02</b>
          </span>
          <span className="note mono">Learning journey</span>
        </div>

        <div className="lane l wide rv d2">
          <blockquote className="quote">{direction.quote}</blockquote>
          <p className="quote-follow">{direction.follow}</p>
        </div>

        <div className="lane r wide rv d3">
          <div className="card">
            <h2 className="mono card-h">Interests</h2>
            <ul className="chips">
              {interests.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
