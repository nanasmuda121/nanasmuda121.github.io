"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playClickSound, playWhooshSound } from "@/utils/audio";

export default function HeroCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 40);
    pointLight.position.set(4, 4, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x10b981, 2, 40);
    pointLight2.position.set(-4, -4, -2);
    scene.add(pointLight2);

    // 3D Core Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. Primary Polyhedron (Geometric 3D Wireframe)
    const geometry = new THREE.IcosahedronGeometry(1.6, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geometry, wireMat);
    group.add(mesh);

    // 2. Inner Glowing Core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 3. Orbital Gyroscope Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
    });
    const ringGeo = new THREE.BufferGeometry();
    const points: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      points.push(Math.cos(theta) * 2.3, Math.sin(theta) * 2.3, 0);
    }
    ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const ring = new THREE.Line(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    group.add(ring);

    // 4. Starfield Particles
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = (Math.random() - 0.5) * 18;
      positions[i + 2] = (Math.random() - 0.5) * 15 - 3;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(particleGeo, starMat);
    scene.add(starField);

    // Mouse Tracking & Interaction
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let dragging = false;
    let prevMouse = { x: 0, y: 0 };
    let pulseScale = 1;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetX = x * 0.7;
      targetY = y * 0.5;

      if (dragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        group.rotation.y += dx * 0.01;
        group.rotation.x += dy * 0.01;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragging = true;
      setIsDragging(true);
      prevMouse = { x: e.clientX, y: e.clientY };
      playWhooshSound();
    };

    const handleMouseUp = () => {
      dragging = false;
      setIsDragging(false);
    };

    const handleClick = () => {
      pulseScale = 1.25;
      playClickSound();
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("click", handleClick);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 1.1;
      camera.position.y = mouseY * 1.1;
      camera.lookAt(0, 0, 0);

      if (!dragging) {
        group.rotation.y += 0.005;
        group.rotation.x += 0.002;
      }

      coreMesh.rotation.y -= 0.015;
      ring.rotation.z += 0.008;
      starField.rotation.y += 0.0005;

      if (pulseScale > 1) {
        pulseScale -= 0.02;
        if (pulseScale < 1) pulseScale = 1;
      }
      mesh.scale.set(pulseScale, pulseScale, pulseScale);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#090b12] border border-white/10 shadow-2xl">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
        title="Klik dan putar objek 3D"
      />

      {/* Clean Minimalist Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 font-mono text-xs text-zinc-300 pointer-events-none select-none">
        <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
        <span className="font-semibold">3D Interactive Core</span>
      </div>

      {/* Floating Hint */}
      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/5 font-mono text-[11px] text-zinc-400 pointer-events-none select-none hidden sm:block">
        DRAG TO ROTATE 360°
      </div>
    </div>
  );
}
