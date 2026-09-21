"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import ProductCatalog from "@/components/ui/ProductCatalog";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#050507] text-[#ededed] overflow-x-hidden selection:bg-cyber-cyan selection:text-black">
      {/* Subtle Engineered Minimalist Grid (No tacky AI gradient) */}
      <div className="fixed inset-0 bg-grid-cyber opacity-30 pointer-events-none -z-20" />

      {/* Floating Modern Header */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="relative z-10 space-y-2">
        <HeroSection />
        <ProductCatalog />
        <ContactSection />
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
