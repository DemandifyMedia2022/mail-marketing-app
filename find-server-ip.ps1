# PowerShell script to find server IP and fix tracking URLs

Write-Host "🔍 Finding Server IP Addresses..." -ForegroundColor Yellow

Write-Host "`n📡 Local IP Addresses:" -ForegroundColor Blue
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | ForEach-Object {
    Write-Host "  📍 $($_.IPAddress) - $($_.InterfaceAlias)" -ForegroundColor Green
}

Write-Host "`n🌐 Public IP Address:" -ForegroundColor Blue
try {
    $publicIP = (Invoke-RestMethod -Uri "http://ifconfig.me" -TimeoutSec 10).Trim()
    Write-Host "  🌍 $publicIP" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Could not fetch public IP" -ForegroundColor Red
}

Write-Host "`n🔧 To Fix Click Tracking for External Access:" -ForegroundColor Yellow
Write-Host "1. Edit backend/.env file" -ForegroundColor White
Write-Host "2. Change APP_BASE_URL to your server IP:" -ForegroundColor White
Write-Host "   Example: APP_BASE_URL=http://192.168.1.100:5000" -ForegroundColor Cyan
Write-Host "   Example: APP_BASE_URL=http://$publicIP:5000" -ForegroundColor Cyan
Write-Host "3. Restart the backend server" -ForegroundColor White
Write-Host "`n💡 Use local IP for same network, public IP for internet access" -ForegroundColor Magenta

Read-Host "`nPress Enter to exit"
