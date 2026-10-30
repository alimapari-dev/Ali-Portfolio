import "@fontsource/ibm-plex-mono/latin-300.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "@fontsource-variable/schibsted-grotesk/wght.css";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./pages.css";

import RobotStage from "@/components/RobotStage";
import Chrome from "@/components/Chrome";
import Reveal from "@/components/Reveal";
import SmoothScroll from "@/components/SmoothScroll";
import { site } from "@/lib/site";

export const metadata = {
  title: {
    default: `${site.name} · ${site.title}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.name} · ${site.title}`,
    description: site.description,
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f6fd" },
    { media: "(prefers-color-scheme: dark)", color: "#04060d" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <div className="grid" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <RobotStage />
        <Chrome />
        <Reveal />
        <SmoothScroll />
        <main id="main">{children}</main>
        <noscript>
          <style>{`.rv,.card[data-card]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
