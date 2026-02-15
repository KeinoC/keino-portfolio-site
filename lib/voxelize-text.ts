import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { voxelizeGeometry, type VoxelizeOptions } from './voxelize'

export interface VoxelTextOptions extends VoxelizeOptions {
  /** Font JSON URL. Default: '/fonts/helvetiker_bold.typeface.json' */
  fontUrl?: string
  /** Text size (height of capital letters). Default: 0.7 */
  fontSize?: number
  /** Extrusion depth. Default: 0.2 */
  fontDepth?: number
  /** Spacing between letters (multiplier). Default: 1.1 */
  letterSpacing?: number
  /** Bevel enabled. Default: true */
  bevel?: boolean
  /** Bevel thickness. Default: 0.02 */
  bevelThickness?: number
  /** Bevel size. Default: 0.012 */
  bevelSize?: number
}

let cachedFont: Font | null = null
let fontLoadPromise: Promise<Font> | null = null

/**
 * Load and cache the font (shared across calls).
 */
async function loadFont(url: string): Promise<Font> {
  if (cachedFont) return cachedFont

  if (!fontLoadPromise) {
    fontLoadPromise = new Promise<Font>((resolve, reject) => {
      const loader = new FontLoader()
      loader.load(url, (font) => {
        cachedFont = font
        resolve(font)
      }, undefined, reject)
    })
  }

  return fontLoadPromise
}

/**
 * Voxelize a text string into an array of Vector3 positions.
 *
 * Each letter is voxelized individually, then offset so the full
 * string is centered at origin. Positions are in local space.
 *
 * @returns Array of Vector3 positions (voxel centers)
 */
export async function voxelizeText(
  text: string,
  options: Partial<VoxelTextOptions> = {}
): Promise<THREE.Vector3[]> {
  const {
    fontUrl = '/fonts/helvetiker_bold.typeface.json',
    fontSize = 0.7,
    fontDepth = 0.2,
    letterSpacing = 1.1,
    bevel = true,
    bevelThickness = 0.02,
    bevelSize = 0.012,
    resolution = 0.04,
    padding = 0,
  } = options

  const font = await loadFont(fontUrl)
  const allVoxels: THREE.Vector3[] = []

  // Measure letter widths first for centering
  const letterWidths: number[] = []
  const letterGeometries: THREE.BufferGeometry[] = []

  for (const char of text) {
    const geom = new TextGeometry(char, {
      font,
      size: fontSize,
      depth: fontDepth,
      curveSegments: 6,
      bevelEnabled: bevel,
      bevelThickness,
      bevelSize,
      bevelSegments: 2,
    })
    geom.computeBoundingBox()
    const bbox = geom.boundingBox!
    letterWidths.push(bbox.max.x - bbox.min.x)
    letterGeometries.push(geom)
  }

  // Total width with spacing
  const spacingMultiplier = fontSize * 0.1 * letterSpacing
  let totalWidth = 0
  for (let i = 0; i < letterWidths.length; i++) {
    totalWidth += letterWidths[i]
    if (i < letterWidths.length - 1) totalWidth += spacingMultiplier
  }

  // Voxelize each letter with X offset, centered
  let xOffset = -totalWidth / 2

  for (let i = 0; i < letterGeometries.length; i++) {
    const geom = letterGeometries[i]
    const bbox = geom.boundingBox!

    // Center each letter vertically
    const yCenter = (bbox.max.y + bbox.min.y) / 2

    const voxels = voxelizeGeometry(geom, { resolution, padding })

    // Offset voxels to correct position in the string
    for (const v of voxels) {
      v.x += xOffset - bbox.min.x
      v.y -= yCenter
      allVoxels.push(v)
    }

    xOffset += letterWidths[i] + spacingMultiplier
    geom.dispose()
  }

  return allVoxels
}
