export interface BuildingData {
  name: string
  key: string
  color: string
  roofColor: string
  windowColor: string
  lat: number    // -90 to 90
  long: number   // -180 to 180
  size: [number, number, number] // width, height, depth
  description: string
  category: string
}

export interface GlobeConfig {
  radius: number
  segments: number
}

export type CameraPhase = 'hero' | 'zooming' | 'settled'

export interface GlobeWorldState {
  scrollProgress: number
  cameraPhase: CameraPhase
  activeBuilding: BuildingData | null
  hoveredBuilding: BuildingData | null
}

// Building data for the globe
export const globeBuildings: BuildingData[] = [
  {
    name: 'Community Center',
    key: 'community',
    color: '#e87d5c',
    roofColor: '#d66b4a',
    windowColor: '#ffcc99',
    lat: 30,
    long: -45,
    size: [2, 3, 2],
    description: 'LHBK - Preserving Haitian culture in Brooklyn',
    category: 'Nonprofit'
  },
  {
    name: 'Office Tower',
    key: 'enterprise',
    color: '#4a90e2',
    roofColor: '#3a7bc8',
    windowColor: '#a8d5ff',
    lat: 0,
    long: 0,
    size: [1.8, 4.5, 1.8],
    description: 'WBS/GVC - Property management solutions',
    category: 'PropTech'
  },
  {
    name: 'Maker Space',
    key: 'hardware',
    color: '#50c878',
    roofColor: '#40a860',
    windowColor: '#90e8b0',
    lat: -20,
    long: 90,
    size: [2.2, 2.5, 2.2],
    description: 'FPV - Arduino - ESP32 - IoT Systems',
    category: 'Embedded'
  },
  {
    name: 'Startup Hub',
    key: 'financial',
    color: '#9b59b6',
    roofColor: '#7d3c94',
    windowColor: '#d5a6e8',
    lat: 15,
    long: 180,
    size: [2, 3.8, 2],
    description: 'Anvil - Business intelligence platform',
    category: 'FinTech'
  },
  {
    name: 'Design Studio',
    key: 'webdev',
    color: '#f39c12',
    roofColor: '#d68910',
    windowColor: '#ffd699',
    lat: -30,
    long: -120,
    size: [2.2, 3.2, 2.2],
    description: 'Next.js - TypeScript - Full-stack solutions',
    category: 'Web'
  },
  {
    name: 'Blank Plot',
    key: 'blank',
    color: '#666666',
    roofColor: '#555555',
    windowColor: '#888888',
    lat: 45,
    long: 60,
    size: [2.5, 0.3, 2.5],
    description: 'Available for collaboration',
    category: 'Future'
  }
]

// Globe configuration
export const GLOBE_CONFIG: GlobeConfig = {
  radius: 15,
  segments: 4 // Icosphere detail level
}

// Camera positions for scroll animation
export const CAMERA_POSITIONS = {
  hero: {
    position: [0, 10, 45] as [number, number, number],
    fov: 75
  },
  settled: {
    position: [0, 8, 28] as [number, number, number],
    fov: 60
  }
}
