# 🐾 AniRescue — Animal Rescue & Welfare Assistant

A modern, professional, and fully responsive full-stack web application connecting citizens, volunteers, shelters, and rescue organizations to improve animal rescue and welfare management.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database (Local)** | NeDB (Zero-installation, file-based JSON database) |
| **Database (Production)** | Vercel KV (Redis Hash-backed persistent storage) |
| **Auth** | JWT (JSON Web Tokens) with LocalStorage persistence |
| **AI Assistant** | Google Gemini 2.5 Flash API |
| **Maps** | Leaflet.js + OpenStreetMap (Interactive maps) |
| **Charts & Stats** | Recharts (Responsive dashboard charts) |
| **Animations** | Framer Motion (Smooth hover effects and leaf wind background) |
| **Typography** | Google Sans |

---

## 📦 Project Structure

```
ANIRESCUE/
├── api/              # Vercel Serverless Function entry point (index.js)
├── backend/          # Express API server workspace
│   ├── config/       # Dual database connector (db.js)
│   ├── controllers/  # API business logic handlers
│   ├── middleware/   # Authentication, validation, and in-memory uploads
│   ├── routes/       # Express route controllers
│   └── utils/        # Seeding scripts and helper functions
├── frontend/         # React SPA workspace
│   ├── public/       # Static assets (leaves-bg.png background)
│   └── src/          # Components, pages, routing, and context APIs
├── vercel.json       # Monorepo rewrite rules
├── package.json      # Monorepo workspaces definition
└── README.md
```

---

## ✨ Features

- 🆘 **Emergency Animal Reporting**: Citizens can submit rescue reports specifying animal type, description, contact information, GPS location (with "Use My Location" support), severity levels, and upload photos.
- 📸 **Serverless-Ready Image Handling**: Uploaded photos are stored as **Base64 Data URLs** directly in the database (no filesystem write dependency, 100% serverless-safe).
- 🔍 **Real-time Report Tracking**: Users receive a unique Report ID (e.g. `RPT-ABCD12`) and can track status updates and volunteer assignment history on a dynamic timeline.
- 🤖 **Gemini-Powered AI Chatbot**: An interactive, customized animal rescue bot providing advice on first-aid, feeding, handling, and legal animal welfare rights.
- 🗺️ **Interactive Shelter Finder**: Finds and maps nearby rescue shelters using Leaflet maps with custom markers and city/name search.
- 💚 **Adoption Readiness Quiz**: A interactive questionnaire assessing whether users are ready to adopt, yielding a personalized score card and guide.
- 👥 **Volunteer Registration**: Community members can register as rescue volunteers (approved by admin).
- 📊 **Comprehensive Admin Panel**: Allows administrators to view metrics, analyze rescue statistics using charts, update report statuses, and approve/suspend volunteers.
- 🍃 **Premium Aesthetics**: Features a dark glassmorphic layout, custom wind-blown animating leaf background, and unified Google Sans typography.

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Node.js v18 or later
- Google Gemini API key (Obtain a free key at [Google AI Studio](https://aistudio.google.com))

### Installation Steps

1. **Clone and open the directory**:
   ```bash
   cd ANIRESCUE
   ```

2. **Install all dependencies** (uses npm workspaces to install both frontend and backend packages):
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   JWT_SECRET=any_secure_random_string_here
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Seed the database** (Creates 8 initial Indian shelters and an admin user):
   ```bash
   npm run seed
   ```
   *Note: This automatically creates the local file database in `backend/data/*.db`. No separate database installation is needed.*

5. **Start the applications**:
   - Start the **backend API server** (runs on port 5000):
     ```bash
     cd backend
     npm run dev
     ```
   - Start the **frontend React app** (runs on port 5173):
     ```bash
     cd frontend
     npm run dev
     ```

6. **Credentials**:
   - Login to the Admin Dashboard (http://localhost:5173/login) using:
     - **Email**: `admin@anirescue.org`
     - **Password**: `Admin@123`

---

## 🚀 Hosting on Vercel (KV Redis Storage)

The codebase is fully optimized to deploy to Vercel as a single full-stack project utilizing **Vercel KV (Redis)** for persistent storage.

### Step 1: Push Code to GitHub
Ensure your code is pushed to your GitHub repository:
```bash
git init
git remote add origin https://github.com/RohithKumar086/ANIRESCUE-.git
git branch -M main
git add .
git commit -m "Configure monorepo and storage for Vercel deployment"
git push -u origin main
```

### Step 2: Import Project in Vercel
1. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Select your imported GitHub repository (`ANIRESCUE-`).
3. Under **Build & Development Settings**, Vercel will automatically read the root `vercel.json` rewrites and run npm workspaces build.
4. **Add Environment Variables**:
   - `GEMINI_API_KEY`: `your_google_gemini_api_key`
   - `JWT_SECRET`: A secure key for JWT signing.
5. Click **Deploy**.

### Step 3: Enable Vercel KV Storage (One-Click Setup)
1. On your Vercel project dashboard, select the **Storage** tab.
2. Select **KV (Redis)** and click **Create**.
3. Choose a name and database region, then click **Create**.
4. In the database configuration, select your project and click **Connect**.
5. Go back to your project **Deployments** tab and redeploy the latest commit so that it starts using the newly injected KV environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`).

---

## 📞 Emergency Contacts (India)

For real animal emergencies:
- **PETA India**: 1800-22-PETA (7382)
- **Friendicoes SECA**: +91-11-2461-5435
- **Animal Welfare Board of India**: 044-24991689

---
Made with ❤️ for Animal Welfare 🐾
