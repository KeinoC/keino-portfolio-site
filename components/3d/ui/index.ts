'use client'

/**
 * 3D UI Components
 *
 * Reusable UI components designed to work on 3D planes and surfaces.
 * These components support power states, geometric line art, and
 * seamless integration with React Three Fiber scenes.
 *
 * Usage:
 * ```tsx
 * import { NavButtonGroup3D } from '@/components/3d/ui'
 *
 * // In your R3F scene - buttons directly on page surface:
 * <NavButtonGroup3D
 *   position={[2, 0, 0]}
 *   items={[{ id: 'WORK' }, { id: 'ABOUT' }, { id: 'CONTACT' }]}
 *   activeId={activePage}
 *   isPowered={isPowered}
 *   onNavigate={handleNavigate}
 * />
 * ```
 */

// Types
export * from './types'

// Components
export { GeometricOutline3D } from './GeometricOutline3D'
export { Neumorphic3DButton } from './Neumorphic3DButton'
export { NavPanel3D, NavButtonGroup3D } from './NavPanel3D'
