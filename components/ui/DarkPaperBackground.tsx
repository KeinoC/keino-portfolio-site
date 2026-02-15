'use client';

import React from 'react';

/**
 * DarkPaperBackground - Premium dark paper texture using SVG feTurbulence
 *
 * Creates a realistic dark card stock paper effect with:
 * - Subtle paper grain/noise texture
 * - Dark base with warm undertones
 * - Slight vignette around edges
 * - No external image dependencies
 *
 * Based on industry-standard grainy gradient techniques:
 * https://css-tricks.com/grainy-gradients/
 */
export function DarkPaperBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* SVG Filter Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Paper grain noise filter */}
          <filter id="dark-paper-grain">
            {/* Generate Perlin noise texture */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              seed="2"
              stitchTiles="stitch"
            />

            {/* Adjust contrast and brightness for subtle grain */}
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="1 1" />
            </feComponentTransfer>

            {/* Boost contrast */}
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.15 0"
            />
          </filter>

          {/* Vignette gradient */}
          <radialGradient id="dark-paper-vignette">
            <stop offset="0%" stopColor="#1a1a1c" stopOpacity="0" />
            <stop offset="70%" stopColor="#0d0d0f" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
        </defs>
      </svg>

      {/* Base dark paper layer with warm undertone */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              #0d0d0f 0%,
              #1a1a1c 50%,
              #12121a 100%
            )
          `,
        }}
      />

      {/* Paper grain texture overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          filter: 'url(#dark-paper-grain)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'url(#dark-paper-vignette)',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

/**
 * Customization Guide:
 *
 * Base Color Adjustment:
 * - Edit the linear-gradient colors in base layer
 * - Use #0d0d0f to #1a1a1c range for dark paper
 * - Add slight warm undertone with #12121a (blue-ish dark)
 *
 * Grain Intensity:
 * - baseFrequency: 0.4-0.8 (higher = finer grain)
 * - numOctaves: 3-5 (higher = more detail, lower performance)
 * - opacity on grain layer: 0.2-0.6 (adjust visibility)
 *
 * Vignette Strength:
 * - Adjust stopOpacity values in radialGradient
 * - Change final opacity on vignette div (0.3-0.7)
 *
 * Performance Tips:
 * - Keep numOctaves ≤ 4 for smooth performance
 * - Use stitchTiles="stitch" to prevent tiling artifacts
 * - Consider converting to static image for production if needed
 */
