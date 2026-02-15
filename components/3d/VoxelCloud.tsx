'use client'

import { useRef, useMemo, useLayoutEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

/** Per-voxel animation data (pre-allocated, no GC) */
interface VoxelDatum {
  target: THREE.Vector3    // Assembled position
  scatter: THREE.Vector3   // Scattered position
  delay: number            // 0–1 stagger offset
}

export interface ScatterConfig {
  /** How far voxels spread when scattered. Default: 8 */
  radius?: number
  /** Scatter distribution. Default: 'random' */
  pattern?: 'random' | 'radial' | 'directional' | 'sandfall'
  /** Direction for 'directional' pattern. Default: [1, 0, 0] */
  direction?: [number, number, number]
  /** Max stagger delay (seconds-equivalent, mapped to 0-1). Default: 0.4 */
  stagger?: number
  /** Stagger origin: 'random' | 'center' | 'edge' | 'top'. Default: 'center' */
  staggerOrigin?: 'random' | 'center' | 'edge' | 'top'
}

export interface VoxelCloudProps {
  /** Voxel center positions (assembled shape) */
  positions: THREE.Vector3[]
  /** Voxel cube size. Default: 0.04 */
  voxelSize?: number
  /** 0 = scattered, 1 = assembled */
  progress: number
  /** Scatter configuration */
  scatter?: ScatterConfig
  /** Cube color. Default: '#2a2a2a' */
  color?: string
  /** Material metalness. Default: 0.15 */
  metalness?: number
  /** Material roughness. Default: 0.35 */
  roughness?: number
  /** Emissive color (for glow during transition). Default: undefined */
  emissive?: string
  /** Emissive intensity multiplier as fn of progress. Default: 0 */
  emissiveIntensity?: number
}

// Easing: cubic ease-in-out
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function VoxelCloud({
  positions,
  voxelSize = 0.04,
  progress,
  scatter = {},
  color = '#2a2a2a',
  metalness = 0.15,
  roughness = 0.35,
  emissive,
  emissiveIntensity = 0,
}: VoxelCloudProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const {
    radius = 8,
    pattern = 'random',
    direction = [1, 0, 0],
    stagger = 0.4,
    staggerOrigin = 'center',
  } = scatter

  // Compute bounds of assembled positions
  const bounds = useMemo(() => {
    if (positions.length === 0) {
      return { center: new THREE.Vector3(), maxDist: 0, minY: 0, maxY: 0, minX: 0, maxX: 0 }
    }
    const c = new THREE.Vector3()
    let minY = Infinity, maxY = -Infinity
    let minX = Infinity, maxX = -Infinity
    for (const p of positions) {
      c.add(p)
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
    }
    c.divideScalar(positions.length)

    let maxDist = 0
    for (const p of positions) {
      const d = p.distanceTo(c)
      if (d > maxDist) maxDist = d
    }

    return { center: c, maxDist, minY, maxY, minX, maxX }
  }, [positions])

  // Pre-compute per-voxel scatter positions and stagger delays
  const voxelData = useMemo<VoxelDatum[]>(() => {
    const { center, maxDist, minY, maxY } = bounds
    const dir = new THREE.Vector3(...direction).normalize()
    const heightRange = maxY - minY || 1

    return positions.map((pos) => {
      let sx: number, sy: number, sz: number

      if (pattern === 'sandfall') {
        // Sand falls to surface: voxels scatter in XY and drop to Z=0
        // Spread outward from letter position on the floor plane
        const jitterX = (Math.random() - 0.5) * radius
        const jitterY = (Math.random() - 0.5) * radius
        sx = pos.x + jitterX
        sy = pos.y + jitterY
        // Fall to floor (Z=0) with tiny random pile height
        sz = Math.random() * 0.02
      } else if (pattern === 'radial') {
        const angle = Math.random() * Math.PI * 2
        const r = radius * (0.5 + Math.random() * 0.5)
        sx = pos.x + Math.cos(angle) * r
        sy = pos.y + Math.sin(angle) * r
        sz = pos.z + (Math.random() - 0.5) * radius * 0.3
      } else if (pattern === 'directional') {
        const spread = radius * (0.3 + Math.random() * 0.7)
        sx = pos.x + dir.x * spread + (Math.random() - 0.5) * radius * 0.3
        sy = pos.y + dir.y * spread + (Math.random() - 0.5) * radius * 0.3
        sz = pos.z + dir.z * spread + (Math.random() - 0.5) * radius * 0.3
      } else {
        // random
        sx = pos.x + (Math.random() - 0.5) * radius * 2
        sy = pos.y + (Math.random() - 0.5) * radius * 2
        sz = pos.z + (Math.random() - 0.5) * radius * 0.5
      }

      // Stagger delay
      let delay: number
      if (staggerOrigin === 'top') {
        // Higher Z voxels (top of extrusion) fall first + random jitter
        const zRange = bounds.maxY - bounds.minY || 1
        delay = ((pos.y - minY) / zRange) * stagger * 0.5 + Math.random() * stagger * 0.5
      } else if (staggerOrigin === 'center') {
        delay = maxDist > 0 ? (pos.distanceTo(center) / maxDist) * stagger : 0
      } else if (staggerOrigin === 'edge') {
        delay = maxDist > 0 ? (1 - pos.distanceTo(center) / maxDist) * stagger : 0
      } else {
        delay = Math.random() * stagger
      }

      return {
        target: pos.clone(),
        scatter: new THREE.Vector3(sx, sy, sz),
        delay,
      }
    })
  }, [positions, radius, pattern, direction, stagger, staggerOrigin, bounds])

  const count = positions.length

  // Set initial matrices
  useLayoutEffect(() => {
    if (!meshRef.current || count === 0) return
    voxelData.forEach((v, i) => {
      dummy.position.copy(v.scatter)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [voxelData, dummy, count])

  // Animate per frame
  useFrame(() => {
    if (!meshRef.current || count === 0) return

    for (let i = 0; i < count; i++) {
      const v = voxelData[i]

      // Per-voxel progress with stagger
      const localP = Math.max(0, Math.min(1,
        (progress - v.delay) / (1 - v.delay + 0.001)
      ))
      const t = easeInOutCubic(localP)

      // Lerp position
      dummy.position.lerpVectors(v.scatter, v.target, t)

      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (count === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </instancedMesh>
  )
}
