'use client'

/**
 * Shared types for 3D UI components
 * These components are designed to work on 3D planes and surfaces
 */

// Base props for all 3D UI elements
export interface Base3DUIProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

// Power state for elements that respond to power
export interface PoweredProps {
  isPowered: boolean
}

// Interactive element props
export interface Interactive3DProps {
  onClick?: () => void
  onHover?: (hovered: boolean) => void
  disabled?: boolean
}

// Neumorphic button states
export type NeumorphicState = 'flat' | 'raised' | 'pressed'

// Geometric pattern types (re-exported from GeometricOutline3D)
export type GeometricPattern = 'simple' | 'double' | 'corner-accent' | 'bracket'

// Neumorphic button props (no label - buttons are purely visual)
export interface Neumorphic3DButtonProps extends Base3DUIProps, PoweredProps, Interactive3DProps {
  id: string  // Identifier for navigation
  isActive?: boolean
  width?: number
  height?: number
  depth?: number
  pattern?: GeometricPattern  // Geometric line pattern when unpowered
}

// Nav panel props (flat surface to hold buttons)
export interface NavPanel3DProps extends Base3DUIProps, PoweredProps {
  width?: number
  height?: number
  children?: React.ReactNode
}

// Color themes for 3D UI
export const UI3D_COLORS = {
  // Surface colors (neumorphic base)
  surface: {
    base: '#2a2a2e',
    light: '#3a3a3e',
    dark: '#1a1a1c',
  },
  // Metallic accent colors (unpowered state)
  metallic: {
    base: '#4a4a50',
    highlight: '#6a6a70',
    shadow: '#2a2a30',
  },
  // Powered/active colors
  powered: {
    accent: '#ffcc66',
    glow: '#ffeeaa',
    warm: '#fff8e0',
  },
  // Text colors
  text: {
    inactive: '#666',
    active: '#aaa',
    powered: '#ddd',
  },
} as const

// Animation timing constants
export const UI3D_TIMING = {
  raise: 0.15,      // Time to raise button (seconds)
  press: 0.08,      // Time to press button
  powerOn: 0.3,     // Time to power on
  powerOff: 0.5,    // Time to power off
} as const

// Size presets for consistent scaling
export const UI3D_SIZES = {
  button: {
    sm: { width: 0.4, height: 0.3, depth: 0.05 },
    md: { width: 0.6, height: 0.4, depth: 0.06 },
    lg: { width: 0.8, height: 0.5, depth: 0.08 },
  },
  navButton: {
    width: 0.55,
    height: 0.6,
    depth: 0.08,
    raisedDepth: 0.12,
  },
} as const
