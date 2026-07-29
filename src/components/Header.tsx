import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wifi, WifiOff, Zap, Search, Bell, Menu, LogOut, User as UserIcon } from 'lucide-react';
import type { DriveAccount, RoutingStrategy } from '../types';

import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface HeaderProps {
  accounts: DriveAccount[];
  routingStrategy: RoutingStrategy;
  onRoutingChange: (s: RoutingStrategy) => void;
  onConnectClick: () => void;
  onSearchChange?: (q: string) => void;
  searchQuery?: string;
  lang: Language;
  onToggleLang: () => void;
  onToggleMobileSidebar?: () => void;
  currentUser?: { id: string; email: string; fullName?: string } | null;
  onLogout?: () => void;
}

import { BACKEND_BASE_URL } from '../services/api';

export function Header({
  accounts, onConnectClick, onSearchChange, searchQuery = '', lang, onToggleLang, onToggleMobileSidebar, currentUser, onLogout,
}: HeaderProps) {
  const t = translations[lang];
  const [gatewayOnline, setGatewayOnline] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/health`)
      .then(r => r.ok && setGatewayOnline(true))
      .catch(() => setGatewayOnline(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalGB = accounts.reduce((s, a) => s + a.totalStorageGB, 0);
  const usedGB  = accounts.reduce((s, a) => s + a.usedStorageGB, 0);
  const freeGB  = totalGB - usedGB;

  return (
    <header className="h-14 shrink-0 glass-surface border-b border-slate-800/60 flex items-center px-4 sm:px-5 gap-2 sm:gap-4 z-20 relative">

      {/* Mobile Hamburger Menu Toggle */}
      <button
        onClick={onToggleMobileSidebar}
        className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 md:hidden cursor-pointer"
        title="Toggle Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Gateway Status Pill */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider border ${
          gatewayOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${gatewayOnline ? 'bg-emerald-400 status-blink' : 'bg-slate-600'}`} />
        {gatewayOnline ? t.gatewayActive : 'GATEWAY OFFLINE'}
      </motion.div>

      {/* Live Quota Strip (only when accounts connected) */}
      {accounts.length > 0 && (
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500">
          <Zap className="w-3 h-3 text-cyan-500" />
          <span className="text-slate-400 font-medium">{freeGB.toFixed(1)} GB</span>
          <span>{t.freeOf}</span>
          <span className="text-slate-300 font-medium">{totalGB.toFixed(1)} GB</span>
          <span>{t.across} {accounts.length} {t.drives}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-500/40 focus:bg-slate-800/70 transition-all duration-200"
          />
        </div>
      </div>

      {/* Clock */}
      <div className="text-[11px] text-slate-600 font-mono tabular-nums hidden lg:block">
        {currentTime.toLocaleTimeString('en-US', { hour12: false })}
      </div>

      {/* Language Toggle Pill */}
      <button
        onClick={onToggleLang}
        title="Switch Language / Ganti Bahasa"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-cyan-500/40 text-xs font-mono font-bold text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
      >
        <span className={lang === 'id' ? 'text-cyan-400 font-extrabold' : 'text-slate-500'}>ID</span>
        <span className="text-slate-600">|</span>
        <span className={lang === 'en' ? 'text-cyan-400 font-extrabold' : 'text-slate-500'}>EN</span>
      </button>

      {/* User Profile & Logout */}
      {currentUser && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200">
            <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium max-w-[100px] truncate">{currentUser.fullName || currentUser.email.split('@')[0]}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={lang === 'id' ? 'Keluar / Logout' : 'Sign Out'}
              className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Connect Button */}
      <motion.button
        onClick={onConnectClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.addDrive}</span>
      </motion.button>
    </header>
  );
}
