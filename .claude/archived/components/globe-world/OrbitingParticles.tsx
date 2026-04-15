'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLOBE_CONFIG } from './types'
import { isMobileDevice } from './utils'

interface OrbitingParticlesProps {
  radius?: number
  count?: number
}

export function OrbitingParticles({
  radius = GLOBE_CONFIG.radius,
  count
}: OrbitingParticlesProps) {
  const particlesRef = useRef<THREE.Points>(null)

  // Reduce particles on mobile for performance
  const particleCount = count ?? (isMobileDevice() ? 200 : 500)

  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)

    // Distribute particles in a shell around the globe
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      // Shell between 1.15x and 1.4x radius
      const r = radius * (1.15 + Math.random() * 0.25)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      // Slight color variation (white to light blue)
      const colorVariation = 0.8 + Math.random() * 0.2
      colors[i * 3] = colorVariation
      colors[i * 3 + 1] = colorVariation
      colors[i * 3 + 2] = 1
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [particleCount, radius])

  // Slow orbit rotation
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.00015
      particlesRef.current.rotation.x += 0.00008
    }
  })

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        transparent
        opacity={0.7}
        vertexColors
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default OrbitingParticles
