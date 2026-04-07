# 🔑 Complete Step-by-Step Guide for All APIs

**Get every API key your RentConnect app needs - with screenshots described!**

---

## 📋 Table of Contents

1. [Stripe (Payments)](#1-stripe-payments)
2. [Resend (Email Service)](#2-resend-email-service)
3. [Cloudinary (Image Hosting)](#3-cloudinary-image-hosting)
4. [Twilio (SMS Service)](#4-twilio-sms-service)
5. [PayPal (Alternative Payments)](#5-paypal-alternative-payments)
6. [Redis (Caching & Queues)](#6-redis-caching--queues)
7. [Quick Setup Checklist](#7-quick-setup-checklist)
8. [Testing Without API Keys](#8-testing-without-api-keys)

---

## 1. 💳 Stripe (Payments)

**What it does:** Process credit card payments for bookings
**Cost:** Free to setup, 2.9% + $0.30 per transaction
**Required for:** Real payment processing

### Step 1: Create Stripe Account

1. Go to **https://dashboard.stripe.com/register**
2. Enter your email and create password
3. Verify your email
4. Fill in basic info (name, country)

### Step 2: Activate Test Mode

1. In Stripe Dashboard, look for **"Test Mode"** toggle at the top
2. **Turn it ON** (toggle should be purple)
3. You'll see "Viewing test data" banner

### Step 3: Get API Keys

1. Go to **Developers → API keys** (left sidebar)
2. You'll see two sections:

**Publishable key (safe for frontend):**
```
pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```
- Click "Reveal test key" button
- Copy this key

**Secret key (KEEP PRIVATE!):**
```
sk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```
- Click "Reveal test key" button
- Copy this key
- ⚠️ **NEVER share this publicly!**

### Step 4: Setup Webhook (For Payment Notifications)

1. Go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://your-app-url.com/api/payments/webhook`
   - Replace `your-app-url.com` with your actual domain
   - For testing, use: `http://localhost:4000/api/payments/webhook`
4. **Events to send:** Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret:**
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Add to Your .env File

Open your `.env` file and add:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Test Your Setup

Use this curl command to verify:

```bash
# Test Stripe connection
curl -u sk_test_YOUR_SECRET_KEY: https://api.stripe.com/v1/charges --limit 1
```

**Expected response:** JSON with your charges (empty if new account)

### Common Issues:

**❌ "No such API key"**
→ Make sure you copied the full key including `sk_test_` prefix
→ Verify you're in Test Mode (toggle at top)

**❌ "Invalid webhook secret"**
→ Re-copy the signing secret (includes `whsec_` prefix)
→ Make sure no extra spaces

---

## 2. 📧 Resend (Email Service)

**What it does:** Send email verification, notifications
**Cost:** Free tier - 100 emails/day, 3,000 emails/month
**Required for:** Email verification, password reset

### Step 1: Create Resend Account

1. Go to **https://resend.com/signup**
2. Sign up with GitHub or email
3. Verify your email address

### Step 2: Get API Key

1. Go to **https://resend.com/api-keys**
2. Click **"Create API Key"** button
3. Enter name: `RentConnect Production`
4. Set permissions: **Full Access**
5. Click **"Create"**
6. **IMPORTANT:** Copy the key immediately (shown only once!)

```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Add Domain (Optional but Recommended)

1. Go to **Domains** tab
2. Click **"Add Domain"**
3. Enter your domain (e.g., `rentconnect.app`)
4. Resend will show you DNS records to add:

**Add these to your domain registrar:**

```
Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4...

Type: CNAME
Name: pm._domainkey
Value: pm.resend.net
```

5. Wait 24-48 hours for verification

### Step 4: Add to Your .env File

```env
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=RentConnect <noreply@yourdomain.com>
```

**For testing, use:**
```env
EMAIL_FROM=RentConnect <onboarding@resend.dev>
```
(This works immediately without domain verification!)

### Step 5: Test Your Setup

```bash
# Test email send
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from RentConnect!</h1>"
  }'
```

**Expected:** You'll receive the test email!

### Common Issues:

**❌ "Domain not verified"**
→ Use `onboarding@resend.dev` as from address for testing
→ Or complete domain verification (Step 3)

**❌ "Invalid API key"**
→ Make sure key starts with `re_`
→ Check no extra spaces

---

## 3. 🖼️ Cloudinary (Image Hosting)

**What it does:** Store and serve listing photos
**Cost:** Free tier - 25GB storage, 25GB bandwidth/month
**Required for:** Image uploads in listings

### Step 1: Create Cloudinary Account

1. Go to **https://cloudinary.com/users/register/free**
2. Sign up with email or Google
3. Choose **Free plan**
4. Complete registration

### Step 2: Find Your Credentials

1. Log in to Cloudinary Dashboard
2. You'll see your credentials on the main page:

**Cloud Name:**
```
xxxxx-xxxxx
```
(Copy from "Cloud name" field)

**API Key:**
```
xxxxxxxxxxxxx
```
(Click "Show" next to API Key)

**API Secret:**
```
xxxxxxxxxxxxxxxxxxxxxxx
```
(Click "Show" next to API Secret)
⚠️ **Keep this secret!**

### Step 3: Configure Upload Settings

1. Go to **Settings → Upload**
2. Scroll to **"Upload presets"**
3. Click **"Add upload preset"**
4. Name it: `rentconnect_uploads`
5. Set **Signing Mode:** Signed
6. Click **"Save"**

### Step 4: Add to Your .env File

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 5: Test Your Setup

```bash
# Test image upload
curl -X POST "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload" \
  -F "file=https://res.cloudinary.com/demo/image/upload/sample.jpg" \
  -F "upload_preset=rentconnect_uploads" \
  -F "api_key=YOUR_API_KEY"
```

**Expected response:**
```json
{
  "public_id": "sample",
  "url": "https://res.cloudinary.com/xxxxx/image/upload/sample.jpg",
  "secure_url": "https://res.cloudinary.com/xxxxx/image/upload/sample.jpg"
}
```

### Common Issues:

**❌ "Invalid cloud name"**
→ Copy exactly from dashboard (includes dashes if any)

**❌ "Upload preset not found"**
→ Make sure you created the upload preset (Step 3)
→ Check spelling matches exactly

---

## 4. 📱 Twilio (SMS Service)

**What it does:** Send SMS verification codes
**Cost:** Free tier - $15 credit (enough for testing)
**Required for:** Phone number verification

### Step 1: Create Twilio Account

1. Go to **https://www.twilio.com/try-twilio**
2. Sign up with email
3. Verify your email
4. Fill in account info

### Step 2: Verify Your Personal Phone

1. Twilio will ask for your phone number
2. Enter your number
3. You'll receive verification code via SMS
4. Enter the code

### Step 3: Get Account Credentials

1. Go to **Twilio Console Dashboard**
2. Find these values:

**Account SID:**
```
ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(Copy from "Account SID" field)

**Auth Token:**
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(Click "Show" to reveal, then copy)
⚠️ **Keep this secret!**

### Step 4: Get a Twilio Phone Number

1. Go to **Phone Numbers → Manage → Active numbers**
2. Click **"Buy a number"** (or use provided free number)
3. Search for a number with SMS capability
4. Click **"Buy"** (uses your free credit)
5. Copy the phone number:
```
+1234567890
```

### Step 5: Enable SMS Permissions

1. Go to **Phone Numbers → Manage → Active numbers**
2. Click your phone number
3. Scroll to **"Messaging"** section
4. Make sure these are enabled:
   - ✅ Accept Incoming SMS
   - ✅ Configure with: Webhook/TwiML

### Step 6: Add to Your .env File

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 7: Test Your Setup

```bash
# Test SMS send
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/AC_YOUR_SID/Messages.json" \
  -u "AC_YOUR_SID:YOUR_AUTH_TOKEN" \
  -d "From=+1234567890" \
  -d "To=YOUR_PERSONAL_NUMBER" \
  -d "Body=Hello from RentConnect!"
```

**Expected:** You'll receive an SMS!

### Common Issues:

**❌ "From number is not valid"**
→ Use your Twilio number exactly as shown (with + prefix)
→ For trial accounts, can only send to verified numbers

**❌ "Invalid Auth Token"**
→ Copy the full token (no spaces)
→ Make sure Account SID starts with `AC`

---

## 5. 🅿️ PayPal (Alternative Payments)

**What it does:** Accept PayPal payments
**Cost:** Free to setup, 3.49% + $0.49 per transaction
**Required for:** PayPal payment option

### Step 1: Create PayPal Developer Account

1. Go to **https://developer.paypal.com/**
2. Click **"Log Into Dashboard"**
3. Sign up/log in with PayPal account
4. You'll get a **Sandbox account** automatically

### Step 2: Create REST API App

1. Go to **Apps & Credentials**
2. Make sure you're in **Sandbox** mode (toggle at top)
3. Click **"Create App"**
4. Name it: `RentConnect Sandbox`
5. Select **Merchant** account type
6. Click **"Create App"**

### Step 3: Get API Credentials

After creating the app, you'll see:

**Client ID:**
```
AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Client Secret:**
```
EXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
⚠️ **Keep secret!**

### Step 4: Create Live Account (When Ready)

1. Switch to **Live** mode (toggle at top)
2. Create another app for production
3. Get live credentials

### Step 5: Add to Your .env File

```env
# PayPal Configuration (Optional)
PAYPAL_CLIENT_ID=AXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYPAL_CLIENT_SECRET=EXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PAYPAL_MODE=sandbox
```

### Common Issues:

**❌ "Invalid client credentials"**
→ Make sure you're using Sandbox credentials for testing
→ Check no extra spaces

---

## 6. 🔴 Redis (Caching & Queues)

**What it does:** Cache data, background job queues
**Cost:** Free (local), $10+/month (cloud)
**Required for:** Performance optimization (optional)

### Option 1: Install Redis Locally (Free)

**Windows:**
1. Download: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Redis runs on `localhost:6379`

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### Option 2: Use Redis Cloud (Free Tier)

1. Go to **https://redis.com/try-free/**
2. Sign up for free tier
3. Create database
4. Get connection string:
```
redis://default:PASSWORD@HOST:PORT
```

### Step 3: Add to Your .env File

**For local Redis:**
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
QUEUE_ENABLED=false
```

**For Redis Cloud:**
```env
REDIS_URL=redis://default:PASSWORD@HOST:PORT
QUEUE_ENABLED=true
```

### Step 4: Test Your Setup

```bash
# Test local Redis
redis-cli ping
# Expected response: PONG

# Test connection
redis-cli set test "Hello RentConnect"
redis-cli get test
```

---

## 7. ✅ Quick Setup Checklist

Use this to track your progress:

### Essential APIs (Get these first):

- [ ] **Stripe** - For payments
  - [ ] Test mode enabled
  - [ ] API keys copied
  - [ ] Webhook configured
  - [ ] Added to .env

- [ ] **Cloudinary** - For image uploads
  - [ ] Account created
  - [ ] Cloud name copied
  - [ ] API key copied
  - [ ] API secret copied
  - [ ] Added to .env

### Optional APIs (Add later):

- [ ] **Resend** - For emails
  - [ ] API key generated
  - [ ] Added to .env

- [ ] **Twilio** - For SMS
  - [ ] Account SID copied
  - [ ] Auth token copied
  - [ ] Phone number obtained
  - [ ] Added to .env

- [ ] **PayPal** - Alternative payments
  - [ ] Sandbox app created
  - [ ] Client credentials copied
  - [ ] Added to .env

- [ ] **Redis** - Caching
  - [ ] Installed locally OR cloud account
  - [ ] Connection string added to .env

---

## 8. 🧪 Testing Without API Keys

**Your app works WITHOUT these keys! Here's how:**

### What Works Without Any API Keys:

✅ **User Features:**
- Browse listings
- Search & filter
- View listing details
- Create account
- Login/logout
- Create listings (with placeholder images)
- View profiles
- Messaging (real-time chat)
- Favorites system
- Booking creation
- Dashboard

✅ **Admin Features:**
- View all listings
- Manage users
- View bookings

### Mock/Stripe Test Mode:

Your app uses **mock payments by default**:

```env
# This makes payments work without real Stripe
STRIPE_SECRET_KEY=mock
STRIPE_PUBLISHABLE_KEY=mock
```

**How it works:**
- Users can go through checkout flow
- Payment is marked as "paid" automatically
- No real money transferred
- Perfect for testing!

### Test Features Without Emails:

Email verification is **optional**:

```env
# Leave these empty or remove them
# RESEND_API_KEY=
```

**What happens:**
- Verification status defaults to "pending"
- Users can still login
- Just no email sent
- Can manually verify in database

### Test Without Image Uploads:

Use **placeholder images**:

```env
# Leave Cloudinary empty
# CLOUDINARY_CLOUD_NAME=
```

**App will use:**
- Default placeholder images
- Unsplash stock photos
- User avatars from defaults

---

## 🎯 Summary: Your .env File

Here's a complete template:

```env
# ===== ESSENTIAL =====
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rentconnect?schema=public
JWT_ACCESS_SECRET=your-random-secret-key
JWT_REFRESH_SECRET=another-random-secret-key

# ===== PAYMENTS (Stripe - Mock Mode) =====
STRIPE_SECRET_KEY=mock
STRIPE_PUBLISHABLE_KEY=mock
STRIPE_WEBHOOK_SECRET=mock

# ===== IMAGE UPLOADS (Optional) =====
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

# ===== EMAIL SERVICE (Optional) =====
# RESEND_API_KEY=
# EMAIL_FROM=RentConnect <test@example.com>

# ===== SMS SERVICE (Optional) =====
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=

# ===== PAYPAL (Optional) =====
# PAYPAL_CLIENT_ID=
# PAYPAL_CLIENT_SECRET=
# PAYPAL_MODE=sandbox

# ===== REDIS (Optional) =====
# REDIS_URL=redis://localhost:6379
# QUEUE_ENABLED=false
```

**Copy this, fill in what you have, and you're ready!**

---

## 🚀 Quick Start Priority

### Phase 1: Deploy Now (0 API keys needed)
```bash
# Use mock mode - everything works!
# Just push to Railway/Render
# Follow DEPLOY_NOW.md
```

### Phase 2: Add Stripe (30 minutes)
```bash
# Get Stripe test keys
# Enable real payment flow (test mode)
```

### Phase 3: Add Cloudinary (15 minutes)
```bash
# Enable real image uploads
# Better user experience
```

### Phase 4: Add Email/SMS (20 minutes each)
```bash
# Enable verification emails
# Enable SMS verification
```

### Phase 5: Production Keys (When ready to launch)
```bash
# Switch Stripe to live mode
# Get production API keys
# Real money transactions
```

---

## 📞 Troubleshooting

### "I need help with a specific API"
→ Check the detailed sections above
→ Each has step-by-step with curl tests

### "I don't want to deal with APIs yet"
→ Use mock mode (Section 8)
→ Deploy with `STRIPE_SECRET_KEY=mock`
→ Add APIs later when ready

### "APIs too complicated"
→ Start with Stripe only
→ One API at a time
→ Everything else can wait

---

**All APIs configured? Test your app!**

```bash
# Start development server
npm run dev

# Or deploy online
# Follow DEPLOY_NOW.md
```

**Happy integrating! 🎉**
