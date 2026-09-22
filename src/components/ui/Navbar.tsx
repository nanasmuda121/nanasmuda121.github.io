"use client";

import React, { useState } from "react";
import { MessageCircle, Menu, X } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-6xl xl:max-w-7xl bg-[#090b12]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 sm:py-3.5 shadow-2xl flex items-center justify-between transition-all duration-300 hover:border-white/20">
        {/* Brand Logo & Name */}
        <a
          href="#"
          onClick={() => playClickSound()}
          className="flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center font-mono font-bold text-sm text-white group-hover:border-cyber-cyan group-hover:text-cyber-cyan transition-all shadow">
            {PORTFOLIO_DATA.identity.initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-cyber-cyan transition-colors">
              {PORTFOLIO_DATA.identity.fullName}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Source Code &amp; Digital Products
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2 font-mono text-sm text-zinc-300">
          <a
            href="#catalog"
            onClick={() => playClickSound()}
            className="px-4 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors font-medium"
          >
            Katalog Produk
          </a>
          <a
            href="#faq"
            onClick={() => playClickSound()}
            className="px-4 py-2 rounded-xl hover:text-white hover:bg-white/10 transition-colors font-medium"
          >
            Cara Beli &amp; FAQ
          </a>
        </div>

        {/* Direct WhatsApp CTA Button */}
        <div className="flex items-center gap-3">
          <a
            href={PORTFOLIO_DATA.identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-mono font-bold hover:bg-emerald-500/25 transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Mobile menu trigger */}
          <button
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed top-20 left-4 right-4 bg-[#090b14]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl space-y-2 z-50 animate-fadeIn font-mono text-sm">
          <a
            href="#catalog"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(false);
            }}
            className="block px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            Katalog Source Code
          </a>
          <a
            href="#faq"
            onClick={() => {
              playClickSound();
              setMobileMenuOpen(false);
            }}
            className="block px-4 py-2.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            Cara Beli &amp; FAQ
          </a>
        </div>
      )}
    </header>
  );
}
