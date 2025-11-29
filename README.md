# Wildlife WhatsApp Bot System

A comprehensive WhatsApp bot system for reporting and managing wildlife incidents with automated routing, AI classification, and real-time notifications.

## 🎯 Repository Structure (v3.0 - Polished & Reorganized)

This repository has been reorganized into a clean, professional structure:

```
Wildlife-Bot/
├── backend/             # Backend server (Express, MongoDB, WhatsApp bot)
│   ├── src/            # Server source code
│   ├── scripts/        # Seed and utility scripts
│   ├── static/         # Demo assets and media
│   ├── logs/           # Application logs
│   ├── tests/          # Server tests
│   └── package.json    # Server dependencies
├── frontend/            # Frontend dashboard (React, Vite, Leaflet)
│   ├── src/            # Client source code
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── styles/     # CSS and design tokens
│   │   └── utils/      # Utility functions
│   └── package.json    # Client dependencies
├── ops/                 # Docker and CI/CD configurations
├── archive/             # Historical documentation (archived)
├── .github/             # GitHub workflows
├── README.md            # This file
├── .env.example         # Environment template
└── package.json         # Root convenience scripts
```

## Features

### 🖥️ Responder Dashboard
- **Web Interface**: Secure dashboard for responders and admins
- **Multi-Source Support**: View cases from WhatsApp and Voice calls
- **Voice Transcripts**: Play audio and view transcripts for voice reports
- **Role-Based Access**: Admin and Responder roles with proper data masking
- **Real-time Filters**: Filter by source, status, priority, language
- **Case Management**: Accept and resolve cases directly from dashboard
- **Presence System**: Real-time responder online/offline status
- **Geofencing**: Automatic escalation for cases in protected zones
- **Audit Logs**: Complete tamper-proof audit trail with HMAC
- **Smart Routing**: Suggested responder matching based on category and availability

See [DASHBOARD_DEMO_GUIDE.md](./DASHBOARD_DEMO_GUIDE.md) for complete dashboard documentation.
See [DASHBOARD_VOICE_INTEGRATION.md](./DASHBOARD_VOICE_INTEGRATION.md) for voice integration and API details.

### 🤖 WhatsApp Bot Capabilities
- **Guided Conversation Flow**: Step-by-step incident reporting
- **Category Selection**: Animal sighting, injured animal, abandoned pet, human-wildlife conflict, other
- **Location Collection**: GPS coordinates or text descriptions
- **Media Upload**: Photos and videos with cloud storage
- **AI Classification**: Automatic categorization and priority assignment
- **Status Tracking**: Real-time case status updates

### 🚨 Smart Routing & Notifications
- **Category-based Routing**: Matches responders to incident types
- **High-Priority Override**: Critical cases notify all available responders
- **Atomic Case Assignment**: Prevents multiple responders claiming same case
- **Timeout Notifications**: Alerts for unassigned cases after 24 hours
- **Real-time Updates**: Instant notifications for all stakeholders

### 📊 Database & Analytics
- **MongoDB Integration**: Scalable document storage
- **Comprehensive Models**: Users, reports, responders, notifications
- **Geospatial Indexing**: Location-based queries and routing
- **Timeline Tracking**: Complete audit trail for each case
- **Performance Optimized**: Proper indexing and query optimization

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Twilio WhatsApp Business Account
- AWS S3 Bucket (for media storage, optional for demo)

### Installation

1. **Clone and Install All Dependencies**
```bash
git clone <repository-url>
cd Wildlife-Bot
npm run install:all
```

This will install dependencies for root, server, and client.

2. **Setup MongoDB**
```bash
# Start MongoDB (if running locally)
mongod
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.example backend/.env
# Edit backend/.env with your configuration
```

Required environment variables in `backend/.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wildlife_reports
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=wildlife-reports-media
```

4. **Seed Demo Data**
```bash
# From root directory
npm run seed:demo
```

This creates demo users, cases, and generates placeholder audio/screenshots.

5. **Start the Application**
```bash
# Start both server and client (recommended for development)
npm run start:dev

# Or start individually:
# Terminal 1 - Backend Server
npm run dev:server

# Terminal 2 - Frontend Client
npm run dev:client
```

6. **Access the Dashboard**
- Open browser to: `http://localhost:5173`
- Login with demo credentials:
  - Admin: `admin@wildlife.local` / `admin123`
  - Responder: `responder1@wildlife.local` / `responder123`

### Quick WhatsApp Test (Twilio Sandbox + ngrok)

1. **Expose your local server**
```bash
# In a new terminal
ngrok http 3000
```
Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`).

2. **Configure Twilio WhatsApp Sandbox**
- Go to Twilio Console → Messaging → Try it out → WhatsApp Sandbox
- Set "When a message comes in" to: `https://<your-ngrok>.ngrok.io/webhook/whatsapp`
- Save

3. **Test on WhatsApp**
- Join the Twilio Sandbox (follow instructions in Twilio Console)
- Send any message to receive the category prompt
- Reply with 1-5 → send location text → send photos/videos or "skip" → send description
- You'll receive a case ID and can check status by sending: `STATUS <case-id>`

## Available Scripts

Run these commands from the **root directory**:

```bash
# Development
npm run dev:server       # Start backend server in dev mode (port 3000)
npm run dev:client       # Start frontend client in dev mode (port 5173)
npm run start:dev        # Start both server and client concurrently

# Production
npm run start:server     # Start server in production mode
npm run build:client     # Build client for production

# Testing & Utilities
npm test                 # Run server tests
npm run seed             # Seed database with sample data
npm run seed:demo        # Seed demo data with Indian locations
npm run pixel-check      # Run pixel-perfect UI tests

# Installation
npm run install:all      # Install all dependencies (root, server, client)
```

### Server-Specific Scripts

Run these from the `server/` directory:

```bash
cd server
npm run dev              # Start server with nodemon
npm start                # Start server in production
npm test                 # Run Jest tests
npm run seed             # Seed database
npm run seed:demo        # Seed demo data
npm run pixel-check      # Run pixel tests
```

### Client-Specific Scripts

Run these from the `client/` directory:

```bash
cd client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Usage Examples

### 📱 User Interaction Flow

**1. Initial Report**
```
User: "Hello"
Bot: "Hi! What kind of wildlife issue are you reporting?
1️⃣ Animal Sighting
2️⃣ Injured Animal 🚨
3️⃣ Abandoned Pet
4️⃣ Human-Wildlife Conflict 🚨
5️⃣ Other"

User: "2"
Bot: "📍 Please share the location of the incident..."
```

**2. Status Check**
```
User: "STATUS WR-1703123456-AB12"
Bot: "📋 Case Status: WR-1703123456-AB12
📂 Type: Injured Animal
🔥 Priority: HIGH
📊 Status: ACCEPTED
👤 Assigned to: Dr. Sarah Johnson"
```

### 👨‍⚕️ Responder Commands

**Accept Case**
```
Responder: "ACCEPT WR-1703123456-AB12"
Bot: "✅ Case WR-1703123456-AB12 accepted successfully!"
```

**Resolve Case**
```
Responder: "RESOLVE WR-1703123456-AB12 Successfully treated and released"
Bot: "✅ Case WR-1703123456-AB12 marked as resolved. Thank you!"
```

## API Documentation

### REST Endpoints

#### Reports
- `GET /api/reports` - List all reports with filtering
- `GET /api/reports/:caseId` - Get specific report
- `POST /api/reports/:caseId/accept` - Accept a case
- `POST /api/reports/:caseId/resolve` - Resolve a case

#### Responders
- `GET /api/responders` - List all responders
- `POST /api/responders` - Create new responder
- `PATCH /api/responders/:id/status` - Update responder status

#### Statistics
- `GET /api/stats` - Get dashboard statistics

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Express.js     │    │   MongoDB       │
│   Users         │◄──►│   Server         │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Background     │
                       │   Jobs           │
                       └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   AWS S3         │
                       │   Media Storage  │
                       └──────────────────┘
```

## Deployment

### Production Deployment

1. **Build the client**
```bash
npm run build:client
```

2. **Set production environment variables**
```bash
export NODE_ENV=production
export MONGODB_URI=mongodb://your-production-db
export WEBHOOK_URL=https://your-domain.com
```

3. **Start with PM2**
```bash
npm install -g pm2
cd server
pm2 start src/server.js --name wildlife-bot
pm2 startup
pm2 save
```

### Docker Deployment

See `ops/` directory for Docker and docker-compose configurations (coming soon).

## Migration Notes (v1.0 → v2.0)

### What Changed (v3.0)
- **File Structure**: Backend moved to `/backend`, frontend to `/frontend`
- **UI/UX**: Completely modernized with professional design system
- **Scripts**: All scripts now in `/backend/scripts`
- **Static Assets**: Demo assets in `/backend/static`
- **Documentation**: Historical docs archived to `/archive`
- **Package Scripts**: Root package.json updated with new paths
- **Design System**: New ui-tokens.css with comprehensive design tokens
- **Animations**: Smooth transitions and micro-interactions throughout

### What Stayed the Same
- All API endpoints unchanged
- Database schema unchanged
- Environment variables unchanged (just moved to `backend/.env`)
- WhatsApp bot functionality unchanged
- Core dashboard features unchanged

### How to Update Your Local Setup
1. Pull the latest changes
2. Run `npm run install:all` to install dependencies
3. Move your `.env` file to `backend/.env`
4. Use new scripts: `npm run start:dev` (replaces old dev scripts)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue for bugs
- Check documentation for common problems
- Review logs in `server/logs/` for troubleshooting

---

**Built for wildlife conservation organizations and emergency responders** 🌿🐾
