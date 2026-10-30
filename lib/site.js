/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE to add your verified contact details.
 *  Leave a value as an empty string ("") until you have it.
 *  Anything left empty is shown on the Contact page as
 *  "To be added" and is NOT clickable, so no broken links ship.
 * ─────────────────────────────────────────────────────────────
 *
 *  email     →  "name@example.com"
 *  github    →  "https://github.com/your-username"
 *  linkedin  →  "https://www.linkedin.com/in/your-handle"
 *  phone     →  "+91 90000 00000"   (clickable via a tel: link)
 *  whatsapp  →  "+91 90000 00000"   or a full "https://wa.me/..." link
 */
export const contact = {
  email: "",
  github: "",
  linkedin: "",
  phone: "",
  whatsapp: "",
};

export const site = {
  name: "Ali Mapari",
  title: "AI & Data Science Student · Developer",
  description:
    "Portfolio of Ali Mapari, a first-year B.Voc student in AI & Data Science building practical web projects.",
};

const digits = (v) => v.replace(/[^\d+]/g, "");

/** Turns the raw values above into ready-to-render link objects. */
export function getContactLinks() {
  const wa = contact.whatsapp.trim();
  const waHref = !wa
    ? ""
    : /^https?:\/\//i.test(wa)
      ? wa
      : `https://wa.me/${digits(wa).replace("+", "")}`;

  return [
    {
      id: "email",
      label: "Email",
      value: contact.email.trim(),
      href: contact.email.trim() ? `mailto:${contact.email.trim()}` : "",
      external: false,
    },
    {
      id: "github",
      label: "GitHub",
      value: contact.github.trim().replace(/^https?:\/\/(www\.)?/i, ""),
      href: contact.github.trim(),
      external: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: contact.linkedin.trim().replace(/^https?:\/\/(www\.)?/i, ""),
      href: contact.linkedin.trim(),
      external: true,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      value: wa && !/^https?:\/\//i.test(wa) ? wa : wa ? "Chat on WhatsApp" : "",
      href: waHref,
      external: true,
    },
    {
      id: "phone",
      label: "Phone",
      value: contact.phone.trim(),
      href: contact.phone.trim() ? `tel:${digits(contact.phone.trim())}` : "",
      external: false,
    },
  ];
}
