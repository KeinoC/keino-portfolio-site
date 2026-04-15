'use client'

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Geometric pattern types for line art
 */
export type GeometricPattern = 'simple' | 'double' | 'corner-accent' | 'bracket'

export interface GeometricOutline3DProps {
  width: number
  height: number
  pattern?: GeometricPattern
  opacity: number
  color?: string
  lineWidth?: number
}

/**
 * GeometricOutline3D - Decorative line art patterns for buttons
 *
 * Renders thin reflective metallic lines forming geometric patterns.
 * Used when buttons are unpowered to show subtle "sketched" outlines.
 *
 * Patterns:
 * - simple: Basic rectangle outline
 * - double: Nested rectangles (inner + outer)
 * - corner-accent: Rectangle with small squares at corners
 * - bracket: Corner brackets with connecting lines
 */
export function GeometricOutline3D({
  width,
  height,
  pattern = 'corner-accent',
  opacity,
  color = '#6a6a70',
  lineWidth = 1.5,
}: GeometricOutline3DProps) {
  // Generate points for each pattern
  const lines = useMemo(() => {
    const halfW = width / 2
    const halfH = height / 2

    switch (pattern) {
      case 'simple':
        return generateSimplePattern(halfW, halfH)
      case 'double':
        return generateDoublePattern(halfW, halfH)
      case 'corner-accent':
        return generateCornerAccentPattern(halfW, halfH)
      case 'bracket':
        return generateBracketPattern(halfW, halfH)
      default:
        return generateCornerAccentPattern(halfW, halfH)
    }
  }, [width, height, pattern])

  if (opacity < 0.01) return null

  return (
    <group>
      {lines.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={color}
          lineWidth={lineWidth}
          transparent
          opacity={opacity}
          // Metallic appearance through material tweaks
          toneMapped={false}
        />
      ))}
    </group>
  )
}

/**
 * Simple rectangle outline
 */
function generateSimplePattern(halfW: number, halfH: number): THREE.Vector3[][] {
  return [
    // Outer rectangle
    [
      new THREE.Vector3(-halfW, halfH, 0),
      new THREE.Vector3(halfW, halfH, 0),
      new THREE.Vector3(halfW, -halfH, 0),
      new THREE.Vector3(-halfW, -halfH, 0),
      new THREE.Vector3(-halfW, halfH, 0),
    ],
  ]
}

/**
 * Double nested rectangles
 */
function generateDoublePattern(halfW: number, halfH: number): THREE.Vector3[][] {
  const inset = 0.04
  return [
    // Outer rectangle
    [
      new THREE.Vector3(-halfW, halfH, 0),
      new THREE.Vector3(halfW, halfH, 0),
      new THREE.Vector3(halfW, -halfH, 0),
      new THREE.Vector3(-halfW, -halfH, 0),
      new THREE.Vector3(-halfW, halfH, 0),
    ],
    // Inner rectangle
    [
      new THREE.Vector3(-halfW + inset, halfH - inset, 0),
      new THREE.Vector3(halfW - inset, halfH - inset, 0),
      new THREE.Vector3(halfW - inset, -halfH + inset, 0),
      new THREE.Vector3(-halfW + inset, -halfH + inset, 0),
      new THREE.Vector3(-halfW + inset, halfH - inset, 0),
    ],
  ]
}

/**
 * Rectangle with small squares at corners
 */
function generateCornerAccentPattern(halfW: number, halfH: number): THREE.Vector3[][] {
  const cornerSize = Math.min(halfW, halfH) * 0.25
  const lines: THREE.Vector3[][] = []

  // Main rectangle outline
  lines.push([
    new THREE.Vector3(-halfW, halfH, 0),
    new THREE.Vector3(halfW, halfH, 0),
    new THREE.Vector3(halfW, -halfH, 0),
    new THREE.Vector3(-halfW, -halfH, 0),
    new THREE.Vector3(-halfW, halfH, 0),
  ])

  // Top-left corner accent
  lines.push([
    new THREE.Vector3(-halfW, halfH - cornerSize, 0),
    new THREE.Vector3(-halfW + cornerSize, halfH - cornerSize, 0),
    new THREE.Vector3(-halfW + cornerSize, halfH, 0),
  ])

  // Top-right corner accent
  lines.push([
    new THREE.Vector3(halfW - cornerSize, halfH, 0),
    new THREE.Vector3(halfW - cornerSize, halfH - cornerSize, 0),
    new THREE.Vector3(halfW, halfH - cornerSize, 0),
  ])

  // Bottom-left corner accent
  lines.push([
    new THREE.Vector3(-halfW, -halfH + cornerSize, 0),
    new THREE.Vector3(-halfW + cornerSize, -halfH + cornerSize, 0),
    new THREE.Vector3(-halfW + cornerSize, -halfH, 0),
  ])

  // Bottom-right corner accent
  lines.push([
    new THREE.Vector3(halfW - cornerSize, -halfH, 0),
    new THREE.Vector3(halfW - cornerSize, -halfH + cornerSize, 0),
    new THREE.Vector3(halfW, -halfH + cornerSize, 0),
  ])

  return lines
}

/**
 * Corner brackets with minimal connecting lines
 * More architectural/technical drawing feel
 */
function generateBracketPattern(halfW: number, halfH: number): THREE.Vector3[][] {
  const bracketLen = Math.min(halfW, halfH) * 0.35
  const lines: THREE.Vector3[][] = []

  // Top-left bracket
  lines.push([
    new THREE.Vector3(-halfW, halfH - bracketLen, 0),
    new THREE.Vector3(-halfW, halfH, 0),
    new THREE.Vector3(-halfW + bracketLen, halfH, 0),
  ])

  // Top-right bracket
  lines.push([
    new THREE.Vector3(halfW - bracketLen, halfH, 0),
    new THREE.Vector3(halfW, halfH, 0),
    new THREE.Vector3(halfW, halfH - bracketLen, 0),
  ])

  // Bottom-left bracket
  lines.push([
    new THREE.Vector3(-halfW, -halfH + bracketLen, 0),
    new THREE.Vector3(-halfW, -halfH, 0),
    new THREE.Vector3(-halfW + bracketLen, -halfH, 0),
  ])

  // Bottom-right bracket
  lines.push([
    new THREE.Vector3(halfW - bracketLen, -halfH, 0),
    new THREE.Vector3(halfW, -halfH, 0),
    new THREE.Vector3(halfW, -halfH + bracketLen, 0),
  ])

  // Subtle center cross (very short lines)
  const crossLen = Math.min(halfW, halfH) * 0.1
  lines.push([
    new THREE.Vector3(-crossLen, 0, 0),
    new THREE.Vector3(crossLen, 0, 0),
  ])
  lines.push([
    new THREE.Vector3(0, -crossLen, 0),
    new THREE.Vector3(0, crossLen, 0),
  ])

  return lines
}

export default GeometricOutline3D
