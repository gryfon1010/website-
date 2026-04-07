# RentConnect - One-Click Deployment Configuration

This file contains deployment configurations for various cloud platforms.

---

## 🚀 Quick Deploy Buttons

### Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/rentconnect)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/rentconnect)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/rentconnect)

---

## 📋 Environment Variables Template

Copy this to your deployment platform's environment variables section:

### Required Variables
```env
# Application
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-frontend-url.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/rentconnect?schema=public

# JWT Secrets (generate random strings)
JWT_ACCESS_SECRET=generate-a-random-32-character-string-here
JWT_REFRESH_SECRET=generate-another-random-32-character-string
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service (Resend)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=RentConnect <noreply@yourdomain.com>

# SMS Service (Twilio) - Optional
TWILIO_ACCOUNT_SID=AC_xxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis (Optional - for caching)
REDIS_URL=redis://host:6379

# Payment Settings
PAYMENT_RELEASE_DELAY_HOURS=24
```

---

## 🔧 Platform-Specific Configurations

### Railway

**railway.json** (auto-detected):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Render

**render.yaml**:
```yaml
services:
  - type: web
    name: rentconnect
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: rentconnect-db
          property: connectionString
      - key: JWT_ACCESS_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true

databases:
  - name: rentconnect-db
    databaseName: rentconnect
    user: rentconnect
```

### Vercel

**vercel.json** (for frontend):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "devCommand": "npm run dev",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📦 Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript checks pass (`npm run check`)
- [ ] Build succeeds (`npm run build`)
- [ ] `.env` file configured with production values
- [ ] Database URL configured
- [ ] JWT secrets are random and secure
- [ ] Stripe keys are configured (or using mock mode)
- [ ] CORS origins are updated
- [ ] Git repository initialized
- [ ] Code pushed to GitHub

---

## 🔐 Security Checklist

- [ ] No sensitive data in code (all in environment variables)
- [ ] `.env` file in `.gitignore`
- [ ] JWT secrets are randomly generated (not hardcoded)
- [ ] Database has strong password
- [ ] SSL/TLS enabled (HTTPS)
- [ ] CORS properly configured (not allowing all origins)
- [ ] Rate limiting enabled
- [ ] Input validation active

---

## 🧪 Post-Deployment Testing

1. **Test API endpoints**:
   ```bash
   curl https://your-app.com/api/health
   ```

2. **Test frontend**:
   - Open browser to https://your-app.com
   - Check all pages load
   - Test navigation

3. **Test authentication**:
   - Create new account
   - Login/logout
   - Password reset

4. **Test database**:
   - Create a listing
   - Make a booking
   - Check data persists

5. **Test payments** (if Stripe configured):
   - Create booking
   - Complete payment
   - Verify payment status

---

## 📞 Support

If you encounter deployment issues:

1. Check application logs
2. Verify all environment variables are set
3. Ensure database connection works
4. Check CORS configuration
5. Review deployment guide: `DEPLOYMENT_COMPLETE_GUIDE.md`

---

## 🎯 Quick Start (3 Steps)

### Step 1: Prepare
```bash
npm install
npm run build
```

### Step 2: Deploy
Choose one option from this guide and follow the steps.

### Step 3: Verify
```bash
curl https://your-app.com/api/health
```

**That's it! Your app is live! 🎉**
