# Wildlife Responder Dashboard & Voice Demo Guide

This guide covers the new responder dashboard and voice-case demo features added to the Wildlife WhatsApp Bot system.

## Overview

The dashboard provides a secure web interface for wildlife responders to:
- View and manage wildlife incident reports from both WhatsApp and Voice sources
- Accept and resolve cases with proper access control
- View transcripts and play audio for voice-based reports
- Filter cases by source, status, priority, and language

## Features Added

### 1. Enhanced Report Schema
- **Source tracking**: WhatsApp vs Voice calls
- **Language support**: Multi-language transcripts (English, Hindi, etc.)
- **Phone masking**: Encrypted phone storage with masked display
- **GPS encryption**: Encrypted coordinates with district-level access for non-assigned responders
- **Voice transcripts**: Partial, final, segments, and audio clip URLs

### 2. Authentication & Authorization
- **JWT-based auth**: 15-minute access tokens with refresh token support
- **Role-based access**: ADMIN, RESPONDER, USER roles
- **Rate limiting**: Protection against brute force attacks
- **Audit logging**: All accept/resolve actions are logged

### 3. Access Control Rules
- **Admin**: Full access to phone numbers and GPS coordinates
- **Responder (assigned)**: Full access to their assigned cases
- **Responder (unassigned)**: Masked phone, district-only location
- **User**: Basic access (for future public reporting)

### 4. Dashboard UI
- **React + Vite**: Fast, modern frontend
- **Minimal styling**: Clean, professional interface
- **Real-time filters**: Source, status, priority, language
- **Case detail panel**: Side panel with full case information
- **Audio playback**: HTML5 audio player for voice cases

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB running
- Backend dependencies installed

### Installation

1. **Install backend dependencies**
```bash
npm install
```

2. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

3. **Seed demo data**
```bash
# Make sure MongoDB and backend are running first
npm run dev  # In one terminal

# Then in another terminal:
npm run seed:demo
```

This will:
- Create demo admin and responder users
- Seed 3 demo cases (1 WhatsApp, 2 Voice)
- Generate screenshots (requires frontend running)

### Running the Application

1. **Start backend** (Terminal 1)
```bash
npm run dev
```

2. **Start frontend** (Terminal 2)
```bash
cd client
npm run dev
```

3. **Access dashboard**
Open http://localhost:5173

### Demo Credentials

**Admin Account:**
- Email: `admin@wildlife-demo.local`
- Password: `demo123`
- Access: Full phone numbers and GPS coordinates

**Responder Account:**
- Email: `responder@wildlife-demo.local`
- Password: `demo123`
- Access: Masked data until case is accepted

## Demo Cases

### Case 1: WhatsApp Report
- **ID**: WR-DEMO-WA-001
- **Source**: WhatsApp
- **Category**: Injured Animal
- **Location**: Times Square, Manhattan
- **Description**: Injured pigeon with damaged wing

### Case 2: Voice Report (English)
- **ID**: WR-DEMO-VOICE-EN-001
- **Source**: Voice
- **Language**: English
- **Category**: Injured Animal
- **Location**: Central Park, Manhattan
- **Transcript**: "There is an injured hawk near Bethesda Fountain..."
- **Audio**: `/static/demo-audio/demo-voice-en-001.mp3`

### Case 3: Voice Report (Hindi)
- **ID**: WR-DEMO-VOICE-HI-001
- **Source**: Voice
- **Language**: Hindi
- **Category**: Human-Wildlife Conflict
- **Location**: Upper West Side, Manhattan
- **Transcript**: "एक तेंदुआ रिहायशी इलाके में देखा गया है..."
- **Audio**: `/static/demo-audio/demo-voice-hi-001.mp3`

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### Dashboard
- `GET /dashboard/reports` - List reports with filters
- `GET /dashboard/reports/:caseId` - Get single report
- `POST /dashboard/reports/:caseId/accept` - Accept a case
- `POST /dashboard/reports/:caseId/resolve` - Resolve a case

### Seeding
- `POST /seed/demo-voice-cases` - Seed demo data (idempotent)

## Security Features

### Encryption
- Phone numbers are encrypted using a demo encryption utility
- GPS coordinates are encrypted for storage
- **Note**: Current implementation uses base64 encoding for demo purposes
- **TODO**: Replace with AWS KMS or HSM for production

### Data Masking
- Phone numbers masked as `XXX-***-XX` for non-authorized users
- GPS coordinates hidden, only district shown
- Full data revealed to admins and assigned responders

### Rate Limiting
- Login endpoint: 5 attempts per 15 minutes per IP
- Prevents brute force attacks

### Audit Logging
- All case accept/resolve actions logged
- Includes user ID, timestamp, and action details

## Screenshots

Screenshots are saved to `static/demo-screenshots/`:
- `dashboard_overview.png` - Main dashboard with all cases
- `voice_case_detail.png` - Hindi voice case detail panel

## File Structure

```
Wildlife-Bot/
├── src/
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── models/
│   │   ├── Report.js            # Enhanced with voice fields
│   │   └── User.js              # Added roles
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── dashboard.js         # Dashboard API
│   │   └── seed.js              # Demo seeding
│   └── utils/
│       └── encryption.js        # Encryption utilities
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── CaseDetail.jsx   # Case detail panel
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   └── Dashboard.jsx    # Main dashboard
│   │   └── utils/
│   │       └── api.js           # Axios with interceptors
│   └── package.json
├── scripts/
│   ├── seed-demo.js             # Combined seed script
│   └── generate-demo-screenshots.js  # Puppeteer screenshots
└── static/
    └── demo-audio/              # Demo audio files
```

## Environment Variables

Add to `.env`:
```env
JWT_SECRET=your-jwt-secret-change-in-production
FIELD_ENCRYPTION_KEY=your-encryption-key-32-bytes-long
```

## Testing

### Manual Testing
1. Login as admin
2. View all cases with full data
3. Logout and login as responder
4. Verify phone numbers are masked
5. Accept a case
6. Verify full data is now visible
7. Resolve the case

### API Testing
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wildlife-demo.local","password":"demo123"}'

# Get reports (use token from login)
curl http://localhost:3000/dashboard/reports \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Production Deployment

### Security Hardening
1. **Replace encryption**: Use AWS KMS or HSM instead of demo encryption
2. **Strong secrets**: Generate secure JWT_SECRET and FIELD_ENCRYPTION_KEY
3. **HTTPS only**: Enforce SSL/TLS for all connections
4. **Rate limiting**: Add Redis-backed rate limiting
5. **Input validation**: Add Joi validation to all endpoints
6. **CORS**: Configure proper CORS origins

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
FIELD_ENCRYPTION_KEY=<generate-32-byte-key>
```

### Build Frontend
```bash
cd client
npm run build
# Serve build/ directory with nginx or serve from Express
```

## Known Limitations

1. **Mock Encryption**: Current encryption is base64 encoding for demo
2. **No Audio Files**: Placeholder audio files need to be generated
3. **No Tests**: Minimal test coverage (add tests for production)
4. **No Docker**: Docker setup not included (add if needed)
5. **No Real-time**: No WebSocket updates (add Socket.io if needed)

## Future Enhancements

- [ ] Real-time case updates via WebSockets
- [ ] Map view with case locations
- [ ] Advanced analytics dashboard
- [ ] Mobile app for responders
- [ ] Integration with actual voice call system
- [ ] Automated audio transcription
- [ ] Multi-language UI support

## Troubleshooting

### Cannot connect to MongoDB
```bash
# Check MongoDB is running
mongod --version
# Start MongoDB
mongod
```

### Frontend not loading
```bash
# Check if Vite dev server is running
cd client
npm run dev
```

### Screenshots failing
```bash
# Make sure both backend and frontend are running
# Backend: npm run dev (port 3000)
# Frontend: cd client && npm run dev (port 5173)
```

### Token expired errors
- Access tokens expire after 15 minutes
- Use refresh token to get new access token
- Frontend handles this automatically

## Support

For issues:
1. Check logs in `logs/combined.log` and `logs/error.log`
2. Verify all environment variables are set
3. Ensure MongoDB is running and accessible
4. Check that ports 3000 and 5173 are available

---

**Built for wildlife conservation with security and privacy in mind** 🌿🐾
