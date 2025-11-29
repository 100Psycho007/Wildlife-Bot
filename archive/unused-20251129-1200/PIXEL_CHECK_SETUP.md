# Pixel Check Setup Guide

## Quick Start

1. **Seed the database with Indian location data:**
   ```bash
   npm run seed
   ```

2. **Start both frontend and backend:**
   ```bash
   # Terminal 1 - Backend
   npm start

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

3. **Run pixel check:**
   ```bash
   npm run pixel-check
   ```

## What's Included

### Updated Seed Data (`scripts/seed-data.js`)
- ✅ Removed all "demo" references
- ✅ Replaced Manhattan/NY locations with Karnataka, India locations:
  - Bengaluru Urban
  - Mysuru
  - Hubballi-Dharwad
- ✅ Added voice case in Hindi (`WR-VOICE-HI-001`)
- ✅ Indian phone numbers (+91)
- ✅ Clears old data before seeding

### Pixel Check Script (`scripts/pixel-check.js`)
- Automated screenshot comparison
- Captures dashboard and voice case detail views
- Compares against reference images
- Generates diff images for failed checks
- Configurable threshold (default 2%)

## Configuration

### Pixel Check Options
```bash
node scripts/pixel-check.js \
  --baseUrl=http://localhost:5173 \
  --adminEmail=admin@wildlife.local \
  --adminPass=admin123 \
  --thresholdPct=2.0
```

Or simply run: `npm run pixel-check` (uses these defaults)

### Reference Images Location
Place your reference screenshots in:
```
mnt/data/demo_ui_frames/
  - ui_frame_2.png (dashboard)
  - ui_frame_3.png (voice case detail)
```

### Output Location
Generated screenshots and diffs saved to:
```
static/demo-screenshots/
  - dashboard_overview.png
  - dashboard_overview.diff.png
  - voice_case_detail_hi.png
  - voice_case_detail_hi.diff.png
```

## Map Configuration

The map now defaults to India (Bengaluru) instead of Manhattan. Update your map initialization:

```javascript
// In your map component
const map = L.map('map', {
  center: [12.9716, 77.5946], // Bengaluru
  zoom: 10,
  minZoom: 5,
  maxZoom: 18
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
```

## Seeded Data Overview

### Responders (3)
- Dr. Priya Sharma - Bengaluru (Wildlife Rescue)
- Rajesh Kumar - Mysuru (Forest Department)
- Dr. Anjali Desai - Hubballi (Animal Care)

### Reports (3)
1. **WR-VOICE-HI-001** - Voice report in Hindi (injured deer, Bengaluru)
2. **WR-TEXT-EN-002** - Leopard sighting (Mysuru) 
3. **WR-TEXT-EN-003** - Abandoned puppy (Hubballi)

### Users (6)
- 1 admin (admin@wildlife.local / admin123)
- 3 responders with dashboard access (password: responder123)
  - priya.sharma@wildlife.in
  - rajesh.kumar@forestdept.in
  - anjali.desai@animalcare.in
- 2 regular WhatsApp users

## Troubleshooting

### Empty Responders List
Run: `npm run seed` to populate the database

### Map Shows Wrong Location
Check that your map component uses Indian coordinates as default center

### Pixel Check Fails
- Ensure frontend is running on port 5173
- Check that reference images exist in `mnt/data/demo_ui_frames/`
- Adjust `thresholdPct` if minor differences are acceptable
- Review diff images in `static/demo-screenshots/`

### Login Issues

**Admin credentials:**
- Email: `admin@wildlife.local`
- Password: `admin123`

**Responder credentials (any of these):**
- Email: `priya.sharma@wildlife.in` / Password: `responder123`
- Email: `rajesh.kumar@forestdept.in` / Password: `responder123`
- Email: `anjali.desai@animalcare.in` / Password: `responder123`

If login fails, re-run: `npm run seed`
