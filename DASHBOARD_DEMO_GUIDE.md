# Wildlife Incident Responder Dashboard - Demo Guide

## Overview

This guide covers the production-quality Wildlife Incident Responder Dashboard with full admin and responder features, including voice + WhatsApp case management, real-time presence tracking, geofence-based escalation, and automated notifications.

## Features

### Core Dashboard Features
- **Multi-source Case Management**: Handle both WhatsApp and Voice call incidents
- **Real-time Stats**: Total cases, active cases, critical cases, average response time
- **Case Detail Panel**: Comprehensive view with transcript, timeline, media, and actions
- **Responsive Design**: Desktop-first with mobile-friendly responsive behavior

### Admin Features
- **Responder Presence Monitoring**: Real-time online/offline status tracking
- **Geofence Management**: Create geographic zones with automatic escalation
- **Escalation System**: Automated escalation for timeout cases (default: 20 minutes)
- **Audit Logging**: Append-only audit trail with HMAC verification
- **Suggested Responder Matching**: AI-powered responder assignment based on category, distance, and availability

### Voice & Transcript Features
- **Streaming Transcripts**: Display partial and final transcripts with confidence scores
- **Multi-language Support**: English and Hindi voice cases
- **Audio Playback**: Play recorded voice clips directly in the dashboard
- **Segment-level Confidence**: Per-segment timestamp and confidence display

### Security & Privacy
- **Phone Number Masking**: Automatic masking for non-admin/non-assigned users
- **Location Privacy**: District-only display unless admin or assigned responder
- **Encrypted Storage**: Phone numbers and GPS coordinates encrypted at rest
- **HMAC Audit Logs**: Tamper-proof audit trail

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB running locally or connection string
- (Optional) Twilio account for production notifications

### Installation

1. **Install dependencies**:
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
```

3. **Seed demo data**:
```bash
npm run seed:demo
```

This creates:
- Admin user: `admin@wildlife-demo.local` / `demo123`
- 2 Indian responders: Ravi Kumar (Gurugram), Dr. Meena Patel (Mysore)
- 3 demo cases: 1 WhatsApp (English), 2 Voice (English + Hindi)
- Placeholder audio files
- Dashboard screenshots

4. **Start the application**:
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

5. **Access the dashboard**:
- Open http://localhost:5173
- Login with `admin@wildlife-demo.local` / `demo123`

## Admin Features Guide

### 1. Responder Presence Monitoring

**How it works**:
- Responders send heartbeat pings every 60 seconds via `/dashboard/presence/ping`
- Status automatically changes to `offline` if no ping received for 90 seconds
- Admin can view all online responders with current case load

**API Endpoints**:
```bash
# Responder heartbeat
POST /dashboard/presence/ping
{
  "responderId": "...",
  "coords": { "lat": 12.9716, "lng": 77.5946 }
}

# Get online responders
GET /dashboard/responders/online
```

**Dashboard View**:
- Navigate to "Responders" in sidebar
- See real-time list with:
  - Name, organization, status (online/offline)
  - Current case load (e.g., "2/3")
  - Last seen timestamp
  - Masked contact info

### 2. Geofence Management

**What are geofences?**
Geofences are geographic boundaries (polygons) that trigger automatic actions when a case is reported within them.

**Creating a geofence**:
```bash
POST /dashboard/geofences
{
  "name": "Protected Forest Zone",
  "polygon": {
    "coordinates": [[[lng1, lat1], [lng2, lat2], ...]]
  },
  "notifyOnEntry": true
}
```

**Automatic escalation**:
- When a case is created inside a geofence:
  - Priority automatically set to `HIGH`
  - Escalation event created
  - Notifications sent to on-call responders and admins

**Use cases**:
- Protected wildlife areas
- High-conflict zones
- Urban-wildlife interface zones

### 3. Escalation System

**Automatic escalation triggers**:
1. **Timeout**: Case pending for > 20 minutes (configurable via `ESCALATION_THRESHOLD_MINUTES`)
2. **Geofence**: Case created inside a monitored geofence
3. **Manual**: Admin manually escalates a case

**Escalation workflow**:
1. System checks for pending cases every 5 minutes (cron job)
2. If threshold exceeded:
   - Create escalation record
   - Send notifications to admins and matched responders
   - Add timeline event to case
   - Retry failed notifications up to 2 times

**Notification methods**:
- WhatsApp (primary)
- SMS (fallback)
- Email (for daily digest)

**Configuration**:
```env
ESCALATION_THRESHOLD_MINUTES=20  # Default: 20 minutes
```

### 4. Suggested Responder Matching

**How it works**:
When viewing a case, click "Assign to" to see suggested responders based on:
- **Category match**: Responder handles this category
- **Availability**: Status = online, current cases < max concurrent
- **Distance**: Within responder's service radius (if GPS available)

**API**:
```bash
GET /dashboard/cases/:caseId/suggested-responders
```

Returns sorted list with:
- Responder name, organization
- Availability (e.g., "1/3 cases")
- Distance (if calculable)

### 5. Audit Logging

**What is logged**:
- All admin actions (geofence creation, case assignment, etc.)
- User authentication events
- Case status changes
- Escalation events

**Audit log structure**:
```javascript
{
  actorId: ObjectId,
  action: "geofence_created",
  targetId: "...",
  targetType: "Geofence",
  details: { ... },
  timestamp: Date,
  ip: "...",
  userAgent: "...",
  hmac: "..." // HMAC-SHA256 signature
}
```

**HMAC verification**:
- Each log entry signed with `AUDIT_HMAC_KEY`
- Prevents tampering
- Logs are append-only (cannot be modified or deleted)

**Configuration**:
```env
AUDIT_HMAC_KEY=your_secret_key_change_in_production
```

### 6. Daily Digest

**Scheduled job**: Runs daily at 07:00 IST

**Content**:
- New cases (last 24h)
- Resolved cases (last 24h)
- Pending cases (current)
- Escalations (last 24h)

**Recipients**: All active admins

**Implementation**: See `src/jobs/escalation.js` → `sendDailyDigest()`

## Voice Case Workflow

### 1. Voice Call Received
- User calls the Twilio number
- Call forwarded to voice processing service
- Audio recorded and transcribed (streaming)

### 2. Transcript Processing
- Partial transcripts displayed in real-time (lighter grey)
- Final transcript displayed when call ends (dark text)
- Each segment includes:
  - Text
  - Timestamp (seconds from start)
  - Confidence score (0-1)

### 3. Dashboard Display
- Case card shows "Voice" badge (blue)
- Language indicator (English/Hindi)
- Preview of transcript (first 80 chars)
- Confidence chip (green/amber/red based on AI confidence)

### 4. Case Detail Panel
- **Transcript section**: Scrollable with auto-scroll toggle
- **Audio playback**: Play last 30s or full recording
- **Timeline**: Shows when call received, transcribed, classified

## Demo Data

### Demo Cases

**Case 1: WhatsApp (English)**
- ID: `WR-DEMO-WA-001`
- Location: Bengaluru Urban, MG Road
- Category: Injured animal (pigeon)
- Priority: Medium
- Description: "Injured pigeon near MG Road; small wound on wing..."

**Case 2: Voice (English)**
- ID: `WR-DEMO-VOICE-EN-001`
- Location: Mysuru, Old Market
- Category: Injured animal (dog)
- Priority: High
- Transcript: "There is a dog on the main road near the petrol pump. It looks like it got hit by a bike..."
- Audio: `/static/demo-audio/demo-voice-en-001.mp3`

**Case 3: Voice (Hindi)**
- ID: `WR-DEMO-VOICE-HI-001`
- Location: Hubballi-Dharwad, Laxmi Chowk
- Category: Predator sighting (wolf)
- Priority: High
- Transcript: "Aaj subah ek bhediya road ke paas nazar aaya..."
- Audio: `/static/demo-audio/demo-voice-hi-001.mp3`

### Demo Responders

**Ravi Kumar**
- Organization: Gurugram Animal Rescue
- Categories: Injured animal
- District: Gurugram
- Status: Online

**Dr. Meena Patel**
- Organization: Mysore Wildlife Rescue
- Categories: Predator sighting, Injured animal
- District: Mysuru
- Status: Online

## API Reference

### Dashboard Endpoints

```bash
# Get all reports (with filters)
GET /dashboard/reports?source=voice&status=pending&priority=high&language=hi

# Get single report
GET /dashboard/reports/:caseId

# Accept case
POST /dashboard/reports/:caseId/accept

# Resolve case
POST /dashboard/reports/:caseId/resolve
Body: { "resolution": "Case resolved successfully" }

# Get dashboard stats
GET /dashboard/stats

# Presence ping
POST /dashboard/presence/ping
Body: { "responderId": "...", "coords": { "lat": 12.9, "lng": 77.5 } }

# Get online responders
GET /dashboard/responders/online

# Get all responders (admin only)
GET /dashboard/responders

# Get suggested responders for case
GET /dashboard/cases/:caseId/suggested-responders

# List geofences
GET /dashboard/geofences

# Create geofence (admin only)
POST /dashboard/geofences
Body: { "name": "...", "polygon": { "coordinates": [...] }, "notifyOnEntry": true }

# Seed demo data
POST /seed/demo-voice-cases
```

## Cron Jobs

### Escalation Check (Every 5 minutes)
- Checks for pending cases > threshold
- Creates escalation events
- Sends notifications
- Retries failed sends

### Daily Digest (07:00 IST)
- Compiles 24h stats
- Sends to all admins
- Logs send status

### Responder Status Update (Every 5 minutes)
- Marks responders offline if no ping for 30 minutes

### Notification Cleanup (02:00 daily)
- Deletes notifications older than 30 days

## Testing

Run tests:
```bash
npm test
```

Test coverage:
- Presence endpoint (online status update)
- Geofence escalation (priority change)
- Seed idempotency (no duplicates on re-run)

## Production Deployment

### Environment Variables

**Required**:
```env
MONGODB_URI=mongodb://...
JWT_SECRET=...
ENCRYPTION_KEY=...  # 32 characters
AUDIT_HMAC_KEY=...
```

**Optional (for production features)**:
```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### Security Checklist

- [ ] Change all default secrets in `.env`
- [ ] Enable HTTPS in production
- [ ] Configure CORS for production frontend URL
- [ ] Set up AWS KMS for encryption keys (replace mock encryption)
- [ ] Enable rate limiting on auth endpoints
- [ ] Review and restrict admin access
- [ ] Set up monitoring and alerting
- [ ] Configure backup for MongoDB
- [ ] Test Twilio integration with real numbers
- [ ] Review audit log retention policy

### Mocked Features (TODO for Production)

1. **Encryption**: Currently uses simple encryption. Replace with AWS KMS or HSM.
2. **Notifications**: Twilio sends are mocked. Integrate real Twilio client.
3. **Audio files**: Demo uses placeholder MP3s. Integrate real voice recording.
4. **Distance calculation**: Responder matching uses simplified distance. Add proper geospatial queries.

## Troubleshooting

### Issue: Demo data not seeding
**Solution**: Ensure MongoDB is running and `MONGODB_URI` is correct in `.env`

### Issue: Screenshots not generating
**Solution**: 
1. Ensure frontend is running on http://localhost:5173
2. Check Puppeteer installation: `npm install puppeteer`
3. Run manually: `node scripts/generate-demo-screenshots.js`

### Issue: Responders showing offline
**Solution**: Responders need to send heartbeat pings. In demo, they're set to online by default.

### Issue: Escalations not triggering
**Solution**: 
1. Check `ESCALATION_THRESHOLD_MINUTES` in `.env`
2. Verify cron jobs are running (check logs)
3. Ensure cases are older than threshold

## Support

For issues or questions:
1. Check logs: `tail -f logs/combined.log`
2. Review error logs: `tail -f logs/error.log`
3. Check MongoDB connection
4. Verify all environment variables are set

## License

MIT
