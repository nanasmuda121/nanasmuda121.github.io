"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard3D from "@/components/ui/ProductCard3D";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

const ease = [0.4, 0, 0.2, 1] as const;

export default function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const categories = PORTFOLIO_DATA.categories;
  const products = PORTFOLIO_DATA.products;

  const filters = categories.map((cat) => ({
    id: cat.id,
    label: cat.name,
    count:
      cat.id === "ALL"
        ? products.length
        : products.filter((p) => p.category === cat.id).length,
  }));

  const filteredProducts = products.filter((p) => {
    if (activeFilter === "ALL") return true;
    return p.category === activeFilter;
  });

  return (
    <section id="catalog" className="py-14 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Title & Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-white/10 gap-6"
      >
        <div>
          <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm md:text-base text-cyber-cyan mb-2">
            <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-pulse" />
            <span className="font-semibold tracking-wider">STASIUN SOURCE CODE &amp; ARTEFAK DIGITAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Aplikasi Android &amp; Web Eksplorasi
          </h2>
          <p className="font-mono text-xs sm:text-sm md:text-base text-zinc-400 mt-2">
            Harga tertera adalah untuk Full Source Code (clean architecture, modular &amp; siap build/deploy).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-dark-900/95 p-1.5 rounded border border-white/10 font-mono text-xs sm:text-sm md:text-base overflow-x-auto scrollbar-none shadow-xl">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFilter(f.id);
                playClickSound();
              }}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded transition-all whitespace-nowrap flex items-center gap-2 ${
                activeFilter === f.id
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-xs ${activeFilter === f.id ? "text-zinc-700" : "text-zinc-500"}`}>
                ({f.count})
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <ProductCard3D product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}