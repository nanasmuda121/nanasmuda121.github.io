"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playClickSound, playWhooshSound } from "@/utils/audio";
import { Play, Pause, RotateCw, ZoomIn, Sparkles } from "lucide-react";

interface PlanetConfig {
  name: string;
  size: number;
  distance: number;
  color: number;
  speed: number;
  hasRing?: boolean;
  ringInner?: number;
  ringOuter?: number;
  ringColor?: number;
  hasMoon?: boolean;
}

const PLANETS: PlanetConfig[] = [
  { name: "Merkurius", size: 0.14, distance: 1.8, color: 0xa8a29e, speed: 0.03 },
  { name: "Venus", size: 0.22, distance: 2.6, color: 0xfde047, speed: 0.022 },
  { name: "Bumi", size: 0.24, distance: 3.5, color: 0x38bdf8, speed: 0.016, hasMoon: true },
  { name: "Mars", size: 0.17, distance: 4.4, color: 0xf87171, speed: 0.013 },
  { name: "Jupiter", size: 0.55, distance: 5.8, color: 0xfbbf24, speed: 0.008 },
  { name: "Saturnus", size: 0.46, distance: 7.4, color: 0xfef08a, speed: 0.006, hasRing: true, ringInner: 0.65, ringOuter: 1.15, ringColor: 0xd6d3d1 },
  { name: "Uranus", size: 0.32, distance: 8.8, color: 0x67e8f9, speed: 0.004, hasRing: true, ringInner: 0.45, ringOuter: 0.75, ringColor: 0x94a3b8 },
  { name: "Neptunus", size: 0.3, distance: 10.2, color: 0x3b82f6, speed: 0.003 },
];

export default function HeroCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePlanet, setActivePlanet] = useState<string>("Bumi");
  const [isPlaying, setIsPlaying] = useState(true);

  // References for render loop
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene & Camera ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Angled top-down 3D astronomical perspective
    camera.position.set(0, 7.5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    // Deep space ambient light
    const ambientLight = new THREE.AmbientLight(0x222638, 0.9);
    scene.add(ambientLight);

    // Central Sun Light illuminating all planets radially
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 100, 0.4);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // Subtle soft fill light from above
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4);
    topLight.position.set(0, 20, 10);
    scene.add(topLight);

    // Main Solar System Group
    const solarGroup = new THREE.Group();
    // Default 3D tilt for isometric view
    solarGroup.rotation.x = 0.45;
    scene.add(solarGroup);

    // --- 1. The Sun (Matahari) ---
    const sunGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffd23f,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    solarGroup.add(sunMesh);

    // Corona Glow Sphere
    const coronaGeo = new THREE.SphereGeometry(1.05, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    solarGroup.add(coronaMesh);

    // --- 2. Planets & Orbit Tracks ---
    interface PlanetNode {
      config: PlanetConfig;
      orbitGroup: THREE.Group;
      mesh: THREE.Mesh;
      angle: number;
      moonGroup?: THREE.Group;
    }

    const planetNodes: PlanetNode[] = [];

    PLANETS.forEach((cfg, idx) => {
      // Orbit Ring (Track)
      const segments = 128;
      const trackPoints: number[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        trackPoints.push(Math.cos(theta) * cfg.distance, 0, Math.sin(theta) * cfg.distance);
      }
      const trackGeo = new THREE.BufferGeometry();
      trackGeo.setAttribute("position", new THREE.Float32BufferAttribute(trackPoints, 3));
      const trackMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12,
      });
      const trackLine = new THREE.Line(trackGeo, trackMat);
      solarGroup.add(trackLine);

      // Pivot Group for Orbit Rotation
      const orbitGroup = new THREE.Group();
      solarGroup.add(orbitGroup);

      // Planet Sphere Mesh with realistic Lambert shading (light from sun)
      const pGeo = new THREE.SphereGeometry(cfg.size, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.6,
        metalness: 0.1,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.x = cfg.distance;
      orbitGroup.add(pMesh);

      // Saturn & Uranus Rings
      if (cfg.hasRing && cfg.ringInner && cfg.ringOuter && cfg.ringColor) {
        const ringGeo = new THREE.RingGeometry(cfg.ringInner, cfg.ringOuter, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: cfg.ringColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        pMesh.add(ringMesh);
      }

      // Earth's Moon
      let moonGroup: THREE.Group | undefined;
      if (cfg.hasMoon) {
        moonGroup = new THREE.Group();
        pMesh.add(moonGroup);

        const moonGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const moonMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.8 });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = 0.42;
        moonGroup.add(moonMesh);
      }

      // Random starting angle
      const initialAngle = (idx * Math.PI * 2) / PLANETS.length + Math.random();
      orbitGroup.rotation.y = initialAngle;

      planetNodes.push({
        config: cfg,
        orbitGroup,
        mesh: pMesh,
        angle: initialAngle,
        moonGroup,
      });
    });

    // --- 3. Asteroid Belt (Sabuk Asteroid antara Mars & Jupiter) ---
    const asteroidCount = 300;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount * 3; i += 3) {
      const radius = 4.8 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.25;

      asteroidPos[i] = Math.cos(angle) * radius;
      asteroidPos[i + 1] = yOffset;
      asteroidPos[i + 2] = Math.sin(angle) * radius;
    }

    asteroidGeo.setAttribute("position", new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
    });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    solarGroup.add(asteroidBelt);

    // --- 4. Deep Space Stars (Bintang Latar Belakang) ---
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = (Math.random() - 0.5) * 60;
      starPos[i + 2] = (Math.random() - 0.5) * 60;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Mouse Drag & Interactive Rotation Physics ---
    let targetTiltX = 0.45;
    let targetTiltY = 0;
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsDragging(true);
      prevMousePos = { x: e.clientX, y: e.clientY };
      playWhooshSound();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;

        // Clamp vertical tilt to prevent flipping
        targetTiltX = Math.max(-0.2, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    // Touch Support for mobile users
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isMouseDown = true;
        setIsDragging(true);
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isMouseDown && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;
        targetTiltX = Math.max(-0.2, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // --- Render Loop ---
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera & group rotation damping
      solarGroup.rotation.x += (targetTiltX - solarGroup.rotation.x) * 0.08;
      solarGroup.rotation.y += (targetTiltY - solarGroup.rotation.y) * 0.08;

      // Sun pulse & self-spin
      sunMesh.rotation.y += 0.004;
      coronaMesh.rotation.y -= 0.006;
      coronaMesh.rotation.z += 0.003;

      // Asteroid belt slow rotation
      asteroidBelt.rotation.y += 0.002;

      // Background stars drifting
      stars.rotation.y += 0.0002;

      // Planets Orbital Movement (Keplerian Speed)
      if (isPlayingRef.current) {
        planetNodes.forEach((node) => {
          node.orbitGroup.rotation.y += node.config.speed * 0.75;
          node.mesh.rotation.y += 0.02; // Self-rotation (rotasi planet)

          if (node.moonGroup) {
            node.moonGroup.rotation.y += 0.05; // Bulan mengelilingi Bumi
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] md:h-[540px] flex items-center justify-center overflow-hidden rounded-2xl bg-[#05060a] border border-white/10 shadow-2xl">
      {/* 3D WebGL Solar System Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
        title="Klik dan putar Tata Surya 360°"
      />

      {/* Top Left: Astronomical HUD Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 font-mono text-xs text-zinc-300 pointer-events-none select-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-white">Tata Surya 3D Interaktif</span>
        <span className="text-zinc-600">•</span>
        <span className="text-cyber-cyan text-[11px]">8 Planet + Sabuk Asteroid</span>
      </div>

      {/* Bottom Center: Planet Quick Selector Pills */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 overflow-x-auto py-1 px-1.5 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 font-mono text-[11px] max-w-[80%]">
          {PLANETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setActivePlanet(p.name);
                playClickSound();
              }}
              className={`px-2 py-1 rounded-lg whitespace-nowrap transition-colors ${
                activePlanet === p.name
                  ? "bg-white/15 text-white font-bold border border-white/15"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Orbit Play / Pause Button */}
        <button
          onClick={() => {
            setIsPlaying(!isPlaying);
            playClickSound();
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs font-semibold backdrop-blur-md border transition-all ${
            isPlaying
              ? "bg-white/10 text-white border-white/15 hover:bg-white/20"
              : "bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30"
          }`}
          title={isPlaying ? "Jeda orbit" : "Lanjutkan orbit"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
        </button>
      </div>

      {/* Top Right: Drag Hint */}
      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/5 font-mono text-[10px] text-zinc-400 pointer-events-none select-none hidden sm:block">
        ROTATE 360° • DRAG &amp; TOUCH
      </div>
    </div>
  );
}
