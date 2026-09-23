"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

export default function Footer() {
  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="border-t border-white/10 bg-dark-950 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 font-mono text-xs sm:text-sm md:text-base text-zinc-400">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-center sm:text-left">
          <span className="text-white font-bold">{PORTFOLIO_DATA.identity.fullName}</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span>Source Code Aplikasi &amp; Website</span>
        </div>

        <div className="flex items-center gap-5">
          <a
            href={PORTFOLIO_DATA.identity.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors font-semibold"
          >
            WA: {PORTFOLIO_DATA.identity.phone}
          </a>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 rounded bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors font-medium active:scale-95"
          >
            <span>Top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.footer>
  );
}