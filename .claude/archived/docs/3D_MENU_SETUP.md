# 3D Portfolio Menu Setup

## Installation

Run the following command to install the new Three.js dependencies:

```bash
npm install
# or if you're using bun
bun install
```

## What Was Added

### New Dependencies:
- `three@^0.160.0` - Core Three.js library
- `@react-three/fiber@^8.17.10` - React renderer for Three.js
- `@react-three/drei@^9.117.3` - Useful helpers for React Three Fiber
- `@types/three@^0.160.0` - TypeScript types for Three.js

### New Component:
- `components/three-d-menu.tsx` - Interactive 3D menu showcasing your different project areas

### Integration:
- Added `ThreeDMenu` component to `app/page.tsx` between HeroSection and ExperienceTimeline

## Features

The 3D menu includes:

1. **5 Interactive Zones** representing your work areas:
   - Community Impact (LHBK) - Coral/Orange theme
   - Enterprise Software (WBS/GVC) - Blue theme
   - Hardware & IoT - Green theme
   - Financial SaaS (Anvil) - Purple theme
   - Web Development - Orange theme

2. **Interactions**:
   - Click on any sphere to explore that zone
   - Hover over spheres to see labels
   - Drag to rotate the scene
   - Scroll to zoom in/out
   - Bottom menu buttons for quick navigation

3. **Visual Effects**:
   - Dynamic lighting that changes based on active zone
   - Animated particles that morph colors
   - Glass-morphism UI matching your existing design
   - Smooth camera transitions
   - Central rotating hub
   - Glow rings around each sphere

4. **Responsive Design**:
   - Works on desktop and mobile
   - Touch-friendly interactions
   - Matches your existing portfolio aesthetic

## Running the Project

```bash
npm run dev
# or
bun dev
```

Then open http://localhost:3000 to see your portfolio with the new 3D menu!

## Customization

You can customize the zones in `components/three-d-menu.tsx`:
- Update colors, positions, descriptions
- Add more zones
- Modify animations and effects
- Link to actual project pages

The component is fully integrated with your existing:
- Framer Motion animations
- Glass-effect styling
- Gradient text
- Dark theme
- Professional aesthetic

Enjoy your new interactive 3D portfolio menu! 🚀
