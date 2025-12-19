'use client'

import { useRef, useCallback, useEffect, useMemo } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const LIFT_HEIGHT = 0.4 // How high to lift when dragging

interface DebrisProps {
  position: [number, number, number]
  id: string
  color?: string
  size?: number
}

export function Debris({
  position,
  id,
  color = '#aa4444',
  size = 0.25
}: DebrisProps) {
  const { camera, gl } = useThree()
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Drag state
  const isDragging = useRef(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const lastDragPos = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())

  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  const getMouseNDC = useCallback((event: PointerEvent | ThreeEvent<PointerEvent>) => {
    const rect = gl.domElement.getBoundingClientRect()
    const clientX = 'clientX' in event ? event.clientX : (event as ThreeEvent<PointerEvent>).nativeEvent.clientX
    const clientY = 'clientY' in event ? event.clientY : (event as ThreeEvent<PointerEvent>).nativeEvent.clientY
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )
  }, [gl.domElement])

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    isDragging.current = true
    document.body.style.cursor = 'grabbing'

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
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !rigidBodyRef.current) return

      const mouse = getMouseNDC(event)
      raycaster.setFromCamera(mouse, camera)

      const intersectPoint = new THREE.Vector3()
      if (raycaster.ray.intersectPlane(dragPlane.current, intersectPoint)) {
        const targetX = intersectPoint.x + dragOffset.current.x
        const targetY = intersectPoint.y + dragOffset.current.y
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
      document.body.style.cursor = 'default'

      if (rigidBodyRef.current) {
        // Apply throw velocity
        rigidBodyRef.current.setLinvel({
          x: velocity.current.x * 0.3,
          y: velocity.current.y * 0.3,
          z: -2 // Drop down
        }, true)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [camera, getMouseNDC, raycaster])

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      mass={0.2}
      restitution={0.3}
      friction={0.8}
      linearDamping={2.5}
      angularDamping={2.0}
      userData={{ cleanable: true, id }}
    >
      <CuboidCollider args={[size / 2, size / 2, size / 2]} />

      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { document.body.style.cursor = 'grab' }}
        onPointerOut={() => { if (!isDragging.current) document.body.style.cursor = 'default' }}
      >
        <RoundedBox args={[size, size, size]} radius={0.03} smoothness={4}>
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.6}
          />
        </RoundedBox>
      </group>
    </RigidBody>
  )
}

export default Debris
