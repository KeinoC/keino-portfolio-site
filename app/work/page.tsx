import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { projects } from "@/lib/projects";
import { WorkCard } from "@/components/work-card";

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
            <WorkCard key={p.slug} project={p} />
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
