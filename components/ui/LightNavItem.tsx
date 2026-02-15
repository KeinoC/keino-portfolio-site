'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface LightNavItemProps {
  label: string
  href: string
  lightPos: { x: number; y: number }
  isActive?: boolean
  className?: string
}

export function LightNavItem({ label, href, lightPos, isActive, className }: LightNavItemProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [itemCenter, setItemCenter] = useState({ x: 50, y: 50 })

  const measure = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setItemCenter({
      x: ((rect.left + rect.width / 2) / window.innerWidth) * 100,
      y: ((rect.top + rect.height / 2) / window.innerHeight) * 100,
    })
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Direction from light to item
  const dx = itemCenter.x - lightPos.x
  const dy = itemCenter.y - lightPos.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const proximity = Math.max(0, Math.min(1, 1 - distance / 80))

  // Normalize direction
  const len = distance || 1
  const nx = dx / len
  const ny = dy / len

  // Cast text-shadow away from light (like the letters casting a shadow on the surface behind)
  const maxOffset = 6
  const offsetScale = 0.3 + proximity * 0.7
  const offsetX = nx * maxOffset * offsetScale
  const offsetY = ny * maxOffset * offsetScale
  const blur = 4 + (1 - proximity) * 8
  const shadowOpacity = 0.4 + proximity * 0.4

  // Warm illumination edge — subtle highlight on the light-facing side
  const glowProximity = Math.max(0, (proximity - 0.3) / 0.7)
  const glowX = -nx * 2 * glowProximity
  const glowY = -ny * 2 * glowProximity
  const glowOpacity = glowProximity * 0.6

  // Text color shifts from dark (#2a2a2a-ish) to lit when cube is near
  // Mimics the 3D letters being illuminated by the point lights
  const litAmount = proximity * 0.4
  const r = Math.round(42 + litAmount * 180)
  const g = Math.round(42 + litAmount * 170)
  const b = Math.round(42 + litAmount * 155)

  const textShadow = [
    // Dark cast shadow away from light
    `${offsetX.toFixed(1)}px ${offsetY.toFixed(1)}px ${blur.toFixed(0)}px rgba(0,0,0,${shadowOpacity.toFixed(2)})`,
    // Warm glow on light-facing edge
    `${glowX.toFixed(1)}px ${glowY.toFixed(1)}px ${(4 + glowProximity * 4).toFixed(0)}px rgba(255,250,240,${glowOpacity.toFixed(2)})`,
  ].join(', ')

  return (
    <a
      ref={ref}
      href={href}
      className={[
        'relative uppercase tracking-widest font-extrabold text-lg',
        'transition-[text-shadow,color] duration-150',
        'will-change-[text-shadow,color]',
        'hover:!text-white/60',
        isActive && '!text-white/70',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        color: `rgb(${r},${g},${b})`,
        textShadow,
      }}
    >
      {label}
    </a>
  )
}
