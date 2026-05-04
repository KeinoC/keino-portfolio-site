import type { Page } from "playwright";
import { scrollToHeading } from "./scripts/illustrate-helpers";

const config = {
	outputDir: "public/landing",
	componentDir: "components",
	dataSuffix: "case-study",
	features: [
		{
			label: "Selected Work",
			caption: "Scroll-driven stacked cards reveal each project on the home page.",
			url: "http://localhost:3003/",
			beforeShot: async (page: Page) => {
				// Scroll past the hero (min-h-screen) into the Selected Work section
				await page.evaluate(() => {
					window.scrollTo({ top: window.innerHeight, behavior: "instant" as ScrollBehavior });
				});
				await page.waitForTimeout(800);
			},
		},
		{
			label: "All projects",
			caption: "Three-up grid of every case study at /work.",
			url: "http://localhost:3003/work",
		},
		{
			label: "Case study",
			caption: "Project intro: title, role, timeline, tech stack.",
			url: "http://localhost:3003/work/chicknz",
		},
		{
			label: "Architecture",
			caption: "How it's built — schema, data flow, key tradeoffs.",
			url: "http://localhost:3003/work/chicknz",
			beforeShot: async (page: Page) => {
				await scrollToHeading(page, "Architecture");
			},
		},
		{
			label: "What I learned",
			caption: "Honest lessons from shipping the project.",
			url: "http://localhost:3003/work/chicknz",
			beforeShot: async (page: Page) => {
				await scrollToHeading(page, "What I Learned");
			},
		},
	],
	viewport: { width: 1440, height: 900 },
	settleMs: 2500,
};

export default config;
