import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive, LayoutGrid, Clock, Share2, BarChart2, Settings,
  Plus, Wifi, ChevronRight, Upload, Files, Star, HelpCircle,
} from 'lucide-react';
import type { NavView, RoutingStrategy } from '../types';

import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface SidebarProps {
  activeView: NavView;
  onViewChange: (view: NavView) => void;
  routingStrategy: RoutingStrategy;
  onRoutingChange: (strategy: RoutingStrategy) => void;
  totalAccounts: number;
  totalFiles: number;
  onConnectClick: () => void;
  lang: Language;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeView, onViewChange, routingStrategy, onRoutingChange,
  totalAccounts, totalFiles, onConnectClick, lang,
  isMobileOpen = false, onCloseMobile,
}: SidebarProps) {
  const t = translations[lang];

  const navItems: { view: NavView; icon: React.ReactNode; label: string }[] = [
    { view: 'all-files',  icon: <Files className="w-4 h-4" />,    label: t.allFiles },
    { view: 'recent',     icon: <Clock className="w-4 h-4" />,     label: t.recent },
    { view: 'shared',     icon: <Share2 className="w-4 h-4" />,    label: t.shared },
    { view: 'analytics',  icon: <BarChart2 className="w-4 h-4" />, label: t.analytics },
    { view: 'accounts',   icon: <HardDrive className="w-4 h-4" />, label: t.accounts },
    { view: 'guide',      icon: <HelpCircle className="w-4 h-4" />, label: t.userGuide },
    { view: 'settings',   icon: <Settings className="w-4 h-4" />,  label: t.settings },
  ];

  const routingOptions: { value: RoutingStrategy; label: string; icon: string; desc: string }[] = [
    { value: 'max-free-space',  icon: '⚡', label: t.mostFree,    desc: t.mostFreeDesc },
    { value: 'balanced',        icon: '🔄', label: t.roundRobin,  desc: t.roundRobinDesc },
    { value: 'priority-first',  icon: '🎯', label: t.priority,    desc: t.priorityDesc },
  ];

  const handleItemClick = (v: NavView) => {
    onViewChange(v);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside className={`w-60 shrink-0 h-full flex flex-col glass-surface border-r border-slate-800/60 z-50 fixed md:static top-0 left-0 transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="heading-kinetic text-xs text-slate-50 leading-none tracking-widest">9DRIVE</p>
            <p className="text-[10px] text-slate-500 tracking-widest mt-0.5">VAULT SYSTEM</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent mx-4" />

      {/* Stats Row */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2">
        {[
          { label: 'Drives', value: totalAccounts },
          { label: 'Files', value: totalFiles },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-slate-800/40 border border-slate-700/40 px-3 py-2 text-center">
            <p className="text-base font-bold text-slate-100 leading-none">{value}</p>
            <p className="text-[10px] text-slate-500 tracking-widest mt-0.5 uppercase">{label}</p>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav className="px-3 py-1 flex-1">
        <p className="text-[10px] text-slate-600 tracking-widest uppercase px-2 mb-2 mt-1">Navigation</p>
        {navItems.map(({ view, icon, label }) => {
          const isActive = activeView === view;
          return (
            <motion.button
              key={view}
              onClick={() => handleItemClick(view)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all duration-150 cursor-pointer group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}>{icon}</span>
              <span>{label}</span>
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent mx-4" />

      {/* Routing Engine */}
      <div className="px-4 py-3">
        <p className="text-[10px] text-slate-600 tracking-widest uppercase mb-2">{t.uploadRouting}</p>
        <div className="space-y-1">
          {routingOptions.map(({ value, icon, label }) => (
            <button
              key={value}
              onClick={() => onRoutingChange(value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                routingStrategy === value
                  ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-sm">{icon}</span>
              <span className="font-medium">{label}</span>
              {routingStrategy === value && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Connect Button */}
      <div className="px-4 pb-5">
        <motion.button
          onClick={onConnectClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.connectDriveBtn}
        </motion.button>
      </div>
    </aside>
    </>
  );
}
