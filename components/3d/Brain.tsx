"use client";

import { useRef, useCallback, useMemo } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  BRAIN_REGIONS,
  REGION_KEYS,
  SEPARATION_DISTANCE,
  type BrainRegion,
} from "@/lib/brain-regions";

interface BrainProps {
  activeRegion: string | null;
  hoveredRegion: string | null;
  onRegionClick: (key: string) => void;
  onRegionHover: (key: string | null) => void;
}

// Single brain lobe mesh
function BrainLobe({
  regionKey,
  region,
  isHovered,
  isActive,
  isMirror,
  onClick,
  onHover,
}: {
  regionKey: string;
  region: BrainRegion;
  isHovered: boolean;
  isActive: boolean;
  isMirror: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Mirror position: flip X
  const basePosition = useMemo(() => {
    const [x, y, z] = region.position;
    return new THREE.Vector3(isMirror ? -x : x, y, z);
  }, [region.position, isMirror]);

  const targetPosition = useRef(basePosition.clone());
  const currentEmissive = useRef(new THREE.Color(0x000000));

  // Mirror separation direction: flip X
  const separatedPosition = useMemo(() => {
    const [dx, dy, dz] = region.separationDir;
    const dir = new THREE.Vector3(isMirror ? -dx : dx, dy, dz).normalize();
    return basePosition.clone().add(dir.multiplyScalar(SEPARATION_DISTANCE));
  }, [basePosition, region.separationDir, isMirror]);

  // Mirror rotation: flip Z rotation for mirrored lobes
  const rotation = useMemo((): [number, number, number] => {
    const [rx, ry, rz] = region.rotation;
    return isMirror ? [rx, ry, -rz] : [rx, ry, rz];
  }, [region.rotation, isMirror]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Lerp position (separate on hover)
    const target = isHovered ? separatedPosition : basePosition;
    targetPosition.current.lerp(target, 1 - Math.pow(0.001, delta));
    meshRef.current.position.copy(targetPosition.current);

    // Lerp emissive color + intensity for glass glow
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    const targetEmissive = isHovered
      ? new THREE.Color(region.hoverColor).multiplyScalar(0.5)
      : new THREE.Color(0x000000);
    currentEmissive.current.lerp(targetEmissive, 1 - Math.pow(0.01, delta));
    mat.emissive.copy(currentEmissive.current);

    const targetIntensity = isHovered ? 0.4 : 0.0;
    mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * (1 - Math.pow(0.01, delta));
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(true);
      document.body.style.cursor = "pointer";
    },
    [onHover]
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover(false);
      document.body.style.cursor = "auto";
    },
    [onHover]
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick]
  );

  return (
    <mesh
      ref={meshRef}
      position={basePosition.toArray()}
      scale={region.scale}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[1, 64, 32]} />
      <meshPhysicalMaterial
        color={region.color}
        transmission={0.6}
        thickness={1.5}
        roughness={0.15}
        metalness={0.0}
        ior={1.3}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        envMapIntensity={1.5}
        transparent
        opacity={isActive && !isHovered ? 0.3 : 1}
      />
      {/* Only show tooltip on the primary lobe, not the mirror */}
      {isHovered && !isMirror && (
        <Html
          center
          distanceFactor={4}
          style={{
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div className="whitespace-nowrap rounded-lg bg-black/80 px-3 py-2 text-center backdrop-blur-sm">
            <div className="text-sm font-bold text-white">{region.name}</div>
            <div className="text-xs text-white/60">→ {region.label}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function Brain({
  activeRegion,
  hoveredRegion,
  onRegionClick,
  onRegionHover,
}: BrainProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(0);

  // Gentle bobbing animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    groupRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {REGION_KEYS.map((key) => {
        const region = BRAIN_REGIONS[key];
        const isHovered = hoveredRegion === key;
        const isActive = activeRegion !== null && activeRegion !== key;

        return (
          <group key={key}>
            {/* Primary lobe */}
            <BrainLobe
              regionKey={key}
              region={region}
              isHovered={isHovered}
              isActive={isActive}
              isMirror={false}
              onClick={() => onRegionClick(key)}
              onHover={(hovered) => onRegionHover(hovered ? key : null)}
            />
            {/* Mirrored lobe (right hemisphere) */}
            {region.mirror && (
              <BrainLobe
                regionKey={key}
                region={region}
                isHovered={isHovered}
                isActive={isActive}
                isMirror={true}
                onClick={() => onRegionClick(key)}
                onHover={(hovered) => onRegionHover(hovered ? key : null)}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
