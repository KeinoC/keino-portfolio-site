'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

// --- Ring & layout ---
const RING_RADIUS = 1.2
const TEXT_RADIUS = RING_RADIUS + 0.15
const FONT_SIZE = 0.11
const SOCKET_EDGE_PADDING = 0.8
const SOCKET_Z = 0.25

// --- Indicator dot (pre-dock) ---
const DOT_RADIUS = 0.12

// --- Content circles & divider lines (proportions of viewport reach from socket) ---
const CONTENT_INNER_PCT = 0.25   // 25vw from socket
const CONTENT_OUTER_PCT = 0.90   // 90vw from socket (near left edge)
const LINE_THICKNESS = 0.006

// --- Docking ---
const CAPTURE_RADIUS = 2.5      // only attract when cube is near the socket
const SNAP_RADIUS = 0.8         // generous snap zone
const SNAP_MAX_SPEED = 2.0      // allow slightly faster snaps
const SPEED_SKIP_THRESHOLD = 8.0
const ATTRACT_LERP = 0.02       // position blend per frame (smooth drift toward socket)

// --- Rotation & snap ---
const SCROLL_SENSITIVITY = 0.004
const FREE_LERP = 0.10       // smooth follow during interaction
const SNAP_LERP = 0.04       // slower, deliberate ease into snap position
const FADE_SPEED = 0.06      // opacity lerp per frame for segment transitions

// Active position: directly left of the cube/dock center = angle π
const ACTIVE_ANGLE = Math.PI
const ITEM_COUNT = 5
const ITEM_STEP = (2 * Math.PI) / ITEM_COUNT // 2π/5 between items

const NAV_ITEMS = [
  { label: 'work', href: '/work', title: 'Work', description: 'Selected projects and case studies.' },
  { label: 'about', href: '/about', title: 'About', description: 'Designer & developer in Brooklyn, NY.' },
  { label: 'experience', href: '/experience', title: 'Experience', description: 'Professional background and journey.' },
  { label: 'lab', href: '/experiment', title: 'Lab', description: 'Experiments, prototypes, explorations.' },
  { label: 'contact', href: '/contact', title: 'Contact', description: 'Get in touch.' },
]

const SEGMENT_TEXT_RADIUS_PCT = 0.45 // position text at 45% of outer radius

interface CubeSocketProps {
  bodyRef: React.RefObject<RapierRigidBody | null>
  onDockedChange?: (docked: boolean) => void
  onNavigate?: (href: string) => void
}

/** Find the rotation value that snaps the nearest item to ACTIVE_ANGLE (left side). */
function nearestSnapRotation(currentRotation: number): number {
  const normalized = currentRotation - ACTIVE_ANGLE
  const snapped = Math.round(normalized / ITEM_STEP) * ITEM_STEP
  return snapped + ACTIVE_ANGLE
}

/** Given current rotation, return which item index is closest to the active (left) position. */
function activeItemIndex(currentRotation: number): number {
  let bestIdx = 0
  let bestDist = Infinity
  for (let i = 0; i < ITEM_COUNT; i++) {
    const worldAngle = i * ITEM_STEP + currentRotation
    let diff = worldAngle - ACTIVE_ANGLE
    diff = ((diff + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI
    if (Math.abs(diff) < bestDist) {
      bestDist = Math.abs(diff)
      bestIdx = i
    }
  }
  return bestIdx
}

// Animation speed for active state transitions
const ACTIVE_LERP_SPEED = 0.08

// Animated arc segment — fades opacity between active (transparent) and inactive (black)
function SegmentArc({
  outerRadius,
  thetaStart,
  thetaLength,
  isActive,
}: {
  outerRadius: number
  thetaStart: number
  thetaLength: number
  isActive: boolean
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(() => {
    if (!matRef.current) return
    const target = isActive ? 0 : 0.85
    matRef.current.opacity += (target - matRef.current.opacity) * FADE_SPEED
  })

  return (
    <mesh position={[0, 0, -0.01]} raycast={() => null}>
      <ringGeometry args={[0, outerRadius, 64, 1, thetaStart, thetaLength]} />
      <meshBasicMaterial ref={matRef} color="#000000" transparent opacity={0.85} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Animated segment text — fades in/out with active state
function SegmentText({
  title,
  description,
  angle,
  radius,
  isActive,
}: {
  title: string
  description: string
  angle: number
  radius: number
  isActive: boolean
}) {
  const titleRef = useRef<THREE.Mesh>(null)
  const descRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const target = isActive ? 0 : 1
    if (titleRef.current) {
      const mat = titleRef.current.material as THREE.Material
      mat.opacity += (target - mat.opacity) * FADE_SPEED
    }
    if (descRef.current) {
      const mat = descRef.current.material as THREE.Material
      mat.opacity += (target - mat.opacity) * FADE_SPEED
    }
  })

  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  let rot = angle - Math.PI / 2
  if (Math.sin(angle) < 0) rot += Math.PI

  return (
    <group position={[x, y, 0.01]} rotation={[0, 0, rot]}>
      <Text
        ref={titleRef}
        font="/fonts/inter-thin.ttf"
        fontSize={0.18}
        anchorX="center"
        anchorY="middle"
        color="#e0e0e0"
        letterSpacing={0.12}
        material-transparent
      >
        {title.toUpperCase()}
      </Text>
      <Text
        ref={descRef}
        font="/fonts/inter-thin.ttf"
        fontSize={0.07}
        anchorX="center"
        anchorY="middle"
        color="#777777"
        position={[0, -0.22, 0]}
        letterSpacing={0.02}
        material-transparent
      >
        {description}
      </Text>
    </group>
  )
}

// Individual nav label around the ring
function NavLabel({
  label,
  href,
  angle,
  isActive,
  onNavigate,
}: {
  label: string
  href: string
  angle: number
  isActive: boolean
  onNavigate?: (href: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef<THREE.Mesh>(null)
  const lineRef = useRef<THREE.Mesh>(null)

  const x = Math.cos(angle) * TEXT_RADIUS
  const y = Math.sin(angle) * TEXT_RADIUS

  let labelRotation = angle - Math.PI / 2
  if (Math.sin(angle) < 0) {
    labelRotation += Math.PI
  }

  // Determine text color from state (React-driven, not useFrame)
  const textColor = isActive
    ? (hovered ? '#ffffff' : '#e0e0e0')
    : (hovered ? '#5a5a5a' : '#3a3a3a')

  // Imperative animation for glow/underline only
  useFrame(() => {
    const glowMat = glowRef.current?.material as THREE.MeshBasicMaterial | undefined
    const lineMat = lineRef.current?.material as THREE.MeshBasicMaterial | undefined

    if (glowMat) {
      const targetOpacity = isActive ? 0.06 : 0
      glowMat.opacity += (targetOpacity - glowMat.opacity) * ACTIVE_LERP_SPEED
    }

    if (lineMat && lineRef.current) {
      const targetScaleX = isActive ? 1 : 0
      const targetOpacity = isActive ? 0.7 : 0
      lineRef.current.scale.x += (targetScaleX - lineRef.current.scale.x) * ACTIVE_LERP_SPEED
      lineMat.opacity += (targetOpacity - lineMat.opacity) * ACTIVE_LERP_SPEED
    }
  })

  return (
    <group
      position={[x, y, 0]}
      rotation={[0, 0, labelRotation]}
    >
      {/* Hit area */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
        onClick={(e) => {
          e.stopPropagation()
          onNavigate?.(href)
        }}
      >
        <planeGeometry args={[0.5, 0.18]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Glow backdrop — caught by Bloom */}
      <mesh ref={glowRef} position={[0, 0, -0.001]}>
        <planeGeometry args={[0.55, 0.14]} />
        <meshBasicMaterial color="#e0e0e0" transparent opacity={0} toneMapped={false} />
      </mesh>

      {/* Underline indicator */}
      <mesh ref={lineRef} position={[0, -0.07, 0.001]} scale={[0, 1, 1]}>
        <planeGeometry args={[0.35, 0.006]} />
        <meshBasicMaterial color="#e0e0e0" transparent opacity={0} toneMapped={false} />
      </mesh>

      <Text
        font="/fonts/inter-thin.ttf"
        fontSize={isActive ? FONT_SIZE * 1.15 : FONT_SIZE}
        anchorX="center"
        anchorY="middle"
        color={textColor}
        letterSpacing={0.08}
      >
        {label}
      </Text>
    </group>
  )
}

export function CubeSocket({ bodyRef, onDockedChange, onNavigate }: CubeSocketProps) {
  const { viewport, gl } = useThree()
  // Distance from socket center to far left edge of screen
  const reach = viewport.width - SOCKET_EDGE_PADDING
  const contentInnerRadius = reach * CONTENT_INNER_PCT
  const contentOuterRadius = reach * CONTENT_OUTER_PCT

  const groupRef = useRef<THREE.Group>(null)
  const dockedRef = useRef(false)
  const [docked, setDocked] = useState(false)
  const onDockedChangeRef = useRef(onDockedChange)
  onDockedChangeRef.current = onDockedChange

  // Rotation state
  const rotationAngle = useRef(ACTIVE_ANGLE)
  const targetRotation = useRef(ACTIVE_ANGLE)
  const isSnapping = useRef(true) // start snapped

  // Active item index for highlighting + auto-navigate
  const [activeIdx, setActiveIdx] = useState(0)
  const [visualActiveIdx, setVisualActiveIdx] = useState(0) // only updates on settle
  const activeIdxRef = useRef(0)
  const hasInteracted = useRef(false) // skip auto-navigate on initial dock
  const pendingNavigate = useRef(false) // fire navigate once when wheel settles

  // Labels group ref
  const labelsGroupRef = useRef<THREE.Group>(null)

  // Drag rotation state
  const isDragging = useRef(false)
  const dragStartAngle = useRef(0)

  // Socket center in world space
  const socketCenter = useRef<[number, number, number]>([0, 0, 0])

  // Scroll snap timer (ref so it persists across renders)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setDockedState = useCallback((value: boolean) => {
    if (dockedRef.current === value) return
    dockedRef.current = value
    if (!value) hasInteracted.current = false
    setDocked(value)
    onDockedChangeRef.current?.(value)
  }, [])

  /** Immediately compute snap target from current targetRotation */
  const snapToNearest = useCallback(() => {
    targetRotation.current = nearestSnapRotation(targetRotation.current)
    isSnapping.current = true
  }, [])

  // Scroll handler — only active when docked
  useEffect(() => {
    if (!docked) return

    const canvas = gl.domElement

    const handleWheel = (e: WheelEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const worldX = mouseX * (viewport.width / 2)
      const worldY = mouseY * (viewport.height / 2)

      const dx = worldX - socketCenter.current[0]
      const dy = worldY - socketCenter.current[1]
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < RING_RADIUS + 0.8) {
        e.preventDefault()
        hasInteracted.current = true
        pendingNavigate.current = true
        isSnapping.current = false
        targetRotation.current += e.deltaY * SCROLL_SENSITIVITY

        // Debounced snap — clear previous timer, set new one
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = setTimeout(() => {
          targetRotation.current = nearestSnapRotation(targetRotation.current)
          isSnapping.current = true
          scrollTimerRef.current = null
        }, 350)
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = null
      }
    }
  }, [docked, gl.domElement, viewport.width, viewport.height])

  // Drag rotation handlers — only active when docked
  const handlePointerDown = useCallback((e: THREE.Event & { stopPropagation: () => void; nativeEvent?: PointerEvent }) => {
    if (!dockedRef.current) return
    e.stopPropagation()
    hasInteracted.current = true
    pendingNavigate.current = true
    isDragging.current = true
    isSnapping.current = false

    const ne = (e as unknown as { nativeEvent: PointerEvent }).nativeEvent
    if (!ne) return
    const rect = gl.domElement.getBoundingClientRect()
    const mouseX = ((ne.clientX - rect.left) / rect.width) * 2 - 1
    const mouseY = -((ne.clientY - rect.top) / rect.height) * 2 + 1
    const worldX = mouseX * (viewport.width / 2)
    const worldY = mouseY * (viewport.height / 2)

    dragStartAngle.current = Math.atan2(
      worldY - socketCenter.current[1],
      worldX - socketCenter.current[0]
    )
    document.body.style.cursor = 'grabbing'
  }, [gl.domElement, viewport.width, viewport.height])

  useEffect(() => {
    if (!docked) return

    const canvas = gl.domElement

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const rect = canvas.getBoundingClientRect()
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const worldX = mouseX * (viewport.width / 2)
      const worldY = mouseY * (viewport.height / 2)

      const currentAngle = Math.atan2(
        worldY - socketCenter.current[1],
        worldX - socketCenter.current[0]
      )
      let delta = currentAngle - dragStartAngle.current

      if (delta > Math.PI) delta -= 2 * Math.PI
      if (delta < -Math.PI) delta += 2 * Math.PI

      targetRotation.current += delta
      dragStartAngle.current = currentAngle
    }

    const handlePointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false
      document.body.style.cursor = 'default'
      snapToNearest()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [docked, gl.domElement, viewport.width, viewport.height, snapToNearest])

  // Window blur → snap back
  useEffect(() => {
    const handleBlur = () => snapToNearest()
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [snapToNearest])

  // Navigate ref — avoid stale closure in useFrame
  const onNavigateRef = useRef(onNavigate)
  onNavigateRef.current = onNavigate

  useFrame(() => {
    if (!bodyRef.current || !groupRef.current) return

    const socketX = viewport.width / 2 - SOCKET_EDGE_PADDING
    const socketY = 0
    const socketZ = SOCKET_Z

    socketCenter.current = [socketX, socketY, socketZ]
    groupRef.current.position.set(socketX, socketY, socketZ)

    // --- Rotation lerp ---
    const lerpSpeed = isSnapping.current ? SNAP_LERP : FREE_LERP
    rotationAngle.current += (targetRotation.current - rotationAngle.current) * lerpSpeed

    if (labelsGroupRef.current) {
      labelsGroupRef.current.rotation.z = rotationAngle.current
    }

    // Update active item index (use ref to avoid stale closure)
    if (dockedRef.current) {
      const idx = activeItemIndex(rotationAngle.current)
      if (idx !== activeIdxRef.current) {
        activeIdxRef.current = idx
        setActiveIdx(idx)
      }

      // Update visual state + fire navigate once when wheel settles
      if (isSnapping.current) {
        const settled = Math.abs(rotationAngle.current - targetRotation.current) < 0.02
        if (settled) {
          setVisualActiveIdx(idx)
          if (pendingNavigate.current) {
            pendingNavigate.current = false
            onNavigateRef.current?.(NAV_ITEMS[idx].href)
          }
        }
      }
    }

    // --- Docking logic ---
    const cubePos = bodyRef.current.translation()
    const cubeVel = bodyRef.current.linvel()
    const speed = Math.sqrt(
      cubeVel.x * cubeVel.x + cubeVel.y * cubeVel.y + cubeVel.z * cubeVel.z
    )

    const dx = socketX - cubePos.x
    const dy = socketY - cubePos.y
    const dz = socketZ - cubePos.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dockedRef.current) {
      if (dist > SNAP_RADIUS * 1.5) {
        // Cube was yanked away — undock
        setDockedState(false)
      } else {
        // Hold cube at socket
        bodyRef.current.setTranslation({ x: socketX, y: socketY, z: socketZ }, true)
        bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
      return
    }

    // Skip attraction while cube is moving fast (active throw)
    if (speed > SPEED_SKIP_THRESHOLD) return

    // Snap into dock when close enough and slow
    if (dist < SNAP_RADIUS && speed < SNAP_MAX_SPEED) {
      bodyRef.current.setTranslation({ x: socketX, y: socketY, z: socketZ }, true)
      bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      setDockedState(true)
      return
    }

    // Attract via position blending (works even when float state zeroes velocity)
    // Only attract when cube is slow (settling/resting/floating)
    if (dist < CAPTURE_RADIUS && dist > 0.01 && speed < 2.0) {
      // Stronger blend as cube gets closer
      const proximity = 1 - dist / CAPTURE_RADIUS
      const blend = ATTRACT_LERP * (0.5 + proximity * 0.5)
      const newX = cubePos.x + dx * blend
      const newY = cubePos.y + dy * blend
      const newZ = cubePos.z + dz * blend
      bodyRef.current.setTranslation({ x: newX, y: newY, z: newZ }, true)
    }
  })

  return (
    <group ref={groupRef} raycast={() => null}>
      {!docked && (
        <mesh raycast={() => null}>
          <circleGeometry args={[DOT_RADIUS, 32]} />
          <meshStandardMaterial
            color="#555555"
            emissive="#333333"
            emissiveIntensity={0.5}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      )}

      {docked && (
        <>
          {/* Invisible drag hit area */}
          <mesh onPointerDown={handlePointerDown}>
            <ringGeometry args={[RING_RADIUS - 0.4, RING_RADIUS + 0.4, 64]} />
            <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
          </mesh>

          {/* Nav ring (thin) */}
          <mesh raycast={() => null}>
            <ringGeometry args={[RING_RADIUS - 0.008, RING_RADIUS, 64]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>

          {/* Inner content circle */}
          <mesh raycast={() => null}>
            <ringGeometry args={[contentInnerRadius - 0.008, contentInnerRadius, 128]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>

          {/* Outer content circle */}
          <mesh raycast={() => null}>
            <ringGeometry args={[contentOuterRadius - 0.008, contentOuterRadius, 128]} />
            <meshBasicMaterial color="#333333" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>

          <group ref={labelsGroupRef}>
            {/* Filled arc segments — only fade on settle via visualActiveIdx */}
            {Array.from({ length: ITEM_COUNT }).map((_, i) => (
              <SegmentArc
                key={`seg-${i}`}
                outerRadius={contentOuterRadius}
                thetaStart={(i - 0.5) * ITEM_STEP}
                thetaLength={ITEM_STEP}
                isActive={i === visualActiveIdx}
              />
            ))}

            {/* Segment title/description — only fade on settle via visualActiveIdx */}
            {NAV_ITEMS.map((item, i) => (
              <SegmentText
                key={`seg-text-${i}`}
                title={item.title}
                description={item.description}
                angle={(i / ITEM_COUNT) * Math.PI * 2}
                radius={contentOuterRadius * SEGMENT_TEXT_RADIUS_PCT}
                isActive={i === visualActiveIdx}
              />
            ))}

            {NAV_ITEMS.map((item, i) => {
              const baseAngle = (i / ITEM_COUNT) * Math.PI * 2
              return (
                <NavLabel
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  angle={baseAngle}
                  isActive={i === activeIdx}
                  onNavigate={onNavigate}
                />
              )
            })}

            {/* Divider lines — from nav ring to outer content circle */}
            {Array.from({ length: ITEM_COUNT }).map((_, i) => {
              const angle = (i + 0.5) * ITEM_STEP
              const segLen = contentOuterRadius - RING_RADIUS
              const offset = RING_RADIUS + segLen / 2
              return (
                <mesh
                  key={`divider-${i}`}
                  position={[Math.cos(angle) * offset, Math.sin(angle) * offset, 0]}
                  rotation={[0, 0, angle]}
                  raycast={() => null}
                >
                  <planeGeometry args={[segLen, LINE_THICKNESS]} />
                  <meshBasicMaterial color="#333333" transparent opacity={0.3} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
          </group>
        </>
      )}
    </group>
  )
}
