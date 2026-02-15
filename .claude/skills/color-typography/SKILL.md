---
name: color-typography
description: Color theory and typography - palette generation, contrast ratios, HSL color manipulation, type scales, font pairing, variable fonts, CSS custom properties. Use when choosing colors, building palettes, selecting fonts, establishing type hierarchies, or ensuring readability and contrast.
---

# Color & Typography

## Color Theory for UI

### HSL — The Right Color Model

Always work in HSL (Hue, Saturation, Lightness) — it's intuitive for UI work:

```css
/* HSL lets you create related colors by shifting one axis */
--accent:        hsl(45, 95%, 65%);   /* Gold */
--accent-light:  hsl(45, 95%, 78%);   /* Same hue, lighter */
--accent-dark:   hsl(45, 80%, 45%);   /* Same hue, darker, less saturated */
--accent-muted:  hsl(45, 30%, 40%);   /* Same hue, desaturated */
--accent-bg:     hsl(45, 40%, 10%);   /* Same hue, very dark (surface tint) */
```

### Palette Generation

#### Monochromatic (Safe, Cohesive)
One hue, vary saturation and lightness:

```css
--blue-50:  hsl(220, 40%, 95%);
--blue-100: hsl(220, 40%, 85%);
--blue-200: hsl(220, 40%, 75%);
--blue-300: hsl(220, 45%, 60%);
--blue-400: hsl(220, 50%, 50%);
--blue-500: hsl(220, 55%, 40%);
--blue-600: hsl(220, 60%, 30%);
--blue-700: hsl(220, 60%, 20%);
--blue-800: hsl(220, 50%, 12%);
--blue-900: hsl(220, 40%, 8%);
```

#### Complementary (High Contrast)
Opposite hues (180° apart):

```css
--primary: hsl(220, 70%, 55%);     /* Blue */
--complement: hsl(40, 90%, 60%);    /* Gold — 220+180=400→40 */
```

#### Analogous (Harmonious)
Adjacent hues (±30°):

```css
--color-a: hsl(200, 60%, 50%);  /* Cyan-blue */
--color-b: hsl(230, 60%, 55%);  /* Blue-violet */
--color-c: hsl(170, 55%, 45%);  /* Teal */
```

#### Split Complementary (Balanced Tension)
Base + two colors flanking its complement:

```css
--base:  hsl(220, 70%, 55%);    /* Blue */
--split-a: hsl(20, 80%, 55%);   /* Warm orange (40-20) */
--split-b: hsl(60, 70%, 50%);   /* Yellow-green (40+20) */
```

### Dark UI Color Rules

```css
/* Surface hierarchy (lighten progressively) */
--surface-0: hsl(220, 15%, 6%);    /* Deepest background */
--surface-1: hsl(220, 12%, 10%);   /* Card background */
--surface-2: hsl(220, 10%, 14%);   /* Raised elements */
--surface-3: hsl(220, 8%, 18%);    /* Hover states */

/* Text hierarchy (darken progressively) */
--text-primary:   hsl(0, 0%, 93%);    /* Headings, primary content */
--text-secondary:  hsl(220, 8%, 60%);  /* Body text, descriptions */
--text-tertiary:   hsl(220, 6%, 40%);  /* Captions, labels */
--text-disabled:   hsl(220, 4%, 25%);  /* Disabled text */

/* Borders (subtle but visible) */
--border-default: hsl(220, 8%, 18%);
--border-hover:   hsl(220, 8%, 25%);
--border-focus:   hsl(45, 80%, 55%);    /* Accent for focus */
```

### Contrast Ratios

| Use | Minimum | Tailwind Approximation |
|-----|---------|----------------------|
| Body text | 4.5:1 | `text-white/70` on `bg-gray-900` |
| Large text (≥18px bold) | 3:1 | `text-white/50` on `bg-gray-900` |
| UI components | 3:1 | Borders, icons, controls |
| Decorative | None | Backgrounds, dividers |

```tsx
{/* Safe dark-theme text hierarchy */}
<h1 className="text-white/90">Primary heading</h1>        {/* ~14:1 */}
<p className="text-white/70">Body text</p>                 {/* ~9:1 */}
<span className="text-white/50">Secondary info</span>      {/* ~5.5:1 */}
<span className="text-white/30">Decorative only</span>     {/* ~2.5:1 ⚠️ */}
```

## Typography

### Type Scale

Use a mathematical scale for harmonious sizing. Common ratios:

| Ratio | Name | Scale |
|-------|------|-------|
| 1.125 | Major Second | Tight, lots of sizes close together |
| 1.200 | Minor Third | Versatile, good default |
| 1.250 | Major Third | Clear hierarchy |
| 1.333 | Perfect Fourth | Strong hierarchy, editorial |
| 1.414 | Augmented Fourth | Dramatic, display-heavy |

```css
/* Minor Third scale (1.200) from 16px base */
--text-xs:  0.694rem;   /* 11px */
--text-sm:  0.833rem;   /* 13px */
--text-base: 1rem;      /* 16px */
--text-lg:  1.2rem;     /* 19px */
--text-xl:  1.44rem;    /* 23px */
--text-2xl: 1.728rem;   /* 28px */
--text-3xl: 2.074rem;   /* 33px */
--text-4xl: 2.488rem;   /* 40px */
--text-5xl: 2.986rem;   /* 48px */
```

### Font Pairing Rules

1. **Contrast in structure** — Pair serif display with sans body (or vice versa)
2. **Unity in character** — Both fonts should share a mood (geometric with geometric, humanist with humanist)
3. **Max 2 families** — One display, one body. Three is almost always too many.
4. **Weight variation** — Use weight, not more fonts, for hierarchy

### Recommended Pairings (Avoid Generic)

```css
/* Editorial / Luxury */
font-family: 'Playfair Display', serif;    /* Display */
font-family: 'Source Sans 3', sans-serif;  /* Body */

/* Modern / Technical */
font-family: 'Space Mono', monospace;      /* Display */
font-family: 'DM Sans', sans-serif;       /* Body */

/* Warm / Approachable */
font-family: 'Fraunces', serif;            /* Display */
font-family: 'Outfit', sans-serif;         /* Body */

/* Geometric / Clean */
font-family: 'Clash Display', sans-serif;  /* Display */
font-family: 'Satoshi', sans-serif;        /* Body */

/* Bold / Statement */
font-family: 'Cabinet Grotesk', sans-serif; /* Display */
font-family: 'General Sans', sans-serif;    /* Body */
```

### NEVER Use These (Overused)

- Inter, Roboto, Arial, Helvetica (as design choices — system fallbacks are fine)
- Space Grotesk (became AI-slop default)
- Poppins (overused in dashboards)
- Open Sans (invisible, no character)

### Loading Fonts (Next.js)

```tsx
// app/layout.tsx
import { Playfair_Display, Source_Sans_3 } from "next/font/google";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${display.variable} ${body.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
```

```css
/* globals.css — use the variables */
@layer base {
  h1, h2, h3 { font-family: var(--font-display); }
  body { font-family: var(--font-body); }
}
```

### Typography Patterns

```tsx
{/* Hero heading — tight tracking, bold */}
<h1 className="font-display text-4xl font-bold tracking-tight text-white/90 md:text-6xl lg:text-7xl">
  Portfolio
</h1>

{/* Section heading */}
<h2 className="text-2xl font-semibold tracking-tight text-white/85 md:text-3xl">
  Projects
</h2>

{/* Body text — comfortable line height */}
<p className="max-w-prose text-base leading-relaxed text-white/60">
  Description text with good readability.
</p>

{/* Caption / label */}
<span className="text-xs font-medium uppercase tracking-wider text-white/40">
  Category
</span>

{/* Monospace for code/data */}
<code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-amber-400">
  value
</code>
```

### Line Length

Optimal readable line length is 45-75 characters (roughly `max-w-prose` in Tailwind = 65ch):

```tsx
{/* Constrain text width for readability */}
<p className="max-w-prose">Long paragraph text...</p>

{/* Or explicit ch units */}
<p className="max-w-[60ch]">Slightly narrower.</p>
```

## Color + Type Together

### Hierarchy Through Color + Weight (Not Size Alone)

```tsx
{/* Strong hierarchy without size jumps */}
<div>
  <h3 className="text-base font-semibold text-white/90">Primary info</h3>
  <p className="text-base text-white/55">Supporting info — same size, lower contrast</p>
  <span className="text-sm text-white/35">Tertiary info — smaller and lighter</span>
</div>
```

### Colored Accents

```tsx
{/* Accent color for emphasis — not on body text */}
<span className="text-amber-400">Highlighted term</span>

{/* Colored badge */}
<span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
  New
</span>
```

## See Also

- `frontend-design` — Color and type as part of distinctive aesthetics
- `accessibility` — Contrast ratios, readable sizing
- `design-systems` — Token architecture for colors and type
