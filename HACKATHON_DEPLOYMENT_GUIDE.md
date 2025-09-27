# 🚀 Wildlife WhatsApp Bot - Complete Hackathon Deployment Guide

**Ready-to-deploy wildlife incident reporting system with WhatsApp integration, AI classification, and real-time routing.**

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Computer with internet connection
- [ ] GitHub account
- [ ] Phone number for WhatsApp testing
- [ ] Credit card for cloud services (AWS, MongoDB Atlas)

---

## 1. 🛠️ Environment Setup

### 1.1 Install Node.js and npm

**Windows:**
```bash
# Download from https://nodejs.org (LTS version)
# Verify installation
node --version  # Should show v16+ 
npm --version   # Should show 8+
```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify installation
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.2 MongoDB Setup

**Option A: MongoDB Atlas (Recommended for Hackathons)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and new cluster
3. Create database user:
   - Username: `wildlife_admin`
   - Password: `SecurePass123!`
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string: `mongodb+srv://wildlife_admin:SecurePass123!@cluster0.xxxxx.mongodb.net/wildlife_bot?retryWrites=true&w=majority`

**Option B: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Windows - Download from https://www.mongodb.com/try/download/community
```

### 1.3 AWS S3 Setup

1. **Create AWS Account**: Go to [AWS Console](https://aws.amazon.com)
2. **Create S3 Bucket**:
   ```bash
   # Bucket name: wildlife-reports-media-[your-initials]
   # Region: us-east-1
   # Block all public access: UNCHECKED (we need private access)
   ```
3. **Create IAM User**:
   - Go to IAM → Users → Create User
   - Username: `wildlife-bot-user`
   - Attach policy: `AmazonS3FullAccess`
   - Save Access Key ID and Secret Access Key

### 1.4 Twilio WhatsApp API Setup

1. **Create Twilio Account**: Go to [Twilio Console](https://console.twilio.com)
2. **Get WhatsApp Sandbox**:
   - Navigate to Messaging → Try it out → Send a WhatsApp message
   - Note your sandbox number: `whatsapp:+14155238886`
   - Send "join [sandbox-code]" to the number from your phone
3. **Get Credentials**:
   - Account SID: Found on dashboard
   - Auth Token: Found on dashboard (click to reveal)

---

## 2. 📦 Project Configuration

### 2.1 Clone Repository

```bash
# Clone the project
git clone https://github.com/your-username/wildlife-whatsapp-bot.git
cd wildlife-whatsapp-bot

# Verify project structure
ls -la
# Should see: src/, scripts/, package.json, README.md
```

### 2.2 Install Dependencies

```bash
# Install all required packages
npm install

# Verify installation
npm list --depth=0
# Should show: express, twilio, mongoose, aws-sdk, etc.
```

### 2.3 Environment Configuration

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration (Replace with your Atlas connection string)
MONGODB_URI=mongodb+srv://wildlife_admin:SecurePass123!@cluster0.xxxxx.mongodb.net/wildlife_bot?retryWrites=true&w=majority

# Twilio WhatsApp Configuration (Replace with your credentials)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# AWS S3 Configuration (Replace with your credentials)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=wildlife-reports-media-your-initials

# Bot Configuration
BOT_NAME=Wildlife Reporter
CASE_TIMEOUT_HOURS=24
HIGH_PRIORITY_RADIUS_KM=10
EXTENDED_RADIUS_KM=25

# Webhook URL (Update when deploying)
WEBHOOK_URL=http://localhost:3000
```

### 2.4 Seed Sample Data

```bash
# Create sample responders and test data
node scripts/seed-data.js

# Expected output:
# ✅ Successfully created 3 sample responders:
#    - Dr. Sarah Johnson (Wildlife Rescue Center)
#    - Mike Rodriguez (Forest Service)  
#    - Dr. Emily Chen (Animal Control Services)
```

---

## 3. 📊 MongoDB Schema Reference

### 3.1 Users Collection
```javascript
{
  _id: ObjectId("64a1b2c3d4e5f6789abcdef0"),
  whatsappNumber: "+1234567890",
  name: "John Doe",
  contactInfo: {
    email: "john@example.com",
    alternatePhone: "+1234567891"
  },
  conversationState: "idle", // idle, selecting_category, providing_location, uploading_media, providing_description
  currentReport: ObjectId("64a1b2c3d4e5f6789abcdef1"),
  isActive: true,
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

### 3.2 Responders Collection
```javascript
{
  _id: ObjectId("64a1b2c3d4e5f6789abcdef2"),
  name: "Dr. Sarah Johnson",
  whatsappNumber: "+1234567890",
  email: "sarah.johnson@wildlife.org",
  organization: "Wildlife Rescue Center",
  categoriesHandled: ["injured_animal", "abandoned_pet"],
  location: {
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    address: "New York, NY",
    serviceRadius: 25
  },
  status: "online", // online, offline, busy
  currentCases: [ObjectId("64a1b2c3d4e5f6789abcdef3")],
  maxConcurrentCases: 3,
  contactInfo: {
    phone: "+1234567890",
    emergencyContact: "+1234567891"
  },
  isActive: true,
  lastSeen: ISODate("2024-01-15T10:30:00.000Z"),
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

### 3.3 Reports Collection
```javascript
{
  _id: ObjectId("64a1b2c3d4e5f6789abcdef3"),
  caseId: "WR-1705123456-AB12",
  reporterId: ObjectId("64a1b2c3d4e5f6789abcdef0"),
  category: "injured_animal", // animal_sighting, injured_animal, abandoned_pet, human_wildlife_conflict, other
  location: {
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    address: "Central Park, NYC",
    description: "Near the pond area"
  },
  description: "Found injured hawk with broken wing",
  mediaUrls: [
    {
      url: "https://s3.amazonaws.com/wildlife-reports-media/WR-1705123456-AB12/image1.jpg",
      mediaType: "image"
    }
  ],
  status: "pending", // pending, accepted, in_progress, resolved, cancelled
  priority: "high", // low, medium, high, critical
  assignedResponder: ObjectId("64a1b2c3d4e5f6789abcdef2"),
  assignedOrganization: "Wildlife Rescue Center",
  aiClassification: {
    confidence: 0.85,
    extractedSpecies: ["hawk"],
    urgencyKeywords: ["injured", "broken", "wing"],
    needsManualReview: false
  },
  timeline: [
    {
      action: "created",
      timestamp: ISODate("2024-01-15T10:30:00.000Z"),
      performedBy: "John Doe",
      details: "Case created by user"
    },
    {
      action: "accepted",
      timestamp: ISODate("2024-01-15T10:35:00.000Z"),
      performedBy: "Dr. Sarah Johnson",
      details: "Case accepted by responder"
    }
  ],
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:35:00.000Z")
}
```

### 3.4 Notifications Collection
```javascript
{
  _id: ObjectId("64a1b2c3d4e5f6789abcdef4"),
  reportId: ObjectId("64a1b2c3d4e5f6789abcdef3"),
  recipientId: ObjectId("64a1b2c3d4e5f6789abcdef2"),
  recipientType: "responder", // user, responder, volunteer
  type: "case_created", // case_created, case_accepted, case_resolved, case_timeout, volunteer_request
  message: "New wildlife case assignment: WR-1705123456-AB12",
  status: "sent", // pending, sent, delivered, failed
  sentAt: ISODate("2024-01-15T10:30:00.000Z"),
  deliveredAt: ISODate("2024-01-15T10:30:05.000Z"),
  metadata: {
    whatsappMessageId: "wamid.xxx",
    retryCount: 0
  },
  createdAt: ISODate("2024-01-15T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-15T10:30:05.000Z")
}
```

---

## 4. 🚀 Running the Bot

### 4.1 Start Server Locally

```bash
# Development mode with auto-restart
npm run dev

# Expected output:
# info: Connected to MongoDB successfully
# info: Database indexes created successfully  
# info: Scheduler started with all jobs
# info: Server started successfully {"port":3000,"environment":"development"}
```

### 4.2 Configure Twilio Webhook

1. **Install ngrok for local testing**:
   ```bash
   # Download from https://ngrok.com or install via package manager
   npm install -g ngrok
   
   # Start tunnel
   ngrok http 3000
   
   # Note the HTTPS URL: https://abc123.ngrok.io
   ```

2. **Set Twilio Webhook**:
   - Go to Twilio Console → Messaging → Settings → WhatsApp sandbox settings
   - Set webhook URL: `https://abc123.ngrok.io/webhook/whatsapp`
   - HTTP method: POST
   - Save configuration

### 4.3 Test Basic Connectivity

```bash
# Test health endpoint
curl http://localhost:3000/webhook/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-15T10:30:00.000Z","service":"wildlife-whatsapp-bot"}

# Test API endpoint
curl http://localhost:3000/api/responders

# Expected response: Array of responder objects
```

---

## 5. 🧪 Testing Flow

### 5.1 Complete User Journey Test

**Step 1: Initial Contact**
```
Send to WhatsApp bot: "Hello"

Expected Response:
"Hi! 🌿 Welcome to Wildlife Reporter Bot.

What kind of wildlife issue are you reporting?

1️⃣ Animal Sighting
2️⃣ Injured Animal 🚨
3️⃣ Abandoned Pet
4️⃣ Human-Wildlife Conflict 🚨
5️⃣ Other

Please reply with the number (1-5) of your choice."
```

**Step 2: Category Selection**
```
Send: "2"

Expected Response:
"📍 Please share the location of the incident.

You can:
• Send your current location (tap 📎 → Location)
• Share a map pin of the incident location
• Or describe the location in text

This helps our responders find you quickly!"
```

**Step 3: Location Input**
```
Send: "Central Park, near the pond area, NYC"

Expected Response:
"📸 Do you have any photos or videos of the incident?

You can:
• Send photos/videos (optional but helpful)
• Type "skip" to continue without media
• Type "done" when finished uploading

Clear photos help our responders assess the situation better."
```

**Step 4: Media Upload**
```
Send: "skip"

Expected Response:
"📝 Please provide additional details about the incident:

• What exactly did you observe?
• When did this happen?
• Any immediate dangers or concerns?
• Animal behavior or condition?

The more details you provide, the better we can help!"
```

**Step 5: Description**
```
Send: "Found an injured hawk with what appears to be a broken wing. The bird is conscious but unable to fly. It's sitting under a tree and seems to be in distress."

Expected Response:
"✅ Your report has been submitted successfully!

🆔 Case ID: WR-1705123456-AB12

Your case is now being reviewed by our wildlife response team. You'll receive updates as responders are assigned.

Save this case ID to check status anytime by sending: STATUS WR-1705123456-AB12

Thank you for helping protect wildlife! 🐾"
```

### 5.2 Verify Database Entries

```bash
# Connect to MongoDB and check data
mongosh "your_mongodb_connection_string"

# Check if user was created
db.users.findOne({whatsappNumber: "+your_phone_number"})

# Check if report was created
db.reports.findOne({caseId: "WR-1705123456-AB12"})

# Verify report structure matches schema
db.reports.findOne({}, {_id:1, caseId:1, category:1, status:1, priority:1})
```

### 5.3 Test Responder Notifications

**Check server logs for responder notifications:**
```bash
# In your terminal running the bot, look for:
# info: Starting report routing {"caseId":"WR-1705123456-AB12","category":"injured_animal","priority":"high"}
# info: Found X responders for high-priority case {"caseId":"WR-1705123456-AB12"}
# info: Responder notified successfully {"caseId":"WR-1705123456-AB12","responderId":"...","responderName":"Dr. Sarah Johnson"}
```

### 5.4 Test Case Acceptance

**From responder's WhatsApp:**
```
Send: "ACCEPT WR-1705123456-AB12"

Expected Response:
"✅ Case WR-1705123456-AB12 accepted successfully! You are now assigned to this case."
```

**Original reporter should receive:**
```
"🎯 Great news! Your case has been accepted.

🆔 Case ID: WR-1705123456-AB12
👤 Responder: Dr. Sarah Johnson
📞 Contact: +1234567890

Your assigned responder will coordinate the response. You can contact them directly if needed.

Thank you for your patience! 🌿"
```

### 5.5 Test Case Resolution

**From responder's WhatsApp:**
```
Send: "RESOLVE WR-1705123456-AB12 Successfully treated and released the hawk"

Expected Response:
"✅ Case WR-1705123456-AB12 marked as resolved. Thank you for your service!"
```

**Original reporter should receive:**
```
"✅ Your wildlife report has been resolved!

🆔 Case ID: WR-1705123456-AB12

Thank you for reporting this incident and helping protect our wildlife. Your contribution makes a difference! 🐾

Feel free to report any new incidents anytime."
```

### 5.6 Test Status Queries

```
Send: "STATUS WR-1705123456-AB12"

Expected Response:
"📋 Case Status: WR-1705123456-AB12

📂 Type: Injured Animal
🔥 Priority: HIGH
📊 Status: RESOLVED
📅 Reported: 1/15/2024
👤 Assigned to: Dr. Sarah Johnson
🏢 Organization: Wildlife Rescue Center

📈 Latest Update: resolved (1/15/2024)"
```

---

## 6. 🌐 Optional Dashboard Setup

### 6.1 API Testing

```bash
# Test API endpoints
curl http://localhost:3000/api/reports
curl http://localhost:3000/api/responders
curl http://localhost:3000/api/stats

# Expected stats response:
{
  "pendingReports": 0,
  "acceptedReports": 0, 
  "resolvedReports": 1,
  "criticalReports": 0,
  "onlineResponders": 2,
  "busyResponders": 0,
  "totalReports": 1
}
```

### 6.2 Dashboard Features (If Implementing)

Create simple HTML dashboard:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Wildlife Reports Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Wildlife Reports Dashboard</h1>
    <div id="stats"></div>
    <div id="reports"></div>
    
    <script>
        // Fetch and display stats
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                document.getElementById('stats').innerHTML = `
                    <h2>Statistics</h2>
                    <p>Pending: ${data.pendingReports}</p>
                    <p>Resolved: ${data.resolvedReports}</p>
                    <p>Online Responders: ${data.onlineResponders}</p>
                `;
            });
            
        // Fetch and display reports
        fetch('/api/reports')
            .then(response => response.json())
            .then(data => {
                const reportsHtml = data.reports.map(report => `
                    <div>
                        <h3>${report.caseId}</h3>
                        <p>Category: ${report.category}</p>
                        <p>Status: ${report.status}</p>
                        <p>Priority: ${report.priority}</p>
                    </div>
                `).join('');
                document.getElementById('reports').innerHTML = `<h2>Reports</h2>${reportsHtml}`;
            });
    </script>
</body>
</html>
```

---

## 7. 🔬 Advanced Features Testing

### 7.1 AI Classification Testing

**Test different message types:**

```
# Test injured animal detection
Send: "There's a bird with a broken wing bleeding on the ground"
# Should classify as: category="injured_animal", priority="high"

# Test human-wildlife conflict
Send: "Aggressive bear destroying my garden and threatening livestock"  
# Should classify as: category="human_wildlife_conflict", priority="critical"

# Test animal sighting
Send: "Beautiful rare bird spotted in the park, took amazing photos"
# Should classify as: category="animal_sighting", priority="low"
```

**Check AI classification in database:**
```javascript
db.reports.findOne({}, {aiClassification: 1, category: 1, priority: 1})

// Expected structure:
{
  "aiClassification": {
    "confidence": 0.85,
    "extractedSpecies": ["bird"],
    "urgencyKeywords": ["broken", "wing", "bleeding"],
    "needsManualReview": false
  },
  "category": "injured_animal",
  "priority": "high"
}
```

### 7.2 High-Priority Override Testing

1. **Create high-priority case** (injured animal or human-wildlife conflict)
2. **Check logs** for "Found X responders for high-priority case"
3. **Verify ALL online responders** receive notifications (not just category-matched)
4. **Confirm immediate notification** without category filtering

### 7.3 Background Jobs Testing

```bash
# Check scheduler logs every hour for timeout checks
# Look for: "Running timeout case check"

# Create a case and wait 24+ hours (or modify timeout in .env for testing)
# Should receive timeout notification

# Check cleanup job logs daily at 2 AM
# Look for: "Running notification cleanup"
```

### 7.4 Media Upload Testing

1. **Send image to bot** during media upload step
2. **Check S3 bucket** for uploaded file
3. **Verify database** contains media URL
4. **Test signed URL generation** for secure access

```bash
# Check S3 bucket contents
aws s3 ls s3://your-bucket-name/

# Should see: WR-1705123456-AB12/uuid-filename.jpg
```

---

## 8. ✅ Hackathon Deployment Checklist

### 8.1 Core Functionality ✓
- [ ] **WhatsApp bot responds** to initial messages
- [ ] **Guided conversation flow** works (category → location → media → description)
- [ ] **Case ID generated** and saved to database
- [ ] **Responders receive notifications** based on category and availability
- [ ] **Case acceptance** works with `ACCEPT <case-id>` command
- [ ] **Case resolution** works with `RESOLVE <case-id>` command
- [ ] **Status queries** work with `STATUS <case-id>` command

### 8.2 Database Integration ✓
- [ ] **MongoDB connection** established
- [ ] **All collections created** with proper schemas
- [ ] **Indexes created** for performance
- [ ] **Sample data seeded** successfully
- [ ] **CRUD operations** working via API

### 8.3 Advanced Features ✓
- [ ] **AI classification** categorizes messages correctly
- [ ] **Priority assignment** works for different incident types
- [ ] **High-priority override** notifies all responders
- [ ] **Media upload** to S3 working
- [ ] **Atomic case locking** prevents double assignment
- [ ] **Background jobs** running (timeout checks, cleanup)

### 8.4 Error Handling ✓
- [ ] **Graceful error handling** for invalid inputs
- [ ] **Logging system** capturing all events
- [ ] **Database connection recovery** on failures
- [ ] **WhatsApp API error handling** with retries

### 8.5 Testing Verification ✓
- [ ] **End-to-end user journey** completed successfully
- [ ] **Multiple responders** can be notified simultaneously
- [ ] **Case timeline** tracked correctly
- [ ] **Notifications** sent to correct recipients
- [ ] **API endpoints** returning expected data

---

## 9. 🚨 Troubleshooting Guide

### 9.1 Common Issues

**Bot not responding to WhatsApp messages:**
```bash
# Check ngrok tunnel is active
curl https://your-ngrok-url.ngrok.io/webhook/health

# Check Twilio webhook configuration
# Verify webhook URL in Twilio console matches ngrok URL

# Check server logs for incoming requests
# Should see: "Incoming WhatsApp message" logs
```

**Database connection errors:**
```bash
# Test MongoDB connection
mongosh "your_connection_string"

# Check .env file has correct MONGODB_URI
# Verify IP whitelist in MongoDB Atlas includes your IP
```

**Media upload failures:**
```bash
# Test AWS credentials
aws s3 ls s3://your-bucket-name

# Check S3 bucket permissions
# Verify IAM user has S3 access
# Check bucket policy allows uploads
```

**Responders not receiving notifications:**
```bash
# Check responder data in database
db.responders.find({status: "online"})

# Verify responder categories match report category
# Check Twilio account balance and message logs
```

### 9.2 Debug Commands

```bash
# Check all environment variables
node -e "console.log(process.env)" | grep -E "(TWILIO|MONGODB|AWS)"

# Test database connection
node -e "require('./src/config/database').connect().then(() => console.log('DB OK')).catch(console.error)"

# Test Twilio connection  
node -e "const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN); twilio.api.accounts.list().then(() => console.log('Twilio OK')).catch(console.error)"

# Check server logs in real-time
tail -f logs/combined.log
```

---

## 10. 🎯 Demo Script for Hackathon

### 10.1 5-Minute Demo Flow

**Minute 1: Problem Introduction**
- "Wildlife incidents need immediate response"
- "Current systems are slow and inefficient"
- "Our solution: WhatsApp bot with AI routing"

**Minute 2: User Journey Demo**
- Show WhatsApp conversation on phone
- Walk through: Hello → Category → Location → Media → Description
- Show case ID generation and confirmation

**Minute 3: Responder Workflow**
- Show responder receiving notification
- Demonstrate ACCEPT command
- Show user receiving assignment notification

**Minute 4: Advanced Features**
- Show AI classification in action
- Demonstrate high-priority override
- Show dashboard with real-time stats

**Minute 5: Impact & Scalability**
- Show database with multiple cases
- Explain routing algorithms
- Discuss deployment and scaling

### 10.2 Key Demo Points

1. **Real WhatsApp Integration** - Not a simulation
2. **Intelligent Routing** - Right responder, right time
3. **Complete Audit Trail** - Every action tracked
4. **Scalable Architecture** - Ready for production
5. **AI-Powered Classification** - Reduces manual work

---

## 🏆 Congratulations!

You now have a fully functional wildlife incident reporting system ready for hackathon demonstration. The system includes:

- ✅ Complete WhatsApp bot with guided conversations
- ✅ MongoDB integration with proper schemas
- ✅ AI-powered incident classification
- ✅ Intelligent responder routing
- ✅ Media upload and storage
- ✅ Real-time notifications
- ✅ Background job processing
- ✅ RESTful API for dashboard integration
- ✅ Comprehensive logging and error handling

**Ready to save wildlife, one WhatsApp message at a time! 🌿🐾**