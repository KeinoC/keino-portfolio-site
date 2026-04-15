'use client'

import * as THREE from 'three'
import { GLOBE_CONFIG } from './types'

interface AtmosphereProps {
  radius?: number
  color?: string
}

export function Atmosphere({
  radius = GLOBE_CONFIG.radius,
  color = '#4488ff'
}: AtmosphereProps) {
  return (
    <>
      {/* Outer atmosphere glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.08, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Middle atmosphere layer */}
      <mesh>
        <sphereGeometry args={[radius * 1.04, 32, 32]} />
        <meshBasicMaterial
          color="#6ba8ff"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner subtle glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.01, 32, 32]} />
        <meshBasicMaterial
          color="#88bbff"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}

export default Atmosphere
