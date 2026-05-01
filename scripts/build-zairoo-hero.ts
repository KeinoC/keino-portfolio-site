#!/usr/bin/env bun
/**
 * One-off: build a landscape (1400×800) hero image for Zairoo by composing
 * the existing portrait card on a dark canvas with title + tagline.
 *
 * The portrait card is the canonical visual. The case-study layout wants
 * landscape. So we render an HTML page → screenshot it.
 */
import { chromium } from "playwright";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";

const cardB64 = readFileSync(resolve("public/screenshots/zairoo-card.png")).toString("base64");
const cardSrc = `data:image/png;base64,${cardB64}`;

const html = `
<!doctype html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1400px;
    height: 800px;
    background: radial-gradient(ellipse at top right, #2a1f5c 0%, #1a1438 40%, #0e0a24 100%);
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #f5f5f0;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    padding: 0 100px;
    gap: 120px;
    overflow: hidden;
  }
  .left { max-width: 560px; }
  .eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    letter-spacing: 3px;
    color: #a698ff;
    text-transform: uppercase;
    margin-bottom: 32px;
    font-weight: 500;
  }
  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 96px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -3px;
    margin-bottom: 32px;
    background: linear-gradient(180deg, #ffffff 0%, #c8b8ff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    font-size: 22px;
    line-height: 1.5;
    color: #c4bbe0;
    max-width: 480px;
  }
  .tags {
    margin-top: 40px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .tag {
    padding: 8px 18px;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 999px;
    font-size: 13px;
    color: #d4caf2;
    background: rgba(255,255,255,0.04);
  }
  .right {
    position: relative;
  }
  .card-shadow {
    position: absolute;
    inset: -40px;
    background: radial-gradient(ellipse at center, rgba(166,152,255,0.25) 0%, transparent 70%);
    filter: blur(40px);
    z-index: 0;
  }
  .card {
    position: relative;
    z-index: 1;
    width: 360px;
    height: auto;
    border-radius: 24px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
    transform: rotate(-3deg);
  }
</style>
</head>
<body>
  <div class="left">
    <div class="eyebrow">Original TTRPG · Discord Bot · Cantrip Ruleset</div>
    <h1>Zairoo</h1>
    <p>An Afrocentric tabletop RPG system. Five-stat spread, Fate Path progression, designed first as a play-tested system.</p>
    <div class="tags">
      <span class="tag">Hono</span>
      <span class="tag">oRPC</span>
      <span class="tag">discord.js</span>
      <span class="tag">Railway</span>
    </div>
  </div>
  <div class="right">
    <div class="card-shadow"></div>
    <img class="card" src="${cardSrc}" />
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1400, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const out = resolve("public/screenshots/zairoo-hero.png");
  await page.screenshot({ path: out, fullPage: false });
  await browser.close();
  console.log("✓", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
