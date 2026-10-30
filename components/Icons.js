import { FaEnvelope, FaGithub, FaLinkedinIn, FaPhone, FaWhatsapp } from "react-icons/fa6";

const map = {
  email: FaEnvelope,
  github: FaGithub,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  phone: FaPhone,
};

export default function ContactIcon({ id }) {
  const Icon = map[id];
  return Icon ? <Icon aria-hidden="true" focusable="false" /> : null;
}
