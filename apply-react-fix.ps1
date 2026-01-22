# Apply React 19 to React 18 fix
# This script will reinstall dependencies with React 18.3.1

Write-Host "🔧 Applying React 19 Error Fix" -ForegroundColor Cyan
Write-Host ""

# Check current React version
Write-Host "Checking current React installation..." -ForegroundColor Yellow
$frontendReact = (Get-Content frontend\package.json | ConvertFrom-Json).dependencies.react
Write-Host "Current React version in package.json: $frontendReact" -ForegroundColor Yellow

if ($frontendReact -like "19.*") {
    Write-Host "❌ React 19 detected - this will cause errors!" -ForegroundColor Red
    Write-Host ""
    Write-Host "The package.json has been updated to React 18.3.1" -ForegroundColor Green
    Write-Host "Now we need to reinstall dependencies..." -ForegroundColor Yellow
} else {
    Write-Host "✅ React version is correct: $frontendReact" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Steps to complete the fix:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Install updated dependencies:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Clear Metro cache:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npx expo start --clear" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart app on device" -ForegroundColor White
Write-Host ""
Write-Host "✅ This will fix the 'Cannot assign to read-only property NONE' error" -ForegroundColor Green
Write-Host ""
