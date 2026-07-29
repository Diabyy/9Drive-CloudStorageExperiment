import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: { id: string; email: string; fullName?: string }) => void;
  lang?: 'id' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess, lang = 'id' }) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#0d1322] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden">
        
        {/* Glow Decor Background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
            Drive Vault <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">v1.0</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLoginMode
              ? (lang === 'id' ? 'Masuk ke Vault Pribadi Anda' : 'Sign in to your Private Vault')
              : (lang === 'id' ? 'Buat Akun Vault Baru' : 'Create a New Vault Account')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {!isLoginMode && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {lang === 'id' ? 'Nama Lengkap' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder={lang === 'id' ? 'Nama Anda' : 'Your name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#161e31] border border-slate-700/60 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161e31] border border-slate-700/60 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {lang === 'id' ? 'Kata Sandi' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#161e31] border border-slate-700/60 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {isLoginMode
                    ? (lang === 'id' ? 'Masuk ke Vault' : 'Sign In to Vault')
                    : (lang === 'id' ? 'Daftar Akun Vault' : 'Create Vault Account')}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center relative z-10">
          <p className="text-xs text-slate-400">
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
              className="text-cyan-400 font-semibold hover:underline hover:text-cyan-300 transition-colors ml-1"
            >
              {isLoginMode
                ? (lang === 'id' ? 'Daftar Sekarang' : 'Sign Up Now')
                : (lang === 'id' ? 'Masuk Di Sini' : 'Sign In Here')}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
