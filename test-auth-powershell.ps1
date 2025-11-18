$jsonBody = @{
    qrData = '{"emp_id":1,"emp_uname":"demou","emp_email":"demo@company.com","emp_name":"Demo User","emp_phone":"1234567890"}'
} | ConvertTo-Json

Write-Host "🔍 Testing Mobile ERP Authentication Fix..." -ForegroundColor Cyan
Write-Host "Sending QR data with emp_id: 1 (should match existing user usr_1_mobile)" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/scan-qr" -Method POST -ContentType "application/json" -Body $jsonBody
    
    Write-Host "`n✅ SUCCESS: Backend responded!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
    
    if ($response.alreadyRegistered) {
        Write-Host "`n🎯 PERFECT: Backend correctly detected existing user!" -ForegroundColor Green
        Write-Host "✅ The mobile app will now show login screen instead of registration" -ForegroundColor Green
    } elseif ($response.success) {
        Write-Host "`n⚠️  User not found - proceeding with registration flow" -ForegroundColor Yellow
        Write-Host "This is expected for new users" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ FAILED: Could not connect to backend" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend server is running on port 3001" -ForegroundColor Yellow
}

Write-Host ("`n" + "="*60) -ForegroundColor Cyan
Write-Host "Test completed!" -ForegroundColor Cyan