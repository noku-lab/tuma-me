# Expo Start Script with Tunnel Mode
Write-Host "Starting Expo with Tunnel Mode..." -ForegroundColor Green
Write-Host "This will bypass network/firewall issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: You may see a 'TypeError: fetch failed' error below." -ForegroundColor Yellow
Write-Host "   This is NON-CRITICAL - the tunnel will still work!" -ForegroundColor Cyan
Write-Host "   The error is from dependency validation, not the tunnel itself." -ForegroundColor Cyan
Write-Host "   Look for 'Tunnel connected. Tunnel ready.' to confirm it's working." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

cd $PSScriptRoot

# Set environment variables to reduce API calls and skip telemetry
$env:EXPO_NO_TELEMETRY = "1"
$env:EXPO_OFFLINE = "0"

# Start with tunnel and clear cache to avoid stale state issues
npx expo start --tunnel --clear
