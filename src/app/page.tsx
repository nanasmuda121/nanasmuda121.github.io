"use client";

import React from "react";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import ProductCatalog from "@/components/ui/ProductCatalog";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-dark-950 text-[var(--text-primary)] overflow-x-hidden selection:bg-cyber-cyan selection:text-black">
      {/* Deep Space Cosmic Atmosphere & Starlight Backdrop */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,35,70,0.3),rgba(3,4,8,0))] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-stars-pattern opacity-30 pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-grid-space opacity-25 pointer-events-none -z-30" />

      {/* Floating Modern Header */}
      <Navbar />

      {/* Main Page Flow */}
      <main className="relative z-10 space-y-4">
        <HeroSection />
        <ProductCatalog />
        <ContactSection />
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
