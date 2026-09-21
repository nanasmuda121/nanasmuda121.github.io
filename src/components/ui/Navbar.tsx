"use client";

import React, { useState, useEffect } from "react";
import { Command, Volume2, VolumeX, Menu, X, ArrowUpRight, Radio } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound, toggleSound, isSoundEnabled } from "@/utils/audio";

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export default function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const [timeStr, setTimeStr] = useState("");
  const [soundActive, setSoundActive] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSoundActive(isSoundEnabled());

    const updateClock = () => {
      const now = new Date();
      // Format time in Asia/Jakarta timezone
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTimeStr(formatted);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSoundToggle = () => {
    const nextState = toggleSound();
    setSoundActive(nextState);
  };

  const navLinks = [
    { name: "Projects", href: "#projects" },
    { name: "3D Lab", href: "#lab" },
    { name: "Stack", href: "#stack" },
    { name: "Experience", href: "#experience" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-5xl bg-[#090a12]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center justify-between transition-all duration-300 hover:border-white/20">
        {/* Left: Brand Identity */}
        <a
          href="#"
          onClick={() => playClickSound()}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/40 flex items-center justify-center font-mono font-bold text-xs text-cyber-cyan group-hover:scale-105 group-hover:bg-cyber-cyan/20 transition-all">
            {PORTFOLIO_DATA.identity.initials}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-tight text-white group-hover:text-cyber-cyan transition-colors">
              {PORTFOLIO_DATA.identity.fullName}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Senior 3D / Creative Dev
            </span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 font-mono text-xs text-zinc-400">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => playClickSound()}
              className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-2">
          {/* Live Jakarta Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>JKT: {timeStr || "--:--:--"}</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-lg border transition-colors ${
              soundActive
                ? "text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30 hover:bg-cyber-cyan/20"
                : "text-zinc-500 bg-white/5 border-white/5 hover:text-zinc-300"
            }`}
            title={soundActive ? "Mute audio synthesizer" : "Unmute audio synthesizer"}
          >
            {soundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Command Palette Trigger */}
          <button
            onClick={() => {
              playClickSound();
              onOpenCommandPalette();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="hidden lg:inline text-[11px]">⌘K</span>
          </button>

          {/* Mobile Hamburger Toggle */}
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden fixed top-20 left-4 right-4 bg-[#090a12]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl space-y-2 z-50 animate-fadeIn">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                playClickSound();
                setMobileMenuOpen(false);
              }}
              className="block px-4 py-2.5 rounded-xl font-mono text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono text-xs text-zinc-400">
            <span>LOCATION: JAKARTA (UTC+7)</span>
            <span className="text-emerald-400">{timeStr}</span>
          </div>
        </div>
      )}
    </header>
  );
}
