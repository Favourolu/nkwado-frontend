"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import type { FeatherColor } from "@/lib/peacock-palette";

function createFeatherShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const length = 2.6;
  const width = 0.42;

  shape.moveTo(0, 0);
  shape.bezierCurveTo(width, length * 0.15, width * 0.9, length * 0.7, 0, length);
  shape.bezierCurveTo(-width * 0.9, length * 0.7, -width, length * 0.15, 0, 0);

  return shape;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  uniform float uTime;
  uniform float uShimmerOffset;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    float shimmer = 0.5 + 0.5 * sin(uTime * 0.6 + uShimmerOffset + vUv.y * 3.0);
    vec3 gradient = mix(uBaseColor, uTipColor, clamp(vUv.y * 1.1, 0.0, 1.0));
    vec3 shimmerColor = mix(gradient, uTipColor, shimmer * 0.35);

    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
    vec3 rim = uTipColor * fresnel * 0.8;

    float edgeFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);

    vec3 finalColor = shimmerColor + rim;
    gl_FragColor = vec4(finalColor, edgeFade);
  }
`;

interface FeatherProps {
  color: FeatherColor;
  rotationZ: number;
  shimmerOffset: number;
}

export function Feather({ color, rotationZ, shimmerOffset }: FeatherProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const shape = useMemo(() => createFeatherShape(), []);
  const geometry = useMemo(
    () => new THREE.ShapeGeometry(shape, 32),
    [shape]
  );

  const uniforms = useMemo(
    () => ({
      uBaseColor: { value: new THREE.Color(color.base) },
      uTipColor: { value: new THREE.Color(color.tip) },
      uTime: { value: 0 },
      uShimmerOffset: { value: shimmerOffset },
    }),
    [color, shimmerOffset]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group rotation={[0, 0, rotationZ]}>
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
