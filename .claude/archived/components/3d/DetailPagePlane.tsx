'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { COLLISION_CONFIGS } from '@/lib/physics-groups'
import * as THREE from 'three'

interface DetailPagePlaneProps {
  visible: boolean
  position: [number, number, number]
  width?: number
  height?: number
  slideDistance?: number
}

/**
 * DetailPagePlane - A 3D collider plane representing a detail page.
 * The cube can bounce off this plane when detail pages are open.
 *
 * Features:
 * - Fixed RigidBody for collision
 * - Slides in/out based on visibility
 * - Visual representation matching dark theme
 * - Positioned to align with DOM page content
 */
export function DetailPagePlane({
  visible,
  position,
  width = 6,
  height = 8,
  slideDistance = 10,
}: DetailPagePlaneProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const currentX = useRef(position[0] + slideDistance)

  // Animate slide in/out to match DOM timing (~0.6s)
  useFrame((_, delta) => {
    if (!groupRef.current || !rigidBodyRef.current) return

    const targetX = visible ? position[0] : position[0] + slideDistance
    const distance = targetX - currentX.current

    // Simple linear interpolation matching DOM transition duration
    // Speed = 1/duration = 1/0.6 ≈ 1.67, but use higher for responsiveness
    const speed = 3.0 // Completes in ~0.6 seconds
    currentX.current += distance * speed * delta

    // Snap to target when very close
    if (Math.abs(distance) < 0.01) {
      currentX.current = targetX
    }

    // Update visual group position
    groupRef.current.position.x = currentX.current

    // Update physics body position
    rigidBodyRef.current.setTranslation(
      { x: currentX.current, y: position[1], z: position[2] },
      true
    )
  })

  const thickness = 0.05
  const halfWidth = width / 2
  const halfHeight = height / 2

  return (
    <group ref={groupRef} position={[position[0] + slideDistance, position[1], position[2]]}>
      {/* Physics body */}
      <RigidBody
        ref={rigidBodyRef}
        type="fixed"
        colliders={false}
        collisionGroups={COLLISION_CONFIGS.pages}
        userData={{ isPage: true }}
      >
        {/* Main collider - thin plane */}
        <CuboidCollider args={[halfWidth, halfHeight, thickness / 2]} />
      </RigidBody>

      {/* Visual platform surface - dark theme matching the DOM pages */}
      <mesh position={[0, 0, thickness / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

export default DetailPagePlane
