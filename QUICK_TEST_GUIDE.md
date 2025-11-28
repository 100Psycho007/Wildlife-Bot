# Quick Test Guide - Pixel-Perfect Dashboard

## 🚀 Quick Start (5 minutes)

### 1. Install & Seed (2 min)
```bash
# Terminal 1: Backend
npm install
npm run dev

# Terminal 2: Seed data (wait for backend to start)
npm run seed:demo
```

### 2. Start Frontend (1 min)
```bash
# Terminal 3: Frontend
cd client
npm install --legacy-peer-deps
npm run dev
```

### 3. Test Dashboard (2 min)
1. Open http://localhost:5173
2. Login: `admin@wildlife-demo.local` / `demo123`
3. Verify:
   - ✅ Dashboard shows 3 Indian cases
   - ✅ Map centered on Bengaluru (not Manhattan)
   - ✅ Responders page shows 4 Indian responders
   - ✅ All phones show +91 prefix

## 🧪 Visual Diff Test

### Prerequisites
- Backend running on port 3000
- Frontend running on port 5173
- Demo data seeded

### Run Test
```bash
npm run pixel-check
```

### Expected Output
```
=== Pixel-Perfect Visual Diff Check ===

Step 1: Logging in...
✓ Logged in successfully

Step: Capturing dashboard_home_page...
✓ Screenshot saved
✅ PASS: dashboard_home_page (0.45% difference)

Step: Capturing dashboard_responders...
✓ Screenshot saved
✅ PASS: dashboard_responders (0.78% difference)

Step: Capturing dashboard_map...
✓ Screenshot saved
✅ PASS: dashboard_map (1.23% difference)

=== Summary ===
Passed: 3/3
Failed: 0/3

✅ All visual diff checks PASSED
```

## 📸 Manual Visual Check

### Dashboard Home
- [ ] 4 stat cards (Total, Active, Critical, Resolved)
- [ ] Recent cases list with case cards
- [ ] WhatsApp badge (green) and Voice badge (blue)
- [ ] Confidence chips (green/yellow/red)
- [ ] Quick actions sidebar
- [ ] System status (all green "Online")

### Responders Page
- [ ] Search bar and filters (Status, Role)
- [ ] Table with 4 responders
- [ ] Role badges (NGO=blue, RESPONDER=green, FOREST_OFFICIAL=orange, ADMIN=red)
- [ ] Status shows "AVAILABLE"
- [ ] Last Seen shows "Oct 01, 02:26"
- [ ] Active Cases shows "0"

### Map View
- [ ] Map centered on Bengaluru, India
- [ ] Zoom level ~10
- [ ] 3 markers for demo cases
- [ ] Map/Split/List toggle buttons
- [ ] No US/Manhattan coordinates visible

### Case Details
- [ ] WR-DEMO-WA-001: Bengaluru Urban, pigeon
- [ ] WR-DEMO-VOICE-EN-001: Mysuru, dog (English)
- [ ] WR-DEMO-VOICE-HI-001: Hubballi-Dharwad, wolf (Hindi)

## 🐛 Troubleshooting

### Map not showing
```bash
# Check Leaflet CSS loaded
# Open browser console, look for CSS errors
# Verify: import 'leaflet/dist/leaflet.css' in MapView.jsx
```

### Demo data not appearing
```bash
# Re-seed
npm run seed:demo

# Check MongoDB
# Verify backend logs show "Demo data seeded successfully"
```

### Pixel check fails
```bash
# Ensure ports are correct
# Backend: http://localhost:3000
# Frontend: http://localhost:5173

# Check reference frames exist
ls static/demo-ui-frames/

# View diff images
ls static/demo-screenshots/*_diff.png
```

### Login fails
```bash
# Verify seed ran successfully
# Check credentials:
# Email: admin@wildlife-demo.local
# Password: demo123
```

## ✅ Success Criteria

- [ ] All 3 demo cases visible
- [ ] Map shows India (not US)
- [ ] All phone numbers have +91 prefix
- [ ] Responders table shows 4 entries
- [ ] UI matches reference frames
- [ ] Pixel check passes (<2% diff)

## 📝 Notes

- Demo data is idempotent (safe to run multiple times)
- Reference frames needed in `static/demo-ui-frames/` for pixel check
- Screenshots saved to `static/demo-screenshots/`
- Diff images show exact pixel differences in red
