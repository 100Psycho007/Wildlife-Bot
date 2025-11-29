# Dashboard & Voice Integration Guide

## Overview

This document describes the complete dashboard and voice-call integration features implemented in the Wildlife Bot system.

## Features Implemented

### 1. Authentication & Authorization

- **JWT-based authentication** with 15-minute access tokens and 7-day refresh tokens
- **Bcrypt password hashing** (cost factor: 12) for secure password storage
- **Role-based access control**: ADMIN, RESPONDER, USER
- **Rate limiting** on auth endpoints (5 attempts per 15 minutes)

**Endpoints:**
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### 2. Data Privacy & Masking

**Phone Number Masking:**
- Admin: Full phone number visible
- Assigned Responder: Full phone number visible
- Other Responders: Masked (e.g., `919-****-97`)
- Public: Masked

**GPS Coordinates:**
- Admin: Full coordinates visible
- Assigned Responder: Full coordinates visible
- Other Responders: District-level only
- Public: District-level only

**Encryption:**
- Phone numbers encrypted using AES-256 (demo mode uses base64 encoding)
- GPS coordinates encrypted separately
- TODO: Replace with AWS KMS or HSM in production

### 3. Voice Call Integration

**Transcript Endpoints:**

```javascript
// Stream transcript segments (real-time)
POST /api/transcripts/stream
{
  "caseId": "WR-DEMO-VOICE-EN-001",
  "segment": {
    "text": "There is a dog on the main road",
    "timestamp": 1000,
    "confidence": 0.94
  }
}

// Submit final transcript
POST /api/transcripts/final
{
  "caseId": "WR-DEMO-VOICE-EN-001",
  "transcript": {
    "final": "Complete transcript text",
    "englishTranslation": "English version",
    "segments": [...]
  },
  "audioClipUrl": "/static/audio/recording.mp3"
}
```

**Twilio Integration (Webhook Example):**

```javascript
// Configure Twilio to POST to these endpoints
// Twilio Voice Webhook URL: https://your-domain.com/api/transcripts/stream
// Twilio Realtime Transcription: Enable in Twilio Console

// Example Twilio webhook handler (add to webhookController.js):
router.post('/twilio/voice/transcription', async (req, res) => {
  const { CallSid, TranscriptionText, TranscriptionStatus } = req.body;
  
  // Find report by CallSid (store CallSid when creating voice report)
  const report = await Report.findOne({ 'metadata.callSid': CallSid });
  
  if (TranscriptionStatus === 'completed') {
    // Send to final endpoint
    await axios.post('http://localhost:3000/api/transcripts/final', {
      caseId: report.caseId,
      transcript: { final: TranscriptionText }
    });
  }
  
  res.sendStatus(200);
});
```

### 4. Presence & Heartbeat

**Responder Presence:**
- Responders ping every 60 seconds to maintain "online" status
- Online threshold: 90 seconds (configurable)
- Automatic offline status after 30 minutes of inactivity

**Endpoints:**
```javascript
// Update presence
POST /dashboard/presence/ping
{
  "responderId": "responder_id",
  "coords": { "lat": 12.9716, "lng": 77.5946 }
}

// Get online responders
GET /dashboard/responders/online
```

### 5. Geofences

**Features:**
- Create polygonal geofences (admin only)
- Automatic priority escalation for cases inside geofences
- Point-in-polygon detection using ray casting algorithm

**Endpoints:**
```javascript
// List geofences
GET /dashboard/geofences

// Create geofence (admin only)
POST /dashboard/geofences
{
  "name": "Protected Wildlife Zone",
  "polygon": {
    "coordinates": [[[lng1, lat1], [lng2, lat2], ...]]
  },
  "notifyOnEntry": true
}

// Delete geofence (admin only)
DELETE /dashboard/geofences/:id
```

### 6. Escalation & Cron Jobs

**Automated Escalation:**
- Checks pending cases every 5 minutes
- Escalates cases older than threshold (default: 20 minutes)
- Notifies admins and on-call responders
- Retry failed notifications (max 2 retries)

**Daily Digest:**
- Sent to admins at 07:00 daily
- Includes: new cases, resolved cases, pending cases, escalations

**Configuration:**
```env
ESCALATION_THRESHOLD_MINUTES=20
```

### 7. Suggested Responder Matching

**Algorithm:**
- Filters by category match
- Filters by online status (last seen < 90s)
- Filters by availability (current cases < max concurrent)
- Sorts by current load (ascending)
- TODO: Add distance-based sorting

**Endpoint:**
```javascript
GET /dashboard/cases/:caseId/suggested-responders
```

### 8. Audit Logs

**Features:**
- Append-only audit collection
- HMAC field for tamper detection
- Searchable by action, user, case ID

**HMAC Calculation:**
```javascript
const hmac = crypto
  .createHmac('sha256', AUDIT_HMAC_KEY)
  .update(JSON.stringify(entryWithoutHmac))
  .digest('hex');
```

**Endpoint:**
```javascript
// Get audit logs (admin only)
GET /dashboard/audit?action=geofence_created&page=1&limit=50
```

### 9. Map & Districts

**Indian Coordinates:**
- Default map center: Bengaluru (12.9716, 77.5946)
- District-level fallback for cases without GPS
- District lookup table for major Indian cities

**District Centers:**
```javascript
const districtCenters = {
  'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 },
  'Mysuru': { lat: 12.3051, lng: 76.6553 },
  'Hubballi-Dharwad': { lat: 15.3647, lng: 75.1240 }
};
```

### 10. Demo Data & Seeding

**Idempotent Seeding:**
```bash
npm run seed:demo
# OR
POST /seed/demo-voice-cases
```

**Demo Users:**
- Admin: `admin@wildlife-demo.local` / `demo123`

**Demo Cases:**
- `WR-DEMO-WA-001` - WhatsApp case (Bengaluru)
- `WR-DEMO-VOICE-EN-001` - Voice case English (Mysuru)
- `WR-DEMO-VOICE-HI-001` - Voice case Hindi (Hubballi-Dharwad)

**Demo Responders:**
- Amit Patel (Bengaluru Urban)
- Dr. Rajesh Kumar (Mysuru)
- Priya Sharma (Hubballi-Dharwad)

### 11. Pixel-Perfect Screenshots

**Script:**
```bash
npm run pixel-check
```

**Configuration:**
```bash
node scripts/pixel-check.js \
  --baseUrl=http://localhost:5173 \
  --adminEmail=admin@wildlife-demo.local \
  --adminPass=demo123 \
  --thresholdPct=2.0
```

**Screenshots Generated:**
- `dashboard_overview.png`
- `voice_case_detail_hi.png`

## Security Considerations

### Production TODOs

1. **Encryption:**
   - Replace demo encryption with AWS KMS or HSM
   - Implement proper key rotation
   - Use envelope encryption for field-level encryption

2. **Twilio:**
   - Enable signature validation for webhooks
   - Use production Twilio credentials
   - Implement proper error handling and retries

3. **Rate Limiting:**
   - Add Redis-based rate limiting for production
   - Implement per-user rate limits
   - Add DDoS protection

4. **Audit Logs:**
   - Store audit logs in separate database
   - Implement log rotation and archival
   - Add real-time monitoring and alerts

## API Examples

### Complete Voice Call Flow

```javascript
// 1. User calls Twilio number
// 2. Twilio webhook creates report
POST /api/reports
{
  "source": "voice",
  "language": "hi",
  "category": "injured_animal",
  "description": "Initial description from IVR",
  "metadata": {
    "callSid": "CA1234567890abcdef"
  }
}

// 3. Twilio streams transcript segments
POST /api/transcripts/stream
{
  "caseId": "WR-2025-001",
  "segment": {
    "text": "Ek kutta sadak par gir gaya hai",
    "timestamp": 1000,
    "confidence": 0.88
  }
}

// 4. Twilio sends final transcript
POST /api/transcripts/final
{
  "caseId": "WR-2025-001",
  "transcript": {
    "final": "Ek kutta sadak par gir gaya hai...",
    "englishTranslation": "A dog has fallen on the road...",
    "segments": [...]
  },
  "audioClipUrl": "https://api.twilio.com/recordings/RE123"
}

// 5. Dashboard receives websocket update (TODO)
// socket.emit('transcript:updated', { caseId, transcript })
```

## Testing

### Manual Testing

1. Start MongoDB: `mongod`
2. Start backend: `npm run dev`
3. Start frontend: `cd client && npm run dev`
4. Seed demo data: `npm run seed:demo`
5. Login: `http://localhost:5173/login`
6. Test features in dashboard

### Automated Testing

Tests were created during development to verify features, then removed per project requirements. All features have been manually verified.

## Deployment

### Environment Variables

```env
# Required
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://production-db:27017/wildlife-bot
JWT_SECRET=your-production-secret-min-32-chars
ENCRYPTION_KEY=your-32-character-encryption-key
AUDIT_HMAC_KEY=your-hmac-secret-key

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=wildlife-bot-media

# Optional
ESCALATION_THRESHOLD_MINUTES=20
FRONTEND_URL=https://dashboard.wildlife-bot.com
```

### Production Checklist

- [ ] Replace demo encryption with KMS/HSM
- [ ] Enable Twilio webhook signature validation
- [ ] Set up Redis for rate limiting
- [ ] Configure log aggregation (ELK/CloudWatch)
- [ ] Set up monitoring and alerts
- [ ] Enable HTTPS with valid certificates
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Implement proper secret management
- [ ] Add health check endpoints
- [ ] Configure auto-scaling
- [ ] Set up CDN for static assets

## Support

For issues or questions:
- Check logs: `tail -f logs/combined.log`
- Review audit logs: `GET /dashboard/audit`
- Check responder status: `GET /dashboard/responders/online`
