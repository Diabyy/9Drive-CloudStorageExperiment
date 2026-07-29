export type DriveAccount = {
  id: string;
  name: string;
  email: string;
  totalStorageGB: number;
  usedStorageGB: number;
  color: string; // Tailwind gradient or hex color
  accentColor: string; // e.g., 'cyan', 'purple', 'emerald', 'amber', 'rose'
  isPrimary?: boolean;
  status: 'connected' | 'syncing' | 'warning' | 'disconnected';
  connectedAt: string;
};

export type FileCategory = 'all' | 'documents' | 'images' | 'videos' | 'archives' | 'code';

export type VirtualFolder = {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
};

export type VaultFile = {
  id: string;
  name: string;
  sizeBytes: number;
  formattedSize: string;
  mimeType: string;
  category: 'documents' | 'images' | 'videos' | 'archives' | 'code';
  driveId: string; // references DriveAccount.id
  driveName: string; // e.g. "Google Drive #1"
  uploadDate: string;
  isStarred?: boolean;
  isShared?: boolean;
  sharedUrl?: string;
  thumbnailUrl?: string;
  contentPreview?: string; // Text content or description for simulation
  folderId?: string;
};

export type UploadTask = {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  formattedSize: string;
  targetDriveId: string;
  targetDriveEmail: string;
  progressPercentage: number;
  uploadSpeedMbps: number;
  status: 'queued' | 'uploading' | 'paused' | 'completed' | 'error';
  startedAt: number;
};

export type NavView = 
  | 'all-files'
  | 'recent'
  | 'shared'
  | 'analytics'
  | 'accounts'
  | 'guide'
  | 'settings';

export type RoutingStrategy = 'max-free-space' | 'balanced' | 'priority-first';
