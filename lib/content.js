/**
 * All portfolio copy lives here. Only verified information from the
 * portfolio brief is used: no invented experience, awards or outcomes.
 */

export const profile = {
  name: "Ali Mapari",
  title: "AI & Data Science Student · Developer",
  institution: "Nexcore Institute of Technology (NIT)",
  summary:
    "An aspiring developer exploring artificial intelligence, machine learning, data science, software engineering, and modern web development. Focused on strengthening programming fundamentals and building practical projects.",
};

/** Lines typed out in the hero prompt box. Each one comes from the stated interests. */
export const heroPrompts = [
  "Exploring artificial intelligence and machine learning.",
  "Learning data science with Python.",
  "Building responsive interfaces with React and Next.js.",
  "Studying software engineering and project management.",
];

export const heroFocus = [
  { label: "Artificial Intelligence", dim: false },
  { label: "Data Science", dim: false },
  { label: "Web Development", dim: false },
  { label: "Software Engineering", dim: true },
];

export const skillGroups = [
  {
    title: "Web Development",
    items: ["HTML", "CSS", "Tailwind CSS", "JavaScript", "React", "Next.js"],
  },
  {
    title: "Programming & Tools",
    items: ["Python", "Git", "GitHub"],
  },
  {
    title: "Design & Prototyping",
    items: [
      "Figma",
      "UI implementation",
      "Responsive layouts",
      "Interactive interface design",
    ],
  },
  {
    title: "Additional Knowledge",
    items: [
      "SDLC",
      "Software Project Management",
      "Requirements & system design",
      "WordPress",
    ],
  },
];

/**
 * Optional fields: add `stack`, `liveUrl` or `repoUrl` to a project once they
 * are verified. They are only rendered when present.
 */
export const projects = [
  {
    no: "01",
    name: "Prime Video Clone",
    category: "Web Development",
    purpose:
      "A streaming-platform-inspired website created to explore frontend development, media-platform layouts, content presentation, and interface implementation.",
    focusTitle: "Focus areas",
    focus: [
      "Website layout and structure",
      "Responsive interface design",
      "Streaming-platform visual patterns",
      "Frontend development fundamentals",
    ],
    stack: [],
    liveUrl: "",
    repoUrl: "",
  },
  {
    no: "02",
    name: "The Pasta Lane",
    category: "Restaurant Website",
    purpose:
      "An Italian bistro website concept designed to present a restaurant's identity, menu, story, location, and reservation experience through a refined digital interface.",
    focusTitle: "Planned pages",
    focus: ["Home", "Menu", "About", "Location", "Reservation"],
    extraTitle: "Focus areas",
    extra: [
      "Visual hierarchy",
      "Typography and layout",
      "Restaurant branding",
      "Menu presentation",
      "Responsive web design",
      "User experience",
    ],
    direction:
      "Italian bistro luxury combined with Japanese editorial aesthetics and restrained glassmorphism.",
    stack: [],
    liveUrl: "",
    repoUrl: "",
  },
];

export const education = [
  {
    period: "2026 – 2029",
    title: "B.Voc in AI & Data Science",
    place: "Nexcore Institute of Technology (NIT)",
    note: "Currently pursuing · first year",
  },
  {
    period: "2024 – 2026",
    title: "Higher Secondary Education · Science (PCM)",
    place: "Navneet Junior College",
    note: "",
  },
  {
    period: "2024",
    title: "Secondary Education (SSC)",
    place: "Safa High School",
    note: "72%",
  },
];

export const aboutIntro = [
  "I'm Ali Mapari, a first-year B.Voc student in AI & Data Science at Nexcore Institute of Technology. I'm an emerging developer, building my foundation in programming while working on practical web projects.",
  "My interests sit across artificial intelligence, machine learning, data science, and software development. On the web side I work with HTML, CSS, JavaScript, React and Next.js, and I'm curious about creative technology such as WebGL and Three.js.",
];

export const interests = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Science",
  "Python Programming",
  "Frontend Development",
  "Full-Stack Web Development",
  "Software Engineering",
  "Software Project Management",
  "WebGL and Three.js",
  "Interactive Web Experiences",
];

export const direction = {
  quote:
    "My goal is to develop strong foundations in programming, software engineering, artificial intelligence, machine learning, and data science while continuing to build practical web development projects.",
  follow:
    "I'm interested in understanding how software systems work, solving technical problems, and creating digital experiences that combine functionality with thoughtful design.",
};

/**
 * Cards in the 3D skills ring. Descriptions only say what each tool is and where it sits
 * in the portfolio brief; no proficiency levels or project claims are invented.
 */
export const skillCards = [
  {
    id: "html",
    title: "HTML",
    images: ["/skills/html5.svg"],
    category: "Web Development",
    blurb: "The markup language that structures every web page. It is the base layer of my web development work.",
    related: ["Responsive layouts", "UI implementation"],
  },
  {
    id: "css",
    title: "CSS & Tailwind CSS",
    images: ["/skills/css3.svg", "/skills/tailwindcss.svg"],
    category: "Web Development",
    blurb: "Styling and layout for responsive interfaces, written as plain CSS and with Tailwind CSS utility classes.",
    related: ["Responsive layouts", "Interactive interface design"],
  },
  {
    id: "js",
    title: "JavaScript",
    images: ["/skills/javascript.svg"],
    category: "Web Development",
    blurb: "The language that makes pages interactive. I am building on it with React and Next.js.",
    related: ["React", "Next.js"],
  },
  {
    id: "python",
    title: "Python",
    images: ["/skills/python.svg"],
    category: "Programming & Tools",
    blurb: "A core language for my AI, machine learning and data science studies.",
    related: ["AI", "Machine learning", "Data science"],
  },
  {
    id: "git",
    title: "Git & GitHub",
    images: ["/skills/git.svg", "/skills/github.svg"],
    invertInDark: ["/skills/github.svg"],
    category: "Programming & Tools",
    blurb: "Version control and code hosting, used to track changes and keep projects organised.",
    related: ["Version control", "Project hosting"],
  },
  {
    id: "figma",
    title: "Figma",
    images: ["/skills/figma.svg"],
    category: "Design & Prototyping",
    blurb: "A design and prototyping tool for planning interfaces before building them.",
    related: ["UI implementation", "Interactive interface design"],
  },
  {
    id: "spm",
    title: "Software Project Management",
    images: ["/skills/project-management.svg"],
    category: "Additional Knowledge",
    blurb: "Planning and organising software work, from requirements to delivery, alongside the Software Development Life Cycle.",
    related: ["SDLC", "Requirements & system design"],
  },
];

/** Skills from the brief that are not in the ring, shown as a line under it. */
export const skillsAlso = ["React", "Next.js", "WordPress", "SDLC", "Requirements & system design", "UI implementation", "Responsive layouts", "Interactive interface design"];
