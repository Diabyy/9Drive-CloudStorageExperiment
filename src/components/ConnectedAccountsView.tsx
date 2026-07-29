import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, TrendingUp, Zap, RefreshCw, Unlink, Crown } from 'lucide-react';
import type { DriveAccount } from '../types';

interface ConnectedAccountsViewProps {
  accounts: DriveAccount[];
  onDisconnect?: (id: string) => void;
  onSync?: (id: string) => void;
}

const ACCOUNT_COLORS: Record<string, { gradient: string; glow: string; ring: string }> = {
  cyan:    { gradient: 'from-cyan-500 to-blue-600',    glow: 'rgba(6,182,212,0.25)',   ring: 'ring-cyan-500/30' },
  purple:  { gradient: 'from-indigo-500 to-purple-600', glow: 'rgba(99,102,241,0.25)', ring: 'ring-indigo-500/30' },
  emerald: { gradient: 'from-emerald-400 to-teal-600', glow: 'rgba(16,185,129,0.25)',  ring: 'ring-emerald-500/30' },
  rose:    { gradient: 'from-rose-500 to-pink-600',    glow: 'rgba(244,63,94,0.25)',   ring: 'ring-rose-500/30' },
  amber:   { gradient: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.25)',  ring: 'ring-amber-500/30' },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
};

function StorageRing({ usedPct, color }: { usedPct: number; color: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = (usedPct / 100) * circ;
  const colorMap: Record<string, string> = {
    cyan: '#06B6D4', purple: '#6366F1', emerald: '#10B981', rose: '#F43F5E', amber: '#F59E0B',
  };
  const stroke = colorMap[color] || '#06B6D4';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(51,65,85,0.5)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={radius} fill="none"
        stroke={stroke} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ filter: `drop-shadow(0 0 4px ${stroke}80)` }}
      />
    </svg>
  );
}

export function ConnectedAccountsView({ accounts, onDisconnect, onSync }: ConnectedAccountsViewProps) {
  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
          <HardDrive className="w-7 h-7 text-slate-600" />
        </div>
        <div>
          <p className="text-slate-300 font-semibold">No drives connected</p>
          <p className="text-slate-600 text-sm mt-1">Add a Google Drive account to get started</p>
        </div>
      </div>
    );
  }

  const totalGB = accounts.reduce((s, a) => s + a.totalStorageGB, 0);
  const usedGB  = accounts.reduce((s, a) => s + a.usedStorageGB, 0);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Aggregate Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface rounded-2xl p-5 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="heading-kinetic text-xs text-slate-400 tracking-widest">TOTAL VAULT CAPACITY</p>
            <p className="text-2xl font-extrabold glow-text mt-1">{totalGB.toFixed(1)} GB</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">{usedGB.toFixed(2)} GB used</p>
            <p className="text-xs text-emerald-400 font-semibold">{(totalGB - usedGB).toFixed(1)} GB free</p>
          </div>
        </div>

        {/* Segmented multi-account bar */}
        <div className="h-2 rounded-full bg-slate-800/80 flex overflow-hidden gap-px">
          {accounts.map((acc, i) => {
            const pct = totalGB > 0 ? (acc.usedStorageGB / totalGB) * 100 : 0;
            const colors = ['bg-cyan-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
            return <div key={acc.id} className={`${colors[i % colors.length]} h-full rounded-sm`} style={{ width: `${Math.max(pct, 0.5)}%` }} />;
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          {accounts.map((acc, i) => {
            const colors = ['text-cyan-400', 'text-indigo-400', 'text-emerald-400', 'text-rose-400', 'text-amber-400'];
            const dots = ['bg-cyan-400', 'bg-indigo-400', 'bg-emerald-400', 'bg-rose-400', 'bg-amber-400'];
            return (
              <div key={acc.id} className="flex items-center gap-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-sm ${dots[i % dots.length]}`} />
                <span className="text-slate-500 truncate max-w-[100px]">{acc.email.split('@')[0]}</span>
                <span className={`${colors[i % colors.length]} font-semibold`}>{acc.usedStorageGB.toFixed(1)}GB</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Individual Account Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc, idx) => {
          const accent = acc.accentColor || 'cyan';
          const theme = ACCOUNT_COLORS[accent] || ACCOUNT_COLORS.cyan;
          const usedPct = acc.totalStorageGB > 0 ? (acc.usedStorageGB / acc.totalStorageGB) * 100 : 0;
          const freeGB = acc.totalStorageGB - acc.usedStorageGB;

          return (
            <motion.div
              key={acc.id}
              variants={item}
              whileHover={{ y: -4, borderColor: 'rgba(6,182,212,0.4)' }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="glass-surface rounded-2xl p-5 border border-slate-700/40 group cursor-default"
            >
              {/* Account Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                    style={{ boxShadow: `0 4px 14px ${theme.glow}` }}>
                    {acc.email[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-slate-100 truncate max-w-[120px]">{acc.name}</p>
                      {acc.isPrimary && <Crown className="w-3 h-3 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[130px]">{acc.email}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wider uppercase ${
                  acc.status === 'connected' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-slate-700/50 border-slate-600/50 text-slate-400'
                }`}>
                  {acc.status}
                </span>
              </div>

              {/* Storage Ring + Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <StorageRing usedPct={usedPct} color={accent} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-slate-100 leading-none">{usedPct.toFixed(0)}%</p>
                    <p className="text-[9px] text-slate-500">used</p>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Used</span>
                      <span className="text-slate-300 font-semibold">{acc.usedStorageGB.toFixed(2)} GB</span>
                    </div>
                    <div className="progress-track h-1.5">
                      <div className={`progress-fill h-full bg-gradient-to-r ${theme.gradient}`} style={{ width: `${usedPct}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Free</span>
                    <span className="text-emerald-400 font-semibold">{freeGB.toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Total</span>
                    <span className="text-slate-300 font-semibold">{acc.totalStorageGB.toFixed(1)} GB</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-700/40">
                <button
                  onClick={() => onSync?.(acc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-150 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Sync
                </button>
                <button
                  onClick={() => onDisconnect?.(acc.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700/50 hover:border-rose-500/30 transition-all duration-150 cursor-pointer"
                >
                  <Unlink className="w-3 h-3" /> Disconnect
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
