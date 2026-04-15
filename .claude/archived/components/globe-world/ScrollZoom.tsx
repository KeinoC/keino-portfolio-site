'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_POSITIONS, CameraPhase } from './types'
import { easeInOutCubic, lerp } from './utils'

interface ScrollZoomProps {
  scrollProgress: number
  onPhaseChange: (phase: CameraPhase) => void
}

export function ScrollZoom({ scrollProgress, onPhaseChange }: ScrollZoomProps) {
  const { camera } = useThree()
  const currentPhaseRef = useRef<CameraPhase>('hero')
  const targetPositionRef = useRef(new THREE.Vector3(...CAMERA_POSITIONS.hero.position))

  useEffect(() => {
    // Determine phase based on scroll progress
    let newPhase: CameraPhase
    if (scrollProgress < 0.1) {
      newPhase = 'hero'
    } else if (scrollProgress > 0.85) {
      newPhase = 'settled'
    } else {
      newPhase = 'zooming'
    }

    if (newPhase !== currentPhaseRef.current) {
      currentPhaseRef.current = newPhase
      onPhaseChange(newPhase)
    }
  }, [scrollProgress, onPhaseChange])

  useFrame(() => {
    // Apply easing to scroll progress for smooth camera movement
    const easedProgress = easeInOutCubic(Math.min(Math.max(scrollProgress, 0), 1))

    // Interpolate camera position
    const targetX = lerp(
      CAMERA_POSITIONS.hero.position[0],
      CAMERA_POSITIONS.settled.position[0],
      easedProgress
    )
    const targetY = lerp(
      CAMERA_POSITIONS.hero.position[1],
      CAMERA_POSITIONS.settled.position[1],
      easedProgress
    )
    const targetZ = lerp(
      CAMERA_POSITIONS.hero.position[2],
      CAMERA_POSITIONS.settled.position[2],
      easedProgress
    )

    targetPositionRef.current.set(targetX, targetY, targetZ)

    // Smooth camera movement with lerp
    camera.position.lerp(targetPositionRef.current, 0.08)

    // Always look at globe center
    camera.lookAt(0, 0, 0)
  })

  return null // This is a controller component, no visual output
}

export default ScrollZoom
