@echo off
REM RentConnect - Quick Deployment Script for Windows
REM This script prepares your project for deployment

echo.
echo ========================================
echo   RentConnect Deployment Preparation
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [1/7] Checking Git repository...
REM Initialize Git if not already done
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo Git repository initialized!
) else (
    echo Git repository already exists.
)

echo.
echo [2/7] Checking environment file...
REM Check if .env exists
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [WARNING] Please update .env with your actual API keys!
    echo.
) else (
    echo .env file already exists.
)

echo.
echo [3/7] Installing dependencies...
call npm install --legacy-peer-deps

echo.
echo [4/7] Generating Prisma Client...
call npx prisma generate

echo.
echo [5/7] Running TypeScript checks...
call npm run check

echo.
echo [6/7] Creating production build...
call npm run build

echo.
echo [7/7] Preparing deployment files...
echo Dockerfile: Created
echo docker-compose.yml: Created
echo .dockerignore: Created
echo DEPLOYMENT_COMPLETE_GUIDE.md: Created

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Update .env with your API keys
echo 2. Commit and push to GitHub:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo    git push origin main
echo.
echo 3. Choose a deployment option:
echo    - Railway (Recommended): See DEPLOYMENT_COMPLETE_GUIDE.md
echo    - Render: Free tier available
echo    - VPS: Full control
echo    - Docker: Use docker-compose.yml
echo.
echo For detailed instructions, open: DEPLOYMENT_COMPLETE_GUIDE.md
echo.
pause
