# Component Architecture Guide

## 🏗️ Project Structure

```
keino-portfolio-site/
├── app/
│   └── page.tsx                    # Main page - swap themes here
├── components/
│   ├── themes/                     # Theme-specific implementations
│   │   ├── spheres-menu/          # Original sphere design
│   │   │   └── index.tsx
│   │   ├── street-scene/          # Street/neighborhood design
│   │   │   └── index.tsx
│   │   └── globe-world/           # Globe with avatar (in progress)
│   │       ├── index.tsx
│   │       ├── Globe.tsx
│   │       ├── BuildingOnGlobe.tsx
│   │       ├── Avatar.tsx
│   │       ├── Controls.tsx
│   │       ├── BlankPlot.tsx
│   │       ├── ScrollZoom.tsx
│   │       └── types.ts
│   ├── shared/                    # Reusable across themes
│   │   ├── 3d/                    # Common 3D elements
│   │   │   ├── Lights.tsx
│   │   │   ├── Camera.tsx
│   │   │   ├── Particles.tsx
│   │   │   └── Effects.tsx
│   │   ├── ui/                    # UI overlays
│   │   │   ├── InfoCard.tsx
│   │   │   ├── NavigationButtons.tsx
│   │   │   ├── Instructions.tsx
│   │   │   └── LoadingScreen.tsx
│   │   └── controls/              # Input handling
│   │       ├── OrbitControls.tsx
│   │       └── AvatarControls.tsx
│   ├── hero-section.tsx           # Existing components
│   ├── experience-timeline.tsx
│   ├── skills-showcase.tsx
│   └── ... (other existing components)
└── plans/                         # All documentation
    └── ...
```

## 🧩 Shared Components (To Build)

### 3D Components (`components/shared/3d/`)

#### `Lights.tsx`
Standard lighting setups for consistent look across themes.

```tsx
interface LightsProps {
  preset?: 'day' | 'night' | 'sunset' | 'studio'
  ambientIntensity?: number
  accentColor?: string
}

export function Lights({ preset = 'night', ... }: LightsProps) {
  // Reusable lighting configurations
}
```

**Used by**: All themes

#### `Camera.tsx`
Configurable camera setups.

```tsx
interface CameraProps {
  position?: [number, number, number]
  fov?: number
  near?: number
  far?: number
}

export function Camera({ ... }: CameraProps) {
  // Camera with common settings
}
```

**Used by**: All themes

#### `Particles.tsx`
Particle system with customizable behavior.

```tsx
interface ParticlesProps {
  count?: number
  color?: string
  size?: number
  movement?: 'float' | 'orbit' | 'swirl'
  speed?: number
}

export function Particles({ ... }: ParticlesProps) {
  // Ambient particles for atmosphere
}
```

**Used by**: All themes

### UI Components (`components/shared/ui/`)

#### `InfoCard.tsx`
Display information about buildings/zones.

```tsx
interface InfoCardProps {
  title: string
  description: string
  category: string
  color: string
  onClose: () => void
  onViewProjects?: () => void
}

export function InfoCard({ ... }: InfoCardProps) {
  return (
    <motion.div className="glass-effect ...">
      {/* Info display with buttons */}
    </motion.div>
  )
}
```

**Used by**: Spheres, Street, Globe themes

#### `NavigationButtons.tsx`
Quick navigation to different zones/buildings.

```tsx
interface NavButton {
  key: string
  name: string
  color: string
  icon?: ReactNode
}

interface NavigationButtonsProps {
  buttons: NavButton[]
  activeKey: string | null
  onSelect: (key: string) => void
}

export function NavigationButtons({ ... }: NavigationButtonsProps) {
  // Bottom nav buttons
}
```

**Used by**: All themes

#### `Instructions.tsx`
Show control instructions to user.

```tsx
interface InstructionsProps {
  controls: {
    action: string
    keys: string[]
  }[]
}

export function Instructions({ controls }: InstructionsProps) {
  // Display controls help
}
```

**Used by**: Street, Globe themes

#### `LoadingScreen.tsx`
Loading state while 3D assets load.

```tsx
interface LoadingScreenProps {
  progress?: number
  message?: string
}

export function LoadingScreen({ ... }: LoadingScreenProps) {
  // Loading UI
}
```

**Used by**: All themes

### Control Components (`components/shared/controls/`)

#### `OrbitControls.tsx`
Wrapper for drei OrbitControls with presets.

```tsx
interface OrbitControlsProps {
  preset?: 'free' | 'limited' | 'locked'
  target?: Vector3
  autoRotate?: boolean
}

export function CustomOrbitControls({ ... }: OrbitControlsProps) {
  // Preconfigured orbit controls
}
```

**Used by**: Spheres, Street themes

#### `AvatarControls.tsx`
Character movement controls (for globe).

```tsx
interface AvatarControlsProps {
  avatarRef: RefObject<THREE.Group>
  speed?: number
  onMove?: (position: Vector3) => void
}

export function AvatarControls({ ... }: AvatarControlsProps) {
  // WASD + click-to-move
}
```

**Used by**: Globe theme (potentially Brain/House later)

## 📦 Theme Structure

### Each Theme Should Export

```tsx
// components/themes/[theme-name]/index.tsx

interface ThemeConfig {
  zones: Zone[]
  // theme-specific config
}

export default function ThemeName() {
  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  
  return (
    <section className="relative min-h-screen">
      {/* Background */}
      
      {/* 3D Canvas */}
      <Canvas>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="relative z-10">
        {activeZone && <InfoCard {...activeZone} />}
        <NavigationButtons ... />
        <Instructions ... />
      </div>
    </section>
  )
}
```

### Zone/Building Data Structure

```tsx
// Shared across all themes
interface Zone {
  key: string
  name: string
  category: string
  color: string
  description: string
  projects?: Project[]
}

interface Project {
  id: string
  name: string
  description: string
  tags: string[]
  link?: string
  image?: string
}
```

## 🔄 Swapping Themes

### In `app/page.tsx`

```tsx
// Option 1: Direct import
import SpheresMenu from '@/components/themes/spheres-menu'
import StreetScene from '@/components/themes/street-scene'
import GlobeWorld from '@/components/themes/globe-world'

export default function Home() {
  return (
    <main>
      <HeroSection />
      
      {/* Swap this line: */}
      <StreetScene />
      {/* <SpheresMenu /> */}
      {/* <GlobeWorld /> */}
      
      <ExperienceTimeline />
      {/* ... rest */}
    </main>
  )
}
```

```tsx
// Option 2: Config-based (more flexible)
import { getCurrentTheme } from '@/lib/theme-config'

export default function Home() {
  const ThemeComponent = getCurrentTheme()
  
  return (
    <main>
      <HeroSection />
      <ThemeComponent />
      <ExperienceTimeline />
      {/* ... rest */}
    </main>
  )
}
```

## 🎨 Styling Conventions

### Use Consistent Classes
```tsx
// Glass effect (already in globals.css)
className="glass-effect"

// Gradient text (already in globals.css)  
className="gradient-text"

// Theme-specific colors via inline styles
style={{ borderColor: zone.color }}
```

### Animation Patterns
```tsx
// Framer Motion for UI
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>

// Three.js useFrame for 3D
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
})
```

## 🔧 Development Workflow

### Adding a New Theme

1. **Create theme directory**
   ```bash
   mkdir components/themes/new-theme
   ```

2. **Create main component**
   ```tsx
   // components/themes/new-theme/index.tsx
   export default function NewTheme() {
     // Implementation
   }
   ```

3. **Use shared components**
   ```tsx
   import { Lights, Particles } from '@/components/shared/3d'
   import { InfoCard, NavigationButtons } from '@/components/shared/ui'
   ```

4. **Add to page.tsx**
   ```tsx
   import NewTheme from '@/components/themes/new-theme'
   // ...
   <NewTheme />
   ```

5. **Create plan document**
   ```bash
   touch plans/new-theme.md
   ```

### Building Shared Components

1. **Identify commonality** across themes
2. **Extract to `shared/`** with generic props
3. **Update existing themes** to use shared component
4. **Document in this file**

## 📝 Best Practices

### Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers
- Implement LOD (Level of Detail) for complex scenes
- Keep particle counts reasonable (<2000)
- Use instanced meshes when possible

### Code Organization
- One component per file
- Types in separate `types.ts` or inline
- Keep components focused and single-purpose
- Use composition over inheritance

### Naming Conventions
- Components: PascalCase (`InfoCard.tsx`)
- Hooks: camelCase with 'use' prefix (`useAvatarMovement.ts`)
- Types: PascalCase with descriptive names (`BuildingData`, `ZoneConfig`)
- Files: kebab-case for utilities (`scroll-utils.ts`)

### TypeScript
- Always type props
- Use interfaces for objects
- Avoid `any` - use `unknown` if truly unknown
- Export types that might be reused

## 🧪 Testing Considerations

### What to Test
- Theme switching works
- Shared components render correctly
- Interactions work (click, hover, scroll)
- Mobile responsiveness
- Performance (60fps target desktop, 30fps mobile)

### Manual Testing Checklist
- [ ] Theme loads without errors
- [ ] All buildings/zones clickable
- [ ] Navigation buttons work
- [ ] Camera moves smoothly
- [ ] UI overlays appear correctly
- [ ] Mobile touch controls work
- [ ] No performance issues

## 🎯 Future Enhancements

### Potential Shared Systems
- [ ] Route transitions between themes
- [ ] Persistent user preferences
- [ ] Analytics tracking wrapper
- [ ] A11y navigation system
- [ ] Sound effects manager
- [ ] Gesture recognition system

### Component Library Evolution
As we build more themes, we'll naturally discover more shared patterns. This architecture should evolve organically based on actual needs rather than premature abstraction.

---

**Last Updated**: Initial structure  
**Status**: Shared components to be built as needed  
**Next**: Build shared components during Globe theme implementation
