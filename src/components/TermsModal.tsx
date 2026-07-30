import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Lock, Key, Trash2, Mail, ExternalLink } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'id' | 'en';
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, lang = 'id' }) => {
  if (!isOpen) return null;

  const isId = lang === 'id';

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-3xl p-6 sm:p-8 text-left max-h-[88vh] flex flex-col overflow-hidden"
          style={{
            background: 'rgba(18, 18, 22, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 30px 90px rgba(0,0,0,0.9), 0 0 50px rgba(41,151,255,0.12)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(41, 151, 255, 0.15) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 shrink-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[--accent-blue]/10 border border-[--accent-blue]/30 text-[--accent-blue] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{isId ? 'Syarat & Ketentuan Layanan 9DRIVE' : '9DRIVE Terms of Service & Privacy Policy'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                    {isId ? 'Dokumen Resmi' : 'Official Document'}
                  </span>
                </h3>
                <p className="text-xs text-[--text-secondary] mt-0.5 font-medium">
                  {isId ? 'Sesuai Standar Verifikasi Google Cloud OAuth • Efektif: 30 Juli 2026' : 'Google Cloud OAuth Compliant • Effective: July 30, 2026'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-[--text-secondary] hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="overflow-y-auto space-y-6 text-xs text-[--text-secondary] pr-3 leading-relaxed relative z-10 custom-scrollbar">
            
            {/* Clause 1 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[--accent-blue]" />
                <span>{isId ? 'Pasal 1: Ketentuan Umum & Model Layanan (Vault Aggregator)' : 'Clause 1: General Terms & Vault Aggregator Service Model'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? '9DRIVE adalah platform agregator penyimpanan terdistribusi yang menggabungkan beberapa akun Google Drive milik pengguna menjadi 1 Vault terpadu. 9DRIVE menggunakan arsitektur Zero-Disk Pass-Through, yang berarti 9DRIVE tidak pernah menyimpan berkas fisik Anda di server kami. Semua berkas distreaming secara langsung dari dan ke akun Google Drive pribadi pengguna.'
                  : '9DRIVE is a distributed storage aggregator platform that unifies multiple personal Google Drive accounts into 1 central Vault. 9DRIVE utilizes a Zero-Disk Pass-Through architecture, meaning 9DRIVE never stores your physical files on our servers. All files stream directly to and from your personal Google Drive storage.'}
              </p>
            </section>

            {/* Clause 2 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[--accent-purple]" />
                <span>{isId ? 'Pasal 2: Keamanan Token OAuth & Enkripsi Data (AES-256-GCM)' : 'Clause 2: OAuth Token Security & AES-256-GCM Data Encryption'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? 'Privasi dan keamanan data Anda adalah prioritas tertinggi kami. Semua token akses OAuth Google Drive disimpan di database kami dengan enkripsi standar militer AES-256-GCM. 9DRIVE menjamin secara mutlak bahwa kami TIDAK PERNAH membaca, menjual, atau membagikan konten berkas atau data pribadi Anda kepada pihak ketiga mana pun.'
                  : 'Your privacy and data security are our top priorities. All Google Drive OAuth access tokens are stored in our database encrypted using military-grade AES-256-GCM. 9DRIVE explicitly guarantees that we NEVER inspect, sell, or share your file contents or personal data with any third parties.'}
              </p>
            </section>

            {/* Clause 3 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-[#CCFF00]" />
                <span>{isId ? 'Pasal 3: Hak Akses API Google Drive & Izin Scope' : 'Clause 3: Google Drive API Access & Scope Permissions'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? '9DRIVE meminta akses terbatas (Google OAuth Scope: drive.file) semata-mata untuk mengelola berkas di folder 9DRIVE_VAULT. Anda memiliki kendali penuh dan dapat mencabut izin akses 9DRIVE kapan saja melalui halaman Keamanan Akun Google resmi Anda (myaccount.google.com/permissions).'
                  : '9DRIVE requests restricted access (Google OAuth Scope: drive.file) strictly to manage files created within the 9DRIVE_VAULT folder. You retain complete authority to revoke 9DRIVE access permissions at any time via your official Google Account Security page (myaccount.google.com/permissions).'}
              </p>
            </section>

            {/* Clause 4 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{isId ? 'Pasal 4: Hak & Tanggung Jawab Pengguna' : 'Clause 4: User Responsibilities & Content Ownership'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? 'Pengguna memegang hak cipta dan kepemilikan penuh atas seluruh berkas yang diunggah. Pengguna bertanggung jawab penuh atas legalitas isi berkas dan wajib mematuhi Ketentuan Layanan serta Kebijakan Komunitas resmi dari Google.'
                  : 'Users retain full ownership and copyright of all uploaded files. Users are solely responsible for the legal compliance of their content and must comply with Google Drive Terms of Service and Community Guidelines.'}
              </p>
            </section>

            {/* Clause 5 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-[--accent-red]" />
                <span>{isId ? 'Pasal 5: Kebijakan Penghapusan Data Akun (Right to be Forgotten)' : 'Clause 5: Account Data Deletion & Right to be Forgotten'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? 'Apabila Anda menghapus akun atau memutus hubungan akun Google Drive dari 9DRIVE, seluruh token enkripsi dan histori akun di server 9DRIVE akan dihapus secara permanen seketika (Instant Hard-Delete). Berkas fisik Anda di Google Drive asli pengguna tidak akan tersentuh dan tetap aman.'
                  : 'If you delete your account or disconnect a Google Drive from 9DRIVE, all encrypted tokens and account logs stored on 9DRIVE servers are instantly hard-deleted permanently. Your physical files residing in your native Google Drive remain completely untouched and safe.'}
              </p>
            </section>

            {/* Clause 6 */}
            <section className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>{isId ? 'Pasal 6: Bantuan Hukum & Kontak Privasi' : 'Clause 6: Privacy Support & Legal Inquiries'}</span>
              </h4>
              <p className="text-[--text-secondary]">
                {isId
                  ? 'Untuk pertanyaan mengenai privasi, pelaporan masalah keamanan, atau permohonan bantuan hukum, Anda dapat menghubungi Tim Privasi 9DRIVE melalui email: privacy@9drive.app atau support@9drive.app.'
                  : 'For privacy inquiries, security reporting, or legal assistance, you may contact the 9DRIVE Privacy & Compliance Team via email: privacy@9drive.app or support@9drive.app.'}
              </p>
            </section>

          </div>

          {/* Footer Action */}
          <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between shrink-0 relative z-10">
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[--accent-blue] hover:underline cursor-pointer"
            >
              <span>{isId ? 'Kelola Izin Akun Google Anda' : 'Manage Google Account Permissions'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="btn-nike-bold px-6 py-2.5 text-xs cursor-pointer shadow-lg"
            >
              <span>{isId ? 'Saya Mengerti & Setuju' : 'I Understand & Agree'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
