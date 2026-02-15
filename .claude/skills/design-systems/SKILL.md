---
name: design-systems
description: Design systems and component architecture - design tokens, Tailwind theming, Shadcn component patterns, consistent spacing/sizing, component API design. Use when building reusable components, establishing design tokens, creating theme systems, or ensuring visual consistency across a project.
---

# Design Systems

## Design Tokens

Tokens are the atomic values that define your visual language. In Tailwind + Next.js, define them in CSS custom properties:

```css
/* globals.css */
@layer base {
  :root {
    /* Colors — HSL for easy manipulation */
    --color-surface: 220 15% 8%;
    --color-surface-raised: 220 12% 12%;
    --color-surface-overlay: 220 10% 16%;
    --color-border: 220 10% 20%;
    --color-border-subtle: 220 8% 14%;

    --color-text: 0 0% 95%;
    --color-text-muted: 220 8% 55%;
    --color-text-subtle: 220 6% 35%;

    --color-accent: 45 95% 65%;
    --color-accent-hover: 45 95% 72%;
    --color-accent-muted: 45 40% 30%;

    --color-success: 145 60% 50%;
    --color-warning: 35 90% 55%;
    --color-error: 0 70% 55%;

    /* Spacing scale */
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
    --space-24: 6rem;     /* 96px */

    /* Radii */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    --radius-2xl: 1.5rem;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
    --shadow-glow: 0 0 20px rgba(255,200,100,0.15);
  }
}
```

### Extending Tailwind with Tokens

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        "surface-raised": "hsl(var(--color-surface-raised) / <alpha-value>)",
        accent: "hsl(var(--color-accent) / <alpha-value>)",
      },
      borderRadius: {
        DEFAULT: "var(--radius-md)",
      },
    },
  },
};
```

## Shadcn Component Patterns

### Always Customize Beyond Defaults

```tsx
// DO: Extend Shadcn with your design tokens
import { Button } from "@/components/ui/button";

// Variant with custom styling
<Button
  variant="outline"
  className="border-white/10 bg-white/5 text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
>
  Custom styled
</Button>

// DON'T: Use Shadcn defaults without customization
<Button variant="outline">Generic</Button>
```

### Component Variant Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-white/10 bg-white/5 backdrop-blur-sm",
        elevated: "border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-xl",
        glass: "border-white/10 bg-white/5 backdrop-blur-2xl",
        solid: "border-white/5 bg-surface-raised",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:border-white/20 hover:bg-white/10",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

function Card({ className, variant, size, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, size, interactive }), className)}
      {...props}
    />
  );
}
```

### Composition Pattern

```tsx
// Compound component pattern for complex UI
function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-white/10 bg-white/5", className)} {...props}>{children}</div>;
}

function CardHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-white/5 px-6 py-4", className)} {...props}>{children}</div>;
}

function CardBody({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props}>{children}</div>;
}

function CardFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-white/5 px-6 py-4", className)} {...props}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

## Spacing Consistency

### The 4px Grid

All spacing should be multiples of 4px. Tailwind's default scale enforces this:

```
1 = 4px    (gap-1, p-1)
2 = 8px    (gap-2, p-2)
3 = 12px   (gap-3, p-3)
4 = 16px   (gap-4, p-4)
6 = 24px   (gap-6, p-6)
8 = 32px   (gap-8, p-8)
12 = 48px  (gap-12, p-12)
16 = 64px  (gap-16, p-16)
```

### Spacing Rules

```tsx
// Section spacing: generous (py-12 to py-24)
<section className="py-16 lg:py-24">

// Card internal spacing: comfortable (p-6 to p-8)
<div className="p-6 md:p-8">

// Between related elements: tight (gap-2 to gap-4)
<div className="space-y-3">
  <h3>Heading</h3>
  <p>Description</p>
</div>

// Between unrelated sections: wide (gap-8 to gap-16)
<div className="space-y-12">
  <Section1 />
  <Section2 />
</div>
```

## Icon System

Standardize icon sizing and usage:

```tsx
import { ArrowRight, ExternalLink, Check } from "lucide-react";

// Consistent icon sizes
const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Usage pattern
<button className="flex items-center gap-2 text-sm">
  Learn more <ArrowRight size={16} />
</button>
```

## Naming Conventions

| Category | Pattern | Examples |
|----------|---------|----------|
| Colors | `{role}` | `surface`, `accent`, `text-muted` |
| Spacing | `{context}-{size}` | `section-lg`, `card-md` |
| Components | `PascalCase` | `NavPanel`, `GlassCard` |
| Variants | `kebab-case` | `outline`, `ghost`, `elevated` |
| States | `is{State}` | `isActive`, `isHovered`, `isLoading` |
| Handlers | `handle{Action}` | `handleClick`, `handleSubmit` |

## Consistency Checklist

Before shipping any component:

1. Uses design tokens (not magic numbers)
2. Follows the 4px spacing grid
3. Has hover/focus/active states
4. Handles loading and empty states
5. Responsive at all breakpoints
6. Consistent with existing components in the project
7. Accessible (keyboard, screen reader, contrast)

## See Also

- `frontend-design` — Distinctive aesthetics on top of the system
- `color-typography` — Color tokens, type scale definitions
- `accessibility` — Component accessibility patterns
- `responsive-layout` — Responsive token application
