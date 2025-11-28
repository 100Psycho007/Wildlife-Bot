# Quick Start Guide - Dashboard Demo

Get the responder dashboard running in 5 minutes!

## Prerequisites
- Node.js 16+ installed
- MongoDB running locally or Atlas connection
- Git

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment (30 seconds)
Your `.env` file should already have:
```env
MONGODB_URI=mongodb+srv://...  # Your MongoDB connection
JWT_SECRET=wildlife-demo-secret-change-in-production
FIELD_ENCRYPTION_KEY=demo-key-replace-in-production-32b
```

### 3. Start Backend (30 seconds)
```bash
npm run dev
```
Wait for: `Server started successfully` message

### 4. Seed Demo Data (30 seconds)
Open a new terminal:
```bash
npm run seed:demo
```
This creates:
- Admin user: admin@wildlife-demo.local / demo123
- Responder user: responder@wildlife-demo.local / demo123
- 3 demo cases (1 WhatsApp, 2 Voice)

### 5. Start Frontend (30 seconds)
Open another terminal:
```bash
cd client
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### 6. Access Dashboard (30 seconds)
1. Open http://localhost:5173
2. Login with: `admin@wildlife-demo.local` / `demo123`
3. Explore the dashboard!

## What You'll See

### Dashboard Features
- **Case List**: All 3 demo cases with source badges
- **Filters**: Filter by source (WhatsApp/Voice), status, priority, language
- **Case Detail**: Click any case to see details in side panel
- **Voice Transcripts**: View transcripts for voice cases
- **Audio Playback**: Click "Play Audio" button (placeholder files)
- **Actions**: Accept and resolve cases

### Try These Actions

**As Admin:**
- View full phone numbers and GPS coordinates
- See all case details
- Accept and resolve any case

**As Responder:**
1. Logout (top right)
2. Login with: `responder@wildlife-demo.local` / `demo123`
3. Notice phone numbers are masked (XXX-***-XX)
4. Notice only district shown for location
5. Accept a case
6. Now see full details for that case!

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongosh  # Should connect

# Check port 3000 is free
netstat -ano | findstr :3000
```

### Frontend won't start
```bash
# Check port 5173 is free
netstat -ano | findstr :5173

# Clear node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### Seed fails
```bash
# Make sure backend is running first
# Check MongoDB connection in .env
# Try seeding via API directly:
curl -X POST http://localhost:3000/seed/demo-voice-cases
```

### Can't login
```bash
# Verify demo data was seeded
# Check backend logs for errors
# Try seeding again (it's idempotent)
```

## Next Steps

### Generate Screenshots
```bash
# Make sure both backend and frontend are running
npm run seed:demo
# Screenshots saved to: static/demo-screenshots/
```

### Explore the Code
- Backend routes: `src/routes/dashboard.js`
- Frontend dashboard: `client/src/pages/Dashboard.jsx`
- Case detail: `client/src/components/CaseDetail.jsx`
- Auth logic: `src/middleware/auth.js`

### Read Full Documentation
- `DASHBOARD_DEMO_GUIDE.md` - Complete feature documentation
- `PR_SUMMARY.md` - Technical implementation details
- `README.md` - Original project documentation

## Demo Credentials Reference

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@wildlife-demo.local | demo123 | Full access |
| Responder | responder@wildlife-demo.local | demo123 | Masked until assigned |

## Demo Cases Reference

| Case ID | Source | Language | Category | Priority |
|---------|--------|----------|----------|----------|
| WR-DEMO-WA-001 | WhatsApp | EN | Injured Animal | Medium |
| WR-DEMO-VOICE-EN-001 | Voice | EN | Injured Animal | High |
| WR-DEMO-VOICE-HI-001 | Voice | HI | Human-Wildlife Conflict | Critical |

## Common Commands

```bash
# Start backend
npm run dev

# Start frontend
cd client && npm run dev

# Seed demo data
npm run seed:demo

# Run tests
npm test

# View logs
tail -f logs/combined.log
```

## Support

Having issues? Check:
1. All terminals are running (backend, frontend)
2. MongoDB is accessible
3. Ports 3000 and 5173 are available
4. Environment variables are set correctly
5. Demo data was seeded successfully

---

**Enjoy exploring the dashboard!** 🎉
