import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MoveRight, HardDrive, Zap, Loader2 } from 'lucide-react';
import { VaultFile, DriveAccount } from '../types';

interface TransferModalProps {
  file: VaultFile | null;
  accounts: DriveAccount[];
  onClose: () => void;
  onTransferFile: (fileId: string, targetDriveId: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  file,
  accounts,
  onClose,
  onTransferFile,
}) => {
  const [selectedTargetDriveId, setSelectedTargetDriveId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  if (!file) return null;

  const currentDrive = accounts.find((a) => a.id === file.driveId);
  const availableTargets = accounts.filter((a) => a.id !== file.driveId);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetDriveId) return;

    setIsTransferring(true);
    setTimeout(() => {
      onTransferFile(file.id, selectedTargetDriveId);
      setIsTransferring(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl p-7 text-left overflow-hidden"
          style={{
            background: 'rgba(18, 18, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 151, 255, 0.12)',
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[--text-muted] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ background: 'var(--accent-purple)' }}
            >
              <MoveRight className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[--text-primary] tracking-tight">
                Migrasi Berkas Antar-Drive
              </h3>
              <p className="text-xs text-[--text-secondary] mt-0.5 font-normal">
                Alirkan chunk berkas langsung antar akun Google Drive
              </p>
            </div>
          </div>

          {/* Selected File Info */}
          <div
            className="p-4 rounded-2xl mb-5 space-y-1"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span className="text-[10px] text-[--text-muted] uppercase font-bold tracking-wider">Berkas Terpilih</span>
            <p className="text-xs font-bold text-[--accent-blue] truncate">{file.name}</p>
            <p className="text-[11px] text-[--text-secondary]">Ukuran: {file.formattedSize}</p>
          </div>

          <form onSubmit={handleExecuteTransfer} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[--text-secondary] uppercase mb-1.5">
                Drive Asal
              </label>
              <div
                className="p-3 rounded-xl text-xs text-[--text-secondary] flex items-center gap-2"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <HardDrive className="w-4 h-4 text-[--accent-blue]" strokeWidth={1.5} />
                <span className="truncate">{currentDrive?.name} ({currentDrive?.email})</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[--text-secondary] uppercase mb-1.5">
                Drive Tujuan
              </label>
              <select
                required
                value={selectedTargetDriveId}
                onChange={(e) => setSelectedTargetDriveId(e.target.value)}
                className="w-full rounded-xl p-3 text-xs text-white outline-none cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <option value="" className="bg-[#121216]">-- Pilih Drive Tujuan --</option>
                {availableTargets.map((acc) => {
                  const freeGB = (acc.totalStorageGB - acc.usedStorageGB).toFixed(1);
                  return (
                    <option key={acc.id} value={acc.id} className="bg-[#121216]">
                      {acc.name} ({acc.email}) &mdash; {freeGB} GB Bebas
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedTargetDriveId || isTransferring}
              className="btn-nike-bold w-full py-3.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 mt-2"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengalihkan Chunk Berkas…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black" fill="currentColor" />
                  <span>EKSEKUSI MIGRASI BERKAS</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
