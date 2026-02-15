---
name: animation-motion
description: Animation and motion design - CSS transitions, Framer Motion, scroll-triggered animations, micro-interactions, performance optimization, reduced motion. Use when adding animations, transitions, page transitions, hover effects, loading states, or scroll-driven experiences.
---

# Animation & Motion Design

## Motion Principles

1. **Purpose over decoration** — Every animation should communicate something (state change, hierarchy, attention)
2. **Orchestration > scattered effects** — One coordinated entrance beats ten random animations
3. **Physics-based > linear** — Spring/ease curves feel natural; linear feels robotic
4. **Respect preferences** — Always honor `prefers-reduced-motion`

## CSS Transitions (Default Choice)

For simple state changes, CSS is lighter than JS:

```tsx
{/* Hover transition */}
<button className="transform rounded-lg bg-white/5 px-6 py-3 transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98]">
  Action
</button>

{/* Color + opacity transition */}
<div className="text-white/60 transition-colors duration-200 hover:text-white">
  Link text
</div>

{/* Staggered entrance with animation-delay */}
<style>{`
  .stagger > * {
    opacity: 0;
    transform: translateY(12px);
    animation: fadeUp 0.5s ease-out forwards;
  }
  .stagger > *:nth-child(1) { animation-delay: 0ms; }
  .stagger > *:nth-child(2) { animation-delay: 80ms; }
  .stagger > *:nth-child(3) { animation-delay: 160ms; }
  .stagger > *:nth-child(4) { animation-delay: 240ms; }

  @keyframes fadeUp {
    to { opacity: 1; transform: translateY(0); }
  }
`}</style>
```

## Framer Motion (React)

### Page/Component Entrance

```tsx
import { motion } from "framer-motion";

// Fade up entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
>
  Content
</motion.div>

// Exit animation (requires AnimatePresence parent)
import { AnimatePresence } from "framer-motion";

<AnimatePresence mode="wait">
  {isVisible && (
    <motion.div
      key="panel"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      Panel content
    </motion.div>
  )}
</AnimatePresence>
```

### Staggered Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map((i) => (
    <motion.li key={i.id} variants={item}>
      {i.label}
    </motion.li>
  ))}
</motion.ul>
```

### Spring Physics

```tsx
// Bouncy — playful UI
transition={{ type: "spring", stiffness: 400, damping: 15 }}

// Smooth — professional UI
transition={{ type: "spring", stiffness: 200, damping: 25 }}

// Snappy — responsive feedback
transition={{ type: "spring", stiffness: 500, damping: 30 }}

// Gentle — subtle movement
transition={{ type: "spring", stiffness: 100, damping: 20 }}
```

### Hover / Tap Interactions

```tsx
<motion.button
  whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.1)" }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  className="rounded-lg px-6 py-3"
>
  Interactive button
</motion.button>
```

### Layout Animations

```tsx
// Smooth layout shifts when items reorder
<motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }}>
  <h3>{title}</h3>
  {isExpanded && (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Expanded content
    </motion.p>
  )}
</motion.div>

// Shared layout animation between elements
<motion.div layoutId={`card-${id}`}>
  {/* Element smoothly morphs between positions */}
</motion.div>
```

## Scroll-Triggered Animations

### Framer Motion (useInView)

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
```

### Scroll-Linked Progress

```tsx
import { motion, useScroll, useTransform } from "framer-motion";

function ParallaxHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <motion.div style={{ y, opacity }} className="relative h-screen">
      <h1>Parallax Hero</h1>
    </motion.div>
  );
}
```

## Loading States

```tsx
// Skeleton pulse
<div className="animate-pulse space-y-3">
  <div className="h-4 w-3/4 rounded bg-white/10" />
  <div className="h-4 w-full rounded bg-white/10" />
  <div className="h-4 w-5/6 rounded bg-white/10" />
</div>

// Spinner
<svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>

// Progress bar
<motion.div
  className="h-1 rounded-full bg-amber-500"
  initial={{ width: 0 }}
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.3 }}
/>
```

## Performance

### Rules

1. **Animate only `transform` and `opacity`** — these are GPU-composited, no layout thrashing
2. **Avoid animating**: `width`, `height`, `top`, `left`, `margin`, `padding`, `border-radius`
3. **Use `will-change` sparingly** — only on elements that actually animate
4. **Prefer CSS transitions** over JS for simple hover/focus states

```tsx
// GOOD: Transform-based (GPU)
<div className="transition-transform duration-300 hover:translate-x-2">
  Smooth
</div>

// BAD: Layout-triggering
<div className="transition-all duration-300 hover:ml-2">
  Janky
</div>
```

### Reduce Motion

```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedComponent() {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
    >
      Respects user preferences
    </motion.div>
  );
}
```

## Easing Reference

| Name | Tailwind | CSS | Feel |
|------|----------|-----|------|
| Ease out | `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Decelerating, natural |
| Ease in-out | `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth, balanced |
| Ease in | `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating (exits) |
| Snappy | — | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Responsive, crisp |
| Bounce | — | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Overshoots, playful |

## Duration Guidelines

| Type | Duration | Use |
|------|----------|-----|
| Micro (hover, focus) | 150-200ms | State feedback |
| Small (fade, slide) | 200-300ms | UI state changes |
| Medium (panel, modal) | 300-500ms | Layout transitions |
| Large (page, hero) | 500-800ms | Entrance sequences |
| Stagger delay | 50-100ms | Between children |

## See Also

- `frontend-design` — Motion as part of distinctive aesthetics
- `accessibility` — Reduced motion, focus indicators
- `threejs-animation` — 3D-specific animation patterns
