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

## 1. Add your contact details (do this first)

Open **`lib/site.js`** and fill in the `contact` object:

```js
export const contact = {
  email: "you@example.com",
  github: "https://github.com/your-username",
  linkedin: "https://www.linkedin.com/in/your-handle",
  phone: "+91 90000 00000",
  whatsapp: "+91 90000 00000", // or a full https://wa.me/... link
};
```

Anything left as `""` shows as **"To be added"** and is not clickable, so no broken
links are published. Filled values become live links automatically
(`mailto:`, `tel:`, `https://wa.me/…`).

## 2. Edit content

All copy lives in **`lib/content.js`**: skills, projects, education, about text.
Only the information from the portfolio brief is included. Each project also accepts
optional `stack: []`, `liveUrl` and `repoUrl` fields. They render only when filled,
so add them once they are verified.

### Skills ring

The Skills section is a free-floating ring of glass cards that orbits the robot, who stands in the
middle of the screen (`components/SkillsRing.js`). Cards on the far side of the ring pass *behind* the
robot, cards on the near side pass in front. No orbit line is drawn, and the ring's tilt keeps drifting,
leans towards the cursor and follows drags. Drag it, use the ← / → buttons or arrow keys, or pause it;
hovering a card opens it with a short description, and clicking pins it open beside the robot.
The section stays pinned on screen for a while (`data-pin`) before the page moves on.
The cards (HTML, CSS & Tailwind CSS, JavaScript, Python, Git & GitHub, Figma, Software Project
Management) are defined in `skillCards` in `lib/content.js`; their icons live in `public/skills/`
(open-source Devicon SVGs, plus a simple project-management icon).

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
