"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";

const TEXT_VARIANTS = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const segmentProgress = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const segmentSize = 1 / projects.length;
    const newIndex = Math.min(
      Math.floor(v / segmentSize),
      projects.length - 1
    );
    const withinSegment = (v - newIndex * segmentSize) / segmentSize;
    segmentProgress.set(withinSegment);

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  const scrollToProject = useCallback((index: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = rect.height;
    const segmentSize = sectionHeight / projects.length;
    const targetScroll = sectionTop + index * segmentSize + segmentSize * 0.1;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  const activeProject = projects[activeIndex];

  return (
    <section id="work" ref={sectionRef} style={{ height: `${projects.length * 85}vh` }}>
      <div className="sticky top-0 h-screen flex items-center px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="w-full">
          <span className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase block mb-6 md:mb-10">
            Selected Work
          </span>

          {/* Desktop: side-by-side */}
          <div className="hidden md:grid md:grid-cols-3 gap-12 relative">
            {/* Left Panel — Project Info */}
            <div className="col-span-1 flex flex-col justify-between min-h-[400px]">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject.slug}
                    variants={TEXT_VARIANTS}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-body text-[14px] text-[#333] tabular-nums">
                        {activeProject.number}
                      </span>
                      <span className="font-headline text-[32px] font-semibold text-white">
                        {activeProject.title}
                      </span>
                    </div>

                    <p className="font-body text-[15px] text-[#666] leading-[1.7] mb-6 max-w-[360px]">
                      {activeProject.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {activeProject.tech.map((t) => (
                        <span
                          key={t}
                          className="font-body text-[11px] text-[#555] px-3 py-1 rounded-full border border-[#222] bg-[#0D0D0D]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/work/${activeProject.slug}`}
                      className="inline-flex items-center gap-2 font-body text-[14px] text-[#888] hover:text-white transition-colors group"
                    >
                      View Project
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Panel — Stacked Cards */}
            <div className="col-span-2 relative h-[420px]">
              {projects.map((project, i) => {
                const offset = i - activeIndex;
                if (offset < -1 || offset > 2) return null;
                return (
                  <CardWrapper
                    key={project.slug}
                    project={project}
                    offset={offset}
                    segmentProgress={segmentProgress}
                  />
                );
              })}
            </div>

            {/* Side Indicator — Vertical, outside cards */}
            <div className="flex flex-col items-end gap-4 absolute -right-14 top-1/2 -translate-y-1/2 z-40">
              {projects.map((project, i) => (
                <button
                  key={i}
                  onClick={() => scrollToProject(i)}
                  aria-label={`Go to ${project.title}`}
                  className="flex items-center gap-3 group/dot"
                >
                  <span className="font-body text-[12px] text-[#555] group-hover/dot:text-white opacity-0 group-hover/dot:opacity-100 translate-x-2 group-hover/dot:translate-x-0 transition-all duration-200 whitespace-nowrap pointer-events-none">
                    {project.title}
                  </span>
                  <span
                    className={`rounded-full transition-all duration-300 block ${
                      i === activeIndex
                        ? "bg-white w-2.5 h-8"
                        : "bg-[#444] group-hover/dot:bg-white w-2.5 h-2.5"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: card on top, info below */}
          <div className="md:hidden flex flex-col gap-4">
            {/* Cards */}
            <div className="relative h-[240px]">
              {projects.map((project, i) => {
                const offset = i - activeIndex;
                if (offset < -1 || offset > 2) return null;
                return (
                  <CardWrapper
                    key={project.slug}
                    project={project}
                    offset={offset}
                    segmentProgress={segmentProgress}
                  />
                );
              })}
            </div>

            {/* Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.slug}
                variants={TEXT_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-body text-[13px] text-[#333] tabular-nums">
                    {activeProject.number}
                  </span>
                  <span className="font-headline text-[24px] font-semibold text-white">
                    {activeProject.title}
                  </span>
                </div>
                <p className="font-body text-[14px] text-[#666] leading-[1.6] mb-3">
                  {activeProject.shortDescription}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {activeProject.tech.map((t) => (
                    <span
                      key={t}
                      className="font-body text-[10px] text-[#555] px-2.5 py-0.5 rounded-full border border-[#222] bg-[#0D0D0D]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/work/${activeProject.slug}`}
                  className="inline-flex items-center gap-2 font-body text-[13px] text-[#888] hover:text-white transition-colors"
                >
                  View Project
                  <ArrowUpRight size={14} />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center gap-3 mt-2">
              {projects.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToProject(i)}
                  aria-label={`Go to ${projects[i].title}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "bg-white w-6 h-2"
                      : "bg-[#333] hover:bg-[#555] w-2 h-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Scroll-driven card transforms. All motion is continuous via useTransform.
 * The tint overlay opacity is also scroll-driven to prevent flash on transition.
 */
function CardWrapper({
  project,
  offset,
  segmentProgress,
}: {
  project: (typeof projects)[number];
  offset: number;
  segmentProgress: ReturnType<typeof useMotionValue<number>>;
}) {
  const isActive = offset === 0;
  const isLeaving = offset < 0;

  const y = useTransform(segmentProgress, [0, 1], (() => {
    if (isLeaving) return [-30, -30];
    if (isActive) return [0, -12];
    if (offset === 1) return [32, 14];
    return [56, 42];
  })());

  const scale = useTransform(segmentProgress, [0, 1], (() => {
    if (isLeaving) return [0.88, 0.88];
    if (isActive) return [1, 0.97];
    if (offset === 1) return [0.95, 0.97];
    return [0.9, 0.92];
  })());

  const cardOpacity = useTransform(segmentProgress, [0, 1], (() => {
    if (isLeaving) return [0, 0];
    if (isActive) return [1, 0.85];
    if (offset === 1) return [0.7, 0.85];
    return [0.4, 0.5];
  })());

  // Scroll-driven tint: active card lightens as it scrolls, next card lightens as it approaches
  const tintOpacity = useTransform(segmentProgress, [0, 1], (() => {
    if (isLeaving) return [0.6, 0.6];
    if (isActive) return [0.15, 0.35];   // starts light, darkens as leaving
    if (offset === 1) return [0.6, 0.25]; // starts dark, lightens as approaching
    return [0.65, 0.6];
  })());

  const zIndex = isLeaving ? 0 : isActive ? 30 : offset === 1 ? 20 : 10;

  return (
    <motion.div
      className={`absolute inset-0 rounded-xl overflow-hidden ${
        !isActive ? "ring-1 ring-white/20" : ""
      }`}
      style={{ y, scale, opacity: cardOpacity, zIndex, transformOrigin: "center bottom" }}
    >
      <CardInner project={project} isActive={isActive} tintOpacity={tintOpacity} />
    </motion.div>
  );
}

function CardInner({
  project,
  isActive,
  tintOpacity,
}: {
  project: (typeof projects)[number];
  isActive: boolean;
  tintOpacity: ReturnType<typeof useTransform<number, number>>;
}) {
  return (
    <div className="relative w-full h-full group">
      {project.heroImage ? (
        <>
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 66vw"
          />
          <motion.div className="absolute inset-0 bg-[#090909]" style={{ opacity: tintOpacity }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#141414] flex items-center justify-center">
          <span className="font-headline text-[24px] text-[#333] font-semibold">
            {project.title}
          </span>
        </div>
      )}
      {isActive && (
        <Link
          href={`/work/${project.slug}`}
          className="absolute inset-0 flex items-center justify-center bg-[#090909]/0 group-hover:bg-[#090909]/40 transition-colors duration-300"
        >
          <span className="font-body text-[14px] text-white px-6 py-2.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
            View Project
            <ArrowUpRight size={14} />
          </span>
        </Link>
      )}
    </div>
  );
}
