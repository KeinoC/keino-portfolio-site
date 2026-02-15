---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use when building web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

# Frontend Design

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme — brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Technical requirements (framework, performance, accessibility)
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

## Frontend Aesthetics Guidelines

### Typography
Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial, Inter, Roboto. Opt for distinctive choices — unexpected, characterful font pairings. Pair a distinctive display font with a refined body font.

### Color & Theme
Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

### Motion
Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Framer Motion for React. Focus on high-impact moments: one well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.

### Spatial Composition
Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.

### Backgrounds & Visual Details
Create atmosphere and depth — never default to solid colors. Apply creative forms: gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, grain overlays.

## Anti-Patterns — NEVER Use

- Overused fonts: Inter, Roboto, Arial, system fonts, Space Grotesk
- Cliched colors: purple gradients on white backgrounds
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character
- Same aesthetic across different pages/projects
- Generic glassmorphism without purpose

## Implementation Quality

```tsx
// DO: Intentional, cohesive design tokens
const theme = {
  colors: {
    surface: "hsl(220 15% 8%)",      // Deep charcoal
    accent: "hsl(45 95% 65%)",        // Warm gold
    muted: "hsl(220 10% 40%)",        // Soft gray
  },
  fonts: {
    display: "'Playfair Display', serif",
    body: "'Source Sans 3', sans-serif",
  },
};

// DON'T: Generic defaults
const bad = {
  colors: { primary: "#6366f1", background: "#ffffff" },
  fonts: { body: "Inter, sans-serif" },
};
```

## Tailwind CSS Patterns

```tsx
{/* Layered depth with backdrop blur */}
<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl">
  {/* Gradient accent */}
  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/5" />
  {/* Content */}
  <div className="relative z-10 p-8">
    <h2 className="text-3xl font-bold tracking-tight text-white/90">
      Distinctive heading
    </h2>
  </div>
</div>

{/* Hover micro-interaction */}
<button className="group relative overflow-hidden rounded-lg bg-white/5 px-6 py-3 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-amber-500/10">
  <span className="relative z-10 text-white/80 transition-colors group-hover:text-white">
    Action
  </span>
  <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-amber-500/20 to-transparent transition-transform duration-500 group-hover:translate-y-0" />
</button>
```

## Shadcn Integration

When using Shadcn components, always customize them beyond defaults:

```tsx
// DO: Extend Shadcn with distinctive styling
<Card className="border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl">
  <CardHeader className="border-b border-white/5">
    <CardTitle className="font-display text-2xl tracking-tight">
      Custom styled
    </CardTitle>
  </CardHeader>
</Card>

// DON'T: Use Shadcn with zero customization
<Card>
  <CardHeader>
    <CardTitle>Generic</CardTitle>
  </CardHeader>
</Card>
```

## Complexity Matching

Match implementation complexity to aesthetic vision:
- **Maximalist** → elaborate code, extensive animations, layered effects
- **Minimalist** → restraint, precision, careful spacing, typography, subtle details
- Elegance comes from executing the vision well, not from adding more

## See Also

- `color-typography` — Color theory, type scales, font pairing
- `animation-motion` — Motion design, Framer Motion, scroll effects
- `responsive-layout` — Responsive patterns, grid systems
- `design-systems` — Token architecture, component APIs
- `accessibility` — WCAG compliance, keyboard nav, screen readers
