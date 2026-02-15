# CLAUDE.md — keino-portfolio-site

## Project Overview

Interactive 3D portfolio site built with Next.js and React Three Fiber. Features a physics-enabled scene with draggable light cube, KEINO letter sculptures, bot companion, and page-based project showcases. The 3D world uses Rapier for physics simulation with an orthographic camera.

## Commands

```bash
bun dev          # Start dev server (Turbopack) on port 3000
bun build        # Production build (Turbopack)
bun start        # Start production server
bun lint         # ESLint
```

## Tech Stack

- **Framework:** Next.js 15.5, React 19, TypeScript 5
- **3D:** React Three Fiber 9, Three.js r181, @react-three/drei, @react-three/postprocessing
- **Physics:** @react-three/rapier 2.2 (Rapier WASM)
- **Animation:** Framer Motion 12
- **Styling:** Tailwind CSS 4
- **UI:** Shadcn only (no Radix, no MUI)
- **Icons:** Lucide React
- **Package Manager:** bun

## Project Structure

```
app/
  page.tsx              # Main homepage (redirects/wraps explore)
  explore/page.tsx      # Primary 3D scene — cube, letters, physics world
  experiment/           # Experimental features and prototypes
  v2/                   # V2 iteration of the site
  layout.tsx            # Root layout
  globals.css           # Global styles

components/
  3d/                   # All 3D components (physics-enabled)
    BotCube.tsx         # AI bot companion
    WorldWalls.tsx      # Viewport boundary walls
    MarbleFloor.tsx     # Floor collider + visual
    HomePlatform.tsx    # Raised platform for letters
    DetailPagePlane.tsx # Project page surfaces
    Debris.tsx          # Scattered debris objects
    DropZone.tsx        # Cube docking zone
    RightLetters3D.tsx  # KEINO letter meshes
    Card3D.tsx          # 3D card component
    ui/                 # 3D UI elements (NavPanel3D, Neumorphic3DButton, GlassCard)
  ui/                   # 2D UI components (GlassCard, NeumorphicButton)
  hero-section.tsx      # Hero section
  contact-section.tsx   # Contact section
  footer.tsx            # Footer

lib/
  physics-groups.ts     # Collision groups, Z layers, physics dimensions (CENTRAL CONFIG)
  constants.ts          # App-wide constants
  utils.ts              # Utility functions
  context-steering.ts   # Bot AI steering
  mock-data.ts          # Mock data for development

docs/
  architecture/
    viewport-boundaries.md  # How walls/boundaries work (READ THIS FIRST for physics)

types/                  # TypeScript type definitions
```

## Architecture — Physics World

### Central Config: `lib/physics-groups.ts`

All physics configuration lives here:
- **Collision groups** — bitmask-based filtering (FLOOR, PLATFORM, LETTERS, CUBE, WALLS, PAGES, DEBRIS, BOT)
- **Collision configs** — pre-built `interactionGroups()` for each object type
- **Z layers** — vertical positioning constants (FLOOR=0, PLATFORM_SURFACE=1.0, etc.)
- **Physics dimensions** — wall thickness, floor size, platform sizes

### Key Physics Rules

- **Viewport bounds:** Always use `useThree().viewport`, NEVER raw camera frustum. See `docs/architecture/viewport-boundaries.md`
- **Drag method:** Use `setTranslation` during drag + manual velocity tracking. NOT spring-based `setLinvel` (causes wall sticking)
- **Gravity:** `[0, 0, -9.8]` — Z is "down" (into the screen/floor)
- **Camera:** Orthographic, zoom 80→60 during scroll

### Tuned Physics Values

**Cube:** mass=2.0, restitution=0.7, friction=0.4, linearDamping=0.3, angularDamping=0.2
**Walls:** restitution=0.8, friction=0.2
**Letters:** mass=0.1, restitution=0.3, friction=0.4, linearDamping=0.5, angularDamping=0.3

Rules of thumb:
- `linearDamping > 1.0` kills momentum (object stops dead)
- `angularDamping > 1.0` prevents rolling
- Wall `friction > 0.3` causes wall-riding instead of bouncing
- Cube `mass < 0.5` feels weightless

### Debug Walls

`WorldWalls.tsx` currently has colored debug meshes (red=left, blue=right, green=top, yellow=bottom at 35% opacity). Remove `<mesh>` children for production.

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling (no CSS modules, no styled-components)
- Shadcn for UI components (no Radix directly, no MUI)
- Conventional commits for git messages
- No Claude co-authoring in commits

## Development Workflow

- **RALPH Loop (default):** Rapid prototype → test in browser → iterate. Use placeholders freely. Ship working prototypes fast, polish later. Always exit plan mode into RALPH loop execution.

## Key Patterns

### 3D Components
- All physics objects use `RigidBody` from `@react-three/rapier`
- Collision filtering via `collisionGroups` prop with configs from `physics-groups.ts`
- Components use `useFrame` for per-frame updates, `useThree` for scene access

### Scroll-Based Scene
- `explore/page.tsx` manages scroll progress (0→1)
- Phase 1 (0→0.5): Homepage with KEINO letters, cube interaction
- Phase 2 (0.5→1): Project pages slide in, platform transitions

### Cube Behavior
- Draggable with pointer events
- Idle hover: rises + grows 50% + glows after 1s of no interaction
- Docks into socket to power nav panel
- Releases with physics momentum on pointer up
