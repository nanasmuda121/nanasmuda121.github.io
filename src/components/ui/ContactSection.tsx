"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Phone, Copy, Check, ShieldCheck, HelpCircle } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound, playSuccessSound } from "@/utils/audio";
import confetti from "canvas-confetti";

const ease = [0.4, 0, 0.2, 1] as const;

export default function ContactSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(PORTFOLIO_DATA.identity.phone);
    setCopied(true);
    playSuccessSound();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#10b981", "#ffffff", "#00f0ff"],
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = [
    {
      q: "Apa yang saya dapatkan setelah membeli?",
      a: "Anda mendapatkan Full Source Code lengkap (.zip / akses repository) beserta aset dan petunjuk cara build APK / deploy website.",
    },
    {
      q: "Bagaimana cara melakukan pemesanan?",
      a: "Klik tombol 'Beli Source' pada produk yang Anda inginkan, lalu konfirmasi pesanan melalui WhatsApp. Saya akan langsung merespons.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima?",
      a: "Pembayaran dapat dilakukan melalui QRIS (semua e-wallet dan m-banking), DANA, GoPay, OVO, atau transfer bank.",
    },
    {
      q: "Berapa lama proses pengiriman source code?",
      a: "Pengiriman instan via chat WhatsApp atau link Google Drive/GitHub segera setelah bukti transfer dikonfirmasi.",
    },
  ];

  return (
    <section id="faq" className="py-14 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
      {/* Contact Card */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease }}
        className="rounded bg-dark-900/90 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-16 shadow-2xl hover:border-cyber-cyan/30 transition-all"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs sm:text-sm md:text-base text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-semibold tracking-wide">SATELIT KOMUNIKASI AKTIF • SIAP TRANSAKSI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Stasiun Transmisi &amp; Pembelian Source Code
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-xl">
              Hubungi saya langsung via WhatsApp untuk pertanyaan teknis, konsultasi custom, atau pembelian instan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5 font-mono text-xs sm:text-sm md:text-base">
              <div className="flex items-center gap-2.5 px-5 py-3 rounded bg-white/5 border border-white/10 text-zinc-200">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="select-all font-bold">{PORTFOLIO_DATA.identity.phone}</span>
              </div>

              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-2 px-5 py-3 rounded bg-white/5 border border-white/10 text-zinc-200 hover:text-white hover:bg-white/10 transition-colors font-medium active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Nomor</span>
                  </>
                )}
              </button>

              <a
                href={PORTFOLIO_DATA.identity.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound()}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat WhatsApp Langsung</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 p-7 sm:p-8 rounded bg-black/50 border border-white/10 space-y-4 font-mono text-xs sm:text-sm md:text-base">
            <div className="flex items-center gap-2.5 text-white font-bold pb-3 border-b border-white/10 text-sm sm:text-base">
              <ShieldCheck className="w-5 h-5 text-cyber-cyan" />
              <span>Jaminan Kualitas Kode</span>
            </div>
            <p className="text-zinc-300 leading-relaxed font-normal">
              Setiap proyek telah diuji secara menyeluruh, memiliki struktur folder rapi tanpa file sampah, dan bebas dari error compile.
            </p>
            <div className="text-xs text-zinc-400 pt-1">
              Developer: <span className="text-white font-bold">{PORTFOLIO_DATA.identity.fullName}</span> • Indonesia
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <div className="space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center gap-2.5 font-mono text-xs sm:text-sm md:text-base text-cyber-cyan"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-bold tracking-wider">PERTANYAAN UMUM (FAQ)</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease, delay: idx * 0.05 }}
              className="p-6 sm:p-7 md:p-8 rounded bg-dark-900/90 border border-white/10 space-y-2.5 hover:border-cyber-cyan/35 transition-all shadow-lg"
            >
              <h4 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-snug">
                {faq.q}
              </h4>
              <p className="text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed font-normal">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
