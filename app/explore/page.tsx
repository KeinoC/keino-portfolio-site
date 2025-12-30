'use client'

import { Suspense, useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { RoundedBox, Text3D, Center } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { BotCube } from '@/components/3d/BotCube'
import { DropZone } from '@/components/3d/DropZone'
import { Debris } from '@/components/3d/Debris'
import { MarbleFloor } from '@/components/3d/MarbleFloor'
import { WorldWalls } from '@/components/3d/WorldWalls'
import { HomePlatform } from '@/components/3d/HomePlatform'
import { DetailPagePlane } from '@/components/3d/DetailPagePlane'
import { NavButtonGroup3D } from '@/components/3d/ui'
import { COLLISION_CONFIGS, Z_LAYERS } from '@/lib/physics-groups'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import { GlassButton } from '@/components/ui'
import * as THREE from 'three'

// Starting position of the cube in 3D space
const CUBE_START_POS = { x: -2.5, y: 1.5, z: 0.5 }
const CUBE_PADDING = 0.25
const LIFT_HEIGHT = 0.6
const LIFT_SCALE = 1.15
const CUBE_SIZE = 0.4

// Idle animation configuration
const IDLE_DELAY = 1 // seconds before idle animation starts
const IDLE_HOVER_HEIGHT = 3.5 // how high to float when idle (2 units above PAGE_PLANE at 1.5)
const IDLE_RISE_SPEED = 0.5 // how fast to rise (units per second)
const IDLE_ROTATION_SPEED = 0.3 // rotation speed when idle
const IDLE_LIGHT_BOOST = 2.5 // multiplier for light intensity when idle

// Power socket configuration (3D world coordinates)
const SOCKET_SIZE = 0.55 // slightly larger than cube (0.4)

// 3D Text configuration
const LETTER_SIZE = 0.7
const LETTER_HEIGHT = 0.2
const LETTER_SPACING = 0.55

// Pixel Grid Reveal - dark squares grow in to assemble the page
function PixelGridReveal({
  children,
  gridRows = 10
}: {
  children: React.ReactNode
  gridRows?: number
}) {
  const gridCols = Math.round(gridRows * LETTER_RATIO)
  const [phase, setPhase] = useState<'assembling' | 'merging' | 'complete'>('assembling')

  // Generate grid cells with staggered delays
  const cells = useMemo(() => {
    const result = []
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const diagonalIndex = row + col
        const maxDiagonal = (gridRows - 1) + (gridCols - 1)
        const delay = (diagonalIndex / maxDiagonal) * 0.4 // Fast stagger
        result.push({ row, col, delay })
      }
    }
    return result
  }, [gridRows, gridCols])

  useEffect(() => {
    const mergeTimer = setTimeout(() => setPhase('merging'), 600)
    const completeTimer = setTimeout(() => setPhase('complete'), 900)
    return () => {
      clearTimeout(mergeTimer)
      clearTimeout(completeTimer)
    }
  }, [])

  // Once complete, render children directly
  if (phase === 'complete') {
    return <div className="relative w-full h-full">{children}</div>
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent" style={{ perspective: '800px' }}>
      {/* Grid of dark squares that rise up */}
      <div
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          gap: phase === 'merging' ? 0 : 2,
          transition: 'gap 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {cells.map(({ row, col, delay }) => (
          <motion.div
            key={`${row}-${col}`}
            className="relative overflow-hidden"
            style={{ transformStyle: 'preserve-3d' }}
            initial={{
              opacity: 0,
              rotateX: 45,
              y: 20,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              rotateX: 0,
              y: 0,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 150, // Snappier response
              damping: 18, // Soft landing
              mass: 0.8,
              delay: delay,
            }}
          >
            {/* Each cell clips a portion of the content */}
            <div
              className="absolute"
              style={{
                width: `${gridCols * 100}%`,
                height: `${gridRows * 100}%`,
                left: `${-col * 100}%`,
                top: `${-row * 100}%`,
              }}
            >
              {children}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
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

// Draggable light cube with Rapier physics
function LightCube({
  onPositionChange,
  onCursorChange,
  onIdleChange,
  isLocked,
  onUnlock,
  onDock,
  socketPosition,
  onDragStartReady
}: {
  onPositionChange: (x: number, y: number) => void
  onCursorChange: (cursor: 'grab' | 'grabbing' | 'default') => void
  onIdleChange?: (idle: boolean, intensity: number) => void
  isLocked?: boolean
  onUnlock?: () => void
  onDock?: () => void
  socketPosition?: [number, number, number]
  onDragStartReady?: (startDrag: (clientX: number, clientY: number) => void) => void
}) {
  const { viewport, camera, gl } = useThree()
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const isDragging = useRef(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const lastDragPos = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())

  // Idle animation state
  const lastInteractionTime = useRef(Date.now())
  const idleProgress = useRef(0) // 0 = not idle, 1 = fully idle
  const [lightIntensity, setLightIntensity] = useState(1) // multiplier for light intensity

  // Keep props in refs so useFrame always has latest values during scroll
  const socketPosRef = useRef(socketPosition)
  const isLockedRef = useRef(isLocked)
  const onDockRef = useRef(onDock)
  useEffect(() => {
    socketPosRef.current = socketPosition
  }, [socketPosition])
  useEffect(() => {
    isLockedRef.current = isLocked
  }, [isLocked])
  useEffect(() => {
    onDockRef.current = onDock
  }, [onDock])

  const bounds = useMemo(() => ({
    minX: -viewport.width / 2 + CUBE_PADDING,
    maxX: viewport.width / 2 - CUBE_PADDING,
    minY: -viewport.height / 2 + CUBE_PADDING,
    maxY: viewport.height / 2 - CUBE_PADDING
  }), [viewport.width, viewport.height])

  const toScreenPercent = useCallback((wx: number, wy: number) => ({
    x: ((wx + viewport.width / 2) / viewport.width) * 100,
    y: ((-wy + viewport.height / 2) / viewport.height) * 100
  }), [viewport.width, viewport.height])

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
    onCursorChange('grabbing')

    // Unlock if locked in socket
    if (isLocked && onUnlock) {
      onUnlock()
    }

    // Reset idle state when user interacts
    lastInteractionTime.current = Date.now()
    idleProgress.current = 0

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
  }, [camera, getMouseNDC, onCursorChange, raycaster, isLocked, onUnlock])

  // Start drag from DOM hitbox (called from outside the canvas)
  const startDragFromDOM = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true
    onCursorChange('grabbing')

    // Unlock if locked in socket
    if (isLocked && onUnlock) {
      onUnlock()
    }

    // Reset idle state when user interacts
    lastInteractionTime.current = Date.now()
    idleProgress.current = 0

    if (rigidBodyRef.current) {
      rigidBodyRef.current.wakeUp()
      const pos = rigidBodyRef.current.translation()
      dragPlane.current.constant = -(pos.z + LIFT_HEIGHT)

      // Convert client coords to NDC
      const rect = gl.domElement.getBoundingClientRect()
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      )
      raycaster.setFromCamera(mouse, camera)
      const intersectPoint = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane.current, intersectPoint)

      dragOffset.current.set(pos.x - intersectPoint.x, pos.y - intersectPoint.y, 0)
      lastDragPos.current.set(pos.x, pos.y, pos.z + LIFT_HEIGHT)
      velocity.current.set(0, 0, 0)
    }
  }, [camera, gl.domElement, onCursorChange, raycaster, isLocked, onUnlock])

  // Expose startDragFromDOM to parent component
  useEffect(() => {
    onDragStartReady?.(startDragFromDOM)
  }, [onDragStartReady, startDragFromDOM])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging.current || !rigidBodyRef.current) return

      const mouse = getMouseNDC(event)
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
      onCursorChange('grab')

      // Reset interaction time when user releases
      lastInteractionTime.current = Date.now()

      if (rigidBodyRef.current) {
        rigidBodyRef.current.setLinvel({
          x: velocity.current.x,
          y: velocity.current.y,
          z: 0
        }, true)

        rigidBodyRef.current.setAngvel({
          x: velocity.current.y * 2,
          y: -velocity.current.x * 2,
          z: (Math.random() - 0.5) * 3
        }, true)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [bounds, camera, getMouseNDC, onCursorChange, raycaster])

  useFrame((state, delta) => {
    if (rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation()
      const linvel = rigidBodyRef.current.linvel()

      // Snap to socket when locked - use refs for latest values during scroll
      if (isLockedRef.current && socketPosRef.current && !isDragging.current) {
        rigidBodyRef.current.setTranslation(
          { x: socketPosRef.current[0], y: socketPosRef.current[1], z: CUBE_SIZE / 2 + 0.02 },
          true
        )
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        // Reset rotation to upright
        rigidBodyRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
      }

      // Proximity-based docking detection - check if cube is close to socket
      // Only dock when NOT dragging (so user can pull cube out of socket)
      if (!isLockedRef.current && !isDragging.current && socketPosRef.current && onDockRef.current) {
        const socketPos = socketPosRef.current
        const dx = pos.x - socketPos[0]
        const dy = pos.y - socketPos[1]
        const distanceXY = Math.sqrt(dx * dx + dy * dy)
        const dockRadius = SOCKET_SIZE * 0.6 // Docking radius

        // If close enough to socket center and moving slowly, trigger dock
        const speed = Math.sqrt(linvel.x * linvel.x + linvel.y * linvel.y)
        if (distanceXY < dockRadius && speed < 0.5) {
          onDockRef.current()
        }
      }

      const screenPos = toScreenPercent(pos.x, pos.y)
      onPositionChange(
        Math.max(0, Math.min(100, screenPos.x)),
        Math.max(0, Math.min(100, screenPos.y))
      )

      // Check if cube is moving - only when NOT already in idle animation
      // (otherwise our applied rotation triggers the movement check)
      if (idleProgress.current === 0) {
        const horizontalSpeed = Math.sqrt(linvel.x * linvel.x + linvel.y * linvel.y)
        const angvel = rigidBodyRef.current.angvel()
        const rotationSpeed = Math.sqrt(angvel.x * angvel.x + angvel.y * angvel.y + angvel.z * angvel.z)
        const isMoving = horizontalSpeed > 0.3 || rotationSpeed > 0.5

        // If moving, reset interaction time
        if (isMoving) {
          lastInteractionTime.current = Date.now()
        }
      }

      // Always reset if dragging
      if (isDragging.current) {
        lastInteractionTime.current = Date.now()
      }

      // Check if idle for long enough - NOT when locked in socket
      const timeSinceInteraction = (Date.now() - lastInteractionTime.current) / 1000
      const shouldBeIdle = timeSinceInteraction > IDLE_DELAY && !isDragging.current && !isLockedRef.current

      // Smoothly transition idle progress
      if (shouldBeIdle) {
        idleProgress.current = Math.min(1, idleProgress.current + delta * IDLE_RISE_SPEED)
      } else {
        idleProgress.current = Math.max(0, idleProgress.current - delta * 2) // Quick reset when touched
      }

      // Apply idle animation when progress > 0 - NOT when locked
      if (idleProgress.current > 0 && !isDragging.current && !isLockedRef.current) {
        // Target height for idle hover
        const targetZ = IDLE_HOVER_HEIGHT * idleProgress.current
        const currentZ = pos.z

        // Directly set position - faster interpolation to overcome gravity
        const newZ = currentZ + (targetZ - currentZ) * 0.1
        rigidBodyRef.current.setTranslation({ x: pos.x, y: pos.y, z: newZ }, true)

        // Kill all velocity to prevent physics from fighting the lift
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)

        // Apply gentle rotation
        const time = state.clock.elapsedTime
        const rotationIntensity = idleProgress.current * IDLE_ROTATION_SPEED
        rigidBodyRef.current.setAngvel({
          x: Math.sin(time * 0.5) * rotationIntensity,
          y: Math.cos(time * 0.3) * rotationIntensity,
          z: Math.sin(time * 0.7) * rotationIntensity * 0.5
        }, true)

        // Update light intensity based on idle progress
        const newIntensity = 1 + (IDLE_LIGHT_BOOST - 1) * idleProgress.current
        setLightIntensity(newIntensity)
        onIdleChange?.(true, idleProgress.current)
      } else if (idleProgress.current === 0 && lightIntensity !== 1) {
        // Reset light intensity when not idle
        setLightIntensity(1)
        onIdleChange?.(false, 0)
      }

      if (groupRef.current) {
        // Scale includes both lift-from-drag and idle hover
        const dragScale = 1 + Math.max(0, pos.z / LIFT_HEIGHT) * (LIFT_SCALE - 1)
        const idleScale = 1 + idleProgress.current * 0.1 // Slight scale increase when idle
        groupRef.current.scale.setScalar(Math.max(dragScale, idleScale))
      }
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[CUBE_START_POS.x, CUBE_START_POS.y, CUBE_START_POS.z]}
      colliders={false}
      mass={0.3}
      restitution={0.4}
      friction={0.6}
      linearDamping={1.5}
      angularDamping={1.2}
      collisionGroups={COLLISION_CONFIGS.cube}
    >
      <CuboidCollider args={[CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2]} />

      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerOver={() => !isDragging.current && onCursorChange('grab')}
        onPointerOut={() => !isDragging.current && onCursorChange('default')}
      >
        {/* Invisible touch area - slightly larger than cube */}
        <mesh visible={false}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Main cube - emissive core that triggers Bloom */}
        <RoundedBox args={[0.4, 0.4, 0.4]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color="#fffef5"
            emissive="#fffaf0"
            emissiveIntensity={2 * lightIntensity}
            toneMapped={false}
          />
        </RoundedBox>

        <InnerLight />

        {/* Strong omnidirectional point light for 360° illumination */}
        <pointLight color="#fffaf0" intensity={40 * lightIntensity} distance={20 + (lightIntensity - 1) * 10} decay={1.5} />
        <pointLight color="#ffefd5" intensity={25 * lightIntensity} distance={15 + (lightIntensity - 1) * 8} decay={1.8} />
      </group>
    </RigidBody>
  )
}

// 3D Letter with physics - catches light naturally from cube's point lights
function Letter3D({
  letter,
  position,
}: {
  letter: string
  position: [number, number, number]
}) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  // Position is passed in with correct z for sitting on platform
  // Parent groups handle the platform surface offset
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      type="dynamic"
      mass={80}
      restitution={0.15}
      friction={1.2}
      linearDamping={3}
      angularDamping={3}
      colliders={false}
      collisionGroups={COLLISION_CONFIGS.letters}
    >
      {/* Collider sized to match visual - half-extents for x, y, z */}
      <CuboidCollider args={[LETTER_SIZE * 0.35, LETTER_SIZE * 0.45, LETTER_HEIGHT / 2]} />

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
          {/* Standard material - faces toward cube light up, faces away stay dark */}
          <meshStandardMaterial
            color="#151515"
            metalness={0.15}
            roughness={0.35}
          />
        </Text3D>
      </Center>
    </RigidBody>
  )
}

// 3D KEINO text group (with physics - for collision with cube)
function Text3DKeino() {
  const letters = ['K', 'E', 'I', 'N', 'O']
  const totalWidth = letters.length * LETTER_SPACING * 1.1
  const startX = -totalWidth / 2 + LETTER_SPACING / 2

  // Letters sit on the platform surface - z=0 is already the surface thanks to HomePlatform
  // Each letter needs z = LETTER_HEIGHT/2 to sit with its bottom on the surface
  return (
    <group>
      {letters.map((letter, i) => (
        <Letter3D
          key={letter + i}
          letter={letter}
          position={[startX + i * LETTER_SPACING * 1.1, 0, LETTER_HEIGHT / 2 + 0.01]}
        />
      ))}
    </group>
  )
}

// Glossy subtitle text - static, no physics
function SubtitleText3D() {
  return (
    <group position={[0, -0.7, 0.01]}>
      <Center position={[0, 0, 0]}>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.12} height={0.015} curveSegments={6} bevelEnabled bevelThickness={0.002} bevelSize={0.001} bevelSegments={2}>
          A Selected Works Portfolio
          <meshStandardMaterial color="#151515" metalness={0.3} roughness={0.25} />
        </Text3D>
      </Center>
      <Center position={[0, -0.25, 0]}>
        <Text3D font="/fonts/helvetiker_bold.typeface.json" size={0.08} height={0.01} curveSegments={6} bevelEnabled bevelThickness={0.001} bevelSize={0.001} bevelSegments={2}>
          Software Engineer
          <meshStandardMaterial color="#151515" metalness={0.3} roughness={0.25} />
        </Text3D>
      </Center>
    </group>
  )
}

// Note: Floor and Walls are now imported from components/3d/MarbleFloor and components/3d/WorldWalls

// BACKUP: Embossed wave texture v1
// function MarbleBackgroundV1() {
//   return (
//     <div className="absolute inset-0" style={{ backgroundColor: '#f5f3f0' }}>
//       <svg className="absolute inset-0 w-full h-full">
//         <defs>
//           <filter id="wave-texture-v1" x="0%" y="0%" width="100%" height="100%">
//             <feTurbulence type="turbulence" baseFrequency="0.006 0.002" numOctaves="3" seed="5" result="turbulence" />
//             <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" in="turbulence" result="grayscale" />
//             <feComponentTransfer in="grayscale" result="contrast">
//               <feFuncR type="linear" slope="1.8" intercept="-0.4" />
//               <feFuncG type="linear" slope="1.8" intercept="-0.4" />
//               <feFuncB type="linear" slope="1.8" intercept="-0.4" />
//             </feComponentTransfer>
//             <feDiffuseLighting in="contrast" lightingColor="#ffffff" surfaceScale="6" diffuseConstant="0.9" result="light">
//               <feDistantLight azimuth="225" elevation="50" />
//             </feDiffuseLighting>
//             <feBlend in="light" in2="SourceGraphic" mode="multiply" />
//           </filter>
//         </defs>
//         <rect width="100%" height="100%" fill="#f8f6f3" filter="url(#wave-texture-v1)" />
//       </svg>
//       <div className="absolute inset-0 opacity-15" style={{ background: 'linear-gradient(135deg, rgba(255,252,248,0.6) 0%, rgba(248,244,238,0.4) 100%)' }} />
//       <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.06) 100%)' }} />
//     </div>
//   )
// }

// Plaster wall texture background using image
function MarbleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#f0efed' }}>
      {/* Plaster texture image - scaled up slightly to crop out watermark */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/plaster-bg.png)',
          backgroundSize: '110% 110%',
          backgroundPosition: 'top left',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Soft vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.04) 100%)' }} />
    </div>
  )
}

// DOM Hitbox for cube drag - follows cube's screen position
function CubeHitbox({
  screenPos,
  onDragStart,
  isDragging,
  size = 80
}: {
  screenPos: { x: number; y: number }
  onDragStart: (clientX: number, clientY: number) => void
  isDragging: boolean
  size?: number
}) {
  return (
    <div
      className="fixed z-[30] pointer-events-auto"
      style={{
        width: size,
        height: size,
        left: `${screenPos.x}%`,
        top: `${screenPos.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        // Debug: visible hitbox
        backgroundColor: 'rgba(0, 255, 0, 0.3)',
        border: '2px solid lime',
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDragStart(e.clientX, e.clientY)
      }}
    />
  )
}


// 3D Power socket - dark recessed square that cube docks into
// Visual-only socket component (no physics - sensor is in main Physics element)
function PowerSocket3D({
  position,
  isDocked
}: {
  position: [number, number, number]
  isDocked: boolean
}) {
  const [pulseIntensity, setPulseIntensity] = useState(0)

  // Pulsing animation for the indicator
  useFrame((state) => {
    const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2
    setPulseIntensity(pulse)
  })

  const halfSize = SOCKET_SIZE / 2

  return (
    <group position={position}>

      {/* Dark hole visual - sits at floor level */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[SOCKET_SIZE, SOCKET_SIZE]} />
        <meshBasicMaterial color="#020204" />
      </mesh>

      {/* Inner shadow gradient to fake depth */}
      <mesh position={[0, 0, 0.006]}>
        <planeGeometry args={[SOCKET_SIZE * 0.9, SOCKET_SIZE * 0.9]} />
        <meshBasicMaterial color="#010102" />
      </mesh>

      {/* Glowing rim border */}
      {/* Top edge */}
      <mesh position={[0, halfSize + 0.015, 0.01]}>
        <planeGeometry args={[SOCKET_SIZE + 0.06, 0.03]} />
        <meshBasicMaterial
          color={isDocked ? "#ffcc66" : "#3366aa"}
          transparent
          opacity={isDocked ? 0.9 : 0.3 + pulseIntensity * 0.4}
        />
      </mesh>
      {/* Bottom edge */}
      <mesh position={[0, -halfSize - 0.015, 0.01]}>
        <planeGeometry args={[SOCKET_SIZE + 0.06, 0.03]} />
        <meshBasicMaterial
          color={isDocked ? "#ffcc66" : "#3366aa"}
          transparent
          opacity={isDocked ? 0.9 : 0.3 + pulseIntensity * 0.4}
        />
      </mesh>
      {/* Left edge */}
      <mesh position={[-halfSize - 0.015, 0, 0.01]}>
        <planeGeometry args={[0.03, SOCKET_SIZE + 0.06]} />
        <meshBasicMaterial
          color={isDocked ? "#ffcc66" : "#3366aa"}
          transparent
          opacity={isDocked ? 0.9 : 0.3 + pulseIntensity * 0.4}
        />
      </mesh>
      {/* Right edge */}
      <mesh position={[halfSize + 0.015, 0, 0.01]}>
        <planeGeometry args={[0.03, SOCKET_SIZE + 0.06]} />
        <meshBasicMaterial
          color={isDocked ? "#ffcc66" : "#3366aa"}
          transparent
          opacity={isDocked ? 0.9 : 0.3 + pulseIntensity * 0.4}
        />
      </mesh>

      {/* Corner accents */}
      {[
        [-halfSize - 0.03, halfSize + 0.03],
        [halfSize + 0.03, halfSize + 0.03],
        [-halfSize - 0.03, -halfSize - 0.03],
        [halfSize + 0.03, -halfSize - 0.03],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.011]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial
            color={isDocked ? "#ffdd88" : "#4488cc"}
            transparent
            opacity={isDocked ? 1 : 0.5 + pulseIntensity * 0.4}
          />
        </mesh>
      ))}

      {/* Center indicator dot */}
      <mesh position={[0, 0, 0.008]}>
        <circleGeometry args={[0.04, 12]} />
        <meshBasicMaterial
          color={isDocked ? "#ffeeaa" : "#4488cc"}
          transparent
          opacity={isDocked ? 0.9 : 0.2 + pulseIntensity * 0.3}
        />
      </mesh>

      {/* Glow when docked */}
      {isDocked && (
        <pointLight
          position={[0, 0, 0.3]}
          color="#ffeecc"
          intensity={2}
          distance={3}
          decay={2}
        />
      )}
    </group>
  )
}

// Power Channel - Glowing channel from socket to groove (replaces wire)
function PowerChannel({
  startPos,
  endPos,
  isPowered
}: {
  startPos: [number, number, number]
  endPos: [number, number, number]
  isPowered: boolean
}) {
  const channelHeight = Math.abs(startPos[1] - endPos[1])
  const channelWidth = 0.06
  const channelDepth = 0.03
  const centerY = (startPos[1] + endPos[1]) / 2

  // Animated glow intensity
  const glowRef = useRef(0)

  useFrame((_, delta) => {
    const target = isPowered ? 1 : 0.15
    glowRef.current += (target - glowRef.current) * 3 * delta
  })

  return (
    <group position={[startPos[0], centerY, 0.01]}>
      {/* Channel groove carved into page surface */}
      <RoundedBox args={[channelWidth, channelHeight + 0.1, channelDepth]} radius={0.01} smoothness={4}>
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} />
      </RoundedBox>

      {/* Glowing energy core */}
      <mesh position={[0, 0, channelDepth / 4]}>
        <boxGeometry args={[channelWidth * 0.5, channelHeight, channelDepth * 0.3]} />
        <meshStandardMaterial
          color={isPowered ? '#00ffff' : '#004455'}
          emissive={isPowered ? '#00ffff' : '#002233'}
          emissiveIntensity={isPowered ? 2.5 : 0.3}
          transparent
          opacity={isPowered ? 0.85 : 0.4}
        />
      </mesh>

      {/* Subtle outer glow when powered */}
      {isPowered && (
        <pointLight
          position={[0, 0, 0.05]}
          color="#00ffff"
          intensity={2}
          distance={0.8}
          decay={2}
        />
      )}
    </group>
  )
}

// Animated socket light - emanates from socket position when powered
function PoweredLighting({ isPowered, socketPosition }: { isPowered: boolean; socketPosition: [number, number, number] }) {
  const pointLightRef = useRef<THREE.PointLight>(null)
  const fillLightRef = useRef<THREE.PointLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const intensity = useRef({ point: 0, fill: 0, ambient: 0 })

  useFrame((_, delta) => {
    // Smoothly interpolate toward target
    const target = isPowered
      ? { point: 60, fill: 25, ambient: 0.08 }  // Strong point light from socket
      : { point: 0, fill: 0, ambient: 0 }
    const speed = 2.5

    intensity.current.point += (target.point - intensity.current.point) * speed * delta
    intensity.current.fill += (target.fill - intensity.current.fill) * speed * delta
    intensity.current.ambient += (target.ambient - intensity.current.ambient) * speed * delta

    if (pointLightRef.current) {
      pointLightRef.current.intensity = intensity.current.point
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = intensity.current.fill
    }
    if (ambientRef.current) {
      ambientRef.current.intensity = intensity.current.ambient
    }
  })

  return (
    <>
      {/* Main light from socket - warm and strong */}
      <pointLight
        ref={pointLightRef}
        position={[socketPosition[0], socketPosition[1], 2]}
        color="#fff8e0"
        intensity={0}
        distance={15}
        decay={1.5}
      />
      {/* Secondary fill light - softer, helps illuminate far areas */}
      <pointLight
        ref={fillLightRef}
        position={[socketPosition[0] - 2, socketPosition[1] - 1, 3]}
        color="#fffaf5"
        intensity={0}
        distance={12}
        decay={2}
      />
      {/* Subtle ambient to lift shadows */}
      <ambientLight ref={ambientRef} intensity={0} color="#fffef8" />
    </>
  )
}

// Camera controller - smoothly updates zoom
function CameraController({ targetZoom }: { targetZoom: number }) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    if ('zoom' in camera) {
      const orthoCam = camera as THREE.OrthographicCamera
      // Smooth interpolation toward target zoom
      orthoCam.zoom += (targetZoom - orthoCam.zoom) * Math.min(1, delta * 5)
      orthoCam.updateProjectionMatrix()
    }
  })

  return null
}

// Scene content wrapper
function SceneContent({
  onPositionChange,
  onCursorChange,
  onDockedChange,
  onIdleChange,
  isLocked,
  onUnlock,
  isPowered,
  narrowProgress,
  onNavigate,
  onDragStartReady,
  pageScale,
  homePageSlidePixels,
  cameraZoom,
  activePage,
  scrollProgress,
}: {
  onPositionChange: (x: number, y: number) => void
  onCursorChange: (cursor: 'grab' | 'grabbing' | 'default') => void
  onDockedChange: (docked: boolean) => void
  onIdleChange: (idle: boolean, intensity: number) => void
  isLocked: boolean
  onUnlock: () => void
  isPowered: boolean
  narrowProgress: number
  onNavigate: (page: string) => void
  onDragStartReady?: (startDrag: (clientX: number, clientY: number) => void) => void
  pageScale: number
  homePageSlidePixels: number
  cameraZoom: number
  activePage: string | null
  scrollProgress: number
}) {
  const { viewport, size } = useThree()
  const [isDocked, setIsDocked] = useState(false)

  // Handle docking state change - update local state and notify parent
  const handleDockedChange = useCallback((docked: boolean) => {
    setIsDocked(docked)
    onDockedChange(docked)
  }, [onDockedChange])

  // Convert pixel slide to 3D units
  const pixelToWorld = viewport.width / size.width
  const homePageSlide3D = homePageSlidePixels * pixelToWorld

  // Calculate how much the visible edge has moved inward in 3D units
  const letterWidth = viewport.height * LETTER_RATIO
  const edgeInset = ((viewport.width - letterWidth) / 2) * narrowProgress

  // Groove positioning: spans from bottom of viewport to just below socket
  // Socket sits at the top right, groove extends all the way down to bottom edge
  const SOCKET_MARGIN_TOP = 0.4  // Socket distance from top edge
  const GROOVE_GAP = 0.15        // Small gap between socket bottom and groove top
  const GROOVE_MARGIN_BOTTOM = 0.1  // Small margin from bottom edge

  // Socket position - top right of visible area
  const socketPosition: [number, number, number] = [
    (viewport.width / 2 - edgeInset) - 0.5,  // Near right visible edge
    viewport.height / 2 - SOCKET_MARGIN_TOP - SOCKET_SIZE / 2,  // Near top
    0
  ]

  // Calculate groove dimensions to span from socket to bottom
  const grooveTop = socketPosition[1] - SOCKET_SIZE / 2 - GROOVE_GAP
  const grooveBottom = -viewport.height / 2 + GROOVE_MARGIN_BOTTOM
  const grooveHeight = grooveTop - grooveBottom
  const grooveCenterY = (grooveTop + grooveBottom) / 2

  // Position groove centered between its top and bottom (z=0 to be flush with page surface)
  const groovePosition: [number, number, number] = [
    socketPosition[0],  // Same x as socket
    grooveCenterY,
    0  // Flush with page surface
  ]

  // Power channel endpoints (connects socket bottom to groove top)
  const channelStart: [number, number, number] = [
    socketPosition[0],
    socketPosition[1] - SOCKET_SIZE / 2,
    0.01  // Slightly in front of page
  ]
  const channelEnd: [number, number, number] = [
    groovePosition[0],
    grooveTop,
    0.01
  ]

  // Calculate world-space socket position for cube docking (accounts for page slide and scale)
  const worldSocketPosition: [number, number, number] = [
    socketPosition[0] * pageScale + homePageSlide3D,
    socketPosition[1] * pageScale,
    0
  ]

  return (
    <>
      {/* Camera zoom controller */}
      <CameraController targetZoom={cameraZoom} />

      {/* DEBUG: Test clickable mesh at center of screen */}
      <mesh
        position={[0, 0, 1]}
        onClick={() => {
          console.log('DEBUG TEST BUTTON CLICKED!')
          onNavigate('WORK') // Test navigation
        }}
      >
        <boxGeometry args={[1, 1, 0.2]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* DEBUG: Test nav button at fixed visible position */}
      <mesh
        position={[2, 0, 1]}
        onClick={() => {
          console.log('DEBUG SIDE BUTTON CLICKED - ABOUT!')
          onNavigate('ABOUT')
        }}
      >
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshBasicMaterial color="#0088ff" />
      </mesh>

      {/* Unified physics world - everything in a single context */}
      <Physics gravity={[0, 0, -9.8]}>
        {/* World foundation - only visible in later scroll phase */}
        {scrollProgress > 0.6 && <MarbleFloor />}
        {scrollProgress > 0.6 && <WorldWalls />}

        {/* Home Platform - visible in early scroll, hidden when marble floor appears */}
        {scrollProgress <= 0.6 && (
          <HomePlatform scale={pageScale} slideX={homePageSlide3D} showVisual={false}>
            {/* KEINO letters with physics - can be knocked off platform */}
            <Text3DKeino />

            {/* Static subtitle - no physics */}
            <SubtitleText3D />
          </HomePlatform>
        )}

        {/* UI elements that scale/slide with platform but are outside physics */}
        {/* Scale first, then slide (matching DOM order) - slideX divided by scale for local coords */}
        <group scale={pageScale}>
          <group position={[homePageSlide3D / pageScale, 0, 0]}>
          {/* Light emanating from socket when powered */}
          <PoweredLighting isPowered={isPowered} socketPosition={socketPosition} />

          {/* Power channel from socket to groove (replaces wire) */}
          <PowerChannel startPos={channelStart} endPos={channelEnd} isPowered={isPowered} />

          {/* Nav buttons - directly on page surface */}
          {/* DEBUG: Log groove position */}
          {console.log('NAV BUTTONS DEBUG:', {
            groovePosition,
            grooveHeight,
            startY: grooveHeight / 2 - 0.5,
            isPowered,
            activePage,
            pageScale,
            homePageSlide3D,
          })}

          {/* DEBUG: Marker at groove position to verify location */}
          <mesh position={[groovePosition[0], groovePosition[1], 0.5]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>

          <NavButtonGroup3D
            position={groovePosition}
            items={[
              { id: 'WORK' },
              { id: 'ABOUT' },
              { id: 'CONTACT' },
            ]}
            activeId={activePage}
            isPowered={isPowered}
            onNavigate={onNavigate}
            spacing={0.75}
            startY={grooveHeight / 2 - 0.5}
          />

          {/* Socket visual (sensor is separate for world-space detection) */}
          <PowerSocket3D position={socketPosition} isDocked={isDocked} />
          </group>
        </group>

        {/* Light Cube - roams freely across entire scene */}
        {/* Uses proximity-based docking detection instead of sensor */}
        <LightCube
          onPositionChange={onPositionChange}
          onCursorChange={onCursorChange}
          onIdleChange={onIdleChange}
          isLocked={isLocked}
          onUnlock={onUnlock}
          onDock={() => handleDockedChange(true)}
          socketPosition={worldSocketPosition}
          onDragStartReady={onDragStartReady}
        />

        {/* Bot Cube Cleanup System - only visible when marble floor is active */}
        {scrollProgress > 0.6 && (
          <>
            <BotCube
              startPosition={[-viewport.width / 2 + 1.5, -viewport.height / 2 + 1.5, 0.15]}
              targetZone={{
                position: [viewport.width / 2 - 1.5, -viewport.height / 2 + 1, 0.15],
                size: [1.5, 1.5]
              }}
              onTaskComplete={() => console.log('Bot cleaned an item!')}
            />

            {/* Drop Zone - bottom right on marble floor */}
            <DropZone
              position={[viewport.width / 2 - 1.5, -viewport.height / 2 + 1, 0.15]}
              size={[1.5, 1.5]}
            />

            {/* Scattered debris for bot to clean - positioned on marble floor */}
            {/* Bot operates at floor level, debris should be on the marble surface */}
            <Debris position={[-3.0, 2.0, 0.15]} id="debris-1" color="#cc5555" />
            <Debris position={[3.0, 2.0, 0.15]} id="debris-2" color="#55cc55" />
            <Debris position={[-3.0, -2.0, 0.15]} id="debris-3" color="#5555cc" />
            <Debris position={[3.0, -2.0, 0.15]} id="debris-4" color="#cccc55" />
          </>
        )}

        {/* Detail page plane - cube bounces off this when a detail page is open */}
        <DetailPagePlane
          visible={activePage !== null}
          position={[viewport.width / 2 + 3, 0, Z_LAYERS.PAGE_PLANE]}
          width={viewport.width * 0.6}
          height={viewport.height * 0.9}
          slideDistance={viewport.width / 2}
        />
      </Physics>

      {/* Bloom effect for soft glow */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      {/* TEST: Nav buttons OUTSIDE Physics - at fixed center position for testing */}
      <group position={[-1, 0, 0.5]}>
        <NavButtonGroup3D
          position={[0, 0, 0]}
          items={[
            { id: 'WORK' },
            { id: 'ABOUT' },
            { id: 'CONTACT' },
          ]}
          activeId={activePage}
          isPowered={true}  // Force powered for testing
          onNavigate={onNavigate}
          spacing={0.75}
          startY={0.75}
        />
      </group>
    </>
  )
}

// Letter size aspect ratio (width / height)
const LETTER_RATIO = 8.5 / 11 // 0.773

export default function ExplorePage() {
  const [lightPos, setLightPos] = useState({ x: 20, y: 10 })
  // Cursor state is managed via callbacks but value unused at this level
  const [, setCursor] = useState<'grab' | 'grabbing' | 'default'>('default')
  const [isPowered, setIsPowered] = useState(false) // true when cube is providing power
  const [isLocked, setIsLocked] = useState(false) // true when cube is locked in socket
  const [isIdle, setIsIdle] = useState(false) // true when cube is floating/idle
  const [idleIntensity, setIdleIntensity] = useState(0) // 0-1 how intense the idle glow is

  // DOM hitbox drag system
  const [isDraggingCube, setIsDraggingCube] = useState(false)
  const cubeDragStartRef = useRef<((clientX: number, clientY: number) => void) | null>(null)

  const handleCubeDragStartReady = useCallback((startDrag: (clientX: number, clientY: number) => void) => {
    cubeDragStartRef.current = startDrag
  }, [])

  const handleCubeHitboxDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDraggingCube(true)
    cubeDragStartRef.current?.(clientX, clientY)
  }, [])

  // Reset dragging state on pointer up
  useEffect(() => {
    const handlePointerUp = () => setIsDraggingCube(false)
    window.addEventListener('pointerup', handlePointerUp)
    return () => window.removeEventListener('pointerup', handlePointerUp)
  }, [])

  // Track viewport dimensions for aspect ratio calculations
  const [viewport, setViewport] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Scroll progress tracking (0 to 1) via wheel events
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollProgressRef = useRef(0) // For smooth updates

  // Handle wheel events for zoom parallax
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * 0.001 // Adjust sensitivity
    const newProgress = Math.max(0, Math.min(1, scrollProgressRef.current + delta))
    scrollProgressRef.current = newProgress
    setScrollProgress(newProgress)
  }, [])

  // Attach wheel listener to window
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // Two-phase scroll animation:
  // Phase 1 (0-50%): Narrow width from viewport to letter proportions, scale stays 1
  // Phase 2 (50-100%): Scale down from 1 to 0.35, dimensions stay letter proportions

  const letterWidth = viewport.height * LETTER_RATIO

  // Phase 1: Width narrows via clip-path (0% -> 50% scroll)
  // Using clip-path instead of changing dimensions keeps the 3D scene stable
  const narrowProgress = Math.min(1, scrollProgress * 2) // 0 -> 1 during first half
  const clipInset = ((viewport.width - letterWidth) / 2) * narrowProgress // pixels to clip from each side
  const sheetWidth = viewport.width // Always full width
  const sheetHeight = viewport.height // Always full height

  // Phase 2: Scale down (50% -> 100% scroll)
  const scaleProgress = Math.max(0, (scrollProgress - 0.5) * 2) // 0 -> 1 during second half
  const scale = 1 - scaleProgress * 0.2 // 1 -> 0.8 (80vh final size)

  // Camera zoom: Phase 1 zooms out (80 -> 60), Phase 2 stays at 60
  const zoomProgress = Math.min(1, scrollProgress * 2) // 0 -> 1 during first half
  const cameraZoom = 80 - zoomProgress * 20 // 80 -> 60

  // Visual effects tied to phases
  const sheetBorderOpacity = Math.min(1, scrollProgress * 2) // 0 -> 1 as scroll progresses
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollProgress / 0.1) // 1 -> 0 by 10%

  // Calculate visual content width for gap compensation
  const visualContentWidth = (viewport.width - 2 * clipInset) * scale
  // How much empty space exists in each wrapper (split between left and right)
  const wrapperPadding = (viewport.width - visualContentWidth) / 2
  // Negative margin to pull pages together so visual gap = 24px
  const gapCompensation = -wrapperPadding

  const handlePositionChange = useCallback((x: number, y: number) => {
    setLightPos({ x, y })
  }, [])

  const handleDockedChange = useCallback((docked: boolean) => {
    // Only turn power ON when docked - don't turn it off on sensor glitches
    if (docked) {
      setIsPowered(true)
      setIsLocked(true)
    }
  }, [])

  const handleUnlock = useCallback(() => {
    setIsLocked(false)
    setIsPowered(false) // Power only turns off when user grabs the cube
  }, [])

  // Navigation state - which page is open (null = home only)
  const [activePage, setActivePage] = useState<string | null>(null)

  const handleNavigate = useCallback((page: string) => {
    setActivePage(prev => prev === page ? null : page) // Toggle if same page clicked
  }, [])

  // Note: activePage state persists across scroll - user must click BACK to close

  const handleIdleChange = useCallback((idle: boolean, intensity: number) => {
    setIsIdle(idle)
    setIdleIntensity(intensity)
  }, [])

  return (
    <>
      {/* SVG filters */}
      <svg className="hidden">
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <filter id="paper-texture">
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Marble/plaster background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MarbleBackground />
      </div>

      {/* 3D Canvas - full screen */}
      {/* Pointer events enabled when scrolled out OR no page active, disabled when page is visible */}
      {/* This allows nav buttons to work in zoomed-out view even with state persisted */}
      <div className={`fixed inset-0 z-20 ${activePage && scrollProgress > 0.3 ? 'pointer-events-none' : ''}`}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 100], zoom: 80, near: 0.1, far: 1000 }}
          style={{ touchAction: 'none', background: 'transparent', pointerEvents: 'auto' }}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => console.log('Canvas: pointer missed (clicked but no object hit)')}
          onClick={() => console.log('Canvas: raw onClick')}
        >
          <ambientLight intensity={0.02} />
          <Suspense fallback={null}>
            <SceneContent
              onPositionChange={handlePositionChange}
              onCursorChange={setCursor}
              onDockedChange={handleDockedChange}
              onIdleChange={handleIdleChange}
              isLocked={isLocked}
              onUnlock={handleUnlock}
              isPowered={isPowered}
              narrowProgress={narrowProgress}
              onNavigate={handleNavigate}
              onDragStartReady={handleCubeDragStartReady}
              pageScale={scale}
              homePageSlidePixels={activePage ? -(visualContentWidth / 2 + 12) : 0}
              cameraZoom={cameraZoom}
              activePage={activePage}
              scrollProgress={scrollProgress}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Horizontal sliding container for pages */}
      <motion.div
        className="fixed inset-0 z-10 flex items-center pointer-events-none"
        animate={{
          // Slide left by half the visual content width + half gap to center both pages
          x: activePage ? -(visualContentWidth / 2 + 12) : 0
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Home page (left) with 3D Canvas overlay */}
        {/* pointer-events-none so clicks pass through to canvas for nav buttons */}
        <div
          className="flex-shrink-0 flex items-center justify-center pointer-events-none"
          style={{
            width: viewport.width,
            height: viewport.height,
            marginRight: gapCompensation // Pull right edge inward
          }}
        >
          <div
            className="relative overflow-hidden pointer-events-none"
            style={{
              transform: `scale(${scale})`,
              width: sheetWidth,
              height: sheetHeight,
              clipPath: `inset(0 ${clipInset}px)`,
              transformOrigin: 'center center',
              willChange: 'transform, clip-path',
              boxShadow: `0 8px 32px rgba(0,0,0,${0.15 * sheetBorderOpacity}), 0 2px 8px rgba(0,0,0,${0.1 * sheetBorderOpacity})`,
            }}
          >
            {/* Sheet border - appears on zoom out */}
            <div
              className="absolute inset-0 pointer-events-none z-[60]"
              style={{
                opacity: sheetBorderOpacity,
                border: '1px solid rgba(180,175,170,0.5)',
              }}
            />

            {/* Dark scene content - dramatically lightens when powered */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                backgroundColor: isPowered ? '#3a3836' : '#0d0d0f'
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Background noise texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{ filter: 'url(#noise)', mixBlendMode: 'overlay' }}
              />

              {/* Vignette - nearly disappears when powered */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                animate={{
                  background: isPowered
                    ? 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.05) 100%)'
                    : 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.4) 100%)'
                }}
                transition={{ duration: 1.2 }}
              />

              {/* 360° circular light from cube */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,250,240,0.2) 0%, rgba(255,245,230,0.1) 15%, rgba(255,240,220,0.05) 30%, transparent 55%)`
                }}
              />

              {/* Full illumination when docked - dramatic warm flood light */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 85% 15%, rgba(255,248,235,0.6) 0%, rgba(255,245,225,0.4) 30%, rgba(255,240,215,0.25) 60%, rgba(255,235,205,0.1) 100%)',
                }}
                animate={{ opacity: isPowered ? 1 : 0 }}
                transition={{ duration: 1.2 }}
              />

              {/* Idle glow when floating */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(255,248,235,0.15) 0%, rgba(255,245,225,0.08) 40%, transparent 70%)',
                }}
                animate={{ opacity: isIdle && !isPowered ? idleIntensity * 0.7 : 0 }}
                transition={{ duration: 0.5 }}
              />

              {/* Warm ambient fill when powered */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,252,240,0.35) 0%, rgba(255,248,230,0.25) 50%, rgba(255,245,220,0.15) 100%)',
                }}
                animate={{ opacity: isPowered ? 1 : 0 }}
                transition={{ duration: 1.2 }}
              />

              {/* Corner glow emanating from socket position */}
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'radial-gradient(circle at 90% 10%, rgba(255,245,220,0.5) 0%, rgba(255,240,210,0.3) 20%, transparent 50%)',
                }}
                animate={{ opacity: isPowered ? 1 : 0 }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          </div>
        </div>

        {/* Gap between pages - visual gap is 24px after margin compensation */}
        <div className="flex-shrink-0" style={{ width: 24 }} />

        {/* Content page (right) - appears when nav is clicked */}
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: viewport.width,
            height: viewport.height,
            marginLeft: gapCompensation // Pull left edge inward
          }}
        >
          <div
            className="relative overflow-hidden pointer-events-auto"
            style={{
              transform: `scale(${scale})`,
              width: sheetWidth,
              height: sheetHeight,
              clipPath: `inset(0 ${clipInset}px)`,
              transformOrigin: 'center center',
              boxShadow: `0 8px 32px rgba(0,0,0,${0.15 * sheetBorderOpacity}), 0 2px 8px rgba(0,0,0,${0.1 * sheetBorderOpacity})`,
              border: sheetBorderOpacity > 0.1 ? '1px solid rgba(180,175,170,0.5)' : 'none',
            }}
          >
            {/* Pixel grid reveal animation - key forces remount on page change */}
            {activePage && (
            <PixelGridReveal key={activePage}>
              {/* Background - dark for WORK/ABOUT, transparent for CONTACT */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundColor: activePage === 'CONTACT'
                    ? 'transparent'
                    : (isPowered ? '#3a3836' : '#0d0d0f')
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                {/* Dark page effects - only show for non-CONTACT pages */}
                {activePage !== 'CONTACT' && (
                  <>
                    {/* Background noise texture */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      style={{ filter: 'url(#noise)', mixBlendMode: 'overlay' }}
                    />

                    {/* Vignette - reduces when powered */}
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      animate={{
                        background: isPowered
                          ? 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.05) 100%)'
                          : 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)'
                      }}
                      transition={{ duration: 1.2 }}
                    />

                    {/* 360° circular light from cube */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(255,250,240,0.15) 0%, rgba(255,245,230,0.08) 15%, rgba(255,240,220,0.03) 30%, transparent 55%)`
                      }}
                    />

                    {/* Full illumination when powered */}
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(255,248,235,0.4) 0%, rgba(255,245,225,0.25) 40%, rgba(255,240,215,0.1) 70%, transparent 100%)',
                      }}
                      animate={{ opacity: isPowered ? 1 : 0 }}
                      transition={{ duration: 1.2 }}
                    />

                    {/* Idle glow when floating */}
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 50%, rgba(255,248,235,0.12) 0%, rgba(255,245,225,0.06) 40%, transparent 70%)',
                      }}
                      animate={{ opacity: isIdle && !isPowered ? idleIntensity * 0.5 : 0 }}
                      transition={{ duration: 0.5 }}
                    />

                    {/* Warm ambient fill when powered */}
                    <motion.div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,252,240,0.25) 0%, rgba(255,248,230,0.15) 50%, rgba(255,245,220,0.08) 100%)',
                      }}
                      animate={{ opacity: isPowered ? 1 : 0 }}
                      transition={{ duration: 1.2 }}
                    />
                  </>
                )}

                {/* Page content - padded to stay within visible (clipped) area */}
                <div className="absolute inset-0 overflow-y-auto">
                <div
                  className="min-h-full py-8 flex flex-col"
                  style={{
                    // Horizontal padding = clipInset + small inner padding
                    // This keeps content within the visible area after clip-path is applied
                    paddingLeft: clipInset + 24,
                    paddingRight: clipInset + 24,
                  }}
                >
                  {/* Header - compact for narrower visible area */}
                  {/* Text colors: dark for CONTACT (transparent bg), light for others */}
                  <motion.div
                    className="flex items-center justify-between mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: activePage ? 1 : 0, y: activePage ? 0 : -20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h1
                      className={`text-2xl sm:text-3xl font-bold tracking-wider ${
                        activePage === 'CONTACT' ? 'text-gray-800' : 'text-white/90'
                      }`}
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {activePage}
                    </h1>
                    <button
                      className={`px-3 py-1.5 text-xs sm:text-sm tracking-wider transition-colors ${
                        activePage === 'CONTACT'
                          ? 'text-gray-500 hover:text-gray-700'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                      onClick={() => setActivePage(null)}
                    >
                      ← BACK
                    </button>
                  </motion.div>

                  {/* WORK Content - responsive grid for narrower visible area */}
                  {activePage === 'WORK' && (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {[
                        { title: 'E-Commerce Platform', tech: 'Next.js • Stripe • PostgreSQL', year: '2024' },
                        { title: 'AI Dashboard', tech: 'React • Python • OpenAI', year: '2024' },
                        { title: 'Mobile Banking App', tech: 'React Native • Node.js', year: '2023' },
                        { title: 'Real-time Analytics', tech: 'Vue.js • WebSocket • D3', year: '2023' },
                      ].map((project, i) => (
                        <motion.div
                          key={project.title}
                          className="group relative bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                        >
                          <div className="aspect-video bg-white/5 rounded mb-4" />
                          <h3 className="text-white/90 font-medium mb-1">{project.title}</h3>
                          <p className="text-white/40 text-sm">{project.tech}</p>
                          <span className="absolute top-4 right-4 text-white/20 text-xs">{project.year}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* ABOUT Content */}
                  {activePage === 'ABOUT' && (
                    <motion.div
                      className="max-w-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.p
                        className="text-white/70 text-lg leading-relaxed mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        Full-stack developer with a passion for creating elegant,
                        performant web experiences. Specializing in React, Node.js,
                        and cloud architecture.
                      </motion.p>

                      <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <div>
                          <h3 className="text-white/50 text-sm tracking-wider mb-3">SKILLS</h3>
                          <div className="flex flex-wrap gap-2">
                            {['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker'].map(skill => (
                              <span key={skill} className="px-3 py-1 bg-white/5 rounded text-white/60 text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-white/50 text-sm tracking-wider mb-3">EXPERIENCE</h3>
                          <div className="space-y-4">
                            <div className="border-l border-white/10 pl-4">
                              <p className="text-white/80">Senior Developer</p>
                              <p className="text-white/40 text-sm">Tech Company • 2022 - Present</p>
                            </div>
                            <div className="border-l border-white/10 pl-4">
                              <p className="text-white/80">Full Stack Developer</p>
                              <p className="text-white/40 text-sm">Startup Inc • 2020 - 2022</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* CONTACT Content - Glass design with transparent background */}
                  {activePage === 'CONTACT' && (
                    <motion.div
                      className="max-w-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <motion.p
                        className="text-gray-600 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        Let&apos;s build something great together.
                      </motion.p>

                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <GlassButton
                          href="mailto:hello@keino.dev"
                          icon="✉"
                          title="hello@keino.dev"
                          subtitle="Email"
                          variant="light"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 }}
                        />

                        <GlassButton
                          href="https://github.com/keino"
                          target="_blank"
                          rel="noopener noreferrer"
                          icon="⌘"
                          title="github.com/keino"
                          subtitle="GitHub"
                          variant="light"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.6 }}
                        />

                        <GlassButton
                          href="https://linkedin.com/in/keino"
                          target="_blank"
                          rel="noopener noreferrer"
                          icon="in"
                          title="linkedin.com/in/keino"
                          subtitle="LinkedIn"
                          variant="light"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </PixelGridReveal>
            )}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator - fades out as user scrolls */}
      <div
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">Scroll</span>
          <motion.div
            className="w-px h-8 bg-white/20"
            animate={{ scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* DOM Hitbox for cube drag - follows cube's screen position */}
      <CubeHitbox
        screenPos={lightPos}
        onDragStart={handleCubeHitboxDragStart}
        isDragging={isDraggingCube}
        size={50}
      />

    </>
  )
}
