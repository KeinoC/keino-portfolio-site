/**
 * record-demo.config.ts — declarative scene script for `bun run record`.
 *
 * Each entry produces `public/demos/<id>.mp4` (~30s, 1280×800) and
 * `public/demos/<id>-poster.jpg` (extracted at 0:01).
 *
 * Each scene is a sequence of Playwright actions. Authoring rules:
 * - Keep total scene time ≤30s. The runner enforces a 35s cap and warns.
 * - Cursor moves are scripted — no user input. Use `click`, `type`, `hover`,
 *   `goto`, `wait`, and `eval` (for one-off page evaluations).
 * - Use `wait` between visible cursor moves (~600-1200ms) so the recording
 *   reads as deliberate, not glitchy.
 *
 * Run modes:
 * - `bun run record` records every entry whose `enabled !== false`.
 * - `bun run record -- self-test` runs only the self-test config.
 * - `bun run record -- hitide,goodcall` runs a comma-separated subset.
 */

import type { Page } from "playwright";

export type RecordStep =
  | { kind: "goto"; url: string }
  | { kind: "wait"; ms: number }
  | { kind: "click"; selector: string }
  | { kind: "type"; selector: string; text: string; delayMs?: number }
  | { kind: "hover"; selector: string }
  | { kind: "press"; key: string }
  | { kind: "eval"; fn: (page: Page) => Promise<void> };

export type RecordTarget = {
  // CLI-facing id used by `bun run record -- <id>`. Keep short.
  id: string;
  // Output filename basename — produces `<outputName>.mp4` and
  // `<outputName>-poster.jpg`. Defaults to `id` when omitted.
  outputName?: string;
  // True target URL the recording starts at. The runner navigates here first
  // before running scenes (so scenes can omit a leading `goto`).
  startUrl: string;
  // Optional gate. Defaults to true.
  enabled?: boolean;
  // Optional auth or pre-roll steps that run BEFORE the first scene. Output
  // from these does NOT contribute to the recording length budget.
  preRoll?: RecordStep[];
  // Scenes — concatenated into a single recording.
  scenes: { label: string; steps: RecordStep[] }[];
  // Optional poster timestamp override (default 1.0s).
  posterAtSec?: number;
};

const SAMPLE_SELF_TEST: RecordTarget = {
  id: "self-test",
  // localhost — start the dev server in a separate terminal: `bun dev`.
  // Disabled by default; run via `bun run record -- self-test` to verify
  // the pipeline end-to-end without producing extra MP4s.
  startUrl: "http://localhost:3003/dev/demo-pip",
  enabled: false,
  scenes: [
    {
      label: "Open iframe sample",
      steps: [
        { kind: "wait", ms: 1500 },
        { kind: "click", selector: "button:has-text('iframe sample')" },
        { kind: "wait", ms: 2500 },
      ],
    },
    {
      label: "Cycle dock states",
      steps: [
        { kind: "click", selector: "button:has-text('expanded')" },
        { kind: "wait", ms: 2000 },
        { kind: "click", selector: "button:has-text('floating')" },
        { kind: "wait", ms: 1500 },
        { kind: "click", selector: "button:has-text('minimized')" },
        { kind: "wait", ms: 1500 },
        { kind: "click", selector: "button:has-text('floating')" },
        { kind: "wait", ms: 1500 },
      ],
    },
    {
      label: "Switch to video sample",
      steps: [
        { kind: "click", selector: "button:has-text('video sample')" },
        { kind: "wait", ms: 3500 },
      ],
    },
  ],
};

// Skeletons for the actual KEI-024 deliverables. They reference live or
// localhost URLs that don't exist yet — treat as starting point. Set
// `enabled: true` and fill in the auth + scene scripts when a recordable
// surface is available (live demo account, local clone with seeded data,
// or a storyboard HTML page in `app/dev/storyboard-<id>/`).
const HITIDE: RecordTarget = {
  id: "hitide",
  // Matches the path already wired into lib/projects.ts (KEI-020):
  //   demo: { kind: "video", src: "/demos/hitide-walkthrough.mp4", … }
  outputName: "hitide-walkthrough",
  // Drives the in-repo storyboard at app/dev/storyboard-hitide/page.tsx —
  // a faithful UI recreation, not the real HiTide platform. The recording
  // is labeled "Recreation" inside both the storyboard chrome and the PiP
  // chrome so a viewer never mistakes it for a live capture.
  startUrl: "http://localhost:3003/dev/storyboard-hitide",
  enabled: true,
  posterAtSec: 4,
  scenes: [
    {
      label: "Borrower intake — Identity + Eligibility",
      steps: [
        { kind: "wait", ms: 1200 },
        {
          kind: "type",
          selector: "#storyboard-name",
          text: "Sample Applicant",
          delayMs: 70,
        },
        { kind: "wait", ms: 400 },
        {
          kind: "type",
          selector: "#storyboard-email",
          text: "demo@hitide.example",
          delayMs: 60,
        },
        { kind: "wait", ms: 600 },
        { kind: "click", selector: "#storyboard-next-identity" },
        // Eligibility checks animate in — hold so they read.
        { kind: "wait", ms: 2400 },
        { kind: "click", selector: "#storyboard-next-eligibility" },
      ],
    },
    {
      label: "DocuSign contract flow",
      steps: [
        // Generating screen auto-advances after ~1.8s.
        { kind: "wait", ms: 2200 },
        { kind: "click", selector: "#storyboard-sign" },
        // Signature pen animation + auto-advance.
        { kind: "wait", ms: 1500 },
        // Signed confirmation lands; cursor moves to "View loan status".
        { kind: "wait", ms: 1200 },
        { kind: "click", selector: "#storyboard-view-status" },
      ],
    },
    {
      label: "Loan status — timeline",
      steps: [
        { kind: "wait", ms: 800 },
        {
          kind: "hover",
          selector: '[data-storyboard-milestone="approved"]',
        },
        // Hold on Approved so the milestone reads as the headline outcome.
        { kind: "wait", ms: 2200 },
      ],
    },
  ],
};

const GOODCALL_SKELETON: RecordTarget = {
  id: "goodcall",
  startUrl: "http://localhost:3020/demo/operator",
  enabled: false,
  scenes: [
    {
      label: "Incoming call queue",
      steps: [
        { kind: "wait", ms: 1500 },
        // TODO: hover incoming call row, click Pick up
      ],
    },
    {
      label: "Hold / transfer / conference",
      steps: [
        // TODO: click hold, transfer (pick attorney from modal), conference
      ],
    },
    {
      label: "Call history",
      steps: [
        // TODO: cut to history, scroll, hover audit trail
      ],
    },
  ],
};

export const targets: RecordTarget[] = [
  SAMPLE_SELF_TEST,
  HITIDE,
  GOODCALL_SKELETON,
];
