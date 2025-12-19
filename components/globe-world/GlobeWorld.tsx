'use client'

import { useState, useRef, useEffect, Suspense, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'

import { Globe } from './Globe'
import { Atmosphere } from './Atmosphere'
import { OrbitingParticles } from './OrbitingParticles'
import { BuildingOnGlobe } from './BuildingOnGlobe'
import { ScrollZoom } from './ScrollZoom'
import {
  BuildingData,
  CameraPhase,
  globeBuildings,
  GLOBE_CONFIG,
  CAMERA_POSITIONS
} from './types'

interface SceneProps {
  activeBuilding: BuildingData | null
  setActiveBuilding: (building: BuildingData | null) => void
  scrollProgress: number
  onPhaseChange: (phase: CameraPhase) => void
}

function Scene({
  activeBuilding,
  setActiveBuilding,
  scrollProgress,
  onPhaseChange
}: SceneProps) {
  const controlsRef = useRef<React.ElementRef<typeof OrbitControls>>(null)

  return (
    <>
      {/* Scroll-based camera controller */}
      <ScrollZoom
        scrollProgress={scrollProgress}
        onPhaseChange={onPhaseChange}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[20, 20, 10]}
        intensity={0.6}
        castShadow
      />
      <hemisphereLight
        color="#4488ff"
        groundColor="#1a1a2e"
        intensity={0.3}
      />
      <pointLight position={[-20, 10, -20]} intensity={0.3} color="#ff8844" />

      {/* Globe */}
      <Globe radius={GLOBE_CONFIG.radius} />

      {/* Atmosphere glow */}
      <Atmosphere radius={GLOBE_CONFIG.radius} />

      {/* Orbiting particles */}
      <OrbitingParticles radius={GLOBE_CONFIG.radius} />

      {/* Buildings on globe surface */}
      {globeBuildings.map((building) => (
        <BuildingOnGlobe
          key={building.key}
          building={building}
          globeRadius={GLOBE_CONFIG.radius}
          onClick={() => setActiveBuilding(building)}
          isActive={activeBuilding?.key === building.key}
        />
      ))}

      {/* Camera controls for user interaction */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        enableZoom
        enablePan={false}
        minDistance={20}
        maxDistance={50}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 6}
      />

      <PerspectiveCamera
        makeDefault
        position={CAMERA_POSITIONS.hero.position}
        fov={CAMERA_POSITIONS.hero.fov}
      />
    </>
  )
}

export default function GlobeWorld() {
  const [activeBuilding, setActiveBuilding] = useState<BuildingData | null>(null)
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('hero')
  const [scrollProgress, setScrollProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  // Track scroll position relative to this section
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionHeight = rect.height

      // Calculate progress: 0 when section enters view, 1 when it leaves
      // Start transitioning when section is 20% into view
      const startOffset = windowHeight * 0.8
      const endOffset = -sectionHeight * 0.3

      if (rect.top > startOffset) {
        setScrollProgress(0)
      } else if (rect.top < endOffset) {
        setScrollProgress(1)
      } else {
        const totalDistance = startOffset - endOffset
        const currentDistance = startOffset - rect.top
        setScrollProgress(Math.min(Math.max(currentDistance / totalDistance, 0), 1))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePhaseChange = useCallback((phase: CameraPhase) => {
    setCameraPhase(phase)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-900" />

      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
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
            <Scene
              activeBuilding={activeBuilding}
              setActiveBuilding={setActiveBuilding}
              scrollProgress={scrollProgress}
              onPhaseChange={handlePhaseChange}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 pointer-events-none w-full">
        {/* Section Header - fades out as user scrolls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: cameraPhase === 'hero' ? 1 : 0.3,
            y: 0
          }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 pt-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Welcome to My World
            </span>
          </h2>
          <p className="text-xl text-slate-300">
            Explore different areas of my work on this globe
          </p>
        </motion.div>

        {/* Building Info Card */}
        <AnimatePresence>
          {activeBuilding && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect px-8 py-6 rounded-2xl max-w-2xl pointer-events-auto"
            >
              <div
                className="w-2 h-full absolute left-0 top-0 rounded-l-2xl"
                style={{ backgroundColor: activeBuilding.color }}
              />
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeBuilding.name}
              </h3>
              <p className="text-sm text-slate-400 mb-2">
                {activeBuilding.category}
              </p>
              <p className="text-slate-300 mb-4">{activeBuilding.description}</p>
              <div className="flex gap-3">
                <button
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${activeBuilding.color}, ${activeBuilding.roofColor})`
                  }}
                >
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
        </AnimatePresence>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: cameraPhase !== 'hero' ? 1 : 0.6,
            y: 0
          }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-wrap gap-3 justify-center pointer-events-auto max-w-4xl px-4"
        >
          {globeBuildings.map((building) => (
            <motion.button
              key={building.key}
              onClick={() => setActiveBuilding(building)}
              className="px-4 py-2 glass-effect rounded-full text-white text-sm font-medium hover:bg-white/10 transition-all border border-white/20"
              style={{
                borderColor:
                  activeBuilding?.key === building.key
                    ? building.color
                    : 'rgba(255,255,255,0.2)',
                background:
                  activeBuilding?.key === building.key
                    ? `${building.color}20`
                    : undefined
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {building.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: cameraPhase === 'settled' ? 1 : 0.5 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 text-slate-400 text-sm text-center"
        >
          Click buildings to explore | Drag to rotate the view
        </motion.p>

        {/* Scroll indicator - only shows in hero phase */}
        {cameraPhase === 'hero' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <span className="text-slate-400 text-sm mb-2">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center pt-2"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1], y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
