'use client'

import { useRef } from 'react'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { RoundedBox, Text3D } from '@react-three/drei'
import { COLLISION_CONFIGS } from '@/lib/physics-groups'
import * as THREE from 'three'

interface Card3DProps {
  position: [number, number, number]
  title?: string
  content?: string
  width?: number
  height?: number
  depth?: number
  color?: string
  textColor?: string
}

/**
 * Card3D - A physics-enabled 3D card component that can be placed in the scene.
 * Features realistic physics, proper lighting response, and customizable content.
 *
 * Usage:
 * ```tsx
 * <Card3D
 *   position={[2, 1, 0.1]}
 *   title="My Card"
 *   content="Card content here"
 *   width={1.5}
 *   height={1}
 * />
 * ```
 */
export function Card3D({
  position,
  title = "CARD",
  content = "",
  width = 1.5,
  height = 1,
  depth = 0.05,
  color = "#2a2a2a",
  textColor = "#ffffff"
}: Card3DProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      type="dynamic"
      mass={20}
      restitution={0.2}
      friction={0.8}
      linearDamping={2}
      angularDamping={1}
      colliders={false}
      collisionGroups={COLLISION_CONFIGS.letters} // Reuse letters collision group
    >
      {/* Physics collider matching visual dimensions */}
      <CuboidCollider args={[width / 2, height / 2, depth / 2]} />

      {/* Visual card body */}
      <group>
        {/* Main card body with rounded edges */}
        <RoundedBox
          args={[width, height, depth]}
          radius={0.02}
          smoothness={4}
        >
          <meshStandardMaterial
            color={color}
            metalness={0.1}
            roughness={0.3}
            transparent
            opacity={0.95}
          />
        </RoundedBox>

        {/* Title text */}
        {title && (
          <group position={[0, height * 0.25, depth * 0.51]}>
            <Text3D
              font="/fonts/helvetiker_bold.typeface.json"
              size={0.08}
              height={0.005}
              curveSegments={6}
              bevelEnabled
              bevelThickness={0.001}
              bevelSize={0.001}
              bevelSegments={2}
            >
              {title}
              <meshStandardMaterial
                color={textColor}
                metalness={0.2}
                roughness={0.4}
              />
            </Text3D>
          </group>
        )}

        {/* Content text */}
        {content && (
          <group position={[0, -height * 0.15, depth * 0.51]}>
            <Text3D
              font="/fonts/helvetiker_bold.typeface.json"
              size={0.05}
              height={0.003}
              curveSegments={6}
            >
              {content}
              <meshStandardMaterial
                color={textColor}
                metalness={0.1}
                roughness={0.5}
                transparent
                opacity={0.8}
              />
            </Text3D>
          </group>
        )}

        {/* Subtle edge highlight */}
        <mesh position={[0, 0, depth * 0.52]}>
          <ringGeometry args={[width * 0.48, width * 0.52, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </RigidBody>
  )
}

export default Card3D
