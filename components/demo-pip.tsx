"use client";

/**
 * <DemoPiP/> — portal-rendered Picture-in-Picture player for case-study demos.
 *
 * Modes      : iframe (interactive demo) and video (recorded walkthrough).
 * Dock states: closed | floating | minimized | expanded.
 * Drag       : Framer Motion drag bounds clamped to viewport.
 * Resize     : bottom-right corner handle, demo.minSize aware, capped at 90vw/90vh.
 * A11y       : focus trap when expanded, ESC restores/closes, reduced-motion respected.
 * Persistence: position + size stored in sessionStorage so route changes don't reset.
 *
 * State container : `useDemoPip()` from `lib/demo-pip-store.ts` (Zustand).
 *
 * The component is mounted once at the root layout. It renders nothing while
 * `state === "closed"` and drops out entirely below 768px (KEI-022 trigger
 * decides the mobile fallback).
 */

import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronUp,
  ExternalLink,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEMO_PIP_DEFAULTS,
  useDemoPip,
  type DemoSize,
} from "@/lib/demo-pip-store";

const MOBILE_BREAKPOINT = 768;

// Margin between expanded panel and viewport edge.
const EXPANDED_MARGIN_PX = 32;
const EXPANDED_SIZE_PCT = 0.8;

const TRANSITION = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.7,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useViewportSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.documentElement);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return size;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function DemoPiP() {
  const mounted = useMounted();
  const viewport = useViewportSize();
  const reduceMotion = useReducedMotion();

  const current = useDemoPip((s) => s.current);
  const state = useDemoPip((s) => s.state);
  const position = useDemoPip((s) => s.position);
  const size = useDemoPip((s) => s.size);
  const setState = useDemoPip((s) => s.setState);
  const close = useDemoPip((s) => s.close);
  const setPosition = useDemoPip((s) => s.setPosition);
  const setSize = useDemoPip((s) => s.setSize);
  const hydrate = useDemoPip((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isOpen = state !== "closed" && current !== null;
  const isMobile = viewport ? viewport.w < MOBILE_BREAKPOINT : false;

  if (!mounted || !viewport || isMobile || !isOpen) return null;

  return createPortal(
    <DemoPiPInner
      current={current}
      state={state}
      position={position}
      size={size}
      viewport={viewport}
      reduceMotion={!!reduceMotion}
      setState={setState}
      close={close}
      setPosition={setPosition}
      setSize={setSize}
    />,
    document.body,
  );
}

type InnerProps = {
  current: NonNullable<ReturnType<typeof useDemoPip.getState>["current"]>;
  state: ReturnType<typeof useDemoPip.getState>["state"];
  position: ReturnType<typeof useDemoPip.getState>["position"];
  size: DemoSize;
  viewport: { w: number; h: number };
  reduceMotion: boolean;
  setState: ReturnType<typeof useDemoPip.getState>["setState"];
  close: ReturnType<typeof useDemoPip.getState>["close"];
  setPosition: ReturnType<typeof useDemoPip.getState>["setPosition"];
  setSize: ReturnType<typeof useDemoPip.getState>["setSize"];
};

function DemoPiPInner({
  current,
  state,
  position,
  size,
  viewport,
  reduceMotion,
  setState,
  close,
  setPosition,
  setSize,
}: InnerProps) {
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Compute the requested minimum (project-supplied or global default).
  const minSize = useMemo<DemoSize>(() => {
    const fromDemo = current.demo.kind === "iframe" ? current.demo.minSize : undefined;
    return {
      w: Math.max(DEMO_PIP_DEFAULTS.minSize.w, fromDemo?.w ?? 0),
      h: Math.max(DEMO_PIP_DEFAULTS.minSize.h, fromDemo?.h ?? 0),
    };
  }, [current.demo]);

  const maxSize = useMemo<DemoSize>(
    () => ({
      w: Math.floor(viewport.w * DEMO_PIP_DEFAULTS.maxSizePct),
      h: Math.floor(viewport.h * DEMO_PIP_DEFAULTS.maxSizePct),
    }),
    [viewport.w, viewport.h],
  );

  // Effective rendered size + position depending on dock state.
  const rendered = useMemo(() => {
    if (state === "expanded") {
      const w = Math.floor(viewport.w * EXPANDED_SIZE_PCT);
      const h = Math.floor(viewport.h * EXPANDED_SIZE_PCT);
      return {
        w,
        h,
        x: Math.floor((viewport.w - w) / 2),
        y: Math.floor((viewport.h - h) / 2),
      };
    }
    if (state === "minimized") {
      const w = 240;
      const h = 56;
      return {
        w,
        h,
        x: viewport.w - w - DEMO_PIP_DEFAULTS.floatingMargin,
        y: viewport.h - h - DEMO_PIP_DEFAULTS.floatingMargin,
      };
    }
    // floating
    const w = clamp(size.w, minSize.w, maxSize.w);
    const h = clamp(size.h, minSize.h, maxSize.h);
    const fallbackX = viewport.w - w - DEMO_PIP_DEFAULTS.floatingMargin;
    const fallbackY = viewport.h - h - DEMO_PIP_DEFAULTS.floatingMargin;
    const x = position
      ? clamp(position.x, EXPANDED_MARGIN_PX, viewport.w - w - EXPANDED_MARGIN_PX)
      : fallbackX;
    const y = position
      ? clamp(position.y, EXPANDED_MARGIN_PX, viewport.h - h - EXPANDED_MARGIN_PX)
      : fallbackY;
    return { w, h, x, y };
  }, [state, viewport, size, minSize, maxSize, position]);

  // ESC: closes from floating/minimized, restores from expanded.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (state === "expanded") setState("floating");
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, setState, close]);

  // Focus trap when expanded.
  useEffect(() => {
    if (state !== "expanded") return;
    const container = containerRef.current;
    if (!container) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], iframe, video, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKey);
    // Pull focus to the first focusable on enter.
    const els = focusables();
    if (els[0]) els[0].focus();
    return () => {
      container.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [state]);

  // Video playback follows dock state.
  useEffect(() => {
    if (current.demo.kind !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    if (state === "minimized") {
      v.pause();
    } else if (state === "floating" || state === "expanded") {
      v.play().catch(() => {
        // Autoplay rejection — leave paused, user can press play.
      });
    }
  }, [state, current.demo.kind]);

  // Drag — only when floating.
  const onDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number }; point: { x: number; y: number } }) => {
      const next = {
        x: clamp(
          rendered.x + info.offset.x,
          EXPANDED_MARGIN_PX,
          viewport.w - rendered.w - EXPANDED_MARGIN_PX,
        ),
        y: clamp(
          rendered.y + info.offset.y,
          EXPANDED_MARGIN_PX,
          viewport.h - rendered.h - EXPANDED_MARGIN_PX,
        ),
      };
      setPosition(next);
    },
    [rendered, viewport, setPosition],
  );

  // Resize — pointer capture from corner handle.
  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      if (state !== "floating") return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = rendered.w;
      const startH = rendered.h;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onMove = (ev: PointerEvent) => {
        const w = clamp(startW + (ev.clientX - startX), minSize.w, maxSize.w);
        const h = clamp(startH + (ev.clientY - startY), minSize.h, maxSize.h);
        setSize({ w, h });
      };
      const onUp = () => {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
      };
      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
    },
    [state, rendered, minSize, maxSize, setSize],
  );

  const isMinimized = state === "minimized";
  const isExpanded = state === "expanded";

  const dragX = position?.x ?? rendered.x;
  const dragY = position?.y ?? rendered.y;

  return (
    <motion.div
      ref={containerRef}
      role="dialog"
      aria-modal={isExpanded ? "true" : "false"}
      aria-labelledby={titleId}
      drag={state === "floating"}
      dragMomentum={false}
      dragConstraints={{
        left: EXPANDED_MARGIN_PX - dragX,
        top: EXPANDED_MARGIN_PX - dragY,
        right: viewport.w - rendered.w - EXPANDED_MARGIN_PX - dragX,
        bottom: viewport.h - rendered.h - EXPANDED_MARGIN_PX - dragY,
      }}
      onDragEnd={onDragEnd}
      initial={false}
      animate={{
        x: rendered.x,
        y: rendered.y,
        width: rendered.w,
        height: rendered.h,
      }}
      transition={reduceMotion ? { duration: 0 } : TRANSITION}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 80,
        touchAction: "none",
      }}
      className="rounded-xl bg-[#0c0c11] text-zinc-100 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4)] ring-1 ring-white/10 overflow-hidden flex flex-col"
    >
      {isMinimized ? (
        <MinimizedBar
          title={current.title}
          onRestore={() => setState("floating")}
          onClose={close}
        />
      ) : (
        <>
          <Header
            title={current.title}
            titleId={titleId}
            recordedAt={
              current.demo.kind === "video" ? current.demo.recordedAt : ""
            }
            externalUrl={
              current.demo.kind === "iframe" ? current.demo.url : null
            }
            onMinimize={() => setState("minimized")}
            onToggleExpand={() =>
              setState(isExpanded ? "floating" : "expanded")
            }
            isExpanded={isExpanded}
            onClose={close}
          />
          {current.demo.kind === "iframe" ? (
            <IframeBody
              url={current.demo.url}
              title={current.title}
              hint={current.demo.credentials?.hint}
            />
          ) : (
            <VideoBody
              ref={videoRef}
              src={current.demo.src}
              poster={current.demo.poster}
              recordedAt={current.demo.recordedAt}
              title={current.title}
            />
          )}
          {state === "floating" ? (
            <ResizeHandle onPointerDown={onResizeStart} />
          ) : null}
        </>
      )}
    </motion.div>
  );
}

function Header({
  title,
  titleId,
  recordedAt,
  externalUrl,
  isExpanded,
  onMinimize,
  onToggleExpand,
  onClose,
}: {
  title: string;
  titleId: string;
  recordedAt: string;
  externalUrl: string | null;
  isExpanded: boolean;
  onMinimize: () => void;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-[#0a0a0e] cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-center gap-2 min-w-0">
        <span className="size-2 rounded-full bg-emerald-400/80 shrink-0" aria-hidden />
        <h2
          id={titleId}
          className="font-headline text-[13px] tracking-wide text-zinc-100 truncate"
        >
          {title}
        </h2>
        {recordedAt ? (
          <span className="text-[11px] text-zinc-500 hidden sm:inline">
            recorded {recordedAt}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-0.5">
        {externalUrl ? (
          <IconButton
            label="Open in new tab"
            href={externalUrl}
            icon={<ExternalLink className="size-3.5" />}
          />
        ) : null}
        <IconButton
          label="Minimize"
          onClick={onMinimize}
          icon={<Minus className="size-3.5" />}
        />
        <IconButton
          label={isExpanded ? "Collapse" : "Expand"}
          onClick={onToggleExpand}
          icon={
            isExpanded ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )
          }
        />
        <IconButton
          label="Close"
          onClick={onClose}
          icon={<X className="size-3.5" />}
        />
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  href,
  icon,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  icon: React.ReactNode;
}) {
  const className =
    "size-7 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/60 transition-colors";
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {icon}
      </a>
    );
  }
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={className}
    >
      {icon}
    </button>
  );
}

function IframeBody({
  url,
  title,
  hint,
}: {
  url: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="relative flex-1 bg-[#050507]">
      {hint ? (
        <div className="absolute top-2 left-2 right-2 text-[11px] text-zinc-100 bg-black/75 px-2 py-1 rounded ring-1 ring-white/10 pointer-events-none z-10 shadow-md">
          {hint}
        </div>
      ) : null}
      <iframe
        src={url}
        title={`${title} demo`}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        className="w-full h-full border-0 bg-white"
      />
    </div>
  );
}

type VideoBodyProps = {
  src: string;
  poster: string;
  recordedAt: string;
  title: string;
};

const VideoBody = forwardRef<HTMLVideoElement, VideoBodyProps>(
  function VideoBody({ src, poster, recordedAt, title }, ref) {
    const [paused, setPaused] = useState(false);
    return (
      <div className="relative flex-1 bg-black">
        <video
          ref={ref}
          src={src}
          poster={poster}
          muted
          playsInline
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onEnded={() => setPaused(true)}
          aria-label={`${title} walkthrough recording${recordedAt ? `, recorded ${recordedAt}` : ""}`}
          className="w-full h-full object-contain"
        />
        {paused ? (
          <button
            type="button"
            onClick={() => {
              const el = (ref as React.RefObject<HTMLVideoElement | null>)
                ?.current;
              if (!el) return;
              if (el.paused) el.play().catch(() => {});
              else el.pause();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
            aria-label="Play"
          >
            <span className="size-14 rounded-full bg-white/95 text-black flex items-center justify-center group-hover:scale-105 transition-transform">
              <Play className="size-6 translate-x-0.5" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const el = (ref as React.RefObject<HTMLVideoElement | null>)
                ?.current;
              el?.pause();
            }}
            aria-label="Pause"
            className="absolute bottom-2 right-2 size-8 rounded-full bg-black/40 backdrop-blur-sm text-white inline-flex items-center justify-center hover:bg-black/60 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
          >
            <Pause className="size-4" />
          </button>
        )}
      </div>
    );
  },
);

function MinimizedBar({
  title,
  onRestore,
  onClose,
}: {
  title: string;
  onRestore: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center w-full h-full px-3 gap-2">
      <button
        type="button"
        onClick={onRestore}
        className="flex-1 flex items-center gap-2 min-w-0 text-left text-zinc-200 hover:text-zinc-50 focus-visible:outline-none"
      >
        <ChevronUp className="size-4 text-zinc-400 shrink-0" />
        <span className="font-headline text-[13px] truncate">{title}</span>
      </button>
      <IconButton
        label="Close"
        onClick={onClose}
        icon={<X className="size-3.5" />}
      />
    </div>
  );
}

function ResizeHandle({
  onPointerDown,
}: {
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      aria-label="Resize"
      onPointerDown={onPointerDown}
      className="absolute bottom-0 right-0 size-4 cursor-nwse-resize z-10 group"
    >
      <span className="absolute bottom-1 right-1 size-2 border-r-2 border-b-2 border-zinc-500 group-hover:border-zinc-300 rounded-[1px]" />
    </button>
  );
}
