#!/usr/bin/env bun
/**
 * Compress PNGs in public/screenshots/ in-place.
 * Resizes anything over 2400px wide down to 2400px (still 2x quality at 1200 display)
 * and applies aggressive PNG palette compression. Run after capturing new heros.
 *
 * Usage: bun run optimize-images
 */
import sharp from "sharp";
import { readdir, stat, rename } from "node:fs/promises";
import { resolve } from "node:path";

const TARGET_DIR = resolve("public/screenshots");
const MAX_WIDTH = 2400;

async function main() {
  const files = await readdir(TARGET_DIR);
  const pngs = files.filter((f) => f.endsWith(".png"));

  for (const file of pngs) {
    const inPath = resolve(TARGET_DIR, file);
    const tmpPath = `${inPath}.tmp`;
    const before = (await stat(inPath)).size;

    const meta = await sharp(inPath).metadata();
    const targetWidth =
      meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : meta.width;

    await sharp(inPath)
      .resize({ width: targetWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 85 })
      .toFile(tmpPath);

    await rename(tmpPath, inPath);
    const after = (await stat(inPath)).size;
    const pct = Math.round((1 - after / before) * 100);
    const fmt = (n: number) => `${(n / 1024).toFixed(0)}KB`;
    console.log(
      `${file.padEnd(28)} ${fmt(before)} → ${fmt(after)} (${pct}% smaller)`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
