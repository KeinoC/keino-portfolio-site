import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { projects, type Project } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work — Keino Chichester",
  description:
    "Selected projects spanning AI, fintech, lending, telecom, and community ops. Seven case studies, fully documented architecture and what I learned.",
  alternates: { canonical: "/work" },
  openGraph: {
    title: "Work — Keino Chichester",
    description:
      "Selected projects spanning AI, fintech, lending, telecom, and community ops.",
    url: "/work",
    type: "website",
  },
};

function deriveYear(timeline: string): string {
  // Extract first 4-digit year token from timeline
  const m = timeline.match(/(20\d{2})/);
  return m ? m[1] : timeline.split(" ")[0];
}

function statusFor(p: Project): { label: string; live: boolean } {
  const ongoing = /Ongoing/i.test(p.timeline);
  if (p.liveUrl) return { label: ongoing ? "Live · in dev" : "Live", live: true };
  if (ongoing) return { label: "In development", live: false };
  return { label: "Shipped", live: false };
}

function ProjectCard({ project }: { project: Project }) {
  const status = statusFor(project);
  const year = deriveYear(project.timeline);
  const accent = project.accent ?? "#888";
  const techDisplay = project.tech.slice(0, 4);
  const techMore = Math.max(0, project.tech.length - techDisplay.length);

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex flex-col rounded-xl border border-[#1A1A1A] bg-[#0c0c0c] hover:bg-[#101010] hover:border-[#2a2a2a] transition-colors overflow-hidden"
    >
      {/* Thumb */}
      <div className="relative aspect-[16/10] bg-[#161616] overflow-hidden">
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline text-[20px] text-[#333] font-semibold">
              {project.title}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between">
          <span
            className="font-body text-[11px] uppercase tracking-[1.5px]"
            style={{ color: accent }}
          >
            {project.category}
          </span>
          <span className="font-body text-[11px] text-[#555] tabular-nums">
            {year}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-headline text-[22px] font-semibold text-white leading-tight">
          {project.title}
        </h3>

        {/* Description */}
        <p className="font-body text-[13px] text-[#666] leading-[1.55] line-clamp-2">
          {project.shortDescription}
        </p>

        {/* Tech chips */}
        <div className="flex flex-wrap gap-1.5">
          {techDisplay.map((t) => (
            <span
              key={t}
              className="font-body text-[10px] text-[#777] px-2 py-0.5 rounded-full border border-[#1f1f1f] bg-[#0d0d0d]"
            >
              {t}
            </span>
          ))}
          {techMore > 0 && (
            <span className="font-body text-[10px] text-[#555] px-2 py-0.5">
              +{techMore}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: status.live ? accent : "#444",
                boxShadow: status.live ? `0 0 6px ${accent}` : "none",
              }}
            />
            <span className="font-body text-[11px] text-[#777]">
              {status.label}
            </span>
          </div>
          <ArrowUpRight
            size={14}
            className="text-[#555] group-hover:text-white transition-colors"
          />
        </div>
      </div>
    </Link>
  );
}

export default function WorkIndex() {
  const liveCount = projects.filter((p) => p.liveUrl).length;
  const stacks = new Set(projects.flatMap((p) => p.tech)).size;

  return (
    <div className="min-h-screen bg-[#090909] text-white relative">
      {/* Grain overlay */}
      <div className="paper-grain fixed inset-0 z-[100] pointer-events-none opacity-15" />

      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#090909]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-headline text-[20px] font-bold text-white tracking-tight"
          >
            KC
          </Link>
          <Link
            href="/"
            className="font-body text-[14px] text-[#666] hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="font-headline text-[14px] text-[#444] tracking-[2px] uppercase block mb-4">
              All Projects
            </span>
            <h1 className="font-headline text-[clamp(40px,7vw,72px)] font-bold text-white leading-[0.95] tracking-[-2px]">
              Work
            </h1>
          </div>

          {/* Stat strip */}
          <div className="flex items-center gap-8 md:gap-12">
            <Stat value={projects.length} label="Projects" />
            <Stat value={liveCount} label="Live" />
            <Stat value={stacks} label="Stacks" />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-32">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </section>

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
              className="text-[#444] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span className="font-body text-[13px]">Email</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-end md:items-start">
      <span className="font-headline text-[32px] md:text-[40px] font-semibold text-white leading-none tabular-nums">
        {value}
      </span>
      <span className="font-body text-[11px] text-[#555] uppercase tracking-[1.5px] mt-1">
        {label}
      </span>
    </div>
  );
}
