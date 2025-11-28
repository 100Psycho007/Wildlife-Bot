# Pixel-Perfect Dashboard Implementation Guide

## Overview
This document describes the pixel-perfect dashboard implementation with Indian map data and demo content, matching the reference UI frames exactly.

## Branch
`feature/dashboard-voice-pixel`

## Key Features Implemented

### 1. UI Components (Pixel-Perfect Match)
- **ui-tokens.css**: CSS design tokens matching reference frames
- **CaseCard.jsx**: Case card component with exact styling
- **MapView.jsx**: Leaflet map centered on India (Bengaluru)
- **RespondersList.jsx**: Responders table with filters
- **DashboardPixelPerfect.jsx**: Main dashboard with all views

### 2. Indian Map Configuration
- Default center: Bengaluru (12.9716, 77.5946)
- Default zoom: 10
- Tile layer: OpenStreetMap (https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png)
- No US/Manhattan coordinates

### 3. Indian Demo Data
Three demo cases with Indian locations:

#### Case 1: WR-DEMO-WA-001 (WhatsApp)
- Location: Bengaluru Urban, Karnataka
- Coordinates: 12.9716, 77.5946
- Description: "Injured pigeon near MG Road; small wound on wing. Location: MG Road, near Nandi statue. Attached photo."
- Priority: Medium
- Confidence: 87%

#### Case 2: WR-DEMO-VOICE-EN-001 (Voice - English)
- Location: Mysuru, Karnataka
- Coordinates: 12.3051, 76.6553
- Transcript: "There is a dog on the main road near the petrol pump. It looks like it got hit by a bike. The dog is bleeding from its left hind leg and cannot stand. Location: Old Market, near the blue gate. Please send help."
- Priority: High
- Confidence: 92%

#### Case 3: WR-DEMO-VOICE-HI-001 (Voice - Hindi)
- Location: Hubballi-Dharwad, Karnataka
- Coordinates: 15.3647, 75.1240
- Transcript: "Aaj subah ek bhediya road ke paas nazar aaya. Location: Laxmi Chowk ke piche wale khet ke paas. Bhediya shayad chot mein nahi dikh raha tha par bahut paas se guzra. Bachchon ko school se bol do ki raasta avoid karein. Kripya forest department ko inform karein."
- Priority: High
- Confidence: 79%

### 4. Demo Responders (Indian)
All responders use +91 phone prefixes:

1. **Amit Patel** - Wildlife Conservation NGO (Bengaluru Urban)
2. **Dr. Rajesh Kumar** - Wildlife Rescue Foundation (Mysuru)
3. **Priya Sharma** - Forest Department (Hubballi-Dharwad)
4. **System Administrator** - Wildlife Emergency Response (Bengaluru Urban)

### 5. Visual Diff Testing
- **Script**: `scripts/pixel-check.js`
- **Command**: `npm run pixel-check`
- **Threshold**: 2% difference allowed
- **Reference frames**: `static/demo-ui-frames/`
- **Output**: `static/demo-screenshots/`

## Setup Instructions

### 1. Install Dependencies
```bash
# Backend
npm install

# Frontend
cd client
npm install --legacy-peer-deps
```

### 2. Seed Demo Data
```bash
# Start backend first
npm run dev

# In another terminal, seed data
npm run seed:demo
```

### 3. Start Frontend
```bash
cd client
npm run dev
```

### 4. Login
- URL: http://localhost:5173
- Email: admin@wildlife-demo.local
- Password: demo123

### 5. Run Pixel Check
```bash
# Ensure both backend and frontend are running
npm run pixel-check
```

## File Structure

```
Wildlife-Bot/
├── client/
│   └── src/
│       ├── components/
│       │   ├── CaseCard.jsx          # Pixel-perfect case card
│       │   ├── MapView.jsx           # Indian map with Leaflet
│       │   └── RespondersList.jsx    # Responders table
│       ├── pages/
│       │   └── DashboardPixelPerfect.jsx  # Main dashboard
│       └── styles/
│           └── ui-tokens.css         # Design tokens
├── scripts/
│   ├── pixel-check.js                # Visual diff testing
│   └── seed-demo.js                  # Demo data seeding
├── src/
│   └── routes/
│       ├── seed.js                   # Indian demo data
│       └── dashboard.js              # Dashboard API
└── static/
    ├── demo-audio/                   # Placeholder audio files
    ├── demo-screenshots/             # Generated screenshots
    └── demo-ui-frames/               # Reference frames
```

## API Endpoints

### Dashboard
- `GET /dashboard/reports` - Get all cases
- `GET /dashboard/reports/:caseId` - Get single case
- `POST /dashboard/reports/:caseId/accept` - Accept case
- `GET /dashboard/stats` - Dashboard statistics
- `GET /dashboard/responders` - Get responders (with filters)

### Seed
- `POST /seed/demo-voice-cases` - Seed Indian demo data (idempotent)

## Visual Diff Process

1. **Capture Screenshots**: Puppeteer navigates to dashboard views
2. **Compare**: pixelmatch compares against reference frames
3. **Generate Diff**: Creates diff images showing differences
4. **Pass/Fail**: Fails if difference > 2%

## CSS Tokens Reference

```css
--color-bg: #f8fafc;           /* Page background */
--card-bg: #ffffff;            /* Card background */
--accent-green: #22c55e;       /* WhatsApp badge */
--accent-blue: #2563eb;        /* Voice badge */
--priority-high: #ef4444;      /* High priority */
--priority-medium: #f97316;    /* Medium priority */
--priority-low: #94a3b8;       /* Low priority */
--confidence-high: #16a34a;    /* High confidence */
--confidence-mid: #f59e0b;     /* Mid confidence */
--confidence-low: #ef4444;     /* Low confidence */
--radius: 10px;                /* Border radius */
--shadow-soft: 0 6px 20px rgba(2,6,23,0.06);
```

## Testing Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Demo data seeded successfully
- [ ] Login works with admin credentials
- [ ] Dashboard shows Indian demo cases
- [ ] Map centered on Bengaluru
- [ ] Responders page shows Indian responders
- [ ] All phone numbers show +91 prefix
- [ ] Visual diff check passes (<2% difference)

## Troubleshooting

### Map not loading
- Check Leaflet CSS is imported
- Verify OpenStreetMap tile URL
- Check browser console for errors

### Pixel check fails
- Ensure frontend is running on port 5173
- Verify reference frames exist in `static/demo-ui-frames/`
- Check screenshot output in `static/demo-screenshots/`
- Review diff images for specific issues

### Demo data not showing
- Run `npm run seed:demo` again
- Check MongoDB connection
- Verify backend logs for errors

## Next Steps

1. Add reference UI frames to `static/demo-ui-frames/`
2. Run pixel check and iterate on CSS
3. Generate demo audio files for voice cases
4. Open PR when pixel-diff passes

## Notes

- All coordinates use Indian locations (Karnataka state)
- Phone numbers use +91 prefix (Indian format)
- Map tiles from OpenStreetMap (no US-specific tiles)
- Demo data is idempotent (safe to run multiple times)
- Visual diff threshold: 2% (configurable in pixel-check.js)
