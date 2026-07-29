import { google } from 'googleapis';
import { Readable } from 'node:stream';
import { decryptToken } from './crypto.js';

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const defaultRedirect = process.env.FRONTEND_URL || 'http://localhost:3000';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirect;

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const about = await drive.about.get({ fields: 'storageQuota, user' });
  const quota = about.data.storageQuota || {};
  const user = about.data.user || {};

  return {
    tokens,
    email: user.emailAddress || 'drive.account@gmail.com',
    name: user.displayName || 'Google Drive Account',
    totalQuotaBytes: BigInt(quota.limit || '16106127360'),
    usedQuotaBytes: BigInt(quota.usage || '0'),
  };
}

export async function getAuthenticatedDriveClient(encryptedRefreshToken: string) {
  const refreshToken = decryptToken(encryptedRefreshToken);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function getDriveAccountQuota(encryptedRefreshToken: string) {
  const drive = await getAuthenticatedDriveClient(encryptedRefreshToken);
  const about = await drive.about.get({ fields: 'storageQuota, user' });
  const quota = about.data.storageQuota || {};
  const user = about.data.user || {};

  return {
    email: user.emailAddress || '',
    name: user.displayName || '',
    totalQuotaBytes: BigInt(quota.limit || '16106127360'), // Default 15GB
    usedQuotaBytes: BigInt(quota.usage || '0'),
  };
}

/**
 * Streams a readable file stream directly to Google Drive
 */
export async function streamUploadToDrive(params: {
  encryptedRefreshToken: string;
  fileStream: Readable;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  rootFolderId?: string;
}) {
  const drive = await getAuthenticatedDriveClient(params.encryptedRefreshToken);

  const fileMetadata: any = {
    name: params.fileName,
  };

  if (params.rootFolderId) {
    fileMetadata.parents = [params.rootFolderId];
  }

  const media = {
    mimeType: params.mimeType,
    body: params.fileStream,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink',
  });

  return {
    driveFileId: response.data.id || '',
    driveWebViewLink: response.data.webViewLink || '',
  };
}

/**
 * Finds or creates the dedicated '9DRIVE_VAULT' system folder in Google Drive
 */
export async function getOrCreateVaultFolder(encryptedRefreshToken: string): Promise<string> {
  const drive = await getAuthenticatedDriveClient(encryptedRefreshToken);
  const folderName = '9DRIVE_VAULT';

  // Check if folder already exists in Google Drive root
  const searchRes = await drive.files.list({
    q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id!;
  }

  // Create new folder
  const createRes = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dedicated system storage vault folder created by 9DRIVE',
    },
    fields: 'id',
  });

  return createRes.data.id!;
}

