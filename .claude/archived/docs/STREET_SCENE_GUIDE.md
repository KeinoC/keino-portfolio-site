# 🏘️ Street Scene Portfolio - Implementation Guide

## What We Built

A 3D neighborhood/street scene where each building represents a different area of your work. This is a **prototype** that we can iterate on and enhance.

## Current Features

### 5 Buildings (Your Work Areas)

1. **Community Center** (LHBK)
   - Color: Coral/Orange (`#e87d5c`)
   - Size: Medium (4 stories)
   - Position: Left side of street
   - Represents: Nonprofit community work

2. **Office Tower** (WBS/GVC)
   - Color: Blue (`#4a90e2`)
   - Size: Tallest (6 stories)
   - Position: Center back
   - Represents: Enterprise software

3. **Maker Space** (Hardware/IoT)
   - Color: Green (`#50c878`)
   - Size: Medium-short (3.5 stories)
   - Position: Left-center
   - Represents: FPV, Arduino, ESP32

4. **Startup Hub** (Anvil)
   - Color: Purple (`#9b59b6`)
   - Size: Tall (5 stories)
   - Position: Right-center
   - Represents: Financial SaaS

5. **Design Studio** (Web Dev)
   - Color: Orange (`#f39c12`)
   - Size: Medium-tall (4.5 stories)
   - Position: Right side
   - Represents: Next.js, TypeScript

### Interactive Elements

✅ **Animated Windows**
- Windows light up randomly to simulate life
- Different brightness levels
- Automatic on/off cycling

✅ **Street Lighting**
- 5 street lamps along the road
- Warm yellow lighting
- Illuminates surrounding area

✅ **Landscaping**
- Trees scattered around the street
- Adds organic feel to urban scene

✅ **Ground & Streets**
- Main road with yellow center line
- Sidewalks on both sides
- Dark ground plane

✅ **Hover Effects**
- Buildings scale up slightly on hover
- Labels appear showing building name and category
- Smooth transitions

✅ **Click Interactions**
- Click building to focus camera on it
- Info card appears with description
- Camera smoothly flies to building
- Scene fog changes to building's color

✅ **Night Scene**
- Starry sky with twinkling stars
- Dark atmosphere emphasizing lit windows
- Atmospheric fog

### Controls

- **Click**: Select and focus on building
- **Drag**: Rotate camera view
- **Scroll**: Zoom in/out
- **Pan**: Move camera (middle mouse button)
- **Buttons**: Quick navigation to each building

## Installation & Testing

```bash
cd /Users/keinoc/Development/K-Tingz/keino-portfolio-site

# Install dependencies (if not done already)
bun install

# Start dev server
bun dev
```

Open http://localhost:3000 and scroll down past the hero section.

## What's Next - Enhancement Ideas

### Phase 1: Detail & Polish (Quick Wins)
- [ ] Add building signage/names above doors
- [ ] More varied window patterns
- [ ] Ground textures (grass patches, cracks)
- [ ] Street details (manholes, crosswalks)
- [ ] Benches and street furniture
- [ ] More varied tree types
- [ ] Building shadows

### Phase 2: Life & Animation
- [ ] Animated people/silhouettes walking
- [ ] Cars on the street (parked or moving)
- [ ] Birds flying
- [ ] Building entrance animations (doors opening)
- [ ] Window curtains/blinds
- [ ] Day/night cycle toggle
- [ ] Weather effects (optional)

### Phase 3: Interactivity
- [ ] Link to actual project pages
- [ ] Building interiors (camera enters building)
- [ ] Click windows to see specific projects
- [ ] Hover tooltips on windows
- [ ] Mini-map navigation
- [ ] Accessibility improvements (keyboard nav)

### Phase 4: Performance & Mobile
- [ ] Level of Detail (LOD) system
- [ ] Optimize geometry
- [ ] Better mobile controls
- [ ] Loading progress indicator
- [ ] Reduce draw calls
- [ ] Texture optimization

### Phase 5: Storytelling
- [ ] Add more buildings over time (new projects)
- [ ] Building construction animation (projects in progress)
- [ ] Timeline slider (show neighborhood growth)
- [ ] Easter eggs hidden in scene
- [ ] Sound design (ambient city sounds)

## Technical Notes

### Performance
- Currently ~1000 polygons total
- Should run smoothly on most devices
- Windows use instanced geometry
- Simple materials for performance

### Architecture
- Each building is procedurally generated
- Modular system for easy additions
- Camera animations use lerp for smoothness
- Fog system for atmosphere changes

### Customization Points

Easy to modify in code:
```typescript
// In buildings array:
- position: [x, y, z] - building location
- size: [width, height, depth] - building dimensions
- color: hex color - main building color
- roofColor: hex color - roof accent
- windowColor: hex color - lit window color
```

## Comparison to Original Sphere Design

| Feature | Spheres | Street Scene |
|---------|---------|--------------|
| Metaphor | Abstract | Concrete |
| Uniqueness | Medium | High |
| Clarity | Medium | High |
| Personal Connection | Low | Very High (LHBK) |
| Scalability | Medium | Very High |
| Detail Potential | Low | Very High |
| Community Theme | No | Yes |
| Complexity | Low | Medium |

## Next Steps

1. **Test the prototype** - See it in action
2. **Gather feedback** - What feels right/wrong?
3. **Pick Phase 1 enhancements** - What details matter most?
4. **Iterate** - Add features one at a time

The beauty of this design is it can grow with you - literally! As you take on new projects or clients, you can add new buildings to the street. It's your portfolio neighborhood that expands over time.

## Switching Between Designs

To switch back to the sphere design, edit `app/page.tsx`:

```tsx
// Use spheres:
import ThreeDMenu from '@/components/three-d-menu'
<ThreeDMenu />

// Use street:
import StreetScene from '@/components/street-scene'
<StreetScene />
```

Both are available for comparison!

---

**Status**: Prototype complete, ready for testing
**Next**: Run `bun dev` and explore your neighborhood! 🏘️
