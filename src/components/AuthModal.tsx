import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { authApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: { id: string; email: string; fullName?: string }) => void;
  lang?: 'id' | 'en';
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, lang = 'id', onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(lang === 'id' ? 'Email dan kata sandi wajib diisi' : 'Email and password are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isLoginMode) {
        const res = await authApi.login(email, password);
        onSuccess(res.user);
      } else {
        const res = await authApi.register(email, password, fullName);
        onSuccess(res.user);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || (lang === 'id' ? 'Gagal autentikasi' : 'Authentication failed');
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // One-click Demo Login for fast testing
  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const demoEmail = 'demo@9drive.app';
      const demoPassword = 'password123';
      try {
        const res = await authApi.login(demoEmail, demoPassword);
        onSuccess(res.user);
      } catch {
        const res = await authApi.register(demoEmail, demoPassword, 'Demo User');
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(lang === 'id' ? 'Gagal login mode demo' : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl overflow-hidden text-left"
          style={{
            background: 'rgba(18, 18, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(41, 151, 255, 0.12)',
          }}
        >
          {/* Ambient Top Glow */}
          <div 
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(41, 151, 255, 0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Header Title */}
          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2997FF]/10 border border-[#2997FF]/30 text-[--accent-blue] mb-3">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span className="text-gradient-apple">9DRIVE VAULT</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-[--accent-blue] font-mono border border-white/10">v1.0</span>
            </h2>

            <p className="text-xs text-[--text-secondary] mt-1.5 font-medium">
              {isLoginMode
                ? (lang === 'id' ? 'Masuk ke Vault Terpadu Anda' : 'Sign in to your Unified Vault')
                : (lang === 'id' ? 'Buat Akun Vault Baru' : 'Create a New Vault Account')}
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-[--accent-red]/10 border border-[--accent-red]/30 text-[--accent-red] text-xs rounded-xl text-center font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Google One-Tap Magic SSO Button */}
          <div className="mb-5 relative z-10">
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoading(true);
                  const url = await authApi.getGoogleAuthUrl();
                  if (url) window.location.href = url;
                } catch (err: any) {
                  setErrorMsg(lang === 'id' ? 'Gagal menghubungkan Google SSO' : 'Google SSO failed');
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.10)';
                e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{lang === 'id' ? 'Lanjutkan dengan Google (1-Klik Auto-Drive)' : 'Continue with Google (1-Click Auto-Drive)'}</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[10px] text-[--text-muted] uppercase tracking-wider font-mono">
                {lang === 'id' ? 'atau gunakan email' : 'or use email'}
              </span>
              <div className="flex-1 border-t border-white/10" />
            </div>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {!isLoginMode && (
              <div>
                <label className="block text-[11px] font-medium text-[--text-secondary] mb-1.5">
                  {lang === 'id' ? 'Nama Lengkap' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[--text-muted]" />
                  <input
                    type="text"
                    required
                    placeholder={lang === 'id' ? 'Nama Anda' : 'Your name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[--text-muted] outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.5)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[--text-secondary] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[--text-muted]" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[--text-muted] outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[--text-secondary] mb-1.5">
                {lang === 'id' ? 'Kata Sandi' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[--text-muted]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[--text-muted] outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                />
              </div>
            </div>

            {/* Nike Bold Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-nike-bold w-full py-3.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isLoginMode
                      ? (lang === 'id' ? 'MASUK KE VAULT' : 'SIGN IN TO VAULT')
                      : (lang === 'id' ? 'DAFTAR AKUN VAULT' : 'CREATE VAULT ACCOUNT')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* One-Click Quick Demo Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[--text-secondary] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <KeyRound className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span>{lang === 'id' ? 'Masuk Mode Demo (Instant Access)' : 'Quick Demo Access'}</span>
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center relative z-10">
            <p className="text-xs text-[--text-secondary]">
              {isLoginMode
                ? (lang === 'id' ? 'Belum punya akun Vault?' : "Don't have a Vault account?")
                : (lang === 'id' ? 'Sudah punya akun Vault?' : 'Already have a Vault account?')}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorMsg('');
                }}
                className="font-semibold text-[--accent-blue] hover:underline transition-colors ml-1 cursor-pointer"
              >
                {isLoginMode
                  ? (lang === 'id' ? 'Daftar Sekarang' : 'Sign Up Now')
                  : (lang === 'id' ? 'Masuk Di Sini' : 'Sign In Here')}
              </button>
            </p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
