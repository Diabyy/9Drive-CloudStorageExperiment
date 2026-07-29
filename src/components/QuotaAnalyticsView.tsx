import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, TrendingUp, Database, FileText, Video, Image as ImageIcon, Archive, Code, Zap } from 'lucide-react';
import type { DriveAccount, VaultFile } from '../types';

interface Props {
  accounts: DriveAccount[];
  files: VaultFile[];
  onCleanDuplicates?: () => void;
}

const ACCENT_COLORS = ['#06B6D4', '#6366F1', '#10B981', '#F43F5E', '#F59E0B'];
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  documents: { icon: FileText,  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  images:    { icon: ImageIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  videos:    { icon: Video,     color: 'text-rose-400',   bg: 'bg-rose-500/10' },
  archives:  { icon: Archive,   color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  code:      { icon: Code,      color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const fmt = (bytes: number) => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
};

const card = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 340, damping: 28 } },
};

export function QuotaAnalyticsView({ accounts, files }: Props) {
  const totalCapacity = accounts.reduce((s, a) => s + a.totalStorageGB, 0);
  const totalUsed     = accounts.reduce((s, a) => s + a.usedStorageGB, 0);
  const totalFree     = Math.max(0, totalCapacity - totalUsed);
  const usagePct      = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

  const catUsage = files.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + f.sizeBytes;
    return acc;
  }, {} as Record<string, number>);

  const statCards = [
    { label: 'Total Capacity',  value: `${totalCapacity.toFixed(1)} GB`, sub: `${accounts.length} drives`, icon: HardDrive, color: 'text-cyan-400',    bg: 'bg-cyan-500/10' },
    { label: 'Used Storage',    value: `${totalUsed.toFixed(2)} GB`,     sub: `${usagePct.toFixed(1)}% used`, icon: Database,   color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
    { label: 'Free Space',      value: `${totalFree.toFixed(1)} GB`,     sub: 'Available now', icon: Zap,       color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Vault Files',     value: files.length.toString(),          sub: 'Total indexed', icon: TrendingUp, color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Stat Cards Row */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            variants={card}
            whileHover={{ y: -3, borderColor: 'rgba(6,182,212,0.4)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="glass-surface rounded-2xl p-5 border border-slate-700/40"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-extrabold leading-none ${color}`}>{value}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
            <p className="text-[11px] text-slate-600 mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main analytics Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-account breakdown */}
        <motion.div variants={card} initial="hidden" animate="show" className="glass-surface rounded-2xl p-5 border border-slate-700/40">
          <p className="heading-kinetic text-[11px] text-slate-500 tracking-widest mb-4">PER DRIVE ALLOCATION</p>
          <div className="space-y-4">
            {accounts.map((acc, idx) => {
              const pct = acc.totalStorageGB > 0 ? (acc.usedStorageGB / acc.totalStorageGB) * 100 : 0;
              const color = ACCENT_COLORS[idx % ACCENT_COLORS.length];
              return (
                <div key={acc.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-slate-300 font-medium truncate max-w-[150px]">{acc.email}</span>
                    </div>
                    <div className="text-slate-500 shrink-0">
                      {acc.usedStorageGB.toFixed(2)} / {acc.totalStorageGB.toFixed(1)} GB
                    </div>
                  </div>
                  <div className="progress-track h-2">
                    <motion.div
                      className="progress-fill h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                      style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{pct.toFixed(1)}% used</p>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">No drives connected</p>
            )}
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={card} initial="hidden" animate="show" className="glass-surface rounded-2xl p-5 border border-slate-700/40">
          <p className="heading-kinetic text-[11px] text-slate-500 tracking-widest mb-4">FILE TYPE BREAKDOWN</p>
          <div className="space-y-3">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const bytes = catUsage[cat] || 0;
              const Icon = meta.icon;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 capitalize">{cat}</span>
                      <span className="text-slate-500 shrink-0">{fmt(bytes)}</span>
                    </div>
                    <div className="progress-track h-1">
                      <motion.div
                        className={`progress-fill h-full ${meta.bg.replace('/10', '/60').replace('bg-', 'bg-')}`}
                        style={{ background: undefined }}
                        initial={{ width: 0 }}
                        animate={{ width: `${files.length > 0 ? Math.min((bytes / (files.reduce((s, f) => s + f.sizeBytes, 1))) * 100, 100) : 0}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      >
                        <div className={`h-full w-full ${meta.bg}`} />
                      </motion.div>
                    </div>
                  </div>
                </div>
              );
            })}
            {files.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">No files uploaded yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Aggregate bar */}
      <motion.div
        variants={card} initial="hidden" animate="show"
        className="glass-surface rounded-2xl p-5 border border-slate-700/40"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="heading-kinetic text-[11px] text-slate-500 tracking-widest">COMBINED VAULT USAGE</p>
          <p className="text-xs text-slate-400">{usagePct.toFixed(2)}%</p>
        </div>
        <div className="progress-track h-3 rounded-full overflow-hidden flex gap-px">
          {accounts.map((acc, idx) => {
            const pct = totalCapacity > 0 ? (acc.usedStorageGB / totalCapacity) * 100 : 0;
            return (
              <motion.div
                key={acc.id}
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 0.3)}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                style={{ background: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-600 mt-2">
          <span>{totalUsed.toFixed(2)} GB used</span>
          <span>{totalFree.toFixed(1)} GB free</span>
          <span>{totalCapacity.toFixed(1)} GB total</span>
        </div>
      </motion.div>
    </div>
  );
}
