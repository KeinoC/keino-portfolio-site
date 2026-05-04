"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import { LenisProvider } from "@/components/lenis-provider";
import { DemoTrigger } from "@/components/demo-trigger";
import { getProject } from "@/lib/projects";
import { notFound } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function ProjectClient({ slug }: { slug: string }) {
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const nextProject = project.nextProject
    ? getProject(project.nextProject.slug)
    : null;

  // Filter hero out of supplementary gallery so it isn't displayed twice
  const galleryImages = (project.images ?? []).filter(
    (img) => img !== project.heroImage,
  );

  return (
    <LenisProvider>
      <div className="min-h-screen bg-[#090909] text-white relative">
        {/* Grain overlay */}
        <div className="paper-grain fixed inset-0 z-[100] pointer-events-none opacity-15" />

        {/* Back nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090909]/80 backdrop-blur-md border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="font-headline text-[20px] font-bold text-white tracking-tight"
            >
              KC
            </Link>
            <Link
              href="/#work"
              className="font-body text-[14px] text-[#666] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to work
            </Link>
          </div>
        </nav>

        {/* Project Hero */}
        <section className="pt-32 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              className="font-body text-[14px] block mb-4"
              style={{ color: project.accent ?? "#333" }}
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              {project.number}
            </motion.span>
            <motion.h1
              className="font-headline text-[clamp(48px,8vw,80px)] font-bold text-white leading-[0.95] tracking-[-2px]"
              variants={fadeUp}
              transition={{ duration: 0.8 }}
            >
              {project.title}
            </motion.h1>
            <motion.p
              className="font-body text-[20px] text-[#444] mt-4"
              variants={fadeUp}
              transition={{ duration: 0.8 }}
            >
              {project.category}
            </motion.p>

            {/* Metadata row */}
            <motion.div
              className="flex flex-wrap gap-12 mt-12 pt-6 border-t border-[#1A1A1A] items-end"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="font-body text-[12px] text-[#444] uppercase tracking-[1px] block mb-1">
                  Role
                </span>
                <span className="font-body text-[15px] text-[#999]">
                  {project.role}
                </span>
              </div>
              <div>
                <span className="font-body text-[12px] text-[#444] uppercase tracking-[1px] block mb-1">
                  Timeline
                </span>
                <span className="font-body text-[15px] text-[#999]">
                  {project.timeline}
                </span>
              </div>
              <div>
                <span className="font-body text-[12px] text-[#444] uppercase tracking-[1px] block mb-1">
                  Client
                </span>
                <span className="font-body text-[15px] text-[#999]">
                  {project.client}
                </span>
              </div>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-body text-[13px] text-[#888] hover:text-white px-4 py-2 rounded-full border border-[#222] hover:border-[#444] transition-colors ml-auto"
                >
                  <GithubIcon size={14} />
                  GitHub
                </a>
              )}
            </motion.div>
          </motion.div>
        </section>

        {/* Full-width screenshot */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
          <motion.div
            className="rounded-xl overflow-hidden bg-[#161616]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {project.heroImage ? (
              <Image
                src={project.heroImage}
                alt={`${project.title} screenshot`}
                width={1400}
                height={560}
                priority
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="h-[560px] flex items-center justify-center">
                <span className="font-body text-[16px] text-[#333]">
                  Screenshot
                </span>
              </div>
            )}
          </motion.div>
        </section>

        {/* Outcomes strip */}
        {project.outcomes && project.outcomes.length > 0 && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h3
                className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-10"
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                Outcomes
              </motion.h3>
              <div className="grid md:grid-cols-3 gap-12">
                {project.outcomes.map((o, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="border-t border-[#1A1A1A] pt-6"
                  >
                    <div className="font-headline text-[clamp(40px,5vw,64px)] font-bold text-white leading-[0.95] tracking-[-2px] mb-3">
                      {o.metric}
                    </div>
                    <p className="font-body text-[14px] text-[#666] leading-[1.6]">
                      {o.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Content: Overview + Tech */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
          <motion.div
            className="flex flex-col md:flex-row gap-16 md:gap-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <div className="md:flex-1">
              {project.overview && (
                <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
                  <h3 className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-6">
                    Overview
                  </h3>
                  {project.overview.split("\n\n").map((p, i) => (
                    <p
                      key={i}
                      className="font-body text-[16px] text-[#666] leading-[1.7] mb-6"
                    >
                      {p}
                    </p>
                  ))}
                </motion.div>
              )}
              {project.challenge && (
                <motion.div
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                  className="mt-12"
                >
                  <h3 className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-6">
                    Challenge
                  </h3>
                  <p className="font-body text-[16px] text-[#666] leading-[1.7]">
                    {project.challenge}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right sidebar */}
            <motion.div
              className="md:w-[340px]"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              {project.tech.length > 0 && (
                <div className="mb-12">
                  <h3 className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-4">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="font-body text-[13px] text-[#888] px-4 py-2 rounded-full border border-[#222]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-[14px] px-6 py-3 rounded-full bg-white text-[#090909] font-medium hover:bg-[#ddd] transition-colors text-center flex items-center justify-center gap-2"
                  >
                    View Live
                    <ExternalLink size={14} />
                  </a>
                )}
                <DemoTrigger project={project} />
                <a
                  href="mailto:keino@keino.dev"
                  className="font-body text-[14px] px-6 py-3 rounded-full border border-[#222] text-[#888] hover:border-[#555] hover:text-white transition-colors text-center"
                >
                  Get in touch
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Architecture */}
        {project.architecture && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              className="flex flex-col md:flex-row gap-16 md:gap-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <div className="md:flex-1">
                <motion.h3
                  className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-6"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                >
                  Architecture
                </motion.h3>
                <motion.p
                  className="font-body text-[16px] text-[#666] leading-[1.7]"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                >
                  {project.architecture.summary}
                </motion.p>
              </div>
              {project.architecture.diagramImage && (
                <motion.div
                  className="md:w-[480px] rounded-xl overflow-hidden bg-[#161616] border border-[#1A1A1A]"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={project.architecture.diagramImage}
                    alt={`${project.title} architecture diagram`}
                    width={960}
                    height={540}
                    className="w-full h-auto"
                  />
                </motion.div>
              )}
            </motion.div>
          </section>
        )}

        {/* Key Features */}
        {project.features.length > 0 && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              <motion.h3
                className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-12"
                variants={fadeUp}
                transition={{ duration: 0.6 }}
              >
                Key Features
              </motion.h3>
              <div className="grid md:grid-cols-3 gap-6">
                {project.features.map((feature) => (
                  <motion.div
                    key={feature.number}
                    className="p-8 bg-[#111] rounded-xl border border-[#1A1A1A]"
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="font-body text-[13px] text-[#333] block mb-4">
                      {feature.number}
                    </span>
                    <h4 className="font-headline text-[20px] font-semibold text-white mb-3">
                      {feature.title}
                    </h4>
                    <p className="font-body text-[14px] text-[#666] leading-[1.6]">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Code Snippet — plain styled <pre> for now (Shiki SSR deferred) */}
        {project.codeSnippet && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-3">
                Code
              </h3>
              <h4 className="font-headline text-[24px] font-semibold text-white mb-6">
                {project.codeSnippet.title}
              </h4>
              <pre className="rounded-xl border border-[#1A1A1A] bg-[#0c0c0c] p-6 overflow-x-auto text-[13px] leading-[1.7]">
                <code className="font-mono text-[#c9d1d9]">
                  {project.codeSnippet.code}
                </code>
              </pre>
              {project.codeSnippet.caption && (
                <p className="font-body text-[14px] text-[#555] mt-4 italic">
                  {project.codeSnippet.caption}
                </p>
              )}
            </motion.div>
          </section>
        )}

        {/* Image gallery (filters out hero) */}
        {galleryImages.length > 0 && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              className={`grid gap-6 ${galleryImages.length === 1 ? "" : "md:grid-cols-2"}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
            >
              {galleryImages.map((img, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl overflow-hidden bg-[#161616]"
                  variants={fadeUp}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src={img}
                    alt={`${project.title} screenshot ${i + 1}`}
                    width={1400}
                    height={720}
                    className="w-full h-auto object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* What I Learned */}
        {project.whatILearned && project.whatILearned.length > 0 && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="rounded-xl border border-[#1A1A1A] bg-[#0c0c0c] p-8 md:p-12"
            >
              <h3 className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase mb-8">
                What I Learned
              </h3>
              <ul className="flex flex-col gap-4">
                {project.whatILearned.map((item, i) => (
                  <li
                    key={i}
                    className="font-body text-[16px] text-[#999] leading-[1.7] pl-6 relative before:content-['—'] before:absolute before:left-0 before:top-0 before:text-[#444]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </section>
        )}

        {/* Next Project */}
        {nextProject && (
          <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href={`/work/${nextProject.slug}`}
                className="group flex items-center justify-between py-8 border-t border-b border-[#1A1A1A]"
              >
                <div>
                  <span className="font-body text-[12px] text-[#444] uppercase tracking-[1px] block mb-2">
                    Next Project
                  </span>
                  <span className="font-headline text-[32px] font-semibold text-white">
                    {nextProject.title}
                  </span>
                </div>
                <ArrowRight
                  size={24}
                  className="text-[#333] transition-transform duration-300 group-hover:translate-x-2"
                />
              </Link>
            </motion.div>
          </section>
        )}

        {/* Footer */}
        <footer className="px-6 md:px-12 max-w-[1400px] mx-auto py-8 border-t border-[#1A1A1A]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="font-body text-[13px] text-[#444]">
              &copy; {new Date().getFullYear()} Keino Chichester — Brooklyn, NY
            </span>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com/keinoc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#444] hover:text-white transition-colors"
              >
                <span className="font-body text-[13px]">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/keinochichester"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#444] hover:text-white transition-colors"
              >
                <span className="font-body text-[13px]">LinkedIn</span>
              </a>
              <a
                href="mailto:keino@keino.dev"
                className="text-[#444] hover:text-white transition-colors"
              >
                <span className="font-body text-[13px]">Email</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </LenisProvider>
  );
}
