'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrbitControls, Text3D, Center, Html } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Reusable reset zone component
interface ResetZoneProps {
  position: [number, number, number]
  size?: number
  label?: string
  color?: string
  onReset: () => void
  characterPosition: THREE.Vector3
}

function ResetZone({
  position,
  size = 2,
  label = 'Reset',
  color = '#ff6b6b',
  onReset,
  characterPosition,
}: ResetZoneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isPlayerInZone, setIsPlayerInZone] = useState(false)
  const pulseRef = useRef(0)

  // Check if player is in zone
  useFrame((_, delta) => {
    const zoneCenter = new THREE.Vector3(position[0], position[1], position[2])
    const distance = new THREE.Vector2(
      characterPosition.x - zoneCenter.x,
      characterPosition.z - zoneCenter.z
    ).length()

    const inZone = distance < size / 2
    if (inZone !== isPlayerInZone) {
      setIsPlayerInZone(inZone)
    }

    // Pulse animation
    pulseRef.current += delta * 3
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(pulseRef.current) * 0.2
    }
  })

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isPlayerInZone) {
        onReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlayerInZone, onReset])

  return (
    <group position={position}>
      {/* Glowing floor square */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Border glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[size / 2 - 0.1, size / 2, 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isPlayerInZone ? 0.9 : 0.5}
        />
      </mesh>

      {/* Icon/symbol in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[0.15, 0.25, 32, 1, 0, Math.PI * 1.5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Floating label above zone */}
      <Html
        position={[0, 2, 0]}
        center
        distanceFactor={15}
        style={{
          transition: 'opacity 0.2s',
          opacity: isPlayerInZone ? 1 : 0.7,
          pointerEvents: 'none',
        }}
      >
        <div className="text-center whitespace-nowrap">
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/20 mb-1">
            <p className="text-white font-medium text-sm">{label}</p>
          </div>
          {isPlayerInZone && (
            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-red-400/50 inline-flex items-center gap-1.5">
              <span className="text-white/80 text-xs">Press</span>
              <kbd className="px-1.5 py-0.5 bg-red-500/30 rounded text-red-300 text-xs font-mono">Enter</kbd>
            </div>
          )}
        </div>
      </Html>
    </group>
  )
}

// Floating screen component
interface FloatingScreenProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  width?: number
  height?: number
  title?: string
  children?: React.ReactNode
}

function FloatingScreen({
  position,
  rotation = [0, 0, 0],
  width = 4,
  height = 2.5,
  title,
  children,
}: FloatingScreenProps) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Mesh>(null)
  const floatOffset = useRef(Math.random() * Math.PI * 2)
  const targetRotationY = useRef(rotation[1])
  const currentRotationY = useRef(rotation[1])
  const { camera } = useThree()

  // Click handler to rotate screen to face camera
  const handleClick = useCallback(() => {
    if (!groupRef.current) return

    // Calculate angle from screen to camera
    const screenPos = new THREE.Vector3(position[0], position[1], position[2])
    const cameraPos = camera.position.clone()

    // Get horizontal angle to camera
    const dx = cameraPos.x - screenPos.x
    const dz = cameraPos.z - screenPos.z
    const angleToCamera = Math.atan2(dx, dz)

    // Set target rotation to face camera
    targetRotationY.current = angleToCamera
  }, [camera, position])

  // Gentle floating animation + smooth rotation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime
      groupRef.current.position.y = position[1] + Math.sin(time + floatOffset.current) * 0.1

      // Smoothly interpolate rotation
      const rotDiff = targetRotationY.current - currentRotationY.current
      currentRotationY.current += rotDiff * 0.08
      groupRef.current.rotation.y = currentRotationY.current
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })

  const frameDepth = 0.15
  const bezelWidth = 0.1

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[rotation[0], currentRotationY.current, rotation[2]]}
      onClick={handleClick}
    >
      {/* Screen frame/bezel */}
      <mesh position={[0, 0, -frameDepth / 2]} castShadow>
        <boxGeometry args={[width + bezelWidth * 2, height + bezelWidth * 2, frameDepth]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Screen surface - clickable */}
      <mesh ref={screenRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color="#0a0a15"
          emissive="#1e3a5f"
          emissiveIntensity={0.1}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Screen glow border */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>

      {/* Corner accents */}
      {[
        [-width / 2 - bezelWidth / 2, height / 2 + bezelWidth / 2, frameDepth / 2],
        [width / 2 + bezelWidth / 2, height / 2 + bezelWidth / 2, frameDepth / 2],
        [-width / 2 - bezelWidth / 2, -height / 2 - bezelWidth / 2, frameDepth / 2],
        [width / 2 + bezelWidth / 2, -height / 2 - bezelWidth / 2, frameDepth / 2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Stand/base */}
      <group position={[0, -height / 2 - 0.3, -0.2]}>
        {/* Neck */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.65, 0.1]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.1, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* HTML content overlay */}
      <Html
        position={[0, 0, 0.05]}
        transform
        distanceFactor={1.5}
        style={{
          width: `${width * 100}px`,
          height: `${height * 100}px`,
          pointerEvents: 'none',
        }}
      >
        <div className="w-full h-full flex flex-col text-white p-4 overflow-hidden">
          {title && (
            <div className="border-b border-blue-500/30 pb-2 mb-3">
              <h3 className="text-lg font-bold text-blue-400">{title}</h3>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {children || (
              <div className="space-y-2 text-sm text-slate-300">
                <p>Welcome to my portfolio</p>
                <p className="text-xs text-slate-400">Explore the world to discover my work</p>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  )
}

// 3D Title text with physics - individual letters
function Title3D({ resetKey }: { resetKey: number }) {
  const letters = "Keino's Portfolio".split('')
  const letterSpacing = 1.3
  const startX = -(letters.length * letterSpacing) / 2

  return (
    <group key={resetKey} position={[0, 0, -15]}>
      {letters.map((letter, i) => (
        <RigidBody
          key={`${resetKey}-${i}`}
          position={[startX + i * letterSpacing, 0.8, 0]}
          restitution={0.2}
          friction={1}
          mass={5}
          linearDamping={0.5}
          angularDamping={0.5}
        >
          {letter !== ' ' && (
            <Center>
              <Text3D
                font="/fonts/helvetiker_bold.typeface.json"
                size={1.5}
                height={0.4}
                curveSegments={8}
                bevelEnabled
                bevelThickness={0.02}
                bevelSize={0.01}
                bevelOffset={0}
                bevelSegments={2}
              >
                {letter}
                <meshStandardMaterial
                  color="#ffffff"
                  metalness={0}
                  roughness={0.9}
                />
              </Text3D>
            </Center>
          )}
          <CuboidCollider args={[0.5, 0.8, 0.25]} />
        </RigidBody>
      ))}
    </group>
  )
}

// Ground - circular disc for horizon effect
function Ground() {
  return (
    <RigidBody type="fixed" friction={1}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[300, 64]} />
        <meshStandardMaterial color="#7cb342" roughness={0.9} />
      </mesh>
      <CuboidCollider args={[250, 0.1, 250]} position={[0, -0.1, 0]} />
    </RigidBody>
  )
}

// Pushable box
function PushableBox({ position, color = '#e74c3c', size = 1 }: { position: [number, number, number]; color?: string; size?: number }) {
  return (
    <RigidBody position={position} restitution={0.2} friction={0.8}>
      <mesh castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </RigidBody>
  )
}

// Pushable ball
function PushableBall({ position, color = '#3498db', radius = 0.5 }: { position: [number, number, number]; color?: string; radius?: number }) {
  return (
    <RigidBody position={position} restitution={0.6} friction={0.5} colliders="ball">
      <mesh castShadow>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
    </RigidBody>
  )
}

// Winding Path - connects movie sets with a curved stone path
function WindingPath() {
  // Path waypoints forming a winding trail between sets
  const pathPoints = useMemo(() => [
    // Start from center
    [0, 0],
    // Curve toward Student set (left-back)
    [-5, -2], [-10, -3], [-15, -4], [-18, -5],
    // Back to center area
    [-12, -8], [-6, -12], [0, -15],
    // Toward First Job set (back)
    [0, -18],
    // Curve toward Growth set (right-back)
    [6, -12], [12, -8], [18, -5],
    // Back toward center
    [12, 0], [6, 5], [0, 10],
    // Toward Current set (front)
    [0, 16],
  ], [])

  // Pre-calculate random values once using seeded pseudo-random based on index
  const tileData = useMemo(() => pathPoints.map((_, i) => ({
    rotation: ((i * 7) % 10) * 0.03 - 0.15,
    size: 1.2 + ((i * 3) % 10) * 0.03,
    stones: [0, 1, 2].map(j => ({
      size: 0.2 + ((i + j * 5) % 10) * 0.015,
      rotation: ((i + j) * 13) % 10 * 0.6,
    }))
  })), [pathPoints])

  return (
    <group>
      {/* Path segments as stone tiles */}
      {pathPoints.map(([x, z], i) => (
        <group key={i} position={[x, 0.02, z]}>
          {/* Main path tile */}
          <mesh rotation={[-Math.PI / 2, 0, tileData[i].rotation]} receiveShadow>
            <circleGeometry args={[tileData[i].size, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#8d7b68' : '#9c8b7a'}
              roughness={0.95}
            />
          </mesh>
          {/* Small accent stones */}
          {[0, 1, 2].map((j) => (
            <mesh
              key={j}
              position={[
                Math.cos(j * 2.1 + i) * 0.8,
                0.01,
                Math.sin(j * 2.1 + i) * 0.8
              ]}
              rotation={[-Math.PI / 2, 0, tileData[i].stones[j].rotation]}
              receiveShadow
            >
              <circleGeometry args={[tileData[i].stones[j].size, 6]} />
              <meshStandardMaterial color="#756b5a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Path edge markers / small flowers */}
      {pathPoints.filter((_, i) => i % 3 === 0).map(([x, z], i) => (
        <group key={`marker-${i}`} position={[x + (i % 2 ? 1.8 : -1.8), 0, z]}>
          {/* Small flower/plant */}
          <mesh position={[0, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshStandardMaterial
              color={['#e74c3c', '#f1c40f', '#9b59b6', '#3498db'][i % 4]}
              roughness={0.8}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 4]} />
            <meshStandardMaterial color="#27ae60" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Workspace Scene - office environments representing career stages
// Rises from ground as player approaches
interface WorkspaceProps {
  position: [number, number, number]
  rotation?: number
  label: string
  scene: 'finance' | 'bootcamp' | 'startup' | 'current'
  isActive?: boolean
  distance: number
}

function Workspace({
  position,
  rotation = 0,
  label,
  scene,
  isActive = false,
  distance,
}: WorkspaceProps) {
  const groupRef = useRef<THREE.Group>(null)
  const currentY = useRef(-6)
  const hasRevealed = useRef(false)

  // Rising animation
  useFrame(() => {
    if (!groupRef.current) return

    const revealDistance = 22
    const fullRevealDistance = 10
    let targetY = -6

    if (distance < revealDistance) {
      const progress = 1 - Math.max(0, (distance - fullRevealDistance) / (revealDistance - fullRevealDistance))
      targetY = -6 + progress * 6
      if (progress > 0.5) hasRevealed.current = true
    }

    if (hasRevealed.current && distance < 30) {
      targetY = Math.max(targetY, 0)
    } else if (distance >= 30) {
      hasRevealed.current = false
    }

    currentY.current += (targetY - currentY.current) * 0.05
    groupRef.current.position.y = currentY.current
  })

  // Floor and wall colors by scene
  const sceneColors = {
    finance: { floor: '#8b7355', wall: '#d4c4b0', accent: '#1e3a5f' },      // Corporate beige
    bootcamp: { floor: '#4a4a4a', wall: '#2d2d2d', accent: '#e74c3c' },     // Industrial/modern
    startup: { floor: '#f5f5f5', wall: '#ffffff', accent: '#3498db' },       // Clean white startup
    current: { floor: '#1a1a2e', wall: '#16213e', accent: '#9b59b6' },       // Dark modern dev
  }
  const colors = sceneColors[scene]

  return (
    <group ref={groupRef} position={[position[0], -6, position[2]]} rotation={[0, rotation, 0]}>
      {/* Floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color={colors.floor} roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -5]} castShadow receiveShadow>
        <boxGeometry args={[12, 4, 0.15]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Side walls (partial) */}
      <mesh position={[-6, 1.5, -2]} castShadow>
        <boxGeometry args={[0.15, 3, 6]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[6, 1.5, -2]} castShadow>
        <boxGeometry args={[0.15, 3, 6]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* Ceiling light */}
      <pointLight
        position={[0, 3.5, 0]}
        intensity={isActive ? 30 : 8}
        color="#fff5e6"
        distance={15}
      />
      {/* Light fixture */}
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.15, 8]} />
        <meshStandardMaterial color="#ddd" roughness={0.3} />
      </mesh>

      {/* Scene label sign on wall */}
      <Html position={[0, 3.2, -4.8]} transform>
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
          <p className="text-white font-bold text-sm whitespace-nowrap">{label}</p>
        </div>
      </Html>

      {/* Scene-specific furniture and props */}
      <WorkspaceProps scene={scene} isActive={isActive} />

      {/* NPC */}
      <WorkspaceNPC scene={scene} isActive={isActive} />
    </group>
  )
}

// NPC for workspaces - different outfits per era
function WorkspaceNPC({ scene, isActive }: { scene: string; isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const outfits: Record<string, { shirt: string; pants: string; tie?: boolean; badge?: boolean }> = {
    finance: { shirt: '#ffffff', pants: '#1a1a2e', tie: true },
    bootcamp: { shirt: '#2c3e50', pants: '#34495e' },
    startup: { shirt: '#3498db', pants: '#2c3e50', badge: true },
    current: { shirt: '#9b59b6', pants: '#1a1a2e' },
  }
  const outfit = outfits[scene] || outfits.current

  useFrame((state) => {
    if (groupRef.current && isActive) {
      groupRef.current.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.15, 1]} rotation={[0, Math.PI, 0]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color={outfit.shirt} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#d4a574" roughness={0.8} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.32, 0.12, 0.32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color={outfit.pants} roughness={0.8} />
      </mesh>
      <mesh position={[0.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color={outfit.pants} roughness={0.8} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.3, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={outfit.shirt} roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.4, 0.12]} />
        <meshStandardMaterial color={outfit.shirt} roughness={0.6} />
      </mesh>
      {/* Tie for finance */}
      {outfit.tie && (
        <mesh position={[0, 0.45, 0.13]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshStandardMaterial color="#c0392b" roughness={0.5} />
        </mesh>
      )}
      {/* Badge for startup */}
      {outfit.badge && (
        <mesh position={[0.12, 0.6, 0.13]} castShadow>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshStandardMaterial color="#f1c40f" metalness={0.5} roughness={0.3} />
        </mesh>
      )}
    </group>
  )
}

// Workspace props - furniture specific to each career stage
function WorkspaceProps({ scene, isActive }: { scene: string; isActive: boolean }) {
  switch (scene) {
    case 'finance':
      // Corporate cubicle - NYU Langone / VNSNY style
      return (
        <group>
          {/* L-shaped desk */}
          <mesh position={[-2, 0.4, -2]} castShadow>
            <boxGeometry args={[3, 0.08, 1.2]} />
            <meshStandardMaterial color="#8b7355" roughness={0.7} />
          </mesh>
          <mesh position={[-3.3, 0.4, -1]} castShadow>
            <boxGeometry args={[1.2, 0.08, 3]} />
            <meshStandardMaterial color="#8b7355" roughness={0.7} />
          </mesh>
          {/* Desk legs */}
          {[[-3.3, -2.3], [-0.7, -2.3], [-3.3, 0.3]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.18, z]} castShadow>
              <boxGeometry args={[0.06, 0.4, 0.06]} />
              <meshStandardMaterial color="#5d4e37" roughness={0.8} />
            </mesh>
          ))}
          {/* Dual monitors - Excel dashboards */}
          {[-2.5, -1.5].map((x, i) => (
            <group key={i} position={[x, 0.7, -2.3]}>
              <mesh castShadow>
                <boxGeometry args={[0.8, 0.5, 0.04]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
              </mesh>
              {/* Screen glow when active */}
              {isActive && (
                <mesh position={[0, 0, 0.03]}>
                  <planeGeometry args={[0.7, 0.4]} />
                  <meshBasicMaterial color="#d4edda" />
                </mesh>
              )}
            </group>
          ))}
          {/* Office chair */}
          <group position={[-2, 0, -0.5]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.5, 0.08, 0.5]} />
              <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.6, -0.2]} castShadow>
              <boxGeometry args={[0.5, 0.5, 0.08]} />
              <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
          </group>
          {/* Filing cabinet */}
          <mesh position={[3, 0.6, -3]} castShadow>
            <boxGeometry args={[0.8, 1.2, 0.6]} />
            <meshStandardMaterial color="#7f8c8d" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Stack of papers/reports */}
          <group position={[-1, 0.5, -2]}>
            {[0, 0.03, 0.06].map((y, i) => (
              <mesh key={i} position={[0, y, 0]} castShadow>
                <boxGeometry args={[0.3, 0.02, 0.4]} />
                <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
              </mesh>
            ))}
          </group>
          {/* Coffee mug */}
          <mesh position={[-0.5, 0.48, -1.8]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.1, 8]} />
            <meshStandardMaterial color="#fff" roughness={0.3} />
          </mesh>
          {/* Cubicle partition hint */}
          <mesh position={[0, 1, -4.8]}>
            <boxGeometry args={[8, 0.1, 0.1]} />
            <meshStandardMaterial color="#95a5a6" roughness={0.5} />
          </mesh>
        </group>
      )

    case 'bootcamp':
      // Flatiron School classroom/lab
      return (
        <group>
          {/* Long table with laptop */}
          <mesh position={[0, 0.38, -1.5]} castShadow>
            <boxGeometry args={[6, 0.06, 1.5]} />
            <meshStandardMaterial color="#2c2c2c" roughness={0.5} />
          </mesh>
          {/* Table legs */}
          {[[-2.8, -2], [2.8, -2], [-2.8, -1], [2.8, -1]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.17, z]} castShadow>
              <boxGeometry args={[0.08, 0.35, 0.08]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
            </mesh>
          ))}
          {/* Laptops - multiple for classroom feel */}
          {[-2, 0, 2].map((x, i) => (
            <group key={i} position={[x, 0.45, -1.5]}>
              {/* Base */}
              <mesh castShadow>
                <boxGeometry args={[0.5, 0.02, 0.35]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Screen */}
              <mesh position={[0, 0.2, -0.15]} rotation={[-0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.48, 0.35, 0.02]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
              </mesh>
              {/* Screen glow */}
              {isActive && (
                <mesh position={[0, 0.2, -0.13]} rotation={[-0.3, 0, 0]}>
                  <planeGeometry args={[0.44, 0.3]} />
                  <meshBasicMaterial color="#0a0a0a" />
                </mesh>
              )}
            </group>
          ))}
          {/* Whiteboard on back wall */}
          <mesh position={[0, 2.2, -4.85]} castShadow>
            <boxGeometry args={[5, 2, 0.08]} />
            <meshStandardMaterial color="#f8f8f8" roughness={0.2} />
          </mesh>
          {/* Whiteboard frame */}
          <mesh position={[0, 2.2, -4.8]}>
            <boxGeometry args={[5.2, 2.2, 0.02]} />
            <meshStandardMaterial color="#7f8c8d" roughness={0.5} />
          </mesh>
          {/* Flatiron logo hint - red accent */}
          <mesh position={[-4.5, 2.5, -4.85]}>
            <boxGeometry args={[0.8, 0.8, 0.05]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.5} />
          </mesh>
          {/* Stool */}
          <group position={[0, 0, 0.5]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              <meshStandardMaterial color="#2c3e50" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
              <meshStandardMaterial color="#7f8c8d" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
          {/* Coffee cup */}
          <mesh position={[1, 0.48, -1.3]} castShadow>
            <cylinderGeometry args={[0.05, 0.04, 0.12, 8]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
          </mesh>
        </group>
      )

    case 'startup':
      // Clean startup office - ListedB / SPILL style
      return (
        <group>
          {/* Standing desk */}
          <mesh position={[-2, 0.55, -2.5]} castShadow>
            <boxGeometry args={[2.5, 0.05, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Desk frame */}
          {[[-3, -2.8], [-1, -2.8], [-3, -2.2], [-1, -2.2]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.26, z]} castShadow>
              <boxGeometry args={[0.05, 0.55, 0.05]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
            </mesh>
          ))}
          {/* Monitor */}
          <group position={[-2, 0.9, -2.8]}>
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.55, 0.03]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
            </mesh>
            {isActive && (
              <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[0.8, 0.45]} />
                <meshBasicMaterial color="#1e3a5f" />
              </mesh>
            )}
          </group>
          {/* Slack/Linear on second monitor hint */}
          <group position={[2, 0.8, -3]}>
            <mesh castShadow>
              <boxGeometry args={[0.7, 0.45, 0.03]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
            </mesh>
          </group>
          {/* Bean bag / casual seating */}
          <mesh position={[3, 0.35, 1]} castShadow>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color="#e74c3c" roughness={0.9} />
          </mesh>
          {/* Ping pong table hint */}
          <mesh position={[3, 0.45, -2]} castShadow>
            <boxGeometry args={[1.5, 0.05, 0.8]} />
            <meshStandardMaterial color="#27ae60" roughness={0.7} />
          </mesh>
          {/* Plant */}
          <group position={[4, 0, -3.5]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.15, 0.5, 8]} />
              <meshStandardMaterial color="#d35400" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshStandardMaterial color="#27ae60" roughness={0.9} />
            </mesh>
          </group>
          {/* Wall art / company values */}
          <mesh position={[3, 2, -4.85]}>
            <boxGeometry args={[1.5, 1, 0.05]} />
            <meshStandardMaterial color="#3498db" roughness={0.5} />
          </mesh>
        </group>
      )

    case 'current':
      // Modern dev workspace - WBS / HiTide / GVC - home office or co-working
      return (
        <group>
          {/* Large desk */}
          <mesh position={[0, 0.45, -2.5]} castShadow>
            <boxGeometry args={[4, 0.06, 1.2]} />
            <meshStandardMaterial color="#2c2c2c" roughness={0.4} />
          </mesh>
          {/* Desk frame - gold accents */}
          {[[-1.8, -3], [1.8, -3], [-1.8, -2], [1.8, -2]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.2, z]} castShadow>
              <boxGeometry args={[0.05, 0.45, 0.05]} />
              <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
          {/* Ultrawide monitor */}
          <group position={[0, 0.85, -2.9]}>
            <mesh castShadow>
              <boxGeometry args={[1.8, 0.6, 0.04]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.1} />
            </mesh>
            {isActive && (
              <mesh position={[0, 0, 0.03]}>
                <planeGeometry args={[1.7, 0.5]} />
                <meshBasicMaterial color="#16213e" />
              </mesh>
            )}
          </group>
          {/* RGB strip under desk */}
          <mesh position={[0, 0.4, -1.9]}>
            <boxGeometry args={[3.8, 0.02, 0.02]} />
            <meshStandardMaterial color="#9b59b6" emissive="#9b59b6" emissiveIntensity={isActive ? 1 : 0.3} />
          </mesh>
          {/* Mechanical keyboard */}
          <mesh position={[0, 0.5, -2.3]} castShadow>
            <boxGeometry args={[0.55, 0.04, 0.18]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
          </mesh>
          {/* Multiple client setup - second laptop */}
          <group position={[2.5, 0.5, -1.5]} rotation={[0, -0.4, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 0.02, 0.35]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.18, -0.15]} rotation={[-0.4, 0, 0]} castShadow>
              <boxGeometry args={[0.48, 0.32, 0.02]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
            </mesh>
          </group>
          {/* Headphones */}
          <mesh position={[-1.5, 0.55, -2]} castShadow>
            <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Plant */}
          <group position={[1.5, 0.52, -2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.06, 0.1, 6]} />
              <meshStandardMaterial color="#fff" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.08, 0]} castShadow>
              <dodecahedronGeometry args={[0.06]} />
              <meshStandardMaterial color="#27ae60" roughness={0.9} />
            </mesh>
          </group>
          {/* Figurine */}
          <group position={[-1.8, 0.55, -2.5]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.12, 0.08]} />
              <meshStandardMaterial color="#9b59b6" roughness={0.5} />
            </mesh>
          </group>
          {/* Wall shelf with books */}
          <mesh position={[-4, 1.8, -4.85]} castShadow>
            <boxGeometry args={[2, 0.08, 0.3]} />
            <meshStandardMaterial color="#8b7355" roughness={0.7} />
          </mesh>
          {[[-4.6, '#3498db'], [-4.3, '#e74c3c'], [-4, '#f1c40f']].map(([x, color], i) => (
            <mesh key={i} position={[x as number, 1.95, -4.75]} castShadow>
              <boxGeometry args={[0.15, 0.25, 0.2]} />
              <meshStandardMaterial color={color as string} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )

    default:
      return null
  }
}

// Tree decoration
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 6]} />
        <meshStandardMaterial color="#8b6f47" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <coneGeometry args={[0.5, 0.8, 6]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.4, 0.7, 6]} />
        <meshStandardMaterial color="#66bb6a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.25, 0.5, 6]} />
        <meshStandardMaterial color="#81c784" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Physics character controller
function PhysicsCharacter({ onPositionUpdate }: { onPositionUpdate: (pos: THREE.Vector3, rotation: number, isMoving: boolean) => void }) {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const characterGroupRef = useRef<THREE.Group>(null)
  const characterRotation = useRef(0)
  const isGroundedRef = useRef(true)
  const cameraAngleRef = useRef(Math.PI / 4)
  const lockedCameraAngle = useRef<number | null>(null) // Lock camera angle when moving
  const wasMoving = useRef(false)
  const { camera } = useThree()

  // Animation state
  const timeRef = useRef(0)
  const leftLegRef = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)

  // Keyboard state
  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          keysRef.current.forward = true
          break
        case 'arrowdown':
        case 's':
          keysRef.current.backward = true
          break
        case 'arrowleft':
        case 'a':
          keysRef.current.left = true
          break
        case 'arrowright':
        case 'd':
          keysRef.current.right = true
          break
        case ' ':
          keysRef.current.jump = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          keysRef.current.forward = false
          break
        case 'arrowdown':
        case 's':
          keysRef.current.backward = false
          break
        case 'arrowleft':
        case 'a':
          keysRef.current.left = false
          break
        case 'arrowright':
        case 'd':
          keysRef.current.right = false
          break
        case ' ':
          keysRef.current.jump = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return

    const keys = keysRef.current
    const speed = 8
    const jumpForce = 8

    // Get current velocity
    const velocity = rigidBodyRef.current.linvel()
    const position = rigidBodyRef.current.translation()

    // Check if grounded (simple check based on y velocity)
    isGroundedRef.current = Math.abs(velocity.y) < 0.1 && position.y < 0.6

    // Calculate current camera angle
    const cameraPos = camera.position
    cameraAngleRef.current = Math.atan2(cameraPos.x - position.x, cameraPos.z - position.z)

    // Joystick-style movement
    const inputDirection = new THREE.Vector3()
    if (keys.forward) inputDirection.z -= 1
    if (keys.backward) inputDirection.z += 1
    if (keys.left) inputDirection.x -= 1
    if (keys.right) inputDirection.x += 1

    const isMoving = inputDirection.length() > 0

    // Lock camera angle when starting to move, unlock when stopping
    if (isMoving && !wasMoving.current) {
      // Just started moving - lock current camera angle
      lockedCameraAngle.current = cameraAngleRef.current
    } else if (!isMoving && wasMoving.current) {
      // Just stopped - unlock
      lockedCameraAngle.current = null
    }
    wasMoving.current = isMoving

    // Use locked angle while moving to prevent circular walking
    const moveAngle = lockedCameraAngle.current ?? cameraAngleRef.current

    if (isMoving) {
      inputDirection.normalize()
      inputDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), moveAngle)

      // Face movement direction
      const targetRotation = Math.atan2(inputDirection.x, inputDirection.z)
      let rotDiff = targetRotation - characterRotation.current
      if (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      if (rotDiff < -Math.PI) rotDiff += Math.PI * 2
      characterRotation.current += rotDiff * 0.15

      // Set velocity
      rigidBodyRef.current.setLinvel(
        { x: inputDirection.x * speed, y: velocity.y, z: inputDirection.z * speed },
        true
      )
    } else {
      // Apply friction when not moving
      rigidBodyRef.current.setLinvel(
        { x: velocity.x * 0.9, y: velocity.y, z: velocity.z * 0.9 },
        true
      )
    }

    // Jump
    if (keys.jump && isGroundedRef.current) {
      rigidBodyRef.current.setLinvel(
        { x: velocity.x, y: jumpForce, z: velocity.z },
        true
      )
    }

    // Boundary clamp
    const boundary = 25
    if (Math.abs(position.x) > boundary || Math.abs(position.z) > boundary) {
      rigidBodyRef.current.setTranslation({
        x: Math.max(-boundary, Math.min(boundary, position.x)),
        y: position.y,
        z: Math.max(-boundary, Math.min(boundary, position.z)),
      }, true)
    }

    // Update parent with position
    onPositionUpdate(new THREE.Vector3(position.x, position.y, position.z), characterRotation.current, isMoving)

    // Update character rotation via ref
    if (characterGroupRef.current) {
      characterGroupRef.current.rotation.y = characterRotation.current
    }

    // Animate character
    if (isMoving) {
      timeRef.current += delta * 10
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(timeRef.current) * 0.6
        rightLegRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.6
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(timeRef.current + Math.PI) * 0.4
        rightArmRef.current.rotation.x = Math.sin(timeRef.current) * 0.4
      }
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.9
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.9
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[0, 2, 0]}
      enabledRotations={[false, false, false]}
      mass={1}
      friction={0.5}
      restitution={0}
      lockRotations
    >
      <CuboidCollider args={[0.3, 0.6, 0.3]} position={[0, 0.6, 0]} />
      <group ref={characterGroupRef}>
        {/* Body/Torso */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.25]} />
          <meshStandardMaterial color="#4a90e2" roughness={0.6} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ffdbac" roughness={0.8} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.32, 0.12, 0.32]} />
          <meshStandardMaterial color="#4a3728" roughness={0.9} />
        </mesh>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0.25, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.8} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0.25, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
            <meshStandardMaterial color="#2c3e50" roughness={0.8} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.3, 0.55, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#4a90e2" roughness={0.6} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.3, 0.55, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.12, 0.4, 0.12]} />
            <meshStandardMaterial color="#4a90e2" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </RigidBody>
  )
}

// Main scene with character controls
function Scene() {
  const { camera } = useThree()
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)
  const characterPosRef = useRef(new THREE.Vector3(0, 0, 0))
  const characterRotRef = useRef(0)
  const isMovingRef = useRef(false)
  const targetCameraAngle = useRef(Math.PI / 4) // Initial camera angle
  const manualPanRef = useRef({ left: false, right: false })
  const isDraggingRef = useRef(false) // Track if user is dragging
  const dragCooldownRef = useRef(0) // Cooldown after drag ends before auto-recenter kicks in
  const [titleResetKey, setTitleResetKey] = useState(0)

  const handlePositionUpdate = (pos: THREE.Vector3, rotation: number, isMoving: boolean) => {
    characterPosRef.current.copy(pos)
    characterRotRef.current = rotation
    isMovingRef.current = isMoving
  }

  const handleTitleReset = useCallback(() => {
    setTitleResetKey(prev => prev + 1)
  }, [])

  // Track drag state and Q/E keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') manualPanRef.current.left = true
      if (e.key.toLowerCase() === 'e') manualPanRef.current.right = true
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q') manualPanRef.current.left = false
      if (e.key.toLowerCase() === 'e') manualPanRef.current.right = false
    }
    const handleMouseDown = () => {
      isDraggingRef.current = true
      dragCooldownRef.current = 60 // ~1 second cooldown after drag
    }
    const handleMouseUp = () => {
      isDraggingRef.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useFrame(() => {
    if (!controlsRef.current) return

    const controls = controlsRef.current
    const target = controls.target
    const charPos = characterPosRef.current

    // Decrease drag cooldown
    if (dragCooldownRef.current > 0) {
      dragCooldownRef.current -= 1
    }

    // Smoothly update orbit controls target to follow character
    target.x += (charPos.x - target.x) * 0.1
    target.y += (charPos.y - target.y) * 0.1
    target.z += (charPos.z - target.z) * 0.1

    // Get current camera angle around target
    const dx = camera.position.x - target.x
    const dz = camera.position.z - target.z
    const currentAngle = Math.atan2(dx, dz)
    const distance = Math.sqrt(dx * dx + dz * dz)

    // Priority hierarchy:
    // 1. Dragging (OrbitControls) - highest priority, no interference
    // 2. Q/E manual pan - second priority
    // 3. Auto-recenter - lowest priority, only when not dragging and after cooldown

    const isManualPanning = manualPanRef.current.left || manualPanRef.current.right
    const isDragging = isDraggingRef.current
    const isInCooldown = dragCooldownRef.current > 0

    // If dragging, sync our target angle to match where user dragged to
    if (isDragging || isInCooldown) {
      targetCameraAngle.current = currentAngle
      return // Don't apply any auto-rotation while dragging or in cooldown
    }

    // Manual pan with Q/E keys (priority 2)
    if (isManualPanning) {
      const panSpeed = 0.03
      if (manualPanRef.current.left) {
        targetCameraAngle.current -= panSpeed
      }
      if (manualPanRef.current.right) {
        targetCameraAngle.current += panSpeed
      }
    } else {
      // Auto-recenter logic (priority 3) - only when character near edge and moving
      const charDx = charPos.x - camera.position.x
      const charDz = charPos.z - camera.position.z
      const angleToChar = Math.atan2(charDx, charDz)
      const cameraForward = currentAngle + Math.PI

      let viewAngleDiff = angleToChar - cameraForward
      while (viewAngleDiff > Math.PI) viewAngleDiff -= Math.PI * 2
      while (viewAngleDiff < -Math.PI) viewAngleDiff += Math.PI * 2

      const edgeThreshold = Math.PI / 4 // 45 degrees
      const isNearEdge = Math.abs(viewAngleDiff) > edgeThreshold

      if (isNearEdge && isMovingRef.current) {
        const rotateDirection = viewAngleDiff > 0 ? 1 : -1
        targetCameraAngle.current += rotateDirection * 0.008 // Gentle rotation
      }
    }

    // Smoothly interpolate camera to target angle
    let angleDiff = targetCameraAngle.current - currentAngle
    // Normalize angle difference to [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2

    // Apply rotation - faster for manual pan, slower for auto-adjust
    const rotationSpeed = isManualPanning ? 0.08 : 0.05
    const newAngle = currentAngle + angleDiff * rotationSpeed

    // Update camera position in orbit
    camera.position.x = target.x + Math.sin(newAngle) * distance
    camera.position.z = target.z + Math.cos(newAngle) * distance
  })

  // Workspaces arranged around the world - each representing a career stage
  const workspaces: {
    position: [number, number, number]
    rotation: number
    label: string
    scene: 'finance' | 'bootcamp' | 'startup' | 'current'
  }[] = [
    { position: [-20, 0, -5], rotation: Math.PI / 4, label: 'Financial Analyst (2015-2022)', scene: 'finance' },
    { position: [0, 0, -20], rotation: 0, label: 'Flatiron School (2023)', scene: 'bootcamp' },
    { position: [20, 0, -5], rotation: -Math.PI / 4, label: 'First Tech Jobs (2023-2024)', scene: 'startup' },
    { position: [0, 0, 20], rotation: Math.PI, label: 'Software Engineer (2024-Present)', scene: 'current' },
  ]

  // Determine which workspace is active based on character proximity
  const getActiveSetIndex = () => {
    const charPos = characterPosRef.current
    let closestIndex = -1
    let closestDist = 12 // Must be within 12 units to activate

    workspaces.forEach((ws, i) => {
      const dist = Math.sqrt(
        Math.pow(charPos.x - ws.position[0], 2) +
        Math.pow(charPos.z - ws.position[2], 2)
      )
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = i
      }
    })
    return closestIndex
  }

  const [activeSetIndex, setActiveSetIndex] = useState(-1)
  const [setDistances, setSetDistances] = useState<number[]>([999, 999, 999, 999])

  // Calculate distances to each workspace
  const getDistances = () => {
    const charPos = characterPosRef.current
    return workspaces.map((ws) =>
      Math.sqrt(
        Math.pow(charPos.x - ws.position[0], 2) +
        Math.pow(charPos.z - ws.position[2], 2)
      )
    )
  }

  // Update active set and distances
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSetIndex(getActiveSetIndex())
      setSetDistances(getDistances())
    }, 50) // Faster update for smoother animation
    return () => clearInterval(interval)
  }, [])

  // Trees around the world - scattered, avoiding set locations
  const trees = [
    // Scattered trees between sets
    [10, 0, 10], [-10, 0, 10], [15, 0, 15], [-15, 0, 15],
    [-15, 0, -15], [15, 0, -15],
    // Edge trees (suggest boundary)
    [22, 0, 8], [22, 0, -16],
    [-22, 0, 8], [-22, 0, -16],
    [16, 0, 22], [-16, 0, 22],
    // Corner clusters
    [20, 0, 20], [18, 0, 22], [22, 0, 18],
    [-20, 0, 20], [-18, 0, 22], [-22, 0, 18],
  ] as [number, number, number][]

  // Pushable objects scattered around center area
  const boxes = [
    { position: [3, 0.5, 3] as [number, number, number], color: '#e74c3c', size: 1 },
    { position: [-4, 0.5, 2] as [number, number, number], color: '#9b59b6', size: 0.8 },
  ]

  const balls = [
    { position: [2, 0.5, -2] as [number, number, number], color: '#3498db', radius: 0.5 },
    { position: [-2, 0.5, 4] as [number, number, number], color: '#e91e63', radius: 0.6 },
  ]

  return (
    <>
      {/* Scene background color to match ground */}
      <color attach="background" args={['#7cb342']} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#8b6f47" />

      {/* Physics World */}
      <Physics gravity={[0, -20, 0]}>
        {/* Ground */}
        <Ground />

        {/* 3D Title with physics */}
        <Title3D resetKey={titleResetKey} />

        {/* Reset zone for title - positioned beside the title */}
        <ResetZone
          position={[12, 0, -15]}
          size={2.5}
          label="Reset Title"
          color="#ff6b6b"
          onReset={handleTitleReset}
          characterPosition={characterPosRef.current}
        />

        {/* Character with physics */}
        <PhysicsCharacter onPositionUpdate={handlePositionUpdate} />

        {/* Pushable boxes */}
        {boxes.map((box, i) => (
          <PushableBox key={`box-${i}`} {...box} />
        ))}

        {/* Pushable balls */}
        {balls.map((ball, i) => (
          <PushableBall key={`ball-${i}`} {...ball} />
        ))}
      </Physics>

      {/* Trees (outside physics for performance) */}
      {trees.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}

      {/* Winding Path connecting the workspaces */}
      <WindingPath />

      {/* Workspaces - rise from ground as you approach */}
      {workspaces.map((ws, i) => (
        <Workspace
          key={i}
          position={ws.position}
          rotation={ws.rotation}
          label={ws.label}
          scene={ws.scene}
          isActive={activeSetIndex === i}
          distance={setDistances[i]}
        />
      ))}

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[-8, 10, -8]} fov={50} />

      {/* Orbit controls for drag pan and zoom */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={60}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE
        }}
      />
    </>
  )
}

export default function IsometricWorld() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Prevent page scroll when using scroll wheel on canvas
  useEffect(() => {
    const preventDefault = (e: WheelEvent) => {
      e.preventDefault()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('wheel', preventDefault, { passive: false })

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('wheel', preventDefault)
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-[#7cb342] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#7cb342] z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white text-2xl font-bold"
          >
            Loading...
          </motion.div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas shadows className="absolute inset-0">
        <Scene />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 right-8"
        >
          <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
            <p className="text-white/90 font-medium text-sm mb-2">Controls</p>
            <div className="flex flex-col gap-1.5 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 font-mono">WASD</kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 font-mono">Q/E</kbd>
                <span>Pan Camera</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 font-mono">Space</kbd>
                <span>Jump</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-white/10 rounded border border-white/20 font-mono">Scroll</kbd>
                <span>Zoom</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
