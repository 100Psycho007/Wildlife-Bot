# Migration Guide: v1.0 → v2.0 Repository Reorganization

This guide helps you migrate from the old flat structure to the new organized `/server` and `/client` structure.

## What Changed

### Directory Structure

**Before (v1.0):**
```
Wildlife-Bot/
├── src/              # Backend source
├── scripts/          # Seed scripts
├── static/           # Demo assets
├── client/           # Frontend
├── __tests__/        # Tests
├── logs/             # Logs
├── package.json      # Backend deps
└── [20+ MD files]    # Documentation clutter
```

**After (v2.0):**
```
Wildlife-Bot/
├── server/           # Backend (all server code)
│   ├── src/
│   ├── scripts/
│   ├── static/
│   ├── logs/
│   ├── __tests__/
│   └── package.json
├── client/           # Frontend (unchanged internally)
│   └── package.json
├── archive/          # Historical docs
├── ops/              # Docker/CI configs (future)
├── package.json      # Root convenience scripts
└── README.md         # Updated documentation
```

## Migration Steps

### For Existing Developers

1. **Pull the latest changes**
   ```bash
   git checkout main
   git pull origin main
   git checkout chore/repo-declutter
   ```

2. **Move your .env file**
   ```bash
   # If you have a .env file in the root
   move .env server\.env
   ```

3. **Install dependencies**
   ```bash
   # Install root dependencies (concurrently)
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Update your workflow**
   
   **Old commands:**
   ```bash
   npm run dev              # Start server
   cd client && npm run dev # Start client
   ```
   
   **New commands (from root):**
   ```bash
   npm run start:dev        # Start both server and client
   # OR individually:
   npm run dev:server       # Start server only
   npm run dev:client       # Start client only
   ```

### For CI/CD Pipelines

Update your CI/CD configuration to use new paths:

**Before:**
```yaml
- run: npm install
- run: npm test
- run: npm run build
```

**After:**
```yaml
- run: npm install
- run: cd server && npm install
- run: cd client && npm install
- run: cd server && npm test
- run: cd client && npm run build
```

### For Docker Deployments

If you have custom Dockerfiles, update paths:

**Before:**
```dockerfile
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY package*.json ./
```

**After:**
```dockerfile
COPY server/src/ ./server/src/
COPY server/scripts/ ./server/scripts/
COPY server/package*.json ./server/
```

## What Stayed the Same

✅ **No Breaking Changes:**
- All API endpoints unchanged
- Database schema unchanged
- Environment variables unchanged (just moved to `server/.env`)
- WhatsApp bot functionality unchanged
- Dashboard features unchanged
- Client code unchanged (still in `/client`)

## Updated Commands Reference

### Root Directory Commands

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start both server and client |
| `npm run dev:server` | Start server only (port 3000) |
| `npm run dev:client` | Start client only (port 5173) |
| `npm run start:server` | Start server in production |
| `npm run build:client` | Build client for production |
| `npm test` | Run server tests |
| `npm run seed` | Seed database |
| `npm run seed:demo` | Seed demo data |
| `npm run pixel-check` | Run pixel tests |
| `npm run install:all` | Install all dependencies |

### Server Directory Commands

```bash
cd server
npm run dev              # Start with nodemon
npm start                # Start in production
npm test                 # Run Jest tests
npm run seed             # Seed database
npm run seed:demo        # Seed demo data
npm run pixel-check      # Run pixel tests
```

### Client Directory Commands

```bash
cd client
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Troubleshooting

### Issue: "Cannot find module"

**Solution:** Install dependencies in the correct directory
```bash
cd server && npm install
cd ../client && npm install
```

### Issue: "ENOENT: no such file or directory, open '.env'"

**Solution:** Move your .env file to the server directory
```bash
move .env server\.env
```

### Issue: Scripts not working

**Solution:** Make sure you're running commands from the root directory
```bash
# From Wildlife-Bot/ root
npm run start:dev
```

### Issue: Tests failing

**Solution:** Ensure server dependencies are installed
```bash
cd server
npm install
npm test
```

## Archived Files

Historical documentation has been moved to `/archive/unused-20251129-1200/`:
- Old PR summaries
- Implementation status docs
- Bug reports
- Setup completion markers
- ngrok.exe binary

See `/archive/MAINTAINER_NOTE.md` for details on restoring archived files.

## Benefits of New Structure

✅ **Cleaner root directory** - Only essential files at top level
✅ **Better organization** - Clear separation of server/client
✅ **Easier onboarding** - New developers understand structure immediately
✅ **Scalable** - Ready for microservices or additional services
✅ **Standard practice** - Follows monorepo conventions
✅ **Preserved history** - All git history maintained with `git mv`

## Need Help?

- Check the updated [README.md](./README.md)
- Review [DASHBOARD_DEMO_GUIDE.md](./DASHBOARD_DEMO_GUIDE.md)
- See archived docs in `/archive/` for historical context
- Open an issue if you encounter problems

## Rollback (if needed)

If you need to rollback to the old structure:

```bash
git checkout main
```

The old structure is preserved in the `main` branch until this PR is merged.
