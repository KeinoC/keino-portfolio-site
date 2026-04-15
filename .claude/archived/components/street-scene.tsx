'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface Building {
  name: string
  key: string
  color: string
  position: [number, number, number]
  size: [number, number, number] // width, height, depth
  description: string
  category: string
  roofColor: string
  windowColor: string
}

const buildings: Building[] = [
  {
    name: 'Community Center',
    key: 'community',
    color: '#e87d5c',
    roofColor: '#d66b4a',
    windowColor: '#ffcc99',
    position: [-8, 0, 2],
    size: [3, 4, 3],
    description: 'LHBK • Preserving Haitian culture in Brooklyn',
    category: 'Nonprofit'
  },
  {
    name: 'Office Tower',
    key: 'enterprise',
    color: '#4a90e2',
    roofColor: '#3a7bc8',
    windowColor: '#a8d5ff',
    position: [0, 0, -4],
    size: [2.5, 6, 2.5],
    description: 'WBS/GVC • Property management solutions',
    category: 'PropTech'
  },
  {
    name: 'Maker Space',
    key: 'hardware',
    color: '#50c878',
    roofColor: '#40a860',
    windowColor: '#90e8b0',
    position: [-4, 0, -2],
    size: [3, 3.5, 3],
    description: 'FPV • Arduino • ESP32 • IoT Systems',
    category: 'Embedded'
  },
  {
    name: 'Startup Hub',
    key: 'financial',
    color: '#9b59b6',
    roofColor: '#7d3c94',
    windowColor: '#d5a6e8',
    position: [4, 0, 0],
    size: [2.8, 5, 2.8],
    description: 'Anvil • Business intelligence platform',
    category: 'FinTech'
  },
  {
    name: 'Design Studio',
    key: 'webdev',
    color: '#f39c12',
    roofColor: '#d68910',
    windowColor: '#ffd699',
    position: [8, 0, 2],
    size: [3, 4.5, 3],
    description: 'Next.js • TypeScript • Full-stack solutions',
    category: 'Web'
  }
]

function Window({ position, color }: { position: [number, number, number]; color: string }) {
  const [lit, setLit] = useState(Math.random() > 0.3)

  useEffect(() => {
    const interval = setInterval(() => {
      setLit(Math.random() > 0.2)
    }, Math.random() * 5000 + 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.4, 0.05]} />
      <meshStandardMaterial
        color={lit ? color : '#333333'}
        emissive={lit ? color : '#000000'}
        emissiveIntensity={lit ? 0.8 : 0}
      />
    </mesh>
  )
}

function BuildingMesh({ building, onClick, isActive }: { 
  building: Building
  onClick: () => void
  isActive: boolean 
}) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [width, height, depth] = building.size

  useFrame(() => {
    if (meshRef.current) {
      if (isActive) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.05, 1.05, 1.05), 0.1)
      } else if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.02, 1.02, 1.02), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
  })

  // Generate window positions
  const windows = []
  const floors = Math.floor(height)
  const windowsPerFloor = Math.floor(width * 1.5)
  
  for (let floor = 1; floor < floors; floor++) {
    for (let i = 0; i < windowsPerFloor; i++) {
      windows.push({
        x: (i - windowsPerFloor / 2) * 0.6,
        y: floor * 0.8,
        z: depth / 2 + 0.01
      })
    }
  }

  return (
    <group
      ref={meshRef}
      position={[building.position[0], building.position[1] + height / 2, building.position[2]]}
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
          emissiveIntensity={isActive ? 0.3 : hovered ? 0.15 : 0.05}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height / 2 + 0.2, 0]}>
        <boxGeometry args={[width + 0.3, 0.4, depth + 0.3]} />
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
          position={[win.x, win.y - height / 2, win.z]}
          color={building.windowColor}
        />
      ))}

      {/* Door */}
      <mesh position={[0, -height / 2 + 0.5, depth / 2 + 0.01]}>
        <boxGeometry args={[0.6, 1, 0.05]} />
        <meshStandardMaterial
          color="#2c1810"
          roughness={0.9}
        />
      </mesh>

      {/* Hover label */}
      {hovered && !isActive && (
        <Html center position={[0, height / 2 + 1, 0]}>
          <div className="glass-effect px-4 py-2 rounded-lg pointer-events-none whitespace-nowrap">
            <p className="text-white font-semibold text-sm">{building.name}</p>
            <p className="text-slate-300 text-xs">{building.category}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function Street() {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Main street */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.9} />
      </mesh>

      {/* Street lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[24, 0.1]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.5} />
      </mesh>

      {/* Sidewalks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4.5]}>
        <planeGeometry args={[24, 1]} />
        <meshStandardMaterial color="#808080" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 4.5]}>
        <planeGeometry args={[24, 1]} />
        <meshStandardMaterial color="#808080" roughness={0.8} />
      </mesh>
    </group>
  )
}

function StreetLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Light fixture */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffffcc"
          emissive="#ffffcc"
          emissiveIntensity={1}
        />
      </mesh>

      {/* Point light */}
      <pointLight position={[0, 4, 0]} intensity={2} distance={8} color="#ffffcc" />
    </group>
  )
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1.6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.9} />
      </mesh>

      {/* Foliage */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#1a1a1a" roughness={1} />
    </mesh>
  )
}

function Scene({ 
  activeBuilding, 
  setActiveBuilding 
}: { 
  activeBuilding: Building | null
  setActiveBuilding: (building: Building | null) => void 
}) {
  const { camera, scene } = useThree()
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null)

  useEffect(() => {
    if (activeBuilding) {
      // Animate camera to building
      const targetPosition = new THREE.Vector3(
        activeBuilding.position[0],
        activeBuilding.size[1] / 2 + 2,
        activeBuilding.position[2] + 8
      )
      const lookAtPosition = new THREE.Vector3(...activeBuilding.position)
      lookAtPosition.y = activeBuilding.size[1] / 2

      const startPos = camera.position.clone()
      const startTarget = controlsRef.current?.target.clone() || new THREE.Vector3()
      
      let progress = 0
      const duration = 1500
      const startTime = Date.now()

      function animate() {
        const elapsed = Date.now() - startTime
        progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        camera.position.lerpVectors(startPos, targetPosition, eased)
        if (controlsRef.current) {
          controlsRef.current.target.lerpVectors(startTarget, lookAtPosition, eased)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()

      // Update scene lighting/atmosphere
      scene.fog = new THREE.Fog(activeBuilding.color, 20, 40)
    } else {
      scene.fog = new THREE.Fog('#0a0a1a', 25, 50)
    }
  }, [activeBuilding, camera, scene])

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light (moonlight) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        castShadow
      />

      {/* Atmospheric fill light */}
      <hemisphereLight
        color="#4488ff"
        groundColor="#1a1a2e"
        intensity={0.3}
      />

      {/* Ground and street */}
      <Ground />
      <Street />

      {/* Buildings */}
      {buildings.map((building) => (
        <BuildingMesh
          key={building.key}
          building={building}
          onClick={() => setActiveBuilding(building)}
          isActive={activeBuilding?.key === building.key}
        />
      ))}

      {/* Street lights */}
      <StreetLight position={[-10, 0, -4.5]} />
      <StreetLight position={[-5, 0, 4.5]} />
      <StreetLight position={[0, 0, -4.5]} />
      <StreetLight position={[5, 0, 4.5]} />
      <StreetLight position={[10, 0, -4.5]} />

      {/* Trees */}
      <Tree position={[-10, 0, 4]} />
      <Tree position={[-6, 0, -3]} />
      <Tree position={[6, 0, 3.5]} />
      <Tree position={[10, 0, -3.5]} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        enableZoom
        enablePan
        minDistance={8}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.2}
      />
      <PerspectiveCamera makeDefault position={[0, 12, 20]} />
    </>
  )
}

export default function StreetScene() {
  const [activeBuilding, setActiveBuilding] = useState<Building | null>(null)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-900" />
      
      {/* Stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.7 + 0.3
            }}
            animate={{
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene activeBuilding={activeBuilding} setActiveBuilding={setActiveBuilding} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 pointer-events-none w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 pt-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              My Neighborhood
            </span>
          </h2>
          <p className="text-xl text-slate-300">
            Explore different areas of my work
          </p>
        </motion.div>

        {/* Building Info Card */}
        {activeBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect px-8 py-6 rounded-2xl max-w-2xl pointer-events-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-2">{activeBuilding.name}</h3>
            <p className="text-slate-300 mb-4">{activeBuilding.description}</p>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold hover:shadow-lg transition-all">
                View Projects
              </button>
              <button
                onClick={() => setActiveBuilding(null)}
                className="px-6 py-2 glass-effect rounded-full text-slate-200 font-semibold hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-3 justify-center pointer-events-auto">
          {buildings.map((building) => (
            <motion.button
              key={building.key}
              onClick={() => setActiveBuilding(building)}
              className="px-4 py-2 glass-effect rounded-full text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/20"
              style={{
                borderColor: activeBuilding?.key === building.key ? building.color : 'rgba(255,255,255,0.2)',
                background: activeBuilding?.key === building.key ? `${building.color}20` : undefined
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {building.name}
            </motion.button>
          ))}
        </div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm text-center"
        >
          Click buildings to explore • Drag to look around • Scroll to zoom
        </motion.p>
      </div>
    </section>
  )
}