"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

export interface JourneyStep {
  name: string;
}

const PATH_COLOR_START = new THREE.Color("#0f6e6e");
const PATH_COLOR_END = new THREE.Color("#f59e0b");

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smooth(v: number) {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
}

function useJourneyCurve() {
  return useMemo(() => {
    const points = [
      new THREE.Vector3(-3.2, -0.6, 0),
      new THREE.Vector3(-1.6, 0.7, 0.4),
      new THREE.Vector3(0, -0.5, 0),
      new THREE.Vector3(1.6, 0.7, -0.4),
      new THREE.Vector3(3.2, -0.6, 0),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);
}

function DrawnPath({
  curve,
  progressRef,
}: {
  curve: THREE.CatmullRomCurve3;
  progressRef: React.MutableRefObject<number>;
}) {
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 128, 0.035, 12, false), [curve]);

  useMemo(() => {
    const position = geometry.attributes.position;
    const colorArray = new Float32Array(position.count * 3);
    for (let i = 0; i < position.count; i++) {
      const t = i / position.count;
      const c = PATH_COLOR_START.clone().lerp(PATH_COLOR_END, t);
      colorArray[i * 3] = c.r;
      colorArray[i * 3 + 1] = c.g;
      colorArray[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
  }, [geometry]);

  useFrame(() => {
    // The tube draws itself along the scroll: reveal indices up to progress.
    const indexCount = geometry.index ? geometry.index.count : 0;
    const drawn = smooth(progressRef.current / 0.9);
    geometry.setDrawRange(0, Math.floor(indexCount * drawn));
  });

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </mesh>
  );
}

function Traveler({
  curve,
  progressRef,
}: {
  curve: THREE.CatmullRomCurve3;
  progressRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = clamp01(smooth(progressRef.current / 0.9));
    const point = curve.getPointAt(t);
    groupRef.current.position.copy(point);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function StepBead({
  position,
  color,
  label,
  stepT,
  progressRef,
}: {
  position: THREE.Vector3;
  color: THREE.Color;
  label: string;
  stepT: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  // On phones the camera sits further back, so bump the label scale to keep
  // step names readable.
  const isNarrow = useThree((state) => state.size.width < 640);

  useFrame(() => {
    // Beads pop in as the traveler reaches them.
    const reached = smooth((smooth(progressRef.current / 0.9) - stepT + 0.02) / 0.06);
    if (meshRef.current) {
      meshRef.current.scale.setScalar(Math.max(reached, 0.0001));
      meshRef.current.visible = reached > 0.01;
    }
    if (labelRef.current) {
      labelRef.current.style.opacity = String(reached);
      labelRef.current.style.transform = `translateY(${(1 - reached) * 8}px)`;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
      </mesh>
      <Html distanceFactor={isNarrow ? 12 : 8} position={[0, 0.34, 0]} center>
        <div
          ref={labelRef}
          className="w-36 rounded-md bg-background/90 px-2 py-1 text-center text-[11px] font-medium leading-tight text-foreground shadow-sm sm:w-44 sm:text-sm"
          style={{ opacity: 0 }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

function JourneyInner({
  steps,
  progressRef,
}: {
  steps: JourneyStep[];
  progressRef: React.MutableRefObject<number>;
}) {
  const curve = useJourneyCurve();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = progressRef.current;
    const cam = state.camera;
    const t = clamp01(smooth(p / 0.9));
    const point = curve.getPointAt(t);
    // On portrait screens, back the camera off so a useful stretch of the
    // path stays in the narrower horizontal field of view.
    const aspect = state.size.width / state.size.height;
    const fit = Math.min(Math.max(1.15 / aspect, 1), 1.6);
    // Camera drifts sideways with the traveler and eases with the cursor.
    cam.position.x += (point.x * 0.55 + state.pointer.x * 0.4 - cam.position.x) * 0.05;
    cam.position.y += (0.2 + state.pointer.y * 0.25 - cam.position.y) * 0.05;
    cam.position.z += (5.5 * fit - cam.position.z) * 0.08;
    cam.lookAt(point.x * 0.4, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.y = state.pointer.x * 0.08;
      // Slightly shrink the whole path on phones as well.
      const s = aspect < 0.8 ? 0.85 : 1;
      groupRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      <DrawnPath curve={curve} progressRef={progressRef} />
      <Traveler curve={curve} progressRef={progressRef} />
      {steps.map((step, i) => {
        const t = steps.length === 1 ? 0 : i / (steps.length - 1);
        const point = curve.getPointAt(t);
        const color = PATH_COLOR_START.clone().lerp(PATH_COLOR_END, t);
        return (
          <StepBead
            key={step.name}
            position={point}
            color={color}
            label={step.name}
            stepT={t}
            progressRef={progressRef}
          />
        );
      })}
    </group>
  );
}

export function JourneyScrollScene({ steps }: { steps: JourneyStep[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = wrapperRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = Math.max(rect.height - window.innerHeight, 1);
        progressRef.current = clamp01(-rect.top / total);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapperRef} id="how-it-works" className="relative h-[250vh]">
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden supports-[height:100svh]:h-svh">
        <div className="px-4 pt-16 text-center sm:pt-24">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <p className="text-muted-foreground">
            From idea to booked event in five simple steps. Keep scrolling.
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.2, 5.5], fov: 42 }}>
            <ambientLight intensity={0.7} />
            <pointLight position={[2, 3, 4]} intensity={1} color="#fef3c7" />
            <JourneyInner steps={steps} progressRef={progressRef} />
          </Canvas>
        </div>
      </div>
    </div>
  );
}
