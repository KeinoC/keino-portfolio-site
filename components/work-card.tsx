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

export function WorkCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const status = statusFor(project);
  const year = deriveYear(project.timeline);
  const accent = project.accent ?? "#888";
  const techDisplay = project.tech.slice(0, 4);
  const techMore = Math.max(0, project.tech.length - techDisplay.length);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 8,
      rotateY: (x - 0.5) * 8,
    });
    setGlowPos({ x: x * 100, y: y * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <Link href={`/work/${project.slug}`} className="group block h-full">
      <div
        ref={cardRef}
        className="relative flex h-full flex-col overflow-hidden rounded-xl border border-[#1A1A1A] bg-[#0c0c0c] transition-[border-color,background-color] duration-500 hover:bg-[#101010] hover:border-[#2a2a2a]"
        style={{
          transform: hovered
            ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          transition: hovered
            ? "transform 120ms ease-out, border-color 500ms, background-color 500ms"
            : "transform 500ms ease-out, border-color 500ms, background-color 500ms",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cursor-following accent glow */}
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-xl transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(420px circle at ${glowPos.x}% ${glowPos.y}%, ${accent}24, transparent 60%)`,
          }}
        />

        {/* Thumb */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#161616]">
          <div
            className="absolute inset-0"
            style={{
              transform: hovered
                ? "scale(1.03) rotateY(0deg)"
                : "scale(1) rotateY(-3deg)",
              transformOrigin: "center center",
              transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {project.heroImage ? (
              <Image
                src={project.heroImage}
                alt={project.title}
                fill
                className="object-cover object-top"
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

          {/* Atmospheric mask — fades screenshot into card chrome */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/50 to-transparent" />

          {/* Accent flash at thumb top edge on hover */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-500"
            style={{
              opacity: hovered ? 1 : 0,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
            }}
          />
        </div>

        {/* Body */}
        <div className="relative z-10 flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <span
              className="font-body text-[11px] uppercase tracking-[1.5px] transition-colors duration-500"
              style={{ color: accent }}
            >
              {project.category}
            </span>
            <span className="font-body text-[11px] text-[#555] tabular-nums">
              {year}
            </span>
          </div>

          <h3 className="font-headline text-[22px] font-semibold text-white leading-tight">
            {project.title}
          </h3>

          <p className="font-body text-[13px] text-[#666] leading-[1.55] line-clamp-2">
            {project.shortDescription}
          </p>

          {/* Tech chips — borders + text tint shift toward accent on hover, staggered */}
          <div className="flex flex-wrap gap-1.5">
            {techDisplay.map((t, i) => (
              <span
                key={t}
                className="font-body text-[10px] px-2 py-0.5 rounded-full border bg-[#0d0d0d]"
                style={{
                  transitionDelay: `${i * 40}ms`,
                  borderColor: hovered ? `${accent}55` : "#1f1f1f",
                  color: hovered ? "#cfcfcf" : "#777",
                  transition:
                    "border-color 350ms ease, color 350ms ease, background-color 350ms ease",
                }}
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

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#1A1A1A]">
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
              className="text-[#555] group-hover:text-white"
              style={{
                transform: hovered ? "translate(2px, -2px)" : "translate(0, 0)",
                transition: "transform 350ms ease, color 200ms ease",
              }}
            />
          </div>
        </div>

        {/* Bottom edge accent gradient on hover */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-px z-30 transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)`,
          }}
        />
      </div>
    </Link>
  );
}
