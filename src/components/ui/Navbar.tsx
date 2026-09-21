"use client";

import React, { useState } from "react";
import { MessageCircle, ExternalLink, Menu, X, ShieldCheck } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-5xl bg-[#090b12]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex items-center justify-between transition-all duration-300 hover:border-white/20">
        {/* Brand Logo & Name */}
        <a
          href="#"
          onClick={() => playClickSound()}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white group-hover:border-cyber-cyan transition-colors">
            {PORTFOLIO_DATA.identity.initials}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white group-hover:text-cyber-cyan transition-colors">
              {PORTFOLIO_DATA.identity.fullName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Source Code & Digital Products
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs text-zinc-400">
          <a
            href="#catalog"
            onClick={() => playClickSound()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            Katalog Produk
          </a>
          <a
            href="#faq"
            onClick={() => playClickSound()}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
          >
            Cara Beli & FAQ
          </a>
        </div>

        {/* Direct WhatsApp CTA Button */}
        <div className="flex items-center gap-2">
          <a
            href={PORTFOLIO_DATA.identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold hover:bg-emerald-500/20 transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Mobile menu trigger */}
          <button
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed top-20 left-4 right-4 bg-[#090b14]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl space-y-2 z-50 animate-fadeIn font-mono text-xs">
          <a
            href="#catalog"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(false);
            }}
            className="block px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Katalog Source Code
          </a>
          <a
            href="#faq"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(false);
            }}
            className="block px-3 py-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg"
          >
            Cara Beli & FAQ
          </a>
        </div>
      )}
    </header>
  );
}
