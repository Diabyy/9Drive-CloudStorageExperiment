import React, { useState } from 'react';
import { Sliders, Zap, Key, Check, Save } from 'lucide-react';
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
      <div className="space-y-6 max-w-3xl mx-auto pb-8">
        
        {/* Header Card */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(30px)',
          }}
        >
          <div className="flex items-center gap-2 text-[--accent-blue] text-xs font-semibold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" strokeWidth={1.5} />
            <span>{t.systemConfig}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[--text-primary] tracking-tight">
            {t.settingsTitle}
          </h2>
          <p className="text-xs text-[--text-secondary] mt-1">
            {t.settingsSubtitle}
          </p>
        </div>

        {savedMessage && (
          <div
            className="p-4 rounded-xl text-xs font-medium flex items-center gap-2"
            style={{
              background: 'rgba(48, 209, 88, 0.10)',
              color: 'var(--accent-green)',
              border: '1px solid rgba(48, 209, 88, 0.25)',
            }}
          >
            <Check className="w-4 h-4" />
            <span>{t.configSavedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Smart Routing Policy */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[--accent-orange]" strokeWidth={1.5} />
              <span>{t.routingPolicyTitle}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'max-free-space', title: t.maxFreeTitle, desc: t.maxFreeDesc, color: 'var(--accent-blue)' },
                { id: 'balanced', title: t.balancedTitle, desc: t.balancedDesc, color: 'var(--accent-purple)' },
                { id: 'priority-first', title: t.priorityTitle, desc: t.priorityPolicyDesc, color: 'var(--accent-green)' },
              ].map((policy) => {
                const isSelected = routingStrategy === policy.id;
                return (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => onChangeRoutingStrategy(policy.id as RoutingStrategy)}
                    className="p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? `1.5px solid ${policy.color}` : '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: isSelected ? `0 0 20px ${policy.color}20` : 'none',
                    }}
                  >
                    <div>
                      <span className="font-bold block text-xs mb-1" style={{ color: isSelected ? policy.color : 'var(--text-primary)' }}>
                        {policy.title}
                      </span>
                      <p className="text-[11px] text-[--text-secondary] leading-relaxed">
                        {policy.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Keys & Parameters */}
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-[--accent-blue]" strokeWidth={1.5} />
              <span>{t.apiKeysTitle}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[--text-secondary] uppercase mb-1.5">
                  {t.geminiKeyLabel}
                </label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(41, 151, 255, 0.5)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
                <p className="text-[10px] text-[--text-muted] mt-1">
                  {t.geminiKeyDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[--text-secondary] uppercase mb-1.5">
                    {t.chunkSizeLabel}
                  </label>
                  <select
                    value={chunkSizeMB}
                    onChange={(e) => setChunkSizeMB(Number(e.target.value))}
                    className="w-full rounded-xl px-4 py-2.5 text-xs text-white outline-none cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <option value={16} className="bg-[#121216] text-white">{t.chunkSize16}</option>
                    <option value={64} className="bg-[#121216] text-white">{t.chunkSize64}</option>
                    <option value={128} className="bg-[#121216] text-white">{t.chunkSize128}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[--text-secondary] uppercase mb-1.5">
                    {t.autoRetryLabel}
                  </label>
                  <div
                    className="flex items-center h-10 px-4 rounded-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <label className="flex items-center gap-2.5 text-xs text-[--text-secondary] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRetry}
                        onChange={(e) => setAutoRetry(e.target.checked)}
                        className="accent-[#2997FF] w-4 h-4 rounded"
                      />
                      <span className="text-[--text-primary] font-medium">{t.autoRetryDesc}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-nike-bold px-8 py-3.5 text-xs cursor-pointer shadow-lg inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{t.savePreferences}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
