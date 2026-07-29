# Setup & Configuration Guide
## Multi-Account Google Drive Virtual Cloud Storage Gateway

This guide covers everything required to set up Google Cloud Console credentials, local environment variables, database migrations, and development servers.

---

## 1. Google Cloud Console Setup (Mandatory)

Follow these steps to obtain your **Client ID** and **Client Secret**.

### Step 1.1: Create a Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top navigation bar and click **New Project**.
3. Name your project (e.g., `9Drive-Storage-Gateway`) and click **Create**.

### Step 1.2: Enable Google Drive API
1. Navigate to **APIs & Services > Library** from the left navigation drawer.
2. In the search box, type `Google Drive API`.
3. Select **Google Drive API** from the results and click **Enable**.

### Step 1.3: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the required fields:
   - **App name**: `9Drive Storage`
   - **User support email**: Your Google email.
   - **Developer contact information**: Your email address.
4. Click **Save and Continue**.
5. Under **Scopes**, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/drive.file` *(Recommended: grants access only to files created by this app)*
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Click **Save and Continue**.
7. Under **Test Users**, click **+ Add Users** and add every Google Account email address you intend to connect to the app during development.
   > ⚠️ **CRITICAL**: If an email is NOT added under Test Users, Google will reject OAuth authentication with an `Error 403: access_denied`.

### Step 1.4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials > OAuth client ID**.
3. Select **Application type**: `Web application`.
4. Name: `9Drive Web Client`.
5. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` *(Frontend Vite dev server)*
6. Add **Authorized redirect URIs**:
   - `http://localhost:4000/connected-accounts/google/callback` *(Backend OAuth callback)*
7. Click **Create**.
8. Copy your **Client ID** and **Client Secret**.

---

## 2. Environment Variables Configuration

Create the `.env` file in your `backend/` directory:

### `backend/.env`
```env
# Server Config
APP_PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"

# Database Connection (MySQL 8+)
DATABASE_URL="mysql://root:rootpassword@localhost:3306/9drive"

# Security & Encryption (MUST be long random strings)
JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-minimum-32-chars"
TOKEN_ENCRYPTION_KEY="32-bytes-long-secret-key-for-aes-256!" # Exactly 32 chars
ACCESS_TOKEN_TTL_SECONDS=900    # 15 minutes
REFRESH_TOKEN_TTL_DAYS=30        # 30 days

# Max Single Upload Size (Default: 5 GB = 5368709120 bytes)
MAX_UPLOAD_BYTES=5368709120

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:4000/connected-accounts/google/callback"

# Optional: Captcha Security
RECAPTCHA_SECRET_KEY=""
```

Create the `.env` file in your `frontend/` directory:

### `frontend/.env`
```env
VITE_API_URL=http://localhost:4000
VITE_RECAPTCHA_SITE_KEY=
```

---

## 3. Database Setup & Prisma Migrations

Make sure MySQL 8+ is running locally on port `3306`.

1. Create the MySQL database:
   ```sql
   CREATE DATABASE IF NOT EXISTS `9drive`;
   ```

2. Run Prisma migrations from the backend directory:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npx prisma generate
   ```

3. Seed initial Google OAuth configuration into DB (optional if set in `.env`):
   ```bash
   npm run seed:google-config
   ```

---

## 4. Running Development Servers

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
*Backend API will run at `http://localhost:4000`*

### Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
*Frontend Web UI will run at `http://localhost:5173`*

---

## 5. First-Time Verification Walkthrough

1. Open `http://localhost:5173` in your browser.
2. Click **Register** or **Continue with Google**.
3. Authorize Google Drive access when prompted.
4. Navigate to **Quota Tracker** -> Verify that connected Google Drive capacity (15GB) is properly detected.
5. Upload a file -> Check that the file appears in the Virtual File List and is created inside the root `9drive` folder on your Google Drive.

---

## 6. Docker Deployment Option (Recommended for Production / VPS)

You can run the entire stack (MySQL 8, Express.js Backend, and Nginx Frontend) using Docker Compose.

### Step 6.1: Prepare Docker Environment Variables
Copy the example Docker environment file:
```bash
cp .env.docker.example .env
```
*(On Windows PowerShell: `Copy-Item .env.docker.example .env`)*

Edit `.env` and fill in your secure production credentials and Google Client ID / Secret.

### Step 6.2: Build & Start Containers
Run Docker Compose in detached mode:
```bash
docker compose up -d --build
```

### Services Status
- **Frontend App**: `http://localhost:5173` (Served via Nginx container)
- **Backend Express API**: `http://localhost:4000`
- **MySQL Database**: `localhost:3306`

### Container Management Commands
```bash
# View real-time logs across all services
docker compose logs -f

# View backend logs specifically
docker compose logs -f backend

# Stop all containers
docker compose down

# Stop containers and remove database volume (Data Reset)
docker compose down -v
```

