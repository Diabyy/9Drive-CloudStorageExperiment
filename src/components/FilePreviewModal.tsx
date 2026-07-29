import React, { useState } from 'react';
import {
  X,
  Eye,
  Download,
  Share2,
  HardDrive,
  MoveRight,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Lock,
  FileText,
  Video,
  Image as ImageIcon,
  Archive,
  Code,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#111827] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl font-mono text-xs overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black text-white font-mono truncate">
              {file.name}
            </h3>
            <p className="text-xs text-gray-400 font-sans">
              Uploaded on {file.uploadDate} &bull; {file.formattedSize}
            </p>
          </div>
        </div>

        {/* Media Preview Stage */}
        <div className="mb-6 rounded-2xl bg-gray-950 border border-gray-800 p-4 min-h-[220px] max-h-[340px] overflow-hidden flex items-center justify-center relative">
          {file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="max-h-64 object-contain rounded-xl shadow-2xl"
            />
          ) : file.category === 'code' ? (
            <pre className="w-full text-[11px] text-cyan-300 font-mono bg-gray-900/90 p-4 rounded-xl border border-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {file.contentPreview || '// Encryption Block Header v4'}
            </pre>
          ) : (
            <div className="text-center space-y-3 p-6">
              <FileText className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <p className="text-xs text-gray-300 font-sans max-w-md">
                {file.contentPreview || 'Encrypted binary content stored across 9DRIVE multi-account vault.'}
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-[10px] text-cyan-400 uppercase tracking-widest font-mono">
                {file.mimeType}
              </span>
            </div>
          )}
        </div>

        {/* File Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 bg-gray-900/80 rounded-2xl border border-gray-800/80">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">
              Current Storage Location
            </span>
            <div className="flex items-center gap-2 text-white font-bold">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>[{file.driveName}]</span>
              {drive && <span className="text-gray-400 font-normal">({drive.email})</span>}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">
              Vault Direct URL
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={file.sharedUrl || `https://vault.9drive.io/s/${file.id}`}
                className="bg-gray-950 border border-gray-800 rounded px-2.5 py-1 text-[11px] text-cyan-300 outline-none w-full font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded bg-gray-800 hover:bg-cyan-500 hover:text-gray-950 text-gray-300 transition-colors cursor-pointer shrink-0"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
          <button
            onClick={() => {
              onDeleteFile(file.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 hover:bg-rose-900/50 transition-colors cursor-pointer font-bold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenTransferModal(file);
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
            >
              <MoveRight className="w-4 h-4" />
              <span>Transfer Drive</span>
            </button>

            <a
              href={`http://localhost:4000/api/v1/files/${file.id}/download`}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
