"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { LenisProvider } from "@/components/lenis-provider";
import { Nav } from "@/components/nav";
import { projects } from "@/lib/projects";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const experience = [
  {
    role: "Software Engineer",
    company: "Goodvibes Consultation",
    dates: "Jun 2024 – Present",
    summary:
      "Built Twilio voice routing, underwriting platforms, and shared component libraries across multiple client engagements — Good Call Technology, HiTide Capital, and We Build Solutions.",
    highlights: [
      "Twilio voice routing with call flow logic and queue management for 24/7 attorney connections",
      "Borrower validation and DocuSign contract flow for HiTide Capital\u2019s underwriting platform",
      "Shared React/TypeScript component library used across 3 property management sites",
      "Storyblok CMS integration and CI/CD pipeline with GitHub Actions",
    ],
  },
  {
    role: "Software Engineer",
    company: "SPILL",
    dates: "Aug 2023 – May 2024",
    summary:
      "Contributed to a 4-person engineering team during beta launch. Built internal tooling and fixed critical privacy bugs.",
    highlights: [
      "AWS Lambda Slack bot for beta invite code management, saving ~5 hours/week",
      "Fixed bidirectional blocking bug in user privacy system with full test coverage",
      "Code reviews, test writing, and sprint planning in Linear",
    ],
  },
  {
    role: "Software Engineer",
    company: "ListedB",
    dates: "Apr 2023 – Aug 2023",
    summary:
      "Built core marketplace features — public API endpoints, admin tooling, and booking flows. Shipped 15+ features in 5 months.",
    highlights: [
      "Public API endpoints for unauthenticated profile browsing and service booking",
      "Retool admin dashboard for ops team via Stytch authentication API",
      "15+ features including profile enhancements, booking flows, and search improvements",
    ],
  },
  {
    role: "Senior Financial Analyst",
    company: "Pager Inc.",
    dates: "May 2022 – Dec 2022",
    summary:
      "Financial modeling for actual vs. budget analysis, revenue recognition, and sales pipeline forecasting. Built KPI dashboards that improved cross-functional efficiency by 20%.",
  },
  {
    role: "Financial Analyst",
    company: "National Health Rehabilitation",
    dates: "Feb 2021 – Apr 2022",
    summary:
      "Introduced Tableau to the company, reducing monthly data processing from 3 days to 4 hours. Built KPI models for physician visit trends and patient volume.",
  },
  {
    role: "Senior Financial Analyst",
    company: "VNSNY Choice Health Plan",
    dates: "Jan 2019 – Nov 2021",
    summary:
      "Led annual budgeting with Adaptive Planning (Workday). Built automated dashboards for KPI reporting, reducing manual report prep by 25%.",
  },
  {
    role: "Financial Analyst",
    company: "NYU Langone Health",
    dates: "Jan 2017 – Jan 2019",
    summary:
      "Created self-sustaining financial models for the hospital, medical school, and 14 affiliates — models still in active use. Automated journal entry workflows.",
  },
  {
    role: "Insurance & Real Estate Analyst",
    company: "Hospital for Special Surgery",
    dates: "Mar 2015 – Jan 2017",
    summary:
      "Built commercial real estate financial models using rent-roll and CAM analysis. Systematized insurance renewal process, improving efficiency by 30%.",
  },
];

function ExperienceRow({
  exp,
  variants,
}: {
  exp: (typeof experience)[number];
  variants: typeof fadeUp;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-[#1A1A1A] cursor-pointer select-none"
      variants={variants}
      transition={{ duration: 0.5 }}
      onClick={() => setOpen((o) => !o)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <span className="font-headline text-[28px] font-semibold text-white">
            {exp.role}
          </span>
          <ChevronDown
            size={18}
            className={`text-[#444] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
        <div className="flex items-center gap-8 mt-2 md:mt-0">
          <span className="font-body text-[16px] text-[#555]">
            {exp.company}
          </span>
          <span className="font-body text-[14px] text-[#444]">
            {exp.dates}
          </span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6">
              <p className="font-body text-[15px] text-[#666] leading-[1.7] max-w-[720px]">
                {exp.summary}
              </p>
              {"highlights" in exp && exp.highlights && (
                <ul className="mt-4 flex flex-col gap-2">
                  {exp.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="font-body text-[14px] text-[#555] leading-[1.6] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[10px] before:w-[6px] before:h-[6px] before:rounded-full before:bg-[#333]"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Home() {
  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#090909] text-white relative">
        {/* Grain overlay */}
        <div className="paper-grain fixed inset-0 z-[100] pointer-events-none opacity-15" />

        <Nav />

        {/* Hero */}
        <section className="min-h-screen flex items-center px-6 md:px-12 max-w-[1400px] mx-auto pt-16">
          <motion.div
            className="w-full flex flex-col md:flex-row md:items-end md:justify-between gap-12"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <div>
              <motion.h1
                className="font-headline text-[clamp(56px,10vw,96px)] font-bold text-white leading-[0.95] tracking-[-3px]"
                variants={fadeUp}
                transition={{ duration: 0.8 }}
              >
                Keino
                <br />
                Chichester
              </motion.h1>
              <motion.p
                className="mt-6 font-body text-[20px] text-[#444] tracking-[1px] uppercase"
                variants={fadeUp}
                transition={{ duration: 0.8 }}
              >
                Product Engineer
              </motion.p>
            </div>
            <motion.div
              className="max-w-[380px] md:text-right"
              variants={fadeUp}
              transition={{ duration: 0.8 }}
            >
              <p className="font-body text-[16px] text-[#666] leading-relaxed">
                3+ years building production web apps.
                <br />
                8 years in healthcare finance.
                <br />
                Code meets business context.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Selected Work */}
        <section id="work" className="px-6 md:px-12 max-w-[1400px] mx-auto py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.span
              className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase block mb-12"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              Selected Work
            </motion.span>
            <div className="flex flex-col gap-[2px]">
            {projects.map((project) => (
              <motion.div key={project.slug} variants={fadeUp} transition={{ duration: 0.6 }}>
                <Link href={`/work/${project.slug}`} className="group block">
                  <div className="h-[400px] bg-[#141414] rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-headline text-[24px] text-[#333] font-semibold">
                        {project.title}
                      </span>
                    </div>
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="flex items-center justify-between py-5">
                    <div className="flex items-center gap-6">
                      <span className="font-body text-[14px] text-[#333] tabular-nums">
                        {project.number}
                      </span>
                      <span className="font-headline text-[28px] font-semibold text-white">
                        {project.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-body text-[13px] text-[#444]">
                        {project.category}
                      </span>
                      <ArrowUpRight
                        size={20}
                        className="text-[#333] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            </div>
          </motion.div>
        </section>

        {/* About */}
        <section id="about" className="px-6 md:px-12 max-w-[1400px] mx-auto py-32">
          <motion.div
            className="flex flex-col md:flex-row gap-16 md:gap-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <div className="md:flex-1">
              <motion.span
                className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase block mb-8"
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                About
              </motion.span>
              <motion.h2
                className="font-headline text-[clamp(32px,5vw,48px)] font-semibold text-white leading-[1.1]"
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                I build things that make
                <br />
                businesses work better.
              </motion.h2>
            </div>
            <motion.div
              className="md:w-[480px]"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <p className="font-body text-[16px] text-[#666] leading-[1.7] mb-6">
                I&apos;m a software engineer with a background in healthcare
                finance. Before writing code professionally, I spent 8 years as
                a financial analyst at organizations like NYU Langone and Pager
                Inc., where I learned how businesses actually operate — budgets,
                forecasts, variance analysis, the works.
              </p>
              <p className="font-body text-[16px] text-[#666] leading-[1.7]">
                Now I combine that domain expertise with full-stack development.
                I build tools that solve real business problems — not just
                technically sound software, but products that make sense to the
                people using them.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* Experience */}
        <section id="experience" className="px-6 md:px-12 max-w-[1400px] mx-auto py-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.span
              className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase block mb-12"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              Experience
            </motion.span>
            <div className="border-t border-[#1A1A1A]">
              {experience.map((exp, i) => (
                <ExperienceRow key={i} exp={exp} variants={fadeUp} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section id="contact" className="px-6 md:px-12 max-w-[1400px] mx-auto py-32 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2
              className="font-headline text-[clamp(40px,8vw,72px)] font-semibold text-white"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              Let&apos;s work together.
            </motion.h2>
            <motion.p
              className="font-body text-[18px] text-[#555] mt-6 mb-12"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              Have a project in mind? I&apos;m currently available for freelance
              work.
            </motion.p>
            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <a
                href="mailto:keino@keino.dev"
                className="font-body text-[14px] px-8 py-3 rounded-full bg-white text-[#090909] font-medium hover:bg-[#ddd] transition-colors"
              >
                Get in touch
              </a>
              <a
                href="/resume.pdf"
                className="font-body text-[14px] px-8 py-3 rounded-full border border-[#222] text-[#888] hover:border-[#555] hover:text-white transition-colors"
              >
                View resume
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 max-w-[1400px] mx-auto py-8 border-t border-[#1A1A1A]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-body text-[13px] text-[#444]">
              &copy; 2025 Keino Chichester — Brooklyn, NY
            </span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/keinoc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#444] hover:text-white transition-colors"
              >
                <GithubIcon size={18} />
              </a>
              <a
                href="https://linkedin.com/in/keinochichester"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#444] hover:text-white transition-colors"
              >
                <LinkedinIcon size={18} />
              </a>
              <a
                href="mailto:keino@keino.dev"
                className="text-[#444] hover:text-white transition-colors"
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  );
}
