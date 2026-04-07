# RentConnect - Quick Start Guide
*Get your development environment running in 5 minutes*

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Get your API keys (free tiers available):
# 1. Resend (Email): https://resend.com/api-keys
# 2. Twilio (SMS): https://console.twilio.com/project-settings
```

**Update `.env` with your keys:**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates database tables)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

### Step 4: Start Development Server
```bash
# This starts both backend and frontend
npm run dev
```

**Your app will be available at:**
- Backend API: http://localhost:4000
- Frontend: http://localhost:3000

---

## 📋 Available Scripts

```bash
# Development
npm run dev          # Start both backend & frontend
npm run dev:server   # Start only backend
npm run dev:client   # Start only frontend

# Build
npm run build        # Build for production
npm run start        # Run production build

# Code Quality
npm run check        # TypeScript type checking
npm run format       # Format code with Prettier
```

---

## 🧪 Testing New Features

### Test Email Verification
```bash
# After starting the server, test the email service:
curl -X POST http://localhost:4000/api/verification/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"email"}'
```

### Test SMS Verification
```bash
curl -X POST http://localhost:4000/api/verification/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"sms","phoneNumber":"+1234567890"}'
```

### Test 2FA Setup
```bash
# 1. Setup 2FA
curl -X POST http://localhost:4000/api/verification/2fa/setup \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response includes QR code URL and backup codes

# 2. Enable 2FA (use code from authenticator app)
curl -X POST http://localhost:4000/api/verification/2fa/enable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

---

## 🗄️ Database Management

### View Database (Prisma Studio)
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Create New Migration
```bash
# After modifying schema.prisma
npx prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
# WARNING: Deletes all data
npx prisma migrate reset
```

### Seed Database (if seed file exists)
```bash
npx prisma db seed
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (Linux/Mac)
lsof -ti:4000 | xargs kill -9

# Or change port in .env
PORT=4001
```

### Database Connection Error
```bash
# Make sure PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: systemctl status postgresql

# Update DATABASE_URL in .env if needed
DATABASE_URL=postgresql://user:password@localhost:5432/rentconnect
```

### Missing API Keys Error
```bash
# The app will work without email/SMS in development
# But verification features won't work
# Get free API keys from:
# - https://resend.com (Email)
# - https://twilio.com (SMS)
```

### TypeScript Errors
```bash
# Regenerate Prisma types
npx prisma generate

# Check for type errors
npm run check
```

---

## 📁 Project Structure

```
rentconnect/
├── src/                      # Backend source
│   ├── modules/             # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── bookings/       # Booking management
│   │   ├── items/          # Listings
│   │   └── payments/       # Payments
│   ├── services/           # Shared services
│   │   ├── email.service.ts      ✅ NEW
│   │   ├── sms.service.ts        ✅ NEW
│   │   ├── otp.service.ts        ✅ NEW
│   │   └── 2fa.service.ts        ✅ NEW
│   ├── middleware/         # Express middleware
│   └── utils/              # Utilities
├── client/src/             # Frontend source
│   ├── pages/              # Page components
│   ├── features/           # Feature components
│   └── services/           # API clients
├── prisma/
│   ├── schema.prisma       # Database schema ✅ UPDATED
│   └── migrations/         # Database migrations
├── tests/                  # Tests (to be added)
└── .env                    # Environment variables
```

---

## 🎯 Next Steps After Setup

### 1. Explore the API
Use tools like **Postman** or **Insomnia** to test endpoints:
- `/api/auth/signup`
- `/api/auth/login`
- `/api/verification/send`
- `/api/verification/2fa/setup`

### 2. Build Frontend Components
Create these UI components:
- Phone verification page
- 2FA setup modal
- Notification preferences

### 3. Write Tests
Add tests for:
- Email service
- SMS service
- 2FA flow
- OTP verification

### 4. Deploy
Follow deployment guide when ready for production.

---

## 📞 Getting Help

### Documentation
- [Main Status Report](./DEVELOPMENT_STATUS.md)
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md)
- [PRD Document](./ideas.md)

### Common Issues

**Q: Emails not sending?**  
A: Check Resend API key and verify domain in Resend dashboard

**Q: SMS not working?**  
A: Ensure Twilio phone number has SMS capabilities enabled

**Q: 2FA codes not validating?**  
A: Check device time sync - TOTP is time-sensitive

**Q: Database errors?**  
A: Run `npx prisma generate` after schema changes

---

## 🎉 You're All Set!

Your RentConnect development environment is ready. Start building amazing features!

**Current Phase:** Phase 1 Complete ✅  
**Next Milestone:** Payment System Integration  

Happy coding! 🚀
