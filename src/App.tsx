import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { VaultFile, NavView } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UploadZone } from './components/UploadZone';
import { FileBrowser } from './components/FileBrowser';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { TransferModal } from './components/TransferModal';
import { QuotaAnalyticsView } from './components/QuotaAnalyticsView';
import { ConnectedAccountsView } from './components/ConnectedAccountsView';
import { UserGuideView } from './components/UserGuideView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { accountsApi, filesApi } from './services/api';
import { LandingPage } from './components/LandingPage';
import { useVaultData } from './hooks/useVaultData';

import type { Language } from './i18n/translations';

function Dashboard({ lang, toggleLang }: { lang: Language; toggleLang: () => void }) {
  const {
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    accounts,
    setAccounts,
    files,
    setFiles,
    folders,
    currentFolderId,
    folderPath,
    routingStrategy,
    setRoutingStrategy,
    uploadTasks,
    toast,
    showToast,
    handleAuthSuccess,
    handleLogout,
    handleUploadFiles,
    handleNavigateFolder,
    handleCreateFolder,
    handleDeleteFolder,
    handleDeleteFile,
  } = useVaultData(lang);

  const [activeView, setActiveView] = useState<NavView>('all-files');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [transferFile, setTransferFile] = useState<VaultFile | null>(null);

  // Global Drag and Drop state
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);

  // Keyboard Shortcuts (Space preview, Esc close, Delete file)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Escape') {
        setPreviewFile(null);
        setTransferFile(null);
        setIsConnectModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Drag & Drop Listener
  useEffect(() => {
    let dragCounter = 0;
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsGlobalDragging(true);
      }
    };
    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsGlobalDragging(false);
        dragCounter = 0;
      }
    };
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsGlobalDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        handleUploadFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleUploadFiles]);

  const handleTransferFile = useCallback((fileId: string, targetDriveId: string) => {
    const file = files.find(f => f.id === fileId);
    const dest = accounts.find(a => a.id === targetDriveId);
    if (!file || !dest || file.driveId === targetDriveId) return;
    const gb = Number((file.sizeBytes / 1e9).toFixed(3)) || 0.01;
    setAccounts(accs => accs.map(a => {
      if (a.id === file.driveId) return { ...a, usedStorageGB: Math.max(0, a.usedStorageGB - gb) };
      if (a.id === targetDriveId) return { ...a, usedStorageGB: a.usedStorageGB + gb };
      return a;
    }));
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, driveId: dest.id, driveName: dest.name } : f));
  }, [files, accounts]);

  const handleShareFile = useCallback((file: VaultFile) => {
    const url = file.sharedUrl || `https://vault.9drive.io/s/${file.id}`;
    navigator.clipboard.writeText(url);
    showToast(`Share link copied for "${file.name}"`);
  }, []);

  // Filter files for current view & search
  const displayFiles = files.filter(f => {
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeView === 'recent') {
      // Compare normalized date strings (YYYY-MM-DD HH:MM) — first 10 chars = date
      const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10);
      return f.uploadDate.slice(0, 10) >= threeDaysAgo;
    }
    if (activeView === 'shared') return f.isShared;
    return true;
  });

  const isFileView = ['all-files', 'recent', 'shared'].includes(activeView);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#070A10' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '50%' }}
            animate={{ opacity: 1, y: 0, x: '50%' }}
            exit={{ opacity: 0, y: -20, x: '50%' }}
            className={`fixed top-4 right-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/40 text-rose-300'
            } backdrop-blur-xl`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <Header
        accounts={accounts}
        routingStrategy={routingStrategy}
        onRoutingChange={setRoutingStrategy}
        onConnectClick={() => setIsConnectModalOpen(true)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        lang={lang}
        onToggleLang={toggleLang}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          routingStrategy={routingStrategy}
          onRoutingChange={setRoutingStrategy}
          totalAccounts={accounts.length}
          totalFiles={files.length}
          onConnectClick={() => setIsConnectModalOpen(true)}
          lang={lang}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0 relative">
          
          {/* Pillar 2: Guided Onboarding 3-Step Wizard Banner for new users */}
          {accounts.length === 0 && (
            <div
              className="m-4 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0"
              style={{
                background: 'rgba(41, 151, 255, 0.08)',
                border: '1px solid rgba(41, 151, 255, 0.25)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[--accent-blue] text-black font-extrabold flex items-center justify-center text-sm shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[--text-primary]">
                    {lang === 'id' ? 'Selamat Datang di 9DRIVE Vault! Mulai dalam 3 Langkah:' : 'Welcome to 9DRIVE Vault! Get started in 3 steps:'}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[--text-secondary] mt-0.5">
                    <span className="font-semibold text-[--accent-blue]">1. Hubungkan Google Drive</span> &bull; 
                    <span>2. Pilih Strategi Router</span> &bull; 
                    <span>3. Unggah Berkas Pertama</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="btn-nike-bold py-2 px-4 text-xs shrink-0 cursor-pointer shadow-md"
              >
                + {lang === 'id' ? 'Hubungkan Google Drive' : 'Connect Google Drive'}
              </button>
            </div>
          )}

          {/* Pillar 3: Global Full-screen Drag & Drop Overlay */}
          <AnimatePresence>
            {isGlobalDragging && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
                style={{
                  background: 'rgba(9, 9, 11, 0.90)',
                  backdropFilter: 'blur(24px)',
                  border: '2px dashed var(--accent-blue)',
                }}
              >
                <div className="w-20 h-20 rounded-3xl bg-[--accent-blue]/10 border border-[--accent-blue]/30 flex items-center justify-center text-[--accent-blue] mb-4 animate-bounce">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-[--text-primary] tracking-tight">
                  {lang === 'id' ? 'Lepaskan Berkas di Mana Saja untuk Mengunggah' : 'Drop Files Anywhere to Upload'}
                </h3>
                <p className="text-xs text-[--text-secondary] mt-1 max-w-md">
                  {lang === 'id' ? '9DRIVE akan mengalirkan berkas ini langsung ke Google Drive Anda tanpa perantara server.' : '9DRIVE will stream files directly into your Google Drive.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {isFileView ? (
              <motion.div
                key="file-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col md:flex-row flex-1 overflow-hidden"
              >
                {/* Upload Zone - left panel on desktop, collapsible / top strip on mobile */}
                <div className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-800/60 overflow-y-auto max-h-48 md:max-h-none">
                  <UploadZone
                    uploadTasks={uploadTasks}
                    onFilesSelected={handleUploadFiles}
                    accounts={accounts}
                    lang={lang}
                  />
                </div>

                {/* File Browser - main panel */}
                <div className="flex-1 overflow-hidden">
                  <FileBrowser
                    files={displayFiles}
                    accounts={accounts}
                    folders={folders}
                    currentFolderId={currentFolderId}
                    folderPath={folderPath}
                    onNavigateFolder={handleNavigateFolder}
                    onCreateFolder={handleCreateFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onPreviewFile={f => setPreviewFile(f)}
                    onDeleteFile={handleDeleteFile}
                    onToggleStar={id => setFiles(prev => prev.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f))}
                    onOpenTransferModal={f => setTransferFile(f)}
                    onShareFile={handleShareFile}
                    onRenameFile={(f, n) => setFiles(prev => prev.map(x => x.id === f.id ? { ...x, name: n } : x))}
                  />
                </div>
              </motion.div>
            ) : activeView === 'analytics' ? (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                <QuotaAnalyticsView
                  accounts={accounts}
                  files={files}
                  onCleanDuplicates={() => {
                    const nameMap: Record<string, VaultFile[]> = {};
                    files.forEach(f => {
                      const key = `${f.name.toLowerCase()}_${f.sizeBytes}`;
                      nameMap[key] = nameMap[key] || [];
                      nameMap[key].push(f);
                    });
                    const duplicatesToDelete: string[] = [];
                    Object.values(nameMap).forEach(g => {
                      if (g.length > 1) {
                        g.slice(1).forEach(dup => duplicatesToDelete.push(dup.id));
                      }
                    });
                    duplicatesToDelete.forEach(id => handleDeleteFile(id));
                    showToast(lang === 'id' ? `Berhasil membersihkan ${duplicatesToDelete.length} berkas duplikat!` : `Cleaned ${duplicatesToDelete.length} duplicate files!`, 'success');
                  }}
                />
              </motion.div>
            ) : activeView === 'accounts' ? (
              <motion.div key="accounts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                <ConnectedAccountsView
                  accounts={accounts}
                  onDisconnect={id => setAccounts(prev => prev.filter(a => a.id !== id))}
                  onSync={() => {
                    accountsApi.getAccounts().then(accs => { if (accs?.length) setAccounts(accs); }).catch(() => {});
                    filesApi.getFiles().then(fs => { if (fs?.length) setFiles(fs); }).catch(() => {});
                  }}
                />
              </motion.div>
            ) : activeView === 'guide' ? (
              <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                <UserGuideView onConnectClick={() => setIsConnectModalOpen(true)} accounts={accounts} lang={lang} />
              </motion.div>
            ) : (
              <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                <SettingsView routingStrategy={routingStrategy} onChangeRoutingStrategy={setRoutingStrategy} lang={lang} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals */}
      <ConnectAccountModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} onAddAccount={a => setAccounts(prev => [...prev, a])} />
      <FilePreviewModal file={previewFile} accounts={accounts} onClose={() => setPreviewFile(null)} onOpenTransferModal={f => setTransferFile(f)} onDeleteFile={handleDeleteFile} onShareFile={handleShareFile} />
      <TransferModal file={transferFile} accounts={accounts} onClose={() => setTransferFile(null)} onTransferFile={handleTransferFile} />
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={f => setPreviewFile(f)}
        onNavigateView={v => setActiveView(v)}
        onConnectDrive={() => setIsConnectModalOpen(true)}
        lang={lang}
      />
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('9drive_lang') as Language) || 'id';
  });

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('9drive_lang', next);
      return next;
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} onToggleLang={toggleLang} />} />
        <Route path="/app" element={<Dashboard lang={lang} toggleLang={toggleLang} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
