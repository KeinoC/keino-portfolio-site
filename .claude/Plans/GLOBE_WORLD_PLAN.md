# 🌍 Globe World Portfolio - Implementation Plan

## Vision Overview

Transform the portfolio from a static showcase into an **interactive journey**:
1. User scrolls from hero section
2. Camera zooms into a globe/planet
3. User gets an avatar to explore the world
4. Buildings are placed around the globe representing different work areas
5. A blank plot serves as an interactive intake form/collaboration invitation

## The Concept

**Metaphor**: "Welcome to my world"
- Each building is a neighborhood in Keino's world of work
- User gets an avatar = invited to explore and belong
- Blank plot = "Let's build something together"
- Globe = everything is connected, holistic view

---

## Phase 1: Scroll-Zoom Transition (Core Experience)

### Technical Approach

#### Option A: Scroll-Based Animation (Recommended)
```typescript
// Use scroll position to drive camera zoom
- Hero section: Camera far away showing title
- Scroll 0-50%: Camera zooms toward globe
- Scroll 50-100%: Camera settles on globe surface
- Use Intersection Observer or scroll listener
- Lock scroll during transition for smoothness
```

#### Option B: Click to Enter
```typescript
// Button on hero: "Enter My World"
- Click triggers zoom animation
- Simpler but less immersive
- Fallback for mobile?
```

### Implementation Steps
1. ✅ Set up scroll listener with progress tracking
2. ✅ Position camera based on scroll percentage
3. ✅ Smooth easing function for zoom
4. ✅ Lock scroll during animation
5. ✅ Show loading indicator for 3D assets
6. ✅ Fade out hero UI as camera zooms

### Libraries/Tools
- `framer-motion` - Already have it, use `useScroll`
- `@react-three/drei` - `ScrollControls` component
- Custom scroll controller

---

## Phase 2: Globe World Structure

### Globe Design

#### Size & Scale
```typescript
Globe radius: 15 units
Building height: 2-6 units (proportional to globe)
Avatar height: 0.3 units
Camera height: 1.5 units above globe surface
```

#### Surface Mapping
- Buildings placed using spherical coordinates (lat/long)
- Each building "sticks" to globe surface with normal alignment
- Street/ground wraps around sphere

### Building Placement on Globe

```typescript
const buildingLocations = [
  // Using lat/long like a real planet
  { name: 'Community Center', lat: 30, long: -45 },
  { name: 'Office Tower', lat: 0, long: 0 },      // Equator, prime meridian
  { name: 'Maker Space', lat: -20, long: 90 },
  { name: 'Startup Hub', lat: 15, long: 180 },
  { name: 'Design Studio', lat: -30, long: -120 },
  { name: 'Blank Plot', lat: 45, long: 60 }       // The collaboration space
]

// Convert to 3D coordinates
function latLongToVector3(lat, long, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (long + 180) * (Math.PI / 180)
  
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}
```

### Globe Surface
- **Option A**: Textured sphere with continents/oceans
- **Option B**: Stylized low-poly planet
- **Option C**: Abstract/geometric surface with zones
- **Recommended**: Option B or C for performance and style

### Visual Style
```typescript
// Stylized Planet Aesthetic
- Low-poly sphere (icosphere)
- Color zones for different "regions"
- Glowing atmosphere effect
- Ambient particles orbiting
- Subtle rotation on idle
```

---

## Phase 3: Avatar & Navigation

### Avatar Design

#### Visual Options
1. **Simple Capsule/Cylinder** (Easiest)
   - Basic shape, easy to implement
   - Can add simple "face" marker
   
2. **Low-Poly Character** (Medium)
   - More personality
   - Could use ready-made model from Sketchfab
   
3. **Abstract Orb/Light** (Unique)
   - Glowing sphere that represents user
   - Leaves light trail
   - Most abstract but elegant

**Recommended**: Start with #1, can upgrade to #2 later

### Navigation System

#### Control Schemes

**Option A: Third-Person WASD**
```typescript
Controls:
- W/↑: Move forward (along globe surface)
- S/↓: Move backward
- A/←: Rotate left
- D/→: Rotate right
- Space: Jump (optional)
- Mouse: Look around

Camera:
- Follows avatar from behind
- Always oriented to globe surface
- Smooth follow with lerp
```

**Option B: Click to Move**
```typescript
Controls:
- Click on globe surface to move avatar there
- Avatar walks/slides to position
- Mobile-friendly
- Less control but simpler

Camera:
- Follows avatar automatically
- Or free camera with avatar always visible
```

**Option C: Hybrid**
```typescript
Desktop: WASD
Mobile: Click/tap to move
Best of both worlds
```

**Recommended**: Option C (Hybrid)

### Gravity & Movement
```typescript
// Avatar sticks to globe surface
function updateAvatarPosition() {
  // Get current position
  const position = avatar.position.clone()
  
  // Normalize to globe radius + avatar height
  position.normalize().multiplyScalar(globeRadius + avatarHeight)
  
  // Orient avatar to surface normal
  avatar.up.copy(position.clone().normalize())
  avatar.lookAt(position.clone().add(avatar.forward))
  
  return position
}

// Movement
- Calculate forward direction along sphere surface
- Apply movement in that direction
- Continuously adjust to maintain distance from center
```

---

## Phase 4: Blank Plot - Interactive Intake Form

### The Concept

A **empty plot of land** on the globe that serves as:
- Visual invitation to collaborate
- Interactive form experience
- Memorable call-to-action

### Visual Design

#### Before Interaction
```
Empty lot with:
- "For Lease" or "Available" sign
- Construction markers/cones
- Blueprint hologram floating above
- Glowing outline
- Slightly different ground texture
```

#### During Interaction
```
Form appears as:
- Holographic interface above the plot
- 3D form panels
- Input fields materialize
- Glass-morphism aesthetic matching site
```

#### After Submission
```
- "Building Under Construction" appears
- Cranes/scaffolding
- "Thanks! I'll be in touch"
- Could save and show user's building next visit (stretch goal)
```

### Form Fields

```typescript
interface IntakeForm {
  name: string
  email: string
  company?: string
  projectType: 'Web Dev' | 'Hardware' | 'Financial' | 'Enterprise' | 'Other'
  budget?: string
  timeline?: string
  message: string
}
```

### Implementation
```typescript
// When avatar enters blank plot zone
if (distanceToBlankPlot < threshold) {
  showIntakeFormPrompt()
}

// Form as 3D HTML overlay
<Html position={blankPlotPosition} transform>
  <motion.div className="glass-effect intake-form">
    {/* Form fields */}
  </motion.div>
</Html>
```

---

## Phase 5: Polish & Details

### Environmental Details
- [ ] Atmosphere glow around globe
- [ ] Orbiting particles/satellites
- [ ] Stars in background
- [ ] Clouds (optional)
- [ ] Day/night cycle on globe
- [ ] Lighting that follows avatar
- [ ] Shadows on globe surface

### UI Elements
- [ ] Minimap showing avatar location
- [ ] Building labels that appear when nearby
- [ ] Compass/orientation indicator
- [ ] "You are here" marker
- [ ] Distance indicators to buildings
- [ ] Control instructions overlay

### Avatar Features
- [ ] Walking animation
- [ ] Footstep sounds
- [ ] Light trail behind avatar
- [ ] Ability to "enter" buildings (zoom in)
- [ ] Speed adjustment (walk/run)

### Building Interactions
- [ ] Click building to get info
- [ ] "Enter" building for detailed view
- [ ] See projects inside building
- [ ] Building lights turn on when nearby

---

## Technical Implementation Strategy

### Phase Order (Recommended)

#### Week 1: Core Globe
1. Create globe geometry
2. Place buildings on sphere surface
3. Basic camera orbiting globe
4. Convert flat street scene to spherical layout

#### Week 2: Scroll Transition
1. Implement scroll-based camera zoom
2. Hero → globe transition
3. Lock scroll during transition
4. Loading states

#### Week 3: Avatar & Movement
1. Create avatar
2. Implement gravity (stick to surface)
3. WASD/click controls
4. Camera following avatar
5. Smooth movement along sphere

#### Week 4: Blank Plot & Form
1. Design blank plot visual
2. Create 3D form interface
3. Form submission logic
4. Success state

#### Week 5: Polish
1. Add environmental effects
2. UI overlays
3. Performance optimization
4. Mobile testing & adjustments

### Performance Considerations

```typescript
// Keep it performant
- LOD (Level of Detail) for buildings
- Frustum culling (only render visible side)
- Simplified globe geometry (icosphere level 3-4)
- Instanced materials
- Optimize particle count
- Lazy load building interiors
```

---

## Code Architecture

### File Structure
```
components/
├── globe-world/
│   ├── GlobeWorld.tsx          // Main component
│   ├── Globe.tsx               // Planet mesh
│   ├── BuildingOnGlobe.tsx     // Building component
│   ├── Avatar.tsx              // User character
│   ├── Controls.tsx            // Movement system
│   ├── BlankPlot.tsx           // Intake form area
│   ├── IntakeForm.tsx          // 3D form UI
│   ├── ScrollZoom.tsx          // Hero transition
│   └── types.ts                // TypeScript definitions
```

### State Management
```typescript
// Global state for globe world
- avatarPosition: Vector3
- cameraState: 'hero' | 'zooming' | 'exploring'
- activeBuilding: Building | null
- formOpen: boolean
- navigationMode: 'keyboard' | 'click'
```

---

## Mobile Considerations

### Controls
- Touch to move avatar
- Pinch to zoom
- Swipe to rotate camera
- Simplified UI for smaller screens

### Performance
- Reduce particle count
- Lower polygon buildings
- Simplified globe texture
- Limit draw distance

---

## Stretch Goals

### Advanced Features
- [ ] Multiplayer (see other visitors as avatars)
- [ ] Avatar customization
- [ ] Building construction animation over time
- [ ] Weather system
- [ ] Seasonal changes
- [ ] Sound design (ambient music, footsteps)
- [ ] Voice narration
- [ ] VR support
- [ ] User's building appears after form submission

### Analytics Integration
- Track which buildings users visit most
- Heatmap of globe exploration
- Form conversion rates
- Time spent in world

---

## Development Approach

### MVP (Minimum Viable Product)
Focus on core experience first:
1. ✅ Scroll zoom transition
2. ✅ Globe with buildings
3. ✅ Basic avatar movement
4. ✅ Blank plot with form

Everything else is enhancement!

### Testing Checklist
- [ ] Smooth scroll transition on all browsers
- [ ] Avatar doesn't fall off globe
- [ ] Buildings appear at correct positions
- [ ] Form submission works
- [ ] Mobile controls functional
- [ ] Performance: 60fps on desktop, 30fps on mobile
- [ ] Accessibility: keyboard nav, screen readers

---

## Why This Is Brilliant

1. **Memorable**: No one else has this
2. **Engaging**: Active participation vs passive scrolling
3. **Metaphor-rich**: "Enter my world", "build together"
4. **Scalable**: Add buildings as portfolio grows
5. **Story-driven**: Takes user on a journey
6. **Community-focused**: Fits your LHBK mission
7. **Modern**: Cutting-edge web tech showcase
8. **Fun**: Actually enjoyable to explore

---

## Next Steps

### Immediate Action Items
1. **Decide on scroll vs click** for hero transition
2. **Choose avatar style** (capsule, character, or orb)
3. **Sketch globe layout** - where should buildings go?
4. **Design blank plot** - how should it look?
5. **Start with Phase 1** - Get scroll zoom working

### Questions to Answer
- How much control should user have? (Free roam vs guided tour)
- Should buildings have interiors?
- What happens when avatar reaches blank plot?
- Form inline or separate page after submission?
- Save user's "building" between visits?

---

**Status**: Planning complete, ready to build!
**Next**: Implement Phase 1 (Scroll-zoom transition)

Want to start building? 🚀
