import { useState, useCallback, useEffect } from 'react';
import type { DriveAccount, VaultFile, VirtualFolder, RoutingStrategy, UploadTask } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_FILES } from '../data/mockData';
import { accountsApi, filesApi, foldersApi, authApi, uploadApi } from '../services/api';

export function useVaultData(lang: 'id' | 'en' = 'id') {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; fullName?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [accounts, setAccounts] = useState<DriveAccount[]>(INITIAL_ACCOUNTS);
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root Vault' },
  ]);

  const [routingStrategy, setRoutingStrategy] = useState<RoutingStrategy>('max-free-space');
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshVaultContent = useCallback((folderId: string | null) => {
    foldersApi.getFolders(folderId)
      .then(fList => setFolders(fList || []))
      .catch(() => {});

    filesApi.getFiles({ folderId: folderId || 'root' })
      .then(fs => { if (fs) setFiles(fs); })
      .catch(() => {});
  }, []);

  // Handle Google OAuth callback redirect ?code=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      authApi.exchangeGoogleCode(code)
        .then((res) => {
          if (res.accessToken) {
            localStorage.setItem('9drive_access_token', res.accessToken);
          }
          if (res.user) {
            setCurrentUser(res.user);
            setIsAuthModalOpen(false);
          }
          accountsApi.getAccounts().then(accs => setAccounts(accs || [])).catch(() => {});
          refreshVaultContent(currentFolderId);
          showToast(lang === 'id' ? `Berhasil Login & Hubungkan Google Drive: ${res.email}` : `Connected Google Drive: ${res.email}`, 'success');
        })
        .catch((err: any) => {
          showToast(`OAuth Error: ${err.response?.data?.error || err.message}`, 'error');
        });
    }
  }, [currentFolderId, lang, refreshVaultContent, showToast]);

  // Check user session on mount
  useEffect(() => {
    const token = localStorage.getItem('9drive_access_token');
    if (token) {
      authApi.getMe()
        .then(res => {
          setCurrentUser(res.user);
          setIsAuthModalOpen(false);
          accountsApi.getAccounts().then(accs => { if (accs?.length) setAccounts(accs); }).catch(() => {});
          refreshVaultContent(currentFolderId);
        })
        .catch(() => {
          localStorage.removeItem('9drive_access_token');
          setCurrentUser(null);
          setIsAuthModalOpen(true);
        });
    } else {
      setIsAuthModalOpen(true);
    }
  }, [currentFolderId, refreshVaultContent]);

  const handleAuthSuccess = useCallback((user: { id: string; email: string; fullName?: string }) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(lang === 'id' ? `Selamat datang, ${user.fullName || user.email}!` : `Welcome, ${user.fullName || user.email}!`, 'success');
    accountsApi.getAccounts().then(accs => setAccounts(accs || [])).catch(() => setAccounts([]));
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

  const handleUploadFiles = useCallback((fileList: FileList | File[]) => {
    if (accounts.length === 0) {
      showToast(lang === 'id' ? 'Hubungkan setidaknya 1 Google Drive!' : 'Connect at least 1 Google Drive!', 'error');
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
  }, [accounts, routingStrategy, currentFolderId, lang, showToast]);

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
    filesApi.deleteFile(fileId).catch(() => {});
    const gb = Number((f.sizeBytes / 1e9).toFixed(3)) || 0.01;
    setFiles(prev => prev.filter(x => x.id !== fileId));
    setAccounts(accs => accs.map(a => a.id === f.driveId ? { ...a, usedStorageGB: Math.max(0, a.usedStorageGB - gb) } : a));
    showToast('File dihapus', 'success');
  }, [files, showToast]);

  return {
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
  };
}
