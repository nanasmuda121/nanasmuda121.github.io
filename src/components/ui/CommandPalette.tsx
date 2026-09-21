"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight, ExternalLink, Mail, Volume2, VolumeX, FileText, Code2, Sparkles, X } from "lucide-react";
import { playClickSound, toggleSound, isSoundEnabled, playSuccessSound } from "@/utils/audio";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import confetti from "canvas-confetti";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
}

export default function CommandPalette({ isOpen, onClose, onSelectProject }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [soundActive, setSoundActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSoundActive(isSoundEnabled());
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.identity.email);
    playSuccessSound();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  const actions = [
    {
      id: "action-email",
      label: "Copy Developer Email",
      sublabel: PORTFOLIO_DATA.identity.email,
      icon: <Mail className="w-4 h-4 text-cyber-cyan" />,
      run: copyEmail,
    },
    {
      id: "action-sound",
      label: soundActive ? "Disable Procedural Sound FX" : "Enable Procedural Sound FX",
      sublabel: "Web Audio Synthesizer toggle",
      icon: soundActive ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />,
      run: () => {
        const next = toggleSound();
        setSoundActive(next);
      },
    },
    {
      id: "action-github",
      label: "Open GitHub Profile",
      sublabel: "github.com/adnanferdiansyah",
      icon: <Code2 className="w-4 h-4 text-zinc-300" />,
      run: () => {
        window.open(PORTFOLIO_DATA.identity.github, "_blank");
        onClose();
      },
    },
    {
      id: "action-twitter",
      label: "Open X / Twitter Channel",
      sublabel: "@adnan_ferdi",
      icon: <ExternalLink className="w-4 h-4 text-zinc-300" />,
      run: () => {
        window.open(PORTFOLIO_DATA.identity.twitter, "_blank");
        onClose();
      },
    },
  ];

  const projectItems = PORTFOLIO_DATA.projects.map((p) => ({
    id: `project-${p.id}`,
    label: p.title,
    sublabel: `${p.category} • ${p.highlightStat}`,
    icon: <Sparkles className="w-4 h-4 text-cyber-cyan" />,
    run: () => {
      onSelectProject?.(p.id);
      onClose();
    },
  }));

  const filteredActions = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.sublabel.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = projectItems.filter(
    (p) =>
      p.label.toLowerCase().includes(query.toLowerCase()) ||
      p.sublabel.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#090a12] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-[#0e101b]">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, project name, or action..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4 font-mono">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-500 uppercase px-3 py-1 font-semibold tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      playClickSound();
                      action.run();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-white/5 border border-white/5 text-zinc-400 group-hover:text-white">
                        {action.icon}
                      </div>
                      <div>
                        <div className="text-xs text-zinc-200 font-medium group-hover:text-white">
                          {action.label}
                        </div>
                        <div className="text-[10px] text-zinc-500">{action.sublabel}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyber-cyan transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] text-zinc-500 uppercase px-3 py-1 font-semibold tracking-wider">
                Production Systems & Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      playClickSound();
                      p.run();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-white/5 border border-white/5 text-zinc-400 group-hover:text-cyber-cyan">
                        {p.icon}
                      </div>
                      <div>
                        <div className="text-xs text-zinc-200 font-medium group-hover:text-white">
                          {p.label}
                        </div>
                        <div className="text-[10px] text-zinc-500">{p.sublabel}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-cyber-cyan bg-cyber-cyan/10 px-2 py-0.5 rounded border border-cyber-cyan/30">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredActions.length === 0 && filteredProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#0b0c14] text-[10px] font-mono text-zinc-500 select-none">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-zinc-300">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-zinc-300">↓</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-zinc-300">↵</kbd>
          </div>
          <div>Esc to close</div>
        </div>
      </div>
    </div>
  );
}
