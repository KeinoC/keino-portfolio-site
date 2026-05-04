"use client";

/**
 * <DemoTrigger/> — case-study CTA that opens the project demo in either
 * the floating PiP (>=768px) or a full-screen mobile modal (<768px).
 *
 * Hides itself when project.demo is missing or kind === "none".
 *
 * Desktop: calls useDemoPip().open(...) — the persistent <DemoPiP/>
 * mounted in the root layout takes over.
 *
 * Mobile: renders a local fullscreen overlay with the same iframe or
 * video — no drag/resize, just a close button. Visitors stay on the
 * case-study page (per AC: do NOT spawn a new tab).
 */

import { useEffect, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import type { Project } from "@/lib/projects";
import { useDemoPip, type ActiveDemo } from "@/lib/demo-pip-store";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export function DemoTrigger({ project }: { project: Project }) {
  const isMobile = useIsMobile();
  const open = useDemoPip((s) => s.open);
  const [mobileModal, setMobileModal] = useState(false);

  const demo = project.demo;
  if (!demo || demo.kind === "none") return null;

  const isVideo = demo.kind === "video";
  const label = isVideo ? "Watch demo" : "Try it live";

  const onClick = () => {
    if (isMobile) {
      setMobileModal(true);
      return;
    }
    const active: ActiveDemo = {
      id: project.slug,
      title: project.title,
      liveUrl: project.liveUrl,
      demo,
    };
    open(active);
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        data-demo-kind={demo.kind}
        data-demo-slug={project.slug}
        className="font-body text-[14px] px-6 py-3 rounded-full border border-[#222] text-[#ccc] hover:border-[#555] hover:text-white transition-colors text-center inline-flex items-center justify-center gap-2"
      >
        {isVideo ? <Play size={14} /> : null}
        {label}
      </button>
      {mobileModal ? (
        <MobileModal
          project={project}
          onClose={() => setMobileModal(false)}
        />
      ) : null}
    </>
  );
}

function MobileModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  // Lock body scroll while the modal is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!project.demo || project.demo.kind === "none") return null;

  const externalUrl =
    project.demo.kind === "iframe" ? project.demo.url : project.liveUrl ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} demo`}
      className="fixed inset-0 z-[120] bg-[#0a0a0e] text-zinc-100 flex flex-col"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0a0a0e]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full bg-emerald-400/80 shrink-0" aria-hidden />
          <h2 className="font-headline text-[13px] tracking-wide truncate">
            {project.title}
          </h2>
          {project.demo.kind === "video" && project.demo.recordedAt ? (
            <span className="text-[11px] text-zinc-500 hidden xs:inline">
              recorded {project.demo.recordedAt}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-0.5">
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              className="size-9 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
            >
              <ExternalLink className="size-4" />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="Close demo"
            onClick={onClose}
            className="size-9 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {project.demo.kind === "iframe" ? (
          <iframe
            src={project.demo.url}
            title={`${project.title} demo`}
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <video
            src={project.demo.src}
            poster={project.demo.poster}
            controls
            playsInline
            autoPlay
            muted={false}
            className="w-full h-full object-contain bg-black"
            aria-label={`${project.title} walkthrough recording`}
          />
        )}
      </div>
    </div>
  );
}
