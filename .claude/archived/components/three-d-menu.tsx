'use client'

import { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, Line as DreiLine } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

interface Zone {
  name: string
  key: string
  color: string
  position: [number, number, number]
  description: string
  ambientColor: string
  category: string
}

const zones: Zone[] = [
  {
    name: 'Community Impact',
    key: 'community',
    color: '#e87d5c',
    position: [-6, 2, 0],
    description: 'LHBK • Preserving Haitian culture in Brooklyn',
    ambientColor: '#ffaa88',
    category: 'Nonprofit'
  },
  {
    name: 'Enterprise Software',
    key: 'enterprise',
    color: '#4a90e2',
    position: [3, 4, -3],
    description: 'WBS/GVC • Property management solutions',
    ambientColor: '#6ba8ff',
    category: 'PropTech'
  },
  {
    name: 'Hardware & IoT',
    key: 'hardware',
    color: '#50c878',
    position: [-4, -2, -4],
    description: 'FPV • Arduino • ESP32 • IoT Systems',
    ambientColor: '#70e898',
    category: 'Embedded'
  },
  {
    name: 'Financial SaaS',
    key: 'financial',
    color: '#9b59b6',
    position: [6, 1, 2],
    description: 'Anvil • Business intelligence platform',
    ambientColor: '#bb79d6',
    category: 'FinTech'
  },
  {
    name: 'Web Development',
    key: 'webdev',
    color: '#f39c12',
    position: [2, -3, 3],
    description: 'Next.js • TypeScript • Full-stack solutions',
    ambientColor: '#ffbc42',
    category: 'Web'
  }
]

function ConnectionLine({ zone }: { zone: Zone }) {
  const points = useMemo(() => [
    [0, 0, 0] as [number, number, number],
    zone.position.map(v => -v) as [number, number, number]
  ], [zone.position])

  return (
    <DreiLine
      points={points}
      color={zone.color}
      transparent
      opacity={0.2}
    />
  )
}

function ZoneSphere({ zone, onClick, isActive }: { zone: Zone; onClick: () => void; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      
      if (isActive) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1)
      } else if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1)
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
      }
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.003
    }
  })

  return (
    <group position={zone.position}>
      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={zone.color}
          emissive={zone.color}
          emissiveIntensity={isActive ? 0.5 : 0.3}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Glow ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial
          color={zone.color}
          transparent
          opacity={isActive ? 0.5 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label on hover */}
      {hovered && (
        <Html center>
          <div className="glass-effect px-4 py-2 rounded-lg pointer-events-none whitespace-nowrap">
            <p className="text-white font-semibold text-sm">{zone.name}</p>
            <p className="text-slate-300 text-xs">{zone.category}</p>
          </div>
        </Html>
      )}

      {/* Connection line to center */}
      <ConnectionLine zone={zone} />
    </group>
  )
}

function CentralHub() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002
      meshRef.current.rotation.y += 0.003
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#4488ff"
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </mesh>
  )
}

function Particles({ activeZone }: { activeZone: Zone | null }) {
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 1000

  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005
    }
  })

  useEffect(() => {
    if (particlesRef.current && activeZone) {
      const material = particlesRef.current.material as THREE.PointsMaterial
      material.color.set(activeZone.color)
    }
  }, [activeZone])

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  )
}

function Scene({ activeZone, setActiveZone }: { activeZone: Zone | null; setActiveZone: (zone: Zone | null) => void }) {
  const { camera, scene } = useThree()

  useEffect(() => {
    if (activeZone) {
      // Animate camera to zone
      const targetPosition = new THREE.Vector3(...activeZone.position)
      targetPosition.z += 5

      // Smooth camera transition
      const startPos = camera.position.clone()
      const zonePosition = activeZone.position
      const duration = 1500
      const startTime = Date.now()

      function animate() {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)

        camera.position.lerpVectors(startPos, targetPosition, eased)
        camera.lookAt(...zonePosition)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()

      // Update scene background
      scene.background = new THREE.Color(activeZone.ambientColor).multiplyScalar(0.1)
    }
  }, [activeZone, camera, scene])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} color={activeZone?.ambientColor || '#ffffff'} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />

      {/* Scene objects */}
      <CentralHub />
      <Particles activeZone={activeZone} />
      
      {zones.map((zone) => (
        <ZoneSphere
          key={zone.key}
          zone={zone}
          onClick={() => setActiveZone(zone)}
          isActive={activeZone?.key === zone.key}
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom
        enablePan={false}
        minDistance={5}
        maxDistance={30}
      />
      <PerspectiveCamera makeDefault position={[0, 3, 15]} />
    </>
  )
}

export default function ThreeDMenu() {
  const [activeZone, setActiveZone] = useState<Zone | null>(null)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background matching hero section */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/30 to-indigo-950/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas>
          <Suspense fallback={null}>
            <Scene activeZone={activeZone} setActiveZone={setActiveZone} />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Explore My Work
            </span>
          </h2>
          <p className="text-xl text-slate-300">
            Click or hover over each sphere to discover different projects
          </p>
        </motion.div>

        {/* Zone Info Card */}
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-effect px-8 py-6 rounded-2xl max-w-2xl mx-auto pointer-events-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-2">{activeZone.name}</h3>
            <p className="text-slate-300 mb-4">{activeZone.description}</p>
            <div className="flex gap-3">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold hover:shadow-lg transition-all">
                View Projects
              </button>
              <button
                onClick={() => setActiveZone(null)}
                className="px-6 py-2 glass-effect rounded-full text-slate-200 font-semibold hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Menu Buttons */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-3 justify-center pointer-events-auto">
          {zones.map((zone) => (
            <motion.button
              key={zone.key}
              onClick={() => setActiveZone(zone)}
              className="px-4 py-2 glass-effect rounded-full text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/20"
              style={{
                borderColor: activeZone?.key === zone.key ? zone.color : 'rgba(255,255,255,0.2)',
                background: activeZone?.key === zone.key ? `${zone.color}20` : undefined
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {zone.name}
            </motion.button>
          ))}
        </div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm"
        >
          Drag to rotate • Scroll to zoom
        </motion.p>
      </div>
    </section>
  )
}