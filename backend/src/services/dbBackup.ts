import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { drive_v3 } from 'googleapis';
import { getAuthenticatedDriveClient } from './googleDrive.js';

const DB_PATH = path.resolve(process.cwd(), 'prisma', 'dev.db');
const BACKUP_FOLDER_NAME = '9DRIVE_SYSTEM_BACKUP';
const BACKUP_FILE_NAME = '9drive_dev.db';

/**
 * Ensures system backup folder exists in Google Drive
 */
async function getOrCreateBackupFolder(drive: drive_v3.Drive): Promise<string> {
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
export async function backupDatabaseToDrive(encryptedRefreshToken: string): Promise<void> {
  try {
    if (!fs.existsSync(DB_PATH)) return;

    const drive = await getAuthenticatedDriveClient(encryptedRefreshToken);
    const folderId = await getOrCreateBackupFolder(drive);

    const searchRes = await drive.files.list({
      q: `'${folderId}' in parents and name = '${BACKUP_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const fileStream = fs.createReadStream(DB_PATH);

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      const fileId = searchRes.data.files[0].id!;
      await drive.files.update({
        fileId,
        media: {
          mimeType: 'application/x-sqlite3',
          body: fileStream,
        },
      });
      console.log(`[DB BACKUP] Updated ${BACKUP_FILE_NAME} on Google Drive (ID: ${fileId})`);
    } else {
      const createRes = await drive.files.create({
        requestBody: {
          name: BACKUP_FILE_NAME,
          parents: [folderId],
          mimeType: 'application/x-sqlite3',
          description: 'Automated database backup for 9DRIVE',
        },
        media: {
          mimeType: 'application/x-sqlite3',
          body: fileStream,
        },
        fields: 'id',
      });
      console.log(`[DB BACKUP] Created ${BACKUP_FILE_NAME} on Google Drive (ID: ${createRes.data.id})`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[DB BACKUP] Cloud backup to Google Drive skipped/failed:', msg);
  }
}
