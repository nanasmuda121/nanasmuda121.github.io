"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Layers, Cpu, CheckCircle2 } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Project } from "@/data/portfolioData";
import { playClickSound } from "@/utils/audio";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (project) {
      window.addEventListener("keydown", onKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-2xl bg-[#090b13] border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0e111a]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse" />
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{project.category}</span>
              <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tagline & Stat */}
          <div className="p-4 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-zinc-200 font-medium leading-relaxed">{project.tagline}</p>
            <span className="self-start sm:self-auto font-mono text-xs text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2.5 py-1 rounded-full whitespace-nowrap">
              {project.highlightStat}
            </span>
          </div>

          {/* Core Description */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>SYSTEM ARCHITECTURE & OVERVIEW</span>
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>
          </div>

          {/* Architecture Details */}
          <div className="p-4 rounded-xl bg-[#0e101a] border border-white/10 space-y-2">
            <h5 className="text-xs font-mono text-white font-semibold flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Low-Level Implementation Insight</span>
            </h5>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">{project.architectureDetails}</p>
          </div>

          {/* Key Engineering Deliverables */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
              BENCHMARKS & METRICS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{metric}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              TECHNOLOGIES
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0c0e17]">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClickSound}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium text-zinc-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClickSound}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium text-black bg-cyber-cyan hover:bg-cyber-cyan/90 transition-colors font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch Live Architecture</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
