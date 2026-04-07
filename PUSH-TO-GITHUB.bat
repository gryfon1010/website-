@echo off
echo ========================================
echo   PUSHING FIX TO GITHUB
echo ========================================
echo.
echo This will push your latest code to GitHub.
echo.
echo You need your GitHub Personal Access Token.
echo If you don't have one:
echo   1. Go to: https://github.com/settings/tokens
echo   2. Click: Generate new token (classic)
echo   3. Note: Deploy Token
echo   4. Check: repo
echo   5. Click: Generate token
echo   6. Copy the token (ghp_xxxxx)
echo.
echo ========================================
echo.

set /p GITHUB_TOKEN="Paste your GitHub token here: "

echo.
echo Pushing to GitHub...
echo.

git push -f https://arhamfareed106:%GITHUB_TOKEN%@github.com/arhamfareed106/website-.git main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   PUSH SUCCEEDED!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Go to: https://vercel.com/dashboard
    echo 2. Click your project
    echo 3. Click Deployments
    echo 4. Click ... on latest deployment
    echo 5. Click Redeploy (check "Clear build cache")
    echo 6. Wait 2-3 minutes
    echo.
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED!
    echo ========================================
    echo.
    echo Check your token is correct.
    echo Get a new token from: https://github.com/settings/tokens
    echo.
)

pause
