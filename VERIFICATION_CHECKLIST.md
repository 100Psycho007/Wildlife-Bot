# Verification Checklist - Repository Reorganization

Use this checklist to verify the reorganization was successful.

## Pre-Verification Setup

1. **Install Dependencies**
   ```bash
   # From root directory
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

2. **Setup Environment**
   ```bash
   # Copy .env.example to server/.env
   cp server/.env.example server/.env
   # Edit server/.env with your credentials
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

## Verification Steps

### ✅ 1. Directory Structure

Verify the new structure exists:

```bash
# Check server directory
dir server\src
dir server\scripts
dir server\static
dir server\logs
dir server\__tests__

# Check client directory
dir client\src

# Check archive
dir archive\unused-20251129-1200

# Check root files
dir README.md
dir MIGRATION_GUIDE.md
dir PR_REPO_REORGANIZATION.md
```

**Expected:** All directories and files exist

### ✅ 2. Package.json Scripts

Test root convenience scripts:

```bash
# From root directory
npm run dev:server     # Should start server on port 3000
# Stop with Ctrl+C

npm run dev:client     # Should start client on port 5173
# Stop with Ctrl+C

npm run start:dev      # Should start both concurrently
# Stop with Ctrl+C
```

**Expected:** All scripts execute without errors

### ✅ 3. Server Functionality

```bash
# Start server
npm run dev:server
```

In another terminal:
```bash
# Test health endpoint
curl http://localhost:3000/webhook/health
```

**Expected:** Returns `{"status":"healthy",...}`

### ✅ 4. Database Seeding

```bash
# Seed demo data
npm run seed:demo
```

**Expected:** 
- Demo users created
- Demo responders created
- Demo cases created
- Screenshots generated

### ✅ 5. Client Dashboard

```bash
# Start both server and client
npm run start:dev
```

Open browser to `http://localhost:5173`

**Verify:**
- [ ] Login page loads
- [ ] Can login with `admin@wildlife-demo.local` / `demo123`
- [ ] Dashboard shows demo cases
- [ ] Map displays with Indian location pins
- [ ] Cases have correct data (source, language, status)
- [ ] Voice transcripts accessible
- [ ] Audio playback works

### ✅ 6. Static Assets

Check that demo assets are accessible:

```bash
# Check screenshots exist
dir server\static\demo-screenshots\

# Check audio files exist
dir server\static\demo-audio\
```

**Expected:** Files exist in server/static/

### ✅ 7. Tests

```bash
# Run server tests
cd server
npm test
```

**Expected:** All tests pass (or document any pre-existing failures)

### ✅ 8. Pixel Check

```bash
# From root
npm run pixel-check
```

**Expected:** Pixel comparison completes without errors

### ✅ 9. Git History

Verify git history is preserved:

```bash
# Check a moved file's history
git log --follow server/src/server.js

# Check renamed files
git log --follow server/scripts/seed-demo.js
```

**Expected:** Full commit history visible

### ✅ 10. Environment Variables

Verify .env location:

```bash
# Should exist
dir server\.env

# Should have example
dir server\.env.example
```

**Expected:** Both files exist in server/

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Run `npm install` in the correct directory (root, server, or client)

### Issue: "ENOENT: no such file or directory, open '.env'"
**Solution:** Ensure `.env` is in `server/` directory, not root

### Issue: "Port already in use"
**Solution:** Stop any running instances of the server/client

### Issue: "MongoDB connection failed"
**Solution:** Ensure MongoDB is running: `mongod`

### Issue: Tests fail
**Solution:** 
1. Check if tests were failing before reorganization
2. Ensure server dependencies installed: `cd server && npm install`
3. Check MongoDB is running

## Success Criteria

All of the following must be true:

- [x] New directory structure exists (`/server`, `/client`, `/archive`)
- [ ] Root convenience scripts work (`npm run start:dev`)
- [ ] Server starts without errors
- [ ] Client starts without errors
- [ ] Demo data seeds successfully
- [ ] Dashboard loads and displays cases
- [ ] Map shows Indian locations
- [ ] Voice transcripts accessible
- [ ] Static assets load correctly
- [ ] Tests pass (or pre-existing failures documented)
- [ ] Git history preserved for moved files
- [ ] No breaking changes to functionality

## Final Verification

Run this complete test sequence:

```bash
# 1. Clean install
npm run install:all

# 2. Seed demo data
npm run seed:demo

# 3. Start application
npm run start:dev

# 4. In browser, verify:
#    - http://localhost:5173 loads
#    - Login works
#    - Dashboard shows cases
#    - Map displays correctly

# 5. Run tests
cd server && npm test

# 6. Run pixel check
cd .. && npm run pixel-check
```

If all steps complete successfully, the reorganization is verified! ✅

## Rollback (if needed)

If verification fails and issues cannot be resolved:

```bash
git checkout main
```

Document the issues encountered and address before re-attempting the reorganization.
