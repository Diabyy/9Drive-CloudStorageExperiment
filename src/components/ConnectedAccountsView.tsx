import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, RefreshCw, Unlink, Crown } from 'lucide-react';
import type { DriveAccount } from '../types';

interface ConnectedAccountsViewProps {
  accounts: DriveAccount[];
  onDisconnect?: (id: string) => void;
  onSync?: (id: string) => void;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
};

const DRIVE_COLORS = ['#2997FF', '#BF5AF2', '#30D158', '#FF453A', '#FF9F0A'];

function StorageRing({ usedPct, strokeColor }: { usedPct: number; strokeColor: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (usedPct / 100) * circ;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={radius} fill="none"
        stroke={strokeColor} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ filter: `drop-shadow(0 0 4px ${strokeColor}60)` }}
      />
    </svg>
  );
}

export function ConnectedAccountsView({ accounts, onDisconnect, onSync }: ConnectedAccountsViewProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <HardDrive className="w-7 h-7 text-[--text-muted]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[--text-primary] font-semibold text-sm">Belum Ada Drive Terhubung</p>
          <p className="text-[--text-secondary] text-xs mt-1">Tambahkan akun Google Drive untuk mulai menggunakan Vault</p>
        </div>
      </div>
    );
  }

  const totalGB = accounts.reduce((s, a) => s + a.totalStorageGB, 0);
  const usedGB  = accounts.reduce((s, a) => s + a.usedStorageGB, 0);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Aggregate Storage Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[--text-muted] tracking-wider uppercase">KAPASITAS TOTAL VAULT</p>
            <p className="text-3xl font-extrabold text-[--accent-blue] mt-1 tracking-tight">{totalGB.toFixed(1)} GB</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[--text-secondary]">{usedGB.toFixed(2)} GB terpakai</p>
            <p className="text-xs text-[--accent-green] font-semibold">{(totalGB - usedGB).toFixed(1)} GB bebas</p>
          </div>
        </div>

        {/* Multi-account Storage Bar */}
        <div className="h-2 rounded-full bg-white/5 flex overflow-hidden gap-px">
          {accounts.map((acc, i) => {
            const pct = totalGB > 0 ? (acc.usedStorageGB / totalGB) * 100 : 0;
            const color = DRIVE_COLORS[i % DRIVE_COLORS.length];
            return <div key={acc.id} className="h-full rounded-sm" style={{ width: `${Math.max(pct, 0.5)}%`, background: color }} />;
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4">
          {accounts.map((acc, i) => {
            const color = DRIVE_COLORS[i % DRIVE_COLORS.length];
            return (
              <div key={acc.id} className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[--text-secondary] truncate max-w-[120px]">{acc.email.split('@')[0]}</span>
                <span className="font-semibold" style={{ color }}>{acc.usedStorageGB.toFixed(1)} GB</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Individual Drive Cards Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc, idx) => {
          const driveColor = DRIVE_COLORS[idx % DRIVE_COLORS.length];
          const usedPct = acc.totalStorageGB > 0 ? (acc.usedStorageGB / acc.totalStorageGB) * 100 : 0;
          const freeGB = acc.totalStorageGB - acc.usedStorageGB;

          return (
            <motion.div
              key={acc.id}
              variants={item}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="rounded-2xl p-5 cursor-default transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: driveColor }}
                  >
                    {acc.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[--text-primary] truncate max-w-[140px]">{acc.name}</p>
                      {acc.isPrimary && <Crown className="w-3.5 h-3.5 text-[--accent-orange]" />}
                    </div>
                    <p className="text-[11px] text-[--text-muted] truncate max-w-[150px]">{acc.email}</p>
                  </div>
                </div>

                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: acc.status === 'connected' ? 'rgba(48, 209, 88, 0.10)' : 'rgba(255, 255, 255, 0.05)',
                    color: acc.status === 'connected' ? 'var(--accent-green)' : 'var(--text-muted)',
                    border: acc.status === 'connected' ? '1px solid rgba(48, 209, 88, 0.20)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {acc.status}
                </span>
              </div>

              {/* Ring & Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <StorageRing usedPct={usedPct} strokeColor={driveColor} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-[--text-primary] leading-none">{usedPct.toFixed(0)}%</p>
                    <p className="text-[9px] text-[--text-muted] mt-0.5">terpakai</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 text-[--text-secondary]">
                      <span>Terpakai</span>
                      <span className="text-[--text-primary] font-semibold">{acc.usedStorageGB.toFixed(2)} GB</span>
                    </div>
                    <div className="progress-track h-1.5">
                      <div className="progress-fill h-full" style={{ width: `${usedPct}%`, background: driveColor }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[--text-muted]">Sisa Bebas</span>
                    <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>{freeGB.toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[--text-muted]">Kapasitas Total</span>
                    <span className="text-[--text-secondary] font-semibold">{acc.totalStorageGB.toFixed(1)} GB</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={() => onSync?.(acc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent-blue)';
                    e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} /> Sync
                </button>

                <button
                  onClick={() => onDisconnect?.(acc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent-red)';
                    e.currentTarget.style.borderColor = 'rgba(255, 69, 58, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <Unlink className="w-3.5 h-3.5" strokeWidth={1.5} /> Putuskan
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
