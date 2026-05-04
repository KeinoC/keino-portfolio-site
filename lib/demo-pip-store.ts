"use client";

import { create } from "zustand";
import type { ProjectDemo } from "./projects";

export type DemoDockState = "closed" | "floating" | "minimized" | "expanded";

export type ActiveDemo = {
  // Stable id (project slug) used for sessionStorage keying.
  id: string;
  title: string;
  // The project's marketing/live URL — used by the PiP chrome's "Open in new
  // tab" pop-out when the demo is a video (iframe pop-out uses demo.url).
  liveUrl?: string;
  demo: Exclude<ProjectDemo, { kind: "none" }>;
};

export type DemoPosition = { x: number; y: number };
export type DemoSize = { w: number; h: number };

const FLOATING_DEFAULT_SIZE: DemoSize = { w: 600, h: 420 };

// Persisted across in-site route changes (sessionStorage). The value lives in
// the store too so reads stay synchronous; the store is hydrated on first mount.
const POSITION_STORAGE_KEY = "demo-pip:position";
const SIZE_STORAGE_KEY = "demo-pip:size";

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota / private mode — ignore, position resets next visit.
  }
}

type DemoPipState = {
  current: ActiveDemo | null;
  state: DemoDockState;
  position: DemoPosition | null; // null = unset; consumer picks a default anchor
  size: DemoSize;
  open: (demo: ActiveDemo) => void;
  close: () => void;
  setState: (state: DemoDockState) => void;
  setPosition: (pos: DemoPosition) => void;
  setSize: (size: DemoSize) => void;
  hydrate: () => void;
};

export const useDemoPip = create<DemoPipState>((set, get) => ({
  current: null,
  state: "closed",
  position: null,
  size: FLOATING_DEFAULT_SIZE,

  open: (demo) => {
    set({
      current: demo,
      state: "floating",
    });
  },

  close: () => {
    set({ current: null, state: "closed" });
  },

  setState: (state) => {
    const current = get().current;
    if (state !== "closed" && !current) return;
    set({ state });
    if (state === "closed") set({ current: null });
  },

  setPosition: (position) => {
    set({ position });
    writeJSON(POSITION_STORAGE_KEY, position);
  },

  setSize: (size) => {
    set({ size });
    writeJSON(SIZE_STORAGE_KEY, size);
  },

  hydrate: () => {
    const position = readJSON<DemoPosition>(POSITION_STORAGE_KEY);
    const size = readJSON<DemoSize>(SIZE_STORAGE_KEY);
    set({
      position: position ?? null,
      size: size ?? FLOATING_DEFAULT_SIZE,
    });
  },
}));

export const DEMO_PIP_DEFAULTS = {
  floatingSize: FLOATING_DEFAULT_SIZE,
  // Anchor the floating PiP this far from viewport edges on first show.
  floatingMargin: 24,
  // Hard caps so resize can't escape the viewport.
  maxSizePct: 0.9,
  // Minimum size a project can request.
  minSize: { w: 320, h: 240 } as DemoSize,
};
