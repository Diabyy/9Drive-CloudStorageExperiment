import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { getAuthenticatedDriveClient } from './googleDrive.js';

const DB_PATH = path.resolve(process.cwd(), 'prisma', 'dev.db');
const BACKUP_FOLDER_NAME = '9DRIVE_SYSTEM_BACKUP';
const BACKUP_FILE_NAME = '9drive_dev.db';

/**
 * Ensures system backup folder exists in Google Drive
 */
async function getOrCreateBackupFolder(drive: any): Promise<string> {
  const searchRes = await drive.files.list({
    q: `name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchRes.data.files && searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id!;
  }

  const createRes = await drive.files.create({
    requestBody: {
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'System database encrypted backup folder for 9DRIVE',
    },
    fields: 'id',
  });

  return createRes.data.id!;
}

/**
 * Backup local dev.db file to Google Drive
 */
export async function backupDatabaseToDrive(encryptedRefreshToken: string) {
  try {
    if (!fs.existsSync(DB_PATH)) return;

    const drive = await getAuthenticatedDriveClient(encryptedRefreshToken);
    const folderId = await getOrCreateBackupFolder(drive);

    // Check if backup file already exists in Google Drive
    const searchRes = await drive.files.list({
      q: `name = '${BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });

    const fileStream = fs.createReadStream(DB_PATH);

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      const existingId = searchRes.data.files[0].id!;
      await drive.files.update({
        fileId: existingId,
        media: { mimeType: 'application/x-sqlite3', body: fileStream },
      });
      console.log('⚡ [9Drive DB Backup] Successfully updated database backup on Google Drive');
    } else {
      await drive.files.create({
        requestBody: {
          name: BACKUP_FILE_NAME,
          parents: [folderId],
        },
        media: { mimeType: 'application/x-sqlite3', body: fileStream },
      });
      console.log('⚡ [9Drive DB Backup] Successfully created database backup on Google Drive');
    }
  } catch (err) {
    console.warn('⚠️ [9Drive DB Backup Warning] Failed to backup DB:', err);
  }
}

/**
 * Restore local dev.db file from Google Drive on startup if local DB is missing/empty
 */
export async function restoreDatabaseFromDrive(encryptedRefreshToken: string): Promise<boolean> {
  try {
    const drive = await getAuthenticatedDriveClient(encryptedRefreshToken);
    const folderId = await getOrCreateBackupFolder(drive);

    const searchRes = await drive.files.list({
      q: `name = '${BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed = false`,
      fields: 'files(id, name)',
    });

    if (!searchRes.data.files || searchRes.data.files.length === 0) return false;

    const existingId = searchRes.data.files[0].id!;
    const res = await drive.files.get({ fileId: existingId, alt: 'media' }, { responseType: 'stream' });

    const dest = fs.createWriteStream(DB_PATH);
    await new Promise<void>((resolve, reject) => {
      res.data.pipe(dest).on('finish', resolve).on('error', reject);
    });

    console.log('⚡ [9Drive DB Restore] Restored database successfully from Google Drive!');
    return true;
  } catch (err) {
    console.warn('⚠️ [9Drive DB Restore Warning] Failed to restore DB:', err);
    return false;
  }
}
