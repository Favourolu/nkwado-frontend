"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

import { Feather } from "./Feather";
import { FEATHER_COLORS } from "@/lib/peacock-palette";

const FEATHER_COUNT: number = 9;
const FAN_SPREAD = Math.PI * 0.78;

function FeatherFan() {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const feathers = useMemo(
    () =>
      Array.from({ length: FEATHER_COUNT }, (_, i) => {
        const t = FEATHER_COUNT === 1 ? 0.5 : i / (FEATHER_COUNT - 1);
        const angle = -FAN_SPREAD / 2 + t * FAN_SPREAD;
        return {
          color: FEATHER_COLORS[i % FEATHER_COLORS.length],
          rotationZ: angle,
          shimmerOffset: i * 0.7,
        };
      }),
    []
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = pointer.current.y * 0.15;
    const targetY = pointer.current.x * 0.25;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.03;
    groupRef.current.rotation.y +=
      (targetY + state.clock.elapsedTime * 0.05 - groupRef.current.rotation.y) * 0.03;
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.55, 0]}
      scale={0.85}
      onPointerMove={(e) => {
        pointer.current = { x: e.pointer.x, y: e.pointer.y };
      }}
    >
      {feathers.map((f, i) => (
        <Feather key={i} color={f.color} rotationZ={f.rotationZ} shimmerOffset={f.shimmerOffset} />
      ))}
      <mesh position={[0, 0.15, 0.05]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1.4}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.15, 0.05]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.18} />
      </mesh>
      <Sparkles count={40} scale={[3.5, 3, 1.5]} size={2.5} speed={0.3} color="#fef3c7" />
    </group>
  );
}

export function PeacockHeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.1, 5.8], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 5]} intensity={1.1} color="#fef3c7" />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color="#5eead4" />
      <FeatherFan />
    </Canvas>
  );
}
