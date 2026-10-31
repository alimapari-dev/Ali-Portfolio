import ContactIcon from "@/components/Icons";
import { getContactLinks } from "@/lib/site";

/** One contact method = one glass box. The whole box is the link. */
function Box({ link }) {
  const body = (
    <>
      <span className="ic"><ContactIcon id={link.id} /></span>
      <span className="txt">
        <small className="mono">{link.label}</small>
        <span className="v">{link.href ? link.value : "To be added"}</span>
        {link.href && link.hint ? <span className="hint">{link.hint}</span> : null}
      </span>
      {link.href ? <span className="go" aria-hidden="true">↗</span> : null}
    </>
  );
  const cls = `card cbox${link.id === "location" ? " loc" : ""}`;
  if (!link.href) {
    return <div data-card className={`${cls} off`} aria-disabled="true">{body}</div>;
  }
  return (
    <a
      data-card
      className={cls}
      href={link.href}
      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={`${link.label}: ${link.value}${link.external ? " (opens in a new tab)" : ""}`}
    >
      {body}
    </a>
  );
}

export default function Contact() {
  const byId = Object.fromEntries(getContactLinks().map((l) => [l.id, l]));
  const left = ["location", "email", "phone"].map((id) => byId[id]);
  const right = ["whatsapp", "linkedin", "github"].map((id) => byId[id]);
  return (
    <section id="contact" className="sec contact" data-sec aria-labelledby="contact-h">
      <h2 id="contact-h" className="ptitle rv d2">
        <span className="ob">Contact</span> <span className="l2">Ali Mapari</span>
      </h2>
      <ul className="lane l wide">
        {left.map((l) => <li key={l.id}><Box link={l} /></li>)}
      </ul>
      <ul className="lane r wide">
        {right.map((l) => <li key={l.id}><Box link={l} /></li>)}
      </ul>
    </section>
  );
}
