"use client";

import React from "react";
import HeroCanvas3D from "@/components/3d/HeroCanvas3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ArrowDown, Copy, Check, Terminal, ExternalLink, Sparkles } from "lucide-react";
import { playClickSound, playSuccessSound } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function HeroSection() {
  const [copied, setCopied] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.identity.email);
    setCopied(true);
    playSuccessSound();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#00f0ff", "#4f46e5", "#ffffff"],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-4 max-w-6xl mx-auto overflow-hidden">
      {/* Background Cybernetic Glow (Subtle & high craft, not AI slop) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyber-cyan/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Grid Coordinates HUD */}
      <div className="flex items-center justify-between mb-6 font-mono text-[11px] text-zinc-500 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold tracking-wider">{PORTFOLIO_DATA.identity.statusBadge}</span>
          <span className="text-zinc-600">•</span>
          <span>JAKARTA, ID ({PORTFOLIO_DATA.identity.coordinates})</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>PIPELINE: NEXT 14 • THREE.JS</span>
          <span>•</span>
          <span className="text-cyber-cyan">60 FPS VERIFIED</span>
        </div>
      </div>

      {/* Main Grid: Left Typography, Right 3D Interactive WebGL Object */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Assertive Modern Typography */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-cyber-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spatial WebGL & Frontend Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
              {PORTFOLIO_DATA.identity.fullName}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-zinc-300 tracking-tight">
              {PORTFOLIO_DATA.identity.role}
            </p>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-xl">
            Specializing in <span className="text-white font-medium">WebGL 3D graphics</span>, real-time audio DSP, and high-performance client architectures. Eliminating AI slop in favor of true spatial depth, mathematical precision, and sub-15ms interactions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#projects"
              onClick={() => playClickSound()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg hover:shadow-cyber-cyan/20 active:scale-95"
            >
              <span>Explore Projects</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>Copy Direct Email</span>
                </>
              )}
            </button>
          </div>

          {/* Engineering Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5">
            {PORTFOLIO_DATA.stats.map((stat, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="text-xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-0.5">
                  {stat.value}
                  {stat.suffix && <span className="text-[10px] text-zinc-500 font-normal">{stat.suffix}</span>}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Real Interactive Three.js 3D WebGL Canvas */}
        <div className="lg:col-span-6">
          <HeroCanvas3D />
        </div>
      </div>
    </section>
  );
}
