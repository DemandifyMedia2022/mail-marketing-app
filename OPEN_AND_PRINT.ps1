# PowerShell script to open HTML and prepare for PDF printing

Write-Host "🚀 Opening KT Documentation for PDF generation..." -ForegroundColor Green

$htmlPath = "KT_DOCUMENTATION.html"
$fullPath = Resolve-Path $htmlPath

if (Test-Path $fullPath) {
    Write-Host "📄 Found documentation at: $fullPath" -ForegroundColor Blue
    
    # Open in default browser
    Start-Process $fullPath
    
    Write-Host "🌐 Documentation opened in browser" -ForegroundColor Yellow
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. In the browser, press Ctrl+P" -ForegroundColor White
    Write-Host "   2. Select 'Save as PDF'" -ForegroundColor White
    Write-Host "   3. Click 'Save'" -ForegroundColor White
    Write-Host "   4. Choose your save location" -ForegroundColor White
    
    Write-Host "`n📊 Documentation includes:" -ForegroundColor Magenta
    Write-Host "   • 21 comprehensive sections" -ForegroundColor White
    Write-Host "   • Complete technical architecture" -ForegroundColor White
    Write-Host "   • API documentation" -ForegroundColor White
    Write-Host "   • Database schemas" -ForegroundColor White
    Write-Host "   • Deployment guide" -ForegroundColor White
    Write-Host "   • Troubleshooting guide" -ForegroundColor White
    
    Write-Host "`n✨ Ready for developer onboarding!" -ForegroundColor Green
} else {
    Write-Host "❌ Documentation file not found!" -ForegroundColor Red
    Write-Host "Expected: $htmlPath" -ForegroundColor Red
}

# Keep window open for instructions
Read-Host "`nPress Enter to exit (documentation will remain open in browser)"
