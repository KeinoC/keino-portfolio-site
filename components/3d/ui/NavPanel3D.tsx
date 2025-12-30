'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Neumorphic3DButton } from './Neumorphic3DButton'
import { NavPanel3DProps, UI3D_COLORS, UI3D_SIZES, GeometricPattern } from './types'

/**
 * NavPanel3D - A flat panel surface for navigation buttons
 * Note: Can be removed if you want buttons directly on page surface
 */
export function NavPanel3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  width = 0.7,
  height = 3,
  isPowered = false,
  children,
}: NavPanel3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowIntensity = useRef(0)

  useFrame((_, delta) => {
    // Subtle glow when powered
    const target = isPowered ? 0.3 : 0
    glowIntensity.current += (target - glowIntensity.current) * 3 * delta
  })

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Main panel surface - flat, flush with page */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={UI3D_COLORS.surface.dark}
          roughness={0.95}
        />
      </mesh>

      {/* Subtle inner border */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width - 0.02, height - 0.02]} />
        <meshStandardMaterial
          color="#0f0f11"
          roughness={0.9}
        />
      </mesh>

      {/* Edge highlights when powered */}
      {glowIntensity.current > 0.01 && (
        <>
          {/* Left edge glow */}
          <mesh position={[-width / 2 + 0.005, 0, 0]}>
            <planeGeometry args={[0.01, height - 0.04]} />
            <meshBasicMaterial
              color={UI3D_COLORS.powered.accent}
              transparent
              opacity={glowIntensity.current * 0.5}
            />
          </mesh>
          {/* Right edge glow */}
          <mesh position={[width / 2 - 0.005, 0, 0]}>
            <planeGeometry args={[0.01, height - 0.04]} />
            <meshBasicMaterial
              color={UI3D_COLORS.powered.accent}
              transparent
              opacity={glowIntensity.current * 0.3}
            />
          </mesh>
        </>
      )}

      {/* Children (buttons) are positioned relative to panel */}
      {children}
    </group>
  )
}

/**
 * NavButtonGroup3D - A group of navigation buttons
 *
 * Renders buttons without labels - purely visual geometric shapes.
 * Can be used with or without NavPanel3D wrapper.
 */
export interface NavButtonGroup3DProps {
  items: Array<{
    id: string
    pattern?: GeometricPattern
  }>
  position?: [number, number, number]
  activeId: string | null
  isPowered: boolean
  onNavigate: (id: string) => void
  spacing?: number
  startY?: number
  buttonWidth?: number
  buttonHeight?: number
}

export function NavButtonGroup3D({
  items,
  position = [0, 0, 0],
  activeId,
  isPowered,
  onNavigate,
  spacing = 0.7,
  startY = 0,
  buttonWidth = UI3D_SIZES.navButton.width,
  buttonHeight = UI3D_SIZES.navButton.height,
}: NavButtonGroup3DProps) {
  // Debug: Log when buttons are rendered
  console.log('NavButtonGroup3D rendering:', {
    position,
    isPowered,
    activeId,
    itemCount: items.length,
    startY,
    spacing
  })

  return (
    <group position={position}>
      {items.map((item, index) => {
        const buttonPos: [number, number, number] = [0, startY - index * spacing, 0]
        console.log(`Button ${item.id} position:`, buttonPos)
        return (
          <Neumorphic3DButton
            key={item.id}
            id={item.id}
            position={buttonPos}
            isPowered={isPowered}
            isActive={activeId === item.id}
            onClick={() => onNavigate(item.id)}
            width={buttonWidth}
            height={buttonHeight}
            pattern={item.pattern || 'corner-accent'}
          />
        )
      })}
    </group>
  )
}

export default NavPanel3D
