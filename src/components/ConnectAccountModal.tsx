import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HardDrive, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import type { DriveAccount } from '../types';
import { authApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: DriveAccount) => void;
}

export function ConnectAccountModal({ isOpen, onClose, onAddAccount }: Props) {
  const [step, setStep] = useState<'idle' | 'connecting'>('idle');

  const handleConnect = async () => {
    setStep('connecting');
    try {
      const url = await authApi.getGoogleAuthUrl();
      if (url) {
        window.location.href = url;
        return;
      }
    } catch {
      setStep('idle');
    }
  };

  const handleClose = () => {
    setStep('idle');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl p-7 text-left overflow-hidden"
            style={{
              background: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 151, 255, 0.12)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-[--text-muted] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'var(--accent-blue)', color: 'white' }}
              >
                <HardDrive className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[--text-primary] tracking-tight">Hubungkan Google Drive</h3>
                <p className="text-xs text-[--text-secondary] mt-0.5 font-normal">Otorisasi Resmi OAuth 2.0</p>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'Penyimpanan token terenkripsi AES-256-GCM', color: 'var(--accent-green)' },
                { label: 'Akses baca-tulis via Google Drive API v3', color: 'var(--accent-blue)' },
                { label: 'Kredensial tidak pernah dikirim ke server luar', color: 'var(--accent-purple)' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                  <p className="text-xs text-[--text-secondary] leading-relaxed">{label}</p>
                </div>
              ))}
            </div>

            {/* Security Badge */}
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mb-6"
              style={{
                background: 'rgba(48, 209, 88, 0.08)',
                border: '1px solid rgba(48, 209, 88, 0.20)',
              }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-green)' }} />
              <p className="text-xs text-[--text-secondary] leading-relaxed">
                Anda akan diarahkan ke halaman login resmi Google. 9DRIVE tidak pernah tahu password Anda.
              </p>
            </div>

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={step === 'connecting'}
              className="btn-nike-bold w-full py-3.5 px-4 text-xs flex items-center justify-center gap-2.5 cursor-pointer shadow-xl disabled:opacity-50"
            >
              {step === 'connecting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengalihkan ke Google…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Lanjutkan dengan Google
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-[--text-muted] mt-3.5 font-mono">
              Google OAuth 2.0 · Scopes: drive.file, userinfo.email
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
