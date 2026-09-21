"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playClickSound, playWhooshSound } from "@/utils/audio";
import { RotateCw, Eye, Sparkles, Activity } from "lucide-react";

export default function HeroCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [renderMode, setRenderMode] = useState<"wireframe" | "points" | "solid">("wireframe");
  const [fps, setFps] = useState(60);
  const [polyCount, setPolyCount] = useState(1280);

  // References to communicate with the Three.js render loop
  const modeRef = useRef(renderMode);
  modeRef.current = renderMode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f0ff, 3.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 2.8, 50);
    pointLight2.position.set(-5, -5, -3);
    scene.add(pointLight2);

    // --- Core 3D Geometries ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Primary Polyhedron (Icosahedron)
    const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    setPolyCount(icoGeo.attributes.position.count);

    // Wireframe material & mesh
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const icoWireMesh = new THREE.Mesh(icoGeo, wireMaterial);

    // Solid physical material & mesh
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f121d,
      roughness: 0.3,
      metalness: 0.85,
      wireframe: false,
    });
    const icoSolidMesh = new THREE.Mesh(icoGeo, solidMaterial);

    // Points particle material & mesh
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    const icoPoints = new THREE.Points(icoGeo, pointsMaterial);

    // Initial addition
    mainGroup.add(icoWireMesh);

    // 2. Inner Glowing Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(0.8, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 3. Orbital Gyroscope Rings
    const ringMat1 = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.35 });
    const ringMat2 = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.35 });

    const ringGeo1 = new THREE.BufferGeometry();
    const ringPoints1: number[] = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints1.push(Math.cos(theta) * 2.5, Math.sin(theta) * 2.5, 0);
    }
    ringGeo1.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints1, 3));
    const ring1 = new THREE.Line(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 4;
    mainGroup.add(ring1);

    const ringGeo2 = new THREE.BufferGeometry();
    const ringPoints2: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      ringPoints2.push(Math.cos(theta) * 2.8, 0, Math.sin(theta) * 2.8);
    }
    ringGeo2.setAttribute("position", new THREE.Float32BufferAttribute(ringPoints2, 3));
    const ring2 = new THREE.Line(ringGeo2, ringMat2);
    ring2.rotation.z = Math.PI / 6;
    mainGroup.add(ring2);

    // 4. Background Starfield / Particle Cloud
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 25;
      particlePositions[i + 1] = (Math.random() - 0.5) * 25;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20 - 5;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const starFieldMat = new THREE.PointsMaterial({
      color: 0x8892b0,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(particleGeo, starFieldMat);
    scene.add(starField);

    // --- Interaction Physics ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let pulseScale = 1;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      targetX = x * 0.8;
      targetY = y * 0.6;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        mainGroup.rotation.y += deltaX * 0.008;
        mainGroup.rotation.x += deltaY * 0.008;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      previousMousePosition = { x: e.clientX, y: e.clientY };
      playWhooshSound();
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const onClick = () => {
      pulseScale = 1.35;
      playClickSound();
    };

    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);

    // Touch Support
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        targetX = x * 0.8;
        targetY = y * 0.6;
      }
    };
    container.addEventListener("touchmove", onTouchMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // --- Animation & Render Loop ---
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update mesh based on renderMode state
      if (modeRef.current === "points") {
        if (mainGroup.children.includes(icoWireMesh)) mainGroup.remove(icoWireMesh);
        if (mainGroup.children.includes(icoSolidMesh)) mainGroup.remove(icoSolidMesh);
        if (!mainGroup.children.includes(icoPoints)) mainGroup.add(icoPoints);
      } else if (modeRef.current === "solid") {
        if (mainGroup.children.includes(icoWireMesh)) mainGroup.remove(icoWireMesh);
        if (mainGroup.children.includes(icoPoints)) mainGroup.remove(icoPoints);
        if (!mainGroup.children.includes(icoSolidMesh)) mainGroup.add(icoSolidMesh);
      } else {
        if (mainGroup.children.includes(icoSolidMesh)) mainGroup.remove(icoSolidMesh);
        if (mainGroup.children.includes(icoPoints)) mainGroup.remove(icoPoints);
        if (!mainGroup.children.includes(icoWireMesh)) mainGroup.add(icoWireMesh);
      }

      // Smooth camera & group parallax
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.2;
      camera.position.y = mouseY * 1.2;
      camera.lookAt(0, 0, 0);

      // Auto rotation when not dragging
      if (!isDragging) {
        mainGroup.rotation.y += 0.004;
        mainGroup.rotation.x += 0.002;
      }

      // Independent rotations for inner objects
      coreMesh.rotation.y -= 0.015;
      coreMesh.rotation.z += 0.008;

      ring1.rotation.z += 0.006;
      ring2.rotation.y += 0.005;

      starField.rotation.y = elapsedTime * 0.02;

      // Pulse physics animation
      if (pulseScale > 1) {
        pulseScale -= 0.02;
        if (pulseScale < 1) pulseScale = 1;
      }
      icoWireMesh.scale.set(pulseScale, pulseScale, pulseScale);
      icoSolidMesh.scale.set(pulseScale, pulseScale, pulseScale);
      icoPoints.scale.set(pulseScale, pulseScale, pulseScale);

      // Measure FPS
      frameCount++;
      const currentTime = performance.now();
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      container.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] md:h-[560px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#08090e]/60 border border-white/10 backdrop-blur-md shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab ${isInteracting ? "cursor-grabbing" : ""}`}
        title="Klik dan geser untuk memutar objek 3D"
      />

      {/* Cybernetic HUD Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none select-none font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10">
          <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping" />
          <span className="text-zinc-200 font-semibold tracking-wider">3D SPATIAL ENGINE</span>
          <span className="text-zinc-500">|</span>
          <span className="text-cyber-cyan">WEBGL 2.0</span>
        </div>
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded border border-white/5 text-[10px]">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>{fps} FPS</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span>VERTICES: {polyCount}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">STATE: {isInteracting ? "ACTIVE DRAG" : "AUTONOMOUS"}</span>
        </div>
      </div>

      {/* Mode Switcher Buttons */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-white/10 font-mono text-xs z-10">
        <button
          onClick={() => {
            setRenderMode("wireframe");
            playClickSound();
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            renderMode === "wireframe"
              ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <RotateCw className="w-3 h-3" />
          <span>Wireframe</span>
        </button>

        <button
          onClick={() => {
            setRenderMode("points");
            playClickSound();
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            renderMode === "points"
              ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Particles</span>
        </button>

        <button
          onClick={() => {
            setRenderMode("solid");
            playClickSound();
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            renderMode === "solid"
              ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Solid</span>
        </button>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-4 right-4 pointer-events-none select-none font-mono text-[10px] text-zinc-500 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded border border-white/5 hidden sm:block">
        DRAG TO ROTATE • CLICK TO PULSE • PARALLAX ACTIVE
      </div>

      <div className="absolute top-2 right-2 font-mono text-[10px] text-zinc-600 select-none pointer-events-none">
        +01
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[10px] text-zinc-600 select-none pointer-events-none">
        +02
      </div>
    </div>
  );
}
