---
name: responsive-layout
description: Responsive design and layout - CSS Grid, Flexbox, container queries, breakpoints, mobile-first design with Tailwind CSS. Use when building page layouts, responsive components, grid systems, or adapting interfaces across screen sizes.
---

# Responsive Layout

## Mobile-First with Tailwind

Always design mobile-first, then layer on complexity for larger screens:

```tsx
// Mobile-first: base styles are mobile, modifiers add up
<div className="px-4 py-8 md:px-8 md:py-12 lg:px-16 lg:py-20">
  <h1 className="text-2xl md:text-4xl lg:text-5xl">Heading</h1>
</div>
```

### Tailwind Breakpoints

| Prefix | Min-width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

## CSS Grid Patterns

### Auto-Responsive Grid

```tsx
{/* Auto-fill: cards fill available space, min 280px each */}
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {projects.map(p => <Card key={p.id} {...p} />)}
</div>

{/* CSS auto-fill for truly fluid grids (no breakpoints needed) */}
<div className="grid gap-6" style={{
  gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))"
}}>
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Named Grid Areas

```tsx
<div className="grid gap-6 md:grid-cols-[240px_1fr] md:grid-rows-[auto_1fr_auto]"
  style={{
    gridTemplateAreas: `
      "sidebar header"
      "sidebar main"
      "sidebar footer"
    `
  }}
>
  <aside style={{ gridArea: "sidebar" }} className="hidden md:block">
    Navigation
  </aside>
  <header style={{ gridArea: "header" }}>Header</header>
  <main style={{ gridArea: "main" }}>Content</main>
  <footer style={{ gridArea: "footer" }}>Footer</footer>
</div>
```

### Asymmetric Layouts

```tsx
{/* 2/3 + 1/3 split */}
<div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
  <main>Primary content</main>
  <aside>Sidebar</aside>
</div>

{/* Golden ratio-ish */}
<div className="grid gap-8 lg:grid-cols-[1.618fr_1fr]">
  <div>Larger area</div>
  <div>Smaller area</div>
</div>
```

## Flexbox Patterns

### Responsive Nav

```tsx
<nav className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <a href="/" className="text-xl font-bold">Logo</a>
  <ul className="flex flex-wrap gap-4">
    <li><a href="/projects">Projects</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Flexible Card Row

```tsx
{/* Cards wrap to next row, equal height within each row */}
<div className="flex flex-wrap gap-6">
  {items.map(item => (
    <div key={item.id} className="min-w-[280px] flex-1 basis-[calc(33.333%-1.5rem)]">
      <Card {...item} />
    </div>
  ))}
</div>
```

### Centering

```tsx
{/* Absolute center */}
<div className="flex min-h-screen items-center justify-center">
  <div>Centered content</div>
</div>

{/* Vertical stack, centered */}
<div className="flex min-h-screen flex-col items-center justify-center gap-4">
  <h1>Title</h1>
  <p>Subtitle</p>
</div>
```

## Container Queries

For component-level responsive design (not viewport-dependent):

```tsx
{/* Parent defines container */}
<div className="@container">
  {/* Children respond to container width, not viewport */}
  <div className="flex flex-col gap-2 @sm:flex-row @sm:items-center @md:gap-4">
    <img className="h-16 w-16 rounded-lg @sm:h-20 @sm:w-20" src={img} alt="" />
    <div>
      <h3 className="text-base @md:text-lg">Title</h3>
      <p className="text-sm text-white/60">Description</p>
    </div>
  </div>
</div>
```

## Responsive Typography

```tsx
{/* Fluid type with clamp */}
<h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-bold leading-tight tracking-tight">
  Responsive heading
</h1>

{/* Tailwind responsive type */}
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
  Step-based heading
</h1>
```

## Touch Targets

Minimum 44x44px for interactive elements on touch devices:

```tsx
{/* Ensure touch target size */}
<button className="min-h-[44px] min-w-[44px] px-4 py-2">
  Tap me
</button>

{/* Invisible hit area expansion */}
<button className="relative p-2">
  <span className="absolute -inset-2" aria-hidden="true" />
  <Icon size={20} />
</button>
```

## Responsive Images

```tsx
import Image from "next/image";

{/* Next.js responsive image */}
<Image
  src="/hero.jpg"
  alt="Hero image"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
  priority
/>

{/* Art direction with picture element */}
<picture>
  <source media="(min-width: 1024px)" srcSet="/hero-wide.jpg" />
  <source media="(min-width: 640px)" srcSet="/hero-medium.jpg" />
  <img src="/hero-mobile.jpg" alt="Hero" className="w-full" />
</picture>
```

## Responsive Spacing System

```tsx
{/* Consistent responsive spacing scale */}
<section className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
  <div className="mx-auto max-w-6xl">
    <div className="space-y-4 md:space-y-6 lg:space-y-8">
      {/* Content */}
    </div>
  </div>
</section>
```

## Max Width Containers

```tsx
{/* Standard content widths */}
<div className="mx-auto max-w-prose">Readable text (65ch)</div>
<div className="mx-auto max-w-4xl">Medium content</div>
<div className="mx-auto max-w-6xl">Wide content</div>
<div className="mx-auto max-w-7xl">Full-width content</div>

{/* Full-bleed with constrained content */}
<div className="bg-gray-950">
  <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    Constrained content inside full-bleed background
  </div>
</div>
```

## Hiding / Showing

```tsx
{/* Show/hide by breakpoint */}
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>

{/* Different layout per breakpoint */}
<div className="md:hidden">
  <MobileNav />
</div>
<div className="hidden md:block">
  <DesktopNav />
</div>
```

## Common Pitfalls

1. **Fixed widths** — Use `max-w-*` + `w-full` instead of `w-[500px]`
2. **Overflow** — Always test horizontal scroll on mobile. Use `overflow-x-hidden` on body if needed.
3. **Viewport units** — `100vh` doesn't account for mobile browser chrome. Use `min-h-dvh` (dynamic viewport).
4. **Text overflow** — Long words/URLs can break layout. Use `break-words` or `truncate`.
5. **Hover-only interactions** — Touch devices don't hover. Always provide tap alternatives.

## See Also

- `frontend-design` — Layout as part of overall aesthetics
- `accessibility` — Touch targets, zoom, viewport scaling
- `design-systems` — Consistent spacing and sizing tokens
