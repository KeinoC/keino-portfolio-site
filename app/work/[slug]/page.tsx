"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LenisProvider } from "@/components/lenis-provider";
import { getProject, projects } from "@/lib/projects";
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

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const nextProject = project.nextProject
    ? getProject(project.nextProject.slug)
    : null;

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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.span
              className="font-body text-[14px] text-[#333] block mb-4"
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
              className="flex flex-wrap gap-12 mt-12 pt-6 border-t border-[#1A1A1A]"
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
            </motion.div>
          </motion.div>
        </section>

        {/* Full-width screenshot placeholder */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
          <motion.div
            className="h-[560px] bg-[#161616] rounded-xl flex items-center justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-body text-[16px] text-[#333]">
              Screenshot
            </span>
          </motion.div>
        </section>

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
                <a
                  href="mailto:keino@keino.dev"
                  className="font-body text-[14px] px-6 py-3 rounded-full bg-white text-[#090909] font-medium hover:bg-[#ddd] transition-colors text-center"
                >
                  Get in touch
                </a>
                <a
                  href="/resume.pdf"
                  className="font-body text-[14px] px-6 py-3 rounded-full border border-[#222] text-[#888] hover:border-[#555] hover:text-white transition-colors text-center"
                >
                  View resume
                </a>
              </div>
            </motion.div>
          </motion.div>
        </section>

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

        {/* Screenshot placeholders */}
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div
              className="h-[360px] bg-[#161616] rounded-xl flex items-center justify-center"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <span className="font-body text-[14px] text-[#333]">
                Screenshot
              </span>
            </motion.div>
            <motion.div
              className="h-[360px] bg-[#161616] rounded-xl flex items-center justify-center"
              variants={fadeUp}
              transition={{ duration: 0.6 }}
            >
              <span className="font-body text-[14px] text-[#333]">
                Screenshot
              </span>
            </motion.div>
          </motion.div>
        </section>

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
              &copy; 2025 Keino Chichester — Brooklyn, NY
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
