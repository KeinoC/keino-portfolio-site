import * as THREE from 'three'

export interface VoxelizeOptions {
  /** Size of each voxel cube. Default: 0.04 */
  resolution: number
  /** Padding around bounding box (world units). Default: 0 */
  padding?: number
}

/**
 * Voxelize any BufferGeometry into a grid of Vector3 positions.
 *
 * Uses raycasting through a 3D grid — odd intersection count
 * means the point is inside the mesh. Works with any closed geometry.
 *
 * @param geometry - The BufferGeometry to voxelize
 * @param options  - Resolution and padding settings
 * @returns Array of Vector3 positions (voxel centers, in geometry-local space)
 */
export function voxelizeGeometry(
  geometry: THREE.BufferGeometry,
  options: VoxelizeOptions
): THREE.Vector3[] {
  const { resolution, padding = 0 } = options

  // Build a temporary mesh for raycasting
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)

  // Ensure geometry has up-to-date bounding box
  geometry.computeBoundingBox()
  const bbox = geometry.boundingBox!

  const min = bbox.min.clone().subScalar(padding)
  const max = bbox.max.clone().addScalar(padding)

  const raycaster = new THREE.Raycaster()
  const voxels: THREE.Vector3[] = []

  // Cast rays along the Z axis for each XY grid point
  const direction = new THREE.Vector3(0, 0, 1)

  for (let x = min.x; x <= max.x; x += resolution) {
    for (let y = min.y; y <= max.y; y += resolution) {
      // Cast from below the geometry upward
      const origin = new THREE.Vector3(x, y, min.z - 1)
      raycaster.set(origin, direction)
      const hits = raycaster.intersectObject(mesh, false)

      if (hits.length === 0) continue

      // Walk Z layers — for each grid Z, count how many surfaces are below it
      for (let z = min.z; z <= max.z; z += resolution) {
        const point = new THREE.Vector3(x, y, z)

        // Count intersections below this Z
        let below = 0
        for (const hit of hits) {
          if (hit.point.z <= z) below++
        }

        // Odd count = inside
        if (below % 2 === 1) {
          voxels.push(point)
        }
      }
    }
  }

  material.dispose()

  return voxels
}

/**
 * Voxelize a mesh that's already in the scene (uses world transforms).
 * Useful when you want positions in world space.
 */
export function voxelizeMesh(
  mesh: THREE.Mesh,
  options: VoxelizeOptions
): THREE.Vector3[] {
  const { resolution, padding = 0 } = options

  // Ensure double-sided for correct inside/outside detection
  const origSide = (mesh.material as THREE.Material).side
  ;(mesh.material as THREE.Material).side = THREE.DoubleSide

  mesh.updateMatrixWorld(true)

  const bbox = new THREE.Box3().setFromObject(mesh)
  const min = bbox.min.clone().subScalar(padding)
  const max = bbox.max.clone().addScalar(padding)

  const raycaster = new THREE.Raycaster()
  const voxels: THREE.Vector3[] = []
  const direction = new THREE.Vector3(0, 0, 1)

  for (let x = min.x; x <= max.x; x += resolution) {
    for (let y = min.y; y <= max.y; y += resolution) {
      const origin = new THREE.Vector3(x, y, min.z - 1)
      raycaster.set(origin, direction)
      const hits = raycaster.intersectObject(mesh, false)

      if (hits.length === 0) continue

      for (let z = min.z; z <= max.z; z += resolution) {
        let below = 0
        for (const hit of hits) {
          if (hit.point.z <= z) below++
        }

        if (below % 2 === 1) {
          voxels.push(new THREE.Vector3(x, y, z))
        }
      }
    }
  }

  // Restore original side
  ;(mesh.material as THREE.Material).side = origSide

  return voxels
}
