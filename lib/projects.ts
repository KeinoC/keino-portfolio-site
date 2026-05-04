export type ProjectDemo =
  | {
      kind: "iframe";
      url: string;
      minSize?: { w: number; h: number };
      credentials?: { hint: string };
    }
  | {
      kind: "video";
      src: string;
      poster: string;
      // ISO date the recording was captured. Empty string until KEI-024 ships.
      recordedAt: string;
    }
  | {
      kind: "none";
      reason?: string;
    };

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
  github?: string;
  accent?: string;
  outcomes?: { metric: string; description: string }[];
  whatILearned?: string[];
  architecture?: { summary: string; diagramImage?: string };
  codeSnippet?: {
    title: string;
    language: string;
    code: string;
    caption?: string;
  };
  // Picture-in-Picture demo on /work/[slug]. Iframe embeds owned products
  // with a demo-account hint; video plays a recorded walkthrough for client
  // products we don't host. `none` hides the trigger entirely.
  demo?: ProjectDemo;
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
    accent: "#7c8db5",
    heroImage: "/screenshots/forge-bi-hero.png",
    images: ["/screenshots/forge-bi-features.png"],
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
    architecture: {
      summary:
        "Plaid pulls transaction data into a Prisma-modeled financial schema (accounts, transactions, derived metrics). The AI Chat layer is a Vercel AI SDK orchestration that translates natural-language questions into typed queries over that schema, then renders charts/tables inline. Goals are background-evaluated against the same data — no manual reconciliation step. Eight years of healthcare finance taught me which questions founders actually ask, so the schema and prompt scaffolding are tuned for variance analysis and runway over generic BI.",
    },
    outcomes: [
      {
        metric: "1 schema, 3 surfaces",
        description:
          "Plaid bank sync, AI chat, and auto-tracked goals all share one Prisma data model. No reporting DB, no ETL.",
      },
      {
        metric: "8 yrs domain DNA",
        description:
          "Tables named in analyst language (variance, runway, burn) so the AI reasons in the user's vocabulary, not generic BI.",
      },
    ],
    whatILearned: [
      "Domain knowledge changes the schema. A general-purpose finance schema would have made the AI's job harder — naming things the way analysts name them (variance, runway, burn) lets the model reason in the user's language.",
      "AI as an analyst replacement, not a chatbot. The interface prefers charts and tables over conversation; chat is the input, not the output.",
      "Plaid's realtime story is rougher than the marketing implies. Webhook reconciliation + a backfill cron is more reliable than trusting any single signal.",
    ],
    demo: {
      kind: "iframe",
      url: "https://forge.keino.dev/demo",
      minSize: { w: 760, h: 520 },
      credentials: { hint: "Demo signs you in automatically — no password needed." },
    },
    nextProject: { slug: "chicknz", title: "Chicknz" },
  },
  {
    slug: "chicknz",
    number: "02",
    title: "Chicknz",
    shortDescription:
      "Multi-tenant, AI-native family management. Chores, rewards, and skill trees for kids 4–16.",
    category: "AI / Multi-tenant SaaS",
    overview:
      "Chicknz is a multi-tenant family management app built around an age-adaptive UI — one codebase that serves four distinct complexity tiers (little, kid, tween, teen) so a four-year-old and a fourteen-year-old get experiences tuned to their reading level, motor skills, and motivation patterns.\n\nThe stack is Next.js 15, Prisma + PostgreSQL, Better Auth for parent/kid auth (OAuth + PIN), Vercel AI SDK with Anthropic Claude for background intelligence (chore rotation, summaries, NL task creation), Ably for realtime, and a Vercel Blob layer for media.",
    challenge:
      "Family-management apps either ship a single generic UI that doesn't fit any age group, or shard into multiple apps and lose the shared family state. The goal was to keep one shared multi-tenant data model — every query scoped by `familyId` — while presenting four parallel UI tiers driven by CSS custom properties and CVA variants.",
    role: "Founder / Full-Stack Engineer",
    timeline: "Feb 2026 — Ongoing",
    client: "Personal Product",
    tech: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "Better Auth",
      "AI SDK",
      "Bun",
      "Ably",
    ],
    accent: "#e08653",
    heroImage: "/screenshots/chicknz-hero.png",
    liveUrl: "https://chicknz.vercel.app",
    features: [
      {
        number: "01",
        title: "Age-Adaptive UI",
        description:
          "Four UI tiers (little / kid / tween / teen) driven by CSS custom properties and CVA variants. Tap targets, icon size, density, and reading level all flex per age group from a single component library.",
      },
      {
        number: "02",
        title: "AI Background Intelligence",
        description:
          "Anthropic Claude (Haiku for fast paths, Sonnet for generation) powers natural-language chore creation, fair-rotation scheduling, and weekly family summaries — embedded in the workflow, not bolted on as a chatbot.",
      },
      {
        number: "03",
        title: "Multi-Tenant by familyId",
        description:
          "Every database query and AI call is scoped to a familyId. Better Auth handles parent OAuth and kid PIN flows; Ably broadcasts realtime updates inside a family without crossing tenant boundaries.",
      },
    ],
    architecture: {
      summary:
        "One Next.js codebase, four UI tiers. CSS custom properties (`--tap-target`, `--icon-size`, `--text-density`) and CVA variants drive age-adaptive components — no per-age fork. Prisma schema is multi-tenant by `familyId`; every query is scoped at the data layer, never relying on client filtering. AI lives behind a service boundary (`packages/ai`) that takes structured intent (\"create chore\", \"summarize week\") rather than free chat — the AI is background intelligence, not a chatbot.",
    },
    outcomes: [
      {
        metric: "4 UI tiers, 1 component library",
        description:
          "CSS custom properties + CVA variants drive little/kid/tween/teen tap targets, density, and reading level. No per-age fork.",
      },
      {
        metric: "Multi-tenant at the query layer",
        description:
          "Every Prisma query and AI call scoped by familyId in extension code — a missed scope is a type error, not a security incident.",
      },
    ],
    whatILearned: [
      "Age-adaptive UI works as engineering, not just design. CSS tokens + CVA variants made it cheap to ship four tiers from one component library — the alternative (forking) would have killed velocity.",
      "Multi-tenancy at the query layer beats middleware checks. Scoping by `familyId` in Prisma extension code means a missed scope is a type error, not a security incident.",
      "AI-as-orchestrator vs AI-as-chatbot. Wiring Claude into chore rotation, scheduling, and weekly summaries makes the product feel intelligent without ever exposing a chat surface to a child.",
    ],
    demo: {
      kind: "iframe",
      url: "https://chicknz.vercel.app/?demo=preview",
      minSize: { w: 720, h: 480 },
      credentials: {
        hint: "Auto-loaded into a sandboxed demo family — your changes won't persist.",
      },
    },
    nextProject: { slug: "cantrip", title: "Cantrip" },
  },
  {
    slug: "cantrip",
    number: "03",
    title: "Cantrip",
    shortDescription:
      "Multi-tenant AI Dungeon Master platform. Publishers ship rulesets, players play with an AI DM.",
    category: "AI / Platform",
    overview:
      "Cantrip is a multi-tenant TTRPG platform where game publishers ship rulesets and players run sessions with an AI Dungeon Master. The same architectural backbone as Chicknz (multi-tenant, oRPC, Prisma, Better Auth) but applied to a creative-tools domain — the AI is the host, not a chatbot.\n\nFlagship ruleset: Zairoo, an Afrocentric original system that doubles as the platform's reference content while the editor and session experience are stress-tested.",
    challenge:
      "Existing virtual-tabletop tools force publishers into a fixed rules engine, and AI DM tools tend to be single-system. Cantrip splits the layer cleanly: an extractable rules engine SDK + a tenant-isolated session runtime + an AI orchestrator that knows the active ruleset's grammar. Publishers get authoring tools; players get a host that doesn't break character.",
    role: "Founder / Full-Stack Engineer",
    timeline: "Mar 2026 — Ongoing",
    client: "Personal Product",
    tech: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "oRPC",
      "Better Auth",
      "AI SDK",
      "Anthropic",
    ],
    accent: "#9d8bbf",
    heroImage: "/screenshots/cantrip-hero.png",
    liveUrl: "https://cantrip.vercel.app",
    images: [
      "/screenshots/cantrip-session.png",
      "/screenshots/cantrip-character.png",
      "/screenshots/cantrip-editor.png",
      "/screenshots/cantrip-dashboard.png",
    ],
    features: [
      {
        number: "01",
        title: "AI Dungeon Master",
        description:
          "Anthropic Claude orchestrates session flow, generates encounters, and arbitrates rules — bound to the active ruleset's grammar so it stays in-system instead of hallucinating mechanics.",
      },
      {
        number: "02",
        title: "Ruleset Authoring",
        description:
          "Publisher dashboard for shipping rulesets — character sheets, moves, tables, narrative tone. Same authoring layer that powers Zairoo also opens to third-party publishers.",
      },
      {
        number: "03",
        title: "Tenant-Isolated Sessions",
        description:
          "Each session runs in a tenant-isolated context with its own ruleset, party state, and AI memory. Built on the same multi-tenant primitives as Chicknz — every query scoped, every AI call sandboxed.",
      },
    ],
    architecture: {
      summary:
        "Three layers: an extractable rules engine SDK (the `cantrip-sdk` package — pure functions, no React), a tenant-isolated session runtime (Next.js App Router with oRPC procedures scoped by `tenantId`), and an AI orchestrator that's bound to the active ruleset's grammar via structured tool definitions (Vercel AI SDK + Anthropic). The same SDK powers both publisher authoring (validates rulesets at write time) and the session runtime (executes them at play time) — no schema drift between authoring and play.",
    },
    outcomes: [
      {
        metric: "1 rules SDK, 2 surfaces",
        description:
          "cantrip-sdk validates rulesets at authoring time and executes them at play time. No schema drift between editor and runtime.",
      },
      {
        metric: "AI bound to typed grammar",
        description:
          "DM tools defined per-ruleset via Vercel AI SDK structured tools, so the AI stays in-system instead of hallucinating mechanics.",
      },
    ],
    whatILearned: [
      "AI agents stay in-character only when their tools are typed. Free-form prompting drifts; a strict tool surface bound to the ruleset's grammar keeps the DM from inventing mechanics that don't exist.",
      "An SDK shipped alongside the platform is worth the dual-target tax. Authoring + runtime sharing the same engine means a ruleset that validates is one that runs.",
      "Reuse multi-tenant primitives when the domain is different — same `tenantId` query scoping pattern as Chicknz, completely different product.",
    ],
    demo: {
      kind: "iframe",
      url: "https://cantrip.vercel.app/session/demo",
      minSize: { w: 880, h: 560 },
      credentials: {
        hint: "Pre-rolled session with the Zairoo ruleset — drop in mid-game.",
      },
    },
    nextProject: { slug: "lhbk-web", title: "LHBK Web" },
  },
  {
    slug: "lhbk-web",
    number: "04",
    title: "LHBK Web",
    shortDescription:
      "Operations platform for Brooklyn Haitian non-profit — payroll, BID property CRM, form builder.",
    category: "Non-Profit / Operations",
    overview:
      "Little Haiti BK is a Brooklyn-based non-profit preserving Haitian culture and supporting small businesses through a Business Improvement District. What started as a community website grew into the organization's operating platform — staff timesheets with Paychex payroll integration, a form builder for community programs, file management, and a Mapbox-driven CRM for the BID's commercial property roster.\n\nNext.js 15 App Router, Better Auth for staff + community sign-in, Prisma + PostgreSQL, with Mapbox for property mapping and Paychex API integration for payroll.",
    challenge:
      "LHBK runs on tight non-profit margins — they couldn't afford a five-tool stack (HRIS + CRM + forms + maps + CMS). The goal was to consolidate operations into a single platform the team could maintain themselves, while keeping the public-facing community pages fast and accessible.",
    role: "Software Engineer",
    timeline: "2024 — Ongoing",
    client: "Little Haiti BK",
    tech: ["Next.js", "TypeScript", "Prisma", "Better Auth", "Mapbox", "Paychex API"],
    accent: "#b85450",
    heroImage: "/screenshots/lhbk-hero.png",
    liveUrl: "https://lhbk.org",
    features: [
      {
        number: "01",
        title: "BID Property CRM",
        description:
          "Mapbox-driven map of Business Improvement District commercial properties — staff can browse, filter by status, and update property records inline. Replaces a spreadsheet-and-PDF workflow.",
      },
      {
        number: "02",
        title: "Timesheets + Paychex",
        description:
          "Staff timesheet capture wired into Paychex's payroll API — submitted hours flow straight to payroll without re-keying. Cut administrative overhead for the small ops team.",
      },
      {
        number: "03",
        title: "Form Builder + Community Hub",
        description:
          "Schema-driven form builder for community programs (event signups, BID applications, surveys) that staff can configure without developer involvement. Wraps the public-facing community pages.",
      },
    ],
    architecture: {
      summary:
        "Single Next.js App Router platform replacing what would otherwise be five SaaS subscriptions. Better Auth handles staff sign-in (with role-based gates between staff and community-facing surfaces). Prisma schema unifies properties (BID), people (staff + members), forms (schema-driven), and time entries. Paychex's API integration runs on a server action that pre-validates timesheets against budget rules before submission, so payroll exceptions surface before anyone files them.",
    },
    outcomes: [
      {
        metric: "5 SaaS tools → 1 platform",
        description:
          "HRIS, CRM, forms, mapping, and CMS consolidated into one Next.js app a small ops team can maintain themselves.",
      },
      {
        metric: "Paychex API live",
        description:
          "Submitted hours flow straight from staff timesheets into payroll, pre-validated against budget rules so exceptions surface before submission.",
      },
    ],
    whatILearned: [
      "Non-profit ops is a different optimization target. The win wasn't building the slickest BID CRM — it was consolidating five tools into one the team can maintain themselves.",
      "Paychex's API is a 'submit and hope' integration. Building a validation layer in the platform before submission caught more errors than Paychex's own webhook responses.",
      "Schema-driven form builders save dev hours but cost UX hours. Worth it for an ops team; not worth it for a public-facing product.",
    ],
    demo: {
      kind: "iframe",
      url: "https://lhbk.org/community",
      minSize: { w: 720, h: 480 },
    },
    nextProject: {
      slug: "good-call-technologies",
      title: "Good Call Technologies",
    },
  },
  {
    slug: "good-call-technologies",
    number: "05",
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
    accent: "#a87a4d",
    heroImage: "/screenshots/goodcall-hero.png",
    liveUrl: "https://goodcall.org",
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
    architecture: {
      summary:
        "Twilio TwiML routes incoming precinct calls into a Postgres-backed queue. A Node.js queue manager assigns calls to available operators based on schedule + capacity; the operator dashboard subscribes via Server-Sent Events for live state and uses Twilio's JS SDK for hold/transfer/conference. Failover is layered — if no operator is available, calls escalate through a configured fallback chain (different operator pools, on-call attorneys, voicemail). Call history is logged for compliance reporting.",
    },
    outcomes: [
      {
        metric: "24/7 attorney routing live",
        description:
          "Twilio TwiML + Postgres-backed queue + Node.js queue manager handle precinct call escalation from operator pools to on-call attorneys to voicemail.",
      },
      {
        metric: "Live call controls in browser",
        description:
          "Operator dashboard subscribes via SSE for queue state and uses Twilio's JS SDK for hold, transfer, and conference. No native client required.",
      },
    ],
    whatILearned: [
      "24/7 telephony is unforgiving. Every retry strategy, fallback path, and escalation rule has to be modeled explicitly — there's no 'we'll fix it Monday' for someone in custody.",
      "Operator UX matters more than operator features. Hold, transfer, and conference are the same three buttons every dashboard has — what differentiates ours is how fast they respond under load.",
      "Twilio's SDK abstracts the easy parts; the hard parts (failover, audit logging, custody-specific routing rules) live in your own queue manager. Don't fight Twilio for control of the call; do own the metadata around it.",
    ],
    demo: {
      kind: "video",
      src: "/demos/goodcall-walkthrough.mp4",
      poster: "/demos/goodcall-poster.jpg",
      recordedAt: "",
    },
    nextProject: { slug: "high-tide-capital", title: "High Tide Capital" },
  },
  {
    slug: "high-tide-capital",
    number: "06",
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
    accent: "#6b9bb5",
    heroImage: "/screenshots/hitide-hero.png",
    images: [
      "/screenshots/hitide-flow.png",
      "/screenshots/hitide-products.png",
      "/screenshots/hitide-portal.png",
    ],
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
    architecture: {
      summary:
        "Borrower-facing funnel (intake → identity → eligibility → contract) is a Next.js multi-step form with state persisted in Postgres at each step (so a borrower can resume a session). DocuSign integration runs through their webhook flow — the platform issues envelopes, listens for status changes, and updates loan state via a state machine that mirrors the underwriting team's actual process. Underwriter dashboards read from the same Prisma schema; no reporting database, no ETL.",
    },
    outcomes: [
      {
        metric: "Email + spreadsheets → 1 platform",
        description:
          "Manual borrower-doc collection and offline contracts replaced with a multi-step intake funnel persisted in Postgres after each step.",
      },
      {
        metric: "DocuSign live, reconciled",
        description:
          "Envelope flow runs on DocuSign's webhook with idempotent state transitions plus a reconciliation cron, catching the misses their docs glossed over.",
      },
    ],
    whatILearned: [
      "DocuSign's webhook reliability assumes you're paying attention. Idempotent state transitions + a reconciliation cron caught the misses their docs glossed over.",
      "Multi-step forms are stateful products, not one-off pages. Persisting after each step beats client-side state every time — borrowers refresh, lose connection, or come back days later.",
      "Underwriter workflows are the product. The borrower sees a funnel; the team sees a pipeline. Both views had to be first-class, not one as an afterthought.",
    ],
    demo: {
      kind: "video",
      src: "/demos/hitide-walkthrough.mp4",
      poster: "/demos/hitide-poster.jpg",
      recordedAt: "",
    },
    nextProject: { slug: "zairoo", title: "Zairoo" },
  },
  {
    slug: "zairoo",
    number: "07",
    title: "Zairoo",
    shortDescription:
      "Original Afrocentric TTRPG system. Discord bot + flagship ruleset on Cantrip.",
    category: "Game Design / Bot Infrastructure",
    overview:
      "Zairoo is an original Afrocentric tabletop RPG system that doubles as the flagship ruleset on Cantrip. Two surfaces: a Discord bot (Hono API + discord.js, deployed on Railway) for play-by-message sessions, and a published Cantrip ruleset for full AI-DM-driven play.\n\nThe game system uses a five-stat spread (Grit / Vision / Soul / Vibe / Flow) and a Fate Path progression — designed first as a play-tested system, then implemented as a card-renderer package that produces the printable + digital character cards.",
    challenge:
      "Most original TTRPG systems are PDFs. Zairoo had to ship as software from day one — a Discord bot for low-friction sessions, a card-renderer for character art, and a Cantrip ruleset for AI-mediated play. Each surface had to honor the same canonical rules layer without duplicating logic.",
    role: "Game Designer & Engineer",
    timeline: "Aug 2025 — Ongoing",
    client: "Personal Product",
    tech: ["Hono", "oRPC", "discord.js", "Node.js", "Railway"],
    accent: "#a899d1",
    heroImage: "/screenshots/zairoo-hero.png",
    images: ["/screenshots/zairoo-card.png"],
    features: [
      {
        number: "01",
        title: "Discord Bot",
        description:
          "Hono + oRPC API and discord.js bot deployed on Railway. Players run sessions in any Discord server; the bot handles character creation, dice, and session state persistence.",
      },
      {
        number: "02",
        title: "Card Renderer",
        description:
          "Standalone package that renders Zairoo character cards (stats, fate path, starting move) as PNGs for digital sharing or printing — single source of truth for character visuals across surfaces.",
      },
      {
        number: "03",
        title: "Cantrip Integration",
        description:
          "Same canonical rules layer published as a Cantrip ruleset, unlocking AI-DM-driven play in the browser. The Discord bot and Cantrip both read from the same engine.",
      },
    ],
    architecture: {
      summary:
        "One canonical rules layer (`packages/rules`) feeds three surfaces: the Discord bot (Hono + oRPC API + discord.js), the card-renderer package (HTML→PNG via Playwright for printable / shareable cards), and a Cantrip ruleset registration. Any rules change ships to all three with a single deploy. The bot is on Railway because that's where it runs cheapest as a long-lived process; web/card surfaces deploy on Vercel.",
    },
    outcomes: [
      {
        metric: "1 rules engine, 3 surfaces",
        description:
          "Discord bot (Hono + discord.js on Railway), HTML→PNG card renderer, and Cantrip ruleset all read from packages/rules. One rules change ships everywhere.",
      },
      {
        metric: "Game designed first, shipped as software day one",
        description:
          "Five-stat spread (Grit / Vision / Soul / Vibe / Flow) and Fate Path progression playtested before being implemented as a typed rules package.",
      },
    ],
    whatILearned: [
      "Game design is software design. Forcing the rules into a typed package early kept the Discord and Cantrip surfaces honest — every house-rule edge case became a type problem before it was a player problem.",
      "Multi-surface from a single source costs nothing if the source is the rules. Costs everything if the source is a UI.",
      "Discord's bot UX has hard ceilings. Some interactions (card galleries, fate-path tracking) only land on the web — accept the surface tradeoffs instead of fighting them.",
    ],
    demo: {
      kind: "none",
      reason:
        "Discord-only today. Revisit when the card-renderer ships a public web surface.",
    },
    nextProject: { slug: "forge-bi", title: "Forge BI" },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
