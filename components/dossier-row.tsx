"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { Project } from "@/lib/projects";

function deriveYear(timeline: string): string {
  const m = timeline.match(/(20\d{2})/);
  return m ? m[1] : timeline.split(" ")[0];
}

function statusFor(p: Project): { label: string; live: boolean } {
  const ongoing = /Ongoing/i.test(p.timeline);
  if (p.liveUrl) return { label: ongoing ? "Live · in dev" : "Live", live: true };
  if (ongoing) return { label: "In development", live: false };
  return { label: "Shipped", live: false };
}

export function DossierRow({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const status = statusFor(project);
  const year = deriveYear(project.timeline);
  const accent = project.accent ?? "#888";

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const row = rowRef.current;
    if (!row) return;
    const rect = row.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block"
      aria-label={`${project.title} — read full case study`}
    >
      <article
        ref={rowRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0c0c0c] transition-[border-color,background-color] duration-500 hover:bg-[#101010] hover:border-[#2a2a2a]"
      >
        {/* Cursor-following glow — dialed back vs grid card (12% alpha) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-xl transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(640px circle at ${glowPos.x}% ${glowPos.y}%, ${accent}1F, transparent 60%)`,
          }}
        />

        <div className="relative z-10 grid gap-6 p-5 md:grid-cols-12 md:gap-8 md:p-6">
          {/* LEFT: thumb + role + meta + status */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#161616]">
              {project.heroImage ? (
                <Image
                  src={project.heroImage}
                  alt={project.title}
                  fill
                  priority={priority}
                  className="object-cover object-top transition-transform duration-700"
                  style={{
                    transform: hovered ? "scale(1.02)" : "scale(1)",
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 42vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-headline text-[18px] text-[#333] font-semibold">
                    {project.title}
                  </span>
                </div>
              )}
              {/* Bottom mask — fades into row chrome */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0c0c0c]/80 to-transparent" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="font-body text-[10.5px] uppercase tracking-[1.5px] truncate"
                  style={{ color: accent }}
                >
                  {project.role}
                </span>
                <span className="font-body text-[11px] text-[#555] tabular-nums shrink-0">
                  {year}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-body text-[12px] text-[#666] truncate">
                  {project.client}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    aria-hidden
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
              </div>
            </div>
          </div>

          {/* RIGHT: category + title + description + architecture + tech + outcomes + CTA */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <span
                className="font-body text-[11px] uppercase tracking-[1.5px]"
                style={{ color: accent }}
              >
                {project.category}
              </span>
              <span className="font-body text-[10.5px] text-[#444] tabular-nums">
                {project.number}
              </span>
            </div>

            <h3 className="font-headline text-[26px] md:text-[28px] font-semibold text-white leading-tight tracking-tight">
              {project.title}
            </h3>

            <p className="font-body text-[14px] text-[#888] leading-[1.6]">
              {project.shortDescription}
            </p>

            {project.architecture?.summary && (
              <p className="font-body text-[13px] text-[#666] leading-[1.65] line-clamp-3">
                {project.architecture.summary}
              </p>
            )}

            {/* Tech — full stack, no truncation */}
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="font-body text-[10.5px] px-2 py-0.5 rounded-full border bg-[#0d0d0d]"
                  style={{
                    borderColor: hovered ? `${accent}55` : "#1f1f1f",
                    color: hovered ? "#cfcfcf" : "#777",
                    transition:
                      "border-color 350ms ease, color 350ms ease",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Outcomes */}
            {project.outcomes && project.outcomes.length > 0 && (
              <ul className="flex flex-col gap-2.5 mt-1 pt-3 border-t border-[#161616]">
                {project.outcomes.map((o) => (
                  <li key={o.metric} className="flex flex-col gap-0.5">
                    <span
                      className="font-headline text-[13px] font-semibold leading-snug"
                      style={{ color: hovered ? "#e8e8e8" : "#cfcfcf" }}
                    >
                      {o.metric}
                    </span>
                    <span className="font-body text-[12.5px] text-[#777] leading-[1.55]">
                      {o.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {/* CTA */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#161616]">
              <span
                className="font-body text-[12.5px] text-[#888] group-hover:text-white transition-colors duration-300"
              >
                Read full case study
              </span>
              <ArrowUpRight
                size={16}
                className="text-[#666] group-hover:text-white"
                style={{
                  transform: hovered ? "translate(2px, -2px)" : "translate(0, 0)",
                  transition: "transform 350ms ease, color 200ms ease",
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom edge accent gradient on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-px z-30 transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `linear-gradient(90deg, transparent 8%, ${accent} 50%, transparent 92%)`,
          }}
        />
      </article>
    </Link>
  );
}
