import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import type { DriveAccount, VaultFile, UploadTask, NavView, RoutingStrategy, VirtualFolder } from './types';
import { INITIAL_ACCOUNTS, INITIAL_FILES } from './data/mockData';
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
import { accountsApi, filesApi, uploadApi, foldersApi, authApi } from './services/api';

import type { Language } from './i18n/translations';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('9drive_lang') as Language) || 'id';
  });

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'id' ? 'en' : 'id';
      localStorage.setItem('9drive_lang', next);
      return next;
    });
  }, []);

  const [accounts, setAccounts] = useState<DriveAccount[]>(INITIAL_ACCOUNTS);
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root Vault' },
  ]);

  const [activeView, setActiveView] = useState<NavView>('all-files');
  const [routingStrategy, setRoutingStrategy] = useState<RoutingStrategy>('max-free-space');
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<VaultFile | null>(null);
  const [transferFile, setTransferFile] = useState<VaultFile | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch folders & files whenever currentFolderId changes
  const refreshVaultContent = useCallback((folderId: string | null) => {
    foldersApi.getFolders(folderId)
      .then(fList => setFolders(fList || []))
      .catch(() => {});

    filesApi.getFiles({ folderId: folderId || 'root' })
      .then(fs => { if (fs) setFiles(fs); })
      .catch(() => {});
  }, []);

  // Check user session on mount
  useEffect(() => {
    const token = localStorage.getItem('9drive_access_token');
    if (token) {
      authApi.getMe()
        .then(res => {
          setCurrentUser(res.user);
          setIsAuthModalOpen(false);
        })
        .catch(() => {
          localStorage.removeItem('9drive_access_token');
          setCurrentUser(null);
          setIsAuthModalOpen(true);
        });
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleAuthSuccess = useCallback((user: { id: string; email: string; fullName?: string }) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(lang === 'id' ? `Selamat datang, ${user.fullName || user.email}!` : `Welcome, ${user.fullName || user.email}!`, 'success');
    accountsApi.getAccounts()
      .then(accs => setAccounts(accs || []))
      .catch(() => setAccounts([]));
    refreshVaultContent(currentFolderId);
  }, [currentFolderId, lang, refreshVaultContent, showToast]);

  const handleLogout = useCallback(() => {
    authApi.logout();
    setCurrentUser(null);
    setAccounts([]);
    setFiles([]);
    setFolders([]);
    setIsAuthModalOpen(true);
    showToast(lang === 'id' ? 'Berhasil keluar dari Vault.' : 'Successfully logged out.', 'success');
  }, [lang, showToast]);

  useEffect(() => {
    if (!currentUser) return;

    accountsApi.getAccounts()
      .then(accs => { setAccounts(accs || []); })
      .catch(() => setAccounts([]));

    refreshVaultContent(currentFolderId);
  }, [currentUser, currentFolderId, refreshVaultContent]);

  // Handle OAuth callback redirect URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const isConnected = params.get('connected');
    const connectedEmail = params.get('email');

    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.exchangeGoogleCode(code)
        .then((res) => {
          accountsApi.getAccounts()
            .then(accs => { if (accs?.length) setAccounts(accs); })
            .catch(() => {});
          showToast(`Berhasil Menghubungkan Google Drive: ${res.email}`, 'success');
        })
        .catch((err: any) => {
          showToast(`OAuth Error: ${err.response?.data?.error || err.message}`, 'error');
        });
    } else if (isConnected === 'true' && connectedEmail) {
      accountsApi.getAccounts()
        .then(accs => { if (accs?.length) setAccounts(accs); })
        .catch(() => {});
      showToast(`Connected Google Drive: ${connectedEmail}`, 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const errorParam = params.get('error');
    if (errorParam) {
      if (errorParam === 'access_denied') {
        showToast('Koneksi Google Drive dibatalkan.', 'error');
      } else {
        showToast(`OAuth Error: ${errorParam}`, 'error');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);




  // Upload handler — streams to real Google Drive via backend
  const handleUploadFiles = useCallback((fileList: FileList) => {
    if (!accounts.length) {
      showToast('Connect a Google Drive account first!', 'error');
      return;
    }
    let target = accounts[0];
    if (routingStrategy === 'max-free-space') {
      target = [...accounts].sort((a, b) => (b.totalStorageGB - b.usedStorageGB) - (a.totalStorageGB - a.usedStorageGB))[0];
    } else if (routingStrategy === 'priority-first') {
      target = accounts.find(a => a.isPrimary) || accounts[0];
    } else {
      target = accounts[Math.floor(Math.random() * accounts.length)];
    }

    Array.from(fileList).forEach((file, i) => {
      const taskId = `task-${Date.now()}-${i}`;
      const newTask: UploadTask = {
        id: taskId,
        fileName: file.name,
        fileSizeBytes: file.size || 5_000_000,
        formattedSize: `${(file.size / 1e6).toFixed(2)} MB`,
        targetDriveId: target.id,
        targetDriveEmail: target.email,
        progressPercentage: 3,
        uploadSpeedMbps: 4.2,
        status: 'uploading',
        startedAt: Date.now(),
      };
      setUploadTasks(prev => [newTask, ...prev]);

      // Real upload to backend → Google Drive
      uploadApi.uploadFile(file, currentFolderId || undefined, (pct, speed) => {
        setUploadTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, progressPercentage: pct, uploadSpeedMbps: speed } : t
        ));
      }).then(savedFile => {
        setUploadTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'completed', progressPercentage: 100 } : t
        ));
        setFiles(prev => [savedFile, ...prev]);
        const sizeGB = (file.size || 0) / 1e9;
        setAccounts(prev => prev.map(a =>
          a.id === target.id ? { ...a, usedStorageGB: a.usedStorageGB + sizeGB } : a
        ));
        showToast(`Uploaded "${file.name}" to ${target.email}`);
      }).catch(err => {
        setUploadTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: 'error' } : t
        ));
        showToast(`Upload failed: ${file.name}`, 'error');
      });
    });
  }, [accounts, routingStrategy, currentFolderId, showToast]);

  // Virtual Folder Handlers
  const handleNavigateFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setFolderPath([{ id: null, name: 'Root Vault' }]);
    } else {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        setFolderPath(prev => {
          const idx = prev.findIndex(p => p.id === folderId);
          if (idx >= 0) return prev.slice(0, idx + 1);
          return [...prev, { id: folder.id, name: folder.name }];
        });
      }
    }
  }, [folders]);

  const handleCreateFolder = useCallback((name: string) => {
    foldersApi.createFolder(name, currentFolderId)
      .then(newFolder => {
        setFolders(prev => [...prev, newFolder]);
        showToast(`Folder "${name}" dibuat!`, 'success');
      })
      .catch(err => showToast(`Gagal membuat folder: ${err.message}`, 'error'));
  }, [currentFolderId, showToast]);

  const handleDeleteFolder = useCallback((folderId: string) => {
    foldersApi.deleteFolder(folderId)
      .then(() => {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        showToast('Folder dihapus', 'success');
      })
      .catch(err => showToast(`Gagal menghapus folder: ${err.message}`, 'error'));
  }, [showToast]);

  const handleDeleteFile = useCallback((fileId: string) => {
    const f = files.find(f => f.id === fileId);
    if (!f) return;
    const gb = Number((f.sizeBytes / 1e9).toFixed(3)) || 0.01;
    setFiles(prev => prev.filter(x => x.id !== fileId));
    setAccounts(accs => accs.map(a => a.id === f.driveId ? { ...a, usedStorageGB: Math.max(0, a.usedStorageGB - gb) } : a));
  }, [files]);

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
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
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
                <QuotaAnalyticsView accounts={accounts} files={files} onCleanDuplicates={() => {}} />
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
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />
    </div>
  );
}
