import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'id' | 'en';
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, lang = 'id' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(20px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-8 text-left max-h-[85vh] flex flex-col"
          style={{
            background: 'rgba(18, 18, 22, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 30px 90px rgba(0,0,0,0.9), 0 0 50px rgba(41,151,255,0.12)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[--accent-blue]/10 border border-[--accent-blue]/30 text-[--accent-blue] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  {lang === 'id' ? 'Syarat & Ketentuan Layanan 9DRIVE' : '9DRIVE Terms of Service & Privacy'}
                </h3>
                <p className="text-xs text-[--text-secondary] mt-0.5">
                  {lang === 'id' ? 'Terakhir diperbarui: 30 Juli 2026' : 'Last updated: July 30, 2026'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[--text-secondary] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto space-y-5 text-xs text-[--text-secondary] pr-2 leading-relaxed">
            <section className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[--accent-blue]" />
                <span>1. Ketentuan Umum & Model Layanan</span>
              </h4>
              <p>
                9DRIVE adalah platform agregator penyimpanan terdistribusi yang menggabungkan beberapa akun Google Drive milik pengguna menjadi 1 Vault terpadu. 9DRIVE tidak menyediakan server fisik untuk menyimpan berkas Anda. Semua berkas distreaming secara langsung (*Zero-Disk Pass-Through*) ke Google Drive milik Anda sendiri.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[--accent-purple]" />
                <span>2. Keamanan & Kebijakan Privasi Data</span>
              </h4>
              <p>
                Privasi Anda adalah prioritas tertinggi kami. 9DRIVE menggunakan enkripsi standar militer **AES-256-GCM** untuk melindungi token akses Google OAuth. Kami tidak pernah melihat, menjual, atau membagikan isi berkas Anda kepada pihak ketiga mana pun.
              </p>
            </section>

            <section className="space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[--accent-green]" />
                <span>3. Hak & Tanggung Jawab Pengguna</span>
              </h4>
              <p>
                Pengguna bertanggung jawab penuh atas legalitas berkas yang diunggah ke Google Drive masing-masing melalui 9DRIVE. Pengguna wajib mematuhi Ketentuan Layanan Google Drive yang berlaku.
              </p>
            </section>
          </div>

          {/* Footer Action */}
          <div className="pt-4 mt-4 border-t border-white/10 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="btn-nike-bold px-6 py-2.5 text-xs cursor-pointer shadow-lg"
            >
              <span>{lang === 'id' ? 'Saya Mengerti' : 'I Understand'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
