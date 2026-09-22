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
    
    // Accurate detection of touch/mobile device (works across Android portrait and landscape)
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
        (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
        Math.min(window.innerWidth, window.innerHeight) < 700);

    const camera = new THREE.PerspectiveCamera(
      45,
      initialWidth / initialHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7.5, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isTouchDevice,
      alpha: true,
      powerPreference: "high-performance",
      precision: isTouchDevice ? "mediump" : "highp",
    });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(isTouchDevice ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));

    // Clear holder & mount canvas
    while (canvasHolder.firstChild) {
      canvasHolder.removeChild(canvasHolder.firstChild);
    }
    canvasHolder.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x556080, 1.6);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffffff, 4.0, 180, 0.35);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    if (!isTouchDevice) {
      const topFillLight = new THREE.DirectionalLight(0xffffff, 0.35);
      topFillLight.position.set(0, 25, 10);
      scene.add(topFillLight);
    }

    // Main Solar System Group
    const solarGroup = new THREE.Group();
    solarGroup.rotation.x = 0.45;
    scene.add(solarGroup);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // Helper: Create 3D Label Sprite with high contrast & crisp typography
    function createNameSprite(name: string, colorHex: number) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Sprite();

      ctx.fillStyle = "rgba(6, 8, 16, 0.92)";
      ctx.beginPath();
      ctx.roundRect(8, 8, 496, 112, 32);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.stroke();

      ctx.fillStyle = `#${colorHex.toString(16).padStart(6, "0")}`;
      ctx.beginPath();
      ctx.arc(58, 64, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 56px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.fillText(name, 96, 65);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(2.2, 0.55, 1);
      return sprite;
    }

    // --- 1. The Sun (Matahari) ---
    const sunTexture = textureLoader.load(SUN_DATA.texturePath);
    const sunGeo = new THREE.SphereGeometry(SUN_DATA.size, isTouchDevice ? 18 : 28, isTouchDevice ? 18 : 28);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: SUN_DATA.fallbackColor,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { body: SUN_DATA };
    solarGroup.add(sunMesh);

    // Corona wireframe / glow sphere
    const coronaGeo = new THREE.SphereGeometry(SUN_DATA.size * 1.25, isTouchDevice ? 16 : 24, isTouchDevice ? 16 : 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    solarGroup.add(coronaMesh);

    // Sun Label Sprite (bold, large, prominent in overview)
    const sunSprite = createNameSprite(SUN_DATA.name, 0xffd23f);
    sunSprite.scale.set(2.8, 0.70, 1);
    sunSprite.position.set(0, SUN_DATA.size + 0.88, 0);
    sunSprite.userData = { body: SUN_DATA };
    sunMesh.add(sunSprite);

    const clickableObjects: THREE.Object3D[] = [sunMesh, sunSprite];

    // --- 2. Planets & Orbits ---
    const planetNodes: PlanetNode[] = [];

    CELESTIAL_BODIES.forEach((body, idx) => {
      // Orbit Line
      const segments = isTouchDevice ? 36 : 72;
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

      // Planet Sphere: MeshLambertMaterial for lightning-fast performance & smooth shading
      const pTexture = textureLoader.load(body.texturePath);
      const pGeo = new THREE.SphereGeometry(body.size, isTouchDevice ? 16 : 24, isTouchDevice ? 16 : 24);
      const pMat = new THREE.MeshLambertMaterial({
        map: pTexture,
        color: body.fallbackColor,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.x = body.distance;
      pMesh.userData = { body };
      orbitGroup.add(pMesh);

      // Planet Label Sprite (large and distinct in overview)
      const pSprite = createNameSprite(body.name, body.fallbackColor);
      pSprite.scale.set(2.2, 0.55, 1);
      pSprite.position.set(0, body.size + 0.65, 0);
      pSprite.userData = { body };
      pMesh.add(pSprite);

      clickableObjects.push(pMesh, pSprite);

      // Saturn & Uranus Rings
      if (body.hasRing && body.ringInner && body.ringOuter) {
        const ringGeo = new THREE.RingGeometry(body.ringInner, body.ringOuter, isTouchDevice ? 32 : 48);
        const ringTexture = body.ringTexturePath ? textureLoader.load(body.ringTexturePath) : null;
        const ringMat = new THREE.MeshLambertMaterial({
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
        const moonSegments = isTouchDevice ? 24 : 48;
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
        const moonGeo = new THREE.SphereGeometry(MOON_DATA.size, isTouchDevice ? 12 : 18, isTouchDevice ? 12 : 18);
        const moonMat = new THREE.MeshLambertMaterial({
          map: moonTexture,
          color: MOON_DATA.fallbackColor,
        });
        moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.x = moonOrbitRadius;
        moonMesh.userData = { body: MOON_DATA };
        moonGroup.add(moonMesh);

        // Moon Label Sprite (hidden in overview to prevent overlapping Earth; visible when tracking Earth/Moon)
        moonSprite = createNameSprite(MOON_DATA.name, MOON_DATA.fallbackColor);
        moonSprite.scale.set(1.5, 0.38, 1);
        moonSprite.position.set(0, MOON_DATA.size + 0.36, 0);
        moonSprite.visible = false;
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
    const asteroidCount = isTouchDevice ? 80 : 200;
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
    const starCount = isTouchDevice ? 160 : 450;
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

    // Frame throttling: 30 FPS on touch/mobile devices, 60 FPS on desktop
    const targetFps = isTouchDevice ? 30 : 60;
    const frameInterval = 1000 / targetFps;
    let lastRenderTime = 0;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      // Skip render workload if canvas is scrolled out of view to maintain 60fps across the website
      if (!isCanvasVisible) {
        return;
      }

      // Delta throttling to strictly enforce target FPS and prevent mobile GPU overload
      const delta = time - lastRenderTime;
      if (delta < frameInterval) {
        return;
      }
      lastRenderTime = time - (delta % frameInterval);

      // Rotate Sun & Corona
      sunMesh.rotation.y += 0.003;
      coronaMesh.rotation.y -= 0.005;
      coronaMesh.rotation.z += 0.002;

      // Asteroid belt & Stars
      asteroidBelt.rotation.y += 0.0015;
      stars.rotation.y += 0.00015;

      const activeSelected = selectedBodyRef.current;
      const speedFactor = orbitSpeedRef.current;

      // Dynamic sprite visibility & scaling for optimal readability
      if (activeSelected) {
        // Focused mode: show only the selected body's label, hide distant labels to prevent clutter
        sunSprite.visible = activeSelected.id === "matahari";
        if (sunSprite.visible) sunSprite.scale.set(1.5, 0.38, 1);

        planetNodes.forEach((node) => {
          const isThisSelected = node.body.id === activeSelected.id;
          node.sprite.visible = isThisSelected;
          if (isThisSelected) {
            node.sprite.scale.set(1.4, 0.35, 1);
          }

          if (node.moonSprite) {
            const isMoonOrEarth = activeSelected.id === "bulan" || activeSelected.id === "bumi";
            node.moonSprite.visible = isMoonOrEarth;
            if (isMoonOrEarth) {
              node.moonSprite.scale.set(1.2, 0.30, 1);
            }
          }
        });
      } else {
        // Overview mode: all planet labels clearly visible and large!
        sunSprite.visible = true;
        sunSprite.scale.set(2.8, 0.70, 1);

        planetNodes.forEach((node) => {
          node.sprite.visible = true;
          node.sprite.scale.set(2.2, 0.55, 1);
          if (node.moonSprite) {
            node.moonSprite.visible = false; // Hide moon in full overview to avoid overlapping Earth
          }
        });
      }

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

    animate(performance.now());

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
      <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#070912]/90 border border-white/12 font-mono text-[10px] sm:text-xs text-zinc-300 pointer-events-none shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-white">Tata Surya 3D</span>
        <span className="text-zinc-600 hidden sm:inline">•</span>
        <span className="text-cyber-cyan font-semibold hidden sm:inline">Tracking</span>
      </div>

      {/* Top Right Controls: Fullscreen Landscape (Mobile Only) + Reset */}
      <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 flex items-center gap-1.5">
        {/* Fullscreen Landscape Toggle - Exclusively for Android / Mobile, HIDDEN on PC */}
        <button
          onClick={toggleFullscreen}
          className={`${
            isFullscreen ? "flex" : "flex md:hidden"
          } items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#070912]/90 hover:bg-white/15 text-white border border-white/15 font-mono text-[10px] sm:text-xs font-semibold transition-all active:scale-95 shadow-md`}
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
            className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#070912]/90 hover:bg-white/20 text-white border border-white/15 font-mono text-[10px] sm:text-xs font-semibold transition-all active:scale-95 shadow-md"
            title="Kembali ke tampilan seluruh tata surya"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyber-cyan" />
            <span>Tata Surya</span>
          </button>
        )}
      </div>

      {/* Overview Drag Hint */}
      {!selectedBody && (
        <div className="absolute top-11 right-3 sm:top-14 sm:right-4 z-20 px-2.5 py-1 rounded-lg bg-[#070912]/80 border border-white/10 font-mono text-[9px] sm:text-[10px] text-zinc-400 pointer-events-none hidden md:block">
          KLIK PLANET UNTUK TRACKING • DRAG 360°
        </div>
      )}

      {/* Ultra-Detailed Scientific HUD Panel - Scaled down, compact, and responsive */}
      {selectedBody && showDetailCard && (
        <div
          className={`absolute z-30 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 text-white animate-in fade-in duration-300 bg-[#070914]/95 border border-white/15 shadow-2xl ${
            isFullscreen
              ? "top-11 right-2 sm:right-4 bottom-12 sm:bottom-14 w-[280px] sm:w-[320px] md:w-[360px] p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-2.5"
              : "top-11 right-2 sm:right-4 bottom-12 sm:bottom-14 max-h-[calc(100%-56px)] w-[280px] sm:w-[320px] md:w-[360px] p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-2.5 max-sm:bottom-11 max-sm:top-auto max-sm:left-2 max-sm:right-2 max-sm:w-auto max-sm:max-h-[46vh]"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5 font-mono text-[9px] sm:text-[10px]">
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-cyber-cyan font-semibold">
                  {selectedBody.type}
                </span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Mengikuti Orbit
                </span>
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 text-white">
                <span>{selectedBody.name}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                  style={{
                    backgroundColor: `#${selectedBody.fallbackColor.toString(16).padStart(6, "0")}`,
                  }}
                />
              </h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-mono mt-0.5">{selectedBody.tagline}</p>
            </div>

            <button
              onClick={() => handleSelectBody(null)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors active:scale-95 flex-shrink-0"
              title="Tutup & kembali ke orbit overview"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed font-sans">
            {selectedBody.description}
          </p>

          {/* Category Tabs: Ringkasan, Fisik, Orbit */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[10px] sm:text-[11px]">
            <button
              onClick={() => {
                setActiveTab("ringkasan");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-md transition-all font-semibold ${
                activeTab === "ringkasan" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => {
                setActiveTab("fisik");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-md transition-all font-semibold ${
                activeTab === "fisik" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Fisik
            </button>
            <button
              onClick={() => {
                setActiveTab("orbit");
                playClickSound();
              }}
              className={`flex-1 py-1 rounded-md transition-all font-semibold ${
                activeTab === "orbit" ? "bg-white text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Orbit
            </button>
          </div>

          {/* TAB 1: Ringkasan */}
          {activeTab === "ringkasan" && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] sm:text-[11px]">
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Compass className="w-3 h-3 text-cyber-cyan" />
                    <span>Diameter</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate">{selectedBody.diameter}</div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Jarak Surya</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate" title={selectedBody.distanceFromSun}>
                    {selectedBody.distanceFromSun}
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>Kala Rotasi</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate" title={selectedBody.rotationPeriod}>
                    {selectedBody.rotationPeriod}
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    <span>Kala Revolusi</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate" title={selectedBody.orbitalPeriod}>
                    {selectedBody.orbitalPeriod}
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Thermometer className="w-3 h-3 text-red-400" />
                    <span>Suhu Rata</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate" title={selectedBody.temperature}>
                    {selectedBody.temperature}
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex items-center gap-1 text-zinc-400 text-[9px] sm:text-[10px]">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Satelit</span>
                  </div>
                  <div className="font-bold text-white text-[10px] sm:text-[11px] truncate" title={selectedBody.moonsCount}>
                    {selectedBody.moonsCount}
                  </div>
                </div>
              </div>

              {/* Major Moons List if present */}
              {selectedBody.majorMoons && selectedBody.majorMoons.length > 0 && (
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px] space-y-1">
                  <div className="text-zinc-300 font-semibold flex items-center gap-1.5 text-[9px] sm:text-[10px]">
                    <Layers className="w-3 h-3 text-cyber-cyan" />
                    <span>Satelit Utama:</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {selectedBody.majorMoons.map((m) => (
                      <span key={m} className="px-1.5 py-0.5 rounded-md bg-white/10 text-white text-[9px] sm:text-[10px]">
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
            <div className="space-y-1.5 font-mono text-[10px] sm:text-[11px]">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px]">Massa Planet:</div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.mass}</div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px] flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-emerald-400" />
                  <span>Gravitasi Permukaan:</span>
                </div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.gravity}</div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px]">Kecepatan Lepas (Escape Velocity):</div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.escapeVelocity}</div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px] flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-amber-400" />
                  <span>Kemiringan Sumbu (Axial Tilt):</span>
                </div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.axialTilt}</div>
              </div>
            </div>
          )}

          {/* TAB 3: Orbit & Iklim */}
          {activeTab === "orbit" && (
            <div className="space-y-1.5 font-mono text-[10px] sm:text-[11px]">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px]">Kecepatan Orbit:</div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.orbitalVelocity}</div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px] flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyber-cyan" />
                  <span>Komposisi Atmosfer:</span>
                </div>
                <div className="text-zinc-200 text-[10px] sm:text-[11px] leading-relaxed">{selectedBody.atmosphere}</div>
              </div>

              <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                <div className="text-zinc-400 text-[9px] sm:text-[10px] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-red-400" />
                  <span>Rentang Suhu:</span>
                </div>
                <div className="font-bold text-white text-[10px] sm:text-[11px]">{selectedBody.temperature}</div>
              </div>
            </div>
          )}

          {/* Fun Fact Callout */}
          <div className="p-2 sm:p-2.5 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/20 font-mono text-[10px] sm:text-[11px] text-cyber-cyan leading-snug">
            <span className="font-bold">Fakta Ilmiah Unik: </span>
            <span className="text-zinc-200">{selectedBody.funFact}</span>
          </div>

          {/* Card Bottom Navigation: Prev, Overview, Next */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[10px] sm:text-[11px]">
            <button
              onClick={handlePrevBody}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors active:scale-95"
              title="Planet Sebelumnya"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Prev</span>
            </button>

            <button
              onClick={() => handleSelectBody(null)}
              className="text-[10px] sm:text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 transition-colors"
            >
              Orbit Overview
            </button>

            <button
              onClick={handleNextBody}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors active:scale-95"
              title="Planet Berikutnya"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar - Compact, sleek, and unobtrusive */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-20 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Planet Quick Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 px-1.5 sm:py-1.5 sm:px-2 bg-[#070912]/90 rounded-lg sm:rounded-xl border border-white/12 font-mono text-[10px] sm:text-[11px] max-w-[70%] sm:max-w-[78%] scrollbar-none shadow-lg">
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
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg whitespace-nowrap transition-all flex items-center gap-1 text-[10px] sm:text-[11px] ${
                  isSelected
                    ? "bg-white text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
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
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Speed Toggle (1x / 2x / 0.5x) */}
          <button
            onClick={() => {
              playClickSound();
              setOrbitSpeedFactor((prev) => (prev === 1.0 ? 2.0 : prev === 2.0 ? 0.5 : 1.0));
            }}
            className="px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg font-mono text-[10px] sm:text-[11px] font-semibold bg-[#070912]/90 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/12 transition-all shadow-md active:scale-95"
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
            className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg font-mono text-[10px] sm:text-[11px] font-semibold border transition-all shadow-md active:scale-95 ${
              isPlaying
                ? "bg-[#070912]/90 text-white border-white/15 hover:bg-white/15"
                : "bg-amber-400/20 text-amber-300 border-amber-400/40 hover:bg-amber-400/30"
            }`}
            title={isPlaying ? "Jeda rotasi & orbit" : "Lanjutkan rotasi & orbit"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
