'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Physics, CuboidCollider, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { LightCube } from '@/components/3d/LightCube'
import { PhysicsVoxelCloud } from '@/components/3d/PhysicsVoxelCloud'
import { voxelizeText } from '@/lib/voxelize-text'

const VOXEL_SIZE = 0.08
const BOUNCE_STRENGTH = 6

/** Loads voxel positions for a text string */
function useVoxelText(text: string, resolution: number) {
  const [positions, setPositions] = useState<THREE.Vector3[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    voxelizeText(text, { resolution })
      .then((voxels) => {
        if (!cancelled) {
          setPositions(voxels)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [text, resolution])

  return { positions, loading }
}

function SceneBloom() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  )
}

/** 3D scene content */
function VoxelScene({
  positions,
  crumble,
}: {
  positions: THREE.Vector3[]
  crumble: boolean
}) {
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight color="#ffffff" intensity={0.15} position={[0, 0, 10]} />

      <Physics gravity={[0, 0, -9.8]} timeStep={1 / 120}>
        {/* Floor */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider
            args={[50, 50, 0.1]}
            position={[0, 0, -0.1]}
            friction={0.2}
            restitution={0.8}
          />
        </RigidBody>

        <LightCube />

        <PhysicsVoxelCloud
          positions={positions}
          voxelSize={VOXEL_SIZE}
          crumble={crumble}
          bounceStrength={BOUNCE_STRENGTH}
          color="#2a2a2a"
          metalness={0.15}
          roughness={0.35}
        />
      </Physics>

      <SceneBloom />
    </>
  )
}

export default function VoxelExperiment() {
  const [crumble, setCrumble] = useState(false)
  const [sceneKey, setSceneKey] = useState(0)

  const { positions, loading } = useVoxelText('KEINO', VOXEL_SIZE)

  const handleCrumble = useCallback(() => {
    setCrumble(true)
  }, [])

  const handleReset = useCallback(() => {
    setCrumble(false)
    setSceneKey((k) => k + 1)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0d0d0f]">
      {/* Control panel */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 bg-black/60 backdrop-blur-md rounded-xl p-4 text-white text-sm max-w-xs">
        <h2 className="text-base font-semibold tracking-wide">Voxel Physics</h2>

        {loading && <p className="text-yellow-400">Voxelizing...</p>}
        {!loading && <p className="text-neutral-400">{positions.length} cubes</p>}

        {!crumble ? (
          <button
            onClick={handleCrumble}
            disabled={loading || positions.length === 0}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg px-3 py-2 transition-colors"
          >
            Crumble
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* 3D Canvas — orthographic top-down to match homepage */}
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: 80, near: 0.1, far: 1000 }}
        style={{ touchAction: 'none' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {positions.length > 0 && (
            <VoxelScene
              key={sceneKey}
              positions={positions}
              crumble={crumble}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
