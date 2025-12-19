/**
 * Context Steering - Modern obstacle avoidance algorithm
 *
 * Instead of summing force vectors (which can oscillate), context steering:
 * 1. Samples "interest" in 8 directions (toward target)
 * 2. Samples "danger" in 8 directions (away from obstacles)
 * 3. Subtracts danger from interest
 * 4. Picks the direction with highest net value
 *
 * Reference: Game AI Pro 2, Chapter 18
 */

const NUM_DIRECTIONS = 8

// Pre-computed direction vectors for 8 cardinal/diagonal directions
const DIRECTION_VECTORS: [number, number][] = Array.from(
  { length: NUM_DIRECTIONS },
  (_, i) => {
    const angle = (i / NUM_DIRECTIONS) * Math.PI * 2
    return [Math.cos(angle), Math.sin(angle)]
  }
)

export interface Obstacle {
  x: number
  y: number
  radius: number
}

export interface Vec2 {
  x: number
  y: number
}

/**
 * Compute the best steering direction using context maps
 *
 * @param botPos - Current bot position
 * @param targetPos - Target position to move toward
 * @param obstacles - Array of nearby obstacles with position and radius
 * @param avoidanceRadius - How close before we start avoiding (default 1.2)
 * @returns Normalized direction vector
 */
export function computeContextSteering(
  botPos: Vec2,
  targetPos: Vec2,
  obstacles: Obstacle[],
  avoidanceRadius: number = 1.2
): Vec2 {
  const interest = new Float32Array(NUM_DIRECTIONS)
  const danger = new Float32Array(NUM_DIRECTIONS)

  // === INTEREST: How much we want to go in each direction (toward target) ===
  const toTarget = {
    x: targetPos.x - botPos.x,
    y: targetPos.y - botPos.y
  }
  const targetDist = Math.sqrt(toTarget.x * toTarget.x + toTarget.y * toTarget.y)

  if (targetDist > 0.01) {
    // Normalize direction to target
    const targetDirX = toTarget.x / targetDist
    const targetDirY = toTarget.y / targetDist

    for (let i = 0; i < NUM_DIRECTIONS; i++) {
      // Dot product: how aligned is this direction with target?
      const dot = DIRECTION_VECTORS[i][0] * targetDirX +
                  DIRECTION_VECTORS[i][1] * targetDirY
      // Only positive interest (directions toward target)
      interest[i] = Math.max(0, dot)
    }
  }

  // === DANGER: How much we want to avoid each direction (obstacles) ===
  for (const obs of obstacles) {
    const toObs = {
      x: obs.x - botPos.x,
      y: obs.y - botPos.y
    }
    const obsDist = Math.sqrt(toObs.x * toObs.x + toObs.y * toObs.y)

    // Only consider obstacles within avoidance range
    const effectiveRange = avoidanceRadius + obs.radius
    if (obsDist < effectiveRange && obsDist > 0.01) {
      // Danger magnitude: closer = more dangerous (1.0 at contact, 0.0 at edge)
      const dangerMagnitude = 1 - (obsDist / effectiveRange)

      // Normalize direction to obstacle
      const obsDirX = toObs.x / obsDist
      const obsDirY = toObs.y / obsDist

      for (let i = 0; i < NUM_DIRECTIONS; i++) {
        // Dot product: how aligned is this direction with the obstacle?
        const dot = DIRECTION_VECTORS[i][0] * obsDirX +
                    DIRECTION_VECTORS[i][1] * obsDirY

        // Only mark danger for directions pointing toward obstacle
        if (dot > 0) {
          // Take max danger (don't sum - prevents over-avoidance)
          danger[i] = Math.max(danger[i], dot * dangerMagnitude)
        }
      }
    }
  }

  // === COMBINE: Subtract danger from interest, sum weighted directions ===
  let resultX = 0
  let resultY = 0

  for (let i = 0; i < NUM_DIRECTIONS; i++) {
    // Net interest in this direction (clamped to 0)
    const weight = Math.max(0, interest[i] - danger[i])

    // Add this direction's contribution
    resultX += DIRECTION_VECTORS[i][0] * weight
    resultY += DIRECTION_VECTORS[i][1] * weight
  }

  // Normalize the result
  const magnitude = Math.sqrt(resultX * resultX + resultY * resultY)
  if (magnitude > 0.01) {
    return {
      x: resultX / magnitude,
      y: resultY / magnitude
    }
  }

  // No valid direction found (completely blocked) - return zero
  return { x: 0, y: 0 }
}

/**
 * Check if a body should be treated as an obstacle (not a cleanable target)
 */
export function isObstacle(userData: unknown): boolean {
  if (!userData || typeof userData !== 'object') return true
  const data = userData as { cleanable?: boolean }
  return !data.cleanable
}
