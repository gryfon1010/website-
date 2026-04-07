# 🚀 RentConnect - Complete Online Deployment Guide

This guide will help you deploy your RentConnect application online using **multiple deployment options**.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Option 1: Deploy to Railway (Easiest - Recommended)](#option-1-deploy-to-railway-easiest--recommended)
3. [Option 2: Deploy to Render (Free Tier)](#option-2-deploy-to-render-free-tier)
4. [Option 3: Deploy to Vercel + Supabase](#option-3-deploy-to-vercel--supabase)
5. [Option 4: Deploy to DigitalOcean/VPS (Full Control)](#option-4-deploy-to-digitaloceanvps-full-control)
6. [Option 5: Deploy Using Docker](#option-5-deploy-using-docker)
7. [Post-Deployment Setup](#post-deployment-setup)
8. [Domain & SSL Setup](#domain--ssl-setup)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 📦 Prerequisites

### Before deploying, make sure you have:

1. ✅ **Git repository** initialized
2. ✅ **Code pushed to GitHub**
3. ✅ **API keys** (get these from respective services):
   - Stripe (payments): https://dashboard.stripe.com/apikeys
   - Resend (email): https://resend.com/apikeys
   - Cloudinary (images): https://cloudinary.com/console/settings/api-keys
   - Twilio (SMS - optional): https://console.twilio.com

---

## 🎯 Option 1: Deploy to Railway (Easiest - Recommended)

**Why Railway?** One-click deployment, free tier, automatic database, easy scaling.

### Step 1: Prepare Your Project

```bash
# 1. Initialize Git (if not already done)
git init
git add .
git commit -m "Initial commit for deployment"

# 2. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/rentconnect.git
git push -u origin main
```

### Step 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub account
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your rentconnect repository
5. **Railway will auto-detect** Node.js

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will automatically set `DATABASE_URL` environment variable
3. Copy the database URL

### Step 4: Add Redis (Optional)

1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Copy the Redis URL

### Step 5: Configure Environment Variables

In Railway dashboard → Variables tab, add:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://... (from Railway database)
REDIS_URL=redis://... (from Railway Redis, if added)
JWT_ACCESS_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=another-random-secret-key
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
CLIENT_URL=https://your-app.railway.app
STRIPE_SECRET_KEY=sk_test_... (from Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_... (from Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RESEND_API_KEY=re_xxxxxx (from Resend)
TWILIO_ACCOUNT_SID=AC_xxxxxx (from Twilio, optional)
TWILIO_AUTH_TOKEN=your-token (from Twilio, optional)
TWILIO_PHONE_NUMBER=+1234567890 (from Twilio, optional)
PAYMENT_RELEASE_DELAY_HOURS=24
```

### Step 6: Deploy

1. Railway will **automatically deploy** when you push to main
2. First deployment takes 2-3 minutes
3. Click on your service to see the deployment logs

### Step 7: Run Database Migrations

After deployment, run migrations:

1. Go to Railway → Your Service → **Settings**
2. Click **"Open Shell"**
3. Run:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Step 8: Access Your App

- Railway provides a URL: `https://your-app.railway.app`
- Your API is at: `https://your-app.railway.app/api`

**✅ Done! Your app is live!**

---

## 🆓 Option 2: Deploy to Render (Free Tier)

**Why Render?** Generous free tier, easy setup, built-in database.

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create Web Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: rentconnect
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add PostgreSQL Database

1. In Render dashboard, click **"New"** → **"PostgreSQL"**
2. Name it: `rentconnect-db`
3. Choose **Free tier**
4. Copy the **Internal Database URL**

### Step 4: Configure Environment Variables

In Render dashboard → Environment, add:

```env
NODE_ENV=production
DATABASE_URL=(from Render PostgreSQL)
JWT_ACCESS_SECRET=your-random-secret
JWT_REFRESH_SECRET=another-random-secret
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
RESEND_API_KEY=re_xxxxx
```

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy (takes 3-5 minutes)
3. Your app will be at: `https://rentconnect.onrender.com`

**✅ Done!**

---

## ▲ Option 3: Deploy to Vercel + Supabase

**Why this combo?** Vercel for frontend (free), Supabase for backend+database (free).

### Part A: Deploy Backend to Render/Railway

Follow Option 1 or 2 to deploy the backend.

### Part B: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Click**: "Add New Project"
4. **Import** your repository
5. **Configure**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```
7. **Deploy**

### Part C: Update Backend CORS

Update `CLIENT_URL` in backend to point to your Vercel URL:

```env
CLIENT_URL=https://your-app.vercel.app
```

**✅ Done!**

---

## 🖥️ Option 4: Deploy to DigitalOcean/VPS (Full Control)

**Why VPS?** Full control, cheapest at scale, no vendor lock-in.

### Step 1: Get a VPS

**Recommended providers:**
- DigitalOcean: https://www.digitalocean.com ($4-6/month)
- Linode: https://www.linode.com ($5/month)
- Hetzner: https://www.hetzner.com (€3-5/month)
- AWS Lightsail: https://lightsail.aws.amazon.com ($3.50/month)

### Step 2: Connect to Your Server

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP
```

### Step 3: Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Redis
apt install -y redis-server

# Install Nginx (for reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

### Step 4: Setup PostgreSQL Database

```bash
# Switch to postgres user
su - postgres

# Create database and user
psql

CREATE USER rentconnect WITH PASSWORD 'your-secure-password';
CREATE DATABASE rentconnect OWNER rentconnect;
GRANT ALL PRIVILEGES ON DATABASE rentconnect TO rentconnect;
\q

# Exit postgres user
exit
```

### Step 5: Clone and Setup Application

```bash
# Create app directory
mkdir -p /var/www/rentconnect
cd /var/www/rentconnect

# Clone your repository
git clone https://github.com/YOUR_USERNAME/rentconnect.git .

# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Build the app
npm run build
```

### Step 6: Create Environment File

```bash
nano .env
```

Paste your environment variables (see Option 1 for full list).

### Step 7: Run Database Migrations

```bash
npx prisma migrate deploy
```

### Step 8: Start with PM2

```bash
# Start application
pm2 start dist/index.js --name rentconnect

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
```

### Step 9: Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/rentconnect
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/rentconnect /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

### Step 10: Setup SSL with Let's Encrypt (Free)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is setup automatically
```

**✅ Done! Your app is live at https://your-domain.com**

---

## 🐳 Option 5: Deploy Using Docker

### Option 5A: Deploy to Cloud Providers with Docker

#### Railway with Docker

1. Follow Option 1, but Railway will auto-detect your `Dockerfile`
2. No extra configuration needed

#### DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Connect your GitHub repository
4. DigitalOcean will detect `docker-compose.yml`
5. Configure environment variables
6. Deploy

#### AWS ECS (Elastic Container Service)

1. Create AWS account
2. Install AWS CLI
3. Create ECR repository
4. Build and push Docker image
5. Create ECS cluster and service
6. Configure Application Load Balancer

### Option 5B: Deploy Docker Compose to VPS

If you chose Option 4 (VPS), you can use Docker instead:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Copy your project to server
scp -r /local/path/to/rentconnect root@YOUR_SERVER_IP:/var/www/rentconnect

# SSH to server
ssh root@YOUR_SERVER_IP
cd /var/www/rentconnect

# Create .env file
nano .env
# Add all environment variables

# Start with Docker Compose
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

**✅ Done!**

---

## 🔧 Post-Deployment Setup

### 1. Create Admin User

After deployment, create your first admin user:

```bash
# Using curl (replace URL)
curl -X POST https://your-app.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentconnect.com",
    "password": "your-secure-password",
    "name": "Admin User",
    "role": "admin"
  }'
```

### 2. Setup Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://your-app.com/api/payments/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook Secret** (`whsec_xxxxx`)
6. Update `STRIPE_WEBHOOK_SECRET` in your environment variables

### 3. Configure Email Domain (Resend)

1. Go to Resend dashboard
2. Add your domain
3. Add DNS records to your domain registrar:
   - SPF record
   - DKIM record
   - DMARC record
4. Wait for verification (up to 48 hours)

### 4. Test Your Deployment

```bash
# Test API
curl https://your-app.com/api/health

# Test frontend
# Open browser to https://your-app.com

# Test database connection
# Check application logs
```

---

## 🌐 Domain & SSL Setup

### Buy a Domain

**Recommended registrars:**
- Namecheap: https://www.namecheap.com ($8-10/year)
- Cloudflare: https://www.cloudflare.com ($8/year, cheapest)
- Google Domains: https://domains.google ($12/year)
- Porkbun: https://porkbun.com ($9/year)

### Configure DNS

Point your domain to your hosting:

**For Railway/Render/Vercel:**
```
Type: CNAME
Name: www
Value: your-app.railway.app (or your hosting URL)
```

**For VPS/DigitalOcean:**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
```

### SSL Certificate

- **Railway/Render/Vercel**: Automatic SSL (free)
- **VPS**: Use Let's Encrypt (free) - see Option 4, Step 10

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

**Free options:**
- Sentry (error tracking): https://sentry.io
- UptimeRobot (uptime monitoring): https://uptimerobot.com
- Better Stack: https://betterstack.com

### 2. Database Backups

**For PostgreSQL:**

```bash
# Manual backup
pg_dump -U postgres rentconnect > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres rentconnect < backup_20250101.sql

# Automated backups (add to crontab)
0 2 * * * pg_dump -U postgres rentconnect > /backups/rentconnect_$(date +\%Y\%m\%d).sql
```

### 3. Logs

**View application logs:**

```bash
# Railway/Render: Built-in log viewer
# VPS with PM2:
pm2 logs rentconnect

# VPS with Docker:
docker compose logs -f backend
```

### 4. Updates & Deployment

```bash
# Update your code
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Run migrations
npx prisma migrate deploy

# Restart (PM2)
pm2 restart rentconnect

# Restart (Docker)
docker compose restart backend
```

---

## 🎯 Recommended Deployment Path

**For beginners:** Railway (Option 1)
- ✅ Easiest setup
- ✅ Free tier available
- ✅ Automatic scaling
- ✅ Built-in monitoring

**For production:** VPS with Docker (Option 4/5)
- ✅ Full control
- ✅ Cheapest at scale
- ✅ No vendor lock-in

**For testing:** Render Free Tier (Option 2)
- ✅ Completely free
- ✅ Easy setup
- ⚠️ Sleeps after inactivity

---

## 🆘 Troubleshooting

### App won't start

```bash
# Check logs
# Railway/Render: Dashboard logs
# VPS: pm2 logs rentconnect

# Common issues:
# 1. Missing environment variables
# 2. Database connection failed
# 3. Port already in use
```

### Database migration errors

```bash
# Reset and redeploy (WARNING: deletes all data)
npx prisma migrate reset

# Or manually fix:
npx prisma generate
npx prisma migrate deploy
```

### CORS errors

Make sure `CLIENT_URL` in your `.env` matches your frontend URL exactly.

---

## 📞 Need Help?

- **Documentation**: Check README.md files in project
- **Status**: See DEVELOPMENT_STATUS.md
- **Testing**: Run `npm test` before deploying

---

## 🎉 Congratulations!

Your RentConnect application is now live online! Share it with the world! 🚀

**Your URLs:**
- Frontend: https://your-domain.com
- Backend API: https://your-domain.com/api
- Admin: https://your-domain.com/admin
