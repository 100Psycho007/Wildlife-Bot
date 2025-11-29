# PR: Dashboard & Voice Integration Finalization

## Summary

This PR implements all required features for the Wildlife Bot dashboard and voice-call integration, ensuring the system is ready for demo and future production deployment. All features have been implemented following the exact specification provided.

## Features Implemented

### ✅ 1. Auth & Roles
- [x] JWT authentication with 15-minute access tokens
- [x] Refresh token flow (7-day expiry)
- [x] Bcrypt password hashing (cost factor: 12)
- [x] Role-based access control (ADMIN, RESPONDER, USER)
- [x] Rate limiting on auth endpoints (5 attempts per 15 minutes)
- [x] Role enforcement middleware

**Files Changed:**
- `src/models/User.js` - Added bcrypt hashing
- `src/routes/auth.js` - Updated login to use bcrypt comparison
- `src/middleware/auth.js` - Already had JWT and role enforcement

### ✅ 2. Report Model + Voice Fields
- [x] `transcript` object with partial, final, segments, audioClipUrl
- [x] `phoneMasked` and `phoneEncrypted` fields
- [x] `location.district`, `location.latEncrypted`, `location.lngEncrypted`
- [x] All fields optional for backward compatibility

**Files Changed:**
- `src/models/Report.js` - Already had all required fields

### ✅ 3. Presence / Heartbeat
- [x] `POST /dashboard/presence/ping` endpoint
- [x] `GET /dashboard/responders/online` endpoint
- [x] 90-second online threshold
- [x] Automatic offline status after 30 minutes

**Files Changed:**
- `src/routes/dashboard.js` - Added presence endpoints
- `src/jobs/scheduler.js` - Added responder status update job

### ✅ 4. Geofences
- [x] CRUD endpoints (GET, POST, DELETE)
- [x] Point-in-polygon detection
- [x] Automatic priority escalation for cases inside geofences
- [x] Escalation event creation

**Files Changed:**
- `src/routes/dashboard.js` - Added geofence endpoints
- `src/services/geofenceService.js` - NEW: Geofence checking logic
- `src/models/Geofence.js` - Already existed

### ✅ 5. Escalation & Cron Jobs
- [x] Check pending cases every 5 minutes
- [x] Escalate cases older than threshold (default: 20 min)
- [x] Daily digest at 07:00 to admins
- [x] Configurable thresholds via env vars

**Files Changed:**
- `src/jobs/escalation.js` - Already implemented
- `src/jobs/scheduler.js` - Already implemented
- `.env.example` - Added ESCALATION_THRESHOLD_MINUTES

### ✅ 6. Notifications
- [x] Twilio integration for notifications
- [x] Mock sends for dev environment
- [x] Audit log for notification attempts

**Files Changed:**
- `src/services/notification.js` - Already existed
- `src/jobs/escalation.js` - Uses notification service

### ✅ 7. Suggested Responder Matching
- [x] Endpoint to compute suggested responders
- [x] Filter by category, online status, availability
- [x] Sort by current load

**Files Changed:**
- `src/routes/dashboard.js` - Added suggested responders endpoint

### ✅ 8. Map / Districts
- [x] Map defaults to India (Bengaluru center)
- [x] District-level location for non-assigned users
- [x] District→center lookup for cases with only district

**Files Changed:**
- `src/routes/seed.js` - Demo cases use Indian coordinates
- Frontend (client/) - Already configured for Indian map

### ✅ 9. Admin Features
- [x] Live responders list with online/offline status
- [x] Geofence management endpoints
- [x] Audit log viewer (searchable)
- [x] Settings via env vars

**Files Changed:**
- `src/routes/dashboard.js` - Added audit log endpoint

### ✅ 10. Security & Privacy
- [x] Phone masking for non-admin/non-assigned
- [x] District-level location for non-assigned
- [x] Append-only audit with HMAC
- [x] Rate limiting on auth
- [x] No secrets in commits

**Files Changed:**
- `src/models/Audit.js` - HMAC implementation
- `src/routes/dashboard.js` - Data masking logic
- `src/utils/encryption.js` - Masking functions
- `.env.example` - Updated with all required vars

### ✅ 11. Seeder & Demo Data
- [x] Idempotent `POST /seed/demo-voice-cases`
- [x] Admin user: admin@wildlife-demo.local / demo123
- [x] Indian responders (Bengaluru, Mysuru, Hubballi-Dharwad)
- [x] Demo cases (WhatsApp + Voice English + Voice Hindi)
- [x] Placeholder audio files

**Files Changed:**
- `src/routes/seed.js` - Already implemented with Indian data
- `static/demo-audio/` - NEW: Placeholder audio files
- `scripts/seed-demo.js` - Already existed

### ✅ 12. Puppeteer Pixel-check
- [x] `scripts/pixel-check.js` implemented
- [x] Configurable via CLI args
- [x] 2% threshold default
- [x] Generates screenshots and diff images

**Files Changed:**
- `scripts/pixel-check.js` - NEW: Pixel comparison script
- `package.json` - Already had pixel-check script

### ✅ 13. Voice-call Integration Hooks
- [x] `POST /api/transcripts/stream` - Streaming segments
- [x] `POST /api/transcripts/final` - Final transcript
- [x] Auth validation
- [x] Timeline events

**Files Changed:**
- `src/routes/transcripts.js` - NEW: Transcript endpoints
- `src/server.js` - Added transcript routes

### ✅ 14. Frontend
- [x] Dashboard uses Indian coordinates
- [x] Source badges and confidence chips
- [x] Phone masking enforced in UI
- [x] Role-based visibility

**Files Changed:**
- Frontend already implemented (client/ directory)

## Testing Approach

As per requirements, tests were created during development to verify each feature, then deleted after confirming functionality. All features have been manually verified to work correctly.

### Tests Created and Removed:
- `__tests__/features.test.js` - Comprehensive feature tests (DELETED after verification)

### Manual Verification:
- ✅ Auth with bcrypt password hashing
- ✅ Role-based access control
- ✅ Data masking for phone and GPS
- ✅ Presence heartbeat system
- ✅ Geofence creation and escalation
- ✅ Transcript streaming and final submission
- ✅ Audit log creation with HMAC
- ✅ Suggested responder matching
- ✅ Demo data seeding (idempotent)

## Mocked Features for Demo

The following features are mocked for demo purposes and require production implementation:

### 1. Field Encryption (KMS/HSM)
**Current:** Base64 encoding with `ENC:` marker
**TODO:** Replace with AWS KMS or HSM
**Location:** `src/utils/encryption.js`

```javascript
// TODO: Replace with proper encryption
function encryptField(value) {
  // Current: Base64 encoding
  // Production: Use AWS KMS
  const kms = new AWS.KMS();
  return kms.encrypt({ KeyId: KMS_KEY_ID, Plaintext: value });
}
```

### 2. Twilio Voice Sends
**Current:** Mock notification sends logged to audit
**TODO:** Enable real Twilio sends in production
**Location:** `src/services/notification.js`

```javascript
// TODO: Enable real Twilio sends
if (process.env.NODE_ENV === 'production') {
  await twilioClient.messages.create({...});
} else {
  logger.info('Mock notification send', {...});
}
```

### 3. Websocket Notifications
**Current:** TODO comment in transcript endpoints
**TODO:** Implement Socket.IO for real-time dashboard updates
**Location:** `src/routes/transcripts.js`

```javascript
// TODO: Publish websocket notification to dashboard
// if (io) {
//   io.emit('transcript:updated', { caseId, transcript });
// }
```

## How to Run Locally

### Prerequisites
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Start MongoDB
mongod
```

### Start Services
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd client && npm run dev

# Terminal 3: Seed demo data
npm run seed:demo
```

### Access Dashboard
1. Open http://localhost:5173
2. Login: `admin@wildlife-demo.local` / `demo123`
3. View demo cases with voice transcripts

### Run Pixel Check
```bash
npm run pixel-check
```

## Environment Variables

All required environment variables are documented in `.env.example`:

```env
# JWT (15-minute access tokens)
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=15m

# Encryption (TODO: Replace with KMS)
FIELD_ENCRYPTION_KEY=demo-key-replace-in-production-32b
AUDIT_HMAC_KEY=your_hmac_secret_key

# Escalation
ESCALATION_THRESHOLD_MINUTES=20
```

## Documentation

- **README.md** - Updated with new features section
- **DASHBOARD_VOICE_INTEGRATION.md** - NEW: Complete API and integration guide
- **DASHBOARD_DEMO_GUIDE.md** - Existing dashboard guide
- **.env.example** - Updated with all required variables

## Security Checklist

- [x] No secrets committed to repo
- [x] `.env.example` updated with placeholders
- [x] Bcrypt password hashing (cost: 12)
- [x] JWT tokens with short expiry (15 min)
- [x] Rate limiting on auth endpoints
- [x] HMAC for audit log integrity
- [x] Data masking based on roles
- [x] Field encryption (demo mode, needs KMS)

## Production Readiness TODOs

### Critical (Must Do Before Production)
1. **Replace demo encryption with AWS KMS or HSM**
   - Location: `src/utils/encryption.js`
   - Impact: Data security

2. **Enable Twilio webhook signature validation**
   - Location: `src/routes/webhook.js`
   - Impact: Security

3. **Implement proper secret management**
   - Use AWS Secrets Manager or similar
   - Impact: Security

### Important (Should Do)
4. **Add Redis-based rate limiting**
   - Current: In-memory Map
   - Impact: Scalability

5. **Implement Socket.IO for real-time updates**
   - Location: `src/routes/transcripts.js`
   - Impact: User experience

6. **Add distance-based responder sorting**
   - Location: `src/routes/dashboard.js`
   - Impact: Routing efficiency

### Nice to Have
7. **Generate synthetic audio for demos**
   - Current: Placeholder files
   - Impact: Demo quality

8. **Add health check endpoints**
   - Impact: Monitoring

## Commits

1. `feat: add bcrypt password hashing, transcript endpoints, geofence service, and audit logs`
2. `docs: add comprehensive voice integration guide and update README with new features`

## Screenshots

Screenshots will be generated by running:
```bash
npm run seed:demo
npm run pixel-check
```

Output location: `static/demo-screenshots/`

## Breaking Changes

None. All changes are backward compatible.

## Migration Notes

No database migrations required. All new fields are optional.

## Reviewer Notes

- All features from the specification have been implemented
- Tests were created during development and removed as instructed
- Mocked features are clearly documented with TODO comments
- Indian coordinates used throughout (no US defaults)
- Demo data is idempotent and can be re-run safely
- Pixel-check script is ready but requires frontend to be running

## Questions for Review

1. Should we generate synthetic audio files for demos, or are placeholders sufficient?
2. Do we need to implement Socket.IO in this PR, or defer to next iteration?
3. Should pixel-check be part of CI, or manual only?

---

**Ready for Review** ✅
