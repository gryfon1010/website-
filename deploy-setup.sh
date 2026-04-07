#!/bin/bash
# RentConnect - Automated Deployment Script
# This script automates common deployment tasks

echo "========================================"
echo "  RentConnect Deployment Helper"
echo "========================================"
echo ""

# Function to generate random string
generate_secret() {
    openssl rand -hex 32
}

# Check if required commands exist
check_requirements() {
    echo "[1/6] Checking requirements..."
    
    missing=0
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git not found. Install from: https://git-scm.com/"
        missing=1
    else
        echo "✅ Git installed"
    fi
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Install from: https://nodejs.org/"
        missing=1
    else
        echo "✅ Node.js installed ($(node --version))"
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found"
        missing=1
    else
        echo "✅ npm installed ($(npm --version))"
    fi
    
    if [ $missing -eq 1 ]; then
        echo ""
        echo "Please install missing requirements and try again."
        exit 1
    fi
}

# Setup Git repository
setup_git() {
    echo ""
    echo "[2/6] Setting up Git repository..."
    
    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        git add .
        git commit -m "Initial commit - RentConnect application"
        echo "✅ Git repository initialized!"
    else
        echo "✅ Git repository already exists"
    fi
    
    # Check if remote is configured
    if git remote | grep -q "origin"; then
        echo "✅ Git remote 'origin' configured"
    else
        echo ""
        echo "No Git remote configured. To add one:"
        echo "  git remote add origin https://github.com/YOUR_USERNAME/rentconnect.git"
    fi
}

# Install dependencies
install_dependencies() {
    echo ""
    echo "[3/6] Installing dependencies..."
    npm install --legacy-peer-deps
}

# Generate Prisma client
setup_prisma() {
    echo ""
    echo "[4/6] Setting up Prisma..."
    npx prisma generate
}

# Build application
build_app() {
    echo ""
    echo "[5/6] Building application..."
    npm run build
    echo "✅ Build completed!"
}

# Create deployment configuration
create_deployment_config() {
    echo ""
    echo "[6/6] Creating deployment configuration..."
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        echo "Creating .env file from template..."
        cp .env.example .env
        
        # Generate secure secrets
        ACCESS_SECRET=$(generate_secret)
        REFRESH_SECRET=$(generate_secret)
        
        # Update secrets in .env
        sed -i.bak "s/JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=$ACCESS_SECRET/" .env
        sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$REFRESH_SECRET/" .env
        rm -f .env.bak
        
        echo "✅ .env file created with secure secrets"
        echo ""
        echo "⚠️  IMPORTANT: Update .env with your actual API keys!"
        echo "   - DATABASE_URL"
        echo "   - STRIPE_SECRET_KEY"
        echo "   - RESEND_API_KEY"
        echo "   - CLOUDINARY credentials"
    else
        echo "✅ .env file already exists"
    fi
    
    # Verify deployment files exist
    if [ ! -f "Dockerfile" ]; then
        echo "❌ Dockerfile missing!"
    else
        echo "✅ Dockerfile ready"
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ docker-compose.yml missing!"
    else
        echo "✅ docker-compose.yml ready"
    fi
}

# Main execution
check_requirements
setup_git
install_dependencies
setup_prisma
build_app
create_deployment_config

echo ""
echo "========================================"
echo "  ✅ Deployment Preparation Complete!"
echo "========================================"
echo ""
echo "Your application is ready for deployment!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update .env with your production API keys"
echo "   See: DEPLOY.md for required variables"
echo ""
echo "2. Push to GitHub:"
echo "   git add ."
echo "   git commit -m \"Prepare for deployment\""
echo "   git push origin main"
echo ""
echo "3. Deploy to your chosen platform:"
echo "   - Railway: https://railway.app (Recommended)"
echo "   - Render: https://render.com"
echo "   - VPS: Follow DEPLOYMENT_COMPLETE_GUIDE.md"
echo ""
echo "📖 Full deployment guide: DEPLOYMENT_COMPLETE_GUIDE.md"
echo ""
echo "Good luck with your deployment! 🚀"
