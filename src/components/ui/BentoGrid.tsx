"use client";

import React, { useState } from "react";
import Card3D from "@/components/3d/Card3D";
import AudioVisualizer3D from "@/components/3d/AudioVisualizer3D";
import InteractiveTerminal from "@/components/ui/InteractiveTerminal";
import { PORTFOLIO_DATA, Project } from "@/data/portfolioData";
import { ArrowUpRight, Sparkles, Layers, Cpu, Radio, ShieldCheck, Box } from "lucide-react";
import { playClickSound } from "@/utils/audio";

interface BentoGridProps {
  onSelectProject: (project: Project) => void;
}

export default function BentoGrid({ onSelectProject }: BentoGridProps) {
  const [filter, setFilter] = useState<string>("all");

  const projects = PORTFOLIO_DATA.projects;
  const auraProject = projects.find((p) => p.id === "aura-webdsp")!;
  const kinetixProject = projects.find((p) => p.id === "kinetix-3d")!;
  const nanzflowProject = projects.find((p) => p.id === "nanzflow-telemetry")!;
  const chronosProject = projects.find((p) => p.id === "chronos-terminal")!;

  return (
    <section id="projects" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyber-cyan mb-2">
            <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full" />
            <span>01 // FEATURED ARCHITECTURE & 3D SYSTEMS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Production Engineering & Spatial R&D
          </h2>
        </div>
        <p className="font-mono text-xs text-zinc-400 max-w-sm">
          Interactive 3D bento cards with hardware perspective matrix math. Tilt your cursor to explore spatial depth layers.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento Cell 1: Aura WebDSP (Col span 7) */}
        <div className="md:col-span-7">
          <Card3D
            maxRotation={12}
            onClick={() => {
              playClickSound();
              onSelectProject(auraProject);
            }}
            className="cursor-pointer group p-6 sm:p-8 flex flex-col justify-between min-h-[380px] bg-gradient-to-br from-[#0c0e1a] to-[#07080f]"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-cyber-cyan">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="uppercase">{auraProject.category}</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                <span>{auraProject.period}</span>
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyber-cyan group-hover:text-black transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Middle Content */}
            <div className="space-y-3 my-auto">
              <span className="inline-block font-mono text-xs text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2.5 py-0.5 rounded-full">
                {auraProject.highlightStat}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight group-hover:text-cyber-cyan transition-colors">
                {auraProject.title}
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
                {auraProject.description}
              </p>
            </div>

            {/* Bottom Tech Pills */}
            <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5 mt-4">
              {auraProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card3D>
        </div>

        {/* Bento Cell 2: Kinetix 3D Spatial UI (Col span 5) */}
        <div className="md:col-span-5">
          <Card3D
            maxRotation={14}
            onClick={() => {
              playClickSound();
              onSelectProject(kinetixProject);
            }}
            className="cursor-pointer group p-6 sm:p-8 flex flex-col justify-between min-h-[380px] bg-[#0b0c15]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-violet-400">
                <Box className="w-3.5 h-3.5" />
                <span className="uppercase">{kinetixProject.category}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-400 group-hover:text-black transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3 my-auto">
              <span className="inline-block font-mono text-xs text-violet-300 bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 rounded-full">
                {kinetixProject.highlightStat}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors">
                {kinetixProject.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {kinetixProject.tagline}
              </p>
            </div>

            {/* Mini 3D Box Simulation Visual */}
            <div className="my-3 py-4 flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-violet-400/40 rounded-lg transform rotate-12 -skew-x-6 flex items-center justify-center bg-violet-950/20 group-hover:rotate-45 transition-transform duration-700">
                <span className="font-mono text-[10px] text-violet-300">3D Z-AXIS</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
              {kinetixProject.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card3D>
        </div>

        {/* Bento Cell 3: Interactive 3D Audio Visualizer Widget (Col span 6) */}
        <div id="lab" className="md:col-span-6">
          <AudioVisualizer3D />
        </div>

        {/* Bento Cell 4: Interactive Developer Terminal (Col span 6) */}
        <div className="md:col-span-6">
          <InteractiveTerminal />
        </div>

        {/* Bento Cell 5: NanzFlow Telemetry (Col span 6) */}
        <div className="md:col-span-6">
          <Card3D
            maxRotation={12}
            onClick={() => {
              playClickSound();
              onSelectProject(nanzflowProject);
            }}
            className="cursor-pointer group p-6 sm:p-8 flex flex-col justify-between min-h-[320px] bg-[#0a0c16]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-emerald-400">
                <Cpu className="w-3.5 h-3.5" />
                <span className="uppercase">{nanzflowProject.category}</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-black transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2 my-auto">
              <span className="inline-block font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {nanzflowProject.highlightStat}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {nanzflowProject.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {nanzflowProject.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              {nanzflowProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] text-zinc-400 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Card3D>
        </div>

        {/* Bento Cell 6: Engineering Manifesto & Anti-AI Slop Box (Col span 6) */}
        <div className="md:col-span-6">
          <div className="h-full p-6 sm:p-8 bg-[#090a12] border border-white/10 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>ANTI-AI SLOP CORE PRINCIPLES</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">PHILOSOPHY</span>
            </div>

            <div className="space-y-3 my-auto">
              {PORTFOLIO_DATA.manifesto.map((item, idx) => (
                <div key={idx} className="border-l border-white/15 pl-3 space-y-0.5">
                  <div className="font-mono text-xs font-bold text-white tracking-wider">
                    {item.label}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/5 font-mono text-[11px] text-zinc-500 flex items-center justify-between">
              <span>CRAFTED BY ADNAN FERDIANSYAH</span>
              <span className="text-cyber-cyan">ZERO BOILERPLATE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
