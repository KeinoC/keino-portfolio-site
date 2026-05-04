"use client";

/**
 * FeatureShowcase — auto-cycling feature walkthrough.
 *
 * A11y      : WAI-ARIA tabs pattern (role=tablist, role=tab, aria-selected,
 *             aria-controls, tabIndex roving), Left/Right/Home/End arrow keys.
 * Motion    : respects prefers-reduced-motion — disables autoplay, perspective
 *             transforms, and fade transitions.
 * Pause     : on hover, on keyboard focus.
 * Perf      : progress bar uses a CSS keyframe animation, not React state, so
 *             the component re-renders only on tab change (not 20× per second).
 *
 * API:
 *   <FeatureShowcase features={features} />
 *   <FeatureShowcase features={features} autoplayMs={7000} aria-label="Onboarding" />
 *
 * Re-theming Tailwind tokens you may want to swap:
 *   text-zinc-100 / text-zinc-500 / text-zinc-600   — text contrasts
 *   bg-primary / text-[#c9a84c]                        — accent (progress, step number)
 *   bg-[#111119] / from-[#09090f]/60                — surface + bottom-fade
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Feature = {
	label: string;
	caption: string;
	src: string;
	alt: string;
};

export interface FeatureShowcaseProps {
	features: Feature[];
	autoplayMs?: number;
	"aria-label"?: string;
	className?: string;
}

const DEFAULT_AUTOPLAY_MS = 5000;
const KEYFRAMES_ID = "feature-showcase-keyframes";

function modIndex(i: number, total: number) {
	return ((i % total) + total) % total;
}

function usePrefersReducedMotion() {
	const [prefers, setPrefers] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setPrefers(mq.matches);
		const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	return prefers;
}

export function FeatureShowcase({
	features,
	autoplayMs = DEFAULT_AUTOPLAY_MS,
	"aria-label": ariaLabel = "Feature walkthrough",
	className,
}: FeatureShowcaseProps) {
	const [active, setActive] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const tablistRef = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = usePrefersReducedMotion();
	const total = features.length;
	const animationsEnabled = !prefersReducedMotion && total > 1;

	// Inject progress keyframes once per page (idempotent).
	useEffect(() => {
		if (typeof document === "undefined") return;
		if (document.getElementById(KEYFRAMES_ID)) return;
		const style = document.createElement("style");
		style.id = KEYFRAMES_ID;
		style.textContent =
			"@keyframes feature-showcase-progress { from { width: 0%; } to { width: 100%; } }";
		document.head.appendChild(style);
	}, []);

	// Autoplay — depends only on isPaused / motion / total / autoplayMs.
	// Uses callback form so `active` is not in deps (avoids interval churn).
	useEffect(() => {
		if (isPaused || !animationsEnabled) return;
		const timer = setInterval(() => {
			setActive((prev) => (prev + 1) % total);
		}, autoplayMs);
		return () => clearInterval(timer);
	}, [isPaused, animationsEnabled, total, autoplayMs]);

	if (total === 0) return null;

	const goTo = (index: number) => {
		const next = modIndex(index, total);
		setActive(next);
		const tab = tablistRef.current?.querySelectorAll<HTMLButtonElement>(
			'[role="tab"]',
		)[next];
		tab?.focus();
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		switch (e.key) {
			case "ArrowLeft":
				e.preventDefault();
				goTo(active - 1);
				break;
			case "ArrowRight":
				e.preventDefault();
				goTo(active + 1);
				break;
			case "Home":
				e.preventDefault();
				goTo(0);
				break;
			case "End":
				e.preventDefault();
				goTo(total - 1);
				break;
		}
	};

	const prevFeature = features[modIndex(active - 1, total)];
	const currFeature = features[active];
	const nextFeature = features[modIndex(active + 1, total)];

	return (
		<div
			className={className}
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
			onFocusCapture={() => setIsPaused(true)}
			onBlurCapture={() => setIsPaused(false)}
		>
			{/* Tablist */}
			<div
				ref={tablistRef}
				role="tablist"
				aria-label={ariaLabel}
				onKeyDown={onKeyDown}
				className="mb-4 flex gap-1 overflow-x-auto pb-1 sm:mb-5 sm:gap-0"
			>
				{features.map((f, i) => {
					const isActive = i === active;
					return (
						<button
							key={f.label}
							type="button"
							role="tab"
							id={`feature-tab-${i}`}
							aria-selected={isActive}
							aria-controls={`feature-panel-${i}`}
							tabIndex={isActive ? 0 : -1}
							onClick={() => goTo(i)}
							className={`group relative flex-shrink-0 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]/60 sm:flex-1 sm:px-5 sm:py-4 ${
								isActive
									? "text-zinc-100"
									: "text-zinc-500 hover:text-zinc-300"
							}`}
						>
							<div className="flex items-baseline gap-2">
								<span
									className={`font-headline text-[11px] tabular-nums transition-colors ${
										isActive
											? "text-[#c9a84c]"
											: "text-zinc-600 group-hover:text-zinc-400"
									}`}
								>
									{String(i + 1).padStart(2, "0")}
								</span>
								<span className="whitespace-nowrap font-medium text-sm sm:whitespace-normal">
									{f.label}
								</span>
							</div>

							<p
								className={`mt-1 hidden text-xs leading-relaxed transition-all duration-300 sm:block ${
									isActive
										? "text-zinc-400 opacity-100"
										: "text-zinc-600 opacity-0"
								}`}
							>
								{f.caption}
							</p>

							{/* Progress track */}
							<div className="absolute right-0 bottom-0 left-0 h-[2px] bg-white/[0.04]">
								{/*
									Progress fill: CSS-animated, no React state.
									key includes `active` so React remounts the fill on tab
									change, restarting the keyframe animation from 0%.
								*/}
								<div
									key={`fill-${i}-${active}`}
									className="h-full bg-[#c9a84c]/60"
									style={{
										width: isActive
											? animationsEnabled
												? undefined
												: "100%"
											: i < active
												? "100%"
												: "0%",
										opacity: isActive ? 1 : i < active ? 0.3 : 0,
										animation:
											isActive && animationsEnabled
												? `feature-showcase-progress ${autoplayMs}ms linear forwards`
												: undefined,
										animationPlayState: isPaused ? "paused" : "running",
									}}
								/>
							</div>
						</button>
					);
				})}
			</div>

			{/* Triptych */}
			<div className="relative flex items-center justify-center">
				{prevFeature && total > 1 && (
					<button
						type="button"
						aria-label={`Previous: ${prevFeature.label}`}
						tabIndex={-1}
						className="relative -mr-4 hidden w-[20%] flex-shrink-0 lg:block"
						onClick={() => goTo(active - 1)}
					>
						<div
							className="overflow-hidden rounded-xl border border-white/[0.03] opacity-30 transition-all duration-700 hover:opacity-50"
							style={{
								transform: prefersReducedMotion
									? undefined
									: "perspective(800px) rotateY(8deg) scale(0.9)",
							}}
						>
							<Image
								src={prevFeature.src}
								alt=""
								width={640}
								height={360}
								className="w-full"
							/>
						</div>
					</button>
				)}

				<div
					role="tabpanel"
					id={`feature-panel-${active}`}
					aria-labelledby={`feature-tab-${active}`}
					className="relative z-10 max-h-[60vh] w-full overflow-hidden rounded-2xl border border-white/[0.05] bg-[#111119] shadow-2xl shadow-black/40 lg:w-[62%] lg:flex-shrink-0"
				>
					<div className="relative aspect-[16/8] sm:aspect-video">
						{features.map((f, i) => (
							<div
								key={f.label}
								className="absolute inset-0"
								aria-hidden={i !== active}
								style={{
									opacity: i === active ? 1 : 0,
									transform: prefersReducedMotion
										? undefined
										: i === active
											? "scale(1) translateX(0)"
											: i < active
												? "scale(0.98) translateX(-2%)"
												: "scale(0.98) translateX(2%)",
									transition: prefersReducedMotion
										? "opacity 0ms"
										: "opacity 900ms cubic-bezier(0.4, 0, 0.2, 1), transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
									zIndex: i === active ? 1 : 0,
								}}
							>
								<Image
									src={f.src}
									alt={f.alt}
									fill
									className="object-cover object-top"
									sizes="(max-width: 768px) 100vw, 900px"
									priority={i === 0}
								/>
							</div>
						))}

						<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#09090f]/60 to-transparent" />

						<div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:hidden">
							<p className="text-[13px] text-zinc-300 leading-snug">
								{currFeature?.caption}
							</p>
						</div>
					</div>
				</div>

				{nextFeature && total > 1 && (
					<button
						type="button"
						aria-label={`Next: ${nextFeature.label}`}
						tabIndex={-1}
						className="relative -ml-4 hidden w-[20%] flex-shrink-0 lg:block"
						onClick={() => goTo(active + 1)}
					>
						<div
							className="overflow-hidden rounded-xl border border-white/[0.03] opacity-30 transition-all duration-700 hover:opacity-50"
							style={{
								transform: prefersReducedMotion
									? undefined
									: "perspective(800px) rotateY(-8deg) scale(0.9)",
							}}
						>
							<Image
								src={nextFeature.src}
								alt=""
								width={640}
								height={360}
								className="w-full"
							/>
						</div>
					</button>
				)}
			</div>
		</div>
	);
}
