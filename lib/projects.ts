export interface Project {
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  category: string;
  overview: string;
  challenge: string;
  role: string;
  timeline: string;
  client: string;
  tech: string[];
  features: { number: string; title: string; description: string }[];
  heroImage?: string;
  images?: string[];
  liveUrl?: string;
  nextProject?: { slug: string; title: string };
}

export const projects: Project[] = [
  {
    slug: "forge-bi",
    number: "01",
    title: "Forge BI",
    shortDescription:
      "AI-powered business intelligence for startups. Financial insights via natural language.",
    category: "AI / Fintech",
    overview:
      "Forge BI is an AI-powered business intelligence platform designed specifically for startups. It connects to your financial data sources — bank accounts, accounting software — and uses natural language AI to deliver actionable insights.\n\nBuilt with Next.js 15, TypeScript, and Vercel AI SDK — integrates Plaid for bank data and applies 8 years of financial analysis experience to product design, creating dashboards that translate raw data into decisions.",
    challenge:
      "Startups need financial visibility but can't afford dedicated analysts. Existing BI tools are complex, expensive, and require SQL knowledge. The goal was to create a platform that makes financial intelligence accessible to non-technical founders through conversational AI.",
    role: "Full-Stack Developer & Designer",
    timeline: "Oct 2024 — Ongoing",
    client: "Personal Product",
    tech: ["Next.js", "TypeScript", "Prisma", "AI SDK", "Plaid"],
    heroImage: "/screenshots/forge-bi-hero.png",
    images: ["/screenshots/forge-bi-hero.png"],
    liveUrl: "https://forge.keino.dev",
    features: [
      {
        number: "01",
        title: "AI Chat",
        description:
          "Natural language interface for querying financial data. Ask questions in plain English and get charts, tables, and insights.",
      },
      {
        number: "02",
        title: "Bank Sync",
        description:
          "Plaid integration for automatic bank account syncing. Real-time transaction data flows into the platform without manual entry.",
      },
      {
        number: "03",
        title: "Goals",
        description:
          "Auto-tracked financial goals — revenue targets, profit margins, break-even analysis. Progress updates automatically from live data.",
      },
    ],
    nextProject: { slug: "high-tide-capital", title: "High Tide Capital" },
  },
  {
    slug: "high-tide-capital",
    number: "02",
    title: "High Tide Capital",
    shortDescription:
      "Modern underwriting platform with borrower validation and DocuSign e-signature flow.",
    category: "Lending / Underwriting",
    overview:
      "HiTide Capital needed a modern underwriting platform to manage their lending pipeline. I built the borrower-facing validation and contract flow using Next.js and TypeScript, with DocuSign integration for e-signatures.\n\nThe backend uses a PostgreSQL database designed with Prisma ORM to track applicant data, underwriting decisions, and loan status through the full lifecycle — from application to funding.",
    challenge:
      "The existing process was manual and fragmented — borrower documents were collected via email, contracts were signed offline, and loan tracking lived in spreadsheets. The goal was to digitize the entire flow into a single platform that could scale with the business.",
    role: "Software Engineer",
    timeline: "2024",
    client: "HiTide Capital",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "DocuSign"],
    heroImage: "/screenshots/hitide-hero.png",
    images: ["/screenshots/hitide-flow.png", "/screenshots/hitide-products.png"],
    liveUrl: "https://hitidecapital.com",
    features: [
      {
        number: "01",
        title: "Borrower Validation",
        description:
          "Multi-step borrower intake with identity verification, document upload, and eligibility checks before entering the underwriting pipeline.",
      },
      {
        number: "02",
        title: "Contract Flow",
        description:
          "DocuSign integration for seamless e-signature workflows. Contracts are generated, sent, and tracked without leaving the platform.",
      },
      {
        number: "03",
        title: "Loan Tracking",
        description:
          "PostgreSQL schema designed to track the full loan lifecycle — applications, underwriting decisions, and funding status with Prisma ORM.",
      },
    ],
    nextProject: { slug: "lhbk-web", title: "LHBK Web" },
  },
  {
    slug: "lhbk-web",
    number: "03",
    title: "LHBK Web",
    shortDescription:
      "Community website for Brooklyn-based non-profit preserving Haitian culture.",
    category: "Non-Profit / Community",
    overview:
      "Little Haiti BK is a Brooklyn-based non-profit dedicated to preserving Haitian culture and empowering the local community. I built their web presence — a Next.js site with community event listings, organizational information, and local resource mapping.\n\nThe site serves as the digital front door for the organization, connecting community members with programs, events, and resources across Brooklyn.",
    challenge:
      "LHBK needed a modern, maintainable website that the team could keep updated without developer involvement. The site had to be fast, accessible, and reflect the organization's cultural identity while being practical for community members looking for events and resources.",
    role: "Software Engineer",
    timeline: "2024",
    client: "Little Haiti BK",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    heroImage: "/screenshots/lhbk-hero.png",
    images: ["/screenshots/lhbk-hero.png"],
    liveUrl: "https://lhbk.org",
    features: [
      {
        number: "01",
        title: "Community Hub",
        description:
          "Central landing page showcasing LHBK's mission, programs, and upcoming events — designed to connect community members with resources.",
      },
      {
        number: "02",
        title: "Event Listings",
        description:
          "Dynamic event system for community gatherings, cultural celebrations, and organizational programs with location and scheduling details.",
      },
      {
        number: "03",
        title: "Resource Mapping",
        description:
          "Local resource directory helping community members find services, programs, and points of interest across Brooklyn's Haitian community.",
      },
    ],
    nextProject: {
      slug: "good-call-technologies",
      title: "Good Call Technologies",
    },
  },
  {
    slug: "good-call-technologies",
    number: "04",
    title: "Good Call Technologies",
    shortDescription:
      "Twilio-based voice routing connecting people in custody with attorneys 24/7.",
    category: "Legal Tech / Telecom",
    overview:
      "Good Call Technologies connects people in police custody with attorneys. I built the Twilio-based voice routing system that powers 24/7 attorney connections from precinct phones — call flow logic, queue management, and automatic routing to available operators.\n\nAlongside the phone system, I developed the operator dashboard where staff manage scheduling, handle live calls (hold, transfer, conferencing), and monitor real-time notifications.",
    challenge:
      "People detained in precincts need immediate access to legal counsel, but connecting them to attorneys around the clock is a logistical challenge. The system needed to be reliable, handle call queuing during peak hours, and give operators full control over active calls.",
    role: "Software Engineer",
    timeline: "2024",
    client: "Good Call Technology",
    tech: ["Next.js", "TypeScript", "Twilio", "Node.js", "PostgreSQL"],
    heroImage: "/screenshots/goodcall-hero.png",
    images: ["/screenshots/goodcall-hero.png"],
    liveUrl: "https://goodcall.nyc",
    features: [
      {
        number: "01",
        title: "Voice Routing",
        description:
          "Twilio-powered call flow system with queue management, enabling 24/7 attorney connections from precinct phones with automatic routing to available operators.",
      },
      {
        number: "02",
        title: "Operator Dashboard",
        description:
          "Real-time dashboard with scheduling, admin settings, notifications, and full call controls — hold, transfer, and conferencing.",
      },
      {
        number: "03",
        title: "Call Management",
        description:
          "Queue management system that handles peak-hour call volume, routes to available attorneys, and tracks call history for reporting.",
      },
    ],
    nextProject: { slug: "forge-bi", title: "Forge BI" },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
