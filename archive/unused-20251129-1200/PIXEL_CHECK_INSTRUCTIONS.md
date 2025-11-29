# Pixel Check Instructions

## Prerequisites

Before running `npm run pixel-check`, ensure all services are running:

### 1. Start Backend (Terminal 1)
```bash
npm run dev
```

Wait for:
```
Server started successfully
```

### 2. Seed Demo Data (Terminal 2)
```bash
npm run seed:demo
```

Wait for:
```
✓ Demo data seeded successfully
```

### 3. Start Frontend (Terminal 3)
```bash
cd client
npm run dev
```

Wait for:
```
Local: http://localhost:5173/
```

### 4. Verify Services

Open browser and check:
- Backend: http://localhost:3000 (should show API info)
- Frontend: http://localhost:5173 (should show login page)

### 5. Run Pixel Check (Terminal 4)
```bash
npm run pixel-check
```

## Expected Output

### If Reference Frames Exist
```
=== Pixel-Perfect Visual Diff Check ===

Frontend URL: http://localhost:5173
Threshold: 2%

Checking if frontend is running...
✓ Frontend is accessible

Step 1: Logging in...
✓ Logged in successfully

Step: Capturing dashboard_home_page...
✓ Screenshot saved: static/demo-screenshots/dashboard_home_page.png
✅ PASS: dashboard_home_page (0.45% difference)

Step: Capturing dashboard_responders...
✓ Screenshot saved: static/demo-screenshots/dashboard_responders.png
✅ PASS: dashboard_responders (0.78% difference)

Step: Capturing dashboard_map...
✓ Screenshot saved: static/demo-screenshots/dashboard_map.png
✅ PASS: dashboard_map (1.23% difference)

=== Summary ===
Passed: 3/3
Failed: 0/3

✅ All visual diff checks PASSED
```

### If Reference Frames Missing
```
⚠️ Reference image not found: static/demo-ui-frames/dashboard_home_page.png
✅ PASS: dashboard_home_page (skipped - no reference)
```

## Troubleshooting

### Error: "Cannot connect to frontend"
**Solution**: Start frontend with `cd client && npm run dev`

### Error: "Navigation timeout"
**Causes**:
1. Frontend not running
2. Frontend on wrong port
3. Backend not running
4. Demo data not seeded

**Solution**: Follow prerequisites 1-3 above

### Error: "Failed to load login page"
**Solution**: 
1. Check frontend is on port 5173
2. Check no other app is using port 5173
3. Restart frontend

### Error: "Login failed"
**Solution**:
1. Ensure demo data is seeded: `npm run seed:demo`
2. Check credentials: admin@wildlife-demo.local / demo123
3. Check backend logs for errors

### Screenshots Generated but No Comparison
**Cause**: Reference frames not provided

**Solution**: Add reference UI frames to `static/demo-ui-frames/`:
- dashboard_home_page.png
- dashboard_responders.png
- dashboard_map.png

### Pixel Check Fails (>2% difference)
**Solution**:
1. Review diff images in `static/demo-screenshots/*_diff.png`
2. Red pixels show differences
3. Adjust CSS in `client/src/styles/ui-tokens.css`
4. Re-run pixel-check

## Manual Testing Alternative

If pixel-check fails, you can manually verify:

1. Open http://localhost:5173
2. Login with admin@wildlife-demo.local / demo123
3. Compare dashboard visually with reference frames
4. Check:
   - Colors match
   - Spacing matches
   - Font sizes match
   - Border radius matches
   - Shadows match

## Quick Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Demo data seeded
- [ ] Can login manually
- [ ] Dashboard loads
- [ ] Reference frames in static/demo-ui-frames/ (optional)
- [ ] Run npm run pixel-check

## Notes

- Pixel check takes ~30-60 seconds
- Screenshots saved to `static/demo-screenshots/`
- Diff images show exact pixel differences
- 2% threshold allows minor rendering differences
- Reference frames are optional (check will skip comparison)
