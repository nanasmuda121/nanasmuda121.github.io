"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playClickSound, playWhooshSound, playBlipSound } from "@/utils/audio";
import {
  CELESTIAL_BODIES,
  SUN_DATA,
  CelestialBody,
} from "@/data/solarSystemData";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Thermometer,
  Compass,
  Clock,
  Calendar,
  Sparkles,
  X,
  Gauge,
  Wind,
  Layers,
  Globe,
  RotateCw,
} from "lucide-react";

interface PlanetNode {
  body: CelestialBody;
  orbitGroup: THREE.Group;
  mesh: THREE.Mesh;
  sprite: THREE.Sprite;
  moonGroup?: THREE.Group;
}

export default function HeroCanvas3D() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);

  // Active / Focused planet state
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [orbitSpeedFactor, setOrbitSpeedFactor] = useState<number>(1.0);
  const [showDetailCard, setShowDetailCard] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ringkasan" | "fisik" | "orbit">("ringkasan");

  // References for render loop to avoid tearing
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const orbitSpeedRef = useRef(orbitSpeedFactor);
  orbitSpeedRef.current = orbitSpeedFactor;

  const selectedBodyRef = useRef<CelestialBody | null>(selectedBody);
  selectedBodyRef.current = selectedBody;

  // External trigger for focusing from React buttons
  const focusPlanetRef = useRef<(body: CelestialBody | null) => void>(() => {});

  // Fullscreen and Landscape toggle for Android & Mobile
  const toggleFullscreen = async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    playClickSound();

    if (!document.fullscreenElement) {
      try {
        if (wrapper.requestFullscreen) {
          await wrapper.requestFullscreen();
        } else if ((wrapper as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (wrapper as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        }

        // Try locking orientation to landscape (Android Chrome / Mobile)
        if (typeof screen !== "undefined" && screen.orientation && "lock" in screen.orientation) {
          try {
            await (screen.orientation as { lock: (orientation: string) => Promise<void> }).lock("landscape");
          } catch {
            // Orientation lock might require permission or not be supported on desktop
          }
        }
        setIsFullscreen(true);
      } catch (err) {
        console.warn("Fullscreen request error:", err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
          await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
        }

        if (typeof screen !== "undefined" && screen.orientation && "unlock" in screen.orientation) {
          try {
            (screen.orientation as { unlock: () => void }).unlock();
          } catch {
            // Ignore
          }
        }
        setIsFullscreen(false);
      } catch (err) {
        console.warn("Exit fullscreen error:", err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const canvasHolder = canvasHolderRef.current;
    if (!canvasHolder) return;

    // --- Scene, Camera, Renderer ---
    const scene = new THREE.Scene();

    const initialWidth = canvasHolder.clientWidth || 600;
    const initialHeight = canvasHolder.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(
      45,
      initialWidth / initialHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7.5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Clear holder & mount canvas
    while (canvasHolder.firstChild) {
      canvasHolder.removeChild(canvasHolder.firstChild);
    }
    canvasHolder.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x444d6a, 1.4);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffffff, 4.5, 200, 0.35);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const topFillLight = new THREE.DirectionalLight(0xffffff, 0.45);
    topFillLight.position.set(0, 25, 10);
    scene.add(topFillLight);

    // Main Solar System Group
    const solarGroup = new THREE.Group();
    solarGroup.rotation.x = 0.45;
    scene.add(solarGroup);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Helper: Create 3D Label Sprite
    function createNameSprite(name: string, colorHex: number) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Sprite();

      ctx.fillStyle = "rgba(8, 10, 18, 0.88)";
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 52, 16);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.stroke();

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, "0")}`;
      ctx.beginPath();
      ctx.arc(32, 32, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 23px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(name, 52, 33);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.45, 0.36, 1);
      return sprite;
    }

    // --- 1. The Sun (Matahari) ---
    const sunTexture = textureLoader.load(SUN_DATA.texturePath);
    const sunGeo = new THREE.SphereGeometry(SUN_DATA.size, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: SUN_DATA.fallbackColor,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { body: SUN_DATA };
    solarGroup.add(sunMesh);

    // Corona wireframe / glow sphere
    const coronaGeo = new THREE.SphereGeometry(SUN_DATA.size * 1.25, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    solarGroup.add(coronaMesh);

    // Sun Label Sprite
    const sunSprite = createNameSprite(SUN_DATA.name, 0xffd23f);
    sunSprite.position.set(0, SUN_DATA.size + 0.52, 0);
    sunSprite.userData = { body: SUN_DATA };
    sunMesh.add(sunSprite);

    const clickableObjects: THREE.Object3D[] = [sunMesh, sunSprite];

    // --- 2. Planets & Orbits ---
    const planetNodes: PlanetNode[] = [];

    CELESTIAL_BODIES.forEach((body, idx) => {
      // Orbit Line
      const segments = 128;
      const trackPoints: number[] = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        trackPoints.push(Math.cos(theta) * body.distance, 0, Math.sin(theta) * body.distance);
      }
      const trackGeo = new THREE.BufferGeometry();
      trackGeo.setAttribute("position", new THREE.Float32BufferAttribute(trackPoints, 3));
      const trackMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.16,
      });
      const trackLine = new THREE.Line(trackGeo, trackMat);
      solarGroup.add(trackLine);

      // Pivot Group for Orbit
      const orbitGroup = new THREE.Group();
      solarGroup.add(orbitGroup);

      // Planet Sphere
      const pTexture = textureLoader.load(body.texturePath);
      const pGeo = new THREE.SphereGeometry(body.size, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        map: pTexture,
        color: body.fallbackColor,
        roughness: 0.75,
        metalness: 0.08,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.x = body.distance;
      pMesh.userData = { body };
      orbitGroup.add(pMesh);

      // Planet Label Sprite
      const pSprite = createNameSprite(body.name, body.fallbackColor);
      pSprite.position.set(0, body.size + 0.46, 0);
      pSprite.userData = { body };
      pMesh.add(pSprite);

      clickableObjects.push(pMesh, pSprite);

      // Saturn & Uranus Rings
      if (body.hasRing && body.ringInner && body.ringOuter) {
        const ringGeo = new THREE.RingGeometry(body.ringInner, body.ringOuter, 64);
        const ringTexture = body.ringTexturePath ? textureLoader.load(body.ringTexturePath) : null;
        const ringMat = new THREE.MeshStandardMaterial({
          map: ringTexture || undefined,
          color: 0xd6d3d1,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        ringMesh.userData = { body };
        pMesh.add(ringMesh);
        clickableObjects.push(ringMesh);
      }

      // Earth's Moon
      let moonGroup: THREE.Group | undefined;
      if (body.hasMoon && body.moonTexturePath) {
        moonGroup = new THREE.Group();
        pMesh.add(moonGroup);

        const moonTexture = textureLoader.load(body.moonTexturePath);
        const moonGeo = new THREE.SphereGeometry(0.068, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTexture,
          color: 0xd1d5db,
          roughness: 0.85,
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = 0.5;
        moonGroup.add(moonMesh);
      }

      // Initial Angle
      const initialAngle = (idx * Math.PI * 2) / CELESTIAL_BODIES.length;
      orbitGroup.rotation.y = initialAngle;

      planetNodes.push({
        body,
        orbitGroup,
        mesh: pMesh,
        sprite: pSprite,
        moonGroup,
      });
    });

    // --- 3. Asteroid Belt ---
    const asteroidCount = 380;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount * 3; i += 3) {
      const radius = 5.1 + Math.random() * 0.75;
      const angle = Math.random() * Math.PI * 2;
      const yOffset = (Math.random() - 0.5) * 0.28;

      asteroidPos[i] = Math.cos(angle) * radius;
      asteroidPos[i + 1] = yOffset;
      asteroidPos[i + 2] = Math.sin(angle) * radius;
    }

    asteroidGeo.setAttribute("position", new THREE.BufferAttribute(asteroidPos, 3));
    const asteroidMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
    });
    const asteroidBelt = new THREE.Points(asteroidGeo, asteroidMat);
    solarGroup.add(asteroidBelt);

    // --- 4. Starfield Background ---
    const starCount = 950;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 75;
      starPos[i + 1] = (Math.random() - 0.5) * 75;
      starPos[i + 2] = (Math.random() - 0.5) * 75;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.048,
      transparent: true,
      opacity: 0.45,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Interaction Physics ---
    let targetTiltX = 0.45;
    let targetTiltY = 0;
    let isMouseDown = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevMousePos = { x: 0, y: 0 };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleFocusPlanet = (body: CelestialBody | null) => {
      setSelectedBody(body);
      setShowDetailCard(body !== null);
      if (body) {
        playWhooshSound();
      } else {
        playBlipSound(440, 0.06);
      }
    };
    focusPlanetRef.current = handleFocusPlanet;

    const onPointerDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsDragging(true);
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;
        targetTiltX = Math.max(-0.25, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      const movedDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      isMouseDown = false;
      setIsDragging(false);

      if (movedDist < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(clickableObjects, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const body: CelestialBody | undefined = hit.userData?.body;
          if (body) {
            handleFocusPlanet(body);
          }
        }
      }
    };

    // Mobile Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isMouseDown = true;
        setIsDragging(true);
        pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isMouseDown && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;
        targetTiltX = Math.max(-0.25, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        const movedDist = Math.hypot(t.clientX - pointerDownPos.x, t.clientY - pointerDownPos.y);
        isMouseDown = false;
        setIsDragging(false);

        if (movedDist < 8) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(pointer, camera);
          const intersects = raycaster.intersectObjects(clickableObjects, false);

          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const body: CelestialBody | undefined = hit.userData?.body;
            if (body) {
              handleFocusPlanet(body);
            }
          }
        }
      }
    };

    canvasHolder.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    canvasHolder.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize Handler
    const onResize = () => {
      if (!canvasHolder) return;
      const width = canvasHolder.clientWidth || window.innerWidth;
      const height = canvasHolder.clientHeight || window.innerHeight;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener("resize", onResize);

    // --- Animation Loop with Real-time Camera Follow & Left-side Framing ---
    let animId: number;
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetWorldPos = new THREE.Vector3();
    const desiredCameraPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Rotate Sun & Corona
      sunMesh.rotation.y += 0.003;
      coronaMesh.rotation.y -= 0.005;
      coronaMesh.rotation.z += 0.002;

      // Asteroid belt & Stars
      asteroidBelt.rotation.y += 0.0015;
      stars.rotation.y += 0.00015;

      const activeSelected = selectedBodyRef.current;
      const speedFactor = orbitSpeedRef.current;

      // Orbit Planets CONTINUES MOVING even when clicked
      if (isPlayingRef.current) {
        planetNodes.forEach((node) => {
          node.orbitGroup.rotation.y += node.body.speed * speedFactor;
          node.mesh.rotation.y += 0.018; // Rotasi planet pada porosnya

          if (node.moonGroup) {
            node.moonGroup.rotation.y += 0.045; // Bulan mengelilingi Bumi
          }
        });
      }

      // Camera Tracking Logic
      if (activeSelected) {
        let focusedMesh: THREE.Object3D | null = null;
        if (activeSelected.id === "matahari") {
          focusedMesh = sunMesh;
        } else {
          const found = planetNodes.find((n) => n.body.id === activeSelected.id);
          if (found) focusedMesh = found.mesh;
        }

        if (focusedMesh) {
          // 1. Get real-time moving world position of the planet
          focusedMesh.getWorldPosition(targetWorldPos);

          const zoomDistance = Math.max(1.2, activeSelected.size * 3.6);

          // 2. Dynamic formation flight camera position following the orbiting planet
          if (activeSelected.id === "matahari") {
            desiredCameraPos.set(
              targetWorldPos.x + zoomDistance * 0.8,
              targetWorldPos.y + zoomDistance * 0.45,
              targetWorldPos.z + zoomDistance * 1.3
            );
          } else {
            // Calculate orbital tangent and radial vector for cinematic following angle
            const radius = Math.hypot(targetWorldPos.x, targetWorldPos.z);
            const radialX = radius > 0.01 ? targetWorldPos.x / radius : 1;
            const radialZ = radius > 0.01 ? targetWorldPos.z / radius : 0;
            const tangentX = -radialZ;
            const tangentZ = radialX;

            desiredCameraPos.set(
              targetWorldPos.x - tangentX * (zoomDistance * 0.9) + radialX * (zoomDistance * 0.5),
              targetWorldPos.y + zoomDistance * 0.45,
              targetWorldPos.z - tangentZ * (zoomDistance * 0.9) + radialZ * (zoomDistance * 0.5)
            );
          }

          if (!isNaN(desiredCameraPos.x)) {
            camera.position.lerp(desiredCameraPos, 0.08);
          }

          // 3. FRAME THE PLANET ON THE LEFT SIDE OF THE SCREEN:
          const camForward = new THREE.Vector3()
            .subVectors(targetWorldPos, camera.position)
            .normalize();
          const camRight = new THREE.Vector3()
            .crossVectors(camForward, camera.up)
            .normalize();

          if (camRight.lengthSq() < 0.001) {
            camRight.set(1, 0, 0);
          }

          // Shift look-at target to the RIGHT by an offset proportional to view width
          const isWideView = (canvasHolder.clientWidth || window.innerWidth) > 768;
          const shiftFactor = isWideView ? 0.62 : 0.35;
          const shiftOffset = camRight.clone().multiplyScalar(zoomDistance * shiftFactor);

          lookTarget.copy(targetWorldPos).add(shiftOffset);

          if (!isNaN(lookTarget.x)) {
            currentLookAt.lerp(lookTarget, 0.08);
            camera.lookAt(currentLookAt);
          }
        }
      } else {
        // Global Overview Mode: Interactive 360° Drag
        solarGroup.rotation.x += (targetTiltX - solarGroup.rotation.x) * 0.08;
        solarGroup.rotation.y += (targetTiltY - solarGroup.rotation.y) * 0.08;

        desiredCameraPos.set(0, 7.5, 14);
        camera.position.lerp(desiredCameraPos, 0.05);
        currentLookAt.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        camera.lookAt(currentLookAt);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      canvasHolder.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);

      canvasHolder.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);

      if (canvasHolder.contains(renderer.domElement)) {
        canvasHolder.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Navigation handlers
  const allBodies = [SUN_DATA, ...CELESTIAL_BODIES];

  const handleSelectBody = (body: CelestialBody | null) => {
    focusPlanetRef.current(body);
  };

  const handleNextBody = () => {
    if (!selectedBody) {
      handleSelectBody(allBodies[1]);
      return;
    }
    const currIdx = allBodies.findIndex((b) => b.id === selectedBody.id);
    const nextIdx = (currIdx + 1) % allBodies.length;
    handleSelectBody(allBodies[nextIdx]);
  };

  const handlePrevBody = () => {
    if (!selectedBody) {
      handleSelectBody(allBodies[allBodies.length - 1]);
      return;
    }
    const currIdx = allBodies.findIndex((b) => b.id === selectedBody.id);
    const prevIdx = (currIdx - 1 + allBodies.length) % allBodies.length;
    handleSelectBody(allBodies[prevIdx]);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative select-none overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] w-screen h-screen bg-[#030407]"
          : "w-full h-[480px] sm:h-[540px] md:h-[600px] rounded-2xl bg-[#040508] border border-white/10 shadow-2xl"
      }`}
    >
      {/* 3D WebGL Canvas Container: absolute inset-0 guarantees it always fills 100% of the box */}
      <div
        ref={canvasHolderRef}
        className={`absolute inset-0 w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
        title="Klik planet untuk zoom & ikuti orbitnya, atau putar 360°"
      />

      {/* Top Left: Astronomical HUD Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 font-mono text-xs text-zinc-300 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-white">Tata Surya 3D Realistis</span>
        <span className="text-zinc-600">•</span>
        <span className="text-cyber-cyan text-[11px]">Dynamic Tracking</span>
      </div>

      {/* Top Right Controls: Fullscreen Landscape + Reset */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Fullscreen Landscape Toggle */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-white/15 text-white backdrop-blur-md border border-white/20 font-mono text-xs font-semibold transition-all active:scale-95 shadow-lg"
          title={isFullscreen ? "Keluar Mode Layar Penuh" : "Mode Fullscreen Landscape (Layar Penuh Android)"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Keluar Layar Penuh</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Fullscreen Landscape</span>
            </>
          )}
        </button>

        {/* Reset / Overview Button (when a planet is focused) */}
        {selectedBody && (
          <button
            onClick={() => handleSelectBody(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-mono text-xs font-semibold transition-all active:scale-95 shadow-lg"
            title="Kembali ke tampilan seluruh tata surya"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="hidden sm:inline">Tata Surya (Reset)</span>
          </button>
        )}
      </div>

      {/* Overview Drag Hint */}
      {!selectedBody && (
        <div className="absolute top-16 right-4 z-20 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/5 font-mono text-[10px] text-zinc-400 pointer-events-none hidden sm:block">
          KLIK PLANET UNTUK TRACKING ORBIT • DRAG 360°
        </div>
      )}

      {/* Ultra-Detailed Scientific HUD Panel (Positioned on the RIGHT side so planet on the LEFT is unobstructed) */}
      {selectedBody && showDetailCard && (
        <div
          className={`absolute z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 text-white animate-in fade-in slide-in-from-right duration-300 ${
            isFullscreen
              ? "top-16 right-4 bottom-20 w-[92vw] sm:w-[420px] p-5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4"
              : "top-16 right-4 bottom-20 w-[92vw] sm:w-[380px] p-4 sm:p-5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3.5"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyber-cyan font-semibold">
                  {selectedBody.type}
                </span>
                <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Kamera Mengikuti Orbit
                </span>
              </div>
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <span>{selectedBody.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{
                    backgroundColor: `#${selectedBody.fallbackColor.toString(16).padStart(6, "0")}`,
                  }}
                />
              </h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedBody.tagline}</p>
            </div>

            <button
              onClick={() => handleSelectBody(null)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
              title="Tutup & kembali ke orbit overview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {selectedBody.description}
          </p>

          {/* Category Tabs: Ringkasan, Fisik, Orbit */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px]">
            <button
              onClick={() => {
                setActiveTab("ringkasan");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeTab === "ringkasan" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => {
                setActiveTab("fisik");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeTab === "fisik" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Data Fisik
            </button>
            <button
              onClick={() => {
                setActiveTab("orbit");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-lg transition-all ${
                activeTab === "orbit" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Orbit & Iklim
            </button>
          </div>

          {/* TAB 1: Ringkasan */}
          {activeTab === "ringkasan" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Compass className="w-3 h-3 text-cyber-cyan" />
                    <span>Diameter</span>
                  </div>
                  <div className="font-bold text-white text-xs">{selectedBody.diameter}</div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Jarak Matahari</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate" title={selectedBody.distanceFromSun}>
                    {selectedBody.distanceFromSun}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Kala Rotasi</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate" title={selectedBody.rotationPeriod}>
                    {selectedBody.rotationPeriod}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    <span>Kala Revolusi</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate" title={selectedBody.orbitalPeriod}>
                    {selectedBody.orbitalPeriod}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Thermometer className="w-3 h-3 text-red-400" />
                    <span>Suhu Rata-rata</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate" title={selectedBody.temperature}>
                    {selectedBody.temperature}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Satelit Alami</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate" title={selectedBody.moonsCount}>
                    {selectedBody.moonsCount}
                  </div>
                </div>
              </div>

              {/* Major Moons List if present */}
              {selectedBody.majorMoons && selectedBody.majorMoons.length > 0 && (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 font-mono text-[11px] space-y-1">
                  <div className="text-zinc-400 font-semibold flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-cyber-cyan" />
                    <span>Satelit Utama Terkenal:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {selectedBody.majorMoons.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Data Fisik */}
          {activeTab === "fisik" && (
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400">Massa Planet:</div>
                <div className="font-bold text-white text-xs">{selectedBody.mass}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>Gravitasi Permukaan:</span>
                </div>
                <div className="font-bold text-white text-xs">{selectedBody.gravity}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400">Kecepatan Lepas (Escape Velocity):</div>
                <div className="font-bold text-white text-xs">{selectedBody.escapeVelocity}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 flex items-center gap-1.5">
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  <span>Kemiringan Sumbu Rotasi (Axial Tilt):</span>
                </div>
                <div className="font-bold text-white text-xs">{selectedBody.axialTilt}</div>
              </div>
            </div>
          )}

          {/* TAB 3: Orbit & Iklim */}
          {activeTab === "orbit" && (
            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400">Kecepatan Orbit Mengitari Matahari:</div>
                <div className="font-bold text-white text-xs">{selectedBody.orbitalVelocity}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-cyber-cyan" />
                  <span>Komposisi Atmosfer:</span>
                </div>
                <div className="text-zinc-200 text-[11px] leading-relaxed">{selectedBody.atmosphere}</div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-red-400" />
                  <span>Rentang Suhu:</span>
                </div>
                <div className="font-bold text-white text-xs">{selectedBody.temperature}</div>
              </div>
            </div>
          )}

          {/* Fun Fact Callout */}
          <div className="p-3 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/25 font-mono text-[11px] text-cyber-cyan leading-relaxed">
            <span className="font-bold">Fakta Ilmiah Unik: </span>
            <span className="text-zinc-200">{selectedBody.funFact}</span>
          </div>

          {/* Card Bottom Navigation: Prev, Overview, Next */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
            <button
              onClick={handlePrevBody}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors active:scale-95"
              title="Planet Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => handleSelectBody(null)}
              className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Kembali ke Orbit
            </button>

            <button
              onClick={handleNextBody}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors active:scale-95"
              title="Planet Berikutnya"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2 pointer-events-auto">
        {/* Planet Quick Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 px-2 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 font-mono text-[11px] max-w-[75%] scrollbar-none">
          {allBodies.map((body) => {
            const isSelected = selectedBody?.id === body.id;
            return (
              <button
                key={body.id}
                onClick={() => {
                  if (isSelected) {
                    handleSelectBody(null);
                  } else {
                    handleSelectBody(body);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-md scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{
                    backgroundColor: `#${body.fallbackColor.toString(16).padStart(6, "0")}`,
                  }}
                />
                <span>{body.name}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit Speed & Play/Pause Controls */}
        <div className="flex items-center gap-1.5">
          {/* Speed Toggle (1x / 2x / 0.5x) */}
          <button
            onClick={() => {
              playClickSound();
              setOrbitSpeedFactor((prev) => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0));
            }}
            className="px-2.5 py-2 rounded-xl font-mono text-[11px] font-semibold bg-black/70 hover:bg-white/10 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition-all shadow-md"
            title="Ubah kecepatan orbit simulasi"
          >
            {orbitSpeedFactor}x Speed
          </button>

          {/* Orbit Play / Pause Button */}
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playClickSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-xs font-semibold backdrop-blur-md border transition-all shadow-md active:scale-95 ${
              isPlaying
                ? "bg-white/10 text-white border-white/15 hover:bg-white/20"
                : "bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30"
            }`}
            title={isPlaying ? "Jeda rotasi & orbit" : "Lanjutkan rotasi & orbit"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
