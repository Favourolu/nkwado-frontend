"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TiltCardProps {
  title: string;
  gradient: string;
  className?: string;
}

export function TiltCard({ title, gradient, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(600px) rotateX(${y * -14}deg) rotateY(${x * 14}deg) scale3d(1.03, 1.03, 1.03)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: "perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: "transform 200ms ease-out" }}
      className={cn(
        "flex h-28 items-end rounded-xl p-4 text-white shadow-lg will-change-transform",
        gradient,
        className
      )}
    >
      <p className="text-sm font-semibold drop-shadow-sm">{title}</p>
    </div>
  );
}
