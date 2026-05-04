"use client";

/**
 * Mounts <DemoPiP/> once at the root layout. Loaded lazily so the
 * 1.5kB Zustand + ~10kB component code only ships when something needs
 * it. The store still boots on the home page so case-study triggers
 * (KEI-022) can call `open()` immediately.
 */

import dynamic from "next/dynamic";

export const DemoPiPMount = dynamic(
  () => import("./demo-pip").then((m) => ({ default: m.DemoPiP })),
  { ssr: false },
);
