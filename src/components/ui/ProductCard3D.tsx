"use client";

import React from "react";
import Image from "next/image";
import Card3D from "@/components/3d/Card3D";
import { ProductItem } from "@/data/portfolioData";
import { ExternalLink, Download, MessageCircle, Check, Smartphone, Globe, Code } from "lucide-react";
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
      maxRotation={10}
      className="p-6 sm:p-7 flex flex-col justify-between h-full bg-[#0a0b12] border border-white/10 hover:border-white/25 transition-all"
    >
      {/* Top Header: Logo + Title + Category */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            {/* Real App Logo */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/15 flex-shrink-0 flex items-center justify-center p-1">
              <img
                src={product.logo}
                alt={`${product.title} Logo`}
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">{product.title}</h3>
                {product.badge && (
                  <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-400">{product.subtitle}</p>
            </div>
          </div>

          {/* Category Icon */}
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 flex-shrink-0">
            {product.category === "Android Application" ? (
              <Smartphone className="w-4 h-4 text-emerald-400" />
            ) : (
              <Globe className="w-4 h-4 text-cyber-cyan" />
            )}
          </div>
        </div>

        {/* Price Box */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {product.formattedPrice}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">/ source code</span>
          </div>
          <span className="font-mono text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            SIAP BUILD
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Feature List */}
        <div className="space-y-1.5 mb-5">
          {product.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
              <Check className="w-3.5 h-3.5 text-cyber-cyan flex-shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Tech Stack + Action Buttons */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5">
          {product.techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] text-zinc-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          {/* Demo or APK download link */}
          {product.demoUrl && (
            <a
              href={product.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>Live Web</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {product.apkUrl && (
            <a
              href={product.apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playClickSound()}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span>Download APK</span>
              <Download className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          )}

          {/* Buy Source Code on WhatsApp */}
          <a
            href={waBuyLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyber-cyan text-black font-semibold hover:bg-cyber-cyan/90 transition-all shadow active:scale-95 col-span-1"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Beli Source</span>
          </a>
        </div>
      </div>
    </Card3D>
  );
}
