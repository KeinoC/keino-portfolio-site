'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'

interface DropZoneProps {
  position: [number, number, number]
  size: [number, number]
  onItemDropped?: () => void
  label?: string
}

export function DropZone({
  position,
  size,
  onItemDropped,
  label = 'DROP'
}: DropZoneProps) {
  const [itemCount, setItemCount] = useState(0)
  const [pulseIntensity, setPulseIntensity] = useState(0)
  const borderRef = useRef<THREE.Mesh>(null)

  // Pulsing animation
  useFrame((state) => {
    const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2
    setPulseIntensity(pulse)

    // Animate border dash offset (fake dashed line effect via opacity)
    if (borderRef.current) {
      const material = borderRef.current.material as THREE.MeshBasicMaterial
      material.opacity = 0.3 + pulse * 0.3
    }
  })

  const handleIntersectionEnter = () => {
    setItemCount((prev) => prev + 1)
    onItemDropped?.()
  }

  const halfWidth = size[0] / 2
  const halfHeight = size[1] / 2
  const borderWidth = 0.04

  return (
    <group position={position}>
      {/* Sensor to detect dropped items */}
      <RigidBody type="fixed" position={[0, 0, 0.25]} colliders={false}>
        <CuboidCollider
          args={[halfWidth, halfHeight, 0.5]}
          sensor
          onIntersectionEnter={handleIntersectionEnter}
        />
      </RigidBody>

      {/* Background fill - subtle green tint */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={size} />
        <meshBasicMaterial
          color="#00ff66"
          transparent
          opacity={0.05 + pulseIntensity * 0.05}
        />
      </mesh>

      {/* Corner markers */}
      {[
        [-halfWidth + 0.1, halfHeight - 0.1],   // Top-left
        [halfWidth - 0.1, halfHeight - 0.1],    // Top-right
        [-halfWidth + 0.1, -halfHeight + 0.1],  // Bottom-left
        [halfWidth - 0.1, -halfHeight + 0.1],   // Bottom-right
      ].map(([x, y], i) => (
        <group key={i} position={[x, y, 0.01]}>
          {/* L-shaped corner */}
          <mesh position={[i % 2 === 0 ? 0.06 : -0.06, 0, 0]}>
            <planeGeometry args={[0.12, borderWidth]} />
            <meshBasicMaterial
              color="#00ff66"
              transparent
              opacity={0.5 + pulseIntensity * 0.3}
            />
          </mesh>
          <mesh position={[0, i < 2 ? -0.06 : 0.06, 0]}>
            <planeGeometry args={[borderWidth, 0.12]} />
            <meshBasicMaterial
              color="#00ff66"
              transparent
              opacity={0.5 + pulseIntensity * 0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Border edges - top */}
      <mesh ref={borderRef} position={[0, halfHeight, 0.008]}>
        <planeGeometry args={[size[0] - 0.3, borderWidth]} />
        <meshBasicMaterial color="#00ff66" transparent opacity={0.4} />
      </mesh>

      {/* Border edges - bottom */}
      <mesh position={[0, -halfHeight, 0.008]}>
        <planeGeometry args={[size[0] - 0.3, borderWidth]} />
        <meshBasicMaterial
          color="#00ff66"
          transparent
          opacity={0.3 + pulseIntensity * 0.3}
        />
      </mesh>

      {/* Border edges - left */}
      <mesh position={[-halfWidth, 0, 0.008]}>
        <planeGeometry args={[borderWidth, size[1] - 0.3]} />
        <meshBasicMaterial
          color="#00ff66"
          transparent
          opacity={0.3 + pulseIntensity * 0.3}
        />
      </mesh>

      {/* Border edges - right */}
      <mesh position={[halfWidth, 0, 0.008]}>
        <planeGeometry args={[borderWidth, size[1] - 0.3]} />
        <meshBasicMaterial
          color="#00ff66"
          transparent
          opacity={0.3 + pulseIntensity * 0.3}
        />
      </mesh>

      {/* Center icon/indicator */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.15, 0.2, 16]} />
        <meshBasicMaterial
          color="#00ff66"
          transparent
          opacity={0.2 + pulseIntensity * 0.2}
        />
      </mesh>

      {/* Item count display */}
      {itemCount > 0 && (
        <mesh position={[halfWidth - 0.2, halfHeight - 0.2, 0.015]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color="#00ff66" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

export default DropZone
