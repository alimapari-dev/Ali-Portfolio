# Ali Mapari · Portfolio

A four-page portfolio built with **Next.js** (App Router) and **three.js 0.160**.
A white-ceramic robot, generated entirely in code, stays fixed behind every page and
reacts to scrolling, page changes and the mouse. There are no images or videos.

It is a **single-page site**: one long scroll with six sections (Home, Skills, Projects,
About, Direction, Contact). The nav links, menu and rail scroll smoothly to each section, and the
robot changes pose and face as you move through them.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Requires Node 20.9 or newer.

## 1. Your contact details

They are already filled in, in **`lib/site.js`**:

```js
export const contact = {
  email: "alimapari12345@gmail.com",
  github: "https://github.com/alimapari-dev",
  linkedin: "https://www.linkedin.com/in/alimapari",
  phone: "+91 75065 65137",
  whatsapp: "+91 75065 65137", // or a full https://wa.me/... link
  location: "Mumbai",
  locationUrl: "https://maps.app.goo.gl/7mJNhztLnREzzQeMA",
};
```

The Contact section shows **six separate boxes**, each one a link with its own icon and an arrow:
Location ("Located in Mumbai", opens Google Maps in a new tab, with a pulsing arrow so visitors see
it is a map link), Email (`mailto:`), Call (`tel:`), WhatsApp (`https://wa.me/…`), LinkedIn and GitHub.
The phone number was given without a country code, so `+91` (India) is used for the call and WhatsApp
links. Change `phone` / `whatsapp` if that is not right. The footer icons and its "Connect" column read
the same values.

Anything set to `""` shows as **"To be added"** and is not clickable, so no broken links are published.
The box styles are `.cbox` in `app/pages.css`; the boxes shrink their text to keep email and profile
links on one line, and the arrow moves to the top-right corner on narrower laptop screens.

## 2. Edit content

All copy lives in **`lib/content.js`**: skills, projects, education, about text.
Only the information from the portfolio brief is included. Each project also accepts
optional `stack: []`, `liveUrl` and `repoUrl` fields. They render only when filled,
so add them once they are verified.

### Skills ring

In the Skills section the robot moves to the right side of the screen (centred on phones) and a small ring of
glass cards orbits him (`components/SkillsRing.js`). The ring is centred on wherever the robot is on screen and sized
from the robot, so the cards stay close to him; cards on the far side pass *behind* him, cards on the near side
in front. No orbit line is drawn, and the ring's tilt keeps drifting, leans towards the cursor and follows drags.
There are no buttons: it is moved by hand only — drag it with the mouse or swipe it with a finger, and it keeps
a little momentum.

On the left, a deck of detail cards shuffles through every skill by itself (about every 3.8 s, with a thin
progress line). It stays hidden until you actually reach the Skills section, then slides in from the left
(the cards arrive one after another) and stays fixed in place, levelled with the robot: the deck and the
"Also in my toolkit" line below it are centred on his middle. It slides out again when you scroll past.
Hover a ring card and that skill's details come to the front straight away and the deck waits; on a touch screen,
tap a card (the details stay for about 7 s). Hovering the deck also pauses it.

Tuning: `RING_UNITS` (how far the cards sit from the robot) and `SHUFFLE_MS` at the top of `SkillsRing.js`,
`RING_Y` / `MID_Y` in `RobotStage.js` (height the ring is centred on / the robot's middle that the deck is levelled with), the `skills` pose in `lib/poses.js` (`sx` = how far
right the robot stands), and the `.sk-card` / `.sk-slide` rules in `app/pages.css` for sizes.
The skills are defined in `skillCards` in `lib/content.js` (title, category, blurb, related chips); their icons live in
`public/skills/` (open-source Devicon SVGs, plus a simple project-management icon).

### The robot reacts to you

`components/RobotStage.js` makes the head, body and eyes follow the cursor (or your finger on a touch
screen), keeps looking at the last position for ~10 s and then glances around by itself. It blinks, and every
few seconds switches to another expression (happy, wink, surprised, curious, heart, sleepy), and a click or
tap makes it react and nod. The expressions are drawn in `components/robot.js` (`drawFace`).

### Footer

The page ends with the beam-wordmark footer (`components/ui/beam-wordmark-footer.tsx`, used through
`components/SiteFooter.js`): "Ali Mapari" as a giant wordmark whose letters rise in, catch a moving beam of
light, lift on hover and hop when clicked. It follows the light / dark theme. Its social icons, the
"Connect" column and the contact links come from `lib/site.js` — anything still empty there is shown dimmed
(icons) or left out (links) until you add it. Navigation links and credit lines are edited in
`components/SiteFooter.js`. No extra packages are needed.

## 3. How the robot is staged

`lib/poses.js` (`STAGES`) maps every section to a camera pose and a face
(`eyes`, `quote`, `smile`). Add or tweak poses there. The robot itself is built in
`components/robot.js`, and `components/RobotStage.js` runs the scene.

## Structure

```
app/                 layout, single page, global + page CSS
  sections/ (in components/) Skills, Projects, About, Contact
components/
  RobotStage.js      fixed WebGL canvas, scroll/route/pointer motion
  robot.js           robot geometry, materials, canvas face
  Chrome.js          top bar, nav, right rail, full-screen menu
  Typer.js           auto-typing prompt box
  Reveal.js          section reveal on scroll
  Icons.js           contact icons (react-icons)
lib/                 site.js (contact), content.js (copy), poses.js
```

## Components

`components/ui/` holds two self-contained components (React + their own scoped CSS, no Tailwind needed):
`liquid-glass-navbar.tsx` (the water-drop nav pill) and `halftone-wordmark-footer.tsx` (the dotted "Ali Mapari"
name; lightly patched to allow a transparent background and a slightly larger descender allowance).
The project uses TypeScript for these two files and plain JS elsewhere. Smooth scrolling is done with `lenis`.

## Theme

White / electric blue / black. A sun/moon button in the nav switches light and dark mode (saved in the
browser, defaults to the system setting). All colours are CSS variables at the top of `app/globals.css`.

## Notes

- Fonts (IBM Plex Mono, Schibsted Grotesk) are bundled through Fontsource, so no
  network call to Google Fonts is needed.
- Respects `prefers-reduced-motion` (no typing, blinking, idle sway or reveal motion).
- If WebGL is unavailable the page still works without the robot.
- Deploys as-is to Vercel, Netlify or any Node host.
