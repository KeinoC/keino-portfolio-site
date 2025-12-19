'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { GeometricOutline3D } from './GeometricOutline3D'
import {
  Neumorphic3DButtonProps,
  UI3D_COLORS,
  UI3D_SIZES,
} from './types'

/**
 * Neumorphic3DButton - A 3D button with geometric line art
 *
 * States:
 * - Unpowered: Geometric line art (thin reflective metallic lines)
 * - Powered: Solid raised neumorphic button
 * - Active: Pressed down state when selected
 *
 * No labels - buttons are purely visual geometric shapes.
 * Designed to work on 3D planes and surfaces.
 */
export function Neumorphic3DButton({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isPowered = false,
  isActive = false,
  onClick,
  onHover,
  disabled = false,
  width = UI3D_SIZES.navButton.width,
  height = UI3D_SIZES.navButton.height,
  depth = UI3D_SIZES.navButton.depth,
  pattern = 'corner-accent',
}: Neumorphic3DButtonProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Animation refs for smooth transitions
  const raiseProgress = useRef(0)      // 0 = flat/lines, 1 = raised/solid
  const pressProgress = useRef(0)      // 0 = normal, 1 = pressed
  const solidOpacity = useRef(0)       // 0 = transparent, 1 = solid
  const lineOpacity = useRef(1)        // 1 = visible lines, 0 = hidden

  const raisedDepth = UI3D_SIZES.navButton.raisedDepth

  useFrame((_, delta) => {
    // Animate raise/lower based on power state
    const raiseTarget = isPowered ? 1 : 0
    raiseProgress.current += (raiseTarget - raiseProgress.current) * 6 * delta

    // Animate press based on active or pressed state
    const pressTarget = isActive ? 0.6 : (isPressed ? 1 : 0)
    pressProgress.current += (pressTarget - pressProgress.current) * 12 * delta

    // Crossfade: lines fade out as solid fades in
    const solidTarget = isPowered ? 1 : 0
    solidOpacity.current += (solidTarget - solidOpacity.current) * 5 * delta

    const lineTarget = isPowered ? 0 : 1
    lineOpacity.current += (lineTarget - lineOpacity.current) * 5 * delta

    // Apply transforms to group
    if (groupRef.current) {
      // Z position: raised when powered, pressed down when active/pressed
      const raiseZ = raiseProgress.current * (raisedDepth - depth)
      const pressZ = pressProgress.current * -0.04
      groupRef.current.position.z = raiseZ + pressZ
    }
  })

  const handlePointerDown = () => {
    if (!disabled && isPowered) {
      setIsPressed(true)
    }
  }

  const handlePointerUp = () => {
    if (isPressed && isPowered) {
      setIsPressed(false)
      onClick?.()
    }
  }

  const handlePointerOver = () => {
    if (isPowered && !disabled) {
      setIsHovered(true)
      onHover?.(true)
      document.body.style.cursor = 'pointer'
    }
  }

  const handlePointerOut = () => {
    setIsHovered(false)
    setIsPressed(false)
    onHover?.(false)
    document.body.style.cursor = 'default'
  }

  // Only allow interactions when powered
  const handleClick = () => {
    if (isPowered && !disabled) {
      onClick?.()
    }
  }

  // Calculate current depth based on animation
  const currentDepth = depth + raiseProgress.current * (raisedDepth - depth)

  // Color based on state
  const baseColor = isActive
    ? UI3D_COLORS.surface.light
    : isHovered && isPowered
      ? '#323236'
      : UI3D_COLORS.surface.base

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Geometric line art - visible when unpowered */}
      <group position={[0, 0, 0.002]}>
        <GeometricOutline3D
          width={width}
          height={height}
          pattern={pattern}
          opacity={lineOpacity.current * 0.6} // More muted when unpowered
          color={isPowered ? UI3D_COLORS.metallic.highlight : UI3D_COLORS.metallic.shadow}
          lineWidth={1.5}
        />
      </group>

      {/* Solid button body - fades in when powered */}
      {solidOpacity.current > 0.01 && (
        <RoundedBox
          args={[width, height, currentDepth]}
          radius={0.02}
          smoothness={4}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial
            color={baseColor}
            roughness={0.7}
            metalness={0.1}
            transparent
            opacity={solidOpacity.current}
          />
        </RoundedBox>
      )}

      {/* Invisible hit area for unpowered state (still needs to block clicks) */}
      {solidOpacity.current < 0.5 && (
        <mesh
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {/* Top surface highlight when raised */}
      {raiseProgress.current > 0.1 && solidOpacity.current > 0.1 && (
        <mesh position={[0, 0, currentDepth / 2 + 0.001]}>
          <planeGeometry args={[width - 0.03, height - 0.03]} />
          <meshStandardMaterial
            color={UI3D_COLORS.surface.light}
            roughness={0.5}
            transparent
            opacity={raiseProgress.current * solidOpacity.current * 0.4}
          />
        </mesh>
      )}

      {/* Active indicator glow */}
      {isActive && solidOpacity.current > 0.5 && (
        <>
          {/* Bottom edge glow */}
          <mesh position={[0, -height / 2 + 0.01, currentDepth / 2]}>
            <planeGeometry args={[width - 0.02, 0.015]} />
            <meshBasicMaterial
              color={UI3D_COLORS.powered.accent}
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Soft point light */}
          <pointLight
            position={[0, 0, currentDepth / 2 + 0.1]}
            color={UI3D_COLORS.powered.warm}
            intensity={2}
            distance={0.6}
            decay={2}
          />
        </>
      )}

      {/* Neumorphic shadow simulation when raised */}
      {raiseProgress.current > 0.1 && solidOpacity.current > 0.3 && (
        <>
          {/* Bottom shadow */}
          <mesh position={[0.01, -height / 2 - 0.006, currentDepth / 4]}>
            <planeGeometry args={[width, 0.015]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={raiseProgress.current * solidOpacity.current * 0.25}
            />
          </mesh>
          {/* Right shadow */}
          <mesh position={[width / 2 + 0.006, -0.01, currentDepth / 4]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[height, 0.015]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={raiseProgress.current * solidOpacity.current * 0.2}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

export default Neumorphic3DButton
