import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, TrendingUp, Database, FileText, Video, Image as ImageIcon, Archive, Code, Zap } from 'lucide-react';
import type { DriveAccount, VaultFile } from '../types';

interface Props {
  accounts: DriveAccount[];
  files: VaultFile[];
  onCleanDuplicates?: () => void;
}

const DRIVE_COLORS = ['#2997FF', '#BF5AF2', '#30D158', '#FF453A', '#FF9F0A'];

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  documents: { icon: FileText,  color: 'var(--accent-blue)', bg: 'rgba(41, 151, 255, 0.12)' },
  images:    { icon: ImageIcon, color: 'var(--accent-purple)', bg: 'rgba(191, 90, 242, 0.12)' },
  videos:    { icon: Video,     color: 'var(--accent-red)',    bg: 'rgba(255, 69, 58, 0.12)' },
  archives:  { icon: Archive,   color: 'var(--accent-orange)', bg: 'rgba(255, 159, 10, 0.12)' },
  code:      { icon: Code,      color: 'var(--accent-green)',  bg: 'rgba(48, 209, 88, 0.12)' },
};

const fmt = (bytes: number) => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
};

const card = {
  hidden: { opacity: 0, y: 16 },
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
    { label: 'Kapasitas Total',  value: `${totalCapacity.toFixed(1)} GB`, sub: `${accounts.length} drive terhubung`, icon: HardDrive, color: 'var(--accent-blue)', bg: 'rgba(41, 151, 255, 0.10)' },
    { label: 'Penyimpanan Terpakai', value: `${totalUsed.toFixed(2)} GB`, sub: `${usagePct.toFixed(1)}% terpakai`, icon: Database, color: 'var(--accent-purple)', bg: 'rgba(191, 90, 242, 0.10)' },
    { label: 'Ruang Bebas', value: `${totalFree.toFixed(1)} GB`, sub: 'Tersedia sekarang', icon: Zap, color: 'var(--accent-green)', bg: 'rgba(48, 209, 88, 0.10)' },
    { label: 'Total Berkas Vault', value: files.length.toString(), sub: 'Terindeks di sistem', icon: TrendingUp, color: 'var(--accent-orange)', bg: 'rgba(255, 159, 10, 0.10)' },
  ];

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      {/* Stat Cards Grid */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            variants={card}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg, color }}>
              <Icon className="w-4.5 h-4.5" strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-extrabold leading-none tracking-tight" style={{ color }}>{value}</p>
            <p className="text-xs text-[--text-primary] mt-1 font-semibold">{label}</p>
            <p className="text-[11px] text-[--text-muted] mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Analytics Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-account allocation */}
        <motion.div
          variants={card} initial="hidden" animate="show"
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <p className="text-[11px] font-semibold text-[--text-muted] tracking-wider uppercase mb-4">ALOKASI TIAP GOOGLE DRIVE</p>
          <div className="space-y-4">
            {accounts.map((acc, idx) => {
              const pct = acc.totalStorageGB > 0 ? (acc.usedStorageGB / acc.totalStorageGB) * 100 : 0;
              const color = DRIVE_COLORS[idx % DRIVE_COLORS.length];
              return (
                <div key={acc.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <span className="text-[--text-primary] font-medium truncate max-w-[160px]">{acc.email}</span>
                    </div>
                    <div className="text-[--text-muted] shrink-0">
                      {acc.usedStorageGB.toFixed(2)} / {acc.totalStorageGB.toFixed(1)} GB
                    </div>
                  </div>
                  <div className="progress-track h-2">
                    <motion.div
                      className="progress-fill h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                      style={{ background: color }}
                    />
                  </div>
                  <p className="text-[11px] text-[--text-muted] mt-1">{pct.toFixed(1)}% terpakai</p>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <p className="text-xs text-[--text-muted] text-center py-4">Belum ada drive terhubung</p>
            )}
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          variants={card} initial="hidden" animate="show"
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <p className="text-[11px] font-semibold text-[--text-muted] tracking-wider uppercase mb-4">DISTRIBUSI TIPE BERKAS</p>
          <div className="space-y-3.5">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const bytes = catUsage[cat] || 0;
              const Icon = meta.icon;
              const totalBytes = files.reduce((s, f) => s + f.sizeBytes, 1);
              const catPct = files.length > 0 ? Math.min((bytes / totalBytes) * 100, 100) : 0;

              return (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg, color: meta.color }}>
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[--text-primary] capitalize font-medium">{cat}</span>
                      <span className="text-[--text-muted] shrink-0">{fmt(bytes)}</span>
                    </div>
                    <div className="progress-track h-1.5">
                      <motion.div
                        className="progress-fill h-full rounded-full"
                        style={{ background: meta.color, width: `${catPct}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${catPct}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {files.length === 0 && (
              <p className="text-xs text-[--text-muted] text-center py-4">Belum ada berkas diunggah</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Aggregate Bar Card */}
      <motion.div
        variants={card} initial="hidden" animate="show"
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-[--text-muted] tracking-wider uppercase">PENGGUNAAN GABUNGAN VAULT</p>
          <p className="text-xs font-semibold text-[--accent-blue]">{usagePct.toFixed(2)}%</p>
        </div>
        <div className="progress-track h-3 rounded-full overflow-hidden flex gap-px bg-white/5">
          {accounts.map((acc, idx) => {
            const pct = totalCapacity > 0 ? (acc.usedStorageGB / totalCapacity) * 100 : 0;
            return (
              <motion.div
                key={acc.id}
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(pct, 0.3)}%` }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                style={{ background: DRIVE_COLORS[idx % DRIVE_COLORS.length] }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-[--text-muted] mt-2.5">
          <span>{totalUsed.toFixed(2)} GB terpakai</span>
          <span style={{ color: 'var(--accent-green)' }}>{totalFree.toFixed(1)} GB bebas</span>
          <span>{totalCapacity.toFixed(1)} GB total</span>
        </div>
      </motion.div>
    </div>
  );
}
