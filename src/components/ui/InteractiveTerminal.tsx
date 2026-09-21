"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, CornerDownLeft, Sparkles, Copy, Check } from "lucide-react";
import { playClickSound, playBlipSound } from "@/utils/audio";
import { PORTFOLIO_DATA } from "@/data/portfolioData";

interface CommandLog {
  id: string;
  type: "input" | "output" | "error" | "system";
  content: React.ReactNode;
}

export default function InteractiveTerminal() {
  const [inputVal, setInputVal] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<CommandLog[]>([
    {
      id: "init-1",
      type: "system",
      content: (
        <span className="text-zinc-500 font-mono text-[11px]">
          Chronos Kernel v4.19-spatial • Logged in as <span className="text-cyber-cyan">guest@adnan-workstation</span>
        </span>
      ),
    },
    {
      id: "init-2",
      type: "output",
      content: (
        <div className="font-mono text-xs text-zinc-300">
          Type <span className="text-cyber-cyan font-bold">&apos;help&apos;</span> to discover available commands, or <span className="text-amber-400 font-bold">&apos;skills&apos;</span> to audit stack.
        </div>
      ),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    playClickSound();

    const newLogs: CommandLog[] = [
      ...history,
      {
        id: Math.random().toString(),
        type: "input",
        content: (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-400">adnan@dev:~$</span>
            <span className="text-white font-medium">{inputVal}</span>
          </div>
        ),
      },
    ];

    switch (cmd) {
      case "help":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs space-y-1 text-zinc-300 py-1">
              <div className="text-cyber-cyan font-semibold">Available Commands:</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-400 pl-2">
                <div><span className="text-white font-bold">whoami</span> - Identity & philosophy</div>
                <div><span className="text-white font-bold">skills</span> - Engineering stack & levels</div>
                <div><span className="text-white font-bold">projects</span> - Production portfolio list</div>
                <div><span className="text-white font-bold">status</span> - Contract & location state</div>
                <div><span className="text-white font-bold">contact</span> - Direct channels & links</div>
                <div><span className="text-white font-bold">clear</span> - Flush terminal buffer</div>
              </div>
            </div>
          ),
        });
        break;

      case "whoami":
      case "bio":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs text-zinc-300 space-y-1 py-1">
              <p className="text-white font-semibold">{PORTFOLIO_DATA.identity.fullName} — {PORTFOLIO_DATA.identity.role}</p>
              <p className="text-zinc-400">{PORTFOLIO_DATA.identity.specialty}</p>
              <p className="text-[11px] text-zinc-500 italic mt-1">&quot;Depth over flatness. 60FPS non-negotiable. Zero AI slop.&quot;</p>
            </div>
          ),
        });
        break;

      case "skills":
      case "stack":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs text-zinc-300 space-y-1.5 py-1">
              <div className="text-cyber-cyan font-semibold text-[11px]">CORE PROFICIENCIES:</div>
              {PORTFOLIO_DATA.skills.map((cat, i) => (
                <div key={i} className="text-[11px]">
                  <span className="text-zinc-400 font-bold">{cat.title}:</span>{" "}
                  <span className="text-zinc-300">{cat.skills.map((s) => s.name).join(" • ")}</span>
                </div>
              ))}
            </div>
          ),
        });
        break;

      case "projects":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs text-zinc-300 space-y-1.5 py-1">
              <div className="text-cyber-cyan font-semibold text-[11px]">FEATURED ENGINEERING SYSTEMS:</div>
              {PORTFOLIO_DATA.projects.map((p, idx) => (
                <div key={idx} className="text-[11px] border-l-2 border-cyber-cyan/40 pl-2">
                  <span className="text-white font-bold">{p.title}</span> ({p.period}) - <span className="text-zinc-400">{p.tagline}</span>
                </div>
              ))}
            </div>
          ),
        });
        break;

      case "status":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs text-zinc-300 space-y-1 py-1">
              <div>STATUS: <span className="text-emerald-400 font-bold">{PORTFOLIO_DATA.identity.statusBadge}</span></div>
              <div>GEO: <span className="text-zinc-400">{PORTFOLIO_DATA.identity.location} ({PORTFOLIO_DATA.identity.coordinates})</span></div>
              <div>TIMEZONE: <span className="text-zinc-400">{PORTFOLIO_DATA.identity.timezone} ({PORTFOLIO_DATA.identity.utcOffset})</span></div>
            </div>
          ),
        });
        break;

      case "contact":
      case "email":
        newLogs.push({
          id: Math.random().toString(),
          type: "output",
          content: (
            <div className="font-mono text-xs text-zinc-300 space-y-1 py-1">
              <div>EMAIL: <span className="text-cyber-cyan select-all">{PORTFOLIO_DATA.identity.email}</span></div>
              <div>GITHUB: <span className="text-zinc-400">{PORTFOLIO_DATA.identity.github}</span></div>
              <div>X / TWITTER: <span className="text-zinc-400">{PORTFOLIO_DATA.identity.twitter}</span></div>
            </div>
          ),
        });
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      default:
        newLogs.push({
          id: Math.random().toString(),
          type: "error",
          content: (
            <span className="font-mono text-xs text-rose-400">
              command not found: &apos;{cmd}&apos;. Type &apos;help&apos; for list.
            </span>
          ),
        });
        break;
    }

    setHistory(newLogs);
    setInputVal("");
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#08090f]/95 rounded-xl border border-white/10 overflow-hidden font-mono shadow-2xl">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1018] border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 text-[11px] text-zinc-400 font-medium">terminal@adnan: ~</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span>BASH</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Terminal Buffer */}
      <div
        className="flex-1 p-3.5 overflow-y-auto space-y-2 min-h-[160px] max-h-[220px]"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((log) => (
          <div key={log.id}>{log.content}</div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Interactive Command Input Form */}
      <form onSubmit={handleCommand} className="flex items-center gap-2 px-3 py-2 bg-[#0a0b12] border-t border-white/5">
        <span className="text-emerald-400 text-xs font-bold font-mono">adnan@dev:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="type 'help' or 'projects'..."
          className="flex-1 bg-transparent text-xs text-white outline-none font-mono placeholder:text-zinc-600"
          autoComplete="off"
          spellCheck="false"
        />
        <button
          type="submit"
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Execute command"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
