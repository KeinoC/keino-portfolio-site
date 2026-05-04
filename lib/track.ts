/**
 * Typed analytics wrapper for the PiP demo events (KEI-025).
 *
 * Events are best-effort — track() never blocks the UI and never bubbles
 * errors. Custom event props are kept low-cardinality so Vercel Analytics
 * (and any later destination like Plausible) can aggregate cleanly.
 *
 * Slugs match `Project["slug"]` from `lib/projects.ts`. Kinds match the
 * `ProjectDemo["kind"]` discriminator (excluding `"none"` since events
 * only fire when there's an active demo).
 */

import { track as vercelTrack } from "@vercel/analytics";

export type DemoEventName =
  | "demo_open"
  | "demo_minimize"
  | "demo_expand"
  | "demo_pop_out"
  | "demo_close";

type CommonProps = {
  // Project slug — low-cardinality (≤7 values today).
  project: string;
  // "iframe" or "video" — the active demo's discriminator.
  kind: "iframe" | "video";
};

export function trackDemo(event: DemoEventName, props: CommonProps): void {
  try {
    vercelTrack(event, props);
  } catch {
    // Analytics is best-effort — never throw to the UI.
  }
}

/**
 * Span-style tracker for `demo_time` (open → close in seconds). The store
 * captures an open timestamp on `open()` and the close handler reads it
 * back. Cardinality stays low because we ship a single number per close.
 */
export function trackDemoTime(props: CommonProps & { seconds: number }): void {
  try {
    vercelTrack("demo_time", {
      project: props.project,
      kind: props.kind,
      // Round to integer seconds so Vercel doesn't fragment by float values.
      seconds: Math.round(props.seconds),
    });
  } catch {
    // Best-effort.
  }
}
