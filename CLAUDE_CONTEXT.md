# 3D Portfolio Menu - Project Context & Plan

## User Rules
- Do not add comments to generated code - feel free to explain in the composer or chat window
- Use context sister files in the same folder as context
- Check for errors and UI issues after making any changes - run linter and test functionality

## Project Overview
Creating an interactive 3D menu system for Keino's portfolio site that captures his multi-disciplinary background. The environment morphs and changes theme based on which area of work the user is exploring.

## Repository
- **GitHub**: https://github.com/KeinoC/keino-portfolio-site/tree/main
- **Local Path**: `/Users/keinoc/Development/K-Tingz/keino-portfolio-site`

## Current State

### Existing Portfolio Structure
- **Framework**: Next.js 15.5.4 with TypeScript
- **Package Manager**: Bun (has bun.lock)
- **Styling**: Tailwind CSS 4 with custom glass-effect utilities
- **Animations**: Framer Motion
- **Existing Sections**:
  - HeroSection - Professional intro with stats
  - ExperienceTimeline
  - SkillsShowcase
  - SkillTree
  - ContactSection
  - Footer

### Design Aesthetic
- **Color Scheme**: Dark theme with gradient accents (blue → indigo → purple)
- **Style**: Professional, modern, glass-morphism effects
- **Typography**: Clean, gradient text for headings
- **Effects**: Smooth animations, floating elements, ambient particles

## What We Just Built

### New Component: `components/three-d-menu.tsx`
An interactive 3D menu with 5 zones representing different areas of Keino's work:

1. **Community Impact** (LHBK)
   - Color: `#e87d5c` (warm coral/orange)
   - Position: `[-6, 2, 0]`
   - Description: Preserving Haitian culture in Brooklyn

2. **Enterprise Software** (WBS/GVC)
   - Color: `#4a90e2` (professional blue)
   - Position: `[3, 4, -3]`
   - Description: Property management solutions

3. **Hardware & IoT**
   - Color: `#50c878` (tech green)
   - Position: `[-4, -2, -4]`
   - Description: FPV, Arduino, ESP32, IoT Systems

4. **Financial SaaS** (Anvil)
   - Color: `#9b59b6` (purple)
   - Position: `[6, 1, 2]`
   - Description: Business intelligence platform

5. **Web Development**
   - Color: `#f39c12` (vibrant orange)
   - Position: `[2, -3, 3]`
   - Description: Next.js, TypeScript, Full-stack solutions

### Features Implemented
- ✅ Interactive 3D spheres with hover effects
- ✅ Click to activate zones
- ✅ Smooth camera transitions to each zone
- ✅ Environment color morphing based on active zone
- ✅ Animated particle system that changes colors
- ✅ Central rotating wireframe hub
- ✅ Glow rings around spheres
- ✅ Connection lines from hub to zones
- ✅ Glass-morphism UI overlay
- ✅ Bottom menu buttons for navigation
- ✅ Zone info card display
- ✅ Responsive design (desktop + mobile)
- ✅ Touch-friendly interactions

### New Dependencies Added
```json
"dependencies": {
  "@react-three/drei": "^9.117.3",
  "@react-three/fiber": "^8.17.10",
  "three": "^0.160.0"
},
"devDependencies": {
  "@types/three": "^0.160.0"
}
```

### Files Modified
1. ✅ `package.json` - Added Three.js dependencies
2. ✅ `app/page.tsx` - Added `<ThreeDMenu />` component between HeroSection and ExperienceTimeline
3. ✅ `components/three-d-menu.tsx` - New component created

## Technical Architecture

### Component Structure
```
ThreeDMenu (main component)
├── Canvas (React Three Fiber)
│   └── Scene
│       ├── Lighting (ambient + point lights)
│       ├── CentralHub (rotating icosahedron)
│       ├── Particles (1000 floating points)
│       ├── ZoneSphere × 5 (one for each zone)
│       │   ├── Main sphere mesh
│       │   ├── Glow ring
│       │   ├── Hover label (HTML overlay)
│       │   └── Connection line to center
│       ├── OrbitControls
│       └── PerspectiveCamera
└── UI Overlay (pointer-events-none)
    ├── Title & subtitle
    ├── Zone info card (when active)
    ├── Bottom menu buttons
    └── Instructions
```

### Key Technologies
- **Three.js**: Core 3D rendering
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Helper components (OrbitControls, PerspectiveCamera, Html)
- **Framer Motion**: UI animations
- **Tailwind CSS**: Styling

### Animation Logic
- Spheres rotate continuously on Y-axis
- Rings rotate on Z-axis
- Particles rotate slowly
- Hub rotates on X and Y axes
- Hover scales spheres to 1.1x
- Active zone scales to 1.2x
- Camera lerps to zone position on click
- Scene background color transitions

## Installation & Running

### Install Dependencies
```bash
cd /Users/keinoc/Development/K-Tingz/keino-portfolio-site
bun install
```

### Start Dev Server
```bash
bun dev
```

### View Site
Open http://localhost:3000

## Next Steps & Potential Enhancements

### Immediate Tasks
1. ⏳ Install dependencies with `bun install`
2. ⏳ Test the 3D menu in browser
3. ⏳ Verify responsive behavior on mobile
4. ⏳ Check performance

### Potential Enhancements
- [ ] Add individual project pages for each zone
- [ ] Link "View Projects" buttons to actual content
- [ ] Add more detailed information per zone
- [ ] Implement route transitions
- [ ] Add loading state/progress indicator
- [ ] Optimize 3D assets for performance
- [ ] Add WebGL fallback for older devices
- [ ] Implement keyboard navigation
- [ ] Add sound effects (optional)
- [ ] Create transition animations between sections
- [ ] Add more particle effects per zone
- [ ] Implement zone-specific 3D models
- [ ] Add project thumbnails floating around each sphere
- [ ] Create a "home" reset button

### Design Refinements
- [ ] Fine-tune camera positions for each zone
- [ ] Adjust lighting for better sphere visibility
- [ ] Customize particle patterns per zone
- [ ] Add more zone-specific visual elements
- [ ] Implement smooth scroll integration
- [ ] Add entrance animation sequence
- [ ] Create zone-to-zone transition effects

## Design Philosophy

### Concept
The portfolio captures Keino's diverse background through a morphing 3D environment. Each sphere represents a different facet of his expertise, and the entire scene transforms (colors, lighting, atmosphere) when users explore different areas.

### Visual Language
- **Glass-morphism**: Frosted glass UI elements with blur
- **Gradients**: Smooth color transitions (blue → indigo → purple)
- **Depth**: 3D space creates hierarchy and interest
- **Motion**: Subtle continuous animations for life
- **Responsiveness**: Adapts to user interaction immediately

### User Experience
- **Intuitive**: Hover reveals labels, click explores
- **Smooth**: All transitions are eased and natural
- **Accessible**: Keyboard nav, screen reader friendly (needs implementation)
- **Fast**: Optimized rendering, no jank
- **Delightful**: Satisfying interactions and feedback

## Key Context for Claude Code

### Keino's Background (from memory)
- **Financial Analyst**: 8+ years in healthcare FP&A
- **Software Engineer**: Trained at Flatiron School
- **Community Builder**: LHBK (preserving Haitian culture)
- **Multiple Domains**: 
  - Nonprofit (LHBK)
  - Enterprise PropTech (WBS/GVC)
  - Hardware/IoT (FPV, Arduino, ESP32)
  - FinTech SaaS (Anvil)
  - Web Development (Next.js, TypeScript)

### Project Philosophy
- Keino prefers **simple, focused solutions** over complex systems
- Values **thorough research** before implementation
- Willing to **pivot** when complexity isn't justified
- Works with **modern web stack**: Next.js, TypeScript, Tailwind
- Uses **bun** as package manager

### Current Design Direction
- Moving towards **minimal modern** aesthetic
- Previously explored: brutalist minimal, geometric minimal, neo-minimalist, Scandinavian minimal
- Considering **git-style visualization** for skills
- Wants to effectively showcase **dual expertise** (finance + engineering)

## Important Notes

1. **File System Access**: The bash tool operates on Claude's computer, not the user's. For local operations, provide commands for the user to run.

2. **Existing CSS**: The `globals.css` already has the necessary glass-effect and gradient utilities, so the 3D menu integrates seamlessly.

3. **Performance**: The component uses 1000 particles - this should be fine for most devices, but can be reduced if needed.

4. **Browser Support**: Requires WebGL support. May need fallback for older browsers.

5. **Mobile**: Touch controls work via drei's OrbitControls, but may need additional optimization for mobile performance.

## Questions to Address
- Where should each zone link to? (Need individual project pages?)
- Should we add more detailed content per zone?
- Any specific projects to highlight in each zone?
- Preferred camera angles and positions?
- Any additional visual effects desired?
- Performance targets for mobile?

---

**Last Updated**: Session with Claude Chat
**Status**: Dependencies added, component created, ready for installation
**Next Action**: Run `bun install` and test
