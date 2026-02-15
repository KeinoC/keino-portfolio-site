import * as THREE from "three";

export interface BrainRegion {
  name: string;
  label: string;
  color: string;
  hoverColor: string;
  navPath: string;
  description: string;
  // Geometry params for procedural sphere-based brain
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  // Direction to separate outward on hover (normalized)
  separationDir: [number, number, number];
  // If true, renders a mirrored copy at [-x, y, z]
  mirror?: boolean;
}

export const BRAIN_REGIONS: Record<string, BrainRegion> = {
  frontal: {
    name: "Frontal Lobe",
    label: "Projects",
    color: "#f08888",
    hoverColor: "#ffa8a8",
    navPath: "/projects",
    description: "Planning, execution, creativity — where ideas take shape.",
    position: [-0.35, 0.35, 0.55],
    scale: [0.75, 0.55, 0.75],
    rotation: [0.2, 0, 0],
    separationDir: [-0.3, 0.3, 1],
    mirror: true,
  },
  parietal: {
    name: "Parietal Lobe",
    label: "Skills",
    color: "#88f0b8",
    hoverColor: "#a8ffc8",
    navPath: "/skills",
    description: "Spatial processing, integration — connecting the dots.",
    position: [-0.3, 0.55, -0.15],
    scale: [0.65, 0.4, 0.7],
    rotation: [-0.15, 0, 0],
    separationDir: [-0.3, 1, -0.3],
    mirror: true,
  },
  temporal: {
    name: "Temporal Lobe",
    label: "About Me",
    color: "#88c8f0",
    hoverColor: "#a8e0ff",
    navPath: "/about",
    description: "Memory, language, personal narrative — the story behind the work.",
    position: [-0.7, -0.15, 0.15],
    scale: [0.4, 0.65, 0.7],
    rotation: [0, 0, 0.15],
    separationDir: [-1, -0.2, 0.2],
    mirror: true,
  },
  occipital: {
    name: "Occipital Lobe",
    label: "Gallery",
    color: "#d8b8f0",
    hoverColor: "#e8c8ff",
    navPath: "/gallery",
    description: "Vision, visual processing — seeing is believing.",
    position: [-0.25, 0.1, -0.65],
    scale: [0.5, 0.5, 0.45],
    rotation: [-0.3, 0, 0],
    separationDir: [-0.2, 0.1, -1],
    mirror: true,
  },
  cerebellum: {
    name: "Cerebellum",
    label: "Contact",
    color: "#f0e088",
    hoverColor: "#fff8a8",
    navPath: "/contact",
    description: "Coordination, connection — let's work together.",
    position: [0, -0.5, -0.55],
    scale: [0.55, 0.4, 0.45],
    rotation: [-0.2, 0, 0],
    separationDir: [0, -1, -0.5],
  },
  brainstem: {
    name: "Brain Stem",
    label: "Resume",
    color: "#f0b888",
    hoverColor: "#ffd0a8",
    navPath: "/resume",
    description: "Core functions, fundamentals — the foundation of everything.",
    position: [0, -0.7, 0.05],
    scale: [0.25, 0.55, 0.25],
    rotation: [0.1, 0, 0],
    separationDir: [0, -1, 0.2],
  },
} as const;

export const REGION_KEYS = Object.keys(BRAIN_REGIONS) as (keyof typeof BRAIN_REGIONS)[];

// How far regions separate on hover
export const SEPARATION_DISTANCE = 0.25;

// Camera defaults
export const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 5);
export const ZOOM_Z = 6.5;
export const NUDGE_STRENGTH = 0.5;
export const ZOOM_DURATION_MS = 500;
