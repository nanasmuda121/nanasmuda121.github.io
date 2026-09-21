"use client";

import React, { useState } from "react";
import ProductCard3D from "@/components/ui/ProductCard3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";
import { Code, Smartphone, Globe, Layers } from "lucide-react";

export default function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const products = PORTFOLIO_DATA.products;

  const filters = [
    { id: "ALL", label: "Semua Produk", count: products.length },
    {
      id: "ANDROID",
      label: "Android Apps",
      count: products.filter((p) => p.category === "Android Application").length,
    },
    {
      id: "WEB",
      label: "Web Apps & Tools",
      count: products.filter((p) => p.category !== "Android Application").length,
    },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeFilter === "ANDROID") return p.category === "Android Application";
    if (activeFilter === "WEB") return p.category !== "Android Application";
    return true;
  });

  return (
    <section id="catalog" className="py-12 md:py-20 px-4 max-w-6xl mx-auto">
      {/* Section Title & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyber-cyan mb-2">
            <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full" />
            <span>KATALOG SOURCE CODE SIAP PAKAI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aplikasi Android & Website
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Harga tertera adalah untuk Full Source Code (clean, modular & siap build/deploy).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#0a0b12] p-1 rounded-xl border border-white/10 font-mono text-xs">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                playClickSound();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeFilter === f.id
                  ? "bg-white/10 text-white font-bold border border-white/15"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{f.label}</span>
              <span className="text-[10px] text-zinc-500">({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard3D key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
