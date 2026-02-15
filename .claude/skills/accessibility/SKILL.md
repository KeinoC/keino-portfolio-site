---
name: accessibility
description: Web accessibility (a11y) - WCAG 2.1 AA compliance, ARIA patterns, keyboard navigation, screen readers, focus management, color contrast. Use when building UI components, forms, navigation, modals, or any interactive elements to ensure they are accessible to all users.
---

# Web Accessibility (a11y)

## Quick Reference — WCAG 2.1 AA

| Principle | Key Rules |
|-----------|-----------|
| Perceivable | Text alternatives, captions, contrast ≥ 4.5:1, resize to 200% |
| Operable | Keyboard accessible, no time traps, skip nav, focus visible |
| Understandable | Readable, predictable, input assistance |
| Robust | Valid HTML, ARIA where needed, works with assistive tech |

## Semantic HTML First

Always use semantic elements before reaching for ARIA:

```tsx
// DO: Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Page Title</h1>
    <section aria-labelledby="skills-heading">
      <h2 id="skills-heading">Skills</h2>
    </section>
  </article>
</main>

// DON'T: div soup with ARIA bolted on
<div role="navigation">
  <div role="list">
    <div role="listitem"><div role="link" tabIndex={0}>Projects</div></div>
  </div>
</div>
```

## Heading Hierarchy

```tsx
// DO: Logical hierarchy (no skipping levels)
<h1>Portfolio</h1>
  <h2>Projects</h2>
    <h3>Project Name</h3>
  <h2>Skills</h2>

// DON'T: Skip levels or use headings for styling
<h1>Portfolio</h1>
  <h4>Projects</h4>  {/* Skipped h2, h3 */}
```

## Keyboard Navigation

### Focus Management

```tsx
// Visible focus indicator (Tailwind)
<button className="rounded-lg px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900">
  Click me
</button>

// NEVER remove focus outlines without replacement
// BAD: outline-none with nothing else
// GOOD: focus-visible:ring-2 (only shows for keyboard users)
```

### Focus Trap (Modals/Dialogs)

```tsx
import { useEffect, useRef } from "react";

function useFocusTrap(isOpen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
      if (e.key === "Escape") {
        // Close modal logic here
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return containerRef;
}
```

### Skip Navigation

```tsx
// First element in body
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:shadow-lg"
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {/* Page content */}
</main>
```

## ARIA Patterns

### Live Regions (Dynamic Content)

```tsx
// Announce status changes to screen readers
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>

// Urgent alerts
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Buttons vs Links

```tsx
// Link: navigates somewhere
<a href="/projects">View projects</a>

// Button: performs an action
<button onClick={handleSubmit}>Submit form</button>

// NEVER: clickable divs or spans
// If you must use a non-semantic element:
<div role="button" tabIndex={0} onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
}} onClick={handleClick}>
  Action
</div>
```

### Accessible Forms

```tsx
<form>
  {/* Always associate labels */}
  <div>
    <label htmlFor="email" className="block text-sm text-white/70">
      Email address
    </label>
    <input
      id="email"
      type="email"
      required
      aria-describedby="email-hint email-error"
      aria-invalid={hasError}
      className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
    />
    <p id="email-hint" className="mt-1 text-xs text-white/40">
      We'll never share your email.
    </p>
    {hasError && (
      <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
        Please enter a valid email address.
      </p>
    )}
  </div>

  {/* Group related fields */}
  <fieldset>
    <legend className="text-sm font-medium text-white/70">Preferred contact</legend>
    <label><input type="radio" name="contact" value="email" /> Email</label>
    <label><input type="radio" name="contact" value="phone" /> Phone</label>
  </fieldset>
</form>
```

### Accessible Tooltips / Popovers

```tsx
<button
  aria-describedby="tooltip-1"
  onMouseEnter={() => setShow(true)}
  onMouseLeave={() => setShow(false)}
  onFocus={() => setShow(true)}
  onBlur={() => setShow(false)}
>
  Hover me
</button>
{show && (
  <div id="tooltip-1" role="tooltip">
    Tooltip content
  </div>
)}
```

## Color Contrast

### Minimum Ratios (WCAG AA)

| Element | Ratio |
|---------|-------|
| Normal text (< 18px) | ≥ 4.5:1 |
| Large text (≥ 18px bold or ≥ 24px) | ≥ 3:1 |
| UI components & graphics | ≥ 3:1 |

### Common Pitfalls

```tsx
// BAD: Low contrast text on dark background
<p className="text-white/30">Hard to read</p>  {/* ~1.8:1 ratio */}

// GOOD: Sufficient contrast
<p className="text-white/60">Readable text</p>  {/* ~5.5:1 ratio */}

// BAD: Relying solely on color to convey meaning
<span className="text-red-500">Error</span>

// GOOD: Color + icon + text
<span className="text-red-400">⚠ Error: Field required</span>
```

## Images & Media

```tsx
// Informative image
<img src="/project.png" alt="Dashboard showing sales analytics with bar chart" />

// Decorative image (hide from screen readers)
<img src="/decoration.svg" alt="" role="presentation" />

// Complex image
<figure>
  <img src="/architecture.png" alt="System architecture diagram" aria-describedby="arch-desc" />
  <figcaption id="arch-desc">
    Three-tier architecture with React frontend, Node API, and PostgreSQL database.
  </figcaption>
</figure>
```

## Reduced Motion

```tsx
// CSS
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

// Tailwind
<div className="transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none">
  Animated content
</div>

// Framer Motion
import { useReducedMotion } from "framer-motion";

function Component() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      animate={{ opacity: 1, y: prefersReduced ? 0 : 20 }}
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
    />
  );
}
```

## Screen Reader Utilities (Tailwind)

```tsx
// Visually hidden but accessible to screen readers
<span className="sr-only">Close dialog</span>

// Hidden from screen readers but visible
<div aria-hidden="true">🎨</div>
```

## Testing Checklist

1. **Keyboard**: Tab through entire page — can you reach and operate everything?
2. **Screen reader**: Test with VoiceOver (Mac: Cmd+F5) or NVDA (Windows)
3. **Zoom**: 200% zoom — does layout break?
4. **Contrast**: Check ratios with browser DevTools accessibility panel
5. **Motion**: Enable "Reduce motion" in OS settings — does it respect it?
6. **No mouse**: Unplug mouse and use the entire interface

## See Also

- `color-typography` — Contrast ratios, readable type scales
- `responsive-layout` — Touch targets, viewport scaling
- `frontend-design` — Inclusive design as part of aesthetics
