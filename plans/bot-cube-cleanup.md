# Bot Cube Component - Autonomous "Clean Up" Behavior

## Overview
Create a bot cube that can autonomously interact with other 3D elements and drag them to designated locations. The first behavior is "clean up" - detecting scattered elements and moving them to a target zone.

---

## Architecture Decisions

### Option A: Extend LightCube
Add bot logic directly to LightCube with a `mode` prop (`user` | `bot`)

**Pros**: Less code duplication
**Cons**: LightCube becomes complex, mixing user interaction with AI logic

### Option B: Separate BotCube Component (Recommended)
Create a new `BotCube` component that shares visual/physics primitives but has its own behavior system

**Pros**: Clean separation of concerns, easier to test and iterate
**Cons**: Some code duplication for rendering

### Option C: Shared CubeBase + Behavior HOCs
Extract shared cube primitives into `CubeBase`, wrap with behavior components

**Pros**: Maximum reusability
**Cons**: More abstraction overhead for current needs

**Recommendation**: Start with **Option B** for clarity, refactor to Option C later if more cube types are needed.

---

## Implementation Plan

### Phase 1: BotCube Base Component

**Create `components/3d/BotCube.tsx`**

```tsx
interface BotCubeProps {
  startPosition: [number, number, number]
  targetZone: { position: [number, number, number]; size: [number, number] }
  onTaskComplete?: () => void
  color?: string  // Default: different from user cube
}

function BotCube({ startPosition, targetZone, onTaskComplete, color = '#4488ff' }: BotCubeProps) {
  // State machine: 'idle' | 'scanning' | 'approaching' | 'grabbing' | 'returning' | 'releasing'
  const [state, setState] = useState<BotState>('idle')
  const [targetElement, setTargetElement] = useState<RapierRigidBody | null>(null)

  // Physics body ref
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  // Movement in useFrame...
}
```

### Phase 2: Behavior State Machine

```
┌─────────┐    timeout/trigger    ┌──────────┐
│  IDLE   │ ──────────────────────▶ SCANNING │
└─────────┘                        └────┬─────┘
     ▲                                  │ found target
     │                                  ▼
     │ no targets              ┌─────────────────┐
     └─────────────────────────│  APPROACHING   │
                               └────────┬────────┘
                                        │ reached target
                                        ▼
                               ┌─────────────────┐
                               │   GRABBING     │
                               └────────┬────────┘
                                        │ attached
                                        ▼
                               ┌─────────────────┐
                               │   RETURNING    │
                               └────────┬────────┘
                                        │ reached zone
                                        ▼
                               ┌─────────────────┐
                               │   RELEASING    │──▶ back to SCANNING
                               └─────────────────┘
```

### Phase 3: Detection System

**Approach: Scene Query via Rapier**

Use Rapier's `world.intersectionsWithShape()` to detect nearby rigid bodies:

```tsx
// In useFrame, during SCANNING state
const { world } = useRapier()

// Create a sphere shape for detection
const detectionRadius = 3.0
const nearbyBodies = world.intersectionsWithShape(
  botPosition,
  { w: 1, x: 0, y: 0, z: 0 },  // rotation
  new Ball(detectionRadius),
  (collider) => {
    // Filter: ignore floor, walls, self, and already-cleaned items
    return isCleanableTarget(collider)
  }
)
```

**Alternative: Sensor Collider**
Attach a larger sensor sphere to the bot that triggers `onIntersectionEnter`:

```tsx
<CuboidCollider args={[0.2, 0.2, 0.2]} />  {/* Physical collider */}
<CuboidCollider
  args={[detectionRadius, detectionRadius, 0.5]}
  sensor
  onIntersectionEnter={(e) => onTargetDetected(e.rigidBody)}
/>
```

### Phase 4: Grabbing Mechanism

**Approach: Joint Constraint**

When bot reaches target, create a physics joint to "attach" them:

```tsx
import { useFixedJoint } from '@react-three/rapier'

// When entering GRABBING state:
const joint = useFixedJoint(
  botRigidBodyRef,
  targetRigidBodyRef,
  [
    [0, -0.4, 0],  // Attach point on bot (below it)
    [0, 0, 0],     // Attach point on target (center)
    [1, 0, 0, 0],  // Rotation
    [1, 0, 0, 0],
  ]
)
```

**Alternative: Direct Position Sync**
In useFrame, manually set target position relative to bot:

```tsx
// During RETURNING state
targetRef.current.setTranslation({
  x: botPos.x,
  y: botPos.y - 0.5,  // Below bot
  z: botPos.z
}, true)
```

### Phase 5: Movement System

**Smooth autonomous movement using lerp + velocity:**

```tsx
useFrame((_, delta) => {
  if (state === 'approaching' && targetPosition) {
    const currentPos = rigidBodyRef.current.translation()
    const direction = {
      x: targetPosition.x - currentPos.x,
      y: targetPosition.y - currentPos.y,
      z: 0
    }
    const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2)

    if (distance < 0.3) {
      // Arrived - transition to GRABBING
      setState('grabbing')
    } else {
      // Move toward target with velocity
      const speed = 2.0  // units per second
      const normalizedDir = {
        x: direction.x / distance,
        y: direction.y / distance
      }
      rigidBodyRef.current.setLinvel({
        x: normalizedDir.x * speed,
        y: normalizedDir.y * speed,
        z: 0
      }, true)
    }
  }
})
```

### Phase 6: Target Zone Definition

**DropZone component** - visual indicator + sensor:

```tsx
function DropZone({ position, size, onItemDropped }: DropZoneProps) {
  return (
    <group position={position}>
      {/* Visual indicator */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.2} />
      </mesh>

      {/* Dashed border */}
      {/* ... */}

      {/* Sensor to detect drops */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[size[0]/2, size[1]/2, 0.5]}
          sensor
          onIntersectionEnter={onItemDropped}
        />
      </RigidBody>
    </group>
  )
}
```

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `components/3d/BotCube.tsx` | Main bot cube component with behavior state machine |
| `components/3d/DropZone.tsx` | Target zone for cleanup destination |
| `components/3d/hooks/useBotBehavior.ts` | (Optional) Extract behavior logic for reuse |
| `app/explore/page.tsx` | Add BotCube instance to scene for testing |

---

## Test Scenario

1. Add a `BotCube` to the scene positioned in the bottom-left
2. Add a `DropZone` in the bottom-right corner
3. Scatter some extra 3D elements (small cubes, debris)
4. Watch the bot scan, approach each element, grab it, and drag it to the drop zone
5. Bot returns to scanning after each drop

---

## Design Decisions (Finalized)

| Question | Decision |
|----------|----------|
| **Appearance** | Different color (blue/cyan) - same shape as light cube |
| **Targets** | Tagged elements only - elements marked with `userData.cleanable = true` |
| **User Interaction** | User can grab/stop it - interrupts task, resumes when released |

---

## Tagging System

Elements that should be cleanable need to be tagged:

```tsx
<RigidBody userData={{ cleanable: true, id: 'debris-1' }}>
  {/* ... mesh content ... */}
</RigidBody>
```

Bot detection filter:
```tsx
const isCleanableTarget = (collider: Collider) => {
  const rigidBody = collider.parent()
  const userData = rigidBody?.userData as { cleanable?: boolean } | undefined
  return userData?.cleanable === true
}
```

---

## Status: Implementation Complete
- [x] Finalize architecture decision (Option B: Separate BotCube)
- [x] Answer open questions
- [x] Implement Phase 1: BotCube Base
- [x] Implement Phase 2: State Machine
- [x] Implement Phase 3: Detection
- [x] Implement Phase 4: Grabbing
- [x] Implement Phase 5: Movement
- [x] Implement Phase 6: DropZone
- [x] Integration into explore page

## Files Created
- `components/3d/BotCube.tsx` - Main bot cube with state machine and autonomous behavior
- `components/3d/DropZone.tsx` - Target zone with visual indicators
- `components/3d/Debris.tsx` - Cleanable debris elements with `userData.cleanable = true`
