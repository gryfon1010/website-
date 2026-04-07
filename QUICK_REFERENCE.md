# ⚡ Quick Reference: APIs & Testing

**One-page cheat sheet for APIs and testing your RentConnect app!**

---

## 🎯 Super Quick Start

### Want to Test Without Any APIs? (5 minutes)
```bash
# 1. Copy mock configuration
cp .env.example .env

# 2. Start the app
npm run dev

# 3. Open browser
http://localhost:3000

# That's it! Everything works in mock mode!
```

### Want to Add Real APIs? (30 minutes)
1. Get Stripe test keys → https://dashboard.stripe.com
2. Get Cloudinary keys → https://cloudinary.com
3. Add to `.env` file
4. Restart app

---

## 📊 API Quick Reference

| API | What It Does | Free Tier | Get It | Time |
|-----|--------------|-----------|--------|------|
| **Stripe** | Payment processing | Test mode free | https://dashboard.stripe.com | 10 min |
| **Cloudinary** | Image hosting | 25GB/month | https://cloudinary.com | 5 min |
| **Resend** | Email sending | 100 emails/day | https://resend.com | 5 min |
| **Twilio** | SMS messages | $15 credit | https://twilio.com | 10 min |
| **PayPal** | Alternative payments | Sandbox free | https://developer.paypal.com | 10 min |
| **Redis** | Caching/queues | Free locally | Install or https://redis.com | 5 min |

---

## 🔑 Quick API Setup

### Stripe (Most Important)

```bash
# 1. Go to https://dashboard.stripe.com
# 2. Enable "Test Mode" (toggle at top)
# 3. Get keys from Developers → API keys
# 4. Add to .env:
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Cloudinary (Image Uploads)

```bash
# 1. Go to https://cloudinary.com
# 2. Create free account
# 3. Copy credentials from dashboard
# 4. Add to .env:
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

### Resend (Email)

```bash
# 1. Go to https://resend.com/api-keys
# 2. Create API key
# 3. Add to .env:
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=RentConnect <onboarding@resend.dev>
```

---

## 🧪 Testing Checklist (No APIs Required)

### ✅ Works Out of the Box:

- [x] User signup/login
- [x] Create listings
- [x] Browse listings
- [x] Search & filter
- [x] Create bookings
- [x] View bookings
- [x] Send messages
- [x] Real-time chat
- [x] User profiles
- [x] Dashboard stats
- [x] Favorites system
- [x] Reviews & ratings

### ⚠️ Needs API Keys:

- [ ] Real payment processing (Stripe)
- [ ] Cloud image uploads (Cloudinary)
- [ ] Email notifications (Resend)
- [ ] SMS verification (Twilio)

---

## 🚦 Quick Test Scenarios

### Test User Registration
```bash
# Open browser: http://localhost:3000
# Click "Sign Up"
# Fill in: test@example.com / password123
# Should login successfully
```

### Test Creating a Listing
```bash
# Login as user
# Click "Create Listing"
# Fill in title, description, price
# Click "Create"
# Should appear on homepage
```

### Test Booking Flow
```bash
# Find a listing
# Click "Book Now"
# Select dates
# Review price breakdown
# Click "Confirm"
# Should create booking
```

### Test Messaging
```bash
# Open two browsers (or incognito)
# Login as different users
# Start conversation
# Messages should appear in real-time
```

---

## 🔧 Essential .env for Testing

```env
# MINIMUM SETUP (No external APIs needed)
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rentconnect
JWT_ACCESS_SECRET=test-secret-key-random-123
JWT_REFRESH_SECRET=test-secret-key-random-456
STRIPE_SECRET_KEY=mock
STRIPE_PUBLISHABLE_KEY=mock

# Leave these empty for mock mode:
CLOUDINARY_CLOUD_NAME=
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
```

---

## 🧪 API Endpoint Quick Tests

```bash
# Health check
curl http://localhost:4000/api/health

# Create user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","name":"Test"}'

# Get listings
curl http://localhost:4000/api/listings
```

---

## 📱 Test Accounts to Create

```
Account 1 (Owner):
- Email: owner@test.com
- Password: password123
- Purpose: Create listings

Account 2 (Renter):
- Email: renter@test.com
- Password: password123
- Purpose: Book listings

Account 3 (Admin):
- Email: admin@test.com
- Password: password123
- Purpose: Manage platform
```

---

## 🎯 Testing Priority Order

### Phase 1: Core Features (15 min)
1. User signup/login
2. Create 2-3 listings
3. Browse homepage
4. View listing details

### Phase 2: Bookings (10 min)
1. Create booking
2. View booking details
3. Cancel booking

### Phase 3: Communication (10 min)
1. Send message
2. Receive message
3. Real-time updates

### Phase 4: Advanced (20 min)
1. Search & filter
2. Dashboard stats
3. Reviews
4. Profile editing

**Total: 55 minutes for full testing**

---

## 🚀 Quick Commands

```bash
# Start development (both frontend & backend)
npm run dev

# Start only backend
npm run dev:server

# Start only frontend
npm run dev:client

# Setup database
npx prisma generate
npx prisma migrate dev

# View database
npx prisma studio

# Run tests (if you have test suite)
npm test

# Build for production
npm run build
```

---

## 📚 Full Guides

| Guide | File | Purpose |
|-------|------|---------|
| **API Setup** | `API_SETUP_GUIDE.md` | Step-by-step for all APIs |
| **Testing** | `TESTING_WITHOUT_API_KEYS.md` | Test without APIs |
| **Deployment** | `START_HERE.md` | Deploy online |
| **Quick Deploy** | `DEPLOY_NOW.md` | Deploy in 5 min |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check if PostgreSQL running: `npx prisma studio` |
| Can't login | Verify DATABASE_URL in .env |
| Payments fail | Make sure STRIPE_SECRET_KEY=mock |
| Images don't load | Check if using placeholder URLs |
| Messages don't send | Check WebSocket connection in browser console |
| Search returns nothing | Make sure listings exist in database |

---

## 💡 Pro Tips

1. **Use mock mode first** - Test everything before adding APIs
2. **Add one API at a time** - Easier to debug
3. **Use test accounts** - Don't mix test/real data
4. **Check browser console** - See frontend errors
5. **Check server logs** - See backend errors
6. **Use Prisma Studio** - Visual database browser
7. **Test in incognito** - Avoid cache issues

---

## 🎉 You're Ready!

**Everything works without API keys. Start testing now!**

```bash
npm run dev
# Open: http://localhost:3000
# Start testing! ✅
```

**Add APIs later when you're ready to go production!**
