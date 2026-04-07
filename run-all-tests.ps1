# 🧪 RentConnect - Automated Test Suite Runner

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RENTCONNECT COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$testResults = @{
    Passed = 0
    Failed = 0
    Total = 0
}

function Test-Feature {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    $testResults.Total++
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "   ✓ PASSED`n" -ForegroundColor Green
            $testResults.Passed++
        } else {
            Write-Host "   ✗ FAILED`n" -ForegroundColor Red
            $testResults.Failed++
        }
    } catch {
        Write-Host "   ✗ ERROR: $($_.Exception.Message)`n" -ForegroundColor Red
        $testResults.Failed++
    }
}

# ============================================
# API ENDPOINT TESTS
# ============================================
Write-Host "`n=== PHASE 1: API ENDPOINT TESTING ===" -ForegroundColor Cyan

Test-Feature "Items API - Get All Items" {
    $response = curl http://localhost:4000/api/items 2>$null | ConvertFrom-Json
    $response.Count -gt 0
}

Test-Feature "Items API - Get Single Item" {
    $response = curl http://localhost:4000/api/items/item-camera 2>$null | ConvertFrom-Json
    $response.id -eq "item-camera"
}

Test-Feature "Items API - Search Functionality" {
    $response = curl "http://localhost:4000/api/items?search=canon" 2>$null | ConvertFrom-Json
    $response.Count -gt 0
}

Test-Feature "Items API - Category Filter" {
    $response = curl "http://localhost:4000/api/items?category=Photography" 2>$null | ConvertFrom-Json
    $response.Count -gt 0
}

Test-Feature "Auth API - Protected Endpoint" {
    $response = curl http://localhost:4000/api/auth/me 2>$null
    $response.StatusCode -eq 401
}

Test-Feature "Dashboard API - Summary Endpoint" {
    $response = curl http://localhost:4000/api/dashboard/summary 2>$null
    $null -ne $response
}

Test-Feature "Chat API - Conversations Endpoint" {
    $response = curl http://localhost:4000/api/chat/conversations 2>$null
    $null -ne $response
}

# ============================================
# FRONTEND PAGE TESTS
# ============================================
Write-Host "`n=== PHASE 2: FRONTEND PAGE LOADING ===" -ForegroundColor Cyan

Test-Feature "Frontend - Landing Page (/)" {
    $response = curl http://localhost:3000 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Search Page (/search)" {
    $response = curl http://localhost:3000/search 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - About Page (/about)" {
    $response = curl http://localhost:3000/about 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Guarantee Page (/guarantee)" {
    $response = curl http://localhost:3000/guarantee 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - FAQ Page (/faq)" {
    $response = curl http://localhost:3000/faq 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Terms Page (/terms)" {
    $response = curl http://localhost:3000/terms 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Privacy Page (/privacy)" {
    $response = curl http://localhost:3000/privacy 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Partnerships Page (/partnerships)" {
    $response = curl http://localhost:3000/partnerships 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Categories Page (/categories)" {
    $response = curl http://localhost:3000/categories 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Blog Page (/blog)" {
    $response = curl http://localhost:3000/blog 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Help Page (/help)" {
    $response = curl http://localhost:3000/help 2>$null
    $response.StatusCode -eq 200
}

Test-Feature "Frontend - Support Page (/support)" {
    $response = curl http://localhost:3000/support 2>$null
    $response.StatusCode -eq 200
}

# ============================================
# COMPONENT VISIBILITY TESTS
# ============================================
Write-Host "`n=== PHASE 3: COMPONENT VISIBILITY CHECKS ===" -ForegroundColor Cyan

Test-Feature "Header Component Present" {
    $response = curl http://localhost:3000 2>$null
    $response.Content -match "RentConnect"
}

Test-Feature "Footer Component Present" {
    $response = curl http://localhost:3000 2>$null
    $response.Content -match "About RentConnect"
}

Test-Feature "Search Bar Visible" {
    $response = curl http://localhost:3000 2>$null
    $response.Content -match "search"
}

Test-Feature "Item Cards Displayed" {
    $response = curl http://localhost:3000 2>$null
    $response.Content -match "Canon EOS"
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "           TEST RESULTS SUMMARY         " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Total Tests Run: $($testResults.Total)" -ForegroundColor White
Write-Host "Passed:          $($testResults.Passed)" -ForegroundColor Green
Write-Host "Failed:          $($testResults.Failed)" -ForegroundColor Red

$successRate = [math]::Round(($testResults.Passed / $testResults.Total) * 100, 2)
Write-Host "Success Rate:    $successRate%" -ForegroundColor $(if($successRate -eq 100){"Green"}else{"Yellow"})

Write-Host "`n========================================`n" -ForegroundColor Cyan

if ($testResults.Failed -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED! PLATFORM IS PRODUCTION READY!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Please review the results above." -ForegroundColor Yellow
}

Write-Host "`nTest completed at: $(Get-Date)" -ForegroundColor Gray
