Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          CaseGraph OS - Local Startup Sequence         " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Initializing multi-service architecture..."

# 1. Check prerequisites
Write-Host "`n[1/4] Checking Databases..." -ForegroundColor Yellow
Write-Host "Please ensure your PostgreSQL and Redis instances are running locally or via Docker!"
Start-Sleep -Seconds 2

# 2. Start FastAPI Backend
Write-Host "`n[2/4] Booting Uvicorn FastAPI Server..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command `"cd apps\api; python -m uvicorn main:app --reload --port 8000`"" -WindowStyle Normal

# 3. Start Celery Worker
Write-Host "`n[3/4] Booting Celery Async Worker..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command `"cd apps\api; celery -A app.core.celery_app worker --loglevel=info`"" -WindowStyle Normal

# 4. Start Next.js Frontend
Write-Host "`n[4/4] Booting Next.js Web Interface..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit -Command `"cd apps\web; npm run dev`"" -WindowStyle Normal

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "ALL SYSTEMS ONLINE" -ForegroundColor Green
Write-Host "Frontend Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host "`nYou can close this terminal. The services are running in the newly opened windows."
