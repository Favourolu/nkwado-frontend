"use client";

import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface TiltCardProps {
  title: string;
  subtitle?: string;
  gradient: string;
  icon?: LucideIcon;
  size?: "sm" | "lg";
  className?: string;
}

export function TiltCard({ title, subtitle, gradient, icon: Icon, size = "sm", className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(700px) rotateX(${y * -10}deg) rotateY(${x * 10}deg) scale3d(1.02, 1.02, 1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: "perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: "transform 200ms ease-out" }}
      className={cn(
        "relative flex flex-col justify-end overflow-hidden rounded-3xl p-5 text-white shadow-lg will-change-transform",
        size === "lg" ? "h-64 sm:h-72" : "h-36",
        gradient,
        className
      )}
    >
      {Icon && (
        <Icon className="absolute right-4 top-4 h-5 w-5 text-white/70" strokeWidth={1.75} />
      )}
      <div className="relative">
        <p className={cn("font-semibold drop-shadow-sm", size === "lg" ? "text-xl" : "text-sm")}>
          {title}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-white/80 drop-shadow-sm">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
