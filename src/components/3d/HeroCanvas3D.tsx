"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { playClickSound, playWhooshSound, playBlipSound } from "@/utils/audio";
import {
  CELESTIAL_BODIES,
  SUN_DATA,
  MOON_DATA,
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
  moonMesh?: THREE.Mesh;
  moonSprite?: THREE.Sprite;
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
    const isMobile = initialWidth < 768 || (typeof window !== "undefined" && window.innerWidth < 768);

    const camera = new THREE.PerspectiveCamera(
      45,
      initialWidth / initialHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7.5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
      precision: isMobile ? "mediump" : "highp",
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));

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
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Sprite();

      ctx.fillStyle = "rgba(8, 10, 18, 0.88)";
      ctx.beginPath();
      ctx.roundRect(12, 12, 488, 104, 32);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.stroke();

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, "0")}`;
      ctx.beginPath();
      ctx.arc(64, 64, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 44px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(name, 102, 66);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(isMobile ? 1.15 : 1.45, isMobile ? 0.28 : 0.36, 1);
      return sprite;
    }

    // --- 1. The Sun (Matahari) ---
    const sunTexture = textureLoader.load(SUN_DATA.texturePath);
    const sunGeo = new THREE.SphereGeometry(SUN_DATA.size, isMobile ? 22 : 32, isMobile ? 22 : 32);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: SUN_DATA.fallbackColor,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { body: SUN_DATA };
    solarGroup.add(sunMesh);

    // Corona wireframe / glow sphere
    const coronaGeo = new THREE.SphereGeometry(SUN_DATA.size * 1.25, isMobile ? 18 : 28, isMobile ? 18 : 28);
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
      const segments = isMobile ? 48 : 96;
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
      const pGeo = new THREE.SphereGeometry(body.size, isMobile ? 20 : 28, isMobile ? 20 : 28);
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
        const ringGeo = new THREE.RingGeometry(body.ringInner, body.ringOuter, isMobile ? 36 : 64);
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

      // Earth's Moon (Luna)
      let moonGroup: THREE.Group | undefined;
      let moonMesh: THREE.Mesh | undefined;
      let moonSprite: THREE.Sprite | undefined;

      if (body.hasMoon && body.moonTexturePath) {
        moonGroup = new THREE.Group();
        moonGroup.position.x = body.distance;
        orbitGroup.add(moonGroup);

        // Natural inclination of Moon's orbit (5.14 degrees)
        moonGroup.rotation.x = 0.09;

        // Subtle Moon Orbit Ring around Earth
        const moonSegments = isMobile ? 32 : 64;
        const moonOrbitRadius = MOON_DATA.distance; // 0.50
        const moonTrackPts: number[] = [];
        for (let i = 0; i <= moonSegments; i++) {
          const theta = (i / moonSegments) * Math.PI * 2;
          moonTrackPts.push(Math.cos(theta) * moonOrbitRadius, 0, Math.sin(theta) * moonOrbitRadius);
        }
        const moonTrackGeo = new THREE.BufferGeometry();
        moonTrackGeo.setAttribute("position", new THREE.Float32BufferAttribute(moonTrackPts, 3));
        const moonTrackMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.16,
        });
        const moonTrackLine = new THREE.Line(moonTrackGeo, moonTrackMat);
        moonGroup.add(moonTrackLine);

        // Moon Sphere Mesh
        const moonTexture = textureLoader.load(body.moonTexturePath);
        const moonGeo = new THREE.SphereGeometry(MOON_DATA.size, isMobile ? 16 : 22, isMobile ? 16 : 22);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTexture,
          color: MOON_DATA.fallbackColor,
          roughness: 0.85,
        });
        moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = moonOrbitRadius;
        moonMesh.userData = { body: MOON_DATA };
        moonGroup.add(moonMesh);

        // Moon Label Sprite
        moonSprite = createNameSprite(MOON_DATA.name, MOON_DATA.fallbackColor);
        moonSprite.scale.set(isMobile ? 1.05 : 1.25, isMobile ? 0.25 : 0.30, 1);
        moonSprite.position.set(0, MOON_DATA.size + 0.22, 0);
        moonSprite.userData = { body: MOON_DATA };
        moonMesh.add(moonSprite);

        clickableObjects.push(moonMesh, moonSprite);
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
        moonMesh,
        moonSprite,
      });
    });

    // --- 3. Asteroid Belt ---
    const asteroidCount = isMobile ? 150 : 320;
    const asteroidGeo = new THREE.BufferGeometry();
    const asteroidPos = new Float32Array(asteroidCount * 3);

    for (let i = 0; i < asteroidCount * 3; i += 3) {
      const radius = 5.3 + Math.random() * 0.75;
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
    const starCount = isMobile ? 350 : 750;
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
      if (isMouseDown && !selectedBodyRef.current) {
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
      if (isMouseDown && e.touches.length > 0 && !selectedBodyRef.current) {
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

    // Viewport Visibility Observer: Pauses rendering when scrolled offscreen to prevent any mobile lag
    let isCanvasVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isCanvasVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvasHolder);

    // --- Animation Loop with Real-time Camera Follow & Left-side Framing ---
    let animId: number;
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const targetWorldPos = new THREE.Vector3();
    const desiredCameraPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const refCenterPosVec = new THREE.Vector3();
    const overviewCamPos = new THREE.Vector3(0, 7.5, 14);
    const overviewLookAt = new THREE.Vector3(0, 0, 0);

    // Smooth transition offsets to eliminate all velocity lag and micro-jitter
    const camOffset = new THREE.Vector3();
    const lookOffset = new THREE.Vector3();
    let prevSelectedId: string | null = null;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Skip render workload if canvas is scrolled out of view to maintain 60fps across the website
      if (!isCanvasVisible) {
        return;
      }

      // Rotate Sun & Corona
      sunMesh.rotation.y += 0.003;
      coronaMesh.rotation.y -= 0.005;
      coronaMesh.rotation.z += 0.002;

      // Asteroid belt & Stars
      asteroidBelt.rotation.y += 0.0015;
      stars.rotation.y += 0.00015;

      const activeSelected = selectedBodyRef.current;
      const speedFactor = orbitSpeedRef.current;

      // Damped orbit speed when focused so tracking is calm, cinematic, and stable
      const trackingSpeedDamping = activeSelected !== null ? 0.32 : 1.0;
      const effectiveSpeedFactor = speedFactor * trackingSpeedDamping;

      // Orbit Planets CONTINUES MOVING even when clicked
      if (isPlayingRef.current) {
        planetNodes.forEach((node) => {
          node.orbitGroup.rotation.y += node.body.speed * effectiveSpeedFactor;
          node.mesh.rotation.y += 0.018; // Rotasi planet pada porosnya

          if (node.moonGroup) {
            node.moonGroup.rotation.y += MOON_DATA.speed * effectiveSpeedFactor;
            if (node.moonMesh) {
              node.moonMesh.rotation.y += MOON_DATA.speed * effectiveSpeedFactor; // Tidal locking
            }
          }
        });
      }

      const currentId = activeSelected?.id ?? null;
      const isSelectionChanged = currentId !== prevSelectedId;

      // Camera Tracking Logic
      if (activeSelected) {
        // Smoothly ease solarGroup back to baseline orientation so tracking has standard celestial view
        solarGroup.rotation.x += (0.45 - solarGroup.rotation.x) * 0.05;
        solarGroup.rotation.y += (0 - solarGroup.rotation.y) * 0.05;

        let focusedMesh: THREE.Object3D | null = null;
        if (activeSelected.id === "matahari") {
          focusedMesh = sunMesh;
        } else if (activeSelected.id === "bulan") {
          const earthNode = planetNodes.find((n) => n.body.id === "bumi");
          if (earthNode && earthNode.moonMesh) {
            focusedMesh = earthNode.moonMesh;
          }
        } else {
          const found = planetNodes.find((n) => n.body.id === activeSelected.id);
          if (found) focusedMesh = found.mesh;
        }

        if (focusedMesh) {
          // 1. Get real-time moving world position of the body
          focusedMesh.getWorldPosition(targetWorldPos);

          const ZOOM_DISTANCES: Record<string, number> = {
            matahari: 4.8,
            merkurius: 0.95,
            venus: 1.35,
            bumi: 1.50,
            bulan: 0.58,
            mars: 1.10,
            jupiter: 3.2,
            saturnus: 4.6,
            uranus: 2.5,
            neptunus: 2.3,
          };

          const zoomDistance =
            ZOOM_DISTANCES[activeSelected.id] ?? (activeSelected.size * 3.5 + 1.2);

          // Subtle organic wave effect (gentle harmonic motion, zero jitter)
          const waveTime = performance.now() * 0.001;
          const waveUp = Math.sin(waveTime) * 0.006 * zoomDistance;
          const waveSide = Math.cos(waveTime * 0.8) * 0.005 * zoomDistance;

          // Stable celestial camera framing:
          // In world space, position camera at an elevated front-view angle relative to the planet
          desiredCameraPos.set(
            targetWorldPos.x + waveSide,
            targetWorldPos.y + zoomDistance * 0.36 + waveUp,
            targetWorldPos.z + zoomDistance * 0.96
          );

          // Responsive framing:
          // Desktop / PC (wide view): planet framed comfortably on the left (xTarget = -0.32, yTarget = 0.0)
          // Mobile / Android (portrait): planet centered horizontally (xTarget = 0.0), lifted to upper viewport (yTarget = 0.20)
          const aspect =
            camera.aspect ||
            (canvasHolder.clientWidth || window.innerWidth) /
              Math.max(canvasHolder.clientHeight || window.innerHeight, 1);
          const isWideView = aspect > 1.15;
          const halfFovTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

          const xTarget = isWideView ? -0.32 : 0.0;
          const yTarget = isWideView ? 0.0 : 0.20;

          const shiftDist = -xTarget * zoomDistance * halfFovTan * aspect;
          const vertDist = -yTarget * zoomDistance * halfFovTan;

          lookTarget.set(
            targetWorldPos.x + shiftDist + waveSide,
            targetWorldPos.y + vertDist + waveUp,
            targetWorldPos.z
          );

          // When selection changes, smoothly bridge from current camera position
          if (isSelectionChanged) {
            camOffset.copy(camera.position).sub(desiredCameraPos);
            lookOffset.copy(currentLookAt).sub(lookTarget);
            prevSelectedId = currentId;
          }

          // Zero-lag tracking convergence: offsets decay to zero smoothly
          camOffset.multiplyScalar(0.90);
          lookOffset.multiplyScalar(0.90);

          camera.position.copy(desiredCameraPos).add(camOffset);
          currentLookAt.copy(lookTarget).add(lookOffset);
          camera.lookAt(currentLookAt);
        }
      } else {
        // Global Overview Mode: Interactive 360° Drag
        solarGroup.rotation.x += (targetTiltX - solarGroup.rotation.x) * 0.08;
        solarGroup.rotation.y += (targetTiltY - solarGroup.rotation.y) * 0.08;

        if (isSelectionChanged) {
          camOffset.copy(camera.position).sub(overviewCamPos);
          lookOffset.copy(currentLookAt).sub(overviewLookAt);
          prevSelectedId = null;
        }

        camOffset.multiplyScalar(0.90);
        lookOffset.multiplyScalar(0.90);

        camera.position.copy(overviewCamPos).add(camOffset);
        currentLookAt.copy(overviewLookAt).add(lookOffset);
        camera.lookAt(currentLookAt);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      observer.disconnect();
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

  // Navigation handlers: insert Bulan (Luna) right after Bumi
  const earthIndex = CELESTIAL_BODIES.findIndex((b) => b.id === "bumi");
  const allBodies = [
    SUN_DATA,
    ...CELESTIAL_BODIES.slice(0, earthIndex + 1),
    MOON_DATA,
    ...CELESTIAL_BODIES.slice(earthIndex + 1),
  ];

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
      className={`relative select-none overflow-hidden transition-all duration-500 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] w-screen h-screen bg-[#030407]"
          : "w-full h-[460px] sm:h-[540px] md:h-[640px] lg:h-[720px] rounded-3xl bg-[#040508] border border-white/10 shadow-2xl"
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={canvasHolderRef}
        className={`absolute inset-0 w-full h-full cursor-grab ${isDragging ? "cursor-grabbing" : ""}`}
        title="Klik planet untuk zoom & ikuti orbitnya, atau putar 360°"
      />

      {/* Top Left: Astronomical HUD Badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/10 font-mono text-[11px] sm:text-xs md:text-sm text-zinc-300 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-white">Tata Surya 3D</span>
        <span className="text-zinc-600 hidden sm:inline">•</span>
        <span className="text-cyber-cyan text-[10px] sm:text-xs font-semibold hidden sm:inline">Tracking</span>
      </div>

      {/* Top Right Controls: Fullscreen Landscape (Mobile Only) + Reset */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        {/* Fullscreen Landscape Toggle - Exclusively for Android / Mobile, HIDDEN on PC */}
        <button
          onClick={toggleFullscreen}
          className={`${
            isFullscreen ? "flex" : "flex md:hidden"
          } items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-black/80 hover:bg-white/15 text-white backdrop-blur-md border border-white/20 font-mono text-[11px] sm:text-xs font-semibold transition-all active:scale-95 shadow-md`}
          title={isFullscreen ? "Keluar Mode Layar Penuh" : "Mode Fullscreen Landscape (Layar Penuh Android)"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Keluar</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>Layar Penuh</span>
            </>
          )}
        </button>

        {/* Reset / Overview Button (when a planet is focused) */}
        {selectedBody && (
          <button
            onClick={() => handleSelectBody(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-mono text-[11px] sm:text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-md"
            title="Kembali ke tampilan seluruh tata surya"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyber-cyan" />
            <span>Tata Surya</span>
          </button>
        )}
      </div>

      {/* Overview Drag Hint */}
      {!selectedBody && (
        <div className="absolute top-14 right-3 sm:top-16 sm:right-4 z-20 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[10px] sm:text-xs text-zinc-400 pointer-events-none hidden sm:block">
          KLIK PLANET UNTUK TRACKING • DRAG 360°
        </div>
      )}

      {/* Ultra-Detailed Scientific HUD Panel */}
      {selectedBody && showDetailCard && (
        <div
          className={`absolute z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 text-white animate-in fade-in duration-300 ${
            isFullscreen
              ? "top-14 right-3 sm:right-6 bottom-16 sm:bottom-20 w-[94vw] sm:w-[380px] md:w-[420px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-3 sm:space-y-4"
              : "bottom-14 left-2.5 right-2.5 max-h-[42vh] sm:max-h-none sm:top-16 sm:bottom-24 sm:left-auto sm:right-6 sm:w-[380px] md:w-[420px] lg:w-[450px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3 sm:space-y-4"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2.5 sm:pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1 font-mono text-[10px] sm:text-xs">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyber-cyan font-semibold">
                  {selectedBody.type}
                </span>
                <span className="text-emerald-400 text-[10px] sm:text-xs font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mengikuti Orbit
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>{selectedBody.name}</span>
                <span
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full inline-block"
                  style={{
                    backgroundColor: `#${selectedBody.fallbackColor.toString(16).padStart(6, "0")}`,
                  }}
                />
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 font-mono mt-0.5">{selectedBody.tagline}</p>
            </div>

            <button
              onClick={() => handleSelectBody(null)}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors active:scale-95"
              title="Tutup & kembali ke orbit overview"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-sans">
            {selectedBody.description}
          </p>

          {/* Category Tabs: Ringkasan, Fisik, Orbit */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px] sm:text-xs md:text-sm">
            <button
              onClick={() => {
                setActiveTab("ringkasan");
                playClickSound();
              }}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all font-semibold ${
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
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all font-semibold ${
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
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all font-semibold ${
                activeTab === "orbit" ? "bg-white text-black font-bold shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              Orbit & Iklim
            </button>
          </div>

          {/* TAB 1: Ringkasan */}
          {activeTab === "ringkasan" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs sm:text-sm">
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Diameter</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.diameter}</div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Jarak Matahari</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate" title={selectedBody.distanceFromSun}>
                    {selectedBody.distanceFromSun}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Kala Rotasi</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate" title={selectedBody.rotationPeriod}>
                    {selectedBody.rotationPeriod}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-pink-400" />
                    <span>Kala Revolusi</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate" title={selectedBody.orbitalPeriod}>
                    {selectedBody.orbitalPeriod}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    <span>Suhu Rata-rata</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate" title={selectedBody.temperature}>
                    {selectedBody.temperature}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Satelit Alami</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate" title={selectedBody.moonsCount}>
                    {selectedBody.moonsCount}
                  </div>
                </div>
              </div>

              {/* Major Moons List if present */}
              {selectedBody.majorMoons && selectedBody.majorMoons.length > 0 && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 font-mono text-xs space-y-1.5">
                  <div className="text-zinc-300 font-semibold flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Satelit Utama Terkenal:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedBody.majorMoons.map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs">
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
            <div className="space-y-2.5 font-mono text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs">Massa Planet:</div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.mass}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gravitasi Permukaan:</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.gravity}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs">Kecepatan Lepas (Escape Velocity):</div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.escapeVelocity}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kemiringan Sumbu Rotasi (Axial Tilt):</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.axialTilt}</div>
              </div>
            </div>
          )}

          {/* TAB 3: Orbit & Iklim */}
          {activeTab === "orbit" && (
            <div className="space-y-2.5 font-mono text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs">Kecepatan Orbit Mengitari Matahari:</div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.orbitalVelocity}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Komposisi Atmosfer:</span>
                </div>
                <div className="text-zinc-200 text-xs sm:text-sm leading-relaxed">{selectedBody.atmosphere}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-zinc-400 text-xs flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-red-400" />
                  <span>Rentang Suhu:</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{selectedBody.temperature}</div>
              </div>
            </div>
          )}

          {/* Fun Fact Callout */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/25 font-mono text-xs sm:text-sm text-cyber-cyan leading-relaxed">
            <span className="font-bold">Fakta Ilmiah Unik: </span>
            <span className="text-zinc-200">{selectedBody.funFact}</span>
          </div>

          {/* Card Bottom Navigation: Prev, Overview, Next */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs sm:text-sm">
            <button
              onClick={handlePrevBody}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors active:scale-95"
              title="Planet Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => handleSelectBody(null)}
              className="text-xs sm:text-sm text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Kembali ke Orbit
            </button>

            <button
              onClick={handleNextBody}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors active:scale-95"
              title="Planet Berikutnya"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
        {/* Planet Quick Selector Pills */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 px-2 sm:py-2 sm:px-3 bg-black/80 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 font-mono text-[11px] sm:text-xs md:text-sm max-w-[66%] sm:max-w-[76%] scrollbar-none">
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
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-3.5 md:py-2 rounded-lg sm:rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-md scale-105"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block flex-shrink-0"
                  style={{
                    backgroundColor: `#${body.fallbackColor.toString(16).padStart(6, "0")}`,
                  }}
                />
                <span className="font-medium">{body.name}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit Speed & Play/Pause Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Speed Toggle (1x / 2x / 0.5x) */}
          <button
            onClick={() => {
              playClickSound();
              setOrbitSpeedFactor((prev) => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0));
            }}
            className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs md:text-sm font-semibold bg-black/80 hover:bg-white/15 text-zinc-200 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-md active:scale-95"
            title="Ubah kecepatan orbit simulasi"
          >
            {orbitSpeedFactor}x
          </button>

          {/* Orbit Play / Pause Button */}
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playClickSound();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2.5 rounded-xl font-mono text-[11px] sm:text-xs md:text-sm font-semibold backdrop-blur-md border transition-all shadow-md active:scale-95 ${
              isPlaying
                ? "bg-white/15 text-white border-white/20 hover:bg-white/25"
                : "bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30"
            }`}
            title={isPlaying ? "Jeda rotasi & orbit" : "Lanjutkan rotasi & orbit"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
