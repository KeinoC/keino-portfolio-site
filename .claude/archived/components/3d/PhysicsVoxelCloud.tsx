'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  InstancedRigidBodies,
  CuboidCollider,
  useRapier,
  type RapierRigidBody,
} from '@react-three/rapier'

type VoxelPhase = 'idle' | 'attracting' | 'complete'

const DISSOLVE_THRESHOLD = 0.5 // distance to light cube for dissolve
const GLOW_RADIUS = 1.5 // distance within which cubes start glowing
const MIN_ATTRACTION_DIST = 0.1

// Pre-allocated temp objects (avoid per-frame GC)
const _tempColor = new THREE.Color()
const _baseColor = new THREE.Color()
const _glowColor = new THREE.Color('#fffaf0')

export interface PhysicsVoxelCloudProps {
  /** Voxel center positions (assembled shape) */
  positions: THREE.Vector3[]
  /** Voxel cube size. Default: 0.06 */
  voxelSize?: number
  /** Whether to trigger the crumble (switch to dynamic). */
  crumble: boolean
  /** Explosion impulse strength when crumbling. Default: 0.5 */
  bounceStrength?: number
  /** Attraction pull strength toward light cube. Default: 4 */
  attractionForce?: number
  /** Orbital/spiral strength (0 = straight line, 1 = heavy whirlpool). Default: 0.3 */
  spiralForce?: number
  /** Cube color. Default: '#2a2a2a' */
  color?: string
  /** Material metalness. Default: 0.15 */
  metalness?: number
  /** Material roughness. Default: 0.35 */
  roughness?: number
  /** Ref to the light cube's rigid body for gravity well targeting */
  lightCubeBodyRef?: { current: RapierRigidBody | null }
  /** Called when all cubes have been absorbed */
  onAbsorbComplete?: () => void
}

export function PhysicsVoxelCloud({
  positions,
  voxelSize = 0.06,
  crumble,
  bounceStrength = 0.5,
  attractionForce = 4,
  spiralForce = 0.3,
  color = '#2a2a2a',
  metalness = 0.15,
  roughness = 0.35,
  lightCubeBodyRef,
  onAbsorbComplete,
}: PhysicsVoxelCloudProps) {
  const { rapier } = useRapier()
  const rigidBodies = useRef<(RapierRigidBody | null)[]>(null)
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const hasCrumbled = useRef(false)
  const phaseRef = useRef<VoxelPhase>('idle')
  const dissolved = useRef(new Uint8Array(0))
  const colorsInitialized = useRef(false)
  const pendingCrumble = useRef(false)
  const count = positions.length

  // Build instance configs — start as kinematic (frozen in letter shape)
  const instances = useMemo(() => {
    return positions.map((pos, i) => ({
      key: i,
      position: [pos.x, pos.y, pos.z] as [number, number, number],
    }))
  }, [positions])

  // Reset dissolved array when count changes
  useEffect(() => {
    dissolved.current = new Uint8Array(count)
    colorsInitialized.current = false
  }, [count])

  // Flag crumble for next useFrame (bodies may not be ready in useEffect)
  useEffect(() => {
    if (crumble && !hasCrumbled.current) {
      pendingCrumble.current = true
    }
  }, [crumble])

  // Reset when crumble goes back to false
  useEffect(() => {
    if (!crumble) {
      hasCrumbled.current = false
      pendingCrumble.current = false
      phaseRef.current = 'idle'
      colorsInitialized.current = false
      dissolved.current = new Uint8Array(count)
      if (matRef.current) matRef.current.color.set(color)
    }
  }, [crumble, count, color])

  // All physics mutations happen in useFrame where bodies are guaranteed valid
  useFrame(() => {
    // Apply pending crumble — bodies are ready in useFrame context
    // Immediately enter attracting phase (no delay)
    if (pendingCrumble.current) {
      const bodies = rigidBodies.current
      if (!bodies || !bodies[0]) return // wait until bodies are ready

      pendingCrumble.current = false
      hasCrumbled.current = true
      // Go straight to attracting — attraction starts immediately
      phaseRef.current = 'attracting'

      for (let i = 0; i < bodies.length; i++) {
        const rb = bodies[i]
        if (!rb) continue

        rb.setBodyType(rapier.RigidBodyType.Dynamic, true)
        // Low damping so both explosion and attraction velocities work
        rb.setLinearDamping(0.1)
        rb.setAngularDamping(0.5)

        // Radial outward from center + random jitter = explosion scatter
        const pos = rb.translation()
        const radialX = pos.x * bounceStrength * 0.3
        const radialY = pos.y * bounceStrength * 0.3
        const jitterX = (Math.random() - 0.5) * bounceStrength * 0.5
        const jitterY = (Math.random() - 0.5) * bounceStrength * 0.5
        const upForce = bounceStrength * (0.5 + Math.random() * 0.5)

        rb.setLinvel({ x: radialX + jitterX, y: radialY + jitterY, z: upForce }, true)
        rb.setAngvel({
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6,
          z: (Math.random() - 0.5) * 4,
        }, true)
      }
    }

    if (phaseRef.current !== 'attracting') return

    const lightCube = lightCubeBodyRef?.current
    if (!lightCube) return
    const target = lightCube.translation()

    const bodies = rigidBodies.current
    const mesh = meshRef.current
    if (!bodies || !mesh) return

    // Initialize instance colors on first attraction frame
    // Material switches to white so instance colors control final appearance
    if (!colorsInitialized.current) {
      colorsInitialized.current = true
      _baseColor.set(color)
      if (matRef.current) matRef.current.color.set('#ffffff')
      for (let i = 0; i < count; i++) {
        mesh.setColorAt(i, _baseColor)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    // Blend rate: how fast current velocity steers toward attraction target
    // Pull=1 → 0.01 (slow steer, ~2s), Pull=10 → 0.1 (aggressive, ~0.3s)
    const baseBlend = attractionForce * 0.01
    const targetSpeed = attractionForce + 2

    let allDissolved = true
    _baseColor.set(color)

    for (let i = 0; i < bodies.length; i++) {
      if (dissolved.current[i]) continue
      allDissolved = false

      const rb = bodies[i]
      if (!rb) continue

      const pos = rb.translation()
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      const dz = target.z - pos.z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

      // Dissolve on contact with light cube
      if (dist < DISSOLVE_THRESHOLD) {
        dissolved.current[i] = 1
        rb.setBodyType(rapier.RigidBodyType.KinematicPositionBased, true)
        rb.setTranslation({ x: 0, y: 100, z: 0 }, true)
        mesh.setColorAt(i, _baseColor)
        continue
      }

      // Attraction via velocity blending — lerp current velocity toward target.
      // Explosion momentum decays naturally; cubes arc out then curve back.
      const speed = Math.min(targetSpeed, targetSpeed * (0.5 + 1 / Math.max(MIN_ATTRACTION_DIST, dist)))
      const dirX = dx / dist
      const dirY = dy / dist
      const dirZ = dz / dist

      // Whirlpool: add tangential twist then normalize so inward pull dominates.
      // cross(dir, Z) = [dirY, -dirX, 0] — fades close so cubes get absorbed.
      // Fade distance scales with spiralForce so higher values orbit wider before funneling in.
      const fadeRadius = 0.4 + spiralForce * 0.6
      const spiral = spiralForce * Math.min(1, dist / fadeRadius)
      const rawX = dirX + dirY * spiral
      const rawY = dirY - dirX * spiral
      const rawLen = Math.sqrt(rawX * rawX + rawY * rawY) || 1
      const tvx = (rawX / rawLen) * speed
      const tvy = (rawY / rawLen) * speed
      const tvz = dirZ * speed

      // Aggressive close-range blend — overrides inter-body collision responses
      // that create a "traffic jam" shell around the light cube at high particle counts
      const closeBoost = dist < 1.0 ? (1 - dist / 1.0) * 0.8 : 0
      const blend = Math.min(1, baseBlend + closeBoost)

      const vel = rb.linvel()
      rb.setLinvel({
        x: vel.x + (tvx - vel.x) * blend,
        y: vel.y + (tvy - vel.y) * blend,
        z: vel.z + (tvz - vel.z) * blend,
      }, true)

      // Glow based on proximity (quadratic falloff within GLOW_RADIUS)
      const glowT = Math.max(0, 1 - dist / GLOW_RADIUS)
      const t = glowT * glowT
      _tempColor.copy(_baseColor).lerp(_glowColor, t)
      mesh.setColorAt(i, _tempColor)
    }

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }

    if (allDissolved) {
      phaseRef.current = 'complete'
      onAbsorbComplete?.()
    }
  })

  if (count === 0) return null

  const halfSize = voxelSize / 2
  // Scale mass with volume (size³) — reference: 0.06 size → 0.2 mass
  // Prevents tiny cubes from being ultra-dense and scattering on collision
  const REF_SIZE = 0.06
  const REF_MASS = 0.2
  const scaledMass = REF_MASS * (voxelSize / REF_SIZE) ** 3

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      type="kinematicPosition"
      colliders={false}
      mass={scaledMass}
      restitution={0.4}
      friction={0.8}
      linearDamping={1.0}
      angularDamping={2.0}
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        count={count}
        frustumCulled={false}
      >
        <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          metalness={metalness}
          roughness={roughness}
        />
      </instancedMesh>
      <CuboidCollider args={[halfSize, halfSize, halfSize]} />
    </InstancedRigidBodies>
  )
}
