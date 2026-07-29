import React, { useState } from 'react';
import { X, MoveRight, HardDrive, Zap, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#111827] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <MoveRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Cross-Drive File Transfer
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Stream file chunks between Google Drive accounts.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-gray-900/90 rounded-2xl border border-gray-800 space-y-1 mb-5">
          <span className="text-[10px] text-gray-500 uppercase font-bold">Selected File</span>
          <p className="text-xs font-bold text-cyan-300 truncate">{file.name}</p>
          <p className="text-[11px] text-gray-400">Size: {file.formattedSize}</p>
        </div>

        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
              Source Drive
            </label>
            <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>{currentDrive?.name} ({currentDrive?.email})</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
              Destination Target Drive
            </label>
            <select
              required
              value={selectedTargetDriveId}
              onChange={(e) => setSelectedTargetDriveId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-500 rounded-xl p-3 text-white outline-none font-mono"
            >
              <option value="">-- Select Destination Drive --</option>
              {availableTargets.map((acc) => {
                const freeGB = (acc.totalStorageGB - acc.usedStorageGB).toFixed(1);
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.email}) &mdash; {freeGB} GB Free
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedTargetDriveId || isTransferring}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <span>Streaming Chunks across Drives...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Execute Cross-Drive Migration</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
