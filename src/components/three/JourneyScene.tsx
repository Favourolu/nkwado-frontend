"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

export interface JourneyStep {
  name: string;
}

const RACHIS_COLOR_START = new THREE.Color("#0f6e6e");
const RACHIS_COLOR_END = new THREE.Color("#f59e0b");

function Rachis({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.035, 12, false), [curve]);

  useMemo(() => {
    const position = geometry.attributes.position;
    const colorArray = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      const t = i / position.count;
      const c = RACHIS_COLOR_START.clone().lerp(RACHIS_COLOR_END, t);
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
  }, [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </mesh>
  );
}

function StepBead({
  position,
  color,
  label,
  index,
}: {
  position: THREE.Vector3;
  color: THREE.Color;
  label: string;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.06;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      <Html distanceFactor={8} position={[0, 0.32, 0]} center>
        <div className="w-32 rounded-md bg-background/90 px-2 py-1 text-center text-[10px] font-medium leading-tight text-foreground shadow-sm sm:w-40 sm:text-xs">
          {label}
        </div>
      </Html>
    </group>
  );
}

function Journey({ steps }: { steps: JourneyStep[] }) {
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(-3.2, -0.6, 0),
      new THREE.Vector3(-1.6, 0.7, 0.4),
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(1.6, 0.7, -0.4),
      new THREE.Vector3(3.2, -0.6, 0),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  return (
    <group>
      <Rachis curve={curve} />
      {steps.map((step, i) => {
        const t = steps.length === 1 ? 0 : i / (steps.length - 1);
        const point = curve.getPointAt(t);
        const color = RACHIS_COLOR_START.clone().lerp(RACHIS_COLOR_END, t);
        return (
          <StepBead key={step.name} position={point} color={color} label={step.name} index={i} />
        );
      })}
    </group>
  );
}

export function JourneyScene({ steps }: { steps: JourneyStep[] }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0, 5.5], fov: 42 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 3, 4]} intensity={1} color="#fef3c7" />
      <Journey steps={steps} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
        maxPolarAngle={Math.PI / 2 + 0.3}
        minPolarAngle={Math.PI / 2 - 0.3}
      />
    </Canvas>
  );
}
