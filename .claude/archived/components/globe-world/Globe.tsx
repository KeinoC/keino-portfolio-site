'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBE_CONFIG } from './types'

interface GlobeProps {
  radius?: number
}

export function Globe({ radius = GLOBE_CONFIG.radius }: GlobeProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  // Slow idle rotation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0003
    }
  })

  return (
    <mesh ref={meshRef}>
      {/* Low-poly icosphere for stylized look */}
      <icosahedronGeometry args={[radius, GLOBE_CONFIG.segments]} />

      <meshStandardMaterial
        ref={materialRef}
        color="#1a1a2e"
        roughness={0.85}
        metalness={0.15}
        flatShading // Emphasizes low-poly aesthetic
      />
    </mesh>
  )
}

export default Globe
