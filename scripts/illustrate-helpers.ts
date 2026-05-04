/**
 * illustrate-helpers — reusable beforeShot utilities for illustrate-feature configs.
 *
 * Drop this file into <target>/scripts/illustrate-helpers.ts alongside
 * illustrate.ts on first install. Configs import from "./scripts/illustrate-helpers".
 *
 * Why these exist: portfolio sites with smooth-scroll wrappers (Lenis, Locomotive)
 * hijack window.scrollTo. Sequential `scrollIntoView` + `scrollBy` calls race
 * against the smooth-scroll animation and overshoot. The helpers below use a
 * single absolute scrollTo with a longer settle window — deterministic.
 */

import type { Page } from "playwright";

const HEADING_TAGS = "h1, h2, h3, h4, h5, h6" as const;

/**
 * Anchor scroll to a heading by exact text content. Targets the parent
 * <section> so the heading + content below sit in the viewport together
 * (rather than pegging a small eyebrow heading flush to the top).
 *
 * @param page    Playwright Page
 * @param text    Exact text content of the heading (any of h1..h6)
 * @param headroom Pixels of breathing room above the section. Default 80.
 *
 * @example
 *   beforeShot: async (page) => {
 *     await scrollToHeading(page, "Architecture");
 *   },
 */
export async function scrollToHeading(
	page: Page,
	text: string,
	headroom = 80,
): Promise<void> {
	await page.evaluate(
		({ text, headroom, tags }) => {
			const heading = Array.from(document.querySelectorAll(tags)).find(
				(h) => h.textContent?.trim() === text,
			);
			if (!heading) return;
			const section = heading.closest("section") ?? heading;
			const absoluteY = section.getBoundingClientRect().top + window.scrollY;
			window.scrollTo({
				top: Math.max(0, absoluteY - headroom),
				behavior: "instant" as ScrollBehavior,
			});
		},
		{ text, headroom, tags: HEADING_TAGS },
	);
	await page.waitForTimeout(1500);
}

/**
 * Anchor scroll to any element by CSS selector. Same deterministic behavior
 * as scrollToHeading — single absolute scrollTo, 1500ms settle.
 *
 * @example
 *   beforeShot: async (page) => {
 *     await scrollToSelector(page, "#pricing", 60);
 *   },
 */
export async function scrollToSelector(
	page: Page,
	selector: string,
	headroom = 80,
): Promise<void> {
	await page.evaluate(
		({ selector, headroom }) => {
			const target = document.querySelector(selector);
			if (!target) return;
			const absoluteY = target.getBoundingClientRect().top + window.scrollY;
			window.scrollTo({
				top: Math.max(0, absoluteY - headroom),
				behavior: "instant" as ScrollBehavior,
			});
		},
		{ selector, headroom },
	);
	await page.waitForTimeout(1500);
}

/**
 * Wait for web fonts to settle. Useful before a hero/headline screenshot to
 * prevent FOUT/FOIT artifacts.
 */
export async function waitForFonts(page: Page): Promise<void> {
	await page.evaluate(async () => {
		if (document.fonts?.ready) await document.fonts.ready;
	});
}
