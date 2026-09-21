"use client";

import React from "react";
import HeroCanvas3D from "@/components/3d/HeroCanvas3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ArrowDown, MessageCircle, ShieldCheck, Sparkles, Check } from "lucide-react";
import { playClickSound } from "@/utils/audio";

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-12 md:pt-36 md:pb-20 px-4 max-w-6xl mx-auto overflow-hidden">
      {/* Top Telemetry Ribbon */}
      <div className="flex items-center justify-between mb-6 font-mono text-[11px] text-zinc-500 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-semibold tracking-wider">{PORTFOLIO_DATA.identity.statusBadge}</span>
          <span className="text-zinc-600">•</span>
          <span>WHATSAPP: {PORTFOLIO_DATA.identity.phone}</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>CLEAN ARCHITECTURE</span>
          <span>•</span>
          <span className="text-cyber-cyan">FULL SOURCE CODE</span>
        </div>
      </div>

      {/* Grid: Left Typography, Right 3D Object */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Direct, Anti-AI Slop Typography */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-cyber-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Source Code for Sale</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              {PORTFOLIO_DATA.identity.fullName}
            </h1>

            <p className="text-lg sm:text-xl font-medium text-zinc-300 tracking-tight">
              Source Code Aplikasi Android & Website Siap Pakai
            </p>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-xl">
            Koleksi aplikasi Android native (Kotlin &amp; Jetpack Compose) dan web modern dengan kode yang rapi, modular, dan langsung siap di-build atau di-deploy.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <a
              href="#catalog"
              onClick={() => playClickSound()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-md active:scale-95"
            >
              <span>Lihat Katalog Produk</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href={PORTFOLIO_DATA.identity.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/25 transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Hubungi WhatsApp</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Full Source Code</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Siap Build APK/Web</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Fast Response WA</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Canvas */}
        <div className="lg:col-span-5">
          <HeroCanvas3D />
        </div>
      </div>
    </section>
  );
}
