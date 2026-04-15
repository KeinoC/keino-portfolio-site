# ANQUA-Inspired Portfolio Theme

## Overview

Design system inspired by the ANQUA Architecture Proposal Template by Studio Bons. A luxury editorial aesthetic featuring matte black backgrounds, metallic gold accents, and sophisticated typography.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Deep Black | `#0d0d0f` | Primary background |
| Rich Black | `#1a1a1c` | Secondary background |
| Charcoal | `#2a2a2c` | Card backgrounds |
| Dark Gray | `#3d3d40` | Borders, dividers |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Gold Primary | `#c9a962` | Headlines, accents |
| Gold Light | `#d4b06a` | Hover states |
| Gold Shimmer | `#e8d5a3` | Highlights |
| Champagne | `#f0e6c8` | Subtle accents |

### Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Body Text | `#8a8a8c` | Paragraphs |
| Muted Text | `#5a5a5c` | Secondary info |
| Light Text | `#b8b8ba` | Emphasized body |

### CSS Variables

```css
:root {
  /* Backgrounds */
  --bg-primary: #0d0d0f;
  --bg-secondary: #1a1a1c;
  --bg-card: #2a2a2c;
  --bg-elevated: #3d3d40;
  
  /* Gold Accents */
  --gold-primary: #c9a962;
  --gold-light: #d4b06a;
  --gold-shimmer: #e8d5a3;
  --gold-champagne: #f0e6c8;
  
  /* Text */
  --text-body: #8a8a8c;
  --text-muted: #5a5a5c;
  --text-light: #b8b8ba;
  
  /* Metallic Gradient */
  --gold-gradient: linear-gradient(
    135deg,
    #c9a962 0%,
    #e8d5a3 50%,
    #c9a962 100%
  );
}
```

---

## Typography

### Font Stack

```css
/* Headers - Editorial Sans */
--font-display: 'PP Neue Montreal', 'Helvetica Neue', sans-serif;

/* Body - Clean Sans */
--font-body: 'Inter', 'SF Pro Text', sans-serif;

/* Accent - Condensed */
--font-accent: 'PP Neue Montreal Mono', 'SF Mono', monospace;
```

### Type Scale

| Element | Size | Weight | Letter Spacing | Transform |
|---------|------|--------|----------------|-----------|
| H1 | 4rem / 64px | 300 | 0.15em | uppercase |
| H2 | 2.5rem / 40px | 300 | 0.12em | uppercase |
| H3 | 1.5rem / 24px | 400 | 0.1em | uppercase |
| Body | 1rem / 16px | 400 | 0.02em | none |
| Caption | 0.75rem / 12px | 500 | 0.15em | uppercase |
| Page Number | 0.625rem / 10px | 500 | 0.2em | uppercase |

### Key Typography Patterns

1. **Wide Letter Spacing** — Headers use 0.1em–0.15em tracking
2. **Light Weights** — Display text at 300 weight for elegance
3. **All Caps Headers** — Uppercase with generous tracking
4. **Vertical Text** — Rotate 90° for spine/edge labels

---

## Design Elements

### 1. Texture Overlay (Matte Grain)

```css
.texture-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

### 2. Gold Metallic Text Effect

```css
.gold-text {
  background: var(--gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Animated shimmer */
.gold-shimmer {
  background: linear-gradient(
    90deg,
    #c9a962 0%,
    #e8d5a3 25%,
    #c9a962 50%,
    #e8d5a3 75%,
    #c9a962 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

### 3. Triple Bar Motif (|||)

Recurring design element used for:
- Section markers
- Logo accents
- Navigation indicators

```tsx
const TripleBar = ({ className }: { className?: string }) => (
  <div className={cn("flex gap-1", className)}>
    {[...Array(3)].map((_, i) => (
      <div key={i} className="w-0.5 h-6 bg-gold-primary" />
    ))}
  </div>
);
```

### 4. Parametric Wave Pattern

That beautiful wave/fingerprint pattern as an animated element:

```tsx
// Using canvas or SVG with animated paths
// Could be a hero background or section divider
// Libraries: p5.js, GSAP, or pure SVG animation
```

### 5. Constellation/Node Diagrams

For skills visualization or project relationships:
- Nodes connected by thin gold lines
- Subtle glow on hover
- Animated drawing effect on scroll

### 6. Thin Gold Accent Lines

```css
.gold-border {
  border: 1px solid rgba(201, 169, 98, 0.3);
}

.gold-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--gold-primary),
    transparent
  );
}
```

---

## Layout Patterns

### Editorial Grid

```css
.editorial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Asymmetric layouts like the reference */
.layout-left-heavy {
  grid-template-columns: 2fr 1fr;
}

.layout-right-heavy {
  grid-template-columns: 1fr 2fr;
}
```

### Vertical Spine Text

```css
.spine-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
  letter-spacing: 0.2em;
  font-size: 0.625rem;
  color: var(--gold-primary);
  text-transform: uppercase;
}
```

### Page Number System

Following the "NQ-A XI" pattern:
```tsx
const PageNumber = ({ section, page }: { section: string; page: number }) => {
  const roman = toRomanNumeral(page);
  return (
    <span className="page-number">
      {section} {roman}
    </span>
  );
};
```

---

## Page Flip / Book Effect Options

### Option 1: react-pageflip (Lightweight)

```bash
bun add react-pageflip
```

Pros:
- Easy to implement
- Good mobile support
- Realistic page curl effect

### Option 2: Three.js Book Geometry (Fits existing stack)

Since we're already using R3F, create actual 3D pages:
- Page meshes with bend deformations
- Physics-based page turn
- Cohesive with globe world

### Option 3: CSS Page Curl (Simplest)

Pure CSS transforms for a subtle effect:
- Uses clip-path and transforms
- Lighter weight
- Good for simpler transitions

### Recommended Approach

**Hybrid**: Keep the globe world as exploration, but when entering a building:
1. Transition into a book-like UI
2. Projects displayed as pages to flip through
3. Each "building" on the globe = a chapter in the book

---

## Integration with Globe World

### Theming the Existing Globe

Apply the ANQUA palette to current 3D elements:

```tsx
// Building materials
const buildingMaterial = new MeshStandardMaterial({
  color: '#1a1a1c',
  metalness: 0.3,
  roughness: 0.8,
});

// Gold trim/accents
const goldAccentMaterial = new MeshStandardMaterial({
  color: '#c9a962',
  metalness: 0.9,
  roughness: 0.2,
  emissive: '#c9a962',
  emissiveIntensity: 0.1,
});

// Ground/terrain
const terrainMaterial = new MeshStandardMaterial({
  color: '#0d0d0f',
  roughness: 0.9,
});
```

### Lighting Adjustments

```tsx
// Warm ambient for gold highlights
<ambientLight intensity={0.2} color="#f0e6c8" />

// Directional for dramatic shadows
<directionalLight
  position={[10, 10, 5]}
  intensity={0.8}
  color="#ffffff"
/>

// Gold accent lights on buildings
<pointLight
  position={buildingPosition}
  intensity={0.5}
  color="#c9a962"
  distance={5}
/>
```

---

## Component Checklist

### Foundation
- [ ] Color system (CSS variables / Tailwind config)
- [ ] Typography system
- [ ] Noise texture overlay
- [ ] Gold gradient utilities

### UI Components
- [ ] TripleBar motif
- [ ] GoldText with shimmer
- [ ] VerticalSpineText
- [ ] PageNumber (Roman numerals)
- [ ] ThinGoldLine / GoldBorder
- [ ] CharcoalCard

### Animated Elements
- [ ] Parametric wave pattern (SVG/Canvas)
- [ ] Constellation node diagram
- [ ] Line draw-on-scroll animations
- [ ] Gold shimmer animation

### Layout Components
- [ ] EditorialGrid
- [ ] AsymmetricLayout
- [ ] BookSpread (if doing page flip)

### 3D Updates
- [ ] Dark theme materials for globe
- [ ] Gold accent lights
- [ ] Building trim/details

---

## Reference Links

- [ANQUA Template - Etsy](https://www.etsy.com/listing/1541518382/anqua-architecture-proposal-template)
- [Studio Bons](https://studiobons.com/)
- [react-pageflip](https://github.com/nickolaylavrinenko/react-pageflip)
- [StPageFlip](https://github.com/nickolaylavrinenko/StPageFlip)

---

## Next Steps

1. **Set up color system** — Add Tailwind config with ANQUA palette
2. **Create texture overlay** — Global noise grain component
3. **Build typography** — Font imports + utility classes
4. **Prototype wave pattern** — Animated SVG or canvas element
5. **Test page flip** — Evaluate react-pageflip vs custom Three.js
6. **Theme globe world** — Apply dark/gold materials to existing 3D

---

*Inspiration: ANQUA Architecture Proposal Template by Studio Bons*
*"ACTO NON VERBA" — Actions, not words*
