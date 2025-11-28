# Wildlife WhatsApp Bot System

A comprehensive WhatsApp bot system for reporting and managing wildlife incidents with automated routing, AI classification, and real-time notifications.

## Features

### 🖥️ Responder Dashboard (NEW)
- **Web Interface**: Secure dashboard for responders and admins
- **Multi-Source Support**: View cases from WhatsApp and Voice calls
- **Voice Transcripts**: Play audio and view transcripts for voice reports
- **Role-Based Access**: Admin and Responder roles with proper data masking
- **Real-time Filters**: Filter by source, status, priority, language
- **Case Management**: Accept and resolve cases directly from dashboard

See [DASHBOARD_DEMO_GUIDE.md](./DASHBOARD_DEMO_GUIDE.md) for complete dashboard documentation.

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

### 🎯 Advanced Features
- **AI/NLP Classification**: Automatic incident categorization with confidence scoring
- **Media Management**: AWS S3 integration for secure file storage
- **Volunteer Network**: Proximity-based volunteer notifications
- **Web Dashboard**: Real-time monitoring and case management
- **Automated Scheduling**: Background jobs for maintenance and monitoring

## Quick Start

### Quick Local Test (Twilio Sandbox + ngrok)

1. Install deps and run MongoDB
```bash
npm install
mongod
```

2. Create `.env`
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wildlife_reports
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

3. Start the server
```bash
npm run dev
```

4. Expose via ngrok (in another terminal)
```bash
ngrok http 3000
```
Copy the HTTPS forwarding URL.

5. Configure Twilio WhatsApp Sandbox webhook
- Twilio Console → Messaging → Try it out → WhatsApp Sandbox
- Set “When a message comes in” to: `https://<your-ngrok>.ngrok.io/webhook/whatsapp`
- Save

6. Test on WhatsApp (after joining the Sandbox)
- Send any message to receive the category prompt
- Reply with 1-5 → send location text → send photos/videos or "skip" → send description
- You’ll receive a case ID and can check status by sending: `STATUS <case-id>`


### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Twilio WhatsApp Business Account
- AWS S3 Bucket (for media storage)

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd wildlife-whatsapp-bot
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
# Start MongoDB (if running locally)
mongod

# Seed sample data
node scripts/seed-data.js
```

4. **Start the Server**
```bash
# Development
npm run dev

# Production
npm start
```

### Configuration

#### Required Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/wildlife_reports

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=wildlife-reports-media
```

#### Twilio Webhook Setup
1. Go to Twilio Console → WhatsApp → Sandbox
2. Set webhook URL: `https://your-domain.com/webhook/whatsapp`
3. Enable incoming messages

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

**Get Case Details**
```
Responder: "DETAILS WR-1703123456-AB12"
Bot: "📋 Case Details: WR-1703123456-AB12
📂 Category: Injured Animal
🔥 Priority: HIGH
📍 Location: Central Park, NYC
📝 Description: Injured hawk with broken wing..."
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

### Example API Usage

**Create Responder**
```bash
curl -X POST http://localhost:3000/api/responders \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Smith",
    "whatsappNumber": "+1234567890",
    "organization": "Wildlife Rescue",
    "categoriesHandled": ["injured_animal", "abandoned_pet"],
    "location": {
      "coordinates": { "latitude": 40.7128, "longitude": -74.0060 },
      "address": "New York, NY"
    }
  }'
```

**Get Reports**
```bash
curl "http://localhost:3000/api/reports?status=pending&priority=high&page=1&limit=10"
```

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

### Data Models

**Report Schema**
```javascript
{
  caseId: "WR-1703123456-AB12",
  category: "injured_animal",
  location: { coordinates: {...}, description: "..." },
  description: "Detailed incident description",
  priority: "high",
  status: "pending",
  mediaUrls: [...],
  aiClassification: {...},
  timeline: [...]
}
```

**Responder Schema**
```javascript
{
  name: "Dr. Sarah Johnson",
  whatsappNumber: "+1234567890",
  categoriesHandled: ["injured_animal", "abandoned_pet"],
  location: { coordinates: {...}, serviceRadius: 25 },
  status: "online",
  currentCases: [...],
  maxConcurrentCases: 3
}
```

## Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=mongodb://your-production-db
export WEBHOOK_URL=https://your-domain.com
```

2. **Process Management**
```bash
# Using PM2
npm install -g pm2
pm2 start src/server.js --name wildlife-bot
pm2 startup
pm2 save
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring & Maintenance

### Logging
- Winston-based structured logging
- Separate error and combined log files
- Console output in development

### Background Jobs
- **Timeout Check**: Hourly scan for unassigned cases
- **Cleanup**: Daily removal of old notifications
- **Status Update**: 5-minute responder status refresh

### Health Monitoring
```bash
# Health check endpoint
curl http://localhost:3000/webhook/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "wildlife-whatsapp-bot"
}
```

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
- Review logs for troubleshooting

---

**Built for wildlife conservation organizations and emergency responders** 🌿🐾