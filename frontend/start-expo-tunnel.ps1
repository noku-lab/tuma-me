# Expo Start Script with Tunnel Mode
Write-Host "Starting Expo with Tunnel Mode..." -ForegroundColor Green
Write-Host "This will bypass network/firewall issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

cd $PSScriptRoot

# Use Node.js wrapper to suppress "fetch failed" errors
# The error is non-critical and doesn't affect functionality
node start-expo-tunnel-wrapper.js
