'use client'

import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useThree, useFrame, ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { RigidBody, CuboidCollider, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

const CUBE_SIZE = 0.4
const CUBE_PADDING = 0.25
const LIFT_HEIGHT = 0.6

export interface LightCubeProps {
  /** Starting position. Default: [2.5, 1.2, 0.5] */
  position?: [number, number, number]
  /** Called each frame with projected screen position (0-100%). */
  onPositionChange?: (pos: { x: number; y: number }) => void
}

/** Swirling inner light */
function InnerLight() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.12, 0]} />
      <meshBasicMaterial color="#fff8e7" transparent opacity={0.9} />
    </mesh>
  )
}

/**
 * Draggable, physics-enabled light cube.
 *
 * Uses setTranslation for snappy drag, manual velocity tracking for release momentum.
 * Bounces off screen edges. Must be placed inside a <Physics> provider.
 */
export function LightCube({
  position = [2.5, 1.2, 0.5],
  onPositionChange,
}: LightCubeProps) {
  const { camera, gl, viewport } = useThree()
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const isDragging = useRef(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const lastDragPos = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())
  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  const bounds = useMemo(() => {
    const halfW = viewport.width / 2
    const halfH = viewport.height / 2
    return {
      minX: -halfW + CUBE_PADDING,
      maxX: halfW - CUBE_PADDING,
      minY: -halfH + CUBE_PADDING,
      maxY: halfH - CUBE_PADDING,
      halfW,
      halfH,
    }
  }, [viewport.width, viewport.height])

  const getMouseNDC = useCallback((event: ThreeEvent<PointerEvent>) => {
    const rect = gl.domElement.getBoundingClientRect()
    return new THREE.Vector2(
      ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1
    )
  }, [gl.domElement])

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    isDragging.current = true

    if (rigidBodyRef.current) {
      rigidBodyRef.current.wakeUp()
      const pos = rigidBodyRef.current.translation()
      dragPlane.current.constant = -(pos.z + LIFT_HEIGHT)

      const mouse = getMouseNDC(event)
      raycaster.setFromCamera(mouse, camera)
      const intersectPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane.current, intersectPoint)

      dragOffset.current.set(pos.x - intersectPoint.x, pos.y - intersectPoint.y, 0)
      lastDragPos.current.set(pos.x, pos.y, pos.z + LIFT_HEIGHT)
      velocity.current.set(0, 0, 0)
    }
  }, [camera, getMouseNDC, raycaster])

  useEffect(() => {
    const getMouseNDCFromEvent = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      return new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !rigidBodyRef.current) return

      const mouse = getMouseNDCFromEvent(event)
      raycaster.setFromCamera(mouse, camera)

      const intersectPoint = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(dragPlane.current, intersectPoint)) {
        const targetX = Math.max(bounds.minX, Math.min(bounds.maxX, intersectPoint.x + dragOffset.current.x))
        const targetY = Math.max(bounds.minY, Math.min(bounds.maxY, intersectPoint.y + dragOffset.current.y))
        const targetZ = LIFT_HEIGHT

        velocity.current.set(
          (targetX - lastDragPos.current.x) * 60,
          (targetY - lastDragPos.current.y) * 60,
          0
        )
        lastDragPos.current.set(targetX, targetY, targetZ)

        rigidBodyRef.current.setTranslation({ x: targetX, y: targetY, z: targetZ }, true)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    }

    const handlePointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false

      if (rigidBodyRef.current) {
        const maxSpeed = 15
        const vx = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.x))
        const vy = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.y))
        rigidBodyRef.current.setLinvel({ x: vx, y: vy, z: -2 }, true)
        rigidBodyRef.current.setAngvel({ x: vy * 2, y: -vx * 2, z: 0 }, true)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [bounds, camera, gl.domElement, raycaster])

  // Screen-edge boundary bounce + optional position callback
  useFrame(() => {
    if (!rigidBodyRef.current) return
    const pos = rigidBodyRef.current.translation()
    const linvel = rigidBodyRef.current.linvel()

    if (!isDragging.current) {
      const edgeX = bounds.halfW - CUBE_SIZE / 2
      const edgeY = bounds.halfH - CUBE_SIZE / 2

      if (Math.abs(pos.x) > edgeX) {
        rigidBodyRef.current.setTranslation({ x: Math.sign(pos.x) * edgeX, y: pos.y, z: pos.z }, true)
        rigidBodyRef.current.setLinvel({ x: -linvel.x * 0.6, y: linvel.y, z: linvel.z }, true)
      }
      if (Math.abs(pos.y) > edgeY) {
        const p = rigidBodyRef.current.translation()
        rigidBodyRef.current.setTranslation({ x: p.x, y: Math.sign(pos.y) * edgeY, z: p.z }, true)
        const v = rigidBodyRef.current.linvel()
        rigidBodyRef.current.setLinvel({ x: v.x, y: -linvel.y * 0.6, z: v.z }, true)
      }
    }

    if (onPositionChange) {
      const projected = new THREE.Vector3(pos.x, pos.y, pos.z).project(camera)
      onPositionChange({
        x: (projected.x + 1) / 2 * 100,
        y: (1 - projected.y) / 2 * 100,
      })
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      mass={3.0}
      linearDamping={0.3}
      angularDamping={0.3}
      ccd
    >
      <CuboidCollider
        args={[CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2]}
        friction={0.4}
        restitution={0.5}
      />
      <group
        onPointerDown={handlePointerDown}
        onPointerOver={() => { document.body.style.cursor = 'grab' }}
        onPointerOut={() => { if (!isDragging.current) document.body.style.cursor = 'default' }}
      >
        {/* Invisible touch target */}
        <mesh visible={false}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color="#fffef5"
            emissive="#fffaf0"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </RoundedBox>

        <InnerLight />

        <pointLight color="#fffaf0" intensity={40} distance={0} decay={0.6} />
        <pointLight color="#ffefd5" intensity={25} distance={0} decay={0.6} />
      </group>
    </RigidBody>
  )
}
