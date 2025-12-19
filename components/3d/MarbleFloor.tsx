'use client'

import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { COLLISION_CONFIGS, Z_LAYERS, PHYSICS_DIMENSIONS } from '@/lib/physics-groups'

interface MarbleFloorProps {
  visible?: boolean
}

/**
 * MarbleFloor - The base surface of the 3D world at z=0.
 * Letters and other objects can fall onto this surface.
 * Features:
 * - Fixed RigidBody with CuboidCollider for physics
 * - Optional visual mesh (can be hidden if using CSS/DOM background)
 * - Large enough to catch fallen letters (100x100 units)
 */
export function MarbleFloor({ visible = false }: MarbleFloorProps) {
  const size = PHYSICS_DIMENSIONS.FLOOR_SIZE

  return (
    <RigidBody
      type="fixed"
      position={[0, 0, Z_LAYERS.FLOOR - 0.01]}
      colliders={false}
      collisionGroups={COLLISION_CONFIGS.floor}
    >
      {/* Thin floor collider - just enough to catch objects */}
      <CuboidCollider args={[size / 2, size / 2, 0.01]} />

      {/* Visual mesh - optional, matches the marble background */}
      {visible && (
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
            color="#f5f3f0"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      )}
    </RigidBody>
  )
}

export default MarbleFloor
