'use client'

import { ReactNode } from 'react'
import { RoundedBox } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { COLLISION_CONFIGS, Z_LAYERS, PHYSICS_DIMENSIONS } from '@/lib/physics-groups'

interface HomePlatformProps {
  children?: ReactNode
  scale?: number
  slideX?: number
  showVisual?: boolean // Whether to show the platform visual (default: false for invisible physics-only)
}

/**
 * HomePlatform - A raised 3D platform that KEINO letters sit on.
 * Like a dark table floating above the marble floor.
 *
 * Features:
 * - Fixed RigidBody for the platform surface
 * - Low edge walls that letters can be knocked over
 * - Children are positioned on top of the platform surface
 * - Supports scaling and horizontal sliding for zoom/navigation
 */
export function HomePlatform({
  children,
  scale = 1,
  slideX = 0,
  showVisual = false
}: HomePlatformProps) {
  const width = PHYSICS_DIMENSIONS.PLATFORM_WIDTH
  const depth = PHYSICS_DIMENSIONS.PLATFORM_DEPTH
  const height = PHYSICS_DIMENSIONS.PLATFORM_HEIGHT
  const edgeHeight = PHYSICS_DIMENSIONS.PLATFORM_EDGE_HEIGHT
  const surfaceZ = Z_LAYERS.PLATFORM_SURFACE

  const halfWidth = width / 2
  const halfDepth = depth / 2
  const edgeThickness = 0.04

  // Apply scale first, then slide (matching DOM order where scale is transform, slide is x animation)
  // The slideX needs to be divided by scale since we're positioning in the scaled group's local coords
  return (
    <group scale={scale}>
      <group position={[slideX / scale, 0, 0]}>
      {/* Platform body with physics - always present for collision, visual only when showVisual */}
      <RigidBody
        type="fixed"
        position={[0, 0, surfaceZ / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.platform}
      >
        {/* Main surface collider - top of platform */}
        <CuboidCollider
          args={[halfWidth, halfDepth, 0.02]}
          position={[0, 0, surfaceZ / 2]}
        />

        {/* Low edge walls - letters can be knocked over them */}
        {/* Front edge (positive Y) */}
        <CuboidCollider
          args={[halfWidth, edgeThickness / 2, edgeHeight / 2]}
          position={[0, halfDepth - edgeThickness / 2, surfaceZ / 2 + edgeHeight / 2]}
        />
        {/* Back edge (negative Y) */}
        <CuboidCollider
          args={[halfWidth, edgeThickness / 2, edgeHeight / 2]}
          position={[0, -halfDepth + edgeThickness / 2, surfaceZ / 2 + edgeHeight / 2]}
        />
        {/* Left edge (negative X) */}
        <CuboidCollider
          args={[edgeThickness / 2, halfDepth, edgeHeight / 2]}
          position={[-halfWidth + edgeThickness / 2, 0, surfaceZ / 2 + edgeHeight / 2]}
        />
        {/* Right edge (positive X) */}
        <CuboidCollider
          args={[edgeThickness / 2, halfDepth, edgeHeight / 2]}
          position={[halfWidth - edgeThickness / 2, 0, surfaceZ / 2 + edgeHeight / 2]}
        />

        {/* Visual platform body - only shown when showVisual is true */}
        {showVisual && (
          <>
            {/* Position visual platform so its top aligns with physics surface */}
            <group position={[0, 0, surfaceZ - height / 2]}>
              <RoundedBox
                args={[width, depth, height]}
                radius={0.05}
                smoothness={4}
              >
                <meshStandardMaterial
                  color="#1a1a1c"
                  roughness={0.8}
                  metalness={0.1}
                />
              </RoundedBox>

              {/* Subtle top surface highlight */}
              <mesh position={[0, 0, height / 2 + 0.001]}>
                <planeGeometry args={[width - 0.1, depth - 0.1]} />
                <meshStandardMaterial
                  color="#222224"
                  roughness={0.6}
                  metalness={0.05}
                />
              </mesh>
            </group>
          </>
        )}
      </RigidBody>

      {/* Content sits on top of platform surface collider */}
      {/* Surface collider is at surfaceZ with half-extent 0.02, so top is at surfaceZ + 0.02 */}
      <group position={[0, 0, surfaceZ + 0.03]}>
        {children}
      </group>
      </group>
    </group>
  )
}

export default HomePlatform
