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
import { trackDemo, trackDemoTime } from "@/lib/track";

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
  const ariaLabel = isVideo
    ? `Watch a recorded ${project.title} demo`
    : `Try ${project.title} live in a floating window`;

  const onClick = () => {
    if (isMobile) {
      // Mobile fires its own demo_open; the desktop path fires from the store.
      trackDemo("demo_open", { project: project.slug, kind: demo.kind });
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
        aria-label={ariaLabel}
        data-demo-kind={demo.kind}
        data-demo-slug={project.slug}
        // min-h-11 (44px) keeps the WCAG-recommended touch target.
        className="font-body text-[14px] min-h-11 px-6 py-3 rounded-full border border-[#222] text-[#ccc] hover:border-[#555] hover:text-white transition-colors text-center inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]"
      >
        {isVideo ? <Play size={14} aria-hidden /> : null}
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
  const demo = project.demo;
  // Mobile path doesn't route through the Zustand store, so demo_close +
  // demo_time fire from this effect's cleanup on unmount instead.
  useEffect(() => {
    if (!demo || demo.kind === "none") return;
    const openedAt = Date.now();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      // demo_open fired from the trigger; close + time fire here on unmount.
      trackDemo("demo_close", { project: project.slug, kind: demo.kind });
      trackDemoTime({
        project: project.slug,
        kind: demo.kind,
        seconds: (Date.now() - openedAt) / 1000,
      });
    };
  }, [onClose, demo, project.slug]);

  if (!demo || demo.kind === "none") return null;

  const externalUrl =
    demo.kind === "iframe" ? demo.url : project.liveUrl ?? null;
  const onPopOut = () =>
    trackDemo("demo_pop_out", { project: project.slug, kind: demo.kind });

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
          {demo.kind === "video" && demo.recordedAt ? (
            <span className="text-[11px] text-zinc-500 hidden xs:inline">
              recorded {demo.recordedAt}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {externalUrl ? (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              onClick={onPopOut}
              className="size-11 inline-flex items-center justify-center rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/60"
            >
              <ExternalLink className="size-5" />
            </a>
          ) : null}
          <button
            type="button"
            aria-label="Close demo"
            onClick={onClose}
            className="size-11 inline-flex items-center justify-center rounded-md text-zinc-300 hover:text-zinc-100 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/60"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {demo.kind === "iframe" ? (
          <iframe
            src={demo.url}
            title={`${project.title} demo`}
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            className="w-full h-full border-0 bg-white"
          />
        ) : (
          <video
            src={demo.src}
            poster={demo.poster}
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
