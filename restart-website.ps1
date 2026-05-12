# Dry Fruit Website Restart Script
# Run this after creating .env.local file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dry Fruit Website Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ .env.local file created with local backend URL" -ForegroundColor Green
Write-Host "   VITE_API_URL=http://localhost:5000/api" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure backend is running:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Go to Dryfruitwebsite folder:" -ForegroundColor White
Write-Host "   cd Dryfruitwebsite" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Stop the current server (Ctrl+C)" -ForegroundColor White
Write-Host ""
Write-Host "4. Start the website again:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Website will now use LOCAL backend!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
