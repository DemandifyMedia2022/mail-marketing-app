# PowerShell script to fix port 5000 conflict and start backend

Write-Host "🔧 Fixing Port 5000 Conflict..." -ForegroundColor Yellow

# Find processes using port 5000
Write-Host "📡 Finding processes using port 5000..." -ForegroundColor Blue
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        if ($pid) {
            try {
                $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
                Write-Host "⚠️  Killing process $pid ($processName)..." -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            } catch {
                Write-Host "⚠️  Could not kill process $pid" -ForegroundColor Yellow
            }
        }
    }
    Write-Host "✅ Port 5000 cleared!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5000 is already free" -ForegroundColor Green
}

# Wait for processes to terminate
Start-Sleep -Seconds 2

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Blue
Set-Location "c:/Users/AnjaliGhumare/Desktop/mail-27-01-26/mail-marketing-app/mail-marketing-app/backend"
npm run dev
