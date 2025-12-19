'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { BuildingData, GLOBE_CONFIG } from './types'
import { latLongToVector3, getOutwardRotation } from './utils'

interface WindowProps {
  position: [number, number, number]
  color: string
}

function Window({ position, color }: WindowProps) {
  const [lit, setLit] = useState(Math.random() > 0.3)

  useEffect(() => {
    const interval = setInterval(() => {
      setLit(Math.random() > 0.2)
    }, Math.random() * 5000 + 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <mesh position={position}>
      <boxGeometry args={[0.15, 0.2, 0.03]} />
      <meshStandardMaterial
        color={lit ? color : '#333333'}
        emissive={lit ? color : '#000000'}
        emissiveIntensity={lit ? 0.8 : 0}
      />
    </mesh>
  )
}

interface BuildingOnGlobeProps {
  building: BuildingData
  globeRadius?: number
  onClick: () => void
  isActive: boolean
}

export function BuildingOnGlobe({
  building,
  globeRadius = GLOBE_CONFIG.radius,
  onClick,
  isActive
}: BuildingOnGlobeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [width, height, depth] = building.size

  // Calculate position on globe surface
  const surfacePosition = useMemo(
    () => latLongToVector3(building.lat, building.long, globeRadius),
    [building.lat, building.long, globeRadius]
  )

  // Calculate rotation to align with surface
  const surfaceRotation = useMemo(
    () => getOutwardRotation(surfacePosition),
    [surfacePosition]
  )

  // Position building on surface with height offset
  const buildingPosition = useMemo(() => {
    const normal = surfacePosition.clone().normalize()
    return surfacePosition.clone().add(normal.multiplyScalar(height / 2))
  }, [surfacePosition, height])

  // Generate window positions (relative to building center)
  const windows = useMemo(() => {
    const windowList: { x: number; y: number; z: number }[] = []

    // Don't add windows to the blank plot
    if (building.key === 'blank') return windowList

    const floors = Math.floor(height * 1.5)
    const windowsPerFloor = Math.floor(width * 2)

    for (let floor = 1; floor < floors; floor++) {
      for (let i = 0; i < windowsPerFloor; i++) {
        windowList.push({
          x: (i - windowsPerFloor / 2) * 0.3 + 0.15,
          y: floor * 0.4 - height / 2 + 0.3,
          z: depth / 2 + 0.01
        })
      }
    }
    return windowList
  }, [width, height, depth, building.key])

  // Animation for hover/active states
  useFrame(() => {
    if (groupRef.current) {
      const targetScale = isActive ? 1.08 : hovered ? 1.04 : 1
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      )
    }
  })

  // Special rendering for blank plot
  if (building.key === 'blank') {
    return (
      <group
        ref={groupRef}
        position={buildingPosition}
        quaternion={surfaceRotation}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Flat plot marker */}
        <mesh>
          <cylinderGeometry args={[width / 2, width / 2, 0.1, 6]} />
          <meshStandardMaterial
            color="#3a5a40"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>

        {/* Construction markers */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 2) * (width / 2 - 0.2),
              0.3,
              Math.sin((i * Math.PI) / 2) * (depth / 2 - 0.2)
            ]}
          >
            <coneGeometry args={[0.1, 0.3, 4]} />
            <meshStandardMaterial
              color="#ff6b00"
              emissive="#ff6b00"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}

        {/* "Available" sign */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[0.8, 0.4, 0.05]} />
          <meshStandardMaterial
            color="#2d5a27"
            emissive="#4a8f42"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Sign post */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>

        {/* Hover label */}
        {hovered && (
          <Html center position={[0, 1.5, 0]}>
            <div className="glass-effect px-4 py-2 rounded-lg pointer-events-none whitespace-nowrap">
              <p className="text-white font-semibold text-sm">{building.name}</p>
              <p className="text-emerald-300 text-xs">Click to collaborate!</p>
            </div>
          </Html>
        )}
      </group>
    )
  }

  return (
    <group
      ref={groupRef}
      position={buildingPosition}
      quaternion={surfaceRotation}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main building body */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={building.color}
          emissive={building.color}
          emissiveIntensity={isActive ? 0.35 : hovered ? 0.2 : 0.08}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height / 2 + 0.1, 0]}>
        <boxGeometry args={[width + 0.15, 0.2, depth + 0.15]} />
        <meshStandardMaterial
          color={building.roofColor}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Windows */}
      {windows.map((win, idx) => (
        <Window
          key={idx}
          position={[win.x, win.y, win.z]}
          color={building.windowColor}
        />
      ))}

      {/* Door */}
      <mesh position={[0, -height / 2 + 0.25, depth / 2 + 0.01]}>
        <boxGeometry args={[0.3, 0.5, 0.03]} />
        <meshStandardMaterial color="#2c1810" roughness={0.9} />
      </mesh>

      {/* Hover label */}
      {hovered && !isActive && (
        <Html center position={[0, height / 2 + 0.8, 0]}>
          <div className="glass-effect px-4 py-2 rounded-lg pointer-events-none whitespace-nowrap">
            <p className="text-white font-semibold text-sm">{building.name}</p>
            <p className="text-slate-300 text-xs">{building.category}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

export default BuildingOnGlobe
