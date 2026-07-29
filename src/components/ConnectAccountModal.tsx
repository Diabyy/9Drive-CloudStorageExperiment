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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md glass-surface rounded-3xl p-7 border border-slate-700/60 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800/60 text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="heading-kinetic text-sm text-slate-50 tracking-widest">Connect Google Drive</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">Authorize via OAuth 2.0</p>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-3 mb-6">
              {[
                { label: 'Encrypted token storage (AES-256-GCM)', color: 'text-emerald-400' },
                { label: 'Read, write access via Google Drive API v3', color: 'text-cyan-400' },
                { label: 'No credentials transmitted to external servers', color: 'text-indigo-400' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-400/80">
                You will be redirected to Google's official login page.
                9DRIVE never sees your password.
              </p>
            </div>

            {/* Connect Button */}
            <motion.button
              onClick={handleConnect}
              disabled={step === 'connecting'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {step === 'connecting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to Google…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-[11px] text-slate-600 mt-3">
              Powered by Google OAuth 2.0 · Scopes: drive.file, userinfo.email
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
