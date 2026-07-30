import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  HardDrive,
  Zap,
  Upload,
  LayoutDashboard,
  Shield,
  Lock,
  Cloud,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Database,
  Activity,
  Key,
  Sliders,
  Globe,
  Server,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import type { Language } from "../i18n/translations";
import { translations } from "../i18n/translations";

interface LandingPageProps {
  lang: Language;
  onToggleLang: () => void;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer group"
      >
        <span className="text-sm font-semibold text-[--text-primary] pr-4 group-hover:text-[--accent-blue] transition-colors">
          {q}
        </span>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
          {open ? (
            <ChevronUp className="w-4 h-4 text-[--accent-blue]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[--text-muted]" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="px-6 pb-6 pt-1 border-t border-white/5"
          >
            <p className="text-sm text-[--text-secondary] leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage({ lang, onToggleLang }: LandingPageProps) {
  const t = translations[lang];
  const navigate = useNavigate();

  // Storage Calculator State (Nike/Apple style interactive hook)
  const [driveCount, setDriveCount] = useState<number>(5);
  const totalFreeGB = driveCount * 15;

  // Active Security Tab
  const [activeSecTab, setActiveSecTab] = useState<
    "encryption" | "oauth" | "zero-server"
  >("zero-server");

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#09090b] text-[--text-primary] selection:bg-[--accent-blue] selection:text-white">
      {/* ─── Ambient Glows & Grid Background ─── */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div
        className="fixed -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(41, 151, 255, 0.12) 0%, rgba(191, 90, 242, 0.05) 45%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="fixed bottom-0 right-0 w-[800px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(48, 209, 88, 0.06) 0%, transparent 65%)",
          filter: "blur(120px)",
        }}
      />

      {/* ─── Floating Header Nav (Apple Style) ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3">
        <div
          className="max-w-6xl mx-auto h-14 px-5 rounded-2xl flex items-center justify-between transition-all duration-300"
          style={{
            background: "rgba(9, 9, 11, 0.75)",
            backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2997FF] to-[#BF5AF2] flex items-center justify-center shadow-md shadow-[#2997FF]/20">
              <HardDrive className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-extrabold tracking-tight text-white">
              9DRIVE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[--text-secondary]">
            <button
              onClick={() => scrollTo("calculator")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.landingNavFeatures}
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.landingFeatureTitle}
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.landingNavHowItWorks}
            </button>
            <button
              onClick={() => scrollTo("security")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t.landingNavSecurity}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider cursor-pointer transition-all hover:bg-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "var(--text-primary)",
              }}
            >
              {lang === "id" ? "🇮🇩 ID | EN" : "🇬🇧 EN | ID"}
            </button>

            <button
              onClick={() => navigate("/app")}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #2997FF 0%, #0066CC 100%)",
                boxShadow: "0 4px 15px rgba(41, 151, 255, 0.3)",
              }}
            >
              {t.landingNavLogin}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section (Nike & Apple Style) ─── */}
      <section className="relative z-10 pt-36 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Nike Style High Energy Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6"
          style={{
            background: "rgba(41, 151, 255, 0.08)",
            border: "1px solid rgba(41, 151, 255, 0.25)",
            color: "var(--accent-blue)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>HYPER-VAULT STORAGE GATEWAY</span>
        </motion.div>

        {/* Headline with Metallic Text Gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-4xl"
        >
          <span className="text-gradient-apple">{t.landingHeroTitle}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-[--text-secondary] max-w-2xl font-normal leading-relaxed"
        >
          {t.landingHeroSubtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          <button
            onClick={() => navigate("/app")}
            className="btn-nike-bold w-full sm:w-auto px-8 py-4 text-sm flex items-center justify-center gap-3 cursor-pointer shadow-2xl"
          >
            <span>{t.landingHeroCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => scrollTo("calculator")}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:bg-white/10"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "var(--text-primary)",
            }}
          >
            {t.landingHeroCtaSecondary}
          </button>
        </motion.div>

        {/* Interactive App Mockup Showcase (macOS Window Frame) */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative border"
          style={{
            background: "rgba(15, 15, 18, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.12)",
            boxShadow:
              "0 30px 100px -20px rgba(0, 0, 0, 0.8), 0 0 50px rgba(41, 151, 255, 0.15)",
          }}
        >
          {/* macOS Title Bar */}
          <div className="h-10 px-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="text-[11px] font-mono text-[--text-muted] tracking-wider uppercase flex items-center gap-2">
              <Lock className="w-3 h-3 text-[--accent-green]" />
              <span>9drive.vault.app (AES-256 ENCRYPTED)</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Live Mockup Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {/* Mockup Sidebar */}
            <div className="hidden md:flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[--text-muted] mb-1">
                DRIVE VAULTS
              </div>
              {[
                {
                  name: "Google Drive #1",
                  size: "14.2 / 15 GB",
                  color: "var(--accent-blue)",
                },
                {
                  name: "Google Drive #2",
                  size: "3.1 / 15 GB",
                  color: "var(--accent-green)",
                },
                {
                  name: "Google Drive #3",
                  size: "0.8 / 15 GB",
                  color: "var(--accent-purple)",
                },
              ].map((d, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-[--text-primary]">
                    <span className="truncate">{d.name}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: d.color }}
                    />
                  </div>
                  <div className="text-[10px] text-[--text-muted]">
                    {d.size}
                  </div>
                </div>
              ))}
            </div>

            {/* Mockup Main View */}
            <div className="md:col-span-3 space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[--accent-blue]" />
                    <span>Smart Router Active</span>
                  </div>
                  <div className="text-[11px] text-[--text-secondary] mt-0.5">
                    Total Connected Storage:{" "}
                    <span className="text-white font-bold">45.0 GB</span> (3
                    Accounts)
                  </div>
                </div>
                <div className="px-3 py-1 rounded-lg text-[10px] font-bold text-[--accent-green] bg-[--accent-green]/10 border border-[--accent-green]/30">
                  OPTIMIZED
                </div>
              </div>

              {/* Mockup File Table */}
              <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
                <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 grid grid-cols-3 text-[11px] font-semibold text-[--text-muted]">
                  <span>File Name</span>
                  <span>Target Route</span>
                  <span className="text-right">Size</span>
                </div>
                {[
                  {
                    icon: <Video className="w-3.5 h-3.5 text-rose-400" />,
                    name: "Project_Presentation_4K.mp4",
                    route: "Google Drive #2 (Most Free)",
                    size: "1.4 GB",
                  },
                  {
                    icon: <FileText className="w-3.5 h-3.5 text-blue-400" />,
                    name: "Financial_Report_2026.pdf",
                    route: "Google Drive #3 (Most Free)",
                    size: "42 MB",
                  },
                  {
                    icon: <ImageIcon className="w-3.5 h-3.5 text-purple-400" />,
                    name: "Design_Assets_Raw.zip",
                    route: "Google Drive #2 (Most Free)",
                    size: "840 MB",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 border-b border-white/[0.03] grid grid-cols-3 items-center text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-200 font-medium truncate">
                      {f.icon}
                      <span className="truncate">{f.name}</span>
                    </div>
                    <div className="text-[11px] text-[--accent-blue] font-mono truncate">
                      {f.route}
                    </div>
                    <div className="text-right text-[--text-muted] font-mono text-[11px]">
                      {f.size}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── TAHAP 1 VISUAL HOOK: The Anatomy of 9DRIVE Vault Node Architecture ─── */}
      <section className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[--accent-blue] bg-[--accent-blue]/10 border border-[--accent-blue]/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VAULT ENGINE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[--text-primary] tracking-tight">
            Bagaimana 9DRIVE Bekerja?
          </h2>
          <p className="text-sm sm:text-base text-[--text-secondary] max-w-2xl mx-auto mt-2">
            Penyimpanan terdistribusi tanpa perantara server. Semua drive Anda diserap dan digabungkan menjadi 1 Vault Raksasa secara real-time.
          </p>
        </div>

        {/* Node Architecture Canvas */}
        <div
          className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border text-center"
          style={{
            background: "rgba(18, 18, 22, 0.6)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.6), inset 0 0 60px rgba(41,151,255,0.05)",
          }}
        >
          {/* Ambient Glowing Background Core */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 blur-3xl pointer-events-none" />

          {/* Node Diagram Layout */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Left Node: Multiple Drives */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[--text-muted] uppercase tracking-wider text-left mb-2">
                📦 Google Drive Anda (Terpisah)
              </div>
              {[
                { name: "Drive Pribadi", email: "user.personal@gmail.com", size: "15 GB", color: "#2997FF" },
                { name: "Drive Kerja", email: "user.work@gmail.com", size: "15 GB", color: "#30D158" },
                { name: "Drive Project", email: "user.project@gmail.com", size: "15 GB", color: "#BF5AF2" },
              ].map((d, idx) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="p-4 rounded-2xl border text-left flex items-center justify-between"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ background: d.color }}
                    >
                      GD
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[--text-primary]">{d.name}</p>
                      <p className="text-[10px] text-[--text-muted] truncate max-w-[130px]">{d.email}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold" style={{ color: d.color }}>+{d.size}</span>
                </motion.div>
              ))}
            </div>

            {/* Middle Node: Central 9DRIVE Vault Core Engine */}
            <div className="flex flex-col items-center justify-center my-6 md:my-0">
              <div className="relative">
                {/* Pulse Ring */}
                <div className="absolute -inset-4 rounded-full bg-[--accent-blue]/20 animate-ping" />
                <div
                  className="w-24 h-24 rounded-3xl flex flex-col items-center justify-center text-white shadow-2xl relative z-10 border"
                  style={{
                    background: "linear-gradient(135deg, #2997FF 0%, #BF5AF2 100%)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 0 50px rgba(41, 151, 255, 0.4)",
                  }}
                >
                  <HardDrive className="w-10 h-10 text-white" strokeWidth={1.5} />
                  <span className="text-[10px] font-black tracking-widest mt-1">9DRIVE</span>
                </div>
              </div>

              {/* Floating Metric Badges */}
              <div className="mt-6 space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-[--accent-green] bg-[--accent-green]/10 border border-[--accent-green]/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero-Disk Direct Stream
                </span>
                <p className="text-[11px] text-[--text-muted] font-mono">Enkripsi AES-256-GCM Level Militer</p>
              </div>
            </div>

            {/* Right Node: Unified Vault Result */}
            <div className="p-6 rounded-2xl border text-left space-y-4" style={{ background: "rgba(255, 255, 255, 0.04)", borderColor: "rgba(48, 209, 88, 0.3)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[--accent-green] uppercase tracking-wider">Hasil Penggabungan</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[--accent-green]/10 text-[--accent-green]">UNLOCKED</span>
              </div>

              <div>
                <p className="text-3xl font-extrabold text-[--text-primary] tracking-tight">45.0 GB</p>
                <p className="text-xs text-[--text-secondary] mt-0.5">Total Kapasitas Vault Bebas</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-[--text-secondary]">
                <div className="flex items-center justify-between">
                  <span>Biaya Langganan</span>
                  <span className="font-bold text-[--accent-green]">0 Rupiah / Bulan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Akses Dashboard</span>
                  <span className="font-bold text-[--text-primary]">1 Pintu Terpadu</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Privasi Data</span>
                  <span className="font-bold text-[--accent-blue]">100% Google Resmi</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── HOOK SECTION: Interactive Storage Calculator (Nike/Apple Interactive Element) ─── */}
      <section
        id="calculator"
        className="py-20 px-6 max-w-5xl mx-auto relative z-10"
      >
        <div
          className="p-8 sm:p-12 rounded-3xl relative overflow-hidden text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[--accent-volt] bg-[--accent-volt]/10 border border-[--accent-volt]/30 mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>INTERACTIVE VAULT CALCULATOR</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Berapa Akun Google Drive yang Kamu Punya?
          </h2>
          <p className="text-sm sm:text-base text-[--text-secondary] max-w-lg mx-auto mb-8">
            Setiap akun Google Drive standar memberikan 15 GB gratis. Geser
            slider di bawah untuk melihat total kapasitas vault yang bisa kamu
            gabungkan!
          </p>

          {/* Interactive Slider */}
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between text-xs font-bold text-[--text-secondary]">
              <span>1 Akun Drive</span>
              <span className="text-[--accent-blue] text-base">
                {driveCount} Akun
              </span>
              <span>10 Akun Drive</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={driveCount}
              onChange={(e) => setDriveCount(parseInt(e.target.value))}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2997FF]"
            />

            {/* Massive Storage Counter Result */}
            <motion.div
              key={totalFreeGB}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 inline-block w-full"
            >
              <div className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider mb-1">
                TOTAL VAULT CAPACITY UNLOCKED
              </div>
              <div className="text-5xl sm:text-6xl font-black text-gradient-electric tracking-tight">
                {totalFreeGB} GB
              </div>
              <div className="text-xs text-[--accent-green] font-semibold mt-2 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Gratis Selamanya · 0 Biaya Bulanan</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BEFORE VS AFTER: REAL ENAKNYA 9DRIVE ─── */}
      <section className="py-20 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest text-[--accent-purple] bg-[--accent-purple]/10 border border-[--accent-purple]/30 uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.landingComparisonBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            {t.landingComparisonTitle}
          </h2>
          <p className="text-sm sm:text-base text-[--text-secondary]">
            {t.landingComparisonSubtitle}
          </p>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* LEFT: TANPA 9DRIVE (CHAOS & RIBET) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{
              background: "rgba(255, 69, 58, 0.03)",
              border: "1px solid rgba(255, 69, 58, 0.2)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[--accent-red]/10 border border-[--accent-red]/30 text-[--accent-red] text-xs font-extrabold tracking-wider w-fit mb-6">
              <span className="w-2 h-2 rounded-full bg-[--accent-red] animate-pulse" />
              <span>{t.landingBeforeHeader}</span>
            </div>

            <div className="space-y-6">
              {[
                { title: t.landingBefore1Title, desc: t.landingBefore1Desc },
                { title: t.landingBefore2Title, desc: t.landingBefore2Desc },
                { title: t.landingBefore3Title, desc: t.landingBefore3Desc },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="w-8 h-8 rounded-xl bg-[--accent-red]/10 border border-[--accent-red]/20 flex items-center justify-center shrink-0 text-[--accent-red] font-bold">
                    ✕
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[--text-secondary] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: PAKAI 9DRIVE (REAL ENAKNYA!) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl relative overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(41, 151, 255, 0.08) 0%, rgba(48, 209, 88, 0.04) 100%)",
              border: "1px solid rgba(41, 151, 255, 0.3)",
              boxShadow: "0 25px 60px rgba(41, 151, 255, 0.15)",
            }}
          >
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[--accent-green]/15 border border-[--accent-green]/40 text-[--accent-green] text-xs font-extrabold tracking-wider w-fit mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.landingAfterHeader}</span>
            </div>

            <div className="space-y-6">
              {[
                { title: t.landingAfter1Title, desc: t.landingAfter1Desc },
                { title: t.landingAfter2Title, desc: t.landingAfter2Desc },
                { title: t.landingAfter3Title, desc: t.landingAfter3Desc },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-[--accent-green]/15 border border-[--accent-green]/30 flex items-center justify-center shrink-0 text-[--accent-green]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[--text-secondary] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mid Illustration Graphic */}
        <div className="mt-12 text-center">
          <img
            src="/before-after-comparison.png"
            alt="Before vs After Comparison"
            className="w-full max-w-2xl mx-auto rounded-3xl border border-white/10 shadow-2xl"
          />
        </div>
      </section>

      {/* ─── Bento Grid Section (Apple Asymmetric Style) ─── */}
      <section
        id="features"
        className="py-20 px-6 max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t.landingFeatureTitle}
          </h2>
          <p className="text-base text-[--text-secondary]">
            Dirancang dengan standar presisi tinggi untuk performa tanpa
            kompromi.
          </p>
        </div>

        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Featured Smart Router (Spans 2 columns) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 glass-card p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9F0A]/10 border border-[#FF9F0A]/30 flex items-center justify-center text-[#FF9F0A] mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {t.landingFeature1Title}
              </h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed max-w-md">
                {t.landingFeature1Desc} Sistem secara cerdas mendeteksi
                kapasitas sisa dari tiap drive secara real-time.
              </p>
            </div>

            {/* Visual Micro Feature Badge */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 text-xs font-semibold text-[--text-secondary]">
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[--accent-green]" />{" "}
                Real-time Quota Balancing
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <CheckCircle2 className="w-4 h-4 text-[--accent-green]" /> Zero
                Manual Selection
              </span>
            </div>
          </motion.div>

          {/* Card 2: Drag & Drop */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2997FF]/10 border border-[#2997FF]/30 flex items-center justify-center text-[#2997FF] mb-6">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.landingFeature2Title}
              </h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed">
                {t.landingFeature2Desc}
              </p>
            </div>
            <div className="mt-6 text-xs text-[--accent-blue] font-semibold flex items-center gap-1">
              <span>Streaming Direct Upload</span> →
            </div>
          </motion.div>

          {/* Card 3: Unified Dashboard */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#30D158]/10 border border-[#30D158]/30 flex items-center justify-center text-[#30D158] mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.landingFeature3Title}
              </h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed">
                {t.landingFeature3Desc}
              </p>
            </div>
            <div className="mt-6 text-xs text-[--accent-green] font-semibold flex items-center gap-1">
              <span>Unified File Explorer</span> →
            </div>
          </motion.div>

          {/* Card 4: Multi-Drive Aggregation (Spans 2 columns) */}
          <motion.div
            whileHover={{ y: -4 }}
            className="md:col-span-2 glass-card p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#BF5AF2]/10 border border-[#BF5AF2]/30 flex items-center justify-center text-[#BF5AF2] mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Multi-Tenant Drive Storage
              </h3>
              <p className="text-sm text-[--text-secondary] leading-relaxed max-w-md">
                Gabungkan akun pribadi, kerja, atau akun kuliah ke dalam satu
                penyimpanan maya tanpa batasan.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 text-xs font-mono text-[--text-muted]">
              ISOLATED USER STORAGE · PRISMA SECURED
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works (3 Step Pipeline) ─── */}
      <section
        id="how-it-works"
        className="py-20 px-6 max-w-5xl mx-auto relative z-10"
      >
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {t.landingHowTitle}
          </h2>
          <p className="text-sm sm:text-base text-[--text-secondary]">
            3 langkah mudah untuk mulai melipatgandakan ruang penyimpanan
            cloud-mu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: t.landingHow1Title,
              desc: t.landingHow1Desc,
              icon: <Key className="w-5 h-5 text-[--accent-blue]" />,
            },
            {
              num: "02",
              title: t.landingHow2Title,
              desc: t.landingHow2Desc,
              icon: <Upload className="w-5 h-5 text-[--accent-purple]" />,
            },
            {
              num: "03",
              title: t.landingHow3Title,
              desc: t.landingHow3Desc,
              icon: <HardDrive className="w-5 h-5 text-[--accent-green]" />,
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.5 }}
              className="glass-card p-8 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-white/20 font-mono">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Security Showcase (Interactive Tabs) ─── */}
      <section
        id="security"
        className="py-20 px-6 max-w-5xl mx-auto relative z-10"
      >
        <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[--accent-green] bg-[--accent-green]/10 border border-[--accent-green]/30 mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>SECURITY FIRST ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              {t.landingSecurityTitle}
            </h2>
            <p className="text-sm text-[--text-secondary] leading-relaxed">
              {t.landingSecurityDesc}
            </p>
          </div>

          {/* Interactive Security Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                id: "zero-server",
                title: t.landingSecurity3,
                desc: "Berkas dialirkan langsung dari browsermu ke API Google Drive. Server kami 0% menyimpan berkasmu.",
                icon: <Server className="w-5 h-5 text-[--accent-green]" />,
              },
              {
                id: "oauth",
                title: t.landingSecurity2,
                desc: "Otorisasi resmi Google OAuth 2.0. Kami tidak pernah meminta atau menyimpan kata sandi akun Google milikmu.",
                icon: <Lock className="w-5 h-5 text-[--accent-blue]" />,
              },
              {
                id: "encryption",
                title: t.landingSecurity1,
                desc: "Token akses dan sesi pengguna dienkripsi secara ketat di database dengan enkripsi AES-256-GCM.",
                icon: <Shield className="w-5 h-5 text-[--accent-purple]" />,
              },
            ].map((sec) => (
              <div
                key={sec.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  {sec.icon}
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  {sec.title}
                </h4>
                <p className="text-xs text-[--text-secondary] leading-relaxed">
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion ─── */}
      <section id="faq" className="py-20 px-6 max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {t.landingFaqTitle}
          </h2>
          <p className="text-sm text-[--text-secondary]">
            Pertanyaan yang sering ditanyakan mengenai keandalan dan penggunaan
            9DRIVE.
          </p>
        </div>

        <div className="space-y-4">
          <FaqItem q={t.landingFaq1Q} a={t.landingFaq1A} />
          <FaqItem q={t.landingFaq2Q} a={t.landingFaq2A} />
          <FaqItem q={t.landingFaq3Q} a={t.landingFaq3A} />
          <FaqItem q={t.landingFaq4Q} a={t.landingFaq4A} />
        </div>
      </section>

      {/* ─── High Energy Nike Style Call to Action ─── */}
      <section className="py-20 px-6 max-w-5xl mx-auto relative z-10 text-center">
        <div
          className="p-10 sm:p-16 rounded-3xl relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(41, 151, 255, 0.15) 0%, rgba(191, 90, 242, 0.15) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 uppercase">
              {t.landingCtaTitle}
            </h2>
            <p className="text-base text-[--text-secondary] max-w-md mx-auto mb-8 font-medium">
              {t.landingCtaSubtitle}
            </p>
            <button
              onClick={() => navigate("/app")}
              className="btn-nike-bold px-10 py-5 text-base cursor-pointer shadow-2xl inline-flex items-center gap-3"
            >
              <span>{t.landingHeroCta}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 text-center text-xs text-[--text-muted] border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[--accent-blue] flex items-center justify-center text-white font-bold text-[10px]">
              9
            </div>
            <span className="font-semibold text-[--text-secondary]">
              9DRIVE VAULT
            </span>
          </div>
          <div>{t.landingFooter}</div>
        </div>
      </footer>
    </div>
  );
}
