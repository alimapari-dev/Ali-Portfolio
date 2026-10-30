import Corners from "@/components/Corners";
import ContactIcon from "@/components/Icons";
import { getContactLinks } from "@/lib/site";

function Row({ link }) {
  const body = (
    <>
      <span className="ic"><ContactIcon id={link.id} /></span>
      <span className="txt">
        <small className="mono">{link.label}</small>
        <span className="v">{link.href ? link.value : "To be added"}</span>
      </span>
    </>
  );
  if (!link.href) {
    return <li><div className="crow off" aria-disabled="true">{body}</div></li>;
  }
  return (
    <li>
      <a
        className="crow"
        href={link.href}
        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={`${link.label}: ${link.value}`}
      >
        {body}
        <span className="go" aria-hidden="true">↗</span>
      </a>
    </li>
  );
}

export default function Contact() {
  const links = getContactLinks();
  const left = links.filter((l) => ["email", "github", "linkedin"].includes(l.id));
  const right = links.filter((l) => ["whatsapp", "phone"].includes(l.id));
  return (
    <section id="contact" className="sec contact" data-sec aria-labelledby="contact-h">
      <div className="sec-head rv d1">
        <span className="tag mono"><Corners />Contact <b>05</b></span>
        <span className="note mono">Ali Mapari</span>
      </div>
      <div className="lane l wide">
        <ul data-card className="clist card">{left.map((l) => <Row key={l.id} link={l} />)}</ul>
      </div>
      <div className="lane r wide">
        <ul data-card className="clist card">{right.map((l) => <Row key={l.id} link={l} />)}</ul>
      </div>
      <h2 id="contact-h" className="ptitle rv d4">
        <span className="dots mono" aria-hidden="true">··</span>
        <span className="ob">Contact</span>
        <span className="l2">Ali Mapari</span>
      </h2>
      <p className="foot mono">Ali Mapari · 2026</p>
    </section>
  );
}
