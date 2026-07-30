import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Eye, Download, HardDrive, MoveRight, Trash2, Check, Copy, FileText,
} from 'lucide-react';
import { VaultFile, DriveAccount } from '../types';

interface FilePreviewModalProps {
  file: VaultFile | null;
  accounts: DriveAccount[];
  onClose: () => void;
  onOpenTransferModal: (file: VaultFile) => void;
  onDeleteFile: (fileId: string) => void;
  onShareFile: (file: VaultFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  accounts,
  onClose,
  onOpenTransferModal,
  onDeleteFile,
  onShareFile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const drive = accounts.find((a) => a.id === file.driveId);

  const handleCopyLink = () => {
    const link = file.sharedUrl || `https://vault.9drive.io/s/${file.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-left overflow-hidden"
          style={{
            background: 'rgba(18, 18, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 151, 255, 0.12)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[--text-muted] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3.5 mb-6 pr-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg"
              style={{ background: 'var(--accent-blue)' }}
            >
              <Eye className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-[--text-primary] tracking-tight truncate">
                {file.name}
              </h3>
              <p className="text-xs text-[--text-secondary] mt-0.5 font-normal">
                Diunggah pada {file.uploadDate} &bull; {file.formattedSize}
              </p>
            </div>
          </div>

          {/* Media Preview Stage */}
          <div
            className="mb-6 rounded-2xl p-4 min-h-[200px] max-h-[320px] overflow-hidden flex items-center justify-center relative"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="max-h-60 object-contain rounded-xl shadow-2xl"
              />
            ) : file.category === 'code' ? (
              <pre className="w-full text-[11px] text-[--accent-blue] font-mono p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed bg-white/[0.02]">
                {file.contentPreview || '// Encryption Block Header v4'}
              </pre>
            ) : (
              <div className="text-center space-y-3 p-6">
                <FileText className="w-12 h-12 text-[--accent-blue] mx-auto animate-pulse" strokeWidth={1.5} />
                <p className="text-xs text-[--text-secondary] max-w-md leading-relaxed">
                  {file.contentPreview || 'Konten biner terenkripsi tersimpan aman di Google Drive melalui 9DRIVE.'}
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-[--accent-blue] bg-[--accent-blue]/10 border border-[--accent-blue]/20">
                  {file.mimeType}
                </span>
              </div>
            )}
          </div>

          {/* File Metadata Details Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <span className="text-[10px] text-[--text-muted] uppercase font-bold tracking-wider block mb-1">
                Lokasi Penyimpanan Drive
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-[--text-primary]">
                <HardDrive className="w-4 h-4 text-[--accent-blue]" strokeWidth={1.5} />
                <span>[{file.driveName}]</span>
                {drive && <span className="text-[--text-muted] font-normal">({drive.email})</span>}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[--text-muted] uppercase font-bold tracking-wider block mb-1">
                Link Berkas Terpadu
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={file.sharedUrl || `https://vault.9drive.io/s/${file.id}`}
                  className="rounded px-2.5 py-1.5 text-[11px] text-[--accent-blue] outline-none w-full font-mono"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg text-[--text-secondary] hover:text-white transition-colors cursor-pointer shrink-0"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  title="Salin Link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[--accent-green]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Controls Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => {
                onDeleteFile(file.id);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              style={{
                background: 'rgba(255, 69, 58, 0.10)',
                color: 'var(--accent-red)',
                border: '1px solid rgba(255, 69, 58, 0.25)',
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Berkas</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenTransferModal(file);
                  onClose();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--accent-purple)',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                }}
              >
                <MoveRight className="w-4 h-4" />
                <span>Migrasi Drive</span>
              </button>

              <a
                href={`http://localhost:4000/api/v1/files/${file.id}/download`}
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="btn-nike-bold px-6 py-2.5 text-xs inline-flex items-center gap-2 cursor-pointer shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>UNDUH BERKAS</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
