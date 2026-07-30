import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, HardDrive, Settings, HelpCircle, LayoutGrid, Zap, KeyRound, Globe, ArrowRight, X } from 'lucide-react';
import type { VaultFile, NavView } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: VaultFile[];
  onSelectFile: (file: VaultFile) => void;
  onNavigateView: (view: NavView) => void;
  onConnectDrive: () => void;
  lang?: 'id' | 'en';
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen, onClose, files, onSelectFile, onNavigateView, onConnectDrive, lang = 'id',
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const quickNavs = [
    { id: 'all-files', label: lang === 'id' ? 'Semua Berkas Vault' : 'All Vault Files', icon: LayoutGrid, action: () => { onNavigateView('all-files'); onClose(); } },
    { id: 'analytics', label: lang === 'id' ? 'Analitik Kuota & Pembersih' : 'Quota Analytics & Cleaner', icon: Zap, action: () => { onNavigateView('analytics'); onClose(); } },
    { id: 'accounts', label: lang === 'id' ? 'Akun Google Drive Terhubung' : 'Connected Google Drives', icon: HardDrive, action: () => { onNavigateView('accounts'); onClose(); } },
    { id: 'settings', label: lang === 'id' ? 'Pengaturan Strategi & API' : 'Settings & API Keys', icon: Settings, action: () => { onNavigateView('settings'); onClose(); } },
    { id: 'guide', label: lang === 'id' ? 'Panduan Penggunaan Apple Style' : 'User Guide Docs', icon: HelpCircle, action: () => { onNavigateView('guide'); onClose(); } },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4"
        style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(16px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-xl rounded-3xl overflow-hidden text-left border shadow-2xl"
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(18, 18, 22, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 50px rgba(41,151,255,0.15)',
          }}
        >
          {/* Input Header */}
          <div className="flex items-center px-5 py-4 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-[--accent-blue] shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari berkas, navigasi, atau perintah... (Tekan Esc untuk tutup)' : 'Search files, navigation, actions... (Press Esc to close)'}
              className="w-full text-sm text-white placeholder-[--text-muted] outline-none bg-transparent"
            />
            <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-white/10 text-[--text-muted] border border-white/10">ESC</span>
          </div>

          {/* Command Results Body */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-3">
            {/* Quick Actions */}
            <div>
              <p className="px-3 py-1.5 text-[10px] font-bold text-[--text-muted] uppercase tracking-wider">NAVIGASI & PINDAH HALAMAN</p>
              <div className="space-y-1">
                {quickNavs.map(item => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-3 rounded-2xl text-xs text-[--text-secondary] hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-[--accent-blue] group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* File Results */}
            {query && (
              <div>
                <p className="px-3 py-1.5 text-[10px] font-bold text-[--text-muted] uppercase tracking-wider">BERKAS VAULT HASIL PENCARIAN ({filteredFiles.length})</p>
                {filteredFiles.length > 0 ? (
                  <div className="space-y-1">
                    {filteredFiles.map(f => (
                      <button
                        key={f.id}
                        onClick={() => { onSelectFile(f); onClose(); }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl text-xs text-[--text-secondary] hover:text-white hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FileText className="w-4 h-4 text-[--accent-purple] shrink-0" />
                          <span className="font-semibold truncate">{f.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[--text-muted] shrink-0 ml-2">{f.formattedSize}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[--text-muted] px-3 py-2">Tidak ada berkas yang cocok dengan "{query}"</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
