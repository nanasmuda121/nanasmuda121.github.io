"use client";

import React, { useState } from "react";
import { Mail, Copy, Check, ArrowUpRight, MessageSquare, Send } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterXIcon } from "@/components/ui/Icons";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound, playSuccessSound } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const [noteText, setNoteText] = useState("");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.identity.email);
    setCopied(true);
    playSuccessSound();
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.8 },
      colors: ["#00f0ff", "#ffffff", "#8b5cf6"],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    playSuccessSound();
    setNoteSent(true);
    const mailtoUrl = `mailto:${PORTFOLIO_DATA.identity.email}?subject=${encodeURIComponent(
      "Project Inquiry / Architecture Discussion"
    )}&body=${encodeURIComponent(noteText)}`;
    window.open(mailtoUrl, "_blank");
    setTimeout(() => {
      setNoteSent(false);
      setNoteText("");
    }, 3000);
  };

  return (
    <section id="contact" className="py-16 md:py-24 px-4 max-w-6xl mx-auto">
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0c0e18] via-[#080910] to-[#050508] border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-grid-cyber opacity-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{PORTFOLIO_DATA.identity.statusBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Let&apos;s engineer something unforgettable.
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Currently accepting selected architectural contracts, 3D WebGL consultancy, and high-performance frontend leadership. Reach out directly via email or your preferred platform.
            </p>

            {/* Email Copier Box */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-zinc-300">
                <Mail className="w-4 h-4 text-cyber-cyan" />
                <span className="select-all">{PORTFOLIO_DATA.identity.email}</span>
              </div>

              <button
                onClick={handleCopyEmail}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyber-cyan text-black font-semibold font-mono text-xs hover:bg-cyber-cyan/90 transition-all active:scale-95 shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Grid */}
            <div className="flex items-center gap-3 pt-4">
              <a
                href={PORTFOLIO_DATA.identity.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClickSound}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>

              <a
                href={PORTFOLIO_DATA.identity.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClickSound}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>

              <a
                href={PORTFOLIO_DATA.identity.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playClickSound}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <TwitterXIcon className="w-4 h-4" />
                <span>X (Twitter)</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Right quick dispatch form */}
          <div className="lg:col-span-5 bg-[#090b14]/90 p-6 rounded-xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Direct Dispatch Console</span>
              </div>
              <span className="text-[10px] text-zinc-500">CLIENT PROTOCOL</span>
            </div>

            <form onSubmit={handleSendQuickNote} className="space-y-3 font-mono text-xs">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                placeholder="Write a brief project brief or note for Adnan..."
                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-zinc-600 outline-none focus:border-cyber-cyan/50 resize-none font-mono"
              />

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white font-medium hover:bg-white/20 transition-all active:scale-95"
              >
                {noteSent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Opening Mail Client...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-cyber-cyan" />
                    <span>Dispatch via Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
