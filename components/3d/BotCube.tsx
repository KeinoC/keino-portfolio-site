'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { RigidBody, CuboidCollider, RapierRigidBody, CollisionPayload } from '@react-three/rapier'
import * as THREE from 'three'
import { computeContextSteering, isObstacle } from '@/lib/context-steering'
import { PHYSICS_GROUPS, Z_LAYERS } from '@/lib/physics-groups'

// Bot cube configuration
const BOT_CUBE_SIZE = 0.4
const BOT_CUBE_PADDING = 0.25
const LIFT_HEIGHT = 0.6

// Bot behavior configuration
const DETECTION_RADIUS = 10.0  // How far the bot can see (increased for larger scenes)
const MOVEMENT_SPEED = 1.5     // Units per second (reduced for better obstacle avoidance)
const GRAB_DISTANCE = 0.5      // How close before grabbing
const SCAN_INTERVAL = 0.3      // Seconds between scans when idle
const MAX_TRAIN_LENGTH = 6     // Maximum items in the train

// Train following configuration - TIGHT attachment (almost touching)
const TRAIN_FOLLOW_DISTANCE = 0.25  // Very close (almost touching)
const TRAIN_FOLLOW_STRENGTH = 20.0  // Strong spring (snappy)
const TRAIN_DAMPING = 8.0           // High damping (no wobble)
const TRAIN_MAX_SPEED = 6.0         // Fast to keep up with bot

// Obstacle avoidance configuration
const AVOIDANCE_RADIUS = 2.0        // How close before steering away (increased for better reaction time)
const OBSTACLE_RADIUS_ESTIMATE = 0.6 // Estimated radius for obstacles like KEINO letters
const STUCK_THRESHOLD = 0.15        // Min movement over time window to not be stuck
const STUCK_TIME_WINDOW = 1.5       // Seconds to check for stuck condition

// Thruster jump configuration (for jumping onto pages)
const FLOOR_Z = Z_LAYERS.BOT_FLOOR  // Bot operating height on floor (0.2)
const PAGE_Z = Z_LAYERS.PAGE_PLANE  // Page surface height (1.5)
const JUMP_SPEED = 3.0              // Vertical movement speed
const PAGE_APPROACH_DIST = 1.5      // Distance to start jump when approaching page

// Bot state machine
type BotState = 'idle' | 'scanning' | 'approaching' | 'grabbing' | 'returning' | 'releasing'

interface BotCubeProps {
  startPosition: [number, number, number]
  targetZone: { position: [number, number, number]; size: [number, number] }
  onTaskComplete?: () => void
  onStateChange?: (state: BotState) => void
  color?: string
}

export function BotCube({
  startPosition,
  targetZone,
  onTaskComplete,
  onStateChange,
  color = '#4488ff'
}: BotCubeProps) {
  const { viewport, camera, gl } = useThree()

  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Dragging state (user can grab to interrupt)
  const isDragging = useRef(false)
  const wasInterrupted = useRef(false)
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const dragOffset = useRef(new THREE.Vector3())
  const lastDragPos = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())

  // Bot behavior state - start scanning immediately
  const [state, setState] = useState<BotState>('scanning')
  const [targetBody, setTargetBody] = useState<RapierRigidBody | null>(null)
  const targetBodyRef = useRef<RapierRigidBody | null>(null)
  const lastScanTime = useRef(-999) // Start with old timestamp so first scan triggers immediately

  // Train of towed items - ordered array, first item follows bot directly
  const towedBodies = useRef<RapierRigidBody[]>([])

  // Track cleaned items to avoid re-grabbing
  const cleanedItems = useRef<Set<number>>(new Set())

  // Obstacle tracking for context steering (event-driven)
  const nearbyObstacles = useRef<Set<RapierRigidBody>>(new Set())

  // Track cleanable targets detected by sensor (event-driven, no useRapier needed)
  const nearbyCleanables = useRef<Set<RapierRigidBody>>(new Set())

  // Page tracking for thruster jump (event-driven)
  const nearbyPages = useRef<Set<RapierRigidBody>>(new Set())
  const targetZ = useRef<number>(FLOOR_Z)
  const isOnPage = useRef(false)

  // Stuck detection - track position history
  const positionHistory = useRef<Array<{ x: number; y: number; time: number }>>([])
  const isRecovering = useRef(false)
  const recoveryDirection = useRef<{ x: number; y: number }>({ x: 0, y: 1 })

  // Sync ref with state
  useEffect(() => {
    targetBodyRef.current = targetBody
  }, [targetBody])

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state)
    console.log('[BotCube] State changed to:', state)
  }, [state, onStateChange])

  // Log mount
  useEffect(() => {
    console.log('[BotCube] Component mounted at position:', startPosition)
  }, [])

  const bounds = useMemo(() => ({
    minX: -viewport.width / 2 + BOT_CUBE_PADDING,
    maxX: viewport.width / 2 - BOT_CUBE_PADDING,
    minY: -viewport.height / 2 + BOT_CUBE_PADDING,
    maxY: viewport.height / 2 - BOT_CUBE_PADDING
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

  // User grabs bot - interrupts task
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    isDragging.current = true
    wasInterrupted.current = true

    // Release all towed items
    towedBodies.current = []

    // Pause behavior
    setState('idle')
    setTargetBody(null)

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
        rigidBodyRef.current.setLinvel({
          x: velocity.current.x * 0.5,
          y: velocity.current.y * 0.5,
          z: 0
        }, true)
      }

      // Resume behavior after a short delay
      setTimeout(() => {
        wasInterrupted.current = false
        setState('scanning')
      }, 500)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [bounds, camera, getMouseNDC, raycaster])

  // Sensor handlers - track obstacles, cleanable targets, and pages (event-driven)
  const handleSensorEnter = useCallback((payload: CollisionPayload) => {
    const body = payload.other.rigidBody
    if (!body) return

    const userData = body.userData as { cleanable?: boolean; isPage?: boolean } | undefined

    // Check if this is a page (for thruster jump)
    if (userData?.isPage) {
      nearbyPages.current.add(body)
      console.log('[BotCube] Page detected, total nearby:', nearbyPages.current.size)
    } else if (userData?.cleanable) {
      // This is a cleanable target
      nearbyCleanables.current.add(body)
      console.log('[BotCube] Cleanable detected, total nearby:', nearbyCleanables.current.size)
    } else if (isObstacle(body.userData)) {
      // This is an obstacle (not cleanable)
      nearbyObstacles.current.add(body)
      console.log('[BotCube] Obstacle detected, total nearby:', nearbyObstacles.current.size)
    }
  }, [])

  const handleSensorExit = useCallback((payload: CollisionPayload) => {
    const body = payload.other.rigidBody
    if (body) {
      nearbyObstacles.current.delete(body)
      nearbyCleanables.current.delete(body)
      nearbyPages.current.delete(body)
    }
  }, [])

  // Check if bot is stuck (hasn't moved much over time window)
  const checkIfStuck = useCallback((pos: { x: number; y: number }, time: number): boolean => {
    positionHistory.current.push({ x: pos.x, y: pos.y, time })
    positionHistory.current = positionHistory.current.filter(p => time - p.time < STUCK_TIME_WINDOW)

    if (positionHistory.current.length < 10) return false

    const oldest = positionHistory.current[0]
    const moved = Math.sqrt((pos.x - oldest.x) ** 2 + (pos.y - oldest.y) ** 2)
    return moved < STUCK_THRESHOLD
  }, [])

  // Get recovery direction (perpendicular to target direction)
  const getRecoveryDirection = useCallback((targetDir: { x: number; y: number }): { x: number; y: number } => {
    const perpSign = Math.random() > 0.5 ? 1 : -1
    return { x: -targetDir.y * perpSign, y: targetDir.x * perpSign }
  }, [])

  // Calculate distance to nearest page (for thruster jump trigger)
  const getDistanceToNearestPage = useCallback((botPos: { x: number; y: number }): number => {
    let minDist = Infinity
    for (const page of nearbyPages.current) {
      const pagePos = page.translation()
      const dx = pagePos.x - botPos.x
      const dy = pagePos.y - botPos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minDist) minDist = dist
    }
    return minDist
  }, [])

  // Smooth train following physics - apply spring-like forces
  const updateTrainPhysics = useCallback((botPos: { x: number; y: number; z: number }, delta: number) => {
    if (towedBodies.current.length === 0) return

    // Each item follows the one in front
    for (let i = 0; i < towedBodies.current.length; i++) {
      const body = towedBodies.current[i]
      if (!body) continue

      // Leader is either bot or previous train car
      const leaderPos = i === 0
        ? botPos
        : towedBodies.current[i - 1]?.translation() ?? botPos

      const followerPos = body.translation()

      // Calculate direction and distance to leader
      const dx = leaderPos.x - followerPos.x
      const dy = leaderPos.y - followerPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 0.01) continue // Prevent division by zero

      // Normalized direction
      const nx = dx / distance
      const ny = dy / distance

      // Spring force: pull toward ideal follow distance
      const distanceError = distance - TRAIN_FOLLOW_DISTANCE
      const springForce = distanceError * TRAIN_FOLLOW_STRENGTH

      // Get current velocity for damping
      const currentVel = body.linvel()

      // Apply damping to reduce oscillation
      const dampingX = -currentVel.x * TRAIN_DAMPING
      const dampingY = -currentVel.y * TRAIN_DAMPING

      // Calculate target velocity
      let targetVelX = nx * springForce + dampingX * delta
      let targetVelY = ny * springForce + dampingY * delta

      // Clamp to max speed
      const speed = Math.sqrt(targetVelX * targetVelX + targetVelY * targetVelY)
      if (speed > TRAIN_MAX_SPEED) {
        const scale = TRAIN_MAX_SPEED / speed
        targetVelX *= scale
        targetVelY *= scale
      }

      // Blend current velocity with target for smoothness
      const blendFactor = Math.min(1, delta * 10)
      const newVelX = currentVel.x + (targetVelX - currentVel.x) * blendFactor
      const newVelY = currentVel.y + (targetVelY - currentVel.y) * blendFactor

      body.setLinvel({ x: newVelX, y: newVelY, z: 0 }, true)

      // Gentle rotation based on movement direction
      if (speed > 0.1) {
        body.setAngvel({
          x: newVelY * 0.3,
          y: -newVelX * 0.3,
          z: 0
        }, true)
      } else {
        // Dampen rotation when slow
        const angVel = body.angvel()
        body.setAngvel({
          x: angVel.x * 0.9,
          y: angVel.y * 0.9,
          z: angVel.z * 0.9
        }, true)
      }
    }
  }, [])

  // Main behavior loop
  useFrame((frameState, delta) => {
    if (!rigidBodyRef.current || isDragging.current) return

    const botPos = rigidBodyRef.current.translation()
    const currentTime = frameState.clock.elapsedTime

    // Always update train physics for smooth following
    updateTrainPhysics(botPos, delta)

    // Thruster jump logic - jump onto pages, descend when leaving
    const distToPage = getDistanceToNearestPage({ x: botPos.x, y: botPos.y })
    const hasNearbyPage = nearbyPages.current.size > 0

    if (hasNearbyPage && distToPage < PAGE_APPROACH_DIST) {
      // Near a page - thrust up to page height
      targetZ.current = PAGE_Z
      isOnPage.current = true
    } else if (!hasNearbyPage && isOnPage.current) {
      // Left page area - descend to floor
      targetZ.current = FLOOR_Z
      isOnPage.current = false
    } else if (!hasNearbyPage) {
      // No page nearby and not on page - stay on floor
      targetZ.current = FLOOR_Z
    }

    // Apply vertical thrust if needed
    const currentZ = botPos.z
    const zDiff = targetZ.current - currentZ
    let zVel = 0
    if (Math.abs(zDiff) > 0.02) {
      // Smooth acceleration toward target height
      zVel = Math.sign(zDiff) * Math.min(JUMP_SPEED, Math.abs(zDiff) * 5)
    }

    switch (state) {
      case 'idle': {
        // Wait a moment then start scanning
        if (currentTime - lastScanTime.current > SCAN_INTERVAL && !wasInterrupted.current) {
          setState('scanning')
        }
        // Still apply vertical thrust if needed (maintain height)
        if (Math.abs(zVel) > 0.01) {
          const currentVel = rigidBodyRef.current.linvel()
          rigidBodyRef.current.setLinvel({ x: currentVel.x * 0.9, y: currentVel.y * 0.9, z: zVel }, true)
        }
        break
      }

      case 'scanning': {
        lastScanTime.current = currentTime

        // If train is full, go to drop zone
        if (towedBodies.current.length >= MAX_TRAIN_LENGTH) {
          setState('returning')
          break
        }

        // Find nearest cleanable target from sensor-detected items (event-driven, no useRapier needed)
        let nearestBody: RapierRigidBody | null = null
        let nearestDistance = Infinity

        const towedHandles = new Set(towedBodies.current.map(b => b.handle))

        // Iterate through cleanables detected by sensor events
        for (const body of nearbyCleanables.current) {
          // Skip already cleaned or currently towed items
          const bodyHandle = body.handle
          if (cleanedItems.current.has(bodyHandle)) continue
          if (towedHandles.has(bodyHandle)) continue

          const bodyPos = body.translation()
          const dx = bodyPos.x - botPos.x
          const dy = bodyPos.y - botPos.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < nearestDistance) {
            nearestDistance = distance
            nearestBody = body
          }
        }

        // Debug logging
        console.log(`[BotCube] Scanning: ${nearbyCleanables.current.size} cleanables nearby, nearest: ${nearestDistance.toFixed(2)}`)

        if (nearestBody) {
          console.log('[BotCube] Found target, approaching')
          setTargetBody(nearestBody)
          setState('approaching')
        } else if (towedBodies.current.length > 0) {
          // No more targets but have items - go deliver
          setState('returning')
        } else {
          // No targets found, go back to idle
          setState('idle')
        }
        break
      }

      case 'approaching': {
        if (!targetBodyRef.current) {
          setState('scanning')
          break
        }

        const targetPos = targetBodyRef.current.translation()
        const dx = targetPos.x - botPos.x
        const dy = targetPos.y - botPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const targetDir = distance > 0.01 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 }

        if (distance < GRAB_DISTANCE) {
          // Close enough to grab
          isRecovering.current = false
          setState('grabbing')
        } else {
          // Check if stuck
          if (checkIfStuck({ x: botPos.x, y: botPos.y }, currentTime) && !isRecovering.current) {
            isRecovering.current = true
            recoveryDirection.current = getRecoveryDirection(targetDir)
            positionHistory.current = [] // Clear history to give recovery time
          }

          let moveDir: { x: number; y: number }

          if (isRecovering.current) {
            // Use recovery direction for a bit
            moveDir = recoveryDirection.current
            // Check if we've moved enough to stop recovering
            if (!checkIfStuck({ x: botPos.x, y: botPos.y }, currentTime)) {
              isRecovering.current = false
            }
          } else {
            // Build obstacle list from sensor data (exclude target and towed items)
            const towedHandles = new Set(towedBodies.current.map(b => b.handle))
            const obstacles = Array.from(nearbyObstacles.current)
              .filter(b => b.handle !== targetBodyRef.current?.handle && !towedHandles.has(b.handle))
              .map(b => ({ x: b.translation().x, y: b.translation().y, radius: OBSTACLE_RADIUS_ESTIMATE }))

            // Compute steering direction with obstacle avoidance
            moveDir = computeContextSteering(
              { x: botPos.x, y: botPos.y },
              { x: targetPos.x, y: targetPos.y },
              obstacles,
              AVOIDANCE_RADIUS
            )

            // Debug: log steering when obstacles are present
            if (obstacles.length > 0) {
              console.log(`[BotCube] Approaching: ${obstacles.length} obstacles, steer: (${moveDir.x.toFixed(2)}, ${moveDir.y.toFixed(2)})`)
            }
          }

          // Apply velocity (including vertical thrust for page jumping)
          rigidBodyRef.current.setLinvel({
            x: moveDir.x * MOVEMENT_SPEED,
            y: moveDir.y * MOVEMENT_SPEED,
            z: zVel
          }, true)

          // Face movement direction with gentle rotation
          rigidBodyRef.current.setAngvel({
            x: moveDir.y * 0.5,
            y: -moveDir.x * 0.5,
            z: 0
          }, true)
        }
        break
      }

      case 'grabbing': {
        if (!targetBodyRef.current) {
          setState('scanning')
          break
        }

        // Add to train
        towedBodies.current.push(targetBodyRef.current)
        setTargetBody(null)

        // Brief pause then continue scanning for more (maintain vertical position)
        rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: zVel }, true)

        // Scan for more items or return if train is full
        setTimeout(() => {
          if (towedBodies.current.length >= MAX_TRAIN_LENGTH) {
            setState('returning')
          } else {
            setState('scanning')
          }
        }, 200)

        setState('idle') // Temporary state while waiting
        break
      }

      case 'returning': {
        // Move toward drop zone
        const dropX = targetZone.position[0]
        const dropY = targetZone.position[1]
        const dx = dropX - botPos.x
        const dy = dropY - botPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const targetDir = distance > 0.01 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 }

        if (distance < 0.8) {
          // Reached drop zone
          isRecovering.current = false
          setState('releasing')
        } else {
          // Check if stuck
          if (checkIfStuck({ x: botPos.x, y: botPos.y }, currentTime) && !isRecovering.current) {
            isRecovering.current = true
            recoveryDirection.current = getRecoveryDirection(targetDir)
            positionHistory.current = []
          }

          let moveDir: { x: number; y: number }

          if (isRecovering.current) {
            moveDir = recoveryDirection.current
            if (!checkIfStuck({ x: botPos.x, y: botPos.y }, currentTime)) {
              isRecovering.current = false
            }
          } else {
            // Build obstacle list (exclude towed items)
            const towedHandles = new Set(towedBodies.current.map(b => b.handle))
            const obstacles = Array.from(nearbyObstacles.current)
              .filter(b => !towedHandles.has(b.handle))
              .map(b => ({ x: b.translation().x, y: b.translation().y, radius: OBSTACLE_RADIUS_ESTIMATE }))

            // Compute steering direction with obstacle avoidance
            moveDir = computeContextSteering(
              { x: botPos.x, y: botPos.y },
              { x: dropX, y: dropY },
              obstacles,
              AVOIDANCE_RADIUS
            )
          }

          // Slower when towing heavy train
          const trainSpeedFactor = Math.max(0.6, 1 - towedBodies.current.length * 0.06)

          rigidBodyRef.current.setLinvel({
            x: moveDir.x * MOVEMENT_SPEED * trainSpeedFactor,
            y: moveDir.y * MOVEMENT_SPEED * trainSpeedFactor,
            z: zVel
          }, true)

          rigidBodyRef.current.setAngvel({
            x: moveDir.y * 0.3,
            y: -moveDir.x * 0.3,
            z: 0
          }, true)
        }
        break
      }

      case 'releasing': {
        // Release all items in train
        for (const body of towedBodies.current) {
          cleanedItems.current.add(body.handle)
          onTaskComplete?.()
        }
        towedBodies.current = []

        // Go back to scanning for more targets
        setState('scanning')
        break
      }
    }
  })

  // Visual indicator color based on state
  const stateColor = useMemo(() => {
    switch (state) {
      case 'idle': return color
      case 'scanning': return '#66aaff'
      case 'approaching': return '#88ccff'
      case 'grabbing': return '#aaffaa'
      case 'returning': return '#ffaa66'
      case 'releasing': return '#aaffaa'
      default: return color
    }
  }, [state, color])

  // Train count indicator
  const trainCount = towedBodies.current.length

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={startPosition}
      colliders={false}
      mass={0.5}
      restitution={0.3}
      friction={0.8}
      linearDamping={2.0}
      angularDamping={1.5}
    >
      <CuboidCollider args={[BOT_CUBE_SIZE / 2, BOT_CUBE_SIZE / 2, BOT_CUBE_SIZE / 2]} />

      {/* Detection sensor - larger invisible collider for obstacle avoidance */}
      <CuboidCollider
        args={[DETECTION_RADIUS / 2, DETECTION_RADIUS / 2, 0.5]}
        sensor
        onIntersectionEnter={handleSensorEnter}
        onIntersectionExit={handleSensorExit}
      />

      <group
        ref={groupRef}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'grab' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        {/* Larger invisible touch area */}
        <mesh visible={false}>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Main cube - cyan/blue color - BRIGHT for visibility */}
        <RoundedBox args={[BOT_CUBE_SIZE, BOT_CUBE_SIZE, BOT_CUBE_SIZE]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color={stateColor}
            emissive={stateColor}
            emissiveIntensity={1.5}
            metalness={0.2}
            roughness={0.3}
            toneMapped={false}
          />
        </RoundedBox>

        {/* Inner glow - stronger */}
        <pointLight color={stateColor} intensity={15} distance={6} decay={2} />

        {/* State indicator ring */}
        <mesh position={[0, 0, BOT_CUBE_SIZE / 2 + 0.01]} rotation={[0, 0, 0]}>
          <ringGeometry args={[0.12, 0.15, 16]} />
          <meshBasicMaterial
            color={state === 'idle' ? '#666666' : '#ffffff'}
            transparent
            opacity={state === 'idle' ? 0.3 : 0.8}
          />
        </mesh>

        {/* Train count indicator dots */}
        {trainCount > 0 && (
          <group position={[0, 0, BOT_CUBE_SIZE / 2 + 0.02]}>
            {Array.from({ length: Math.min(trainCount, 6) }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 6) * Math.PI * 2) * 0.08,
                  Math.sin((i / 6) * Math.PI * 2) * 0.08,
                  0
                ]}
              >
                <circleGeometry args={[0.025, 8]} />
                <meshBasicMaterial color="#ffff88" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </RigidBody>
  )
}

export default BotCube
