import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ShieldCheck, Zap, HardDrive, ArrowRight, CheckCircle2,
  Sparkles, Layers, RefreshCw, Lock, FileText, Cpu, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { DriveAccount } from '../types';

import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface Props {
  onConnectClick: () => void;
  accounts: DriveAccount[];
  lang?: Language;
}

export function UserGuideView({ onConnectClick, accounts, lang = 'id' }: Props) {
  const t = translations[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = lang === 'en' ? [
    {
      q: 'Are my files saved on 9DRIVE server computers?',
      a: 'NOT AT ALL. 9DRIVE uses a Zero-Disk Streaming architecture. Your files stream directly (pass-through) from your browser to your official Google Drive. The 9DRIVE server only indexes file metadata without storing physical contents.',
    },
    {
      q: 'What if I connect 3 free 15GB Google Drive accounts?',
      a: '9DRIVE automatically combines all three into 1 unified 45 GB Vault (15GB x 3). You never have to worry about which account is running out of space.',
    },
    {
      q: 'How does 9DRIVE pick an account when I upload files?',
      a: 'By default, 9DRIVE uses "Max Free Space" mode — files are routed to the account with the most available storage. You can also switch to "Priority" or "Round Robin" mode anytime in the sidebar.',
    },
    {
      q: 'Can 9DRIVE see my Google account password?',
      a: 'NO. Authentication is handled directly via official Google OAuth 2.0. Access tokens are encrypted with military-grade AES-256-GCM encryption. 9DRIVE never sees your password.',
    },
    {
      q: 'How do I download or retrieve files back?',
      a: 'Simply click Download or Preview on any file in your vault. 9DRIVE fetches the file stream from the corresponding Google Drive and streams it directly to your browser instantly.',
    },
  ] : [
    {
      q: 'Apakah file saya disimpan di komputer server 9DRIVE?',
      a: 'TIDAK SAMA SEKALI. 9DRIVE menggunakan arsitektur Zero-Disk Streaming. File kamu langsung mengalir (pass-through) dari browser ke Google Drive resmi milikmu. Server 9DRIVE hanya mencatat nama & lokasi file tanpa menyimpan fisiknya.',
    },
    {
      q: 'Bagaimana jika saya menghubungkan 3 akun Google Drive 15GB?',
      a: '9DRIVE secara otomatis menggabungkan ketiganya menjadi 1 Vault besar berkapasitas 45 GB (15GB x 3). Kamu tidak perlu pusing memikirkan akun mana yang penuh.',
    },
    {
      q: 'Bagaimana cara 9DRIVE memilih akun saat saya upload file?',
      a: 'Secara default, 9DRIVE memakai mode "Max Free Space" — file dikirim ke akun yang ruang kosongnya paling banyak. Kamu juga bisa mengubahnya ke mode "Priority" atau "Round Robin" kapan saja di sidebar.',
    },
    {
      q: 'Apakah 9DRIVE bisa melihat password Google saya?',
      a: 'TIDAK. Login menggunakan OAuth 2.0 resmi Google. Kunci akses (token) disimpan terenkripsi dengan standar militer AES-256-GCM. 9DRIVE tidak pernah tahu password kamu.',
    },
    {
      q: 'Bagaimana cara mengambil atau mengunduh file kembali?',
      a: 'Kamu bisa klik tombol Download atau Preview di tabel file. 9DRIVE akan langsung mengambilkan file tersebut dari Google Drive terkait dan mengalirkannya ke browsermu secara instan.',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface rounded-3xl p-6 sm:p-8 border border-cyan-500/30 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Human-Centric Guide
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
            {t.guideTitle}
          </h1>
          
          <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {t.guideSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onConnectClick}
              className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2"
            >
              <span>{t.connectDriveBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500">
              {accounts.length} {t.drives} ({accounts.reduce((s, a) => s + a.totalStorageGB, 0).toFixed(1)} GB total)
            </span>
          </div>
        </motion.div>

        {/* 3 Step Workflow Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: t.step1Title,
              desc: t.step1Desc,
              icon: HardDrive,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10',
            },
            {
              step: '02',
              title: t.step2Title,
              desc: t.step2Desc,
              icon: Zap,
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10',
            },
            {
              step: '03',
              title: t.step3Title,
              desc: t.step3Desc,
              icon: Layers,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
          ].map(({ step, title, desc, icon: Icon, color, bg }, idx) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, borderColor: 'rgba(6,182,212,0.4)' }}
              className="glass-surface rounded-2xl p-5 border border-slate-700/40 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-2xl font-black text-slate-700 font-mono">{step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Analogy Card (Human ELI5 Explanation) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface rounded-2xl p-6 border border-slate-700/40 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="heading-kinetic text-xs text-slate-400 tracking-widest uppercase">
              {t.howItWorksTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {t.hoseAnalogyTitle}
              </span>
              <p className="text-slate-400 leading-relaxed">
                {t.hoseAnalogyDesc}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {t.securityTitle}
              </span>
              <p className="text-slate-400 leading-relaxed">
                {t.securityDesc}
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="heading-kinetic text-xs text-slate-400 tracking-widest uppercase">
              {t.faqTitle}
            </h3>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="glass-surface rounded-xl border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-3.5 text-left text-xs font-semibold text-slate-200 flex items-center justify-between gap-3 cursor-pointer hover:text-cyan-300"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
