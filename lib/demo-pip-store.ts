"use client";

import { create } from "zustand";
import type { ProjectDemo } from "./projects";
import { trackDemo, trackDemoTime } from "./track";

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
  // Wall-clock ms when the current demo opened — used to fire `demo_time`
  // when it closes. Reset to null on close.
  openedAt: number | null;
  open: (demo: ActiveDemo) => void;
  close: () => void;
  setState: (state: DemoDockState) => void;
  setPosition: (pos: DemoPosition) => void;
  setSize: (size: DemoSize) => void;
  hydrate: () => void;
};

function emitClose(current: ActiveDemo | null, openedAt: number | null) {
  if (!current) return;
  trackDemo("demo_close", { project: current.id, kind: current.demo.kind });
  if (openedAt != null) {
    trackDemoTime({
      project: current.id,
      kind: current.demo.kind,
      seconds: (Date.now() - openedAt) / 1000,
    });
  }
}

export const useDemoPip = create<DemoPipState>((set, get) => ({
  current: null,
  state: "closed",
  position: null,
  size: FLOATING_DEFAULT_SIZE,
  openedAt: null,

  open: (demo) => {
    set({
      current: demo,
      state: "floating",
      openedAt: Date.now(),
    });
    trackDemo("demo_open", { project: demo.id, kind: demo.demo.kind });
  },

  close: () => {
    const { current, openedAt } = get();
    emitClose(current, openedAt);
    set({ current: null, state: "closed", openedAt: null });
  },

  setState: (state) => {
    const { current, openedAt, state: prev } = get();
    if (state !== "closed" && !current) return;
    if (state === prev) return;
    set({ state });
    if (state === "closed") {
      emitClose(current, openedAt);
      set({ current: null, openedAt: null });
      return;
    }
    if (current) {
      if (state === "minimized") {
        trackDemo("demo_minimize", { project: current.id, kind: current.demo.kind });
      } else if (state === "expanded") {
        trackDemo("demo_expand", { project: current.id, kind: current.demo.kind });
      }
    }
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
