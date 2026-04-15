'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Ring } from '@react-three/drei'
import * as THREE from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

const RING_RADIUS = 1.0
const RING_WIDTH = 0.012

interface CubeHUDProps {
  bodyRef: React.RefObject<RapierRigidBody | null>
  docked?: boolean
}

export function CubeHUD({ bodyRef }: CubeHUDProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!groupRef.current || !bodyRef.current) return
    const pos = bodyRef.current.translation()
    groupRef.current.position.set(pos.x, pos.y, pos.z)
  })

  return (
    <group ref={groupRef} raycast={() => null}>
      <Ring args={[RING_RADIUS - RING_WIDTH, RING_RADIUS, 64]} raycast={() => null}>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </Ring>
    </group>
  )
}
