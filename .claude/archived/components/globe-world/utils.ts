import * as THREE from 'three'

/**
 * Convert latitude/longitude coordinates to 3D Vector3 position on sphere
 * @param lat Latitude in degrees (-90 to 90, positive = north)
 * @param long Longitude in degrees (-180 to 180, positive = east)
 * @param radius Sphere radius
 * @returns THREE.Vector3 position on sphere surface
 */
export function latLongToVector3(
  lat: number,
  long: number,
  radius: number
): THREE.Vector3 {
  // Convert degrees to radians
  const phi = (90 - lat) * (Math.PI / 180)    // Polar angle (from north pole)
  const theta = (long + 180) * (Math.PI / 180) // Azimuthal angle

  // Spherical to Cartesian conversion
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/**
 * Calculate the surface normal at a given position on sphere
 * @param position Position on sphere surface
 * @returns Normalized vector pointing outward from sphere center
 */
export function calculateSurfaceNormal(position: THREE.Vector3): THREE.Vector3 {
  return position.clone().normalize()
}

/**
 * Orient an Object3D to stand perpendicular to sphere surface
 * @param object The 3D object to orient
 * @param surfacePosition Position on the sphere surface
 * @param heightOffset How far above the surface to position the object
 */
export function orientToSurface(
  object: THREE.Object3D,
  surfacePosition: THREE.Vector3,
  heightOffset: number = 0
): void {
  const normal = calculateSurfaceNormal(surfacePosition)

  // Position the object above the surface
  const finalPosition = surfacePosition.clone().add(
    normal.clone().multiplyScalar(heightOffset)
  )
  object.position.copy(finalPosition)

  // Create a quaternion to rotate the object to align with surface normal
  // Default up direction is (0, 1, 0)
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(up, normal)
  object.quaternion.copy(quaternion)
}

/**
 * Calculate rotation quaternion for an object to face outward from sphere
 * @param position Position on sphere surface
 * @returns Quaternion for proper orientation
 */
export function getOutwardRotation(position: THREE.Vector3): THREE.Quaternion {
  const normal = calculateSurfaceNormal(position)
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion()
  quaternion.setFromUnitVectors(up, normal)
  return quaternion
}

/**
 * Ease-in-out cubic function for smooth animations
 * @param t Progress from 0 to 1
 * @returns Eased value from 0 to 1
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Linear interpolation between two values
 * @param a Start value
 * @param b End value
 * @param t Progress from 0 to 1
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Detect if running on mobile device
 * @returns true if mobile device detected
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}
