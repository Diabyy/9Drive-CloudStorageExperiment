import React from 'react';
import { motion } from 'framer-motion';
import {
  HardDrive, Clock, Share2, BarChart2, Settings,
  Plus, Files, HelpCircle,
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
    { view: 'all-files',  icon: <Files className="w-[18px] h-[18px]" strokeWidth={1.5} />,      label: t.allFiles },
    { view: 'recent',     icon: <Clock className="w-[18px] h-[18px]" strokeWidth={1.5} />,       label: t.recent },
    { view: 'shared',     icon: <Share2 className="w-[18px] h-[18px]" strokeWidth={1.5} />,      label: t.shared },
    { view: 'analytics',  icon: <BarChart2 className="w-[18px] h-[18px]" strokeWidth={1.5} />,   label: t.analytics },
    { view: 'accounts',   icon: <HardDrive className="w-[18px] h-[18px]" strokeWidth={1.5} />,   label: t.accounts },
    { view: 'guide',      icon: <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />,  label: t.userGuide },
    { view: 'settings',   icon: <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />,    label: t.settings },
  ];

  const routingOptions: { value: RoutingStrategy; label: string; desc: string }[] = [
    { value: 'max-free-space',  label: t.mostFree,    desc: t.mostFreeDesc },
    { value: 'balanced',        label: t.roundRobin,  desc: t.roundRobinDesc },
    { value: 'priority-first',  label: t.priority,    desc: t.priorityDesc },
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
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
        />
      )}

      <aside
        className={`w-60 shrink-0 h-full flex flex-col z-50 fixed md:static top-0 left-0 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-blue)' }}
            >
              <HardDrive className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[--text-primary] tracking-tight">9DRIVE</p>
              <p className="text-[10px] text-[--text-muted] tracking-wide mt-0.5">{t.vaultSystem}</p>
            </div>
          </div>
        </div>

        <div className="h-px mx-4" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Stats */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2">
          {[
            { label: 'Drives', value: totalAccounts },
            { label: 'Files', value: totalFiles },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <p className="text-base font-semibold text-[--text-primary] leading-none">{value}</p>
              <p className="text-[10px] text-[--text-muted] tracking-wide mt-1 uppercase">{label}</p>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-1 flex-1">
          <p className="text-[10px] text-[--text-muted] tracking-wider uppercase px-2 mb-2 mt-1 font-medium">
            Navigation
          </p>
          {navItems.map(({ view, icon, label }) => {
            const isActive = activeView === view;
            return (
              <motion.button
                key={view}
                onClick={() => handleItemClick(view)}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-[13px] font-medium transition-all duration-150 cursor-pointer relative"
                style={{
                  background: isActive ? 'rgba(41, 151, 255, 0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                  {icon}
                </span>
                <span>{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-active-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--accent-blue)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="h-px mx-4" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />

        {/* Routing Engine */}
        <div className="px-4 py-3">
          <p className="text-[10px] text-[--text-muted] tracking-wider uppercase mb-2 font-medium">
            {t.uploadRouting}
          </p>
          <div className="space-y-1">
            {routingOptions.map(({ value, label }) => {
              const isSelected = routingStrategy === value;
              return (
                <button
                  key={value}
                  onClick={() => onRoutingChange(value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(41, 151, 255, 0.10)' : 'transparent',
                    border: isSelected ? '1px solid rgba(41, 151, 255, 0.20)' : '1px solid transparent',
                    color: isSelected ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  }}
                >
                  <span className="font-medium">{label}</span>
                  {isSelected && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--accent-blue)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Connect Drive Button */}
        <div className="px-4 pb-5">
          <motion.button
            onClick={onConnectClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
            style={{ background: 'var(--accent-blue)' }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            {t.connectDriveBtn}
          </motion.button>
        </div>
      </aside>
    </>
  );
}
