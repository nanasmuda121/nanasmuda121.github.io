"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeDeck from "@/components/ui/SwipeDeck";
import {
  Radio,
  Disc,
  Play,
  Pause,
  ExternalLink,
  X,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Music,
} from "lucide-react";
import { FAVORITE_ARTISTS, FAVORITE_TRACKS, Artist, FavoriteTrack } from "@/data/musicData";
import { playClickSound } from "@/utils/audio";

const ease = [0.16, 1, 0.3, 1] as const;

interface NowPlaying {
  videoId?: string;
  title: string;
  sub?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease },
};

export default function MusicArtistsSection() {
  const [activeTab, setActiveTab] = useState<"artists" | "tracks">("artists");
  const [artistIndex, setArtistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState<NowPlaying | null>(null);

  const playItem = (item: { videoId?: string; title: string; sub?: string; query?: string }) => {
    playClickSound();
    if (playing && playing.videoId && playing.videoId === item.videoId) {
      setPlaying(null);
      return;
    }
    if (!item.videoId) {
      window.open(`https://music.youtube.com/search?q=${encodeURIComponent(item.query ?? item.title)}`, "_blank");
      return;
    }
    setPlaying({ videoId: item.videoId, title: item.title, sub: item.sub });
  };

  const isPlaying = (videoId?: string) => !!playing?.videoId && playing.videoId === videoId;

  return (
    <section id="music" className="py-16 md:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 select-none">
      {/* Header */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wider text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>// FREKUENSI • RADIO ORBITAL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Artis Disukai &amp; Musik Favorit
          </h2>
          <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Tumpukan kartu favorit — geser ke kiri / kanan buat lihat yang lain. Klik play untuk memutar
            lewat pemutar YouTube Music yang transparan.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#060814]/95 border border-white/10 font-mono text-xs shadow-xl">
          <button
            onClick={() => {
              setActiveTab("artists");
              setPlaying(null);
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
              setPlaying(null);
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

      <AnimatePresence mode="wait">
        {activeTab === "artists" ? (
          <motion.div
            key="artists"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-5"
          >
            <SwipeDeck<Artist>
              items={FAVORITE_ARTISTS}
              current={artistIndex}
              onSelect={setArtistIndex}
              className="h-[430px] sm:h-[470px]"
              renderCard={(artist: Artist, isTop: boolean, index: number, total: number) => (
                <ArtistCard
                  artist={artist}
                  isTop={isTop}
                  index={index}
                  total={total}
                  isPlaying={isPlaying(artist.videoId)}
                  onPlay={() =>
                    playItem({
                      videoId: artist.videoId,
                      title: `${artist.highlightSong} — ${artist.name}`,
                      sub: "YouTube Music",
                      query: `${artist.name} ${artist.highlightSong}`,
                    })
                  }
                  onMore={() => window.open(artist.link, "_blank")}
                />
              )}
            />

            <DeckControls
              index={artistIndex}
              total={FAVORITE_ARTISTS.length}
              onChange={setArtistIndex}
            />
          </motion.div>
        ) : (
          <motion.div
            key="tracks"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease }}
            className="space-y-5"
          >
            <SwipeDeck<FavoriteTrack>
              items={FAVORITE_TRACKS}
              current={trackIndex}
              onSelect={setTrackIndex}
              className="h-[380px] sm:h-[400px]"
              renderCard={(track: FavoriteTrack, isTop: boolean, index: number, total: number) => (
                <TrackCard
                  track={track}
                  isTop={isTop}
                  index={index}
                  total={total}
                  isPlaying={isPlaying(track.videoId)}
                  onPlay={() =>
                    playItem({
                      videoId: track.videoId,
                      title: track.title,
                      sub: track.artist,
                      query: `${track.title} ${track.artist ?? ""}`,
                    })
                  }
                />
              )}
            />

            <DeckControls
              index={trackIndex}
              total={FAVORITE_TRACKS.length}
              onChange={setTrackIndex}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transparent YouTube Music embed player */}
      <AnimatePresence>
        {playing?.videoId && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.99 }}
            transition={{ duration: 0.45, ease }}
            className="relative"
          >
            <div className="flex items-center justify-between gap-3 font-mono text-xs sm:text-sm px-1 pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-white font-bold truncate">{playing.title}</span>
                <span className="text-zinc-500 truncate hidden sm:inline">{playing.sub}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`https://music.youtube.com/watch?v=${playing.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">YouTube Music</span>
                </a>
                <button
                  onClick={() => {
                    setPlaying(null);
                    playClickSound();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tutup</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0e16] shadow-2xl">
              <iframe
                key={playing.videoId}
                src={`https://music.youtube.com/watch?v=${playing.videoId}&autoplay=1&playnext=0`}
                title={`YouTube Music — ${playing.title}`}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full mix-blend-screen h-[210px] sm:h-[250px] md:h-[300px]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function DeckControls({
  index,
  total,
  onChange,
}: {
  index: number;
  total: number;
  onChange: (i: number) => void;
}) {
  const prev = () => onChange(((index - 1 + total) % total + total) % total);
  const next = () => onChange((index + 1) % total);
  const shuffle = () => onChange(Math.floor(Math.random() * total));

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <span className="font-mono text-[11px] sm:text-xs text-zinc-500">
        Geser kartu<span className="text-zinc-600"> — </span>
        <button onClick={prev} className="text-cyan-400 hover:text-cyan-300 transition-colors">
          kiri
        </button>
        <span className="text-zinc-600"> / </span>
        <button onClick={next} className="text-cyan-400 hover:text-cyan-300 transition-colors">
          kanan
        </button>
      </span>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 mr-1">
          <span className="text-white font-bold">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-zinc-600">/</span>
          <span>{String(total).padStart(2, "0")}</span>
        </div>

        <button
          onClick={() => {
            playClickSound();
            prev();
          }}
          aria-label="Kartu sebelumnya"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            playClickSound();
            shuffle();
          }}
          aria-label="Acak kartu"
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            playClickSound();
            next();
          }}
          aria-label="Kartu berikutnya"
          className="w-10 h-10 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/25 flex items-center justify-center transition-all active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ArtistCard({
  artist,
  isTop,
  index,
  total,
  isPlaying,
  onPlay,
  onMore,
}: {
  artist: Artist;
  isTop: boolean;
  index: number;
  total: number;
  isPlaying: boolean;
  onPlay: () => void;
  onMore: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070a12] shadow-2xl">
      <img
        src={artist.image}
        alt={artist.name}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-top saturate-[0.85]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070d] via-[#06070d]/35 to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,240,255,0.08),transparent_55%)]" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-zinc-300">
          #{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {isTop && (
          <span className="font-mono text-[10px] uppercase px-2.5 py-1 rounded-lg bg-cyan-400/15 backdrop-blur-md border border-cyan-400/30 text-cyan-300">
            geser ↤ ↦
          </span>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-1.5">
          {artist.genre}
        </p>
        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mb-1">
          {artist.name}
        </h3>

        <AnimatePresence initial={false}>
          {isTop && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease }}
              className="overflow-hidden"
            >
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed line-clamp-2 mt-2 max-w-md">
                {artist.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3.5 flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white text-black font-bold font-mono text-xs sm:text-sm hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Jeda
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {artist.videoId ? "Putar Lagu" : "Cari di YT Music"}
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onMore();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-zinc-200 font-mono text-xs hover:bg-white/10 transition-all"
          >
            <Music className="w-4 h-4 text-cyan-400" />
            Kunjungi
          </button>

          {isPlaying && (
            <span className="inline-flex px-2.5 py-1 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-bold">
              PLAYING
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackCard({
  track,
  isTop,
  index,
  total,
  isPlaying,
  onPlay,
}: {
  track: FavoriteTrack;
  isTop: boolean;
  index: number;
  total: number;
  isPlaying: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0a0e18] shadow-2xl flex flex-col">
      {/* Cover half */}
      <div className="relative h-[52%] flex-shrink-0 overflow-hidden">
        <img
          src={track.cover ?? "/artists/xxxtentacion.jpg"}
          alt={track.title}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top saturate-[0.9]"
        />
        <div className="absolute inset-0 bg-black/30" />

        <span className="absolute top-3.5 left-3.5 font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-zinc-300">
          #{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        {isTop && (
          <span className="absolute top-3.5 right-3.5 font-mono text-[10px] uppercase px-2.5 py-1 rounded-lg bg-cyan-400/15 backdrop-blur-md border border-cyan-400/30 text-cyan-300">
            geser ↤ ↦
          </span>
        )}

        {isTop && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            aria-label={track.videoId ? `Putar ${track.title}` : `Cari ${track.title} di YouTube Music`}
            className={`absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full backdrop-blur-md flex items-center justify-center transition-all active:scale-90 shadow-2xl ${
              isPlaying
                ? "bg-cyan-400 shadow-cyan-400/40"
                : "bg-white/10 border border-white/20 hover:bg-white/25"
            }`}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8 text-black fill-current" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current translate-x-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Info half */}
      <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 flex-1 min-h-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="flex items-end gap-[2px] h-3.5 flex-shrink-0">
                <span className="w-[3px] h-full bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-[3px] h-[60%] bg-cyan-400 rounded-full animate-pulse" />
                <span className="w-[3px] h-[85%] bg-cyan-400 rounded-full animate-pulse" />
              </span>
            )}
            <h4 className="text-base sm:text-lg font-bold text-white truncate">{track.title}</h4>
          </div>
          <p className="font-mono text-xs text-zinc-400 truncate mt-1">
            {track.artist}
            {track.album && (
              <>
                <span className="text-zinc-600"> • </span>
                {track.album}
              </>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
            {track.genre && (
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">{track.genre}</span>
            )}
            {track.duration && <span className="text-zinc-300 font-bold">{track.duration}</span>}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 ${
              isPlaying
                ? "bg-cyan-400 text-black"
                : "bg-white/5 border border-white/15 text-zinc-100 hover:bg-white/15"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                Jeda
              </>
            ) : track.videoId ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Putar
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                Cari
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}