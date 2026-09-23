"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroCanvas3D from "@/components/3d/HeroCanvas3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { ArrowDown, MessageCircle } from "lucide-react";
import { playClickSound } from "@/utils/audio";

const ease = [0.4, 0, 0.2, 1] as const;

export default function HeroSection() {
  const identity = PORTFOLIO_DATA.identity;

  return (
    <section className="relative pt-24 pb-12 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden space-y-7 sm:space-y-9">
      {/* Main Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.05 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyber-cyan/30 font-mono text-xs sm:text-sm md:text-base text-cyber-cyan">
              <span className="font-semibold tracking-wide">ORBITAL SOURCE CODE &amp; DIGITAL PRODUCTS</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.12 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]"
          >
            {identity.fullName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.2 }}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight"
          >
            {identity.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease, delay: 0.28 }}
            className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed font-normal pt-1 max-w-3xl"
          >
            {identity.description}
          </motion.p>
        </div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease, delay: 0.36 }}
          className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 flex-shrink-0 font-mono text-xs sm:text-sm md:text-base"
        >
          <a
            href="#catalog"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            <span>Lihat Katalog Produk</span>
            <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          <a
            href={identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2.5 px-7 py-4 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/25 transition-all shadow-xl active:scale-95 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Hubungi WhatsApp</span>
          </a>
        </motion.div>
      </div>

      {/* Centerpiece: Full-Width 3D Solar System Experience */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease, delay: 0.35 }}
        className="w-full pt-1"
      >
        <HeroCanvas3D />
      </motion.div>
    </section>
  );
}