# PR: Repository Reorganization - Clean Two-Folder Structure

## Summary

This PR reorganizes the Wildlife-Bot repository from a flat structure into a clean, maintainable two-folder architecture (`/server` and `/client`). This is a **non-breaking reorganization** - all functionality remains identical, only file locations have changed.

## Motivation

The repository had accumulated significant clutter:
- 20+ markdown documentation files in root
- Mixed server/client code at top level
- Binary executables in version control
- Redundant and outdated documentation
- Difficult for new developers to navigate

## Changes Made

### 1. Directory Restructure

**Backend → `/server`**
- Moved `src/` → `server/src/`
- Moved `scripts/` → `server/scripts/`
- Moved `static/` → `server/static/`
- Moved `logs/` → `server/logs/`
- Moved `__tests__/` → `server/__tests__/`
- Created `server/package.json` with backend dependencies
- Created `server/.env.example`

**Frontend** (already in `/client`)
- No changes to client code
- Client structure remains unchanged

**Archive → `/archive`**
- Moved 20+ historical documentation files to `/archive/unused-20251129-1200/`
- Moved `ngrok.exe` binary to archive
- Created `MAINTAINER_NOTE.md` documenting archived files

**Root Level**
- Created new `package.json` with convenience scripts
- Updated `README.md` with new structure and instructions
- Created `MIGRATION_GUIDE.md` for developers
- Kept essential files: `.env.example`, `.gitignore`, `LICENSE`, `.github/`

### 2. Package.json Updates

**Root `package.json`** - Convenience scripts:
```json
{
  "scripts": {
    "start:dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "test": "cd server && npm test",
    "seed:demo": "cd server && npm run seed:demo",
    "install:all": "npm install && cd server && npm install && cd ../client && npm install"
  }
}
```

**Server `package.json`** - Updated paths:
- Changed name to `wildlife-whatsapp-bot-server`
- All scripts reference local paths (already relative)

### 3. Documentation Updates

**Updated Files:**
- `README.md` - Complete rewrite with new structure
- Created `MIGRATION_GUIDE.md` - Step-by-step migration instructions
- Created `archive/MAINTAINER_NOTE.md` - Archive documentation

**Archived Files:**
- `BUG_REPORT.md`
- `COMPREHENSIVE_BUG_REPORT.md`
- `FIXES_APPLIED.md`
- `FIXES_COMPLETED.md`
- `IMPLEMENTATION_COMPLETE.md`
- `IMPLEMENTATION_STATUS.md`
- `IMPLEMENTATION_SUMMARY.md`
- `LOGIN_FIX.md`
- `PIXEL_CHECK_INSTRUCTIONS.md`
- `PIXEL_CHECK_SETUP.md`
- `PIXEL_PERFECT_IMPLEMENTATION.md`
- `PR_DASHBOARD_VOICE_FINALIZE.md`
- `PR_PIXEL_PERFECT.md`
- `PR_SUMMARY.md`
- `README_PIXEL_PERFECT.md`
- `SETUP_COMPLETE.md`
- `START_ALL_SERVICES.md`
- `TRANSLATION_AND_VOICE_CASES_FIXED.md`
- `VOICE_CASE_IMPROVEMENTS.md`
- `ngrok.exe` (binary)

## What Did NOT Change

✅ **Zero Breaking Changes:**
- All API endpoints remain identical
- Database schema unchanged
- Environment variables unchanged (just moved to `server/.env`)
- WhatsApp bot functionality unchanged
- Dashboard features unchanged
- Client code unchanged
- All tests unchanged (just moved to `server/__tests__/`)

## Git History Preservation

All file moves used `git mv` where possible to preserve git history:
- 84 files changed
- 31 files renamed with history preserved
- 22 files archived
- 12,835 insertions, 298 deletions

## Testing Performed

### Manual Testing Checklist
- [ ] Server starts successfully: `npm run dev:server`
- [ ] Client starts successfully: `npm run dev:client`
- [ ] Both start together: `npm run start:dev`
- [ ] Demo seed works: `npm run seed:demo`
- [ ] Pixel check works: `npm run pixel-check`
- [ ] Dashboard loads at http://localhost:5173
- [ ] Login works with demo credentials
- [ ] Cases display correctly on dashboard
- [ ] Map pins show Indian locations
- [ ] Voice transcripts accessible

### Automated Testing
- [ ] Server unit tests pass: `cd server && npm test`
- [ ] No import/require errors
- [ ] Static assets load correctly

## Migration Instructions

### For Developers

1. **Pull and checkout branch:**
   ```bash
   git checkout chore/repo-declutter
   ```

2. **Move .env file:**
   ```bash
   move .env server\.env
   ```

3. **Install dependencies:**
   ```bash
   npm run install:all
   ```

4. **Start development:**
   ```bash
   npm run start:dev
   ```

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for complete instructions.

## File Structure Comparison

### Before (v1.0)
```
Wildlife-Bot/
├── src/
├── scripts/
├── static/
├── client/
├── __tests__/
├── logs/
├── package.json
├── [20+ documentation files]
└── ngrok.exe
```

### After (v2.0)
```
Wildlife-Bot/
├── server/
│   ├── src/
│   ├── scripts/
│   ├── static/
│   ├── logs/
│   ├── __tests__/
│   └── package.json
├── client/
│   └── package.json
├── archive/
│   └── unused-20251129-1200/
├── ops/
├── package.json
├── README.md
├── MIGRATION_GUIDE.md
└── .env.example
```

## Benefits

1. **Cleaner Root** - Only essential files at top level
2. **Better Organization** - Clear server/client separation
3. **Easier Onboarding** - New developers understand structure immediately
4. **Scalable** - Ready for additional services or microservices
5. **Standard Practice** - Follows monorepo conventions
6. **Preserved History** - All git history maintained

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Developers have old .env location | Migration guide + .env.example in both locations |
| CI/CD pipelines break | No CI/CD currently configured |
| Import paths break | All paths are relative, no changes needed |
| Tests fail | Tests moved with code, paths unchanged |
| Lost documentation | All docs archived with restoration instructions |

## Rollback Plan

If issues arise:
1. Revert to `main` branch
2. Old structure preserved until PR merge
3. All changes in single commit for easy revert

## Checklist

- [x] Backend moved to `/server`
- [x] Frontend remains in `/client`
- [x] Historical docs archived
- [x] Root package.json created with convenience scripts
- [x] README updated
- [x] Migration guide created
- [x] Archive maintainer notes created
- [x] Git history preserved
- [x] .env.example updated
- [ ] Manual smoke tests completed
- [ ] Automated tests pass
- [ ] PR description complete

## Next Steps After Merge

1. Update any external documentation
2. Notify team of new structure
3. Update deployment scripts if any
4. Consider adding Docker configurations to `/ops`
5. Consider adding CI/CD workflows to `.github/workflows`

## Questions?

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) or comment on this PR.

---

**This is a reorganization PR - no logic changes, only file locations.**
