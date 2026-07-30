import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
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

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/health`)
      .then(r => r.ok && setGatewayOnline(true))
      .catch(() => setGatewayOnline(false));
  }, []);

  const totalGB = accounts.reduce((s, a) => s + a.totalStorageGB, 0);
  const usedGB  = accounts.reduce((s, a) => s + a.usedStorageGB, 0);
  const freeGB  = totalGB - usedGB;

  return (
    <header
      className="h-14 shrink-0 flex items-center px-4 sm:px-5 gap-3 z-20 relative border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        borderColor: 'rgba(255, 255, 255, 0.06)',
      }}
    >

      {/* Mobile Menu */}
      <button
        onClick={onToggleMobileSidebar}
        className="p-2 rounded-lg text-[--text-secondary] hover:text-[--text-primary] hover:bg-white/5 transition-colors md:hidden cursor-pointer"
        title="Toggle Menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Gateway Status */}
      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: gatewayOnline ? 'var(--accent-green)' : 'var(--text-muted)',
            boxShadow: gatewayOnline ? '0 0 6px rgba(48, 209, 88, 0.4)' : 'none',
          }}
        />
        <span className="text-[11px] font-medium text-[--text-secondary] hidden sm:inline">
          {gatewayOnline ? t.gatewayActive : 'OFFLINE'}
        </span>
      </div>

      {/* Quota Strip */}
      {accounts.length > 0 && (
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[--text-secondary]">
          <span className="text-[--text-primary] font-semibold">{freeGB.toFixed(1)} GB</span>
          <span>{t.freeOf}</span>
          <span className="text-[--text-primary] font-medium">{totalGB.toFixed(1)} GB</span>
          <span className="text-[--text-muted]">· {accounts.length} {t.drives}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-[10px] text-xs text-[--text-primary] placeholder-[--text-muted] outline-none transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.4)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          />
        </div>
      </div>

      {/* Language Toggle — Apple Segmented Control */}
      <button
        onClick={onToggleLang}
        title="Switch Language / Ganti Bahasa"
        className="relative flex items-center h-7 rounded-lg overflow-hidden cursor-pointer shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <AnimatePresence>
          <motion.div
            key={lang}
            layoutId="lang-indicator"
            className="absolute top-0.5 bottom-0.5 rounded-md"
            style={{
              width: '50%',
              left: lang === 'id' ? '2px' : 'calc(50% - 2px)',
              background: 'rgba(255, 255, 255, 0.12)',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </AnimatePresence>
        <span
          className="relative z-10 px-2.5 text-[11px] font-semibold transition-colors"
          style={{ color: lang === 'id' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          ID
        </span>
        <span
          className="relative z-10 px-2.5 text-[11px] font-semibold transition-colors"
          style={{ color: lang === 'en' ? 'var(--text-primary)' : 'var(--text-muted)' }}
        >
          EN
        </span>
      </button>

      {/* User Profile & Logout */}
      {currentUser && (
        <div className="flex items-center gap-2">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-[--text-primary]"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <UserIcon className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span className="font-medium max-w-[100px] truncate">{currentUser.fullName || currentUser.email.split('@')[0]}</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={lang === 'id' ? 'Keluar' : 'Sign Out'}
              className="p-1.5 rounded-lg text-[--text-muted] hover:text-[--accent-red] hover:bg-[rgba(255,69,58,0.08)] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Connect Drive Button */}
      <motion.button
        onClick={onConnectClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-1.5 px-4 py-2 rounded-[--radius-button] text-xs font-semibold text-white cursor-pointer"
        style={{ background: 'var(--accent-blue)' }}
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t.addDrive}</span>
      </motion.button>
    </header>
  );
}
