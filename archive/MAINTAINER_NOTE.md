# Archive Maintainer Notes

This directory contains files that were moved during the repository reorganization on **2025-11-29**.

## Purpose
These files were archived to declutter the repository root and improve project organization. They are preserved here for historical reference and can be restored if needed.

## Archived Files (unused-20251129-1200/)

### Documentation Files (Historical/Redundant)
- **PR_SUMMARY.md** - Old PR summary, superseded by current documentation
- **FIXES_COMPLETED.md** - Historical fix log, information integrated into main docs
- **IMPLEMENTATION_STATUS.md** - Old status tracking, no longer needed
- **IMPLEMENTATION_COMPLETE.md** - Completion marker, archived after project stabilization
- **IMPLEMENTATION_SUMMARY.md** - Summary document, information in README
- **COMPREHENSIVE_BUG_REPORT.md** - Historical bug report, issues resolved
- **BUG_REPORT.md** - Old bug tracking, superseded by issue tracker
- **FIXES_APPLIED.md** - Historical fix log
- **LOGIN_FIX.md** - Specific fix documentation, integrated into main docs
- **VOICE_CASE_IMPROVEMENTS.md** - Feature improvement notes, integrated
- **TRANSLATION_AND_VOICE_CASES_FIXED.md** - Fix documentation, integrated
- **PR_PIXEL_PERFECT.md** - Old PR documentation
- **PR_DASHBOARD_VOICE_FINALIZE.md** - Old PR documentation
- **PIXEL_PERFECT_IMPLEMENTATION.md** - Implementation notes, integrated
- **PIXEL_CHECK_INSTRUCTIONS.md** - Instructions now in main README
- **PIXEL_CHECK_SETUP.md** - Setup instructions now in main README
- **README_PIXEL_PERFECT.md** - Redundant README variant
- **SETUP_COMPLETE.md** - Setup completion marker
- **START_ALL_SERVICES.md** - Service start instructions, now in README

### Binary Files
- **ngrok.exe** - Windows ngrok executable (can be downloaded from ngrok.com if needed)
  - Reason: Binary executables should not be in version control
  - Restore: Download from https://ngrok.com/download

## How to Restore Files

If you need to restore any archived file:

```bash
# Copy a specific file back to root
cp archive/unused-20251129-1200/FILENAME.md ./

# Or restore to a specific location
cp archive/unused-20251129-1200/ngrok.exe ./tools/
```

## Repository Structure After Reorganization

```
Wildlife-Bot/
├── server/          # Backend server code
│   ├── src/         # Server source code
│   ├── scripts/     # Seed and utility scripts
│   ├── static/      # Demo assets and media
│   ├── logs/        # Application logs
│   └── __tests__/   # Server tests
├── client/          # Frontend dashboard
│   └── src/         # Client source code
├── ops/             # Docker and CI/CD configs
├── archive/         # Archived files (this directory)
├── .github/         # GitHub workflows
├── README.md        # Main documentation
├── .env.example     # Environment template
└── package.json     # Root package with convenience scripts
```

## Notes
- All archived files are preserved with their original content
- Git history is maintained for all moved files
- No functionality was removed, only file locations changed
- The reorganization maintains backward compatibility for all APIs and features

## Contact
If you have questions about archived files or need to restore something, refer to the main README.md or check the git history:

```bash
git log --follow -- archive/unused-20251129-1200/FILENAME.md
```
