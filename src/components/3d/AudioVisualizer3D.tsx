"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Square, Activity, Volume2, VolumeX, Sliders } from "lucide-react";
import { playClickSound, isSoundEnabled } from "@/utils/audio";

export default function AudioVisualizer3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveType, setWaveType] = useState<OscillatorType>("sine");
  const [frequency, setFrequency] = useState(220);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Initialize or resume audio context
  const startAudio = () => {
    if (typeof window === "undefined") return;

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const osc = ctx.createOscillator();
    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    osc.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
    setIsPlaying(true);
    playClickSound();
  };

  const stopAudio = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // Ignore
      }
      oscRef.current = null;
    }
    setIsPlaying(false);
    playClickSound();
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // Canvas 3D rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;

    const render = () => {
      animationIdRef.current = requestAnimationFrame(render);
      time += 0.03;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background gradient grid
      ctx.fillStyle = "#090a10";
      ctx.fillRect(0, 0, width, height);

      // Hairline grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Frequency data
      const barCount = 28;
      const dataArray = new Uint8Array(barCount);

      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
      } else {
        // Idle ambient gentle wave
        for (let i = 0; i < barCount; i++) {
          dataArray[i] = Math.sin(time + i * 0.3) * 20 + 25;
        }
      }

      // Render 3D isometric perspective columns
      const originX = width * 0.5;
      const originY = height * 0.78;
      const barWidth = 8;
      const barDepth = 6;
      const spacing = 10;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i] / 255; // 0 to 1
        const barHeight = Math.max(val * (height * 0.65), 6);

        // Isometric offset coordinates
        const xIndex = i - barCount / 2;
        const posX = originX + xIndex * spacing;
        const posY = originY - xIndex * 1.5;

        // Colors
        const isHot = val > 0.6;
        const topColor = isHot ? "#00f0ff" : "#4f46e5";
        const frontColor = isHot ? "rgba(0, 240, 255, 0.7)" : "rgba(79, 70, 229, 0.6)";
        const sideColor = isHot ? "rgba(0, 180, 210, 0.5)" : "rgba(60, 50, 190, 0.4)";

        // Front Face
        ctx.fillStyle = frontColor;
        ctx.fillRect(posX, posY - barHeight, barWidth, barHeight);

        // Top Face (Isometric parallelogram)
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(posX, posY - barHeight);
        ctx.lineTo(posX + barDepth, posY - barHeight - barDepth * 0.6);
        ctx.lineTo(posX + barWidth + barDepth, posY - barHeight - barDepth * 0.6);
        ctx.lineTo(posX + barWidth, posY - barHeight);
        ctx.closePath();
        ctx.fill();

        // Right Side Face
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(posX + barWidth, posY - barHeight);
        ctx.lineTo(posX + barWidth + barDepth, posY - barHeight - barDepth * 0.6);
        ctx.lineTo(posX + barWidth + barDepth, posY - barDepth * 0.6);
        ctx.lineTo(posX + barWidth, posY);
        ctx.closePath();
        ctx.fill();
      }

      // Center horizon line
      ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, originY);
      ctx.lineTo(width - 10, originY);
      ctx.stroke();
    };

    render();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      stopAudio();
    };
  }, [isPlaying]);

  const changeFrequency = (newFreq: number) => {
    setFrequency(newFreq);
    if (oscRef.current && audioContextRef.current) {
      oscRef.current.frequency.setValueAtTime(newFreq, audioContextRef.current.currentTime);
    }
  };

  const changeWave = (type: OscillatorType) => {
    setWaveType(type);
    if (oscRef.current) {
      oscRef.current.type = type;
    }
    playClickSound();
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 bg-[#090a12]/90 rounded-xl border border-white/10 relative overflow-hidden">
      {/* Header Info */}
      <div className="flex items-center justify-between z-10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide">3D DSP Spectral Visualizer</h4>
            <p className="text-[11px] font-mono text-zinc-400">Web Audio API • Real-Time FFT</p>
          </div>
        </div>

        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
            isPlaying
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
              : "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 hover:bg-cyber-cyan/30"
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span>STOP OSC</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>TEST DSP</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Visualizer Canvas */}
      <div className="relative w-full h-[150px] rounded-lg overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          width={380}
          height={150}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 font-mono text-[9px] text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/5">
          {isPlaying ? `${frequency}Hz • ${waveType.toUpperCase()}` : "DSP IDLE • PASSIVE ECHO"}
        </div>
      </div>

      {/* Frequency & Waveform Controls */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-1">
          {(["sine", "sawtooth", "triangle"] as OscillatorType[]).map((type) => (
            <button
              key={type}
              onClick={() => changeWave(type)}
              className={`px-2 py-0.5 rounded text-[10px] uppercase transition-colors ${
                waveType === type
                  ? "bg-white/15 text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {type.slice(0, 4)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">FREQ</span>
          <input
            type="range"
            min={110}
            max={880}
            step={10}
            value={frequency}
            onChange={(e) => changeFrequency(Number(e.target.value))}
            className="w-20 accent-cyber-cyan cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] text-cyber-cyan font-mono w-10 text-right">{frequency}Hz</span>
        </div>
      </div>
    </div>
  );
}
