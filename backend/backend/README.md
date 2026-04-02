# AECON Client Portal — Full Stack Implementation Guide

## Folder Structure

```
aecon-portal/               ← Your backend folder
├── server.js               ← Main Express server (START HERE)
├── package.json            ← Dependencies
├── .env.example            ← Copy to .env and fill in your values
├── models/
│   ├── Client.js           ← Client schema (unique ID logic here)
│   └── Report.js           ← Report schema (files + measurements)
├── routes/
│   ├── clients.js          ← /api/clients  (create, validate, list)
│   └── reports.js          ← /api/reports  (upload, fetch, manage)
├── middleware/
│   └── adminAuth.js        ← x-admin-key header check
├── uploads/                ← Uploaded PDF + images go here (auto-created)
│   └── DIR-SAS-001/        ← Organized by Client ID
│       ├── report.pdf
│       └── station1.jpg
├── admin/
│   └── index.html          ← Admin panel (YOUR control panel)
└── portal-frontend.js      ← Paste this into your website HTML
```

---

## STEP 1 — Install & Configure

```bash
cd aecon-portal
npm install

cp .env.example .env
# Now edit .env with your real values:
# - MONGO_URI        → your MongoDB Atlas connection string
# - ADMIN_API_KEY    → run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - FRONTEND_ORIGIN  → https://www.aecon-sa.com
```

### Get MongoDB Atlas (free):
1. Go to mongodb.com/atlas → Create free cluster
2. Database Access → Add user with password
3. Network Access → Allow IP 0.0.0.0/0 (or your server IP)
4. Connect → Copy connection string → paste into .env as MONGO_URI
5. Replace <password> with your actual password in the URI

---

## STEP 2 — Start the Server

```bash
npm start
# OR for development with auto-restart:
npm run dev
```

Server starts on http://localhost:3001
Admin panel: http://localhost:3001/admin

---

## STEP 3 — Integrate Frontend Into Your Website

Open your `index__27_.html` and make TWO changes:

### Change A — Add the script (just before </body>):
```html
<!-- AECON Portal Backend Integration -->
<script src="portal-frontend.js"></script>
```
Or paste the contents of portal-frontend.js directly into a `<script>` tag.

### Change B — Update the API URL:
In `portal-frontend.js`, line 10, change:
```js
const PORTAL_API_BASE = 'https://YOUR-SERVER.com';
```
To your actual backend server URL, e.g.:
```js
const PORTAL_API_BASE = 'https://api.aecon-sa.com';
```

### Change C — Remove the old portal JS:
Delete the old `openPortal()`, `doLogin()`, `doLogout()`, and `showPortalSection()` functions
from the existing `<script>` block — they are now replaced by portal-frontend.js.

Also delete the old `<div id="portalLogin">` contents — the new JS re-renders it dynamically.

---

## STEP 4 — Create Your First Client (Admin Panel)

1. Open: http://your-server:3001/admin
2. Paste your ADMIN_API_KEY in the sidebar input
3. Click "New Client"
4. Fill in company name, location, contact details
5. Click "Create Client & Generate ID"
6. You'll see: ✅ ID Generated: DIR-SAS-001
7. Give this ID to the client — they use it forever

### How IDs are generated:
- Location "Diriyah" + Company "Saudi Sasco" → DIR-SAS-001
- Next client with same prefix → DIR-SAS-002
- Different location "Riyadh Cement" → RIY-CEM-001
- IDs are PERMANENT — never change, never reset

---

## STEP 5 — Upload Reports (Admin Panel)

1. In admin panel → "Upload Report"
2. Enter the Client ID (e.g. DIR-SAS-001)
3. Fill in: title, type, service date, issue date, location, project ref
4. Optionally add key measurements (PM2.5, PM10, NO₂, etc.)
5. Upload: Final PDF report, station images, noise images, coordinate images
6. Check "Publish immediately" if ready for client to see
7. Click "Upload Report"

Reports uploaded but NOT published are invisible to clients until you toggle them ON.

---

## STEP 6 — Client Accesses Portal

Client visits your website → clicks "Client Portal" button
→ Sees login screen with one field: "Client ID"
→ Types: DIR-SAS-001
→ System validates against your MongoDB
→ Dashboard loads with ALL their reports (newest first)
→ Can download PDFs, view images, check compliance status
→ Previous login sessions are remembered for the browser session

---

## API Reference

### Public Endpoints (no key needed)
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/clients/validate | Validate a client ID (portal login) |
| GET  | /api/reports/:clientId | Get all published reports for a client |
| GET  | /api/health | Server health check |

### Admin Endpoints (require x-admin-key header)
| Method | URL | Description |
|--------|-----|-------------|
| POST   | /api/clients | Create new client (auto-generates ID) |
| GET    | /api/clients | List all clients |
| GET    | /api/clients/:id | Get single client |
| PATCH  | /api/clients/:id | Update client details |
| DELETE | /api/clients/:id | Soft-deactivate client |
| POST   | /api/reports/:clientId | Upload new report (multipart/form-data) |
| GET    | /api/reports/admin/all | List all reports |
| PATCH  | /api/reports/admin/:id | Update report (e.g. toggle isPublished) |
| DELETE | /api/reports/admin/:id | Delete report |

---

## Deployment Options

### Option A — Render.com (Free, Recommended)
1. Push this folder to GitHub
2. Go to render.com → New Web Service → Connect repo
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add Environment Variables (MONGO_URI, ADMIN_API_KEY, etc.)
6. Deploy → Get your URL e.g. https://aecon-portal.onrender.com
7. Update PORTAL_API_BASE in portal-frontend.js to that URL

### Option B — Railway.app
Similar to Render, also has free tier.

### Option C — Your own VPS
```bash
npm install -g pm2
pm2 start server.js --name aecon-portal
pm2 save
pm2 startup
```
Use nginx to proxy port 3001 → port 80/443.

---

## Security Checklist Before Going Live

- [ ] Change ADMIN_API_KEY to a strong random string (32+ chars)
- [ ] Set FRONTEND_ORIGIN to your exact domain (not *)
- [ ] Use HTTPS for both frontend and backend
- [ ] Keep .env out of git (.gitignore it)
- [ ] MongoDB Atlas: restrict IP access to your server IP only
- [ ] Consider adding Cloudflare for DDoS protection

---

## Common Issues

**"Client ID not found" even though it exists:**
→ Check the client was created with isActive: true
→ Make sure MONGO_URI in .env is correct
→ Check PORTAL_API_BASE in portal-frontend.js points to running server

**Files not uploading:**
→ Check uploads/ folder exists and server has write permission
→ File size limit is 50MB per file (change in routes/reports.js)

**Admin panel shows "—" for stats:**
→ Make sure ADMIN_API_KEY is pasted in sidebar input
→ Check browser console for CORS errors
→ Verify FRONTEND_ORIGIN in .env matches your admin panel URL
