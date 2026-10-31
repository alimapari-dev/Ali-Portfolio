/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE to change your contact details.
 *  Leave a value as an empty string ("") to hide it: it is then
 *  shown as "To be added" and is NOT clickable, so no broken
 *  links ever ship.
 * ─────────────────────────────────────────────────────────────
 *
 *  email       →  "name@example.com"
 *  github      →  "https://github.com/your-username"
 *  linkedin    →  "https://www.linkedin.com/in/your-handle"   (https:// is added if you leave it out)
 *  phone       →  "+91 90000 00000"   (opens the dialler via a tel: link)
 *  whatsapp    →  "+91 90000 00000"   or a full "https://wa.me/..." link
 *  location    →  "Mumbai"            (shown as "Located in Mumbai")
 *  locationUrl →  the Google Maps share link the Location box opens
 */
export const contact = {
  email: "alimapari12345@gmail.com",
  github: "https://github.com/alimapari-dev",
  linkedin: "https://www.linkedin.com/in/alimapari",
  phone: "+91 75065 65137",
  whatsapp: "+91 75065 65137",
  location: "Mumbai",
  locationUrl: "https://maps.app.goo.gl/7mJNhztLnREzzQeMA",
};

export const site = {
  name: "Ali Mapari",
  title: "AI & Data Science Student · Developer",
  description:
    "Portfolio of Ali Mapari, a first-year B.Voc student in AI & Data Science building practical web projects.",
};

const digits = (v) => v.replace(/[^\d+]/g, "");
const withProtocol = (v) => (!v ? "" : /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, "")}`);
const bare = (v) => v.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

/** Turns the raw values above into ready-to-render link objects. */
export function getContactLinks() {
  const email = contact.email.trim();
  const github = withProtocol(contact.github.trim());
  const linkedin = withProtocol(contact.linkedin.trim());
  const phone = contact.phone.trim();
  const wa = contact.whatsapp.trim();
  const place = contact.location.trim();
  const mapUrl = withProtocol(contact.locationUrl.trim());
  const waHref = !wa ? "" : /^https?:\/\//i.test(wa) ? wa : `https://wa.me/${digits(wa).replace("+", "")}`;

  return [
    { id: "email", label: "Email", value: email, href: email ? `mailto:${email}` : "", external: false, hint: "Send me an email" },
    { id: "github", label: "GitHub", value: bare(github), href: github, external: true, hint: "See my code" },
    { id: "linkedin", label: "LinkedIn", value: bare(linkedin), href: linkedin, external: true, hint: "View my profile" },
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: wa && !/^https?:\/\//i.test(wa) ? wa : wa ? "Chat on WhatsApp" : "",
      href: waHref,
      external: true,
      hint: "Tap to chat",
    },
    { id: "phone", label: "Call", value: phone, href: phone ? `tel:${digits(phone)}` : "", external: false, hint: "Tap to call" },
    {
      id: "location",
      label: "Location",
      value: place ? `Located in ${place}` : "",
      href: place && mapUrl ? mapUrl : "",
      external: true,
      hint: "Open in Google Maps",
    },
  ];
}
