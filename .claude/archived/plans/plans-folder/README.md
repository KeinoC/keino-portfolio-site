# Portfolio Plans & Documentation

This folder contains all planning documents, design explorations, and implementation guides for the portfolio project.

## 📁 File Organization

### Planning Documents
- `README.md` - This file
- `project-context.md` - Overall project context and background (move CLAUDE_CONTEXT.md here)
- `theme-options.md` - Comparison of all available themes (move THEME_EXPLORATIONS.md here)
- `architecture.md` - Component architecture and reusable systems

### Theme Implementations
- `spheres-theme.md` - Sphere/planets implementation guide (move 3D_MENU_SETUP.md here)
- `street-theme.md` - Street scene implementation guide (move STREET_SCENE_GUIDE.md here)
- `globe-theme.md` - Globe world master plan
- `globe-world-progress.md` - **[ACTIVE]** Current implementation progress

### Future Themes
- Brain theme (concept in `theme-options.md`)
- House theme (concept in `theme-options.md`)

## 🎨 Active Development

**Current Focus**: 🌍 **Globe World Theme** - Bruno Simon inspired!
- ✅ Phase 1: Basic drivable vehicle on sphere
- 🚧 Phase 2: Improved movement & controls
- ⏳ Phase 3: Interactive buildings
- ⏳ Phase 4: Scroll-zoom transition
- ⏳ Phase 5: Blank plot intake form

**Latest**: v0.1 Prototype - YOU CAN DRIVE ON A PLANET! 🚗

## 🔄 Quick Reference

### Files to Move to Plans (Run from root)
```bash
mv 3D_MENU_SETUP.md plans/spheres-theme.md
mv STREET_SCENE_GUIDE.md plans/street-theme.md
mv THEME_EXPLORATIONS.md plans/theme-options.md
mv CLAUDE_CONTEXT.md plans/project-context.md
```

### To Test Current Globe World
```bash
bun dev
# Open http://localhost:3000
# Scroll to globe section
# Use arrow keys (↑↓←→) to drive!
```

### To Switch Themes
Edit `app/page.tsx`:
```tsx
// Choose one:
import Theme from '@/components/themes/spheres-menu'      // Original
import Theme from '@/components/themes/street-scene'      // Street
import Theme from '@/components/themes/globe-world'       // Globe (CURRENT)
```

## 📊 Theme Status

| Theme | Status | Complexity | File | Component |
|-------|--------|------------|------|-----------|
| Spheres | ✅ Complete | Low | `spheres-theme.md` | `three-d-menu.tsx` |
| Street | ✅ Prototype | Medium | `street-theme.md` | `street-scene.tsx` |
| **Globe** | 🚧 **Active Dev** | High | `globe-world-progress.md` | `themes/globe-world/` |
| Brain | 💡 Concept | High | `theme-options.md` | Not built |
| House | 💡 Concept | Medium | `theme-options.md` | Not built |

## 🎯 Globe World Roadmap

### ✅ Completed
- [x] Basic sphere world
- [x] Drivable vehicle (car)
- [x] Arrow key controls (↑↓←→ + WASD)
- [x] Custom gravity (sticks to sphere)
- [x] Third-person camera
- [x] Buildings on globe
- [x] Trees and decorations
- [x] Low-poly Bruno Simon aesthetic
- [x] Control instructions UI

### 🚧 In Progress
- [ ] Better movement feel (acceleration curves)
- [ ] Drift mechanics
- [ ] Collision detection

### ⏳ Coming Soon
- [ ] Interactive buildings (click to enter)
- [ ] Scroll-zoom transition from hero
- [ ] Blank plot with intake form
- [ ] Minimap
- [ ] Sound effects
- [ ] Mobile controls

## 🎮 Inspiration

**Bruno Simon's Portfolio** - bruno-simon.com
- Drive a car around flat plane to explore
- Arrow key controls
- Low-poly aesthetic
- Playful and memorable

**Our Innovation**: Same concept but on a **3D SPHERE**! 
Like Bruno Simon meets Super Mario Galaxy 🌍

## 📝 Development Log

### Session 1 (Current)
- Created globe world foundation
- Implemented vehicle physics
- Added keyboard controls
- Set up camera system
- Placed initial buildings
- **Result**: Drivable prototype! 🎉

### Next Session Goals
- Polish movement feel
- Add building interactions
- Improve visual details
- Start scroll transition

## 💡 Quick Tips

### Testing the Globe
1. Run `bun dev`
2. Navigate to globe section (after hero)
3. Use arrow keys to drive
4. Explore the planet!

### Making Changes
- Main component: `components/themes/globe-world/index.tsx`
- Swap themes: Edit `app/page.tsx`
- Adjust colors: Change material colors in component

### Performance
- Target: 60fps desktop, 30fps mobile
- Current: Running smooth on most devices
- Simple geometry keeps it fast

## 🔗 Related Files

```
Project Structure:
├── app/page.tsx                          # Theme selection
├── components/
│   ├── themes/
│   │   ├── globe-world/index.tsx        # ⭐ ACTIVE
│   │   ├── street-scene.tsx             # Previous
│   │   └── three-d-menu.tsx             # Original
│   └── hero-section.tsx                 # Landing
└── plans/
    ├── globe-world-progress.md          # 📍 Current progress
    ├── globe-theme.md                   # Master plan
    └── architecture.md                  # Component guide
```

## 🎨 Visual Style

**Color Palette**:
- Globe: Warm orange (#ffa94d) 
- Car: Red (#ff6b6b)
- Buildings: Vibrant colors per category
- Trees: Fresh green (#7cb342)
- Sky: Dark gradient with stars

**Aesthetic**: Low-poly, bright, playful, like a video game

## 🚀 Current Status

**Phase**: Prototype (v0.1)  
**Playable**: ✅ YES!  
**Fun**: ✅ Already engaging!  
**Next**: Polish and enhance  

---

**Remember**: We're not just building a portfolio. We're building an *experience* that no one forgets! 🌍✨

Last Updated: Globe World v0.1 - Driving prototype complete!
