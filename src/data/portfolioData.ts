export interface Project {
  id: string;
  title: string;
  category: string;
  period: string;
  tagline: string;
  description: string;
  metrics: string[];
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  highlightStat: string;
  architectureDetails: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  summary: string;
  deliverables: string[];
  technologies: string[];
}

export interface SkillCategory {
  title: string;
  skills: { name: string; level: number; note: string }[];
}

export const PORTFOLIO_DATA = {
  identity: {
    fullName: "Adnan Ferdiansyah",
    shortName: "Adnan",
    initials: "AF",
    role: "Creative Technologist & 3D Web Architect",
    specialty: "Spatial WebGL, High-Performance Frontend & Design Systems",
    location: "Jakarta, Indonesia",
    timezone: "Asia/Jakarta",
    utcOffset: "UTC+7",
    status: "Available for high-impact contracts & architectural consulting",
    statusBadge: "OPEN FOR CONTRACTS",
    coordinates: "6.2088° S, 106.8456° E",
    email: "adnan.ferdiansyah.dev@gmail.com",
    github: "https://github.com/adnanferdiansyah",
    linkedin: "https://linkedin.com/in/adnanferdiansyah",
    twitter: "https://x.com/adnan_ferdi",
  },
  manifesto: [
    {
      label: "DEPTH OVER FLATNESS",
      text: "Spatial 3D context turns flat documentation into intuitive, memorable experiences. Use WebGL to explain complex state, not just for cosmetic vanity.",
    },
    {
      label: "60FPS NON-NEGOTIABLE",
      text: "Every frame budget is 16.6 milliseconds. Offload CPU-heavy computations to Web Workers and leverage GPU shader passes.",
    },
    {
      label: "ZERO SLOP",
      text: "No meaningless purple gradients, no boilerplate placeholders, no bloated libraries. Every line of CSS and JavaScript must earn its bytes.",
    },
  ],
  stats: [
    { value: "60+", label: "FPS Render Target", suffix: "fps" },
    { value: "<15ms", label: "Interactive Latency", suffix: "ms" },
    { value: "99.8%", label: "Lighthouse Performance", suffix: "" },
    { value: "5+", label: "Years Engineering WebGL", suffix: "yrs" },
  ],
  projects: [
    {
      id: "aura-webdsp",
      title: "Aura WebDSP",
      category: "Audio DSP & WebGL 3D",
      period: "2024",
      tagline: "Real-time browser synthesizer & 3D FFT spectral dispersion engine.",
      description:
        "High-performance digital signal processing application running in an isolated AudioWorklet thread. Generates real-time 3D frequency point clouds and reactive meshes with zero main-thread jank.",
      metrics: ["Sub-5ms audio buffer latency", "60 FPS WebGL shader pipeline", "Zero memory leaks in long sessions"],
      techStack: ["Web Audio API", "Three.js", "GLSL Shaders", "TypeScript", "AudioWorklet"],
      githubUrl: "https://github.com/adnanferdiansyah/aura-webdsp",
      liveUrl: "https://aura-webdsp.demo",
      featured: true,
      highlightStat: "64-Band FFT @ 60FPS",
      architectureDetails:
        "Engineered with custom SharedArrayBuffer IPC between the AudioWorklet processor and Three.js vertex shaders for instantaneous audio-reactive mesh deformation.",
    },
    {
      id: "kinetix-3d",
      title: "Kinetix 3D Spatial UI",
      category: "Design System & WebGL",
      period: "2023 - 2024",
      tagline: "Headless 3D spatial component primitives with physical spring inertia.",
      description:
        "A lightweight spatial design framework bringing hardware-accelerated 3D transforms, gyroscopic parallax, and volumetric cards to standard React web applications without heavy runtime overhead.",
      metrics: ["6.4 kB bundle footprint", "True 3D perspective matrix math", "Accessible ARIA keyboard fallbacks"],
      techStack: ["React", "TypeScript", "CSS 3D Transforms", "Matrix4 Math", "Tailwind CSS"],
      githubUrl: "https://github.com/adnanferdiansyah/kinetix-3d",
      liveUrl: "https://kinetix-3d.demo",
      featured: true,
      highlightStat: "6.4 kB Zero-Dep",
      architectureDetails:
        "Calculates perspective projection matrices directly via CSS transform matrix3d with spring damper algorithms to avoid triggering browser layout thrashing.",
    },
    {
      id: "nanzflow-telemetry",
      title: "NanzFlow Telemetry",
      category: "Distributed Systems & Canvas",
      period: "2023",
      tagline: "High-throughput stream processing monitoring with interactive canvas heatmaps.",
      description:
        "Mission-critical telemetry dashboard processing 50,000+ events per second over WebSockets. Features interactive 2D/3D topological cluster topology and automated anomaly detection.",
      metrics: ["50k+ events/sec throughput", "Canvas 2D buffer pooling", "Sub-100ms dashboard boot"],
      techStack: ["Next.js", "WebSockets", "Canvas API", "Zustand", "Go Backend"],
      githubUrl: "https://github.com/adnanferdiansyah/nanzflow-telemetry",
      liveUrl: "https://nanzflow.demo",
      featured: true,
      highlightStat: "50k EPS Streaming",
      architectureDetails:
        "Employs double-buffering on HTML5 OffscreenCanvas with binary ArrayBuffer protocols over WebSocket, eliminating JSON deserialization bottlenecks.",
    },
    {
      id: "chronos-terminal",
      title: "Chronos Terminal Engine",
      category: "Developer Tooling",
      period: "2022 - 2023",
      tagline: "GPU-accelerated in-browser developer terminal and workspace canvas.",
      description:
        "Modern developer terminal emulator with syntax tree highlighting, split workspaces, remote SSH multiplexing, and customizable tactile audio feedback.",
      metrics: ["Instant keystroke echo (<8ms)", "Full VT100 / xterm compliance", "Vim-style keymap routing"],
      techStack: ["TypeScript", "WebGL Text Renderer", "WebAssembly", "WebRTC"],
      githubUrl: "https://github.com/adnanferdiansyah/chronos-terminal",
      liveUrl: "https://chronos-term.demo",
      featured: false,
      highlightStat: "<8ms Key Echo",
      architectureDetails:
        "Custom glyph atlas texture generator rendered through WebGL instanced geometry, allowing rendering 100,000 terminal characters with single draw calls.",
    },
  ],
  skills: [
    {
      title: "3D & Computer Graphics",
      skills: [
        { name: "Three.js / WebGL", level: 95, note: "Custom shaders, instanced meshes, post-processing" },
        { name: "GLSL Shader Programming", level: 88, note: "Vertex/Fragment shaders, noise, raymarching" },
        { name: "Spatial Math & Matrices", level: 90, note: "Quaternions, Euler angles, projection transforms" },
        { name: "Web Audio API", level: 92, note: "FFT Analysers, AudioWorklet, procedural synthesis" },
      ],
    },
    {
      title: "Core Architecture & Frontend",
      skills: [
        { name: "Next.js (App Router) & React", level: 96, note: "Server Components, streaming, zero-layout-shift" },
        { name: "TypeScript Strictness", level: 94, note: "Type-level programming, generic contracts" },
        { name: "Performance Engineering", level: 95, note: "Profiler audits, thread offloading, bundle budgets" },
        { name: "Tailwind CSS & CSS Systems", level: 96, note: "Design tokens, fluid typography, 3D preserve" },
      ],
    },
    {
      title: "Systems & Infrastructure",
      skills: [
        { name: "WebSockets & WebRTC", level: 86, note: "Binary protocols, multiplexing, peer-to-peer" },
        { name: "Node.js & Go Microservices", level: 84, note: "High concurrency, memory profiling, streaming" },
        { name: "Docker & Cloud Deployments", level: 88, note: "Edge functions, containerization, CI/CD pipelines" },
      ],
    },
  ],
  experiences: [
    {
      role: "Lead 3D & Frontend Architect",
      company: "Apex Spatial Labs",
      location: "Remote / Singapore",
      period: "2023 - Present",
      summary:
        "Directed the architectural design of WebGL-driven spatial tools and next-generation design systems for enterprise web applications.",
      deliverables: [
        "Re-engineered client rendering pipeline, reducing Frame Drop rate from 18% down to 0.4%.",
        "Created an internal component library incorporating hardware-accelerated 3D transforms.",
        "Authored custom WebGL post-processing shaders for real-time volumetric blur and bloom.",
      ],
      technologies: ["Next.js", "Three.js", "GLSL", "TypeScript", "Tailwind CSS"],
    },
    {
      role: "Senior Creative Developer",
      company: "Synthetix Digital",
      location: "Jakarta, Indonesia",
      period: "2021 - 2023",
      summary:
        "Built immersive, award-winning web platforms, interactive product visualizers, and high-conversion editorial sites.",
      deliverables: [
        "Shipped 12+ bespoke interactive experiences for global consumer and tech brands.",
        "Pioneered AudioWorklet-powered web soundscapes with dynamic reactive visualizers.",
        "Mentored junior engineers in WebGL fundamentals, matrix math, and CSS 3D perspectives.",
      ],
      technologies: ["React", "WebGL", "Three.js", "Web Audio API", "Framer Motion"],
    },
    {
      role: "Frontend Software Engineer",
      company: "DataMesh Systems",
      location: "Jakarta, Indonesia",
      period: "2019 - 2021",
      summary:
        "Engineered real-time telemetry dashboards, streaming data visualizers, and core UI component libraries.",
      deliverables: [
        "Optimized large-dataset tabular rendering using virtualized DOM nodes and Canvas fallback.",
        "Implemented end-to-end WebSocket telemetry pipeline supporting 20,000 active concurrent clients.",
      ],
      technologies: ["TypeScript", "React", "Canvas API", "WebSockets", "Tailwind CSS"],
    },
  ],
};
