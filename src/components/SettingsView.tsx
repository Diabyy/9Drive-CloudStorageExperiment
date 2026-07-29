import React, { useState } from 'react';
import { Key, Sliders, Zap, Check, Save } from 'lucide-react';
import { RoutingStrategy } from '../types';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

interface SettingsViewProps {
  routingStrategy: RoutingStrategy;
  onChangeRoutingStrategy: (strategy: RoutingStrategy) => void;
  lang?: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  routingStrategy,
  onChangeRoutingStrategy,
  lang = 'id',
}) => {
  const t = translations[lang];
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD9DriveVaultStreamToken_Prod');
  const [chunkSizeMB, setChunkSizeMB] = useState(64);
  const [autoRetry, setAutoRetry] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="h-full overflow-y-auto p-5 sm:p-6">
      <div className="space-y-6 font-mono max-w-3xl mx-auto pb-8">
        <div className="p-6 bg-[#111827] border border-gray-800 rounded-3xl shadow-2xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Sliders className="w-4 h-4" />
            <span>{t.systemConfig}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t.settingsTitle}
          </h2>
          <p className="text-xs text-gray-400 font-sans mt-1">
            {t.settingsSubtitle}
          </p>
        </div>

        {savedMessage && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{t.configSavedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Smart Routing Strategy */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>{t.routingPolicyTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onChangeRoutingStrategy('max-free-space')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  routingStrategy === 'max-free-space'
                    ? 'bg-cyan-950/30 border-cyan-500 text-white shadow-lg'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs uppercase mb-1">{t.maxFreeTitle}</span>
                <p className="text-[10px] text-gray-400 font-sans">
                  {t.maxFreeDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChangeRoutingStrategy('balanced')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  routingStrategy === 'balanced'
                    ? 'bg-purple-950/30 border-purple-500 text-white shadow-lg'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs uppercase mb-1">{t.balancedTitle}</span>
                <p className="text-[10px] text-gray-400 font-sans">
                  {t.balancedDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChangeRoutingStrategy('priority-first')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  routingStrategy === 'priority-first'
                    ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-lg'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs uppercase mb-1">{t.priorityTitle}</span>
                <p className="text-[10px] text-gray-400 font-sans">
                  {t.priorityPolicyDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Streaming API Keys & Encryption Keys */}
          <div className="p-6 bg-[#111827] border border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{t.apiKeysTitle}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                  {t.geminiKeyLabel}
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none font-mono text-xs"
                />
                <p className="text-[10px] text-gray-500 font-sans mt-1">
                  {t.geminiKeyDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    {t.chunkSizeLabel}
                  </label>
                  <select
                    value={chunkSizeMB}
                    onChange={(e) => setChunkSizeMB(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-white outline-none font-mono text-xs"
                  >
                    <option value={16}>{t.chunkSize16}</option>
                    <option value={64}>{t.chunkSize64}</option>
                    <option value={128}>{t.chunkSize128}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                    {t.autoRetryLabel}
                  </label>
                  <div className="flex items-center h-11 px-4 bg-gray-900 border border-gray-800 rounded-xl">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRetry}
                        onChange={(e) => setAutoRetry(e.target.checked)}
                        className="accent-cyan-500 w-4 h-4 rounded"
                      />
                      <span>{t.autoRetryDesc}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 text-white font-extrabold uppercase tracking-widest text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t.savePreferences}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
