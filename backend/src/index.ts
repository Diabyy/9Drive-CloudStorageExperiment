import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

import express from 'express';
import cors from 'cors';
import busboy from 'busboy';
import { Readable } from 'node:stream';
import { PrismaClient } from '@prisma/client';
import { generateAuthUrl, exchangeCodeForTokens, streamUploadToDrive, getAuthenticatedDriveClient, getOrCreateVaultFolder } from './services/googleDrive.js';
import { encryptToken } from './services/crypto.js';
import { backupDatabaseToDrive } from './services/dbBackup.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.APP_PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: [
    FRONTEND_URL,
    'https://cloudstorage9drive.web.app',
    'https://cloudstorage9drive.firebaseapp.com',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// ROOT & HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    service: '9Drive Backend Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/v1/files',
      connectedAccounts: '/api/v1/connected-accounts',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '9Drive Gateway Backend', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM — Reset Cloud Database
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/system/reset-db', async (_req, res) => {
  try {
    await prisma.virtualFile.deleteMany({});
    await prisma.virtualFolder.deleteMany({});
    await prisma.connectedAccount.deleteMany({});
    await prisma.user.deleteMany({});
    res.json({ success: true, message: 'Cloud database reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Generate Google OAuth URL
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/auth/google/url', (_req, res) => {
  try {
    const url = generateAuthUrl();
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate Google OAuth URL' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Google OAuth Code Exchange (Frontend Callback)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/auth/google/exchange', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const result = await exchangeCodeForTokens(code);
    const refreshToken = result.tokens.refresh_token || result.tokens.access_token || '';
    const encryptedAccess = encryptToken(result.tokens.access_token || '');
    const encryptedRefresh = encryptToken(refreshToken);

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: 'demo@9drive.io', fullName: 'Demo User' },
      });
    }

    let rootFolderId: string | null = null;
    try {
      rootFolderId = await getOrCreateVaultFolder(encryptedRefresh);
    } catch (fErr) {
      console.warn('Could not auto-create 9DRIVE_VAULT folder during OAuth exchange:', fErr);
    }

    const account = await prisma.connectedAccount.upsert({
      where: { userId_accountEmail: { userId: defaultUser.id, accountEmail: result.email } },
      update: {
        accessTokenEnc: encryptedAccess,
        refreshTokenEnc: encryptedRefresh,
        tokenExpiresAt: new Date(result.tokens.expiry_date || Date.now() + 3600 * 1000),
        totalQuotaBytes: result.totalQuotaBytes,
        usedQuotaBytes: result.usedQuotaBytes,
        rootDriveFolderId: rootFolderId,
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        userId: defaultUser.id,
        accountEmail: result.email,
        accountName: result.name,
        provider: 'GOOGLE_DRIVE',
        accessTokenEnc: encryptedAccess,
        refreshTokenEnc: encryptedRefresh,
        tokenExpiresAt: new Date(result.tokens.expiry_date || Date.now() + 3600 * 1000),
        totalQuotaBytes: result.totalQuotaBytes,
        usedQuotaBytes: result.usedQuotaBytes,
        rootDriveFolderId: rootFolderId,
        isActive: true,
      },
    });

    backupDatabaseToDrive(encryptedRefresh);
    res.json({ success: true, email: result.email, account });
  } catch (error: any) {
    console.error('OAuth Exchange Error:', error);
    res.status(500).json({ error: error.message || 'OAuth code exchange failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Google OAuth Callback (receives code from Google, saves tokens to DB)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/connected-accounts/google/callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

  if (error === 'access_denied') {
    return res.redirect(`${FRONTEND_URL}/?error=access_denied`);
  }
  if (!code) return res.redirect(`${FRONTEND_URL}/?error=missing_code`);

  try {
    const result = await exchangeCodeForTokens(code);
    const refreshToken = result.tokens.refresh_token || result.tokens.access_token || '';
    const encryptedAccess = encryptToken(result.tokens.access_token || '');
    const encryptedRefresh = encryptToken(refreshToken);

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: 'demo@9drive.io', fullName: 'Demo User' },
      });
    }

    let rootFolderId: string | null = null;
    try {
      rootFolderId = await getOrCreateVaultFolder(encryptedRefresh);
    } catch (fErr) {
      console.warn('Could not auto-create 9DRIVE_VAULT folder during OAuth callback:', fErr);
    }

    await prisma.connectedAccount.upsert({
      where: { userId_accountEmail: { userId: defaultUser.id, accountEmail: result.email } },
      update: {
        accessTokenEnc: encryptedAccess,
        refreshTokenEnc: encryptedRefresh,
        tokenExpiresAt: new Date(result.tokens.expiry_date || Date.now() + 3600 * 1000),
        totalQuotaBytes: result.totalQuotaBytes,
        usedQuotaBytes: result.usedQuotaBytes,
        rootDriveFolderId: rootFolderId,
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        userId: defaultUser.id,
        accountEmail: result.email,
        accountName: result.name,
        provider: 'GOOGLE_DRIVE',
        accessTokenEnc: encryptedAccess,
        refreshTokenEnc: encryptedRefresh,
        tokenExpiresAt: new Date(result.tokens.expiry_date || Date.now() + 3600 * 1000),
        totalQuotaBytes: result.totalQuotaBytes,
        usedQuotaBytes: result.usedQuotaBytes,
        rootDriveFolderId: rootFolderId,
        isActive: true,
      },
    });

    res.redirect(`${FRONTEND_URL}/?connected=true&email=${encodeURIComponent(result.email)}`);
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`${FRONTEND_URL}/?error=${encodeURIComponent(error.message || 'oauth_failed')}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/connected-accounts — List all connected Google Drive accounts
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/connected-accounts', async (_req, res) => {
  try {
    const accounts = await prisma.connectedAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    const colors = [
      'from-cyan-500 to-indigo-600',
      'from-indigo-500 to-purple-600',
      'from-emerald-400 to-teal-600',
      'from-rose-500 to-pink-600',
      'from-amber-400 to-orange-500',
    ];
    const accents = ['cyan', 'purple', 'emerald', 'rose', 'amber'];

    const formatted = accounts.map((acc, idx) => ({
      id: acc.id,
      name: acc.accountName || `Google Drive (${acc.accountEmail.split('@')[0]})`,
      email: acc.accountEmail,
      totalStorageGB: Number(acc.totalQuotaBytes) / 1e9,
      usedStorageGB: Number(acc.usedQuotaBytes) / 1e9,
      color: colors[idx % colors.length],
      accentColor: accents[idx % accents.length],
      isPrimary: idx === 0,
      status: 'connected',
      connectedAt: acc.createdAt.toISOString().split('T')[0],
    }));

    res.json({ accounts: formatted });
  } catch (error: any) {
    console.error('GET /connected-accounts error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch connected accounts' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/storage/summary — Aggregate quota across all connected accounts
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/storage/summary', async (_req, res) => {
  try {
    const accounts = await prisma.connectedAccount.findMany({ where: { isActive: true } });

    const totalQuotaBytes = accounts.reduce((sum, a) => sum + Number(a.totalQuotaBytes), 0);
    const totalUsedBytes  = accounts.reduce((sum, a) => sum + Number(a.usedQuotaBytes), 0);
    const totalFreeBytes  = totalQuotaBytes - totalUsedBytes;
    const usagePercentage = totalQuotaBytes > 0
      ? Number(((totalUsedBytes / totalQuotaBytes) * 100).toFixed(1))
      : 0;

    res.json({
      totalAccounts: accounts.length,
      totalQuotaBytes,
      totalUsedBytes,
      totalFreeBytes,
      usagePercentage,
    });
  } catch (error: any) {
    console.error('GET /storage/summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch storage summary' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUAL FOLDERS API
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/folders', async (req, res) => {
  try {
    const parentId = (req.query.parentId as string) || null;
    const folders = await prisma.virtualFolder.findMany({
      where: { parentId: parentId === 'null' || parentId === '' ? null : parentId },
      orderBy: { name: 'asc' },
    });
    res.json({ folders });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch folders' });
  }
});

app.post('/api/v1/folders', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Folder name is required' });

    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: { email: 'demo@9drive.io', fullName: 'Demo User' },
      });
    }

    const folder = await prisma.virtualFolder.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
        userId: defaultUser.id,
      },
    });

    res.json({ folder });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create folder' });
  }
});

app.delete('/api/v1/folders/:id', async (req, res) => {
  try {
    await prisma.virtualFolder.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete folder' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/files — List all virtual files stored in DB
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/files', async (req, res) => {
  try {
    const { q, category, folderId } = req.query as { q?: string; category?: string; folderId?: string };

    const files = await prisma.virtualFile.findMany({
      where: {
        ...(q ? { fileName: { contains: q } } : {}),
        ...(category && category !== 'all' ? { mimeType: { contains: category } } : {}),
        ...(folderId ? (folderId === 'root' ? { folderId: null } : { folderId }) : {}),
      },
      include: { connectedAccount: true },
      orderBy: { createdAt: 'desc' },
    });

    const getMimeCategory = (mimeType: string): string => {
      if (mimeType.startsWith('image/')) return 'images';
      if (mimeType.startsWith('video/') || mimeType.startsWith('audio/')) return 'videos';
      if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('spreadsheet') || mimeType.includes('presentation') || mimeType === 'text/plain') return 'documents';
      if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('gzip') || mimeType.includes('x-rar')) return 'archives';
      if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('xml')) return 'code';
      return 'documents';
    };

    const formatBytes = (bytes: number): string => {
      if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
      if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
      if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
      return `${bytes} B`;
    };

    const formatted = files.map(f => ({
      id: f.id,
      name: f.fileName,
      sizeBytes: Number(f.sizeBytes),
      formattedSize: formatBytes(Number(f.sizeBytes)),
      mimeType: f.mimeType,
      category: getMimeCategory(f.mimeType),
      driveId: f.connectedAccountId,
      driveName: f.connectedAccount.accountName || f.connectedAccount.accountEmail,
      uploadDate: f.createdAt.toISOString().replace('T', ' ').slice(0, 16),
      isShared: f.isPublic,
      folderId: f.folderId || undefined,
      sharedUrl: f.shareToken ? `${FRONTEND_URL}/s/${f.shareToken}` : undefined,
      driveWebViewLink: f.driveWebViewLink || undefined,
    }));

    res.json({ files: formatted });
  } catch (error: any) {
    console.error('GET /files error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch files' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/files/:id — Delete file record from DB
// ─────────────────────────────────────────────────────────────────────────────
app.delete('/api/v1/files/:id', async (req, res) => {
  try {
    await prisma.virtualFile.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete file' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/uploads — Stream-upload file directly to Google Drive (no disk write)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/uploads', async (req, res) => {
  try {
    // Pick the best account: most free space
    const accounts = await prisma.connectedAccount.findMany({
      where: { isActive: true },
      orderBy: [{ priorityOrder: 'asc' }],
    });

    if (accounts.length === 0) {
      return res.status(400).json({ error: 'No connected Google Drive accounts found. Please connect at least one account.' });
    }

    // MOST_AVAILABLE: choose the account with the most free bytes
    const target = accounts.reduce((best, cur) => {
      const bestFree = Number(best.totalQuotaBytes) - Number(best.usedQuotaBytes);
      const curFree  = Number(cur.totalQuotaBytes)  - Number(cur.usedQuotaBytes);
      return curFree > bestFree ? cur : best;
    });

    const bb = busboy({ headers: req.headers });
    let fileUploaded = false;
    let targetVirtualFolderId: string | null = null;

    bb.on('field', (name, val) => {
      if (name === 'folderId' && val) {
        targetVirtualFolderId = val;
      }
    });

    bb.on('file', (_fieldname, fileStream, info) => {
      const { filename, mimeType } = info;
      fileUploaded = true;

      // Collect all chunks into memory (safe for typical files < 5 GB)
      const chunks: Buffer[] = [];
      fileStream.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      fileStream.on('end', async () => {
      try {
        const combined = Buffer.concat(chunks);
        const sizeBytes = combined.length;
        const bufferStream = Readable.from(combined);

        // Ensure 9DRIVE_VAULT system folder exists in Google Drive
        let rootFolderId = target.rootDriveFolderId;
        if (!rootFolderId) {
          try {
            rootFolderId = await getOrCreateVaultFolder(target.refreshTokenEnc);
            await prisma.connectedAccount.update({
              where: { id: target.id },
              data: { rootDriveFolderId: rootFolderId },
            });
          } catch (vErr) {
            console.warn('Could not create 9DRIVE_VAULT folder, uploading to root:', vErr);
          }
        }

        const driveResult = await streamUploadToDrive({
          encryptedRefreshToken: target.refreshTokenEnc,
          fileStream: bufferStream,
          fileName: filename,
          mimeType: mimeType || 'application/octet-stream',
          sizeBytes,
          rootFolderId: rootFolderId || undefined,
        });

        // Save file metadata to DB
        let defaultUser = await prisma.user.findFirst();
        if (!defaultUser) {
          defaultUser = await prisma.user.create({
            data: { email: 'demo@9drive.io', fullName: 'Demo User' },
          });
        }

        const savedFile = await prisma.virtualFile.create({
          data: {
            fileName: filename,
            originalName: filename,
            mimeType: mimeType || 'application/octet-stream',
            sizeBytes: BigInt(sizeBytes),
            connectedAccountId: target.id,
            driveFileId: driveResult.driveFileId,
            driveWebViewLink: driveResult.driveWebViewLink,
            folderId: targetVirtualFolderId || null,
            userId: defaultUser.id,
          },
          include: { connectedAccount: true },
        });

        // Update used quota on the account
        await prisma.connectedAccount.update({
          where: { id: target.id },
          data: { usedQuotaBytes: { increment: BigInt(sizeBytes) } },
        });

        const formatBytes = (b: number) => {
          if (b >= 1e9) return `${(b / 1e9).toFixed(2)} GB`;
          if (b >= 1e6) return `${(b / 1e6).toFixed(2)} MB`;
          if (b >= 1e3) return `${(b / 1e3).toFixed(1)} KB`;
          return `${b} B`;
        };

        res.json({
          file: {
            id: savedFile.id,
            name: savedFile.fileName,
            sizeBytes: Number(savedFile.sizeBytes),
            formattedSize: formatBytes(Number(savedFile.sizeBytes)),
            mimeType: savedFile.mimeType,
            driveId: target.id,
            driveName: target.accountName || target.accountEmail,
            uploadDate: savedFile.createdAt.toISOString().replace('T', ' ').slice(0, 16),
            driveWebViewLink: savedFile.driveWebViewLink,
          },
        });
      } catch (uploadErr: any) {
        console.error('Stream upload error:', uploadErr);
        if (!res.headersSent) {
          res.status(500).json({ error: uploadErr.message || 'Upload to Google Drive failed' });
        }
      }
      });
    });

    bb.on('error', (err: Error) => {
      console.error('Busboy parse error:', err);
      if (!res.headersSent) res.status(400).json({ error: 'Invalid multipart form data' });
    });

    req.pipe(bb);
  } catch (error: any) {
    console.error('POST /uploads error:', error);
    if (!res.headersSent) res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/files/:id/download — Proxy download URL from Google Drive
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/files/:id/download', async (req, res) => {
  try {
    const file = await prisma.virtualFile.findUnique({
      where: { id: req.params.id },
      include: { connectedAccount: true },
    });
    if (!file) return res.status(404).json({ error: 'File not found' });

    const drive = await getAuthenticatedDriveClient(file.connectedAccount.refreshTokenEnc);
    const driveRes = await drive.files.get(
      { fileId: file.driveFileId, alt: 'media' },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Content-Type', file.mimeType);
    (driveRes.data as any).pipe(res);
  } catch (error: any) {
    console.error('GET /files/:id/download error:', error);
    res.status(500).json({ error: error.message || 'Download failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`⚡ [9Drive Backend Gateway] running on http://localhost:${PORT}`);
});
