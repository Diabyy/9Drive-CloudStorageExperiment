# UI Requirements & Component Specification
## Personal Multi-Drive Storage Vault

---

## 1. Executive UX Concept
The **Personal Multi-Drive Vault** is a sleek, modern, web-based cloud storage dashboard designed to seamlessly aggregate storage capacity from multiple Google Drive accounts (and S3 providers) into a single, unified workspace.

The core goal of the UI is to completely abstract away the underlying physical storage locations. Users interact with a single virtual drive hierarchy without worrying about which Google account holds a specific file.

---

## 2. Key UI Component Specifications

### 2.1 Quota Visualizer Bar & Health Panel (`<QuotaVisualizer />`)

#### Requirements:
- **Combined Storage Header**: Shows total virtual capacity (e.g. `Total Storage: 45.0 GB | 11.2 GB Used (24.8%) | 33.8 GB Free`).
- **Segmented Storage Bar**: A multi-color HTML5/CSS progress bar showing the storage breakdown of each connected Google Drive account:
  - Account 1 (`drive.work@gmail.com`): Blue segment (4.2 GB used of 15 GB)
  - Account 2 (`drive.personal@gmail.com`): Purple segment (6.0 GB used of 15 GB)
  - Account 3 (`drive.archive@gmail.com`): Emerald segment (1.0 GB used of 15 GB)
- **Account Health Indicator Cards**: Cards showing connection status (Active / Token Expired / Syncing), last synced timestamp, and individual percentage fill.

```
+-----------------------------------------------------------------------------------+
| TOTAL STORAGE: 45.0 GB | 11.2 GB Used (24.8%) | 33.8 GB Available                  |
| [============ Account 1 (4.2GB) ===|====== Account 2 (6.0GB) ===|== Acc 3 (1.0GB)=| |
+-----------------------------------------------------------------------------------+
```

---

### 2.2 Unified File Browser (`<UnifiedFileBrowser />`)

#### Requirements:
- **Single Workspace Tree**: Renders all virtual files and folders in a single directory view, regardless of which physical Google Drive account stores them.
- **Breadcrumb Path**: Shows virtual path (e.g., `Home / Projects / 2026 / Architecture_Specs`).
- **Account Location Tag**: Every file row displays a small badge/pill indicating the physical account origin (e.g. `[Drive #1: work@gmail.com]`).
- **View Modes**: Toggle between **Grid View** (with thumbnail previews for images/PDFs) and **Compact List View**.
- **Contextual Action Menu (Right Click / 3-Dots Menu)**:
  - 👁️ **Preview**: Opens image, video, or PDF modal preview directly from stream.
  - ⬇️ **Download**: Initiates direct pass-through stream download.
  - ✏️ **Rename**: Edits virtual filename in DB.
  - 📁 **Move**: Reassigns virtual parent folder ID.
  - 🔗 **Share Link**: Generates a public shareable URL.
  - 🗑️ **Delete**: Soft-deletes or permanently removes file from target Drive.

---

### 2.3 Drag & Drop Upload Widget (`<UploadWidget />`)

#### Requirements:
- **Drop Zone Box**: Full-page and dedicated card drag-and-drop zone with visual hover effects (`border-dashed`, subtle glow).
- **Target Routing Preview**: Displays real-time auto-routing information *before* and *during* upload:
  > 💡 *"Auto-Routing Policy: File will be uploaded to **drive.archive@gmail.com** (Largest Free Space: 14.0 GB free)"*
- **Floating Upload Progress Drawer (Bottom-Right)**:
  - Displays queued, uploading, and completed files.
  - Shows file name, size, upload speed (MB/s), progress bar (0-100%), and assigned target Drive account badge.

---

### 2.4 Connected Accounts Management Panel (`<ConnectedAccountsPanel />`)

#### Requirements:
- **Account List Cards**:
  - Displays avatar, Google email, storage bar, status badge (`Active`), and priority badge.
  - Actions: **Sync Drive Quota**, **Change Priority**, and **Disconnect Account**.
- **"Connect Google Drive Account" Button**:
  - Triggers OAuth popup window / redirect to Google Cloud consent screen.
  - Automatically refreshes the Quota Visualizer upon successful connection callback.

---

## 3. Frontend Data & State Specification (TypeScript Interfaces)

```typescript
// Storage Account Model
export interface ConnectedAccount {
  id: string;
  accountEmail: string;
  accountName?: string;
  provider: 'GOOGLE_DRIVE' | 'S3_COMPATIBLE';
  totalQuotaBytes: number;
  usedQuotaBytes: number;
  freeQuotaBytes: number;
  isActive: boolean;
  priorityOrder: number;
  lastSyncedAt: string;
}

// Virtual File Model
export interface VirtualFile {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  folderId: string | null;
  connectedAccountId: string;
  connectedAccountEmail: string;
  driveWebViewLink?: string;
  createdAt: string;
}

// Upload Progress Model
export interface UploadTask {
  id: string;
  fileName: string;
  sizeBytes: number;
  bytesUploaded: number;
  progressPercent: number;
  targetAccountEmail: string;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'ERROR';
  errorMessage?: string;
}
```

---

## 4. Summary of Document Updates

The overall project documentation suite has been updated to align with the **Personal Multi-Drive Vault**:
1. **`PRD_AND_ARCHITECTURE.md`**: Updated key functional requirements to emphasize Personal Multi-Drive Vault features.
2. **`API_SPECIFICATION.md`**: Verified endpoints for multi-account quota summary, virtual folder tree, and streaming uploads.
3. **`UI_REQUIREMENTS_SPECIFICATION.md`** *(This File)*: Serves as the authoritative spec for building the frontend in React/Vite or generating UI components in Google AI Studio.
