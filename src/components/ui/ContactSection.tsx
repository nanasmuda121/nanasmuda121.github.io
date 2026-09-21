"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Copy, Check, ShieldCheck, HelpCircle } from "lucide-react";
import { PORTFOLIO_DATA } from "@/data/portfolioData";
import { playClickSound, playSuccessSound } from "@/utils/audio";
import confetti from "canvas-confetti";

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
      q: "Bagaimana cara klaim promo Take All 10K?",
      a: "Klik tombol 'Ambil Promo 10K Sekarang' atau hubungi WhatsApp saya dengan pesan promo. Penawaran ini berlaku untuk 1 pembeli pertama.",
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
    <section id="faq" className="py-12 md:py-20 px-4 max-w-6xl mx-auto space-y-12">
      {/* Contact Card */}
      <div className="rounded-2xl bg-[#090b12] border border-white/10 p-8 sm:p-12 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>ONLINE & SIAP TRANSAKSI</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tertarik Beli Source Code?
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Hubungi saya langsung via WhatsApp untuk pertanyaan teknis, demo tambahan, negosiasi, atau pembelian instan.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="select-all">{PORTFOLIO_DATA.identity.phone}</span>
              </div>

              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Chat WhatsApp Langsung</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-semibold pb-2 border-b border-white/10">
              <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
              <span>Jaminan Kualitas Kode</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              Setiap proyek telah diuji, memiliki struktur folder rapi tanpa file sampah, dan bebas dari error compile.
            </p>
            <div className="text-[11px] text-zinc-500 pt-1">
              Developer: {PORTFOLIO_DATA.identity.fullName} • Indonesia
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 font-mono text-xs text-cyber-cyan">
          <HelpCircle className="w-4 h-4" />
          <span>PERTANYAAN UMUM (FAQ)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#090b12] border border-white/10 space-y-2 hover:border-white/20 transition-colors"
            >
              <h4 className="text-sm font-bold text-white tracking-tight">{faq.q}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
