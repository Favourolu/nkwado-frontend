"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

import { Button } from "@/components/ui/button";
import { Feather } from "./Feather";
import { FEATHER_COLORS } from "@/lib/peacock-palette";

const FEATHER_COUNT = 11;
const FAN_SPREAD = Math.PI * 0.82;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function smooth(v: number) {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
}

// Opacity ramp: fades in over [in0, in1], holds, fades out over [out0, out1].
function fade(p: number, in0: number, in1: number, out0: number, out1: number) {
  return smooth((p - in0) / (in1 - in0)) * (1 - smooth((p - out0) / (out1 - out0)));
}

function UnfurlingFan({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const feathers = useMemo(
    () =>
      Array.from({ length: FEATHER_COUNT }, (_, i) => {
        const t = i / (FEATHER_COUNT - 1);
        const angle = -FAN_SPREAD / 2 + t * FAN_SPREAD;
        return {
          color: FEATHER_COLORS[i % FEATHER_COLORS.length],
          angle,
          shimmerOffset: i * 0.7,
        };
        // Sort center-out so the middle feather leads and the fan grows
        // symmetrically outward as the user scrolls.
      }).sort((a, b) => Math.abs(a.angle) - Math.abs(b.angle)),
    []
  );

  const groupRef = useRef<THREE.Group>(null);
  const featherRefs = useRef<(THREE.Group | null)[]>([]);
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = progressRef.current;
    const cam = state.camera;
    const px = state.pointer.x;
    const py = state.pointer.y;

    // Camera: starts close on the lone feather, pulls back as the fan opens.
    const targetZ = 4.2 + smooth((p - 0.25) / 0.5) * 2.2;
    cam.position.x += (px * 0.5 - cam.position.x) * 0.05;
    cam.position.y += (0.45 + py * 0.3 - cam.position.y) * 0.05;
    cam.position.z += (targetZ - cam.position.z) * 0.08;
    cam.lookAt(0, 0.7, 0);

    if (groupRef.current) {
      // Gentle courtship sway once the display is fully open, plus a small
      // parallax response to the cursor throughout.
      const sway = 0.12 * smooth((p - 0.6) / 0.3);
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.45) * sway + px * 0.14;
      groupRef.current.rotation.x = -py * 0.07;
    }

    // Feathers unfurl one by one, center-out, scrubbed by scroll.
    const unfurlStart = 0.2;
    const unfurlEnd = 0.68;
    const per = (unfurlEnd - unfurlStart) / feathers.length;
    feathers.forEach((f, i) => {
      const g = featherRefs.current[i];
      if (!g) return;
      const u = i === 0 ? 1 : smooth((p - (unfurlStart + i * per)) / (per * 2.6));
      g.rotation.z = f.angle * u;
      const s = i === 0 ? 1 : 0.25 + 0.75 * u;
      g.scale.setScalar(s);
      g.visible = i === 0 || u > 0.001;
    });

    // The golden body appears as the display completes.
    if (bodyRef.current) {
      const b = smooth((p - 0.55) / 0.2);
      bodyRef.current.scale.setScalar(Math.max(b, 0.0001));
      bodyRef.current.visible = b > 0.001;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {feathers.map((f, i) => (
        <group
          key={i}
          ref={(el) => {
            featherRefs.current[i] = el;
          }}
        >
          <Feather color={f.color} rotationZ={0} shimmerOffset={f.shimmerOffset} />
        </group>
      ))}
      <group ref={bodyRef}>
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
      </group>
      <Sparkles count={50} scale={[4, 3.2, 1.6]} size={2.5} speed={0.3} color="#fef3c7" />
    </group>
  );
}

export function PeacockScrollJourney() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const chapter1Ref = useRef<HTMLDivElement>(null);
  const chapter2Ref = useRef<HTMLDivElement>(null);
  const chapter3Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const setOpacity = (el: HTMLDivElement | null, value: number) => {
      if (el) el.style.opacity = String(value);
    };
    const update = () => {
      const el = wrapperRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = Math.max(rect.height - window.innerHeight, 1);
        const p = clamp01(-rect.top / total);
        progressRef.current = p;

        setOpacity(chapter1Ref.current, fade(p, -1, 0, 0.14, 0.24));
        setOpacity(chapter2Ref.current, fade(p, 0.26, 0.36, 0.52, 0.62));
        // The final chapter fades in and stays.
        setOpacity(chapter3Ref.current, smooth((p - 0.68) / 0.12));
        setOpacity(hintRef.current, 1 - smooth(p / 0.06));
        if (chapter3Ref.current) {
          chapter3Ref.current.style.pointerEvents = p > 0.72 ? "auto" : "none";
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={wrapperRef} className="relative h-[380vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0, 0.45, 4.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[3, 4, 5]} intensity={1.1} color="#fef3c7" />
            <pointLight position={[-4, -2, 3]} intensity={0.5} color="#5eead4" />
            <UnfurlingFan progressRef={progressRef} />
          </Canvas>
        </div>

        {/* Chapter 1: a single feather */}
        <div
          ref={chapter1Ref}
          className="pointer-events-none absolute inset-x-0 bottom-[16vh] px-4 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Nkwado
          </p>
          <h1 className="mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Every great event starts with a single idea
          </h1>
        </div>

        {/* Chapter 2: the fan unfurls */}
        <div
          ref={chapter2Ref}
          className="pointer-events-none absolute inset-x-0 bottom-[16vh] px-4 text-center opacity-0"
        >
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            One by one, the right vendors join your display
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Caterers, venues, DJs, photographers — every feather a vetted vendor, matched to
            your event.
          </p>
        </div>

        {/* Chapter 3: full display + CTA */}
        <div
          ref={chapter3Ref}
          className="pointer-events-none absolute inset-x-0 bottom-[10vh] px-4 text-center opacity-0"
        >
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Every vendor your event needs, curated into one beautiful display
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
            Answer a few questions and Nkwado matches you with vetted vendors, quoted within
            24 hours, booked with confidence.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full font-semibold">
              <Link href="/register">Start planning</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full font-semibold">
              <Link href="/register">I&apos;m a vendor</Link>
            </Button>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-[0.25em]">Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-bounce">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
