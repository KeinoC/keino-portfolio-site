'use client'

import { useMemo, useState, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { AboutContent } from '@/components/pages/AboutContent'
import { ExperienceContent } from '@/components/pages/ExperienceContent'

const HALF_STEP = Math.PI / 5 // 36° — half of one 72° segment
const ARC_SAMPLES = 10 // vertices per arc for clip-path polygon

interface WedgeContentProps {
  pageId: string | null
  angle: number
  innerRadius: number
  outerRadius: number
  visible: boolean
}

export function WedgeContent({ pageId, angle, innerRadius, outerRadius, visible }: WedgeContentProps) {
  const { viewport } = useThree()
  const factor = viewport.factor // pixels per world unit (= zoom for ortho)

  const [expanded, setExpanded] = useState(false)

  // Reset expanded state when page changes
  useEffect(() => { setExpanded(false) }, [pageId])

  const geometry = useMemo(() => {
    const startAngle = angle - HALF_STEP
    const endAngle = angle + HALF_STEP

    // Sample boundary points to compute bounding box
    const pts: [number, number][] = []
    for (let i = 0; i <= ARC_SAMPLES; i++) {
      const t = i / ARC_SAMPLES
      const a = startAngle + t * (endAngle - startAngle)
      const c = Math.cos(a)
      const s = Math.sin(a)
      pts.push([c * innerRadius, s * innerRadius])
      pts.push([c * outerRadius, s * outerRadius])
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const [x, y] of pts) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }

    const worldW = maxX - minX
    const worldH = maxY - minY

    // Build clip-path polygon: inner arc → outer arc (reverse) → close
    const clipPts: string[] = []

    // Inner arc: startAngle → endAngle
    for (let i = 0; i <= ARC_SAMPLES; i++) {
      const t = i / ARC_SAMPLES
      const a = startAngle + t * (endAngle - startAngle)
      const wx = Math.cos(a) * innerRadius
      const wy = Math.sin(a) * innerRadius
      const pctX = ((wx - minX) / worldW * 100).toFixed(1)
      const pctY = ((maxY - wy) / worldH * 100).toFixed(1)
      clipPts.push(`${pctX}% ${pctY}%`)
    }

    // Outer arc: endAngle → startAngle (reverse to close the polygon)
    for (let i = ARC_SAMPLES; i >= 0; i--) {
      const t = i / ARC_SAMPLES
      const a = startAngle + t * (endAngle - startAngle)
      const wx = Math.cos(a) * outerRadius
      const wy = Math.sin(a) * outerRadius
      const pctX = ((wx - minX) / worldW * 100).toFixed(1)
      const pctY = ((maxY - wy) / worldH * 100).toFixed(1)
      clipPts.push(`${pctX}% ${pctY}%`)
    }

    return {
      cx: (minX + maxX) / 2,
      cy: (minY + maxY) / 2,
      widthPx: worldW * factor,
      heightPx: worldH * factor,
      clipPath: `polygon(${clipPts.join(', ')})`,
    }
  }, [angle, innerRadius, outerRadius, factor])

  const WEDGE_PAGES = new Set(['about', 'experience'])
  if (!visible || !pageId || !WEDGE_PAGES.has(pageId)) return null

  return (
    <Html
      position={[geometry.cx, geometry.cy, 0.1]}
      center
      style={{
        width: `${geometry.widthPx}px`,
        height: `${geometry.heightPx}px`,
        clipPath: geometry.clipPath,
        pointerEvents: 'none',
      }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-5 max-w-sm">
          {pageId === 'about' && <AboutContent expanded={expanded} onToggle={() => setExpanded(!expanded)} />}
          {pageId === 'experience' && <ExperienceContent expanded={expanded} onToggle={() => setExpanded(!expanded)} />}
        </div>
      </div>
    </Html>
  )
}
