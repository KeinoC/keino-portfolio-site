"use client";

/**
 * Dev-only preview for <DemoPiP/>. Lets you cycle dock states and switch
 * between iframe and video modes without case-study coupling.
 *
 * Gated to development — production builds 404 because the page calls
 * `notFound()` when NODE_ENV !== "development".
 */

import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useDemoPip } from "@/lib/demo-pip-store";

const SAMPLE_IFRAME = {
  id: "_dev-iframe",
  title: "Sample iframe demo",
  demo: {
    kind: "iframe" as const,
    url: "https://example.com",
    minSize: { w: 480, h: 320 },
    credentials: { hint: "Sample credential hint shown over the iframe." },
  },
};

const SAMPLE_VIDEO = {
  id: "_dev-video",
  title: "Sample video walkthrough",
  demo: {
    kind: "video" as const,
    // Public sample — Big Buck Bunny via the W3C test pool.
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    poster: "https://www.w3schools.com/html/img_chania.jpg",
    recordedAt: "2026-05",
  },
};

export default function DemoPipDevPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const open = useDemoPip((s) => s.open);
  const close = useDemoPip((s) => s.close);
  const setState = useDemoPip((s) => s.setState);
  const state = useDemoPip((s) => s.state);
  const current = useDemoPip((s) => s.current);

  // Auto-open the iframe sample on page load so something is on screen.
  useEffect(() => {
    if (!current) open(SAMPLE_IFRAME);
  }, [current, open]);

  return (
    <main className="min-h-screen bg-[#0a0a0e] text-zinc-100 p-8">
      <header className="max-w-2xl space-y-2 mb-10">
        <p className="text-[12px] tracking-[2px] uppercase text-zinc-500">
          KEI-021 / dev preview
        </p>
        <h1 className="font-headline text-3xl">DemoPiP playground</h1>
        <p className="text-sm text-zinc-400">
          Drives the store directly. Use this to verify dock states, drag,
          resize, focus trap, and reduced-motion behavior without case-study
          plumbing.
        </p>
      </header>

      <section className="space-y-6 max-w-2xl">
        <Group label="Open">
          <Btn onClick={() => open(SAMPLE_IFRAME)}>iframe sample</Btn>
          <Btn onClick={() => open(SAMPLE_VIDEO)}>video sample</Btn>
        </Group>

        <Group label="Dock state">
          <Btn onClick={() => setState("floating")} disabled={!current}>
            floating
          </Btn>
          <Btn onClick={() => setState("minimized")} disabled={!current}>
            minimized
          </Btn>
          <Btn onClick={() => setState("expanded")} disabled={!current}>
            expanded
          </Btn>
          <Btn onClick={close} disabled={!current}>
            closed
          </Btn>
        </Group>

        <pre className="text-xs text-zinc-500 bg-black/40 px-3 py-2 rounded ring-1 ring-white/5">
          {JSON.stringify({ state, current: current?.id ?? null }, null, 2)}
        </pre>

        <p className="text-xs text-zinc-500">
          Below 768px the PiP renders nothing — KEI-022 will swap in a
          full-screen modal/new tab via the trigger button.
        </p>
      </section>
    </main>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-[2px] uppercase text-zinc-500 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-sm rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed ring-1 ring-white/10 text-zinc-100 transition-colors"
    >
      {children}
    </button>
  );
}
