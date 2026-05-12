# Railway Deployment Checker
# This script checks if your Railway backend is deployed and responding

$backendUrl = "https://spice-route-manager-production.up.railway.app"
$maxAttempts = 30
$delaySeconds = 10

Write-Host "🔍 Checking Railway Deployment Status..." -ForegroundColor Cyan
Write-Host "Backend URL: $backendUrl" -ForegroundColor Gray
Write-Host ""

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "[$i/$maxAttempts] Checking..." -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl/" -Method GET -TimeoutSec 5 -ErrorAction Stop
        $json = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ SUCCESS!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Backend is LIVE! 🎉" -ForegroundColor Green
            Write-Host "Version: $($json.version)" -ForegroundColor Yellow
            Write-Host "CORS: $($json.cors)" -ForegroundColor Yellow
            Write-Host "Environment: $($json.environment)" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "✅ CORS is configured!" -ForegroundColor Green
            Write-Host "✅ Your frontend should now work!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "1. Open: https://spice-route-manager.vercel.app" -ForegroundColor White
            Write-Host "2. Press Ctrl+Shift+R to hard refresh" -ForegroundColor White
            Write-Host "3. Check console - CORS errors should be gone!" -ForegroundColor White
            exit 0
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 502) {
            Write-Host " ⏳ 502 - App starting..." -ForegroundColor Yellow
        }
        elseif ($statusCode -eq 503) {
            Write-Host " ⏳ 503 - Service unavailable..." -ForegroundColor Yellow
        }
        else {
            Write-Host " ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($i -lt $maxAttempts) {
        Write-Host "   Waiting $delaySeconds seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds $delaySeconds
    }
}

Write-Host ""
Write-Host "⚠️  Deployment is taking longer than expected" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please check:" -ForegroundColor Cyan
Write-Host "1. Railway Dashboard: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Check deployment logs for errors" -ForegroundColor White
Write-Host "3. Verify environment variables are set" -ForegroundColor White
Write-Host ""
Write-Host "Common issues:" -ForegroundColor Cyan
Write-Host "- MongoDB connection failed (check MONGO_URI)" -ForegroundColor White
Write-Host "- Build failed (check Railway logs)" -ForegroundColor White
Write-Host "- Port configuration (should be 5000)" -ForegroundColor White
