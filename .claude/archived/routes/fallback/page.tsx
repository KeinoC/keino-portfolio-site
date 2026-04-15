'use client'

import { Suspense, useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text3D, Center } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
// collision groups removed — interactionGroups() in physics-groups.ts uses
// bitmask values as group indices which breaks collision filtering.
// v2 uses default collision (everything collides with everything).
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const CUBE_SIZE = 0.4
const CUBE_PADDING = 0.25
const LIFT_HEIGHT = 0.6
const LIFT_SCALE = 1.15

const LETTER_SIZE = 0.7
const LETTER_HEIGHT = 0.2
const LETTER_SPACING = 0.55

// State machine constants
const IDLE_HOVER_HEIGHT = 2.0
const IDLE_RISE_SPEED = 0.5
const IDLE_ROTATION_SPEED = 0.3
const IDLE_LIGHT_BOOST = 1.6

const PAUSE_DURATION = 3.0
const SETTLE_CONFIRM_TIME = 0.3
const SETTLE_TIMEOUT = 3.0
const SETTLE_LINEAR_THRESHOLD = 0.3
const SETTLE_ANGULAR_THRESHOLD = 0.2
const SETTLE_FLAT_THRESHOLD = 0.15 // radians — ~8.5°

// Rapier damping profiles — switched at runtime per state
// At 60fps with dt=0.0167: velocity *= 1/(1 + dt * damping) per substep
const DAMPING_ACTIVE = { linear: 0.3, angular: 0.3 }
const DAMPING_SETTLING = { linear: 4.0, angular: 4.0 }
const DAMPING_RESTING = { linear: 10.0, angular: 10.0 }

type DampingProfile = 'active' | 'settling' | 'resting'
const DAMPING_PROFILES: Record<DampingProfile, { linear: number; angular: number }> = {
  active: DAMPING_ACTIVE,
  settling: DAMPING_SETTLING,
  resting: DAMPING_RESTING,
}

type CubeState = 'active' | 'settling' | 'resting' | 'paused' | 'floating'

// Pre-allocated THREE objects for getNearestFaceAlignment (avoid per-frame GC)
const _localAxes = [
  new THREE.Vector3(), // +X
  new THREE.Vector3(), // -X
  new THREE.Vector3(), // +Y
  new THREE.Vector3(), // -Y
  new THREE.Vector3(), // +Z
  new THREE.Vector3(), // -Z
]
const _worldZ = new THREE.Vector3(0, 0, 1)
const _snapAxis = new THREE.Vector3()
const _snapQuat = new THREE.Quaternion()

function getNearestFaceAlignment(q: THREE.Quaternion): {
  isFlat: boolean
  nearestQuaternion: THREE.Quaternion
  deviation: number
} {
  // The 6 local face normals of a cube
  const faceNormals: [number, number, number][] = [
    [1, 0, 0], [-1, 0, 0],
    [0, 1, 0], [0, -1, 0],
    [0, 0, 1], [0, 0, -1],
  ]

  let bestDot = -Infinity
  let bestIdx = 0

  for (let i = 0; i < 6; i++) {
    _localAxes[i].set(faceNormals[i][0], faceNormals[i][1], faceNormals[i][2])
    _localAxes[i].applyQuaternion(q)
    const dot = _localAxes[i].dot(_worldZ)
    if (dot > bestDot) {
      bestDot = dot
      bestIdx = i
    }
  }

  // Deviation angle between best face and world Z
  const deviation = Math.acos(Math.min(1, Math.max(-1, bestDot)))

  // Compute snap quaternion: rotate current orientation so best face aligns with +Z
  const bestFaceWorld = _localAxes[bestIdx].clone().normalize()
  _snapAxis.crossVectors(bestFaceWorld, _worldZ)
  const snapLen = _snapAxis.length()

  if (snapLen < 0.001) {
    // Already aligned (or anti-aligned — if anti-aligned, 180° flip needed but rare)
    _snapQuat.copy(q)
  } else {
    _snapAxis.normalize()
    const angle = Math.atan2(snapLen, bestDot)
    _snapQuat.setFromAxisAngle(_snapAxis, angle)
    _snapQuat.multiply(q)
  }

  return {
    isFlat: deviation < SETTLE_FLAT_THRESHOLD,
    nearestQuaternion: _snapQuat.clone(),
    deviation,
  }
}

// Swirling inner light component
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

// Draggable light cube with Rapier physics - simplified (no socket)
function LightCube({ onPositionChange }: { onPositionChange?: (pos: { x: number; y: number }) => void }) {
  const { camera, gl, size } = useThree()
  const ortho = camera as THREE.OrthographicCamera
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const lastDragPos = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())

  // State machine
  const cubeState = useRef<CubeState>('active')
  const stateStartTime = useRef(0)
  const settledDuration = useRef(0)
  const floatProgress = useRef(0)
  const floatBaseZ = useRef(0)
  const lastInteractionTime = useRef(Date.now())

  // Damping profile tracking — only call Rapier API when profile changes
  const currentDamping = useRef<DampingProfile>('active')

  const applyDamping = useCallback((profile: DampingProfile) => {
    if (currentDamping.current === profile) return
    if (!rigidBodyRef.current) return
    const { linear, angular } = DAMPING_PROFILES[profile]
    rigidBodyRef.current.setLinearDamping(linear)
    rigidBodyRef.current.setAngularDamping(angular)
    currentDamping.current = profile
  }, [])

  // Imperative refs for light intensity (no setState in useFrame)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)

  const bounds = useMemo(() => {
    const halfW = (ortho.right - ortho.left) / (2 * ortho.zoom)
    const halfH = (ortho.top - ortho.bottom) / (2 * ortho.zoom)
    return {
      minX: -halfW + CUBE_PADDING,
      maxX: halfW - CUBE_PADDING,
      minY: -halfH + CUBE_PADDING,
      maxY: halfH - CUBE_PADDING,
      halfW,
      halfH,
    }
  }, [ortho.left, ortho.right, ortho.top, ortho.bottom, ortho.zoom])

  const raycaster = useMemo(() => new THREE.Raycaster(), [])

  const getMouseNDC = useCallback((event: ThreeEvent<PointerEvent>) => {
    const rect = gl.domElement.getBoundingClientRect()
    const clientX = event.nativeEvent.clientX
    const clientY = event.nativeEvent.clientY
    return new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    )
  }, [gl.domElement])

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    isDragging.current = true
    lastInteractionTime.current = Date.now()
    cubeState.current = 'active'
    applyDamping('active')
    floatProgress.current = 0
    settledDuration.current = 0

    // Reset visual group offset from float
    if (groupRef.current) {
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.rotation.set(0, 0, 0)
    }

    // Bring rigid body back to floor level if it was floating
    if (rigidBodyRef.current) {
      const p = rigidBodyRef.current.translation()
      if (p.z > LIFT_HEIGHT + 0.5) {
        rigidBodyRef.current.setTranslation({ x: p.x, y: p.y, z: LIFT_HEIGHT }, true)
      }
    }

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
      lastInteractionTime.current = Date.now()

      if (rigidBodyRef.current) {
        const maxSpeed = 15
        const vx = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.x))
        const vy = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.current.y))

        const rb = rigidBodyRef.current
        // Proportional release: velocity from drag tracking + gentle drop
        rb.setLinvel({ x: vx, y: vy, z: -2 }, true)
        // Add moderate spin from throw direction
        rb.setAngvel({ x: vy * 2, y: -vx * 2, z: 0 }, true)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [bounds, camera, gl.domElement, raycaster])

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return

    const now = state.clock.elapsedTime
    const pos = rigidBodyRef.current.translation()
    const linvel = rigidBodyRef.current.linvel()
    const angvel = rigidBodyRef.current.angvel()
    const rb = rigidBodyRef.current

    // Always reset state while dragging
    if (isDragging.current) {
      cubeState.current = 'active'
      lastInteractionTime.current = Date.now()
      floatProgress.current = 0
      settledDuration.current = 0
      // Reset visual group offset from float
      if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0)
        groupRef.current.rotation.set(0, 0, 0)
      }
      // Bring rigid body back down if it was floating
      if (pos.z > LIFT_HEIGHT + 0.5) {
        rb.setTranslation({ x: pos.x, y: pos.y, z: LIFT_HEIGHT }, true)
      }
    }

    const linearSpeed = Math.sqrt(linvel.x * linvel.x + linvel.y * linvel.y + linvel.z * linvel.z)
    const angularSpeed = Math.sqrt(angvel.x * angvel.x + angvel.y * angvel.y + angvel.z * angvel.z)

    // --- State machine ---
    const st = cubeState.current

    if (st === 'active' && !isDragging.current) {
      applyDamping('active')

      // Transition to settling when slow enough
      if (linearSpeed < SETTLE_LINEAR_THRESHOLD && angularSpeed < SETTLE_ANGULAR_THRESHOLD) {
        cubeState.current = 'settling'
        applyDamping('settling')
        stateStartTime.current = now
        settledDuration.current = 0
      }
    }

    if (st === 'settling') {
      // If something kicks the cube (e.g. wall bounce), go back to active
      if (linearSpeed > SETTLE_LINEAR_THRESHOLD * 2 || angularSpeed > SETTLE_ANGULAR_THRESHOLD * 2) {
        cubeState.current = 'active'
        applyDamping('active')
      } else {
        // Rapier handles deceleration via high damping — no manual velocity overrides
        applyDamping('settling')

        // Slerp toward nearest flat face only when angular speed is low enough
        // that we won't fight active rotation
        if (angularSpeed < 0.5) {
          const rot = rb.rotation()
          const currentQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
          const alignment = getNearestFaceAlignment(currentQuat)

          // Narrower threshold (30°) with gentle strength
          if (alignment.deviation < Math.PI * (30 / 180)) {
            const strength = alignment.deviation < Math.PI * (10 / 180) ? 0.08 : 0.04
            currentQuat.slerp(alignment.nearestQuaternion, strength)
            rb.setRotation({ x: currentQuat.x, y: currentQuat.y, z: currentQuat.z, w: currentQuat.w }, true)
          }

          // Track how long we've been settled (flat + slow)
          if (alignment.isFlat && linearSpeed < 0.2 && angularSpeed < 0.15) {
            settledDuration.current += delta
          } else {
            settledDuration.current = 0
          }
        } else {
          settledDuration.current = 0
        }

        // Transition to resting if confirmed settled OR timeout
        if (settledDuration.current >= SETTLE_CONFIRM_TIME || (now - stateStartTime.current) > SETTLE_TIMEOUT) {
          cubeState.current = 'resting'
          applyDamping('resting')
        }
      }
    }

    if (st === 'resting') {
      applyDamping('resting')

      // Snap to exact flat orientation and freeze
      const rot = rb.rotation()
      const currentQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
      const alignment = getNearestFaceAlignment(currentQuat)
      const snap = alignment.nearestQuaternion
      rb.setRotation({ x: snap.x, y: snap.y, z: snap.z, w: snap.w }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true)

      // Immediate transition to paused
      cubeState.current = 'paused'
      stateStartTime.current = now
    }

    if (st === 'paused') {
      // Hold position, subtle breathing glow
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true)

      const pauseElapsed = now - stateStartTime.current
      const breathe = 1 + 0.15 * Math.sin(pauseElapsed * 2.5)

      if (materialRef.current) materialRef.current.emissiveIntensity = 2 * breathe
      if (light1Ref.current) light1Ref.current.intensity = 40 * breathe
      if (light2Ref.current) light2Ref.current.intensity = 25 * breathe

      if (pauseElapsed > PAUSE_DURATION) {
        cubeState.current = 'floating'
        stateStartTime.current = now
        floatProgress.current = 0
        floatBaseZ.current = pos.z
      }
    }

    if (st === 'floating') {
      floatProgress.current = Math.min(1, floatProgress.current + delta * IDLE_RISE_SPEED)
      const t = floatProgress.current

      // Move the actual rigid body upward using fixed base position
      const targetZ = floatBaseZ.current + IDLE_HOVER_HEIGHT * t
      const currentZ = pos.z
      const newZ = currentZ + (targetZ - currentZ) * 0.1
      rb.setTranslation({ x: pos.x, y: pos.y, z: newZ }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)

      // Apply gentle rotation via angular velocity (not group rotation)
      rb.setAngvel({
        x: Math.sin(now * 0.7) * 0.15 * t,
        y: Math.cos(now * 0.5) * 0.15 * t,
        z: Math.sin(now * 0.4) * 0.08 * t,
      }, true)

      // Light boost while floating
      const intensity = 1 + (IDLE_LIGHT_BOOST - 1) * t
      if (materialRef.current) materialRef.current.emissiveIntensity = 2 * intensity
      if (light1Ref.current) light1Ref.current.intensity = 40 * intensity
      if (light2Ref.current) light2Ref.current.intensity = 25 * intensity

    }

    // Default light intensity for active/settling states
    if (st === 'active' || st === 'settling') {
      if (materialRef.current) materialRef.current.emissiveIntensity = 2
      if (light1Ref.current) light1Ref.current.intensity = 40
      if (light2Ref.current) light2Ref.current.intensity = 25
    }

    // Scale based on height (all states)
    if (groupRef.current) {
      if (st === 'floating') {
        // During float, scale based on visual offset + idle growth
        const floatScale = 1 + floatProgress.current * 0.5
        groupRef.current.scale.setScalar(floatScale)
      } else {
        const dragScale = Math.min(LIFT_SCALE, 1 + Math.max(0, pos.z / LIFT_HEIGHT) * (LIFT_SCALE - 1))
        groupRef.current.scale.setScalar(dragScale)
      }
    }

    // --- Screen-edge boundary bounce (replaces WorldWalls) ---
    const edgeX = bounds.halfW - CUBE_SIZE / 2
    const edgeY = bounds.halfH - CUBE_SIZE / 2

    if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z)) {
      rb.setTranslation({ x: 0, y: 0, z: 0.5 }, true)
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
      cubeState.current = 'active'
      applyDamping('active')
      if (groupRef.current) {
        groupRef.current.position.set(0, 0, 0)
        groupRef.current.rotation.set(0, 0, 0)
      }
    } else {
      if (Math.abs(pos.x) > edgeX) {
        rb.setTranslation({ x: Math.sign(pos.x) * edgeX, y: pos.y, z: pos.z }, true)
        rb.setLinvel({ x: -linvel.x * 0.6, y: linvel.y, z: linvel.z }, true)
      }
      if (Math.abs(pos.y) > edgeY) {
        const currentPos = rb.translation()
        rb.setTranslation({ x: currentPos.x, y: Math.sign(pos.y) * edgeY, z: currentPos.z }, true)
        rb.setLinvel({ x: rb.linvel().x, y: -linvel.y * 0.6, z: linvel.z }, true)
      }
      // Z ceiling — prevent cube from flying too high above scene
      const maxZ = IDLE_HOVER_HEIGHT + 1.0
      if (pos.z > maxZ && st !== 'floating') {
        const currentPos = rb.translation()
        rb.setTranslation({ x: currentPos.x, y: currentPos.y, z: maxZ }, true)
        const currentVel = rb.linvel()
        rb.setLinvel({ x: currentVel.x, y: currentVel.y, z: -Math.abs(currentVel.z) * 0.3 }, true)
      }
    }

    // Project cube world position to screen percentages for background glow
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
      position={[0, 1.5, 0.5]}
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
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerOver={() => { document.body.style.cursor = 'grab' }}
        onPointerOut={() => { if (!isDragging.current) document.body.style.cursor = 'default' }}
      >
        {/* Main cube - emissive core that triggers Bloom */}
        <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            ref={materialRef}
            color="#fffef5"
            emissive="#fffaf0"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </RoundedBox>

        <InnerLight />

        {/* Viewport-wide point lights — reach every corner, boosted when idle */}
        <pointLight ref={light1Ref} color="#fffaf0" intensity={40} distance={0} decay={0.6} />
        <pointLight ref={light2Ref} color="#ffefd5" intensity={25} distance={0} decay={0.6} />
      </group>
    </RigidBody>
  )
}

// 3D Letter with physics
function Letter3D({
  letter,
  position,
}: {
  letter: string
  position: [number, number, number]
}) {
  return (
    <RigidBody
      position={position}
      type="dynamic"
      mass={3}
      linearDamping={0.8}
      angularDamping={0.8}
      colliders={false}
    >
      <CuboidCollider
        args={[LETTER_SIZE * 0.35, LETTER_SIZE * 0.45, LETTER_HEIGHT / 2]}
        friction={1.2}
        restitution={0.15}
      />

      <Center>
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          size={LETTER_SIZE}
          height={LETTER_HEIGHT}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.012}
          bevelSegments={3}
        >
          {letter}
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.15}
            roughness={0.35}
          />
        </Text3D>
      </Center>
    </RigidBody>
  )
}

// KEINO letters group
function Text3DKeino() {
  const letters = ['K', 'E', 'I', 'N', 'O']
  const totalWidth = letters.length * LETTER_SPACING * 1.1
  const startX = -totalWidth / 2 + LETTER_SPACING / 2

  return (
    <group position={[0, 0, LETTER_HEIGHT / 2]}>
      {letters.map((letter, i) => (
        <Letter3D
          key={letter + i}
          letter={letter}
          position={[startX + i * LETTER_SPACING * 1.1, 0, 0]}
        />
      ))}
    </group>
  )
}

// Invisible ground plane collider
function GroundPlane() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[50, 50, 0.1]}
        position={[0, 0, -0.1]}
        friction={1.2}
        restitution={0.1}
      />
    </RigidBody>
  )
}


// Scene content wrapper
function SceneContent({ onPositionChange }: { onPositionChange?: (pos: { x: number; y: number }) => void }) {
  return (
    <>
      <Physics gravity={[0, 0, -9.8]} timeStep={1/240}>
        <GroundPlane />
        <Text3DKeino />
        <LightCube onPositionChange={onPositionChange} />
      </Physics>

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default function Home() {
  const [lightPos, setLightPos] = useState({ x: 50, y: 25 })

  return (
    <div className="fixed inset-0" style={{ backgroundColor: '#0d0d0f' }}>
      {/* Circular light glow that follows the cube */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,250,240,0.18) 0%, rgba(255,245,230,0.08) 18%, rgba(255,240,220,0.03) 35%, transparent 60%)`
        }}
      />

      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 80, near: 0.1, far: 1000 }}
        style={{ touchAction: 'none', background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.08} />
        <directionalLight color="#ffffff" intensity={0.15} position={[0, 0, 10]} />
        <Suspense fallback={null}>
          <SceneContent onPositionChange={setLightPos} />
        </Suspense>
      </Canvas>
    </div>
  )
}
