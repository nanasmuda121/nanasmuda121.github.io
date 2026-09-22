"use client";

import React from "react";
import HeroCanvas3D from "@/components/3d/HeroCanvas3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ArrowDown, MessageCircle, ShieldCheck, Sparkles, Check } from "lucide-react";
import { playClickSound } from "@/utils/audio";

export default function HeroSection() {
  const identity = PORTFOLIO_DATA.identity;

  return (
    <section className="relative pt-24 pb-10 md:pt-32 md:pb-16 px-4 max-w-6xl mx-auto overflow-hidden space-y-6 sm:space-y-8">
      {/* Top Telemetry Ribbon */}
      <div className="flex items-center justify-between font-mono text-xs sm:text-sm text-zinc-400 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold tracking-wider">{identity.statusBadge}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">WA: {identity.phone}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="text-zinc-400">CLEAN ARCHITECTURE</span>
          <span className="text-zinc-600">•</span>
          <span className="text-cyber-cyan font-semibold">FULL SOURCE CODE</span>
        </div>
      </div>

      {/* Main Hero Header: Expansive, Bold & High-Impact Typography */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs sm:text-sm text-cyber-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{identity.role}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.06]">
            {identity.fullName}
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-200 tracking-tight">
            {identity.tagline}
          </p>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal pt-1">
            {identity.description}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-shrink-0 font-mono text-xs sm:text-sm">
          <a
            href="#catalog"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <span>Lihat Katalog Produk</span>
            <ArrowDown className="w-4 h-4" />
          </a>

          <a
            href={identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Guarantee Badges Ribbon */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-1 pb-1 font-mono text-xs sm:text-sm text-zinc-300">
        {(identity.guarantees || ["Full Source Code", "Siap Build APK/Web", "Fast Response WA"]).map(
          (g) => (
            <div key={g} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{g}</span>
            </div>
          )
        )}
      </div>

      {/* Centerpiece: Full-Width 3D Solar System Experience */}
      <div className="w-full pt-1">
        <HeroCanvas3D />
      </div>
    </section>
  );
}
