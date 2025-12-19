'use client'

import { useThree } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { COLLISION_CONFIGS, PHYSICS_DIMENSIONS } from '@/lib/physics-groups'

/**
 * WorldWalls - Invisible boundary colliders at viewport edges.
 * Keeps objects from falling out of the visible scene.
 * Walls extend the full height of the physics world.
 */
export function WorldWalls() {
  const { viewport } = useThree()
  const thickness = PHYSICS_DIMENSIONS.WALL_THICKNESS
  const height = PHYSICS_DIMENSIONS.WALL_HEIGHT

  // Calculate wall positions at viewport edges
  const halfWidth = viewport.width / 2
  const halfHeight = viewport.height / 2

  return (
    <>
      {/* Left wall */}
      <RigidBody
        type="fixed"
        position={[-halfWidth - thickness / 2, 0, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
      >
        <CuboidCollider args={[thickness / 2, halfHeight + 1, height / 2]} />
      </RigidBody>

      {/* Right wall */}
      <RigidBody
        type="fixed"
        position={[halfWidth + thickness / 2, 0, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
      >
        <CuboidCollider args={[thickness / 2, halfHeight + 1, height / 2]} />
      </RigidBody>

      {/* Top wall */}
      <RigidBody
        type="fixed"
        position={[0, halfHeight + thickness / 2, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
      >
        <CuboidCollider args={[halfWidth + 1, thickness / 2, height / 2]} />
      </RigidBody>

      {/* Bottom wall */}
      <RigidBody
        type="fixed"
        position={[0, -halfHeight - thickness / 2, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
      >
        <CuboidCollider args={[halfWidth + 1, thickness / 2, height / 2]} />
      </RigidBody>
    </>
  )
}

export default WorldWalls
