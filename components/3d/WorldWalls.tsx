'use client'

import { useThree } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { COLLISION_CONFIGS, PHYSICS_DIMENSIONS } from '@/lib/physics-groups'
import * as THREE from 'three'

/**
 * WorldWalls - Boundary colliders at viewport edges.
 * Keeps objects from falling out of the visible scene.
 * Walls extend the full height of the physics world.
 * DEBUG: Colored meshes visible for boundary debugging.
 */
export function WorldWalls() {
  const { viewport } = useThree()
  const thickness = PHYSICS_DIMENSIONS.WALL_THICKNESS
  const height = PHYSICS_DIMENSIONS.WALL_HEIGHT

  // Use R3F viewport which accounts for camera zoom correctly
  const halfWidth = viewport.width / 2
  const halfHeight = viewport.height / 2

  return (
    <>
      {/* Left wall - RED */}
      <RigidBody
        type="fixed"
        position={[-halfWidth - thickness / 2, 0, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
        restitution={0.8}
        friction={0.2}
      >
        <CuboidCollider args={[thickness / 2, halfHeight + 1, height / 2]} />
        <mesh>
          <boxGeometry args={[thickness, (halfHeight + 1) * 2, height]} />
          <meshStandardMaterial color="#ff0000" transparent opacity={0.35} />
        </mesh>
      </RigidBody>

      {/* Right wall - BLUE */}
      <RigidBody
        type="fixed"
        position={[halfWidth + thickness / 2, 0, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
        restitution={0.8}
        friction={0.2}
      >
        <CuboidCollider args={[thickness / 2, halfHeight + 1, height / 2]} />
        <mesh>
          <boxGeometry args={[thickness, (halfHeight + 1) * 2, height]} />
          <meshStandardMaterial color="#0088ff" transparent opacity={0.35} />
        </mesh>
      </RigidBody>

      {/* Top wall - GREEN */}
      <RigidBody
        type="fixed"
        position={[0, halfHeight + thickness / 2, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
        restitution={0.8}
        friction={0.2}
      >
        <CuboidCollider args={[halfWidth + 1, thickness / 2, height / 2]} />
        <mesh>
          <boxGeometry args={[(halfWidth + 1) * 2, thickness, height]} />
          <meshStandardMaterial color="#00ff44" transparent opacity={0.35} />
        </mesh>
      </RigidBody>

      {/* Bottom wall - YELLOW */}
      <RigidBody
        type="fixed"
        position={[0, -halfHeight - thickness / 2, height / 2]}
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.walls}
        restitution={0.8}
        friction={0.2}
      >
        <CuboidCollider args={[halfWidth + 1, thickness / 2, height / 2]} />
        <mesh>
          <boxGeometry args={[(halfWidth + 1) * 2, thickness, height]} />
          <meshStandardMaterial color="#ffee00" transparent opacity={0.35} />
        </mesh>
      </RigidBody>
    </>
  )
}

export default WorldWalls
