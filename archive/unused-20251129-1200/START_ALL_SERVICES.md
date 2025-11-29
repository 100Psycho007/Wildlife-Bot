# Start All Services - Quick Guide

## Option 1: Manual (Recommended for Windows)

Open **4 separate terminals** and run these commands:

### Terminal 1: Backend
```bash
cd Wildlife-Bot
npm run dev
```
Wait for: `Server started successfully`

### Terminal 2: Seed Data (one-time)
```bash
cd Wildlife-Bot
npm run seed:demo
```
Wait for: `✓ Demo data seeded successfully`

### Terminal 3: Frontend
```bash
cd Wildlife-Bot/client
npm run dev
```
Wait for: `Local: http://localhost:5173/`

### Terminal 4: Test Dashboard
```bash
# Open browser to http://localhost:5173
# Login: admin@wildlife-demo.local / demo123
```

## Option 2: Test Pixel Check

After all services are running (Terminals 1-3):

### Terminal 4: Run Pixel Check
```bash
cd Wildlife-Bot
npm run pixel-check
```

## Quick Verification

### Check Backend (Terminal 1)
Should see:
```
Server started successfully
port: 3000
```

### Check Seed (Terminal 2)
Should see:
```
✓ Demo data seeded successfully

Demo Users:
  Admin: admin@wildlife-demo.local / demo123

Demo Cases:
  - WR-DEMO-WA-001 (whatsapp, English)
  - WR-DEMO-VOICE-EN-001 (voice, English)
  - WR-DEMO-VOICE-HI-001 (voice, Hindi)
```

### Check Frontend (Terminal 3)
Should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Check Browser
1. Open http://localhost:5173
2. Should see login page
3. Login with: admin@wildlife-demo.local / demo123
4. Should see dashboard with 3 Indian cases

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID)
taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Kill process if needed (replace PID)
taskkill /PID <PID> /F
```

### MongoDB connection error
Check `.env` file has:
```
MONGODB_URI=mongodb://localhost:27017/wildlife-bot
```

Or use MongoDB Atlas connection string.

### Seed fails
1. Ensure backend is running first
2. Check MongoDB is accessible
3. Re-run: `npm run seed:demo`

## Stop All Services

Press `Ctrl+C` in each terminal to stop services.

## Next Steps

Once all services are running:
1. Test dashboard manually
2. Run pixel-check: `npm run pixel-check`
3. Review screenshots in `static/demo-screenshots/`
4. Compare with reference frames (if available)
