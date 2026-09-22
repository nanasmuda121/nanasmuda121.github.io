"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  playClickSound,
  playWhooshSound,
  playBlipSound,
  playExplosionSound,
  playRocketLaunchSound,
  playThrusterSound,
} from "@/utils/audio";
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
  Rocket,
  Flame,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
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

  // Controllable Rocket States
  const [isRocketMode, setIsRocketMode] = useState<boolean>(false);
  const [rocketTelemetry, setRocketTelemetry] = useState({
    speedKmH: 28000,
    distAU: 1.0,
    boundaryWarning: false,
  });
  const [rocketBanner, setRocketBanner] = useState<string>("");

  // References for render loop to avoid tearing
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const orbitSpeedRef = useRef(orbitSpeedFactor);
  orbitSpeedRef.current = orbitSpeedFactor;

  const selectedBodyRef = useRef<CelestialBody | null>(selectedBody);
  selectedBodyRef.current = selectedBody;

  const isRocketModeRef = useRef(isRocketMode);
  isRocketModeRef.current = isRocketMode;

  const rocketControlsRef = useRef({
    turnLeft: false,
    turnRight: false,
    pitchUp: false,
    pitchDown: false,
    boost: false,
    brake: false,
    analogX: 0,
    analogY: 0,
  });

  // Virtual Analog Joystick states
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const isTouchDraggingRef = useRef(false);
  const keysPressedRef = useRef({ w: false, a: false, s: false, d: false });
  const kbKnobRef = useRef({ x: 0, y: 0 });

  const handleJoystickStart = (clientX: number, clientY: number) => {
    isTouchDraggingRef.current = true;
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: knobX, y: knobY });
    setIsJoystickActive(true);

    rocketControlsRef.current.analogX = knobX / maxRadius;
    rocketControlsRef.current.analogY = -knobY / maxRadius;
  };

  const handleJoystickMove = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 38;

    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: knobX, y: knobY });

    rocketControlsRef.current.analogX = knobX / maxRadius;
    rocketControlsRef.current.analogY = -knobY / maxRadius;
  };

  const handleJoystickEnd = () => {
    isTouchDraggingRef.current = false;
    kbKnobRef.current = { x: 0, y: 0 };
    setJoystickPos({ x: 0, y: 0 });
    setIsJoystickActive(false);
    rocketControlsRef.current.analogX = 0;
    rocketControlsRef.current.analogY = 0;
    joystickTouchIdRef.current = null;
  };

  // Global drag listener for continuous joystick tracking
  useEffect(() => {
    if (!isRocketMode) {
      handleJoystickEnd();
      return;
    }

    const onGlobalTouchMove = (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
          e.preventDefault();
          handleJoystickMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    };

    const onGlobalTouchEnd = (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
          handleJoystickEnd();
          break;
        }
      }
    };

    const onGlobalMouseMove = (e: MouseEvent) => {
      if (isJoystickActive && joystickTouchIdRef.current === -1) {
        handleJoystickMove(e.clientX, e.clientY);
      }
    };

    const onGlobalMouseUp = () => {
      if (isJoystickActive && joystickTouchIdRef.current === -1) {
        handleJoystickEnd();
      }
    };

    window.addEventListener("touchmove", onGlobalTouchMove, { passive: false });
    window.addEventListener("touchend", onGlobalTouchEnd);
    window.addEventListener("mousemove", onGlobalMouseMove);
    window.addEventListener("mouseup", onGlobalMouseUp);

    return () => {
      window.removeEventListener("touchmove", onGlobalTouchMove);
      window.removeEventListener("touchend", onGlobalTouchEnd);
      window.removeEventListener("mousemove", onGlobalMouseMove);
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [isRocketMode, isJoystickActive]);

  // External triggers
  const focusPlanetRef = useRef<(body: CelestialBody | null) => void>(() => {});
  const launchRocketRef = useRef<() => void>(() => {});
  const exitRocketRef = useRef<() => void>(() => {});

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

    // --- 5. Controllable Space Rocket & Flight System ---
    const rocketGroup = new THREE.Group();
    const rocketVisuals = new THREE.Group();
    rocketGroup.add(rocketVisuals);

    // Fuselage / body: sleek rocket cone + cylinder
    const bodyGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.38, isTouchDevice ? 6 : 10);
    bodyGeo.rotateX(Math.PI / 2); // align along -Z
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const rocketBody = new THREE.Mesh(bodyGeo, bodyMat);
    rocketVisuals.add(rocketBody);

    // Nose cone (cyber cyan tip)
    const noseGeo = new THREE.ConeGeometry(0.04, 0.16, isTouchDevice ? 6 : 10);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.translate(0, 0, -0.27);
    const noseMat = new THREE.MeshLambertMaterial({ color: 0x00f0ff });
    const rocketNose = new THREE.Mesh(noseGeo, noseMat);
    rocketVisuals.add(rocketNose);

    // Cockpit canopy visor
    const cockpitGeo = new THREE.SphereGeometry(0.045, isTouchDevice ? 6 : 10, isTouchDevice ? 6 : 10);
    cockpitGeo.translate(0, 0.04, -0.06);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    rocketVisuals.add(cockpitMesh);

    // Swept fins (3 fins at 120° angles)
    const finMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 });
    for (let i = 0; i < 3; i++) {
      const finGeo = new THREE.BoxGeometry(0.015, 0.12, 0.14);
      finGeo.translate(0, 0.07, 0.12);
      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.rotation.z = (i * Math.PI * 2) / 3;
      rocketVisuals.add(finMesh);
    }

    // Engine nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.06, isTouchDevice ? 6 : 8);
    nozzleGeo.rotateX(Math.PI / 2);
    nozzleGeo.translate(0, 0, 0.22);
    const nozzleMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    rocketVisuals.add(nozzleMesh);

    // Thruster exhaust flame
    const flameGeo = new THREE.ConeGeometry(0.045, 0.26, isTouchDevice ? 6 : 8);
    flameGeo.rotateX(Math.PI / 2);
    flameGeo.translate(0, 0, 0.35);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.9,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    rocketVisuals.add(flameMesh);

    rocketGroup.position.set(0, 0.6, 5.0);
    rocketGroup.rotation.set(0, Math.PI, 0);
    rocketGroup.visible = false;
    scene.add(rocketGroup);

    // --- 6. 3D Explosion Particle System & Shockwave ---
    const EXPLOSION_PARTICLES = isTouchDevice ? 36 : 60;
    const expGeo = new THREE.BufferGeometry();
    const expPositions = new Float32Array(EXPLOSION_PARTICLES * 3);
    const expVelocities: THREE.Vector3[] = [];
    const expColors = new Float32Array(EXPLOSION_PARTICLES * 3);

    const colorPalette = [
      new THREE.Color(0xff3b30),
      new THREE.Color(0xff9500),
      new THREE.Color(0xffcc00),
      new THREE.Color(0x00f0ff),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
      expVelocities.push(new THREE.Vector3());
      const c = colorPalette[i % colorPalette.length];
      expColors[i * 3] = c.r;
      expColors[i * 3 + 1] = c.g;
      expColors[i * 3 + 2] = c.b;
    }

    expGeo.setAttribute("position", new THREE.BufferAttribute(expPositions, 3));
    expGeo.setAttribute("color", new THREE.BufferAttribute(expColors, 3));

    const expMat = new THREE.PointsMaterial({
      size: isTouchDevice ? 0.12 : 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0,
    });
    const explosionPoints = new THREE.Points(expGeo, expMat);
    scene.add(explosionPoints);

    // Shockwave ring
    const shockwaveGeo = new THREE.RingGeometry(0.04, 0.15, isTouchDevice ? 16 : 24);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    scene.add(shockwaveMesh);

    let isExploding = false;
    let explosionProgress = 0;
    let cameraShake = 0;
    let rocketSpeed = 0.04;

    const triggerExplosion = (reason: string, hitPos: THREE.Vector3) => {
      if (isExploding) return;
      isExploding = true;
      explosionProgress = 0;
      cameraShake = 0.32;
      rocketGroup.visible = false;
      playExplosionSound();

      explosionPoints.position.copy(hitPos);
      shockwaveMesh.position.copy(hitPos);
      expMat.opacity = 1.0;
      shockwaveMat.opacity = 0.85;
      shockwaveMesh.scale.set(1, 1, 1);

      for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
        const spd = 0.06 + Math.random() * 0.14;
        const phi = Math.random() * Math.PI * 2;
        const costheta = Math.random() * 2 - 1;
        const theta = Math.acos(costheta);
        expVelocities[i].set(
          Math.sin(theta) * Math.cos(phi) * spd,
          Math.sin(theta) * Math.sin(phi) * spd,
          Math.cos(theta) * spd
        );
        expPositions[i * 3] = 0;
        expPositions[i * 3 + 1] = 0;
        expPositions[i * 3 + 2] = 0;
      }
      expGeo.attributes.position.needsUpdate = true;

      setRocketBanner(`💥 MELEDAK! ${reason}`);
    };

    const respawnRocket = () => {
      isExploding = false;
      explosionProgress = 0;
      cameraShake = 0;
      expMat.opacity = 0;
      shockwaveMat.opacity = 0;

      // Spawn near Earth's orbital distance facing inward toward Sun
      rocketGroup.position.set(0, 0.6, 5.0);
      rocketGroup.rotation.set(0, Math.PI, 0);
      rocketVisuals.rotation.set(0, 0, 0);
      rocketSpeed = 0.04;
      rocketGroup.visible = true;

      playRocketLaunchSound();
      setRocketBanner("🚀 Roket Baru Diluncurkan! Siap dikendalikan.");
      setTimeout(() => {
        setRocketBanner("");
      }, 3000);
    };

    launchRocketRef.current = () => {
      setSelectedBody(null);
      setShowDetailCard(false);
      setIsRocketMode(true);
      isRocketModeRef.current = true;
      respawnRocket();
    };

    exitRocketRef.current = () => {
      setIsRocketMode(false);
      isRocketModeRef.current = false;
      rocketGroup.visible = false;
      isExploding = false;
      expMat.opacity = 0;
      shockwaveMat.opacity = 0;
      setRocketBanner("");
      handleJoystickEnd();
      playBlipSound(440, 0.06);
    };

    // Keyboard controls for flight
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isRocketModeRef.current) return;
      const key = e.code;
      if (key === "KeyA" || key === "ArrowLeft") { keysPressedRef.current.a = true; e.preventDefault(); }
      if (key === "KeyD" || key === "ArrowRight") { keysPressedRef.current.d = true; e.preventDefault(); }
      if (key === "KeyW" || key === "ArrowUp") { keysPressedRef.current.w = true; e.preventDefault(); }
      if (key === "KeyS" || key === "ArrowDown") { keysPressedRef.current.s = true; e.preventDefault(); }
      if (key === "Space") {
        e.preventDefault();
        rocketControlsRef.current.boost = true;
        playThrusterSound();
      }
      if (key === "KeyB" || key === "KeyX") rocketControlsRef.current.brake = true;
      if (key === "Escape") exitRocketRef.current();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (!isRocketModeRef.current) return;
      const key = e.code;
      if (key === "KeyA" || key === "ArrowLeft") keysPressedRef.current.a = false;
      if (key === "KeyD" || key === "ArrowRight") keysPressedRef.current.d = false;
      if (key === "KeyW" || key === "ArrowUp") keysPressedRef.current.w = false;
      if (key === "KeyS" || key === "ArrowDown") keysPressedRef.current.s = false;
      if (key === "Space") rocketControlsRef.current.boost = false;
      if (key === "KeyB" || key === "KeyX") rocketControlsRef.current.brake = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // --- Interaction Physics ---
    let targetTiltX = 0.45;
    let targetTiltY = 0;
    let isMouseDown = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevMousePos = { x: 0, y: 0 };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleFocusPlanet = (body: CelestialBody | null) => {
      if (isRocketModeRef.current) return;
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
      if (isRocketModeRef.current) return;
      isMouseDown = true;
      setIsDragging(true);
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      if (isMouseDown && !selectedBodyRef.current && !isRocketModeRef.current) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;
        targetTiltX = Math.max(-0.25, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      if (isRocketModeRef.current) return;
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

    // Zoom control: Interactive wheel zoom and mobile pinch-to-zoom
    let overviewZoom = 1.0;
    let pinchStartDist = 0;
    let pinchStartZoom = 1.0;

    const onWheel = (e: WheelEvent) => {
      if (isRocketModeRef.current || selectedBodyRef.current) return;
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.0012;
      overviewZoom = Math.max(0.42, Math.min(1.85, overviewZoom + zoomDelta));
    };

    // Mobile Touch
    const onTouchStart = (e: TouchEvent) => {
      if (isRocketModeRef.current) return;
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
        pinchStartZoom = overviewZoom;
      } else if (e.touches.length === 1) {
        isMouseDown = true;
        setIsDragging(true);
        pointerDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && !selectedBodyRef.current && !isRocketModeRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        if (pinchStartDist > 0) {
          const ratio = currentDist / pinchStartDist;
          overviewZoom = Math.max(0.42, Math.min(1.85, pinchStartZoom / ratio));
        }
      } else if (isMouseDown && e.touches.length === 1 && !selectedBodyRef.current && !isRocketModeRef.current) {
        const deltaX = e.touches[0].clientX - prevMousePos.x;
        const deltaY = e.touches[0].clientY - prevMousePos.y;

        targetTiltY += deltaX * 0.006;
        targetTiltX += deltaY * 0.006;
        targetTiltX = Math.max(-0.25, Math.min(1.4, targetTiltX));

        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isRocketModeRef.current) return;
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
    canvasHolder.addEventListener("wheel", onWheel, { passive: false });

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
      // When inspecting a planet, in rocket flight, or zoomed in close, all labels disappear
      const isZoomedIn = overviewZoom < 0.78;
      if (activeSelected || isRocketModeRef.current || isZoomedIn) {
        sunSprite.visible = false;
        planetNodes.forEach((node) => {
          node.sprite.visible = false;
          if (node.moonSprite) {
            node.moonSprite.visible = false;
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

      // ==========================================
      // MODE 1: CONTROLLABLE ROCKET FLIGHT & COMBAT
      // ==========================================
      if (isRocketModeRef.current) {
        if (isExploding) {
          explosionProgress += 0.024; // ~40 frames
          cameraShake *= 0.88;

          for (let i = 0; i < EXPLOSION_PARTICLES; i++) {
            expPositions[i * 3] += expVelocities[i].x;
            expPositions[i * 3 + 1] += expVelocities[i].y;
            expPositions[i * 3 + 2] += expVelocities[i].z;
          }
          expGeo.attributes.position.needsUpdate = true;
          expMat.opacity = Math.max(0, 1.0 - explosionProgress);

          const swScale = 1.0 + explosionProgress * 10.0;
          shockwaveMesh.scale.set(swScale, swScale, swScale);
          shockwaveMat.opacity = Math.max(0, (1.0 - explosionProgress) * 0.7);

          if (explosionProgress >= 1.0) {
            respawnRocket();
          }
        } else {
          // PC WASD drives Virtual Analog Joystick when not touch dragging
          if (!isTouchDraggingRef.current) {
            const keys = keysPressedRef.current;
            let kx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            let ky = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
            const kLen = Math.hypot(kx, ky);
            if (kLen > 1) {
              kx /= kLen;
              ky /= kLen;
            }
            const targetX = kx * 38;
            const targetY = ky * 38;
            kbKnobRef.current.x += (targetX - kbKnobRef.current.x) * 0.25;
            kbKnobRef.current.y += (targetY - kbKnobRef.current.y) * 0.25;

            const dist = Math.hypot(kbKnobRef.current.x, kbKnobRef.current.y);
            if (dist > 0.3) {
              rocketControlsRef.current.analogX = kbKnobRef.current.x / 38;
              rocketControlsRef.current.analogY = -kbKnobRef.current.y / 38;
              setJoystickPos({ x: kbKnobRef.current.x, y: kbKnobRef.current.y });
              setIsJoystickActive(true);
            } else if (kLen === 0 && (kbKnobRef.current.x !== 0 || kbKnobRef.current.y !== 0)) {
              kbKnobRef.current.x = 0;
              kbKnobRef.current.y = 0;
              rocketControlsRef.current.analogX = 0;
              rocketControlsRef.current.analogY = 0;
              setJoystickPos({ x: 0, y: 0 });
              setIsJoystickActive(false);
            }
          }

          const ctrl = rocketControlsRef.current;
          const turnSpeed = 0.048;
          const steerX = ctrl.analogX;
          const pitchY = ctrl.analogY;

          // Apply analog yaw steering (left/right)
          if (Math.abs(steerX) > 0.03) {
            rocketGroup.rotateOnAxis(new THREE.Vector3(0, 1, 0), -steerX * turnSpeed);
          }

          // Apply analog pitch steering (up/down)
          if (Math.abs(pitchY) > 0.03) {
            rocketGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), pitchY * turnSpeed * 0.75);
          }

          // Smooth aerodynamic banking roll based on steering angle
          const targetBank = -steerX * 0.52;
          rocketVisuals.rotation.z += (targetBank - rocketVisuals.rotation.z) * 0.15;

          const targetSpeed = ctrl.boost ? 0.11 : ctrl.brake ? 0.015 : 0.045;
          rocketSpeed += (targetSpeed - rocketSpeed) * 0.1;

          // Forward movement (-Z local forward)
          const forwardVec = new THREE.Vector3(0, 0, -1).applyQuaternion(rocketGroup.quaternion);
          rocketGroup.position.addScaledVector(forwardVec, rocketSpeed);

          // Animated thruster flame
          const flameScale = ctrl.boost ? 1.8 + Math.random() * 0.4 : 1.0 + Math.random() * 0.2;
          flameMesh.scale.set(1, 1, flameScale);
          flameMat.color.setHex(ctrl.boost ? 0x00f0ff : 0xff7700);

          // Telemetry calculation
          const rPos = rocketGroup.position;
          const distSun = rPos.length();
          const speedKmH = Math.round(rocketSpeed * 750000);
          const isNearBoundary = distSun > 14.5;
          setRocketTelemetry({
            speedKmH,
            distAU: Number(distSun.toFixed(1)),
            boundaryWarning: isNearBoundary,
          });

          // --- COLLISION CHECKS ---
          // 1. Sun collision
          if (distSun < SUN_DATA.size + 0.14) {
            triggerExplosion("Menabrak Matahari!", rPos.clone());
          }
          // 2. Out of bounds (Kuiper belt boundary)
          else if (distSun > 17.5) {
            triggerExplosion("Terlalu Jauh dari Tata Surya (Keluar Batas)!", rPos.clone());
          }
          // 3. Planet and Moon collisions
          else {
            const tempWorld = new THREE.Vector3();
            for (const node of planetNodes) {
              node.mesh.getWorldPosition(tempWorld);
              const distToPlanet = rPos.distanceTo(tempWorld);
              if (distToPlanet < node.body.size + 0.14) {
                triggerExplosion(`Menabrak Planet ${node.body.name}!`, rPos.clone());
                break;
              }

              if (node.moonMesh) {
                node.moonMesh.getWorldPosition(tempWorld);
                const distToMoon = rPos.distanceTo(tempWorld);
                if (distToMoon < MOON_DATA.size + 0.10) {
                  triggerExplosion("Menabrak Bulan (Luna)!", rPos.clone());
                  break;
                }
              }
            }
          }
        }

        // Smooth Rocket Chase Camera
        const chaseOffset = new THREE.Vector3(0, 0.42, 1.4).applyQuaternion(rocketGroup.quaternion);
        desiredCameraPos.copy(rocketGroup.position).add(chaseOffset);

        if (cameraShake > 0.001) {
          desiredCameraPos.x += (Math.random() - 0.5) * cameraShake;
          desiredCameraPos.y += (Math.random() - 0.5) * cameraShake;
          desiredCameraPos.z += (Math.random() - 0.5) * cameraShake;
        }

        camera.position.lerp(desiredCameraPos, 0.15);
        const lookAhead = new THREE.Vector3(0, 0.05, -2.2).applyQuaternion(rocketGroup.quaternion);
        camera.lookAt(rocketGroup.position.clone().add(lookAhead));

      // ==========================================
      // MODE 2: PLANET FOCUS & ORBIT TRACKING
      // ==========================================
      } else if (activeSelected) {
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
          const currentId = activeSelected.id;
          if (currentId !== prevSelectedId) {
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

      // ==========================================
      // MODE 3: GLOBAL SOLAR SYSTEM OVERVIEW
      // ==========================================
      } else {
        // Global Overview Mode: Interactive 360° Drag & Dynamic Zoom
        overviewCamPos.set(
          0,
          (isTouchDevice ? 7.8 : 6.8) * overviewZoom,
          (isTouchDevice ? 12.8 : 10.8) * overviewZoom
        );

        solarGroup.rotation.x += (targetTiltX - solarGroup.rotation.x) * 0.08;
        solarGroup.rotation.y += (targetTiltY - solarGroup.rotation.y) * 0.08;

        if (prevSelectedId !== null) {
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvasHolder.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      canvasHolder.removeEventListener("wheel", onWheel);

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
    if (isRocketModeRef.current) {
      exitRocketRef.current();
    }
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

      {/* Top Right Controls: Fullscreen Landscape (Mobile Only) + Rocket + Reset */}
      {!isRocketMode && (
        <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 flex items-center gap-1.5">
          {/* Launch Rocket Trigger in Top Header */}
          {!selectedBody && (
            <button
              onClick={() => {
                playClickSound();
                launchRocketRef.current();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 text-cyber-cyan border border-cyber-cyan/40 font-mono text-[10px] sm:text-xs font-bold transition-all shadow-md active:scale-95"
              title="Luncurkan dan kendalikan roket penjelajah antariksa!"
            >
              <Rocket className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
              <span>Mode Roket</span>
            </button>
          )}

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
      )}

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

      {/* ========================================================= */}
      {/* ROCKET FLIGHT HUD OVERLAY (When isRocketMode is Active) */}
      {/* ========================================================= */}
      {isRocketMode && (
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-2.5 sm:p-4 select-none">
          {/* Top Flight Telemetry Bar */}
          <div className="flex items-center justify-between gap-2 pointer-events-auto flex-wrap">
            {/* Left: Rocket telemetry (Speed + Solar AU distance) */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#060814]/90 border border-cyber-cyan/35 backdrop-blur-md shadow-xl font-mono text-[10px] sm:text-xs text-white">
              <div className="flex items-center gap-1.5 text-cyber-cyan font-bold">
                <Rocket className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">ROKET:</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-emerald-400">
                <Zap className="w-3 h-3" />
                <span>{rocketTelemetry.speedKmH.toLocaleString()} km/h</span>
              </div>
              <span className="text-zinc-600">•</span>
              <div className="text-amber-300 font-semibold">
                ☀️ {rocketTelemetry.distAU} AU
              </div>
            </div>

            {/* Center: Boundary Warning (if near outer Kuiper belt) */}
            {rocketTelemetry.boundaryWarning && (
              <div className="animate-pulse px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl bg-red-950/90 border border-red-500/60 text-red-300 font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-900/40">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
                <span>MENDEKATI BATAS TATA SURYA!</span>
              </div>
            )}

            {/* Right: Fullscreen Toggle (Mobile/Fullscreen) + Exit Rocket Mode Button */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={toggleFullscreen}
                className={`${
                  isFullscreen ? "flex" : "flex md:hidden"
                } items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#060814]/90 hover:bg-white/15 text-white border border-white/20 font-mono text-[10px] sm:text-xs font-semibold transition-all active:scale-95 shadow-lg`}
                title={isFullscreen ? "Keluar Mode Layar Penuh" : "Mode Fullscreen Landscape (Layar Penuh Android)"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Layar Normal</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className="hidden sm:inline">Layar Penuh</span>
                  </>
                )}
              </button>

              <button
                onClick={() => exitRocketRef.current()}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-red-500/20 hover:bg-red-500/35 text-red-200 border border-red-500/40 font-mono text-[10px] sm:text-xs font-bold transition-all active:scale-95 shadow-lg"
                title="Keluar dari mode roket (Kembali ke Tata Surya)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Keluar Mode</span>
              </button>
            </div>
          </div>

          {/* Center Banner Alert (Explosion or Launch notification) */}
          {rocketBanner && (
            <div
              className={`self-center animate-in fade-in zoom-in duration-200 px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl font-mono text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-xl border flex items-center gap-2 max-w-[90%] text-center pointer-events-auto ${
                rocketBanner.includes("MELEDAK") || rocketBanner.includes("Menabrak") || rocketBanner.includes("Batas")
                  ? "bg-red-950/90 border-red-500/60 text-red-200 shadow-red-900/50"
                  : "bg-[#070918]/95 border-cyber-cyan/50 text-cyber-cyan shadow-cyan-950/50"
              }`}
            >
              {rocketBanner.includes("MELEDAK") || rocketBanner.includes("Menabrak") || rocketBanner.includes("Batas") ? (
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-bounce" />
              ) : (
                <Rocket className="w-4 h-4 text-cyber-cyan flex-shrink-0 animate-pulse" />
              )}
              <span>{rocketBanner}</span>
            </div>
          )}

          {/* Bottom Flight Controls: Virtual 360° Analog Joystick & Boost/Brake */}
          <div className="w-full flex items-end justify-between pointer-events-auto">
            {/* Left: Virtual 360° Analog Joystick Controller */}
            <div className="flex flex-col items-center select-none touch-none">
              <div
                ref={joystickBaseRef}
                onMouseDown={(e) => {
                  e.preventDefault();
                  joystickTouchIdRef.current = -1;
                  handleJoystickStart(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (e.changedTouches.length > 0) {
                    const t = e.changedTouches[0];
                    joystickTouchIdRef.current = t.identifier;
                    handleJoystickStart(t.clientX, t.clientY);
                  }
                }}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md transition-shadow duration-200 ${
                  isJoystickActive
                    ? "bg-[#060818]/90 border-2 border-cyber-cyan shadow-[0_0_25px_rgba(0,240,255,0.45)]"
                    : "bg-[#060814]/75 border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                }`}
                title="Analog Joystick 360°: Arahkan roket ke segala arah"
              >
                {/* Radial Reticle & Crosshairs */}
                <div className="absolute inset-0 rounded-full border border-dashed border-white/15 pointer-events-none" />
                <div className="absolute w-[68%] h-[68%] rounded-full border border-cyber-cyan/20 pointer-events-none" />
                <div className="absolute w-[36%] h-[36%] rounded-full border border-cyber-cyan/30 pointer-events-none" />
                <div className="absolute w-full h-[1px] bg-white/10 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-white/10 pointer-events-none" />

                {/* Direction indicators */}
                <span className="absolute top-1 text-[8px] sm:text-[9px] font-mono font-bold text-cyber-cyan/80 pointer-events-none tracking-wider">
                  ▲ NAIK
                </span>
                <span className="absolute bottom-1 text-[8px] sm:text-[9px] font-mono font-bold text-cyber-cyan/80 pointer-events-none tracking-wider">
                  ▼ TURUN
                </span>
                <span className="absolute left-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-cyber-cyan/80 pointer-events-none">
                  ◀
                </span>
                <span className="absolute right-1.5 text-[8px] sm:text-[9px] font-mono font-bold text-cyber-cyan/80 pointer-events-none">
                  ▶
                </span>

                {/* Draggable Analog Knob */}
                <div
                  className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center pointer-events-none shadow-2xl"
                  style={{
                    transform: `translate3d(${joystickPos.x}px, ${joystickPos.y}px, 0)`,
                    transition: isJoystickActive ? "none" : "transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)",
                    background: isJoystickActive
                      ? "radial-gradient(circle at 35% 35%, #38bdf8 0%, #0284c7 45%, #0f172a 100%)"
                      : "radial-gradient(circle at 35% 35%, #00f0ff 0%, #0369a1 50%, #090d1f 100%)",
                    boxShadow: isJoystickActive
                      ? "0 0 20px rgba(56, 189, 248, 0.8), inset 0 0 10px rgba(255,255,255,0.6)"
                      : "0 4px 15px rgba(0, 240, 255, 0.4), inset 0 0 6px rgba(255,255,255,0.4)",
                    border: "2px solid rgba(255, 255, 255, 0.7)",
                  }}
                >
                  <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  </div>
                </div>
              </div>

              {/* Joystick Footer Hint */}
              <div className="mt-1 px-2 py-0.5 rounded-md bg-[#060814]/80 border border-white/10 font-mono text-[8px] sm:text-[9px] text-zinc-400">
                🕹️ ANALOG 360°
              </div>
            </div>

            {/* Center: Desktop Keyboard Help Guide */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#060814]/85 border border-white/15 backdrop-blur-md font-mono text-[11px] text-zinc-300 shadow-xl mb-1">
              <span className="text-cyber-cyan font-bold">[W/S]</span>
              <span>Pitch</span>
              <span className="text-zinc-600">•</span>
              <span className="text-cyber-cyan font-bold">[A/D]</span>
              <span>Belok</span>
              <span className="text-zinc-600">•</span>
              <span className="text-cyber-cyan font-bold">[SPASI]</span>
              <span>Turbo</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-bold">[B]</span>
              <span>Rem</span>
            </div>

            {/* Right: Boost & Brake Action Buttons */}
            <div className="flex flex-col gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#060814]/80 backdrop-blur-md border border-white/10 shadow-xl select-none touch-none">
              {/* Turbo Boost Button */}
              <button
                onMouseDown={() => {
                  rocketControlsRef.current.boost = true;
                  playThrusterSound();
                }}
                onMouseUp={() => (rocketControlsRef.current.boost = false)}
                onMouseLeave={() => (rocketControlsRef.current.boost = false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  rocketControlsRef.current.boost = true;
                  playThrusterSound();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  rocketControlsRef.current.boost = false;
                }}
                className="px-3.5 py-2 sm:px-5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold font-mono text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-90 transition-all shadow-lg shadow-cyan-500/30 active:from-cyan-400 active:to-blue-500"
                title="Tekan untuk Akselerasi Turbo Penuh"
              >
                <Flame className="w-4 h-4 fill-current text-white animate-pulse" />
                <span className="text-white font-bold">BOOST</span>
              </button>

              {/* Air Brake Button */}
              <button
                onMouseDown={() => (rocketControlsRef.current.brake = true)}
                onMouseUp={() => (rocketControlsRef.current.brake = false)}
                onMouseLeave={() => (rocketControlsRef.current.brake = false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  rocketControlsRef.current.brake = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  rocketControlsRef.current.brake = false;
                }}
                className="px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 active:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-mono text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 active:scale-90 transition-all shadow-md"
                title="Tekan untuk Mengerem Roket"
              >
                <span>REM</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SOLAR SYSTEM FLOATING BOTTOM BAR (When Not in Rocket Mode) */}
      {/* ========================================================= */}
      {!isRocketMode && (
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-20 flex items-center justify-between gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Planet Quick Selector Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 px-1.5 sm:py-1.5 sm:px-2 bg-[#070912]/90 rounded-lg sm:rounded-xl border border-white/12 font-mono text-[10px] sm:text-[11px] max-w-[60%] sm:max-w-[70%] scrollbar-none shadow-lg">
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

          {/* Center/Action: Launch Controllable Space Rocket Button */}
          <button
            onClick={() => {
              playClickSound();
              launchRocketRef.current();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 text-cyber-cyan border border-cyber-cyan/40 font-mono text-[10px] sm:text-xs font-bold transition-all shadow-md active:scale-95 flex-shrink-0"
            title="Luncurkan dan kendalikan roket penjelajah antariksa!"
          >
            <Rocket className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            <span>Mode Roket</span>
          </button>

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
      )}
    </div>
  );
}
