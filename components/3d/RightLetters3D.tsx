'use client'

import { useRef } from 'react'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { Text3D, Center } from '@react-three/drei'
import { COLLISION_CONFIGS } from '@/lib/physics-groups'

interface RightLetters3DProps {
  text?: string
  position?: [number, number, number]
  spacing?: number
  letterSize?: number
  letterHeight?: number
  color?: string
}

/**
 * RightLetters3D - Physics-enabled 3D text letters positioned for the right side of the scene.
 * Each letter is a separate physics object that can interact with the cube and other elements.
 *
 * Usage:
 * ```tsx
 * <RightLetters3D
 *   text="RIGHT"
 *   position={[3, 0, 0.1]}
 *   spacing={0.6}
 * />
 * ```
 */
export function RightLetters3D({
  text = "RIGHT",
  position = [3, 0, 0.1],
  spacing = 0.6,
  letterSize = 0.7,
  letterHeight = 0.2,
  color = "#2563eb"
}: RightLetters3DProps) {
  const letters = text.split('')

  return (
    <group>
      {letters.map((letter, i) => (
        <Letter3D
          key={letter + i}
          letter={letter}
          position={[
            position[0] + (i - (letters.length - 1) / 2) * spacing,
            position[1],
            position[2] + letterHeight / 2
          ]}
          size={letterSize}
          height={letterHeight}
          color={color}
        />
      ))}
    </group>
  )
}

// Individual letter component with physics
function Letter3D({
  letter,
  position,
  size,
  height,
  color
}: {
  letter: string
  position: [number, number, number]
  size: number
  height: number
  color: string
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      type="dynamic"
      mass={40}
      restitution={0.25}
      friction={1.0}
      linearDamping={2.5}
      angularDamping={2}
      colliders={false}
      collisionGroups={COLLISION_CONFIGS.letters}
    >
      {/* Physics collider sized to match visual */}
      <CuboidCollider args={[size * 0.35, size * 0.45, height / 2]} />

      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={size}
          height={height}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.012}
          bevelSegments={3}
        >
          {letter}
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </Text3D>
      </Center>
    </RigidBody>
  )
}

export default RightLetters3D
