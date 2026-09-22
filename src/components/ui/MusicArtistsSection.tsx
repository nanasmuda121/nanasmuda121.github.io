"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAVORITE_ARTISTS, FAVORITE_TRACKS, Artist, FavoriteTrack } from "@/data/musicData";
import { Radio, Disc, ExternalLink, Music, Sparkles, Volume2, Headphones } from "lucide-react";
import { playClickSound } from "@/utils/audio";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease },
};

export default function MusicArtistsSection() {
  const [activeTab, setActiveTab] = useState<"artists" | "tracks">("artists");
  const [expandedArtistId, setExpandedArtistId] = useState<string | null>("xxxtentacion");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const toggleArtist = (id: string) => {
    playClickSound();
    setExpandedArtistId((prev) => (prev === id ? null : id));
  };

  const handleTrackClick = (id: string) => {
    playClickSound();
    setPlayingTrackId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="music" className="py-16 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 select-none">
      {/* Header */}
      <motion.div
        {...fadeUp}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10"
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>// FREKUENSI • RADIO ORBITAL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Artis Disukai &amp; Musik Favorit
          </h2>

          <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Musik yang sering diputar selama riset, ngoding, dan eksplorasi antariksa. Beberapa lagu ini
            ditarik langsung dari aplikasi NanzMusify &amp; Beatles Music.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#060814]/95 border border-white/10 font-mono text-xs shadow-xl">
          <button
            onClick={() => {
              setActiveTab("artists");
              playClickSound();
            }}
            className={`relative px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-bold ${
              activeTab === "artists" ? "text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "artists" && (
              <motion.span
                layoutId="music-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-md"
                transition={{ duration: 0.35, ease }}
              />
            )}
            <Radio className="w-3.5 h-3.5 relative" />
            <span className="relative">Artis Favorit</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("tracks");
              playClickSound();
            }}
            className={`relative px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 font-bold ${
              activeTab === "tracks" ? "text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            {activeTab === "tracks" && (
              <motion.span
                layoutId="music-tab"
                className="absolute inset-0 bg-white rounded-xl shadow-md"
                transition={{ duration: 0.35, ease }}
              />
            )}
            <Disc className="w-3.5 h-3.5 relative" />
            <span className="relative">Playlist Track</span>
          </button>
        </div>
      </motion.div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        {activeTab === "artists" ? (
          <motion.div
            key="artists"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FAVORITE_ARTISTS.map((artist: Artist, index: number) => {
              const isExpanded = expandedArtistId === artist.id;
              const indexStr = String(index + 1).padStart(2, "0");

              return (
                <motion.article
                  key={artist.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ layout: { duration: 0.35, ease }, duration: 0.5, ease, delay: index * 0.04 }}
                  className={`rounded-3xl border transition-all overflow-hidden relative flex flex-col justify-between ${
                    isExpanded
                      ? "bg-[#0a0e18] border-cyan-400/50 shadow-[0_0_30px_rgba(0,240,255,0.14)]"
                      : "bg-[#070a12]/90 border-white/10 hover:border-white/30 hover:bg-[#090d18]"
                  }`}
                >
                  {/* Photo trigger */}
                  <button
                    type="button"
                    onClick={() => toggleArtist(artist.id)}
                    aria-expanded={isExpanded}
                    className="w-full text-left relative h-72 sm:h-80 overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-105 saturate-[0.85] group-hover:saturate-100"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/50 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300">
                        #{indexStr}
                      </span>
                      <span className="font-mono text-[10px] uppercase px-2 py-1 rounded bg-white text-black font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Buka Detail
                      </span>
                    </div>

                    {/* Bottom meta */}
                    <div className="absolute bottom-4 left-4 right-16 z-10">
                      <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                        {artist.genre}
                      </span>
                      <strong className="block text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
                        {artist.name}
                      </strong>
                    </div>

                    {/* Plus toggle */}
                    <div
                      className={`absolute bottom-4 right-4 w-10 h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all shadow-lg ${
                        isExpanded
                          ? "bg-cyan-400 border-cyan-300"
                          : "bg-white/10 border-white/20 group-hover:bg-cyan-400/20 group-hover:border-cyan-300/40"
                      }`}
                    >
                      <motion.div
                        animate={{ rotate: isExpanded ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                        className={`font-bold text-xl leading-none flex items-center justify-center ${
                          isExpanded ? "text-black" : "text-white"
                        }`}
                      >
                        +
                      </motion.div>
                    </div>
                  </button>

                  {/* Expandable detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease }}
                        className="overflow-hidden border-t border-white/10 bg-[#090d18]/95"
                      >
                        <div className="p-4 sm:p-5 space-y-4">
                          <div>
                            <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1.5">
                              TENTANG &amp; PENGARUH
                            </span>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                              {artist.description}
                            </p>
                          </div>

                          <div>
                            <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-2">
                              TRACK FAVORIT
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {artist.topTracks.map((track, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111625] border border-white/10 font-mono text-xs text-zinc-200"
                                >
                                  <Music className="w-3 h-3 text-cyan-400" />
                                  <span>{track}</span>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="font-mono text-[11px] text-zinc-500">Tautan Resmi:</span>
                            <a
                              href={artist.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => playClickSound()}
                              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              <span>{artist.linkText}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FAVORITE_TRACKS.map((track: FavoriteTrack, idx) => {
                const isPlaying = playingTrackId === track.id;
                const indexStr = String(idx + 1).padStart(2, "0");

                return (
                  <motion.div
                    key={track.id}
                    layout
                    onClick={() => handleTrackClick(track.id)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.45, ease, delay: idx * 0.03 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isPlaying
                        ? "bg-[#0a0e1a] border-cyan-400/60 shadow-lg shadow-cyan-900/20"
                        : "bg-[#070a12]/90 border-white/10 hover:border-white/25 hover:bg-[#090d18]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        {isPlaying ? (
                          <div className="flex items-end gap-[2px] h-4">
                            <motion.span
                              animate={{ height: ["40%", "100%", "30%", "80%"] }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                              className="w-[3px] bg-cyan-400 rounded-full"
                            />
                            <motion.span
                              animate={{ height: ["90%", "20%", "100%", "50%"] }}
                              transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                              className="w-[3px] bg-cyan-400 rounded-full"
                            />
                            <motion.span
                              animate={{ height: ["30%", "80%", "40%", "90%"] }}
                              transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut" }}
                              className="w-[3px] bg-cyan-400 rounded-full"
                            />
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-zinc-400">{indexStr}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-white truncate">
                            {track.title}
                          </h4>
                          {isPlaying && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold whitespace-nowrap">
                              PLAYING
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">
                          {track.artist}
                          {track.album && (
                            <>
                              <span className="text-zinc-600"> • </span>
                              {track.album}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 font-mono text-xs text-zinc-400">
                      {track.genre && (
                        <span className="hidden sm:inline px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                          {track.genre}
                        </span>
                      )}
                      <span className="text-zinc-300 font-bold">{track.duration}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Radio banner */}
            <motion.div
              {...fadeUp}
              className="p-4 rounded-2xl bg-[#0a0e18]/95 border border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-zinc-400"
            >
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-zinc-200 font-semibold">FREKUENSI ORBITAL:</span>
                <span className="text-cyan-400">107.4 MHz • STEREO VOYAGER BEAM</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <Headphones className="w-3.5 h-3.5 text-amber-400" />
                <span>Nyala juga di aplikasi NanzMusify &amp; Beatles Music Android</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}