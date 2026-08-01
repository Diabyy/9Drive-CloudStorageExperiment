/// <reference types="vite/client" />
import axios, { AxiosProgressEvent } from 'axios';
import { DriveAccount, VaultFile, VirtualFolder } from '../types';

const DEFAULT_BACKEND_URL = (import.meta as any).env?.PROD
  ? 'https://ninedrive-backend-k5he.onrender.com'
  : 'http://localhost:4000';

export const BACKEND_BASE_URL = (import.meta as any).env?.VITE_API_URL || DEFAULT_BACKEND_URL;
export const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to requests if present in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('9drive_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API
export const authApi = {
  async register(email: string, password: string, fullName?: string) {
    const res = await apiClient.post('/auth/register', { email, password, fullName });
    if (res.data.accessToken) {
      localStorage.setItem('9drive_access_token', res.data.accessToken);
    }
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('9drive_access_token', res.data.accessToken);
    }
    return res.data;
  },

  async getGoogleAuthUrl() {
    const res = await apiClient.get('/auth/google/url');
    return res.data.url as string;
  },

  async verifyOtp(email: string, otpCode: string) {
    const res = await apiClient.post('/auth/verify-otp', { email, otpCode });
    if (res.data.accessToken) {
      localStorage.setItem('9drive_access_token', res.data.accessToken);
    }
    return res.data;
  },

  async resendOtp(email: string) {
    const res = await apiClient.post('/auth/resend-otp', { email });
    return res.data;
  },

  async exchangeGoogleCode(code: string) {
    const res = await apiClient.post('/auth/google/exchange', { code });
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('9drive_access_token');
  },
};

// Connected Storage Accounts API
export const accountsApi = {
  async getAccounts(): Promise<DriveAccount[]> {
    const res = await apiClient.get('/connected-accounts');
    return res.data.accounts;
  },

  async getStorageSummary() {
    const res = await apiClient.get('/storage/summary');
    return res.data;
  },

  async syncQuota(accountId: string) {
    const res = await apiClient.post(`/connected-accounts/${accountId}/sync-quota`);
    return res.data;
  },

  async deleteAccount(accountId: string) {
    const res = await apiClient.delete(`/connected-accounts/${accountId}`);
    return res.data;
  },
};

// Virtual Folders API
export const foldersApi = {
  async getFolders(parentId?: string | null): Promise<VirtualFolder[]> {
    const res = await apiClient.get('/folders', { params: { parentId: parentId || 'null' } });
    return res.data.folders;
  },

  async createFolder(name: string, parentId?: string | null): Promise<VirtualFolder> {
    const res = await apiClient.post('/folders', { name, parentId });
    return res.data.folder;
  },

  async deleteFolder(folderId: string) {
    const res = await apiClient.delete(`/folders/${folderId}`);
    return res.data;
  },
};

// Virtual Files & Folders API
export const filesApi = {
  async getFiles(params?: { folderId?: string; q?: string; category?: string }): Promise<VaultFile[]> {
    const res = await apiClient.get('/files', { params });
    return res.data.files;
  },

  async renameFile(fileId: string, newName: string) {
    const res = await apiClient.patch(`/files/${fileId}`, { fileName: newName });
    return res.data;
  },

  async transferFile(fileId: string, targetDriveId: string) {
    const res = await apiClient.patch(`/files/${fileId}`, { connectedAccountId: targetDriveId });
    return res.data;
  },

  async deleteFile(fileId: string) {
    const res = await apiClient.delete(`/files/${fileId}`);
    return res.data;
  },

  getDownloadUrl(fileId: string) {
    const token = localStorage.getItem('9drive_access_token') || '';
    return `${API_BASE_URL}/files/${fileId}/download?token=${encodeURIComponent(token)}`;
  },

  getPreviewUrl(fileId: string) {
    const token = localStorage.getItem('9drive_access_token') || '';
    return `${API_BASE_URL}/files/${fileId}/download?token=${encodeURIComponent(token)}&inline=true`;
  },
};

// Real Stream Upload API with Progress Listener
export const uploadApi = {
  async uploadFile(
    file: File,
    folderId?: string,
    onProgress?: (percent: number, speedMbps: number) => void
  ): Promise<VaultFile> {
    const formData = new FormData();
    if (folderId) formData.append('folderId', folderId);
    formData.append('file', file);

    let startTime = Date.now();

    const res = await apiClient.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          const durationSec = (Date.now() - startTime) / 1000 || 0.1;
          const megabits = (progressEvent.loaded * 8) / (1024 * 1024);
          const speedMbps = Number((megabits / durationSec).toFixed(1));
          onProgress(percent, speedMbps);
        }
      },
    });

    const raw = res.data.file;
    // Normalize BE response to full VaultFile shape
    const getMimeCategory = (mime: string): VaultFile['category'] => {
      if (mime.startsWith('image/')) return 'images';
      if (mime.startsWith('video/') || mime.startsWith('audio/')) return 'videos';
      if (mime.includes('zip') || mime.includes('tar') || mime.includes('gzip') || mime.includes('x-rar')) return 'archives';
      if (mime.includes('javascript') || mime.includes('typescript') || mime.includes('json') || mime.includes('html') || mime.includes('css')) return 'code';
      return 'documents';
    };
    return {
      ...raw,
      isStarred: false,
      isShared: false,
      category: getMimeCategory(raw.mimeType || ''),
    } as VaultFile;
  },
};
