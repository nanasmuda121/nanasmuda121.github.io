"use client";

import React from "react";
import Card3D from "@/components/3d/Card3D";
import { ProductItem } from "@/data/portfolioData";
import { ExternalLink, Download, MessageCircle, Check, Smartphone, Globe } from "lucide-react";
import { playClickSound } from "@/utils/audio";

interface ProductCard3DProps {
  product: ProductItem;
}

export default function ProductCard3D({ product }: ProductCard3DProps) {
  const waBuyLink = `https://wa.me/6283186561414?text=${encodeURIComponent(
    `Halo Adnan, saya mau beli Full Source Code untuk ${product.title} (${product.formattedPrice}). Bagaimana proses pembayarannya?`
  )}`;

  return (
    <Card3D
      maxRotation={8}
      className="p-6 sm:p-7 md:p-8 flex flex-col justify-between h-full bg-dark-900/90 backdrop-blur-xl border border-white/10 hover:border-cyber-cyan/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.12)] transition-all rounded"
    >
      {/* Top Header: Logo + Title + Category */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* Real App Logo */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded overflow-hidden bg-black/60 border border-white/15 flex-shrink-0 flex items-center justify-center p-1.5 shadow-md">
              <img
                src={product.logo}
                alt={`${product.title} Logo`}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {product.title}
                </h3>
                {product.badge && (
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-mono text-zinc-400 mt-0.5">{product.subtitle}</p>
            </div>
          </div>

          {/* Category Icon */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 flex-shrink-0">
            {product.category === "Android Application" ? (
              <Smartphone className="w-5 h-5 text-emerald-400" />
            ) : (
              <Globe className="w-5 h-5 text-cyber-cyan" />
            )}
          </div>
        </div>

        {/* Price Box */}
        <div className="p-3.5 sm:p-4 rounded bg-white/[0.03] border border-white/5 flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {product.formattedPrice}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ source code</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            SIAP BUILD
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed mb-4 sm:mb-5">
          {product.description}
        </p>

        {/* Feature List */}
        <div className="space-y-2 mb-6">
          {product.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
              <Check className="w-4 h-4 text-cyber-cyan flex-shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Tech Stack + Action Buttons */}
      <div className="space-y-4 pt-5 border-t border-white/10">
        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2">
          {product.techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono text-xs sm:text-sm">
          {/* Demo or APK download link */}
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 font-bold transition-all"
            >
              <span>Live Web</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {product.apkUrl && (
            <a
              href={product.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 font-bold transition-all"
            >
              <span>{product.apkUrl.includes("apkpure.com") ? "APKPure APK" : "Download APK"}</span>
              <Download className="w-4 h-4 text-emerald-400" />
            </a>
          )}

          {/* Buy Source Code on WhatsApp */}
          <a
            href={waBuyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyber-cyan text-black font-bold hover:bg-cyber-cyan/90 transition-all shadow-md active:scale-95 col-span-1"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Beli Source</span>
          </a>
        </div>
      </div>
    </Card3D>
  );
}
