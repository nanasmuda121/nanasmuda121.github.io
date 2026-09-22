"use client";

import React, { useRef, useState } from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  glare?: boolean;
  onClick?: () => void;
}

export default function Card3D({
  children,
  className = "",
  maxRotation = 10,
  glare = true,
  onClick,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only execute 3D tilt calculations for fine pointer (desktop mouse)
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const percentX = (mouseX / width) * 2 - 1; // -1 to 1
    const percentY = (mouseY / height) * 2 - 1; // -1 to 1

    const rotX = -percentY * maxRotation;
    const rotY = percentX * maxRotation;

    setRotation({ x: rotX, y: rotY });
    setGlarePosition({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full h-full"
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${
            isHovered ? "translateZ(10px)" : "translateZ(0px)"
          }`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c0e17]/95 md:backdrop-blur-md transition-shadow hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${className}`}
      >
        {/* Dynamic 3D Glare Highlight (desktop only) */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-30 hidden md:block"
            style={{
              opacity: glarePosition.opacity,
              background: `radial-gradient(circle 320px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
            }}
          />
        )}

        {/* Content with preserve-3d context */}
        <div style={{ transformStyle: "preserve-3d" }} className="w-full h-full relative z-20">
          {children}
        </div>
      </div>
    </div>
  );
}
