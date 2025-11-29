# Login Credentials Reference

## Admin Account
Full dashboard access, can manage all cases and responders.

```
Email: admin@wildlife.local
Password: admin123
Role: ADMIN
```

## Responder Accounts
Dashboard access to view and manage assigned cases.

### Dr. Priya Sharma
```
Email: priya.sharma@wildlife.in
Password: responder123
Role: RESPONDER
Organization: Karnataka Wildlife Rescue
Location: Bengaluru Urban, Karnataka
Categories: injured_animal, abandoned_pet
```

### Rajesh Kumar
```
Email: rajesh.kumar@forestdept.in
Password: responder123
Role: RESPONDER
Organization: Karnataka Forest Department
Location: Mysuru, Karnataka
Categories: human_wildlife_conflict, animal_sighting, predator_sighting
```

### Dr. Anjali Desai
```
Email: anjali.desai@animalcare.in
Password: responder123
Role: RESPONDER
Organization: Animal Care Services
Location: Hubballi-Dharwad, Karnataka
Categories: abandoned_pet, injured_animal, other
Status: Currently offline
```

## WhatsApp Users
These users report incidents via WhatsApp (no dashboard access).

### Amit Patel
```
WhatsApp: +919876543220
Role: USER
```

### Sneha Reddy
```
WhatsApp: +919876543221
Role: USER
```

## Quick Login Test

### Test Admin Access
1. Go to http://localhost:5173
2. Login with: `admin@wildlife.local` / `admin123`
3. Should see full dashboard with all cases and responders

### Test Responder Access
1. Go to http://localhost:5173
2. Login with any responder email / `responder123`
3. Should see dashboard with assigned cases

## Resetting Data
If you need to reset all data and credentials:
```bash
npm run seed
```

This will:
- Clear all existing data
- Create 3 responders (Indian locations)
- Create 6 users (1 admin, 3 responders, 2 regular users)
- Create 3 sample reports including Hindi voice case
- All locations set to Karnataka, India

## Security Notes
⚠️ These are development/demo credentials only!

For production:
- Use strong, unique passwords
- Implement password hashing (bcrypt)
- Add password reset functionality
- Enable 2FA for admin accounts
- Use environment variables for default credentials
