# REST API Specification
## Multi-Account Google Drive Virtual Cloud Storage Gateway

Base URL: `http://localhost:4000/api/v1`  
Authentication: `Authorization: Bearer <JWT_ACCESS_TOKEN>` or `X-API-Key: <API_KEY>`

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
Register a new user using Email and Password.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "fullName": "Jane Doe"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "uuid", "email": "user@example.com", "fullName": "Jane Doe" },
    "accessToken": "jwt_token_string"
  }
  ```

### `POST /auth/login`
Authenticate user and return JWT access token & set refresh cookie.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "jwt_token_string",
    "user": { "id": "uuid", "email": "user@example.com" }
  }
  ```

### `GET /auth/google/url`
Get Google OAuth Consent Screen URL for 1-click Sign-In / Register.
- **Response (200 OK)**:
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=..."
  }
  ```

---

## 2. Storage Accounts & Quota (`/connected-accounts`)

### `GET /connected-accounts`
List all connected Google Drive / S3 storage accounts for the current user.
- **Response (200 OK)**:
  ```json
  {
    "accounts": [
      {
        "id": "acc-uuid-1",
        "accountEmail": "drive1@gmail.com",
        "totalQuotaBytes": "16106127360",
        "usedQuotaBytes": "5368709120",
        "isActive": true,
        "priorityOrder": 1
      }
    ]
  }
  ```

### `GET /storage/summary`
Get aggregated multi-account storage summary.
- **Response (200 OK)**:
  ```json
  {
    "totalAccounts": 3,
    "totalQuotaBytes": 48318382080,
    "totalUsedBytes": 10737418240,
    "totalFreeBytes": 37580963840,
    "usagePercentage": 22.22
  }
  ```

### `POST /connected-accounts/:id/sync-quota`
Trigger a real-time quota sync with Google Drive API for a specific connected account.

---

## 3. Virtual File System & Folders (`/folders`, `/files`)

### `GET /folders`
Get virtual folder tree structure.
- **Query Params**: `parentId` (optional)
- **Response (200 OK)**:
  ```json
  {
    "folders": [
      { "id": "folder-1", "name": "Documents", "parentId": null, "createdAt": "2026-07-28T10:00:00Z" }
    ]
  }
  ```

### `POST /folders`
Create a new virtual folder.
- **Request Body**:
  ```json
  {
    "name": "Project Backups",
    "parentId": "folder-1"
  }
  ```

### `GET /files`
List virtual files.
- **Query Params**: `folderId` (optional), `q` (search term), `page`, `limit`
- **Response (200 OK)**:
  ```json
  {
    "files": [
      {
        "id": "file-uuid-1",
        "fileName": "report.pdf",
        "mimeType": "application/pdf",
        "sizeBytes": "2048576",
        "driveWebViewLink": "https://drive.google.com/file/d/...",
        "createdAt": "2026-07-28T10:30:00Z"
      }
    ]
  }
  ```

---

## 4. Streaming Upload & File Operations (`/uploads`, `/files/:id`)

### `POST /uploads` (Streaming Upload)
Upload a file. Streamed directly to Google Drive via backend memory pass-through (Busboy).
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data Fields**:
  - `folderId` (optional): Virtual folder UUID.
  - `file`: Binary file stream.
- **Response (201 Created)**:
  ```json
  {
    "message": "File uploaded successfully",
    "file": {
      "id": "file-uuid-99",
      "fileName": "document.docx",
      "sizeBytes": "1048576",
      "connectedAccountId": "acc-uuid-1"
    }
  }
  ```

### `GET /files/:id/download`
Stream file content back to client.
- **Response (200 OK)**: Binary stream (`Content-Disposition: attachment; filename="..."`).

### `DELETE /files/:id`
Delete virtual file metadata and remove physical file from Google Drive.
- **Response (200 OK)**:
  ```json
  {
    "message": "File deleted successfully"
  }
  ```
