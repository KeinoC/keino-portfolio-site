#!/usr/bin/env bun
/**
 * Hero/detail screenshot capture for portfolio projects.
 *
 * Usage:
 *   bun run capture --url https://example.com --out my-project-hero
 *   bun run capture --url http://localhost:3008 --out chicknz-hero --width 1400 --height 800
 *   bun run capture --url https://example.com --out logo-detail --selector "header img"
 *   bun run capture --url http://localhost:3008 --out chicknz-dashboard --state ./.auth/chicknz.json
 *
 * Outputs to public/screenshots/<out>.png. Pass --webp for WebP.
 */
import { chromium, type Page } from "playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

type Args = {
  url: string;
  out: string;
  width: number;
  height: number;
  selector?: string;
  wait: number;
  webp: boolean;
  state?: string;
  fullPage: boolean;
  dark: boolean;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const get = (flag: string, fallback?: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : fallback;
  };
  const has = (flag: string) => argv.includes(flag);

  const url = get("--url");
  const out = get("--out");
  if (!url || !out) {
    console.error("Usage: bun run capture --url <url> --out <name> [--width N] [--height N] [--selector S] [--wait MS] [--webp] [--state PATH] [--full] [--dark]");
    process.exit(1);
  }

  return {
    url,
    out,
    width: Number(get("--width", "1400")),
    height: Number(get("--height", "800")),
    selector: get("--selector"),
    wait: Number(get("--wait", "1500")),
    webp: has("--webp"),
    state: get("--state"),
    fullPage: has("--full"),
    dark: has("--dark"),
  };
}

async function hideDevOverlays(page: Page) {
  await page.addStyleTag({
    content: `
      #__next-build-watcher,
      [data-nextjs-toast],
      [data-nextjs-dev-tools-button],
      [data-next-mark],
      nextjs-portal,
      .__next-dev-overlay-bottom-stack,
      [aria-label="Open Next.js Dev Tools"] { display: none !important; }
    `,
  });
}

async function main() {
  const args = parseArgs();
  const outDir = resolve(process.cwd(), "public/screenshots");
  await mkdir(outDir, { recursive: true });
  const ext = args.webp ? "webp" : "png";
  const outPath = resolve(outDir, `${args.out}.${ext}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: 2,
    storageState: args.state ? resolve(args.state) : undefined,
    colorScheme: args.dark ? "dark" : undefined,
  });
  const page = await context.newPage();

  console.log(`→ ${args.url}`);
  await page.goto(args.url, { waitUntil: "networkidle" });
  await hideDevOverlays(page);
  await page.waitForTimeout(args.wait);

  if (args.selector) {
    const el = page.locator(args.selector).first();
    await el.scrollIntoViewIfNeeded();
    await el.screenshot({ path: outPath, type: ext === "webp" ? "png" : ext });
  } else {
    await page.screenshot({
      path: outPath,
      fullPage: args.fullPage,
      type: ext === "webp" ? "png" : ext,
    });
  }

  await browser.close();
  console.log(`✓ ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
