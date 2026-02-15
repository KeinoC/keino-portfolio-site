# Viewport Boundaries — 3D Physics World

How the screen-edge walls work, how to debug them, and lessons learned from tuning.

## Overview

`WorldWalls` (`components/3d/WorldWalls.tsx`) places four rigid body walls at the viewport edges to keep physics objects on screen. The cube, letters, debris, and bot all collide with these walls.

## Architecture

```
┌─────────────────────────────────────┐
│           TOP (green)               │
│                                     │
│  L                             R    │
│  E        visible scene        I    │
│  F                             G    │
│  T        ┌───────────┐       H    │
│           │  KEINO     │       T    │
│  (red)    │  letters   │  (blue)   │
│           │   + cube   │            │
│           └───────────┘            │
│                                     │
│         BOTTOM (yellow)             │
└─────────────────────────────────────┘
```

Each wall is a `RigidBody type="fixed"` with a `CuboidCollider`. Walls are part of the `WALLS` collision group and interact with letters, cube, debris, and bot (see `lib/physics-groups.ts`).

## Critical: How to Calculate Viewport Bounds

### The correct way — use R3F `viewport`

```tsx
const { viewport } = useThree()
const halfWidth = viewport.width / 2
const halfHeight = viewport.height / 2
```

R3F's `viewport` gives you the visible world-space dimensions **accounting for camera zoom**. This is the same coordinate system used by all other scene objects.

### The WRONG way — raw camera frustum

```tsx
// DO NOT USE for positioning
const ortho = camera as THREE.OrthographicCamera
const halfWidth = (ortho.right - ortho.left) / 2  // WRONG
const halfHeight = (ortho.top - ortho.bottom) / 2  // WRONG
```

The raw frustum values (`ortho.left`, `ortho.right`, etc.) represent the **unzoomed** camera bounds. With `zoom: 80`, the actual visible area is 80x smaller than these values suggest. Using raw frustum positions the walls way off-screen.

### Why this matters

The Canvas is configured with:
```tsx
<Canvas orthographic camera={{ position: [0, 0, 100], zoom: 80 }} />
```

- Raw frustum width: ~24 units (based on pixel dimensions / 2)
- `viewport.width` at zoom 80: ~24 / 80 = ~0.3 units
- Actual visible world width: what `viewport.width` returns

The camera zoom also changes during scroll (80 → 60), so `viewport` dynamically adapts while raw frustum stays the same.

## Wall Physics (Tuned Values)

| Property | Value | Notes |
|----------|-------|-------|
| `WALL_THICKNESS` | 0.5 | From `lib/physics-groups.ts` |
| `WALL_HEIGHT` | 5 | Z-axis extent (depth into screen) |
| Collision group | `WALLS` (16) | Bitmask for collision filtering |
| Collides with | Letters, Cube, Debris, Bot | See `COLLISION_CONFIGS.walls` |
| **Restitution** | **0.8** | High — makes objects bounce off walls visibly |
| **Friction** | **0.2** | Low — prevents objects riding/sticking along wall surface |

### Why these values matter

- **High restitution (0.8)**: The cube needs to bounce *away* from walls, not absorb into them. Combined with the cube's own restitution (0.7), this creates punchy bounces.
- **Low friction (0.2)**: Higher friction caused objects to "ride" along the wall surface while spinning instead of bouncing off. Low friction lets the collision normal dominate.

## Cube Physics (Tuned Values)

The cube must feel like a solid, weighty object:

| Property | Value | Why |
|----------|-------|-----|
| `mass` | 2.0 | Heavy enough to feel solid, pushes letters |
| `restitution` | 0.7 | Bouncy off walls and objects |
| `friction` | 0.4 | Moderate grip for rolling |
| `linearDamping` | 0.3 | Low — preserves momentum after release |
| `angularDamping` | 0.2 | Low — allows natural tumble/roll |

### What NOT to do with cube physics

- `linearDamping > 1.0` kills all momentum instantly — cube stops dead on release
- `angularDamping > 1.0` prevents rotation — cube slides instead of rolling
- `mass < 0.5` makes the cube feel weightless, doesn't push letters

## Drag Method: setTranslation (NOT spring velocity)

### What works: `setTranslation` during drag + velocity tracking for release

```tsx
// Track velocity from position deltas
velocity.current.set(
  (targetX - lastDragPos.current.x) * 60,
  (targetY - lastDragPos.current.y) * 60,
  0
)
lastDragPos.current.set(targetX, targetY, targetZ)

// Direct position during drag
rigidBodyRef.current.setTranslation({ x: targetX, y: targetY, z: targetZ }, true)
rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
```

On pointer up, apply the tracked velocity so the cube carries momentum into wall bounces.

### What DOESN'T work: spring-based velocity during drag

```tsx
// DO NOT USE — causes wall sticking and sticky cursor feel
const dx = targetX - currentPos.x
rigidBodyRef.current.setLinvel({ x: dx * springStrength, ... }, true)
```

**Problems with spring approach:**
1. **Wall sticking**: The spring pushes the cube toward the cursor target every frame. When the target is near a wall, the spring overrides the wall's bounce response, pinning the cube against the wall surface.
2. **Sticky cursor**: High spring strength makes the cube feel glued to the cursor. Low spring strength makes it feel laggy. No good middle ground.
3. **Wall riding**: The cube slides along wall surfaces while spinning because the spring's perpendicular component keeps pushing into the wall while the parallel component slides freely.

### Drag bounds padding

`CUBE_PADDING = 0.6` — keeps the drag target away from walls so the cube doesn't get dragged right into the wall face. This padding is larger than the wall thickness (0.5) to give breathing room.

## Wall Positions

Each wall is offset by `thickness / 2` so the inner face sits exactly at the viewport edge:

| Wall | Position | Collider Size (half-extents) |
|------|----------|------------------------------|
| Left | `[-halfWidth - t/2, 0, h/2]` | `[t/2, halfHeight+1, h/2]` |
| Right | `[halfWidth + t/2, 0, h/2]` | `[t/2, halfHeight+1, h/2]` |
| Top | `[0, halfHeight + t/2, h/2]` | `[halfWidth+1, t/2, h/2]` |
| Bottom | `[0, -halfHeight - t/2, h/2]` | `[halfWidth+1, t/2, h/2]` |

The `+1` on the perpendicular axis ensures corners are covered (walls overlap slightly at edges).

## Debug Visualization

The walls currently have colored meshes for debugging. Each wall has a semi-transparent `meshStandardMaterial`:

| Wall | Color | Hex |
|------|-------|-----|
| Left | Red | `#ff0000` |
| Right | Blue | `#0088ff` |
| Top | Green | `#00ff44` |
| Bottom | Yellow | `#ffee00` |

All at `opacity: 0.35` with `transparent: true`.

### To toggle debug visuals

Remove the `<mesh>` children from each `RigidBody` in `WorldWalls.tsx` to make walls invisible again for production. The colliders work independently of the visual meshes.

## Adding / Modifying Walls

1. Wall positions derive from `viewport` — they auto-adapt to screen size and camera zoom
2. To change what collides with walls, update `COLLISION_CONFIGS.walls` in `lib/physics-groups.ts`
3. To add a new object type that should respect walls, add `PHYSICS_GROUPS.WALLS` to that object's collision mask
4. The `+1` overlap on perpendicular axes prevents objects from slipping through corners — keep this margin

## V2 Scene — Wall-less Boundary Bounce

V2 (`app/v2/page.tsx`) doesn't use `WorldWalls`. Instead it uses programmatic boundary checks in `useFrame`:

### Boundary approach
- X/Y edges: clamp position + reverse velocity at 60% (`* 0.6`)
- Z ceiling: `IDLE_HOVER_HEIGHT + 1.0 = 3.0` — soft bounce at 30% to prevent flying off screen
- NaN safety: resets cube to origin if position goes NaN

### Release physics (tuned)
- **`setLinvel`** with tracked drag velocity — NOT `applyImpulseAtPoint`
- Velocity tracking: position deltas `* 60` (one-frame-at-60fps)
- `maxSpeed = 15` — lower values make cube feel frozen
- `z: -2` gentle downward nudge on release (gravity handles the rest)
- `setAngvel` from throw direction (`vy * 2, -vx * 2`) for natural tumble

### Scale clamping
- Active state: `Math.min(LIFT_SCALE, 1 + Math.max(0, pos.z / LIFT_HEIGHT) * (LIFT_SCALE - 1))`
- Without `Math.min` cap, z-overshoot from floor bounce causes 75%+ scale growth in ortho camera

### What went wrong before these fixes
| Problem | Root cause | Fix |
|---------|-----------|-----|
| Cube slams into floor on gentle release | `applyImpulseAtPoint` with fixed `z: -8 * mass = -40` | Use `setLinvel` with `z: -2` |
| Cube grows huge after throw | Unbounded scale formula `pos.z / LIFT_HEIGHT` | Cap with `Math.min(LIFT_SCALE, ...)` |
| Cube flies off screen for seconds | Low damping (0.3) + massive impulse | `setLinvel` gives proportional velocity |
| Cube feels impossible to throw | Velocity multiplier `* 10` + `maxSpeed=3` | `* 60` + `maxSpeed=15` |

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Walls not visible / objects fly off screen | Using raw camera frustum instead of `viewport` | Switch to `useThree().viewport` |
| Objects pass through walls | Missing collision group in `physics-groups.ts` | Add `WALLS` to the object's collision mask |
| Objects stuck/riding along wall | Wall friction too high OR spring drag fighting bounce | Lower wall friction to 0.2, use `setTranslation` not spring |
| Cube doesn't bounce off walls | Low restitution + high linearDamping | Wall restitution 0.8, cube restitution 0.7, linearDamping 0.3 |
| Cube feels weightless | Mass too low | Cube mass 2.0 minimum |
| Walls don't move when camera zooms | `viewport` updates reactively — should work automatically | Verify `WorldWalls` re-renders on zoom changes |
| Walls visible in wrong position on resize | Component not re-rendering | `viewport` from `useThree()` triggers re-render on resize |
