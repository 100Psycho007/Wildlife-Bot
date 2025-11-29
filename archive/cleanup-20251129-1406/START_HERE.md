# Quick Start Guide

## Database: MongoDB Atlas (Cloud)
Your app uses **MongoDB Atlas** (cloud database), not a local database.

## Start the Application

### 1. Start Backend (Terminal 1)
```bash
cd Wildlife-Bot/server
npm run dev
```

### 2. Seed Demo Data (Terminal 2 - only first time or after DB reset)
```bash
cd Wildlife-Bot/server
npm run seed:demo
```

### 3. Start Frontend (Terminal 3)
```bash
cd Wildlife-Bot/client
npm run dev
```

### 4. Open Browser
Navigate to: http://localhost:5173

## Login Credentials

**Admin Account:**
- Email: `admin@wildlife-demo.local`
- Password: `demo123`

**Responder Accounts:**
- Email: `amit.patel@wildlifengo.in` / Password: `responder123`
- Email: `rajesh.kumar@rescue.in` / Password: `responder123`
- Email: `priya.sharma@forest.gov.in` / Password: `responder123`

## Troubleshooting

### "Invalid credentials" error?
Run the auth test to verify and fix:
```bash
cd Wildlife-Bot/server
node test-auth-system.js
```

This will:
- Test MongoDB connection
- Verify/create admin user
- Test password hashing
- Confirm login works

### Database cleared?
Re-run the seed command:
```bash
cd Wildlife-Bot/server
npm run seed:demo
```

### Still not working?
Check:
1. Backend is running on port 3000
2. Frontend is running on port 5173
3. MongoDB connection string is correct in `server/.env`
4. Use exact credentials: `admin@wildlife-demo.local` / `demo123`
