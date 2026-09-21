"use client";

import React from "react";
import { ArrowUp } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

export default function Footer() {
  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/10 bg-[#06070a] py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
          <span className="text-zinc-300 font-semibold">{PORTFOLIO_DATA.identity.fullName}</span>
          <span className="hidden sm:inline">•</span>
          <span>Source Code Aplikasi &amp; Website</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={PORTFOLIO_DATA.identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            WA: {PORTFOLIO_DATA.identity.phone}
          </a>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:text-white transition-colors"
          >
            <span>Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
