"use client";

import React, { useState } from "react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { Briefcase, Terminal, Layers, Cpu, ChevronRight, Check } from "lucide-react";
import { playClickSound } from "@/utils/audio";

export default function SkillsAndExperience() {
  const [activeCategory, setActiveCategory] = useState<number>(0);

  return (
    <section id="experience" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-cyber-cyan mb-2">
            <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full" />
            <span>02 // CAPABILITIES & TRACK RECORD</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Stack & Engineering Journey
          </h2>
        </div>
        <p className="font-mono text-xs text-zinc-400 max-w-sm">
          A track record of engineering low-latency spatial experiences and resilient frontend architectures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Skills Audit (Col span 5) */}
        <div id="stack" className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-400">
            <Cpu className="w-4 h-4 text-cyber-cyan" />
            <span className="uppercase font-semibold tracking-wider">Proficiency Matrix</span>
          </div>

          {/* Category Tabs */}
          <div className="flex p-1 bg-[#090a12] border border-white/10 rounded-xl gap-1">
            {PORTFOLIO_DATA.skills.map((cat, idx) => (
              <button
                key={cat.title}
                onClick={() => {
                  setActiveCategory(idx);
                  playClickSound();
                }}
                className={`flex-1 py-2 px-2 text-center font-mono text-[11px] rounded-lg transition-colors ${
                  activeCategory === idx
                    ? "bg-white/10 text-white font-bold border border-white/10"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {cat.title.split(" ")[0]}
              </button>
            ))}
          </div>

          {/* Active Skills List */}
          <div className="p-5 bg-[#090a14] border border-white/10 rounded-xl space-y-4">
            <div className="text-xs font-mono text-cyber-cyan font-semibold">
              {PORTFOLIO_DATA.skills[activeCategory].title}
            </div>

            <div className="space-y-3.5">
              {PORTFOLIO_DATA.skills[activeCategory].skills.map((skill) => (
                <div key={skill.name} className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-zinc-200 font-medium">{skill.name}</span>
                    <span className="text-cyber-cyan text-[11px] font-bold">{skill.level}%</span>
                  </div>

                  {/* Progress bar with glowing tip */}
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyber-cyan rounded-full transition-all duration-700"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>

                  <p className="text-[10px] font-mono text-zinc-500">{skill.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Career Timeline (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-zinc-400">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span className="uppercase font-semibold tracking-wider">Professional Timeline</span>
          </div>

          <div className="space-y-4">
            {PORTFOLIO_DATA.experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#090a12] border border-white/10 rounded-xl space-y-3 transition-colors hover:border-white/20"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{exp.role}</h3>
                    <div className="text-xs font-mono text-cyber-cyan font-medium">
                      {exp.company} • <span className="text-zinc-400">{exp.location}</span>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto font-mono text-xs text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                    {exp.period}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {exp.summary}
                </p>

                {/* Deliverables */}
                <div className="space-y-1.5 pt-1">
                  {exp.deliverables.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex items-start gap-2 text-xs text-zinc-400">
                      <ChevronRight className="w-3.5 h-3.5 text-cyber-cyan flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                  {exp.technologies.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
