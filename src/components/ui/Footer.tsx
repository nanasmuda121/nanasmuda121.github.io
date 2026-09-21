"use client";

import React from "react";
import { ArrowUp, Terminal, Shield } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

export default function Footer() {
  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#06070b] py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-500">
        {/* Left identity */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2 text-zinc-300 font-semibold">
            <span>{PORTFOLIO_DATA.identity.fullName}</span>
            <span>•</span>
            <span className="text-[11px] text-cyber-cyan font-normal">Spatial Web Architect</span>
          </div>
          <p className="text-[11px] text-zinc-600">
            Engineered with Next.js 14, Three.js & Tailwind CSS. Anti-AI Slop Design Principles.
          </p>
        </div>

        {/* Center telemetry */}
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>JAKARTA, ID</span>
          </span>
          <span>•</span>
          <span>UTC+7</span>
          <span>•</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        {/* Right back to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span>Top</span>
          <ArrowUp className="w-3.5 h-3.5 text-cyber-cyan" />
        </button>
      </div>
    </footer>
  );
}
