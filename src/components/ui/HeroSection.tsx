"use client";

import React from "react";
import HeroCanvas3D from "@/components/3d/HeroCanvas3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ArrowDown, MessageCircle, Sparkles, Check } from "lucide-react";
import { playClickSound } from "@/utils/audio";

export default function HeroSection() {
  const identity = PORTFOLIO_DATA.identity;

  return (
    <section className="relative pt-24 pb-12 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden space-y-7 sm:space-y-9">
      {/* Top Telemetry Ribbon */}
      <div className="flex items-center justify-between font-mono text-xs sm:text-sm md:text-base text-zinc-400 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-semibold tracking-wider">{identity.statusBadge}</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">WA: {identity.phone}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs sm:text-sm">
          <span className="text-zinc-400">CLEAN ARCHITECTURE</span>
          <span className="text-zinc-600">•</span>
          <span className="text-cyber-cyan font-semibold">FULL SOURCE CODE</span>
        </div>
      </div>

      {/* Main Hero Header: Expansive, Bold & High-Impact Typography for PC & Mobile */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 font-mono text-xs sm:text-sm md:text-base text-cyber-cyan">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{identity.role}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            {identity.fullName}
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
            {identity.tagline}
          </p>

          <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal pt-1 max-w-3xl">
            {identity.description}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 flex-shrink-0 font-mono text-xs sm:text-sm md:text-base">
          <a
            href="#catalog"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            <span>Lihat Katalog Produk</span>
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          <a
            href={identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Hubungi WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Guarantee Badges Ribbon */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-1 pb-1 font-mono text-xs sm:text-sm md:text-base text-zinc-300">
        {(identity.guarantees || ["Full Source Code", "Siap Build APK/Web", "Fast Response WA"]).map(
          (g) => (
            <div key={g} className="flex items-center gap-2 sm:gap-2.5">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
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
