# Local Verification Script

Run these commands to verify the UI/UX polish and restructure:

## 1. Initial Setup

```bash
# Ensure you're on the correct branch
git checkout chore/ui-ux-polish-and-declutter

# Install all dependencies
npm run install:all

# Setup environment (if not already done)
cp .env.example backend/.env
# Edit backend/.env with your MongoDB URI
```

## 2. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 3. Seed Demo Data

```bash
npm run seed:demo
```

Expected output:
- ✅ Demo users created (admin + 3 responders)
- ✅ Demo cases created with Indian locations
- ✅ Demo audio files generated
- ✅ Screenshots generated

## 4. Start Development Servers

```bash
# Start both backend and frontend
npm run start:dev
```

This will start:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173

## 5. Manual UI/UX Verification

### Login Page (http://localhost:5173)
- [ ] Gradient background displays (purple to indigo)
- [ ] Login card is centered and elevated
- [ ] Hover effect on login button works
- [ ] Demo credentials are visible

**Test Login:**
- Email: `admin@wildlife.local`
- Password: `admin123`

### Dashboard Home
- [ ] Green gradient navigation bar at top
- [ ] Nav buttons highlight on hover
- [ ] 4 stats cards display with numbers
- [ ] Stats cards lift on hover (translateY animation)
- [ ] Gradient icon backgrounds visible

### Cases View
- [ ] Click "CASES" in navigation
- [ ] Case cards display with colored left border
- [ ] Cards lift on hover
- [ ] Badges show source (WhatsApp/Voice)
- [ ] Priority and status badges visible
- [ ] Filter buttons work (All, Pending, Voice, Critical)

### Case Detail
- [ ] Click any case card
- [ ] Modal opens with case details
- [ ] For voice cases: transcript displays
- [ ] Audio player shows (if audio available)
- [ ] Accept button works (for pending cases)
- [ ] Close button works

### Map View
- [ ] Click "MAP" in navigation
- [ ] Map loads with markers
- [ ] Cases plotted at Indian locations

### Responders View
- [ ] Click "RESPONDERS" in navigation
- [ ] Responder list displays
- [ ] Online/offline status visible

### Geofences View
- [ ] Click "GEOFENCES" in navigation
- [ ] Geofence manager loads

## 6. Accessibility Verification

### Keyboard Navigation
- [ ] Press Tab to navigate through elements
- [ ] Focus indicators visible (blue outline)
- [ ] Can navigate entire dashboard with keyboard

### Screen Reader (Optional)
- [ ] Enable screen reader (NVDA/JAWS/VoiceOver)
- [ ] Navigate through dashboard
- [ ] ARIA labels announced correctly

### Reduced Motion (Optional)
```bash
# Enable reduced motion in OS settings
# Windows: Settings > Ease of Access > Display > Show animations
# Mac: System Preferences > Accessibility > Display > Reduce motion
```
- [ ] Animations respect reduced motion preference

## 7. Responsive Design

### Desktop (1920x1080)
- [ ] All elements display correctly
- [ ] Stats cards in 4-column grid
- [ ] Navigation fully visible

### Tablet (768x1024)
- [ ] Stats cards in 2-column grid
- [ ] Navigation adapts
- [ ] Case cards stack properly

### Mobile (375x667)
- [ ] Stats cards in 1-column
- [ ] Navigation collapses or adapts
- [ ] Detail panel becomes full-screen

## 8. Performance Check

### Load Times
- [ ] Login page loads < 1s
- [ ] Dashboard loads < 2s
- [ ] Case list renders smoothly

### Animations
- [ ] Hover effects smooth (no jank)
- [ ] Transitions feel natural (200ms)
- [ ] No layout shifts

## 9. Pixel Check (Optional)

```bash
# Run automated pixel comparison
npm run pixel-check
```

Expected:
- ✅ Screenshots generated in `backend/static/demo-screenshots/`
- ✅ Pixel difference < 2% threshold
- ✅ No major visual regressions

## 10. Backend Functionality

### API Endpoints
```bash
# Test API is responding
curl http://localhost:3000/api/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wildlife.local","password":"admin123"}'
```

### Database
```bash
# Check MongoDB connection
cd backend
node -e "require('./src/config/database'); console.log('DB connected')"
```

## 11. Git History Verification

```bash
# Check that renames were detected
git log --follow --oneline backend/src/server.js
git log --follow --oneline frontend/src/App.jsx

# Verify 100% similarity
git show 84bec97 --stat
```

Expected:
- ✅ History shows original commits from server/client
- ✅ Renames detected with 100% similarity

## 12. Documentation Check

- [ ] README.md updated with new structure
- [ ] MIGRATION_GUIDE.md references correct paths
- [ ] PR_UI_UX_POLISH_AND_RESTRUCTURE.md complete
- [ ] Archive folder has MAINTAINER_NOTE.md

## ✅ Verification Complete!

If all checks pass, the PR is ready to merge.

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB connection error
- Check MongoDB is running: `mongod --version`
- Check connection string in `backend/.env`
- Try: `mongodb://localhost:27017/wildlife_reports`

### Seed script fails
```bash
# Clear database and reseed
cd backend
node scripts/clear-and-reseed.js
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5173
npx kill-port 5173
```

---

**Questions?** Check the logs:
- Backend: `backend/logs/combined.log`
- Backend errors: `backend/logs/error.log`
