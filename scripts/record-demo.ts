#!/usr/bin/env bun
/**
 * record-demo.ts — autonomous walkthrough recorder for KEI-024.
 *
 * Pipeline per target:
 *   1. Launch headless Chromium with `recordVideo` (1280×800 viewport).
 *   2. Navigate to `startUrl`, run pre-roll (un-recorded), then concatenate
 *      every scene's steps. Cap at 35s — anything longer is a config bug.
 *   3. Close context — Playwright finalizes a WebM in the temp dir.
 *   4. Transcode WebM → MP4 (H.264) via the bundled @ffmpeg-installer
 *      binary, target ≤4MB, no audio, fast-start metadata.
 *   5. Extract a poster JPG at `posterAtSec` (default 1.0s).
 *   6. Land both in `public/demos/<id>.{mp4,jpg}`.
 *
 * No host ffmpeg required — @ffmpeg-installer/ffmpeg ships a static binary.
 *
 * Usage:
 *   bun run record                # all enabled targets
 *   bun run record -- self-test   # one target by id
 *   bun run record -- hitide,goodcall
 */

import { spawn } from "node:child_process";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { chromium, type Page } from "playwright";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { targets, type RecordStep, type RecordTarget } from "../record-demo.config";

const FFMPEG_PATH = ffmpegInstaller.path as string;

const VIEWPORT = { width: 1280, height: 800 } as const;
const HARD_TIME_CAP_MS = 35_000;
const TARGET_MAX_BYTES = 4 * 1024 * 1024;
const OUTPUT_DIR = path.resolve(__dirname, "../public/demos");

function parseArgs(): string[] | null {
  const argv = process.argv.slice(2);
  if (argv.length === 0) return null;
  return argv.flatMap((a) => a.split(",")).filter(Boolean);
}

async function runStep(page: Page, step: RecordStep): Promise<void> {
  switch (step.kind) {
    case "goto":
      await page.goto(step.url, { waitUntil: "domcontentloaded" });
      return;
    case "wait":
      await page.waitForTimeout(step.ms);
      return;
    case "click":
      await page.locator(step.selector).first().click();
      return;
    case "type":
      await page
        .locator(step.selector)
        .first()
        .pressSequentially(step.text, { delay: step.delayMs ?? 60 });
      return;
    case "hover":
      await page.locator(step.selector).first().hover();
      return;
    case "press":
      await page.keyboard.press(step.key);
      return;
    case "eval":
      await step.fn(page);
      return;
  }
}

async function recordTarget(target: RecordTarget): Promise<string> {
  const sessionTmp = await mkdtempForTarget(target.id);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: sessionTmp, size: VIEWPORT },
  });
  const page = await context.newPage();

  // Pre-roll runs un-recorded conceptually (Playwright still records, but
  // we trim it from the front via -ss when we have a sensible offset; for
  // now we just keep pre-roll lean — auth flows shouldn't be visible).
  await page.goto(target.startUrl, { waitUntil: "domcontentloaded" });
  for (const step of target.preRoll ?? []) {
    await runStep(page, step);
  }

  const sceneStart = Date.now();
  for (const scene of target.scenes) {
    for (const step of scene.steps) {
      if (Date.now() - sceneStart > HARD_TIME_CAP_MS) {
        console.warn(
          `[${target.id}] scenes exceeded ${HARD_TIME_CAP_MS}ms cap — recording will be truncated`,
        );
        break;
      }
      await runStep(page, step);
    }
  }

  await context.close();
  await browser.close();

  const webm = await findOnly(sessionTmp, ".webm");
  return webm;
}

async function transcodeAndPoster(
  target: RecordTarget,
  webmPath: string,
): Promise<{ mp4: string; poster: string }> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const basename = target.outputName ?? target.id;
  const mp4 = path.join(OUTPUT_DIR, `${basename}.mp4`);
  const poster = path.join(OUTPUT_DIR, `${basename}-poster.jpg`);
  const posterAt = target.posterAtSec ?? 1.0;

  // Two-pass-ish: try CRF 28 first, bump compression if oversized.
  await runFfmpeg([
    "-y",
    "-i",
    webmPath,
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "28",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4,
  ]);

  // If oversized, re-encode at CRF 32.
  const size = (await stat(mp4)).size;
  if (size > TARGET_MAX_BYTES) {
    console.warn(
      `[${target.id}] ${(size / 1024 / 1024).toFixed(2)}MB exceeds 4MB — re-encoding at CRF 32`,
    );
    await runFfmpeg([
      "-y",
      "-i",
      webmPath,
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "32",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      mp4,
    ]);
  }

  await runFfmpeg([
    "-y",
    "-ss",
    String(posterAt),
    "-i",
    mp4,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    poster,
  ]);

  return { mp4, poster };
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_PATH, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}\n${stderr.split("\n").slice(-20).join("\n")}`));
    });
  });
}

async function mkdtempForTarget(id: string): Promise<string> {
  const dir = path.join(tmpdir(), `record-demo-${id}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function findOnly(dir: string, ext: string): Promise<string> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir);
  const match = entries.find((e) => e.endsWith(ext));
  if (!match) throw new Error(`no ${ext} file in ${dir}`);
  return path.join(dir, match);
}

async function preflight(target: RecordTarget): Promise<boolean> {
  // Hit the start URL with a HEAD/GET to detect "is the server up?" failures
  // before launching the headless browser. Saves time on misconfigured runs.
  try {
    const res = await fetch(target.startUrl, { method: "GET", redirect: "manual" });
    if (res.status >= 500) {
      console.error(
        `[${target.id}] startUrl returned ${res.status} — skipping`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[${target.id}] startUrl unreachable (${(err as Error).message}) — skipping`,
    );
    return false;
  }
}

async function main() {
  const filter = parseArgs();
  const selected = targets.filter((t) => {
    if (filter && !filter.includes(t.id)) return false;
    if (!filter && t.enabled === false) return false;
    return true;
  });

  if (selected.length === 0) {
    console.error("no targets matched. Available:", targets.map((t) => t.id).join(", "));
    process.exit(1);
  }

  const startedAt = Date.now();
  console.log(`Recording ${selected.length} target(s): ${selected.map((t) => t.id).join(", ")}`);

  for (const target of selected) {
    console.log(`\n[${target.id}] preflight ${target.startUrl}`);
    if (!(await preflight(target))) continue;

    console.log(`[${target.id}] launching browser…`);
    const t0 = Date.now();
    let webm: string | null = null;
    try {
      webm = await recordTarget(target);
      console.log(
        `[${target.id}] recorded raw webm in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
      );
      const { mp4, poster } = await transcodeAndPoster(target, webm);
      const size = (await stat(mp4)).size;
      console.log(
        `[${target.id}] ${path.basename(mp4)} ${(size / 1024 / 1024).toFixed(2)}MB · ${path.basename(poster)}`,
      );
    } catch (err) {
      console.error(`[${target.id}] failed:`, (err as Error).message);
    } finally {
      if (webm) {
        await rm(path.dirname(webm), { recursive: true, force: true });
      }
    }
  }

  console.log(
    `\nDone in ${((Date.now() - startedAt) / 1000).toFixed(1)}s. Output: ${OUTPUT_DIR}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
