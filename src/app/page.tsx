"use client";

import React, { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import HeroSection from "@/components/ui/HeroSection";
import BentoGrid from "@/components/ui/BentoGrid";
import SkillsAndExperience from "@/components/ui/SkillsAndExperience";
import ContactSection from "@/components/ui/ContactSection";
import Footer from "@/components/ui/Footer";
import ProjectModal from "@/components/ui/ProjectModal";
import CommandPalette from "@/components/ui/CommandPalette";
import { Project, PORTFOLIO_DATA } from "@/data/portfolioData";

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleSelectProjectById = (projectId: string) => {
    const found = PORTFOLIO_DATA.projects.find((p) => p.id === projectId);
    if (found) {
      setSelectedProject(found);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-[#ededed] overflow-x-hidden selection:bg-cyber-cyan selection:text-black">
      {/* Engineered Subtle Background Grid & Dot Matrix */}
      <div className="fixed inset-0 bg-grid-cyber opacity-40 pointer-events-none -z-20" />
      <div className="fixed inset-0 bg-dot-matrix opacity-20 pointer-events-none -z-20 radial-fade-mask" />

      {/* Floating Modern Navbar */}
      <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Main Page Flow */}
      <main className="relative z-10 space-y-4">
        <HeroSection />
        <BentoGrid onSelectProject={(project) => setSelectedProject(project)} />
        <SkillsAndExperience />
        <ContactSection />
      </main>

      {/* Anti-AI Slop Footer */}
      <Footer />

      {/* Interactive Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectProject={handleSelectProjectById}
      />
    </div>
  );
}
