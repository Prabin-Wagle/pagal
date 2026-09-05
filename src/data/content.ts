export const NAV = [
  { n: "01", label: "About", href: "#about", jp: "紹介" },
  { n: "02", label: "Capabilities", href: "#capabilities", jp: "領域" },
  { n: "03", label: "Projects", href: "#projects", jp: "作品" },
  { n: "04", label: "AI / ML", href: "#ai", jp: "知能" },
  { n: "05", label: "Experiments", href: "#experiments", jp: "実験" },
  { n: "06", label: "Contact", href: "#contact", jp: "連絡" },
] as const;

export type Capability = {
  n: string;
  title: string;
  jp: string;
  short: string;
  detail: string;
  diagram: "graph" | "matrix" | "lens" | "tokens" | "stack" | "device" | "infra" | "orbit";
  meta: string[];
};

export const CAPABILITIES: Capability[] = [
  {
    n: "01",
    title: "Artificial Intelligence",
    jp: "人工知能",
    short: "Systems that perceive, reason and act.",
    detail:
      "Designing software where models are components — perception, decision and feedback loops wired into real products rather than isolated demos.",
    diagram: "graph",
    meta: ["Perception", "Reasoning", "Feedback loops"],
  },
  {
    n: "02",
    title: "Machine Learning",
    jp: "機械学習",
    short: "Data → representation → prediction.",
    detail:
      "Training and evaluating models end-to-end: dataset preparation, augmentation, transfer learning, GPU training and experiment tracking.",
    diagram: "matrix",
    meta: ["TensorFlow", "Keras", "Transfer learning"],
  },
  {
    n: "03",
    title: "Computer Vision",
    jp: "画像認識",
    short: "Teaching software to see.",
    detail:
      "Image classification and recognition pipelines — from PlantVillage leaf imagery to MobileNetV2 inference running inside a web platform.",
    diagram: "lens",
    meta: ["MobileNetV2", "Classification", "Augmentation"],
  },
  {
    n: "04",
    title: "Large Language Models",
    jp: "言語模型",
    short: "Beyond the chatbot.",
    detail:
      "Running open models locally, wiring LLM APIs into applications, and exploring agents, gateways and model serving.",
    diagram: "tokens",
    meta: ["Ollama", "Hugging Face", "LLM APIs"],
  },
  {
    n: "05",
    title: "Full-Stack Development",
    jp: "全層開発",
    short: "From schema to interface.",
    detail:
      "React, TypeScript and Tailwind on the front; Node, Firebase, Supabase, MySQL and PHP behind — with REST APIs connecting the layers.",
    diagram: "stack",
    meta: ["React", "Node.js", "Supabase"],
  },
  {
    n: "06",
    title: "Mobile Development",
    jp: "携帯開発",
    short: "Same product, in the pocket.",
    detail:
      "Flutter and Dart applications sharing cloud backends with their web counterparts — authentication, storage and search included.",
    diagram: "device",
    meta: ["Flutter", "Dart", "Firebase"],
  },
  {
    n: "07",
    title: "AI Infrastructure",
    jp: "基盤構築",
    short: "Where the models live.",
    detail:
      "Local inference, model serving, AI gateways and the plumbing that makes intelligence available to other software.",
    diagram: "infra",
    meta: ["Model serving", "Inference", "Gateways"],
  },
  {
    n: "08",
    title: "Emerging Technology",
    jp: "新興技術",
    short: "Curiosity as a discipline.",
    detail:
      "Quantum-classical ML, digital twins, edge AI and environmental technology — explored through prototypes, not slide decks.",
    diagram: "orbit",
    meta: ["Quantum", "Edge AI", "Digital twins"],
  },
];

export const STACK = [
  {
    n: "01",
    title: "Languages",
    jp: "言語",
    items: ["Python", "C++", "JavaScript", "TypeScript", "Dart", "PHP"],
  },
  {
    n: "02",
    title: "Frontend",
    jp: "前面",
    items: ["React", "TypeScript", "Tailwind CSS", "Vite"],
  },
  {
    n: "03",
    title: "Backend",
    jp: "後面",
    items: ["Node.js", "Firebase", "Firestore", "Supabase", "MySQL", "PHP", "REST APIs"],
  },
  {
    n: "04",
    title: "AI / ML",
    jp: "知能",
    items: [
      "TensorFlow",
      "Keras",
      "MobileNetV2",
      "Computer Vision",
      "Transfer Learning",
      "Hugging Face",
      "LLMs",
      "LLM APIs",
      "Model Inference",
    ],
  },
  {
    n: "05",
    title: "Tools",
    jp: "道具",
    items: [
      "Git",
      "GitHub",
      "VS Code",
      "Zed",
      "Google Colab",
      "Jupyter",
      "Playwright",
      "FFmpeg",
      "PowerShell",
      "Linux / WSL",
      "pnpm",
      "Ollama",
    ],
  },
] as const;

export type Project = {
  n: string;
  slug: string;
  title: string;
  jp: string;
  kind: string;
  summary: string;
  bullets: string[];
  tech: string[];
  visual: "agri" | "pipeline" | "library" | "lms";
  theme: "ink" | "paper";
};

export const PROJECTS: Project[] = [
  {
    n: "01",
    slug: "ai-agriculture",
    title: "AI Agriculture Platform",
    jp: "農業知能",
    kind: "AI · Computer Vision · Web · Social Impact",
    summary:
      "An AI-powered agriculture platform bringing plant recognition, disease detection and weather intelligence to the people who grow food.",
    bullets: [
      "Plant recognition",
      "Plant disease detection",
      "Weather intelligence",
      "Seed bank",
      "Farmer knowledge sharing",
    ],
    tech: ["AI", "Computer Vision", "Web Development", "Agriculture", "Social Impact"],
    visual: "agri",
    theme: "ink",
  },
  {
    n: "02",
    slug: "plant-disease-classification",
    title: "Plant Disease Classification",
    jp: "病害分類",
    kind: "Machine Learning · Technical Case Study",
    summary:
      "A transfer-learning classifier trained on the PlantVillage dataset with MobileNetV2 — augmented, GPU-trained on Colab and tracked with Weights & Biases.",
    bullets: [
      "PlantVillage dataset",
      "MobileNetV2 backbone",
      "Transfer learning",
      "Image augmentation",
      "GPU training on Google Colab",
      "Weights & Biases tracking",
    ],
    tech: ["TensorFlow", "Keras", "MobileNetV2", "Google Colab", "Weights & Biases"],
    visual: "pipeline",
    theme: "paper",
  },
  {
    n: "03",
    slug: "note-library",
    title: "Note Library",
    jp: "学習図書",
    kind: "Educational Technology · Web + Mobile",
    summary:
      "An educational platform for notes, resources and quizzes — authenticated, searchable, cloud-stored, and shipped with a companion mobile application.",
    bullets: [
      "Educational resources",
      "Notes",
      "Quizzes",
      "Authentication",
      "Cloud storage",
      "Search",
      "Mobile application",
    ],
    tech: ["React", "Tailwind CSS", "Vite", "Firebase", "Firestore", "Supabase", "MySQL", "PHP", "Flutter"],
    visual: "library",
    theme: "ink",
  },
  {
    n: "04",
    slug: "beats-engineering-lms",
    title: "Beats Engineering LMS",
    jp: "学習管理",
    kind: "Learning Management System · Concept",
    summary:
      "A three-portal learning management system concept — students learn, editors author, admins govern — on a shared Firebase and Supabase backbone.",
    bullets: [
      "Student · Dashboard, courses, live & recorded classes, quizzes, analytics",
      "Admin · User, course and content management",
      "Editor · Course creation, question management, educational content",
    ],
    tech: ["React", "TypeScript", "Tailwind CSS", "Firebase", "Firestore", "Supabase"],
    visual: "lms",
    theme: "paper",
  },
];

export const LLM_TOPICS = [
  "Open-source LLMs",
  "DeepSeek",
  "Mistral",
  "GPT-OSS",
  "Hugging Face",
  "Ollama",
  "Local model inference",
  "AI agents",
  "Model serving",
  "Fine-tuning",
  "AI gateways",
];

export const EXPERIMENTS = [
  { n: "α", title: "Quantum computing", note: "Qubits, gates, and what changes when the substrate changes." },
  { n: "β", title: "Quantum-classical ML", note: "Hybrid circuits as feature maps for classical learners." },
  { n: "γ", title: "Digital twins", note: "Living models of physical systems, fed by sensors." },
  { n: "δ", title: "Edge AI", note: "Inference on the device, without the round-trip." },
  { n: "ε", title: "AI medical applications", note: "Where a model's error has a human cost." },
  { n: "ζ", title: "Smart agriculture", note: "Continuing the thread from the farm platform." },
  { n: "η", title: "Traffic optimization", note: "Cities as flow problems." },
  { n: "θ", title: "Flood simulation", note: "Terrain, rainfall and time — simulated before it happens." },
  { n: "ι", title: "Environmental technology", note: "Tooling for a planet under load." },
  { n: "κ", title: "Educational technology", note: "The projects already built, pushed further." },
];

export const LINKS = [
  { label: "GitHub", href: "https://github.com/Prabin-Wagle" },
  { label: "Facebook", href: "https://www.facebook.com/prabin.wagle.73" },
  { label: "Email", href: "mailto:prabinwagle20@gmail.com" },
];
