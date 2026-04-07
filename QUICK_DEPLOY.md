# 🚀 RentConnect - Quick Deployment Guide

Get your RentConnect application live on the internet in **10 minutes or less**!

---

## 🎯 Recommended: Deploy to Railway (Easiest)

**Why Railway?**
- ✅ One-click deployment
- ✅ Free tier: 500 hours/month
- ✅ Automatic PostgreSQL database
- ✅ Built-in monitoring
- ✅ Automatic HTTPS/SSL

### Step-by-Step (5 Minutes)

#### 1️⃣ Prepare Your Code

Run the deployment preparation script:

**Windows:**
```cmd
deploy-prepare.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-setup.sh
./deploy-setup.sh
```

Or manually:
```bash
npm install --legacy-peer-deps
npm run build
git init
git add .
git commit -m "Prepare for deployment"
```

#### 2️⃣ Push to GitHub

```bash
# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/rentconnect.git
git push -u origin main
```

#### 3️⃣ Deploy to Railway

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (free)
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your `rentconnect` repository
5. Railway will auto-detect Node.js and configure everything

#### 4️⃣ Add Database

1. In Railway dashboard, click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically sets `DATABASE_URL` ✅

#### 5️⃣ Configure Environment Variables

In Railway → Your Service → **Variables** tab, add:

```env
NODE_ENV=production
JWT_ACCESS_SECRET=random-secret-1-generate-this
JWT_REFRESH_SECRET=random-secret-2-generate-this
STRIPE_SECRET_KEY=sk_test_xxxxx (from Stripe)
CLOUDINARY_CLOUD_NAME=xxxxx (from Cloudinary)
RESEND_API_KEY=re_xxxxx (from Resend)
```

**Get API Keys:**
- Stripe: https://dashboard.stripe.com/apikeys
- Cloudinary: https://cloudinary.com/console/settings/api-keys
- Resend: https://resend.com/apikeys

#### 6️⃣ Run Database Migrations

1. Click on your service in Railway
2. Go to **"Settings"** tab
3. Scroll to **"Open Shell"**
4. Run:
```bash
npx prisma migrate deploy
```

#### 7️⃣ Done! 🎉

Railway provides your app URL: `https://your-app.up.railway.app`

**Your app is LIVE!**

---

## 🆓 Alternative: Deploy to Render (Free Tier)

Similar process, completely free:

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your repository
5. Add PostgreSQL database
6. Configure environment variables
7. Deploy!

Full URL will be: `https://rentconnect.onrender.com`

---

## 🖥️ Alternative: Deploy to VPS (Full Control)

For complete control and lowest cost at scale:

1. Get VPS from DigitalOcean/Linode ($4-6/month)
2. SSH into server
3. Install Node.js, PostgreSQL, Nginx
4. Clone your repository
5. Configure and deploy
6. Setup custom domain with SSL

See `DEPLOYMENT_COMPLETE_GUIDE.md` Option 4 for detailed steps.

---

## 🐳 Alternative: Deploy with Docker

If you prefer Docker:

```bash
# Build and run with Docker Compose
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

Deploy Docker to:
- Railway (auto-detects Dockerfile)
- DigitalOcean App Platform
- AWS ECS
- Any VPS with Docker

---

## 📋 Required Environment Variables

Before deploying, you'll need these API keys:

| Service | What It Does | Where to Get | Required? |
|---------|--------------|--------------|-----------|
| **Database** | Stores all data | Railway/Render auto-provides | ✅ Yes |
| **JWT Secrets** | Authentication | Generate random strings | ✅ Yes |
| **Stripe** | Payment processing | https://stripe.com | For payments |
| **Cloudinary** | Image uploads | https://cloudinary.com | For photos |
| **Resend** | Email verification | https://resend.com | For emails |
| **Twilio** | SMS verification | https://twilio.com | Optional |

---

## ✅ Pre-Deployment Checklist

Before going live, make sure:

- [ ] All dependencies installed
- [ ] Application builds successfully (`npm run build`)
- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] `.env` file configured
- [ ] Database URL set
- [ ] JWT secrets are random (not defaults)
- [ ] CORS origins updated
- [ ] No hardcoded secrets in code
- [ ] `.env` is in `.gitignore`

---

## 🧪 Post-Deployment Testing

After deployment, test your app:

```bash
# Test API
curl https://your-app.com/api/health

# Test frontend
# Open browser to https://your-app.com

# Test features:
# - User registration
# - Login/logout
# - Create listing
# - Make booking
```

---

## 🌐 Custom Domain Setup

### For Railway:
1. Go to Railway → Your Project → Settings
2. Click "Add Custom Domain"
3. Add your domain
4. Update DNS records at your registrar
5. Railway auto-provisions SSL

### For Render:
1. Go to Render → Your Service → Settings
2. Scroll to "Custom Domain"
3. Add your domain
4. Update DNS (CNAME record)
5. Automatic SSL

### For VPS:
See `DEPLOYMENT_COMPLETE_GUIDE.md` for Nginx + Let's Encrypt setup.

---

## 📊 Monitoring Your App

**Free monitoring tools:**

- **UptimeRobot**: https://uptimerobot.com (monitors if site is up)
- **Sentry**: https://sentry.io (error tracking)
- **Railway/Render Logs**: Built-in log viewers

---

## 🔄 Updating Your App

After initial deployment:

```bash
# Make your changes
git add .
git commit -m "Update description"
git push origin main

# Railway/Render: Auto-deploys on push!
# VPS: Pull and restart
ssh your-server
cd /var/www/rentconnect
git pull
npm run build
pm2 restart rentconnect
```

---

## 🆘 Troubleshooting

### App won't start
- Check deployment logs (Railway/Render have log viewers)
- Verify all environment variables are set
- Check database connection

### CORS errors
- Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly
- Include `https://` prefix

### Database errors
- Run: `npx prisma migrate deploy`
- Check `DATABASE_URL` is correct

### Need help?
- See full guide: `DEPLOYMENT_COMPLETE_GUIDE.md`
- Check deployment config: `DEPLOY.md`
- Review app status: `DEVELOPMENT_STATUS.md`

---

## 🎯 Deployment Comparison

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Railway** | Free tier, then $5/mo | ⭐ Easy | Beginners, quick deploy |
| **Render** | Free (sleeps), $7/mo pro | ⭐ Easy | Free hosting, testing |
| **VPS** | $4-6/mo | ⭐⭐⭐ Medium | Full control, production |
| **Vercel + Backend** | Free frontend + backend cost | ⭐⭐ Medium | Best performance |
| **Docker** | Varies | ⭐⭐ Medium | Portability |

---

## 🎉 You're Live!

Once deployed, your app will be accessible at:

- **Railway**: `https://your-app.up.railway.app`
- **Render**: `https://rentconnect.onrender.com`
- **VPS**: `https://your-domain.com`

**Share it with the world!** 🌍

---

## 📚 Additional Resources

- `DEPLOYMENT_COMPLETE_GUIDE.md` - Detailed deployment instructions
- `DEPLOY.md` - Platform-specific configurations
- `railway.json` - Railway deployment config
- `render.yaml` - Render deployment config
- `Dockerfile` - Docker configuration
- `docker-compose.yml` - Docker Compose setup

---

**Happy deploying! 🚀**
